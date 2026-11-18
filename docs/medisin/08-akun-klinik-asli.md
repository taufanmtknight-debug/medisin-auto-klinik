# Akun klinik asli (dipelajari 2026-11-17, hanya membaca)

Klinik pratama, klinik_id 827, login sebagai dokter. Data pasien tidak disalin ke sini.

- Menu dokter: Dashboard, Dashboard Dokter, PELAYANAN › POLI DOKTER, LAPORAN, USER. Tidak ada menu pendaftaran → tidak bisa membuat pasien uji dari akun ini.
- POLI DOKTER bawaan tersaring ke dokter yang login; kosongkan filter Dokter untuk melihat semua.
- Halaman proses sama dengan trial: rute `pelayanan-proses` (params tab, id_kunjungan, kategori_id), komponen `dokter`, `InputAnamnesa`, `JenisPrognosa`, `Tindakan`, `ICD9`, `Diagnosa`, `Resep`, `Racikan`. Bagian Resep punya tab RESEP / BHP / BAHAN (`Resep.tab_resep`).
- Pasien BPJS: `penjamin_nm = "BPJS"`, `pcare_integrasi = true`, `pcare_integrasi_sts = 1`. Cari ICD lewat PCare berjalan (±0,9 dtk), opsi `{label:"<nama> - <kode>", en, value, icd_kode, non_spesialis}`; kode 3 karakter (J06) tersedia.
- **Master obat**: tiap obat ada beberapa nama dengan stok terpisah: `BPJS -- X`, `X` (umum), `BPJS TK -- X`, `IMR -- X`, `IDN -- X`. `GET master/product` TIDAK menyaring menurut penjamin (semua awalan muncul). Nama dasarnya sama dengan Klinik Pintar; dari 50 item template hanya beberapa yang beda tulisan (mis. "AKITA TAB", "GENTAMICIN CR 5 GR" untuk umum).
- BHP: select "Pilih BHP" memanggil `loadObat(teks, update, abort, "BHP")` (kategori_type=BHP); baris `input_bhp {produk_id:<opsi>, qty, batches, produk_detail_id}`; batch lewat `batchDetailTarif(row)` (melempar error bila stok kosong).
- `Resep.loadObat` di akun ini tidak memanggil update/abort bila request gagal → script memakai batas waktu 15 dtk.
- Tarif: "BPJS - Dokter Umum Jasa Konsultasi", "Dokter Umum Jasa Konsultasi", "BPJS TK - …", "Inhealth - …" (awalan tarif memakai satu tanda "-").
- Uji v0.2.0 pada satu kunjungan BPJS (isi di memori saja, lalu muat ulang; dicek 0 diagnosa/resep/racikan/tindakan/BHP tersimpan): diagnosa K04.0 0,5 dtk; tindakan konsultasi BPJS Rp 30.000; resep "BPJS -- PARACETAMOL 500 MG", "BPJS -- AMOXICILLIN 500 MG" 0,4 dtk; BHP cek gula 3 baris; racikan ISPA anak 3 bahan BPJS.

## Uji ulang lewat menu terpasang (v0.2.0, 2026-11-17)

Tiga kunjungan BPJS dewasa di POLI UMUM 2 (status Sedang Dilayani), tombol RESUME + DIAGNOSIS + RESEP lalu INPUT RESEP, tanpa SIMPAN:

| Kasus (diringkas) | Hasil |
|---|---|
| ICD sudah diisi dokter (H10.0), anamnesa sudah ada | ICD & anamnesa tidak diubah; Paket Resep: BPJS -- PARACETAMOL 500 MG x10; tindakan konsultasi BPJS Rp 30.000 |
| Keluhan demam | R50.9 dari kata "demam"; prognosa Bonam; BPJS -- PARACETAMOL + BPJS -- IBUPROFEN 400 MG (dicentang manual), batch & signa terisi |
| Minta rujukan, TD 145/75 | I10 dari TD (sistolik ≥140); BPJS -- AMLODIPINE 5 MG x15 "1 x 1"; status pulang tidak diubah (dokter ubah ke rujuk sendiri) |

Setelah muat ulang ketiganya: 0 diagnosa/resep/racikan/tindakan/BHP baru tersimpan; tidak ada kunci localStorage dibuat.
Catatan: template Konjungtivitis belum punya obat (tetes mata belum dipetakan).

## Uji v0.8.9 (2026-11-18, Chrome laptop, tanpa menyimpan)
- Pasien antrean BPJS yang belum punya diagnosa; mulai di tab Anamnesa, satu klik ke tab DOKTER → jalan otomatis berjalan ±12 dtk setelah build dimuat (sekitar 2 dtk setelah data tab DOKTER selesai dimuat): diagnosa K59.0 + K40.9, prognosa, jasa konsultasi BPJS (dry run), Paket Resep terbuka. Anamnesa yang sudah diisi tidak ditimpa.
- Ketuk chip hijau tua K40.9 → hilang dari Diagnosa (tetap hilang setelah 4 dtk).
- Muat ulang: diagnosa/resep/tindakan/BHP/racikan tetap 0, tidak ada permintaan tulis. Pengaturan otomatis="0" di laptop dikembalikan.
