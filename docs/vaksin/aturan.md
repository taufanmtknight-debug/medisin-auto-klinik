# Aturan CEK VAKSIN (dibuat otomatis dari `vaksin/vaksin-rules.js`)

Versi aturan: 2026-11-25. ⚠️ = perlu verifikasi (nilai paling ketat dipakai sampai dokter memutuskan; lihat `perbedaan-sumber.md`).

## Sumber

- **IDAI2023**: Jadwal Imunisasi Anak 0–18 Tahun Rekomendasi IDAI 2023 (Sitaresmi dkk, Sari Pediatri 25(1):64–74, Juni 2023)
- **KMK1098**: Kepmenkes HK.01.07/MENKES/1098/2024 tentang Jenis dan Jadwal Imunisasi (lampiran); diubah Kepmenkes 35/2025 hanya untuk HPV
- **CDC2025**: CDC/ACIP Child and Adolescent Immunization Schedule 2025 (Table 2 catch-up + Appendix kontraindikasi)
- **CDC_GBP**: CDC/ACIP General Best Practice Guidelines for Immunization (Timing & Spacing; Altered Immunocompetence)
- **ROTARIX**: Rotarix — Summary of Product Characteristics (EMA), bagian 4.2 dan 4.3
- **ROTATEQ**: RotaTeq — label produk (belum berhasil diunduh, 2026-11-25)

## Per vaksin

| Vaksin / aturan | Batas / nilai | Sumber | Status | Catatan |
|---|---|---|---|---|
| Hepatitis B lahir (HB0) · batasLahir | 1 hari | KMK1098 hal. 7; IDAI2023 hal. 64 | ✅ terverifikasi | HB0 diberikan <24 jam. Alat hanya tahu tanggal: usia 0 hari = boleh; usia 1 hari = cek jam lahir. |
| Hepatitis B lahir (HB0) · bilaTerlewat | lanjut lewat DTP-HB-Hib | IDAI2023 hal. 64 (imunisasi selanjutnya bersama DTwP/DTaP) | ✅ terverifikasi |  |
| Hepatitis B lahir (HB0) · bblKurang2000 | bbGram: 2000; tundaSampai: 1 bulan | IDAI2023 hal. 64 & 73 | ✅ terverifikasi | BBL <2000 g: tunda sampai usia 1 bulan/saat pulang kecuali ibu HBsAg+; dosis lahir tidak dihitung, total 4 dosis. |
| Hepatitis B lahir (HB0) · ibuHBsAg | HB0 + HBIg <24 jam (HBIg masih boleh sampai 7 hari) | IDAI2023 hal. 64 & 73 | ✅ terverifikasi | Angka 7 hari adalah untuk HBIg, bukan HB0. |
| BCG · ideal | 1 bulan | IDAI2023 hal. 64 (sebelum 1 bulan); KMK1098 hal. 7 (usia 1 bulan) | ✅ terverifikasi |  |
| BCG · tanpaUjiSampai | 3 bulan | IDAI2023 hal. 65 & 74 | ✅ terverifikasi | Usia ≥3 bulan: BCG bila uji tuberkulin negatif; bila uji tidak tersedia BCG tetap diberikan, pantau reaksi lokal cepat minggu pertama. |
| BCG · batasKejarProgram | 12 bulan | KMK1098 hal. 11 (kejar: paling lambat usia 11 bulan / <1 tahun) | ⚠️ perlu verifikasi | IDAI tidak memberi batas atas untuk bayi; usia ≥12 bulan ditandai PERLU CEK. |
| BCG · prematur | usiaGestasiMinMinggu: 32 | IDAI2023 hal. 65 | ✅ terverifikasi | Bayi prematur sehat 32–36 minggu boleh BCG; <32 minggu tidak disebut → cek manual. |
| BCG · kontakTB | tunda sampai terbukti tidak terinfeksi | IDAI2023 hal. 65 & 74 (bayi dari ibu TB aktif) | ✅ terverifikasi | Beri terapi pencegahan TB. |
| Polio tetes (bOPV) · jumlahDosis | 4 | KMK1098 hal. 7 & 11; IDAI2023 hal. 74 | ✅ terverifikasi |  |
| Polio tetes (bOPV) · usiaIdealBulan | 1, 2, 3, 4 | KMK1098 hal. 7 (0–1, 2, 3, 4 bulan) | ✅ terverifikasi | Angka = bulan terakhir jadwal; terlambat bila usia ≥ angka + 1 bulan (IDAI2023 hal. 73: kolom 2 = 2 bulan s.d. 2 bulan 29 hari). |
| Polio tetes (bOPV) · minUsiaDosis1 | 0 hari | KMK1098 hal. 7 | ✅ terverifikasi |  |
| Polio tetes (bOPV) · interval | 4 minggu | KMK1098 hal. 11 (kejar OPV) | ✅ terverifikasi |  |
| Polio tetes (bOPV) · imunodefisiensi | pakai IPV | Permintaan dokter; CDC2025 Appendix (vaksin hidup) | ✅ terverifikasi |  |
| Polio tetes (bOPV) · boosterUsia18bulan | — | Ringkasan IDAI 2024 (sekunder); tidak ada di IDAI 2023 & KMK1098 | ⚠️ perlu verifikasi | Tidak dijadwalkan otomatis. |
| Polio suntik (IPV) · jumlahDosis | 2 | KMK1098 hal. 7 & 11; IDAI2023 hal. 74 (minimal 2x IPV) | ✅ terverifikasi |  |
| Polio suntik (IPV) · usiaIdealBulan | 4, 9 | KMK1098 hal. 7 | ✅ terverifikasi |  |
| Polio suntik (IPV) · minUsiaDosis1 | 4 bulan | KMK1098 hal. 7 (jadwal 4 bulan) | ⚠️ perlu verifikasi | CDC: usia minimal 6 minggu. Dipakai 4 bulan (lebih ketat). |
| Polio suntik (IPV) · interval | 4 bulan | KMK1098 hal. 11 (kejar IPV interval 4 bulan) | ⚠️ perlu verifikasi | CDC: 4 minggu. Dipakai 4 bulan. |
| Polio suntik (IPV) · batasKejar | 5 tahun | KMK1098 hal. 11 (kejar IPV bayi & balita; anak sekolah: –) | ✅ terverifikasi |  |
| DTP-HB-Hib · minUsiaDosis1 | 6 minggu | IDAI2023 hal. 74 (DTP mulai 6 minggu); CDC2025 | ✅ terverifikasi |  |
| DTP-HB-Hib · usiaIdealBulan | 2, 3, 4, 18 | KMK1098 hal. 7–8 | ✅ terverifikasi |  |
| DTP-HB-Hib · intervalBayi | 4 minggu | KMK1098 hal. 11–12 (kejar bayi: 3 dosis interval 4 minggu) | ✅ terverifikasi |  |
| DTP-HB-Hib · boosterMinUsia | 18 bulan | KMK1098 hal. 8; IDAI2023 hal. 66 | ✅ terverifikasi |  |
| DTP-HB-Hib · boosterInterval | 12 bulan | KMK1098 hal. 12 (dosis 3→4 = 12 bulan) | ⚠️ perlu verifikasi | IDAI: booster 1 tahun setelah dosis 3 (anak >1 th); CDC: 6 bulan. Dipakai 12 bulan. |
| DTP-HB-Hib · balitaMulaiUsia | 12 bulan | KMK1098 hal. 11–12 (balita 12–59 bulan: 4 dosis) | ✅ terverifikasi |  |
| DTP-HB-Hib · intervalBalita | 1 bulan, 6 bulan, 12 bulan | KMK1098 hal. 11–12; IDAI2023 hal. 66 | ✅ terverifikasi | IDAI: dosis 1→2 ≥4 minggu, 2→3 ≥6 bulan, booster 1 tahun setelah dosis 3. |
| DTP-HB-Hib · batasKejar | 5 tahun | KMK1098 hal. 11–12 (balita s.d. 59 bulan; anak sekolah: –, lanjut DT/Td BIAS) | ✅ terverifikasi |  |
| DTP-HB-Hib · ensefalopati7hari | tidak boleh komponen pertusis | CDC2025 Appendix (DTaP) | ✅ terverifikasi | DT tanpa pertusis: cek manual. |
| DTP-HB-Hib · neurologiProgresif | tunda sampai stabil | CDC2025 Appendix (DTaP, perhatian) | ✅ terverifikasi |  |
| PCV (pneumokokus) · minUsiaDosis1 | 6 minggu | IDAI2023 hal. 66 (usia 6 minggu–5 tahun); CDC2025 | ✅ terverifikasi |  |
| PCV (pneumokokus) · programJadwal | 2, 3, 12 | KMK1098 hal. 7–8; IDAI2023 hal. 66 | ✅ terverifikasi |  |
| PCV (pneumokokus) · idaiJadwal | 2, 4, 6, 12 | IDAI2023 hal. 74 (2, 4, 6 + booster 12–15 bulan) | ✅ terverifikasi |  |
| PCV (pneumokokus) · intervalPrimer | 4 minggu | KMK1098 hal. 12–13 (kejar bayi dosis 1→2: 4 minggu) | ✅ terverifikasi |  |
| PCV (pneumokokus) · intervalMulai7sd12 | 1 bulan | IDAI2023 hal. 66 & 74 | ⚠️ perlu verifikasi | KMK: 4 minggu. Dipakai 1 bulan. |
| PCV (pneumokokus) · boosterMinUsia | 12 bulan | KMK1098 hal. 8 & 12–13; IDAI2023 hal. 66 | ✅ terverifikasi |  |
| PCV (pneumokokus) · boosterInterval | 2 bulan | IDAI2023 hal. 66 & 74 | ⚠️ perlu verifikasi | KMK: 8 minggu. Dipakai 2 bulan. |
| PCV (pneumokokus) · mulai12sd24 | dosis: 2; interval: 2 bulan | IDAI2023 hal. 66 & 74; KMK1098 hal. 12–13 | ⚠️ perlu verifikasi | KMK: interval 8 minggu, kelompok 12–24 bulan. Dipakai 2 bulan. |
| PCV (pneumokokus) · mulai24sd59 | PCV13: 1; PCV15: 1; PCV10: 2; tidakTahu: 2; interval: 2 bulan | IDAI2023 hal. 66 & 74 (PCV10 2 dosis, PCV13 1 dosis); KMK1098 hal. 12–13 (>24–59 bulan: 1 dosis) | ⚠️ perlu verifikasi | PCV15 tidak disebut IDAI/KMK; dianggap seperti PCV13 hanya bila dokter memilih. Merek tidak dipilih: 2 dosis (ketat). |
| PCV (pneumokokus) · batasUsia | 5 tahun | IDAI2023 hal. 66 & 74 | ✅ terverifikasi | >5 tahun hanya risiko tinggi: 1 dosis PCV13 (cek manual). |
| Rotavirus · merek · Rotarix (RV1) · jumlahDosis | 2 | IDAI2023 hal. 66–67 & 74; ROTARIX 4.2 | ✅ terverifikasi |  |
| Rotavirus · merek · Rotarix (RV1) · minUsiaDosis1 | 6 minggu | IDAI2023 hal. 74; ROTARIX 4.2 | ✅ terverifikasi |  |
| Rotavirus · merek · Rotarix (RV1) · maksUsiaDosis1 | usia: 84 hari; termasuk: true | IDAI2023 hal. 74 (dosis pertama 6–12 minggu); keputusan dokter 2026-11-25 | ✅ terverifikasi | Dokter memilih IDAI 12 minggu 0 hari (CDC 14 minggu 6 hari tidak dipakai). |
| Rotavirus · merek · Rotarix (RV1) · interval | 4 minggu | IDAI2023 hal. 74; ROTARIX 4.2 | ✅ terverifikasi |  |
| Rotavirus · merek · Rotarix (RV1) · maksUsiaSeri | usia: 168 hari; termasuk: true | IDAI2023 hal. 74 (paling lambat 24 minggu); ROTARIX 4.2 (harus selesai sebelum 24 minggu) | ⚠️ perlu verifikasi | CDC: dosis terakhir maks 8 bulan 0 hari. Dipakai 24 minggu 0 hari. |
| Rotavirus · merek · RotaTeq (RV5) · jumlahDosis | 3 | IDAI2023 hal. 74 | ✅ terverifikasi |  |
| Rotavirus · merek · RotaTeq (RV5) · minUsiaDosis1 | 6 minggu | IDAI2023 hal. 74 | ✅ terverifikasi |  |
| Rotavirus · merek · RotaTeq (RV5) · maksUsiaDosis1 | usia: 84 hari; termasuk: true | IDAI2023 hal. 74 (dosis pertama 6–12 minggu); keputusan dokter 2026-11-25 | ✅ terverifikasi | Dokter memilih IDAI 12 minggu 0 hari (CDC 14 minggu 6 hari tidak dipakai). |
| Rotavirus · merek · RotaTeq (RV5) · interval | 4 minggu | IDAI2023 hal. 74 (interval 4–10 minggu) | ✅ terverifikasi |  |
| Rotavirus · merek · RotaTeq (RV5) · intervalMaks | 10 minggu | IDAI2023 hal. 74 | ⚠️ perlu verifikasi | Bila jarak >10 minggu: cek manual (tidak ada aturan lanjutan di sumber). |
| Rotavirus · merek · RotaTeq (RV5) · maksUsiaSeri | usia: 224 hari; termasuk: true | IDAI2023 hal. 74 (dosis ketiga paling lambat 32 minggu) | ⚠️ perlu verifikasi | CDC: maks 8 bulan 0 hari. Dipakai 32 minggu 0 hari. Label RotaTeq belum dibaca. |
| Rotavirus · merek · RV program (Kemenkes) · jumlahDosis | 3 | KMK1098 hal. 7 & 13 | ✅ terverifikasi |  |
| Rotavirus · merek · RV program (Kemenkes) · minUsiaDosis1 | 2 bulan | KMK1098 hal. 7 (jadwal 2, 3, 4 bulan) | ⚠️ perlu verifikasi | Usia minimal dosis 1 produk program tidak tertulis; dipakai jadwal 2 bulan. |
| Rotavirus · merek · RV program (Kemenkes) · maksUsiaDosis1 | — | Tidak tertulis di KMK1098/IDAI2023 | ⚠️ perlu verifikasi | Alat hanya memberi BOLEH bila 3 dosis masih bisa selesai sebelum batas seri. |
| Rotavirus · merek · RV program (Kemenkes) · interval | 4 minggu | KMK1098 hal. 13; IDAI2023 hal. 67 | ✅ terverifikasi |  |
| Rotavirus · merek · RV program (Kemenkes) · maksUsiaSeri | usia: 6 bulan; termasuk: false | IDAI2023 hal. 67 (dosis terakhir usia 6 bulan) | ⚠️ perlu verifikasi | KMK1098 hal. 13 kejar: sampai sebelum usia 7 bulan. Dipakai sebelum 6 bulan (ketat). |
| Rotavirus · kontraindikasi | intususepsi, malformasi saluran cerna belum dikoreksi, SCID | ROTARIX 4.3; CDC2025 Appendix | ✅ terverifikasi |  |
| Rotavirus · tidakBisaDikejar | true | IDAI2023 hal. 67 (pembatasan usia karena risiko intususepsi) | ✅ terverifikasi |  |
| Influenza · minUsia | 6 bulan | IDAI2023 hal. 67 & 74 | ✅ terverifikasi |  |
| Influenza · duaDosisSampaiUsia | 9 tahun | IDAI2023 hal. 67 & 74 (pertama kali usia 6 bulan–8 tahun: 2 dosis) | ✅ terverifikasi |  |
| Influenza · interval | 4 minggu | IDAI2023 hal. 67 & 74 | ✅ terverifikasi |  |
| Influenza · ulangan | 12 bulan | IDAI2023 hal. 67 & 74 (setiap tahun pada bulan yang sama) | ✅ terverifikasi |  |
| MR / MMR · minUsiaDosis1 | 9 bulan | KMK1098 hal. 7; IDAI2023 hal. 68 & 74 | ✅ terverifikasi |  |
| MR / MMR · minUsiaDosis2 | 18 bulan | KMK1098 hal. 8 (MR 18 bulan) | ⚠️ perlu verifikasi | IDAI: dosis 2 usia 15–18 bulan. Dipakai 18 bulan. |
| MR / MMR · interval | 6 bulan | KMK1098 hal. 12 (kejar MR interval 6 bulan) | ⚠️ perlu verifikasi | CDC: 4 minggu. Dipakai 6 bulan. |
| MR / MMR · minUsiaDosis3 | 7 tahun | KMK1098 hal. 8 (BIAS kelas 1, 7 tahun) | ⚠️ perlu verifikasi | IDAI: dosis 3 usia 5–7 tahun. Dipakai 7 tahun. |
| MR / MMR · mmrMulai | 12 bulan | IDAI2023 hal. 68 & 74 (belum MR sampai 12 bulan: boleh MMR) | ✅ terverifikasi |  |
| Japanese encephalitis (JE) · minUsia | 10 bulan | KMK1098 hal. 7 (10 bulan, daerah tertentu) | ⚠️ perlu verifikasi | IDAI: mulai 9 bulan. Dipakai 10 bulan. |
| Japanese encephalitis (JE) · booster | 1 tahun | IDAI2023 hal. 68 & 74 (penguat 1–2 tahun kemudian, daerah endemis) | ⚠️ perlu verifikasi | KMK: 1 dosis saja. |
| Varisela · minUsia | 12 bulan | IDAI2023 hal. 68 & 74; CDC2025 | ✅ terverifikasi |  |
| Varisela · interval | 3 bulan | IDAI2023 hal. 68 & 74 (6 minggu–3 bulan); CDC_GBP (3 bulan, <13 tahun) | ⚠️ perlu verifikasi | Dipakai 3 bulan (ketat). |
| Hepatitis A · minUsia | 12 bulan | IDAI2023 hal. 68 & 74 | ✅ terverifikasi |  |
| Hepatitis A · interval | 6 bulan | IDAI2023 hal. 68 & 74 (interval 6–18 bulan); CDC_GBP | ✅ terverifikasi |  |
| Tifoid polisakarida · minUsia | 2 tahun | IDAI2023 hal. 68 & 74 | ✅ terverifikasi |  |
| Tifoid polisakarida · ulangan | 3 tahun | IDAI2023 hal. 68 & 74 | ✅ terverifikasi |  |

## Aturan umum

| Vaksin / aturan | Batas / nilai | Sumber | Status | Catatan |
|---|---|---|---|---|
| graceDays | 0 | Permintaan dokter (default tanpa masa toleransi) | ✅ terverifikasi | CDC_GBP: dosis ≤4 hari sebelum batas masih sah (grace period). Dipakai 0 hari sampai dokter memutuskan. |
| demamAtauSakitSedangBerat | tunda | CDC2025 Appendix (sakit akut sedang–berat ± demam = perhatian, tunda) | ⚠️ perlu verifikasi | Demam saja tanpa sakit sedang–berat tidak disebut CDC sebagai alasan tunda; dipakai tunda semua sesuai permintaan dokter. |
| steroidDosisTinggi | mgPerKgHari: 2; mgPerHari: 20; mgPerHariBilaBBdiAtasKg: 10; lamaHari: 14; tundaVaksinHidup: 1 bulan | CDC_GBP Altered Immunocompetence (kortikosteroid) | ✅ terverifikasi | ≥2 mg/kg/hari atau ≥20 mg/hari (BB >10 kg) prednison ≥14 hari → vaksin hidup ditunda ≥1 bulan setelah berhenti. |
| vaksinHidupSuntikBedaHari | 4 minggu | CDC_GBP Timing & Spacing | ✅ terverifikasi | Dua vaksin hidup suntik yang tidak diberikan di hari yang sama harus berjarak ≥4 minggu; bila kurang, dosis kedua diulang. |
| produkDarahIVIG | 11 bulan | CDC2025 Appendix (MMR, varisela: produk berisi antibodi ≤11 bulan) | ✅ terverifikasi | Interval 3–11 bulan tergantung produk & dosis; alat ini menandai PERLU CEK bila ≤11 bulan. |
| imunodefisiensiBerat | tidak boleh vaksin hidup | CDC2025 Appendix; IDAI2023 hal. 65 (BCG) | ✅ terverifikasi | Termasuk kemoterapi & imunosupresi jangka panjang. |
| anafilaksis | tidak boleh vaksin tsb | CDC2025 Appendix (reaksi alergi berat setelah dosis sebelumnya/komponen) | ✅ terverifikasi |  |
| riwayatDariIngatan | perlu cek | Permintaan dokter (data tidak lengkap → PERLU CEK) | ⚠️ perlu verifikasi | Dosis yang hanya dari ingatan orang tua tidak dihitung otomatis. |
| prematur | usia kronologis | Permintaan dokter; IDAI2023 hal. 64–65 (HB <2000 g, BCG prematur 32–36 mg) | ✅ terverifikasi |  |
| lokasiSuntik | Boleh di daerah sama (jarak 2,5 cm) atau berbeda (paha kanan & kiri, paha & lengan atas). | IDAI2023 hal. 70 (Penutup, suntikan ganda) | ✅ terverifikasi |  |
| pembagianLokasi | bayi <12 bulan: paha; ≥12 bulan: paha/lengan atas | Saran alat (bukan dari sumber) | ⚠️ perlu verifikasi | Urutan paha kiri/kanan hanya saran; dokter menentukan. |
| bersamaan | boleh hari yang sama di lokasi berbeda | IDAI2023 hal. 70 | ✅ terverifikasi |  |
| tuberkulinBerlaku | — | Belum ditemukan di sumber | ⚠️ perlu verifikasi | Masa berlaku hasil uji tuberkulin & batas mm tidak ada di sumber yang dibaca; dokter menilai negatif/positif. |

## Rute (Kepmenkes)

| Vaksin / aturan | Batas / nilai | Sumber | Status | Catatan |
|---|---|---|---|---|
| HB0 | IM 0,5 ml | KMK1098 hal. 7 | ✅ terverifikasi |  |
| BCG | intrakutan 0,05 ml | KMK1098 hal. 7 | ✅ terverifikasi |  |
| OPV | oral 2 tetes | KMK1098 hal. 7 | ✅ terverifikasi |  |
| DTP | IM 0,5 ml | KMK1098 hal. 7 | ✅ terverifikasi |  |
| PCV | IM 0,5 ml | KMK1098 hal. 7 | ✅ terverifikasi |  |
| ROTA | oral | KMK1098 hal. 7 (program: 5 tetes) | ✅ terverifikasi |  |
| IPV | IM 0,5 ml | KMK1098 hal. 7 | ✅ terverifikasi |  |
| MR | SC 0,5 ml | KMK1098 hal. 7 | ✅ terverifikasi |  |
| JE | IM 0,5 ml (KMK) / SC (IDAI) | KMK1098 hal. 7; IDAI2023 hal. 68 | ⚠️ perlu verifikasi | Rute JE berbeda antar sumber (ikuti label produk). |
| INFLUENZA | IM | IDAI2023 hal. 74 catatan influenza | ✅ terverifikasi |  |
| VARISELA | SC | IDAI2023 hal. 74 catatan varisela | ✅ terverifikasi |  |
| HEPA | IM | IDAI2023 hal. 74 catatan hepatitis A | ✅ terverifikasi |  |
| TIFOID | IM | IDAI2023 hal. 74 catatan tifoid | ✅ terverifikasi |  |

## Catatan

| Vaksin / aturan | Batas / nilai | Sumber | Status | Catatan |
|---|---|---|---|---|
| RSV | Profilaksis RSV hanya catatan; tidak dinilai alat. | Permintaan dokter | ⚠️ perlu verifikasi |  |
| penyakitKronis | Penyakit paru/jantung/ginjal kronis: influenza dianjurkan; >5 tahun risiko tinggi pertimbangkan 1 dosis PCV13. | IDAI2023 hal. 66 & 67 | ✅ terverifikasi |  |
