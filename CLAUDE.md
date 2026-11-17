# AUTO KLINIK (Medisin) — catatan untuk Claude

Pengguna adalah dokter; balas dalam Bahasa Indonesia sederhana. Website: `https://app.medisin.id` (Vue 2 + Quasar v1 + Vuex, "App Sintasi"). Baca `docs/medisin/00-RINGKASAN.md` sebelum mengubah apa pun.

## Aturan tetap (dibawa dari versi Klinik Pintar)
- Script hanya **mengisi**; dokter selalu mereview. Pengecualian (disetujui dokter 2026-11-17): tombol **SIMPAN SEMUA** yang ditekan dokter boleh menjalankan SIMPAN Medisin untuk Diagnosa/Resep/BHP/Tindakan, hanya di blok `AK-WRITE-BLOCK` dengan penjaga alamat. Tidak pernah: SUBMIT (`saveData` → PUT kunjungan + PCare), SUBMIT BPJS, SUBMIT SATUSEHAT, PROSES KASIR, simpan racikan.
- Menguji SIMPAN SEMUA di pasien asli: pakai `window.__AK_DRY_RUN__ = true` + blok XHR non-GET; simpan sungguhan hanya pada pasien yang ditunjuk dokter.
- Isian dokter tidak ditimpa (isi hanya kolom kosong).
- Dosis/obat baru yang Claude tentukan sendiri harus disebutkan ke dokter untuk dievaluasi.
- Obat dicocokkan nama UTUH (`produk_nm`), bukan sebagian.

## Menguji di Medisin asli
- Boleh membaca lewat browser. Halaman proses bisa dibuka langsung `/admin/pelayanan/proses/dokter/<btoa(id_kunjungan)>` tanpa mengubah status; tombol PELAYANAN di antrean mengubah status ke 203.
- Uji hanya pada pasien uji "TES AUTO KLINIK (JANGAN DIPAKAI)" (No RM 012386) dengan integrasi SatuSehat/BPJS mati. Catat data uji di `docs/medisin/99-data-uji-yang-dibuat.md`.
- Jangan salin data pribadi pasien ke repo/dokumen.
- Keluaran `javascript_tool` dibatasi: string >~1000 karakter terpotong dan URL ber-query diblokir; kembalikan array potongan ±900 karakter, ganti `?&=` sebelum mengembalikan.

## Akun klinik asli
- Sudah dipakai untuk pasien asli; akun dokter tidak bisa membuat pasien uji. Uji = buka halaman proses lewat URL, isi di memori saja, JANGAN simpan, muat ulang, cek tidak ada yang tersimpan. Lihat `docs/medisin/08-akun-klinik-asli.md`.
- Obat/tarif berawalan penjamin (`BPJS -- X`, `X`, `BPJS TK -- X`, …) dengan stok terpisah; jangan pernah memakai stok penjamin lain secara otomatis.
- Untuk mencoba build baru saat v lama terpasang: set `window.__AUTO_KLINIK_TEST__ = {}` lalu eval build → fungsi pengisi tersedia tanpa launcher kedua.

## Userscript `Medisin_AUTO_KLINIK.user.js`
- Satu file, 9 bagian (bagian 9 = alur cepat v0.4.0, sumber `engine-alur.js` di generator) (lihat komentar di atas file). Bagian 2–4 = jembatan Medisin (state Vue); bagian 1, 5–8 dibawa dari versi Klinik Pintar.
- Komponen Medisin dicari dengan `name` ATAU `_componentTag` (`Resep`, `Racikan`, `Diagnosa`, `dokter`). Data pasien hanya dipakai lewat `pasienAktif()` (id kunjungan store = URL).
- `@name`/`@namespace` jangan diubah. `@inject-into page` wajib. Naikkan `@version` + `SCRIPT_VERSION_FALLBACK` bersamaan, tulis CHANGELOG.
- `npm test` harus lulus; tes `medisin.test.cjs` menjaga: tidak menimpa isian dokter, nama obat persis, simpan/API tulis hanya di blok `AK-WRITE-BLOCK`, SUBMIT/PCare tidak pernah.
- Uji di Medisin asli tanpa memasang: di Console halaman proses, `fetch` file raw dari GitHub lalu `(0,eval)(teks)`; ubah data hanya di memori, jangan tekan SIMPAN, muat ulang setelahnya, hapus kunci localStorage `auto-klinik-medisin:*` hasil uji.
