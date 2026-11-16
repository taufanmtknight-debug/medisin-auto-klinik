# Medisin — AUTO KLINIK

Proyek AUTO KLINIK untuk website **Medisin** (`https://app.medisin.id`), penerus versi Klinik Pintar (`klinikpintar-auto-klinik`).

| Repo | Isi |
|---|---|
| `medisin-auto-klinik` (repo ini) | sumber, dokumentasi, alat bantu |
| `medisin-auto-klinik-rilis` | file rilis (sumber update Violentmonkey) |

## Userscript
`Medisin_AUTO_KLINIK.user.js` (v0.1.0, versi awal) — dipasang di Violentmonkey, aktif di halaman pelayanan pasien (`/admin/pelayanan/proses/...`, tab DOKTER).

Pasang: buka Violentmonkey → "+" → "Install from URL" →
`https://raw.githubusercontent.com/taufanmtknight-debug/medisin-auto-klinik/claude/project-thread-cg0a4l/Medisin_AUTO_KLINIK.user.js`

Yang dikerjakan (menu sama seperti versi Klinik Pintar):
- **RESUME**: Keluhan Utama → Anamnesa, Kesadaran, Jenis Prognosa (Bonam), Status Pulang — hanya kolom yang masih kosong.
- **RESUME + DIAGNOSIS + RESEP**: tambah Diagnosa ICD-10 dari keluhan (TACC "Tanpa TACC"), lalu membuka Paket Resep.
- **PAKET RESEP GOLONGAN**: obat & racikan sesuai umur/BB; resep masuk ke baris "Obat Satuan", racikan ke dialog "Tambah Racikan".

Aturan: script hanya **mengisi**. SIMPAN (Diagnosa/Resep/Racikan) dan SUBMIT selalu ditekan dokter. Dijaga oleh tes (`npm test`).

Nama obat: hanya nama yang **sama persis** dipilih otomatis. Bila tidak ada, muncul dialog "Pilih obat di Medisin"; pilihan dokter diingat di browser itu per klinik + penjamin.

Belum otomatis di v0.1.0: Tindakan/tarif, BHP (cek gula/kolesterol/asam urat, imunisasi), repo rilis + update otomatis. Jalur pasien BPJS (ICD lewat PCare) belum bisa diuji di akun trial.

Tes: `npm test` (Node ≥ 20).

## Dokumentasi website
Tahap belajar website selesai (16 Nov 2026). Hasilnya ada di [`docs/medisin/`](docs/medisin/00-RINGKASAN.md):
- `00-RINGKASAN.md` — ringkasan, perbedaan dengan Klinik Pintar, kecepatan, titik rawan, rekomendasi.
- `01`–`05` — menu & rute, arsitektur & API, tab Anamnesa, tab Dokter (Diagnosa/Resep/Racikan/Tindakan), pendaftaran & antrean.
- `06-hasil-uji-coba.md` — uji coba nyata dengan pasien uji, langkah demi langkah dengan waktu tunggu.
- `07-uji-script-v0.1.0.md` — hasil uji userscript di Medisin.
- `99-data-uji-yang-dibuat.md` — data uji yang dibuat di Medisin.

`tools/medisin-devtools.js` — tempel di Console Chrome pada app.medisin.id untuk membaca struktur halaman dan mencoba prefill (tanpa menyimpan).
