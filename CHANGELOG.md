# Changelog

## v0.9.2 — 2026-11-23

- **Racikan lambung = ranitidin saja** (permintaan dokter; antasida sudah punya racikan sendiri). Dosis ranitidin tetap minimal ~1,2–1,8 mg/kg/dosis, 2x sehari; hanya BB 9–10 kg berubah dari 1 tab/12 bungkus menjadi 1 tab/10 bungkus (15 mg/dosis).
- Nama di Paket Resep: **Racikan Ranitidin** dan **Racikan Domperidon** (tanpa keterangan dalam kurung). Nama racikan di Medisin: RANI dan DOMP.

## v0.9.1 — 2026-11-23

- **Nama racikan lambung + mual dan mual muntah = singkatan isinya** (permintaan dokter), sama seperti racikan lain. Lambung + mual = **ANTS-RANI** (umur 2–4 th tanpa antasida = **RANI**), mual muntah = **DOMP**. Nama ini dipakai di kolom nama racikan Medisin dan di daftar Paket Resep.

## v0.9.0 — 2026-11-21

- **Laporan perangkat** (permintaan dokter): tiap perangkat yang membuka Medisin dengan AUTO KLINIK mengirim satu baris ke Google Form "Auto Klinik Perangkat" milik dokter (masuk ke Google Sheet dokter) saat mulai, tiap 10 menit selama Medisin terbuka, dan saat status kunci berubah. Isinya hanya: kode perangkat acak (tersimpan di `auto-klinik-medisin:perangkat`), jenis perangkat & browser, versi, aktif/terkunci, jalan otomatis nyala/mati, dan apakah sedang di halaman pelayanan. Tanpa data pasien, alamat halaman, atau nama akun. Perangkat yang terkunci tetap melapor.

## v0.8.9 — 2026-11-18

- **Jalan otomatis bekerja di klik pertama tab DOKTER** (laporan dokter). Saat tab DOKTER dibuka, Medisin memuat ulang data kunjungan (~1–2 detik); dulu RESUME jalan sebelum muatan selesai lalu tertimpa. Sekarang script menunggu halaman tenang (komponen ≥1,5 dtk, tidak ada respons API ≥1 dtk, maks 10 dtk). Bila data pasien tetap dimuat ulang sesudah RESUME dan Anamnesa kembali kosong, RESUME diulang sekali (hanya mengisi kolom kosong).
- **Panel Paket Resep: ketuk diagnosis hijau tua (✓) = batal pilih** (permintaan dokter), sama dengan ✕. Diagnosa yang sudah tersimpan ditandai hapus (dihapus saat SIMPAN SEMUA); ketuk lagi untuk memilih kembali.

## v0.8.8 — 2026-11-18

- **CTM juga dosis paling minimal** (koreksi dokter): ~0,08 mg/kg/dosis, dibulatkan ke bawah, **maks 1 tablet per kelipatan 5 kg** (20 kg = maks 4 tablet) dan maks 2 mg/dosis. Contoh BB 20 kg GG-CTM-DEXA = GG 3, CTM 4, DEXA 3 tablet, 10 bungkus.

## v0.8.7 — 2026-11-18

- **Koreksi aturan v0.8.6**: guaifenesin, ambroxol, dan dexa sekarang memakai **dosis minimal per kg**. Patokannya BB 10 kg = 2 tablet dalam 12 bungkus.
  - Dosis per minum: GG ~1,7 mg/kg, ambroxol 0,5 mg/kg, dexa ~0,008 mg/kg.
  - BB di bawah 10 kg mendapat tablet lebih sedikit (minimal 1). Bila 1 tablet masih terlalu besar, puyer diperbanyak (maks 30 bungkus).
  - Contoh: BB 8 kg ISPA = GG 1, CTM 2, DEXA 1 tablet, buat 10 bungkus.

## v0.8.6 — 2026-11-18

- **Guaifenesin, ambroxol, dan dexa di semua racikan = jumlah minimal tetap** (permintaan dokter):
  - BB ≤10 kg: 2 tablet. BB 11–15 kg: 3 tablet. Naik 1 tablet tiap 5 kg, berapa pun jumlah bungkusnya.
  - Contoh: BB 10 kg GG-CTZ-DEXA = GG 2, CTZ 1, DEXA 2 tablet, buat 12 bungkus.
- Jumlah bungkus ditentukan obat lain (CTM/cetirizine). Bila perlu, jumlah bungkus ditambah (maks 30) supaya dosis per bungkus tidak berlebihan.
- Rentang BB kini berbatas di kelipatan 5 kg (…, 10, 11, …, 15, 16, 18, 20, 22, 25, 28, 30, 32, 35, 38, 40, …).

## v0.8.5 — 2026-11-18

- **Racikan AMB-CTZ-DEXA (tanpa CTM)** untuk anak BB 4–40 kg (permintaan dokter): ambroxol + cetirizine + dexametason, 3x sehari setelah makan. Dosis cetirizine 0,25 mg/kg/hari dibagi 3, ambroxol 0,5 mg/kg/dosis.
- **Nama singkatan diurutkan tetap**: pengencer dahak (GG/AMB) → antihistamin (CTM/CTZ) → DEXA. Bapil 2 sekarang bernama **AMB-CTM-DEXA**.
- Label pilihan racikan di Paket Resep ikut memakai singkatannya.

## v0.8.4 — 2026-11-18

- **Racikan Bapil Cetirizin (tanpa CTM)** untuk anak, 3x sehari setelah makan (permintaan dokter):
  - Isi: guaifenesin + cetirizine + dexametason.
  - Dosis cetirizine 0,25 mg/kg/hari dibagi 3. Tablet bulat, jumlah bungkus menyesuaikan.
  - Untuk BB 4–40 kg, termasuk bayi <6 bulan.
- **Nama racikan puyer berisi ≥2 obat = singkatan obat penyusunnya**, mis. "GG-CTM-DEXA", "DEXA-CTM-AMB", "GG-CTZ-DEXA", "ANTS-RANI".
  - Nama ini dipakai sebagai Nama Racikan di Medisin dan tampil di preview.
  - Racikan 1 obat dan salep tetap memakai nama lama.

## v0.8.3 — 2026-11-18

- **Obat stok 0 tidak bisa dipilih** di panel Paket Resep Golongan (permintaan dokter). Pilihannya tampil abu-abu dengan keterangan merah "stok 0: NAMA OBAT".
  - Stok dibaca sekali saat panel dibuka, lewat satu GET daftar produk Medisin (hanya baca). Stok sesuai penjamin pasien, hanya lokasi non-gudang, sama seperti pencarian obat Medisin.
  - Racikan dikunci bila salah satu bahannya stok 0. Bahan yang tidak dipakai untuk umur itu (mis. CTM untuk bayi) tidak dihitung.
  - Obat yang tidak ditemukan di daftar tidak dikunci; dokter tetap memilih lewat dialog seperti biasa.

## v0.8.2 — 2026-11-18

- Keluhan **"bintik", "bintil", "bercak", "bintik merah", "kemerahan kulit"** saja sekarang menjadi diagnosis **Dermatitis (L30.9)** dan otomatis mendapat obatnya (salep racikan + cetirizine), bukan lagi "Ruam kulit" tanpa obat (permintaan dokter). Ruam kulit (R21) hanya untuk bercak hitam/coklat/ungu dan "ruam tidak gatal"; Ruam kulit menjadi diagnosis banding dermatitis.

## v0.8.1 — 2026-11-18

- **Jumlah tablet racikan selalu bulat** (koreksi dokter: Medisin tidak menerima 0,25/0,5/0,75). **Jumlah bungkus menyesuaikan (10-30)**, dan lama hari = bungkus ÷ frekuensi. Contoh: BB 10 kg puyer demam = 3 tablet paracetamol buat 12 bungkus = 125 mg/bungkus.
- Bayi <6 bulan: racikan tanpa CTM dihitung ulang jumlah bungkusnya.
- Racikan Lambung + Mual dan Racikan Antasida mulai BB 8 kg.

## v0.8.0 — 2026-11-18

- **Dosis anak dihitung per mg/kg** (tabel lengkap: `docs/medisin/09-dosis-anak.md`). Rentang BB lebih rapat (2-3, >3-4, … kg) dan jumlah tablet dibulatkan ke ¼ tablet. Dosis di BB terendah tiap rentang tidak melebihi batas atas.
  - Paracetamol 10-15 mg/kg/dosis.
  - Ibuprofen 5-10 mg/kg/dosis.
  - Domperidon maks 0,25 mg/kg/dosis, puyer & sirup.
  - CTM 0,1 mg/kg/dosis, maks 2 mg.
  - Dexametason 0,015 mg/kg/dosis.
  - Guaifenesin 4 mg/kg/dosis.
  - Ambroxol 0,5 mg/kg/dosis.
  - Cetirizin 0,25 mg/kg/hari.
  - Ranitidin 1,5 mg/kg/dosis.
  - Antasida 1/40 tablet/kg/dosis.
- **Batas umur**: ibuprofen, CTM, domperidon ≥6 bulan; ranitidin ≥2 tahun; antasida ≥4 tahun.
  - Pilihan di bawah umur tampil abu-abu dan tidak bisa dicentang, dan tidak disarankan otomatis.
  - Bayi <6 bulan: Racikan ISPA & Bapil 2 dibuat **tanpa CTM**.
  - Umur 2-4 tahun: Racikan Lambung berisi ranitidin saja.
- **Baru**: Antasida DOEN sirup anak ≥4 th (2,5 / 5 / 10 mL menurut umur) dan Racikan Antasida anak ≥4 th (BB).
- Kotak peringatan bayi tidak lagi menyebut obat yang sekarang sudah dikunci umur. mg kecil (dexa) ditampilkan lebih teliti.

## v0.7.1 — 2026-11-18

- **Info obat & racikan lebih ringkas**: racikan ditulis "Puyer 10 bungkus", signa satu baris ("3 × 1 bungkus/hari · 3 hari · setelah makan"), tiap bahan "PARACETAMOL 500 MG 1 tab → 50 mg/bungkus = 12,5 mg/kg". Obat biasa satu baris ("1 sachet × 1/hari · 1 hari → 4 sachet"), sirup dengan mg/kg. Awalan "BPJS --" disembunyikan di tampilan.
- **Peringatan bayi <6 bulan / <7 kg** (kotak kuning, dosis tidak diubah): ibuprofen, CTM/cetirizine, obat batuk-pilek, deksametason, domperidon, antasida/ranitidin, salep steroid kuat, tetes mata ber-steroid.
- **✕ juga untuk diagnosa tersimpan**: ditandai "akan dihapus" (↺ untuk batal) dan dihapus saat SIMPAN SEMUA lewat alamat hapus diagnosa Medisin sendiri. Obat tidak lagi mengikuti diagnosa yang akan dihapus.
- **Panel Diagnosis sinkron otomatis** dengan bagian Diagnosa Medisin (tersimpan / akan ditulis / akan dihapus), diperbarui tiap 1,5 detik.

## v0.7.0 — 2026-11-18

- **Keluhan kulit**: bintik, bintik merah, bintik berair/lenting, bintik bernanah, bercak putih/merah/hitam, bercak bersisik, dll. dikenali. Diagnosis baru: Ruam kulit (R21), Dermatitis venenata/tomcat, Folikulitis, Pitiriasis rosea, Pitiriasis alba, Vitiligo, Melasma, Moluskum, Kandidiasis kulit, Intertrigo.
- **Keluhan umum tambahan**: kulit kering/tumit pecah, kapalan/mata ikan, keloid, tahi lalat, keringat berlebih, bau badan, gumoh, mengompol, tali pusat basah, masalah ASI, nyeri saat berhubungan, susah menelan, kencing darah, mudah lupa, keterlambatan tumbuh kembang, mata juling, mata bengkak, bibir pecah, kelenjar bengkak, telat haid, berhenti merokok, tangan gemetar, telinga kemasukan air, dll. Semua 46 kode ICD baru dicek ada di pencarian ICD Medisin. Diagnosis baru **tanpa obat otomatis** (dokter memilih).
- **Banyak diagnosis**: keluhan yang berbeda (mis. "batuk pilek, diare") mengisi 2-3 diagnosis (yang pertama = Primer). Gejala dari penyakit yang sama tidak ditambah (mis. batuk pilek demam = ISPA saja; demam + bintik merah + mimisan = DBD).
- **Hapus diagnosis**: di Paket Resep tiap diagnosa punya tombol ✕ (hanya yang belum tersimpan; yang sudah tersimpan dihapus lewat ikon Medisin sendiri).
- **Diagnosis banding**: daftar pilihan banding (maks 6) di Paket Resep; ketuk untuk menambah tanpa mengganti diagnosis yang ada.
- Saran obat Paket Resep mengikuti **semua** diagnosis yang terisi; diagnosis yang dihapus ikut menghapus saran obatnya.

## v0.6.2 — 2026-11-17

- Perangkat yang dibuka dengan PIN bisa **dikunci lagi dari jarak jauh** tanpa membuka kunci dulu: cukup ubah `kunci.json` lagi (misalnya naikkan `"kunci_ke"` 1 → 2, atau ganti `"pesan"`). Buka-PIN hanya berlaku untuk isi `kunci.json` saat PIN dimasukkan.

## v0.6.1 — 2026-11-17

- Saat **dikunci jarak jauh**, tombol 🔒 bisa diketuk untuk memasukkan **PIN dokter**; PIN benar = AUTO KLINIK terbuka **hanya di perangkat itu**. PIN hanya disimpan sebagai hash SHA-256 di script.
- Di perangkat yang dibuka PIN, menu punya tombol **"Kunci lagi di perangkat ini"**.
- Buka-PIN berlaku sampai dokter menekan "Kunci lagi", atau sampai kunci jarak jauh dibuka (`"aktif": true`); kunci jarak jauh berikutnya berlaku lagi di semua perangkat.

## v0.6.0 — 2026-11-17

- **Tombol AUTO KLINIK bisa digeser** ke mana saja: tekan-tahan lalu geser (mouse di laptop, jari di HP). Posisinya diingat per perangkat. Ketuk biasa tetap membuka menu; menu terbuka ke arah tengah layar.
- **Tombol muncul di semua halaman Medisin** (dashboard, antrean, dll.), tidak hanya saat pelayanan pasien. Menu yang butuh pasien (RESUME, Paket Resep, SIMPAN SEMUA) di halaman lain hanya memberi pesan "Buka pasien dari antrean poli (tab DOKTER) dulu."; PASIEN BERIKUTNYA dan JALAN OTOMATIS bisa dipakai di mana saja.
- **Kunci jarak jauh**: file `kunci.json` di GitHub. `"aktif": false` = AUTO KLINIK terkunci di semua perangkat (tombol abu-abu 🔒, menu, pintasan keyboard, jalan otomatis & pasien berikutnya berhenti). `"aktif": true` = buka lagi. Dicek saat halaman dibuka, tiap 2 menit, dan saat tab dibuka lagi (GitHub bisa menunda sampai ±5 menit). Bila internet/GitHub gagal, status terakhir yang diketahui dipakai. Script hanya MEMBACA file ini (GET, tanpa kredensial).

## v0.5.2 — 2026-11-17

- Puyer lambung + mual (Antasida + Ranitidin) menjadi **2x sehari** (signa 2 x 1 ac, 10 bungkus = 5 hari). Ranitidin 1,5 mg/kg/dosis = 1/2 tablet 150 mg per 5 kg BB (permintaan dokter). Antasida tetap 1 tablet per 5 kg, ikut 2x sehari.

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
