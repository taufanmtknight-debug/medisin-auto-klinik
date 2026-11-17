# Changelog

## v0.2.1 — 2026-11-17

- Pesan akhir RESUME dan PAKET RESEP kini mengingatkan bila baris Tindakan (jasa konsultasi) sudah diisi: "tekan SIMPAN di bagian Tindakan" (bagian Tindakan punya SIMPAN sendiri, terpisah dari Resep).
- Diuji ulang lewat menu AUTO KLINIK v0.2.0 yang terpasang pada 3 kunjungan BPJS hari itu (isi di memori, tanpa simpan; setelah muat ulang tidak ada yang tersimpan).

## v0.2.0 — 2026-11-17 (disesuaikan dengan akun klinik asli)

Dipelajari ulang di akun klinik (bukan trial). Halaman pelayanan sama, tetapi master obat/tarif berbeda: tiap obat punya nama per penjamin dengan stok terpisah ("BPJS -- X", "X" untuk UMUM, "BPJS TK -- X", "IMR -- X", "IDN -- X"), sama seperti di Klinik Pintar.

- **Obat mengikuti penjamin pasien.** Pasien BPJS → "BPJS -- …", UMUM → nama tanpa awalan, penjamin lain → awalan yang sama dengan nama penjamin. v0.1.0 selalu memilih nama tanpa awalan (stok UMUM) — ini diperbaiki. Bila obat untuk penjamin itu tidak ada, muncul dialog pilih obat (obat berawalan penjamin pasien di urutan atas); tidak pernah diam-diam memakai stok penjamin lain.
- **Tindakan**: RESUME mengisi satu baris "Jasa Konsultasi Dokter Umum" sesuai penjamin ("BPJS - Dokter Umum Jasa Konsultasi", "Dokter Umum Jasa Konsultasi", "BPJS TK - …"), hanya di poli umum, tidak dobel.
- **BHP**: tindakan Cek Gula/Kolesterol/Asam Urat/Imunisasi mengisi baris di tab BHP (bagian Resep) dengan batch yang ada stok dan jumlahnya.
- Racikan: peringatan bila stok bahan kurang.
- Header: `@updateURL`/`@downloadURL` agar Violentmonkey memperbarui otomatis.
- Semua tetap hanya mengisi; SIMPAN/SUBMIT oleh dokter.

## v0.1.0 — 2026-11-16 (versi awal untuk Medisin)

Port dari AUTO KLINIK Klinik Pintar v10.1.1. Data, template resep/racikan, Paket Resep Golongan, menu, dan tampilan dipertahankan. Mesin pengisi form ditulis ulang untuk Medisin (Vue 2 + Quasar + Vuex): script mengisi state halaman, bukan mengetik di kolom.

- **RESUME**: Keluhan Utama disalin ke Anamnesa; Kesadaran, Jenis Prognosa (Bonam), Status Pulang diisi bila masih kosong.
- **Diagnosa**: ICD-10 dari keluhan diisi ke baris Diagnosa (TACC "Tanpa TACC"). Bila kode 3 karakter (mis. J06) tidak ada sebagai pilihan, dipakai turunan ".9". Diagnosa yang sudah ada tidak ditambah/diubah.
- **Resep**: obat masuk ke baris "Obat Satuan" (batch pertama yang ada stok, jumlah, signa). Baris yang sudah diisi dokter tidak disentuh; obat yang sudah ada tidak dobel; stok kurang diberi peringatan.
- **Signa**: Medisin hanya punya satu kolom signa, jadi ditulis "frekuensi x dosis [satuan] [instruksi]", mis. "3 x 1 setelah makan", "3 x 5 ml setelah makan". Bila master signa klinik punya tulisan yang sama, tulisan master dipakai.
- **Nama obat**: hanya yang sama persis dipilih otomatis. Selain itu muncul dialog "Pilih obat di Medisin"; pilihan diingat per klinik + penjamin (localStorage).
- **Racikan**: dialog "Tambah Racikan" dibuka dan diisi (nama, jenis: puyer → Kertas Puyer, salep → Pot Salep; jumlah dari "buat 10"; signa; bahan + jumlah). Script menunggu dokter menekan SIMPAN atau menutup dialog sebelum racikan berikutnya.
- Data pasien (umur, BB, TTV, keluhan) dibaca dari data halaman; tidak dipakai bila halaman masih memuat pasien sebelumnya.
- Tidak ada pemanggilan simpan/submit/API tulis Medisin (dijaga tes).

Belum ada: Tindakan/tarif, BHP, update otomatis lewat repo rilis.
