# ---------------------------------------------------------------------------
# print-secrets.ps1
#
# Membaca file JSON Service Account Firebase dan menampilkan 3 nilai yang
# dibutuhkan Cloudflare Worker:
#   1. FIREBASE_PROJECT_ID
#   2. FIREBASE_CLIENT_EMAIL
#   3. FIREBASE_PRIVATE_KEY  (versi 1 baris & versi multi-baris)
#
# Cara pakai (dari folder worker/):
#   .\print-secrets.ps1 -Path "$env:USERPROFILE\Downloads\reviewnima-xxxx.json"
#
# Kalau PowerShell menolak menjalankan script, pakai:
#   powershell -ExecutionPolicy Bypass -File .\print-secrets.ps1 -Path "..."
# ---------------------------------------------------------------------------

param(
    [Parameter(Mandatory = $true)]
    [string]$Path
)

if (-not (Test-Path -LiteralPath $Path)) {
    Write-Host "File tidak ditemukan: $Path" -ForegroundColor Red
    exit 1
}

$json = Get-Content -LiteralPath $Path -Raw | ConvertFrom-Json

if (-not $json.private_key -or -not $json.client_email -or -not $json.project_id) {
    Write-Host "File ini sepertinya bukan Service Account JSON dari Firebase." -ForegroundColor Red
    Write-Host "Pastikan kolomnya 'project_id', 'client_email', dan 'private_key'." -ForegroundColor Yellow
    exit 1
}

# Versi 1 baris: ubah baris baru jadi literal \n supaya aman di-paste ke kolom
# input Cloudflare Dashboard yang hanya menerima satu baris.
$oneLineKey = $json.private_key.Replace("`r`n", "`n").Replace("`n", '\n')

Write-Host ""
Write-Host "================= FIREBASE_PROJECT_ID =================" -ForegroundColor Cyan
Write-Host $json.project_id

Write-Host ""
Write-Host "================ FIREBASE_CLIENT_EMAIL ================" -ForegroundColor Cyan
Write-Host $json.client_email

Write-Host ""
Write-Host "===== FIREBASE_PRIVATE_KEY (1 baris, utk Dashboard) ====" -ForegroundColor Cyan
Write-Host $oneLineKey

Write-Host ""
Write-Host "===== FIREBASE_PRIVATE_KEY (multi-baris, utk wrangler) ===" -ForegroundColor Cyan
Write-Host $json.private_key

Write-Host ""
Write-Host "Tips: simpan private key ke file lalu pipe ke wrangler, contoh:" -ForegroundColor Yellow
Write-Host '  $json.private_key | npx wrangler secret put FIREBASE_PRIVATE_KEY' -ForegroundColor Yellow
Write-Host ""
Write-Host "PERINGATAN: jangan pernah commit file JSON ini atau membagikannya." -ForegroundColor Red
