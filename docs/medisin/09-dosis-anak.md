# Dosis anak AUTO KLINIK v0.8.4 (untuk dievaluasi dokter)

Dihitung otomatis per mg/kg (permintaan dokter 2026-11-18). 1 bungkus sekali minum.

- v0.8.1 (koreksi dokter): Medisin hanya menerima **jumlah tablet bulat**. Maka jumlah tablet bulat, dan **jumlah bungkus (10–30) menyesuaikan**. Dipilih jumlah bungkus terkecil yang membuat semua bahan dekat target (±15%). Lama hari = bungkus ÷ frekuensi, dibulatkan.
- Dosis di BB terendah tiap rentang **tidak melebihi batas atas**.
- Target per dosis: paracetamol 12,5 mg/kg (10–15), ibuprofen 7,5 (5–10), domperidon 0,2 (maks 0,25), CTM 0,1 (maks 2 mg), dexa 0,015 (maks 0,5 mg), guaifenesin 4 (maks 100 mg), ambroxol 0,5, cetirizin 0,25 mg/kg/hari, ranitidin 1,5, antasida 1/40 tablet/kg (maks 1 tablet).
- Bayi <6 bulan: racikan yang berisi CTM dihitung ulang tanpa CTM (jumlah bungkus bisa berbeda dari tabel).
- BB < 2 kg: tidak ada template (diisi manual).
- Racikan Lambung + Mual dan Antasida mulai 8 kg. Cetirizin, Bapil 2, Lambung + Mual, Mual Muntah (baru) dan Antasida berhenti di 40 kg. Yang lain sampai 50 kg.
- Antibiotik (amoxicillin, cefadroxil puyer/sirup) **tidak diubah**.

## Batas umur
| Obat | Umur minimal | Bila belum cukup umur |
|---|---|---|
| Ibuprofen (puyer) | 6 bulan | tidak bisa dipilih; saran demam → paracetamol |
| CTM | 6 bulan | dibuang dari Racikan ISPA & Bapil 2 ("tanpa CTM") |
| Domperidon (puyer & sirup) | 6 bulan | tidak bisa dipilih |
| Ranitidin (Racikan Lambung + Mual) | 2 tahun | tidak bisa dipilih |
| Antasida (tablet, sirup, puyer, dan di Racikan Lambung) | 4 tahun | tidak bisa dipilih; umur 2–4 th Racikan Lambung = ranitidin saja |
| Guaifenesin, dexametason, ambroxol, cetirizin, paracetamol | tanpa batas umur | — |

Umur yang tidak terbaca dianggap belum cukup umur.

## Antasida sirup (BPJS -- ANTASIDA DOEN SYRUP), 3x sehari sebelum makan, 1 botol
4–<6 th: 2,5 mL · 6–12 th: 5 mL · >12 th: 10 mL.

## Antasida tablet anak (tidak berubah)
4–10 th: ½ tablet 3x sehari · >10 th: 1 tablet 3x sehari.


- v0.8.4: Racikan Bapil Cetirizin (GG-CTZ-DEXA) = guaifenesin + cetirizin + dexa, 3x sehari; cetirizin 0,25 mg/kg/hari dibagi 3 (0,083 mg/kg/dosis, maks 3,3 mg/dosis); mulai BB 4 kg.
- Nama racikan puyer berisi ≥2 obat = singkatan: PCT, IBU, GG (guaifenesin), CTM, DEXA, AMB (ambroxol), CTZ (cetirizin), DOMP, RANI, ANTS (antasida), AMOX, CFD (cefadroxil).


### Racikan ISPA — 3x sehari

| BB | Bungkus | Guaifenesin (tab) | CTM (tab) | Dexa (tab) | Per bungkus |
|---|---|---|---|---|---|
| 2-3 kg | 20 | 2 | 1 | 1 | Guaifenesin 10 mg (3,33–5/kg); CTM 0,2 mg (0,067–0,1/kg); Dexa 0,025 mg (0,008–0,013/kg) |
| >3-4 kg | 27 | 4 | 2 | 3 | Guaifenesin 14,8 mg (3,7–4,94/kg); CTM 0,296 mg (0,074–0,099/kg); Dexa 0,056 mg (0,014–0,019/kg) |
| >4-5 kg | 17 | 3 | 2 | 2 | Guaifenesin 17,6 mg (3,53–4,41/kg); CTM 0,471 mg (0,094–0,12/kg); Dexa 0,059 mg (0,012–0,015/kg) |
| >5-6 kg | 14 | 3 | 2 | 2 | Guaifenesin 21,4 mg (3,57–4,29/kg); CTM 0,571 mg (0,095–0,11/kg); Dexa 0,071 mg (0,012–0,014/kg) |
| >6-7 kg | 12 | 3 | 2 | 2 | Guaifenesin 25 mg (3,57–4,17/kg); CTM 0,667 mg (0,095–0,11/kg); Dexa 0,083 mg (0,012–0,014/kg) |
| >7-8 kg | 10 | 3 | 2 | 2 | Guaifenesin 30 mg (3,75–4,29/kg); CTM 0,8 mg (0,1–0,11/kg); Dexa 0,1 mg (0,013–0,014/kg) |
| >8-9 kg | 11 | 4 | 2 | 3 | Guaifenesin 36,4 mg (4,04–4,55/kg); CTM 0,727 mg (0,081–0,091/kg); Dexa 0,136 mg (0,015–0,017/kg) |
| >9-10 kg | 12 | 5 | 3 | 3 | Guaifenesin 41,7 mg (4,17–4,63/kg); CTM 1 mg (0,1–0,11/kg); Dexa 0,125 mg (0,013–0,014/kg) |
| >10-11 kg | 10 | 4 | 3 | 3 | Guaifenesin 40 mg (3,64–4/kg); CTM 1,2 mg (0,11–0,12/kg); Dexa 0,15 mg (0,014–0,015/kg) |
| >11-12 kg | 10 | 5 | 3 | 3 | Guaifenesin 50 mg (4,17–4,55/kg); CTM 1,2 mg (0,1–0,11/kg); Dexa 0,15 mg (0,012–0,014/kg) |
| >12-14 kg | 10 | 5 | 3 | 4 | Guaifenesin 50 mg (3,57–4,17/kg); CTM 1,2 mg (0,086–0,1/kg); Dexa 0,2 mg (0,014–0,017/kg) |
| >14-16 kg | 10 | 6 | 4 | 4 | Guaifenesin 60 mg (3,75–4,29/kg); CTM 1,6 mg (0,1–0,11/kg); Dexa 0,2 mg (0,013–0,014/kg) |
| >16-18 kg | 10 | 7 | 4 | 5 | Guaifenesin 70 mg (3,89–4,38/kg); CTM 1,6 mg (0,089–0,1/kg); Dexa 0,25 mg (0,014–0,016/kg) |
| >18-20 kg | 10 | 8 | 5 | 6 | Guaifenesin 80 mg (4–4,44/kg); CTM 2 mg (0,1–0,11/kg); Dexa 0,3 mg (0,015–0,017/kg) |
| >20-22 kg | 10 | 8 | 5 | 6 | Guaifenesin 80 mg (3,64–4/kg); CTM 2 mg (0,091–0,1/kg); Dexa 0,3 mg (0,014–0,015/kg) |
| >22-25 kg | 10 | 9 | 5 | 7 | Guaifenesin 90 mg (3,6–4,09/kg); CTM 2 mg (0,08–0,091/kg); Dexa 0,35 mg (0,014–0,016/kg) |
| >25-28 kg | 10 | 10 | 5 | 8 | Guaifenesin 100 mg (3,57–4/kg); CTM 2 mg (0,071–0,08/kg); Dexa 0,4 mg (0,014–0,016/kg) |
| >28-31 kg | 10 | 10 | 5 | 9 | Guaifenesin 100 mg (3,23–3,57/kg); CTM 2 mg (0,065–0,071/kg); Dexa 0,45 mg (0,015–0,016/kg) |
| >31-35 kg | 10 | 10 | 5 | 10 | Guaifenesin 100 mg (2,86–3,23/kg); CTM 2 mg (0,057–0,065/kg); Dexa 0,5 mg (0,014–0,016/kg) |
| >35-40 kg | 10 | 10 | 5 | 10 | Guaifenesin 100 mg (2,5–2,86/kg); CTM 2 mg (0,05–0,057/kg); Dexa 0,5 mg (0,013–0,014/kg) |
| >40-45 kg | 10 | 10 | 5 | 10 | Guaifenesin 100 mg (2,22–2,5/kg); CTM 2 mg (0,044–0,05/kg); Dexa 0,5 mg (0,011–0,013/kg) |
| >45-50 kg | 10 | 10 | 5 | 10 | Guaifenesin 100 mg (2–2,22/kg); CTM 2 mg (0,04–0,044/kg); Dexa 0,5 mg (0,01–0,011/kg) |

### Racikan Demam — 3x sehari

| BB | Bungkus | PCT (tab) | Per bungkus |
|---|---|---|---|
| 2-3 kg | 17 | 1 | PCT 29,4 mg (9,8–14,71/kg) |
| >3-4 kg | 12 | 1 | PCT 41,7 mg (10,42–13,89/kg) |
| >4-5 kg | 10 | 1 | PCT 50 mg (10–12,5/kg) |
| >5-6 kg | 14 | 2 | PCT 71,4 mg (11,9–14,29/kg) |
| >6-7 kg | 12 | 2 | PCT 83,3 mg (11,9–13,89/kg) |
| >7-8 kg | 10 | 2 | PCT 100 mg (12,5–14,29/kg) |
| >8-9 kg | 10 | 2 | PCT 100 mg (11,11–12,5/kg) |
| >9-10 kg | 12 | 3 | PCT 125 mg (12,5–13,89/kg) |
| >10-11 kg | 10 | 3 | PCT 150 mg (13,64–15/kg) |
| >11-12 kg | 10 | 3 | PCT 150 mg (12,5–13,64/kg) |
| >12-14 kg | 10 | 3 | PCT 150 mg (10,71–12,5/kg) |
| >14-16 kg | 10 | 4 | PCT 200 mg (12,5–14,29/kg) |
| >16-18 kg | 10 | 4 | PCT 200 mg (11,11–12,5/kg) |
| >18-20 kg | 10 | 5 | PCT 250 mg (12,5–13,89/kg) |
| >20-22 kg | 10 | 5 | PCT 250 mg (11,36–12,5/kg) |
| >22-25 kg | 10 | 6 | PCT 300 mg (12–13,64/kg) |
| >25-28 kg | 10 | 7 | PCT 350 mg (12,5–14/kg) |
| >28-31 kg | 10 | 7 | PCT 350 mg (11,29–12,5/kg) |
| >31-35 kg | 10 | 8 | PCT 400 mg (11,43–12,9/kg) |
| >35-40 kg | 10 | 9 | PCT 450 mg (11,25–12,86/kg) |
| >40-45 kg | 10 | 10 | PCT 500 mg (11,11–12,5/kg) |
| >45-50 kg | 10 | 10 | PCT 500 mg (10–11,11/kg) |

### Racikan Ibuprofen (≥6 bln) — 3x sehari

| BB | Bungkus | Ibuprofen (tab) | Per bungkus |
|---|---|---|---|
| 2-3 kg | 20 | 1 | Ibuprofen 20 mg (6,67–10/kg) |
| >3-4 kg | 14 | 1 | Ibuprofen 28,6 mg (7,14–9,52/kg) |
| >4-5 kg | 11 | 1 | Ibuprofen 36,4 mg (7,27–9,09/kg) |
| >5-6 kg | 10 | 1 | Ibuprofen 40 mg (6,67–8/kg) |
| >6-7 kg | 15 | 2 | Ibuprofen 53,3 mg (7,62–8,89/kg) |
| >7-8 kg | 13 | 2 | Ibuprofen 61,5 mg (7,69–8,79/kg) |
| >8-9 kg | 11 | 2 | Ibuprofen 72,7 mg (8,08–9,09/kg) |
| >9-10 kg | 10 | 2 | Ibuprofen 80 mg (8–8,89/kg) |
| >10-11 kg | 10 | 2 | Ibuprofen 80 mg (7,27–8/kg) |
| >11-12 kg | 10 | 2 | Ibuprofen 80 mg (6,67–7,27/kg) |
| >12-14 kg | 11 | 3 | Ibuprofen 109,1 mg (7,79–9,09/kg) |
| >14-16 kg | 10 | 3 | Ibuprofen 120 mg (7,5–8,57/kg) |
| >16-18 kg | 10 | 3 | Ibuprofen 120 mg (6,67–7,5/kg) |
| >18-20 kg | 10 | 4 | Ibuprofen 160 mg (8–8,89/kg) |
| >20-22 kg | 10 | 4 | Ibuprofen 160 mg (7,27–8/kg) |
| >22-25 kg | 10 | 4 | Ibuprofen 160 mg (6,4–7,27/kg) |
| >25-28 kg | 10 | 5 | Ibuprofen 200 mg (7,14–8/kg) |
| >28-31 kg | 10 | 6 | Ibuprofen 240 mg (7,74–8,57/kg) |
| >31-35 kg | 10 | 6 | Ibuprofen 240 mg (6,86–7,74/kg) |
| >35-40 kg | 10 | 7 | Ibuprofen 280 mg (7–8/kg) |
| >40-45 kg | 10 | 8 | Ibuprofen 320 mg (7,11–8/kg) |
| >45-50 kg | 10 | 9 | Ibuprofen 360 mg (7,2–8/kg) |

### Racikan Mual Muntah anak (≥6 bln) — 3x sehari

| BB | Bungkus | Domperidon (tab) | Per bungkus |
|---|---|---|---|
| 2-3 kg | 20 | 1 | Domperidon 0,5 mg (0,17–0,25/kg) |
| >3-4 kg | 14 | 1 | Domperidon 0,714 mg (0,18–0,24/kg) |
| >4-5 kg | 10 | 1 | Domperidon 1 mg (0,2–0,25/kg) |
| >5-6 kg | 10 | 1 | Domperidon 1 mg (0,17–0,2/kg) |
| >6-7 kg | 14 | 2 | Domperidon 1,4 mg (0,2–0,24/kg) |
| >7-8 kg | 12 | 2 | Domperidon 1,7 mg (0,21–0,24/kg) |
| >8-9 kg | 11 | 2 | Domperidon 1,8 mg (0,2–0,23/kg) |
| >9-10 kg | 10 | 2 | Domperidon 2 mg (0,2–0,22/kg) |
| >10-11 kg | 10 | 2 | Domperidon 2 mg (0,18–0,2/kg) |
| >11-12 kg | 10 | 2 | Domperidon 2 mg (0,17–0,18/kg) |
| >12-14 kg | 11 | 3 | Domperidon 2,7 mg (0,19–0,23/kg) |
| >14-16 kg | 10 | 3 | Domperidon 3 mg (0,19–0,21/kg) |
| >16-18 kg | 10 | 3 | Domperidon 3 mg (0,17–0,19/kg) |
| >18-20 kg | 10 | 4 | Domperidon 4 mg (0,2–0,22/kg) |
| >20-22 kg | 10 | 4 | Domperidon 4 mg (0,18–0,2/kg) |
| >22-25 kg | 10 | 5 | Domperidon 5 mg (0,2–0,23/kg) |
| >25-28 kg | 10 | 5 | Domperidon 5 mg (0,18–0,2/kg) |
| >28-31 kg | 10 | 6 | Domperidon 6 mg (0,19–0,21/kg) |
| >31-35 kg | 10 | 7 | Domperidon 7 mg (0,2–0,23/kg) |
| >35-40 kg | 10 | 7 | Domperidon 7 mg (0,18–0,2/kg) |
| >40-45 kg | 10 | 8 | Domperidon 8 mg (0,18–0,2/kg) |
| >45-50 kg | 10 | 9 | Domperidon 9 mg (0,18–0,2/kg) |

### Racikan Lambung + Mual (≥2 th; antasida ≥4 th) — 2x sehari

| BB | Bungkus | Antasida (tab) | Ranitidin (tab) | Per bungkus |
|---|---|---|---|---|
| 8-9 kg | 11 | 2 | 1 | Antasida 0,18 tab (0,02–0,023/kg); Ranitidin 13,6 mg (1,52–1,7/kg) |
| >9-10 kg | 12 | 3 | 1 | Antasida 0,25 tab (0,025–0,028/kg); Ranitidin 12,5 mg (1,25–1,39/kg) |
| >10-11 kg | 10 | 3 | 1 | Antasida 0,3 tab (0,027–0,03/kg); Ranitidin 15 mg (1,36–1,5/kg) |
| >11-12 kg | 10 | 3 | 1 | Antasida 0,3 tab (0,025–0,027/kg); Ranitidin 15 mg (1,25–1,36/kg) |
| >12-14 kg | 14 | 5 | 2 | Antasida 0,36 tab (0,026–0,03/kg); Ranitidin 21,4 mg (1,53–1,79/kg) |
| >14-16 kg | 12 | 4 | 2 | Antasida 0,33 tab (0,021–0,024/kg); Ranitidin 25 mg (1,56–1,79/kg) |
| >16-18 kg | 11 | 5 | 2 | Antasida 0,45 tab (0,025–0,028/kg); Ranitidin 27,3 mg (1,52–1,7/kg) |
| >18-20 kg | 10 | 5 | 2 | Antasida 0,5 tab (0,025–0,028/kg); Ranitidin 30 mg (1,5–1,67/kg) |
| >20-22 kg | 10 | 5 | 2 | Antasida 0,5 tab (0,023–0,025/kg); Ranitidin 30 mg (1,36–1,5/kg) |
| >22-25 kg | 10 | 6 | 2 | Antasida 0,6 tab (0,024–0,027/kg); Ranitidin 30 mg (1,2–1,36/kg) |
| >25-28 kg | 10 | 7 | 3 | Antasida 0,7 tab (0,025–0,028/kg); Ranitidin 45 mg (1,61–1,8/kg) |
| >28-31 kg | 10 | 7 | 3 | Antasida 0,7 tab (0,023–0,025/kg); Ranitidin 45 mg (1,45–1,61/kg) |
| >31-35 kg | 10 | 8 | 3 | Antasida 0,8 tab (0,023–0,026/kg); Ranitidin 45 mg (1,29–1,45/kg) |
| >35-40 kg | 10 | 9 | 4 | Antasida 0,9 tab (0,023–0,026/kg); Ranitidin 60 mg (1,5–1,71/kg) |

### Racikan Mual Muntah baru (≥6 bln) — 3x sehari

| BB | Bungkus | Domperidon (tab) | Per bungkus |
|---|---|---|---|
| 2-3 kg | 20 | 1 | Domperidon 0,5 mg (0,17–0,25/kg) |
| >3-4 kg | 14 | 1 | Domperidon 0,714 mg (0,18–0,24/kg) |
| >4-5 kg | 10 | 1 | Domperidon 1 mg (0,2–0,25/kg) |
| >5-6 kg | 10 | 1 | Domperidon 1 mg (0,17–0,2/kg) |
| >6-7 kg | 14 | 2 | Domperidon 1,4 mg (0,2–0,24/kg) |
| >7-8 kg | 12 | 2 | Domperidon 1,7 mg (0,21–0,24/kg) |
| >8-9 kg | 11 | 2 | Domperidon 1,8 mg (0,2–0,23/kg) |
| >9-10 kg | 10 | 2 | Domperidon 2 mg (0,2–0,22/kg) |
| >10-11 kg | 10 | 2 | Domperidon 2 mg (0,18–0,2/kg) |
| >11-12 kg | 10 | 2 | Domperidon 2 mg (0,17–0,18/kg) |
| >12-14 kg | 11 | 3 | Domperidon 2,7 mg (0,19–0,23/kg) |
| >14-16 kg | 10 | 3 | Domperidon 3 mg (0,19–0,21/kg) |
| >16-18 kg | 10 | 3 | Domperidon 3 mg (0,17–0,19/kg) |
| >18-20 kg | 10 | 4 | Domperidon 4 mg (0,2–0,22/kg) |
| >20-22 kg | 10 | 4 | Domperidon 4 mg (0,18–0,2/kg) |
| >22-25 kg | 10 | 5 | Domperidon 5 mg (0,2–0,23/kg) |
| >25-28 kg | 10 | 5 | Domperidon 5 mg (0,18–0,2/kg) |
| >28-31 kg | 10 | 6 | Domperidon 6 mg (0,19–0,21/kg) |
| >31-35 kg | 10 | 7 | Domperidon 7 mg (0,2–0,23/kg) |
| >35-40 kg | 10 | 7 | Domperidon 7 mg (0,18–0,2/kg) |

### Racikan Cetirizin — 1x sehari

| BB | Bungkus | Cetirizin (tab) | Per bungkus |
|---|---|---|---|
| 2-3 kg | 17 | 1 | Cetirizin 0,588 mg (0,2–0,29/kg) |
| >3-4 kg | 12 | 1 | Cetirizin 0,833 mg (0,21–0,28/kg) |
| >4-5 kg | 10 | 1 | Cetirizin 1 mg (0,2–0,25/kg) |
| >5-6 kg | 14 | 2 | Cetirizin 1,4 mg (0,24–0,29/kg) |
| >6-7 kg | 12 | 2 | Cetirizin 1,7 mg (0,24–0,28/kg) |
| >7-8 kg | 10 | 2 | Cetirizin 2 mg (0,25–0,29/kg) |
| >8-9 kg | 10 | 2 | Cetirizin 2 mg (0,22–0,25/kg) |
| >9-10 kg | 12 | 3 | Cetirizin 2,5 mg (0,25–0,28/kg) |
| >10-11 kg | 10 | 3 | Cetirizin 3 mg (0,27–0,3/kg) |
| >11-12 kg | 10 | 3 | Cetirizin 3 mg (0,25–0,27/kg) |
| >12-14 kg | 10 | 3 | Cetirizin 3 mg (0,21–0,25/kg) |
| >14-16 kg | 10 | 4 | Cetirizin 4 mg (0,25–0,29/kg) |
| >16-18 kg | 10 | 4 | Cetirizin 4 mg (0,22–0,25/kg) |
| >18-20 kg | 10 | 5 | Cetirizin 5 mg (0,25–0,28/kg) |
| >20-22 kg | 10 | 5 | Cetirizin 5 mg (0,23–0,25/kg) |
| >22-25 kg | 10 | 6 | Cetirizin 6 mg (0,24–0,27/kg) |
| >25-28 kg | 10 | 7 | Cetirizin 7 mg (0,25–0,28/kg) |
| >28-31 kg | 10 | 7 | Cetirizin 7 mg (0,23–0,25/kg) |
| >31-35 kg | 10 | 8 | Cetirizin 8 mg (0,23–0,26/kg) |
| >35-40 kg | 10 | 9 | Cetirizin 9 mg (0,23–0,26/kg) |

### Racikan Bapil 2 — 3x sehari

| BB | Bungkus | Dexa (tab) | CTM (tab) | Ambroxol (tab) | Per bungkus |
|---|---|---|---|---|---|
| 2-3 kg | 25 | 2 | 1 | 1 | Dexa 0,04 mg (0,013–0,02/kg); CTM 0,16 mg (0,053–0,08/kg); Ambroxol 1,2 mg (0,4–0,6/kg) |
| >3-4 kg | 23 | 2 | 2 | 1 | Dexa 0,043 mg (0,011–0,014/kg); CTM 0,348 mg (0,087–0,12/kg); Ambroxol 1,3 mg (0,33–0,43/kg) |
| >4-5 kg | 25 | 3 | 3 | 2 | Dexa 0,06 mg (0,012–0,015/kg); CTM 0,48 mg (0,096–0,12/kg); Ambroxol 2,4 mg (0,48–0,6/kg) |
| >5-6 kg | 20 | 3 | 3 | 2 | Dexa 0,075 mg (0,012–0,015/kg); CTM 0,6 mg (0,1–0,12/kg); Ambroxol 3 mg (0,5–0,6/kg) |
| >6-7 kg | 17 | 3 | 3 | 2 | Dexa 0,088 mg (0,013–0,015/kg); CTM 0,706 mg (0,1–0,12/kg); Ambroxol 3,5 mg (0,5–0,59/kg) |
| >7-8 kg | 15 | 3 | 3 | 2 | Dexa 0,1 mg (0,013–0,014/kg); CTM 0,8 mg (0,1–0,11/kg); Ambroxol 4 mg (0,5–0,57/kg) |
| >8-9 kg | 13 | 3 | 3 | 2 | Dexa 0,115 mg (0,013–0,014/kg); CTM 0,923 mg (0,1–0,12/kg); Ambroxol 4,6 mg (0,51–0,58/kg) |
| >9-10 kg | 12 | 3 | 3 | 2 | Dexa 0,125 mg (0,013–0,014/kg); CTM 1 mg (0,1–0,11/kg); Ambroxol 5 mg (0,5–0,56/kg) |
| >10-11 kg | 10 | 3 | 3 | 2 | Dexa 0,15 mg (0,014–0,015/kg); CTM 1,2 mg (0,11–0,12/kg); Ambroxol 6 mg (0,55–0,6/kg) |
| >11-12 kg | 10 | 3 | 3 | 2 | Dexa 0,15 mg (0,012–0,014/kg); CTM 1,2 mg (0,1–0,11/kg); Ambroxol 6 mg (0,5–0,55/kg) |
| >12-14 kg | 10 | 4 | 3 | 2 | Dexa 0,2 mg (0,014–0,017/kg); CTM 1,2 mg (0,086–0,1/kg); Ambroxol 6 mg (0,43–0,5/kg) |
| >14-16 kg | 11 | 5 | 4 | 3 | Dexa 0,227 mg (0,014–0,016/kg); CTM 1,5 mg (0,091–0,1/kg); Ambroxol 8,2 mg (0,51–0,58/kg) |
| >16-18 kg | 10 | 5 | 4 | 3 | Dexa 0,25 mg (0,014–0,016/kg); CTM 1,6 mg (0,089–0,1/kg); Ambroxol 9 mg (0,5–0,56/kg) |
| >18-20 kg | 10 | 6 | 5 | 3 | Dexa 0,3 mg (0,015–0,017/kg); CTM 2 mg (0,1–0,11/kg); Ambroxol 9 mg (0,45–0,5/kg) |
| >20-22 kg | 10 | 6 | 5 | 3 | Dexa 0,3 mg (0,014–0,015/kg); CTM 2 mg (0,091–0,1/kg); Ambroxol 9 mg (0,41–0,45/kg) |
| >22-25 kg | 10 | 7 | 5 | 4 | Dexa 0,35 mg (0,014–0,016/kg); CTM 2 mg (0,08–0,091/kg); Ambroxol 12 mg (0,48–0,55/kg) |
| >25-28 kg | 10 | 8 | 5 | 4 | Dexa 0,4 mg (0,014–0,016/kg); CTM 2 mg (0,071–0,08/kg); Ambroxol 12 mg (0,43–0,48/kg) |
| >28-31 kg | 10 | 9 | 5 | 5 | Dexa 0,45 mg (0,015–0,016/kg); CTM 2 mg (0,065–0,071/kg); Ambroxol 15 mg (0,48–0,54/kg) |
| >31-35 kg | 10 | 10 | 5 | 5 | Dexa 0,5 mg (0,014–0,016/kg); CTM 2 mg (0,057–0,065/kg); Ambroxol 15 mg (0,43–0,48/kg) |
| >35-40 kg | 10 | 10 | 5 | 6 | Dexa 0,5 mg (0,013–0,014/kg); CTM 2 mg (0,05–0,057/kg); Ambroxol 18 mg (0,45–0,51/kg) |

### BAPIL CETIRIZIN — 3x sehari

| BB | Bungkus | Guaifenesin (tab) | Cetirizin (tab) | Dexa (tab) | Per bungkus |
|---|---|---|---|---|---|
| 4-5 kg | 25 | 4 | 1 | 3 | Guaifenesin 16 mg (3,2–4/kg); Cetirizin 0,4 mg (0,08–0,1/kg); Dexa 0,06 mg (0,012–0,015/kg) |
| >5-6 kg | 20 | 4 | 1 | 3 | Guaifenesin 20 mg (3,33–4/kg); Cetirizin 0,5 mg (0,083–0,1/kg); Dexa 0,075 mg (0,012–0,015/kg) |
| >6-7 kg | 17 | 4 | 1 | 3 | Guaifenesin 23,5 mg (3,36–3,92/kg); Cetirizin 0,588 mg (0,084–0,098/kg); Dexa 0,088 mg (0,013–0,015/kg) |
| >7-8 kg | 15 | 4 | 1 | 3 | Guaifenesin 26,7 mg (3,33–3,81/kg); Cetirizin 0,667 mg (0,083–0,095/kg); Dexa 0,1 mg (0,013–0,014/kg) |
| >8-9 kg | 13 | 4 | 1 | 3 | Guaifenesin 30,8 mg (3,42–3,85/kg); Cetirizin 0,769 mg (0,085–0,096/kg); Dexa 0,115 mg (0,013–0,014/kg) |
| >9-10 kg | 12 | 5 | 1 | 3 | Guaifenesin 41,7 mg (4,17–4,63/kg); Cetirizin 0,833 mg (0,083–0,093/kg); Dexa 0,125 mg (0,013–0,014/kg) |
| >10-11 kg | 10 | 4 | 1 | 3 | Guaifenesin 40 mg (3,64–4/kg); Cetirizin 1 mg (0,091–0,1/kg); Dexa 0,15 mg (0,014–0,015/kg) |
| >11-12 kg | 10 | 5 | 1 | 3 | Guaifenesin 50 mg (4,17–4,55/kg); Cetirizin 1 mg (0,083–0,091/kg); Dexa 0,15 mg (0,012–0,014/kg) |
| >12-14 kg | 10 | 5 | 1 | 4 | Guaifenesin 50 mg (3,57–4,17/kg); Cetirizin 1 mg (0,071–0,083/kg); Dexa 0,2 mg (0,014–0,017/kg) |
| >14-16 kg | 15 | 9 | 2 | 7 | Guaifenesin 60 mg (3,75–4,29/kg); Cetirizin 1,3 mg (0,083–0,095/kg); Dexa 0,233 mg (0,015–0,017/kg) |
| >16-18 kg | 13 | 9 | 2 | 7 | Guaifenesin 69,2 mg (3,85–4,33/kg); Cetirizin 1,5 mg (0,085–0,096/kg); Dexa 0,269 mg (0,015–0,017/kg) |
| >18-20 kg | 12 | 9 | 2 | 7 | Guaifenesin 75 mg (3,75–4,17/kg); Cetirizin 1,7 mg (0,083–0,093/kg); Dexa 0,292 mg (0,015–0,016/kg) |
| >20-22 kg | 10 | 8 | 2 | 6 | Guaifenesin 80 mg (3,64–4/kg); Cetirizin 2 mg (0,091–0,1/kg); Dexa 0,3 mg (0,014–0,015/kg) |
| >22-25 kg | 10 | 9 | 2 | 7 | Guaifenesin 90 mg (3,6–4,09/kg); Cetirizin 2 mg (0,08–0,091/kg); Dexa 0,35 mg (0,014–0,016/kg) |
| >25-28 kg | 10 | 10 | 2 | 8 | Guaifenesin 100 mg (3,57–4/kg); Cetirizin 2 mg (0,071–0,08/kg); Dexa 0,4 mg (0,014–0,016/kg) |
| >28-31 kg | 11 | 11 | 3 | 10 | Guaifenesin 100 mg (3,23–3,57/kg); Cetirizin 2,7 mg (0,088–0,097/kg); Dexa 0,455 mg (0,015–0,016/kg) |
| >31-35 kg | 10 | 10 | 3 | 10 | Guaifenesin 100 mg (2,86–3,23/kg); Cetirizin 3 mg (0,086–0,097/kg); Dexa 0,5 mg (0,014–0,016/kg) |
| >35-40 kg | 10 | 10 | 3 | 10 | Guaifenesin 100 mg (2,5–2,86/kg); Cetirizin 3 mg (0,075–0,086/kg); Dexa 0,5 mg (0,013–0,014/kg) |

### Racikan Antasida (≥4 th) — 3x sehari

| BB | Bungkus | Antasida (tab) | Per bungkus |
|---|---|---|---|
| 8-9 kg | 10 | 2 | Antasida 0,2 tab (0,022–0,025/kg) |
| >9-10 kg | 12 | 3 | Antasida 0,25 tab (0,025–0,028/kg) |
| >10-11 kg | 10 | 3 | Antasida 0,3 tab (0,027–0,03/kg) |
| >11-12 kg | 10 | 3 | Antasida 0,3 tab (0,025–0,027/kg) |
| >12-14 kg | 10 | 3 | Antasida 0,3 tab (0,021–0,025/kg) |
| >14-16 kg | 10 | 4 | Antasida 0,4 tab (0,025–0,029/kg) |
| >16-18 kg | 10 | 4 | Antasida 0,4 tab (0,022–0,025/kg) |
| >18-20 kg | 10 | 5 | Antasida 0,5 tab (0,025–0,028/kg) |
| >20-22 kg | 10 | 5 | Antasida 0,5 tab (0,023–0,025/kg) |
| >22-25 kg | 10 | 6 | Antasida 0,6 tab (0,024–0,027/kg) |
| >25-28 kg | 10 | 7 | Antasida 0,7 tab (0,025–0,028/kg) |
| >28-31 kg | 10 | 7 | Antasida 0,7 tab (0,023–0,025/kg) |
| >31-35 kg | 10 | 8 | Antasida 0,8 tab (0,023–0,026/kg) |
| >35-40 kg | 10 | 9 | Antasida 0,9 tab (0,023–0,026/kg) |

### Domperidon sirup 5 mg/5 mL (≥6 bln) — 3x sehari

| BB | mL sekali minum | Per kg |
|---|---|---|
| 2-3 kg | 0,5 mL | 0,17–0,25 mg/kg |
| >3-4 kg | 0,5 mL | 0,13–0,17 mg/kg |
| >4-5 kg | 1 mL | 0,2–0,25 mg/kg |
| >5-6 kg | 1 mL | 0,17–0,2 mg/kg |
| >6-7 kg | 1,5 mL | 0,21–0,25 mg/kg |
| >7-8 kg | 1,5 mL | 0,19–0,21 mg/kg |
| >8-9 kg | 1,5 mL | 0,17–0,19 mg/kg |
| >9-10 kg | 2 mL | 0,2–0,22 mg/kg |
| >10-11 kg | 2 mL | 0,18–0,2 mg/kg |
| >11-12 kg | 2,5 mL | 0,21–0,23 mg/kg |
| >12-14 kg | 2,5 mL | 0,18–0,21 mg/kg |
| >14-16 kg | 3 mL | 0,19–0,21 mg/kg |
| >16-18 kg | 3,5 mL | 0,19–0,22 mg/kg |
| >18-20 kg | 4 mL | 0,2–0,22 mg/kg |
| >20-22 kg | 4 mL | 0,18–0,2 mg/kg |
| >22-25 kg | 4,5 mL | 0,18–0,2 mg/kg |
| >25-28 kg | 5,5 mL | 0,2–0,22 mg/kg |
| >28-31 kg | 6 mL | 0,19–0,21 mg/kg |
| >31-35 kg | 6,5 mL | 0,19–0,21 mg/kg |
| >35-40 kg | 7,5 mL | 0,19–0,21 mg/kg |
| >40-45 kg | 8,5 mL | 0,19–0,21 mg/kg |
| >45-50 kg | 9,5 mL | 0,19–0,21 mg/kg |

