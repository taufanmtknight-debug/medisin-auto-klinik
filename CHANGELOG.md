# Changelog

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
