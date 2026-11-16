# Tab DOKTER (rute /admin/pelayanan/proses/dokter/<b64 id>) — halaman utama untuk auto klinik
Komponen di tab ini: InputAnamnesa, RiwayatAlergi, PemeriksaanFisik, JenisPrognosa, Tindakan, ICD9, Diagnosa, RencanaLanjutan, Resep, Racikan, PrintObatPenjualan, PrintResepPenjualan, BookingAntrian, SpechToTextDiagnose. (Semua satu halaman, scroll.)
Saat dibuka memuat: ref/signa (1078 signa), ref/racikan_kat (18.460 baris! ~600 ms), master/product-location, karyawan/asisten, racikan-kunjungan/get/{id}, master/kunjungan (3x, 0,7–1,5 dtk).

## Diagnosa (ICD-10) — komponen `Diagnosa`
- data.input_icdx = [{no, val:<objek opsi ICD>, tacc:'-1', kasus:<en>, tacc_name, tacc_reason, klarifikasi}]
- Cari ICD: non-BPJS → GET old-ci `lib/load/icdx?q=` (≥2 huruf; cari pakai KODE mis. "J06" → J06.0/J06.9/J06; kata Indonesia seperti "ispa" TIDAK cocok, hasil acak). Opsi: {icd_kode, en, ind, label:"J06.9 - Acute upper...", value:"J06.9", non_spesialis,...}. Panggilan pertama ~1,1 dtk (dingin), berikutnya ~100 ms.
  BPJS (pasien.pcare_integrasi_sts==1) → GET rest2 `bpjs/pcare/diagnosa?search=` (di klinik trial: 500 setelah 10 dtk).
- setIcdx(opt,row): kasus=opt.en, reset tacc. setTacc: TACC 1 Time/2 Age memunculkan dialog radio alasan; 3 Complication alasan = "KODE - en".
- SIMPAN diagnosa: POST klinik `master/kunjungan/diagnosa` {icdx:[baris yang val-nya terisi], id_kunjungan} → langsung tersimpan di server (terpisah dari SIMPAN SEMUA). Hapus: DELETE master/kunjungan/diagnosa/{id_icdx_kunjungan} (dialog konfirmasi). Daftar: GET master/kunjungan/diagnosa/{id}.

## Resep — komponen `Resep` (props pasien, hideBpjs)
- data.input_resep = [{no, val:<opsi obat>, batch:<produk_detail_id>, batches:[], jumlah:1, diskon_resep:0, signa:""}]; addColom() menambah baris. Keterangan resep: pasien.keterangan_resep.
- Cari obat: GET klinik `master/product?filter=<teks≥2>&penjamin=<pasien.penjamin_nm>&kategori_type&poli_id=<pasien.antrian_poli_id>` (~220 ms). Opsi hanya produk dengan produk_detail is_storage==0 (stok apotek/ruang, bukan gudang) → label "NAMA (stok total)". Contoh nama di trial: "PARACETAMOL 500 MG MERSI", "ALPARA TAB", "PARATUSIN TAB".
- Pilih obat → loadBatchDetails(row): isi batches (label "batch - expired (stok) - lokasi", value produk_detail_id) dan pilih batch pertama yang stoknya >0. setBatch(row) → row.val.detail.
- Signa: QSelect useInput, option-value/label = "nama", emit-value; daftar ref/signa 1078 item bebas (mis. "3 x 1"?) — teks bebas lewat input-value.
- SIMPAN resep: POST `master/kunjungan/resep` {id_kunjungan, resep: input_resep} → lalu socket newDisplayObat/reloadProduk. Pelindung dobel klik: limit (>1 klik → "Terlalu banyak menekan tombol simpan").
- Daftar resep tersimpan: POST `master/kunjungan/get-resep` {id_kunjungan}. Hapus: DELETE master/kunjungan/resep/{id_resep_kunjungan}.
- BHP (di Resep): input_bhp [{produk_id:<opsi>, qty, produk_detail_id}] → per item POST `master/kunjungan/tarif-bhp/{id_kunjungan}` {produk_id, qty, produk_detail_id}.
- Lain: RIWAYAT RESEP, FORM TELAAH OBAT, PRINT VIEW/E-TIKET, PANGGIL (suara).

## Racikan — komponen `Racikan`
- Tombol TAMBAH RACIKAN (modal_add) dan TAMBAH RACIKAN DARI MASTER RACIKAN (modal_add_template).
- form: {id_kunjungan, id_ref_racikan_kat, id_tbl_resep_kunjungan, metode ('DOSIS'|'N SATUAN'), racikan_nama, racikan_jenis (kertas_puyer|plastik_puyer|kapsul|botol_sirup|pot_salep|tube_salep|botol_tetes|sachet), racikan_qty, racikan_signa, data:{}}
- input_racikan baris: {no, val:<opsi obat>, batch, batches, jumlah, diskon_resep, signa}
- Cari obat racikan: GET master/product?filter&where_not_in&penjamin.
- Simpan (onSubmitAdd): 1) POST `master/kunjungan/racikan` {...form, id_kunjungan, racikan:input_racikan} → data_resep; 2) POST `racikan-kunjungan/add/{id_kunjungan}` {id_kunjungan, id_ref_racikan_kat, metode, data, data_resep, racikan_signa, racikan_nama, racikan_jenis, racikan_qty}. Jika signa racikan pertama diubah muncul dialog "Pengubahan Signa Racikan".
- Dari master: POST `racikan-obat/store` {racikan_id, qty, signa, nqty, id_kunjungan}. Master racikan dikelola di /admin/master/racikan (cocok untuk paket racikan anak per BB).
- racikan_kat (kategori/nama racikan) 18.460 entri — kemungkinan tiap racikan tersimpan menambah kategori.

## Tindakan — komponen `Tindakan`
- input_tindakan [{no, val:<opsi tarif>, harga_tindakan, jumlah_tindakan:1, diskon_tindakan:0, asisten_tindakan, keterangan_tindakan}]
- Cari tarif: POST `master/tarif/get-data-tarif` {search, tarif_active:true, id_kunjungan} (~130 ms). Opsi: tarif_nm, tarif_id, tarif_harga, poli_id, tarif_bhp...
- SIMPAN: POST `master/kunjungan/tindakan` {tindakan, id_kunjungan}.
- BPJS: rest2 bpjs/pcare/tindakan?search&kode_tkp; simpan rest2 POST bpjs/pcare/kunjungan/tindakan/{noKunjungan_pcare} (KIRIM BPJS).

## Farmasi & Kasir (ringkas)
- FARMASI (/admin/klinik/farmasi, komponen ListFarmasiRJ, sub-tab RAWAT JALAN/UGD/RAWAT INAP): GET master/antrian status [401,402]. PELAYANAN → PUT master/antrian/{id} {first_open, status_antrian:402, kunjungan, trs_id} (uji: **21,6 dtk**) → /admin/pelayanan/proses/Resep/<b64> (tab "Resep" tidak ada di konfigurasi tab POLI UMUM trial, jadi isi tab kosong). Tombol status obat: POST status-obat/update-status {antrian_id}. Halaman ini juga memanggil rest2 bpjs/pcare/pendaftaran/null?date → 500 setelah 10 dtk (trial tanpa PCare).
- KASIR (/kasir/pos): tab LIST TRANSAKSI, LIST CART PEMBAYARAN, LIST TAGIHAN PIUTANG, Input DP, Daftar DP. API: GET finance/kasir?filter&mindate&maxdate&page&rowsPerPage&pelayanan, master/shift, finance/cash-register/register-details, master/kunjungan/get-kategori. Komponen Cart (doCheckout), ListTransaksi, DownPaymentDialog. Pasien masuk kasir lewat tombol PROSES KASIR (status 502, ada dialog validasi anamnesa/CPPT). Tidak diuji sampai pembayaran.
- Master racikan (/admin/master/racikan): POST old-ci `admin/master/racikan` → [{racikan_id, racikan_nm, racikan_kode, obat:[{racikan_obat_id, produk_detail_id, jumlah_obat,…}]}]. Trial berisi 7 (RACIKAN PANA, Panas Balita, vitamin…).

## Prefill lewat program (sudah dicoba, tanpa simpan)
- Resep: ambil produk (GET master/product), bentuk opsi seperti `loadObat` ({label:"NAMA (stok)", value:produk, produk_id, produk_detail:<is_storage 0>, totalStockSystem, hasValidDetails}), set `Resep.obat_opt = opsi` (WAJIB, agar label tampil), lalu `row.val = opsi.value; Resep.loadBatchDetails(row); row.jumlah = 10; row.signa = '3 x 1'` → UI tampil "AMBROXOL 30 MG (91)", batch otomatis, jumlah, signa. Baris berikut: `Resep.addColom()`.
- Diagnosa: GET old-ci lib/load/icdx?q=I10 → `Diagnosa.icdx_opt = data; row.val = opt; Diagnosa.setIcdx(opt,row); row.tacc='-1'` → kasus terisi. Baris tambahan: `Diagnosa.addColom()`.
- Dokter tetap menekan SIMPAN per bagian (Diagnosa, Resep, Racikan, Tindakan) lalu SUBMIT untuk anamnesa/TTV.
