# Pendaftaran pasien & kunjungan
## Pasien baru — /admin/pelayanan/pendaftaran (komponen anonim, form `form`)
Field (v-model): form.no_rm (No. Rekam Medik*, otomatis dari GET master/pasien/no_rm), users_desc (No RM lama), nik, satusehat_id, full_name*, nama_kk, tempat_lahir, tgl_lahir*, jeniskelamin, status_kawin, gol_darah, pekerjaan, pendidikan_terakhir, agama, no_hp, no_asuransi (No BPJS), email, alamat*, namaprop, namadati2, namakec, kode_wilayah (kelurahan), indikator_pasien, sumber_informasi, is_prolanis, ttd.
Simpan: POST klinik `master/pasien/create` form → lalu simpan TTD, PUT rest2 auth/user/{id} {ttd}, opsional POST master/satusehat/pasien & master/pasien/image. Cari BPJS: findPesertaBpjs (NIK 16 digit / No kartu).
## Data Pasien — /admin/pelayanan/pasien
- Daftar: GET klinik `master/pasien?page&filter&sortBy&descending&rowsPerPage&tgl_awal&tgl_akhir` (~400 ms).
- Tombol per baris: edit, send (DirectAntrian = daftarkan ke antrean), science (lab), print, video_label, brush, delete. Atas: PASIEN BARU, IMPORT, MERGE RM, UPLOAD HISTORY RM.
- DirectAntrian (dialog kirim ke antrean): form {prioritas, indikator_pasien, jenis_penyakit_menular, poli(obj), poli_id, dokter_id, penjamin_id (WAJIB), jam_layanan, satusehat_integrasi, pcare_integrasi, kode_provider, kode_tkp:'10', kunjungan_sakit:true, poli_bpjs, dokter_bpjs, is_lab, is_radiologi, poli_kluster}.
  Simpan: POST klinik `master/kunjungan` {is_direct:true, kode_rujuk_internal, status_antrian (201 poli; 601 bila poli LABORATORIUM; 701 bila poli gigi; 301/902/502 bila diberi), poli_id, dokter_id, penjamin_id, user_id, users_id, satusehat_integrasi, pcare_integrasi, poli_kluster, prioritas, indikator_pasien, jenis_penyakit_menular} → {data:{no_antrian,sisa_antrian}, antrian, kunjungan}.
  Bila pcare_integrasi: POST rest2 bpjs/pcare/pendaftaran (KIRIM BPJS); gagal → antrian status 101.
  Error berisi "skrining" → perlu skrining kesehatan dulu (isNeedSkrining).
- Catatan: old-ci `auth/users` (dipanggil tiap pindah halaman) kadang lambat (sampai 5,3 dtk).
