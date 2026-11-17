const test = require("node:test");
const assert = require("node:assert/strict");
const { loadScript, readHeader } = require("./load-script.cjs");

const { api, logs, source } = loadScript();
// Objek dari vm berasal dari "realm" lain; ubah ke objek biasa sebelum dibandingkan.
const plain = (x) => JSON.parse(JSON.stringify(x));

test("header userscript: identitas Medisin & mode inject page", () => {
  const meta = readHeader(source);
  // @name + @namespace tidak boleh berubah lagi setelah script dipasang dokter.
  assert.equal(meta.name[0], "Medisin - AUTO KLINIK");
  assert.equal(meta.namespace[0], "medisin-auto-klinik");
  assert.match(meta.version[0], /^\d+\.\d+\.\d+$/);
  assert.deepEqual(meta.match, ["https://app.medisin.id/*"]);
  // State Vue halaman hanya terbaca dari konteks halaman.
  assert.equal(meta["inject-into"][0], "page");
});

test("versi cadangan di kode sama dengan @version", () => {
  const meta = readHeader(source);
  assert.equal(api.SCRIPT_VERSION_FALLBACK, meta.version[0]);
  assert.equal(api.VERSION, meta.version[0]);
});

test("tidak ada error/warning audit saat script dimuat", () => {
  const problems = logs.filter((l) => l.level !== "log");
  assert.deepEqual(plain(problems), []);
  const audit = api.auditMedicationPackageDefinitions();
  assert.deepEqual(plain(audit.errors), []);
  assert.deepEqual(plain(audit.warnings), []);
  assert.deepEqual(plain(api.auditMedicationPackageRuntimeResolvers()), []);
});

test("semua obat di semua template terdaftar di master ITEMS", () => {
  const missing = [];
  const check = (item, where) => {
    if (!api.ITEMS[item]?.target) missing.push(`${where}: ${item}`);
  };
  api.TEMPLATE.medicines.forEach((m) => check(m.item, "ISPA DEWASA"));
  for (const [k, t] of Object.entries(api.RECIPE_TEMPLATES))
    t.medicines.forEach((m) => check(m.item, k));
  for (const [k, t] of Object.entries(api.RACIKAN_TEMPLATES))
    t.ingredients.forEach((i) => check(i.item, k));
  api.SALEP_RACIKAN.ingredients.forEach((i) => check(i.item, "SALEP_RACIKAN"));
  assert.deepEqual(missing, []);
});

test("rentang BB bersambung: setiap BB 1 kg s.d. batas atas punya tepat satu template", () => {
  const series = [
    ...api.CHILD_PUYER_SERIES.map((s) => ({ ...s, source: api.RACIKAN_TEMPLATES })),
    ...api.CHILD_SYRUP_SERIES.map((s) => ({ ...s, source: api.RECIPE_TEMPLATES })),
  ];
  for (const s of series) {
    const tpls = Object.entries(s.source).filter(([k]) => k.startsWith(s.prefix));
    const minKg = s.dosed ? s.minKg || api.DOSE_BANDS_KG[0] : 1; // v0.8.0: series per mg/kg mulai 2 kg
    for (let w10 = minKg * 10; w10 <= s.maxKg * 10; w10++) {
      const w = w10 / 10;
      const hits = tpls.filter(([, t]) => api.isWeightInBand(t.band, w));
      assert.equal(hits.length, 1, `${s.prefix} BB ${w} kg -> ${hits.length} template`);
    }
    // Di luar rentang: tidak ada template (tidak menebak dosis).
    assert.equal(tpls.filter(([, t]) => api.isWeightInBand(t.band, minKg - 0.1)).length, 0);
    assert.equal(tpls.filter(([, t]) => api.isWeightInBand(t.band, s.maxKg + 0.1)).length, 0);
  }
});

// Nilai yang dihasilkan v8.1.6 untuk BB yang sudah tercakup — harus tetap sama.
test("regresi dosis berbasis BB sama dengan v8.1.6", () => {
  const qty = (prefix, kg) => api.getWeightTemplate(prefix, kg).tpl.ingredients.map((i) => i.quantity);
  const dose = (prefix, kg) => api.getWeightRecipeTemplate(prefix, kg).tpl.medicines[0].dose;

  // Antibiotik tidak berubah.
  assert.deepEqual(plain(qty("ANTIBIOTIK_ANAK_", 50)), ["10"]);
  assert.deepEqual(plain(qty("CEFADROXIL_ANAK_", 40)), ["8"]);
  // v0.8.0: per mg/kg (lihat tes "v0.8.0: dosis anak per mg/kg").
  const lm = api.getWeightTemplate("BARU_LAMBUNG_MUAL_", 10).tpl;
  assert.deepEqual([lm.doseFreq, lm.duration, lm.compoundInstruction], ["2", "6", "buat 12"]); // 2x sehari, bungkus menyesuaikan
  assert.equal(dose("MUAL_MUNTAH_SYRUP_ANAK_", 3), "0.5");
  assert.equal(dose("MUAL_MUNTAH_SYRUP_ANAK_", 10), "2");

  assert.equal(dose("ANTIBIOTIK_SYRUP_ANAK_", 2), "1");
  assert.equal(dose("ANTIBIOTIK_SYRUP_ANAK_", 4), "2");
  assert.equal(dose("ANTIBIOTIK_SYRUP_ANAK_", 10), "4");
  assert.equal(dose("CEFADROXIL_SYRUP_ANAK_", 12.5), "5");

  const syrup = api.getWeightRecipeTemplate("CEFADROXIL_SYRUP_ANAK_", 12.5).tpl.medicines[0];
  assert.equal(syrup.freq, "2");
  assert.equal(syrup.days, "");
  assert.equal(syrup.total, "1"); // v10.0.6: 1 botol (permintaan dokter)
  assert.equal(api.getWeightRecipeTemplate("ANTIBIOTIK_SYRUP_ANAK_", 10).tpl.medicines[0].total, "1");
});

test("BB yang dulu jatuh di celah rentang sekarang mendapat template", () => {
  // v8.1.6: rentang 1-5 lalu 6-10 → BB 5,1–6 kg tidak punya template.
  assert.ok(api.getWeightTemplate("ISPA_ANAK_", 5.5));
  assert.ok(api.getWeightTemplate("DEMAM_ANAK_", 11));
  // v8.1.6: 1-2,5 lalu 3,5-5 → BB 3 kg tidak punya template.
  assert.equal(api.getWeightRecipeTemplate("ANTIBIOTIK_SYRUP_ANAK_", 3).tpl.medicines[0].dose, "2");
});

test("label rentang BB mudah dibaca", () => {
  const [first, second] = api.weightBands(5, 10);
  assert.equal(api.bandLabel(first), "1-5 KG");
  assert.equal(api.bandLabel(second), ">5-10 KG");
  assert.equal(api.bandLabel(api.weightBands(2.5, 5)[1]), ">2,5-5 KG");
});

test("umur dibaca dari teks identitas pasien", () => {
  const full = api.parsePatientAge("Lahir 01 Jan 2000 (30 tahun, 2 bulan, 5 hari) Laki-laki");
  assert.equal(full.years, 30);
  assert.equal(full.months, 2);
  assert.equal(full.days, 5);
  assert.ok(Math.abs(full.ageYears - (30 + 2 / 12 + 5 / 365)) < 1e-9);

  assert.equal(api.parsePatientAge("(4 tahun, 6 bulan)").ageYears, 4.5);
  assert.equal(api.parsePatientAge("(17 tahun)").ageYears, 17);
  assert.equal(api.parsePatientAge("tidak ada umur"), null);
  assert.equal(api.parsePatientAge(""), null);
  assert.equal(api.formatPatientAge(full), "Umur dari identitas: 30 tahun, 2 bulan, 5 hari");
});

test("BB dibaca dari input pengguna", () => {
  assert.equal(api.parseWeightKg("12,5"), 12.5);
  assert.equal(api.parseWeightKg("40 kg"), 40);
  assert.equal(api.parseWeightKg(""), null);
  assert.equal(api.parseWeightKg("0"), null);
});

test("BB terbaru dibaca dari teks Tanda-Tanda Vital", () => {
  const w = api.parseWeightFromVitalsText;
  assert.equal(w("Tinggi badan 120 cm Berat badan 18 kg Suhu 37"), 18);
  assert.equal(w("Berat badan: 12,5 kg"), 12.5);
  // Beberapa kunjungan berderet: kunjungan terbaru = angka terakhir.
  assert.equal(w("Berat badan 16 17 18,5 kg"), 18.5);
  assert.equal(w("Berat badan - kg"), null);
  assert.equal(w("Tidak ada data"), null);
});

test("saran obat dari anamnesa: dewasa", () => {
  const s = (t) => plain(api.suggestMedicationsFromAnamnesis(t, "adult"));

  const demam = s("Demam sejak 2 hari, sakit kepala");
  assert.deepEqual(demam.keys, ["PARACETAMOL_DEWASA"]);
  assert.deepEqual(demam.matches.map((m) => m.label), ["Demam", "Sakit kepala"]);

  // v10.0.9: batuk dewasa = Paracetamol + Ambroxol + Cetirizine (bukan Alpara); tidak dobel.
  const ispa = s("batuk pilek 3 hari, demam, dahak kuning");
  assert.deepEqual(ispa.keys, ["PARACETAMOL_DEWASA", "AMBROXOL_30_DEWASA", "CETIRIZINE_10_DEWASA"]);
  assert.ok(!ispa.keys.includes("ALPARA_DEWASA"));

  assert.deepEqual(s("nyeri ulu hati, mual, BAB cair 4x").keys, [
    "ANTASIDA_DEWASA",
    "DOMPERIDONE_10_DEWASA",
    "AKITA",
  ]);
  assert.deepEqual(s("kontrol HT dan DM").keys, ["AMLODIPINE_5", "METFORMIN_500"]);
  assert.deepEqual(s("").keys, []);
  assert.deepEqual(s("kontrol rutin").keys, []);
});

test("saran obat dari anamnesa: anak", () => {
  const s = (t) => plain(api.suggestMedicationsFromAnamnesis(t, "child"));
  assert.deepEqual(s("anak panas sejak semalam, batuk").keys, [
    "PARACETAMOL_ANAK",
    "ISPA_ANAK",
  ]);
  // Dahak -> Bapil 2 menggantikan ISPA Anak (komponen tumpang tindih).
  assert.deepEqual(s("batuk berdahak").keys, ["BAPIL_2_ANAK"]);
  assert.deepEqual(s("mencret 5x, muntah").keys, [
    "MUAL_MUNTAH_RACIKAN_BARU",
    "ZINC_ANAK",
    "ORALIT_ANAK",
  ]);
  // Obat khusus dewasa tidak pernah disarankan untuk anak.
  assert.deepEqual(s("riwayat hipertensi").keys, []);
});

test("saran obat dari anamnesa: kata kunci yang dinegasikan diabaikan", () => {
  const s = (t) => plain(api.suggestMedicationsFromAnamnesis(t, "adult")).keys;
  assert.deepEqual(s("batuk, tidak demam"), ["PARACETAMOL_DEWASA", "AMBROXOL_30_DEWASA", "CETIRIZINE_10_DEWASA"]);
  assert.deepEqual(s("tanpa demam"), []);
  assert.deepEqual(s("tidak disertai mual"), []);
  assert.deepEqual(s("demam (-), mual disangkal"), []);
  assert.deepEqual(s("demam -, batuk +"), ["PARACETAMOL_DEWASA", "AMBROXOL_30_DEWASA", "CETIRIZINE_10_DEWASA"]);
  // Aturan "Dahak" tidak terpicu oleh "tidak berdahak" (Ambroxol tetap ada dari aturan batuk dewasa, v10.0.9).
  assert.ok(!plain(api.suggestMedicationsFromAnamnesis("batuk tidak berdahak", "adult")).matches.some((m) => m.label === "Dahak"));
  assert.ok(!plain(api.suggestMedicationsFromAnamnesis("batuk tidak berdahak", "child")).keys.includes("BAPIL_2_ANAK"));
  // Negasi di klausa lain tidak berlaku.
  assert.deepEqual(s("tidak nafsu makan, demam"), ["PARACETAMOL_DEWASA"]);
  // "demam - 3 hari" bukan negasi.
  assert.deepEqual(s("demam - 3 hari"), ["PARACETAMOL_DEWASA"]);
});

test("aturan saran anamnesa hanya menunjuk obat Paket Golongan yang sesuai kategori", () => {
  const byKey = new Map(api.MEDICATION_ITEMS_FLAT.map((x) => [x.key, x]));
  for (const rule of api.ANAMNESIS_SUGGESTION_RULES) {
    for (const group of ["adult", "child"]) {
      for (const key of rule[group]) {
        const item = byKey.get(key);
        assert.ok(item, `${rule.label}: ${key} tidak ada`);
        assert.ok(item.population === group || item.population === "all", `${rule.label}: ${key} bukan ${group}`);
      }
    }
  }
});

test("kategori DEWASA/ANAK mengikuti aturan umur & BB", () => {
  const g = api.getMedicationPackageGroup;
  assert.equal(g(null, 30), "adult"); // umur >17: BB tidak diperlukan
  assert.equal(g(null, 17), null); // umur <=17 tanpa BB: belum bisa ditentukan
  assert.equal(g(41, 15), "adult");
  assert.equal(g(40, 15), "child");
  assert.equal(g(12, null), "child"); // umur tak terbaca: pakai BB
});

test("setiap pilihan Paket Resep Golongan bisa di-resolve untuk pasien tipikal", () => {
  const adult = { weightKg: null, ageYears: 30 };
  const child = { weightKg: 18, ageYears: 5 };
  for (const item of api.MEDICATION_ITEMS_FLAT) {
    const p = item.population === "child" ? child : adult;
    const r = api.resolveMedicationItem(item, p.weightKg, p.ageYears);
    assert.equal(r.note, undefined, `${item.key}: ${r.note}`);
    assert.ok(r.medicines.length + r.racikans.length > 0, item.key);
  }
});

test("preview Paket Resep Golongan: dedup, kategori, dan HTML aman", () => {
  const preview = api.buildMedicationPackagePreview(
    ["PARACETAMOL_ANAK", "ISPA_ANAK", "AMOXICILLIN_500_DEWASA"],
    18,
    5,
    ["CEK_GULA"],
  );
  assert.equal(preview.racikans.length, 2);
  assert.equal(preview.medicines.length, 3); // 3 bahan Cek Gula Darah
  assert.ok(preview.notes.some((n) => n.includes("Amoxicillin 500 mg")), "obat dewasa ditolak untuk anak");

  const html = api.buildLivePreviewHtml({
    medicines: [{ item: "PARACETAMOL_500", freq: "3", dose: "1", total: "10", instruction: "<b>x</b>" }],
    racikans: [],
    notes: [],
  });
  assert.ok(html.includes("&lt;b&gt;x&lt;/b&gt;"));
  assert.ok(!html.includes("<b>x</b>"));
});

test("resep anak berbasis umur", () => {
  assert.equal(api.makeNyeriUluHatiAnakRecipe(3), null);
  assert.equal(api.makeNyeriUluHatiAnakRecipe(5).medicines[0].dose, "0.5");
  assert.equal(api.makeNyeriUluHatiAnakRecipe(11).medicines[0].dose, "1");
  assert.equal(api.makeZincChildRecipe(0.3).medicines[0].total, "5");
  assert.equal(api.makeZincChildRecipe(2).medicines[0].total, "10");
});

test("semua racikan punya isi lengkap untuk setiap kolom form", () => {
  const all = { ...api.RACIKAN_TEMPLATES, SALEP_RACIKAN: api.SALEP_RACIKAN };
  for (const [key, tpl] of Object.entries(all)) {
    for (const field of ["name", "duration", "doseFreq", "doseAmount", "unit", "instruction", "compoundInstruction"]) {
      assert.ok(String(tpl[field] ?? "").trim(), `${key}: kolom ${field} kosong`);
    }
    for (const ing of tpl.ingredients) assert.match(String(ing.quantity), /^\d+(\.\d+)?$/, `${key}: jumlah ${ing.item}`);
  }
});

test("semua syrup mendapat Satuan Pemakaian ml (termasuk Cefadroxil SYR)", () => {
  for (const [key, it] of Object.entries(api.ITEMS)) {
    const drug = api.buildDrugForItem(key, {});
    assert.equal(api.isSyrupMedication(drug), it.unit === "bottle", key);
  }
});

test("v9.4: hari & jumlah obat tablet konsisten (frekuensi x dosis x hari <= jumlah)", () => {
  const isTablet = (m) => api.ITEMS[m.item]?.unit === "tablet";
  const prn = /SETIAP BAB|TIAP SELESAI BAB/; // dosis tergantung kejadian
  const all = [
    ...api.TEMPLATE.medicines.map((m) => ["ISPA DEWASA", m]),
    ...Object.entries(api.RECIPE_TEMPLATES).flatMap(([k, t]) => t.medicines.map((m) => [k, m])),
    ...api.MEDICATION_ITEMS_FLAT.filter((x) => x.medicine).map((x) => [x.key, x.medicine]),
    ...[3, 5, 7, 11].flatMap((age) => (api.makeNyeriUluHatiAnakRecipe(age)?.medicines || []).map((m) => [`antasida ${age}th`, m])),
  ];
  const bad = [];
  for (const [where, m] of all) {
    if (!isTablet(m) || prn.test(m.instruction || "")) continue;
    const perDay = Number(m.freq) * Number(m.dose);
    const days = Number(m.days);
    const total = Number(m.total);
    if (!m.days || !m.total) bad.push(`${where} ${m.item}: hari/jumlah kosong`);
    else if (!(perDay * days <= total && total < perDay * (days + 1)))
      bad.push(`${where} ${m.item}: ${m.freq}x${m.dose} x ${days} hari ≠ ${total}`);
  }
  assert.deepEqual(bad, []);
});

test("v9.4: saran dari keluhan utama — keluhan baru", () => {
  const s = (t, g = "adult") => plain(api.suggestMedicationsFromAnamnesis(t, g)).keys;
  assert.deepEqual(s("sakit gigi berlubang 2 hari"), ["IBUPROFEN_400", "AMOXICILLIN_500_DEWASA"]);
  assert.deepEqual(s("nyeri haid hari pertama"), ["ASAM_MEFENAMAT_500_DEWASA"]);
  assert.deepEqual(s("anyang-anyangan, kencing perih"), ["CEFADROXIL_500_DEWASA", "PARACETAMOL_DEWASA"]);
  assert.deepEqual(s("bisul di ketiak"), ["CEFADROXIL_500_DEWASA", "PARACETAMOL_DEWASA"]);
  assert.deepEqual(s("telinga kanan sakit dan berair"), ["AMOXICILLIN_500_DEWASA", "PARACETAMOL_DEWASA", "RECO_TETES_TELINGA"]);
  assert.deepEqual(s("nyeri lutut saat jalan"), ["DICLOFENAC_50", "CALCIUM_500"]);
  assert.deepEqual(s("sariawan"), []);
  assert.deepEqual(s("cacar air", "child"), ["PARACETAMOL_ANAK", "CETIRIZINE_RACIKAN_BARU"]);
  assert.deepEqual(s("anyang-anyangan", "child"), ["CEFADROXIL_PUYER_ANAK", "PARACETAMOL_ANAK"]);
  // Dua NSAID tidak disarankan bersamaan.
  const both = plain(api.suggestMedicationsFromAnamnesis("sakit gigi, pegal-pegal", "adult"));
  assert.ok(both.keys.includes("IBUPROFEN_400") && !both.keys.includes("DICLOFENAC_50"));
});

test("v9.4: kata kunci berisiko tidak lagi memicu obat yang salah", () => {
  const s = (t) => plain(api.suggestMedicationsFromAnamnesis(t, "adult")).keys;
  // Jamur: salep racikan berisi steroid TIDAK disarankan.
  assert.ok(!s("gatal panu di punggung").includes("SALEP_RACIKAN_BARU"));
  assert.ok(!s("kurap").includes("SALEP_RACIKAN_BARU"));
  // "radang sendi" bukan radang tenggorok -> tidak ada antibiotik.
  assert.ok(!s("radang sendi").includes("AMOXICILLIN_500_DEWASA"));
  // "kencing perih" bukan maag.
  assert.ok(!s("kencing perih").includes("ANTASIDA_DEWASA"));
  assert.ok(s("perut perih").includes("ANTASIDA_DEWASA"));
  // Abses gigi = sakit gigi, bukan infeksi kulit.
  assert.ok(!s("abses gigi").includes("CEFADROXIL_500_DEWASA"));
  // Negasi berjarak.
  assert.deepEqual(s("alergi obat disangkal"), []);
  assert.deepEqual(s("demam tidak ada"), []);
});

test("v9.5: contoh Keluhan Utama asli dari screenshot klinik", () => {
  const s = (t, g = "adult") => plain(api.suggestMedicationsFromAnamnesis(t, g)).keys;
  // Dokter meresepkan Dexamethasone + Vit B + Alpara untuk keluhan ini.
  assert.deepEqual(s("tenggorokan nyeri"), ["ALPARA_DEWASA", "DEXAMETHASONE_05"]);
  assert.ok(!s("tenggorokan nyeri").includes("AMOXICILLIN_500_DEWASA"));
  assert.ok(s("radang amandel").includes("AMOXICILLIN_500_DEWASA"));
  const luka =
    "luka jatuh sempat sudah kering kembali lecet setelah ikut lomba, minggu kemarin sudah ke klinik di berikan antibiotik tapi luka ttp saja meradang dan berair terus";
  assert.ok(s(luka).includes("CEFADROXIL_500_DEWASA"));
  assert.ok(!s(luka).includes("SALEP_RACIKAN_BARU"));
});

test("menu DIAGNOSIS: diagnosis dengan kode ICD-10 yang sah", () => {
  const byKey = plain(Object.fromEntries(api.DIAGNOSIS_TEMPLATES.slice(0, 15).map((d) => [d.key, d.icd[0]])));
  assert.ok(api.DIAGNOSIS_TEMPLATES.length >= 150);
  assert.equal(new Set(api.DIAGNOSIS_TEMPLATES.map((d) => d.key)).size, api.DIAGNOSIS_TEMPLATES.length);
  assert.deepEqual(byKey, {
    ISPA: "J06", FARINGITIS: "J02.9", TONSILITIS: "J03.9", GEA: "A09", DISPEPSIA: "K30", FEVER: "R50.9",
    MYALGIA: "M79.1", LBP: "M54.5", CEPHALGIA: "R51", VERTIGO: "R42", DERMATITIS: "L30.9", URTIKARIA: "L50.9",
    DM: "E11.9", HT: "I10", IMUNISASI: "Z27.9",
  });
  for (const d of api.DIAGNOSIS_TEMPLATES) {
    assert.ok(d.query && d.icd.length, d.key);
    for (const c of d.icd) assert.match(c, /^[A-Z]\d{2}(\.\d{1,2})?$/, d.key);
  }
});

test("v9.6: keluhan utama menyarankan resep tindakan", () => {
  const a = (t, g = "adult") => plain(api.suggestMedicationsFromAnamnesis(t, g));
  assert.deepEqual(a("imunisasi DPT", "child").actionKeys, ["IMUNISASI"]);
  assert.deepEqual(a("jadwal vaksin campak rubella", "child").actionKeys, ["IMUNISASI"]);
  assert.deepEqual(a("imunisasi", "child").keys, []); // tindakan saja, tanpa obat
  assert.deepEqual(a("mau cek gula darah").actionKeys, ["CEK_GULA"]);
  assert.deepEqual(a("mau cek gula darah").keys, []);
  // v9.7: keluhan DM TIDAK otomatis cek gula; hanya bila tertulis "cek gula".
  assert.deepEqual(a("kontrol DM").actionKeys, []);
  assert.deepEqual(a("sakit DM").actionKeys, []);
  assert.deepEqual(a("kontrol DM, cek gula").actionKeys, ["CEK_GULA"]);
  assert.deepEqual(a("asam urat tinggi, kolesterol").actionKeys, []);
  assert.deepEqual(a("kontrol DM").keys, ["METFORMIN_500"]);
  assert.deepEqual(a("nyeri sendi, cek asam urat").actionKeys, ["CEK_ASAM_URAT"]);
  assert.deepEqual(a("periksa kolesterol").actionKeys, ["CEK_KOLESTEROL"]);
  assert.deepEqual(a("sering haus dan kencing malam").actionKeys, []);
  assert.deepEqual(a("tidak ada riwayat imunisasi", "child").actionKeys, []);
  assert.deepEqual(a("batuk pilek").actionKeys, []);
  for (const r of api.ANAMNESIS_SUGGESTION_RULES)
    for (const k of r.actions || []) assert.ok(api.PACKAGE_ACTIONS.some((x) => x.key === k), k);
});

test("v9.7: RESUME + DIAGNOSIS memilih diagnosis dari Keluhan Utama", () => {
  const d = (t) => plain(api.detectDiagnosisFromComplaint(t));
  const k = (t) => d(t)?.key ?? null;
  assert.equal(k("tenggorokan nyeri"), "ISPA");
  assert.equal(k("batuk pilek demam 3 hari"), "ISPA"); // demam + batuk = ISPA, bukan Fever
  assert.deepEqual(d("batuk pilek demam 3 hari").others, ["FEVER"]);
  assert.equal(k("mencret 4x, mual muntah"), "GEA"); // diare didahulukan dari mual
  assert.equal(k("nyeri ulu hati, mual"), "DISPEPSIA");
  assert.equal(k("demam sejak semalam"), "FEVER");
  assert.equal(k("kontrol HT"), "HT");
  assert.equal(k("kontrol DM, cek gula"), "DM");
  assert.equal(k("imunisasi DPT"), "IMUNISASI");
  assert.equal(k("batuk pilek, riwayat HT"), "ISPA");
  assert.equal(k("pusing"), "CEPHALGIA");
  assert.equal(k("pusing berputar sejak pagi"), "VERTIGO");
  assert.equal(k("kontrol HT, pusing"), "HT"); // penyakit kronis didahulukan dari keluhan umum
  // HT + DM: yang ditulis duluan
  assert.equal(k("kontrol HT dan DM"), "HT");
  assert.equal(k("kontrol DM dan HT"), "DM");
  assert.deepEqual(d("kontrol DM dan HT").others, ["HT"]);
  assert.equal(k("batuk pilek, amandel bengkak"), "TONSILITIS");
  assert.equal(k("nyeri pinggang 3 hari"), "LBP");
  assert.equal(k("pegal-pegal badan"), "MYALGIA");
  assert.equal(k("gatal bentol-bentol setelah makan udang"), "URTIKARIA");
  assert.equal(k("gatal di tangan, ruam merah"), "DERMATITIS");
  assert.equal(k("sakit kepala"), "CEPHALGIA");
  assert.equal(k("kontrol rutin"), null);
  assert.equal(k(""), null);
  assert.equal(k("tidak demam, tidak batuk"), null);
  const keys = new Set(api.DIAGNOSIS_TEMPLATES.map((x) => x.key));
  for (const x of api.DIAGNOSIS_FROM_COMPLAINT) assert.ok(keys.has(x.key), x.key);
});

test("v9.8: obat dari diagnosis ikut disarankan di Paket Resep", () => {
  const dx = (key) => api.DIAGNOSIS_TEMPLATES.find((d) => d.key === key);
  const s = (text, g, key) => plain(api.suggestMedicationsFromAnamnesis(text, g, { diagnosis: dx(key) }));
  // Keluhan kosong pun tetap dapat saran dari diagnosis.
  assert.deepEqual(s("", "adult", "ISPA").keys, ["PARACETAMOL_DEWASA", "AMBROXOL_30_DEWASA", "CETIRIZINE_10_DEWASA"]);
  assert.deepEqual(s("", "child", "GEA").keys, ["ZINC_ANAK", "ORALIT_ANAK"]);
  assert.deepEqual(s("", "child", "IMUNISASI").actionKeys, ["IMUNISASI"]);
  assert.deepEqual(s("", "adult", "LBP").keys, ["DICLOFENAC_50", "DEXAMETHASONE_05"]);
  // Diagnosis + keluhan digabung tanpa dobel; Alpara menggantikan paracetamol.
  const r = s("batuk pilek, demam, cek gula", "adult", "ISPA");
  assert.deepEqual(r.keys, ["PARACETAMOL_DEWASA", "AMBROXOL_30_DEWASA", "CETIRIZINE_10_DEWASA"]);
  assert.deepEqual(r.actionKeys, ["CEK_GULA"]);
  assert.equal(r.matches[0].label, "Diagnosis ISPA");
  // Tanpa diagnosis & keluhan kosong: tidak ada saran.
  assert.deepEqual(plain(api.suggestMedicationsFromAnamnesis("", "adult")).keys, []);
});

test("v9.9: penilaian TTV", () => {
  const a = (v, age = 30) => plain(api.assessVitals(v, age));
  // Contoh pasien di screenshot: 20 th, suhu 36,8, TD 155/75, nadi 83.
  const r = a({ temp: 36.8, sys: 155, dia: 75, pulse: 83, rr: 20 }, 20);
  assert.equal(r.fever, false);
  assert.equal(r.hypertension, true);
  assert.equal(r.bp, "155/75");
  assert.equal(a({ temp: 37.5 }).fever, true);
  assert.equal(a({ temp: 39.2 }).highFever, true);
  assert.equal(a({ sys: 185, dia: 100 }).crisis, true);
  assert.equal(a({ sys: 130, dia: 85 }).hypertension, false);
  assert.equal(a({ sys: 120, dia: 92 }).hypertension, true);
  assert.ok(a({ spo2: 88 }).flags.some((f) => f.level === "danger"));
  assert.ok(a({ pulse: 120 }).flags.some((f) => /takikardia/.test(f.text)));
  // Anak: TD/nadi tidak dinilai dengan ambang dewasa, demam tetap dinilai.
  const child = a({ temp: 38, sys: 150, dia: 95, pulse: 130 }, 5);
  assert.equal(child.hypertension, false);
  assert.equal(child.fever, true);
  assert.equal(child.flags.length, 1);
  assert.equal(api.formatVitalsSummary({ temp: 36.8, sys: 155, dia: 75, pulse: 83, rr: 20, spo2: 98 }), "Suhu 36,8 · TD 155/75 · Nadi 83 · RR 20 · SpO2 98%");
});

test("v9.9: TTV ikut menentukan diagnosis", () => {
  const vit = (v, age = 30) => api.assessVitals(v, age);
  const k = (t, v) => plain(api.detectDiagnosisFromComplaint(t, { vitals: v }));
  // Keluhan akut tetap utama; TD tinggi jadi pertimbangan.
  const r1 = k("tenggorokan nyeri", vit({ temp: 36.8, sys: 155, dia: 75 }, 20));
  assert.equal(r1.key, "ISPA");
  assert.deepEqual(r1.others, ["HT"]);
  // Pusing + TD tinggi = hipertensi.
  assert.equal(k("pusing", vit({ sys: 165, dia: 100 })).key, "HT");
  // Keluhan tidak dikenali + suhu tinggi = Fever.
  assert.equal(k("lemas", vit({ temp: 38.4 })).key, "FEVER");
  assert.equal(k("", vit({ temp: 38.4 })).keyword, "suhu 38,4 °C");
  // TD normal, keluhan tidak dikenali: tidak ada diagnosis.
  assert.equal(k("kontrol rutin", vit({ sys: 120, dia: 80, temp: 36.5 })), null);
});

test("v9.9: TTV ikut menentukan terapi", () => {
  const vit = (v, age = 30) => api.assessVitals(v, age);
  const s = (t, g, v) => plain(api.suggestMedicationsFromAnamnesis(t, g, { vitals: v }));
  // Suhu tinggi -> paracetamol walau keluhan tidak menyebut demam.
  assert.deepEqual(s("lemas", "adult", vit({ temp: 38 })).keys, ["PARACETAMOL_DEWASA"]);
  assert.deepEqual(s("", "child", vit({ temp: 38.5 }, 4)).keys, ["PARACETAMOL_ANAK"]);
  // Batuk + demam (suhu): Paracetamol sekali saja (v10.0.9: batuk dewasa memakai Paracetamol).
  assert.equal(s("batuk pilek", "adult", vit({ temp: 38 })).keys.filter((k) => k === "PARACETAMOL_DEWASA").length, 1);
  // TD tinggi: tidak mencentang amlodipine, tetapi memberi catatan; NSAID diperingatkan.
  const ht = s("pegal-pegal", "adult", vit({ sys: 160, dia: 95 }));
  assert.ok(!ht.keys.includes("AMLODIPINE_5"));
  assert.ok(ht.notes.some((n) => /pertimbangkan hipertensi/.test(n)));
  assert.ok(ht.notes.some((n) => /NSAID/.test(n)));
});

test("v9.9: stok dari tulisan 'Sisa'", () => {
  assert.equal(api.parseStockText("Sisa : 6595"), 6595);
  assert.equal(api.parseStockText("Sisa : 1"), 1);
  assert.equal(api.parseStockText("Sisa: 7.121"), 7121);
  assert.equal(api.parseStockText("Sisa : 0"), 0);
  assert.equal(api.parseStockText("Harga Rp 2.996"), null);
});

test("v9.9: demam + imunisasi diberi catatan tunda", () => {
  const r = plain(api.suggestMedicationsFromAnamnesis("imunisasi DPT", "child", { vitals: api.assessVitals({ temp: 38.2 }, 5) }));
  assert.deepEqual(r.actionKeys, ["IMUNISASI"]);
  assert.ok(r.notes.some((n) => /menunda imunisasi/.test(n)));
});

test("v10: diagnosis & obat baru dari Keluhan Utama", () => {
  const k = (t) => plain(api.detectDiagnosisFromComplaint(t))?.key ?? null;
  const cases = {
    "pusing berputar": "VERTIGO", "sesak napas, mengi": "ASMA", "mata merah belekan": "KONJUNGTIVITIS",
    "telinga kanan sakit": "OMA", "anyang-anyangan": "ISK", "nyeri haid": "DISMENORE", "sakit gigi berlubang": "PULPITIS",
    "bisul di ketiak": "ABSES", "gatal kurap di paha": "TINEA", "panu di punggung": "PANU", "cacar air": "VARICELLA",
    "cacar ular di pinggang": "ZOSTER", "cacingan": "HELMINTHIASIS", "susah BAB 4 hari": "KONSTIPASI",
    "sakit perut melilit": "NYERI_PERUT", "sakit perut, diare 5x": "GEA", "sariawan": "STOMATITIS",
    "nyeri lutut": "OA_GENU", "kontrol asam urat": "HIPERURISEMIA", "kolesterol tinggi": "DISLIPIDEMIA",
    "gastritis": "GASTRITIS", "sinusitis": "SINUSITIS", "bersin-bersin tiap pagi": "RINITIS_ALERGI",
    "batuk pilek": "ISPA", "nyeri ulu hati": "DISPEPSIA",
  };
  for (const [text, key] of Object.entries(cases)) assert.equal(k(text), key, text);
  const s = (t) => plain(api.suggestMedicationsFromAnamnesis(t, "adult")).keys;
  assert.ok(s("pusing berputar").includes("BETAHISTIN_6_DEWASA"));
  assert.ok(!s("panu").includes("SALEP_RACIKAN_BARU"));
  const vert = api.DIAGNOSIS_TEMPLATES.find((d) => d.key === "VERTIGO");
  assert.deepEqual(plain(vert.adult), ["BETAHISTIN_6_DEWASA"]);
  const beta = api.MEDICATION_ITEMS_FLAT.find((x) => x.key === "BETAHISTIN_6_DEWASA").medicine;
  assert.deepEqual([beta.freq, beta.dose, beta.total], ["3", "1", "10"]);
  // Nama Klinik Pintar: tanpa kekuatan.
  assert.equal(api.ITEMS.BETAHISTIN_6.target, "BPJS -- BETAHISTINE MESILATE");
  assert.equal(api.ITEMS.ALPARA.target, "BPJS -- ALPARA");
});

// Gerbang rilis: semua obat baru harus sudah dicocokkan namanya di Klinik Pintar.
test("rilis: tidak ada obat yang namanya belum dicocokkan (verify)", () => {
  const pending = Object.entries(api.ITEMS).filter(([, v]) => v.verify).map(([k]) => k);
  assert.deepEqual(pending, []);
});

test("v10: mual/muntah hanya keluhan penyerta, vertigo khas jadi keluhan utama", () => {
  const vit = (v, age = 30) => api.assessVitals(v, age);
  const k = (t, v) => plain(api.detectDiagnosisFromComplaint(t, v ? { vitals: v } : {}))?.key;
  assert.equal(k("pusing berputar sejak kemarin, mual"), "VERTIGO");
  assert.equal(k("pusing berputar, mual", vit({ sys: 150, dia: 95 })), "VERTIGO");
  assert.equal(k("pusing, mual"), "CEPHALGIA");
  assert.equal(k("mual muntah sejak pagi"), "DISPEPSIA");
  assert.equal(k("mual, diare 4x"), "GEA");
  assert.equal(k("nyeri ulu hati, mual"), "DISPEPSIA");
  assert.equal(k("pusing, mual", vit({ sys: 165, dia: 100 })), "HT");
  const r = plain(api.detectDiagnosisFromComplaint("mual, maag kambuh"));
  assert.deepEqual([r.key, r.others], ["DISPEPSIA", []]);
});

test("v10.0.4: Vitamin B Complex tidak pernah dicentang otomatis", () => {
  const s = (txt, dx) => plain(api.suggestMedicationsFromAnamnesis(txt, "adult", dx ? { diagnosis: api.DIAGNOSIS_TEMPLATES.find((d) => d.key === dx) } : {})).keys;
  for (const txt of ["batuk pilek", "tenggorokan nyeri", "sariawan", "lemas, kesemutan", "pegal linu"]) assert.ok(!s(txt).includes("VITAMIN_B_COMPLEX"), txt);
  for (const d of api.DIAGNOSIS_TEMPLATES) assert.ok(!(d.adult || []).includes("VITAMIN_B_COMPLEX"), d.key);
  // Masih bisa dipilih manual di Paket Resep.
  assert.ok(api.MEDICATION_ITEMS_FLAT.some((x) => x.key === "VITAMIN_B_COMPLEX"));
});

test("v10.0.7: 'bapil' dibaca sebagai batuk pilek", () => {
  const k = (t) => plain(api.detectDiagnosisFromComplaint(t))?.key;
  const s = (t, g = "adult") => plain(api.suggestMedicationsFromAnamnesis(t, g)).keys;
  for (const t of ["bapil 3 hari", "Bapil, demam", "batpil sejak kemarin"]) assert.equal(k(t), "ISPA", t);
  assert.deepEqual(s("bapil 3 hari"), s("batuk pilek 3 hari"));
  assert.deepEqual(s("bapil", "child"), s("batuk pilek", "child"));
  assert.notEqual(k("kapil"), "ISPA");
});

test("v10.0.9: obat batuk & puyer Ibuprofen anak (permintaan dokter)", () => {
  const s = (txt, g) => plain(api.suggestMedicationsFromAnamnesis(txt, g)).keys;
  assert.deepEqual(s("batuk", "adult"), ["PARACETAMOL_DEWASA", "AMBROXOL_30_DEWASA", "CETIRIZINE_10_DEWASA"]);
  assert.deepEqual(s("bapil 2 hari", "adult"), ["PARACETAMOL_DEWASA", "AMBROXOL_30_DEWASA", "CETIRIZINE_10_DEWASA"]);
  assert.deepEqual(s("batuk", "child"), ["ISPA_ANAK"]);
  const ispaAnak = api.CHILD_PUYER_SERIES.find((x) => x.prefix === "ISPA_ANAK_");
  assert.deepEqual(plain(ispaAnak.items), ["GUAIFENESIN_100", "CTM_4", "DEXAMETHASONE_05"]);
  // v0.8.0: Ibuprofen anak 5-10 mg/kg/dosis, buat 10 puyer, 3x sehari.
  const ibu = (kg) => api.getWeightTemplate("IBUPROFEN_ANAK_", kg).tpl;
  const t = ibu(10);
  assert.deepEqual([t.ingredients[0].item, t.doseFreq, t.doseAmount, t.duration, t.unit, t.compoundInstruction],
    ["IBUPROFEN_400", "3", "1", "3", "Pulvis", "buat 10"]);
  const item = api.MEDICATION_ITEMS_FLAT.find((x) => x.key === "IBUPROFEN_ANAK");
  assert.equal(item.population, "child");
  const r = plain(api.resolveMedicationItem(item, 12, 4));
  assert.equal(r.racikans.length, 1);
  assert.match(r.racikans[0].tpl.ingredients[0].quantity, /^\d+$/);
});

// v0.8.0 (permintaan dokter 2026-11-18): dosis anak per mg/kg & batas umur.
test("v0.8.0: dosis anak per mg/kg, tablet BULAT, jumlah bungkus menyesuaikan", () => {
  const S = { PARACETAMOL_500: 500, IBUPROFEN_400: 400, DOMPERIDONE_10: 10, CTM_4: 4, DEXAMETHASONE_05: 0.5, GUAIFENESIN_100: 100, AMBROXOL_30: 30, CETIRIZINE_10: 10, RANITIDINE_HCL: 150, ANTASIDA_TABLET: 1 };
  const check = (t, kg, label) => {
    const n = api.racikanQtyFor(t);
    assert.ok(n >= 10 && n <= 30, `${label}: ${n} bungkus`);
    assert.equal(t.duration, String(Math.max(1, Math.round(n / Number(t.doseFreq)))));
    for (const ing of t.ingredients) {
      assert.match(ing.quantity, /^[1-9]\d*$/, `${label} ${ing.item}: ${ing.quantity} bukan bulat`);
      const r = api.PEDIATRIC_DOSE_RULES[ing.item];
      const mg = (S[ing.item] * Number(ing.quantity)) / n;
      assert.ok(mg / kg <= r.hi + 1e-9, `${label} ${kg} kg ${ing.item}: ${mg / kg} > ${r.hi}`);
      assert.ok(mg <= r.maxDose + 1e-9, `${label} ${kg} kg ${ing.item}: ${mg} mg > maks`);
      if (mg < r.maxDose - 1e-9 && kg >= 4) assert.ok(mg / kg >= r.lo * 0.75, `${label} ${kg} kg ${ing.item}: ${mg / kg} terlalu rendah`);
    }
  };
  for (const s of api.CHILD_PUYER_SERIES.filter((x) => x.dosed)) {
    for (let kg = s.minKg || 2; kg <= s.maxKg; kg += 0.5) {
      const t = api.getWeightTemplate(s.prefix, kg).tpl;
      check(t, kg, s.prefix);
      // tanpa CTM (bayi) juga bulat & dihitung ulang
      const st = api.stripIngredientsForAge(t, 0.3).tpl;
      if (st.ingredients.length) check(st, kg, s.prefix + " bayi");
    }
  }
  const q = (p, kg) => { const t = api.getWeightTemplate(p, kg).tpl; return [api.racikanQtyFor(t), ...t.ingredients.map((i) => Number(i.quantity))]; };
  assert.deepEqual(plain(q("DEMAM_ANAK_", 10)), [12, 3]); // 125 mg = 12,5-13,9 mg/kg
  // Sirup domperidon 1 mg/mL: maks 0,25 mg/kg/dosis.
  for (let kg = 2; kg <= 50; kg += 0.5) {
    const ml = Number(api.getWeightRecipeTemplate("MUAL_MUNTAH_SYRUP_ANAK_", kg).tpl.medicines[0].dose);
    assert.ok(ml / kg <= 0.25 + 1e-9 && ml <= 10, `${kg} kg: ${ml} mL`);
  }
});

test("v0.8.0: ibuprofen/CTM/domperidon <6 bln, ranitidin <2 th, antasida <4 th tidak dipilih", () => {
  const it = (k) => api.MEDICATION_ITEMS_FLAT.find((x) => x.key === k);
  const res = (k, kg, age) => plain(api.resolveMedicationItem(it(k), kg, age));
  for (const k of ["IBUPROFEN_ANAK", "DOMPERIDONE_SYRUP", "MUAL_MUNTAH_RACIKAN_BARU"]) {
    assert.match(res(k, 5, 0.4).note, /hanya untuk umur ≥6 bulan/, k);
    assert.equal(res(k, 7, 0.5).note, undefined, k + " 6 bulan boleh");
    assert.match(res(k, 7, null).note, /umur belum terbaca/, k);
  }
  assert.match(res("ANTASIDA_ANAK", 14, 3.9).note, /≥4 tahun/);
  assert.match(res("ANTASIDA_PUYER_ANAK", 14, 3.9).note, /≥4 tahun/);
  assert.equal(res("ANTASIDA_PUYER_ANAK", 16, 4).racikans[0].tpl.ingredients[0].item, "ANTASIDA_TABLET");
  const sy = (age) => res("ANTASIDA_SYRUP_ANAK", 20, age);
  assert.match(sy(3.5).note, /≥4 tahun/);
  assert.deepEqual([sy(4.5).medicines[0].item, sy(4.5).medicines[0].dose, sy(8).medicines[0].dose, sy(13).medicines[0].dose], ["ANTASIDA_SYRUP", "2.5", "5", "10"]);
  assert.equal(api.ITEMS.ANTASIDA_SYRUP.target, "BPJS -- ANTASIDA DOEN SYRUP");
  assert.match(res("LAMBUNG_MUAL_RACIKAN_BARU", 10, 1.9).note, /≥2 tahun/);
  // 2-4 th: ranitidin saja (antasida dibuang); >=4 th: keduanya.
  const lm3 = res("LAMBUNG_MUAL_RACIKAN_BARU", 13, 3);
  assert.deepEqual(lm3.racikans[0].tpl.ingredients.map((i) => i.item), ["RANITIDINE_HCL"]);
  assert.match(lm3.info, /ANTASIDA .*umur <4 tahun/);
  assert.equal(res("LAMBUNG_MUAL_RACIKAN_BARU", 17, 5).racikans[0].tpl.ingredients.length, 2);
  // Bayi <6 bulan: ISPA & Bapil 2 tetap, tanpa CTM; guaifenesin/dexa/ambroxol/cetirizine tetap.
  const ispa = res("ISPA_ANAK", 5, 0.3).racikans[0].tpl;
  assert.deepEqual(ispa.ingredients.map((i) => i.item), ["GUAIFENESIN_100", "DEXAMETHASONE_05"]);
  const bapil = res("BAPIL_2_ANAK", 5, 0.3).racikans[0].tpl;
  assert.deepEqual(bapil.ingredients.map((i) => i.item), ["DEXAMETHASONE_05", "AMBROXOL_30"]);
  assert.equal(res("CETIRIZINE_RACIKAN_BARU", 5, 0.3).racikans.length, 1);
  assert.equal(res("ISPA_ANAK", 8, 1).racikans[0].tpl.ingredients.length, 3);
  // Saran: bayi 4 bulan demam -> paracetamol, bukan ibuprofen; muntah -> tanpa domperidon.
  const sg = plain(api.suggestMedicationsFromAnamnesis("demam muntah", "child", { ageYears: 0.33 }));
  assert.ok(sg.keys.includes("PARACETAMOL_ANAK"));
  assert.ok(!sg.keys.some((k) => /IBUPROFEN|DOMPERIDONE|MUAL_MUNTAH/.test(k)), sg.keys.join());
  assert.ok(sg.notes.some((n) => /Tidak disarankan untuk umur ini/.test(n)));
});

test("v10.1.0: tindakan diinput sebagai BHP (jumlah dijumlahkan antar-tindakan)", () => {
  const r = plain(api.collectBhpForActions(["CEK_GULA", "IMUNISASI", "CEK_GULA"]));
  assert.deepEqual(r.labels, ["Cek Gula Darah", "Imunisasi"]);
  const m = Object.fromEntries(r.items.map((x) => [x.item, x.total]));
  assert.deepEqual(m, { STRIP_GULA: "1", ALKOHOL_SWAB: "2", BLOOD_LANCET_26G: "1", SPUIT_1CC: "1", HANDSCOON_S: "2" });
  const k = plain(api.collectBhpForActions(["CEK_KOLESTEROL", "CEK_ASAM_URAT"]));
  assert.deepEqual(k.items.map((x) => x.item).sort(), ["ALKOHOL_SWAB", "BLOOD_LANCET_26G", "STRIP_ASAM_URAT", "STRIP_KOLESTEROL"]);
  assert.equal(k.items.find((x) => x.item === "ALKOHOL_SWAB").total, "2");
  assert.deepEqual(plain(api.collectBhpForActions([])).items, []);
  // Nama template lama (Klinik Pintar); di Medisin dipetakan lewat dialog pilih obat.
  for (const key of ["STRIP_GULA", "ALKOHOL_SWAB", "BLOOD_LANCET_26G", "SPUIT_1CC", "HANDSCOON_S"])
    assert.match(api.ITEMS[key].target, /^BPJS -- /);
  assert.equal(api.ITEMS.STRIP_ASAM_URAT.target, "STRIP ASAM URAT");
  assert.equal(api.ITEMS.STRIP_KOLESTEROL.target, "STRIP KOLESTEROL");
});

test("v0.3.0 Medisin: tetes mata/telinga pilihan dokter", () => {
  const s = (t, g = "adult") => plain(api.suggestMedicationsFromAnamnesis(t, g)).keys;
  assert.deepEqual(s("mata kanan merah dan belekan"), ["CENDO_XITROL_TETES"]);
  assert.deepEqual(s("belekan 2 hari", "child"), ["CENDO_XITROL_TETES"]);
  assert.deepEqual(s("mata kering dan perih"), ["CENDO_LYTEERS_TETES"]);
  assert.deepEqual(s("kelilipan debu"), ["CENDO_LYTEERS_TETES"]);
  assert.ok(s("congek", "child").includes("RECO_TETES_TELINGA"));
});

test("v0.3.0 Medisin: 'sakit mata ... gatal' = konjungtivitis, bukan dermatitis", () => {
  const d = (t) => api.detectDiagnosisFromComplaint(t)?.key || null;
  assert.equal(d("sakit mata 4 hari, gatal dan nyeri"), "KONJUNGTIVITIS");
  assert.equal(d("mata kanan merah"), "KONJUNGTIVITIS");
  assert.equal(d("gatal di tangan"), "DERMATITIS");
  assert.equal(d("mata kering"), "MATA_KERING"); // v0.5.0
});

test("v0.3.1 Medisin: keluhan baru -> diagnosis & obat", () => {
  const d = (t) => api.detectDiagnosisFromComplaint(t)?.key || null;
  const s = (t, g = "adult") => plain(api.suggestMedicationsFromAnamnesis(t, g)).keys;
  assert.equal(d("bintitan mata kiri 3 hari"), "HORDEOLUM");
  assert.equal(d("kelopak mata bengkak dan merah"), "HORDEOLUM");
  assert.equal(d("wasir keluar saat bab"), "HEMOROID");
  assert.equal(d("diare berlendir dan berdarah"), "DISENTRI");
  assert.equal(d("diare 3x cair"), "GEA");
  assert.equal(d("demam 7 hari, curiga tipes"), "TIFOID");
  assert.equal(d("jempol kaki bengkak merah, asam urat kambuh"), "GOUT");
  assert.equal(d("lepuh di bibir"), "HERPES_LABIALIS");
  assert.equal(d("biang keringat di leher, gatal"), "MILIARIA");
  assert.equal(d("lemas, kurang darah"), "ANEMIA");
  assert.equal(d("kesemutan di kaki"), "PARESTESIA");
  assert.deepEqual(s("bintitan"), ["RECO_SALEP_MATA"]);
  assert.deepEqual(s("ambeien"), ["SUPERHOID_SUPP"]);
  assert.ok(s("cacar api di pinggang").includes("ACYCLOVIR_400_DEWASA"));
  assert.ok(s("panu di punggung").includes("MICONAZOLE_SALEP"));
  // 1 minidose saja (permintaan dokter).
  const x = api.MEDICATION_ITEMS_FLAT.find((i) => i.key === "CENDO_XITROL_TETES");
  assert.equal(x.medicine.total, "1");
});

test("v0.3.2 Medisin: salbutamol (tablet/puyer) tidak pernah disarankan", () => {
  // Permintaan dokter 2026-11-17: hapus salbutamol tab/puyer, jangan pernah disarankan.
  const all = JSON.stringify({
    items: api.ITEMS, picker: api.MEDICATION_ITEMS_FLAT, rules: api.ANAMNESIS_SUGGESTION_RULES.map((r) => [r.adult, r.child]),
    dx: api.DIAGNOSIS_TEMPLATES, racikan: api.RACIKAN_TEMPLATES, recipes: api.RECIPE_TEMPLATES,
  });
  assert.doesNotMatch(all, /salbutamol/i);
  for (const t of ["sesak napas, mengi", "asma kambuh"]) {
    for (const g of ["adult", "child"]) assert.deepEqual(plain(api.suggestMedicationsFromAnamnesis(t, g)).keys.filter((k) => /SALBU/.test(k)), []);
  }
});

test("v0.3.2 Medisin: jumlah obat sesuai permintaan dokter", () => {
  const tot = (k) => api.MEDICATION_ITEMS_FLAT.find((i) => i.key === k).medicine;
  assert.equal(tot("SUPERHOID_SUPP").total, "1");
  assert.equal(tot("SUPERHOID_SUPP").freq, "1");
  assert.equal(tot("METRONIDAZOLE_500_DEWASA").total, "9");
  assert.equal(tot("CIPROFLOXACIN_500_DEWASA").total, "6");
  assert.equal(tot("TABLET_TAMBAH_DARAH").total, "5");
  assert.equal(tot("MECOBALAMIN_500_DEWASA").total, "6");
  assert.equal(tot("ACYCLOVIR_400_DEWASA").days, "3");
  assert.equal(tot("ACYCLOVIR_400_DEWASA").total, "30");
});
