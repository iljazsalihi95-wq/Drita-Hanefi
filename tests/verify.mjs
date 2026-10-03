import { readFile, readdir, stat } from "node:fs/promises";
import { dirname, resolve, relative } from "node:path";
import vm from "node:vm";

const ROOT = resolve(import.meta.dirname, "..");
const API = "https://script.google.com/macros/s/AKfycbyZWyxCfIvU_tXY_TYZ6R4qUFO_NLS6mCBcpMIB3yh7hmCW-_S332dwb1gnKiaaje6K/exec";
const ABETARE_GVIZ = "https://docs.google.com/spreadsheets/d/1dWwp0i0EqYvoA83DUzO92ROkszP2LxrbIXU8B3Stz_w/gviz/tq?sheet=ABETARJA_KURANORE&tqx=out:json";
const pages = [
  "index.html", "admin/index.html", "modules/quran/index.html",
  "modules/fikh/index.html", "modules/akide/index.html",
  "modules/hadith/index.html", "modules/tefsir/index.html",
  "modules/hudbe/index.html", "modules/pedagogji/index.html",
  "modules/histori/index.html", "modules/texhvid/index.html",
  "modules/abetare/index.html", "modules/tema/index.html"
];
const endpoints = [
  ["home", 1], ["quran", 114], ["fikh.list&limit=500", 500], ["akide", 1],
  ["hadith.list&limit=2000", 1], ["tefsir.list&limit=2000", 1], ["hutbe", 1],
  ["pedagogji", 1], ["histori", 1], ["texhvid", 1],
  ["abetare", 1], ["topic.center&topic=namaz&source=ALL", 1], ["config", 0]
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function exists(path) {
  try { return (await stat(path)).isFile(); } catch { return false; }
}

async function verifyPage(file) {
  const full = resolve(ROOT, file);
  const html = await readFile(full, "utf8");
  assert(/<!doctype html>/i.test(html), `${file}: mungon doctype`);
  assert(/<html[^>]+lang=["']sq["']/i.test(html), `${file}: mungon lang=sq`);

  for (const [i, block] of [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].entries()) {
    if (block[1].trim()) new vm.Script(block[1], { filename: `${file}#script-${i + 1}` });
  }

  const markup = html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "");
  assert(!/\b(?:demo|lorem ipsum|përmbledhje tematike)\b/i.test(markup), `${file}: përmban tekst provizor`);
  for (const match of markup.matchAll(/\bhref=["']([^"']+)["']/gi)) {
    const href = match[1];
    if (/^(?:https?:|mailto:|tel:|#)/i.test(href)) continue;
    const target = resolve(dirname(full), href.split(/[?#]/)[0]);
    assert(await exists(target), `${file}: lidhja lokale mungon: ${href}`);
  }
}

async function getJson(action) {
  let lastError;
  for (let attempt = 1; attempt <= 2; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 60_000);
    try {
      const response = await fetch(`${API}?action=${action}&_=${Date.now()}`, { signal: ctrl.signal });
      assert(response.ok, `${action}: HTTP ${response.status}`);
      const data = await response.json();
      assert(data.ok !== false, `${action}: ${data.message || "API refuzoi kërkesën"}`);
      return data;
    } catch (error) {
      lastError = error;
      if (attempt < 2) await new Promise(resolve => setTimeout(resolve, 3_000));
    } finally { clearTimeout(timer); }
  }
  throw new Error(`${action}: ${lastError?.name === "AbortError" ? "kaloi kufirin e kohës pas dy provave" : lastError?.message || "gabim lidhjeje"}`);
}

function rowsOf(data) {
  return Array.isArray(data.rows) ? data.rows : Array.isArray(data.data) ? data.data : Array.isArray(data.items) ? data.items : [];
}

const value = (row, ...keys) => {
  for (const key of keys) {
    const result = row?.[key] ?? row?.raw?.[key];
    if (String(result ?? "").trim()) return String(result).trim();
  }
  return "";
};

function verifyRealContent(action, rows) {
  if (action.startsWith("fikh.list")) {
    assert(rows.some(row => [value(row,"id","ID"),value(row,"category","Kategoria"),value(row,"topic","Tema"),value(row,"subtopic","Nëntema"),value(row,"ruling","Hukmi","Dispozita / Përmbledhja"),value(row,"arabic","Teksti Arab"),value(row,"albanian","Përkthimi i Plotë"),value(row,"author","Autori"),value(row,"reference","Referenca")].every(Boolean)), "Fikhu: mungon një dispozitë e plotë me hierarki dhe burim");
  }
  if (action.startsWith("hadith.list")) {
    assert(rows.some(row => [value(row,"arabic","Teksti Arab"),value(row,"albanian","Përkthimi Shqip"),value(row,"grade","Gradimi"),value(row,"source","Burimi"),value(row,"reference","Referenca")].every(Boolean)), "Hadithi: mungon metni/përkthimi/gradimi/burimi");
  }
  if (action.startsWith("tefsir.list")) {
    assert(rows.some(row => [value(row,"ayah","Ajeti"),value(row,"arabic","Teksti arab"),value(row,"author","Autori"),value(row,"work","Vepra"),value(row,"Tefsiri i plotë"),value(row,"reference","Referenca"),value(row,"url","URL burimi")].every(Boolean)), "Tefsiri: mungon një koment i plotë me mufessir, vepër dhe burim");
  }
}

async function verifyAbetareSheet() {
  const response = await fetch(ABETARE_GVIZ);
  assert(response.ok, `Sheet-i i Abetares: HTTP ${response.status}`);
  const body = await response.text(), start = body.indexOf("{"), end = body.lastIndexOf("}");
  assert(start >= 0 && end > start, "Sheet-i i Abetares nuk ktheu JSON të vlefshëm");
  const data = JSON.parse(body.slice(start, end + 1)), labels = (data.table?.cols || []).map(x => x.label);
  const rows = (data.table?.rows || []).map(row => Object.fromEntries(labels.map((label, i) => [label, row.c?.[i]?.f ?? row.c?.[i]?.v ?? ""])));
  const complete = rows.filter(row => [row.ID,row["Titulli i Mësimit"],row["Shkronja / Rregulli"],row["Shembulli Arab"],row.Burimi,row.Referenca,row.Statusi,row["Status Verifikimi"],row["URL Burimi"]].every(Boolean));
  assert(complete.length >= 4, `Abetarja: vetëm ${complete.length} mësime të plota dhe të verifikuara në Sheet`);
  return complete.length;
}

async function verifyApi([action, minimum]) {
  const data = await getJson(action);
  const rows = rowsOf(data);
  assert(rows.length >= minimum, `${action}: vetëm ${rows.length} rekorde`);
  verifyRealContent(action, rows);
  if (action === "quran") {
    const total = rows.reduce((sum, row) => sum + Number(row.ayahCount || row.raw?.AyahCount || 0), 0);
    assert(rows.length === 114, `quran: ${rows.length} sure në vend të 114`);
    assert(total === 6236, `quran: ${total} ajete në vend të 6236`);
  }
  return `${action}=${action === "config" ? "OK" : rows.length}`;
}

await Promise.all(pages.map(verifyPage));
const manifest = JSON.parse(await readFile(resolve(ROOT, "manifest.webmanifest"), "utf8"));
assert(manifest.display === "standalone", "Manifesti nuk është PWA standalone");
assert(manifest.shortcuts?.some(x => x.url?.endsWith("#hifz")), "Manifestit i mungon shkurtorja Hifz");
const quran = await readFile(resolve(ROOT, "modules/quran/index.html"), "utf8");
assert(quran.includes('location.hash!=="#hifz"'), "Moduli i Kuranit nuk trajton #hifz");
assert(quran.includes('tefsir/index.html?verse=${encodeURIComponent(key)}'), "Kurani nuk krijon lidhje të saktë ajet → Tefsir");
assert(quran.includes('params.get("verse")'), "Kurani nuk hap ajetin e kërkuar nga modulet e tjera");
assert(quran.includes('Array.from({length:604}') && quran.includes('fetchPublicPage'), "Kurani nuk ka navigim real të 604 faqeve të Mushafit");
assert(quran.includes('touchstart') && quran.includes('touchend'), "Mushafi nuk kthen faqet me swipe");
assert(quran.includes('Ghamadi_40kbps') && quran.includes('Mëso këtë ajet'), "Mushafi nuk ka recituesit dhe mësimin e ajetit");
assert(quran.includes('showTranslation') && quran.includes('showTranslit'), "Mushafi nuk kontrollon shtresat e përkthimit/transkriptimit");
const hadithPage = await readFile(resolve(ROOT, "modules/hadith/index.html"), "utf8");
const verifiedHadith = JSON.parse(await readFile(resolve(ROOT, "data/hadith-verified.json"), "utf8"));
assert(hadithPage.includes("../../data/hadith-verified.json"), "Hadithi nuk e ngarkon katalogun e audituar");
assert(verifiedHadith.source?.spreadsheetId === "12i8lAsSDHumk8NiYajhqVth34DRtWnjoba43v5HZZWE", "Hadithi: mungon identiteti i bazës 4872 LIVE");
assert(verifiedHadith.source?.auditedRows === 4872 && verifiedHadith.rows?.length === 3, "Hadithi: katalogu i audituar nuk përputhet me bazën");
assert(verifiedHadith.rows.every(row => [row.id,row.arabic,row.albanian,row.narrator,row.grade,row.source,row.reference,row.status].every(Boolean)), "Hadithi: rekord i audituar i paplotë");
const tefsirPage = await readFile(resolve(ROOT, "modules/tefsir/index.html"), "utf8");
const verifiedTefsir = JSON.parse(await readFile(resolve(ROOT, "data/tefsir-verified.json"), "utf8"));
assert(tefsirPage.includes("../../data/tefsir-verified.json"), "Tefsiri nuk e ngarkon katalogun e audituar");
assert(tefsirPage.includes('verse?x.key===verse'), "Tefsiri nuk filtron me referencën e saktë sure:ajet");
assert(tefsirPage.includes('quran/index.html?verse=${encodeURIComponent(x.key)}'), "Tefsiri nuk kthehet te ajeti i saktë në Kuran");
assert(verifiedTefsir.source?.spreadsheetId === "1Wj8Qz5WfmlAW29WdQB4wadfUV8K1vMfrzQcr_ybKIzI", "Tefsiri: mungon identiteti i Sheet-it burimor");
assert(verifiedTefsir.rows?.length === 3, "Tefsiri: priten 3 komente të audituara");
assert(verifiedTefsir.rows.every(row => [row.id,row.surah,row.ayah,row.arabic,row.transliteration,row.albanian,row.tafsir,row.author,row.work,row.section,row.reference,row.status,row.verified,row.url].every(Boolean)), "Tefsiri: koment i audituar i paplotë");
assert(verifiedTefsir.rows.find(row => row.id === "TF-026")?.originalTafsirArabic, "Tefsiri 4:103: mungon teksti burimor arab");
const akidePage = await readFile(resolve(ROOT, "modules/akide/index.html"), "utf8");
const verifiedAkide = JSON.parse(await readFile(resolve(ROOT, "data/akide-verified.json"), "utf8"));
assert(akidePage.includes("../../data/akide-verified.json"), "Akideja nuk e ngarkon katalogun e audituar");
assert(verifiedAkide.source?.spreadsheetId === "1lfBafpcuwwaJSec1pYko8e2guA7ozGKxh5YIift-mgY", "Akideja: mungon identiteti i Sheet-it burimor");
assert(verifiedAkide.source?.auditedPublishedRows === 46 && verifiedAkide.rows?.length === 5, "Akideja: katalogu i audituar nuk përputhet me bazën");
assert(verifiedAkide.rows.every(row => [row.id,row.topic,row.subtopic,row.title,row.albanian,row.arabic,row.author,row.work,row.section,row.reference,row.status,row.verified,row.url,row.sourceType].every(Boolean)), "Akideja: fragment klasik i paplotë");
assert(verifiedAkide.rows.every(row => row.author === "Imam Ebu Hanife" && row.work === "El-Fikh'ul-Ekber"), "Akideja: burimi klasik nuk përputhet");
const hudbePage = await readFile(resolve(ROOT, "modules/hudbe/index.html"), "utf8");
const verifiedHudbe = JSON.parse(await readFile(resolve(ROOT, "data/hudbe-verified.json"), "utf8"));
assert(hudbePage.includes("../../data/hudbe-verified.json"), "Hudbet nuk e ngarkojnë katalogun e audituar");
assert(verifiedHudbe.source?.spreadsheetId === "1d2_HHEvHdeWcMRpGFPuMPk5ln-5pQK9riTzl5DySZ-Y", "Hudbet: mungon identiteti i Sheet-it burimor");
assert(verifiedHudbe.source?.auditedApiRows === 14 && verifiedHudbe.rows?.length === 13, "Hudbet: katalogu i audituar nuk përputhet me endpoint-in");
assert(verifiedHudbe.source?.excluded?.some(row => row.id === "HT-013"), "Hudbet: HT-013 duhet të mbetet i fshehur për verifikim hadithor");
assert(!verifiedHudbe.rows.some(row => /PËR VERIFIKIM|DO TË PLOTËSOHET|PËR T[.’']?U SHTUAR/i.test([row.status,row.verified,row.notes].join(" "))), "Hudbet: u gjet rekord provizor në katalogun publik");
assert(verifiedHudbe.rows.every(row => [row.id,row.category,row.topic,row.title,row.albanian,row.verses,row.hadiths,row.author,row.source,row.status,row.verified,row.sourceType].every(Boolean)), "Hudbet: rekord i audituar i paplotë");
assert(verifiedHudbe.rows.some(row => row.id === "HT-007" && row.sourceType === "përkthim i plotë nga PDF" && row.albanian.length > 9000), "Hudbet: mungon përkthimi i plotë HT-007");
const temaPage = await readFile(resolve(ROOT, "modules/tema/index.html"), "utf8");
assert(temaPage.includes("rawRows.map(normalize).filter(publishable)"), "Më bëj një temë: rezultatet LIVE nuk normalizohen dhe filtrohen");
assert(temaPage.includes('"ArabishtUthmani"') && temaPage.includes('"HasanNahi"') && temaPage.includes('"VerseKey"'), "Më bëj një temë: mungon hartëzimi i fushave reale të Kuranit");
assert(temaPage.includes("HUKMI I GRADIMIT PËR REKORD TË VEÇANTË"), "Më bëj një temë: mungon bllokimi i dispozitës provizore të Fikhut");
const texhvidPage = await readFile(resolve(ROOT, "modules/texhvid/index.html"), "utf8");
assert(texhvidPage.includes('title:raw(r,"Rregulli","RregulliShqip","Titulli")||first(r,"ruling","title")'), "Texhvidi: rregulli real nuk ka përparësi ndaj titullit të përgjithshëm");
assert(texhvidPage.includes("Audio shfaqet vetëm kur baza jep URL reale."), "Texhvidi: politika e audios reale nuk është e dukshme");
const serviceWorker = await readFile(resolve(ROOT, "sw.js"), "utf8");
assert(serviceWorker.includes('drita-hanefi-v13'), "PWA: cache nuk u ngrit pas lexuesit Mushaf");
assert(serviceWorker.includes('"./data/akide-verified.json"'), "PWA nuk ruan katalogun e Akides për përdorim offline");
assert(serviceWorker.includes('"./data/hudbe-verified.json"'), "PWA nuk ruan katalogun e Hudbeve për përdorim offline");
const androidActivity = await readFile(resolve(ROOT, "android/app/src/main/java/com/dritahanefi/app/MainActivity.java"), "utf8");
const androidSection = await readFile(resolve(ROOT, "android/app/src/main/java/com/dritahanefi/app/SectionActivity.java"), "utf8");
const androidManifest = await readFile(resolve(ROOT, "android/app/src/main/AndroidManifest.xml"), "utf8");
const splashBackground = await readFile(resolve(ROOT, "android/app/src/main/res/drawable/splash_background.xml"), "utf8");
assert(androidActivity.includes("package com.dritahanefi.app;"), "Paketa Android nuk përputhet me applicationId");
assert(androidActivity.includes('"quran"') && androidActivity.includes('"admin"'), "Ballina native nuk i lidh rubrikat kryesore");
assert(androidSection.includes("file:///android_asset/site/modules/") && androidSection.includes("file:///android_asset/site/admin/index.html"), "Android nuk hap rubrikat e plota të paketuara");
assert(androidSection.includes("setAllowFileAccessFromFileURLs(true)") && androidSection.includes("setAllowUniversalAccessFromFileURLs(true)"), "Android nuk lejon katalogët lokalë dhe API-të HTTPS nga paketa");
assert(!await exists(resolve(ROOT, "android/app/src/main/java/com/dritahanefi/app/NativeRepository.java")), "Android përmban ende shtresën provizore të numërimit të rekordeve");
assert(androidManifest.includes('android.permission.INTERNET'), "Androidit i mungon leja INTERNET");
assert(androidManifest.includes('android:usesCleartextTraffic="false"'), "Android lejon trafik të pasigurt");
assert(androidManifest.includes('android:theme="@style/SplashTheme"'), "Androidit i mungon tema native e nisjes");
assert(splashBackground.includes('android:drawable="@color/launcher_background"') && splashBackground.includes('android:drawable="@drawable/splash_mark"') && !/<item[^>]*>\s*<layer-list>/s.test(splashBackground), "Splash-i Android përdor drawable të pavlefshëm");
for (const density of ["mdpi", "hdpi", "xhdpi", "xxhdpi", "xxxhdpi"]) {
  assert(await exists(resolve(ROOT, `android/app/src/main/res/mipmap-${density}/ic_launcher.png`)), `Mungon ikona Android ${density}`);
}

const apiResults = [];
for (let i = 0; i < endpoints.length; i += 2) {
  apiResults.push(...await Promise.all(endpoints.slice(i, i + 2).map(verifyApi)));
}
const abetareVerified = await verifyAbetareSheet();

console.log(`PASS: ${pages.length} faqe, skriptet inline, lidhjet lokale, PWA dhe skeleti Android`);
console.log(`PASS LIVE: ${apiResults.join(" • ")}`);
console.log(`PASS SHEET: ABETARJA_KURANORE=${abetareVerified} mësime • HADITH 4872 LIVE=${verifiedHadith.rows.length} hadithe • TEFSIR=${verifiedTefsir.rows.length} komente • AKIDE=${verifiedAkide.source.auditedPublishedRows} rekorde/${verifiedAkide.rows.length} fragmente klasike • HUDBE=${verifiedHudbe.rows.length} publike/${verifiedHudbe.source.excluded.length} e fshehur`);
