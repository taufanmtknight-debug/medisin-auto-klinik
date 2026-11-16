# Halaman Pelayanan (proses) — tab ANAMNESA (komponen `Anamnesa`)
Semua form terikat ke Vuex `$store.state.pelayanan.pasien` (objek kunjungan). Ubah via store = langsung tampil (reaktif). Disimpan oleh tombol SIMPAN/SIMPAN SEMUA → emit saveData → PUT master/kunjungan/{id} {pasien}.
Sub-komponen: RencanaKeperawatan, InputAnamnesa, RiwayatAlergi, Diagnosa, ICD9, JenisPrognosa, RencanaLanjutan, ResikoJatuh, PengkajianNyeri, PemeriksaanFisik, BookingAntrian, SpechToTextDiagnose.
Tombol: SIMPAN (per bagian), DIAGNOSA TAMBAHAN, TAMBAH TINDAKAN, SIMPAN RENCANA LANJUTAN, SUBMIT BPJS, SUBMIT SATUSEHAT, SIMPAN SEMUA.

| Label | v-model |
|---|---|
| Asuhan Keperawatan (select, 149 opsi, optVal key/optLbl value) | pasien.rk_diagnosa |
| Luaran Intervensi / Rencana Tindakan / Keluhan Keperawatan / Telah diobati | pasien.luaran_intervensi / rk_rencana / keluhan_keperawatan / telah_diobati_sebelumnya |
| Keluhan Utama (textarea) | pasien.keluhan |
| Anamnesa (textarea) | pasien.keluhan_lainya |
| Obat dibawa / sering dikonsumsi | formPernyataan.obat_dibawa_pasien / obat_sering_dikonsumsi_pasien |
| Riwayat penyakit dahulu / sekarang / keluarga | pasien.riwayat_penyakit_dahulu / riwayat_penyakit_sekarang / riwayat_penyakit_keluarga |
| BMHP | pasien.bmhp_bpjs |
| Terapi Obat BPJS | pasien.terapi |
| Terapi Non Obat | pasien.terapinonobat |
| Kajian sosial (KS/KPS) | pasien.kajian_sosial |
| Tinggi/Berat Badan, IMT(disabled, dihitung) | pasien.tinggi_badan, berat_badan, imt |
| Saturasi, Sistolik, Diastolik, Respirasi, Suhu, Nadi, Detak Jantung, Lingkar Perut | pasien.saturasi, sistole, diastole, respirasi, suhu, nadi, heart_rate, lingkar_perut |
| GDS, Kolesterol, Asam Urat | pasien.gds, kolesterol, asam_urat |
| Alergi makanan/udara/obat (kdAlergi/nmAlergi, "00"=Tidak Ada) | pasien.alergiMakan_bpjs / alergiUdara_bpjs / alergiObat_bpjs |
| Alergi obat & catatan / Riwayat penggunaan obat | pasien.ra_obat / ra_pengunaan_obat |
| Diagnosa Utama (select useInput, cari ICD10) | i.val (array diagnosa, lihat Diagnosa) ; Kasus i.kasus ; Klarifikasi i.klarifikasi ; TACC i.tacc (kdTacc: -1 Tanpa TACC, Time, Age, Complication, ...) ; Alasan i.tacc_reason |
| Tindakan ICD9 (select useInput) | i.id_icd9 |
| Jenis Prognosa (kdPrognosa: Sanam/Bonam/Malam/Dubia ad sanam/...) | pasien.jenis_prognosa ; Catatan pasien.jenis_prognosa_note |
| Edukasi / Rencana lanjutan | pasien.rl_edukasi / rl_rencana_lanjutan |
| Hasil pemeriksaan | pasien.hasil_pemeriksaan |
| Komposisi Diet / Ket. Rencana Lanjutan / Tgl kembali | pasien.komposisi_diet / keterangan_rencana_lanjutan / rl_tgl_kembali |
| Resiko jatuh, Nyeri | detail_resiko_jatuh.*, detail_dewasa.*, detail_nyeri.* (endpoint kunjungan-keperawatan/{id}/data_resiko_jatuh, data_pengkajian_nyeri) |
| Pemeriksaan fisik (tersembunyi/tertutup default) | pasien.warna_rambut, konjungtiva_mata, sklera_mata, gendang_telinga_tht, serumen_tht, bentuk_hidung, septum_hidung, konka_hidung, kanan_tonsil, kiri_tonsil, faring_tonsil, bunyi_jantung, bunyi_1_jantung, murmur_jantung, gallop_jantung, bunyi_paru, wheazing_paru, rhonki_paru, bising_usus_abdomen, masa_abdomen, nyeri_tekan_abdomen, pitting_edema_ekstremitas, akral_ekstremitas, status_lokalis, pf_* |
| Booking kunjungan | form.rl_dokter_id (select dokter), tglWaktuKembali |
Teknik: label→key ditemukan lewat `child.$vnode.data.model.expression` (Vue 2).
Data saat dibuka: GET master/kunjungan/diagnosa/{id}, master/kunjungan/terapinonobat, master/dokter/getdokter-filter, jadwal-pasien/getjadwal-kunjungan.
