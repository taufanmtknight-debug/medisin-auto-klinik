// Tes pengisi form Medisin dengan TIRUAN state Vue (tanpa browser).
// Yang dijaga: hanya mengisi, tidak menimpa isian dokter, nama obat harus cocok
// persis, dan tidak pernah memanggil fungsi simpan/submit milik Medisin.
const test = require("node:test");
const assert = require("node:assert/strict");
const { loadScript } = require("./load-script.cjs");

const ID = "K2451611260002";
const PATH = "/admin/pelayanan/proses/dokter/" + Buffer.from(ID).toString("base64");

// Daftar obat tiruan (nama gaya Medisin).
const PRODUCTS = [
  { produk_id: 1, produk_nm: "PARACETAMOL 500 MG", stok: 100 },
  { produk_id: 2, produk_nm: "PARACETAMOL 500 MG MERSI", stok: 50 },
  { produk_id: 3, produk_nm: "CTM 4 MG", stok: 5 },
  { produk_id: 4, produk_nm: "AMBROXOL 30 MG", stok: 91 },
];
const ICDS = [
  { icd_kode: "J06.0", en: "Acute laryngopharyngitis", value: "J06.0", label: "J06.0 - Acute laryngopharyngitis" },
  { icd_kode: "J06.9", en: "Acute upper respiratory infection, unspecified", value: "J06.9", label: "J06.9 - Acute upper respiratory infection, unspecified" },
  { icd_kode: "I10", en: "Essential (primary) hypertension", value: "I10", label: "I10 - Essential (primary) hypertension" },
];

function makeApp({ pasien = {}, path = PATH } = {}) {
  const saveCalls = [];
  const forbidden = (name) => () => {
    saveCalls.push(name);
    throw new Error("script memanggil " + name);
  };
  const p = {
    id_kunjungan: ID,
    klinik_id: "245",
    penjamin_nm: "UMUM",
    umur: "36 tahun 10 bulan 15 hari",
    berat_badan: "0.00",
    keluhan: null,
    keluhan_lainya: null,
    kesadaran_id: "01",
    status_pulang: 4,
    jenis_prognosa: null,
    resep: [],
    ...pasien,
  };
  const opt = (a) => ({
    label: `${a.produk_nm} (${a.stok})`,
    value: a,
    produk_id: a.produk_id,
    produk_detail: [{ produk_detail_id: a.produk_id * 10, stock_system: a.stok, is_storage: 0 }],
    totalStockSystem: a.stok,
    hasValidDetails: true,
  });
  const obatVm = (name, listKey) => {
    const vm = {
      $options: { name },
      $children: [],
      obat_opt: [],
      signa_opt: [{ nama: "3 X 1 SETELAH MAKAN" }, { nama: "1 X 1" }],
      [listKey]: [{ no: 1, val: "", batch: "", batches: [], jumlah: 1, diskon_resep: 0, signa: "" }],
      searches: [],
      async loadObat(text, update, abort) {
        if (text.length < 2) return abort();
        vm.searches.push(text);
        const found = PRODUCTS.filter((a) => a.produk_nm.toLowerCase().includes(text.toLowerCase())).map(opt);
        update(() => {
          vm.obat_opt = found;
        });
      },
      loadBatchDetails(row) {
        const o = vm.obat_opt.find((x) => x.produk_id === row.val.produk_id);
        row.batches = o.produk_detail.map((d) => ({ value: d.produk_detail_id }));
        row.batch = row.batches[0].value;
      },
      addColom() {
        vm[listKey].push({ no: vm[listKey].length + 1, val: "", batch: "", batches: [], jumlah: 1, diskon_resep: 0, signa: "" });
      },
    };
    return vm;
  };
  const Resep = Object.assign(obatVm("Resep", "input_resep"), {
    resep: [],
    onSaveResep: forbidden("Resep.onSaveResep"),
    onSubmit: forbidden("Resep.onSubmit"),
  });
  const Racikan = Object.assign(obatVm("Racikan", "input_racikan"), {
    modal_add: false,
    modal_add_template: false,
    form: { id_kunjungan: ID, racikan_nama: null, racikan_jenis: null, racikan_qty: 0, racikan_signa: null, data: {} },
    onSubmitAdd: forbidden("Racikan.onSubmitAdd"),
    onSaveRacikan: forbidden("Racikan.onSaveRacikan"),
  });
  const Diagnosa = {
    $options: { _componentTag: "Diagnosa" },
    $children: [],
    data: [],
    icdx_opt: [],
    input_icdx: [{ no: 1, val: null, tacc: "-1", kasus: null, tacc_name: null, tacc_reason: null, klarifikasi: null }],
    async loadIcdx(text, update, abort) {
      if (text.length < 2) return abort();
      const found = ICDS.filter((x) => x.icd_kode.startsWith(text));
      update(() => {
        Diagnosa.icdx_opt = found;
      });
    },
    setIcdx(o, row) {
      if (row.tacc) {
        row.tacc = null;
        row.tacc_reason = null;
      }
      row.kasus = o.en;
    },
    addColom() {
      Diagnosa.input_icdx.push({ no: Diagnosa.input_icdx.length + 1, val: null, tacc: "-1", kasus: null });
    },
    onSaveDiagnosa: forbidden("Diagnosa.onSaveDiagnosa"),
    onSubmit: forbidden("Diagnosa.onSubmit"),
  };
  const prognosaSelect = {
    $options: { name: "QSelect" },
    $children: [],
    $vnode: { data: { model: { expression: "pasien.jenis_prognosa" } } },
    $props: {
      optionValue: "kdPrognosa",
      optionLabel: "nmPrognosa",
      emitValue: true,
      options: [
        { kdPrognosa: "01", nmPrognosa: "Sanam (Sembuh)" },
        { kdPrognosa: "02", nmPrognosa: "Bonam (Baik)" },
      ],
    },
  };
  const root = {
    $options: {},
    $children: [Resep, Racikan, Diagnosa, prognosaSelect],
    $store: { state: { pelayanan: { pasien: p } } },
    $set: (o, k, v) => {
      o[k] = v;
    },
  };
  root.$root = root;
  const storage = new Map();
  const globals = {
    document: { querySelector: (sel) => (sel === "#q-app" ? { __vue__: root } : null), getElementById: () => null, body: null },
    location: { hostname: "app.medisin.id", pathname: path, href: "https://app.medisin.id" + path },
    localStorage: { getItem: (k) => (storage.has(k) ? storage.get(k) : null), setItem: (k, v) => storage.set(k, String(v)) },
  };
  const { api } = loadScript(globals);
  return { api, p, Resep, Racikan, Diagnosa, saveCalls, storage };
}

test("fungsi murni Medisin: id kunjungan, umur, ICD, signa, racikan", () => {
  const { api } = makeApp();
  assert.equal(api.kunjunganIdFromPath(PATH), ID);
  assert.equal(api.kunjunganIdFromPath("/admin/klinik/antrean/poli"), null);
  const age = api.parseMedisinAge("4 tahun 6 bulan 0 hari");
  assert.equal(age.years, 4);
  assert.equal(age.months, 6);
  assert.ok(Math.abs(age.ageYears - 4.5) < 0.01);
  assert.equal(api.parseMedisinAge(""), null);
  assert.ok(api.icdCodeMatches("J06", "J06.9"));
  assert.ok(api.icdCodeMatches("J06", "J06"));
  assert.ok(!api.icdCodeMatches("J06.9", "J06.0"));
  assert.ok(!api.icdCodeMatches("J0", "J06"));
  assert.equal(api.pickIcdOption(ICDS, "J06").icd_kode, "J06.9"); // J06 tidak ada -> J06.9
  assert.equal(api.pickIcdOption(ICDS, "I10").icd_kode, "I10");
  assert.equal(api.pickIcdOption(ICDS, "J06.5"), null); // tidak pernah memilih kode lain
  assert.equal(api.signaText("3", "1", "", "SETELAH MAKAN"), "3 x 1 setelah makan");
  assert.equal(api.signaText("3", "5", "ML", ""), "3 x 5 ml");
  assert.equal(api.matchSignaMaster([{ nama: "3 X 1 SETELAH MAKAN" }], "3 x 1 setelah makan"), "3 X 1 SETELAH MAKAN");
  assert.equal(api.matchSignaMaster([{ nama: "1 X 1" }], "2 x 1 oles"), "2 x 1 oles");
  assert.equal(api.racikanJenisFor({ unit: "Pulvis" }), "kertas_puyer");
  assert.equal(api.racikanJenisFor({ unit: "Oles" }), "pot_salep");
  assert.equal(api.racikanQtyFor({ compoundInstruction: "buat 10" }), 10);
  assert.equal(api.racikanQtyFor({ compoundInstruction: "mf ungt" }), 1);
  assert.equal(api.racikanSignaFor(api.SALEP_RACIKAN), "2 x 1 oles di lesi");
  assert.equal(api.drugSearchWord("CTM 4 MG"), "CTM");
  assert.equal(api.drugSearchWord("ZINC 20 MG"), "ZINC");
});

test("urutan nama obat yang dicoba: pilihan dokter dulu, baru nama template", () => {
  const { api } = makeApp();
  const map = { UMUM: { X: "OBAT UMUM" }, "BPJS KESEHATAN": { X: "OBAT BPJS" } };
  assert.deepEqual([...api.drugNameCandidates(map, "UMUM", "X", "OBAT")], ["OBAT UMUM", "OBAT BPJS", "OBAT"]);
  assert.deepEqual([...api.drugNameCandidates({}, "UMUM", "X", "OBAT")], ["OBAT"]);
});

test("data pasien dibaca dari store, dan tidak dipakai bila store masih pasien lain", () => {
  const a = makeApp({ pasien: { berat_badan: "12.5", suhu: "38.2", sistole: "120", keluhan: "batuk pilek" } });
  assert.equal(a.api.getPatientAgeFromIdentity().years, 36);
  assert.equal(a.api.getPatientWeightFromLatestVitals().kg, 12.5);
  assert.equal(a.api.readVitalsFromPage().temp, 38.2);
  assert.equal(a.api.readChiefComplaintFromPage().text, "batuk pilek");
  const stale = makeApp({ pasien: { id_kunjungan: "K-PASIEN-LAIN", berat_badan: "70" } });
  assert.equal(stale.api.pasienAktif(), null);
  assert.equal(stale.api.getPatientAgeFromIdentity(), null);
  assert.equal(stale.api.getPatientWeightFromLatestVitals(), null);
});

test("resep: nama persis terisi (bukan nama mirip), signa & jumlah dari template, tanpa simpan", async () => {
  const { api, Resep, saveCalls } = makeApp();
  // PARACETAMOL_500 -> "PARACETAMOL 500 MG": harus memilih produk 1, BUKAN "… MERSI".
  const item = Object.keys(api.ITEMS).find((k) => api.itemBaseName(k) === "PARACETAMOL 500 MG");
  assert.ok(item, "ITEMS punya PARACETAMOL 500 MG");
  const r = await api.addRecipeItems([{ item, freq: "3", dose: "1", days: "3", total: "10", instruction: "SETELAH MAKAN" }]);
  assert.deepEqual([...r.alreadyInRecipe], []);
  assert.equal(Resep.input_resep.length, 1);
  assert.equal(Resep.input_resep[0].val.produk_id, 1);
  assert.equal(Resep.input_resep[0].jumlah, 10);
  assert.equal(Resep.input_resep[0].signa, "3 X 1 SETELAH MAKAN"); // tulisan master signa
  assert.equal(Resep.input_resep[0].batch, 10);
  // Diulang: tidak dobel.
  const again = await api.addRecipeItems([{ item, freq: "3", dose: "1", days: "3", total: "10", instruction: "SETELAH MAKAN" }]);
  assert.deepEqual([...again.alreadyInRecipe], ["PARACETAMOL 500 MG"]);
  assert.equal(Resep.input_resep.length, 1);
  assert.deepEqual(saveCalls, []);
});

test("resep: baris yang sudah diisi dokter tidak ditimpa", async () => {
  const { api, Resep } = makeApp();
  Resep.input_resep[0].val = { produk_id: 99, produk_nm: "OBAT DOKTER" };
  Resep.input_resep[0].signa = "1 x 1";
  const item = Object.keys(api.ITEMS).find((k) => api.itemBaseName(k) === "PARACETAMOL 500 MG");
  await api.addRecipeItems([{ item, freq: "3", dose: "1", days: "3", total: "10", instruction: "" }]);
  assert.equal(Resep.input_resep[0].val.produk_id, 99);
  assert.equal(Resep.input_resep[0].signa, "1 x 1");
  assert.equal(Resep.input_resep[1].val.produk_id, 1);
});

test("diagnosa: mengisi baris kosong, TACC -1, tidak menimpa & tidak dobel, tanpa simpan", async () => {
  const { api, Diagnosa, saveCalls } = makeApp();
  const ispa = api.DIAGNOSIS_TEMPLATES.find((d) => d.key === "ISPA");
  const r = await api.fillDiagnosis(ispa);
  assert.equal(r.icdCode, "J06.9");
  assert.equal(r.skipped, false);
  assert.equal(Diagnosa.input_icdx[0].val.icd_kode, "J06.9");
  assert.equal(Diagnosa.input_icdx[0].tacc, "-1");
  assert.match(Diagnosa.input_icdx[0].kasus, /upper respiratory/);
  const again = await api.fillDiagnosis(ispa);
  assert.equal(again.skipped, true);
  assert.equal(Diagnosa.input_icdx.length, 1);
  const ht = api.DIAGNOSIS_TEMPLATES.find((d) => d.icd.includes("I10"));
  await api.fillDiagnosis(ht);
  assert.equal(Diagnosa.input_icdx.length, 2);
  assert.equal(Diagnosa.input_icdx[0].val.icd_kode, "J06.9");
  assert.deepEqual(
    [...api.selectedIcdEntries()].map((e) => e.code),
    ["J06.9", "I10"],
  );
  assert.deepEqual(saveCalls, []);
});

test("resume: anamnesa & prognosa hanya diisi bila kosong", async () => {
  const a = makeApp({ pasien: { keluhan: "demam 2 hari" } });
  assert.equal(await a.api.copyChiefComplaintToAnamnesis(), true);
  assert.equal(a.p.keluhan_lainya, "demam 2 hari");
  assert.equal(await a.api.setPrognosis(), true);
  assert.equal(a.p.jenis_prognosa, "02");
  const b = makeApp({ pasien: { keluhan: "demam", keluhan_lainya: "anamnesa dokter", jenis_prognosa: "01" } });
  assert.deepEqual({ ...(await b.api.copyChiefComplaintToAnamnesis()) }, { kept: "anamnesa dokter" });
  assert.equal(b.p.keluhan_lainya, "anamnesa dokter");
  assert.deepEqual({ ...(await b.api.setPrognosis()) }, { kept: "Sanam (Sembuh)" });
  assert.equal(b.p.jenis_prognosa, "01");
});

test("racikan: dialog diisi lalu MENUNGGU dokter; script tidak menyimpan", async () => {
  const { api, Racikan, saveCalls } = makeApp();
  const pct = Object.keys(api.ITEMS).find((k) => api.itemBaseName(k) === "PARACETAMOL 500 MG");
  const tpl = {
    title: "DEMAM ANAK",
    name: "puyer demam",
    duration: "3",
    doseFreq: "3",
    doseAmount: "1",
    unit: "Pulvis",
    instruction: "setelah makan",
    compoundInstruction: "buat 10",
    ingredients: [{ item: pct, quantity: "5" }],
  };
  let done = false;
  const job = api.addRacikan(tpl).then(() => {
    done = true;
  });
  await new Promise((r) => setTimeout(r, 900));
  assert.equal(done, false, "masih menunggu dokter");
  assert.equal(Racikan.modal_add, true);
  assert.equal(Racikan.form.racikan_nama, "puyer demam");
  assert.equal(Racikan.form.racikan_jenis, "kertas_puyer");
  assert.equal(Racikan.form.racikan_qty, 10);
  assert.equal(Racikan.form.racikan_signa, "3 X 1 SETELAH MAKAN");
  assert.equal(Racikan.input_racikan[0].val.produk_id, 1);
  assert.equal(Racikan.input_racikan[0].jumlah, 5);
  Racikan.modal_add = false; // dokter menekan SIMPAN / menutup dialog
  await job;
  assert.equal(done, true);
  assert.deepEqual(saveCalls, []);
});

test("sumber script tidak memanggil fungsi simpan/submit atau API tulis Medisin", () => {
  const { source } = loadScript();
  const code = source.replace(/\/\/[^\n]*/g, "");
  for (const re of [
    /\.onSave\w*\s*\(/,
    /\.onSubmit\w*\s*\(/,
    /\.saveData\s*\(/,
    /\.\$klinik\b/,
    /\.\$rest2\b/,
    /\.\$axios\b/,
    /\.(?:post|put|patch)\s*\(/,
    /\bfetch\s*\(/,
    /XMLHttpRequest/,
  ])
    assert.doesNotMatch(code, re);
});
