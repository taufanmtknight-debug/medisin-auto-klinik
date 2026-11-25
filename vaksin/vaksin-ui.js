// Potongan UI panel CEK VAKSIN; disisipkan build ke dalam IIFE userscript (memakai pasienAktif, escapePreviewHtml, notify, parseMedisinAge).
  // ===== CEK VAKSIN (v0.10.0) — HANYA MENAMPILKAN, tidak mengisi/menyimpan rekam medis =====
  const VAKSIN = createVaksinEngine(VAKSIN_RULES);
  const VAKSIN_KLINIK_KEY = "auto-klinik-medisin:vaksin-klinik";
  const vaksinState = {}; // per id kunjungan, hanya di memori halaman

  // Tanggal lahir/kunjungan dari store Medisin (nama kolom dicari, tidak ditebak satu).
  function readVaksinPasien() {
    const p = pasienAktif() || null;
    const out = { tglLahir: "", tglKunjungan: "", bbKg: "", umur: "", sumberLahir: "", sumberKunjungan: "" };
    if (!p) return out;
    const objs = [["", p]];
    for (const k of ["pasien", "users", "user", "data_pasien", "patient", "kunjungan"]) if (p[k] && typeof p[k] === "object") objs.push([k + ".", p[k]]);
    const find = (re) => {
      for (const [pre, o] of objs)
        for (const [k, v] of Object.entries(o)) {
          if (!re.test(k) || v == null || typeof v === "object") continue;
          const ms = VAKSIN.parseTgl(v);
          if (ms != null) return { iso: VAKSIN.iso(ms), key: pre + k };
        }
      return null;
    };
    const lahir = find(/^(tgl|tanggal)_?lahir$|lahir|birth|^dob$/i);
    const kunj = find(/^(tgl|tanggal)_?(kunjungan|daftar|registrasi|periksa|pelayanan)$|kunjungan_entrytime|entrytime|tgl_masuk|tanggal_masuk/i);
    if (lahir) Object.assign(out, { tglLahir: lahir.iso, sumberLahir: lahir.key });
    if (kunj) Object.assign(out, { tglKunjungan: kunj.iso, sumberKunjungan: kunj.key });
    const bb = Number(String(p.berat_badan ?? "").replace(",", "."));
    if (bb > 0) out.bbKg = String(bb);
    out.umur = String(p.umur || "");
    return out;
  }

  function akvTodayIso() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
  function vaksinKlinik() {
    try {
      return JSON.parse(localStorage.getItem(VAKSIN_KLINIK_KEY) || "{}") || {};
    } catch (_) {
      return {};
    }
  }
  function saveVaksinKlinik(v) {
    try {
      localStorage.setItem(VAKSIN_KLINIK_KEY, JSON.stringify(v));
    } catch (_) {}
  }

  const AKV_JENIS = [
    ["HB0", "HB0 (lahir)"],
    ["BCG", "BCG"],
    ["OPV", "Polio tetes (bOPV)"],
    ["IPV", "Polio suntik (IPV)"],
    ["DTP", "DTP-HB-Hib"],
    ["PCV", "PCV"],
    ["ROTA", "Rotavirus"],
    ["INFLUENZA", "Influenza"],
    ["MR", "MR / MMR"],
    ["JE", "JE"],
    ["VARISELA", "Varisela"],
    ["HEPA", "Hepatitis A"],
    ["TIFOID", "Tifoid"],
  ];
  const AKV_MEREK = {
    DTP: [["", "pentavalen"], ["HEKSA", "heksavalen (+IPV)"]],
    ROTA: [["", "merek?"], ["ROTARIX", "Rotarix"], ["ROTATEQ", "RotaTeq"], ["PROGRAM", "RV program"]],
    PCV: [["", "merek?"], ["PCV13", "PCV13"], ["PCV10", "PCV10"], ["PCV15", "PCV15"]],
  };
  const AKV_KONDISI = [
    ["sakitAkut", "Demam ≥38°C / sakit akut sedang–berat"],
    ["kemoterapi", "Kemoterapi"],
    ["intususepsi", "Riwayat intususepsi"],
    ["malformasiGI", "Malformasi saluran cerna belum dikoreksi"],
    ["ensefalopatiDTP", "Ensefalopati ≤7 hari setelah DTP"],
    ["neurologiProgresif", "Kelainan neurologis progresif"],
    ["kontakTB", "Kontak TB serumah"],
    ["penyakitKronis", "Penyakit paru/jantung/ginjal kronis"],
    ["rawatInap", "Sedang rawat inap"],
  ];

  function vaksinDefaultState() {
    const auto = readVaksinPasien();
    const kl = vaksinKlinik();
    return {
      auto,
      tglLahir: auto.tglLahir,
      tglKunjungan: auto.tglKunjungan || akvTodayIso(),
      bbKg: auto.bbKg,
      dosis: [],
      merek: { ROTA: "", PCV: "" },
      jadwalPCV: "",
      prematur: { usiaGestasiMinggu: "", bbLahirGram: "" },
      kondisi: { imunodefisiensi: "tidak", anafilaksis: [], steroid: { ada: false, mgPerKgHari: "", lamaHari: "", tglBerhenti: "", masihMinum: false }, ivig: "" },
      tuberkulin: { status: "belum", tanggal: "", mm: "", interpretasi: "" },
      endemisJE: kl.endemisJE ?? "",
      tersedia: { program: kl.program ?? true, swasta: kl.swasta ?? true },
    };
  }

  function vaksinInput(s) {
    return {
      tglLahir: s.tglLahir,
      tglKunjungan: s.tglKunjungan,
      bbKg: s.bbKg,
      dosis: s.dosis.filter((d) => d.vaksin && d.tanggal),
      merek: s.merek,
      jadwalPCV: s.jadwalPCV,
      prematur: s.prematur,
      kondisi: s.kondisi,
      tuberkulin: s.tuberkulin,
      endemisJE: s.endemisJE === "" ? null : s.endemisJE === "ya",
      tersedia: s.tersedia,
    };
  }

  function openVaksinPanel() {
    const key = urlKunjunganId() || "tanpa-id";
    const s = (vaksinState[key] ||= vaksinDefaultState());
    if (!s.tglLahir && !s.auto.tglLahir) {
      const again = readVaksinPasien();
      if (again.tglLahir) Object.assign(s, { auto: again, tglLahir: again.tglLahir, bbKg: s.bbKg || again.bbKg, tglKunjungan: again.tglKunjungan || s.tglKunjungan });
    }
    document.getElementById("akv-panel")?.remove();
    if (!document.getElementById("akv-style")) {
      const st = document.createElement("style");
      st.id = "akv-style";
      st.textContent = AKV_CSS;
      (document.head || document.documentElement).appendChild(st);
    }
    const shade = document.createElement("div");
    shade.id = "akv-panel";
    shade.setAttribute("data-auto-klinik", "1");
    const e = escapePreviewHtml;
    const opt = (list, val) => list.map(([v, l]) => `<option value="${e(v)}"${String(val) === v ? " selected" : ""}>${e(l)}</option>`).join("");
    const chk = (path, label, on) => `<label class="akv-chk"><input type="checkbox" data-k="${path}"${on ? " checked" : ""}> ${e(label)}</label>`;
    shade.innerHTML = `<div class="akv-card">
  <div class="akv-head"><div><b>💉 CEK VAKSIN</b><small>Hanya menampilkan · tidak mengisi atau menyimpan rekam medis · aturan ${e(VAKSIN_RULES.versi)}</small></div><button type="button" class="akv-x" aria-label="Tutup">×</button></div>
  <div class="akv-body">
   <div class="akv-col">
    <section><h4>👤 Anak</h4>
      <div class="akv-grid">
        <label>Tanggal lahir<input type="date" data-k="tglLahir" value="${e(s.tglLahir)}"></label>
        <label>Tanggal kunjungan<input type="date" data-k="tglKunjungan" value="${e(s.tglKunjungan)}"></label>
        <label>BB (kg)<input type="number" step="0.1" min="0" data-k="bbKg" value="${e(s.bbKg)}"></label>
      </div>
      <div class="akv-hint" id="akv-src"></div>
      <div class="akv-usia" id="akv-usia"></div>
    </section>
    <section><h4>📒 Riwayat dosis</h4>
      <div id="akv-dosis"></div>
      <button type="button" class="akv-btn" id="akv-add">+ Tambah dosis</button>
    </section>
    <section><h4>🏷️ Merek yang akan dipakai</h4>
      <div class="akv-grid">
        <label>Rotavirus<select data-k="merek.ROTA">${opt(AKV_MEREK.ROTA, s.merek.ROTA)}</select></label>
        <label>PCV<select data-k="merek.PCV">${opt(AKV_MEREK.PCV, s.merek.PCV)}</select></label>
        <label>Jadwal PCV &lt;7 bln<select data-k="jadwalPCV">${opt([["", "otomatis"], ["program", "program 2+1"], ["idai", "IDAI 3+1"]], s.jadwalPCV)}</select></label>
      </div>
    </section>
    <section><h4>🩺 Kondisi saat ini</h4>
      <div class="akv-chks">${AKV_KONDISI.map(([k, l]) => chk("kondisi." + k, l, s.kondisi[k])).join("")}</div>
      <div class="akv-grid">
        <label>Imunodefisiensi/HIV<select data-k="kondisi.imunodefisiensi">${opt([["tidak", "tidak"], ["curiga", "curiga"], ["terbukti", "terbukti"]], s.kondisi.imunodefisiensi)}</select></label>
        <label>Transfusi/IVIG (tgl)<input type="date" data-k="kondisi.ivig" value="${e(s.kondisi.ivig)}"></label>
      </div>
      <div class="akv-sub">${chk("kondisi.steroid.ada", "Steroid sistemik", s.kondisi.steroid.ada)}
        <div class="akv-grid akv-steroid">
          <label>mg/kg/hari<input type="number" step="0.1" min="0" data-k="kondisi.steroid.mgPerKgHari" value="${e(s.kondisi.steroid.mgPerKgHari)}"></label>
          <label>lama (hari)<input type="number" min="0" data-k="kondisi.steroid.lamaHari" value="${e(s.kondisi.steroid.lamaHari)}"></label>
          <label>tgl berhenti<input type="date" data-k="kondisi.steroid.tglBerhenti" value="${e(s.kondisi.steroid.tglBerhenti)}"></label>
          ${chk("kondisi.steroid.masihMinum", "masih diminum", s.kondisi.steroid.masihMinum)}
        </div></div>
      <div class="akv-sub"><span>Anafilaksis terhadap vaksin/komponen:</span>
        <div class="akv-chks akv-mini">${AKV_JENIS.map(([k, l]) => `<label class="akv-chk"><input type="checkbox" data-ana="${k}"${s.kondisi.anafilaksis.includes(k) ? " checked" : ""}> ${e(l)}</label>`).join("")}</div></div>
    </section>
    <section><h4>👶 Prematur · uji tuberkulin · klinik</h4>
      <div class="akv-grid">
        <label>Usia gestasi (mg)<input type="number" min="20" max="44" data-k="prematur.usiaGestasiMinggu" value="${e(s.prematur.usiaGestasiMinggu)}"></label>
        <label>BB lahir (g)<input type="number" min="300" max="6000" data-k="prematur.bbLahirGram" value="${e(s.prematur.bbLahirGram)}"></label>
        <label>Uji tuberkulin<select data-k="tuberkulin.status">${opt([["belum", "belum diperiksa"], ["tidak_tersedia", "tidak tersedia"], ["hasil", "ada hasil"]], s.tuberkulin.status)}</select></label>
        <label>tgl uji<input type="date" data-k="tuberkulin.tanggal" value="${e(s.tuberkulin.tanggal)}"></label>
        <label>indurasi (mm)<input type="number" min="0" max="40" data-k="tuberkulin.mm" value="${e(s.tuberkulin.mm)}"></label>
        <label>penilaian dokter<select data-k="tuberkulin.interpretasi">${opt([["", "—"], ["negatif", "negatif"], ["positif", "positif"]], s.tuberkulin.interpretasi)}</select></label>
        <label>Daerah endemis JE<select data-k="endemisJE">${opt([["", "—"], ["ya", "ya"], ["tidak", "tidak"]], s.endemisJE)}</select></label>
      </div>
      <div class="akv-chks">${chk("tersedia.program", "Vaksin program tersedia", s.tersedia.program)}${chk("tersedia.swasta", "Vaksin swasta tersedia", s.tersedia.swasta)}</div>
    </section>
   </div>
   <div class="akv-col akv-res" id="akv-hasil"></div>
  </div>
</div>`;
    (document.body || document.documentElement).appendChild(shade);

    const setPath = (path, val) => {
      const parts = path.split(".");
      let o = s;
      while (parts.length > 1) o = o[parts.shift()];
      o[parts[0]] = val;
    };
    const renderDosis = () => {
      const box = shade.querySelector("#akv-dosis");
      if (!s.dosis.length) {
        box.innerHTML = '<div class="akv-hint">Belum ada dosis. Tambahkan dari buku KIA.</div>';
        return;
      }
      box.innerHTML = s.dosis
        .map(
          (d, i) => `<div class="akv-dose" data-i="${i}">
        <select data-d="vaksin">${opt([["", "jenis…"], ...AKV_JENIS], d.vaksin)}</select>
        <input type="date" data-d="tanggal" value="${e(d.tanggal)}">
        ${AKV_MEREK[d.vaksin] ? `<select data-d="merek">${opt(AKV_MEREK[d.vaksin], d.merek)}</select>` : '<span class="akv-nomerek"></span>'}
        <select data-d="sumber">${opt([["kia", "buku KIA"], ["ingatan", "ingatan ortu"]], d.sumber)}</select>
        <button type="button" class="akv-del" title="Hapus">✕</button></div>`,
        )
        .join("");
    };
    const render = () => {
      const out = VAKSIN.cekVaksin(vaksinInput(s));
      const a = s.auto;
      shade.querySelector("#akv-src").innerHTML = a.tglLahir
        ? `Tanggal lahir dari Medisin${a.umur ? ` (umur Medisin: ${e(a.umur)})` : ""}. Cocokkan dengan buku KIA.`
        : `<b class="akv-warn">Tanggal lahir tidak terbaca dari Medisin — isi manual.</b>${a.umur ? ` Umur di Medisin: ${e(a.umur)}.` : ""}`;
      const med = parseMedisinAge(a.umur);
      let cocok = "";
      if (out.usia && med && s.tglLahir === a.tglLahir) {
        const sama = med.years * 12 + med.months === out.usia.bulan && Math.abs(med.days - out.usia.sisaHari) <= 1;
        if (!sama) cocok = ' <b class="akv-warn">Berbeda dengan umur di Medisin — periksa tanggal.</b>';
      }
      shade.querySelector("#akv-usia").innerHTML = out.usia ? `Usia: <b>${e(out.usia.teks)}</b>${cocok}` : "";
      const H = shade.querySelector("#akv-hasil");
      const ST = VAKSIN.ST;
      const tgl = VAKSIN.tglTeks;
      const rows = out.baris
        .map((r) => {
          const st = ST[r.status];
          const dose = typeof r.dosisKe === "number" ? ` · dosis ${r.dosisKe}` : r.dosisKe ? ` · ${e(r.dosisKe)}` : "";
          const when = r.tanggal && !["BOLEH", "KEJAR"].includes(r.status) ? ` · <b>${tgl(r.tanggal)}</b>` : "";
          const per = r.perMerek ? `<ul class="akv-per">${r.perMerek.map((p) => `<li>${ST[p.status].ikon} ${e(p.alasan)}</li>`).join("")}</ul>` : "";
          const bad = r.tidakSah.length ? `<ul class="akv-bad">${r.tidakSah.map((t) => `<li>${e(t)}</li>`).join("")}</ul>` : "";
          const notes = r.catatan.length ? `<ul class="akv-note">${r.catatan.map((t) => `<li>${e(t)}</li>`).join("")}</ul>` : "";
          const src = r.sumber.length ? `<details><summary>sumber${r.perluVerifikasi ? " ⚠️ ada aturan perlu verifikasi" : ""}</summary><ul>${r.sumber.map((x) => `<li>${e(x)}</li>`).join("")}</ul></details>` : "";
          return `<div class="akv-row akv-${r.status.toLowerCase()}"><div class="akv-rt"><span>${st.ikon} <b>${e(r.nama)}</b></span><span class="akv-st">${e(st.label)}${dose}${when}${r.perluVerifikasi ? " ⚠️" : ""}</span></div><div class="akv-why">${e(r.alasan)}</div>${per}${bad}${notes}${src}</div>`;
        })
        .join("");
      const today = out.hariIni.length
        ? `<ol>${out.hariIni.map((h) => `<li><b>${e(h.nama)}</b>${typeof h.dosisKe === "number" ? ` dosis ${h.dosisKe}` : ""} — ${e(h.rute)}, ${e(h.lokasi)}</li>`).join("")}</ol>`
        : '<div class="akv-hint">Tidak ada.</div>';
      const plan = out.jadwalKejar.length
        ? `<table class="akv-plan"><tr><th>Tanggal</th><th>Vaksin</th></tr>${out.jadwalKejar.map((v) => `<tr><td>${tgl(v.tanggal)}</td><td>${v.vaksin.map((x) => `${e(x.nama)} ${typeof x.dosisKe === "number" ? x.dosisKe : `(${e(x.dosisKe)})`}`).join(", ")}</td></tr>`).join("")}</table><div class="akv-hint">Tanggal = paling cepat (jarak & usia minimal). Kunjungan berdekatan boleh digabung asal tidak lebih awal.</div>`
        : '<div class="akv-hint">Tidak ada.</div>';
      H.innerHTML = `${out.diLuarCakupan ? '<div class="akv-banner">Di luar cakupan alat (≥7 tahun) — cek manual.</div>' : ""}
        <section><h4>Hasil per vaksin</h4>${rows}</section>
        <section><h4>Hari ini berikan</h4>${today}</section>
        <section><h4>Jadwal kejar</h4>${plan}</section>
        <section><h4>Catatan khusus</h4><ul>${out.catatan.map((c) => `<li>${e(c)}</li>`).join("")}</ul></section>
        <button type="button" class="akv-btn akv-copy" id="akv-copy">📋 Salin ringkasan</button>
        <div class="akv-hint">Bantuan saja; keputusan tetap pada dokter. Ringkasan tidak memuat nama/No RM/tanggal lahir.</div>`;
      H.querySelector("#akv-copy").onclick = () => akvCopyText(out.ringkasan);
    };

    shade.addEventListener("input", (ev) => onChange(ev));
    shade.addEventListener("change", (ev) => onChange(ev));
    function onChange(ev) {
      const t = ev.target;
      if (t.dataset.k) {
        const v = t.type === "checkbox" ? t.checked : t.value;
        setPath(t.dataset.k, v);
        if (t.dataset.k === "endemisJE" || t.dataset.k.startsWith("tersedia.")) saveVaksinKlinik({ endemisJE: s.endemisJE, program: s.tersedia.program, swasta: s.tersedia.swasta });
      } else if (t.dataset.ana) {
        const set = new Set(s.kondisi.anafilaksis);
        t.checked ? set.add(t.dataset.ana) : set.delete(t.dataset.ana);
        s.kondisi.anafilaksis = [...set];
      } else if (t.dataset.d) {
        const i = Number(t.closest(".akv-dose").dataset.i);
        s.dosis[i][t.dataset.d] = t.value;
        if (t.dataset.d === "vaksin" && ev.type === "change") {
          s.dosis[i].merek = "";
          renderDosis();
        }
      } else return;
      render();
    }
    shade.addEventListener("click", (ev) => {
      const t = ev.target;
      if (t.classList.contains("akv-x") || t === shade) return shade.remove();
      if (t.id === "akv-add") {
        s.dosis.push({ vaksin: "", tanggal: "", merek: "", sumber: "kia" });
        renderDosis();
        return;
      }
      if (t.classList.contains("akv-del")) {
        s.dosis.splice(Number(t.closest(".akv-dose").dataset.i), 1);
        renderDosis();
        render();
      }
    });
    renderDosis();
    render();
  }

  async function akvCopyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      notify("Ringkasan vaksin disalin.", "success", 3000);
    } catch (_) {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("data-auto-klinik", "1");
      ta.style.cssText = "position:fixed;left:-9999px;top:0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        notify("Ringkasan vaksin disalin.", "success", 3000);
      } catch (__) {
        notify("Gagal menyalin; pilih teks secara manual.", "warn", 5000);
      }
      ta.remove();
    }
  }

  const AKV_CSS = `
  #akv-panel{position:fixed;inset:0;z-index:2147483000;background:rgba(15,23,42,.45);display:flex;align-items:flex-start;justify-content:center;overflow:auto;padding:16px;font:13px/1.4 system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;color:#0f172a}
  #akv-panel .akv-card{background:#fff;border-radius:12px;width:min(1180px,100%);box-shadow:0 20px 50px rgba(0,0,0,.3);overflow:hidden}
  #akv-panel .akv-head{display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:#0e7490;color:#fff}
  #akv-panel .akv-head b{font-size:16px}#akv-panel .akv-head small{display:block;opacity:.9}
  #akv-panel .akv-x{background:none;border:0;color:#fff;font-size:24px;cursor:pointer}
  #akv-panel .akv-body{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.15fr);gap:12px;padding:12px}
  @media (max-width:820px){#akv-panel .akv-body{grid-template-columns:1fr}#akv-panel{padding:4px}}
  #akv-panel section{border:1px solid #e2e8f0;border-radius:10px;padding:8px 10px;margin-bottom:10px}
  #akv-panel h4{margin:0 0 6px;font-size:13px;color:#0e7490}
  #akv-panel .akv-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:6px}
  #akv-panel label{display:flex;flex-direction:column;font-size:11px;color:#475569;gap:2px}
  #akv-panel input,#akv-panel select{font:inherit;font-size:12px;padding:3px 5px;border:1px solid #cbd5e1;border-radius:6px;background:#fff;color:#0f172a;min-width:0}
  #akv-panel .akv-chks{display:flex;flex-wrap:wrap;gap:4px 12px;margin:4px 0}
  #akv-panel .akv-chk{flex-direction:row;align-items:center;gap:4px;font-size:12px;color:#0f172a}
  #akv-panel .akv-mini .akv-chk{font-size:11px}
  #akv-panel .akv-sub{margin-top:6px;font-size:12px}
  #akv-panel .akv-dose{display:grid;grid-template-columns:1.3fr 1.2fr 1.1fr 1fr auto;gap:4px;margin-bottom:4px}
  #akv-panel .akv-del{border:0;background:#fee2e2;color:#b91c1c;border-radius:6px;cursor:pointer}
  #akv-panel .akv-btn{border:1px solid #0e7490;background:#ecfeff;color:#0e7490;border-radius:8px;padding:5px 10px;cursor:pointer;font-weight:600}
  #akv-panel .akv-copy{width:100%;padding:8px;font-size:14px}
  #akv-panel .akv-hint{font-size:11px;color:#64748b;margin-top:3px}
  #akv-panel .akv-warn{color:#b45309}
  #akv-panel .akv-usia{margin-top:4px}
  #akv-panel .akv-banner{background:#fef3c7;border:1px solid #f59e0b;border-radius:8px;padding:8px;margin-bottom:8px;font-weight:600}
  #akv-panel .akv-row{border-left:6px solid #94a3b8;background:#f8fafc;border-radius:8px;padding:6px 8px;margin-bottom:6px}
  #akv-panel .akv-rt{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap}
  #akv-panel .akv-st{font-weight:700;font-size:12px}
  #akv-panel .akv-why{font-size:12px;margin-top:2px}
  #akv-panel .akv-row ul{margin:3px 0 0 16px;padding:0;font-size:11px}
  #akv-panel .akv-bad{color:#b91c1c}#akv-panel .akv-note{color:#475569}
  #akv-panel details{font-size:11px;color:#475569;margin-top:2px}#akv-panel summary{cursor:pointer}
  #akv-panel .akv-boleh{border-color:#16a34a;background:#f0fdf4}
  #akv-panel .akv-belum{border-color:#2563eb;background:#eff6ff}
  #akv-panel .akv-kejar{border-color:#ca8a04;background:#fefce8}
  #akv-panel .akv-tidak{border-color:#dc2626;background:#fef2f2}
  #akv-panel .akv-tunda{border-color:#ea580c;background:#fff7ed}
  #akv-panel .akv-cek{border-color:#94a3b8;background:#f8fafc}
  #akv-panel .akv-selesai{border-color:#059669;background:#ecfdf5}
  #akv-panel .akv-na{border-color:#cbd5e1;background:#fff;opacity:.75}
  #akv-panel .akv-plan{width:100%;border-collapse:collapse;font-size:12px}
  #akv-panel .akv-plan td,#akv-panel .akv-plan th{border:1px solid #e2e8f0;padding:3px 5px;text-align:left;vertical-align:top}
  #akv-panel ol,#akv-panel section>ul{margin:0 0 0 18px;padding:0}
  `;
