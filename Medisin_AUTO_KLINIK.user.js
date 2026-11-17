// ==UserScript==
// @name         Medisin - AUTO KLINIK
// @namespace    medisin-auto-klinik
// @version      0.2.1
// @description  AUTO KLINIK untuk app.medisin.id — RESUME + DIAGNOSIS + RESEP, Resume, Paket Resep Golongan. Hanya mengisi; tidak pernah menekan SIMPAN/SUBMIT.
// @author       taufanmtknight-debug
// @match        https://app.medisin.id/*
// @run-at       document-start
// @noframes
// @inject-into  page
// @grant        GM_addStyle
// @homepageURL  https://github.com/taufanmtknight-debug/medisin-auto-klinik
// @updateURL    https://raw.githubusercontent.com/taufanmtknight-debug/medisin-auto-klinik/claude/project-thread-cg0a4l/Medisin_AUTO_KLINIK.user.js
// @downloadURL  https://raw.githubusercontent.com/taufanmtknight-debug/medisin-auto-klinik/claude/project-thread-cg0a4l/Medisin_AUTO_KLINIK.user.js
// ==/UserScript==

// PENTING: @name dan @namespace JANGAN diubah setelah script dipasang. Violentmonkey
// mengenali script dari pasangan keduanya; bila berubah, script dianggap baru.
// @inject-into HARUS "page": script membaca state Vue milik halaman Medisin.
//
// Aturan tetap: script hanya MENGISI. Tidak pernah menekan/memanggil SIMPAN, SUBMIT,
// SUBMIT BPJS, SUBMIT SATUSEHAT, PROSES KASIR. Isian dokter tidak ditimpa.
//
// Susunan file:
//   1. KONFIGURASI & DATA     — master obat, template resep/racikan, Paket Golongan
//   2. JEMBATAN MEDISIN       — akses Vue 2 / Vuex, pasien aktif
//   3. FORM PELAYANAN         — kesadaran, prognosa, status pulang, anamnesa, diagnosa
//   4. RESEP & RACIKAN        — pemetaan nama obat, isi resep & racikan
//   5. DATA PASIEN            — umur, BB, TTV, keluhan (dari store Medisin)
//   6. PAKET RESEP GOLONGAN   — audit, resolver, preview, eksekusi, picker
//   7. MENU                   — RESUME, RESUME + DIAGNOSIS + RESEP
//   8. UI & BOOT              — notifikasi, kunci proses, launcher, CSS


(function () {
  "use strict";

  // Versi diambil dari header (GM_info) agar label launcher tidak pernah beda
  // dengan @version. Nilai cadangan WAJIB sama dengan @version (dicek oleh test).
  const SCRIPT_VERSION_FALLBACK = "0.2.1";
  const VERSION =
    (typeof GM_info !== "undefined" && GM_info?.script?.version) ||
    SCRIPT_VERSION_FALLBACK;

  // Violentmonkey/Chrome compatibility: keep styling functional even if
  // GM_addStyle is unavailable in the selected injection context.
  const addStyle =
    typeof GM_addStyle === "function"
      ? GM_addStyle
      : (css) => {
          const style = document.createElement("style");
          style.textContent = css;
          (document.head || document.documentElement).appendChild(style);
        };

  // ============================================================
  // 1. KONFIGURASI & DATA
  // ============================================================

  // MASTER ITEM DATABASE - NAMA TARGET KLINIK PINTAR
  // Keyword sengaja sama dengan nama target agar pencarian spesifik.
  // Semua resep/racikan WAJIB merujuk ke key di sini (diaudit otomatis).
  const ITEMS = {
    ZINC_20: { keyword: "BPJS -- ZINC 20 MG", target: "BPJS -- ZINC 20 MG", unit: "tablet" },
    ORALIT: { keyword: "BPJS -- ORALIT", target: "BPJS -- ORALIT", unit: "sachet" },
    AKITA: { keyword: "BPJS -- AKITA", target: "BPJS -- AKITA", unit: "tablet" },
    LODIA: { keyword: "BPJS -- LODIA", target: "BPJS -- LODIA", unit: "tablet" },
    BETAMETHASONE_SALEP: {
      keyword: "BPJS -- BETAMETHASONE 5GR SALEP",
      target: "BPJS -- BETAMETHASONE 5GR SALEP",
      unit: "tube",
      usageUnit: "OLES",
    },
    GENTAMICIN_SALEP: {
      keyword: "BPJS -- GENTAMICIN CR 5GR",
      target: "BPJS -- GENTAMICIN CR 5GR",
      unit: "tube",
      usageUnit: "OLES",
    },
    POT_PLASTIK: { keyword: "BPJS -- POT PLASTIK 30 CC", target: "BPJS -- POT PLASTIK 30 CC", unit: "pcs" },
    CETIRIZINE_10: { keyword: "BPJS -- CETIRIZINE HCL 10 MG", target: "BPJS -- CETIRIZINE HCL 10 MG", unit: "tablet" },
    ANTASIDA_TABLET: { keyword: "BPJS -- ANTASIDA DOEN TABLET", target: "BPJS -- ANTASIDA DOEN TABLET", unit: "tablet" },
    PARACETAMOL_500: { keyword: "BPJS -- PARACETAMOL 500 MG", target: "BPJS -- PARACETAMOL 500 MG", unit: "tablet" },
    DICLOFENAC_50: { keyword: "BPJS -- NATRIUM DICLOFENAC 50 MG", target: "BPJS -- NATRIUM DICLOFENAC 50 MG", unit: "tablet" },
    DEXAMETHASONE_05: { keyword: "BPJS -- DEXAMETHASONE 0,5 MG", target: "BPJS -- DEXAMETHASONE 0,5 MG", unit: "tablet" },
    CALCIUM_500: { keyword: "BPJS -- CALCIUM 500 MG", target: "BPJS -- CALCIUM 500 MG", unit: "tablet" },
    AMLODIPINE_5: { keyword: "BPJS -- AMLODIPINE 5 MG", target: "BPJS -- AMLODIPINE 5 MG", unit: "tablet" },
    AMLODIPINE_10: { keyword: "BPJS -- AMLODIPINE 10 MG", target: "BPJS -- AMLODIPINE 10 MG", unit: "tablet" },
    CAPTOPRIL_12_5: { keyword: "BPJS -- CAPTOPRIL 12,5 MG", target: "BPJS -- CAPTOPRIL 12,5 MG", unit: "tablet" },
    CAPTOPRIL_25: { keyword: "BPJS -- CAPTOPRIL 25 MG", target: "BPJS -- CAPTOPRIL 25 MG", unit: "tablet" },
    METFORMIN_500: { keyword: "BPJS -- METFORMIN HCL 500 MG", target: "BPJS -- METFORMIN HCL 500 MG", unit: "tablet" },
    GLIMEPIRIDE_1: { keyword: "BPJS -- GLIMEPIRIDE 1 MG", target: "BPJS -- GLIMEPIRIDE 1 MG", unit: "tablet" },
    GLIMEPIRIDE_2: { keyword: "BPJS -- GLIMEPIRIDE 2 MG", target: "BPJS -- GLIMEPIRIDE 2 MG", unit: "tablet" },
    SIMVASTATIN_10: { keyword: "BPJS -- SIMVASTATIN 10 MG", target: "BPJS -- SIMVASTATIN 10 MG", unit: "tablet" },
    ALLOPURINOL_100: { keyword: "BPJS -- ALLOPURINOL 100 MG", target: "BPJS -- ALLOPURINOL 100 MG", unit: "tablet" },

    // Pengecualian strip: item reguler/non-BPJS.
    STRIP_KOLESTEROL: { keyword: "STRIP KOLESTEROL", target: "STRIP KOLESTEROL", unit: "pcs", regularOnly: true },
    STRIP_ASAM_URAT: { keyword: "STRIP ASAM URAT", target: "STRIP ASAM URAT", unit: "pcs", regularOnly: true },

    STRIP_GULA: { keyword: "BPJS -- STRIP GULA DARAH", target: "BPJS -- STRIP GULA DARAH", unit: "pcs" },
    ALKOHOL_SWAB: { keyword: "BPJS -- ALKOHOL SWAB", target: "BPJS -- ALKOHOL SWAB", unit: "pcs" },
    BLOOD_LANCET_26G: { keyword: "BPJS -- BLOOD LANCET 26G", target: "BPJS -- BLOOD LANCET 26G", unit: "pcs" },
    SPUIT_1CC: { keyword: "BPJS -- SPUIT 1 CC", target: "BPJS -- SPUIT 1 CC", unit: "pcs" },
    SPUIT_5CC: { keyword: "BPJS -- SPUIT 5 CC", target: "BPJS -- SPUIT 5 CC", unit: "pcs" },
    HANDSCOON_S: { keyword: "BPJS -- HANDSCOON S", target: "BPJS -- HANDSCOON S", unit: "pcs" },
    VITAMIN_B_COMPLEX: { keyword: "BPJS -- VITAMIN B COMPLEX", target: "BPJS -- VITAMIN B COMPLEX", unit: "tablet" },
    GUAIFENESIN_100: { keyword: "BPJS -- GUAIFENESIN 100 MG", target: "BPJS -- GUAIFENESIN 100 MG", unit: "kaplet" },
    CTM_4: { keyword: "BPJS -- CTM 4 MG", target: "BPJS -- CTM 4 MG", unit: "tablet" },
    ALPARA: { keyword: "BPJS -- ALPARA", target: "BPJS -- ALPARA", unit: "tablet" },
    AMOXICILLIN_500: { keyword: "BPJS -- AMOXICILLIN 500 MG", target: "BPJS -- AMOXICILLIN 500 MG", unit: "tablet" },
    DOMPERIDONE_10: { keyword: "BPJS -- DOMPERIDONE 10 MG", target: "BPJS -- DOMPERIDONE 10 MG", unit: "tablet" },
    DOMPERIDONE_SYRUP: {
      keyword: "BPJS -- DOMPERIDONE 5 MG/5ML SYRUP",
      target: "BPJS -- DOMPERIDONE 5 MG/5ML SYRUP",
      unit: "bottle",
    },
    AMOXICILLIN_SYRUP: {
      keyword: "BPJS -- AMOXICILLIN TRIHYDRATE 125 MG/5ML SYRUP",
      target: "BPJS -- AMOXICILLIN TRIHYDRATE 125 MG/5ML SYRUP",
      unit: "bottle",
    },
    CEFADROXIL_500: {
      keyword: "BPJS -- CEFADROXIL MONOHYDRATE 500 MG",
      target: "BPJS -- CEFADROXIL MONOHYDRATE 500 MG",
      unit: "kapsul",
    },
    CEFADROXIL_SYRUP: {
      keyword: "BPJS -- CEFADROXIL 125 MG/5 ML SYR",
      target: "BPJS -- CEFADROXIL 125 MG/5 ML SYR",
      unit: "bottle",
    },
    RANITIDINE_HCL: { keyword: "BPJS -- RANITIDINE HCL", target: "BPJS -- RANITIDINE HCL", unit: "tablet" },
    AMBROXOL_30: { keyword: "BPJS -- AMBROXOL 30 MG", target: "BPJS -- AMBROXOL 30 MG", unit: "tablet" },
    IBUPROFEN_400: { keyword: "BPJS -- IBUPROFEN 400 MG", target: "BPJS -- IBUPROFEN 400 MG", unit: "tablet" },

    // v10: obat standar FKTP, nama persis sudah dicocokkan dengan daftar "Cari Obat"
    // Klinik Pintar. Obat baru yang belum dicocokkan diberi verify: true (test
    // mencegah rilis selama masih ada).
    // Di Klinik Pintar tertulis tanpa kekuatan ("BPJS -- BETAHISTINE MESILATE" = 6 mg).
    BETAHISTIN_6: { keyword: "BPJS -- BETAHISTINE MESILATE", target: "BPJS -- BETAHISTINE MESILATE", unit: "tablet" },
    OMEPRAZOLE_20: { keyword: "BPJS -- OMEPRAZOLE 20 MG", target: "BPJS -- OMEPRAZOLE 20 MG", unit: "kapsul" },
    ASAM_MEFENAMAT_500: { keyword: "BPJS -- ASAM MEFENAMAT 500 MG", target: "BPJS -- ASAM MEFENAMAT 500 MG", unit: "tablet" },
    METHYLPREDNISOLONE_4: { keyword: "BPJS -- METHYLPREDNISOLONE 4 MG", target: "BPJS -- METHYLPREDNISOLONE 4 MG", unit: "tablet" },
    LORATADINE_10: { keyword: "BPJS -- LORATADINE 10 MG", target: "BPJS -- LORATADINE 10 MG", unit: "tablet" },
    CIPROFLOXACIN_500: { keyword: "BPJS -- CIPROFLOXACIN 500 MG", target: "BPJS -- CIPROFLOXACIN 500 MG", unit: "tablet" },
    METRONIDAZOLE_500: { keyword: "BPJS -- METRONIDAZOLE 500 MG", target: "BPJS -- METRONIDAZOLE 500 MG", unit: "tablet" },
  };

  // Template rekam medis ISPA DEWASA (menu PENYAKIT dan tombol ISPA di Resep Manual).
  // v9: obat memakai format master ITEMS yang sama dengan semua resep lain.
  const TEMPLATE = {
    name: "ISPA DEWASA",
    consciousness: "Compos Mentis",
    diagnosisText:
      "Acute upper respiratory infections of multiple and unspecified sites (Spesialis)",
    diagnosisShort:
      "Acute upper respiratory infections of multiple and unspecified sites",
    prognosis: "Bonam (baik)",
    icd10: "J06",
    service: "BPJS - Dokter Umum Jasa Konsultasi",
    discharge: "Berobat Jalan",
    medicines: [
      { item: "DEXAMETHASONE_05", freq: "3", dose: "1", days: "3", total: "9", instruction: "SETELAH MAKAN" },
      { item: "VITAMIN_B_COMPLEX", freq: "1", dose: "1", days: "5", total: "5", instruction: "SETELAH MAKAN" },
      { item: "ALPARA", freq: "3", dose: "1", days: "3", total: "10", instruction: "SETELAH MAKAN" },
    ],
  };

  // TEMPLATE RESEP NON-RACIKAN
  // Hanya memasukkan regimen/aturan yang diberikan pengguna.
  const RECIPE_TEMPLATES = {
    DIARE_ANAK_KURANG_6_BULAN: {
      title: "DIARE ANAK <6 BULAN",
      medicines: [
        { item: "ZINC_20", freq: "1", dose: "0.5", days: "10", total: "5", instruction: "SETELAH MAKAN" },
        { item: "ORALIT", freq: "1", dose: "1", days: "1", total: "4", instruction: "SETIAP BAB CAIR" },
      ],
    },
    DIARE_ANAK_6_BULAN_PLUS: {
      title: "DIARE ANAK >6 BULAN",
      medicines: [
        { item: "ZINC_20", freq: "1", dose: "1", days: "10", total: "10", instruction: "SETELAH MAKAN" },
        { item: "ORALIT", freq: "1", dose: "1", days: "1", total: "4", instruction: "SETIAP BAB CAIR" },
      ],
    },
    GEA: {
      title: "GEA",
      medicines: [
        { item: "AKITA", freq: "1", dose: "2", days: "5", total: "10", instruction: "TIAP SELESAI BAB CAIR" },
      ],
    },
    DERMATITIS: {
      title: "DERMATITIS",
      medicines: [
        { item: "BETAMETHASONE_SALEP", freq: "2", dose: "1", days: "1", total: "1", instruction: "2 X 1 OLES" },
        { item: "GENTAMICIN_SALEP", freq: "2", dose: "1", days: "1", total: "1", instruction: "2 X 1 OLES" },
        { item: "POT_PLASTIK", freq: "1", dose: "1", days: "1", total: "1", instruction: "1 POT" },
        { item: "CETIRIZINE_10", freq: "1", dose: "1", days: "5", total: "5", instruction: "SESUAI ATURAN PAKAI" },
      ],
    },
    DYSPEPSIA: {
      title: "DYSPEPSIA",
      medicines: [
        { item: "ANTASIDA_TABLET", freq: "3", dose: "1", days: "3", total: "10", instruction: "SEBELUM MAKAN" },
        { item: "PARACETAMOL_500", freq: "3", dose: "1", days: "3", total: "10", instruction: "KP NYERI; DAPAT DIULANG TIAP 4 JAM" },
      ],
    },
    DEMAM_DEWASA: {
      title: "DEMAM DEWASA",
      medicines: [
        { item: "PARACETAMOL_500", freq: "3", dose: "1", days: "3", total: "10", instruction: "JIKA DEMAM ATAU PUSING" },
      ],
    },
    LBP: {
      title: "LBP",
      medicines: [
        { item: "DICLOFENAC_50", freq: "3", dose: "1", days: "3", total: "10", instruction: "KP NYERI" },
        { item: "DEXAMETHASONE_05", freq: "3", dose: "1", days: "3", total: "10", instruction: "SETELAH MAKAN" },
      ],
    },
    OA_GENU: {
      title: "OA GENU",
      medicines: [
        { item: "DICLOFENAC_50", freq: "3", dose: "1", days: "3", total: "10", instruction: "KP NYERI" },
        { item: "DEXAMETHASONE_05", freq: "3", dose: "1", days: "3", total: "10", instruction: "SETELAH MAKAN" },
        { item: "CALCIUM_500", freq: "1", dose: "1", days: "5", total: "5", instruction: "SETELAH MAKAN" },
      ],
    },
    MYALGIA: {
      title: "MYALGIA",
      medicines: [
        { item: "PARACETAMOL_500", freq: "3", dose: "1", days: "3", total: "10", instruction: "KP NYERI" },
        { item: "VITAMIN_B_COMPLEX", freq: "1", dose: "1", days: "5", total: "5", instruction: "SETELAH MAKAN" },
      ],
    },

    // HT: setiap pilihan hanya satu obat, tidak dikombinasikan.
    HT_AMLODIPINE_5: {
      title: "HT - AMLODIPINE 5 MG",
      medicines: [{ item: "AMLODIPINE_5", freq: "1", dose: "1", days: "15", total: "15", instruction: "SESUAI ATURAN PAKAI" }],
    },
    HT_AMLODIPINE_10: {
      title: "HT - AMLODIPINE 10 MG",
      medicines: [{ item: "AMLODIPINE_10", freq: "1", dose: "1", days: "15", total: "15", instruction: "SESUAI ATURAN PAKAI" }],
    },
    HT_CAPTOPRIL_12_5: {
      title: "HT - CAPTOPRIL 12,5 MG",
      medicines: [{ item: "CAPTOPRIL_12_5", freq: "2", dose: "1", days: "15", total: "30", instruction: "SESUAI ATURAN PAKAI" }],
    },
    HT_CAPTOPRIL_25: {
      title: "HT - CAPTOPRIL 25 MG",
      medicines: [{ item: "CAPTOPRIL_25", freq: "2", dose: "1", days: "15", total: "30", instruction: "SESUAI ATURAN PAKAI" }],
    },

    // DM: setiap pilihan hanya satu obat, tidak dikombinasikan.
    DM_METFORMIN: {
      title: "DM - METFORMIN 500 MG",
      medicines: [{ item: "METFORMIN_500", freq: "3", dose: "1", days: "15", total: "45", instruction: "SESUAI ATURAN PAKAI" }],
    },
    DM_GLIMEPIRIDE_1: {
      title: "DM - GLIMEPIRIDE 1 MG",
      medicines: [{ item: "GLIMEPIRIDE_1", freq: "1", dose: "1", days: "15", total: "15", instruction: "SESUAI ATURAN PAKAI" }],
    },
    DM_GLIMEPIRIDE_2: {
      title: "DM - GLIMEPIRIDE 2 MG",
      medicines: [{ item: "GLIMEPIRIDE_2", freq: "1", dose: "1", days: "15", total: "15", instruction: "SESUAI ATURAN PAKAI" }],
    },

    CEK_GULA: {
      title: "CEK GULA DARAH",
      medicines: [
        { item: "STRIP_GULA", freq: "1", dose: "1", days: "1", total: "1", instruction: "1 PEMERIKSAAN" },
        { item: "ALKOHOL_SWAB", freq: "1", dose: "1", days: "1", total: "1", instruction: "1 PCS" },
        { item: "BLOOD_LANCET_26G", freq: "1", dose: "1", days: "1", total: "1", instruction: "1 PCS" },
      ],
    },
    ASAM_URAT: {
      title: "ASAM URAT",
      medicines: [{ item: "ALLOPURINOL_100", freq: "1", dose: "1", days: "10", total: "10", instruction: "SETELAH MAKAN" }],
    },
    KOLESTEROL: {
      title: "KOLESTEROL",
      medicines: [{ item: "SIMVASTATIN_10", freq: "1", dose: "1", days: "10", total: "10", instruction: "MALAM HARI" }],
    },
    CEK_ASAM_URAT: {
      title: "CEK ASAM URAT",
      medicines: [
        { item: "STRIP_ASAM_URAT", freq: "1", dose: "1", days: "1", total: "1", instruction: "1 PEMERIKSAAN" },
        { item: "ALKOHOL_SWAB", freq: "1", dose: "1", days: "1", total: "1", instruction: "1 PCS" },
        { item: "BLOOD_LANCET_26G", freq: "1", dose: "1", days: "1", total: "1", instruction: "1 PCS" },
      ],
    },
    CEK_KOLESTEROL: {
      title: "CEK KOLESTEROL",
      medicines: [
        { item: "STRIP_KOLESTEROL", freq: "1", dose: "1", days: "1", total: "1", instruction: "1 PEMERIKSAAN" },
        { item: "ALKOHOL_SWAB", freq: "1", dose: "1", days: "1", total: "1", instruction: "1 PCS" },
        { item: "BLOOD_LANCET_26G", freq: "1", dose: "1", days: "1", total: "1", instruction: "1 PCS" },
      ],
    },
    IMUNISASI: {
      title: "IMUNISASI",
      medicines: [
        { item: "SPUIT_1CC", freq: "1", dose: "1", days: "1", total: "1", instruction: "1 PCS" },
        { item: "HANDSCOON_S", freq: "1", dose: "2", days: "1", total: "2", instruction: "2 PCS" },
        { item: "ALKOHOL_SWAB", freq: "1", dose: "1", days: "1", total: "1", instruction: "1 PCS" },
      ],
    },
  };

  // ------------------------------------------------------------
  // RENTANG BERAT BADAN (BB)
  // Rentang selalu BERSAMBUNG: rentang pertama [1, step] kg, berikutnya
  // (batas sebelumnya, batas + step] kg. Dosis/jumlah tablet = nomor rentang.
  //   step 5   : 1-5 kg, >5-10 kg, >10-15 kg, ...
  //   step 2,5 : 1-2,5 kg, >2,5-5 kg, >5-7,5 kg, ...
  // v9: sebelumnya rentang berikutnya dimulai dari "batas + 1" (6-10, 11-15)
  // atau "+2,5" (3,5-5) sehingga BB seperti 6, 11, 16 kg atau 3 kg tidak
  // mendapat template sama sekali. Untuk BB yang dulu sudah tercakup,
  // dosis/jumlah tablet TIDAK berubah.
  // ------------------------------------------------------------
  function weightBands(step, maxKg) {
    const bands = [];
    for (let i = 1; i * step <= maxKg + 1e-9; i++) {
      bands.push({ index: i, minKg: i === 1 ? 1 : (i - 1) * step, maxKg: i * step });
    }
    return bands;
  }

  function formatKg(kg) {
    return String(kg).replace(".", ",");
  }

  function bandLabel(band) {
    const min = band.index === 1 ? formatKg(band.minKg) : `>${formatKg(band.minKg)}`;
    return `${min}-${formatKg(band.maxKg)} KG`;
  }

  function bandKey(band) {
    const k = (n) => String(n).replace(".", "_");
    return `${k(band.minKg)}_${k(band.maxKg)}KG`;
  }

  function isWeightInBand(band, weightKg) {
    if (!band || !Number.isFinite(weightKg)) return false;
    return band.index === 1
      ? weightKg >= band.minKg && weightKg <= band.maxKg
      : weightKg > band.minKg && weightKg <= band.maxKg;
  }

  // Syrup anak (non-racikan) berbasis BB. dose = nomor rentang (ml).
  // days/total kosong = sengaja tidak diisi agar dokter menentukan sendiri.
  const CHILD_SYRUP_SERIES = [
    // Domperidone syrup: tiap 5 kg -> +1 ml, 3x sehari sebelum makan, 3 hari, 1 botol.
    { prefix: "MUAL_MUNTAH_SYRUP_ANAK_", title: "MUAL MUNTAH SYRUP", step: 5, maxKg: 50, item: "DOMPERIDONE_SYRUP", freq: "3", days: "3", total: "1", instruction: "SEBELUM MAKAN" },
    // Amoxicillin syrup: tiap 2,5 kg -> +1 ml, 3x sehari setelah makan, 1 botol (v10.0.6).
    { prefix: "ANTIBIOTIK_SYRUP_ANAK_", title: "ANTIBIOTIK SYRUP", step: 2.5, maxKg: 50, item: "AMOXICILLIN_SYRUP", freq: "3", days: "", total: "1", instruction: "SETELAH MAKAN" },
    // Cefadroxil syrup: pola dosis sama dengan Amoxicillin syrup, tetapi 2x sehari.
    { prefix: "CEFADROXIL_SYRUP_ANAK_", title: "CEFADROXIL SYRUP", step: 2.5, maxKg: 50, item: "CEFADROXIL_SYRUP", freq: "2", days: "", total: "1", instruction: "SETELAH MAKAN" },
  ];

  for (const s of CHILD_SYRUP_SERIES) {
    for (const band of weightBands(s.step, s.maxKg)) {
      RECIPE_TEMPLATES[s.prefix + bandKey(band)] = {
        title: `${s.title} ${bandLabel(band)}`,
        band,
        medicines: [
          { item: s.item, freq: s.freq, dose: String(band.index), days: s.days, total: s.total, instruction: s.instruction },
        ],
      };
    }
  }

  // Racikan (puyer) anak berbasis BB: tiap 5 kg -> +1 tablet tiap bahan.
  // Semua: dosis 1 bungkus, satuan Pulvis, instruksi racikan "buat 10".
  // v9.3: semua kolom racikan wajib terisi. Durasi = 10 bungkus / frekuensi per hari
  // (3x -> 3 hari, 2x -> 5 hari, 1x -> 10 hari), sama dengan pola Racikan ISPA.
  const CHILD_PUYER_SERIES = [
    { prefix: "ISPA_ANAK_", title: "RACIKAN ISPA", name: "puyer batuk", maxKg: 50, duration: "3", doseFreq: "3", instruction: "setelah makan", items: ["GUAIFENESIN_100", "CTM_4", "DEXAMETHASONE_05"] },
    { prefix: "DEMAM_ANAK_", title: "DEMAM ANAK", name: "puyer demam", maxKg: 50, duration: "3", doseFreq: "3", instruction: "setelah makan", items: ["PARACETAMOL_500"] },
    // v10.0.9 (permintaan dokter): Ibuprofen 400 mg, tiap 7 kg -> +1 tablet, buat 10 puyer, 3x sehari.
    { prefix: "IBUPROFEN_ANAK_", title: "IBUPROFEN ANAK", name: "puyer ibuprofen", step: 7, maxKg: 49, duration: "3", doseFreq: "3", instruction: "setelah makan", items: ["IBUPROFEN_400"] },
    { prefix: "ANTIBIOTIK_ANAK_", title: "ANTIBIOTIK ANAK", name: "puyer antibiotik", maxKg: 50, duration: "3", doseFreq: "3", instruction: "setelah makan", items: ["AMOXICILLIN_500"] },
    { prefix: "MUAL_MUNTAH_ANAK_", title: "MUAL MUNTAH ANAK", name: "puyer mual muntah", maxKg: 50, duration: "3", doseFreq: "3", instruction: "setelah makan", items: ["DOMPERIDONE_10"] },
    // Cefadroxil puyer: pola jumlah tablet sama seperti Amoxicillin, tetapi 2x sehari.
    { prefix: "CEFADROXIL_ANAK_", title: "CEFADROXIL", name: "cefadroxil", maxKg: 40, duration: "5", doseFreq: "2", instruction: "setelah makan", items: ["CEFADROXIL_500"] },
    // v7.4.2: racikan "baru" (BB <= 40 kg). Dosis/instruksi mengikuti input pengguna.
    { prefix: "BARU_LAMBUNG_MUAL_", title: "LAMBUNG + MUAL", name: "lambung,mual", maxKg: 40, duration: "3", doseFreq: "3", instruction: "ac", items: ["ANTASIDA_TABLET", "RANITIDINE_HCL"] },
    { prefix: "BARU_MUAL_MUNTAH_", title: "MUAL MUNTAH BARU", name: "mual muntah", maxKg: 40, duration: "3", doseFreq: "3", instruction: "30 menit ac", items: ["DOMPERIDONE_10"] },
    { prefix: "BARU_AMOXICILLIN_", title: "AMOXICILLIN", name: "amoxicillin", maxKg: 40, duration: "3", doseFreq: "3", instruction: "setelah makan", items: ["AMOXICILLIN_500"] },
    { prefix: "BARU_CETIRIZINE_", title: "CETIRIZINE", name: "cetirizine", maxKg: 40, duration: "10", doseFreq: "1", instruction: "setelah makan", items: ["CETIRIZINE_10"] },
    { prefix: "BARU_BAPIL2_", title: "BAPIL 2", name: "batuk pilek 2", maxKg: 40, duration: "3", doseFreq: "3", instruction: "setelah makan", items: ["DEXAMETHASONE_05", "CTM_4", "AMBROXOL_30"] },
  ];

  const RACIKAN_TEMPLATES = {};
  for (const s of CHILD_PUYER_SERIES) {
    for (const band of weightBands(s.step || 5, s.maxKg)) {
      RACIKAN_TEMPLATES[s.prefix + bandKey(band)] = {
        title: `${s.title} ${bandLabel(band)}`,
        band,
        name: s.name,
        duration: s.duration,
        doseFreq: s.doseFreq,
        doseAmount: "1",
        unit: "Pulvis",
        instruction: s.instruction,
        compoundInstruction: "buat 10",
        ingredients: s.items.map((item) => ({ item, quantity: String(band.index) })),
      };
    }
  }

  const SALEP_RACIKAN = {
    title: "SALEP RACIKAN",
    name: "salep racikan",
    duration: "5",
    doseFreq: "2",
    doseAmount: "1",
    unit: "Oles",
    instruction: "oles di lesi",
    compoundInstruction: "mf ungt",
    ingredients: [
      { item: "BETAMETHASONE_SALEP", quantity: "1" },
      { item: "GENTAMICIN_SALEP", quantity: "1" },
      { item: "POT_PLASTIK", quantity: "1" },
    ],
  };

  // Resep anak berbasis UMUR (dibuat saat dipakai).
  function makeNyeriUluHatiAnakRecipe(ageYears) {
    if (ageYears >= 4 && ageYears <= 10) {
      return {
        title: "NYERI ULU HATI ANAK 4-10 TAHUN",
        medicines: [{ item: "ANTASIDA_TABLET", freq: "3", dose: "0.5", days: "3", total: "5", instruction: "SESUAI ATURAN PAKAI" }],
      };
    }
    if (ageYears > 10) {
      return {
        title: "NYERI ULU HATI ANAK >10 TAHUN",
        medicines: [{ item: "ANTASIDA_TABLET", freq: "3", dose: "1", days: "1", total: "5", instruction: "SESUAI ATURAN PAKAI" }],
      };
    }
    return null;
  }

  function makeZincChildRecipe(ageYears) {
    if (ageYears == null) return null;
    if (ageYears < 0.5) {
      return {
        title: "ZINC 20 MG ANAK <6 BULAN",
        medicines: [{ item: "ZINC_20", freq: "1", dose: "0.5", days: "10", total: "5", instruction: "SETELAH MAKAN" }],
      };
    }
    return {
      title: "ZINC 20 MG ANAK ≥6 BULAN",
      medicines: [{ item: "ZINC_20", freq: "1", dose: "1", days: "10", total: "10", instruction: "SETELAH MAKAN" }],
    };
  }

  // Resep tindakan yang bisa ditambahkan ke Paket Resep Golongan.
  const PACKAGE_ACTIONS = [
    { key: "CEK_GULA", label: "Cek Gula Darah" },
    { key: "CEK_ASAM_URAT", label: "Cek Asam Urat" },
    { key: "CEK_KOLESTEROL", label: "Cek Kolesterol" },
    { key: "IMUNISASI", label: "Imunisasi" },
  ];

  // ============================================================
  // v7.5.1: Paket Resep Golongan memakai target ITEM yang sudah ada di master database.
  // CTM 4 mg menggunakan ITEMS.CTM_4 dan Alpara menggunakan ITEMS.ALPARA;
  // tidak membuat target obat baru/duplikat. Population filter tetap ketat adult/child/all.
  // Kategori pasien ditentukan lebih dulu:
  //   - umur >17 tahun => DEWASA, BB tidak diperlukan
  //   - umur <=17 tahun / umur tidak terdeteksi => BB wajib;
  //     BB >40 kg => DEWASA, BB <=40 kg => ANAK
  // Setelah kategori diketahui, semua pilihan obat ditampilkan langsung
  // tanpa pengelompokan golongan obat. ISPA Dewasa tidak lagi menjadi satu paket;
  // obat dewasa ditampilkan sebagai pilihan obat terpisah.
  // Satu racikan = satu pilihan; satu obat non-racikan = satu pilihan.
  // Sebelum input, selalu tampilkan PREVIEW obat/racikan yang akan diinput.
  // ============================================================
  const MEDICATION_GROUP_PACKAGES = [
    {
      key: "ANALGESIK_ANTIPIRETIK",
      label: "Analgesik / Antipiretik",
      items: [
        {
          key: "PARACETAMOL_DEWASA",
          label: "Paracetamol 500 mg",
          type: "recipe",
          recipeKey: "DEMAM_DEWASA",
          population: "adult",
        },
        {
          key: "PARACETAMOL_ANAK",
          label: "Racikan Demam — Anak (BB)",
          type: "weight-racikan",
          prefix: "DEMAM_ANAK_",
          title: "RACIKAN DEMAM ANAK",
          population: "child",
        },
      ],
    },
    {
      key: "NSAID",
      label: "NSAID",
      items: [
        {
          key: "IBUPROFEN_400",
          label: "Ibuprofen 400 mg",
          type: "recipe-inline",
          population: "adult",
          medicine: {
            item: "IBUPROFEN_400",
            freq: "3",
            dose: "1",
            days: "3",
            total: "10",
            instruction: "SETELAH MAKAN",
          },
        },
        {
          key: "IBUPROFEN_ANAK",
          label: "Racikan Ibuprofen — Anak (BB)",
          type: "weight-racikan",
          prefix: "IBUPROFEN_ANAK_",
          title: "RACIKAN IBUPROFEN ANAK",
          population: "child",
        },
        {
          key: "DICLOFENAC_50",
          label: "Natrium Diclofenac 50 mg",
          type: "recipe-inline",
          population: "adult",
          medicine: {
            item: "DICLOFENAC_50",
            freq: "3",
            dose: "1",
            days: "3",
            total: "10",
            instruction: "KP NYERI",
          },
        },
      ],
    },
    {
      key: "KORTIKOSTEROID",
      label: "Kortikosteroid",
      items: [
        {
          key: "DEXAMETHASONE_05",
          label: "Dexamethasone 0,5 mg",
          type: "recipe-inline",
          population: "adult",
          medicine: {
            item: "DEXAMETHASONE_05",
            freq: "3",
            dose: "1",
            days: "3",
            total: "10",
            instruction: "SETELAH MAKAN",
          },
        },
      ],
    },
    {
      key: "ANTIHISTAMIN",
      label: "Antihistamin",
      items: [
        {
          key: "CETIRIZINE_10_DEWASA",
          label: "Cetirizine 10 mg",
          type: "recipe-inline",
          population: "adult",
          medicine: {
            item: "CETIRIZINE_10",
            freq: "1",
            dose: "1",
            days: "5",
            total: "5",
            instruction: "SETELAH MAKAN",
          },
        },
        {
          key: "CETIRIZINE_RACIKAN_BARU",
          label: "Racikan Cetirizine — Anak (BB)",
          type: "weight-racikan",
          prefix: "BARU_CETIRIZINE_",
          title: "RACIKAN CETIRIZINE",
          population: "child",
        },
      ],
    },
    {
      key: "RESPIRATORI",
      label: "Respiratori / Batuk-Pilek",
      items: [
        {
          key: "ISPA_ANAK",
          label: "Racikan ISPA Anak (BB)",
          type: "weight-racikan",
          prefix: "ISPA_ANAK_",
          title: "RACIKAN ISPA ANAK",
          population: "child",
        },
        {
          key: "BAPIL_2_ANAK",
          label: "Racikan Bapil 2 — Anak (BB)",
          type: "weight-racikan",
          prefix: "BARU_BAPIL2_",
          title: "RACIKAN BAPIL 2",
          population: "child",
        },
        {
          key: "AMBROXOL_30_DEWASA",
          label: "Ambroxol 30 mg",
          type: "recipe-inline",
          population: "adult",
          medicine: {
            item: "AMBROXOL_30",
            freq: "3",
            dose: "1",
            days: "3",
            total: "10",
            instruction: "SETELAH MAKAN",
          },
        },
        {
          key: "GUAIFENESIN_100_DEWASA",
          label: "Guaifenesin 100 mg",
          type: "recipe-inline",
          population: "adult",
          medicine: {
            item: "GUAIFENESIN_100",
            freq: "3",
            dose: "1",
            days: "3",
            total: "10",
            instruction: "SETELAH MAKAN",
          },
        },
        {
          key: "CTM_4_DEWASA",
          label: "CTM 4 mg",
          type: "recipe-inline",
          population: "adult",
          medicine: {
            item: "CTM_4",
            freq: "3",
            dose: "1",
            days: "3",
            total: "10",
            instruction: "SETELAH MAKAN",
          },
        },
        {
          key: "ALPARA_DEWASA",
          label: "Alpara",
          type: "recipe-inline",
          population: "adult",
          medicine: {
            item: "ALPARA",
            freq: "3",
            dose: "1",
            days: "3",
            total: "10",
            instruction: "SETELAH MAKAN",
          },
        },
      ],
    },
    {
      key: "GASTROINTESTINAL",
      label: "Gastrointestinal",
      items: [
        {
          key: "ANTASIDA_DEWASA",
          label: "Antasida DOEN",
          type: "recipe-inline",
          population: "adult",
          medicine: {
            item: "ANTASIDA_TABLET",
            freq: "3",
            dose: "1",
            days: "3",
            total: "10",
            instruction: "SEBELUM MAKAN",
          },
        },
        {
          key: "ANTASIDA_ANAK",
          label: "Antasida DOEN — Anak (umur)",
          type: "age-antacid",
          population: "child",
        },
        {
          key: "AKITA",
          label: "Akita",
          type: "recipe-inline",
          population: "adult",
          medicine: {
            item: "AKITA",
            freq: "1",
            dose: "2",
            days: "5",
            total: "10",
            instruction: "TIAP SELESAI BAB CAIR",
          },
        },
        {
          key: "ZINC_ANAK",
          label: "Zinc 20 mg — Anak (umur)",
          type: "age-zinc",
          population: "child",
        },
        {
          key: "ORALIT_ANAK",
          label: "Oralit — Anak",
          type: "recipe-inline",
          population: "child",
          medicine: {
            item: "ORALIT",
            freq: "1",
            dose: "1",
            days: "1",
            total: "4",
            instruction: "SETIAP BAB CAIR",
          },
        },
        {
          key: "DOMPERIDONE_SYRUP",
          label: "Domperidone syrup — Anak (BB)",
          type: "weight-syrup",
          prefix: "MUAL_MUNTAH_SYRUP_ANAK_",
          title: "DOMPERIDONE SYRUP ANAK",
          population: "child",
        },
        {
          key: "DOMPERIDONE_10_DEWASA",
          label: "Domperidone 10 mg",
          type: "recipe-inline",
          population: "adult",
          medicine: {
            item: "DOMPERIDONE_10",
            freq: "3",
            dose: "1",
            days: "3",
            total: "10",
            instruction: "SEBELUM MAKAN",
          },
        },
        {
          key: "LAMBUNG_MUAL_RACIKAN_BARU",
          label: "Racikan Lambung + Mual — Anak (BB)",
          type: "weight-racikan",
          prefix: "BARU_LAMBUNG_MUAL_",
          title: "RACIKAN LAMBUNG + MUAL",
          population: "child",
        },
        {
          key: "MUAL_MUNTAH_RACIKAN_BARU",
          label: "Racikan Mual Muntah — Anak (BB)",
          type: "weight-racikan",
          prefix: "BARU_MUAL_MUNTAH_",
          title: "RACIKAN MUAL MUNTAH",
          population: "child",
        },
      ],
    },
    {
      key: "ANTIBIOTIK",
      label: "Antibiotik",
      items: [
        {
          key: "AMOXICILLIN_SYRUP",
          label: "Amoxicillin 125 mg/5 mL syrup — Anak (BB)",
          type: "weight-syrup",
          prefix: "ANTIBIOTIK_SYRUP_ANAK_",
          title: "AMOXICILLIN SYRUP ANAK",
          population: "child",
        },
        {
          key: "AMOXICILLIN_500_DEWASA",
          label: "Amoxicillin 500 mg",
          type: "recipe-inline",
          population: "adult",
          medicine: {
            item: "AMOXICILLIN_500",
            freq: "3",
            dose: "1",
            days: "3",
            total: "10",
            instruction: "SETELAH MAKAN",
          },
        },
        {
          key: "AMOXICILLIN_500_RACIKAN_BARU",
          label: "Racikan Amoxicillin — Anak (BB)",
          type: "weight-racikan",
          prefix: "BARU_AMOXICILLIN_",
          title: "RACIKAN AMOXICILLIN",
          population: "child",
        },
        {
          key: "CEFADROXIL_SYRUP",
          label: "Cefadroxil 125 mg/5 mL syrup — Anak (BB)",
          type: "weight-syrup",
          prefix: "CEFADROXIL_SYRUP_ANAK_",
          title: "CEFADROXIL SYRUP ANAK",
          population: "child",
        },
        {
          key: "CEFADROXIL_PUYER_ANAK",
          label: "Racikan Cefadroxil — Anak (BB)",
          type: "weight-racikan",
          prefix: "CEFADROXIL_ANAK_",
          title: "RACIKAN CEFADROXIL",
          population: "child",
        },
        {
          key: "CEFADROXIL_500_DEWASA",
          label: "Cefadroxil monohydrate 500 mg",
          type: "recipe-inline",
          population: "adult",
          medicine: {
            item: "CEFADROXIL_500",
            freq: "2",
            dose: "1",
            days: "3",
            total: "6",
            instruction: "SETELAH MAKAN",
          },
        },
      ],
    },
    // v10: obat standar FKTP tambahan (regimen dewasa; mohon dievaluasi dokter).
    {
      key: "LAIN_LAIN_V10",
      label: "Obat Lain (FKTP)",
      items: [
        {
          key: "BETAHISTIN_6_DEWASA",
          label: "Betahistin 6 mg",
          type: "recipe-inline",
          population: "adult",
          medicine: { item: "BETAHISTIN_6", freq: "3", dose: "1", days: "3", total: "10", instruction: "SETELAH MAKAN" },
        },
        {
          key: "OMEPRAZOLE_20_DEWASA",
          label: "Omeprazole 20 mg",
          type: "recipe-inline",
          population: "adult",
          medicine: { item: "OMEPRAZOLE_20", freq: "1", dose: "1", days: "7", total: "7", instruction: "SEBELUM MAKAN" },
        },
        {
          key: "ASAM_MEFENAMAT_500_DEWASA",
          label: "Asam Mefenamat 500 mg",
          type: "recipe-inline",
          population: "adult",
          medicine: { item: "ASAM_MEFENAMAT_500", freq: "3", dose: "1", days: "3", total: "10", instruction: "SETELAH MAKAN" },
        },
        {
          key: "METHYLPREDNISOLONE_4_DEWASA",
          label: "Methylprednisolone 4 mg",
          type: "recipe-inline",
          population: "adult",
          medicine: { item: "METHYLPREDNISOLONE_4", freq: "3", dose: "1", days: "3", total: "10", instruction: "SETELAH MAKAN" },
        },
        {
          key: "LORATADINE_10_DEWASA",
          label: "Loratadine 10 mg",
          type: "recipe-inline",
          population: "adult",
          medicine: { item: "LORATADINE_10", freq: "1", dose: "1", days: "5", total: "5", instruction: "SETELAH MAKAN" },
        },
        {
          key: "CIPROFLOXACIN_500_DEWASA",
          label: "Ciprofloxacin 500 mg",
          type: "recipe-inline",
          population: "adult",
          medicine: { item: "CIPROFLOXACIN_500", freq: "2", dose: "1", days: "5", total: "10", instruction: "SETELAH MAKAN" },
        },
        {
          key: "METRONIDAZOLE_500_DEWASA",
          label: "Metronidazole 500 mg",
          type: "recipe-inline",
          population: "adult",
          medicine: { item: "METRONIDAZOLE_500", freq: "3", dose: "1", days: "5", total: "15", instruction: "SETELAH MAKAN" },
        },
      ],
    },
    {
      key: "VITAMIN_SUPLEMEN",
      label: "Vitamin / Suplemen",
      items: [
        {
          key: "VITAMIN_B_COMPLEX",
          label: "Vitamin B Complex",
          type: "recipe-inline",
          population: "adult",
          medicine: {
            item: "VITAMIN_B_COMPLEX",
            freq: "1",
            dose: "1",
            days: "5",
            total: "5",
            instruction: "SETELAH MAKAN",
          },
        },
        {
          key: "CALCIUM_500",
          label: "Calcium 500 mg",
          type: "recipe-inline",
          population: "adult",
          medicine: {
            item: "CALCIUM_500",
            freq: "1",
            dose: "1",
            days: "5",
            total: "5",
            instruction: "SETELAH MAKAN",
          },
        },
      ],
    },
    {
      key: "TOPIKAL",
      label: "Topikal / Salep",
      items: [
        {
          key: "SALEP_RACIKAN_BARU",
          label: "Salep Racikan",
          type: "racikan-static",
          population: "all",
          tpl: SALEP_RACIKAN,
        },
      ],
    },
    {
      key: "ANTIHIPERTENSI",
      label: "Antihipertensi",
      items: [
        {
          key: "AMLODIPINE_5",
          label: "Amlodipine 5 mg",
          type: "recipe",
          recipeKey: "HT_AMLODIPINE_5",
          population: "adult",
        },
        {
          key: "AMLODIPINE_10",
          label: "Amlodipine 10 mg",
          type: "recipe",
          recipeKey: "HT_AMLODIPINE_10",
          population: "adult",
        },
        {
          key: "CAPTOPRIL_12_5",
          label: "Captopril 12,5 mg",
          type: "recipe",
          recipeKey: "HT_CAPTOPRIL_12_5",
          population: "adult",
        },
        {
          key: "CAPTOPRIL_25",
          label: "Captopril 25 mg",
          type: "recipe",
          recipeKey: "HT_CAPTOPRIL_25",
          population: "adult",
        },
      ],
    },
    {
      key: "ANTIDIABETES",
      label: "Antidiabetes",
      items: [
        {
          key: "METFORMIN_500",
          label: "Metformin 500 mg",
          type: "recipe",
          recipeKey: "DM_METFORMIN",
          population: "adult",
        },
        {
          key: "GLIMEPIRIDE_1",
          label: "Glimepiride 1 mg",
          type: "recipe",
          recipeKey: "DM_GLIMEPIRIDE_1",
          population: "adult",
        },
        {
          key: "GLIMEPIRIDE_2",
          label: "Glimepiride 2 mg",
          type: "recipe",
          recipeKey: "DM_GLIMEPIRIDE_2",
          population: "adult",
        },
      ],
    },
    {
      key: "DISLIPIDEMIA",
      label: "Antihiperlipidemia",
      items: [
        {
          key: "SIMVASTATIN_10",
          label: "Simvastatin 10 mg",
          type: "recipe",
          recipeKey: "KOLESTEROL",
          population: "adult",
        },
      ],
    },
    {
      key: "ASAM_URAT",
      label: "Penurun Asam Urat",
      items: [
        {
          key: "ALLOPURINOL_100",
          label: "Allopurinol 100 mg",
          type: "recipe",
          recipeKey: "ASAM_URAT",
          population: "adult",
        },
      ],
    },
  ];

  // SARAN OBAT DARI KELUHAN UTAMA (Paket Resep Golongan)
  // Kata kunci di Keluhan Utama (cadangan: Anamnesa) -> pilihan obat (key
  // MEDICATION_GROUP_PACKAGES) yang dicentang otomatis. Hanya SARAN: dokter tetap
  // mereview dan bisa menghapus centang. Kata kunci yang dinegasikan ("tidak demam",
  // "batuk (-)", "mual disangkal") diabaikan. Urutan aturan = urutan obat di resep.
  // Test memastikan setiap key ada dan cocok dengan kategorinya.
  const ANAMNESIS_SUGGESTION_RULES = [
    {
      label: "Demam",
      pattern: /demam|febris|meriang|sumeng|(?:badan|anak|suhu)\s+(?:terasa\s+)?panas|panas\s+(?:badan|tinggi|naik|sejak|\d)/,
      adult: ["PARACETAMOL_DEWASA"],
      child: ["PARACETAMOL_ANAK"],
    },
    {
      label: "Batuk / pilek",
      pattern: /batuk|pilek|\bbat?pil\b|\bflu\b|influenza|bersin|hidung\s+(?:tersumbat|mampet|meler)|ingus|\bispa\b|common cold/,
      // v10.0.9 (permintaan dokter): batuk dewasa = Paracetamol + Ambroxol + Cetirizine
      // (bukan Alpara); anak = racikan Guaifenesin + CTM + Dexamethasone (ISPA Anak).
      adult: ["PARACETAMOL_DEWASA", "AMBROXOL_30_DEWASA", "CETIRIZINE_10_DEWASA"], // = diagnosis ISPA
      child: ["ISPA_ANAK"],
    },
    {
      label: "Dahak",
      pattern: /dahak|sputum|\briak\b/,
      adult: ["AMBROXOL_30_DEWASA"],
      child: ["BAPIL_2_ANAK"],
    },
    {
      // v9.5: nyeri tenggorok biasa = paket ISPA (sesuai resep dokter di klinik:
      // "tenggorokan nyeri" -> Dexamethasone + Alpara), tanpa antibiotik. v10.0.4: Vit B
      // Complex tidak dicentang otomatis (dokter yang memilih).
      label: "Nyeri tenggorok",
      pattern: /(?:nyeri|sakit|perih|gatal)\s+(?:saat\s+)?(?:menelan|telan|tenggorok\w*)|tenggorok\w*\s+(?:sakit|nyeri|perih|gatal)|\bfaring\w*/,
      adult: ["ALPARA_DEWASA", "DEXAMETHASONE_05"],
      child: ["ISPA_ANAK"],
    },
    {
      // Amandel/tonsil meradang -> antibiotik + dexamethasone.
      label: "Radang amandel",
      // v9.4: "radang" saja tidak dipakai lagi ("radang sendi" dulu memicu antibiotik).
      pattern: /radang\s+(?:tenggorok\w*|amandel|tonsil)|tonsil\w*|amandel/,
      adult: ["AMOXICILLIN_500_DEWASA", "DEXAMETHASONE_05"],
      child: ["AMOXICILLIN_500_RACIKAN_BARU"],
    },
    {
      label: "Sakit telinga",
      pattern: /(?:sakit|nyeri)\s+telinga|telinga\b[^.,;\n]{0,15}?(?:sakit|nyeri|berair|bernanah|cairan)|otitis|congek|kopok/,
      adult: ["AMOXICILLIN_500_DEWASA", "PARACETAMOL_DEWASA"],
      child: ["AMOXICILLIN_500_RACIKAN_BARU", "PARACETAMOL_ANAK"],
    },
    {
      label: "Sinusitis",
      pattern: /sinusitis|\bsinus\b|(?:nyeri|sakit)\s+(?:di\s+)?(?:wajah|pipi|dahi)/,
      adult: ["AMOXICILLIN_500_DEWASA", "PARACETAMOL_DEWASA"],
      child: ["AMOXICILLIN_500_RACIKAN_BARU", "PARACETAMOL_ANAK"],
    },
    {
      label: "Sakit gigi",
      pattern: /(?:sakit|nyeri|ngilu)\s+gigi|gigi\s+(?:sakit|nyeri|ngilu|bengkak|berlubang|goyang)|pulpitis|abses\s+gigi|gusi\s+bengkak/,
      adult: ["IBUPROFEN_400", "AMOXICILLIN_500_DEWASA"],
      child: ["PARACETAMOL_ANAK", "AMOXICILLIN_500_RACIKAN_BARU"],
    },
    {
      label: "Infeksi saluran kemih",
      pattern: /anyang|disuria|\bisk\b|infeksi\s+saluran\s+kemih|(?:nyeri|sakit|perih|panas)\s+(?:saat\s+)?(?:bak|kencing|berkemih|pipis)|(?:bak|kencing|pipis)\s+(?:perih|panas|sakit|nyeri)/,
      adult: ["CEFADROXIL_500_DEWASA", "PARACETAMOL_DEWASA"],
      child: ["CEFADROXIL_PUYER_ANAK", "PARACETAMOL_ANAK"],
    },
    {
      label: "Infeksi kulit (bisul/abses)",
      pattern: /bisul|(?<!gigi\s)abses(?!\s+gigi)|bernanah|nanah|furunkel|impetigo|selulitis|luka\b[^.;\n]{0,40}?(?:infeksi|meradang|radang|bernanah|berair|bengkak|kemerahan)|infeksi\s+kulit/,
      adult: ["CEFADROXIL_500_DEWASA", "PARACETAMOL_DEWASA"],
      child: ["CEFADROXIL_PUYER_ANAK", "PARACETAMOL_ANAK"],
    },
    {
      label: "Sakit kepala",
      pattern: /(?:sakit|nyeri)\s+kepala|pusing|cekot|ce[fp]h?algia|migr[ae]i?n/,
      adult: ["PARACETAMOL_DEWASA"],
      child: ["PARACETAMOL_ANAK"],
    },
    {
      label: "Nyeri haid",
      pattern: /(?:nyeri|sakit)\s+(?:saat\s+)?(?:haid|mens\w*)|(?:haid|mens\w*)\s+(?:nyeri|sakit)|dismenore\w*|kram\s+(?:perut\s+)?(?:saat\s+)?haid/,
      adult: ["ASAM_MEFENAMAT_500_DEWASA"],
      child: ["PARACETAMOL_ANAK"],
    },
    {
      label: "Nyeri otot / sendi",
      pattern: /(?:nyeri|sakit)\s+(?:otot|sendi|pinggang|punggung|bahu|leher|badan)|pegal|pegel|linu|keseleo|terkilir|encok|m[iy]algia|art?h?ralgia|low back pain|\blbp\b/,
      adult: ["DICLOFENAC_50"],
      child: ["PARACETAMOL_ANAK"],
    },
    {
      label: "Nyeri lutut / pengapuran",
      pattern: /(?:nyeri|sakit|ngilu)\s+(?:di\s+)?lutut|lutut\s+(?:nyeri|sakit|kaku|bengkak|ngilu)|osteoart\w*|pengapuran|\boa\s+genu\b/,
      adult: ["DICLOFENAC_50", "CALCIUM_500"],
      child: ["PARACETAMOL_ANAK"],
    },
    {
      label: "Gatal / alergi",
      pattern: /gatal|alergi|biduran|kaligata|urtikaria|bentol|\bbidur|digigit\s+serangga/,
      adult: ["CETIRIZINE_10_DEWASA"],
      child: ["CETIRIZINE_RACIKAN_BARU"],
    },
    {
      label: "Eksim / dermatitis",
      // v9.4: jamur/panu/kurap DIHAPUS — salep racikan berisi steroid (betamethasone)
      // memperburuk infeksi jamur. "Lecet" juga dihapus.
      pattern: /ruam|eksim|eksema|dermatitis/,
      adult: ["SALEP_RACIKAN_BARU"],
      child: ["SALEP_RACIKAN_BARU"],
    },
    {
      label: "Cacar / campak (simptomatik)",
      pattern: /cacar|varisela|campak|morbili/,
      adult: ["PARACETAMOL_DEWASA", "CETIRIZINE_10_DEWASA"],
      child: ["PARACETAMOL_ANAK", "CETIRIZINE_RACIKAN_BARU"],
    },
    {
      label: "Maag / ulu hati",
      // v9.4: "perih" saja tidak dipakai lagi ("kencing perih" dulu memicu antasida).
      pattern: /\bmaa?g\b|ulu\s+hati|epigastri\w*|perih\s+(?:di\s+)?(?:ulu\s+hati|lambung|perut)|perut\s+perih|kembung|begah|sebah|dispepsia|gastritis|lambung|\bgerd\b|heartburn/,
      adult: ["ANTASIDA_DEWASA"],
      child: ["ANTASIDA_ANAK"],
    },
    {
      label: "Mual / muntah",
      pattern: /mual|muntah|nausea|vomit|\beneg\b/,
      adult: ["DOMPERIDONE_10_DEWASA"],
      child: ["MUAL_MUNTAH_RACIKAN_BARU"],
    },
    {
      label: "Diare",
      pattern: /diare|mencret|(?:bab|berak|buang air besar)\s+(?:cair|encer)|gastroenteritis|\bgea\b/,
      adult: ["AKITA"],
      child: ["ZINC_ANAK", "ORALIT_ANAK"],
    },
    {
      label: "Hipertensi",
      pattern: /hipertensi|darah\s+tinggi|tensi\s+tinggi|\bht\b|\bhtn\b/,
      adult: ["AMLODIPINE_5"],
      child: [],
    },
    {
      label: "Diabetes",
      pattern: /diabetes|kencing\s+manis|gula\s+(?:darah\s+)?(?:tinggi|naik)|\bdm\b/,
      adult: ["METFORMIN_500"],
      child: [],
    },
    {
      label: "Kolesterol",
      pattern: /kolesterol|dislipid\w*|lemak\s+darah/,
      adult: ["SIMVASTATIN_10"],
      child: [],
    },
    {
      label: "Asam urat",
      pattern: /asam\s+urat|\bgout\b|hiperurisemi\w*/,
      adult: ["ALLOPURINOL_100"],
      child: [],
    },
    // v10: keluhan untuk obat standar FKTP tambahan.
    {
      label: "Vertigo",
      pattern: /vertigo|pusing\s+berputar|kliyengan|(?:ruangan|sekitar)\s+berputar/,
      adult: ["BETAHISTIN_6_DEWASA"],
      child: [],
    },
    // v9.6: keluhan yang mengarah ke TINDAKAN (resep tindakan dicentang otomatis).
    // Hanya tindakan, tanpa obat: permintaan cek lab belum berarti perlu obat.
    // v9.7: cek lab HANYA bila tertulis "cek/periksa/tes ..." (keluhan DM, asam urat,
    // kolesterol, sering haus, dsb. TIDAK otomatis mencentang cek lab).
    {
      label: "Cek gula darah",
      pattern: /(?:cek|periksa|tes)\s+(?:gula|gds|gdp|gd2pp|kadar\s+gula)/,
      adult: [],
      child: [],
      actions: ["CEK_GULA"],
    },
    {
      label: "Cek kolesterol",
      pattern: /(?:cek|periksa|tes)\s+kolesterol/,
      adult: [],
      child: [],
      actions: ["CEK_KOLESTEROL"],
    },
    {
      label: "Cek asam urat",
      pattern: /(?:cek|periksa|tes)\s+(?:asam\s+urat|au\b)/,
      adult: [],
      child: [],
      actions: ["CEK_ASAM_URAT"],
    },
    {
      label: "Imunisasi",
      pattern: /imunisasi|vaksin\w*|\bbcg\b|\bdpt\w*|\bpolio\b|\bopv\b|\bipv\b|\bpcv\b|\brota\w*|campak\s+rubel\w*|\bmr\b|hepatitis\s+b\s+0|\bhb[\s-]?0\b|\btt\b|\btd\b|suntik\s+(?:tetanus|imunisasi)/,
      adult: [],
      child: [],
      actions: ["IMUNISASI"],
    },
  ];

  // MENU DIAGNOSIS (v9.6): hanya mengisi kolom Diagnosa dan ICD 10 (2010).
  // icd   = kode yang dipilih, urut prioritas (kode pertama yang ada di daftar
  //         Klinik Pintar dipakai; ICD-10 versi 2010 bisa memakai subkode).
  // query = teks yang diketik di kolom Diagnosa untuk memunculkan pilihannya.
  // adult/child/actions = obat & tindakan yang dicentang di Paket Resep setelah
  // RESUME + DIAGNOSIS (key MEDICATION_GROUP_PACKAGES / PACKAGE_ACTIONS; diaudit).
  // Isinya mengikuti template resep klinik yang sudah ada (ISPA Dewasa, GEA,
  // Dyspepsia, Myalgia, LBP, Dermatitis, dst.).
  const DIAGNOSIS_TEMPLATES = [
    { key: "ISPA", label: "ISPA", icd: ["J06"], query: "Acute upper respiratory infections of multiple and unspecified sites",
      adult: ["PARACETAMOL_DEWASA", "AMBROXOL_30_DEWASA", "CETIRIZINE_10_DEWASA"], child: ["ISPA_ANAK"] },
    { key: "FARINGITIS", label: "Faringitis akut", icd: ["J02.9", "J02"], query: "acute pharyngitis",
      adult: ["ALPARA_DEWASA", "DEXAMETHASONE_05"], child: ["ISPA_ANAK"] },
    { key: "TONSILITIS", label: "Tonsilitis akut", icd: ["J03.9", "J03"], query: "acute tonsillitis",
      adult: ["AMOXICILLIN_500_DEWASA", "DEXAMETHASONE_05"], child: ["AMOXICILLIN_500_RACIKAN_BARU"] },
    { key: "GEA", label: "GEA (Gastroenteritis akut)", icd: ["A09", "A09.9", "A09.0"], query: "gastroenteritis",
      adult: ["AKITA"], child: ["ZINC_ANAK", "ORALIT_ANAK"] },
    { key: "DISPEPSIA", label: "Dispepsia", icd: ["K30"], query: "dyspepsia",
      adult: ["ANTASIDA_DEWASA"], child: ["ANTASIDA_ANAK"] },
    { key: "FEVER", label: "Fever / Demam", icd: ["R50.9", "R50"], query: "fever",
      adult: ["PARACETAMOL_DEWASA"], child: ["PARACETAMOL_ANAK"] },
    { key: "MYALGIA", label: "Myalgia", icd: ["M79.1"], query: "myalgia",
      adult: ["PARACETAMOL_DEWASA"], child: ["PARACETAMOL_ANAK"] },
    { key: "LBP", label: "Low back pain (LBP)", icd: ["M54.5"], query: "low back pain",
      adult: ["DICLOFENAC_50", "DEXAMETHASONE_05"], child: ["PARACETAMOL_ANAK"] },
    { key: "CEPHALGIA", label: "Cephalgia / Sakit kepala", icd: ["R51"], query: "headache",
      adult: ["PARACETAMOL_DEWASA"], child: ["PARACETAMOL_ANAK"] },
    // Betahistin 6 mg 3x1, 10 tablet (sesuai dokter klinik).
    { key: "VERTIGO", label: "Vertigo / Pusing", icd: ["R42"], query: "dizziness",
      adult: ["BETAHISTIN_6_DEWASA"], child: [] },
    { key: "DERMATITIS", label: "Dermatitis", icd: ["L30.9", "L30"], query: "dermatitis",
      adult: ["SALEP_RACIKAN_BARU", "CETIRIZINE_10_DEWASA"], child: ["SALEP_RACIKAN_BARU", "CETIRIZINE_RACIKAN_BARU"] },
    { key: "URTIKARIA", label: "Urtikaria / Gatal", icd: ["L50.9", "L50"], query: "urticaria",
      adult: ["CETIRIZINE_10_DEWASA"], child: ["CETIRIZINE_RACIKAN_BARU"] },
    { key: "DM", label: "DM tipe 2", icd: ["E11.9", "E11"], query: "non-insulin-dependent diabetes",
      adult: ["METFORMIN_500"], child: [] },
    { key: "HT", label: "Hipertensi", icd: ["I10"], query: "hypertension",
      adult: ["AMLODIPINE_5"], child: [] },
    { key: "IMUNISASI", label: "Imunisasi", icd: ["Z27.9", "Z27.8", "Z23.8"], query: "need for immunization",
      adult: [], child: [], actions: ["IMUNISASI"] },
    // v10: diagnosis tambahan yang sering di klinik (ICD-10 2010; dicek di Klinik Pintar).
    { key: "SINUSITIS", label: "Sinusitis akut", icd: ["J01.9", "J01"], query: "acute sinusitis",
      adult: ["AMOXICILLIN_500_DEWASA", "PARACETAMOL_DEWASA"], child: ["AMOXICILLIN_500_RACIKAN_BARU", "PARACETAMOL_ANAK"] },
    { key: "OMA", label: "Otitis media akut", icd: ["H66.9", "H66.0", "H66"], query: "otitis media",
      adult: ["AMOXICILLIN_500_DEWASA", "PARACETAMOL_DEWASA"], child: ["AMOXICILLIN_500_RACIKAN_BARU", "PARACETAMOL_ANAK"] },
    { key: "RINITIS_ALERGI", label: "Rinitis alergi", icd: ["J30.4", "J30.3"], query: "allergic rhinitis",
      adult: ["LORATADINE_10_DEWASA"], child: ["CETIRIZINE_RACIKAN_BARU"] },
    { key: "ASMA", label: "Asma", icd: ["J45.9", "J45"], query: "asthma",
      adult: ["METHYLPREDNISOLONE_4_DEWASA"], child: [] },
    { key: "KONJUNGTIVITIS", label: "Konjungtivitis", icd: ["H10.9", "H10"], query: "conjunctivitis",
      adult: [], child: [] },
    { key: "GASTRITIS", label: "Gastritis", icd: ["K29.7", "K29"], query: "gastritis",
      adult: ["OMEPRAZOLE_20_DEWASA", "ANTASIDA_DEWASA"], child: ["ANTASIDA_ANAK"] },
    { key: "KONSTIPASI", label: "Konstipasi", icd: ["K59.0", "K59"], query: "constipation",
      adult: [], child: [] },
    { key: "NYERI_PERUT", label: "Nyeri perut / kolik", icd: ["R10.4", "R10"], query: "abdominal pain",
      adult: [], child: [] },
    { key: "HELMINTHIASIS", label: "Cacingan", icd: ["B82.0", "B82.9", "B83.9"], query: "helminthiasis",
      adult: [], child: [] },
    { key: "ISK", label: "Infeksi saluran kemih", icd: ["N39.0"], query: "urinary tract infection",
      adult: ["CEFADROXIL_500_DEWASA", "PARACETAMOL_DEWASA"], child: ["CEFADROXIL_PUYER_ANAK", "PARACETAMOL_ANAK"] },
    { key: "DISMENORE", label: "Dismenore", icd: ["N94.6", "N94.4", "N94.5"], query: "dysmenorrh",
      adult: ["ASAM_MEFENAMAT_500_DEWASA"], child: ["PARACETAMOL_ANAK"] },
    { key: "PULPITIS", label: "Pulpitis / sakit gigi", icd: ["K04.0", "K02.9"], query: "pulpitis",
      adult: ["IBUPROFEN_400", "AMOXICILLIN_500_DEWASA"], child: ["PARACETAMOL_ANAK", "AMOXICILLIN_500_RACIKAN_BARU"] },
    { key: "ABSES", label: "Abses / bisul", icd: ["L02.9", "L02"], query: "cutaneous abscess",
      adult: ["CEFADROXIL_500_DEWASA", "PARACETAMOL_DEWASA"], child: ["CEFADROXIL_PUYER_ANAK", "PARACETAMOL_ANAK"] },
    { key: "TINEA", label: "Tinea (kurap/jamur)", icd: ["B35.9", "B35.4"], query: "dermatophytosis",
      adult: ["CETIRIZINE_10_DEWASA"], child: [] },
    { key: "PANU", label: "Pitiriasis versikolor (panu)", icd: ["B36.0"], query: "pityriasis versicolor",
      adult: [], child: [] },
    { key: "VARICELLA", label: "Varisela (cacar air)", icd: ["B01.9", "B01"], query: "varicella",
      adult: ["PARACETAMOL_DEWASA", "CETIRIZINE_10_DEWASA"], child: ["PARACETAMOL_ANAK", "CETIRIZINE_RACIKAN_BARU"] },
    { key: "ZOSTER", label: "Herpes zoster", icd: ["B02.9", "B02"], query: "zoster",
      adult: ["PARACETAMOL_DEWASA"], child: [] },
    { key: "STOMATITIS", label: "Stomatitis (sariawan)", icd: ["K12.0", "K12.1"], query: "stomatitis",
      adult: [], child: [] },
    { key: "OA_GENU", label: "Osteoartritis lutut", icd: ["M17.9", "M17"], query: "gonarthrosis",
      adult: ["DICLOFENAC_50", "CALCIUM_500"], child: [] },
    { key: "HIPERURISEMIA", label: "Hiperurisemia", icd: ["E79.0"], query: "hyperuricaemia",
      adult: ["ALLOPURINOL_100"], child: [] },
    { key: "DISLIPIDEMIA", label: "Dislipidemia", icd: ["E78.5", "E78.0"], query: "hyperlipidaemia",
      adult: ["SIMVASTATIN_10"], child: [] },
  ];

  // RESUME + DIAGNOSIS (uji coba): diagnosis dipilih dari Keluhan Utama.
  // tier = prioritas bila beberapa cocok (angka kecil didahulukan):
  //   1 keluhan akut spesifik (urutan daftar: tonsil > faring > ISPA > GEA > ...)
  //   2 penyakit kronis HT / DM -> yang DITULIS DULUAN di Keluhan Utama
  //   3 keluhan umum (vertigo > sakit kepala > pegal)
  //   4 demam saja (demam + batuk = ISPA, demam + diare = GEA)
  const DIAGNOSIS_FROM_COMPLAINT = [
    { key: "TONSILITIS", tier: 1, pattern: /tonsil\w*|amandel/ },
    { key: "FARINGITIS", tier: 1, pattern: /faring\w*/ },
    { key: "SINUSITIS", tier: 1, pattern: /sinusitis|\bsinus\b/ },
    { key: "OMA", tier: 1, pattern: /(?:sakit|nyeri)\s+telinga|telinga\b[^.,;\n]{0,15}?(?:sakit|nyeri|berair|bernanah|cairan)|otitis|congek|kopok/ },
    { key: "ASMA", tier: 1, pattern: /\basma\b|asthma|mengi|\bsesak\b/ },
    { key: "RINITIS_ALERGI", tier: 1, pattern: /rinitis|rhinitis|alergi\s+(?:debu|dingin|cuaca)|bersin[\s-]+bersin\s+(?:tiap|setiap|saat|kalau|jika)/ },
    { key: "ISPA", tier: 1, pattern: /batuk|pilek|\bbat?pil\b|\bflu\b|influenza|bersin|hidung\s+(?:tersumbat|mampet|meler)|ingus|\bispa\b|common cold|tenggorok\w*\s+(?:sakit|nyeri|perih|gatal)|(?:nyeri|sakit|perih|gatal)\s+(?:saat\s+)?(?:menelan|telan|tenggorok\w*)|radang\s+tenggorok\w*/ },
    { key: "KONJUNGTIVITIS", tier: 1, pattern: /mata\s+(?:merah|belek\w*|gatal|berair)|belekan|konjungtiv\w*|\bbelek\b/ },
    { key: "GEA", tier: 1, pattern: /diare|mencret|muntaber|(?:bab|berak|buang air besar)\s+(?:cair|encer)|gastroenteritis|\bgea\b/ },
    { key: "HELMINTHIASIS", tier: 1, pattern: /cacing\w*|kremi/ },
    { key: "GASTRITIS", tier: 1, pattern: /gastritis/ },
    { key: "DISPEPSIA", tier: 1, pattern: /\bmaa?g\b|ulu\s+hati|epigastri\w*|dispepsia|gastritis|kembung|begah|sebah|perih\s+(?:di\s+)?(?:ulu\s+hati|lambung|perut)|perut\s+perih|asam\s+lambung|\bgerd\b/ },
    { key: "KONSTIPASI", tier: 1, pattern: /sembelit|konstipasi|susah\s+(?:bab|buang\s+air\s+besar)|(?:tidak|belum)\s+bab\s+\d|bab\s+keras/ },
    { key: "NYERI_PERUT", tier: 1, pattern: /(?:sakit|nyeri)\s+perut|perut\s+(?:sakit|nyeri|melilit|mules)|melilit|kolik/ },
    { key: "ISK", tier: 1, pattern: /anyang|disuria|\bisk\b|infeksi\s+saluran\s+kemih|(?:nyeri|sakit|perih|panas)\s+(?:saat\s+)?(?:bak|kencing|berkemih|pipis)|(?:bak|kencing|pipis)\s+(?:perih|panas|sakit|nyeri)/ },
    { key: "DISMENORE", tier: 1, pattern: /(?:nyeri|sakit)\s+(?:saat\s+)?(?:haid|mens\w*)|(?:haid|mens\w*)\s+(?:nyeri|sakit)|dismenore\w*/ },
    { key: "PULPITIS", tier: 1, pattern: /(?:sakit|nyeri|ngilu)\s+gigi|gigi\s+(?:sakit|nyeri|ngilu|bengkak|berlubang|goyang)|pulpitis|gusi\s+bengkak/ },
    { key: "ABSES", tier: 1, pattern: /bisul|abses|bernanah|furunkel|luka\b[^.;\n]{0,40}?(?:infeksi|meradang|radang|bernanah|berair|bengkak)/ },
    { key: "VARICELLA", tier: 1, pattern: /cacar\s+air|varisela|varicella|\bcacar\b(?!\s+(?:ular|api))/ },
    { key: "ZOSTER", tier: 1, pattern: /herpes\s+zoster|\bzoster\b|cacar\s+(?:ular|api)|dompo/ },
    { key: "TINEA", tier: 1, pattern: /kurap|kadas|tinea|jamur|kutu\s+air|\bgatal\s+selangkangan/ },
    { key: "PANU", tier: 1, pattern: /\bpanu\b|versikolor|versicolor/ },
    { key: "STOMATITIS", tier: 1, pattern: /sariawan|stomatitis|\baft\w*/ },
    { key: "URTIKARIA", tier: 1, pattern: /biduran|kaligata|urtikaria|bentol|\bbidur/ },
    { key: "DERMATITIS", tier: 1, pattern: /ruam|eksim|eksema|dermatitis|gatal/ },
    { key: "IMUNISASI", tier: 1, pattern: /imunisasi|vaksin\w*|\bbcg\b|\bdpt\w*|\bpolio\b|\bopv\b|\bipv\b|\bpcv\b|campak\s+rubel\w*|\bmr\b|\bhb[\s-]?0\b/ },
    { key: "OA_GENU", tier: 1, pattern: /(?:nyeri|sakit|ngilu)\s+(?:di\s+)?lutut|lutut\s+(?:nyeri|sakit|kaku|bengkak|ngilu)|osteoart\w*|pengapuran/ },
    { key: "LBP", tier: 1, pattern: /(?:nyeri|sakit|pegal)\s+(?:di\s+)?(?:pinggang|punggung)|low back pain|\blbp\b|encok/ },
    { key: "HT", tier: 2, pattern: /hipertensi|darah\s+tinggi|tensi\s+tinggi|\bht\b|\bhtn\b/ },
    { key: "HIPERURISEMIA", tier: 2, pattern: /asam\s+urat\s+(?:tinggi|naik)|kontrol\s+asam\s+urat|hiperurisemi\w*/ },
    { key: "DISLIPIDEMIA", tier: 2, pattern: /kolesterol\s+(?:tinggi|naik)|kontrol\s+kolesterol|dislipid\w*|hiperlipid\w*/ },
    { key: "DM", tier: 2, pattern: /diabetes|kencing\s+manis|gula\s+(?:darah\s+)?(?:tinggi|naik)|\bdm\b/ },
    // v10: vertigo khas (berputar) = keluhan utama, mengalahkan TD tinggi dari TTV.
    { key: "VERTIGO", tier: 1, pattern: /vertigo|pusing\s+berputar|(?:ruangan|sekitar|kepala)\s+(?:terasa\s+)?berputar/ },
    { key: "VERTIGO", tier: 3, pattern: /kliyengan|sempoyongan/ },
    { key: "CEPHALGIA", tier: 3, pattern: /(?:sakit|nyeri)\s+kepala|pusing|cekot|ce[fp]h?algia|migr[ae]i?n/ },
    // v10: mual/muntah saja = keluhan penyerta; kalah dari pusing, diare, dll.
    { key: "DISPEPSIA", tier: 3, pattern: /mual|muntah/ },
    { key: "MYALGIA", tier: 3, pattern: /pegal|pegel|linu|(?:nyeri|sakit)\s+(?:otot|badan)|m[iy]algia/ },
    { key: "FEVER", tier: 4, pattern: /demam|febris|meriang|sumeng|(?:badan|suhu)\s+(?:terasa\s+)?panas|panas\s+(?:badan|tinggi|naik|sejak|\d)/ },
  ];

  // Hasil: { key, keyword, others: [kunci lain yang juga cocok] } atau null.
  // options.vitals = hasil assessVitals(): demam dari suhu (tier 4) dan TD tinggi
  // (tier 2,5: di bawah keluhan akut & HT/DM tertulis, di atas pusing/pegal).
  function detectDiagnosisFromComplaint(rawText, options = {}) {
    const lower = String(rawText || "").toLowerCase().replace(/\u00a0/g, " ");
    const vit = options.vitals || null;
    if (!lower.trim() && !vit?.fever && !vit?.hypertension) return null;
    const found = [];
    for (const d of DIAGNOSIS_FROM_COMPLAINT) {
      if (found.some((f) => f.key === d.key)) continue; // kata lemah untuk diagnosis yang sudah cocok
      const re = new RegExp(d.pattern.source, "g");
      let m;
      while ((m = re.exec(lower))) {
        if (!m[0]) {
          re.lastIndex++;
          continue;
        }
        if (!isKeywordNegated(lower, m.index, m.index + m[0].length)) {
          found.push({ key: d.key, keyword: m[0], tier: d.tier, pos: m.index, order: found.length });
          break;
        }
      }
    }
    if (vit?.hypertension && !found.some((f) => f.key === "HT"))
      found.push({ key: "HT", keyword: `TD ${vit.bp}`, tier: 2.5, pos: Infinity, order: found.length });
    if (vit?.fever && !found.some((f) => f.key === "FEVER"))
      found.push({ key: "FEVER", keyword: `suhu ${String(vit.temp).replace(".", ",")} °C`, tier: 4, pos: Infinity, order: found.length });
    if (!found.length) return null;
    // Tier kecil dulu; tier 2 (HT/DM) menurut posisi tulisan, tier lain menurut urutan daftar.
    found.sort((a, b) => a.tier - b.tier || (a.tier === 2 ? a.pos - b.pos : a.order - b.order));
    const { key, keyword } = found[0];
    return { key, keyword, others: found.slice(1).map((f) => f.key) };
  }

  // Jika obat `when` disarankan, obat `drop` tidak disarankan (isi tumpang tindih).
  const ANAMNESIS_SUGGESTION_OVERLAPS = [
    {
      when: "ALPARA_DEWASA",
      drop: ["PARACETAMOL_DEWASA"],
      note: "Paracetamol tidak disarankan terpisah karena Alpara sudah mengandung paracetamol",
    },
    {
      when: "IBUPROFEN_400",
      drop: ["DICLOFENAC_50"],
      note: "Diclofenac tidak disarankan bersamaan dengan Ibuprofen (sama-sama NSAID)",
    },
    {
      when: "BAPIL_2_ANAK",
      drop: ["ISPA_ANAK"],
      note: "Racikan ISPA Anak diganti Racikan Bapil 2 (berisi ambroxol untuk dahak)",
    },
  ];

  // ============================================================
  // 2. JEMBATAN MEDISIN — membaca & mengisi lewat state Vue 2 / Vuex
  // ============================================================
  // Medisin ("App Sintasi") = Vue 2 + Quasar v1 + Vuex. Form halaman proses
  // terikat ke store.state.pelayanan.pasien dan data komponen (Diagnosa, Resep,
  // Racikan), jadi script mengisi STATE-nya, bukan mengetik di DOM.
  // Script TIDAK PERNAH memanggil fungsi simpan/submit milik Medisin.

  const LOG = (...args) => console.log("[AUTO KLINIK]", ...args);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const norm = (s) => (s || "").replace(/\s+/g, " ").trim().toLowerCase();
  async function waitFor(fn, timeout = 8000, step = 150, label = "elemen") {
    const start = Date.now();
    let lastErr;
    while (Date.now() - start < timeout) {
      try {
        const v = fn();
        if (v) return v;
      } catch (e) {
        lastErr = e;
      }
      await sleep(step);
    }
    throw new Error(`Timeout menunggu ${label}${lastErr ? ": " + lastErr.message : ""}`);
  }

  const MEDISIN_HOST = "app.medisin.id";
  // /admin/pelayanan/proses/<tab>/<base64 id_kunjungan>
  const PROSES_PATH = /^\/admin\/pelayanan\/proses(?:-dokter)?\/[^/]+\/([^/]+)/;

  // Id kunjungan dari URL (pure, diuji).
  function kunjunganIdFromPath(pathname) {
    const m = String(pathname || "").match(PROSES_PATH);
    if (!m) return null;
    try {
      return atob(decodeURIComponent(m[1])) || null;
    } catch (_) {
      return null;
    }
  }
  const urlKunjunganId = () => kunjunganIdFromPath(location.pathname);

  function vueRoot() {
    try {
      return document.querySelector("#q-app")?.__vue__?.$root || null;
    } catch (_) {
      return null;
    }
  }

  // Semua komponen Vue di halaman (pohon $children dari root).
  function allVm() {
    const root = vueRoot();
    const out = [];
    if (!root) return out;
    const walk = (v) => {
      out.push(v);
      for (const c of v.$children || []) walk(c);
    };
    walk(root);
    return out;
  }
  // Komponen Medisin dikenali dari name ATAU tag pendaftarannya (mis. "Resep").
  const vmName = (v) => v?.$options?.name || v?.$options?._componentTag || "";
  const findVm = (name) => allVm().find((v) => vmName(v) === name) || null;

  const storePasien = () => vueRoot()?.$store?.state?.pelayanan?.pasien || null;

  // Sesaat setelah pindah pasien, store masih berisi pasien SEBELUMNYA. Data hanya
  // dipakai bila id kunjungan di store sama dengan yang ada di URL.
  function pasienAktif() {
    const p = storePasien();
    const id = urlKunjunganId();
    return p && id && String(p.id_kunjungan) === id ? p : null;
  }

  async function waitPasienReady(timeout = 15000) {
    if (!vueRoot())
      throw new Error("Aplikasi Medisin tidak terbaca. Pastikan script dijalankan dengan mode inject \"page\".");
    try {
      return await waitFor(pasienAktif, timeout, 200, "data pasien");
    } catch (_) {
      throw new Error("Data pasien di halaman ini belum selesai dimuat. Tunggu sebentar lalu coba lagi.");
    }
  }

  function needPasien() {
    const p = pasienAktif();
    if (!p) throw new Error("Data pasien di halaman ini belum selesai dimuat. Tunggu sebentar lalu coba lagi.");
    return p;
  }

  function needVm(name, label) {
    needPasien();
    const v = findVm(name);
    if (!v) throw new Error(`Bagian ${label} tidak ada di tab ini. Buka tab DOKTER pada halaman pelayanan pasien.`);
    return v;
  }

  const isBlank = (v) => v == null || String(v).trim() === "";
  // Set reaktif (kunci yang belum ada di objek tetap terpantau Vue).
  function setReactive(obj, key, value) {
    const root = vueRoot();
    if (root?.$set) root.$set(obj, key, value);
    else obj[key] = value;
  }

  // ============================================================
  // 3. FORM PELAYANAN — kesadaran, prognosa, status pulang, anamnesa, diagnosa
  // ============================================================

  // QSelect yang v-model-nya cocok (mis. "pasien.jenis_prognosa").
  function findSelectByModel(re) {
    return (
      allVm().find((v) => v.$options?.name === "QSelect" && re.test(v.$vnode?.data?.model?.expression || "")) ||
      null
    );
  }

  // Isi pilihan pasien[field] dengan opsi yang labelnya cocok `wantRe`, HANYA bila
  // masih kosong. Mengembalikan {kept} bila dokter sudah memilih nilai lain.
  function setSelectIfBlank(field, wantRe, label) {
    const p = needPasien();
    const sel = findSelectByModel(new RegExp(`(?:^|\\.)pasien\\.${field}$`));
    const opts = sel?.$props?.options || [];
    const ov = sel?.$props?.optionValue || "value";
    const ol = sel?.$props?.optionLabel || "label";
    const pick = (o, key) => (typeof key === "function" ? key(o) : o && typeof o === "object" ? o[key] : o);
    const cur = p[field];
    if (!isBlank(cur)) {
      const curVal = cur && typeof cur === "object" ? pick(cur, ov) : cur;
      const o = opts.find((x) => String(pick(x, ov)) === String(curVal));
      const shown = o ? String(pick(o, ol)) : String(curVal);
      return o && !wantRe.test(shown) ? { kept: shown } : false;
    }
    if (!sel) throw new Error(`Kolom ${label} tidak ditemukan`);
    const want = opts.find((x) => wantRe.test(String(pick(x, ol))));
    if (!want) throw new Error(`Pilihan ${label} yang sesuai tidak ada di daftar`);
    setReactive(p, field, sel.$props.emitValue ? pick(want, ov) : want);
    LOG(`${label} -> ${pick(want, ol)}`);
    return true;
  }

  const setConsciousness = async () => setSelectIfBlank("kesadaran_id", /compos\s*mentis/i, "Kesadaran");
  const setPrognosis = async () => setSelectIfBlank("jenis_prognosa", /bonam/i, "Jenis Prognosa");
  const setDischarge = async () => setSelectIfBlank("status_pulang", /^(?:berobat|rawat) jalan$/i, "Status Pulang");

  // Keluhan Utama (pasien.keluhan) -> Anamnesa (pasien.keluhan_lainya) bila masih kosong.
  async function copyChiefComplaintToAnamnesis() {
    const p = needPasien();
    const chief = String(p.keluhan || "").trim();
    if (!chief) {
      LOG("Resume: Keluhan Utama kosong -> Anamnesa tidak disalin");
      return false;
    }
    const current = String(p.keluhan_lainya || "").trim();
    if (current === chief) return false;
    if (current) {
      LOG("Resume: Anamnesa sudah diisi -> tidak ditimpa");
      return { kept: current.length > 40 ? current.slice(0, 40) + "…" : current };
    }
    setReactive(p, "keluhan_lainya", chief);
    return true;
  }

  // Keluhan yang diubah di Paket Resep -> Keluhan Utama; Anamnesa ikut hanya bila
  // masih kosong atau masih sama dengan keluhan sebelumnya (bukan ketikan dokter).
  function writeComplaintToPage(textNew, textBefore) {
    const p = pasienAktif();
    if (!p) return false;
    const before = String(textBefore || "").trim();
    const anamnesis = String(p.keluhan_lainya || "").trim();
    const chiefOld = String(p.keluhan || "").trim();
    setReactive(p, "keluhan", textNew);
    if (!anamnesis || anamnesis === before || anamnesis === chiefOld) setReactive(p, "keluhan_lainya", textNew);
    return true;
  }

  // ---------------- DIAGNOSA (ICD-10) ----------------
  const ICD_CODE = /^[A-Z]\d{2}(?:\.\d{1,2})?$/;
  const icdOptionCode = (o) => {
    const direct = String(o?.icd_kode || o?.value || "").toUpperCase().trim();
    if (ICD_CODE.test(direct)) return direct;
    const m = String(o?.label || "").toUpperCase().match(/\b[A-Z]\d{2}(?:\.\d{1,2})?\b/);
    return m ? m[0] : "";
  };

  // Kode template "J06" cocok dengan "J06" maupun turunannya "J06.9" (pure, diuji).
  function icdCodeMatches(templateCode, pageCode) {
    const t = String(templateCode || "").toUpperCase().trim();
    const c = String(pageCode || "").toUpperCase().trim();
    if (!t || !c) return false;
    return c === t || (!t.includes(".") && c.startsWith(t + "."));
  }

  // Opsi ICD untuk kode template: kode persis; bila kode 3 karakter tidak ada sebagai
  // pilihan, dipakai turunan ".9" (tidak spesifik). Tidak pernah memilih yang lain. (pure)
  function pickIcdOption(options, code) {
    const want = String(code || "").toUpperCase().trim();
    const list = options || [];
    return (
      list.find((o) => icdOptionCode(o) === want) ||
      (!want.includes(".") ? list.find((o) => icdOptionCode(o) === want + ".9") : null) ||
      null
    );
  }

  // Kode ICD dari baris diagnosa yang SUDAH tersimpan (nama kolom bisa berbeda).
  function savedIcdCode(d) {
    for (const k of ["icd_kode", "icdx_kode", "kode_icdx", "kd_diag", "kdDiag", "kode"]) {
      const v = String(d?.[k] || "").toUpperCase().trim();
      if (ICD_CODE.test(v)) return v;
    }
    for (const v of Object.values(d || {})) {
      const s = typeof v === "string" ? v.toUpperCase().trim() : "";
      if (ICD_CODE.test(s)) return s;
    }
    return "";
  }

  // Diagnosa di halaman: yang sudah tersimpan + yang baru terisi di baris input.
  function selectedIcdEntries() {
    const dg = pasienAktif() ? findVm("Diagnosa") : null;
    if (!dg) return [];
    const out = [];
    const push = (code, name) => {
      if (!code || out.some((e) => e.code === code)) return;
      out.push({ code, name: String(name || "").trim(), role: out.length ? "Sekunder" : "Primer" });
    };
    for (const d of Array.isArray(dg.data) ? dg.data : [])
      push(savedIcdCode(d), d?.en || d?.icd_en || d?.kasus || d?.nama || d?.ind || "");
    for (const r of dg.input_icdx || []) if (r?.val) push(icdOptionCode(r.val), r.val.en || r.kasus || "");
    return out;
  }

  // Cari ICD lewat fungsi Medisin sendiri (otomatis memakai daftar PCare untuk pasien BPJS).
  async function searchIcd(code) {
    const dg = needVm("Diagnosa", "Diagnosa");
    dg.icdx_opt = [];
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`Pencarian ICD ${code} terlalu lama`)), 25000);
      const done = () => {
        clearTimeout(timer);
        resolve();
      };
      Promise.resolve(
        dg.loadIcdx(
          code,
          (apply) => {
            try {
              if (typeof apply === "function") apply();
            } finally {
              done();
            }
          },
          done,
        ),
      ).catch((e) => {
        clearTimeout(timer);
        reject(new Error(`Pencarian ICD ${code} gagal: ${e?.message || e}`));
      });
    });
    return Array.isArray(dg.icdx_opt) ? dg.icdx_opt : [];
  }

  // ICD yang diisi SCRIPT di halaman ini. Hanya ini yang boleh diganti otomatis
  // saat keluhan diubah; diagnosa pilihan dokter tidak disentuh.
  const autoDx = { href: "", codes: new Set() };
  function autoDxForPage() {
    if (autoDx.href !== location.pathname) {
      autoDx.href = location.pathname;
      autoDx.codes.clear();
    }
    return autoDx;
  }

  // Isi satu baris Diagnosa dengan kode pertama dx.icd yang tersedia. TIDAK menekan SIMPAN.
  async function fillDiagnosis(dx) {
    const dg = needVm("Diagnosa", "Diagnosa");
    const codes = dx.icd.map((c) => c.toUpperCase());
    const existing = selectedIcdEntries().find((e) => codes.some((c) => icdCodeMatches(c, e.code)));
    if (existing) return { diagCode: null, icdCode: existing.code, skipped: true, diagnosisText: existing.name };

    const errors = [];
    for (const code of codes) {
      let opt = null;
      try {
        opt = pickIcdOption(await searchIcd(code), code);
      } catch (e) {
        errors.push(e.message);
        continue;
      }
      if (!opt) {
        errors.push(`ICD ${code} tidak ada di daftar Medisin.`);
        continue;
      }
      let row = (dg.input_icdx || []).find((r) => !r.val);
      if (!row) {
        dg.addColom();
        row = dg.input_icdx[dg.input_icdx.length - 1];
      }
      row.val = opt;
      try {
        dg.setIcdx(opt, row);
      } catch (_) {
        row.kasus = opt.en || row.kasus;
      }
      if (!row.kasus && opt.en) row.kasus = opt.en;
      row.tacc = "-1"; // Tanpa TACC (bawaan Medisin)
      const icdCode = icdOptionCode(opt);
      autoDxForPage().codes.add(icdCode);
      LOG(`Diagnosa terisi: ${icdCode} ${opt.en || ""} (belum disimpan)`);
      return { diagCode: null, icdCode, skipped: false, diagnosisText: opt.en || dx.query || "" };
    }
    throw new Error(errors.join(" "));
  }

  // Keluhan diubah di Paket Resep -> diagnosa ikut diperbarui. Baris yang dulu diisi
  // script (belum disimpan) diganti; diagnosa dokter / yang sudah tersimpan dibiarkan.
  async function updateDiagnosisFromComplaint(complaint) {
    const vitals = assessVitals(readVitalsFromPage(), getPatientAgeFromIdentity()?.ageYears ?? null);
    const found = detectDiagnosisFromComplaint(complaint, { vitals });
    const dx = found && DIAGNOSIS_TEMPLATES.find((d) => d.key === found.key);
    if (!dx) return { dx: null, note: "diagnosis tidak dikenali dari keluhan; Diagnosa tidak diubah" };
    const page = selectedIcdEntries();
    if (dx.icd.some((c) => page.some((e) => icdCodeMatches(c, e.code)))) return { dx, note: `${dx.label} sudah terisi` };
    const dg = needVm("Diagnosa", "Diagnosa");
    const auto = autoDxForPage();
    const saved = new Set((Array.isArray(dg.data) ? dg.data : []).map(savedIcdCode));
    const doctorIcd = page.filter((e) => !auto.codes.has(e.code) || saved.has(e.code));
    for (const code of [...auto.codes]) {
      const row = (dg.input_icdx || []).find((r) => r.val && icdOptionCode(r.val) === code);
      if (row && !saved.has(code)) {
        row.val = null;
        row.kasus = null;
      }
      auto.codes.delete(code);
    }
    const r = await fillDiagnosis(dx);
    return {
      dx,
      note:
        `${dx.label} (ICD ${r.icdCode})` +
        (doctorIcd.length ? ` · diagnosa lain dibiarkan: ${doctorIcd.map((e) => e.code).join(", ")}` : ""),
    };
  }

  // Template ISPA lama (tidak ada di menu; dipertahankan untuk runTemplate("ispa")).
  async function setDiagnosisAndIcd() {
    await fillDiagnosis(DIAGNOSIS_TEMPLATES.find((d) => d.key === "ISPA"));
    await setPrognosis();
  }

  // ---------------- TINDAKAN (tarif jasa konsultasi) ----------------
  // Nama tarif mengikuti penjamin: "BPJS - Dokter Umum Jasa Konsultasi",
  // "Dokter Umum Jasa Konsultasi" (UMUM), "BPJS TK - …", "Inhealth - …". (pure, diuji)
  function serviceNameFor(penjamin) {
    const base = String(TEMPLATE.service || "").replace(/^BPJS\s*-\s*/i, "").trim();
    const prefix = penjaminPrefix(penjamin);
    return prefix ? `${prefix} - ${base}` : base;
  }

  async function warmServiceList() {}

  // Isi satu baris Tindakan dengan jasa konsultasi dokter umum sesuai penjamin.
  // Hanya nama tarif yang SAMA PERSIS; hanya di poli umum; tidak dobel. TIDAK menekan SIMPAN.
  async function addService() {
    const p = needPasien();
    const td = findVm("Tindakan");
    if (!td) throw new Error("bagian Tindakan tidak ada di tab ini");
    const poli = String(p.poli_nm || p.nama_poli || "");
    if (poli && !/umum/i.test(poli)) {
      LOG(`Tindakan: poli "${poli}" bukan poli umum -> jasa konsultasi tidak diisi`);
      return false;
    }
    const name = serviceNameFor(p.penjamin_nm);
    const same = (x) => drugNameKey(x) === drugNameKey(name);
    const savedHas = (Array.isArray(p.tindakan) ? p.tindakan : []).some(
      (t) => t && Object.values(t).some((v) => typeof v === "string" && same(v)),
    );
    if (savedHas || (td.input_tindakan || []).some((r) => r.val && same(r.val.tarif_nm))) return false;

    const base = serviceNameFor("UMUM");
    td.tarif_opt = [];
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("pencarian tarif terlalu lama")), 15000);
      const done = () => {
        clearTimeout(timer);
        resolve();
      };
      td.loadTarif(
        base,
        (apply) => {
          try {
            if (typeof apply === "function") apply();
          } finally {
            done();
          }
        },
        done,
      );
    });
    const opt = (Array.isArray(td.tarif_opt) ? td.tarif_opt : []).find((o) => same(o?.tarif_nm));
    if (!opt) throw new Error(`tarif "${name}" tidak ada di daftar tarif`);
    let row = (td.input_tindakan || []).find((r) => !r.val);
    if (!row) {
      td.addColom();
      row = td.input_tindakan[td.input_tindakan.length - 1];
    }
    row.val = opt;
    try {
      td.onUpdateInput(opt, row); // harga tindakan
    } catch (e) {
      LOG("Harga tindakan tidak terisi otomatis: " + (e?.message || e));
    }
    LOG(`Tindakan terisi: ${opt.tarif_nm} (belum disimpan)`);
    return true;
  }
  // Baris tindakan yang diisi tetapi belum disimpan dokter (bagian Tindakan punya SIMPAN sendiri).
  function unsavedServiceNote() {
    const td = findVm("Tindakan");
    const names = (td?.input_tindakan || []).filter((r) => r?.val?.tarif_nm).map((r) => r.val.tarif_nm);
    return names.length ? ` Tindakan diisi (${names.join(", ")}): tekan SIMPAN di bagian Tindakan.` : "";
  }
  function validateAndReport() {}

  // ============================================================
  // 4. RESEP & RACIKAN
  // ============================================================

  function isMedicalSupplyItem(drug) {
    const key = norm(drug?.key || "");
    return ["strip ", "alkohol swab", "blood lancet", "spuit ", "handscoon", "pot plastik"].some((k) =>
      key.includes(k),
    );
  }

  // Sediaan sirup (satuan pemakaian ml).
  function isSyrupMedication(drug) {
    const key = norm(drug?.key || "");
    const unit = norm(drug?.unit || "");
    const usage = norm(drug?.usageUnit || "");
    if (usage && usage !== "ml") return false;
    return ["ml", "bottle", "botol"].includes(unit) || /syrup|sirup|\bsyr\b|suspensi|\bsusp\b/.test(key);
  }

  function getItemUnit(itemKey) {
    return String(ITEMS?.[itemKey]?.unit || "").trim();
  }

  function buildDrugForItem(itemKey, recipe) {
    const item = ITEMS[itemKey];
    if (!item) throw new Error(`Item database tidak ditemukan: ${itemKey}`);
    return {
      key: item.target,
      search: item.keyword,
      freq: recipe.freq,
      dose: recipe.dose,
      days: recipe.days,
      total: recipe.total,
      instruction: recipe.instruction,
      unit: item.unit,
      usageUnit: item.usageUnit || "",
    };
  }

  function collectBhpForActions(actionKeys) {
    const totals = new Map();
    const labels = [];
    for (const key of [...new Set(actionKeys || [])]) {
      const action = PACKAGE_ACTIONS.find((x) => x.key === key);
      const tpl = action ? RECIPE_TEMPLATES[action.key] : null;
      if (!action || !tpl?.medicines?.length) continue;
      labels.push(action.label);
      for (const m of tpl.medicines) {
        const qty = Number(m.total || m.dose || 1) || 1;
        totals.set(m.item, (totals.get(m.item) || 0) + qty);
      }
    }
    return { labels, items: [...totals].map(([item, total]) => ({ item, total: String(total) })) };
  }

  function parseStockText(raw) {
    const m = String(raw || "").match(/sisa\s*:?\s*(-?[\d.,]+)/i);
    if (!m) return null;
    const n = Number(m[1].replace(/[.,](?=\d{3}\b)/g, "").replace(",", "."));
    return Number.isFinite(n) ? n : null;
  }

  // ---------------- SIGNA ----------------
  // Medisin hanya punya SATU kolom signa (teks). Disusun dari template lama:
  // "<frekuensi> x <dosis> [satuan] [instruksi]", mis. "3 x 1 setelah makan",
  // "3 x 5 ml setelah makan", "2 x 1 oles". (pure, diuji)
  function signaText(freq, dose, unitWord, instruction) {
    const f = String(freq ?? "").trim();
    const d = String(dose ?? "").trim();
    const head = f && d ? `${f} x ${d}` : f || d;
    return [head, String(unitWord || "").trim().toLowerCase(), String(instruction || "").trim().toLowerCase()]
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function buildSigna(drug) {
    if (isMedicalSupplyItem(drug)) return "";
    const usage = norm(drug.usageUnit || "");
    const unitWord = usage || (isSyrupMedication(drug) ? "ml" : "");
    // Sama seperti versi Klinik Pintar: instruksi kosong = "setelah makan" (kecuali obat oles/tetes).
    const instruction = drug.instruction || (usage && usage !== "ml" ? "" : "SETELAH MAKAN");
    return signaText(drug.freq, drug.dose, unitWord, instruction);
  }

  // Bila master signa Medisin punya tulisan yang sama (beda huruf besar/spasi saja),
  // tulisan master yang dipakai. (pure, diuji)
  const signaKey = (s) => String(s || "").toLowerCase().replace(/[\s.]+/g, "");
  function matchSignaMaster(signaOptions, wanted) {
    const w = signaKey(wanted);
    if (!w) return "";
    const hit = (signaOptions || []).find((o) => signaKey(o?.nama ?? o) === w);
    return hit ? String(hit.nama ?? hit) : wanted;
  }

  // ---------------- PEMETAAN NAMA OBAT ----------------
  // Master obat klinik memakai awalan per penjamin dengan stok terpisah:
  // "BPJS -- X" (BPJS), "X" (UMUM), "BPJS TK -- X", "IMR -- X", "IDN -- X".
  // Aturan: dipilih otomatis HANYA obat bernama persis "<awalan penjamin> -- <nama template>"
  // (UMUM: tanpa awalan). Selain itu dokter memilih sekali dari daftar Medisin; pilihannya
  // disimpan di browser ini (localStorage) per klinik + penjamin.
  const DRUG_MAP_PREFIX = "auto-klinik-medisin:obat:";
  const drugNameKey = (s) => String(s || "").replace(/\s+/g, " ").trim().toUpperCase();
  const itemBaseName = (itemKey) =>
    String(ITEMS[itemKey]?.target || itemKey)
      .replace(/^BPJS\s*--\s*/i, "")
      .trim();

  // "BPJS -- ZINC 20 MG" -> {prefix:"BPJS", base:"ZINC 20 MG"}; tanpa awalan -> prefix "". (pure, diuji)
  function splitProductPrefix(name) {
    const text = String(name || "").trim();
    const m = text.match(/^(.+?)\s*--\s*(.+)$/);
    return m ? { prefix: drugNameKey(m[1]), base: m[2].trim() } : { prefix: "", base: text };
  }

  // Awalan nama obat/tarif untuk penjamin pasien. (pure, diuji)
  function penjaminPrefix(penjamin) {
    const p = drugNameKey(penjamin);
    if (!p || p === "UMUM") return "";
    if (/^BPJS(?: KESEHATAN)?$/.test(p)) return "BPJS";
    if (/^BPJS\b.*\b(?:TK|KET|KETENAGAKERJAAN)\b/.test(p)) return "BPJS TK";
    return p;
  }

  // Obat bernama persis "<awalan penjamin> -- <nama>" (UMUM: tanpa awalan). (pure, diuji)
  function pickProductForPenjamin(options, baseName, penjamin) {
    const want = penjaminPrefix(penjamin);
    const base = drugNameKey(baseName);
    return (
      (options || []).find((o) => {
        const s = splitProductPrefix(productName(o));
        return s.prefix === want && drugNameKey(s.base) === base;
      }) || null
    );
  }

  // Kata pencarian awal untuk daftar pilihan: 6 huruf pertama dari kata pertama (≥3 huruf)
  // nama obat, supaya beda ejaan tetap ketemu (CETIRIZINE -> "CETIRI" cocok "CETIRIZIN"). (pure)
  function drugSearchWord(name) {
    const words = String(name || "").split(/[^A-Za-z]+/).filter(Boolean);
    return (words.find((w) => w.length >= 3) || String(name || "").trim()).slice(0, 6);
  }

  function drugMapStorageKey() {
    return DRUG_MAP_PREFIX + String(storePasien()?.klinik_id || "klinik");
  }
  function loadDrugMap() {
    try {
      const v = JSON.parse(localStorage.getItem(drugMapStorageKey()) || "{}");
      return v && typeof v === "object" ? v : {};
    } catch (_) {
      return {};
    }
  }
  function saveDrugMap(map) {
    try {
      localStorage.setItem(drugMapStorageKey(), JSON.stringify(map));
    } catch (e) {
      LOG("Pemetaan obat tidak bisa disimpan: " + (e?.message || e));
    }
  }
  const currentPenjamin = () => String(pasienAktif()?.penjamin_nm || "UMUM").trim().toUpperCase();

  const productName = (opt) => String(opt?.value?.produk_nm || "").trim();
  const exactProduct = (options, name) =>
    (options || []).find((o) => drugNameKey(productName(o)) === drugNameKey(name)) || null;

  // Cari obat lewat fungsi Medisin sendiri (loadObat milik Resep/Racikan): hasilnya
  // sudah disaring penjamin & hanya obat yang punya stok di lokasi non-gudang.
  async function searchProducts(vm, query, kategori) {
    const q = String(query || "").trim();
    if (q.length < 2) return [];
    const keep = Array.isArray(vm.obat_opt) ? vm.obat_opt.slice() : [];
    let got = null;
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`Pencarian obat "${q}" gagal/terlalu lama`)), 15000);
      const done = () => {
        clearTimeout(timer);
        resolve();
      };
      Promise.resolve(
        vm.loadObat(
          q,
          (apply) => {
            try {
              if (typeof apply === "function") apply();
              got = Array.isArray(vm.obat_opt) ? vm.obat_opt.slice() : [];
            } finally {
              done();
            }
          },
          done,
          kategori, // "BHP" untuk daftar BHP; kosong untuk obat
        ),
      ).catch((e) => {
        clearTimeout(timer);
        reject(new Error(`Pencarian obat "${q}" gagal: ${e?.message || e}`));
      });
    });
    // Opsi lama digabung kembali agar label baris yang sudah terisi tetap tampil.
    const merged = (got || []).slice();
    for (const o of keep) if (!merged.some((x) => x.produk_id === o.produk_id)) merged.push(o);
    vm.obat_opt = merged;
    return got || [];
  }

  // Dialog: dokter memilih obat Medisin untuk satu nama template. null = dilewati.
  function askDrugMapping({ base, penjamin, staleName, candidates, search }) {
    return new Promise((resolve) => {
      document.getElementById("ak-drugmap")?.remove();
      const shade = document.createElement("div");
      shade.id = "ak-drugmap";
      shade.innerHTML = `
        <div class="akd-card" role="dialog" aria-modal="true">
          <div class="akd-title">Pilih obat di Medisin</div>
          <div class="akd-sub">Template: <b>${escapePreviewHtml(base)}</b> · penjamin <b>${escapePreviewHtml(penjamin || "UMUM")}</b><br>Obat dengan nama ini untuk penjamin tersebut tidak ada di daftar Medisin${
            staleName ? ` (pilihan sebelumnya "${escapePreviewHtml(staleName)}" tidak ditemukan / stok kosong)` : ""
          }. Pilih obat yang sama. Pilihan diingat untuk berikutnya.</div>
          <input id="ak-drugmap-q" type="text" autocomplete="off" placeholder="Cari nama obat (min. 2 huruf)" value="${escapePreviewHtml(drugSearchWord(base))}">
          <div id="ak-drugmap-list" class="akd-list"></div>
          <div class="akd-foot">
            <span class="akd-hint">Hanya obat yang punya stok yang tampil.</span>
            <button id="ak-drugmap-skip" type="button">Lewati obat ini</button>
          </div>
        </div>`;
      (document.body || document.documentElement).appendChild(shade);
      const listEl = shade.querySelector("#ak-drugmap-list");
      const input = shade.querySelector("#ak-drugmap-q");
      let current = [];
      const finish = (opt) => {
        shade.remove();
        resolve(opt);
      };
      const render = (list, note = "") => {
        current = list || [];
        listEl.innerHTML = current.length
          ? current
              .map(
                (o, i) =>
                  `<button type="button" class="akd-opt" data-i="${i}"><span>${escapePreviewHtml(productName(o))}</span><small>stok ${escapePreviewHtml(o.totalStockSystem ?? "?")}</small></button>`,
              )
              .join("")
          : `<div class="akd-empty">${escapePreviewHtml(note || "Tidak ada obat yang cocok. Coba kata lain.")}</div>`;
      };
      render(candidates);
      listEl.addEventListener("click", (ev) => {
        const b = ev.target.closest?.(".akd-opt");
        if (b) finish(current[Number(b.dataset.i)] || null);
      });
      let timer = null;
      let seq = 0;
      input.addEventListener("input", () => {
        clearTimeout(timer);
        timer = setTimeout(async () => {
          const q = input.value.trim();
          if (q.length < 2) return;
          const mine = ++seq;
          render([], "Mencari…");
          try {
            const r = await search(q);
            if (mine === seq) render(r);
          } catch (e) {
            if (mine === seq) render([], e?.message || String(e));
          }
        }, 350);
      });
      shade.querySelector("#ak-drugmap-skip").addEventListener("click", () => finish(null));
    });
  }

  // Opsi obat Medisin untuk satu item template; null bila dokter melewati.
  async function resolveProduct(vm, itemKey, kategori) {
    const base = itemBaseName(itemKey);
    const penjamin = currentPenjamin();
    const mine = loadDrugMap()?.[penjamin]?.[itemKey] || "";
    if (mine) {
      const hit = exactProduct(await searchProducts(vm, mine, kategori), mine);
      if (hit) return hit;
    }
    const found = await searchProducts(vm, base, kategori);
    const auto = pickProductForPenjamin(found, base, penjamin);
    if (auto) return auto;
    const want = penjaminPrefix(penjamin);
    const list = found.length ? found : await searchProducts(vm, drugSearchWord(base), kategori);
    // Obat dengan awalan penjamin pasien ditaruh paling atas.
    const candidates = list
      .slice()
      .sort(
        (a, b) =>
          Number(splitProductPrefix(productName(b)).prefix === want) -
          Number(splitProductPrefix(productName(a)).prefix === want),
      );
    const pick = await askDrugMapping({
      base,
      penjamin,
      staleName: mine,
      candidates,
      search: (q) => searchProducts(vm, q, kategori),
    });
    if (!pick) return null;
    const fresh = loadDrugMap();
    (fresh[penjamin] ||= {})[itemKey] = productName(pick);
    saveDrugMap(fresh);
    LOG(`Pemetaan obat disimpan (${penjamin}): ${base} -> ${productName(pick)}`);
    return pick;
  }

  // Baris resep kosong pertama; bila tidak ada, tambah baris.
  function nextEmptyRow(vm, listKey) {
    let row = (vm[listKey] || []).find((r) => !r.val);
    if (!row) {
      vm.addColom();
      row = vm[listKey][vm[listKey].length - 1];
    }
    return row;
  }

  function putProductInRow(vm, row, opt, qty) {
    if (!(vm.obat_opt || []).some((o) => o.produk_id === opt.produk_id)) vm.obat_opt = [...(vm.obat_opt || []), opt];
    row.val = opt.value;
    try {
      vm.loadBatchDetails(row); // batch pertama yang masih ada stok
    } catch (e) {
      LOG(`Batch ${productName(opt)} tidak terisi otomatis: ${e?.message || e}`);
    }
    const n = Number(String(qty ?? "").replace(",", "."));
    row.jumlah = Number.isFinite(n) && n > 0 ? n : 1;
  }

  // Obat sudah ada di resep (baris input atau daftar yang sudah tersimpan)?
  function productAlreadyInRecipe(rs, opt) {
    const id = opt.produk_id;
    const name = drugNameKey(productName(opt));
    if ((rs.input_resep || []).some((r) => r.val && r.val.produk_id === id)) return true;
    const saved = [...(Array.isArray(rs.resep) ? rs.resep : []), ...(Array.isArray(pasienAktif()?.resep) ? pasienAktif().resep : [])];
    return saved.some((x) => x && (x.produk_id === id || drugNameKey(x.produk_nm) === name));
  }

  // BHP untuk tindakan (strip, lancet, swab, spuit…): diisi di tab BHP bagian Resep.
  // TIDAK menekan SIMPAN. Mengembalikan catatan (yang sudah ada / belum terisi).
  async function addBhpItems(list) {
    const rs = needVm("Resep", "Resep");
    if (!Array.isArray(rs.input_bhp)) throw new Error("bagian BHP tidak ada di halaman ini");
    const p = needPasien();
    const notes = [];
    let filled = 0;
    for (const it of list || []) {
      const label = itemBaseName(it.item);
      let opt = null;
      try {
        opt = await resolveProduct(rs, it.item, "BHP");
      } catch (e) {
        notes.push(`${label} belum terisi (${String(e?.message || e).replace(/\.$/, "")})`);
        continue;
      }
      if (!opt) {
        notes.push(`${label} belum terisi (dilewati)`);
        continue;
      }
      const id = opt.produk_id;
      const saved = Array.isArray(p.tarif_bhp) ? p.tarif_bhp : [];
      if (
        rs.input_bhp.some((r) => r.produk_id && r.produk_id.produk_id === id) ||
        saved.some((x) => x && (x.produk_id === id || drugNameKey(x.produk_nm) === drugNameKey(productName(opt))))
      ) {
        notes.push(`${productName(opt)} sudah ada`);
        continue;
      }
      let row = rs.input_bhp.find((r) => !r.produk_id);
      if (!row) {
        rs.input_bhp.push({ produk_id: "", qty: 0, batches: [], produk_detail_id: "" });
        row = rs.input_bhp[rs.input_bhp.length - 1];
      }
      if (!(rs.obat_opt || []).some((o) => o.produk_id === id)) rs.obat_opt = [...(rs.obat_opt || []), opt];
      setReactive(row, "produk_id", opt);
      try {
        rs.batchDetailTarif(row); // batch yang masih ada stok
      } catch (_) {
        notes.push(`${productName(opt)}: stok kosong, batch belum terpilih`);
      }
      const n = Number(it.total);
      row.qty = Number.isFinite(n) && n > 0 ? n : 1;
      filled++;
      LOG(`BHP: ${productName(opt)} x ${row.qty}`);
    }
    if (filled)
      notify("BHP terisi di tab BHP (bagian Resep). Buka tab BHP, periksa, lalu tekan SIMPAN di sana.", "info", 15000);
    else if ((list || []).length && notes.every((n) => /belum terisi/.test(n))) throw new Error(notes.join("; "));
    return notes;
  }

  function findRacikanModal() {
    const rk = findVm("Racikan");
    return rk && (rk.modal_add || rk.modal_add_template) ? rk : null;
  }

  // Isi baris Resep (Obat Satuan). TIDAK menekan SIMPAN: dokter meninjau lebih dulu.
  async function addRecipeItems(medicines) {
    const rs = needVm("Resep", "Resep");
    const alreadyInRecipe = [];
    const lowStock = [];
    const notFilled = [];

    for (let i = 0; i < medicines.length; i++) {
      const recipe = medicines[i];
      const drug = buildDrugForItem(recipe.item, recipe);
      const label = itemBaseName(recipe.item);
      let opt = null;
      try {
        opt = await resolveProduct(rs, recipe.item);
      } catch (e) {
        notFilled.push(`${label} (${String(e?.message || e).replace(/\.$/, "")})`);
        continue;
      }
      if (!opt) {
        notFilled.push(`${label} (dilewati, belum dipilih di daftar Medisin)`);
        continue;
      }
      if (productAlreadyInRecipe(rs, opt)) {
        alreadyInRecipe.push(productName(opt));
        continue;
      }
      const row = nextEmptyRow(rs, "input_resep");
      putProductInRow(rs, row, opt, drug.total);
      row.signa = matchSignaMaster(rs.signa_opt, buildSigna(drug));
      const stock = Number(opt.totalStockSystem);
      if (Number.isFinite(stock) && Number(row.jumlah) > stock)
        lowStock.push(`${productName(opt)} (butuh ${row.jumlah}, stok ${stock})`);
      LOG(`RESEP ${i + 1}/${medicines.length}: ${productName(opt)} | ${row.jumlah} | ${row.signa}`);
      await sleep(60);
    }

    if (lowStock.length)
      notify(`Stok kurang, ganti obat/jumlah sebelum SIMPAN resep: ${lowStock.join(", ")}.`, "error", 15000);
    if (alreadyInRecipe.length)
      notify(`Sudah ada di resep, tidak ditambahkan lagi (periksa dosisnya): ${alreadyInRecipe.join(", ")}.`, "warn", 12000);
    if (notFilled.length) throw new Error("belum terisi: " + notFilled.join("; "));
    return { alreadyInRecipe };
  }

  // ---------------- RACIKAN ----------------
  // Satuan template lama -> Jenis Racikan Medisin. (pure, diuji)
  function racikanJenisFor(tpl) {
    const unit = norm(tpl?.unit || "pulvis");
    if (unit === "oles") return "pot_salep";
    if (unit === "kapsul" || unit === "capsule") return "kapsul";
    if (unit === "ml") return "botol_sirup";
    return "kertas_puyer";
  }
  // "buat 10" -> 10 bungkus; tanpa angka (mis. "mf ungt") -> 1. (pure, diuji)
  function racikanQtyFor(tpl) {
    const m = String(tpl?.compoundInstruction || "").match(/(\d+)/);
    const n = m ? Number(m[1]) : 1;
    return n > 0 ? n : 1;
  }
  function racikanSignaFor(tpl) {
    const unit = norm(tpl?.unit || "");
    const instruction = String(tpl?.instruction || "");
    // "oles di lesi" sudah memuat kata oles; jangan ditulis dua kali.
    const unitWord = unit === "oles" && !/\boles\b/i.test(instruction) ? "oles" : "";
    return signaText(tpl?.doseFreq, tpl?.doseAmount, unitWord, instruction);
  }

  // Buka dialog "Tambah Racikan", isi semuanya, lalu TUNGGU dokter menekan SIMPAN
  // (atau menutup dialog). Script tidak menyimpan racikan.
  const lastAutoRacikan = { rk: null, name: "" };
  async function addRacikan(tpl) {
    const rk = needVm("Racikan", "Racikan");
    const title = tpl.title || tpl.name || "racikan";
    if (rk.modal_add || rk.modal_add_template)
      throw new Error(`${title}: dialog racikan masih terbuka. Simpan atau tutup dulu.`);

    // Bahan dicocokkan dulu (dialog pilih obat bisa muncul) sebelum dialog racikan dibuka.
    const parts = [];
    const missing = [];
    for (const ing of tpl.ingredients || []) {
      const opt = await resolveProduct(rk, ing.item);
      if (opt) parts.push({ opt, quantity: ing.quantity });
      else missing.push(itemBaseName(ing.item));
    }
    if (!parts.length) throw new Error(`${title}: tidak ada bahan yang dipilih di daftar Medisin.`);

    rk.modal_add = true;
    await sleep(350);
    let dirty = !isBlank(rk.form?.racikan_nama) || (rk.input_racikan || []).some((r) => r.val);
    // Sisa isian SCRIPT sendiri (dokter menutup dialog tanpa simpan) boleh dikosongkan.
    if (dirty && lastAutoRacikan.rk === rk && lastAutoRacikan.name === rk.form?.racikan_nama) {
      Object.assign(rk.form, { racikan_nama: null, racikan_jenis: null, racikan_qty: 0, racikan_signa: null });
      rk.input_racikan = [{ no: 1, val: "", batch: "", batches: [], jumlah: 1, diskon_resep: 0, signa: "" }];
      await sleep(100);
      dirty = false;
    }
    if (dirty) {
      throw new Error(
        `${title}: dialog Tambah Racikan masih berisi isian lain. Simpan atau kosongkan dulu, lalu input lagi.`,
      );
    }
    const signa = matchSignaMaster(rk.signa_opt, racikanSignaFor(tpl));
    rk.form.racikan_nama = tpl.name || title;
    lastAutoRacikan.rk = rk;
    lastAutoRacikan.name = rk.form.racikan_nama;
    rk.form.racikan_jenis = racikanJenisFor(tpl);
    rk.form.racikan_qty = racikanQtyFor(tpl);
    rk.form.racikan_signa = signa;
    const lowStock = [];
    for (const part of parts) {
      const row = nextEmptyRow(rk, "input_racikan");
      putProductInRow(rk, row, part.opt, part.quantity);
      row.signa = signa;
      const stock = Number(part.opt.totalStockSystem);
      if (Number.isFinite(stock) && Number(row.jumlah) > stock)
        lowStock.push(`${productName(part.opt)} (butuh ${row.jumlah}, stok ${stock})`);
    }
    LOG(`Racikan ${title} terisi di dialog (belum disimpan)`);
    notify(
      `Racikan terisi di dialog Tambah Racikan: ${title}. Periksa, lalu tekan SIMPAN di dialog itu (atau tutup bila batal).` +
        (missing.length ? ` Bahan belum masuk: ${missing.join(", ")}.` : "") +
        (lowStock.length ? ` STOK KURANG: ${lowStock.join(", ")}.` : ""),
      lowStock.length ? "error" : missing.length ? "warn" : "info",
      20000,
    );
    // Racikan berikutnya menunggu dialog ini selesai (maks. 10 menit).
    await waitFor(() => !rk.modal_add, 600000, 400, `dialog racikan ${title} ditutup`).catch(() => {
      throw new Error(`${title}: dialog racikan belum disimpan/ditutup.`);
    });
    await sleep(300);
  }

  // ============================================================
  // 5. DATA PASIEN — umur dari identitas, BB, pencarian template BB
  // Aturan kategori (Paket Resep Golongan):
  //   umur >17 tahun                    -> DEWASA (BB tidak diperlukan)
  //   umur <=17 tahun / tidak terbaca   -> BB wajib; BB >40 kg DEWASA, <=40 kg ANAK
  // ============================================================

  function parseWeightKg(value) {
    const normalized = String(value ?? "")
      .replace(",", ".")
      .replace(/[^0-9.]/g, "");
    const kg = Number(normalized);
    return Number.isFinite(kg) && kg > 0 ? kg : null;
  }

  // Format umur lama (dipertahankan untuk tes), misalnya
  // "<tanggal lahir> (30 tahun, 2 bulan, 5 hari)" atau "(30 tahun)".
  function parsePatientAge(rawText) {
    const textContent = String(rawText || "")
      .replace(/ /g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!textContent) return null;

    const patterns = [
      /\((\d+)\s*tahun\s*,\s*(\d+)\s*bulan\s*,\s*(\d+)\s*hari\)/i,
      /\((\d+)\s*tahun\s*,\s*(\d+)\s*bulan\)/i,
      /\((\d+)\s*tahun\s*,\s*(\d+)\s*bulan\s*,?\s*(\d+)\s*hari?\)/i,
    ];

    for (const re of patterns) {
      const m = textContent.match(re);
      if (!m) continue;
      const years = Number(m[1]) || 0;
      const months = Number(m[2]) || 0;
      const days = Number(m[3]) || 0;
      const ageYears = years + months / 12 + days / 365;
      return { years, months, days, ageYears, source: m[0] };
    }

    // Fallback untuk format singkat, misalnya "(30 tahun)".
    const simple = textContent.match(/\((\d+)\s*tahun\)/i);
    if (simple) {
      const years = Number(simple[1]);
      if (Number.isFinite(years)) {
        return { years, months: 0, days: 0, ageYears: years, source: simple[0] };
      }
    }

    return null;
  }

  // Umur dari store Medisin: pasien.umur "36 tahun 10 bulan 15 hari" (pure, diuji).
  function parseMedisinAge(raw) {
    const t = String(raw || "").toLowerCase();
    const num = (re) => {
      const m = t.match(re);
      return m ? Number(m[1]) : null;
    };
    const years = num(/(\d+)\s*(?:tahun|thn|th)\b/);
    const months = num(/(\d+)\s*(?:bulan|bln|bl)\b/);
    const days = num(/(\d+)\s*(?:hari|hr)\b/);
    if (years == null && months == null && days == null) return null;
    const y = years || 0;
    const m = months || 0;
    const d = days || 0;
    return { years: y, months: m, days: d, ageYears: y + m / 12 + d / 365, source: String(raw).trim() };
  }

  function getPatientAgeFromIdentity() {
    const p = pasienAktif();
    return p ? parseMedisinAge(p.umur) : null;
  }

  function formatPatientAge(info) {
    if (!info) return "Umur pasien dari identitas belum terdeteksi";
    const parts = [];
    if (info.years) parts.push(`${info.years} tahun`);
    if (info.months) parts.push(`${info.months} bulan`);
    if (info.days) parts.push(`${info.days} hari`);
    return parts.length
      ? `Umur dari identitas: ${parts.join(", ")}`
      : "Umur dari identitas: 0 tahun";
  }

  const isPlausibleWeight = (kg) => Number.isFinite(kg) && kg >= 0.5 && kg < 300;

  // Elemen milik script sendiri (launcher, overlay) tidak boleh ikut dibaca.
  const isOwnUi = (el) => !!el?.closest?.('#auto-klinik-box, [id^="ak-"]');

  // Cadangan berbasis teks: "Berat badan 18 kg" / "Berat badan 17 18 kg"
  // (beberapa kunjungan) -> ambil angka terakhir sebelum "kg" (kunjungan terbaru).
  function parseWeightFromVitalsText(rawText) {
    const pageText = String(rawText || "")
      .replace(/ /g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const patterns = [
      /berat\s*badan[\s:]*((?:[0-9]+(?:[.,][0-9]+)?\s+)*[0-9]+(?:[.,][0-9]+)?)\s*kg/i,
      /berat\s*badan[\s\S]{0,120}?([0-9]+(?:[.,][0-9]+)?)\s*kg/i,
    ];
    for (const re of patterns) {
      const m = pageText.match(re);
      if (!m) continue;
      const values = m[1].split(/\s+/).map(parseWeightKg).filter(isPlausibleWeight);
      if (values.length) return values[values.length - 1];
    }
    return null;
  }

  // BB terbaru dari tabel Tanda-Tanda Vital (dipulihkan dari v8.1.6).
  // Tabel bisa berupa <table> maupun <div>; kunjungan terbaru = kolom paling kanan.
  function getPatientWeightFromLatestVitals() {
    const kg = parseWeightKg(pasienAktif()?.berat_badan);
    return isPlausibleWeight(kg) ? { kg, source: "kolom Berat Badan" } : null;
  }

  // ---------------- TANDA-TANDA VITAL (v9.9) ----------------
  const VITAL_FIELDS = {
    temp: { names: ["suhu tubuh", "suhu"], ok: (v) => v >= 30 && v <= 45 },
    sys: { names: ["sistole", "sistolik", "tekanan darah sistolik"], ok: (v) => v >= 40 && v <= 300 },
    dia: { names: ["diastole", "diastolik", "tekanan darah diastolik"], ok: (v) => v >= 20 && v <= 200 },
    pulse: { names: ["nadi", "denyut nadi"], ok: (v) => v >= 20 && v <= 250 },
    rr: { names: ["frekuensi pernafasan", "frekuensi pernapasan", "pernapasan", "respirasi"], ok: (v) => v >= 4 && v <= 80 },
    spo2: { names: ["saturasi oksigen", "saturasi", "spo2"], ok: (v) => v >= 50 && v <= 100 },
  };

  function parseVitalNumber(raw) {
    const n = Number(String(raw ?? "").trim().replace(",", "."));
    return String(raw ?? "").trim() !== "" && Number.isFinite(n) ? n : null;
  }

  // TTV dibaca dari store Medisin (kolom Anamnesa/TTV kunjungan ini).
  const VITAL_STORE_KEYS = { temp: "suhu", sys: "sistole", dia: "diastole", pulse: "nadi", rr: "respirasi", spo2: "saturasi" };
  function readVitalsFromPage() {
    const p = pasienAktif();
    const out = {};
    for (const [key, field] of Object.entries(VITAL_FIELDS)) {
      const v = p ? parseVitalNumber(p[VITAL_STORE_KEYS[key]]) : null;
      out[key] = v != null && field.ok(v) ? v : null;
    }
    return out;
  }

  // Penilaian TTV (pure, diuji). Ambang: demam ≥37,5 °C; hipertensi ≥140/90
  // (krisis ≥180/110); hipotensi sistolik <90; takikardia >100; bradikardia <50;
  // takipnea >24; SpO2 <95 (berat <90). TD/nadi/napas hanya dinilai untuk umur ≥18
  // (anak memakai nilai normal sesuai umur, tidak dinilai otomatis).
  function assessVitals(v, ageYears = null) {
    const vit = v || {};
    const fmt = (n) => String(n).replace(".", ",");
    const adult = !(Number.isFinite(ageYears) && ageYears < 18);
    const flags = [];
    const add = (level, textMsg) => flags.push({ level, text: textMsg });
    const res = { fever: false, highFever: false, hypertension: false, crisis: false, flags, bp: null, temp: vit.temp ?? null };

    if (vit.temp != null && vit.temp >= 37.5) {
      res.fever = true;
      res.highFever = vit.temp >= 39;
      add(res.highFever ? "danger" : "warn", `Suhu ${fmt(vit.temp)} °C (${res.highFever ? "demam tinggi" : "demam"})`);
    }
    if (vit.sys != null && vit.dia != null) res.bp = `${vit.sys}/${vit.dia}`;
    if (adult && vit.sys != null) {
      const dia = vit.dia ?? 0;
      if (vit.sys >= 180 || dia >= 110) {
        res.hypertension = res.crisis = true;
        add("danger", `TD ${res.bp || vit.sys} mmHg: krisis hipertensi, evaluasi segera`);
      } else if (vit.sys >= 140 || dia >= 90) {
        res.hypertension = true;
        add("warn", `TD ${res.bp || vit.sys} mmHg (≥140/90)`);
      } else if (vit.sys < 90) {
        add("danger", `TD ${res.bp || vit.sys} mmHg: hipotensi`);
      }
    }
    if (adult && vit.pulse != null) {
      if (vit.pulse > 100) add("warn", `Nadi ${vit.pulse}/menit (takikardia)`);
      else if (vit.pulse < 50) add("warn", `Nadi ${vit.pulse}/menit (bradikardia)`);
    }
    if (adult && vit.rr != null && vit.rr > 24) add("warn", `Napas ${vit.rr}/menit (takipnea)`);
    if (vit.spo2 != null && vit.spo2 < 95)
      add(vit.spo2 < 90 ? "danger" : "warn", `SpO2 ${vit.spo2}% (${vit.spo2 < 90 ? "hipoksia berat" : "rendah"})`);
    return res;
  }

  function formatVitalsSummary(v) {
    const fmt = (n) => String(n).replace(".", ",");
    const parts = [];
    if (v?.temp != null) parts.push(`Suhu ${fmt(v.temp)}`);
    if (v?.sys != null || v?.dia != null) parts.push(`TD ${v.sys ?? "-"}/${v.dia ?? "-"}`);
    if (v?.pulse != null) parts.push(`Nadi ${v.pulse}`);
    if (v?.rr != null) parts.push(`RR ${v.rr}`);
    if (v?.spo2 != null) parts.push(`SpO2 ${v.spo2}%`);
    return parts.join(" · ");
  }

  // Isi teks kolom halaman, "" bila tidak ada. Medisin tidak punya kolom teks
  // "Diagnosa" (diagnosa = baris ICD), jadi label itu selalu "".
  const FIELD_KEYS = { "keluhan utama": "keluhan", anamnesa: "keluhan_lainya" };
  function readFieldText(label) {
    const key = FIELD_KEYS[norm(label)];
    const p = key ? pasienAktif() : null;
    return p ? String(p[key] || "").trim() : "";
  }

  // v9.4: saran obat dibaca dari KELUHAN UTAMA. Anamnesa hanya cadangan bila
  // Keluhan Utama kosong (anamnesa sering memuat riwayat yang bukan keluhan saat ini).
  function readChiefComplaintFromPage() {
    const chief = readFieldText("Keluhan Utama");
    if (chief) return { text: chief, source: "Keluhan Utama" };
    const anamnesis = readFieldText("Anamnesa");
    if (anamnesis) return { text: anamnesis, source: "Anamnesa (Keluhan Utama kosong)" };
    return { text: "", source: "" };
  }

  // Cari template yang rentang BB-nya memuat weightKg (lihat weightBands).
  function findWeightTemplate(templates, prefix, weightKg) {
    for (const [key, tpl] of Object.entries(templates)) {
      if (key.startsWith(prefix) && isWeightInBand(tpl.band, weightKg)) {
        return { key, tpl };
      }
    }
    return null;
  }

  // Racikan (RACIKAN_TEMPLATES) berbasis BB.
  function getWeightTemplate(prefix, weightKg) {
    return findWeightTemplate(RACIKAN_TEMPLATES, prefix, weightKg);
  }

  // Syrup non-racikan (RECIPE_TEMPLATES) berbasis BB.
  function getWeightRecipeTemplate(prefix, weightKg) {
    return findWeightTemplate(RECIPE_TEMPLATES, prefix, weightKg);
  }

  function getTemplateMedicineList(templateKey) {
    const tpl = RECIPE_TEMPLATES[templateKey];
    if (!tpl?.medicines?.length)
      throw new Error(`Template resep "${templateKey}" tidak ditemukan.`);
    return tpl.medicines;
  }

  function escapePreviewHtml(value) {
    return String(value ?? "").replace(
      /[&<>"']/g,
      (ch) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[ch],
    );
  }

  function formatPreviewMedicineRow(m) {
    const info = ITEMS[m.item] || {};
    const masterUnit = String(
      info.unit || getItemUnit(m.item || "") || "",
    ).trim();
    const syrup = isSyrupMedication(m) || norm(masterUnit) === "bottle";
    const doseText = String(m.dose ?? "").trim() || "-";
    const freqText = String(m.freq ?? "").trim() || "-";
    const daysText = String(m.days ?? "").trim();
    const totalText = String(m.total ?? "").trim();
    const doseUnit = syrup ? "mL" : masterUnit;
    const durationText = daysText
      ? `Durasi: ${escapePreviewHtml(daysText)} hari`
      : "";
    const quantityText = syrup
      ? totalText
        ? `Jumlah resep: ${escapePreviewHtml(totalText)} botol`
        : ""
      : totalText
        ? `Jumlah: ${escapePreviewHtml(totalText)} ${escapePreviewHtml(masterUnit)}`
        : "";
    const detail = syrup
      ? [
          `Dosis: ${escapePreviewHtml(doseText)} ${escapePreviewHtml(doseUnit)}`,
          `Frekuensi: ${escapePreviewHtml(freqText)}×/hari`,
          durationText,
          quantityText,
        ]
          .filter(Boolean)
          .join("<br>")
      : [
          `${escapePreviewHtml(doseText)} ${escapePreviewHtml(doseUnit)} · ${escapePreviewHtml(freqText)}×/hari`,
          durationText,
          quantityText,
        ]
          .filter(Boolean)
          .join("<br>");
    return `<div class="ak-live-preview-row"><div><b>${escapePreviewHtml(info.target || m.item)}</b><small>${escapePreviewHtml(m.sourceLabel || "")}</small></div><div>${detail}<br><small>${escapePreviewHtml(m.instruction || "")}</small></div></div>`;
  }

  function formatPreviewRacikanRow(r) {
    const tpl = r.tpl || {};
    const ingredients = Array.isArray(tpl.ingredients) ? tpl.ingredients : [];
    const ing = ingredients
      .map(
        (i) =>
          `${escapePreviewHtml(ITEMS[i.item]?.target || i.item)}: ${escapePreviewHtml(i.quantity)}`,
      )
      .join("<br>");
    const details = [
      tpl.doseFreq ? `Frekuensi: ${escapePreviewHtml(tpl.doseFreq)}` : "",
      tpl.doseAmount ? `Dosis: ${escapePreviewHtml(tpl.doseAmount)}` : "",
      tpl.duration ? `Durasi: ${escapePreviewHtml(tpl.duration)} hari` : "",
      tpl.instruction ? escapePreviewHtml(tpl.instruction) : "",
    ]
      .filter(Boolean)
      .join("<br>");
    return `<div class="ak-live-preview-racikan"><b>${escapePreviewHtml(tpl.title || tpl.name || r.sourceLabel || "RACIKAN")}</b><div>${ing || "<span>Komponen racikan tidak tersedia.</span>"}</div><small>${details}${r.sourceLabel ? `<br>${escapePreviewHtml(r.sourceLabel)}` : ""}</small></div>`;
  }

  function buildLivePreviewHtml(preview, title = "PREVIEW OBAT TERPILIH") {
    const medRows = (preview.medicines || [])
      .map(formatPreviewMedicineRow)
      .join("");
    const racikanRows = (preview.racikans || [])
      .map(formatPreviewRacikanRow)
      .join("");
    const notes = [
      ...(preview.skipped || []),
      ...(preview.skippedDuplicates || []).map(
        (x) => `Duplikat dilewati: ${x.split(": ")[1] || x}`,
      ),
      ...(preview.notes || []),
    ];
    return `<div class="ak-live-preview-box"><div class="ak-live-preview-head"><div><div class="ak-live-preview-title">${escapePreviewHtml(title)}</div><div class="ak-live-preview-sub">Preview diperbarui otomatis setiap kali pilihan ditambah atau dihapus.</div></div><div class="ak-live-preview-count">${(preview.medicines || []).length + (preview.racikans || []).length} pilihan</div></div><div class="ak-preview-section"><div class="ak-rp-label">OBAT NON-RACIKAN (${(preview.medicines || []).length})</div>${medRows || '<div class="ak-preview-empty">Belum ada obat non-racikan yang dipilih.</div>'}</div><div class="ak-preview-section"><div class="ak-rp-label">RACIKAN (${(preview.racikans || []).length})</div>${racikanRows || '<div class="ak-preview-empty">Belum ada racikan yang dipilih.</div>'}</div>${notes.length ? `<div class="ak-preview-notes"><b>Catatan:</b><br>${notes.map((n) => `• ${escapePreviewHtml(n)}`).join("<br>")}</div>` : ""}</div>`;
  }

  function updateMedicationGroupLivePreview(shade, ageYears) {
    const box = shade.querySelector("#ak-medgroup-live-preview");
    if (!box) return;
    const itemKeys = [...shade.querySelectorAll("[data-med-item]:checked")].map(
      (x) => x.value,
    );
    const actionKeys = [
      ...shade.querySelectorAll("[data-med-action]:checked"),
    ].map((x) => x.value);
    const weight = shade.querySelector("#ak-medgroup-weight");
    const weightKg =
      Number.isFinite(ageYears) && ageYears > 17
        ? null
        : parseWeightKg(weight?.value || "");
    if (
      getMedicationPackageNeedsWeight(ageYears) &&
      !Number.isFinite(weightKg)
    ) {
      box.innerHTML = `<div class="ak-live-preview-box ak-live-preview-waiting"><div class="ak-live-preview-title">PREVIEW OBAT TERPILIH</div><div class="ak-preview-empty">Masukkan BB pasien terlebih dahulu untuk menampilkan preview obat/racikan yang sesuai.</div></div>`;
      return;
    }
    if (!itemKeys.length && !actionKeys.length) {
      box.innerHTML = `<div class="ak-live-preview-box ak-live-preview-waiting"><div class="ak-live-preview-title">PREVIEW OBAT TERPILIH</div><div class="ak-preview-empty">Pilih obat/racikan terlebih dahulu. Preview akan muncul di sini.</div></div>`;
      return;
    }
    try {
      const preview = buildMedicationPackagePreview(
        itemKeys,
        weightKg,
        ageYears,
        actionKeys,
      );
      const group = getMedicationPackageGroup(weightKg, ageYears);
      const groupText = group === "adult" ? "DEWASA" : "ANAK";
      box.innerHTML = `<div class="ak-package-preview-meta"><b>Kategori:</b> ${groupText} · <b>BB:</b> ${weightKg == null ? "tidak diperlukan" : `${escapePreviewHtml(String(weightKg).replace(".", ","))} kg`}</div>${buildLivePreviewHtml(preview, "PREVIEW OBAT TERPILIH")}`;
    } catch (e) {
      box.innerHTML = `<div class="ak-live-preview-box"><div class="ak-live-preview-title">PREVIEW OBAT TERPILIH</div><div class="ak-preview-notes">Preview belum dapat dibuat: ${escapePreviewHtml(e.message || e)}</div></div>`;
    }
  }

  // ============================================================
  // 6. PAKET RESEP GOLONGAN — audit, resolver, preview, eksekusi, picker
  // ============================================================

  // Flatten satu kali untuk seluruh engine Paket Resep Golongan.
  // sourceGroup hanya metadata tampilan/diagnostik; logika resep tidak bergantung pada golongan.
  const MEDICATION_ITEMS_FLAT = MEDICATION_GROUP_PACKAGES.flatMap((group) =>
    group.items.map((item) => ({ ...item, sourceGroup: group.label })),
  );

  // Kata kunci dinegasikan: "tidak demam", "tanpa batuk", "tidak disertai mual",
  // "batuk tidak berdahak", "demam (-)", "mual disangkal".
  function isKeywordNegated(lowerText, start, end) {
    let wordStart = start;
    while (wordStart > 0 && /[a-z0-9]/.test(lowerText[wordStart - 1])) wordStart--;
    const before = lowerText
      .slice(Math.max(0, wordStart - 30), wordStart)
      .split(/[,.;:\n()]/)
      .pop();
    if (
      /(?:^|\s)(?:tidak|tdk|tak|tanpa|bukan|gak|ga|nggak|ngga|belum|disangkal)\s+(?:ada\s+)?(?:[a-z]+\s+)?$/.test(
        before,
      )
    )
      return true;
    const after = lowerText.slice(end, end + 40);
    // v9.4: penanda negasi boleh berjarak 2 kata ("alergi obat disangkal", "demam tidak ada").
    return /^[a-z]*(?:\s+[a-z]+){0,2}\s*(?::\s*)?(?:\(\s*-\s*\)|\(\s*neg|-\s*(?:[,.;\n]|$)|negatif|disangkal|tidak\s+ada)/.test(
      after,
    );
  }

  // Saran pilihan obat dari teks anamnesa untuk kategori `group` (adult/child).
  // Hasil: keys (urut, unik, sesuai kategori), matches (alasan), notes.
  // options.diagnosis = entri DIAGNOSIS_TEMPLATES (dari RESUME + DIAGNOSIS):
  // obat/tindakannya ikut disarankan, ditampilkan sebagai "Diagnosis ...".
  function suggestMedicationsFromAnamnesis(rawText, group, options = {}) {
    const result = { keys: [], actionKeys: [], matches: [], notes: [] };
    const lower = String(rawText || "").toLowerCase().replace(/ /g, " ");
    const dx = options.diagnosis || null;
    const vit = options.vitals || null; // hasil assessVitals()
    if ((!lower.trim() && !dx && !vit?.fever) || (group !== "adult" && group !== "child")) return result;

    if (dx) {
      const keys = dx[group] || [];
      const actions = dx.actions || [];
      result.matches.push({ label: `Diagnosis ${dx.label}`, keyword: dx.icd[0], keys: [...keys], actions: [...actions] });
      for (const k of keys) if (!result.keys.includes(k)) result.keys.push(k);
      for (const a of actions) if (!result.actionKeys.includes(a)) result.actionKeys.push(a);
    }

    for (const rule of ANAMNESIS_SUGGESTION_RULES) {
      const keys = rule[group] || [];
      const actions = rule.actions || [];
      if (!keys.length && !actions.length) continue;
      const re = new RegExp(rule.pattern.source, "g");
      let m;
      let keyword = null;
      while ((m = re.exec(lower))) {
        if (!m[0]) {
          re.lastIndex++;
          continue;
        }
        if (!isKeywordNegated(lower, m.index, m.index + m[0].length)) {
          keyword = m[0];
          break;
        }
      }
      if (!keyword) continue;
      result.matches.push({ label: rule.label, keyword, keys: [...keys], actions: [...actions] });
      for (const k of keys) if (!result.keys.includes(k)) result.keys.push(k);
      for (const a of actions) if (!result.actionKeys.includes(a)) result.actionKeys.push(a);
    }

    // v9.9: TTV — suhu ≥37,5 °C = demam walau tidak tertulis di keluhan.
    if (vit?.fever) {
      const k = group === "adult" ? "PARACETAMOL_DEWASA" : "PARACETAMOL_ANAK";
      result.matches.push({ label: "TTV: demam", keyword: `suhu ${String(vit.temp).replace(".", ",")} °C`, keys: [k], actions: [] });
      if (!result.keys.includes(k)) result.keys.push(k);
    }

    for (const o of ANAMNESIS_SUGGESTION_OVERLAPS) {
      if (!result.keys.includes(o.when) || !o.drop.some((k) => result.keys.includes(k)))
        continue;
      result.keys = result.keys.filter((k) => !o.drop.includes(k));
      for (const match of result.matches)
        match.keys = match.keys.filter((k) => !o.drop.includes(k));
      result.notes.push(o.note);
    }

    // v9.9: TTV sebagai pertimbangan terapi (catatan, tidak mencentang obat).
    if (vit?.hypertension && group === "adult") {
      if (!result.keys.includes("AMLODIPINE_5") && !result.keys.includes("AMLODIPINE_10"))
        result.notes.push(`TD ${vit.bp || ""} tinggi: pertimbangkan hipertensi. Antihipertensi tidak dicentang otomatis dari TTV saja.`);
      const nsaid = result.keys.filter((k) => ["DICLOFENAC_50", "IBUPROFEN_400"].includes(k));
      if (nsaid.length)
        result.notes.push(`TD tinggi: ${nsaid.map((k) => (k === "IBUPROFEN_400" ? "Ibuprofen" : "Diclofenac")).join(" & ")} (NSAID) dapat menaikkan tekanan darah; pertimbangkan Paracetamol.`);
    }
    if (vit?.crisis) result.notes.push("Krisis hipertensi: evaluasi/rujuk segera sebelum resep rutin.");
    if (vit?.fever && result.actionKeys.includes("IMUNISASI"))
      result.notes.push(`Suhu ${String(vit.temp).replace(".", ",")} °C: pertimbangkan menunda imunisasi sampai tidak demam.`);

    result.keys = result.keys.filter((k) =>
      isMedicationItemAllowedForGroup(
        MEDICATION_ITEMS_FLAT.find((x) => x.key === k),
        group,
      ),
    );
    return result;
  }

  // Validasi terpusat untuk Paket Resep Golongan. Audit ini memastikan semua
  // referensi item obat/racikan merujuk ke master ITEMS atau template resep
  // yang pada akhirnya hanya memakai item yang terdaftar di ITEMS.
  function auditMedicationPackageDefinitions() {
    const errors = [];
    const warnings = [];
    const seenKeys = new Map();

    const assertItem = (itemKey, context) => {
      if (!itemKey || !ITEMS[itemKey]) {
        errors.push(
          `${context}: item master "${itemKey || "(kosong)"}" tidak ditemukan di ITEMS.`,
        );
        return false;
      }
      if (!ITEMS[itemKey].target) {
        errors.push(`${context}: target untuk ITEMS.${itemKey} kosong.`);
        return false;
      }
      return true;
    };

    const auditMedicines = (medicines, context) => {
      for (const m of medicines || []) assertItem(m?.item, context);
    };

    const auditTemplate = (tpl, context) => {
      if (!tpl) {
        errors.push(`${context}: template tidak ditemukan.`);
        return;
      }
      auditMedicines(tpl.medicines, context);
      for (const ingredient of tpl.ingredients || [])
        assertItem(ingredient?.item, context);
    };

    for (const item of MEDICATION_ITEMS_FLAT) {
      if (seenKeys.has(item.key)) {
        errors.push(
          `Key pilihan duplikat: ${item.key} (${seenKeys.get(item.key)} dan ${item.sourceGroup}).`,
        );
      } else {
        seenKeys.set(item.key, item.sourceGroup);
      }
      if (!["adult", "child", "all"].includes(item.population)) {
        errors.push(`${item.key}: population harus adult, child, atau all.`);
      }

      switch (item.type) {
        case "recipe":
          auditTemplate(
            RECIPE_TEMPLATES[item.recipeKey],
            `${item.key} → ${item.recipeKey}`,
          );
          break;
        case "recipe-inline":
          auditMedicines(
            item.medicine ? [item.medicine] : [],
            `${item.key} → recipe-inline`,
          );
          break;
        case "racikan-static":
          auditTemplate(item.tpl, `${item.key} → racikan-static`);
          break;
        case "weight-racikan": {
          const matches = Object.entries(RACIKAN_TEMPLATES).filter(([key]) =>
            key.startsWith(item.prefix || ""),
          );
          if (!matches.length)
            warnings.push(
              `${item.key}: belum ada template berat badan untuk prefix ${item.prefix || "(kosong)"}.`,
            );
          matches.forEach(([key, tpl]) =>
            auditTemplate(tpl, `${item.key} → ${key}`),
          );
          break;
        }
        case "weight-syrup": {
          const matches = Object.entries(RECIPE_TEMPLATES).filter(([key]) =>
            key.startsWith(item.prefix || ""),
          );
          if (!matches.length)
            warnings.push(
              `${item.key}: belum ada template syrup untuk prefix ${item.prefix || "(kosong)"}.`,
            );
          matches.forEach(([key, tpl]) =>
            auditTemplate(tpl, `${item.key} → ${key}`),
          );
          break;
        }
        case "age-antacid":
        case "age-zinc":
          // Template dibuat dinamis melalui resolver; target komponennya diaudit
          // dari object resep yang dihasilkan saat runtime.
          break;
        default:
          errors.push(
            `${item.key}: type ${item.type || "(kosong)"} tidak dikenali.`,
          );
      }
    }

    for (const dx of DIAGNOSIS_TEMPLATES) {
      for (const a of dx.actions || [])
        if (!PACKAGE_ACTIONS.some((x) => x.key === a))
          errors.push(`Diagnosis ${dx.key}: tindakan ${a} tidak ada.`);
      for (const group of ["adult", "child"])
        for (const key of dx[group] || []) {
          const item = MEDICATION_ITEMS_FLAT.find((x) => x.key === key);
          if (!isMedicationItemAllowedForGroup(item, group))
            errors.push(`Diagnosis ${dx.key}: obat ${key} tidak tersedia untuk ${group}.`);
        }
    }
    for (const rule of ANAMNESIS_SUGGESTION_RULES) {
      for (const a of rule.actions || []) {
        if (!PACKAGE_ACTIONS.some((x) => x.key === a))
          errors.push(`Saran keluhan "${rule.label}": tindakan ${a} tidak ada di PACKAGE_ACTIONS.`);
      }
      for (const group of ["adult", "child"]) {
        for (const key of rule[group] || []) {
          const item = MEDICATION_ITEMS_FLAT.find((x) => x.key === key);
          if (!isMedicationItemAllowedForGroup(item, group))
            errors.push(
              `Saran anamnesa "${rule.label}": ${key} ${item ? `tidak tersedia untuk ${group}` : "tidak ada di Paket Golongan"}.`,
            );
        }
      }
    }

    // Audit target seluruh template aktif yang dipakai oleh Paket Resep Golongan.
    for (const [key, tpl] of Object.entries(RECIPE_TEMPLATES)) {
      if (
        MEDICATION_ITEMS_FLAT.some(
          (x) => x.recipeKey === key || (x.prefix && key.startsWith(x.prefix)),
        )
      ) {
        auditTemplate(tpl, `RECIPE_TEMPLATES.${key}`);
      }
    }

    return { ok: errors.length === 0, errors, warnings };
  }

  // Uji resolver dinamis dengan sampel batas umur/BB. Ini menangkap error yang
  // tidak terlihat hanya dengan memeriksa keberadaan key di master ITEMS.
  function auditMedicationPackageRuntimeResolvers() {
    const errors = [];
    const dynamicItems = MEDICATION_ITEMS_FLAT.filter((x) =>
      ["weight-racikan", "weight-syrup", "age-antacid", "age-zinc"].includes(
        x.type,
      ),
    );
    const samplesByType = {
      "weight-racikan": [
        { weightKg: 1, ageYears: 1 },
        { weightKg: 5, ageYears: 3 },
        { weightKg: 10, ageYears: 5 },
        { weightKg: 20, ageYears: 10 },
        { weightKg: 40, ageYears: 17 },
      ],
      "weight-syrup": [
        { weightKg: 1, ageYears: 1 },
        { weightKg: 5, ageYears: 3 },
        { weightKg: 10, ageYears: 5 },
        { weightKg: 20, ageYears: 10 },
        { weightKg: 40, ageYears: 17 },
      ],
      "age-antacid": [
        { weightKg: 10, ageYears: 4 },
        { weightKg: 20, ageYears: 10 },
        { weightKg: 30, ageYears: 17 },
      ],
      "age-zinc": [
        { weightKg: 5, ageYears: 0.25 },
        { weightKg: 10, ageYears: 1 },
        { weightKg: 20, ageYears: 10 },
      ],
    };
    for (const item of dynamicItems) {
      for (const sample of samplesByType[item.type] || []) {
        try {
          const resolved = resolveMedicationItem(
            item,
            sample.weightKg,
            sample.ageYears,
          );
          if (resolved.note) continue; // sample boleh berada di luar rentang template
          for (const m of resolved.medicines || []) {
            if (!ITEMS[m.item] || !ITEMS[m.item].target)
              errors.push(
                `${item.key}: resolver runtime menghasilkan item/target tidak valid ${m.item || "(kosong)"}.`,
              );
          }
          for (const rc of resolved.racikans || []) {
            const tpl = rc?.tpl;
            if (!tpl) {
              errors.push(
                `${item.key}: resolver runtime menghasilkan racikan kosong.`,
              );
              continue;
            }
            // v9: dulu memanggil auditTemplate (fungsi lokal milik audit lain)
            // sehingga selalu ReferenceError dan mencetak error palsu di console.
            for (const ing of tpl.ingredients || []) {
              if (!ITEMS[ing?.item]?.target)
                errors.push(
                  `${item.key}: racikan runtime memakai item tidak valid ${ing?.item || "(kosong)"}.`,
                );
            }
          }
        } catch (e) {
          errors.push(`${item.key}: resolver runtime gagal (${e.message}).`);
        }
      }
    }
    return errors;
  }

  const MEDICATION_PACKAGE_AUDIT = auditMedicationPackageDefinitions();
  if (
    !MEDICATION_PACKAGE_AUDIT.ok ||
    MEDICATION_PACKAGE_AUDIT.warnings.length
  ) {
    console.groupCollapsed("[AUTO KLINIK] Audit Paket Resep Golongan");
    if (MEDICATION_PACKAGE_AUDIT.errors.length)
      console.error(...MEDICATION_PACKAGE_AUDIT.errors);
    if (MEDICATION_PACKAGE_AUDIT.warnings.length)
      console.warn(...MEDICATION_PACKAGE_AUDIT.warnings);
    console.groupEnd();
  }

  function getMedicationPackageGroup(weightKg, ageYears) {
    if (Number.isFinite(ageYears) && ageYears > 17) return "adult";
    if (!Number.isFinite(weightKg)) return null;
    return weightKg > 40 ? "adult" : "child";
  }

  function getMedicationPackageNeedsWeight(ageYears) {
    return !(Number.isFinite(ageYears) && ageYears > 17);
  }

  function isMedicationItemAllowedForGroup(item, group) {
    return !!item && (item.population === group || item.population === "all");
  }

  function resolveMedicationItem(item, weightKg, ageYears) {
    if (!item)
      return {
        medicines: [],
        racikans: [],
        note: "Pilihan obat tidak ditemukan.",
      };

    switch (item.type) {
      case "recipe":
        return {
          medicines: getTemplateMedicineList(item.recipeKey).map((m) => ({
            ...m,
          })),
          racikans: [],
        };
      case "recipe-inline":
        return {
          medicines: item.medicine ? [{ ...item.medicine }] : [],
          racikans: [],
        };
      case "racikan-static":
        return item.tpl
          ? { medicines: [], racikans: [{ tpl: item.tpl }] }
          : {
              medicines: [],
              racikans: [],
              note: `${item.label}: template racikan tidak tersedia`,
            };
      case "weight-racikan": {
        const found = getWeightTemplate(item.prefix, weightKg);
        return found
          ? { medicines: [], racikans: [{ tpl: found.tpl }] }
          : {
              medicines: [],
              racikans: [],
              note: `${item.label}: BB ${weightKg} kg di luar template`,
            };
      }
      case "weight-syrup": {
        const found = getWeightRecipeTemplate(item.prefix, weightKg);
        return found
          ? { medicines: [...(found.tpl.medicines || [])], racikans: [] }
          : {
              medicines: [],
              racikans: [],
              note: `${item.label}: BB ${weightKg} kg di luar template`,
            };
      }
      case "age-antacid": {
        const recipe = makeNyeriUluHatiAnakRecipe(ageYears);
        return recipe
          ? { medicines: [...(recipe.medicines || [])], racikans: [] }
          : {
              medicines: [],
              racikans: [],
              note: `${item.label}: umur <4 tahun belum memiliki template`,
            };
      }
      case "age-zinc": {
        const recipe = makeZincChildRecipe(ageYears);
        return recipe
          ? { medicines: [...(recipe.medicines || [])], racikans: [] }
          : {
              medicines: [],
              racikans: [],
              note: `${item.label}: umur belum terbaca`,
            };
      }
      default:
        return {
          medicines: [],
          racikans: [],
          note: `${item.label}: tipe template ${item.type || "(kosong)"} tidak dikenali`,
        };
    }
  }

  const MEDICATION_PACKAGE_RUNTIME_AUDIT =
    auditMedicationPackageRuntimeResolvers();
  if (MEDICATION_PACKAGE_RUNTIME_AUDIT.length) {
    console.groupCollapsed(
      "[AUTO KLINIK] Audit Runtime Resolver Paket Resep Golongan",
    );
    console.error(...MEDICATION_PACKAGE_RUNTIME_AUDIT);
    console.groupEnd();
  }

  function buildMedicationPackagePreview(
    itemKeys,
    weightKg,
    ageYears,
    actionKeys = [],
  ) {
    const group = getMedicationPackageGroup(weightKg, ageYears);
    if (!group) throw new Error("Kategori pasien belum dapat ditentukan.");
    const selected = MEDICATION_ITEMS_FLAT.filter((x) =>
      itemKeys.includes(x.key),
    );
    const preview = { medicines: [], racikans: [], notes: [], selected: [] };
    const seenMedicine = new Set();
    const seenRacikan = new Set();
    const identity = (m, sourceLabel = "") => {
      const item = String(m?.item || "")
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "");
      if (!item) return "";
      const form = String(ITEMS?.[m?.item]?.unit || "")
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "");
      const source = String(sourceLabel || "")
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "");
      return `${source}__${item}__${form}__${String(m?.freq || "")}__${String(m?.dose || "")}__${String(m?.days || "")}__${String(m?.total || "")}__${String(
        m?.instruction || "",
      )
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")}`;
    };
    for (const item of selected) {
      if (!isMedicationItemAllowedForGroup(item, group)) {
        preview.notes.push(
          `${item.label}: tidak tersedia untuk kategori ${group === "adult" ? "DEWASA" : "ANAK"}`,
        );
        continue;
      }
      const r = resolveMedicationItem(item, weightKg, ageYears);
      if (r.note) {
        preview.notes.push(r.note);
        continue;
      }
      const meds = [];
      for (const m of r.medicines || []) {
        const id = identity(m, item.label);
        if (id && seenMedicine.has(id)) {
          preview.notes.push(`Duplikat dilewati: ${item.label} → ${m.item}`);
          continue;
        }
        if (id) seenMedicine.add(id);
        meds.push({ ...m, sourceLabel: item.label });
        preview.medicines.push({ ...m, sourceLabel: item.label });
      }
      for (const rc of r.racikans || []) {
        const rid = String(
          rc.tpl?.title || rc.tpl?.name || item.key,
        ).toUpperCase();
        if (seenRacikan.has(rid)) {
          preview.notes.push(`Duplikat racikan dilewati: ${item.label}`);
          continue;
        }
        seenRacikan.add(rid);
        preview.racikans.push({ tpl: rc.tpl, sourceLabel: item.label });
      }
      if (meds.length || (r.racikans || []).length)
        preview.selected.push(item.label);
    }
    for (const actionKey of [...new Set(actionKeys || [])]) {
      const action = PACKAGE_ACTIONS.find((x) => x.key === actionKey);
      const tpl = action ? RECIPE_TEMPLATES[action.key] : null;
      if (!action || !tpl?.medicines?.length) {
        preview.notes.push(`Tindakan ${actionKey}: template belum tersedia`);
        continue;
      }
      let added = false;
      for (const m of tpl.medicines) {
        const id = identity(m, `BHP ${action.label}`);
        if (id && seenMedicine.has(id)) {
          preview.notes.push(
            `Duplikat tindakan dilewati: ${action.label} → ${m.item}`,
          );
          continue;
        }
        if (id) seenMedicine.add(id);
        preview.medicines.push({
          ...m,
          sourceLabel: `BHP ${action.label}`,
        });
        added = true;
      }
      if (added) preview.selected.push(`Tindakan: ${action.label}`);
    }
    return preview;
  }

  async function runMedicationGroupItems(
    itemKeys,
    weightKg,
    ageYears,
    actionKeys = [],
  ) {
    const group = getMedicationPackageGroup(weightKg, ageYears);
    if (!group) throw new Error("Kategori pasien belum dapat ditentukan.");

    const selected = MEDICATION_ITEMS_FLAT.filter((x) =>
      itemKeys.includes(x.key),
    );
    if (!selected.length && !actionKeys.length)
      throw new Error("Pilih minimal satu obat atau tindakan.");

    const seenMedicines = new Set();
    const failedItems = [];
    const seenRacikan = new Set();
    const skipped = [];
    const identity = (m, sourceLabel = "") => {
      // Deduplikasi berbasis entri resep lengkap + sumber pilihan, bukan hanya zat/item.
      // Dengan demikian obat tunggal dan komponen racikan/alternatif yang sengaja dipilih tidak saling menghapus.
      return JSON.stringify({
        source: sourceLabel,
        item: m?.item || "",
        freq: m?.freq || "",
        dose: m?.dose || "",
        days: m?.days || "",
        total: m?.total || "",
        instruction: m?.instruction || "",
      });
    };

    const addUniqueMedicines = async (list, label) => {
      const unique = (list || []).filter((m) => {
        const id = identity(m, label);
        if (!id) return true;
        if (seenMedicines.has(id)) {
          skipped.push(`${label}: ${m.item}`);
          return false;
        }
        seenMedicines.add(id);
        return true;
      });
      if (!unique.length) return;
      // v10.0.5: satu obat gagal tidak menghentikan obat berikutnya.
      try {
        await addRecipeItems(unique);
      } catch (e) {
        if (findRacikanModal()) throw e; // form racikan terbuka: berhenti
        failedItems.push(`${label} (${String(e?.message || e).replace(/\.$/, "")})`);
      }
    };

    // v10.1.0: tindakan (imunisasi, cek gula/kolesterol/asam urat) diisi di bagian BHP,
    // LEBIH DULU, karena dialog BHP tidak bisa dibuka selama dialog Resep terbuka.
    const bhp = collectBhpForActions(actionKeys);
    for (const actionKey of [...new Set(actionKeys || [])]) {
      if (!PACKAGE_ACTIONS.some((x) => x.key === actionKey) || !RECIPE_TEMPLATES[actionKey]?.medicines?.length)
        skipped.push(`Tindakan ${actionKey}: template belum tersedia`);
    }
    if (bhp.items.length) {
      try {
        const notes = await addBhpItems(bhp.items);
        if (notes.length) skipped.push(`BHP: ${notes.join(", ")}`);
      } catch (e) {
        failedItems.push(`BHP ${bhp.labels.join(" + ")} (${String(e?.message || e).replace(/\.$/, "")})`);
      }
    }

    // Dipanggil di dalam runTask (kunci proses + status tombol ditangani di sana).
    for (const item of selected) {
      if (!isMedicationItemAllowedForGroup(item, group)) {
        skipped.push(
          `${item.label}: tidak tersedia untuk kategori ${group === "adult" ? "DEWASA" : "ANAK"}`,
        );
        continue;
      }

      const resolved = resolveMedicationItem(item, weightKg, ageYears);
      if (resolved.note) {
        skipped.push(resolved.note);
        continue;
      }

      await addUniqueMedicines(resolved.medicines, item.label);

      for (const rc of resolved.racikans || []) {
        const rid = String(
          rc.tpl?.title || rc.tpl?.name || item.key,
        ).toUpperCase();
        if (seenRacikan.has(rid)) {
          skipped.push(`${item.label}: duplikat racikan`);
          continue;
        }
        seenRacikan.add(rid);
        await addRacikan(rc.tpl);
      }
    }

    let msg = `PAKET RESEP selesai: kategori ${group === "adult" ? "DEWASA" : "ANAK"}. Review resep, lalu tekan SIMPAN di bagian Resep.`;
    msg += unsavedServiceNote();
    if (failedItems.length) msg += ` GAGAL DIINPUT (tambahkan manual): ${failedItems.join("; ")}.`;
    if (skipped.length) msg += ` Catatan: ${skipped.join(", ")}.`;
    notify(msg, failedItems.length ? "error" : skipped.length ? "warn" : "success", failedItems.length ? 25000 : 12000);
  }

  // options.diagnosis: diagnosis yang baru diisi RESUME + DIAGNOSIS (obatnya ikut dicentang).
  function renderMedicationGroupPackagePicker(options = {}) {
    // Diagnosis yang sudah terinput di halaman (kartu ICD + kolom Diagnosa).
    const pageIcd = selectedIcdEntries();
    const pageDiagnosisText = readFieldText("Diagnosa");
    const icdDiagnosis =
      pageIcd
        .map((e) => DIAGNOSIS_TEMPLATES.find((d) => d.icd.some((c) => icdCodeMatches(c, e.code))))
        .find(Boolean) || null;
    let presetDiagnosis = options.diagnosis || icdDiagnosis;
    const old = document.getElementById("ak-medgroup-picker");
    if (old) old.remove();
    // Baca halaman SEBELUM overlay dipasang, agar kolom milik overlay tidak ikut terbaca.
    const ageInfo = getPatientAgeFromIdentity();
    const weightInfo = getPatientWeightFromLatestVitals();
    const pageComplaint = readChiefComplaintFromPage();
    const pageVitals = readVitalsFromPage();
    const vitalsAssessment = assessVitals(pageVitals, ageInfo?.ageYears ?? null);
    const shade = document.createElement("div");
    shade.id = "ak-medgroup-picker";
    shade.innerHTML = `<div class="ak-rp-card ak-medgroup-card akm">
  <div class="akm-head">
    <div class="akm-head-text"><div class="ak-rp-title">💊 Paket Resep</div><div class="ak-rp-sub">Data pasien dan Keluhan Utama dibaca otomatis. Obat bertanda <em class="ak-suggest-badge">saran</em> sudah dicentang. Review dulu sebelum input.</div></div>
    <button class="ak-rp-x" type="button" aria-label="Tutup">×</button>
  </div>
  <div class="akm-body">
   <div class="akm-col akm-col-left">
    <section class="akm-sec akm-pasien">
      <div class="akm-sec-title">👤 Pasien</div>
      <div class="akm-stats">
        <div class="akm-stat"><span>Umur</span><b id="ak-medgroup-age">…</b></div>
        <label class="akm-stat akm-stat-bb" id="ak-medgroup-bb-step"><span>Berat badan</span><span class="akm-bb"><input id="ak-medgroup-weight" type="number" min="0.1" max="499" step="0.1" inputmode="decimal" placeholder="—"><i>kg</i></span></label>
        <div class="akm-stat"><span>Kategori</span><b id="ak-medgroup-group-status" class="akm-cat">—</b></div>
      </div>
      <div id="ak-medgroup-weight-source" class="akm-hint"></div>
      <div id="ak-medgroup-vitals" class="akm-vitals"></div>
    </section>
    <section class="akm-sec akm-diagnosis">
      <div class="akm-sec-title">🩺 Diagnosis terinput</div>
      <div id="ak-medgroup-dx" class="akm-dx"></div>
      <div id="ak-medgroup-dx-preview"></div>
    </section>
    <section class="akm-sec akm-anamnesa">
      <div class="akm-sec-title">📝 Keluhan Utama <button id="ak-medgroup-resuggest" class="akm-link" type="button">↻ Baca ulang</button></div>
      <textarea id="ak-medgroup-anamnesis" class="ak-package-anamnesis" rows="3" placeholder="Keluhan Utama belum terbaca dari form. Ketik keluhan pasien di sini untuk mendapat saran obat."></textarea>
      <div id="ak-medgroup-anamnesis-source" class="akm-hint"></div>
      <div id="ak-medgroup-sync" class="akm-hint akm-sync"></div>
      <div id="ak-medgroup-suggestion" class="ak-package-suggestion"></div>
    </section>
    <section class="akm-sec akm-preview">
      <div id="ak-medgroup-live-preview" class="ak-package-live-preview"></div>
    </section>
   </div>
   <div class="akm-col akm-col-right">
    <section class="akm-sec akm-obat">
      <div class="akm-sec-title">💊 Pilih obat <span id="ak-medgroup-count" class="akm-count"></span></div>
      <div id="ak-medgroup-items" class="akm-items"></div>
    </section>
    <section class="akm-sec akm-tindakan">
      <div class="akm-sec-title">🩹 Tindakan → BHP <small>(opsional)</small></div>
      <div class="akm-choices" id="ak-medgroup-actions"></div>
    </section>
   </div>
  </div>
  <div class="akm-foot">
    <div id="ak-medgroup-selected" class="akm-selected">Belum ada obat dipilih</div>
    <div class="akm-actions"><button class="akm-btn-ghost" id="ak-medgroup-close" type="button">Tutup</button><button class="akm-btn-primary" id="ak-medgroup-run" type="button">✓ INPUT RESEP</button></div>
  </div>
</div>`;
    document.body.appendChild(shade);
    const onKey = (ev) => {
      if (ev.key === "Escape") close();
    };
    const close = () => {
      document.removeEventListener("keydown", onKey, true);
      shade.remove();
    };
    document.addEventListener("keydown", onKey, true);
    shade.querySelector(".ak-rp-x")?.addEventListener("click", close);
    shade.querySelector("#ak-medgroup-close")?.addEventListener("click", close);
    // Sorotan pilihan tercentang (pengganti :has() untuk browser HP lama).
    const markChecked = () =>
      shade.querySelectorAll(".ak-package-choice").forEach((l) => {
        l.classList.toggle("akm-on", !!l.querySelector("input:checked"));
      });
    shade.addEventListener("change", markChecked);
    new MutationObserver(markChecked).observe(shade, { childList: true, subtree: true });
    const weight = shade.querySelector("#ak-medgroup-weight"),
      weightSourceEl = shade.querySelector("#ak-medgroup-weight-source"),
      status = shade.querySelector("#ak-medgroup-group-status"),
      ageEl = shade.querySelector("#ak-medgroup-age"),
      anamnesisEl = shade.querySelector("#ak-medgroup-anamnesis"),
      anamnesisSourceEl = shade.querySelector("#ak-medgroup-anamnesis-source"),
      suggestionEl = shade.querySelector("#ak-medgroup-suggestion"),
      items = shade.querySelector("#ak-medgroup-items"),
      countEl = shade.querySelector("#ak-medgroup-count"),
      selectedEl = shade.querySelector("#ak-medgroup-selected");
    let ageYears = ageInfo?.ageYears ?? null;
    if (ageInfo) {
      ageEl.textContent =
        [ageInfo.years ? `${ageInfo.years} th` : "", ageInfo.months ? `${ageInfo.months} bln` : ""]
          .filter(Boolean)
          .join(" ") || `${ageInfo.days || 0} hari`;
    } else {
      ageEl.textContent = "Tidak terbaca";
      ageEl.classList.add("akm-missing");
    }
    const weightHint = weightInfo
      ? `BB terakhir dari ${weightInfo.source}. Ubah bila tidak sesuai.`
      : "BB tidak ditemukan di halaman. Isi manual.";
    if (weightInfo) weight.value = String(weightInfo.kg);
    const setAnamnesisSource = (source) => {
      anamnesisSourceEl.textContent = source
        ? `Dari form ${source}. Bila diubah, Keluhan Utama, Anamnesa, dan Diagnosis di halaman ikut diperbarui.`
        : "Keluhan Utama tidak ditemukan di halaman. Ketik keluhan untuk mendapat saran.";
    };
    {
      const summary = formatVitalsSummary(pageVitals);
      const flagsHtml = vitalsAssessment.flags
        .map((f) => `<span class="akm-vflag ${f.level}">${escapePreviewHtml(f.text)}</span>`)
        .join(" ");
      shade.querySelector("#ak-medgroup-vitals").innerHTML = summary
        ? `<b>TTV:</b> ${escapePreviewHtml(summary)}${flagsHtml ? `<div>${flagsHtml}</div>` : ""}`
        : '<span class="akm-hint">TTV kunjungan ini belum terbaca.</span>';
    }
    const renderDx = (icdList, diagText) => {
      const rows = icdList.map(
        (e) =>
          `<div class="akm-dx-row"><b>${escapePreviewHtml(e.code)}</b> <span class="akm-dx-role">${e.role}</span> ${escapePreviewHtml(e.name)}</div>`,
      );
      if (diagText) rows.push(`<div class="akm-hint">Diagnosa: ${escapePreviewHtml(diagText)}</div>`);
      if (presetDiagnosis)
        rows.push(`<div class="akm-hint">Saran obat ikut diagnosis <b>${escapePreviewHtml(presetDiagnosis.label)}</b>.</div>`);
      shade.querySelector("#ak-medgroup-dx").innerHTML = rows.length
        ? rows.join("")
        : '<span class="akm-hint akm-missing">Belum ada Diagnosa / ICD 10 yang terisi.</span>';
    };
    renderDx(pageIcd, pageDiagnosisText);
    anamnesisEl.value = pageComplaint.text;

    // v10.1.1: preview diagnosis yang akan dipilih di halaman, langsung saat keluhan
    // diketik. Setelah keluhan diubah dokter, saran obat ikut diagnosis preview ini.
    const baseDiagnosis = presetDiagnosis;
    const initialComplaint = String(pageComplaint.text || "").trim();
    const dxLabelOf = (key) => DIAGNOSIS_TEMPLATES.find((d) => d.key === key)?.label || key;
    const renderDxPreview = () => {
      const el = shade.querySelector("#ak-medgroup-dx-preview");
      const t = String(anamnesisEl.value || "").trim();
      const found = t ? detectDiagnosisFromComplaint(t, { vitals: vitalsAssessment }) : null;
      const dx = found && DIAGNOSIS_TEMPLATES.find((d) => d.key === found.key);
      if (t !== initialComplaint) presetDiagnosis = dx || baseDiagnosis;
      if (!el) return;
      if (!t) {
        el.innerHTML = "";
        return;
      }
      if (!dx) {
        el.innerHTML = `<div class="akm-dxp none">🔎 Diagnosis dari keluhan: <b>tidak dikenali</b>. Diagnosa/ICD di halaman tidak diubah.</div>`;
        return;
      }
      const page = selectedIcdEntries();
      const filled = dx.icd.some((c) => page.some((e) => icdCodeMatches(c, e.code)));
      const others = (found.others || []).map(dxLabelOf);
      el.innerHTML =
        `<div class="akm-dxp"><div class="akm-dxp-head">🔎 Preview diagnosis dari keluhan<span class="akm-dxp-tag${filled ? " ok" : ""}">${filled ? "sudah terisi" : "akan dipilih"}</span></div>` +
        `<div><b>${escapePreviewHtml(dx.icd[0])}</b> ${escapePreviewHtml(dx.label)} <small>(dari "${escapePreviewHtml(found.keyword)}")</small></div>` +
        (others.length ? `<small>Juga cocok: ${escapePreviewHtml(others.join(", "))}</small>` : "") +
        `</div>`;
    };
    renderDxPreview();
    setAnamnesisSource(pageComplaint.source);

    // Simpan pilihan obat lintas perubahan kategori. Obat yang tidak sesuai kategori
    // hanya disembunyikan, bukan dihapus dari state, sehingga ketika BB diubah kembali
    // ke kategori sebelumnya pilihan pengguna dapat muncul lagi.
    const selectedMedicationKeys = new Set();
    // Saran anamnesa: autoAdded = dicentang oleh saran (dicabut lagi bila saran
    // berubah), dismissed = saran yang centangnya dihapus dokter (tidak dicentang ulang).
    let currentGroup = null;
    let suggestedKeys = new Set();
    const autoAdded = new Set();
    const dismissed = new Set();
    // v9.6: resep tindakan juga bisa disarankan (mis. "imunisasi", "cek gula").
    const selectedActionKeys = new Set();
    let suggestedActions = new Set();
    const autoAddedActions = new Set();
    const dismissedActions = new Set();
    const actionsEl = shade.querySelector("#ak-medgroup-actions");
    const renderActions = () => {
      actionsEl.innerHTML = PACKAGE_ACTIONS.map(
        (a) =>
          `<label class="ak-package-choice${suggestedActions.has(a.key) ? " akm-suggested" : ""}"><input data-med-action="${a.key}" type="checkbox" value="${a.key}" ${selectedActionKeys.has(a.key) ? "checked" : ""}><span class="akm-name">${escapePreviewHtml(a.label)}</span>${suggestedActions.has(a.key) ? '<em class="ak-suggest-badge">saran</em>' : ""}</label>`,
      ).join("");
      actionsEl.querySelectorAll("[data-med-action]").forEach((x) =>
        x.addEventListener("change", () => {
          if (x.checked) {
            selectedActionKeys.add(x.value);
            dismissedActions.delete(x.value);
          } else {
            selectedActionKeys.delete(x.value);
            if (autoAddedActions.delete(x.value)) dismissedActions.add(x.value);
          }
          updateSelected();
        }),
      );
    };
    const actionLabel = (key) => PACKAGE_ACTIONS.find((a) => a.key === key)?.label || key;
    const itemLabel = (key) =>
      MEDICATION_ITEMS_FLAT.find((x) => x.key === key)?.label || key;

    const applySuggestions = (group, { reset = false } = {}) => {
      for (const k of autoAdded) selectedMedicationKeys.delete(k);
      autoAdded.clear();
      if (reset) dismissed.clear();
      const s = suggestMedicationsFromAnamnesis(anamnesisEl.value, group, { diagnosis: presetDiagnosis, vitals: vitalsAssessment });
      suggestedKeys = new Set(s.keys);
      for (const k of s.keys) {
        if (dismissed.has(k) || selectedMedicationKeys.has(k)) continue;
        selectedMedicationKeys.add(k);
        autoAdded.add(k);
      }
      for (const a of autoAddedActions) selectedActionKeys.delete(a);
      autoAddedActions.clear();
      if (reset) dismissedActions.clear();
      suggestedActions = new Set(s.actionKeys);
      for (const a of s.actionKeys) {
        if (dismissedActions.has(a) || selectedActionKeys.has(a)) continue;
        selectedActionKeys.add(a);
        autoAddedActions.add(a);
      }
      renderActions();
      if (!group) {
        suggestionEl.innerHTML = `<div class="ak-preview-empty">Saran obat muncul setelah kategori DEWASA/ANAK diketahui.</div>`;
      } else if (!anamnesisEl.value.trim() && !s.matches.length) {
        suggestionEl.innerHTML = `<div class="ak-preview-empty">Keluhan Utama kosong, jadi tidak ada saran. Pilih obat manual.</div>`;
      } else if (!s.matches.length) {
        suggestionEl.innerHTML = `<div class="ak-preview-empty">Tidak ada keluhan yang dikenali. Pilih obat manual, atau tambahkan kata keluhan di kotak Keluhan Utama.</div>`;
      } else {
        const rows = s.matches
          .map(
            (m) =>
              `• <b>${escapePreviewHtml(m.label)}</b> <small>("${escapePreviewHtml(m.keyword)}")</small> → ${[...m.keys.map((k) => escapePreviewHtml(itemLabel(k))), ...(m.actions || []).map((a) => "Tindakan " + escapePreviewHtml(actionLabel(a)))].join(", ") || "sudah tercakup obat lain (lihat ⓘ)"}`,
          )
          .join("<br>");
        const notes = s.notes
          .map((n) => `<br><small>ⓘ ${escapePreviewHtml(n)}</small>`)
          .join("");
        suggestionEl.innerHTML = `<div class="ak-package-suggestion-box"><div class="ak-live-preview-title">✨ SARAN OBAT & TINDAKAN DARI ${presetDiagnosis ? "DIAGNOSIS & " : ""}KELUHAN UTAMA (${group === "adult" ? "DEWASA" : "ANAK"})</div>${rows}${notes}<div class="ak-package-suggestion-warn">Saran otomatis berdasarkan kata kunci dan sudah dicentang. Dokter wajib mengevaluasi indikasi, kontraindikasi, dan riwayat alergi sebelum input.</div></div>`;
      }
    };

    const renderItemsForGroup = (group) => {
      const choice = (i) => {
        const [name, sub] = String(i.label).split(" — ");
        return `<label class="ak-package-choice${suggestedKeys.has(i.key) ? " akm-suggested" : ""}"><input data-med-item="${i.key}" type="checkbox" value="${i.key}" ${selectedMedicationKeys.has(i.key) ? "checked" : ""}><span class="akm-name">${escapePreviewHtml(name)}${sub ? `<small>${escapePreviewHtml(sub)}</small>` : ""}</span>${suggestedKeys.has(i.key) ? '<em class="ak-suggest-badge">saran</em>' : ""}</label>`;
      };
      // Dikelompokkan per golongan supaya mudah dicari; semua pilihan tetap tampil.
      items.innerHTML = MEDICATION_GROUP_PACKAGES.map((g) => {
        const list = g.items.filter(
          (i) => i.population === group || i.population === "all",
        );
        return list.length
          ? `<div class="akm-group"><div class="akm-group-title">${escapePreviewHtml(g.label)}</div><div class="akm-choices">${list.map(choice).join("")}</div></div>`
          : "";
      }).join("");
      items.querySelectorAll("[data-med-item]").forEach((x) =>
        x.addEventListener("change", () => {
          if (x.checked) {
            selectedMedicationKeys.add(x.value);
            dismissed.delete(x.value);
          } else {
            selectedMedicationKeys.delete(x.value);
            if (autoAdded.delete(x.value)) dismissed.add(x.value);
          }
          updateSelected();
        }),
      );
    };
    const updateSelected = () => {
      const visibleLabels = [...shade.querySelectorAll("[data-med-item]")];
      const meds = visibleLabels
        .filter((x) => selectedMedicationKeys.has(x.value))
        .map((x) => itemLabel(x.value));
      const hiddenCount = [...selectedMedicationKeys].filter(
        (key) => !visibleLabels.some((x) => x.value === key),
      ).length;
      const acts = [...shade.querySelectorAll("[data-med-action]:checked")].map((x) =>
        actionLabel(x.value),
      );
      const names = [...meds, ...acts.map((x) => "Tindakan " + x)];
      const total = names.length;
      countEl.textContent = meds.length ? `${meds.length} dipilih` : "";
      selectedEl.innerHTML = total
        ? `<b>${total} dipilih</b> <span>${escapePreviewHtml(names.join(" · "))}</span>${hiddenCount ? ` <small>(+${hiddenCount} di kategori lain, tidak diinput)</small>` : ""}`
        : "Belum ada obat dipilih";
      updateMedicationGroupLivePreview(shade, ageYears);
    };
    const showGroup = (group) => {
      if (group !== currentGroup) {
        currentGroup = group;
        applySuggestions(group);
      }
      renderItemsForGroup(group);
      updateSelected();
    };
    const setStatus = (group, hint) => {
      status.textContent = group === "adult" ? "DEWASA" : group === "child" ? "ANAK" : "Isi BB";
      status.className = `akm-cat ${group || "akm-missing"}`;
      weightSourceEl.textContent = hint;
    };
    const refreshCategory = () => {
      const needsWeight = getMedicationPackageNeedsWeight(ageYears);
      if (!needsWeight) {
        setStatus("adult", `Umur >17 tahun → DEWASA, BB tidak menentukan dosis. ${weightInfo ? weightHint : ""}`.trim());
        showGroup("adult");
        return "adult";
      }
      const kg = parseWeightKg(weight?.value || "");
      if (!kg) {
        setStatus(null, `${ageYears == null ? "Umur tidak terbaca. " : ""}Isi BB untuk menentukan DEWASA/ANAK dan dosis. ${weightHint}`);
        currentGroup = null;
        applySuggestions(null);
        items.innerHTML = '<div class="ak-preview-empty">Isi berat badan dulu untuk menampilkan daftar obat.</div>';
        countEl.textContent = "";
        selectedEl.textContent = "Menunggu BB pasien";
        updateMedicationGroupLivePreview(shade, ageYears);
        return null;
      }
      const group = getMedicationPackageGroup(kg, ageYears);
      setStatus(group, `${ageYears == null ? "Umur tidak terbaca; kategori dari BB. " : ""}BB ${String(kg).replace(".", ",")} kg → dosis ${group === "adult" ? "dewasa" : "anak sesuai BB"}. ${weightHint}`);
      showGroup(group);
      return group;
    };
    const resuggest = (options) => {
      if (!currentGroup) return;
      applySuggestions(currentGroup, options);
      renderItemsForGroup(currentGroup);
      updateSelected();
    };
    let anamnesisTimer = null;
    anamnesisEl.addEventListener("input", () => {
      clearTimeout(anamnesisTimer);
      anamnesisTimer = setTimeout(() => {
        renderDxPreview();
        renderDx(selectedIcdEntries(), readFieldText("Diagnosa"));
        resuggest();
        syncComplaintText();
      }, 350);
    });

    // v10.1.0: keluhan yang diubah di sini ikut mengubah Keluhan Utama & Anamnesa di
    // halaman (langsung), lalu Diagnosis (saat selesai mengetik / sebelum INPUT RESEP).
    let syncedText = String(anamnesisEl.value || "").trim();
    let dxSyncedText = syncedText;
    let dxSyncPromise = null;
    const syncStatusEl = shade.querySelector("#ak-medgroup-sync");
    const syncComplaintText = () => {
      const t = String(anamnesisEl.value || "").trim();
      if (!t || t === syncedText || !isMedicalRecordCreatePage()) return;
      writeComplaintToPage(t, syncedText);
      syncedText = t;
      setAnamnesisSource("Keluhan Utama");
      if (syncStatusEl) syncStatusEl.textContent = "✓ Keluhan Utama & Anamnesa di halaman diperbarui.";
    };
    const syncDiagnosis = () => {
      const t = String(anamnesisEl.value || "").trim();
      if (!t || t === dxSyncedText || !isMedicalRecordCreatePage()) return Promise.resolve();
      if (dxSyncPromise) return dxSyncPromise;
      syncComplaintText();
      dxSyncPromise = runTask("PERBARUI DIAGNOSIS", async () => {
        if (syncStatusEl) syncStatusEl.textContent = "⏳ Memperbarui diagnosis…";
        const r = await updateDiagnosisFromComplaint(t);
        dxSyncedText = t;
        if (r.dx) presetDiagnosis = r.dx;
        if (syncStatusEl) syncStatusEl.textContent = `✓ Keluhan Utama & Anamnesa diperbarui · Diagnosis: ${r.note}`;
        renderDx(selectedIcdEntries(), readFieldText("Diagnosa"));
        renderDxPreview();
        resuggest();
      }).finally(() => {
        dxSyncPromise = null;
      });
      return dxSyncPromise;
    };
    anamnesisEl.addEventListener("change", () => {
      clearTimeout(anamnesisTimer);
      renderDxPreview();
      resuggest();
      syncDiagnosis();
    });
    shade
      .querySelector("#ak-medgroup-resuggest")
      ?.addEventListener("click", () => {
        const fresh = readChiefComplaintFromPage();
        if (fresh.text) anamnesisEl.value = fresh.text;
        setAnamnesisSource(fresh.source);
        resuggest({ reset: true });
      });
    weight?.addEventListener("input", () => refreshCategory());
    renderActions();
    refreshCategory();
    shade
      .querySelector("#ak-medgroup-run")
      ?.addEventListener("click", async () => {
        // Jangan panggil refreshCategory() di sini karena fungsi tersebut merender
        // ulang daftar checkbox dan akan menghilangkan centang yang baru dipilih.
        const needsWeight = getMedicationPackageNeedsWeight(ageYears);
        let group = "adult";
        const kg = needsWeight ? parseWeightKg(weight?.value || "") : null;
        if (needsWeight) {
          if (!kg) {
            notify(
              "Kategori pasien belum dapat ditentukan. Isi BB terlebih dahulu untuk pasien usia ≤17 tahun atau umur yang belum terdeteksi.",
              "warn",
              8000,
            );
            return;
          }
          group = getMedicationPackageGroup(kg, ageYears);
          if (!group) {
            notify("Kategori pasien belum dapat ditentukan.", "warn", 8000);
            return;
          }
        }
        // Pastikan state persistent tetap menjadi sumber kebenaran. Item di kategori lain
        // boleh tersimpan tetapi tidak boleh ikut diinput pada kategori saat ini.
        const itemKeys = [...selectedMedicationKeys];
        const actionKeys = [
          ...shade.querySelectorAll("[data-med-action]:checked"),
        ].map((x) => x.value);
        if (!itemKeys.length && !actionKeys.length) {
          notify("Pilih minimal satu obat atau tindakan.", "warn", 7000);
          return;
        }
        // v10.1.0: keluhan yang baru diubah -> perbarui halaman & diagnosis dulu.
        if (isMedicalRecordCreatePage()) {
          clearTimeout(anamnesisTimer);
          await syncDiagnosis().catch(() => {});
        }
        // v10.0.8: picker tetap terbuka (pilihan tidak hilang) bila belum bisa input.
        if (!isMedicalRecordCreatePage()) {
          notify("Buka halaman pelayanan pasien (tab DOKTER) dulu, lalu tekan INPUT RESEP lagi.", "warn", 9000);
          return;
        }
        if (taskRunning) {
          notify("Masih ada proses AUTO KLINIK yang berjalan. Tunggu sampai selesai, lalu tekan INPUT RESEP lagi.", "warn", 8000);
          return;
        }
        close();
        await runTask(`PAKET RESEP ${group === "adult" ? "DEWASA" : "ANAK"}`, () =>
          runMedicationGroupItems(itemKeys, kg, ageYears, actionKeys),
        );
      });
  }

  // ============================================================
  // 7. MENU — RESUME, RESUME + DIAGNOSIS + RESEP
  // ============================================================

  // ---------------- FORM REKAM MEDIS: RESUME ----------------
  // resume : salin Keluhan Utama -> Anamnesa, kesadaran, prognosa (bila ada), layanan, status pulang
  // (mode "ispa" lama tidak lagi ada di menu; diganti RESUME + DIAGNOSIS + RESEP)
  function runTemplate(mode = "ispa") {
    const withDiagnosis = mode === "resume-diagnosis";
    const isResume = mode === "resume" || withDiagnosis;
    const label = withDiagnosis
      ? "RESUME + DIAGNOSIS"
      : isResume
        ? "AUTO KLINIK - RESUME"
        : "AUTO KLINIK - ISPA DEWASA";
    let dxResult = null;
    let dxDetected = null;
    let dxError = null;
    // v10.0.5: tiap langkah RESUME berdiri sendiri. Dulu satu langkah gagal (mis.
    // Layanan) menghentikan semuanya: Status Pulang kosong, Paket Resep tidak terbuka.
    const failed = [];
    const kept = [];
    const step = async (name, fn) => {
      try {
        const r = await fn();
        if (r?.kept) kept.push(`${name} "${r.kept}"`);
      } catch (e) {
        console.warn(`${label}: ${name} gagal`, e);
        failed.push(`${name} (${String(e?.message || e).replace(/\.$/, "")})`);
      }
    };

    return runTask(label, async () => {
      if (!isMedicalRecordCreatePage()) {
        throw new Error(
          "Fungsi ini hanya dapat dijalankan di halaman pelayanan pasien (tab DOKTER). Buka pasien dari antrean poli terlebih dahulu.",
        );
      }

      // Tunggu data pasien halaman ini (bukan pasien sebelumnya) siap.
      await waitPasienReady();

      if (isResume) {
        // v10.0.9: mulai muat daftar layanan lebih dulu (lihat warmServiceList).
        await warmServiceList().catch((e) => LOG("Pemanasan layanan dilewati: " + (e?.message || e)));
        // Jangan menghentikan seluruh Resume bila struktur field berbeda.
        await step("Anamnesa", copyChiefComplaintToAnamnesis);
      }

      if (isResume) await step("Status Kesadaran", setConsciousness);
      else await setConsciousness();

      // RESUME + DIAGNOSIS: Diagnosa + ICD dari Keluhan Utama, SEBELUM layanan
      if (withDiagnosis) {
        const vitals = assessVitals(readVitalsFromPage(), getPatientAgeFromIdentity()?.ageYears ?? null);
        dxDetected = detectDiagnosisFromComplaint(readFieldText("Keluhan Utama"), { vitals });
        const dx = dxDetected && DIAGNOSIS_TEMPLATES.find((d) => d.key === dxDetected.key);
        // v10.0.5: ICD yang sudah diisi dokter dihormati; tidak ditambah diagnosis lain.
        const existingIcd = selectedIcdEntries();
        if (existingIcd.length) {
          dxDetected = null;
          dxResult = null;
          LOG(`ICD sudah terisi (${existingIcd.map((e) => e.code).join(", ")}) -> diagnosis otomatis dilewati`);
          dxError = { existing: existingIcd };
        } else if (dx) {
          // Gagal memilih diagnosis tidak menghentikan resume; dilaporkan di akhir.
          try {
            dxResult = await fillDiagnosis(dx);
          } catch (e) {
            dxError = e;
            console.warn("RESUME + DIAGNOSIS: diagnosis gagal", e);
          }
          if (dxResult) LOG(`Diagnosis dari Keluhan Utama ("${dxDetected.keyword}") -> ${dx.label} ${dxResult.icdCode}`);
        } else {
          LOG("Diagnosis tidak dikenali dari Keluhan Utama -> dilewati");
        }
      }

      if (!isResume) {
        await setDiagnosisAndIcd();
      } else {
        // Resume: isi Prognosa bila kolomnya ada, selain itu dilewati.
        if (findSelectByModel(/(?:^|\.)pasien\.jenis_prognosa$/)) {
          await step("Prognosa", setPrognosis);
        } else {
          LOG("Prognosa Resume tidak tersedia -> dilewati");
        }
      }

      if (isResume) {
        await step("Status Pulang", setDischarge);
        await step("Layanan", addService);
      } else {
        await addService();
        await addRecipeItems(TEMPLATE.medicines);
        await setDischarge();
        validateAndReport();
      }
      const failNote =
        (kept.length ? ` Tidak diubah (sudah diisi dokter): ${kept.join(", ")}.` : "") +
        (failed.length ? ` BELUM TERISI: ${failed.join("; ")}. Isi manual.` : "") +
        unsavedServiceNote();

      if (withDiagnosis) {
        const dxLabel = (key) => DIAGNOSIS_TEMPLATES.find((d) => d.key === key)?.label || key;
        // Satu tombol lengkap: Paket Resep langsung terbuka dengan obat/tindakan
        // dari diagnosis + Keluhan Utama sudah dicentang. Input tetap menunggu dokter.
        const filledDx = dxResult ? DIAGNOSIS_TEMPLATES.find((d) => d.key === dxDetected.key) : null;
        // Tanpa filledDx, Paket Resep memakai ICD yang terisi di halaman (bila ada).
        setTimeout(() => renderMedicationGroupPackagePicker({ diagnosis: filledDx }), 300);
        if (dxError?.existing) {
          notify(
            `RESUME selesai. ICD sudah terisi (${dxError.existing.map((e) => e.code).join(", ")}), jadi diagnosis otomatis tidak ditambahkan. Paket Resep dibuka.` +
              failNote,
            failed.length ? "warn" : "success",
            failed.length ? 20000 : 12000,
          );
        } else if (dxResult) {
          notify(
            `RESUME + DIAGNOSIS selesai. Diagnosis: ${dxLabel(dxDetected.key)} (ICD ${dxResult.icdCode}), dari kata "${dxDetected.keyword}".` +
              (dxDetected.others.length
                ? ` Juga cocok: ${dxDetected.others.map(dxLabel).join(", ")} — isi manual bila perlu.`
                : "") +
              " Paket Resep dibuka: periksa obat lalu INPUT RESEP." +
              failNote,
            failed.length ? "warn" : "success",
            failed.length ? 20000 : 14000,
          );
        } else if (dxError) {
          notify(
            `RESUME selesai, tetapi diagnosis ${dxLabel(dxDetected.key)} gagal diisi: ${dxError.message}` + failNote,
            "warn",
            16000,
          );
        } else {
          notify(
            "RESUME selesai, tetapi diagnosis tidak dikenali dari Keluhan Utama. Isi Diagnosa secara manual." + failNote,
            "warn",
            14000,
          );
        }
        return;
      }

      notify(
        (isResume
          ? "AUTO KLINIK - RESUME selesai. Diagnosa dan Resep tidak diisi. Silakan periksa sebelum SUBMIT."
          : "AUTO KLINIK - ISPA DEWASA selesai. Draft sudah diisi; silakan periksa sebelum SIMPAN/SUBMIT.") + failNote,
        failed.length ? "warn" : "success",
        failed.length ? 20000 : 9000,
      );
    });
  }

  // ============================================================
  // 8. UI & BOOT — notifikasi, kunci proses, launcher, CSS
  // ============================================================

  // Notifikasi ditumpuk (tidak saling menimpa) di kiri bawah.
  function notify(msg, kind = "info", ms = 5000) {
    LOG(`[${kind}]`, msg);
    if (!document.body) return;
    let stack = document.getElementById("ak-notify-stack");
    if (!stack) {
      stack = document.createElement("div");
      stack.id = "ak-notify-stack";
      document.body.appendChild(stack);
    }
    const n = document.createElement("div");
    n.className = "ai-notify " + kind;
    n.title = "Ketuk untuk menutup";
    const icon = document.createElement("span");
    icon.className = "ak-ni";
    icon.textContent = { success: "✓", error: "✕", warn: "!", info: "i" }[kind] || "i";
    const body = document.createElement("span");
    body.textContent = msg;
    n.append(icon, body);
    stack.appendChild(n);
    // v10.0.8: notifikasi bisa diketuk untuk ditutup; paling banyak 4 sekaligus.
    while (stack.childElementCount > 4) stack.firstElementChild.remove();
    const dismiss = () => {
      n.remove();
      if (!stack.childElementCount) stack.remove();
    };
    n.addEventListener("click", dismiss);
    setTimeout(dismiss, ms);
  }

  function mainButtonHtml(busyLabel) {
    return busyLabel
      ? `<span>⏳ ${escapePreviewHtml(busyLabel)}…</span>`
      : `<span>⚡ AUTO KLINIK</span><span class="ak-ver">v${escapePreviewHtml(VERSION)}</span>`;
  }

  function setBusy(on, label = "AUTO KLINIK") {
    const b = document.getElementById("auto-klinik-main");
    if (!b) return;
    b.disabled = on;
    b.innerHTML = mainButtonHtml(on ? label : null);
  }

  // Semua automasi dijalankan lewat runTask: hanya SATU proses boleh berjalan
  // (mencegah dua automasi mengisi form yang sama bersamaan), tombol utama
  // menampilkan status, dan error selalu muncul sebagai notifikasi.
  let taskRunning = false;
  async function runTask(label, fn) {
    if (taskRunning) {
      notify("Masih ada proses AUTO KLINIK yang berjalan. Tunggu sampai selesai.", "warn", 6000);
      return false;
    }
    taskRunning = true;
    setBusy(true, label);
    try {
      await fn();
      return true;
    } catch (err) {
      console.error(err);
      notify(`${label} berhenti: ${err?.message || err}`, "error", 12000);
      return false;
    } finally {
      taskRunning = false;
      setBusy(false);
    }
  }

  // Launcher tampil di beranda, pendaftaran, dan semua halaman rekam medis.
  function isTargetPage() {
    return location.hostname === MEDISIN_HOST && PROSES_PATH.test(location.pathname);
  }

  // Halaman pelayanan pasien (tab apa pun); bagian yang tidak ada di tab dilaporkan saat mengisi.
  function isMedicalRecordCreatePage() {
    return isTargetPage();
  }

  // Menu yang membaca data pasien menunggu store memuat pasien halaman ini dulu.
  async function whenPasienReady(fn) {
    await waitPasienReady();
    return fn();
  }

  const MAIN_MENU = [
    {
      id: "auto-klinik-resume-dx",
      icon: "🧪",
      label: "RESUME + DIAGNOSIS + RESEP",
      desc: "Resume, diagnosis dari keluhan, lalu Paket Resep",
      primary: true,
      run: () => runTemplate("resume-diagnosis"),
    },
    {
      id: "auto-klinik-resume",
      icon: "📋",
      label: "RESUME",
      desc: "Anamnesa, kesadaran, prognosa, layanan, status pulang",
      run: () => runTemplate("resume"),
    },
    {
      id: "auto-klinik-paket-obat",
      icon: "💊",
      label: "PAKET RESEP GOLONGAN",
      desc: "Pilih obat & racikan sesuai umur/BB",
      run: () => whenPasienReady(() => renderMedicationGroupPackagePicker()),
    },
  ];

  function closeMainSubmenu() {
    const submenu = document.getElementById("auto-klinik-submenu");
    if (!submenu) return;
    submenu.classList.remove("ak-open");
    submenu.setAttribute("aria-hidden", "true");
  }

  function ensureButtonMounted() {
    const existing = document.getElementById("auto-klinik-box");
    if (!isTargetPage()) {
      existing?.remove();
      return;
    }
    if (existing?.isConnected) return;

    const mountRoot = document.body || document.documentElement;
    if (!mountRoot) return;

    const box = document.createElement("div");
    box.id = "auto-klinik-box";
    box.setAttribute("data-auto-klinik", "1");
    // v10.0.8: menu muncul DI ATAS tombol utama, jadi tombol tidak bergeser saat menu dibuka.
    const menuButton = (m) =>
      `<button id="${m.id}" type="button"${m.primary ? ' class="ak-primary"' : ""}>` +
      `<span class="ak-ico">${m.icon}</span>` +
      `<span class="ak-txt"><span>${escapePreviewHtml(m.label)}</span><small>${escapePreviewHtml(m.desc)}</small></span>` +
      `</button>`;
    box.innerHTML = `
      <div class="ak-menu">
        <div id="auto-klinik-submenu" class="ak-submenu" aria-hidden="true">
          <div class="ak-sub-head"><span>Auto Klinik</span><span>v${escapePreviewHtml(VERSION)}</span></div>
          <div class="ak-sub-note">Buka pasien dari antrean poli (tab DOKTER) dulu.</div>
          ${MAIN_MENU.map(menuButton).join("")}
        </div>
        <button id="auto-klinik-main" type="button">${mainButtonHtml(taskRunning ? "Berjalan" : null)}</button>
      </div>`;
    mountRoot.appendChild(box);
    if (taskRunning) box.querySelector("#auto-klinik-main").disabled = true;

    const submenu = box.querySelector("#auto-klinik-submenu");
    box.querySelector("#auto-klinik-main")?.addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      const isOpen = submenu.classList.toggle("ak-open");
      submenu.classList.toggle("ak-offpage", !isMedicalRecordCreatePage());
      submenu.setAttribute("aria-hidden", isOpen ? "false" : "true");
    });

    for (const item of MAIN_MENU) {
      box.querySelector(`#${item.id}`)?.addEventListener("click", (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        closeMainSubmenu();
        try {
          Promise.resolve(item.run()).catch((e) => notify(`${item.label}: ${e?.message || e}`, "error", 12000));
        } catch (e) {
          notify(`${item.label}: ${e?.message || e}`, "error", 12000);
        }
      });
    }
  }

  function hookSpaNavigation() {
    // Medisin adalah SPA: rute berganti lewat pushState/replaceState
    // tanpa reload halaman, jadi launcher dicek ulang setiap perpindahan rute.
    if (window.__AUTO_ISPA_SPA_HOOKED__) return;
    window.__AUTO_ISPA_SPA_HOOKED__ = true;

    for (const method of ["pushState", "replaceState"]) {
      const original = history[method];
      history[method] = function () {
        const result = original.apply(this, arguments);
        window.dispatchEvent(new Event("auto-ispa-route-change"));
        return result;
      };
    }

    const recheck = () => {
      setTimeout(ensureButtonMounted, 50);
      setTimeout(ensureButtonMounted, 250);
    };
    window.addEventListener("popstate", recheck);
    window.addEventListener("hashchange", recheck);
    window.addEventListener("auto-ispa-route-change", recheck);
    window.addEventListener("pageshow", recheck);
  }

  // v10.0.8: satu keluarga huruf sistem (lebih nyaman dibaca di HP & desktop).
  const AK_FONT = 'system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif';

  const STYLES = `
    /* ---------- Launcher (kanan bawah, di atas tombol TEAM CHAT Medisin) ---------- */
    #auto-klinik-box{position:fixed!important;right:16px!important;bottom:56px!important;z-index:2147483644!important;
      display:flex!important;flex-direction:column!important;align-items:flex-end!important;gap:8px!important;
      width:auto!important;max-width:calc(100vw - 24px)!important;box-sizing:border-box!important;
      font-family:${AK_FONT}!important;pointer-events:none!important;}
    #auto-klinik-box .ak-menu{display:flex!important;flex-direction:column!important;align-items:flex-end!important;gap:8px!important;}
    #auto-klinik-box .ak-menu > *{pointer-events:auto!important;}
    #auto-klinik-main{display:inline-flex!important;align-items:center!important;gap:8px!important;min-height:44px!important;
      padding:10px 14px 10px 16px!important;border:0!important;border-radius:999px!important;
      background:linear-gradient(135deg,#fb923c,#ea580c)!important;color:#fff!important;
      font:700 14px/1 ${AK_FONT}!important;letter-spacing:.2px!important;white-space:nowrap!important;
      cursor:pointer!important;touch-action:manipulation!important;box-sizing:border-box!important;
      box-shadow:0 6px 18px rgba(234,88,12,.32),0 2px 6px rgba(15,23,42,.12)!important;}
    #auto-klinik-main .ak-ver{font:600 10.5px/1 ${AK_FONT}!important;padding:3px 7px!important;border-radius:999px!important;
      background:rgba(255,255,255,.22)!important;color:#fff!important;}
    #auto-klinik-main:hover{filter:brightness(1.06)!important;}
    #auto-klinik-main:disabled{cursor:wait!important;background:#64748b!important;box-shadow:0 4px 12px rgba(15,23,42,.2)!important;}
    #auto-klinik-submenu{display:none!important;}
    #auto-klinik-submenu.ak-open{display:flex!important;flex-direction:column!important;gap:6px!important;
      width:min(300px,calc(100vw - 24px))!important;padding:8px!important;border:1px solid #e2e8f0!important;border-radius:16px!important;
      background:#fff!important;box-shadow:0 14px 36px rgba(15,23,42,.2)!important;box-sizing:border-box!important;}
    #auto-klinik-submenu .ak-sub-head{display:flex!important;justify-content:space-between!important;align-items:center!important;
      padding:4px 6px 2px!important;font:700 11px/1.3 ${AK_FONT}!important;color:#64748b!important;letter-spacing:.5px!important;text-transform:uppercase!important;}
    #auto-klinik-submenu .ak-sub-note{display:none!important;}
    #auto-klinik-submenu.ak-offpage .ak-sub-note{display:block!important;margin:0 2px 2px!important;padding:8px 10px!important;border-radius:10px!important;
      background:#fffbeb!important;color:#92400e!important;font:600 12px/1.4 ${AK_FONT}!important;}
    #auto-klinik-submenu button{display:flex!important;align-items:center!important;gap:10px!important;width:100%!important;min-height:48px!important;
      margin:0!important;padding:9px 12px!important;text-align:left!important;border:1px solid #e2e8f0!important;border-radius:12px!important;
      background:#fff!important;color:#0f172a!important;font:700 13.5px/1.25 ${AK_FONT}!important;cursor:pointer!important;
      touch-action:manipulation!important;box-sizing:border-box!important;box-shadow:none!important;}
    #auto-klinik-submenu button:hover{background:#fff7ed!important;border-color:#fdba74!important;}
    #auto-klinik-submenu button .ak-ico{flex:none!important;width:22px!important;text-align:center!important;font-size:17px!important;line-height:1!important;}
    #auto-klinik-submenu button .ak-txt{display:flex!important;flex-direction:column!important;gap:2px!important;min-width:0!important;}
    #auto-klinik-submenu button small{font:500 11.5px/1.3 ${AK_FONT}!important;color:#64748b!important;white-space:normal!important;}
    #auto-klinik-submenu button.ak-primary{background:#f97316!important;border-color:#ea580c!important;color:#fff!important;}
    #auto-klinik-submenu button.ak-primary small{color:#ffedd5!important;}
    #auto-klinik-submenu button.ak-primary:hover{background:#ea580c!important;}

    /* ---------- Notifikasi (kiri bawah; ketuk untuk menutup) ---------- */
    #ak-notify-stack{position:fixed!important;left:12px!important;bottom:12px!important;z-index:2147483647!important;
      display:flex!important;flex-direction:column!important;gap:8px!important;max-width:min(380px,calc(100vw - 24px))!important;
      pointer-events:none!important;}
    .ai-notify{display:flex!important;gap:9px!important;align-items:flex-start!important;padding:10px 12px!important;border-radius:12px!important;
      color:#fff!important;font:500 12.5px/1.42 ${AK_FONT}!important;box-shadow:0 8px 24px rgba(15,23,42,.24)!important;
      pointer-events:auto!important;cursor:pointer!important;word-break:break-word!important;}
    .ai-notify .ak-ni{flex:none!important;font-weight:800!important;}
    .ai-notify.success{background:#15803d!important}
    .ai-notify.error{background:#b91c1c!important}
    .ai-notify.warn{background:#b45309!important}
    .ai-notify.info{background:#1d4ed8!important}

    /* ---------- Overlay & kartu Paket Resep ---------- */
    #ak-medgroup-picker{position:fixed!important;inset:0!important;z-index:2147483646!important;
      background:rgba(15,23,42,.45)!important;display:flex!important;align-items:center!important;justify-content:center!important;
      font-family:${AK_FONT}!important;}
    .ak-rp-card{width:min(680px,calc(100vw - 24px))!important;max-height:calc(100vh - 40px)!important;overflow:auto!important;
      background:#fff!important;border-radius:16px!important;padding:16px!important;box-shadow:0 24px 60px rgba(15,23,42,.35)!important;
      box-sizing:border-box!important;color:#0f172a!important;}
    .ak-rp-title{font:800 18px/1.25 ${AK_FONT}!important;color:#0f172a!important}
    .ak-rp-sub{font:500 13px/1.45 ${AK_FONT}!important;color:#64748b!important;margin-top:4px!important}
    .ak-rp-x{flex:none!important;width:36px!important;height:36px!important;border:0!important;border-radius:10px!important;background:#f1f5f9!important;
      color:#475569!important;font:400 24px/1 ${AK_FONT}!important;cursor:pointer!important;}
    .ak-rp-x:hover{background:#e2e8f0!important;}
    .ak-rp-label{margin-bottom:6px!important;font:800 11px/1.3 ${AK_FONT}!important;color:#64748b!important;letter-spacing:.4px!important;}

    /* ---------- Paket Resep: isi ---------- */
    .akm-dx-row{font:500 12.5px/1.5 ${AK_FONT}!important;color:#334155!important;}
    .akm-dx-row b{color:#0f172a!important;}
    .akm-dx-role{font:700 10px/1.4 ${AK_FONT}!important;color:#0369a1!important;background:#f0f9ff!important;border:1px solid #bae6fd!important;
      border-radius:999px!important;padding:0 6px!important;margin-right:4px!important;}
    .akm-dxp{margin-top:8px!important;padding:8px 10px!important;border:1px dashed #93c5fd!important;border-radius:10px!important;
      background:#eff6ff!important;color:#1e3a8a!important;font:500 12.5px/1.5 ${AK_FONT}!important;}
    .akm-dxp b{color:#0f172a!important;}
    .akm-dxp small{color:#475569!important;}
    .akm-dxp.none{border-color:#cbd5e1!important;background:#f8fafc!important;color:#64748b!important;}
    .akm-dxp-head{display:flex!important;align-items:center!important;gap:6px!important;font-weight:700!important;margin-bottom:2px!important;}
    .akm-dxp-tag{margin-left:auto!important;padding:1px 8px!important;border-radius:999px!important;background:#2563eb!important;color:#fff!important;
      font:700 10.5px/1.5 ${AK_FONT}!important;}
    .akm-dxp-tag.ok{background:#16a34a!important;}
    .akm-sync:empty{display:none!important;}
    .akm-sync{color:#15803d!important;font-weight:600!important;}
    .akm-vitals{margin-top:6px!important;font:600 12px/1.5 ${AK_FONT}!important;color:#334155!important;}
    .akm-vflag{display:inline-block!important;margin:3px 4px 0 0!important;padding:1px 7px!important;border-radius:999px!important;font:700 11px/1.5 ${AK_FONT}!important;}
    .akm-vflag.warn{background:#fef3c7!important;color:#92400e!important;}
    .akm-vflag.danger{background:#fee2e2!important;color:#b91c1c!important;}
    .ak-package-choice{display:flex!important;align-items:center!important;gap:9px!important;padding:10px 12px!important;border:1px solid #e2e8f0!important;
      border-radius:10px!important;background:#fff!important;cursor:pointer!important;font-weight:700!important;}
    .ak-package-choice input{flex:none!important;width:18px!important;height:18px!important;margin:0!important;accent-color:#f97316!important;}
    .ak-package-anamnesis{display:block!important;width:100%!important;margin-top:7px!important;padding:10px 12px!important;border:1px solid #cbd5e1!important;
      border-radius:10px!important;background:#fff!important;color:#0f172a!important;font:500 13px/1.45 ${AK_FONT}!important;box-sizing:border-box!important;resize:vertical!important;}
    .ak-package-anamnesis:focus{outline:none!important;border-color:#f97316!important;box-shadow:0 0 0 3px rgba(249,115,22,.14)!important;}
    .ak-package-suggestion{margin-top:8px!important;}
    .ak-package-suggestion-box{padding:10px 12px!important;border:1px solid #ddd6fe!important;border-radius:10px!important;background:#f5f3ff!important;
      color:#3b0764!important;font:500 12px/1.6 ${AK_FONT}!important;}
    .ak-package-suggestion-box .ak-live-preview-title{color:#6d28d9!important;margin-bottom:4px!important;}
    .ak-package-suggestion-warn{margin-top:6px!important;color:#92400e!important;font:600 11px/1.4 ${AK_FONT}!important;}
    .ak-suggest-badge{flex:none!important;margin-left:auto!important;padding:2px 7px!important;border-radius:999px!important;background:#7c3aed!important;color:#fff!important;
      font:700 10px/1.4 ${AK_FONT}!important;font-style:normal!important;}

    /* ---------- Paket Resep: tata letak kartu ---------- */
    .ak-rp-card.akm{display:flex!important;flex-direction:column!important;width:min(1120px,calc(100vw - 32px))!important;max-width:none!important;
      height:min(900px,calc(100vh - 32px))!important;max-height:none!important;padding:0!important;overflow:hidden!important;background:#f1f5f9!important;}
    .akm-head{display:flex!important;justify-content:space-between!important;align-items:flex-start!important;gap:12px!important;
      padding:14px 18px!important;background:#fff!important;border-bottom:1px solid #e2e8f0!important;}
    .akm-head .ak-rp-title{font-size:19px!important;}
    .akm-head .ak-rp-sub{font-size:12.5px!important;line-height:1.5!important;}
    .akm-body{flex:1!important;min-height:0!important;overflow:auto!important;padding:14px!important;display:grid!important;gap:12px!important;
      grid-template-columns:minmax(0,5fr) minmax(0,7fr)!important;align-items:start!important;}
    .akm-col{display:flex!important;flex-direction:column!important;gap:12px!important;min-width:0!important;}
    .akm-sec{background:#fff!important;border:1px solid #e2e8f0!important;border-radius:14px!important;padding:12px 14px!important;min-width:0!important;
      box-shadow:0 1px 2px rgba(15,23,42,.04)!important;}
    .akm-preview{padding:0!important;border:0!important;background:transparent!important;box-shadow:none!important;}
    .akm-sec-title{display:flex!important;align-items:center!important;gap:8px!important;margin:0 0 10px!important;
      font:800 13px/1.3 ${AK_FONT}!important;color:#0f172a!important;letter-spacing:.2px!important;}
    .akm-sec-title small{font-weight:600!important;color:#94a3b8!important;}
    .akm-count{margin-left:auto!important;padding:2px 9px!important;border-radius:999px!important;background:#f97316!important;color:#fff!important;font-size:11px!important;}
    .akm-count:empty{display:none!important;}
    .akm-link{margin-left:auto!important;border:0!important;background:transparent!important;color:#ea580c!important;
      font:700 12px ${AK_FONT}!important;cursor:pointer!important;padding:2px 4px!important;}
    .akm-hint{margin-top:8px!important;color:#64748b!important;font:500 11.5px/1.45 ${AK_FONT}!important;}
    .akm-stats{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:8px!important;}
    .akm-stat{display:flex!important;flex-direction:column!important;gap:4px!important;padding:9px 10px!important;border:1px solid #e2e8f0!important;
      border-radius:10px!important;background:#f8fafc!important;min-width:0!important;}
    .akm-stat > span:first-child{font:700 10.5px ${AK_FONT}!important;color:#64748b!important;text-transform:uppercase!important;letter-spacing:.4px!important;}
    .akm-stat b{font:800 16px/1.2 ${AK_FONT}!important;color:#0f172a!important;}
    .akm-stat-bb{cursor:text!important;}
    .akm-bb{display:flex!important;align-items:baseline!important;gap:4px!important;}
    .akm-bb input{width:100%!important;min-width:0!important;padding:0!important;border:0!important;border-bottom:2px solid #f97316!important;
      border-radius:0!important;background:transparent!important;font:800 16px/1.2 ${AK_FONT}!important;color:#0f172a!important;outline:none!important;}
    .akm-bb i{font:700 12px ${AK_FONT}!important;color:#64748b!important;font-style:normal!important;}
    .akm-cat{align-self:flex-start!important;padding:2px 9px!important;border-radius:999px!important;font-size:13px!important;}
    .akm-cat.adult{background:#ffedd5!important;color:#9a3412!important;}
    .akm-cat.child{background:#dbeafe!important;color:#1d4ed8!important;}
    .akm-missing{color:#b45309!important;}
    .akm-cat.akm-missing{background:#fef3c7!important;}
    .akm .ak-package-anamnesis{margin-top:0!important;min-height:64px!important;}
    .akm-items{display:flex!important;flex-direction:column!important;gap:12px!important;}
    .akm-group-title{margin:0 0 6px!important;font:800 10.5px ${AK_FONT}!important;color:#64748b!important;text-transform:uppercase!important;letter-spacing:.5px!important;}
    .akm-choices{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:6px!important;}
    .akm .ak-package-choice{min-height:40px!important;padding:7px 10px!important;gap:9px!important;font:600 13px/1.3 ${AK_FONT}!important;color:#1e293b!important;}
    .akm .ak-package-choice:hover{border-color:#cbd5e1!important;}
    .akm .ak-package-choice.akm-suggested{border-color:#c4b5fd!important;}
    .akm .ak-package-choice.akm-on{border-color:#f97316!important;background:#fff7ed!important;box-shadow:inset 3px 0 0 #f97316!important;}
    .akm-name{display:flex!important;flex-direction:column!important;min-width:0!important;}
    .akm-name small{font:500 11px/1.3 ${AK_FONT}!important;color:#64748b!important;}
    .akm .ak-package-suggestion-box{font-size:12px!important;}
    .akm-foot{display:flex!important;align-items:center!important;gap:12px!important;padding:12px 18px!important;background:#fff!important;
      border-top:1px solid #e2e8f0!important;box-shadow:0 -4px 14px rgba(15,23,42,.06)!important;}
    .akm-selected{flex:1!important;min-width:0!important;font:500 12px/1.4 ${AK_FONT}!important;color:#475569!important;
      display:-webkit-box!important;-webkit-line-clamp:2!important;-webkit-box-orient:vertical!important;overflow:hidden!important;}
    .akm-selected b{color:#ea580c!important;}
    .akm-actions{display:flex!important;gap:8px!important;flex:none!important;}
    .akm-btn-ghost,.akm-btn-primary{min-height:44px!important;padding:10px 18px!important;border-radius:12px!important;cursor:pointer!important;
      font:700 14px ${AK_FONT}!important;touch-action:manipulation!important;}
    .akm-btn-ghost{border:1px solid #cbd5e1!important;background:#fff!important;color:#475569!important;}
    .akm-btn-ghost:hover{background:#f8fafc!important;}
    .akm-btn-primary{border:1px solid #ea580c!important;background:#f97316!important;color:#fff!important;}
    .akm-btn-primary:hover{background:#ea580c!important;}
    @media (max-width:860px){
      .akm-body{display:flex!important;flex-direction:column!important;align-items:stretch!important;padding:10px!important;gap:10px!important;}
      .akm-col{display:contents!important;}
      .akm-pasien{order:1!important}.akm-diagnosis{order:2!important}.akm-anamnesa{order:3!important}
      .akm-obat{order:4!important}.akm-tindakan{order:5!important}.akm-preview{order:6!important}
    }
    @media (max-width:600px){
      #ak-medgroup-picker{align-items:stretch!important;}
      .ak-rp-card.akm{width:100vw!important;height:100%!important;border-radius:0!important;}
      .akm-head{padding:12px 14px!important;}
      .akm-head .ak-rp-sub{display:none!important;}
      .akm-choices{grid-template-columns:minmax(0,1fr)!important;}
      .akm-stat b,.akm-bb input{font-size:15px!important;}
      .akm-foot{flex-direction:column!important;align-items:stretch!important;padding:10px 12px!important;gap:8px!important;}
      .akm-actions > *{flex:1!important;}
    }

    /* ---------- Preview obat terpilih ---------- */
    .ak-package-live-preview{margin-top:0!important;}
    .ak-package-preview-meta{margin:0 0 10px!important;padding:10px 12px!important;border-radius:10px!important;background:#fff!important;
      border:1px solid #e2e8f0!important;font:600 13px/1.55 ${AK_FONT}!important;color:#334155!important;}
    .ak-live-preview-box{padding:12px!important;border:1px solid #fed7aa!important;border-radius:14px!important;background:#fffaf5!important;}
    .ak-live-preview-head{display:flex!important;justify-content:space-between!important;gap:10px!important;align-items:flex-start!important;}
    .ak-live-preview-title{font:800 13px/1.3 ${AK_FONT}!important;color:#9a3412!important;}
    .ak-live-preview-sub{font:500 11px/1.4 ${AK_FONT}!important;color:#64748b!important;margin-top:2px!important;}
    .ak-live-preview-count{flex:none!important;padding:3px 9px!important;border-radius:999px!important;background:#f97316!important;color:#fff!important;font:800 11px ${AK_FONT}!important;}
    .ak-preview-section{margin-top:12px!important;}
    .ak-live-preview-row{display:grid!important;grid-template-columns:minmax(0,1.35fr) minmax(180px,.85fr)!important;gap:12px!important;
      padding:11px 12px!important;border:1px solid #e2e8f0!important;border-radius:10px!important;background:#fff!important;margin-top:7px!important;
      font:500 12px/1.45 ${AK_FONT}!important;color:#334155!important;}
    .ak-live-preview-racikan{padding:11px 12px!important;border:1px solid #e2e8f0!important;border-radius:10px!important;background:#fff!important;
      margin-top:7px!important;font:500 12px/1.5 ${AK_FONT}!important;color:#334155!important;}
    .ak-live-preview-row b,.ak-live-preview-racikan b{font-size:13px!important;color:#0f172a!important;}
    .ak-live-preview-row small,.ak-live-preview-racikan small{display:block!important;margin-top:3px!important;color:#64748b!important;font-weight:500!important;}
    .ak-preview-empty{padding:11px 12px!important;border:1px dashed #cbd5e1!important;border-radius:10px!important;color:#64748b!important;
      background:#f8fafc!important;font:500 12px/1.4 ${AK_FONT}!important;}
    .ak-preview-notes{margin-top:12px!important;padding:10px 12px!important;border:1px solid #fde68a!important;border-radius:10px!important;
      background:#fffbeb!important;color:#92400e!important;font:500 12px/1.5 ${AK_FONT}!important;}
    @media (max-width:767px){.ak-live-preview-row{grid-template-columns:1fr!important;}}
  `;

  const DRUGMAP_STYLES = `
    #ak-drugmap{position:fixed!important;inset:0!important;z-index:2147483646!important;display:flex!important;align-items:center!important;
      justify-content:center!important;padding:12px!important;background:rgba(15,23,42,.45)!important;font-family:${AK_FONT}!important;box-sizing:border-box!important;}
    #ak-drugmap .akd-card{width:min(460px,100%)!important;max-height:min(560px,calc(100vh - 24px))!important;display:flex!important;flex-direction:column!important;
      gap:10px!important;padding:16px!important;border-radius:16px!important;background:#fff!important;color:#0f172a!important;
      box-shadow:0 20px 50px rgba(15,23,42,.35)!important;box-sizing:border-box!important;}
    #ak-drugmap .akd-title{font:700 16px/1.3 ${AK_FONT}!important;}
    #ak-drugmap .akd-sub{font:400 13px/1.45 ${AK_FONT}!important;color:#475569!important;}
    #ak-drugmap input{width:100%!important;min-height:40px!important;padding:8px 10px!important;border:1px solid #cbd5e1!important;border-radius:10px!important;
      font:400 14px/1.3 ${AK_FONT}!important;color:#0f172a!important;background:#fff!important;box-sizing:border-box!important;}
    #ak-drugmap .akd-list{display:flex!important;flex-direction:column!important;gap:6px!important;overflow:auto!important;min-height:60px!important;}
    #ak-drugmap .akd-opt{display:flex!important;justify-content:space-between!important;align-items:center!important;gap:10px!important;min-height:40px!important;
      padding:8px 10px!important;border:1px solid #e2e8f0!important;border-radius:10px!important;background:#f8fafc!important;color:#0f172a!important;
      font:600 13px/1.3 ${AK_FONT}!important;text-align:left!important;cursor:pointer!important;}
    #ak-drugmap .akd-opt:hover{background:#ffedd5!important;border-color:#fb923c!important;}
    #ak-drugmap .akd-opt small{flex:none!important;font:400 12px/1.2 ${AK_FONT}!important;color:#64748b!important;}
    #ak-drugmap .akd-empty{padding:14px 8px!important;font:400 13px/1.4 ${AK_FONT}!important;color:#64748b!important;text-align:center!important;}
    #ak-drugmap .akd-foot{display:flex!important;justify-content:space-between!important;align-items:center!important;gap:10px!important;}
    #ak-drugmap .akd-hint{font:400 12px/1.3 ${AK_FONT}!important;color:#64748b!important;}
    #ak-drugmap #ak-drugmap-skip{min-height:36px!important;padding:6px 12px!important;border:1px solid #cbd5e1!important;border-radius:10px!important;
      background:#fff!important;color:#334155!important;font:600 13px/1 ${AK_FONT}!important;cursor:pointer!important;}
  `;

  function start() {
    // v10.0.8: cegah eksekusi ganda bila ada dua salinan script aktif.
    const root = document.documentElement;
    if (root?.hasAttribute("data-auto-klinik")) {
      LOG(`Script lain (v${root.getAttribute("data-auto-klinik")}) sudah aktif -> salinan ini tidak dijalankan.`);
      return;
    }
    root?.setAttribute("data-auto-klinik", VERSION);
    addStyle(STYLES + DRUGMAP_STYLES);
    hookSpaNavigation();
    ensureButtonMounted();

    // Aplikasi dapat mengganti <body> setelah halaman dimuat; coba ulang beberapa kali.
    [50, 150, 350, 700, 1200, 2000].forEach((ms) => setTimeout(ensureButtonMounted, ms));

    // Pasang ulang launcher bila aplikasi menghapusnya.
    const observer = new MutationObserver(() => {
      if (isTargetPage() && !document.getElementById("auto-klinik-box")) {
        setTimeout(ensureButtonMounted, 30);
      }
    });
    const observe = () => {
      const root = document.body || document.documentElement;
      if (!root) return setTimeout(observe, 50);
      try {
        observer.observe(root, { childList: true, subtree: true });
      } catch (_) {}
      ensureButtonMounted();
    };
    observe();

    // Jaring pengaman ringan (langsung kembali bila launcher sudah ada).
    setInterval(ensureButtonMounted, 1500);

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        ensureButtonMounted();
        setTimeout(ensureButtonMounted, 100);
        setTimeout(ensureButtonMounted, 500);
      }, { once: true });
    }

    document.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape") closeMainSubmenu();
    });

    // Klik di luar launcher menutup submenu.
    document.addEventListener("click", (ev) => {
      const box = document.getElementById("auto-klinik-box");
      if (box && !box.contains(ev.target)) closeMainSubmenu();
    }, true);

    LOG(`Launcher v${VERSION} aktif | URL:`, location.href);
  }

  // Mode test (Node): ekspos data & fungsi murni tanpa menyentuh DOM.
  if (globalThis.__AUTO_KLINIK_TEST__) {
    Object.assign(globalThis.__AUTO_KLINIK_TEST__, {
      VERSION,
      SCRIPT_VERSION_FALLBACK,
      ITEMS,
      TEMPLATE,
      RECIPE_TEMPLATES,
      RACIKAN_TEMPLATES,
      CHILD_SYRUP_SERIES,
      CHILD_PUYER_SERIES,
      SALEP_RACIKAN,
      PACKAGE_ACTIONS,
      MEDICATION_GROUP_PACKAGES,
      MEDICATION_ITEMS_FLAT,
      weightBands,
      bandLabel,
      isWeightInBand,
      getWeightTemplate,
      getWeightRecipeTemplate,
      parseWeightKg,
      parseWeightFromVitalsText,
      isSyrupMedication,
      buildDrugForItem,
      ANAMNESIS_SUGGESTION_RULES,
      DIAGNOSIS_TEMPLATES,
      DIAGNOSIS_FROM_COMPLAINT,
      detectDiagnosisFromComplaint,
      assessVitals,
      formatVitalsSummary,
      parseStockText,
      suggestMedicationsFromAnamnesis,
      parsePatientAge,
      formatPatientAge,
      auditMedicationPackageDefinitions,
      auditMedicationPackageRuntimeResolvers,
      resolveMedicationItem,
      getMedicationPackageGroup,
      buildMedicationPackagePreview,
      buildLivePreviewHtml,
      makeNyeriUluHatiAnakRecipe,
      makeZincChildRecipe,
      collectBhpForActions,
      kunjunganIdFromPath,
      icdCodeMatches,
      pickIcdOption,
      signaText,
      buildSigna,
      matchSignaMaster,
      drugSearchWord,
      splitProductPrefix,
      penjaminPrefix,
      pickProductForPenjamin,
      serviceNameFor,
      itemBaseName,
      racikanJenisFor,
      racikanQtyFor,
      racikanSignaFor,
      parseMedisinAge,
      // pengisi form (diuji dengan tiruan state Vue Medisin)
      pasienAktif,
      getPatientAgeFromIdentity,
      getPatientWeightFromLatestVitals,
      readVitalsFromPage,
      readChiefComplaintFromPage,
      selectedIcdEntries,
      fillDiagnosis,
      updateDiagnosisFromComplaint,
      copyChiefComplaintToAnamnesis,
      setConsciousness,
      setPrognosis,
      setDischarge,
      addRecipeItems,
      addBhpItems,
      addService,
      addRacikan,
    });
    return;
  }

  start();
})();
