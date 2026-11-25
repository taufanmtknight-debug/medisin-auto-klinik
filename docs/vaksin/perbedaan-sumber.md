# CEK VAKSIN — perbedaan sumber yang perlu keputusan dokter

Tanggal: 2026-11-25. Sampai dokter memutuskan, alat memakai nilai **paling ketat** (kolom "Dipakai sekarang").
Mengubah keputusan = mengubah satu nilai di `vaksin/vaksin-rules.js` (ganti status menjadi "terverifikasi" + catat keputusan dokter).

| # | Aturan | IDAI 2023 | Kepmenkes 1098/2024 | CDC/ACIP 2025 / label | Dipakai sekarang |
|---|---|---|---|---|---|
| 1 | Rotarix: usia maksimal dosis 1 | 6–12 minggu (hal. 74) | – | CDC: 14 minggu 6 hari; EMA SmPC: tidak ada batas dosis 1, seri selesai ≤24 minggu | **12 minggu 0 hari (84 hari)** |
| 2 | RotaTeq: usia maksimal dosis 1 | 6–12 minggu (hal. 74) | – | CDC: 14 minggu 6 hari; label RotaTeq belum terbaca (unduhan gagal) | **12 minggu 0 hari** |
| 3 | RotaTeq: dosis terakhir | ≤32 minggu | – | CDC: ≤8 bulan 0 hari | **32 minggu 0 hari** |
| 4 | RV program: batas seri | dosis terakhir usia 6 bulan (hal. 67) | kejar: sampai sebelum usia 7 bulan (hal. 13) | – | **sebelum 6 bulan**; dosis 1 hanya bila 3 dosis bisa selesai sebelum itu |
| 5 | RV program: produk & usia minimal dosis 1 | teks: ORV116E; catatan tabel: RV1 (Rotarix) sejak 2022 | jadwal 2, 3, 4 bulan; usia minimal tidak tertulis | – | **mulai 2 bulan** |
| 6 | BCG usia ≥12 bulan | boleh bila tuberkulin negatif (tidak ada batas atas bayi) | kejar paling lambat 11 bulan (<1 tahun) | – | **PERLU CEK** (tidak diberi BOLEH) |
| 7 | Uji tuberkulin: batas negatif (mm) & masa berlaku hasil | tidak disebut | tidak disebut | – | dokter memilih negatif/positif; ⚠️ |
| 8 | IPV dosis 1 usia minimal | jadwal 4 bulan | jadwal 4 bulan | 6 minggu | **4 bulan** (heksavalen sebelum 4 bulan tidak dihitung sebagai IPV) |
| 9 | IPV interval dosis 1→2 | 4 & 9 bulan | kejar 4 bulan | 4 minggu | **4 bulan** |
| 10 | DTP-HB-Hib dosis 3→booster | balita: 1 tahun setelah dosis 3 | 12 bulan (hal. 12) | 6 bulan | **12 bulan** (dan usia ≥18 bulan) |
| 11 | MR dosis 2 usia minimal | 15–18 bulan | 18 bulan | MMR2 13 bulan | **18 bulan** |
| 12 | MR interval antar dosis | – | 6 bulan (kejar) | 4 minggu | **6 bulan** |
| 13 | MR dosis 3 | 5–7 tahun | BIAS 7 tahun (kelas 1) | – | **7 tahun** |
| 14 | JE usia minimal | 9 bulan | 10 bulan | – | **10 bulan** |
| 15 | JE booster | 1–2 tahun kemudian (endemis) | 1 dosis | – | **booster 1 tahun kemudian** ⚠️ |
| 16 | Varisela interval (1–12 th) | 6 minggu–3 bulan | – | 3 bulan | **3 bulan** |
| 17 | PCV mulai 7–12 bulan: jarak dosis 1→2 | ≥1 bulan | 4 minggu | 4 minggu | **1 bulan** |
| 18 | PCV booster jarak dari dosis sebelumnya | 2 bulan | 8 minggu | 8 minggu | **2 bulan** |
| 19 | PCV mulai 12–24 bulan: jarak | 2 bulan | 8 minggu | 8 minggu | **2 bulan** |
| 20 | PCV mulai >24 bulan | PCV10 2 dosis; PCV13 1 dosis | 1 dosis | – | merek tidak dipilih: **2 dosis**; PCV15 hanya bila dipilih (tidak disebut IDAI/KMK) |
| 21 | PCV bayi <7 bulan: 2+1 atau 3+1 | 3+1 (2, 4, 6, 12–15) | 2+1 (2, 3, 12) | – | otomatis: hanya vaksin program tersedia → 2+1; selain itu **3+1** |
| 22 | Masa toleransi (grace period) | – | – | 4 hari | **0 hari** (permintaan dokter) |
| 23 | Polio booster 18 bulan | tidak ada di IDAI 2023 (hanya ringkasan sekunder IDAI 2024) | tidak ada | – | **tidak dijadwalkan** ⚠️ |
| 24 | Demam saja tanpa sakit sedang–berat | – | – | bukan alasan tunda (hanya sakit sedang–berat) | **tunda semua** (permintaan dokter) ⚠️ |
| 25 | "HB0 program sampai 7 hari" | <24 jam; 7 hari itu untuk HBIg | <24 jam | – | **<24 jam** (usia 1 hari = cek jam lahir) |
| 26 | Rute JE | SC | IM | – | tampil keduanya ⚠️ |
| 27 | Pembagian lokasi suntik (paha kiri/kanan, lengan) | boleh sama (jarak 2,5 cm) atau berbeda | – | – | saran alat saja ⚠️ |

## Kasus uji dokter yang hasilnya berbeda dari harapan

- **Kasus 2 (14 minggu 6 hari):** harapan "Rotarix 🟢, RotaTeq 🔴". Tidak ada satu sumber pun yang memberi hasil itu: dengan IDAI (12 minggu) keduanya 🔴; dengan CDC (14 minggu 6 hari) keduanya 🟢. Alat sekarang: keduanya 🔴 (paling ketat). Tes juga membuktikan bila dokter memilih batas CDC, Rotarix menjadi 🟢.
- **Kasus 1 (4,5 bulan):** DTP1, polio1, PCV1 tampil 🟡 TERLAMBAT, KEJAR (bukan 🟢) karena jadwalnya sudah lewat; tetap diberikan hari ini. IPV1 🟢 (jadwal 4 bulan). Rotavirus: Rotarix & RotaTeq 🔴; RV program 🔴 karena 3 dosis tidak bisa selesai sebelum 6 bulan (nilai #4).
