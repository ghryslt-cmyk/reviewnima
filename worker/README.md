# NimaRank Worker

Cloudflare Worker yang menghubungkan donasi **Trakteer** ke **Firebase** dan
memberikan rank `donatur` / `donatur++` secara otomatis.

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
| GET | `/health` | Health check |

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
