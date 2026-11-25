// ============================================================================
// AUTO KLINIK — CEK VAKSIN: SEMUA ATURAN KLINIS ADA DI FILE INI SAJA.
// ----------------------------------------------------------------------------
// Mesin penilai (vaksin-engine.js) tidak boleh berisi angka klinis sendiri.
// Setiap aturan punya:
//   nilai               angka/batas yang dipakai mesin
//   sumber              dokumen + halaman/bagian (lihat SUMBER di bawah)
//   tanggal_verifikasi  tanggal angka dicocokkan dengan dokumen sumber
//   status_verifikasi   "terverifikasi" | "perlu verifikasi"  (⚠️ di layar)
//   catatan             penjelasan singkat / beda sumber
// Bila sumber berbeda: nilai = yang PALING KETAT sampai dokter memutuskan
// (lihat docs/vaksin/perbedaan-sumber.md). Satuan durasi: "N hari|minggu|bulan|tahun".
// Bulan & tahun dihitung menurut kalender (tanggal sama di bulan berikutnya).
// Batas maksimal ditulis { usia, termasuk }: termasuk=true → usia itu masih boleh;
// termasuk=false → harus SEBELUM usia itu.
// ============================================================================
const VAKSIN_RULES = (() => {
  const TGL = "2026-11-25";
  const T = (nilai, sumber, catatan = "") => ({ nilai, sumber, tanggal_verifikasi: TGL, status_verifikasi: "terverifikasi", catatan });
  const P = (nilai, sumber, catatan = "") => ({ nilai, sumber, tanggal_verifikasi: TGL, status_verifikasi: "perlu verifikasi", catatan });

  const SUMBER = {
    IDAI2023: "Jadwal Imunisasi Anak 0–18 Tahun Rekomendasi IDAI 2023 (Sitaresmi dkk, Sari Pediatri 25(1):64–74, Juni 2023)",
    KMK1098: "Kepmenkes HK.01.07/MENKES/1098/2024 tentang Jenis dan Jadwal Imunisasi (lampiran); diubah Kepmenkes 35/2025 hanya untuk HPV",
    CDC2025: "CDC/ACIP Child and Adolescent Immunization Schedule 2025 (Table 2 catch-up + Appendix kontraindikasi)",
    CDC_GBP: "CDC/ACIP General Best Practice Guidelines for Immunization (Timing & Spacing; Altered Immunocompetence)",
    ROTARIX: "Rotarix — Summary of Product Characteristics (EMA), bagian 4.2 dan 4.3",
    ROTATEQ: "RotaTeq — label produk (belum berhasil diunduh, 2026-11-25)",
  };

  return {
    versi: TGL,
    SUMBER,
    cakupan: {
      usiaMaks: T("7 tahun", "Permintaan dokter (versi 1: usia 0–6 tahun)", "Usia ≥7 tahun: di luar cakupan alat, cek manual."),
    },

    umum: {
      graceDays: T(0, "Permintaan dokter (default tanpa masa toleransi)", "CDC_GBP: dosis ≤4 hari sebelum batas masih sah (grace period). Dipakai 0 hari sampai dokter memutuskan."),
      demamAtauSakitSedangBerat: P("tunda", "CDC2025 Appendix (sakit akut sedang–berat ± demam = perhatian, tunda)", "Demam saja tanpa sakit sedang–berat tidak disebut CDC sebagai alasan tunda; dipakai tunda semua sesuai permintaan dokter."),
      steroidDosisTinggi: T({ mgPerKgHari: 2, mgPerHari: 20, mgPerHariBilaBBdiAtasKg: 10, lamaHari: 14, tundaVaksinHidup: "1 bulan" }, "CDC_GBP Altered Immunocompetence (kortikosteroid)", "≥2 mg/kg/hari atau ≥20 mg/hari (BB >10 kg) prednison ≥14 hari → vaksin hidup ditunda ≥1 bulan setelah berhenti."),
      vaksinHidupSuntikBedaHari: T("4 minggu", "CDC_GBP Timing & Spacing", "Dua vaksin hidup suntik yang tidak diberikan di hari yang sama harus berjarak ≥4 minggu; bila kurang, dosis kedua diulang."),
      produkDarahIVIG: T("11 bulan", "CDC2025 Appendix (MMR, varisela: produk berisi antibodi ≤11 bulan)", "Interval 3–11 bulan tergantung produk & dosis; alat ini menandai PERLU CEK bila ≤11 bulan."),
      imunodefisiensiBerat: T("tidak boleh vaksin hidup", "CDC2025 Appendix; IDAI2023 hal. 65 (BCG)", "Termasuk kemoterapi & imunosupresi jangka panjang."),
      anafilaksis: T("tidak boleh vaksin tsb", "CDC2025 Appendix (reaksi alergi berat setelah dosis sebelumnya/komponen)"),
      riwayatDariIngatan: P("perlu cek", "Permintaan dokter (data tidak lengkap → PERLU CEK)", "Dosis yang hanya dari ingatan orang tua tidak dihitung otomatis."),
      prematur: T("usia kronologis", "Permintaan dokter; IDAI2023 hal. 64–65 (HB <2000 g, BCG prematur 32–36 mg)"),
      lokasiSuntik: T("Boleh di daerah sama (jarak 2,5 cm) atau berbeda (paha kanan & kiri, paha & lengan atas).", "IDAI2023 hal. 70 (Penutup, suntikan ganda)"),
      pembagianLokasi: P("bayi <12 bulan: paha; ≥12 bulan: paha/lengan atas", "Saran alat (bukan dari sumber)", "Urutan paha kiri/kanan hanya saran; dokter menentukan."),
      bersamaan: T("boleh hari yang sama di lokasi berbeda", "IDAI2023 hal. 70"),
      tuberkulinBerlaku: P(null, "Belum ditemukan di sumber", "Masa berlaku hasil uji tuberkulin & batas mm tidak ada di sumber yang dibaca; dokter menilai negatif/positif."),
    },

    // Rute pemberian (KMK1098 hal. 7–8 kolom "Dosis dan Cara Pemberian").
    rute: {
      HB0: T("IM 0,5 ml", "KMK1098 hal. 7"),
      BCG: T("intrakutan 0,05 ml", "KMK1098 hal. 7"),
      OPV: T("oral 2 tetes", "KMK1098 hal. 7"),
      DTP: T("IM 0,5 ml", "KMK1098 hal. 7"),
      PCV: T("IM 0,5 ml", "KMK1098 hal. 7"),
      ROTA: T("oral", "KMK1098 hal. 7 (program: 5 tetes)"),
      IPV: T("IM 0,5 ml", "KMK1098 hal. 7"),
      MR: T("SC 0,5 ml", "KMK1098 hal. 7"),
      JE: P("IM 0,5 ml (KMK) / SC (IDAI)", "KMK1098 hal. 7; IDAI2023 hal. 68", "Rute JE berbeda antar sumber (ikuti label produk)."),
      INFLUENZA: T("IM", "IDAI2023 hal. 74 catatan influenza"),
      VARISELA: T("SC", "IDAI2023 hal. 74 catatan varisela"),
      HEPA: T("IM", "IDAI2023 hal. 74 catatan hepatitis A"),
      TIFOID: T("IM", "IDAI2023 hal. 74 catatan tifoid"),
    },

    vaksin: {
      HB0: {
        nama: "Hepatitis B lahir (HB0)",
        hidup: false,
        batasLahir: T("1 hari", "KMK1098 hal. 7; IDAI2023 hal. 64", "HB0 diberikan <24 jam. Alat hanya tahu tanggal: usia 0 hari = boleh; usia 1 hari = cek jam lahir."),
        bilaTerlewat: T("lanjut lewat DTP-HB-Hib", "IDAI2023 hal. 64 (imunisasi selanjutnya bersama DTwP/DTaP)"),
        bblKurang2000: T({ bbGram: 2000, tundaSampai: "1 bulan" }, "IDAI2023 hal. 64 & 73", "BBL <2000 g: tunda sampai usia 1 bulan/saat pulang kecuali ibu HBsAg+; dosis lahir tidak dihitung, total 4 dosis."),
        ibuHBsAg: T("HB0 + HBIg <24 jam (HBIg masih boleh sampai 7 hari)", "IDAI2023 hal. 64 & 73", "Angka 7 hari adalah untuk HBIg, bukan HB0."),
      },
      BCG: {
        nama: "BCG",
        hidup: true,
        ideal: T("1 bulan", "IDAI2023 hal. 64 (sebelum 1 bulan); KMK1098 hal. 7 (usia 1 bulan)"),
        tanpaUjiSampai: T("3 bulan", "IDAI2023 hal. 65 & 74", "Usia ≥3 bulan: BCG bila uji tuberkulin negatif; bila uji tidak tersedia BCG tetap diberikan, pantau reaksi lokal cepat minggu pertama."),
        batasKejarProgram: P("12 bulan", "KMK1098 hal. 11 (kejar: paling lambat usia 11 bulan / <1 tahun)", "IDAI tidak memberi batas atas untuk bayi; usia ≥12 bulan ditandai PERLU CEK."),
        prematur: T({ usiaGestasiMinMinggu: 32 }, "IDAI2023 hal. 65", "Bayi prematur sehat 32–36 minggu boleh BCG; <32 minggu tidak disebut → cek manual."),
        kontakTB: T("tunda sampai terbukti tidak terinfeksi", "IDAI2023 hal. 65 & 74 (bayi dari ibu TB aktif)", "Beri terapi pencegahan TB."),
      },
      OPV: {
        nama: "Polio tetes (bOPV)",
        hidup: true,
        jumlahDosis: T(4, "KMK1098 hal. 7 & 11; IDAI2023 hal. 74"),
        usiaIdealBulan: T([1, 2, 3, 4], "KMK1098 hal. 7 (0–1, 2, 3, 4 bulan)", "Angka = bulan terakhir jadwal; terlambat bila usia ≥ angka + 1 bulan (IDAI2023 hal. 73: kolom 2 = 2 bulan s.d. 2 bulan 29 hari)."),
        minUsiaDosis1: T("0 hari", "KMK1098 hal. 7"),
        interval: T("4 minggu", "KMK1098 hal. 11 (kejar OPV)"),
        imunodefisiensi: T("pakai IPV", "Permintaan dokter; CDC2025 Appendix (vaksin hidup)"),
        boosterUsia18bulan: P(null, "Ringkasan IDAI 2024 (sekunder); tidak ada di IDAI 2023 & KMK1098", "Tidak dijadwalkan otomatis."),
      },
      IPV: {
        nama: "Polio suntik (IPV)",
        hidup: false,
        jumlahDosis: T(2, "KMK1098 hal. 7 & 11; IDAI2023 hal. 74 (minimal 2x IPV)"),
        usiaIdealBulan: T([4, 9], "KMK1098 hal. 7"),
        minUsiaDosis1: P("4 bulan", "KMK1098 hal. 7 (jadwal 4 bulan)", "CDC: usia minimal 6 minggu. Dipakai 4 bulan (lebih ketat)."),
        interval: P("4 bulan", "KMK1098 hal. 11 (kejar IPV interval 4 bulan)", "CDC: 4 minggu. Dipakai 4 bulan."),
        batasKejar: T("5 tahun", "KMK1098 hal. 11 (kejar IPV bayi & balita; anak sekolah: –)"),
      },
      DTP: {
        nama: "DTP-HB-Hib",
        hidup: false,
        minUsiaDosis1: T("6 minggu", "IDAI2023 hal. 74 (DTP mulai 6 minggu); CDC2025"),
        usiaIdealBulan: T([2, 3, 4, 18], "KMK1098 hal. 7–8"),
        intervalBayi: T("4 minggu", "KMK1098 hal. 11–12 (kejar bayi: 3 dosis interval 4 minggu)"),
        boosterMinUsia: T("18 bulan", "KMK1098 hal. 8; IDAI2023 hal. 66"),
        boosterInterval: P("12 bulan", "KMK1098 hal. 12 (dosis 3→4 = 12 bulan)", "IDAI: booster 1 tahun setelah dosis 3 (anak >1 th); CDC: 6 bulan. Dipakai 12 bulan."),
        balitaMulaiUsia: T("12 bulan", "KMK1098 hal. 11–12 (balita 12–59 bulan: 4 dosis)"),
        intervalBalita: T(["1 bulan", "6 bulan", "12 bulan"], "KMK1098 hal. 11–12; IDAI2023 hal. 66", "IDAI: dosis 1→2 ≥4 minggu, 2→3 ≥6 bulan, booster 1 tahun setelah dosis 3."),
        batasKejar: T("5 tahun", "KMK1098 hal. 11–12 (balita s.d. 59 bulan; anak sekolah: –, lanjut DT/Td BIAS)"),
        ensefalopati7hari: T("tidak boleh komponen pertusis", "CDC2025 Appendix (DTaP)", "DT tanpa pertusis: cek manual."),
        neurologiProgresif: T("tunda sampai stabil", "CDC2025 Appendix (DTaP, perhatian)"),
      },
      PCV: {
        nama: "PCV (pneumokokus)",
        hidup: false,
        minUsiaDosis1: T("6 minggu", "IDAI2023 hal. 66 (usia 6 minggu–5 tahun); CDC2025"),
        programJadwal: T([2, 3, 12], "KMK1098 hal. 7–8; IDAI2023 hal. 66"),
        idaiJadwal: T([2, 4, 6, 12], "IDAI2023 hal. 74 (2, 4, 6 + booster 12–15 bulan)"),
        intervalPrimer: T("4 minggu", "KMK1098 hal. 12–13 (kejar bayi dosis 1→2: 4 minggu)"),
        intervalMulai7sd12: P("1 bulan", "IDAI2023 hal. 66 & 74", "KMK: 4 minggu. Dipakai 1 bulan."),
        boosterMinUsia: T("12 bulan", "KMK1098 hal. 8 & 12–13; IDAI2023 hal. 66"),
        boosterInterval: P("2 bulan", "IDAI2023 hal. 66 & 74", "KMK: 8 minggu. Dipakai 2 bulan."),
        mulai12sd24: P({ dosis: 2, interval: "2 bulan" }, "IDAI2023 hal. 66 & 74; KMK1098 hal. 12–13", "KMK: interval 8 minggu, kelompok 12–24 bulan. Dipakai 2 bulan."),
        mulai24sd59: P({ PCV13: 1, PCV15: 1, PCV10: 2, tidakTahu: 2, interval: "2 bulan" }, "IDAI2023 hal. 66 & 74 (PCV10 2 dosis, PCV13 1 dosis); KMK1098 hal. 12–13 (>24–59 bulan: 1 dosis)", "PCV15 tidak disebut IDAI/KMK; dianggap seperti PCV13 hanya bila dokter memilih. Merek tidak dipilih: 2 dosis (ketat)."),
        batasUsia: T("5 tahun", "IDAI2023 hal. 66 & 74", ">5 tahun hanya risiko tinggi: 1 dosis PCV13 (cek manual)."),
      },
      ROTA: {
        nama: "Rotavirus",
        hidup: true,
        merek: {
          ROTARIX: {
            label: "Rotarix (RV1)",
            jumlahDosis: T(2, "IDAI2023 hal. 66–67 & 74; ROTARIX 4.2"),
            minUsiaDosis1: T("6 minggu", "IDAI2023 hal. 74; ROTARIX 4.2"),
            maksUsiaDosis1: P({ usia: "84 hari", termasuk: true }, "IDAI2023 hal. 74 (dosis pertama 6–12 minggu)", "CDC: maks 14 minggu 6 hari (104 hari). EMA: tidak ada batas dosis 1, seri selesai ≤24 minggu. Dipakai 12 minggu 0 hari (ketat)."),
            interval: T("4 minggu", "IDAI2023 hal. 74; ROTARIX 4.2"),
            maksUsiaSeri: P({ usia: "168 hari", termasuk: true }, "IDAI2023 hal. 74 (paling lambat 24 minggu); ROTARIX 4.2 (harus selesai sebelum 24 minggu)", "CDC: dosis terakhir maks 8 bulan 0 hari. Dipakai 24 minggu 0 hari."),
          },
          ROTATEQ: {
            label: "RotaTeq (RV5)",
            jumlahDosis: T(3, "IDAI2023 hal. 74"),
            minUsiaDosis1: T("6 minggu", "IDAI2023 hal. 74"),
            maksUsiaDosis1: P({ usia: "84 hari", termasuk: true }, "IDAI2023 hal. 74 (dosis pertama 6–12 minggu)", "CDC: maks 14 minggu 6 hari. Dipakai 12 minggu 0 hari."),
            interval: T("4 minggu", "IDAI2023 hal. 74 (interval 4–10 minggu)"),
            intervalMaks: P("10 minggu", "IDAI2023 hal. 74", "Bila jarak >10 minggu: cek manual (tidak ada aturan lanjutan di sumber)."),
            maksUsiaSeri: P({ usia: "224 hari", termasuk: true }, "IDAI2023 hal. 74 (dosis ketiga paling lambat 32 minggu)", "CDC: maks 8 bulan 0 hari. Dipakai 32 minggu 0 hari. Label RotaTeq belum dibaca."),
          },
          PROGRAM: {
            label: "RV program (Kemenkes)",
            jumlahDosis: T(3, "KMK1098 hal. 7 & 13"),
            minUsiaDosis1: P("2 bulan", "KMK1098 hal. 7 (jadwal 2, 3, 4 bulan)", "Usia minimal dosis 1 produk program tidak tertulis; dipakai jadwal 2 bulan."),
            maksUsiaDosis1: P(null, "Tidak tertulis di KMK1098/IDAI2023", "Alat hanya memberi BOLEH bila 3 dosis masih bisa selesai sebelum batas seri."),
            interval: T("4 minggu", "KMK1098 hal. 13; IDAI2023 hal. 67"),
            maksUsiaSeri: P({ usia: "6 bulan", termasuk: false }, "IDAI2023 hal. 67 (dosis terakhir usia 6 bulan)", "KMK1098 hal. 13 kejar: sampai sebelum usia 7 bulan. Dipakai sebelum 6 bulan (ketat)."),
          },
        },
        kontraindikasi: T(["intususepsi", "malformasi saluran cerna belum dikoreksi", "SCID"], "ROTARIX 4.3; CDC2025 Appendix"),
        tidakBisaDikejar: T(true, "IDAI2023 hal. 67 (pembatasan usia karena risiko intususepsi)"),
      },
      INFLUENZA: {
        nama: "Influenza",
        hidup: false,
        minUsia: T("6 bulan", "IDAI2023 hal. 67 & 74"),
        duaDosisSampaiUsia: T("9 tahun", "IDAI2023 hal. 67 & 74 (pertama kali usia 6 bulan–8 tahun: 2 dosis)"),
        interval: T("4 minggu", "IDAI2023 hal. 67 & 74"),
        ulangan: T("12 bulan", "IDAI2023 hal. 67 & 74 (setiap tahun pada bulan yang sama)"),
      },
      MR: {
        nama: "MR / MMR",
        hidup: true,
        minUsiaDosis1: T("9 bulan", "KMK1098 hal. 7; IDAI2023 hal. 68 & 74"),
        minUsiaDosis2: P("18 bulan", "KMK1098 hal. 8 (MR 18 bulan)", "IDAI: dosis 2 usia 15–18 bulan. Dipakai 18 bulan."),
        interval: P("6 bulan", "KMK1098 hal. 12 (kejar MR interval 6 bulan)", "CDC: 4 minggu. Dipakai 6 bulan."),
        minUsiaDosis3: P("7 tahun", "KMK1098 hal. 8 (BIAS kelas 1, 7 tahun)", "IDAI: dosis 3 usia 5–7 tahun. Dipakai 7 tahun."),
        mmrMulai: T("12 bulan", "IDAI2023 hal. 68 & 74 (belum MR sampai 12 bulan: boleh MMR)"),
      },
      JE: {
        nama: "Japanese encephalitis (JE)",
        hidup: true,
        minUsia: P("10 bulan", "KMK1098 hal. 7 (10 bulan, daerah tertentu)", "IDAI: mulai 9 bulan. Dipakai 10 bulan."),
        booster: P("1 tahun", "IDAI2023 hal. 68 & 74 (penguat 1–2 tahun kemudian, daerah endemis)", "KMK: 1 dosis saja."),
      },
      VARISELA: {
        nama: "Varisela",
        hidup: true,
        minUsia: T("12 bulan", "IDAI2023 hal. 68 & 74; CDC2025"),
        interval: P("3 bulan", "IDAI2023 hal. 68 & 74 (6 minggu–3 bulan); CDC_GBP (3 bulan, <13 tahun)", "Dipakai 3 bulan (ketat)."),
      },
      HEPA: {
        nama: "Hepatitis A",
        hidup: false,
        minUsia: T("12 bulan", "IDAI2023 hal. 68 & 74"),
        interval: T("6 bulan", "IDAI2023 hal. 68 & 74 (interval 6–18 bulan); CDC_GBP"),
      },
      TIFOID: {
        nama: "Tifoid polisakarida",
        hidup: false,
        minUsia: T("2 tahun", "IDAI2023 hal. 68 & 74"),
        ulangan: T("3 tahun", "IDAI2023 hal. 68 & 74"),
      },
    },

    catatan: {
      RSV: P("Profilaksis RSV hanya catatan; tidak dinilai alat.", "Permintaan dokter"),
      penyakitKronis: T("Penyakit paru/jantung/ginjal kronis: influenza dianjurkan; >5 tahun risiko tinggi pertimbangkan 1 dosis PCV13.", "IDAI2023 hal. 66 & 67"),
    },
  };
})();

if (typeof module === "object" && module && module.exports) module.exports = VAKSIN_RULES;
