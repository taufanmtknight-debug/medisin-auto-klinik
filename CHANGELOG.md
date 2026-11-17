# Changelog

## v0.5.1 — 2026-11-17 (masukan dokter)

- **RESUME saja** sekarang juga mengisi Diagnosa (ICD) dari keluhan; Paket Resep tidak dibuka. Diagnosa yang sudah diisi dokter tidak diubah.
- **Racikan langsung tersimpan** (disetujui dokter): setelah dialog Tambah Racikan terisi, script menekan SIMPAN dialog itu lalu lanjut ke racikan berikutnya; dokter mereview semuanya di akhir. Hanya alamat simpan racikan yang diizinkan (SUBMIT/PCare tetap diblokir). Bila ada bahan tidak ditemukan atau stok kurang, racikan TIDAK disimpan dan menunggu dokter seperti dulu.
- **Puyer lambung + mual**: Ranitidin memakai dosis terendah, 1/2 tablet per 5 kg BB dalam 10 bungkus (sebelumnya 1 tablet per 5 kg). Antasida tidak berubah.

## v0.5.0 — 2026-11-17 (pengetahuan keluhan → diagnosis diperluas)

- **116 diagnosis baru** (total 161) untuk keluhan umum FKTP: napas/THT, mata, saluran cerna & mulut, kemih/kelamin/kebidanan, otot-tulang-saraf, kulit, infeksi tropis (DBD, malaria, chikungunya, campak, flu Singapura, leptospirosis), anak, jiwa, jantung-pembuluh, serta pemeriksaan umum (KB, ANC, surat sehat, sunat). Semua dengan kode ICD-10 dan edukasi.
- **Ribuan variasi kata keluhan awam** (mis. "boyok", "dengkul linu", "kuping bernanah", "watuk", "mumet", "anyang-anyangan", "cantengan", "kelilipan") untuk deteksi diagnosis. Tiap keluhan memberi beberapa pilihan diagnosis (maks 5).
- **Tanda bahaya** (nyeri dada, sesak berat, curiga stroke, kejang, pingsan, muntah darah/BAB hitam, batuk darah, nyeri perut hebat, tanda bahaya kehamilan, dehidrasi, gigitan hewan, alergi berat, ide bunuh diri, cedera kepala, patah tulang, hipoglikemia, tetanus/difteri, trauma mata, tidak bisa kencing, keracunan, sakit kepala hebat/kaku kuduk) dan TTV berbahaya (krisis hipertensi, hipotensi, SpO2 <90): menjadi diagnosis utama (mengalahkan TD tinggi), kotak merah dengan saran rujuk/IGD di Paket Resep, **obat tidak dicentang otomatis**.
- **Perhatian** (kotak kuning): hamil/telat haid & riwayat alergi obat (obat juga tidak dicentang otomatis), menyusui, sesak, batuk ≥2 minggu (TB), demam ≥5 hari, curiga DBD, kuning, berdebar, BB turun, luka kotor (tetanus), luka pada pasien DM.
- Obat untuk diagnosis baru hanya dari daftar Paket Resep yang ada; banyak diagnosis sengaja tanpa obat otomatis.

## v0.4.4 — 2026-11-17 (golongan obat diringkas)

- Paket Resep: 16 golongan digabung menjadi 9 — Analgesik / NSAID; Batuk-Pilek; Antihistamin / Kortikosteroid; Antibiotik / Antivirus; Saluran Cerna; Obat Kronis (HT, DM, Kolesterol, Asam Urat); Vitamin / Saraf; Mata / Telinga; Kulit / Topikal. "Obat Lain (FKTP)" dan "Obat Lain (tambahan)" dibagi ke golongan yang sesuai. Obat, dosis, dan saran tidak berubah.

## v0.4.3 — 2026-11-17 (Paket Resep ringkas)

- Warna lebih tegas: judul tiap bagian dan tiap golongan obat berwarna penuh (teks putih), pilihan tercentang oranye tua, batas kotak lebih jelas.
- Kata-kata diringkas (judul, petunjuk, saran, preview).
- Ukuran lebih kecil: panel maks 1000 px, jarak & tombol lebih rapat. Di HP pilihan obat 2 kolom, tombol Tutup/INPUT RESEP sebaris.
- Perbaikan: di layar sempit (HP) kotak Pasien/Diagnosis/Keluhan/Pilih obat bisa tertekan menjadi garis tipis; kolom keluhan tidak lagi melebar keluar kotak.

## v0.4.2 — 2026-11-17 (masukan dokter dari HP)

- **Jasa konsultasi langsung tersimpan**: RESUME mengisi "BPJS - Dokter Umum Jasa Konsultasi" (atau tarif UMUM) lalu langsung menekan SIMPAN Tindakan milik Medisin (disetujui dokter), hanya bila tidak ada tindakan lain yang belum disimpan.
- **Perbaikan**: kolom Jenis Tindakan sebelumnya diisi objek, padahal Medisin memakai tarif_id → validasi "Jenis Tindakan tidak boleh kosong". Sekarang diisi tarif_id.
- **Diagnosis terinput** di Paket Resep: tombol "Pilihan diagnosis paling mungkin" (maks 5, dari keluhan) untuk mengganti diagnosis isian script, dan kolom **cari diagnosis** (nama, kata keluhan, atau kode ICD): diagnosis bawaan (dengan paket obat) dan ICD 10 dari pencarian Medisin (ditambahkan sebagai diagnosa).
- **Keluhan** di Paket Resep kini dibaca dari **Anamnesa** (Keluhan Utama hanya cadangan); bila diedit di panel, Keluhan Utama DAN Anamnesa di halaman diganti teks itu. Diagnosis otomatis RESUME juga membaca Anamnesa.

## v0.4.1 — 2026-11-17 (permintaan dokter)

- RESEP ULANG dan SURAT SAKIT dihapus dulu dari menu dan shortcut (Alt+U, Alt+K).
- JALAN OTOMATIS menjadi saklar: hijau = NYALA, abu-abu = MATI; menu tidak tertutup saat saklar ditekan.
- Panel Paket Resep: kepala oranye, tiap bagian berwarna sendiri (Pasien biru, Diagnosis hijau toska, Keluhan ungu, Pilih obat oranye, Tindakan hijau), tiap golongan obat dalam kotak berbatas dengan warna berbeda, kotak pilihan berbatas jelas, pilihan yang dicentang oranye.

## v0.4.0 — 2026-11-17 (alur cepat, permintaan dokter)

- **SIMPAN SEMUA** (menu / Alt+S): setelah dokter mereview, menekan SIMPAN milik Medisin berurutan Diagnosa → Resep → BHP → Tindakan, dengan dialog konfirmasi lebih dulu. Selama menyimpan, komponen hanya boleh mengirim ke 4 alamat simpan itu; PCare (rest2), PUT, dan alamat lain diblokir. **SUBMIT, SUBMIT BPJS/SATUSEHAT, PROSES KASIR dan simpan racikan tetap tidak pernah ditekan** (dijaga tes). Gagal per bagian dilaporkan.
- **RESEP ULANG** (Alt+U): ambil diagnosa + obat satuan dari kunjungan terakhir pasien (riwayat 2 tahun), konfirmasi, lalu isi; obat diambil dari stok penjamin SEKARANG (nama UMUM → "BPJS -- …" untuk pasien BPJS). Racikan tidak diulang. Tidak menyimpan.
- **JALAN OTOMATIS**: saat halaman pasien dibuka (sekali per kunjungan, hanya bila belum ada diagnosa/resep tersimpan) RESUME + DIAGNOSIS + Paket Resep langsung berjalan. Bisa dimatikan di menu.
- **SURAT SAKIT** (Alt+K): pilih 1/2/3 hari → buka tab SURAT dan isi "Perlu Istirahat", tanggal mulai hari ini, tampilkan diagnosa. Dokter yang menekan SIMPAN/CETAK. Rujukan BPJS tidak diotomatiskan (lewat PCare).
- **EDUKASI per diagnosis**: kolom Edukasi diisi bila kosong (45 diagnosis bawaan), ikut tersimpan saat SUBMIT.
- **PASIEN BERIKUTNYA** (Alt+N): konfirmasi → buka antrean POLI DOKTER → tekan PELAYANAN untuk pasien menunggu pertama (atau beri tahu bila kosong).
- Shortcut: Alt+R RESUME+DIAGNOSIS, Alt+P Paket Resep, Alt+U, Alt+S, Alt+K, Alt+N.

## v0.3.2 — 2026-11-17 (koreksi dokter)

- **Salbutamol (tablet/puyer) dihapus** dan tidak pernah disarankan (dijaga tes). Asma kembali hanya Methylprednisolone.
- Superhoid supp 1 x 1, 1 buah. Metronidazole 500: 3 x 1, 9 tablet. Ciprofloxacin 500: 2 x 1, 6 tablet. Tablet tambah darah: 5 tablet. Mecobalamin: 3 x 1, 6 tablet. Acyclovir 400 (zoster): 5 x 2 selama 3 hari, 30 tablet.

## v0.3.1 — 2026-11-17 (salep mata + pengetahuan keluhan tambahan)

Obat dipilih hanya dari master obat BPJS klinik yang berstok (135 nama dicek di Medisin).

- Cendo Xitrol / Lyteers: **1 minidose** (permintaan dokter).
- Reco salep mata (3 x 1 oles pada mata yang sakit, 1 tube) di grup Tetes Mata / Telinga.
- Grup baru "Obat Lain (tambahan)": Miconazole salep, Acyclovir salep, Acyclovir 400 mg (5 x 2, 70 tab), Bedak salicyl, Scopma, Salbutamol 2 mg, Tablet tambah darah, Mecobalamin, Superhoid supp.
- Diagnosis baru dari keluhan (kode dicek di PCare): Hordeolum H00.0, Hemoroid I84.9, Disentri A06.0, Tifoid A01.0, Gout M10.9, Herpes labialis B00.1, Miliaria L74.3, Anemia D64.9, Parestesia R20.2.
- Obat ditambahkan ke diagnosis lama: Asma + Salbutamol; Nyeri perut/kolik + Scopma; Tinea & Panu + Miconazole salep; Herpes zoster + Acyclovir 400.

## v0.3.0 — 2026-11-17 (tetes mata & telinga pilihan dokter)

Nama persis dicek di master obat klinik: "BPJS -- CENDO XITROL MINIDOSE", "BPJS -- CENDO LYTEERS MINIDOSE", "BPJS -- RECO TETES TELINGA" (pasien umum otomatis memakai nama tanpa awalan).

- Paket Resep: grup baru **Tetes Mata / Telinga** — Cendo Xitrol (antibiotik) 4 x 1 tetes pada mata yang sakit, 5 minidose; Cendo Lyteers (non-infeksi) 4 x 1 tetes, 5 minidose; Reco tetes telinga 3 x 3 tetes pada telinga yang sakit, 1 botol.
- Diagnosis Konjungtivitis → Cendo Xitrol dicentang. Otitis media / "sakit telinga" → Reco ikut dicentang.
- Saran dari keluhan: "mata merah/belekan" → Xitrol; "mata kering/perih/lelah/kelilipan" → Lyteers.
- Deteksi diagnosis: "sakit mata / mata sakit / nyeri mata" kini dibaca Konjungtivitis (sebelumnya "sakit mata …, gatal" terbaca Dermatitis karena kata "gatal").

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
