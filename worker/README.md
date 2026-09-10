# NimaRank Worker

Cloudflare Worker yang menghubungkan donasi **Trakteer** ke **Firebase** dan
memberikan rank `donatur` / `donatur++` secara otomatis.

Versi kode saat ini terlihat di `GET /health` (field `version`). Kalau field
`version` atau `endpoints` tidak muncul, berarti worker yang ter-deploy masih
versi lama — **deploy ulang**.

## Alur

```
Trakteer (webhook)  ->  POST /trakteer-webhook
                          -> verifikasi token
                          -> ambil UID dari pesan donasi (NMRUID:<uid>)
                          -> hitung nominal -> tentukan rank
                          -> tulis Firestore users/{uid}.rank
                          -> catat ke Firestore donations/{id}
```

## Endpoint

| Method | Path | Keterangan |
| ------ | ---- | ---------- |
| POST | `/trakteer-webhook` | Penerima webhook Trakteer (pakai `?token=...` atau header `X-Webhook-Token`) |
| GET | `/status?uid=...` | Rank + total donasi untuk satu UID (dipakai halaman `/donate` untuk polling) |
| GET | `/recent?limit=8` | Daftar donatur terbaru (nama + nominal, tanpa UID) |
| GET | `/diagnose?token=...&write=1` | **Cek mandiri**: memastikan secret lengkap, private key valid, login Google & Firestore berhasil |
| GET | `/health` | Health check |

## Kalau tidak ada data di Firestore / rank tidak muncul

1. **Deploy ulang worker** dengan kode terbaru (versi lama belum punya log).
2. Buka:
   `https://<worker>/diagnose?token=<TRAKTEER_WEBHOOK_TOKEN>&write=1`
   Hasilnya seperti:

   ```json
   {
     "ok": true,
     "config": { "FIREBASE_PROJECT_ID": "reviewnima-xxxx", "FIREBASE_PRIVATE_KEY_ada_header": true, ... },
     "checks": {
       "privateKeyParse": "ok",
       "googleAuth": "ok",
       "firestoreRead": "ok (0 dokumen di koleksi donations)",
       "firestoreWrite": "ok (dokumen tes dibuat di koleksi donations)"
     }
   }
   ```

   Semua harus `ok`. Yang dimulai **`GAGAL:`** menunjuk masalahnya langsung
   (private key terpotong, project id salah, dsb).
3. Kalau `/diagnose` semua `ok` tapi `donations` tetap kosong setelah donasi →
   berarti **webhook dari Trakteer tidak sampai ke worker**. Cek URL webhook di
   Trakteer (tanpa `< >`), cek apakah webhook sudah diaktifkan, dan lihat riwayat
   pengiriman webhook di dashboard Trakteer.
4. Kalau `donations` terisi tapi rank tidak muncul → cek nilai
   `status`/`unit`/`amount` di dokumen itu.

## Kalau deploy dari Dashboard Cloudflare gagal

Kode worker sudah divalidasi dengan bundler yang sama seperti Cloudflare
(`esbuild --bundle --format=esm`, hasil ~23 KB) — **tidak ada masalah sintaks**.
Kalau editor Dashboard menolak deploy, penyebabnya hampir selalu cara paste:

1. **Paste di atas kode lama.** Klik di dalam editor → **Ctrl + A** (pilih
   semua) → **Delete** → baru paste kode baru **sekali**. Kalau tidak, muncul
   error seperti `Unexpected token 'export'` atau
   `Identifier 'x' has already been declared`.
2. **Editor bukan mode Module.** Pastikan file utamanya berisi
   `export default { async fetch(request, env) { ... } }`. Kalau worker-nya
   dibuat lama dan berformat *Service Worker* (pakai `addEventListener`), buat
   worker baru: **Workers & Pages → Create → Create Worker**, lalu paste ke situ.
3. **Cache/browser.** Coba hard refresh (Ctrl + Shift + R), mode incognito, atau
   matikan ekstensi browser. Editor Cloudflare cukup sensitif terhadap
   ekstensi/perpanjang skrip.
4. **Pastikan tidak ada karakter asing.** File di repo ini murni ASCII dan
   berakhiran baris CRLF; kalau kamu menyalinnya lewat media yang bisa
   mengubah encoding, karakter `→`/`…` bisa berubah jadi byte rusak.

### Cara paling aman: pakai Wrangler (tanpa copy-paste)

```powershell
cd "d:\project pokoknya\webremia\worker"
npm install
node node_modules\wrangler\bin\wrangler.js login
node node_modules\wrangler\bin\wrangler.js deploy
```

> Di Windows, `npx wrangler ...` kadang gagal dengan pesan
> `'wrangler' is not recognized`. Pakai bentuk
> `node node_modules\wrangler\bin\wrangler.js <perintah>` seperti di atas, atau
> `npm run deploy` (yang menjalankan `wrangler deploy`).

Setelah deploy, cek:

```
https://<worker>/health
```

Harus muncul `"version": "1.3.0"` (atau versi terbaru di `index.js`). Kalau
`version`/`endpoints` tidak ada, deploy-nya belum berhasil.


## Setup

1. Buat **Service Account** di Firebase Console
   (Project settings → Service accounts → Generate new private key).
2. Simpan nilai dari file JSON-nya sebagai secret:

   ```bash
   cd worker
   npm install
   npx wrangler login

   npx wrangler secret put FIREBASE_PROJECT_ID      # contoh: webremia-xxxx
   npx wrangler secret put FIREBASE_CLIENT_EMAIL    # firebase-adminsdk-...@....iam.gserviceaccount.com
   npx wrangler secret put FIREBASE_PRIVATE_KEY     # isi "private_key" (sertakan -----BEGIN/END-----)
   npx wrangler secret put TRAKTEER_WEBHOOK_TOKEN   # buat string acak sendiri
   ```

3. Deploy:

   ```bash
   npx wrangler deploy
   ```

4. Daftarkan URL webhook di Trakteer:

   ```
   https://<nama-worker>.<subdomain>.workers.dev/trakteer-webhook?token=<TRAKTEER_WEBHOOK_TOKEN>
   ```

5. Isi `VITE_DONATION_WORKER_URL` di project frontend dengan base URL worker
   (tanpa trailing slash).

## Threshold rank & harga unit Trakteer

Default di `wrangler.toml` (`[vars]`) sudah disamakan dengan harga unit
Trakteer:

| Unit Trakteer | Harga   | Rank        |
| ------------- | ------- | ----------- |
| `DONATUR`     | Rp5.000 | `donatur`   |
| `DONATUR++`   | Rp10.000| `donatur++` |

Penetapan rank memakai **dua sinyal**, lalu diambil yang tertinggi:

1. **Nama unit** — nama unit mengandung `++` → `donatur++`; mengandung
   `donatur` → `donatur`.
2. **Nominal** — `total`, atau `harga unit × qty`, dibandingkan ke
   `DONATUR_MIN` / `DONATUR_PLUS_MIN`.

Jadi donor yang membeli unit `DONATUR` 2x (total Rp10.000) tetap naik ke
`donatur++`.

Nilai `VITE_DONATUR_MIN` / `VITE_DONATUR_PLUS_MIN` di frontend harus sama,
yaitu `5000` / `10000`.

## Cara melihat log (buat debugging)

Membuka `GET /trakteer-webhook` dari browser akan membalas:

```json
{ "error": "Method not allowed", "message": "Endpoint ini hanya menerima POST dari Trakteer." }
```

Itu **normal** — artinya endpoint hidup dan memang hanya menerima POST dari
Trakteer.

Untuk melihat isi webhook yang benar-benar masuk:

* **Cloudflare Dashboard** → worker kamu → tab **Logs** → **Begin log stream**,
  lalu kirim donasi tes (atau tekan Test di Trakteer).
* **CLI** → `cd worker` lalu `npx wrangler tail`.

Semua baris log diberi tag `[nimarank]`, contoh:

```
[nimarank] POST /trakteer-webhook?…
[nimarank] webhook body diterima: {"supporter_name":"Budi",...}
[nimarank] donation parsed { supporterName: 'Budi', unit: 'DONATUR++', unitPrice: 10000, quantity: 1, amount: 10000, uid: 'xxxx', rankByName: 'donatur++', rankByAmount: 'donatur++', grantedRank: 'donatur++', status: 'processed' }
[nimarank] hasil: { ok: true, processed: true, rank: 'donatur++' }
```

Selain itu **setiap** webhook dicatat ke koleksi Firestore `donations` —
termasuk yang gagal cocok. Field `rawPayload` menyimpan isi asli yang dikirim
Trakteer, jadi kalau ada yang janggal cukup lihat dokumen tersebut.

## Kalau donasi pakai "unit" / role Trakteer

Misal halaman Trakteer kamu punya 2 unit ("Donatur" dan "Donatur++"), worker
menangani lewat dua jalur:

1. **Dari nominal** — pakai `total` kalau ada, kalau tidak maka
   `harga unit × qty`, lalu dibandingkan ke threshold.
2. **Dari nama unit (cadangan)** — kalau nominal tidak terbaca (harga 0 atau
   field harga tidak dikirim), worker melihat nama unit: mengandung `++`
   → `donatur++`, mengandung `donatur` → `donatur`.

Yang **tetap wajib**: kolom pesan donasi harus memuat `NMRUID:<uid>` — dari situ
akun dideteksi. Unit yang dibeli tanpa pesan tetap tercatat di `donations`
dengan `status: "unmatched"`, tapi rank tidak diberikan.

## Catatan keamanan

* Rank `admin`, `moderator`, `vip`, dan `premium` **tidak akan** ditimpa oleh donasi.
* Webhook ditolak (401) kalau token tidak cocok. Selalu set `TRAKTEER_WEBHOOK_TOKEN`.
* Worker menulis Firestore lewat service account, jadi dia melewati
  `firestore.rules`. Jangan commit file JSON service account ke repo ini.
