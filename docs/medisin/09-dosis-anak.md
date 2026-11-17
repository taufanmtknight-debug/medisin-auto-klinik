# Dosis anak AUTO KLINIK v0.8.7 (untuk dievaluasi dokter)

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

- v0.8.5: Racikan AMB-CTZ-DEXA = ambroxol + cetirizin + dexa, 3x sehari, cetirizin sama seperti GG-CTZ-DEXA; mulai BB 4 kg. Urutan singkatan: pengencer dahak (GG/AMB), antihistamin (CTM/CTZ), lalu DEXA.

- v0.8.7 (koreksi dokter): **GG, ambroxol, dexa = dosis minimal per kg**, patokan BB 10 kg = 2 tablet dalam 12 bungkus (GG ~1,7 mg/kg, ambroxol 0,5 mg/kg, dexa ~0,008 mg/kg per minum). Tablet bulat dari BB atas rentang, minimal 1; bila 1 tablet masih >1,5x dosis minimal, bungkus diperbanyak (maks 30).



### Racikan ISPA — 3x sehari

| BB | Bungkus | Guaifenesin (tab) | CTM (tab) | Dexa (tab) | Per bungkus |
|---|---|---|---|---|---|
| 2-3 kg | 20 | 1 | 1 | 1 | Guaifenesin 5 mg (1,67–2,5/kg); CTM 0,2 mg (0,067–0,1/kg); Dexa 0,025 mg (0,008–0,013/kg) |
| >3-4 kg | 27 | 2 | 2 | 2 | Guaifenesin 7,4 mg (1,85–2,47/kg); CTM 0,296 mg (0,074–0,099/kg); Dexa 0,037 mg (0,009–0,012/kg) |
| >4-5 kg | 10 | 1 | 1 | 1 | Guaifenesin 10 mg (2–2,5/kg); CTM 0,4 mg (0,08–0,1/kg); Dexa 0,05 mg (0,01–0,013/kg) |
| >5-6 kg | 14 | 1 | 2 | 1 | Guaifenesin 7,1 mg (1,19–1,43/kg); CTM 0,571 mg (0,095–0,11/kg); Dexa 0,036 mg (0,006–0,007/kg) |
| >6-7 kg | 12 | 1 | 2 | 1 | Guaifenesin 8,3 mg (1,19–1,39/kg); CTM 0,667 mg (0,095–0,11/kg); Dexa 0,042 mg (0,006–0,007/kg) |
| >7-8 kg | 10 | 1 | 2 | 1 | Guaifenesin 10 mg (1,25–1,43/kg); CTM 0,8 mg (0,1–0,11/kg); Dexa 0,05 mg (0,006–0,007/kg) |
| >8-9 kg | 10 | 2 | 2 | 2 | Guaifenesin 20 mg (2,22–2,5/kg); CTM 0,8 mg (0,089–0,1/kg); Dexa 0,1 mg (0,011–0,013/kg) |
| >9-10 kg | 12 | 2 | 3 | 2 | Guaifenesin 16,7 mg (1,67–1,85/kg); CTM 1 mg (0,1–0,11/kg); Dexa 0,083 mg (0,008–0,009/kg) |
| >10-11 kg | 10 | 2 | 3 | 2 | Guaifenesin 20 mg (1,82–2/kg); CTM 1,2 mg (0,11–0,12/kg); Dexa 0,1 mg (0,009–0,01/kg) |
| >11-12 kg | 10 | 2 | 3 | 2 | Guaifenesin 20 mg (1,67–1,82/kg); CTM 1,2 mg (0,1–0,11/kg); Dexa 0,1 mg (0,008–0,009/kg) |
| >12-13 kg | 10 | 2 | 3 | 2 | Guaifenesin 20 mg (1,54–1,67/kg); CTM 1,2 mg (0,092–0,1/kg); Dexa 0,1 mg (0,008–0,008/kg) |
| >13-14 kg | 10 | 2 | 3 | 2 | Guaifenesin 20 mg (1,43–1,54/kg); CTM 1,2 mg (0,086–0,092/kg); Dexa 0,1 mg (0,007–0,008/kg) |
| >14-15 kg | 10 | 3 | 4 | 3 | Guaifenesin 30 mg (2–2,14/kg); CTM 1,6 mg (0,11–0,11/kg); Dexa 0,15 mg (0,01–0,011/kg) |
| >15-16 kg | 10 | 3 | 4 | 3 | Guaifenesin 30 mg (1,88–2/kg); CTM 1,6 mg (0,1–0,11/kg); Dexa 0,15 mg (0,009–0,01/kg) |
| >16-18 kg | 10 | 3 | 4 | 3 | Guaifenesin 30 mg (1,67–1,88/kg); CTM 1,6 mg (0,089–0,1/kg); Dexa 0,15 mg (0,008–0,009/kg) |
| >18-20 kg | 10 | 3 | 5 | 3 | Guaifenesin 30 mg (1,5–1,67/kg); CTM 2 mg (0,1–0,11/kg); Dexa 0,15 mg (0,008–0,008/kg) |
| >20-22 kg | 10 | 4 | 5 | 4 | Guaifenesin 40 mg (1,82–2/kg); CTM 2 mg (0,091–0,1/kg); Dexa 0,2 mg (0,009–0,01/kg) |
| >22-25 kg | 10 | 4 | 5 | 4 | Guaifenesin 40 mg (1,6–1,82/kg); CTM 2 mg (0,08–0,091/kg); Dexa 0,2 mg (0,008–0,009/kg) |
| >25-28 kg | 10 | 5 | 5 | 5 | Guaifenesin 50 mg (1,79–2/kg); CTM 2 mg (0,071–0,08/kg); Dexa 0,25 mg (0,009–0,01/kg) |
| >28-30 kg | 10 | 5 | 5 | 5 | Guaifenesin 50 mg (1,67–1,79/kg); CTM 2 mg (0,067–0,071/kg); Dexa 0,25 mg (0,008–0,009/kg) |
| >30-32 kg | 10 | 5 | 5 | 5 | Guaifenesin 50 mg (1,56–1,67/kg); CTM 2 mg (0,063–0,067/kg); Dexa 0,25 mg (0,008–0,008/kg) |
| >32-35 kg | 10 | 6 | 5 | 6 | Guaifenesin 60 mg (1,71–1,88/kg); CTM 2 mg (0,057–0,063/kg); Dexa 0,3 mg (0,009–0,009/kg) |
| >35-38 kg | 10 | 6 | 5 | 6 | Guaifenesin 60 mg (1,58–1,71/kg); CTM 2 mg (0,053–0,057/kg); Dexa 0,3 mg (0,008–0,009/kg) |
| >38-40 kg | 10 | 7 | 5 | 7 | Guaifenesin 70 mg (1,75–1,84/kg); CTM 2 mg (0,05–0,053/kg); Dexa 0,35 mg (0,009–0,009/kg) |
| >40-45 kg | 10 | 8 | 5 | 8 | Guaifenesin 80 mg (1,78–2/kg); CTM 2 mg (0,044–0,05/kg); Dexa 0,4 mg (0,009–0,01/kg) |
| >45-50 kg | 10 | 8 | 5 | 8 | Guaifenesin 80 mg (1,6–1,78/kg); CTM 2 mg (0,04–0,044/kg); Dexa 0,4 mg (0,008–0,009/kg) |

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
| >12-13 kg | 10 | 3 | PCT 150 mg (11,54–12,5/kg) |
| >13-14 kg | 10 | 3 | PCT 150 mg (10,71–11,54/kg) |
| >14-15 kg | 10 | 4 | PCT 200 mg (13,33–14,29/kg) |
| >15-16 kg | 10 | 4 | PCT 200 mg (12,5–13,33/kg) |
| >16-18 kg | 10 | 4 | PCT 200 mg (11,11–12,5/kg) |
| >18-20 kg | 10 | 5 | PCT 250 mg (12,5–13,89/kg) |
| >20-22 kg | 10 | 5 | PCT 250 mg (11,36–12,5/kg) |
| >22-25 kg | 10 | 6 | PCT 300 mg (12–13,64/kg) |
| >25-28 kg | 10 | 7 | PCT 350 mg (12,5–14/kg) |
| >28-30 kg | 10 | 7 | PCT 350 mg (11,67–12,5/kg) |
| >30-32 kg | 10 | 8 | PCT 400 mg (12,5–13,33/kg) |
| >32-35 kg | 10 | 8 | PCT 400 mg (11,43–12,5/kg) |
| >35-38 kg | 10 | 9 | PCT 450 mg (11,84–12,86/kg) |
| >38-40 kg | 10 | 10 | PCT 500 mg (12,5–13,16/kg) |
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
| >12-13 kg | 10 | 2 | Ibuprofen 80 mg (6,15–6,67/kg) |
| >13-14 kg | 11 | 3 | Ibuprofen 109,1 mg (7,79–8,39/kg) |
| >14-15 kg | 10 | 3 | Ibuprofen 120 mg (8–8,57/kg) |
| >15-16 kg | 10 | 3 | Ibuprofen 120 mg (7,5–8/kg) |
| >16-18 kg | 10 | 3 | Ibuprofen 120 mg (6,67–7,5/kg) |
| >18-20 kg | 10 | 4 | Ibuprofen 160 mg (8–8,89/kg) |
| >20-22 kg | 10 | 4 | Ibuprofen 160 mg (7,27–8/kg) |
| >22-25 kg | 10 | 4 | Ibuprofen 160 mg (6,4–7,27/kg) |
| >25-28 kg | 10 | 5 | Ibuprofen 200 mg (7,14–8/kg) |
| >28-30 kg | 10 | 5 | Ibuprofen 200 mg (6,67–7,14/kg) |
| >30-32 kg | 10 | 6 | Ibuprofen 240 mg (7,5–8/kg) |
| >32-35 kg | 10 | 6 | Ibuprofen 240 mg (6,86–7,5/kg) |
| >35-38 kg | 10 | 7 | Ibuprofen 280 mg (7,37–8/kg) |
| >38-40 kg | 10 | 7 | Ibuprofen 280 mg (7–7,37/kg) |
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
| >12-13 kg | 11 | 3 | Domperidon 2,7 mg (0,21–0,23/kg) |
| >13-14 kg | 10 | 3 | Domperidon 3 mg (0,21–0,23/kg) |
| >14-15 kg | 10 | 3 | Domperidon 3 mg (0,2–0,21/kg) |
| >15-16 kg | 10 | 3 | Domperidon 3 mg (0,19–0,2/kg) |
| >16-18 kg | 10 | 3 | Domperidon 3 mg (0,17–0,19/kg) |
| >18-20 kg | 10 | 4 | Domperidon 4 mg (0,2–0,22/kg) |
| >20-22 kg | 10 | 4 | Domperidon 4 mg (0,18–0,2/kg) |
| >22-25 kg | 10 | 5 | Domperidon 5 mg (0,2–0,23/kg) |
| >25-28 kg | 10 | 5 | Domperidon 5 mg (0,18–0,2/kg) |
| >28-30 kg | 10 | 6 | Domperidon 6 mg (0,2–0,21/kg) |
| >30-32 kg | 10 | 6 | Domperidon 6 mg (0,19–0,2/kg) |
| >32-35 kg | 10 | 7 | Domperidon 7 mg (0,2–0,22/kg) |
| >35-38 kg | 10 | 7 | Domperidon 7 mg (0,18–0,2/kg) |
| >38-40 kg | 10 | 8 | Domperidon 8 mg (0,2–0,21/kg) |
| >40-45 kg | 10 | 8 | Domperidon 8 mg (0,18–0,2/kg) |
| >45-50 kg | 10 | 9 | Domperidon 9 mg (0,18–0,2/kg) |

### Racikan Lambung + Mual (≥2 th; antasida ≥4 th) — 2x sehari

| BB | Bungkus | Antasida (tab) | Ranitidin (tab) | Per bungkus |
|---|---|---|---|---|
| 8-9 kg | 11 | 2 | 1 | Antasida 0,18 tab (0,02–0,023/kg); Ranitidin 13,6 mg (1,52–1,7/kg) |
| >9-10 kg | 12 | 3 | 1 | Antasida 0,25 tab (0,025–0,028/kg); Ranitidin 12,5 mg (1,25–1,39/kg) |
| >10-11 kg | 10 | 3 | 1 | Antasida 0,3 tab (0,027–0,03/kg); Ranitidin 15 mg (1,36–1,5/kg) |
| >11-12 kg | 10 | 3 | 1 | Antasida 0,3 tab (0,025–0,027/kg); Ranitidin 15 mg (1,25–1,36/kg) |
| >12-13 kg | 14 | 4 | 2 | Antasida 0,29 tab (0,022–0,024/kg); Ranitidin 21,4 mg (1,65–1,79/kg) |
| >13-14 kg | 13 | 4 | 2 | Antasida 0,31 tab (0,022–0,024/kg); Ranitidin 23,1 mg (1,65–1,78/kg) |
| >14-15 kg | 13 | 5 | 2 | Antasida 0,38 tab (0,026–0,027/kg); Ranitidin 23,1 mg (1,54–1,65/kg) |
| >15-16 kg | 12 | 5 | 2 | Antasida 0,42 tab (0,026–0,028/kg); Ranitidin 25 mg (1,56–1,67/kg) |
| >16-18 kg | 11 | 5 | 2 | Antasida 0,45 tab (0,025–0,028/kg); Ranitidin 27,3 mg (1,52–1,7/kg) |
| >18-20 kg | 10 | 5 | 2 | Antasida 0,5 tab (0,025–0,028/kg); Ranitidin 30 mg (1,5–1,67/kg) |
| >20-22 kg | 10 | 5 | 2 | Antasida 0,5 tab (0,023–0,025/kg); Ranitidin 30 mg (1,36–1,5/kg) |
| >22-25 kg | 10 | 6 | 2 | Antasida 0,6 tab (0,024–0,027/kg); Ranitidin 30 mg (1,2–1,36/kg) |
| >25-28 kg | 10 | 7 | 3 | Antasida 0,7 tab (0,025–0,028/kg); Ranitidin 45 mg (1,61–1,8/kg) |
| >28-30 kg | 10 | 7 | 3 | Antasida 0,7 tab (0,023–0,025/kg); Ranitidin 45 mg (1,5–1,61/kg) |
| >30-32 kg | 10 | 8 | 3 | Antasida 0,8 tab (0,025–0,027/kg); Ranitidin 45 mg (1,41–1,5/kg) |
| >32-35 kg | 10 | 8 | 3 | Antasida 0,8 tab (0,023–0,025/kg); Ranitidin 45 mg (1,29–1,41/kg) |
| >35-38 kg | 10 | 9 | 4 | Antasida 0,9 tab (0,024–0,026/kg); Ranitidin 60 mg (1,58–1,71/kg) |
| >38-40 kg | 10 | 10 | 4 | Antasida 1 tab (0,025–0,026/kg); Ranitidin 60 mg (1,5–1,58/kg) |

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
| >12-13 kg | 11 | 3 | Domperidon 2,7 mg (0,21–0,23/kg) |
| >13-14 kg | 10 | 3 | Domperidon 3 mg (0,21–0,23/kg) |
| >14-15 kg | 10 | 3 | Domperidon 3 mg (0,2–0,21/kg) |
| >15-16 kg | 10 | 3 | Domperidon 3 mg (0,19–0,2/kg) |
| >16-18 kg | 10 | 3 | Domperidon 3 mg (0,17–0,19/kg) |
| >18-20 kg | 10 | 4 | Domperidon 4 mg (0,2–0,22/kg) |
| >20-22 kg | 10 | 4 | Domperidon 4 mg (0,18–0,2/kg) |
| >22-25 kg | 10 | 5 | Domperidon 5 mg (0,2–0,23/kg) |
| >25-28 kg | 10 | 5 | Domperidon 5 mg (0,18–0,2/kg) |
| >28-30 kg | 10 | 6 | Domperidon 6 mg (0,2–0,21/kg) |
| >30-32 kg | 10 | 6 | Domperidon 6 mg (0,19–0,2/kg) |
| >32-35 kg | 10 | 7 | Domperidon 7 mg (0,2–0,22/kg) |
| >35-38 kg | 10 | 7 | Domperidon 7 mg (0,18–0,2/kg) |
| >38-40 kg | 10 | 8 | Domperidon 8 mg (0,2–0,21/kg) |

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
| >12-13 kg | 10 | 3 | Cetirizin 3 mg (0,23–0,25/kg) |
| >13-14 kg | 10 | 3 | Cetirizin 3 mg (0,21–0,23/kg) |
| >14-15 kg | 10 | 4 | Cetirizin 4 mg (0,27–0,29/kg) |
| >15-16 kg | 10 | 4 | Cetirizin 4 mg (0,25–0,27/kg) |
| >16-18 kg | 10 | 4 | Cetirizin 4 mg (0,22–0,25/kg) |
| >18-20 kg | 10 | 5 | Cetirizin 5 mg (0,25–0,28/kg) |
| >20-22 kg | 10 | 5 | Cetirizin 5 mg (0,23–0,25/kg) |
| >22-25 kg | 10 | 6 | Cetirizin 6 mg (0,24–0,27/kg) |
| >25-28 kg | 10 | 7 | Cetirizin 7 mg (0,25–0,28/kg) |
| >28-30 kg | 10 | 7 | Cetirizin 7 mg (0,23–0,25/kg) |
| >30-32 kg | 10 | 8 | Cetirizin 8 mg (0,25–0,27/kg) |
| >32-35 kg | 10 | 8 | Cetirizin 8 mg (0,23–0,25/kg) |
| >35-38 kg | 10 | 9 | Cetirizin 9 mg (0,24–0,26/kg) |
| >38-40 kg | 10 | 10 | Cetirizin 10 mg (0,25–0,26/kg) |

### Racikan Bapil 2 — 3x sehari

| BB | Bungkus | Dexa (tab) | CTM (tab) | Ambroxol (tab) | Per bungkus |
|---|---|---|---|---|---|
| 2-3 kg | 20 | 1 | 1 | 1 | Dexa 0,025 mg (0,008–0,013/kg); CTM 0,2 mg (0,067–0,1/kg); Ambroxol 1,5 mg (0,5–0,75/kg) |
| >3-4 kg | 27 | 2 | 2 | 2 | Dexa 0,037 mg (0,009–0,012/kg); CTM 0,296 mg (0,074–0,099/kg); Ambroxol 2,2 mg (0,56–0,74/kg) |
| >4-5 kg | 10 | 1 | 1 | 1 | Dexa 0,05 mg (0,01–0,013/kg); CTM 0,4 mg (0,08–0,1/kg); Ambroxol 3 mg (0,6–0,75/kg) |
| >5-6 kg | 14 | 1 | 2 | 1 | Dexa 0,036 mg (0,006–0,007/kg); CTM 0,571 mg (0,095–0,11/kg); Ambroxol 2,1 mg (0,36–0,43/kg) |
| >6-7 kg | 12 | 1 | 2 | 1 | Dexa 0,042 mg (0,006–0,007/kg); CTM 0,667 mg (0,095–0,11/kg); Ambroxol 2,5 mg (0,36–0,42/kg) |
| >7-8 kg | 10 | 1 | 2 | 1 | Dexa 0,05 mg (0,006–0,007/kg); CTM 0,8 mg (0,1–0,11/kg); Ambroxol 3 mg (0,38–0,43/kg) |
| >8-9 kg | 10 | 2 | 2 | 2 | Dexa 0,1 mg (0,011–0,013/kg); CTM 0,8 mg (0,089–0,1/kg); Ambroxol 6 mg (0,67–0,75/kg) |
| >9-10 kg | 12 | 2 | 3 | 2 | Dexa 0,083 mg (0,008–0,009/kg); CTM 1 mg (0,1–0,11/kg); Ambroxol 5 mg (0,5–0,56/kg) |
| >10-11 kg | 10 | 2 | 3 | 2 | Dexa 0,1 mg (0,009–0,01/kg); CTM 1,2 mg (0,11–0,12/kg); Ambroxol 6 mg (0,55–0,6/kg) |
| >11-12 kg | 10 | 2 | 3 | 2 | Dexa 0,1 mg (0,008–0,009/kg); CTM 1,2 mg (0,1–0,11/kg); Ambroxol 6 mg (0,5–0,55/kg) |
| >12-13 kg | 10 | 2 | 3 | 2 | Dexa 0,1 mg (0,008–0,008/kg); CTM 1,2 mg (0,092–0,1/kg); Ambroxol 6 mg (0,46–0,5/kg) |
| >13-14 kg | 10 | 2 | 3 | 2 | Dexa 0,1 mg (0,007–0,008/kg); CTM 1,2 mg (0,086–0,092/kg); Ambroxol 6 mg (0,43–0,46/kg) |
| >14-15 kg | 10 | 3 | 4 | 3 | Dexa 0,15 mg (0,01–0,011/kg); CTM 1,6 mg (0,11–0,11/kg); Ambroxol 9 mg (0,6–0,64/kg) |
| >15-16 kg | 10 | 3 | 4 | 3 | Dexa 0,15 mg (0,009–0,01/kg); CTM 1,6 mg (0,1–0,11/kg); Ambroxol 9 mg (0,56–0,6/kg) |
| >16-18 kg | 10 | 3 | 4 | 3 | Dexa 0,15 mg (0,008–0,009/kg); CTM 1,6 mg (0,089–0,1/kg); Ambroxol 9 mg (0,5–0,56/kg) |
| >18-20 kg | 10 | 3 | 5 | 3 | Dexa 0,15 mg (0,008–0,008/kg); CTM 2 mg (0,1–0,11/kg); Ambroxol 9 mg (0,45–0,5/kg) |
| >20-22 kg | 10 | 4 | 5 | 4 | Dexa 0,2 mg (0,009–0,01/kg); CTM 2 mg (0,091–0,1/kg); Ambroxol 12 mg (0,55–0,6/kg) |
| >22-25 kg | 10 | 4 | 5 | 4 | Dexa 0,2 mg (0,008–0,009/kg); CTM 2 mg (0,08–0,091/kg); Ambroxol 12 mg (0,48–0,55/kg) |
| >25-28 kg | 10 | 5 | 5 | 5 | Dexa 0,25 mg (0,009–0,01/kg); CTM 2 mg (0,071–0,08/kg); Ambroxol 15 mg (0,54–0,6/kg) |
| >28-30 kg | 10 | 5 | 5 | 5 | Dexa 0,25 mg (0,008–0,009/kg); CTM 2 mg (0,067–0,071/kg); Ambroxol 15 mg (0,5–0,54/kg) |
| >30-32 kg | 10 | 5 | 5 | 5 | Dexa 0,25 mg (0,008–0,008/kg); CTM 2 mg (0,063–0,067/kg); Ambroxol 15 mg (0,47–0,5/kg) |
| >32-35 kg | 10 | 6 | 5 | 6 | Dexa 0,3 mg (0,009–0,009/kg); CTM 2 mg (0,057–0,063/kg); Ambroxol 18 mg (0,51–0,56/kg) |
| >35-38 kg | 10 | 6 | 5 | 6 | Dexa 0,3 mg (0,008–0,009/kg); CTM 2 mg (0,053–0,057/kg); Ambroxol 18 mg (0,47–0,51/kg) |
| >38-40 kg | 10 | 7 | 5 | 7 | Dexa 0,35 mg (0,009–0,009/kg); CTM 2 mg (0,05–0,053/kg); Ambroxol 21 mg (0,53–0,55/kg) |

### BAPIL CETIRIZIN — 3x sehari

| BB | Bungkus | Guaifenesin (tab) | Cetirizin (tab) | Dexa (tab) | Per bungkus |
|---|---|---|---|---|---|
| 4-5 kg | 25 | 2 | 1 | 2 | Guaifenesin 8 mg (1,6–2/kg); Cetirizin 0,4 mg (0,08–0,1/kg); Dexa 0,04 mg (0,008–0,01/kg) |
| >5-6 kg | 20 | 2 | 1 | 2 | Guaifenesin 10 mg (1,67–2/kg); Cetirizin 0,5 mg (0,083–0,1/kg); Dexa 0,05 mg (0,008–0,01/kg) |
| >6-7 kg | 17 | 2 | 1 | 2 | Guaifenesin 11,8 mg (1,68–1,96/kg); Cetirizin 0,588 mg (0,084–0,098/kg); Dexa 0,059 mg (0,008–0,01/kg) |
| >7-8 kg | 15 | 2 | 1 | 2 | Guaifenesin 13,3 mg (1,67–1,9/kg); Cetirizin 0,667 mg (0,083–0,095/kg); Dexa 0,067 mg (0,008–0,01/kg) |
| >8-9 kg | 13 | 2 | 1 | 2 | Guaifenesin 15,4 mg (1,71–1,92/kg); Cetirizin 0,769 mg (0,085–0,096/kg); Dexa 0,077 mg (0,009–0,01/kg) |
| >9-10 kg | 12 | 2 | 1 | 2 | Guaifenesin 16,7 mg (1,67–1,85/kg); Cetirizin 0,833 mg (0,083–0,093/kg); Dexa 0,083 mg (0,008–0,009/kg) |
| >10-11 kg | 10 | 2 | 1 | 2 | Guaifenesin 20 mg (1,82–2/kg); Cetirizin 1 mg (0,091–0,1/kg); Dexa 0,1 mg (0,009–0,01/kg) |
| >11-12 kg | 10 | 2 | 1 | 2 | Guaifenesin 20 mg (1,67–1,82/kg); Cetirizin 1 mg (0,083–0,091/kg); Dexa 0,1 mg (0,008–0,009/kg) |
| >12-13 kg | 10 | 2 | 1 | 2 | Guaifenesin 20 mg (1,54–1,67/kg); Cetirizin 1 mg (0,077–0,083/kg); Dexa 0,1 mg (0,008–0,008/kg) |
| >13-14 kg | 10 | 2 | 1 | 2 | Guaifenesin 20 mg (1,43–1,54/kg); Cetirizin 1 mg (0,071–0,077/kg); Dexa 0,1 mg (0,007–0,008/kg) |
| >14-15 kg | 15 | 4 | 2 | 4 | Guaifenesin 26,7 mg (1,78–1,9/kg); Cetirizin 1,3 mg (0,089–0,095/kg); Dexa 0,133 mg (0,009–0,01/kg) |
| >15-16 kg | 14 | 4 | 2 | 4 | Guaifenesin 28,6 mg (1,79–1,9/kg); Cetirizin 1,4 mg (0,089–0,095/kg); Dexa 0,143 mg (0,009–0,01/kg) |
| >16-18 kg | 13 | 4 | 2 | 4 | Guaifenesin 30,8 mg (1,71–1,92/kg); Cetirizin 1,5 mg (0,085–0,096/kg); Dexa 0,154 mg (0,009–0,01/kg) |
| >18-20 kg | 12 | 4 | 2 | 4 | Guaifenesin 33,3 mg (1,67–1,85/kg); Cetirizin 1,7 mg (0,083–0,093/kg); Dexa 0,167 mg (0,008–0,009/kg) |
| >20-22 kg | 10 | 4 | 2 | 4 | Guaifenesin 40 mg (1,82–2/kg); Cetirizin 2 mg (0,091–0,1/kg); Dexa 0,2 mg (0,009–0,01/kg) |
| >22-25 kg | 10 | 4 | 2 | 4 | Guaifenesin 40 mg (1,6–1,82/kg); Cetirizin 2 mg (0,08–0,091/kg); Dexa 0,2 mg (0,008–0,009/kg) |
| >25-28 kg | 10 | 5 | 2 | 5 | Guaifenesin 50 mg (1,79–2/kg); Cetirizin 2 mg (0,071–0,08/kg); Dexa 0,25 mg (0,009–0,01/kg) |
| >28-30 kg | 11 | 6 | 3 | 6 | Guaifenesin 54,5 mg (1,82–1,95/kg); Cetirizin 2,7 mg (0,091–0,097/kg); Dexa 0,273 mg (0,009–0,01/kg) |
| >30-32 kg | 10 | 5 | 3 | 5 | Guaifenesin 50 mg (1,56–1,67/kg); Cetirizin 3 mg (0,094–0,1/kg); Dexa 0,25 mg (0,008–0,008/kg) |
| >32-35 kg | 10 | 6 | 3 | 6 | Guaifenesin 60 mg (1,71–1,88/kg); Cetirizin 3 mg (0,086–0,094/kg); Dexa 0,3 mg (0,009–0,009/kg) |
| >35-38 kg | 10 | 6 | 3 | 6 | Guaifenesin 60 mg (1,58–1,71/kg); Cetirizin 3 mg (0,079–0,086/kg); Dexa 0,3 mg (0,008–0,009/kg) |
| >38-40 kg | 10 | 7 | 3 | 7 | Guaifenesin 70 mg (1,75–1,84/kg); Cetirizin 3 mg (0,075–0,079/kg); Dexa 0,35 mg (0,009–0,009/kg) |

### AMB-CTZ-DEXA — 3x sehari

| BB | Bungkus | Ambroxol (tab) | Cetirizin (tab) | Dexa (tab) | Per bungkus |
|---|---|---|---|---|---|
| 4-5 kg | 25 | 2 | 1 | 2 | Ambroxol 2,4 mg (0,48–0,6/kg); Cetirizin 0,4 mg (0,08–0,1/kg); Dexa 0,04 mg (0,008–0,01/kg) |
| >5-6 kg | 20 | 2 | 1 | 2 | Ambroxol 3 mg (0,5–0,6/kg); Cetirizin 0,5 mg (0,083–0,1/kg); Dexa 0,05 mg (0,008–0,01/kg) |
| >6-7 kg | 17 | 2 | 1 | 2 | Ambroxol 3,5 mg (0,5–0,59/kg); Cetirizin 0,588 mg (0,084–0,098/kg); Dexa 0,059 mg (0,008–0,01/kg) |
| >7-8 kg | 15 | 2 | 1 | 2 | Ambroxol 4 mg (0,5–0,57/kg); Cetirizin 0,667 mg (0,083–0,095/kg); Dexa 0,067 mg (0,008–0,01/kg) |
| >8-9 kg | 13 | 2 | 1 | 2 | Ambroxol 4,6 mg (0,51–0,58/kg); Cetirizin 0,769 mg (0,085–0,096/kg); Dexa 0,077 mg (0,009–0,01/kg) |
| >9-10 kg | 12 | 2 | 1 | 2 | Ambroxol 5 mg (0,5–0,56/kg); Cetirizin 0,833 mg (0,083–0,093/kg); Dexa 0,083 mg (0,008–0,009/kg) |
| >10-11 kg | 10 | 2 | 1 | 2 | Ambroxol 6 mg (0,55–0,6/kg); Cetirizin 1 mg (0,091–0,1/kg); Dexa 0,1 mg (0,009–0,01/kg) |
| >11-12 kg | 10 | 2 | 1 | 2 | Ambroxol 6 mg (0,5–0,55/kg); Cetirizin 1 mg (0,083–0,091/kg); Dexa 0,1 mg (0,008–0,009/kg) |
| >12-13 kg | 10 | 2 | 1 | 2 | Ambroxol 6 mg (0,46–0,5/kg); Cetirizin 1 mg (0,077–0,083/kg); Dexa 0,1 mg (0,008–0,008/kg) |
| >13-14 kg | 10 | 2 | 1 | 2 | Ambroxol 6 mg (0,43–0,46/kg); Cetirizin 1 mg (0,071–0,077/kg); Dexa 0,1 mg (0,007–0,008/kg) |
| >14-15 kg | 15 | 4 | 2 | 4 | Ambroxol 8 mg (0,53–0,57/kg); Cetirizin 1,3 mg (0,089–0,095/kg); Dexa 0,133 mg (0,009–0,01/kg) |
| >15-16 kg | 14 | 4 | 2 | 4 | Ambroxol 8,6 mg (0,54–0,57/kg); Cetirizin 1,4 mg (0,089–0,095/kg); Dexa 0,143 mg (0,009–0,01/kg) |
| >16-18 kg | 13 | 4 | 2 | 4 | Ambroxol 9,2 mg (0,51–0,58/kg); Cetirizin 1,5 mg (0,085–0,096/kg); Dexa 0,154 mg (0,009–0,01/kg) |
| >18-20 kg | 12 | 4 | 2 | 4 | Ambroxol 10 mg (0,5–0,56/kg); Cetirizin 1,7 mg (0,083–0,093/kg); Dexa 0,167 mg (0,008–0,009/kg) |
| >20-22 kg | 10 | 4 | 2 | 4 | Ambroxol 12 mg (0,55–0,6/kg); Cetirizin 2 mg (0,091–0,1/kg); Dexa 0,2 mg (0,009–0,01/kg) |
| >22-25 kg | 10 | 4 | 2 | 4 | Ambroxol 12 mg (0,48–0,55/kg); Cetirizin 2 mg (0,08–0,091/kg); Dexa 0,2 mg (0,008–0,009/kg) |
| >25-28 kg | 10 | 5 | 2 | 5 | Ambroxol 15 mg (0,54–0,6/kg); Cetirizin 2 mg (0,071–0,08/kg); Dexa 0,25 mg (0,009–0,01/kg) |
| >28-30 kg | 11 | 6 | 3 | 6 | Ambroxol 16,4 mg (0,55–0,58/kg); Cetirizin 2,7 mg (0,091–0,097/kg); Dexa 0,273 mg (0,009–0,01/kg) |
| >30-32 kg | 10 | 5 | 3 | 5 | Ambroxol 15 mg (0,47–0,5/kg); Cetirizin 3 mg (0,094–0,1/kg); Dexa 0,25 mg (0,008–0,008/kg) |
| >32-35 kg | 10 | 6 | 3 | 6 | Ambroxol 18 mg (0,51–0,56/kg); Cetirizin 3 mg (0,086–0,094/kg); Dexa 0,3 mg (0,009–0,009/kg) |
| >35-38 kg | 10 | 6 | 3 | 6 | Ambroxol 18 mg (0,47–0,51/kg); Cetirizin 3 mg (0,079–0,086/kg); Dexa 0,3 mg (0,008–0,009/kg) |
| >38-40 kg | 10 | 7 | 3 | 7 | Ambroxol 21 mg (0,53–0,55/kg); Cetirizin 3 mg (0,075–0,079/kg); Dexa 0,35 mg (0,009–0,009/kg) |

### Racikan Antasida (≥4 th) — 3x sehari

| BB | Bungkus | Antasida (tab) | Per bungkus |
|---|---|---|---|
| 8-9 kg | 10 | 2 | Antasida 0,2 tab (0,022–0,025/kg) |
| >9-10 kg | 12 | 3 | Antasida 0,25 tab (0,025–0,028/kg) |
| >10-11 kg | 10 | 3 | Antasida 0,3 tab (0,027–0,03/kg) |
| >11-12 kg | 10 | 3 | Antasida 0,3 tab (0,025–0,027/kg) |
| >12-13 kg | 10 | 3 | Antasida 0,3 tab (0,023–0,025/kg) |
| >13-14 kg | 10 | 3 | Antasida 0,3 tab (0,021–0,023/kg) |
| >14-15 kg | 10 | 4 | Antasida 0,4 tab (0,027–0,029/kg) |
| >15-16 kg | 10 | 4 | Antasida 0,4 tab (0,025–0,027/kg) |
| >16-18 kg | 10 | 4 | Antasida 0,4 tab (0,022–0,025/kg) |
| >18-20 kg | 10 | 5 | Antasida 0,5 tab (0,025–0,028/kg) |
| >20-22 kg | 10 | 5 | Antasida 0,5 tab (0,023–0,025/kg) |
| >22-25 kg | 10 | 6 | Antasida 0,6 tab (0,024–0,027/kg) |
| >25-28 kg | 10 | 7 | Antasida 0,7 tab (0,025–0,028/kg) |
| >28-30 kg | 10 | 7 | Antasida 0,7 tab (0,023–0,025/kg) |
| >30-32 kg | 10 | 8 | Antasida 0,8 tab (0,025–0,027/kg) |
| >32-35 kg | 10 | 8 | Antasida 0,8 tab (0,023–0,025/kg) |
| >35-38 kg | 10 | 9 | Antasida 0,9 tab (0,024–0,026/kg) |
| >38-40 kg | 10 | 10 | Antasida 1 tab (0,025–0,026/kg) |

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
| >12-13 kg | 2,5 mL | 0,19–0,21 mg/kg |
| >13-14 kg | 2,5 mL | 0,18–0,19 mg/kg |
| >14-15 kg | 3 mL | 0,2–0,21 mg/kg |
| >15-16 kg | 3 mL | 0,19–0,2 mg/kg |
| >16-18 kg | 3,5 mL | 0,19–0,22 mg/kg |
| >18-20 kg | 4 mL | 0,2–0,22 mg/kg |
| >20-22 kg | 4 mL | 0,18–0,2 mg/kg |
| >22-25 kg | 4,5 mL | 0,18–0,2 mg/kg |
| >25-28 kg | 5,5 mL | 0,2–0,22 mg/kg |
| >28-30 kg | 6 mL | 0,2–0,21 mg/kg |
| >30-32 kg | 6 mL | 0,19–0,2 mg/kg |
| >32-35 kg | 6,5 mL | 0,19–0,2 mg/kg |
| >35-38 kg | 7,5 mL | 0,2–0,21 mg/kg |
| >38-40 kg | 8 mL | 0,2–0,21 mg/kg |
| >40-45 kg | 8,5 mL | 0,19–0,21 mg/kg |
| >45-50 kg | 9,5 mL | 0,19–0,21 mg/kg |

