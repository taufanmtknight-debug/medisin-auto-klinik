// Medisin (app.medisin.id) — helper untuk menjelajah & menguji dari DevTools / javascript_tool.
// Tempel di Console halaman app.medisin.id. Hanya membaca, kecuali fungsi yang namanya diawali "prefill".
// Tidak pernah menekan SIMPAN / SUBMIT / SUBMIT SATUSEHAT / SUBMIT BPJS.

(function () {
  const root = () => document.querySelector('#q-app').__vue__.$root;
  const store = () => root().$store;

  // Semua komponen Vue 2 di halaman (pohon $children dari root).
  const allVm = () => {
    const out = [];
    const walk = (v) => { out.push(v); v.$children.forEach(walk); };
    walk(root());
    return out;
  };
  const vmName = (v) => v.$options.name || v.$options._componentTag || 'anon';
  const findVm = (name) => allVm().find((v) => vmName(v) === name);

  // Peta label → v-model (Vue 2 menyimpan ekspresi v-model di vnode.data.model.expression).
  const fields = (vm) => {
    const out = [];
    const walk = (v) => v.$children.forEach((ch) => {
      const n = ch.$options.name || '';
      if (/^Q(Input|Select|Checkbox|Radio|Toggle|OptionGroup|BtnToggle)$/.test(n)) {
        const md = ch.$vnode && ch.$vnode.data && ch.$vnode.data.model;
        out.push({ type: n, label: ch.$props.label || ch.$props.placeholder || '', model: md ? md.expression : null, visible: ch.$el.offsetParent !== null });
      }
      walk(ch);
    });
    walk(vm);
    return out;
  };

  // Pasien/kunjungan aktif di halaman proses (Vuex pelayanan.pasien).
  const pasien = () => store().state.pelayanan.pasien;
  const urlKunjunganId = () => {
    const m = location.pathname.match(/\/admin\/pelayanan\/proses(?:-dokter)?\/[^/]+\/([^/]+)/);
    return m ? atob(m[1]) : null;
  };

  // Tunggu sampai store sudah memuat kunjungan yang sama dengan URL (hindari data pasien sebelumnya).
  const waitPasienReady = async (timeoutMs = 20000, needComps = ['Resep', 'Diagnosa']) => {
    const t0 = Date.now();
    for (;;) {
      const p = pasien();
      if (p && p.id_kunjungan === urlKunjunganId() && needComps.every((c) => findVm(c))) return p;
      if (Date.now() - t0 > timeoutMs) throw new Error('Data pasien belum siap');
      await new Promise((r) => setTimeout(r, 200));
    }
  };

  // ---- Prefill (tanpa simpan) ----
  const klinik = () => (findVm('Resep') || allVm().find((v) => v.$klinik)).$klinik;

  async function cariObat(teks) {
    const rs = findVm('Resep');
    const p = pasien();
    const r = await rs.$klinik.get('master/product', { params: { filter: teks, penjamin: p.penjamin_nm, poli_id: p.antrian_poli_id } });
    return r.data.data.filter((a) => a.produk_detail.length).map((a) => {
      const d = a.produk_detail.filter((x) => x.is_storage === 0);
      const tot = d.reduce((s, x) => s + (x.stock_system || 0), 0);
      return { label: `${a.produk_nm} (${d.length ? tot : 'No stock available'})`, value: a, produk_id: a.produk_id, produk_detail: d, totalStockSystem: tot, hasValidDetails: d.length > 0 };
    }).filter((o) => o.hasValidDetails);
  }

  // items: [{nama:'AMBROXOL 30 MG', jumlah:10, signa:'3 x 1'}] — nama dicocokkan UTUH (bukan sebagian).
  async function prefillResep(items) {
    const rs = findVm('Resep');
    const semuaOpsi = [];
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const opsi = await cariObat(it.nama);
      const pilih = opsi.find((o) => o.value.produk_nm.trim().toUpperCase() === it.nama.trim().toUpperCase());
      if (!pilih) throw new Error(`Obat tidak ditemukan persis: ${it.nama}`);
      semuaOpsi.push(...opsi);
      rs.obat_opt = semuaOpsi; // wajib agar label tampil & loadBatchDetails menemukan produk
      if (i > 0 && rs.input_resep.length <= i) rs.addColom();
      const row = rs.input_resep[i];
      row.val = pilih.value;
      rs.loadBatchDetails(row);
      row.jumlah = it.jumlah;
      row.signa = it.signa;
    }
  }

  // kodes: ['J06.9','I10']
  async function prefillDiagnosa(kodes) {
    const dg = findVm('Diagnosa');
    const ax = root().$axios; // base old-ci.medisin.id
    for (let i = 0; i < kodes.length; i++) {
      const r = await ax.get('lib/load/icdx', { params: { q: kodes[i] } });
      const opt = r.data.find((x) => x.icd_kode === kodes[i]);
      if (!opt) throw new Error(`ICD tidak ditemukan: ${kodes[i]}`);
      dg.icdx_opt = r.data;
      if (i > 0 && dg.input_icdx.length <= i) dg.addColom();
      const row = dg.input_icdx[i];
      row.val = opt;
      dg.setIcdx(opt, row);
      row.tacc = '-1';
    }
  }

  // Isi anamnesa/TTV ke store (reaktif). Hanya kolom kosong bila keepExisting.
  function prefillAnamnesa(data, { keepExisting = true } = {}) {
    const p = pasien();
    Object.entries(data).forEach(([k, v]) => {
      if (keepExisting && p[k] !== null && p[k] !== '' && p[k] !== undefined && Number(p[k]) !== 0) return;
      p[k] = v;
    });
    const bb = Number(p.berat_badan), tb = Number(p.tinggi_badan);
    if (bb > 0 && tb > 0) p.imt = (bb / Math.pow(tb / 100, 2)).toFixed(2); // IMT tidak dihitung otomatis bila diisi lewat store
  }

  window.MedisinDev = { root, store, allVm, vmName, findVm, fields, pasien, urlKunjunganId, waitPasienReady, klinik, cariObat, prefillResep, prefillDiagnosa, prefillAnamnesa };
  console.log('MedisinDev siap:', Object.keys(window.MedisinDev).join(', '));
})();
