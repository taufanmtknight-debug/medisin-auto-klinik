// v0.7.0: keluhan kulit (bintik, bintik berair, bercak), keluhan umum tambahan,
// banyak diagnosis dan diagnosis banding.
const test = require("node:test");
const assert = require("node:assert/strict");
const { loadScript } = require("./load-script.cjs");

const { api } = loadScript();
const plain = (x) => JSON.parse(JSON.stringify(x));
const dd = (t) => plain(api.detectDiagnoses(t));
const keys = (t) => dd(t).list.map((f) => f.key);

const SINGLE = {
  "bintik": "RUAM_KULIT",
  "bintik merah": "RUAM_KULIT",
  "bintik merah gatal": "DERMATITIS",
  "bercak": "RUAM_KULIT",
  "bintik berair": "VARICELLA",
  "bintil berisi air": "VARICELLA",
  "lenting di badan": "VARICELLA",
  "bintik berair sebelah pinggang terasa panas": "ZOSTER",
  "bintik berair di bibir": "HERPES_LABIALIS",
  "bintik merah di telapak tangan dan mulut": "HFMD",
  "kena tomcat melepuh": "DERMATITIS_VENENATA",
  "koreng kuning madu di hidung anak": "IMPETIGO",
  "bintik nanah di punggung": "FOLIKULITIS",
  "jerawat bernanah": "AKNE",
  "bintik seperti mutiara berlubang tengah": "MOLUSKUM",
  "bercak putih": "PANU",
  "bercak putih di wajah anak": "PITIRIASIS_ALBA",
  "bercak putih seperti susu makin lebar": "VITILIGO",
  "bercak putih mati rasa": "KUSTA",
  "bercak keputihan di lidah": "KANDIDIASIS_ORAL",
  "lidah putih": "KANDIDIASIS_ORAL",
  "bercak merah bersisik": "TINEA",
  "bercak merah melingkar gatal": "TINEA",
  "bercak hitam di pipi": "MELASMA",
  "lecet di lipatan paha": "INTERTRIGO",
  "bintik gatal malam hari di sela jari": "SKABIES",
  "bintik merah di kaki demam": "DENGUE",
  "kaki pecah pecah": "XEROSIS",
  "kapalan": "KALUS",
  "tahi lalat membesar": "NEVUS",
  "keloid di dada": "KELOID",
  "keringat berlebih": "HIPERHIDROSIS",
  "ketiak bau": "BAU_BADAN",
  "bayi gumoh": "GUMOH",
  "anak ngompol": "ENURESIS",
  "tali pusat basah bau": "TALI_PUSAT",
  "asi sedikit": "MENYUSUI",
  "nyeri saat berhubungan": "DISPAREUNIA",
  "susah menelan": "DISFAGIA",
  "kencing darah": "HEMATURIA",
  "sering lupa": "PELUPA",
  "anak belum bisa jalan": "TUMBUH_KEMBANG",
  "mata juling": "STRABISMUS",
  "mata bengkak": "BLEFARITIS",
  "bibir pecah pecah": "KEILITIS",
  "kelenjar bengkak di leher": "LIMFADENOPATI",
  "telat haid": "AMENORE",
  "berhenti merokok": "ROKOK",
  "tangan gemetar": "TREMOR",
  "kuping kemasukan air habis berenang": "OTITIS_EKSTERNA",
  "kena pecahan kaca": "VULNUS",
  "jari terjepit pintu": "KONTUSIO",
  "sering haus": "DM",
  "mata kena sabun": "KELILIPAN",
};

test("v0.7.0: keluhan kulit & keluhan umum baru dikenali", () => {
  const wrong = [];
  for (const [t, want] of Object.entries(SINGLE)) {
    const got = keys(t)[0] ?? null;
    if (got !== want) wrong.push(`${t} => ${got} (harus ${want})`);
  }
  assert.deepEqual(wrong, []);
});

const MULTI = {
  "batuk pilek dan gatal di selangkangan": ["ISPA", "TINEA"],
  "demam batuk, diare 3x": ["ISPA", "GEA"],
  "pusing, nyeri ulu hati": ["DISPEPSIA", "CEPHALGIA"],
  "kontrol hipertensi, gula darah tinggi, kolesterol": ["HT", "DM", "DISLIPIDEMIA"],
  "batuk pilek, mata merah belekan": ["ISPA", "KONJUNGTIVITIS"],
  "sakit gigi dan pusing": ["PULPITIS", "CEPHALGIA"],
  "jerawat dan panu di punggung": ["AKNE", "PANU"],
  // satu penyakit = satu diagnosis (gejala umum / keluarga sama tidak ditambah)
  "batuk pilek demam": ["ISPA"],
  "diare mual muntah": ["GEA"],
  "nyeri ulu hati, mual, kembung": ["DISPEPSIA"],
  "keputihan gatal": ["FLUOR_ALBUS"],
  "demam 3 hari, bintik merah, mimisan": ["DENGUE"],
  "bintik berair sebelah pinggang terasa panas": ["ZOSTER"],
  "gatal-gatal setelah makan udang, bentol": ["URTIKARIA"],
};

test("v0.7.0: keluhan berbeda -> 2-3 diagnosis, satu penyakit -> satu diagnosis", () => {
  const wrong = [];
  for (const [t, want] of Object.entries(MULTI)) {
    const got = keys(t);
    if (JSON.stringify(got) !== JSON.stringify(want)) wrong.push(`${t} => ${got.join("+")} (harus ${want.join("+")})`);
  }
  assert.deepEqual(wrong, []);
  assert.ok(keys("batuk pilek, diare, gatal selangkangan, sakit gigi, pusing").length <= 3);
});

test("v0.7.0: diagnosis banding ada, sah, dan bukan diagnosis terpilih", () => {
  const all = new Set(api.DIAGNOSIS_TEMPLATES.map((d) => d.key));
  for (const [k, list] of Object.entries(api.DX_BANDING)) {
    assert.ok(all.has(k), "kunci banding " + k);
    for (const b of list) assert.ok(all.has(b), `${k} -> ${b}`);
  }
  for (const k of Object.keys(api.DX_FAMILY)) assert.ok(all.has(k), "keluarga " + k);
  for (const t of [...Object.keys(SINGLE), ...Object.keys(MULTI)]) {
    const r = dd(t);
    assert.ok(r.banding.length <= 6);
    for (const b of r.banding) assert.ok(!r.list.some((f) => f.key === b), `${t}: ${b}`);
  }
  assert.deepEqual(dd("bintik berair").banding.slice(0, 2), ["ZOSTER", "HFMD"]);
  assert.ok(dd("bercak putih").banding.includes("VITILIGO"));
  assert.ok(dd("demam 3 hari, bintik merah, mimisan").banding.includes("EPISTAKSIS"));
  // TTV tinggi saja tidak menambah diagnosis HT, hanya banding.
  const v = api.assessVitals({ sys: 170, dia: 100, temp: 38.5 }, 40);
  assert.equal(v.hypertension, true);
  const withV = plain(api.detectDiagnoses("batuk pilek", v));
  assert.deepEqual(withV.list.map((f) => f.key), ["ISPA"]);
});

test("v0.7.0: diagnosis baru tanpa obat otomatis, ICD sudah dicek di Medisin", () => {
  const NEW = {
    RUAM_KULIT: "R21", DERMATITIS_VENENATA: "L24.8", FOLIKULITIS: "L73.9", PITIRIASIS_ROSEA: "L42", PITIRIASIS_ALBA: "L30.5",
    VITILIGO: "L80", MELASMA: "L81.1", MOLUSKUM: "B08.1", KANDIDIASIS_KULIT: "B37.2", INTERTRIGO: "L30.4", BLEFARITIS: "H01.0",
    KEILITIS: "K13.0", LIMFADENOPATI: "R59.0", TREMOR: "R25.1", AMENORE: "N91.2", ROKOK: "Z71.6", XEROSIS: "L85.3", KALUS: "L84",
    KELOID: "L91.0", NEVUS: "D22.9", HIPERHIDROSIS: "R61.9", BAU_BADAN: "L75.0", GUMOH: "P92.1", ENURESIS: "F98.0", TALI_PUSAT: "P38",
    MENYUSUI: "O92.7", DISPAREUNIA: "N94.1", DISFAGIA: "R13", HEMATURIA: "R31", PELUPA: "R41.3", TUMBUH_KEMBANG: "R62.0", STRABISMUS: "H50.9",
  };
  for (const [k, icd] of Object.entries(NEW)) {
    const d = api.DIAGNOSIS_TEMPLATES.find((x) => x.key === k);
    assert.ok(d, k);
    assert.equal(d.icd[0], icd, k);
    assert.deepEqual([...d.adult, ...d.child], [], k + " tanpa obat otomatis");
    assert.ok(api.EDUKASI[k], "edukasi " + k);
  }
  const keysAll = api.DIAGNOSIS_TEMPLATES.map((d) => d.key);
  assert.equal(new Set(keysAll).size, keysAll.length, "kunci unik");
});
