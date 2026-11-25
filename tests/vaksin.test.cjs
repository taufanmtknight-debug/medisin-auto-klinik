// Tes CEK VAKSIN (v0.10.0): aturan di vaksin/vaksin-rules.js, mesin di vaksin/vaksin-engine.js.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const RULES = require("../vaksin/vaksin-rules.js");
const { createVaksinEngine } = require("../vaksin/vaksin-engine.js");

const E = createVaksinEngine(RULES);
const LAHIR = "2026-01-01";
const B = E.parseTgl(LAHIR);
const hari = (n, from = B) => E.iso(from + n * 86400000);
const bulan = (n, plusDays = 0) => E.iso(E.addMonths(B, n) + plusDays * 86400000);
const run = (tglKunjungan, extra = {}) => E.cekVaksin({ tglLahir: LAHIR, tglKunjungan, dosis: [], kondisi: {}, ...extra });
const row = (out, kode) => out.baris.find((r) => r.kode === kode);
const st = (out, kode) => row(out, kode).status;
const GIVE = ["BOLEH", "KEJAR"];
const clone = (o) => JSON.parse(JSON.stringify(o));

test("aturan: setiap aturan punya sumber, tanggal_verifikasi, status_verifikasi", () => {
  let n = 0;
  const walk = (o, p) => {
    if (!o || typeof o !== "object") return;
    if ("status_verifikasi" in o) {
      n++;
      assert.ok(o.sumber && String(o.sumber).length > 3, `sumber kosong: ${p}`);
      assert.match(o.tanggal_verifikasi, /^\d{4}-\d{2}-\d{2}$/, p);
      assert.ok(["terverifikasi", "perlu verifikasi"].includes(o.status_verifikasi), p);
      return;
    }
    for (const [k, v] of Object.entries(o)) walk(v, `${p}.${k}`);
  };
  walk(RULES.vaksin, "vaksin");
  walk(RULES.umum, "umum");
  walk(RULES.rute, "rute");
  assert.ok(n > 60, `aturan terhitung ${n}`);
});

test("usia dihitung dalam hari, minggu, bulan (tanpa pembulatan)", () => {
  const u = E.usia(B, E.parseTgl("2026-05-18"));
  assert.equal(u.hari, 137);
  assert.equal(u.minggu, 19);
  assert.equal(u.sisaHariMinggu, 4);
  assert.equal(u.bulan, 4);
  assert.equal(u.sisaHari, 17);
  // 31 Jan + 1 bulan = 28 Feb (kalender)
  assert.equal(E.iso(E.addMonths(E.parseTgl("2026-01-31"), 1)), "2026-02-28");
});

test("kasus 1: bayi 4,5 bulan hanya HB0, riwayat bronkopneumonia, tidak demam", () => {
  const out = run(hari(137), { dosis: [{ vaksin: "HB0", tanggal: LAHIR, sumber: "kia" }], kondisi: { penyakitKronis: true } });
  assert.equal(st(out, "HB0"), "SELESAI");
  for (const k of ["DTP", "OPV", "PCV"]) {
    assert.ok(GIVE.includes(st(out, k)), `${k} = ${st(out, k)}`);
    assert.equal(row(out, k).dosisKe, 1);
  }
  assert.equal(st(out, "BCG"), "CEK");
  assert.match(row(out, "BCG").alasan, /tuberkulin|Mantoux/);
  assert.equal(st(out, "ROTA"), "TIDAK");
  assert.equal(st(out, "INFLUENZA"), "BELUM");
  assert.equal(E.iso(row(out, "INFLUENZA").tanggal), bulan(6));
  assert.ok(out.catatan.some((c) => /paru/.test(c)));
  assert.ok(out.hariIni.some((h) => h.kode === "DTP"));
  assert.ok(out.jadwalKejar.length >= 3);
});

test("kasus 2: 14 minggu 6 hari tanpa rotavirus (batas ketat 12 minggu vs CDC 14w6d)", () => {
  const at = hari(104);
  assert.equal(st(run(at, { merek: { ROTA: "ROTARIX" } }), "ROTA"), "TIDAK", "Rotarix dengan batas IDAI 12 minggu");
  assert.equal(st(run(at, { merek: { ROTA: "ROTATEQ" } }), "ROTA"), "TIDAK", "RotaTeq");
  // Bila dokter memilih batas CDC (14 minggu 6 hari), Rotarix dosis 1 boleh.
  const cdc = clone(RULES);
  cdc.vaksin.ROTA.merek.ROTARIX.maksUsiaDosis1.nilai = { usia: "104 hari", termasuk: true };
  const E2 = createVaksinEngine(cdc);
  const o2 = E2.cekVaksin({ tglLahir: LAHIR, tglKunjungan: at, merek: { ROTA: "ROTARIX" } });
  assert.equal(st(o2, "ROTA"), "BOLEH");
  // Merek belum dipilih → hasil per merek berbeda → PERLU CEK (pilih merek).
  const o3 = run(at);
  assert.equal(st(o3, "ROTA"), "CEK");
  assert.equal(row(o3, "ROTA").perMerek.length, 3);
});

test("kasus 3: 15 minggu 0 hari → Rotarix tidak boleh (semua batas)", () => {
  const cdc = clone(RULES);
  cdc.vaksin.ROTA.merek.ROTARIX.maksUsiaDosis1.nilai = { usia: "104 hari", termasuk: true };
  const o = createVaksinEngine(cdc).cekVaksin({ tglLahir: LAHIR, tglKunjungan: hari(105), merek: { ROTA: "ROTARIX" } });
  assert.equal(st(o, "ROTA"), "TIDAK");
});

test("kasus 4: Rotarix dosis 1 usia 10 minggu, sekarang 24 minggu 1 hari → dosis 2 tidak boleh; 24w0d boleh", () => {
  const dosis = [{ vaksin: "ROTA", tanggal: hari(70), merek: "ROTARIX", sumber: "kia" }];
  assert.equal(st(run(hari(169), { dosis }), "ROTA"), "TIDAK");
  const ok = run(hari(168), { dosis });
  assert.equal(st(ok, "ROTA"), "BOLEH");
  assert.equal(row(ok, "ROTA").dosisKe, 2);
});

test("kasus 5: 2 bulan 3 minggu, PCV1 dua minggu lalu → PCV2 belum + tanggal", () => {
  const visit = E.iso(E.addMonths(B, 2) + 21 * 86400000);
  const pcv1 = E.iso(E.addMonths(B, 2) + 7 * 86400000);
  const out = run(visit, { dosis: [{ vaksin: "PCV", tanggal: pcv1, sumber: "kia" }] });
  assert.equal(st(out, "PCV"), "BELUM");
  assert.equal(row(out, "PCV").dosisKe, 2);
  assert.equal(E.iso(row(out, "PCV").tanggal), E.iso(E.parseTgl(pcv1) + 28 * 86400000));
});

test("kasus 6: 8 bulan belum PCV → 2 dosis + booster ≥12 bulan", () => {
  const out = run(bulan(8));
  assert.ok(GIVE.includes(st(out, "PCV")));
  assert.match(row(out, "PCV").alasan, /7–12 bulan/);
  const pcv = out.jadwalKejar.flatMap((v) => v.vaksin.filter((x) => x.kode === "PCV").map((x) => ({ t: v.tanggal, k: x.dosisKe })));
  assert.deepEqual(pcv.map((p) => p.k), [1, 2, 3]);
  assert.ok(pcv[2].t >= E.addMonths(B, 12), "booster ≥12 bulan");
  assert.ok(pcv[2].t >= E.addMonths(pcv[1].t, 2), "booster ≥2 bulan dari dosis 2");
});

test("kasus 7: 5 bulan, prednison 2 mg/kg 3 minggu, berhenti 10 hari lalu → hidup tunda, inaktif boleh", () => {
  const visit = bulan(5);
  const stop = E.iso(E.parseTgl(visit) - 10 * 86400000);
  const out = run(visit, { bbKg: 7, kondisi: { steroid: { ada: true, mgPerKgHari: 2, lamaHari: 21, tglBerhenti: stop } } });
  for (const k of ["OPV", "BCG"]) {
    assert.equal(st(out, k), "TUNDA", k);
    assert.equal(E.iso(row(out, k).tanggal), E.iso(E.addMonths(E.parseTgl(stop), 1)));
  }
  for (const k of ["DTP", "PCV", "IPV"]) assert.ok(GIVE.includes(st(out, k)), `${k} = ${st(out, k)}`);
});

test("kasus 8: demam 39°C → semua vaksin yang jatuh tempo ditunda", () => {
  const out = run(bulan(2), { kondisi: { sakitAkut: true } });
  for (const k of ["OPV", "DTP", "PCV", "BCG", "ROTA"]) assert.equal(st(out, k), "TUNDA", k);
  assert.ok(!out.hariIni.length);
  assert.ok(out.catatan.some((c) => /sembuh/.test(c)));
  assert.ok(out.jadwalKejar.length > 0);
});

test("kasus 9: BCG 2 bulan boleh; batas 3 bulan (kurang 1 hari / tepat / lebih 1 hari)", () => {
  assert.equal(st(run(bulan(2)), "BCG"), "BOLEH");
  assert.equal(st(run(bulan(3, -1)), "BCG"), "BOLEH");
  assert.equal(st(run(bulan(3)), "BCG"), "CEK");
  const o = run(bulan(3, 1));
  assert.equal(st(o, "BCG"), "CEK");
  assert.match(row(o, "BCG").alasan, /Mantoux/);
});

test("kasus 10: riwayat intususepsi → rotavirus tidak boleh", () => {
  const out = run(hari(56), { kondisi: { intususepsi: true } });
  assert.equal(st(out, "ROTA"), "TIDAK");
  assert.equal(st(run(hari(56), { kondisi: { malformasiGI: true } }), "ROTA"), "TIDAK");
});

test("kasus 11: tanggal lahir kosong → semua PERLU CEK", () => {
  const out = E.cekVaksin({ tglLahir: "", tglKunjungan: "2026-11-25" });
  assert.ok(out.baris.length >= 13);
  assert.ok(out.baris.every((r) => r.status === "CEK"));
});

test("kasus 12: DTP2 diberikan 3 minggu setelah DTP1 → tidak sah, ulangi", () => {
  const d1 = bulan(2);
  const d2 = E.iso(E.parseTgl(d1) + 21 * 86400000);
  const out = run(bulan(4), { dosis: [{ vaksin: "DTP", tanggal: d1, sumber: "kia" }, { vaksin: "DTP", tanggal: d2, sumber: "kia" }] });
  const r = row(out, "DTP");
  assert.equal(r.dosisKe, 2);
  assert.ok(GIVE.includes(r.status));
  assert.ok(r.tidakSah.some((t) => /TIDAK SAH/.test(t)));
});

test("batas DTP usia minimal 6 minggu (41/42 hari) dan dosis terlalu dini", () => {
  assert.equal(st(run(hari(41)), "DTP"), "BELUM");
  assert.equal(E.iso(row(run(hari(41)), "DTP").tanggal), hari(42));
  assert.ok(GIVE.includes(st(run(hari(42)), "DTP")));
  const early = run(hari(70), { dosis: [{ vaksin: "DTP", tanggal: hari(41), sumber: "kia" }] });
  assert.equal(row(early, "DTP").dosisKe, 1);
  assert.ok(row(early, "DTP").tidakSah.length);
});

test("batas interval polio 4 minggu (27/28 hari)", () => {
  const d1 = bulan(2);
  const mk = (gap) => run(bulan(4), { dosis: [{ vaksin: "OPV", tanggal: d1, sumber: "kia" }, { vaksin: "OPV", tanggal: E.iso(E.parseTgl(d1) + gap * 86400000), sumber: "kia" }] });
  assert.equal(row(mk(27), "OPV").dosisKe, 2);
  assert.equal(row(mk(28), "OPV").dosisKe, 3);
});

test("batas Rotarix dosis 1: 84 hari boleh, 85 hari tidak", () => {
  assert.equal(st(run(hari(84), { merek: { ROTA: "ROTARIX" } }), "ROTA"), "BOLEH");
  assert.equal(st(run(hari(85), { merek: { ROTA: "ROTARIX" } }), "ROTA"), "TIDAK");
  assert.equal(st(run(hari(41), { merek: { ROTA: "ROTARIX" } }), "ROTA"), "BELUM");
});

test("batas RotaTeq dosis 3: 224 hari boleh, 225 tidak; jarak >10 minggu → cek", () => {
  const dosis = [
    { vaksin: "ROTA", tanggal: hari(84), merek: "ROTATEQ", sumber: "kia" },
    { vaksin: "ROTA", tanggal: hari(154), merek: "ROTATEQ", sumber: "kia" },
  ];
  assert.equal(st(run(hari(224), { dosis }), "ROTA"), "BOLEH");
  assert.equal(st(run(hari(225), { dosis }), "ROTA"), "TIDAK");
  const gap = [{ vaksin: "ROTA", tanggal: hari(42), merek: "ROTATEQ", sumber: "kia" }];
  assert.equal(st(run(hari(42 + 71), { dosis: gap }), "ROTA"), "CEK");
  assert.equal(st(run(hari(42 + 70), { dosis: gap }), "ROTA"), "BOLEH");
});

test("batas RV program: mulai 2 bulan; 3 dosis harus selesai sebelum 6 bulan", () => {
  const p = { merek: { ROTA: "PROGRAM" } };
  assert.equal(st(run(bulan(2, -1), p), "ROTA"), "BELUM");
  assert.equal(st(run(bulan(2), p), "ROTA"), "BOLEH");
  // hari terakhir mulai = (6 bulan − 1 hari) − 56 hari
  const lastStart = E.addMonths(B, 6) - 86400000 - 56 * 86400000;
  assert.equal(st(run(E.iso(lastStart), p), "ROTA"), "BOLEH");
  assert.equal(st(run(E.iso(lastStart + 86400000), p), "ROTA"), "TIDAK");
});

test("batas MR: 9 bulan kurang 1 hari belum, 9 bulan boleh, 10 bulan kejar; interval 6 bulan", () => {
  assert.equal(st(run(bulan(9, -1)), "MR"), "BELUM");
  assert.equal(st(run(bulan(9)), "MR"), "BOLEH");
  assert.equal(st(run(bulan(10)), "MR"), "KEJAR");
  const late = run(bulan(18), { dosis: [{ vaksin: "MR", tanggal: bulan(14), sumber: "kia" }] });
  assert.equal(st(late, "MR"), "BELUM");
  assert.equal(E.iso(row(late, "MR").tanggal), bulan(20));
  const ok = run(bulan(18), { dosis: [{ vaksin: "MR", tanggal: bulan(9), sumber: "kia" }] });
  assert.ok(GIVE.includes(st(ok, "MR")));
});

test("vaksin hidup suntik beda hari: ≥4 minggu (27/28 hari)", () => {
  const v = bulan(12);
  const mk = (gap) => run(E.iso(E.parseTgl(v) + gap * 86400000), { dosis: [{ vaksin: "VARISELA", tanggal: v, sumber: "kia" }] });
  assert.equal(st(mk(27), "MR"), "BELUM");
  assert.ok(GIVE.includes(st(mk(28), "MR")));
  const inv = run(bulan(14), { dosis: [{ vaksin: "VARISELA", tanggal: v, sumber: "kia" }, { vaksin: "MR", tanggal: E.iso(E.parseTgl(v) + 14 * 86400000), sumber: "kia" }] });
  assert.ok(row(inv, "MR").tidakSah.length, "MR 2 minggu setelah varisela tidak sah");
});

test("influenza: 6 bulan; 2 dosis jarak 4 minggu (<9 tahun); lalu tahunan", () => {
  assert.equal(st(run(bulan(6, -1)), "INFLUENZA"), "BELUM");
  assert.equal(st(run(bulan(6)), "INFLUENZA"), "BOLEH");
  const d1 = bulan(7);
  const one = (gap) => run(E.iso(E.parseTgl(d1) + gap * 86400000), { dosis: [{ vaksin: "INFLUENZA", tanggal: d1, sumber: "kia" }] });
  assert.equal(st(one(27), "INFLUENZA"), "BELUM");
  assert.equal(st(one(28), "INFLUENZA"), "BOLEH");
  const two = run(bulan(10), { dosis: [{ vaksin: "INFLUENZA", tanggal: d1, sumber: "kia" }, { vaksin: "INFLUENZA", tanggal: bulan(8), sumber: "kia" }] });
  assert.equal(st(two, "INFLUENZA"), "BELUM");
  assert.equal(E.iso(row(two, "INFLUENZA").tanggal), bulan(20));
});

test("HB0: hari 0 boleh, hari 1 cek jam lahir, hari 2 terlewat; BBL <2000 g ditunda", () => {
  assert.equal(st(run(hari(0)), "HB0"), "BOLEH");
  assert.equal(st(run(hari(1)), "HB0"), "CEK");
  assert.equal(st(run(hari(2)), "HB0"), "TIDAK");
  const bblr = run(hari(3), { prematur: { bbLahirGram: 1800, usiaGestasiMinggu: 33 } });
  assert.equal(st(bblr, "HB0"), "TUNDA");
  assert.equal(E.iso(row(bblr, "HB0").tanggal), bulan(1));
});

test("imunodefisiensi: terbukti → vaksin hidup tidak boleh; curiga → perlu cek; inaktif tetap", () => {
  const t = run(bulan(2), { kondisi: { imunodefisiensi: "terbukti" } });
  for (const k of ["BCG", "OPV", "ROTA"]) assert.equal(st(t, k), "TIDAK", k);
  assert.ok(GIVE.includes(st(t, "DTP")));
  const c = run(bulan(2), { kondisi: { imunodefisiensi: "curiga" } });
  for (const k of ["BCG", "OPV"]) assert.equal(st(c, k), "CEK", k);
  const m = run(bulan(9), { kondisi: { kemoterapi: true } });
  assert.equal(st(m, "MR"), "TIDAK");
});

test("anafilaksis, ensefalopati, kelainan neurologis progresif", () => {
  const a = run(bulan(2), { kondisi: { anafilaksis: ["PCV"] } });
  assert.equal(st(a, "PCV"), "TIDAK");
  assert.ok(GIVE.includes(st(a, "DTP")));
  assert.equal(st(run(bulan(2), { kondisi: { ensefalopatiDTP: true } }), "DTP"), "TIDAK");
  assert.equal(st(run(bulan(2), { kondisi: { neurologiProgresif: true } }), "DTP"), "TUNDA");
});

test("transfusi/IVIG ≤11 bulan → MR & varisela perlu cek", () => {
  const o = run(bulan(13), { kondisi: { ivig: bulan(8) } });
  assert.equal(st(o, "MR"), "CEK");
  assert.equal(st(o, "VARISELA"), "CEK");
  assert.ok(GIVE.includes(st(o, "HEPA")));
});

test("cakupan usia: 7 tahun di luar cakupan; 6 tahun 11 bulan masih dinilai", () => {
  assert.equal(run(bulan(84)).diLuarCakupan, true);
  assert.equal(run(bulan(83)).diLuarCakupan, false);
});

test("dosis dari ingatan orang tua → perlu cek", () => {
  const o = run(bulan(4), { dosis: [{ vaksin: "DTP", tanggal: bulan(2), sumber: "ingatan" }] });
  assert.equal(st(o, "DTP"), "CEK");
});

test("PCV usia 2–5 tahun: PCV13 1 dosis, merek tidak dipilih 2 dosis; ≥5 tahun", () => {
  const one = run(bulan(32), { merek: { PCV: "PCV13" }, dosis: [{ vaksin: "PCV", tanggal: bulan(30), sumber: "kia" }] });
  assert.equal(st(one, "PCV"), "SELESAI");
  const unk = run(bulan(32), { dosis: [{ vaksin: "PCV", tanggal: bulan(30), sumber: "kia" }] });
  assert.ok(GIVE.includes(st(unk, "PCV")));
  assert.equal(st(run(bulan(61)), "PCV"), "TIDAK");
  assert.equal(st(run(bulan(61), { kondisi: { penyakitKronis: true } }), "PCV"), "CEK");
});

test("BCG ≥3 bulan: tuberkulin negatif boleh, positif tidak, tidak tersedia boleh; ≥12 bulan cek", () => {
  assert.equal(st(run(bulan(4), { tuberkulin: { status: "hasil", tanggal: bulan(4, -3), mm: 2, interpretasi: "negatif" } }), "BCG"), "BOLEH");
  assert.equal(st(run(bulan(4), { tuberkulin: { status: "hasil", tanggal: bulan(4, -3), mm: 12, interpretasi: "positif" } }), "BCG"), "TIDAK");
  assert.equal(st(run(bulan(4), { tuberkulin: { status: "tidak_tersedia" } }), "BCG"), "BOLEH");
  assert.equal(st(run(bulan(12), { tuberkulin: { status: "tidak_tersedia" } }), "BCG"), "CEK");
  assert.equal(st(run(bulan(1), { kondisi: { kontakTB: true } }), "BCG"), "CEK");
});

test("JE: bukan endemis → tidak diindikasikan; endemis mulai 10 bulan", () => {
  assert.equal(st(run(bulan(10), { endemisJE: false }), "JE"), "NA");
  assert.equal(st(run(bulan(10)), "JE"), "CEK");
  assert.equal(st(run(bulan(10, -1), { endemisJE: true }), "JE"), "BELUM");
  assert.equal(st(run(bulan(10), { endemisJE: true }), "JE"), "BOLEH");
});

test("steroid: dosis rendah tidak menunda; ≥20 mg/hari (BB >10 kg) masih diminum → tunda tanpa tanggal", () => {
  const low = run(bulan(2), { bbKg: 5, kondisi: { steroid: { ada: true, mgPerKgHari: 1, lamaHari: 20, tglBerhenti: bulan(2, -2) } } });
  assert.ok(GIVE.includes(st(low, "OPV")));
  const hi = run(bulan(13), { bbKg: 12, kondisi: { steroid: { ada: true, mgPerKgHari: 1.7, lamaHari: 14, masihMinum: true } } });
  assert.equal(st(hi, "MR"), "TUNDA");
  assert.equal(row(hi, "MR").tanggal, null);
  const short = run(bulan(13), { bbKg: 12, kondisi: { steroid: { ada: true, mgPerKgHari: 2, lamaHari: 13, masihMinum: true } } });
  assert.ok(GIVE.includes(st(short, "MR")), "<14 hari tidak menunda");
  const incomplete = run(bulan(13), { kondisi: { steroid: { ada: true } } });
  assert.equal(st(incomplete, "MR"), "CEK");
});

test("heksavalen dihitung juga sebagai IPV; DTP skema balita bila mulai ≥12 bulan", () => {
  const hx = run(bulan(9), { dosis: [{ vaksin: "DTP", merek: "HEKSA", tanggal: bulan(4), sumber: "kia" }] });
  assert.equal(row(hx, "IPV").dosisKe, 2);
  const bal = run(bulan(14), { dosis: [{ vaksin: "DTP", tanggal: bulan(13), sumber: "kia" }] });
  assert.equal(st(bal, "DTP"), "KEJAR");
  const bal2 = run(bulan(15), { dosis: [{ vaksin: "DTP", tanggal: bulan(13), sumber: "kia" }, { vaksin: "DTP", tanggal: bulan(14), sumber: "kia" }] });
  assert.equal(st(bal2, "DTP"), "BELUM");
  assert.equal(E.iso(row(bal2, "DTP").tanggal), bulan(20));
});

test("DTP booster: 18 bulan dan ≥12 bulan setelah dosis 3", () => {
  const dosis = [2, 3, 4].map((m) => ({ vaksin: "DTP", tanggal: bulan(m), sumber: "kia" }));
  assert.equal(st(run(bulan(18, -1), { dosis }), "DTP"), "BELUM");
  assert.ok(GIVE.includes(st(run(bulan(18), { dosis }), "DTP")));
  const late3 = [2, 3, 8].map((m) => ({ vaksin: "DTP", tanggal: bulan(m), sumber: "kia" }));
  assert.equal(E.iso(row(run(bulan(18), { dosis: late3 }), "DTP").tanggal), bulan(20));
});

test("ringkasan tanpa data pribadi (tidak ada tanggal lahir) & ikon status", () => {
  const out = run(hari(137));
  assert.ok(!out.ringkasan.includes(LAHIR));
  assert.ok(!out.ringkasan.includes("1 Jan 2026"));
  assert.match(out.ringkasan, /CEK VAKSIN/);
  assert.match(out.ringkasan, /🔴|⚪|🟢|🟡/);
});

test("aturan perlu verifikasi diberi tanda ⚠️ di baris", () => {
  const out = run(hari(137));
  assert.equal(row(out, "ROTA").perluVerifikasi, true);
  assert.equal(row(out, "HEPA").perluVerifikasi, false);
});

test("file vaksin tidak berisi akses jaringan/penyimpanan", () => {
  for (const f of ["vaksin-rules.js", "vaksin-engine.js"]) {
    const src = fs.readFileSync(path.join(__dirname, "..", "vaksin", f), "utf8");
    assert.doesNotMatch(src, /fetch\s*\(|XMLHttpRequest|localStorage|\$store|saveData|onSubmit/, f);
  }
});

test("userscript memuat aturan & mesin yang sama persis (build sinkron) + menu CEK VAKSIN", () => {
  const { loadScript } = require("./load-script.cjs");
  const { api, source } = loadScript();
  const rulesSrc = fs.readFileSync(path.join(__dirname, "..", "vaksin", "vaksin-rules.js"), "utf8");
  const engSrc = fs.readFileSync(path.join(__dirname, "..", "vaksin", "vaksin-engine.js"), "utf8");
  assert.ok(source.includes(rulesSrc), "vaksin-rules.js tidak sama dengan isi userscript; jalankan build");
  assert.ok(source.includes(engSrc), "vaksin-engine.js tidak sama dengan isi userscript; jalankan build");
  assert.match(source, /label: "CEK VAKSIN"/);
  const E2 = api.createVaksinEngine(api.VAKSIN_RULES);
  const inp = { tglLahir: LAHIR, tglKunjungan: hari(137), dosis: [{ vaksin: "HB0", tanggal: LAHIR, sumber: "kia" }] };
  assert.equal(E2.cekVaksin(inp).ringkasan, E.cekVaksin(inp).ringkasan);
  // Panel vaksin tidak menyentuh SIMPAN/SUBMIT/API.
  const a = source.indexOf("// ===== CEK VAKSIN (v0.10.0)");
  const b = source.indexOf("const MAIN_MENU = [", a);
  const ui = source.slice(a, b);
  assert.ok(a > 0 && b > a);
  assert.doesNotMatch(ui, /fetch\s*\(|XMLHttpRequest|\$store\.(dispatch|commit)|saveData|onSubmit|SIMPAN|\.click\(\)/);
});

test("docs/vaksin/aturan.md sinkron dengan vaksin-rules.js", () => {
  const { markdown } = require("../tools/gen-aturan-vaksin.cjs");
  const doc = fs.readFileSync(path.join(__dirname, "..", "docs", "vaksin", "aturan.md"), "utf8");
  assert.equal(doc, markdown(), "jalankan: node tools/gen-aturan-vaksin.cjs > docs/vaksin/aturan.md");
});
