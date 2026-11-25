// Membuat docs/vaksin/aturan.md dari vaksin/vaksin-rules.js:  node tools/gen-aturan-vaksin.cjs > docs/vaksin/aturan.md
const R=require('../vaksin/vaksin-rules.js');
const fmt=(v)=>{ if(v==null) return '—'; if(Array.isArray(v)) return v.join(', '); if(typeof v==='object') return Object.entries(v).map(([k,x])=>`${k}: ${typeof x==='object'?JSON.stringify(x):x}`).join('; '); return String(v); };
const esc=(s)=>String(s).replace(/\|/g,'\\|').replace(/\n/g,' ');
const L=[]; L.push('# Aturan CEK VAKSIN (dibuat otomatis dari `vaksin/vaksin-rules.js`)','',`Versi aturan: ${R.versi}. ⚠️ = perlu verifikasi (nilai paling ketat dipakai sampai dokter memutuskan; lihat \`perbedaan-sumber.md\`).`,'','## Sumber','');
for(const [k,v] of Object.entries(R.SUMBER)) L.push(`- **${k}**: ${v}`);
const table=(title,obj,prefix='')=>{ L.push('',`## ${title}`,'','| Vaksin / aturan | Batas / nilai | Sumber | Status | Catatan |','|---|---|---|---|---|');
 const walk=(o,name)=>{ for(const [k,v] of Object.entries(o)){ if(v&&typeof v==='object'&&'status_verifikasi' in v){ L.push(`| ${esc(name+k)} | ${esc(fmt(v.nilai))} | ${esc(v.sumber)} | ${v.status_verifikasi==='terverifikasi'?'✅ terverifikasi':'⚠️ perlu verifikasi'} | ${esc(v.catatan||'')} |`);} else if(v&&typeof v==='object'&&!Array.isArray(v)) walk(v, name+(v.nama?v.nama+' · ':v.label?v.label+' · ':k+' · ')); } };
 walk(obj,prefix); };
table('Per vaksin',R.vaksin); table('Aturan umum',R.umum); table('Rute (Kepmenkes)',R.rute); table('Catatan',R.catatan);
if (require.main === module) process.stdout.write(L.join('\n')+'\n');
module.exports = { markdown: () => L.join("\n") + "\n" };
