# Ringkasan: cara kerja Medisin untuk AUTO KLINIK

Dipelajari 16 Nov 2026 di akun **Klinik Utama @KLINIK TRIAL MEDISIN** (klinik_id 245) lewat Chrome yang sudah login.
Detail per bagian ada di file 01–06 di folder ini. Data pasien asli tidak disalin ke dokumen ini.

## 1. Teknologi (berbeda total dari Klinik Pintar)
| | Klinik Pintar (lama) | Medisin (baru) |
|---|---|---|
| Framework | Vue 3 + Tailwind + Headless UI + @vueform/multiselect | **Vue 2 + Quasar v1** + Vuex ("App Sintasi") |
| Pilihan/dropdown | `div[multiple]` + `li.click()` | **QSelect** (`.q-field`, menu `.q-menu .q-item`), banyak yang `use-input` (ketik untuk mencari, minimal 2 huruf) |
| Id kolom | `#tf_complaint`, `#dd_icd_10`, … | **Tidak ada id/name yang berguna**. Kolom dikenali dari label QField, atau lebih andal dari state Vue |
| Data form | DOM | **Vuex `store.state.pelayanan.pasien`** (objek kunjungan ~786 field) + data komponen (`Resep.input_resep`, `Diagnosa.input_icdx`, `Racikan.form`/`input_racikan`, `Tindakan.input_tindakan`) |
| Simpan | Satu "Simpan Rekam Medis" | **Simpan per bagian** (Diagnosa, Resep, Racikan, Tindakan langsung ke server) + **SUBMIT** (anamnesa/TTV/pemeriksaan) |
| CSP | – | Tidak ada CSP → userscript bisa disuntik |

Akses dari userscript/console: `document.querySelector('#q-app').__vue__.$root` → `$store`, `$router`, `$axios` (old-ci.medisin.id), komponen punya `$klinik` (backends.medisin.id/api/klinik/, sudah membawa token). Label→v-model bisa dibaca dari `child.$vnode.data.model.expression`. Lihat `tools/medisin-devtools.js`.

## 2. Alur kerja klinik di Medisin
1. **Pasien baru**: PENDAFTARAN › Pendaftaran (`/admin/pelayanan/pendaftaran`) → SIMPAN DATA PASIEN.
2. **Daftar kunjungan**: Data Pasien (`/admin/pelayanan/pasien`) → ikon ▶ hijau → pilih POLI (tombol besar) → Pilih dokter + Pilih penjamin (wajib) → PROSES POLI (atau PROSES PERAWAT). Toggle INTEGRASI SATUSEHAT / BPJS di dialog ini.
3. **Dokter**: POLI DOKTER (`/admin/klinik/antrean/poli`) → PELAYANAN (status jadi 203 "Sedang Dilayani") → halaman proses `/admin/pelayanan/proses/<Tab>/<base64 id_kunjungan>`.
   Tab **DOKTER** = satu halaman berisi: Input Anamnesa + TTV, Riwayat Alergi, Pemeriksaan Fisik, Prognosa, Tindakan (tarif), Tindakan ICD9, Diagnosa ICD10, Booking/Rencana lanjutan, Resep (Obat Satuan), Racikan. **Ini halaman utama untuk AUTO KLINIK.**
4. Tombol status di atas: PROSES PERAWAT / POLI / FARMASI (401) / LABORATORIUM (601) / ODONTOGRAM (701) / KASIR (502).
5. **Farmasi** (`/admin/klinik/farmasi`) → PELAYANAN (status 402). **Kasir** (`/kasir/pos`).

## 3. Kecepatan (diukur)
- Hampir semua API 80–400 ms. Buka halaman proses siap ±0,3–1,5 dtk (GET master/kunjungan 0,5–1,5 dtk).
- Cari obat 125–350 ms; cari ICD 100 ms (panggilan pertama ±1,1 dtk); cari tarif ±130 ms.
- **Lambat**: simpan Diagnosa **13,5 dtk**, simpan Tindakan **30,6 dtk**, Racikan 3,3 dtk, Resep 1,6 dtk, PUT antrean ke farmasi sekali **21,6 dtk**. `old-ci auth/users` (setiap pindah halaman) kadang 1–5 dtk.
- Halaman DOKTER memuat `ref/racikan_kat` berisi 18.460 baris dan 1.078 signa setiap dibuka.

## 4. Hal yang rawan gagal (wajib ditangani otomasi)
1. **Data pasien sebelumnya masih terpakai** sesaat setelah pindah pasien → tunggu `store.pasien.id_kunjungan === atob(segmen URL terakhir)` dan komponen Resep/Diagnosa ada (`waitPasienReady`).
2. **Simpan lambat** (Diagnosa/Tindakan 13–30 dtk): jangan klik ulang (ada penjaga "Terlalu banyak menekan tombol simpan"), tunggu `loading` komponen kembali false; batas tunggu ≥ 60 dtk.
3. Setelah simpan Resep, tabel "Daftar Resep" & `store.pasien.resep` **tidak langsung diperbarui** (TOTAL tetap 0) sampai SUBMIT/reload → cek lewat `POST master/kunjungan/get-resep`.
4. Isi TTV lewat store → **IMT tidak dihitung otomatis**; hitung sendiri.
5. Pilih ICD lewat UI membuat TACC menjadi `null` (bukan "-1"); set ulang ke "-1" (Tanpa TACC).
6. Cari ICD harus pakai **kode** ("J06.9"); kata Indonesia ("ispa") memberi hasil acak. Nama penyakit di Medisin berbahasa Inggris.
7. Opsi obat hanya produk yang punya stok di lokasi non-gudang (`is_storage==0`); label "NAMA (stok)". Nama obat di Medisin **berbeda** dengan Klinik Pintar (mis. "PARACETAMOL 500 MG MERSI", "AMBROXOL 30 MG", "CETIRIZIN 10 MG", "CTM (BTL)") → daftar `ITEMS` harus dipetakan ulang ke master obat klinik yang sebenarnya.
8. Simpan Resep **langsung mengurangi stok** (58→48).
9. Pasien BPJS: SUBMIT juga mengirim PCare (`bpjs/pcare/kunjungan`), Tindakan BPJS & diagnosa BPJS lewat PCare. **AUTO KLINIK tidak boleh menekan SUBMIT / SUBMIT BPJS / SUBMIT SATUSEHAT / PROSES KASIR.**
10. Di akun trial, semua panggilan PCare/iCare gagal (500, ±10 dtk) — normal untuk trial.

## 5. Rekomendasi rancangan AUTO KLINIK versi Medisin
- Tetap userscript Violentmonkey (`@match https://app.medisin.id/*`), deteksi rute SPA (`$router.afterEach` atau pantau `location.pathname`) untuk `/admin/pelayanan/proses/dokter/…` (atau tab lain yang memuat komponen Resep/Diagnosa).
- **Isi lewat state Vue, bukan mengetik DOM**: jauh lebih cepat (uji: 2 diagnosa + 2 obat terisi 1,5 dtk) dan tidak tergantung posisi dropdown. Teknik yang sudah terbukti ada di `tools/medisin-devtools.js` (`prefillAnamnesa`, `prefillDiagnosa`, `prefillResep`).
- Seperti versi lama: script **hanya mengisi**, dokter yang menekan SIMPAN di tiap bagian lalu SUBMIT.
- Racikan anak per BB: bisa memakai dialog "Tambah Racikan" (`Racikan.form` + `input_racikan`) atau "Tambah Racikan dari Master Racikan" (master di `/admin/master/racikan`).
- Tindakan cek gula/kolesterol/asam urat: di Medisin ada field GDS/Kolesterol/Asam Urat di Anamnesa, Tindakan (tarif), dan BHP (`master/kunjungan/tarif-bhp`). Perlu keputusan dokter mana yang dipakai.

## 6. Pertanyaan untuk dokter
1. Apakah klinik akan tetap memakai akun "KLINIK TRIAL MEDISIN" ini, atau akun klinik baru (master obat/tarif berbeda)?
2. Data uji (pasien "TES AUTO KLINIK (JANGAN DIPAKAI)" + kunjungan, resep, racikan, tindakan) — dihapus atau disimpan sebagai pasien uji untuk mencoba script nanti? (Lihat `99-data-uji-yang-dibuat.md`.)
3. Apakah pasien BPJS dilayani di Medisin (PCare aktif)? Ini memengaruhi cara cari diagnosa (ICD PCare) dan tindakan.
