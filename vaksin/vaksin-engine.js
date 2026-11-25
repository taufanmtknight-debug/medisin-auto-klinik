// ============================================================================
// AUTO KLINIK — CEK VAKSIN: MESIN PENILAI (fungsi murni, tanpa DOM, tanpa API).
// Semua angka klinis dibaca dari VAKSIN_RULES (vaksin-rules.js). File ini hanya
// menghitung tanggal, keabsahan dosis, status, dan jadwal kejar.
// Versi 1 HANYA MENAMPILKAN: tidak mengisi atau menyimpan apa pun.
// ============================================================================
function createVaksinEngine(R) {
  const DAY = 86400000;
  const ST = {
    BOLEH: { ikon: "🟢", label: "BOLEH HARI INI" },
    BELUM: { ikon: "🔵", label: "BELUM WAKTUNYA" },
    KEJAR: { ikon: "🟡", label: "TERLAMBAT, KEJAR" },
    TIDAK: { ikon: "🔴", label: "TIDAK BOLEH" },
    TUNDA: { ikon: "🟠", label: "TUNDA" },
    CEK: { ikon: "⚪", label: "PERLU CEK" },
    SELESAI: { ikon: "✅", label: "SELESAI" },
    NA: { ikon: "➖", label: "TIDAK DIINDIKASIKAN" },
  };
  const URUTAN = ["HB0", "BCG", "OPV", "IPV", "DTP", "PCV", "ROTA", "INFLUENZA", "MR", "JE", "VARISELA", "HEPA", "TIFOID"];
  const V = R.vaksin;

  // ---------------- tanggal (UTC, tanpa jam) ----------------
  function parseTgl(s) {
    const t = String(s ?? "").trim();
    let m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(t);
    if (m) return mk(+m[1], +m[2], +m[3]);
    m = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/.exec(t);
    if (m) return mk(+m[3], +m[2], +m[1]);
    return null;
    function mk(y, mo, d) {
      if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
      const ms = Date.UTC(y, mo - 1, d);
      const back = new Date(ms);
      return back.getUTCDate() === d ? ms : null;
    }
  }
  const iso = (ms) => (ms == null ? "" : new Date(ms).toISOString().slice(0, 10));
  const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const tglTeks = (ms) => {
    if (ms == null) return "";
    const d = new Date(ms);
    return `${d.getUTCDate()} ${BULAN[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  };
  const addDays = (ms, n) => ms + n * DAY;
  function addMonths(ms, n) {
    const d = new Date(ms);
    const y = d.getUTCFullYear();
    const m = d.getUTCMonth() + n;
    const last = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    return Date.UTC(y, m, Math.min(d.getUTCDate(), last));
  }
  function parseDur(v) {
    if (v && typeof v === "object" && v.usia) return parseDur(v.usia);
    const m = /^\s*(\d+)\s*(hari|minggu|bulan|tahun)\s*$/.exec(String(v ?? ""));
    if (!m) throw new Error(`Durasi tidak dikenal di aturan: ${v}`);
    return { n: +m[1], u: m[2] };
  }
  function addDur(ms, v) {
    const { n, u } = parseDur(v);
    if (u === "hari") return addDays(ms, n);
    if (u === "minggu") return addDays(ms, n * 7);
    if (u === "bulan") return addMonths(ms, n);
    return addMonths(ms, n * 12);
  }
  // Batas maksimal { usia, termasuk } → tanggal terakhir yang masih boleh.
  function lastAllowed(birth, maks) {
    const at = addDur(birth, maks.usia);
    return maks.termasuk ? at : addDays(at, -1);
  }
  const diffDays = (a, b) => Math.round((b - a) / DAY);
  const max = (...xs) => xs.filter((x) => x != null).reduce((a, b) => (b > a ? b : a), -Infinity);

  function usia(birth, visit) {
    const hari = diffDays(birth, visit);
    let bulan = 0;
    while (addMonths(birth, bulan + 1) <= visit) bulan++;
    const sisaHari = diffDays(addMonths(birth, bulan), visit);
    const tahun = Math.floor(bulan / 12);
    const minggu = Math.floor(hari / 7);
    const parts = [];
    if (tahun) parts.push(`${tahun} th`);
    if (bulan % 12) parts.push(`${bulan % 12} bl`);
    parts.push(`${sisaHari} hr`);
    return {
      hari,
      minggu,
      sisaHariMinggu: hari - minggu * 7,
      bulan,
      sisaHari,
      tahun,
      teks: `${parts.join(" ")} (${hari} hari = ${minggu} minggu ${hari - minggu * 7} hari = ${bulan} bulan ${sisaHari} hari)`,
      teksPendek: parts.join(" "),
    };
  }
  const durTeks = (v) => {
    const { n, u } = parseDur(v);
    return `${n} ${u}`;
  };

  // ---------------- konteks ----------------
  function makeCtx(inp) {
    const birth = parseTgl(inp.tglLahir);
    const visit = parseTgl(inp.tglKunjungan);
    const k = inp.kondisi || {};
    const doses = (inp.dosis || [])
      .map((d, i) => ({ ...d, idx: i, ms: parseTgl(d.tanggal) }))
      .filter((d) => d.vaksin)
      .sort((a, b) => (a.ms ?? 0) - (b.ms ?? 0));
    return { inp, birth, visit, k, doses, grace: Number(R.umum.graceDays.nilai) || 0 };
  }
  // Dosis untuk satu vaksin (heksavalen dihitung juga sebagai IPV).
  function dosesFor(ctx, kode) {
    return ctx.doses.filter((d) => d.vaksin === kode || (kode === "IPV" && d.vaksin === "DTP" && d.merek === "HEKSA"));
  }

  function rowBase(kode) {
    return { kode, nama: V[kode].nama, status: "CEK", dosisKe: null, alasan: "", tanggal: null, sumber: [], perluVerifikasi: false, catatan: [], tidakSah: [] };
  }
  function use(row, ...rules) {
    for (const r of rules) {
      if (!r) continue;
      if (r.sumber && !row.sumber.includes(r.sumber)) row.sumber.push(r.sumber);
      if (r.status_verifikasi === "perlu verifikasi") row.perluVerifikasi = true;
    }
  }

  // ---------------- seri umum ----------------
  // spec: n(valid) jumlah dosis, minAge(k, valid) tanggal paling awal karena usia,
  // interval(k, valid) jarak dari dosis sebelumnya, ideal(k) bulan jadwal terakhir (terlambat
  // bila usia ≥ ideal+1 bulan) atau null, kejar(valid) true bila skema kejar.
  function series(ctx, row, list, spec, at) {
    const valid = [];
    for (const d of list) {
      if (d.ms == null) {
        row.status = "CEK";
        row.alasan = "Ada dosis tanpa tanggal; lengkapi tanggalnya.";
        return { valid, stop: true };
      }
      if (d.ms > at) continue;
      const k = valid.length + 1;
      if (k > spec.n(valid)) {
        row.catatan.push(`Dosis ${tglTeks(d.ms)} melebihi jumlah dosis yang dibutuhkan.`);
        continue;
      }
      const earliest = max(spec.minAge(k, valid), valid.length ? addDur(valid[valid.length - 1].ms, spec.interval(k, valid)) : null);
      const liveConflict = spec.live ? liveInjectedConflict(ctx, d, d.ms) : null;
      if (d.ms < addDays(earliest, -ctx.grace) || liveConflict) {
        const why = liveConflict
          ? `<4 minggu setelah vaksin hidup suntik lain (${tglTeks(liveConflict)})`
          : `diberikan sebelum ${tglTeks(earliest)} (usia/jarak minimal belum cukup)`;
        row.tidakSah.push(`Dosis ${tglTeks(d.ms)} TIDAK SAH: ${why}. Ulangi.`);
        continue;
      }
      valid.push(d);
    }
    return { valid };
  }

  function nextOf(ctx, row, valid, spec, at) {
    const k = valid.length + 1;
    const n = spec.n(valid);
    if (k > n) return { selesai: true, k };
    const due = max(spec.minAge(k, valid), valid.length ? addDur(valid[valid.length - 1].ms, spec.interval(k, valid)) : null);
    return { k, n, due };
  }

  // Vaksin hidup suntik (MR, JE, varisela): jarak ≥4 minggu bila tidak di hari yang sama.
  const LIVE_INJ = ["MR", "JE", "VARISELA"];
  function liveInjectedConflict(ctx, dose, at) {
    if (!LIVE_INJ.includes(dose.vaksin)) return null;
    const gap = R.umum.vaksinHidupSuntikBedaHari.nilai;
    for (const o of ctx.doses) {
      if (o === dose || o.ms == null || !LIVE_INJ.includes(o.vaksin) || o.vaksin === dose.vaksin) continue;
      if (o.ms < at && at < addDur(o.ms, gap)) return o.ms;
    }
    return null;
  }
  function liveInjectedBlock(ctx, kode, at) {
    if (!LIVE_INJ.includes(kode)) return null;
    const gap = R.umum.vaksinHidupSuntikBedaHari.nilai;
    let until = null;
    for (const o of ctx.doses) {
      if (o.ms == null || !LIVE_INJ.includes(o.vaksin) || o.vaksin === kode || o.ms >= at) continue;
      const u = addDur(o.ms, gap);
      if (u > at && (until == null || u > until)) until = u;
    }
    return until;
  }

  // Ubah hasil seri jadi status.
  function finishSeries(ctx, row, kode, valid, spec, at, opts = {}) {
    const nx = nextOf(ctx, row, valid, spec, at);
    if (nx.selesai) {
      row.status = "SELESAI";
      row.alasan = `${valid.length} dosis sah sudah lengkap.`;
      return nx;
    }
    row.dosisKe = nx.k;
    let due = nx.due;
    const block = liveInjectedBlock(ctx, kode, at);
    if (block && block > due) {
      due = block;
      use(row, R.umum.vaksinHidupSuntikBedaHari);
      row.catatan.push("Menunggu 4 minggu dari vaksin hidup suntik lain.");
    }
    if (opts.lastDay != null && max(due, at) > opts.lastDay) {
      row.status = "TIDAK";
      row.alasan = opts.lastWhy || `Dosis ${nx.k} melewati batas usia (${tglTeks(opts.lastDay)}).`;
      return nx;
    }
    if (due > at) {
      row.status = "BELUM";
      row.tanggal = due;
      row.alasan = `Dosis ${nx.k} paling cepat ${tglTeks(due)}.`;
      return nx;
    }
    const ideal = spec.ideal ? spec.ideal(nx.k, valid) : null;
    const late = (spec.kejar && spec.kejar(valid)) || (ideal != null && at >= addMonths(ctx.birth, ideal + 1));
    row.status = late && !opts.noKejar ? "KEJAR" : "BOLEH";
    row.tanggal = at;
    row.alasan = `Dosis ${nx.k} dari ${nx.n} boleh diberikan${late && !opts.noKejar ? " (sudah lewat jadwal)" : ""}.`;
    return nx;
  }

  // ---------------- per vaksin ----------------
  const E = {};

  E.HB0 = (ctx, row, at) => {
    const r = V.HB0;
    use(row, r.batasLahir);
    if (dosesFor(ctx, "HB0").some((d) => d.ms != null && d.ms <= at)) {
      row.status = "SELESAI";
      row.alasan = "HB0 sudah diberikan.";
      return;
    }
    const bbl = Number(ctx.inp.prematur?.bbLahirGram) || null;
    if (bbl && bbl < r.bblKurang2000.nilai.bbGram) {
      use(row, r.bblKurang2000);
      const until = addDur(ctx.birth, r.bblKurang2000.nilai.tundaSampai);
      if (at < until) {
        row.status = "TUNDA";
        row.tanggal = until;
        row.alasan = `BB lahir <2000 g: tunda sampai usia 1 bulan (${tglTeks(until)}) atau saat pulang, kecuali ibu HBsAg positif.`;
      } else {
        row.status = "CEK";
        row.alasan = "BB lahir <2000 g: perlu 4 dosis HB (dosis lahir tidak dihitung). Cek manual.";
      }
      return;
    }
    const hari = diffDays(ctx.birth, at);
    const batas = parseDur(r.batasLahir.nilai).n;
    if (hari < batas) {
      row.status = "BOLEH";
      row.dosisKe = 1;
      row.tanggal = at;
      row.alasan = "Lahir hari ini: HB0 <24 jam.";
    } else if (hari === batas) {
      row.status = "CEK";
      row.alasan = "Usia 1 hari: cek jam lahir. HB0 hanya bila <24 jam.";
    } else {
      use(row, r.bilaTerlewat);
      row.status = "TIDAK";
      row.alasan = "Lewat 24 jam. Perlindungan HB dilanjutkan lewat DTP-HB-Hib.";
    }
  };

  E.BCG = (ctx, row, at) => {
    const r = V.BCG;
    use(row, r.ideal);
    if (dosesFor(ctx, "BCG").some((d) => d.ms != null && d.ms <= at)) {
      row.status = "SELESAI";
      row.alasan = "BCG sudah diberikan.";
      return;
    }
    row.dosisKe = 1;
    const ga = Number(ctx.inp.prematur?.usiaGestasiMinggu) || null;
    if (ga && ga < r.prematur.nilai.usiaGestasiMinMinggu) {
      use(row, r.prematur);
      row.status = "CEK";
      row.alasan = "Lahir <32 minggu: sumber hanya menyebut prematur sehat 32–36 minggu. Cek manual.";
      return;
    }
    if (ctx.k.kontakTB) {
      use(row, r.kontakTB);
      row.status = "CEK";
      row.alasan = "Kontak TB serumah: singkirkan infeksi TB dulu (beri terapi pencegahan TB).";
      return;
    }
    if (at >= addDur(ctx.birth, r.batasKejarProgram.nilai)) {
      use(row, r.batasKejarProgram);
      row.status = "CEK";
      row.alasan = "Usia ≥12 bulan: di luar batas kejar program. IDAI: boleh bila uji tuberkulin negatif. Keputusan dokter.";
      return;
    }
    const ujiMulai = addDur(ctx.birth, r.tanpaUjiSampai.nilai);
    if (at < ujiMulai) {
      row.status = "BOLEH";
      row.tanggal = at;
      row.alasan = `Usia <3 bulan: BCG langsung tanpa uji tuberkulin${at >= addDur(ctx.birth, r.ideal.nilai) ? " (ideal <1 bulan, sudah lewat)" : ""}.`;
      return;
    }
    use(row, r.tanpaUjiSampai);
    const tb = ctx.inp.tuberkulin || {};
    if (tb.status === "tidak_tersedia") {
      row.status = "BOLEH";
      row.tanggal = at;
      row.alasan = "Usia ≥3 bulan, uji tuberkulin tidak tersedia: BCG tetap boleh. Pantau reaksi lokal cepat di minggu pertama (bila ada: periksa TB).";
      return;
    }
    if (tb.status === "hasil" && tb.interpretasi) {
      use(row, R.umum.tuberkulinBerlaku);
      if (tb.interpretasi === "negatif") {
        row.status = "BOLEH";
        row.tanggal = at;
        row.alasan = `Uji tuberkulin negatif${tb.mm !== "" && tb.mm != null ? ` (${tb.mm} mm)` : ""}: BCG boleh.`;
      } else {
        row.status = "TIDAK";
        row.alasan = "Uji tuberkulin positif: jangan BCG, evaluasi TB.";
      }
      return;
    }
    row.status = "CEK";
    row.alasan = "Usia ≥3 bulan: uji tuberkulin (Mantoux) dulu. Bila tidak tersedia, BCG tetap boleh dengan pemantauan.";
  };

  const specOPV = (ctx) => ({
    n: () => V.OPV.jumlahDosis.nilai,
    minAge: () => addDur(ctx.birth, V.OPV.minUsiaDosis1.nilai),
    interval: () => V.OPV.interval.nilai,
    ideal: (k) => V.OPV.usiaIdealBulan.nilai[k - 1],
  });
  E.OPV = (ctx, row, at) => {
    use(row, V.OPV.jumlahDosis, V.OPV.usiaIdealBulan, V.OPV.interval);
    const spec = specOPV(ctx);
    const s = series(ctx, row, dosesFor(ctx, "OPV"), spec, at);
    if (s.stop) return;
    finishSeries(ctx, row, "OPV", s.valid, spec, at);
  };

  const specIPV = (ctx) => ({
    n: () => V.IPV.jumlahDosis.nilai,
    minAge: () => addDur(ctx.birth, V.IPV.minUsiaDosis1.nilai),
    interval: () => V.IPV.interval.nilai,
    ideal: (k) => V.IPV.usiaIdealBulan.nilai[k - 1],
  });
  E.IPV = (ctx, row, at) => {
    use(row, V.IPV.jumlahDosis, V.IPV.minUsiaDosis1, V.IPV.interval);
    const spec = specIPV(ctx);
    const s = series(ctx, row, dosesFor(ctx, "IPV"), spec, at);
    if (s.stop) return;
    finishSeries(ctx, row, "IPV", s.valid, spec, at);
    if (["BOLEH", "KEJAR", "BELUM"].includes(row.status) && at >= addDur(ctx.birth, V.IPV.batasKejar.nilai)) {
      use(row, V.IPV.batasKejar);
      row.status = "CEK";
      row.tanggal = null;
      row.alasan = "Usia ≥5 tahun: di luar jadwal kejar IPV program. Cek manual.";
    }
  };

  function specDTP(ctx, startMs) {
    const r = V.DTP;
    const balita = startMs >= addDur(ctx.birth, r.balitaMulaiUsia.nilai);
    return {
      balita,
      n: () => 4,
      minAge: (k) => addDur(ctx.birth, k === 4 && !balita ? r.boosterMinUsia.nilai : r.minUsiaDosis1.nilai),
      interval: (k) => (balita ? r.intervalBalita.nilai[k - 2] : k === 4 ? r.boosterInterval.nilai : r.intervalBayi.nilai),
      ideal: (k) => (balita ? null : r.usiaIdealBulan.nilai[k - 1]),
      kejar: () => balita,
    };
  }
  E.DTP = (ctx, row, at) => {
    const r = V.DTP;
    use(row, r.minUsiaDosis1, r.usiaIdealBulan);
    if (ctx.k.ensefalopatiDTP) {
      use(row, r.ensefalopati7hari);
      row.status = "TIDAK";
      row.alasan = "Ensefalopati ≤7 hari setelah DTP: jangan komponen pertusis. DT tanpa pertusis: cek manual.";
      return;
    }
    const list = dosesFor(ctx, "DTP");
    const firstOk = list.find((d) => d.ms != null && d.ms <= at && d.ms >= addDays(addDur(ctx.birth, r.minUsiaDosis1.nilai), -ctx.grace));
    const spec = specDTP(ctx, firstOk ? firstOk.ms : at);
    use(row, spec.balita ? r.intervalBalita : r.intervalBayi);
    const s = series(ctx, row, list, spec, at);
    if (s.stop) return;
    if (s.valid.length >= 3 && !spec.balita) use(row, r.boosterMinUsia, r.boosterInterval);
    finishSeries(ctx, row, "DTP", s.valid, spec, at);
    if (["BOLEH", "KEJAR", "BELUM"].includes(row.status) && at >= addDur(ctx.birth, r.batasKejar.nilai)) {
      use(row, r.batasKejar);
      row.status = "CEK";
      row.tanggal = null;
      row.alasan = "Usia ≥5 tahun: lanjut DT/Td program BIAS. Cek manual.";
    }
    if (ctx.k.neurologiProgresif && ["BOLEH", "KEJAR"].includes(row.status)) {
      use(row, r.neurologiProgresif);
      row.status = "TUNDA";
      row.tanggal = null;
      row.alasan = "Kelainan neurologis progresif: tunda DTP sampai status neurologis jelas dan stabil.";
    }
  };

  function pcvPlan(ctx, row, at) {
    const r = V.PCV;
    const list = dosesFor(ctx, "PCV");
    const min1 = addDur(ctx.birth, r.minUsiaDosis1.nilai);
    const first = list.find((d) => d.ms != null && d.ms <= at && d.ms >= addDays(min1, -ctx.grace));
    const a1 = first ? first.ms : at;
    const merek = ctx.inp.merek?.PCV || "";
    const t = ctx.inp.tersedia || {};
    const jadwal = ctx.inp.jadwalPCV || (t.program && !t.swasta ? "program" : "idai");
    const booster = (k) => addDur(ctx.birth, r.boosterMinUsia.nilai);
    if (a1 < addMonths(ctx.birth, 7)) {
      const prog = jadwal === "program";
      use(row, prog ? r.programJadwal : r.idaiJadwal, r.intervalPrimer, r.boosterMinUsia, r.boosterInterval);
      const n = prog ? 3 : 4;
      return {
        skema: prog ? "program 2+1 (2, 3, 12 bulan)" : "IDAI 3+1 (2, 4, 6, booster 12–15 bulan)",
        primer: n - 1,
        n: () => n,
        minAge: (k) => (k === n ? booster(k) : min1),
        interval: (k) => (k === n ? r.boosterInterval.nilai : r.intervalPrimer.nilai),
        ideal: (k) => (k === n ? (prog ? 12 : 15) : prog ? r.programJadwal.nilai[k - 1] : r.idaiJadwal.nilai[k - 1]),
      };
    }
    if (a1 < addMonths(ctx.birth, 12)) {
      use(row, r.intervalMulai7sd12, r.boosterMinUsia, r.boosterInterval);
      return {
        skema: "mulai 7–12 bulan: 2 dosis + booster ≥12 bulan",
        primer: 2,
        n: () => 3,
        minAge: (k) => (k === 3 ? booster(k) : min1),
        interval: (k) => (k === 3 ? r.boosterInterval.nilai : r.intervalMulai7sd12.nilai),
        ideal: (k) => (k === 3 ? 15 : null),
        kejar: (valid) => valid.length < 2,
      };
    }
    if (a1 <= addMonths(ctx.birth, 24)) {
      use(row, r.mulai12sd24);
      return { skema: "mulai 12–24 bulan: 2 dosis", primer: 2, n: () => r.mulai12sd24.nilai.dosis, minAge: () => min1, interval: () => r.mulai12sd24.nilai.interval, kejar: () => true };
    }
    use(row, r.mulai24sd59);
    const n = merek ? r.mulai24sd59.nilai[merek] || r.mulai24sd59.nilai.tidakTahu : r.mulai24sd59.nilai.tidakTahu;
    if (!merek) row.catatan.push("Merek PCV belum dipilih: dipakai 2 dosis (PCV13/PCV15 cukup 1 dosis).");
    return { skema: `mulai >24 bulan: ${n} dosis${merek ? ` (${merek})` : ""}`, primer: n, n: () => n, minAge: () => min1, interval: () => r.mulai24sd59.nilai.interval, kejar: () => true };
  }
  E.PCV = (ctx, row, at) => {
    const r = V.PCV;
    use(row, r.minUsiaDosis1, r.batasUsia);
    const spec = pcvPlan(ctx, row, at);
    const s = series(ctx, row, dosesFor(ctx, "PCV"), spec, at);
    if (s.stop) return;
    row.skema = spec.skema;
    const nx = nextOf(ctx, row, s.valid, spec, at);
    if (!nx.selesai && at >= addDur(ctx.birth, r.batasUsia.nilai)) {
      row.dosisKe = nx.k;
      if (ctx.k.penyakitKronis) {
        use(row, R.catatan.penyakitKronis);
        row.status = "CEK";
        row.alasan = "Usia ≥5 tahun dengan penyakit kronis: IDAI menganjurkan 1 dosis PCV13. Cek manual.";
      } else {
        row.status = "TIDAK";
        row.alasan = "Usia ≥5 tahun: PCV tidak rutin lagi (hanya risiko tinggi).";
      }
      return;
    }
    if (!nx.selesai && s.valid.length > 0 && s.valid.length < spec.primer && at >= addMonths(ctx.birth, 12) && s.valid[0].ms < addMonths(ctx.birth, 12)) {
      row.dosisKe = nx.k;
      row.status = "CEK";
      row.alasan = "Riwayat PCV tidak teratur (dosis primer belum lengkap dan sekarang ≥12 bulan). Cek manual.";
      return;
    }
    finishSeries(ctx, row, "PCV", s.valid, spec, at);
    if (row.status !== "SELESAI") row.alasan += ` Skema: ${spec.skema}.`;
  };

  function rotaBrand(ctx, b, list, at) {
    const m = V.ROTA.merek[b];
    const row = rowBase("ROTA");
    use(row, m.jumlahDosis, m.minUsiaDosis1, m.maksUsiaDosis1, m.interval, m.maksUsiaSeri, m.intervalMaks);
    const min1 = addDur(ctx.birth, m.minUsiaDosis1.nilai);
    const lastSeri = lastAllowed(ctx.birth, m.maksUsiaSeri.nilai);
    const last1 = m.maksUsiaDosis1.nilai ? lastAllowed(ctx.birth, m.maksUsiaDosis1.nilai) : null;
    const spec = { n: () => m.jumlahDosis.nilai, minAge: () => min1, interval: () => m.interval.nilai };
    const s = series(ctx, row, list, spec, at);
    if (s.stop) return row;
    const valid = s.valid;
    const k = valid.length + 1;
    if (k > m.jumlahDosis.nilai) {
      row.status = "SELESAI";
      row.alasan = `${m.label}: ${valid.length} dosis lengkap.`;
      return row;
    }
    row.dosisKe = k;
    const due = max(min1, valid.length ? addDur(valid[valid.length - 1].ms, m.interval.nilai) : null);
    const remaining = m.jumlahDosis.nilai - k; // dosis setelah dosis ini
    if (k === 1 && last1 != null && max(due, at) > last1) {
      row.status = "TIDAK";
      row.alasan = `${m.label}: dosis 1 paling lambat ${tglTeks(last1)} (usia ${durTeks(m.maksUsiaDosis1.nilai.usia)}). Rotavirus tidak bisa dikejar.`;
      return row;
    }
    // Seri harus bisa selesai sebelum batas usia seri.
    let finish = max(due, at);
    for (let i = 0; i < remaining; i++) finish = addDur(finish, m.interval.nilai);
    if (max(due, at) > lastSeri || finish > lastSeri) {
      row.status = "TIDAK";
      row.alasan = `${m.label}: seri harus selesai paling lambat ${tglTeks(lastSeri)}; ${max(due, at) > lastSeri ? `dosis ${k} sudah lewat batas` : `sisa ${remaining + 1} dosis tidak bisa selesai tepat waktu`}. Tidak bisa dikejar.`;
      return row;
    }
    if (m.intervalMaks && valid.length && at > addDur(valid[valid.length - 1].ms, m.intervalMaks.nilai)) {
      row.status = "CEK";
      row.alasan = `${m.label}: jarak dari dosis sebelumnya >${durTeks(m.intervalMaks.nilai)}. Cek manual.`;
      return row;
    }
    if (due > at) {
      row.status = "BELUM";
      row.tanggal = due;
      row.alasan = `${m.label}: dosis ${k} paling cepat ${tglTeks(due)}.`;
      return row;
    }
    row.status = "BOLEH";
    row.tanggal = at;
    row.alasan = `${m.label}: dosis ${k} dari ${m.jumlahDosis.nilai} boleh (selesai paling lambat ${tglTeks(lastSeri)}).`;
    return row;
  }
  E.ROTA = (ctx, row, at) => {
    const r = V.ROTA;
    use(row, r.tidakBisaDikejar);
    const k = ctx.k;
    if (k.intususepsi || k.malformasiGI) {
      use(row, r.kontraindikasi);
      row.status = "TIDAK";
      row.alasan = k.intususepsi ? "Riwayat intususepsi: kontraindikasi rotavirus." : "Malformasi saluran cerna belum dikoreksi: kontraindikasi rotavirus.";
      return;
    }
    const list = dosesFor(ctx, "ROTA").filter((d) => d.ms == null || d.ms <= at);
    const brands = [...new Set(list.map((d) => d.merek || ""))];
    let chosen = ctx.inp.merek?.ROTA || "";
    if (list.length) {
      if (brands.length !== 1 || !brands[0] || (chosen && chosen !== brands[0])) {
        row.status = "CEK";
        row.dosisKe = list.length + 1;
        row.alasan = "Merek dosis rotavirus sebelumnya tidak diketahui/campur. Cek manual (CDC: anggap seri 3 dosis).";
        row.perluVerifikasi = true;
        return;
      }
      chosen = brands[0];
    }
    const t = ctx.inp.tersedia || {};
    let cands = chosen ? [chosen] : Object.keys(r.merek);
    if (!chosen && (t.program || t.swasta)) cands = cands.filter((b) => (b === "PROGRAM" ? t.program : t.swasta));
    if (!cands.length) cands = Object.keys(r.merek);
    const per = cands.map((b) => ({ merek: b, label: r.merek[b].label, ...rotaBrand(ctx, b, list, at) }));
    for (const p of per) {
      for (const sb of p.sumber) if (!row.sumber.includes(sb)) row.sumber.push(sb);
      if (p.perluVerifikasi) row.perluVerifikasi = true;
      row.tidakSah.push(...p.tidakSah.filter((x) => !row.tidakSah.includes(x)));
    }
    if (per.length === 1) {
      Object.assign(row, { status: per[0].status, dosisKe: per[0].dosisKe, tanggal: per[0].tanggal, alasan: per[0].alasan, merek: per[0].merek });
      return;
    }
    row.perMerek = per.map((p) => ({ merek: p.merek, label: p.label, status: p.status, alasan: p.alasan, tanggal: p.tanggal, dosisKe: p.dosisKe }));
    const sts = [...new Set(per.map((p) => p.status))];
    if (sts.length === 1) {
      row.status = sts[0];
      row.dosisKe = per[0].dosisKe;
      row.tanggal = sts[0] === "BELUM" ? per.reduce((a, p) => max(a, p.tanggal), -Infinity) : per[0].tanggal;
      row.alasan = sts[0] === "TIDAK" ? "Semua jenis vaksin rotavirus sudah lewat batas usia. Tidak bisa dikejar." : per.map((p) => p.alasan).join(" ");
    } else {
      row.status = "CEK";
      row.dosisKe = per[0].dosisKe;
      row.alasan = "Hasil berbeda per merek: pilih merek yang tersedia.";
    }
  };

  E.INFLUENZA = (ctx, row, at) => {
    const r = V.INFLUENZA;
    use(row, r.minUsia, r.duaDosisSampaiUsia, r.interval, r.ulangan);
    const min = addDur(ctx.birth, r.minUsia.nilai);
    const list = dosesFor(ctx, "INFLUENZA").filter((d) => d.ms != null && d.ms <= at);
    const valid = [];
    for (const d of list) {
      if (d.ms < addDays(min, -ctx.grace)) {
        row.tidakSah.push(`Dosis ${tglTeks(d.ms)} TIDAK SAH: sebelum usia 6 bulan. Ulangi.`);
        continue;
      }
      if (valid.length === 1 && d.ms < addDays(addDur(valid[0].ms, r.interval.nilai), -ctx.grace)) {
        row.tidakSah.push(`Dosis ${tglTeks(d.ms)} TIDAK SAH: <4 minggu dari dosis pertama. Ulangi.`);
        continue;
      }
      valid.push(d);
    }
    let due;
    if (!valid.length) {
      due = min;
      row.dosisKe = 1;
    } else {
      const twoNeeded = valid[0].ms < addDur(ctx.birth, r.duaDosisSampaiUsia.nilai);
      if (twoNeeded && valid.length === 1) {
        due = addDur(valid[0].ms, r.interval.nilai);
        row.dosisKe = 2;
      } else {
        due = addDur(valid[valid.length - 1].ms, r.ulangan.nilai);
        row.dosisKe = "ulangan tahunan";
      }
    }
    if (due > at) {
      row.status = "BELUM";
      row.tanggal = due;
      row.alasan = `${row.dosisKe === 1 ? "Mulai usia 6 bulan" : row.dosisKe === 2 ? "Dosis 2 (pertama kali <9 tahun)" : "Ulangan tahunan"}: paling cepat ${tglTeks(due)}.`;
    } else {
      row.status = "BOLEH";
      row.tanggal = at;
      row.alasan = row.dosisKe === 1 ? `Dosis 1 boleh${at < addDur(ctx.birth, r.duaDosisSampaiUsia.nilai) ? "; pertama kali <9 tahun: perlu 2 dosis jarak 4 minggu" : ""}.` : row.dosisKe === 2 ? "Dosis 2 boleh (≥4 minggu dari dosis 1)." : "Ulangan tahunan boleh.";
    }
  };

  const specMR = (ctx) => {
    const r = V.MR;
    return {
      live: true,
      n: () => 3,
      minAge: (k) => addDur(ctx.birth, [r.minUsiaDosis1, r.minUsiaDosis2, r.minUsiaDosis3][k - 1].nilai),
      interval: () => r.interval.nilai,
      ideal: (k) => [9, 18, null][k - 1],
    };
  };
  E.MR = (ctx, row, at) => {
    const r = V.MR;
    use(row, r.minUsiaDosis1, r.minUsiaDosis2, r.interval);
    const spec = specMR(ctx);
    const s = series(ctx, row, dosesFor(ctx, "MR"), spec, at);
    if (s.stop) return;
    if (s.valid.length >= 2) use(row, r.minUsiaDosis3);
    finishSeries(ctx, row, "MR", s.valid, spec, at);
    if (row.status === "BELUM" && row.dosisKe === 3) row.alasan = `Dosis 3 (BIAS kelas 1) paling cepat ${tglTeks(row.tanggal)}.`;
  };

  E.JE = (ctx, row, at) => {
    const r = V.JE;
    if (ctx.inp.endemisJE == null || ctx.inp.endemisJE === "") {
      row.status = "CEK";
      row.alasan = "Isi dulu: apakah daerah endemis JE?";
      return;
    }
    if (!ctx.inp.endemisJE) {
      row.status = "NA";
      row.alasan = "Bukan daerah endemis JE.";
      return;
    }
    use(row, r.minUsia, r.booster);
    const spec = { live: true, n: () => 2, minAge: () => addDur(ctx.birth, r.minUsia.nilai), interval: () => r.booster.nilai };
    const s = series(ctx, row, dosesFor(ctx, "JE"), spec, at);
    if (s.stop) return;
    finishSeries(ctx, row, "JE", s.valid, spec, at, { noKejar: true });
  };

  E.VARISELA = (ctx, row, at) => {
    const r = V.VARISELA;
    use(row, r.minUsia, r.interval);
    const spec = { live: true, n: () => 2, minAge: () => addDur(ctx.birth, r.minUsia.nilai), interval: () => r.interval.nilai };
    const s = series(ctx, row, dosesFor(ctx, "VARISELA"), spec, at);
    if (s.stop) return;
    finishSeries(ctx, row, "VARISELA", s.valid, spec, at, { noKejar: true });
  };

  E.HEPA = (ctx, row, at) => {
    const r = V.HEPA;
    use(row, r.minUsia, r.interval);
    const spec = { n: () => 2, minAge: () => addDur(ctx.birth, r.minUsia.nilai), interval: () => r.interval.nilai };
    const s = series(ctx, row, dosesFor(ctx, "HEPA"), spec, at);
    if (s.stop) return;
    finishSeries(ctx, row, "HEPA", s.valid, spec, at, { noKejar: true });
  };

  E.TIFOID = (ctx, row, at) => {
    const r = V.TIFOID;
    use(row, r.minUsia, r.ulangan);
    const min = addDur(ctx.birth, r.minUsia.nilai);
    const list = dosesFor(ctx, "TIFOID").filter((d) => d.ms != null && d.ms <= at);
    const valid = list.filter((d) => {
      if (d.ms >= addDays(min, -ctx.grace)) return true;
      row.tidakSah.push(`Dosis ${tglTeks(d.ms)} TIDAK SAH: sebelum usia 2 tahun.`);
      return false;
    });
    const due = valid.length ? addDur(valid[valid.length - 1].ms, r.ulangan.nilai) : min;
    row.dosisKe = valid.length ? "ulangan 3 tahunan" : 1;
    if (due > at) {
      row.status = "BELUM";
      row.tanggal = due;
      row.alasan = `${valid.length ? "Ulangan" : "Mulai usia 2 tahun"}: paling cepat ${tglTeks(due)}.`;
    } else {
      row.status = "BOLEH";
      row.tanggal = at;
      row.alasan = valid.length ? "Ulangan 3 tahunan boleh." : "Dosis 1 boleh.";
    }
  };

  // ---------------- kondisi umum ----------------
  const PRI = { TIDAK: 3, TUNDA: 2, CEK: 1 };
  function override(row, status, alasan, rule, tanggal = null) {
    use(row, rule);
    const cur = row.status;
    if (["SELESAI", "NA"].includes(cur)) return;
    if (cur === "TIDAK" && !row._umum) return; // batas usia/kontraindikasi khusus tetap
    if (cur === "BELUM" && status !== "TIDAK" && status !== "CEK") {
      if (status === "TUNDA" && tanggal && tanggal > row.tanggal) {
        row.tanggal = tanggal;
        row.alasan += ` Ditunda sampai ${tglTeks(tanggal)}: ${alasan}`;
      }
      return;
    }
    if (cur === "BELUM" && status === "CEK") {
      row.catatan.push(alasan);
      return;
    }
    if ((PRI[cur] || 0) > PRI[status]) {
      row.catatan.push(alasan);
      return;
    }
    if ((PRI[cur] || 0) === PRI[status]) {
      row.alasan = `${row.alasan} ${alasan}`.trim();
      if (tanggal && (!row.tanggal || tanggal > row.tanggal)) row.tanggal = tanggal;
      return;
    }
    if (["BOLEH", "KEJAR"].includes(cur)) row.catatan.push(`Bila tidak ada halangan: ${row.alasan}`);
    row._umum = true;
    row.status = status;
    row.alasan = alasan;
    row.tanggal = tanggal;
  }

  function steroidInfo(ctx, at) {
    const s = ctx.k.steroid;
    if (!s || !s.ada) return null;
    const r = R.umum.steroidDosisTinggi.nilai;
    const mgkg = Number(s.mgPerKgHari);
    const bb = Number(ctx.inp.bbKg);
    const lama = Number(s.lamaHari);
    if (!(mgkg > 0) || !(lama > 0) || (!s.masihMinum && parseTgl(s.tglBerhenti) == null)) return { kurang: true };
    const mgHari = bb > 0 ? mgkg * bb : null;
    const tinggi = mgkg >= r.mgPerKgHari || (mgHari != null && bb > r.mgPerHariBilaBBdiAtasKg && mgHari >= r.mgPerHari);
    if (!tinggi || lama < r.lamaHari) return { tinggi: false };
    if (s.masihMinum) return { tinggi: true, sampai: null };
    const sampai = addDur(parseTgl(s.tglBerhenti), r.tundaVaksinHidup);
    return { tinggi: true, sampai: sampai > at ? sampai : false };
  }

  function applyUmum(ctx, row, at) {
    const k = ctx.k;
    const hidup = V[row.kode].hidup;
    const U = R.umum;
    if (row.status === "NA") return;
    const ingatan = dosesFor(ctx, row.kode).some((d) => d.sumber === "ingatan");
    if (ingatan) override(row, "CEK", "Ada dosis yang hanya dari ingatan orang tua: pastikan dari buku KIA.", U.riwayatDariIngatan);
    if ((k.anafilaksis || []).includes(row.kode)) override(row, "TIDAK", "Riwayat anafilaksis terhadap vaksin ini/komponennya.", U.anafilaksis);
    if (hidup) {
      if (k.imunodefisiensi === "terbukti" || k.kemoterapi)
        override(row, "TIDAK", `${k.kemoterapi ? "Sedang kemoterapi" : "Imunodefisiensi berat/HIV terbukti"}: vaksin hidup tidak boleh${row.kode === "OPV" ? " (pakai IPV)" : ""}.`, U.imunodefisiensiBerat);
      else if (k.imunodefisiensi === "curiga") override(row, "CEK", "Curiga imunodefisiensi/HIV: pastikan dulu sebelum vaksin hidup.", U.imunodefisiensiBerat);
      const st = steroidInfo(ctx, at);
      if (st?.kurang) override(row, "CEK", "Data steroid belum lengkap (mg/kg/hari, lama, tanggal berhenti).", U.steroidDosisTinggi);
      else if (st?.tinggi && st.sampai !== false)
        override(row, "TUNDA", st.sampai ? `Steroid dosis tinggi: vaksin hidup ditunda sampai ${tglTeks(st.sampai)} (1 bulan setelah berhenti).` : "Steroid dosis tinggi masih diminum: vaksin hidup ditunda sampai 1 bulan setelah berhenti.", U.steroidDosisTinggi, st.sampai || null);
      if (["MR", "VARISELA"].includes(row.kode)) {
        const iv = parseTgl(k.ivig);
        if (iv != null && iv <= at && at <= addDur(iv, U.produkDarahIVIG.nilai))
          override(row, "CEK", "Transfusi/IVIG ≤11 bulan: jarak tergantung produk & dosis (3–11 bulan). Cek manual.", U.produkDarahIVIG);
      }
    } else if (k.kemoterapi) {
      override(row, "CEK", "Sedang kemoterapi: respons vaksin inaktif bisa kurang dan dosis mungkin perlu diulang. Cek manual.", U.imunodefisiensiBerat);
    }
    if (k.sakitAkut) override(row, "TUNDA", "Demam ≥38°C / sakit akut sedang–berat: tunda sampai sembuh.", U.demamAtauSakitSedangBerat);
  }

  function evalAll(inp, atOverride) {
    const ctx = makeCtx(inp);
    const at = atOverride ?? ctx.visit;
    const rows = [];
    for (const kode of URUTAN) {
      const row = rowBase(kode);
      try {
        E[kode](ctx, row, at);
        applyUmum(ctx, row, at);
      } catch (e) {
        row.status = "CEK";
        row.alasan = `Gagal menilai: ${e.message}`;
      }
      delete row._umum;
      rows.push(row);
    }
    return { ctx, rows };
  }

  // ---------------- jadwal kejar (simulasi) ----------------
  function plan(inp, maxVisits = 12) {
    const base = makeCtx(inp);
    const stopAt = Math.min(addDur(base.birth, R.cakupan.usiaMaks.nilai), addMonths(base.visit, 24));
    const sim = { ...inp, dosis: [...(inp.dosis || [])], kondisi: { ...(inp.kondisi || {}), sakitAkut: false } };
    const simToday = evalAll(sim, base.visit).rows;
    const skip = new Set(simToday.filter((r) => ["TIDAK", "CEK", "NA"].includes(r.status) || (r.status === "TUNDA" && !r.tanggal)).map((r) => r.kode));
    const visits = [];
    let at = base.visit;
    for (let i = 0; i < maxVisits && at <= stopAt; i++) {
      const { rows } = evalAll(sim, at);
      const give = rows.filter((r) => !skip.has(r.kode) && ["BOLEH", "KEJAR"].includes(r.status));
      if (give.length) {
        visits.push({ tanggal: at, vaksin: give.map((r) => ({ kode: r.kode, nama: r.nama, dosisKe: r.dosisKe })) });
        for (const r of give) {
          const merek = r.kode === "ROTA" ? r.merek || inp.merek?.ROTA || "" : r.kode === "PCV" ? inp.merek?.PCV || "" : "";
          sim.dosis.push({ vaksin: r.kode, tanggal: iso(at), merek, sumber: "rencana" });
        }
      }
      const after = give.length ? evalAll(sim, at).rows : rows;
      const repeatDone = (kode) => ["INFLUENZA", "TIFOID"].includes(kode) && visits.some((v) => v.vaksin.some((x) => x.kode === kode && typeof x.dosisKe === "string"));
      const next = after
        .filter((r) => !skip.has(r.kode) && ["BELUM", "TUNDA"].includes(r.status) && r.tanggal && r.tanggal > at && !repeatDone(r.kode))
        .map((r) => r.tanggal);
      if (!next.length) break;
      at = Math.min(...next);
    }
    return visits.filter((v) => v.tanggal <= stopAt);
  }

  // ---------------- lokasi suntik (saran) ----------------
  const ORAL = ["OPV", "ROTA"];
  function lokasi(kodes, umurBulan) {
    const sites = umurBulan < 12 ? ["paha kiri", "paha kanan", "paha kiri (jarak 2,5 cm)", "paha kanan (jarak 2,5 cm)"] : ["lengan atas kiri", "lengan atas kanan", "paha kiri", "paha kanan"];
    let i = 0;
    return kodes.map((k) => {
      if (ORAL.includes(k)) return { kode: k, lokasi: "mulut (tetes)", rute: R.rute[k].nilai };
      if (k === "BCG") return { kode: k, lokasi: "intrakutan", rute: R.rute[k].nilai };
      const s = sites[i % sites.length];
      i++;
      return { kode: k, lokasi: s, rute: R.rute[k].nilai };
    });
  }

  // ---------------- API utama ----------------
  function cekVaksin(inp) {
    const out = { versiAturan: R.versi, baris: [], hariIni: [], jadwalKejar: [], catatan: [], diLuarCakupan: false, usia: null };
    const birth = parseTgl(inp.tglLahir);
    const visit = parseTgl(inp.tglKunjungan);
    if (birth == null || visit == null || birth > visit) {
      const why = birth == null ? "Tanggal lahir belum diisi/tidak terbaca." : visit == null ? "Tanggal kunjungan belum diisi." : "Tanggal lahir setelah tanggal kunjungan.";
      out.baris = URUTAN.map((kode) => ({ ...rowBase(kode), status: "CEK", alasan: why }));
      out.ringkasan = ringkasan(out);
      return out;
    }
    out.usia = usia(birth, visit);
    if (visit >= addDur(birth, R.cakupan.usiaMaks.nilai)) {
      out.diLuarCakupan = true;
      out.baris = URUTAN.map((kode) => ({ ...rowBase(kode), status: "CEK", alasan: "Usia ≥7 tahun: di luar cakupan alat, cek manual." }));
      out.ringkasan = ringkasan(out);
      return out;
    }
    const { rows } = evalAll(inp);
    out.baris = rows;
    const today = rows.filter((r) => ["BOLEH", "KEJAR"].includes(r.status));
    out.hariIni = lokasi(today.map((r) => r.kode), out.usia.bulan).map((x) => {
      const r = rows.find((y) => y.kode === x.kode);
      return { ...x, nama: r.nama, dosisKe: r.dosisKe };
    });
    out.jadwalKejar = plan(inp);
    const k = inp.kondisi || {};
    const C = out.catatan;
    if (k.sakitAkut) C.push("Anak sedang demam/sakit akut sedang–berat: semua vaksin yang jatuh tempo ditunda. Jadwal kejar di bawah dihitung bila diberikan setelah sembuh.");
    if (inp.prematur?.usiaGestasiMinggu || inp.prematur?.bbLahirGram) C.push("Prematur: jadwal memakai usia kronologis (tanggal lahir), bukan usia koreksi.");
    if (out.usia.hari <= 7) C.push("Ibu HBsAg positif: HB0 + HBIg <24 jam di paha berbeda (HBIg masih boleh sampai 7 hari).");
    if (k.penyakitKronis) C.push(R.catatan.penyakitKronis.nilai);
    if (k.imunodefisiensi && k.imunodefisiensi !== "tidak") C.push("Imunodefisiensi: polio pakai IPV (bukan tetes). Respons vaksin inaktif bisa kurang.");
    if (k.rawatInap) C.push("Sedang dirawat inap: nilai apakah sakit sedang–berat (bila ya, tunda). Cek manual.");
    if (k.kontakTB) C.push("Kontak TB serumah: evaluasi infeksi TB & terapi pencegahan sebelum BCG.");
    if (out.hariIni.some((x) => !ORAL.includes(x.kode) && x.kode !== "BCG")) C.push(`Lokasi suntik: ${R.umum.lokasiSuntik.nilai} (pembagian paha/lengan hanya saran ⚠️).`);
    if (rows.some((r) => r.kode === "ROTA" && r.perMerek)) C.push("Rotavirus bergantung merek: pilih merek yang tersedia untuk hasil pasti.");
    C.push(R.catatan.RSV.nilai);
    if (!Number(R.umum.graceDays.nilai)) C.push("Dosis sebelum usia/jarak minimal dianggap TIDAK SAH (tanpa toleransi 4 hari CDC).");
    out.ringkasan = ringkasan(out);
    return out;
  }

  function ringkasan(out) {
    const L = [];
    L.push(`CEK VAKSIN (aturan ${out.versiAturan})`);
    if (out.usia) L.push(`Usia: ${out.usia.teks}`);
    for (const r of out.baris) {
      const st = ST[r.status];
      L.push(`${st.ikon} ${r.nama}: ${st.label}${r.dosisKe && typeof r.dosisKe === "number" ? ` (dosis ${r.dosisKe})` : ""}${r.tanggal && r.status !== "BOLEH" && r.status !== "KEJAR" ? ` ${tglTeks(r.tanggal)}` : ""}${r.perluVerifikasi ? " ⚠️" : ""} — ${r.alasan}`);
      for (const t of r.tidakSah) L.push(`   ! ${t}`);
    }
    if (out.hariIni.length) {
      L.push("");
      L.push("Hari ini berikan:");
      for (const h of out.hariIni) L.push(`- ${h.nama}${typeof h.dosisKe === "number" ? ` dosis ${h.dosisKe}` : ""}: ${h.rute}, ${h.lokasi}`);
    }
    if (out.jadwalKejar.length) {
      L.push("");
      L.push("Jadwal kejar:");
      for (const v of out.jadwalKejar) L.push(`- ${tglTeks(v.tanggal)}: ${v.vaksin.map((x) => `${x.nama} ${typeof x.dosisKe === "number" ? x.dosisKe : `(${x.dosisKe})`}`).join(", ")}`);
    }
    if (out.catatan.length) {
      L.push("");
      L.push("Catatan:");
      for (const c of out.catatan) L.push(`- ${c}`);
    }
    L.push("");
    L.push("Hanya bantuan; keputusan tetap pada dokter.");
    return L.join("\n");
  }

  return { cekVaksin, usia, parseTgl, iso, tglTeks, addMonths, addDur, ST, URUTAN, RULES: R };
}

if (typeof module === "object" && module && module.exports) module.exports = { createVaksinEngine };
