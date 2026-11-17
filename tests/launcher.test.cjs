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
  // File di repo valid dan awalnya terbuka.
  const file = fs.readFileSync(path.join(__dirname, "..", "kunci.json"), "utf8");
  assert.equal(p(file).locked, false);
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
