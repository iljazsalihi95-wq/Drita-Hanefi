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

for (const name of modules) {
  const file = path.join(ROOT, 'modules', name, 'index.html');
  if (!fs.existsSync(file)) { failures.push(`${name}: mungon index.html`); continue; }
  const html = fs.readFileSync(file, 'utf8');
  if (html.length < 1500) failures.push(`${name}: index.html është tepër i vogël (${html.length} B)`);
  for (const rx of forbidden) if (rx.test(html)) failures.push(`${name}: përmban tekst të ndaluar ${rx}`);
  if (!/https:\/\/script\.google\.com\/macros\/s\//.test(html) && !/\.json\b/.test(html)) {
    failures.push(`${name}: nuk u gjet lidhje me bazë LIVE ose dataset real`);
  }
}

const quran = fs.readFileSync(path.join(ROOT,'modules','quran','index.html'),'utf8');
for (const required of ['everyayah.com','Hifz','Tefsir','Fikh','Transkript']) {
  if (!quran.includes(required)) failures.push(`quran: mungon integrimi ${required}`);
}

const hadith = fs.readFileSync(path.join(ROOT,'modules','hadith','index.html'),'utf8');
for (const required of ['Arabisht','Shqip','Grad','Burim']) {
  if (!new RegExp(required,'i').test(hadith)) failures.push(`hadith: mungon fusha/funksioni ${required}`);
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
console.log(`CONTENT INTEGRITY: OK — ${modules.length} rubrika pa demo/placeholder dhe me burim real të lidhur.`);
