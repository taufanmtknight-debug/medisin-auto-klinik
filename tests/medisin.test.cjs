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
  // Master klinik asli: awalan per penjamin, stok terpisah.
  { produk_id: 11, produk_nm: "BPJS -- PARACETAMOL 500 MG", stok: 900 },
  { produk_id: 12, produk_nm: "IMR -- PARACETAMOL 500 MG", stok: 13 },
  { produk_id: 21, produk_nm: "BPJS -- ALKOHOL SWAB", stok: 600, bhp: true },
  { produk_id: 22, produk_nm: "ALKOHOL SWAB", stok: 23, bhp: true },
  { produk_id: 23, produk_nm: "BPJS -- STRIP GULA DARAH", stok: 42, bhp: true },
  { produk_id: 24, produk_nm: "BPJS -- BLOOD LANCET 26G", stok: 0, bhp: true },
];
const TARIFS = [
  { tarif_id: "TRF1", tarif_nm: "Dokter Umum Jasa Konsultasi", tarif_harga: "45000.00" },
  { tarif_id: "TRF2", tarif_nm: "BPJS - Dokter Umum Jasa Konsultasi", tarif_harga: "30000.00" },
  { tarif_id: "TRF3", tarif_nm: "BPJS TK - Dokter Umum Jasa Konsultasi", tarif_harga: "30000.00" },
];
const ICDS = [
  { icd_kode: "J06.0", en: "Acute laryngopharyngitis", value: "J06.0", label: "J06.0 - Acute laryngopharyngitis" },
  { icd_kode: "J06.9", en: "Acute upper respiratory infection, unspecified", value: "J06.9", label: "J06.9 - Acute upper respiratory infection, unspecified" },
  { icd_kode: "I10", en: "Essential (primary) hypertension", value: "I10", label: "I10 - Essential (primary) hypertension" },
];

function makeApp({ pasien = {}, path = PATH, extra = {} } = {}) {
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
    tindakan: [],
    tarif_bhp: [],
    poli_nm: "POLI UMUM 1",
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
      async loadObat(text, update, abort, kategori) {
        if (text.length < 2) return abort();
        vm.searches.push(text);
        const found = PRODUCTS.filter(
          (a) => a.produk_nm.toLowerCase().includes(text.toLowerCase()) && (kategori !== "BHP" || a.bhp),
        ).map(opt);
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
    input_bhp: [{ produk_id: "", qty: 0, batches: [], produk_detail_id: "" }],
    tab_resep: "resep",
    batchDetailTarif(row) {
      const o = Resep.obat_opt.find((x) => x.produk_id === row.produk_id.produk_id);
      const b = o.produk_detail.filter((d) => d.stock_system > 0);
      row.batches = b;
      row.produk_detail_id = b[0].produk_detail_id; // melempar bila stok kosong (sama seperti Medisin)
    },
    onSaveBhp: forbidden("Resep.onSaveBhp"),
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
  const Tindakan = {
    $options: { _componentTag: "Tindakan" },
    $children: [],
    tarif_opt: [],
    input_tindakan: [{ no: 1, val: "", diskon_tindakan: 0, jumlah_tindakan: 1, asisten_tindakan: null, keterangan_tindakan: "" }],
    loadTarif(text, update) {
      const found = TARIFS.filter((t) => t.tarif_nm.toLowerCase().includes(text.toLowerCase()));
      Promise.resolve().then(() =>
        update(() => {
          Tindakan.tarif_opt = found;
        }),
      );
    },
    onUpdateInput(o, row) {
      row.harga_tindakan = "Rp " + o.tarif_harga;
    },
    addColom() {
      Tindakan.input_tindakan.push({ no: Tindakan.input_tindakan.length + 1, val: "" });
    },
    onSaveTindakan: forbidden("Tindakan.onSaveTindakan"),
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
    $children: [Resep, Racikan, Diagnosa, Tindakan, prognosaSelect],
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
    ...extra,
  };
  const { api } = loadScript(globals);
  return { api, p, Resep, Racikan, Diagnosa, Tindakan, saveCalls, storage };
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
  assert.equal(api.drugSearchWord("CETIRIZINE HCL 10 MG"), "CETIRI");
});

test("awalan penjamin: nama obat & tarif mengikuti penjamin pasien", () => {
  const { api } = makeApp();
  assert.deepEqual({ ...api.splitProductPrefix("BPJS -- ZINC 20 MG") }, { prefix: "BPJS", base: "ZINC 20 MG" });
  assert.deepEqual({ ...api.splitProductPrefix("BPJS TK -- ZINC 20 MG") }, { prefix: "BPJS TK", base: "ZINC 20 MG" });
  assert.deepEqual({ ...api.splitProductPrefix("ZINC 20 MG") }, { prefix: "", base: "ZINC 20 MG" });
  assert.equal(api.penjaminPrefix("BPJS"), "BPJS");
  assert.equal(api.penjaminPrefix("BPJS Kesehatan"), "BPJS");
  assert.equal(api.penjaminPrefix("BPJS KET"), "BPJS TK");
  assert.equal(api.penjaminPrefix("BPJS TK"), "BPJS TK");
  assert.equal(api.penjaminPrefix("UMUM"), "");
  assert.equal(api.penjaminPrefix("IMR"), "IMR");
  const opts = PRODUCTS.map((a) => ({ value: a }));
  assert.equal(api.pickProductForPenjamin(opts, "PARACETAMOL 500 MG", "BPJS").value.produk_id, 11);
  assert.equal(api.pickProductForPenjamin(opts, "PARACETAMOL 500 MG", "UMUM").value.produk_id, 1);
  assert.equal(api.pickProductForPenjamin(opts, "PARACETAMOL 500 MG", "IMR").value.produk_id, 12);
  assert.equal(api.pickProductForPenjamin(opts, "PARACETAMOL 500 MG", "BPJS TK"), null); // tidak ada -> dokter memilih
  assert.equal(api.pickProductForPenjamin(opts, "AMBROXOL 30 MG", "BPJS"), null); // tidak jatuh ke stok UMUM
  assert.equal(api.serviceNameFor("BPJS"), "BPJS - Dokter Umum Jasa Konsultasi");
  assert.equal(api.serviceNameFor("UMUM"), "Dokter Umum Jasa Konsultasi");
  assert.equal(api.serviceNameFor("BPJS KET"), "BPJS TK - Dokter Umum Jasa Konsultasi");
});

test("pasien BPJS: resep memakai obat 'BPJS -- …', bukan stok UMUM", async () => {
  const { api, Resep, saveCalls } = makeApp({ pasien: { penjamin_nm: "BPJS" } });
  const item = Object.keys(api.ITEMS).find((k) => api.itemBaseName(k) === "PARACETAMOL 500 MG");
  await api.addRecipeItems([{ item, freq: "3", dose: "1", days: "3", total: "10", instruction: "SETELAH MAKAN" }]);
  assert.equal(Resep.input_resep[0].val.produk_nm, "BPJS -- PARACETAMOL 500 MG");
  assert.deepEqual(saveCalls, []);
});

test("BHP: diisi di baris BHP sesuai penjamin, stok kosong dicatat, tanpa simpan", async () => {
  const { api, Resep, saveCalls } = makeApp({ pasien: { penjamin_nm: "BPJS" } });
  const notes = await api.addBhpItems([
    { item: "STRIP_GULA", total: "1" },
    { item: "ALKOHOL_SWAB", total: "2" },
    { item: "BLOOD_LANCET_26G", total: "1" },
  ]);
  assert.deepEqual(
    Resep.input_bhp.map((r) => [r.produk_id.value.produk_nm, r.qty]),
    [["BPJS -- STRIP GULA DARAH", 1], ["BPJS -- ALKOHOL SWAB", 2], ["BPJS -- BLOOD LANCET 26G", 1]],
  );
  assert.equal(Resep.input_bhp[0].produk_detail_id, 230);
  assert.deepEqual([...notes], ["BPJS -- BLOOD LANCET 26G: stok kosong, batch belum terpilih"]);
  const again = await api.addBhpItems([{ item: "ALKOHOL_SWAB", total: "2" }]);
  assert.deepEqual([...again], ["BPJS -- ALKOHOL SWAB sudah ada"]);
  assert.equal(Resep.input_bhp.length, 3);
  assert.deepEqual(saveCalls, []);
});

test("tindakan: jasa konsultasi sesuai penjamin, tidak dobel, hanya poli umum, tanpa simpan", async () => {
  const a = makeApp({ pasien: { penjamin_nm: "BPJS" } });
  assert.equal(await a.api.addService(), true);
  // nilai kolom = tarif_id (emit-value Medisin), bukan objek
  assert.equal(a.Tindakan.input_tindakan[0].val, "TRF2");
  assert.equal(a.Tindakan.input_tindakan[0].harga_tindakan, "Rp 30000.00");
  assert.equal(await a.api.addService(), false);
  assert.equal(a.Tindakan.input_tindakan.length, 1);
  assert.deepEqual(a.saveCalls, []);
  const u = makeApp();
  await u.api.addService();
  assert.equal(u.Tindakan.input_tindakan[0].val, "TRF1");
  const saved = makeApp({ pasien: { tindakan: [{ tarif_nm: "Dokter Umum Jasa Konsultasi" }] } });
  assert.equal(await saved.api.addService(), false);
  assert.equal(saved.Tindakan.input_tindakan[0].val, "");
  const gigi = makeApp({ pasien: { poli_nm: "POLI GIGI" } });
  assert.equal(await gigi.api.addService(), false);
  const inh = makeApp({ pasien: { penjamin_nm: "ASURANSI X" } });
  await assert.rejects(inh.api.addService(), /tidak ada di daftar tarif/);
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

test("sumber script: simpan HANYA di blok SIMPAN SEMUA/riwayat, SUBMIT & PCare tidak pernah", () => {
  const { source } = loadScript();
  const code = source.replace(/\/\/[^\n]*/g, "");
  const START = "AK-WRITE-BLOCK START";
  const END = "AK-WRITE-BLOCK END";
  assert.equal(source.split(START).length, 2, "tepat satu blok tulis");
  assert.equal(source.split(END).length, 2);
  const a = source.indexOf(START);
  const b = source.indexOf(END);
  assert.ok(a < b);
  const block = source.slice(a, b).replace(/\/\/[^\n]*/g, "");
  const outside = (source.slice(0, a) + source.slice(b)).replace(/\/\/[^\n]*/g, "");
  // Di luar blok: tidak ada pemanggilan simpan/submit/API tulis sama sekali.
  for (const re of [
    /\.onSave\w*\s*\(/,
    /\.onSubmit\w*\s*\(/,
    /\.saveData\s*\(/,
    /\.doPelayanan\s*\(/,
    /\.\$klinik\b/,
    /\.\$rest2\b/,
    /\.\$axios\b/,
    /\.(?:post|put|patch)\s*\(/,
    /\bfetch\s*\(/,
    /XMLHttpRequest/,
  ])
    assert.doesNotMatch(outside, re);
  // Di seluruh script: SUBMIT, SUBMIT BPJS/SATUSEHAT, PCare, racikan simpan TIDAK PERNAH.
  for (const re of [
    /\.onSubmit\w*\s*\(/,
    /\.saveData\s*\(/,
    /submitBpjs|submitSatuSehat|onSaveTindakanBpjs|onSaveResepBpjs|onSubmitRujukan\w*/,
    /\.onSaveRacikan\s*\(|\.onSubmitAdd\s*\(/,
    /\.\$rest2\b/,
    /\bfetch\s*\(/,
    /XMLHttpRequest/,
    /\.(?:put|patch)\s*\(/,
  ])
    assert.doesNotMatch(code, re);
  // Di dalam blok: hanya 4 simpan milik Medisin + baca riwayat + permintaan lewat penjaga.
  const saves = [...block.matchAll(/\.(onSave\w+)\s*\(/g)].map((m) => m[1]).sort();
  assert.deepEqual(saves, ["onSaveBhp", "onSaveDiagnosa", "onSaveResep", "onSaveTindakan"]);
  const posts = [...block.matchAll(/(\w+)\.post\s*\(\s*([^,)]*)/g)].map((m) => m[1] + ":" + m[2].trim());
  assert.deepEqual(posts.sort(), ['ax:"admin/pelayanan/pasien/riwayat"', "klinik:url"]);
  assert.equal([...block.matchAll(/\.doPelayanan\s*\(/g)].length, 1);
});

// ---------------- v0.4.0 alur cepat ----------------
const plain = (x) => JSON.parse(JSON.stringify(x));
function fillForSave(a) {
  a.Diagnosa.input_icdx[0].val = { icd_kode: "J06.9", value: "J06.9", en: "Acute upper respiratory infection" };
  a.Resep.input_resep[0].val = { produk_id: 1, produk_nm: "PARACETAMOL 500 MG" };
  a.Resep.input_bhp[0].produk_id = { produk_id: 21, produk_nm: "BPJS -- ALKOHOL SWAB" };
  a.Tindakan.input_tindakan[0].val = { tarif_nm: "BPJS - Dokter Umum Jasa Konsultasi" };
}
function fakeSavers(a, sent) {
  const base = {
    get: async () => ({ data: [] }),
    post: async (url) => {
      sent.push(url);
      return { data: { message: "ok" } };
    },
    put: async (url) => sent.push("PUT " + url),
  };
  for (const vm of [a.Diagnosa, a.Resep, a.Tindakan]) {
    vm.$klinik = base;
    vm.$rest2 = { post: async (url) => sent.push("REST2 " + url) };
  }
  a.Diagnosa.onSaveDiagnosa = function () {
    return this.$klinik.post("master/kunjungan/diagnosa", {});
  };
  a.Resep.onSaveResep = function () {
    assert.equal(this.limit, 0, "limit direset sebelum simpan resep");
    return this.$klinik.post("master/kunjungan/resep", {});
  };
  a.Resep.onSaveBhp = async function () {
    await this.$klinik.post("master/kunjungan/tarif-bhp/" + ID, {});
  };
  a.Tindakan.onSaveTindakan = function () {
    // validasi asinkron seperti QForm: permintaan dikirim setelah fungsi kembali
    setTimeout(() => this.$klinik.post("master/kunjungan/tindakan", {}), 150);
  };
  return base;
}

test("SIMPAN SEMUA: urutan Diagnosa → Resep → BHP → Tindakan, penjaga dilepas setelahnya", async () => {
  const a = makeApp({ pasien: { penjamin_nm: "BPJS" } });
  fillForSave(a);
  const sent = [];
  const base = fakeSavers(a, sent);
  const list = a.api.pendingSections();
  assert.deepEqual(plain(list.map((x) => x.key)), ["dx", "resep", "bhp", "tind"]);
  const r = await a.api.saveSections(list);
  assert.deepEqual(plain(r.failed), []);
  assert.deepEqual(plain(r.done), ["Diagnosa", "Resep", "BHP", "Tindakan"]);
  assert.deepEqual(sent, ["master/kunjungan/diagnosa", "master/kunjungan/resep", "master/kunjungan/tarif-bhp/" + ID, "master/kunjungan/tindakan"]);
  for (const vm of [a.Diagnosa, a.Resep, a.Tindakan]) assert.equal(vm.$klinik, base);
});

test("SIMPAN SEMUA: PCare, PUT, dan alamat lain diblokir; mode uji tidak mengirim", async () => {
  const a = makeApp({ pasien: { penjamin_nm: "BPJS" } });
  fillForSave(a);
  const sent = [];
  fakeSavers(a, sent);
  a.Diagnosa.onSaveDiagnosa = function () {
    this.$rest2.post("bpjs/pcare/kunjungan", {}).catch(() => {});
    return this.$klinik.put("master/kunjungan/" + ID, {}).catch(() => {});
  };
  a.Resep.onSaveResep = function () {
    return this.$klinik.post("master/kunjungan/" + ID + "/submit", {}).catch(() => {});
  };
  const r = await a.api.saveSections(a.api.pendingSections().slice(0, 2));
  assert.deepEqual(sent, []);
  assert.equal(r.done.length, 0);
  assert.match(r.failed.join(" "), /diblokir AUTO KLINIK: bpjs\/pcare\/kunjungan/);
  assert.match(r.failed.join(" "), /diblokir AUTO KLINIK: master\/kunjungan\/K\w+\/submit/);

  const d = makeApp({ extra: { __AK_DRY_RUN__: true } });
  fillForSave(d);
  const sent2 = [];
  fakeSavers(d, sent2);
  const r2 = await d.api.saveSections(d.api.pendingSections());
  assert.deepEqual(sent2, []);
  assert.equal(r2.done.length, 4);
});

test("SIMPAN SEMUA: baris kosong tidak dihitung, gagal simpan dilaporkan", async () => {
  const a = makeApp();
  assert.deepEqual(plain(a.api.pendingSections()), []);
  a.Diagnosa.input_icdx[0].val = { icd_kode: "I10", value: "I10", en: "Hypertension" };
  const sent = [];
  fakeSavers(a, sent);
  a.Diagnosa.onSaveDiagnosa = function () {
    return this.$klinik.post("master/kunjungan/diagnosa", {}).then(() => Promise.reject(new Error("x")), () => {}).catch((e) => this.$parseError(e));
  };
  a.Diagnosa.$parseError = () => {};
  const r = await a.api.saveSections(a.api.pendingSections());
  assert.equal(r.done.length, 0);
  assert.match(r.failed[0], /^Diagnosa: x/);
});

test("edukasi per diagnosis: hanya bila kosong, teks sesuai ICD", async () => {
  const a = makeApp();
  a.Diagnosa.input_icdx[0].val = { icd_kode: "J06.9", value: "J06.9", en: "URTI" };
  assert.equal(await a.api.fillEducation(), true);
  assert.equal(a.p.rl_edukasi, a.api.EDUKASI.ISPA);
  const b = makeApp({ pasien: { rl_edukasi: "isian dokter" } });
  b.Diagnosa.input_icdx[0].val = { icd_kode: "J06.9", value: "J06.9", en: "URTI" };
  assert.deepEqual(plain(await b.api.fillEducation()), { kept: "isian dokter" });
  assert.equal(b.p.rl_edukasi, "isian dokter");
  const c = makeApp();
  assert.equal(await c.api.fillEducation(), false);
  // semua diagnosis bawaan punya edukasi
  for (const dx of a.api.DIAGNOSIS_TEMPLATES) assert.ok(a.api.EDUKASI[dx.key], "edukasi " + dx.key);
  assert.equal(a.api.educationForCodes(["Z99.9"]), a.api.educationForCodes([]));
  assert.match(a.api.educationForCodes(["I10", "E11.9"]), /garam.*gula/);
});

test("resep ulang: kunjungan lalu terakhir, obat satuan saja, racikan dihitung", () => {
  const { api } = loadScript();
  const list = [
    { id_kunjungan: "K1", tgl_kunjungan: "2026-10-01 08:00", resep: [{ produk_nm: "A" }], icdx: [] },
    { id_kunjungan: "K3", tgl_kunjungan: "2026-11-17 08:00", resep: [{ produk_nm: "SEKARANG" }], icdx: [] },
    { id_kunjungan: "K2", tgl_kunjungan: "2026-11-02 09:00", icdx: [{ icd_kode: "i10", en: "Hypertension" }, { icd_kode: "I10" }],
      resep: [
        { produk_nm: "BPJS -- AMLODIPINE 10 MG", resep_qty: "10", resep_signa: "1 X 1", is_racikan: "0" },
        { produk_nm: "BPJS -- CTM 4 MG", resep_qty: "3", is_racikan: "1" },
      ] },
    { id_kunjungan: "K4", tgl_kunjungan: "2026-11-10 09:00", resep: [], icdx: [] },
  ];
  const last = api.pickLastVisit(list, "K3");
  assert.equal(last.id_kunjungan, "K2");
  const v = api.summarizeVisit(last);
  assert.equal(v.date, "2026-11-02");
  assert.deepEqual(plain(v.icdx), [{ code: "I10", en: "Hypertension" }]);
  assert.deepEqual(plain(v.drugs), [{ name: "BPJS -- AMLODIPINE 10 MG", base: "AMLODIPINE 10 MG", qty: 10, signa: "1 X 1" }]);
  assert.equal(v.racikan, 1);
  assert.equal(api.pickLastVisit([{ id_kunjungan: "K3", resep: [{}] }], "K3"), null);
});

test("surat sakit & pasien berikutnya: tanggal dan baris antrean", () => {
  const { api } = loadScript();
  assert.equal(api.addDaysIso("2026-11-17", 0), "2026-11-17");
  assert.equal(api.addDaysIso("2026-11-30", 1), "2026-12-01");
  assert.equal(api.addDaysIso("2026-12-31", 2), "2027-01-02");
  const rows = [
    { kunjungan: { id_kunjungan: "A" }, status: { status_id: 203 } },
    { kunjungan: { id_kunjungan: "B" }, status: { status_id: 202 } },
    { kunjungan: { id_kunjungan: "C" }, status: { status_id: 201 } },
  ];
  assert.equal(api.nextWaitingRow(rows, "X").kunjungan.id_kunjungan, "B");
  assert.equal(api.nextWaitingRow(rows, "B").kunjungan.id_kunjungan, "C");
  assert.equal(api.nextWaitingRow([rows[0]], "X"), null);
});

test("jalan otomatis: bisa dimatikan & dinyalakan (disimpan di localStorage)", () => {
  const a = makeApp();
  a.api.toggleAutoRun();
  assert.equal(a.storage.get("auto-klinik-medisin:otomatis"), "0");
  a.api.toggleAutoRun();
  assert.equal(a.storage.get("auto-klinik-medisin:otomatis"), "1");
});


// ---------------- v0.4.2 ----------------
test("jasa konsultasi: diisi lalu LANGSUNG disimpan (hanya bila tidak ada tindakan lain)", async () => {
  const a = makeApp({ pasien: { penjamin_nm: "BPJS" } });
  const sent = [];
  fakeSavers(a, sent);
  assert.equal(await a.api.addServiceAndSave(), true);
  assert.equal(await a.api.serviceAutoSave.last, true);
  assert.deepEqual(sent, ["master/kunjungan/tindakan"]);
  // ada tindakan lain yang belum disimpan -> tidak disimpan otomatis
  const b = makeApp({ pasien: { penjamin_nm: "BPJS" } });
  const sent2 = [];
  fakeSavers(b, sent2);
  b.Tindakan.input_tindakan[0].val = { tarif_nm: "Nebulizer" };
  assert.equal(await b.api.addServiceAndSave(), true);
  await new Promise((r) => setTimeout(r, 50));
  assert.deepEqual(sent2, []);
});

test("keluhan: Anamnesa dibaca dulu, Keluhan Utama cadangan", () => {
  const a = makeApp({ pasien: { keluhan: "migrain", keluhan_lainya: "sakit kepala sebagian 2 hari" } });
  assert.deepEqual(plain(a.api.readChiefComplaintFromPage()), { text: "sakit kepala sebagian 2 hari", source: "Anamnesa" });
  const b = makeApp({ pasien: { keluhan: "batuk pilek" } });
  assert.equal(b.api.readChiefComplaintFromPage().text, "batuk pilek");
});

test("pilihan & pencarian diagnosis", async () => {
  const { api } = loadScript();
  const c = api.diagnosisCandidates("demam batuk pilek sakit kepala").map((d) => d.key);
  assert.ok(c.length >= 2 && c.length <= 5);
  assert.equal(c[0], "ISPA");
  assert.ok(c.includes("CEPHALGIA") || c.includes("FEVER"));
  assert.deepEqual(plain(api.diagnosisCandidates("kaki kena paku")), []);
  assert.ok(api.searchDiagnosisTemplates("gastritis").some((d) => d.key === "GASTRITIS"));
  assert.ok(api.searchDiagnosisTemplates("I10").some((d) => d.key === "HT"));
  assert.ok(api.searchDiagnosisTemplates("pusing berputar").some((d) => d.key === "VERTIGO"));
  // pilih diagnosis: baris isian script diganti, pilihan dokter tidak
  const a = makeApp();
  await a.api.fillDiagnosis(a.api.DIAGNOSIS_TEMPLATES.find((d) => d.key === "ISPA"));
  assert.equal(a.Diagnosa.input_icdx[0].val.icd_kode, "J06.9");
  const r = await a.api.applyDiagnosisChoice(a.api.DIAGNOSIS_TEMPLATES.find((d) => d.key === "HT"));
  assert.match(r.note, /I10/);
  assert.deepEqual(plain(a.api.selectedIcdEntries().map((e) => e.code)), ["I10"]);
  assert.deepEqual(a.saveCalls, []);
});

test("Paket Resep: 9 golongan ringkas, tiap obat tepat di satu golongan, tanpa 'Lain-lain'", () => {
  const { api } = loadScript();
  const g = api.MEDICATION_GROUP_PACKAGES;
  assert.equal(g.length, 9);
  assert.ok(!g.some((x) => x.key === "LAIN_LAIN"));
  const keys = g.flatMap((x) => x.items.map((i) => i.key));
  assert.equal(new Set(keys).size, keys.length);
  assert.ok(keys.includes("PARACETAMOL_DEWASA") && keys.includes("IBUPROFEN_400"));
  assert.equal(g[0].items.some((i) => i.key === "IBUPROFEN_400"), true);
});
