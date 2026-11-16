# AUTO KLINIK (Medisin) — catatan untuk Claude

Pengguna adalah dokter; balas dalam Bahasa Indonesia sederhana. Website: `https://app.medisin.id` (Vue 2 + Quasar v1 + Vuex, "App Sintasi"). Baca `docs/medisin/00-RINGKASAN.md` sebelum mengubah apa pun.

## Aturan tetap (dibawa dari versi Klinik Pintar)
- Script hanya **mengisi**. Tidak pernah menekan SIMPAN, SUBMIT, SUBMIT BPJS, SUBMIT SATUSEHAT, PROSES KASIR. Dokter selalu mereview.
- Isian dokter tidak ditimpa (isi hanya kolom kosong).
- Dosis/obat baru yang Claude tentukan sendiri harus disebutkan ke dokter untuk dievaluasi.
- Obat dicocokkan nama UTUH (`produk_nm`), bukan sebagian.

## Menguji di Medisin asli
- Boleh membaca lewat browser. Halaman proses bisa dibuka langsung `/admin/pelayanan/proses/dokter/<btoa(id_kunjungan)>` tanpa mengubah status; tombol PELAYANAN di antrean mengubah status ke 203.
- Uji simpan hanya pada pasien uji "TES AUTO KLINIK (JANGAN DIPAKAI)" (No RM 012386) dengan integrasi SatuSehat/BPJS mati. Catat data uji di `docs/medisin/99-data-uji-yang-dibuat.md`.
- Jangan salin data pribadi pasien ke repo/dokumen.
- Keluaran `javascript_tool` dibatasi: string >~1000 karakter terpotong dan URL ber-query diblokir; kembalikan array potongan ±900 karakter, ganti `?&=` sebelum mengembalikan.
