// v0.5.0: pengetahuan keluhan → diagnosis dan tanda bahaya.
const test = require("node:test");
const assert = require("node:assert/strict");
const { loadScript } = require("./load-script.cjs");

const { api } = loadScript();
const plain = (x) => JSON.parse(JSON.stringify(x));
const k = (t, vitals) => api.detectDiagnosisFromComplaint(t, { vitals })?.key ?? null;
const flags = (t, vitals) => plain(api.detectRedFlags(t, vitals)).map((f) => f.key);

const CASES = {
  "nyeri dada": "NYERI_DADA",
  "nyeri dada kiri menjalar ke lengan, keringat dingin": "NYERI_DADA",
  "dada terasa berat seperti ditindih": "NYERI_DADA",
  "dada panas setelah makan, mulut asam": "GERD",
  "sesak napas berat sejak tadi malam": "SESAK_BERAT",
  "sesak kalau kena debu, napas bunyi ngik": "ASMA",
  "batuk berdahak kuning 5 hari": "BRONKITIS",
  "batuk sudah 3 minggu, keringat malam": "TB_SUSPEK",
  "batuk berdarah": "HEMOPTISIS",
  "pilek ingusan bersin-bersin": "ISPA",
  "watuk pilek anak": "ISPA",
  "suara serak 4 hari": "LARINGITIS",
  "mimisan sejak pagi": "EPISTAKSIS",
  "kuping sakit, keluar cairan": "OMA",
  "telinga gatal habis dikorek": "OTITIS_EKSTERNA",
  "telinga berdenging": "TINITUS",
  "kemasukan semut di telinga": "BENDA_ASING",
  "kelilipan debu": "KELILIPAN",
  "mata merah berair lengket": "KONJUNGTIVITIS",
  "mata kabur kalau melihat jauh": "REFRAKSI",
  "bercak darah di mata": "PERDARAHAN_SUBKONJ",
  "mencret 5x, mules": "GEA",
  "muntah mencret setelah makan di kondangan": "KERACUNAN_MAKANAN",
  "mual muntah hamil 8 minggu": "MUAL_HAMIL",
  "perut kembung begah sering sendawa": "DISPEPSIA",
  "susah bab 4 hari": "KONSTIPASI",
  "bab hitam seperti aspal": "PERDARAHAN_GI",
  "nyeri perut kanan bawah": "AKUT_ABDOMEN",
  "benjolan di selangkangan hilang timbul": "HERNIA",
  "anus perih saat bab": "FISURA_ANI",
  "gusi berdarah": "GINGIVITIS",
  "gigi berlubang cenat-cenut": "PULPITIS",
  "lidah putih-putih anak": "KANDIDIASIS_ORAL",
  "pipi bengkak bawah telinga demam": "PAROTITIS",
  "anyang-anyangan, kencing perih": "ISK",
  "kencing berpasir, nyeri pinggang menjalar ke perut": "UROLITIASIS",
  "kencing tidak lampias, sering kencing malam": "BPH",
  "tidak bisa kencing sejak pagi": "RETENSI_URIN",
  "sering haus dan sering kencing": "DM",
  "keputihan berbau gatal": "FLUOR_ALBUS",
  "telat haid 2 bulan": "GANGGUAN_HAID",
  "haid banyak sekali 10 hari": "MENORAGIA",
  "payudara bengkak merah saat menyusui": "MASTITIS",
  "mau suntik kb": "KB",
  "periksa hamil 20 minggu": "ANC",
  "hamil 7 bulan keluar flek": "KEHAMILAN_BAHAYA",
  "nyeri pinggang menjalar ke kaki kesemutan": "HNP",
  "leher kaku salah bantal": "NYERI_LEHER",
  "bahu sakit tidak bisa diangkat": "NYERI_BAHU",
  "nyeri sendi jari tangan kaku pagi": "ARTRALGIA",
  "demam disertai nyeri sendi": "CHIKUNGUNYA",
  "kaki keseleo saat main bola": "SPRAIN",
  "kepala terbentur, muntah 2x": "CEDERA_KEPALA",
  "luka robek di jari kena pisau": "VULNUS",
  "tersiram air panas": "COMBUSTIO",
  "digigit anjing": "GIGITAN_HEWAN",
  "digigit tawon bengkak": "GIGITAN_SERANGGA",
  "gatal malam hari, adik juga gatal": "SKABIES",
  "koreng bernanah di kaki anak": "IMPETIGO",
  "kaki merah bengkak panas meluas": "SELULITIS",
  "cantengan jempol kaki": "PARONIKIA",
  "jerawat bernanah": "AKNE",
  "kutu rambut": "PEDIKULOSIS",
  "ketombe kulit kepala gatal": "SEBOROIK",
  "gatal bentol setelah minum obat": "ALERGI_OBAT",
  "bibir bengkak dan sesak setelah makan udang": "ANAFILAKSIS",
  "demam 4 hari, bintik merah": "DENGUE",
  "demam menggigil berkala habis dari papua": "MALARIA",
  "campak": "CAMPAK",
  "imunisasi campak": "IMUNISASI",
  "flu singapura": "HFMD",
  "lemas sekali tidak mau minum": "DEHIDRASI",
  "susah tidur": "INSOMNIA",
  "ingin bunuh diri": "IDE_BUNUH_DIRI",
  "mulut mencong tiba-tiba, tangan kiri lemah": "STROKE",
  "kejang demam anak": "KEJANG",
  "pingsan di kamar mandi": "SINKOP",
  "kaki bengkak kedua": "EDEMA",
  "gula drop, keringat dingin, pasien DM": "HIPOGLIKEMIA",
  "kram betis malam": "KRAM",
  "sakit kepala sebelah berdenyut mual": "MIGREN",
  "kepala berat seperti diikat": "TTH",
  "sakit kepala hebat dan kaku kuduk": "SAKIT_KEPALA_HEBAT",
  "berat badan susah naik": "GIZI_KURANG",
  "mau surat sehat": "CHECKUP",
  "kesemutan di jari tangan": "CTS",
  "bayi kuning": "IKTERUS_BAYI",
  "bayi rewel menangis terus": "KOLIK_BAYI",
  "dengkul sakit kalau jongkok": "OA_GENU",
  "asam urat kumat jempol kaki bengkak": "GOUT",
  "tidak nyeri dada, batuk pilek": "ISPA",
  "nyeri dada (-), batuk": "ISPA",
};

test("v0.5.0: ratusan keluhan awam dikenali", () => {
  const wrong = [];
  for (const [t, want] of Object.entries(CASES)) if (k(t) !== want) wrong.push(`${t} => ${k(t)} (harus ${want})`);
  assert.deepEqual(wrong, []);
});

test("v0.5.0: setiap diagnosis baru punya ICD sah, edukasi, dan obat dari daftar", () => {
  const items = new Set(api.MEDICATION_ITEMS_FLAT.map((x) => x.key));
  for (const d of api.DIAGNOSIS_TEMPLATES) {
    for (const g of ["adult", "child"]) for (const x of d[g] || []) assert.ok(items.has(x), `${d.key}: ${x}`);
    assert.ok(api.EDUKASI[d.key], "edukasi " + d.key);
  }
  for (const f of api.RED_FLAGS) {
    if (!f.dx) continue;
    const d = api.DIAGNOSIS_TEMPLATES.find((x) => x.key === f.dx);
    assert.ok(d, f.dx);
    assert.deepEqual(plain([d.adult, d.child]), [[], []], "tanda bahaya tanpa obat: " + f.dx);
  }
  // Salbutamol tetap tidak pernah ada.
  assert.ok(!JSON.stringify(plain(api.DIAGNOSIS_TEMPLATES)).match(/SALBUTAMOL/i));
});

test("v0.5.0: nyeri dada mengalahkan TD tinggi dari TTV", () => {
  const v = api.assessVitals({ sys: 141, dia: 80 }, 50);
  const r = plain(api.detectDiagnosisFromComplaint("nyeri dada", { vitals: v }));
  assert.equal(r.key, "NYERI_DADA");
  assert.ok(r.others.includes("HT"));
  assert.equal(plain(api.diagnosisCandidates("nyeri dada", v))[0].key, "NYERI_DADA");
});

test("v0.5.0: tanda bahaya menahan centang otomatis", () => {
  const f = plain(api.detectRedFlags("nyeri dada sejak pagi"));
  assert.equal(f[0].level, "bahaya");
  assert.equal(f[0].noAuto, true);
  assert.deepEqual(flags("batuk pilek 3 hari"), []);
  assert.deepEqual(flags("tidak ada nyeri dada, tidak sesak"), []);
  assert.deepEqual(flags("hamil 12 minggu, batuk"), ["HAMIL"]);
  assert.equal(plain(api.detectRedFlags("hamil 12 minggu, batuk"))[0].noAuto, true);
  assert.deepEqual(flags("alergi amoxicillin, batuk"), ["ALERGI_OBAT"]);
  assert.deepEqual(flags("sesak"), ["SESAK"]);
  assert.deepEqual(flags("sesak berat"), ["SESAK_BERAT"]); // tidak dobel dengan "Sesak"
  assert.deepEqual(flags("batuk 3 minggu"), ["BATUK_LAMA"]);
  assert.deepEqual(flags("kejang otot betis"), []);
  // TTV berbahaya ikut, demam tinggi tidak menahan obat.
  assert.deepEqual(flags("pusing", api.assessVitals({ sys: 190, dia: 115 }, 50)), ["TTV"]);
  assert.deepEqual(flags("demam", api.assessVitals({ temp: 39.5 }, 30)), []);
  const html = api.redFlagHtml(api.detectRedFlags("nyeri dada"), true);
  assert.match(html, /TANDA BAHAYA/);
  assert.match(html, /TIDAK dicentang/);
  assert.equal(api.redFlagHtml([], false), "");
});

test("v0.5.0: daftar kata keluhan besar dan tiap pola valid", () => {
  let words = 0;
  for (const d of api.DIAGNOSIS_FROM_COMPLAINT) words += d.pattern.source.split("|").length;
  assert.ok(words >= 900, "kata/pola keluhan: " + words);
  const keys = new Set(api.DIAGNOSIS_TEMPLATES.map((x) => x.key));
  for (const d of api.DIAGNOSIS_FROM_COMPLAINT) assert.ok(keys.has(d.key), d.key);
});
