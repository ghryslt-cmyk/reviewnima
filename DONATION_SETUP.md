# Sistem Donasi & Rank (Trakteer + Cloudflare Workers + Firebase)

Fitur ini memberi rank **DONATUR** dan **DONATUR++** untuk orang yang donasi
ikhlas lewat Trakteer. **Tidak ada benefit/fitur khusus** — rank hanya penanda
terima kasih.

## Alur lengkap

```
[1] User buka /donate
      - disuruh copy UID dari /profile
      - input UID di halaman donasi
      - pilih rank (Donatur / Donatur++ / nominal lain)
      - tekan "Donasi via Trakteer"

[2] Halaman Trakteer terbuka + user menempel pesan  ->  NMRUID:<uid>

[3] Setelah donasi dibayar, Trakteer mengirim webhook ke Cloudflare Worker
      -> verifikasi token
      -> ambil UID dari pesan donasi
      -> tentukan rank (diambil yang tertinggi dari 2 sinyal):
           nama unit "DONATUR++"          => rank "donatur++"
           nama unit "DONATUR"            => rank "donatur"
           (cadangan) nominal >= 5.000    => rank "donatur"
                      nominal >= 10.000   => rank "donatur++"
      -> tulis ke Firestore: users/{uid}.rank
      -> catat ke Firestore: donations/{autoId}

[4] Halaman /donate polling otomatis -> begitu rank masuk, tampil "Rank aktif!"
```

## 1. Yang sudah kamu buat (diasumsikan)

* Halaman Trakteer (mis. `https://trakteer.id/<username>/tip`).
* Sebuah Cloudflare Worker.

## 2. Pasang Cloudflare Worker

Semua kode worker ada di folder `worker/`.

```bash
cd worker
npm install
npx wrangler login
```

Buat **Service Account** di Firebase Console:
`Project settings → Service accounts → Generate new private key`.
Dari file JSON itu, ambil `project_id`, `client_email`, dan `private_key`.

```bash
npx wrangler secret put FIREBASE_PROJECT_ID      # project_id
npx wrangler secret put FIREBASE_CLIENT_EMAIL    # client_email
npx wrangler secret put FIREBASE_PRIVATE_KEY     # private_key (utuh, ada -----BEGIN/END-----)
npx wrangler secret put TRAKTEER_WEBHOOK_TOKEN   # bikin string acak, mis: openssl rand -hex 24
npx wrangler deploy
```

Setelah deploy kamu dapat URL seperti:
`https://nimarank-worker.<subdomain>.workers.dev`

Cek cepat: buka `https://.../health` → harus muncul `{"ok":true,...}`.

## 3. Daftarkan webhook di Trakteer

Di dashboard Trakteer → **Webhook**, isi URL:

```
https://nimarank-worker.<subdomain>.workers.dev/trakteer-webhook?token=<TRAKTEER_WEBHOOK_TOKEN>
```

> Token bisa juga dikirim lewat header `X-Webhook-Token`. Kalau
> `TRAKTEER_WEBHOOK_TOKEN` kosong, semua request diterima (jangan biarkan
> kosong di production).

### 3a. Halaman Trakteer & harga unit

Setup yang dipakai:

| Unit Trakteer | Harga    | Rank yang didapat |
| ------------- | -------- | ----------------- |
| `DONATUR`     | Rp5.000  | `donatur`         |
| `DONATUR++`   | Rp10.000 | `donatur++`       |

Rank ditentukan dari **nama unit** lebih dulu (paling eksplisit), lalu dari
**nominal** (`total`, atau `harga unit × qty`). Kalau keduanya tersedia,
sistem ambil yang tertinggi — jadi membeli unit `DONATUR` sebanyak 2x
(total Rp10.000) tetap naik ke `donatur++`.

Harga unit di atas **harus sama** dengan threshold di worker
(`DONATUR_MIN=5000`, `DONATUR_PLUS_MIN=10000`) dan di frontend
(`VITE_DONATUR_MIN=5000`, `VITE_DONATUR_PLUS_MIN=10000`). Kalau kamu mengubah
harga unit Trakteer, ubah juga ketiga tempat itu.

Kalau kamu juga menyediakan **nominal bebas** di halaman tip, itu tetap jalan:
nominal yang masuk akan dihitung dengan aturan yang sama.


### 3b. Kolom pesan harus diisi UID

Saat donatur menekan **Donasi via Trakteer** di `/donate`, pesan
`NMRUID:<uid>` otomatis di-prefill ke URL Trakteer. Kalau halaman Trakteer
tidak menerima parameter itu, donatur menekan tombol **Salin pesan** di
website lalu menempelnya ke kolom **pesan/dukungan** di Trakteer.

Kalau Trakteer punya pengaturan *"pesan wajib diisi"*, sebaiknya diaktifkan
agar tidak ada donasi yang tidak terhubung ke akun.

### 3c. Tes webhook dari Trakteer

> **Catatan:** kalau kamu membuka URL webhook di browser, hasilnya
> `{"error":"Method not allowed"}` — itu **normal**, karena endpoint hanya
> menerima POST dari Trakteer. Artinya worker-mu sudah jalan.

Ada 2 cara tes:

**Cara 1 – dari Trakteer.** Di halaman webhook Trakteer biasa ada tombol
**Test**. Setelah ditekan:

* Buka **Cloudflare Dashboard → worker kamu → tab Logs → Begin log stream**
  (atau `cd worker` lalu `npx wrangler tail`) untuk melihat payload masuk.
* Buka **Firebase Console → Firestore → koleksi `donations`** → akan muncul
  dokumen berisi `message`, `supporterName`, `amount`, `status`, dan
  `rawPayload` (isi asli dari Trakteer).

**Cara 2 – simulasi manual** (tanpa donasi beneran, dari PowerShell):

```powershell
$body = @{
  supporter_name  = "Tes"
  support_message = "NMRUID:<uid-28-karakter>"
  quantity        = 1
  price           = 10000
} | ConvertTo-Json

Invoke-RestMethod -Method Post `
  -Uri "https://nimarank-worker.<subdomain>.workers.dev/trakteer-webhook?token=<TRAKTEER_WEBHOOK_TOKEN>" `
  -ContentType "application/json" -Body $body
```

Hasil yang diharapkan: `{"ok":true,"processed":true,"rank":"donatur++",...}`.

Kalau muncul `uid_not_found`, `below_threshold`, atau `amount: 0` → buka
dokumen terbaru di koleksi `donations`, lihat field `rawPayload`, lalu kirimkan
isinya ke saya supaya penamaan field-nya disesuaikan. Worker sudah mencoba
banyak nama field (`support_message`, `supporter_name`, `unit`/`unit_name`,
`quantity`, `price`/`unit_price`, `total`, dll) dan tetap memproses payload
yang disimpan di dalam `data`.

### 3d. Kalau donasi pakai unit/role Trakteer

Kamu sudah punya 2 unit: `DONATUR` (Rp5.000) dan `DONATUR++` (Rp10.000).
Worker memakai **dua sinyal** lalu mengambil rank tertinggi:

1. **Nama unit** → mengandung `++` = `donatur++`, mengandung `donatur` =
   `donatur`.
2. **Nominal** → `total`, atau `harga unit × qty`, dibandingkan ke
   `DONATUR_MIN` / `DONATUR_PLUS_MIN`.

Jadi unit `DONATUR` yang dibeli 2x (Rp10.000) tetap naik ke `donatur++`.

Yang tetap wajib: **kolom pesan donasi harus berisi `NMRUID:<uid>`**. Kalau
Trakteer punya opsi "pesan wajib diisi", aktifkan supaya tidak ada donasi
yang tidak terhubung ke akun.



## 4. Konfigurasi halaman web + GitHub

Tambahkan ke `.env` (lokal) dan **GitHub Secrets** (untuk deploy otomatis):

```
VITE_TRAKTEER_URL=https://trakteer.id/<username>/tip
VITE_DONATION_WORKER_URL=https://nimarank-worker.<subdomain>.workers.dev
VITE_DONATUR_MIN=5000
VITE_DONATUR_PLUS_MIN=10000
```

* `VITE_TRAKTEER_URL` – halaman Trakteer yang dibuka saat user menekan donasi.
* `VITE_DONATION_WORKER_URL` – base URL worker (tanpa `/` di akhir). Kalau
  dikosongkan, halaman donasi tetap jalan tapi status rank hanya bisa dicek
  lewat akun sendiri (fallback ke Firestore).
* `VITE_DONATUR_MIN` / `VITE_DONATUR_PLUS_MIN` – **harus sama** dengan
  `worker/wrangler.toml`.

### 4a. Tambahkan GitHub Secrets

Repo: `https://github.com/ghryslt-cmyk/reviewnima`
→ **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.

Yang **sudah ada** (jangan dihapus) dan yang **baru** perlu ditambah:

| Secret | Status |
| ------ | ------ |
| `VITE_FIREBASE_API_KEY` s/d `VITE_FIREBASE_APP_ID` | sudah ada |
| `VITE_ADMIN_EMAIL` | sudah ada |
| `VITE_TRAKTEER_URL` | **baru** |
| `VITE_DONATION_WORKER_URL` | **baru** |
| `VITE_DONATUR_MIN` | **baru** |
| `VITE_DONATUR_PLUS_MIN` | **baru** |

> Nilai `VITE_DONATUR_MIN`/`VITE_DONATUR_PLUS_MIN` ditulis tanpa titik,
> contoh `5000` dan `10000` (harus sama dengan harga unit Trakteer).

### 4b. Workflow GitHub yang ada

Repo ini punya 4 workflow. Tiga di antaranya menjalankan `npm run build` lalu
deploy ke GitHub Pages; keempat env di atas sudah ditambahkan ke semuanya:

| Workflow | Kapan jalan |
| -------- | ----------- |
| `deploy.yml` | setiap push ke `master`, tiap hari 06:00 WIB, dan manual |
| `fetch-daily-data.yml` | tiap 15 menit (ambil data harian lalu build ulang) |
| `fetch-seasonal-data.yml` | terjadwal (ambil data seasonal lalu build ulang) |
| `deploy-worker.yml` | **manual saja** — untuk deploy Cloudflare Worker (opsional) |

Jadi **wajib** menambahkan secrets di atas, karena workflow 15 menit-an juga
membangun ulang website. Kalau secret belum ada, build akan sukses tapi
`/donate` memakai nilai default (`https://trakteer.id` dan tanpa status API).

### 4c. Push perubahan

```bash
git add .
git commit -m "feat: sistem donasi & rank (Trakteer + Cloudflare Worker)"
git push origin master
```

Push ke `master` otomatis memicu `deploy.yml` → website ter-deploy ke GitHub
Pages. Cek progresnya di tab **Actions** (tunggu tanda centang hijau).

### 4d. (Opsional) Deploy worker dari GitHub

Kalau tidak mau jalankan `wrangler` di komputer terus-menerus, pakai
`deploy-worker.yml`. Tambahkan 6 secret ini dulu:

| Secret | Ambil dari mana |
| ------ | --------------- |
| `CLOUDFLARE_API_TOKEN` | Cloudflare → **My Profile** → **API Tokens** → **Create Token** → template **Edit Cloudflare Workers** |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare → **Workers & Pages**, tertera di sidebar kanan |
| `FIREBASE_PROJECT_ID` | JSON service account (`project_id`) |
| `FIREBASE_CLIENT_EMAIL` | JSON service account (`client_email`) |
| `FIREBASE_PRIVATE_KEY` | JSON service account (`private_key`) |
| `TRAKTEER_WEBHOOK_TOKEN` | sama dengan yang dipakai di URL webhook Trakteer |

Setelah secret terisi: tab **Actions** → **Deploy Cloudflare Worker** →
**Run workflow**. Workflow ini **tidak** berjalan otomatis, jadi tidak akan
pernah mengganggu deploy GitHub Pages.

> `FIREBASE_PRIVATE_KEY` bisa ditempel apa adanya (multi-baris) di GitHub
> Secret, atau versi satu baris berisi `\n` — worker menangani keduanya.


## 5. Deploy Firestore rules

Rules baru menambahkan koleksi `donations` (hanya admin yang bisa baca dari
client; penulisan dilakukan oleh service account worker).

```bash
firebase deploy --only firestore:rules
```

## 6. Uji coba

1. Login di website → buka `/profile` → klik ikon UID untuk copy.
2. Buka `/donate`, tempel UID, pilih rank, tekan **Donasi via Trakteer**.
3. Bayar donasi (bisa unit `DONATUR` Rp5.000 dulu untuk tes).
   Pastikan pesan `NMRUID:<uid>` ikut terkirim.
4. Setelah webhook masuk, cek Firestore `users/{uid}` → field `rank` terisi
   `donatur` (atau `donatur++`), plus `donationTotal`, `donationCount`, dan
   `lastDonationAt`.
5. Halaman `/donate` otomatis menampilkan "Rank kamu sudah aktif!".

Untuk tes tanpa Trakteer, kirim request manual:

```bash
curl -X POST "https://<worker>/trakteer-webhook?token=<TOKEN>" \
  -H "Content-Type: application/json" \
  -d "{\"supporter_name\":\"Tes\",\"support_message\":\"NMRUID:<uid-28-char>\",\"quantity\":1,\"price\":10000}"
```

## Troubleshooting

| Gejala | Penyebab umum |
| ------ | ------------- |
> **Alat utama:** buka
> `https://<worker>/diagnose?token=<TRAKTEER_WEBHOOK_TOKEN>&write=1`
> di browser. Endpoint ini memeriksa secret, private key, login Google, dan
> baca/tulis Firestore, lalu menampilkan `diagnosis` kalau ada yang gagal.

| Gejala di log / response | Penyebab & solusi |
| ------------------------ | ----------------- |
| `401 Unauthorized` | `token` webhook salah. Pastikan tanpa tanda `< >` dan tanpa spasi. |
| `{"reason":"uid_not_found"}` | Pesan donasi tidak memuat `NMRUID:<uid>`. |
| `{"reason":"below_threshold"}` | Nominal di bawah `DONATUR_MIN` (5000). |
| `Google auth failed: Invalid grant: account not found` | **Paling sering terjadi.** Google tidak mengenali `client_email`. Penyebab: `FIREBASE_CLIENT_EMAIL` dan `FIREBASE_PRIVATE_KEY` diambil dari **file JSON berbeda**, service account sudah dihapus, atau ada spasi/newline nyasar. Solusi: *Firebase Console → Project settings → Service accounts → Generate new private key*, lalu ambil `project_id`, `client_email`, `private_key` dari **satu** file baru itu dan update **ketiga** secret sekaligus. |
| `Invalid JWT Signature` | `private_key` bukan pasangan dari `client_email`. Ambil ulang dari satu file JSON. |
| `Invalid keyData` (di `/diagnose`) | `FIREBASE_PRIVATE_KEY` rusak / baris barunya hilang. Pakai output satu baris dari `worker/print-secrets.ps1`. |
| `Firestore write failed (403)` | Service account beda project, atau tidak punya akses Firestore. |
| `Firestore write failed (404)` | `FIREBASE_PROJECT_ID` salah. |
| `amount: 0` di koleksi `donations` | Payload tidak punya `price`/`total`; rank masih bisa didapat dari **nama unit**. |
| Rank tidak muncul di Navbar | Cache halaman; refresh. Cek field `rank` di `users/{uid}`. |
| Semua `ok` di `/diagnose` tapi `donations` kosong | Webhook Trakteer tidak sampai ke worker — cek URL webhook & status pengiriman di dashboard Trakteer. |

## Catatan

* Rank `admin`/`moderator`/`vip`/`premium` **tidak diturunkan** oleh donasi.
* Donasi dicatat di koleksi `donations` untuk audit (termasuk yang gagal match).
* Jangan pernah commit file JSON service account.
