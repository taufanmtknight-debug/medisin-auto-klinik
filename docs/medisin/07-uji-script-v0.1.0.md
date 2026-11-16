# Uji userscript v0.1.0 di Medisin (2026-11-16)

Script disuntik ke halaman proses pasien uji (kunjungan K2451611260002, penjamin UMUM, integrasi mati). Data pasien (keluhan, suhu, BB, umur) diubah hanya di memori halaman. Tidak ada tombol SIMPAN/SUBMIT yang ditekan; setelah uji halaman dimuat ulang dan dicek: keluhan kosong, 0 diagnosa, 0 resep, 0 racikan, status antrean tetap 201.

| Uji | Hasil |
|---|---|
| Launcher muncul di halaman proses | ✓ (kanan bawah, di atas TEAM CHAT) |
| RESUME + DIAGNOSIS, keluhan "batuk pilek demam 2 hari" | ✓ Anamnesa terisi, Prognosa "Bonam", Diagnosa J06 + kasus, TACC -1; ±2 dtk |
| Paket Resep terbuka | ✓ umur 36 th, BB, suhu 38,2 (demam), saran Paracetamol/Cetirizine/Ambroxol |
| INPUT RESEP (dewasa) | ✓ 3 baris Obat Satuan: batch, jumlah 10/5/10, signa "3 x 1 jika demam atau pusing", "1 x 1 setelah makan", "3 x 1 setelah makan" |
| Nama tidak persis (PARACETAMOL 500 MG, CETIRIZINE HCL 10 MG) | ✓ dialog pilih obat muncul; pencarian di dialog berjalan; pilihan tersimpan |
| Nama persis (AMBROXOL 30 MG, DEXAMETHASONE 0,5 MG) | ✓ langsung terisi tanpa dialog |
| Racikan anak (umur 4 th, BB 15 kg): Demam + ISPA | ✓ dialog Tambah Racikan terisi (nama, Kertas Puyer, 10, signa, bahan+jumlah); script menunggu; setelah dialog ditutup lanjut ke racikan berikutnya |
| Bahan dilewati (Guaifenesin tidak ada di trial) | ✓ racikan tetap diisi, pesan "Bahan belum masuk: GUAIFENESIN 100 MG" |

Catatan:
- Pemetaan obat hasil uji dihapus lagi dari browser (dokter yang harus memilih).
- "CETIRIZINE" tidak menemukan "CETIRIZIN" → kata pencarian awal dipendekkan jadi 6 huruf pertama.
- Belum diuji: pasien BPJS (PCare di akun trial error 500), menyimpan hasil isian (sengaja), HP.
