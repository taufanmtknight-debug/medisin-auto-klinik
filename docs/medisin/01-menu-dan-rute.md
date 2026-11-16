# Medisin (app.medisin.id) — menu & rute
App bernama "App Sintasi" (Medisin = rebrand Sintasi). Vue 2 + Quasar v1 + Vuex (modul: auth, master, face, printer, socket, pos, board, kasir, product, farmasi, pelayanan). Router mode history, 446 rute.
localStorage key `sintasi` (vuex-persist: auth, kasir, master), `sintasi_device_id`.
Klinik login: "Klinik Utama @KLINIK TRIAL MEDISIN" (klinik_id 245).
Tab atas (menuTab): Dashboard Umum, Dashboard Dokter, Data Pasien, POLI DOKTER.

## Sidebar (nama → rute)
Dashboard /page/dashboard; Dashboard Umum /admin/dashboard/umum; Dashboard Dokter /admin/dashboard/dokter; ...
MASTER DATA: POLI /admin/master/poli, POLI KLUSTER, DOKTER, PENJAMIN, TARIF /admin/master/tarif, KARYAWAN, OBAT RACIKAN /admin/master/racikan, JENIS PEMBAYARAN, LAB. MEDIS, RAWAT INAP, Radiologi, KAMAR OPERASI, Kode Surat, PAKET MCU, SPIROMETRI, Ruangan Unit
MASTER FARMASI: TAMBAH PRODUK /admin/produk/create, LIST PRODUK /admin/produk/list, KATEGORI, SATUAN, LOKASI, LIST BAHAN /admin/produk/list-bahan, LIST BHP /admin/produk/list-bhp
PENDAFTARAN: Pendaftaran /admin/pelayanan/pendaftaran, Data Pasien /admin/pelayanan/pasien, Jadwal Pasien
PELAYANAN: ANJUNGAN, ANJUNGAN BPJS V2, PANGGILAN ANTREAN, UGD, PERAWAT /admin/klinik/perawat, POLI DOKTER /admin/klinik/antrean/poli, POLI KIA, FARMASI /admin/klinik/farmasi, LABORATORIUM, KUNJUNGAN SEHAT, Hasil Lab, Hasil Surat, Display Antrean, RM LAMA, Rekam Medis /admin/klinik/rekam-medis
Rawat inap/ICU/UGD/PONEK, LIS, RIS, Odontogram, CRM, FARMASI gudang (PO, penerimaan, stock opname, mutasi, ...), KASIR /kasir/pos, PCARE /bpjs/pcare, Keuangan, Laporan (~50), BPJS API (ANTROL, PCARE, ICARE), SATUSEHAT config.
Rute proses pelayanan: /admin/pelayanan/proses-dokter/:tab/:id_kunjungan/:kategori_id?, proses-perawat/..., proses/:tab/:id_kunjungan/:kategori_id?
