import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);
const modules = ['abetare','akide','fikh','hadith','histori','hudbe','pedagogji','quran','tefsir','tema','texhvid'];
const forbidden = [
  /\bplaceholder\b/i,
  /\bdemo\b/i,
  /përmbledhje tematike/i,
  /do të plotësohet/i,
  /material provizor/i,
  /tekst provizor/i,
  /lorem ipsum/i
];
const failures = [];

function visibleStaticText(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--([\s\S]*?)-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const dataContractRx = /https:\/\/script\.google\.com\/macros\/s\/|(?:fetch\s*\(\s*)?["'`](?:\.\.\/|\.\/)*data\/[^"'`]+\.json\b|["'`][^"'`]*\.json\b/;

function hasRealDataContract(name, html) {
  if (dataContractRx.test(html)) return true;
  const moduleRoot = path.resolve(ROOT, 'modules', name);
  const seen = new Set();
  const inspectJs = file => {
    const resolved = path.resolve(file);
    if (!resolved.startsWith(moduleRoot + path.sep) || seen.has(resolved) || !fs.existsSync(resolved)) return false;
    seen.add(resolved);
    const js = fs.readFileSync(resolved, 'utf8');
    if (dataContractRx.test(js)) return true;
    const imports = [...js.matchAll(/(?:import[\s\S]*?from\s*|import\s*)["']([^"']+)["']/g)].map(m => m[1]);
    return imports.some(src => {
      if (/^https?:\/\//i.test(src)) return true;
      if (!src.startsWith('.')) return false;
      const target = path.resolve(path.dirname(resolved), src.split(/[?#]/)[0]);
      return inspectJs(path.extname(target) ? target : target + '.js');
    });
  };
  const scripts = [...html.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)].map(m => m[1]);
  const inlineModules = [...html.matchAll(/<script[^>]*type=["']module["'][^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
  const linked = scripts.some(src => {
    if (/^https?:\/\//i.test(src)) return true;
    return inspectJs(path.resolve(moduleRoot, src.split(/[?#]/)[0]));
  });
  if (linked) return true;
  return inlineModules.some(js => {
    if (dataContractRx.test(js)) return true;
    const imports = [...js.matchAll(/(?:import[\s\S]*?from\s*|import\s*)["']([^"']+)["']/g)].map(m => m[1]);
    return imports.some(src => src.startsWith('.') && inspectJs(path.resolve(moduleRoot, src.split(/[?#]/)[0])));
  });
}

for (const name of modules) {
  const file = path.join(ROOT, 'modules', name, 'index.html');
  if (!fs.existsSync(file)) { failures.push(`${name}: mungon index.html`); continue; }
  const html = fs.readFileSync(file, 'utf8');
  const visible = visibleStaticText(html);
  if (html.length < 1500) failures.push(`${name}: index.html është tepër i vogël (${html.length} B)`);
  for (const rx of forbidden) if (rx.test(visible)) failures.push(`${name}: shfaq tekst të ndaluar ${rx}`);
  if (!hasRealDataContract(name, html)) failures.push(`${name}: nuk u gjet lidhje me bazë LIVE ose dataset real`);
}

const quran = fs.readFileSync(path.join(ROOT,'modules','quran','index.html'),'utf8');
for (const required of ['everyayah.com','Hifz','Tefsir','Fikh','Transkript']) {
  if (!quran.includes(required)) failures.push(`quran: mungon integrimi ${required}`);
}

const hadith = fs.readFileSync(path.join(ROOT,'modules','hadith','index.html'),'utf8');
for (const required of ['Arabisht','Shqip','Grad','Burim']) {
  if (!new RegExp(required,'i').test(hadith)) failures.push(`hadith: mungon fusha/funksioni ${required}`);
}
const hadithModelFile = path.join(ROOT,'modules','hadith','catalog-model.js');
if (!fs.existsSync(hadithModelFile)) {
  failures.push('hadith: mungon catalog-model.js');
} else {
  const model = fs.readFileSync(hadithModelFile,'utf8');
  for (const required of ['collection','book','chapter','topics','hanafiGrade','hanafiGrader','hanafiGradeSource','originalGrade','audioArabic','audioAlbanian','downloadUrl','serverUrl']) {
    if (!model.includes(required)) failures.push(`hadith model: mungon ${required}`);
  }
  if (!/basis:\s*'hanafi'/.test(model) || !/basis:\s*'original'/.test(model)) failures.push('hadith model: mungon prioriteti Hanafi/original');
}

const fikh = fs.readFileSync(path.join(ROOT,'modules','fikh','index.html'),'utf8');
for (const required of ['kategori','tem','dispoz','burim']) {
  if (!new RegExp(required,'i').test(fikh)) failures.push(`fikh: mungon hierarkia/fusha ${required}`);
}

const tefsir = fs.readFileSync(path.join(ROOT,'modules','tefsir','index.html'),'utf8');
for (const required of ['ajet','autor|mufessir','vepr|referenc','tefsir|koment']) {
  if (!new RegExp(required,'i').test(tefsir)) failures.push(`tefsir: mungon ${required}`);
}

if (failures.length) {
  console.error('CONTENT INTEGRITY: FAIL');
  failures.forEach(x=>console.error(' - '+x));
  process.exit(1);
}
console.log(`CONTENT INTEGRITY: OK — ${modules.length} rubrika pa demo/placeholder të dukshëm dhe me burim real të lidhur; modeli i Hadithit ruan hierarkinë burimore dhe gradimin Hanafi veçmas.`);
