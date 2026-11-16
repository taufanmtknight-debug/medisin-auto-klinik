// Memuat userscript di Node (tanpa browser) dalam mode test.
// Script mendeteksi globalThis.__AUTO_KLINIK_TEST__, mengisi objek itu dengan
// data & fungsi murni, lalu berhenti sebelum menyentuh DOM.
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const SCRIPT_PATH = path.join(__dirname, "..", "Medisin_AUTO_KLINIK.user.js");

// extraGlobals: tiruan document/location/localStorage untuk tes pengisi form Medisin.
function loadScript(extraGlobals = {}) {
  const source = fs.readFileSync(SCRIPT_PATH, "utf8");
  const logs = [];
  const sink = (level) => (...args) => logs.push({ level, args });
  const ctx = {
    console: {
      log: sink("log"),
      warn: sink("warn"),
      error: sink("error"),
      groupCollapsed: sink("group"),
      groupEnd: () => {},
    },
    __AUTO_KLINIK_TEST__: {},
    atob: (s) => Buffer.from(String(s), "base64").toString("binary"),
    setTimeout,
    clearTimeout,
    ...extraGlobals,
  };
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  vm.runInContext(source, ctx, { filename: SCRIPT_PATH });
  return { api: ctx.__AUTO_KLINIK_TEST__, logs, source };
}

function readHeader(source) {
  const block = source.match(/\/\/ ==UserScript==([\s\S]*?)\/\/ ==\/UserScript==/);
  if (!block) throw new Error("Header userscript tidak ditemukan");
  const meta = {};
  for (const line of block[1].split(/\r?\n/)) {
    const m = line.match(/^\/\/\s+@(\S+)\s+(.*?)\s*$/);
    if (!m) continue;
    (meta[m[1]] ||= []).push(m[2]);
  }
  return meta;
}

module.exports = { loadScript, readHeader, SCRIPT_PATH };
