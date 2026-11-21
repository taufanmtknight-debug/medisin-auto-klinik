// v0.6.0: tombol bisa digeser & kunci jarak jauh (kunci.json).
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { loadScript } = require("./load-script.cjs");

const { api, source } = loadScript();
const plain = (x) => JSON.parse(JSON.stringify(x));

test("kunci.json: aktif false = terkunci, true = terbuka, rusak = abaikan", () => {
  const p = (t) => { const r = plain(api.parseLockText(t)); if (r) delete r.stamp; return r; };
  assert.deepEqual(p('{"aktif": true, "pesan": ""}'), { locked: false, pesan: "" });
  assert.deepEqual(p('{"aktif": false, "pesan": "Dokter tidak jaga"}'), { locked: true, pesan: "Dokter tidak jaga" });
  assert.equal(p('{"aktif": "tidak"}').locked, true);
  assert.equal(p('{"aktif": "ya"}').locked, false);
  // Salah ketik kecil (koma tertinggal) tetap terbaca.
  assert.equal(p('{"aktif": false,}').locked, true);
  assert.equal(p(""), null);
  assert.equal(p("<html>404</html>"), null);
  // File di repo valid (terbuka atau terkunci sesuai permintaan dokter).
  const file = fs.readFileSync(path.join(__dirname, "..", "kunci.json"), "utf8");
  assert.equal(typeof p(file).locked, "boolean");
  assert.match(api.LOCK_URL, /^https:\/\/raw\.githubusercontent\.com\/taufanmtknight-debug\/medisin-auto-klinik\/.+\/kunci\.json$/);
});

test("posisi tombol: dibatasi di dalam layar, nilai rusak pakai bawaan", () => {
  const c = (p) => plain(api.clampLauncherPos(p));
  assert.deepEqual(c({ x: 0.5, y: 0.2 }), { x: 0.5, y: 0.2 });
  assert.deepEqual(c({ x: -1, y: 5 }), { x: 0.03, y: 0.97 });
  assert.deepEqual(c({ x: "abc" }), { x: 0.9, y: 0.88 });
  assert.deepEqual(c(null), { x: 0.9, y: 0.88 });
});

test("terkunci: menu, pintasan, dan jalan otomatis berhenti; tombol di semua halaman Medisin", () => {
  assert.match(source, /if \(akLocked\(\)\) return notify\(lockMessage\(\)/);
  assert.match(source, /if \(!fn \|\| !isTargetPage\(\) \|\| akLocked\(\)\) return;/);
  assert.match(source, /if \(akLocked\(\)\) return;\n\s*maybeAutoRun\(\)/);
  assert.match(source, /if \(!isMedisinPage\(\)\) \{\n\s*existing\?\.remove\(\);/);
  // Menu yang butuh pasien hanya jalan di halaman pelayanan.
  assert.match(source, /if \(!item\.anywhere && !isTargetPage\(\)\)/);
});

test("v0.6.1 PIN: buka di perangkat ini hanya saat dikunci; PIN tidak tertulis polos", () => {
  assert.equal(api.lockEffective(true, false), true);
  assert.equal(api.lockEffective(true, true), false);
  assert.equal(api.lockEffective(false, false), false);
  assert.equal(api.lockEffective(false, true), false);
  assert.match(source, /const PIN_HASH = "[0-9a-f]{64}";/);
  assert.doesNotMatch(source, /\b\d{6}\b(?=[^\n]*PIN)/);
  // Kunci jarak jauh dibuka → buka-PIN dihapus.
  assert.match(source, /if \(!next\.locked\) setLocalOpen\(false\);/);
  assert.match(source, /Kunci lagi di perangkat ini/);
});

test("v0.6.2: buka-PIN batal bila kunci.json diubah lagi (kunci ulang jarak jauh)", () => {
  const a = api.parseLockText('{"aktif": false, "pesan": "", "kunci_ke": 1}');
  const b = api.parseLockText('{"aktif": false, "pesan": "", "kunci_ke": 2}');
  const c = api.parseLockText('{"aktif": false, "pesan": "Dokter tidak jaga", "kunci_ke": 1}');
  assert.notEqual(a.stamp, b.stamp);
  assert.notEqual(a.stamp, c.stamp);
  assert.equal(a.stamp, api.parseLockText('{ "aktif":false,"pesan":"","kunci_ke":1 }').stamp);
  assert.match(source, /return !!v && v === String\(lockState\?\.stamp \|\| "lama"\);/);
});

// v0.8.9: jalan otomatis menunggu tab DOKTER selesai memuat; pilihan hijau tua bisa dibatalkan.
test("jalan otomatis menunggu halaman tenang (tab DOKTER klik pertama)", () => {
  const s = api.autoRunSettled;
  assert.equal(s({ now: 1000, mountedAt: 0, lastApiAt: 0, pasienSince: 0 }), false, "baru terpasang");
  assert.equal(s({ now: 3000, mountedAt: 0, lastApiAt: 2500, pasienSince: 0 }), false, "API masih merespons");
  assert.equal(s({ now: 3000, mountedAt: 0, lastApiAt: 1000, pasienSince: 2500 }), false, "data pasien baru diganti");
  assert.equal(s({ now: 3000, mountedAt: 0, lastApiAt: 1900, pasienSince: 1900 }), true);
  assert.equal(s({ now: 10000, mountedAt: 0, lastApiAt: 9990, pasienSince: 9990 }), true, "paling lama 10 dtk");
  assert.doesNotMatch(source, /await sleep\(400\);\s*await runTemplate\("resume-diagnosis"\)/);
});

test("pilihan diagnosis hijau tua: ketuk lagi = batal pilih", () => {
  assert.match(source, /dropCodes = live\.length \? live : hit\.filter\(\(e\) => marks\.has\(e\.code\)\)/);
  assert.match(source, /Ketuk untuk batal pilih/);
});

// v0.9.0: laporan perangkat ke Google Form dokter, tanpa data pasien.
test("laporan perangkat: hanya jenis perangkat, versi, status", () => {
  assert.equal(api.deviceLabel("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"), "Windows · Chrome");
  assert.equal(api.deviceLabel("Mozilla/5.0 (Linux; Android 14; SM-A145F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36"), "Android (SM-A145F) · Chrome");
  assert.equal(api.deviceLabel("Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36"), "Android · Chrome");
  const r = JSON.parse(api.deviceReport({ id: "abc123", ua: "Windows Chrome/1", ver: "0.9.0", locked: true, auto: false, pelayanan: true }));
  assert.deepEqual(Object.keys(r).sort(), ["halaman", "id", "otomatis", "perangkat", "status", "versi"]);
  assert.equal(r.status, "terkunci");
  assert.match(api.DEVICE_REPORT_URL, /^https:\/\/docs\.google\.com\/forms\/d\/e\/[\w-]+\/formResponse$/);
  // Pemanggil laporan tidak mengirim data pasien.
  const fn = source.slice(source.indexOf("async function reportDevice"), source.indexOf("let lockChecking"));
  assert.doesNotMatch(fn, /pasien|keluhan|location\.href|nama|storePasien/i);
});
