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
