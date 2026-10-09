import { buildSourceTree, buildTopicIndex, hadithViewModel } from './catalog-controller.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const safeUrl = value => { try { const u = new URL(String(value || ''), location.href); return ['http:','https:'].includes(u.protocol) ? u.href : ''; } catch { return ''; } };

function button(label, attrs = '') { return `<button class="chip" ${attrs}>${esc(label)}</button>`; }
function parseCollectionJson(text,file='koleksioni'){
  try{return JSON.parse(text)}catch(originalError){
    try{
      const bytes=[];for(const ch of text){const code=ch.codePointAt(0);if(code>0xffff)throw originalError;bytes.push((code>>8)&255,code&255)}
      while(bytes.length&&bytes[bytes.length-1]===0)bytes.pop();
      return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(bytes)));
    }catch{throw new Error(`${file}: JSON i pavlefshëm dhe i parikuperueshëm`)}
  }
}

export class HadithCatalogExplorer {
  constructor({ root, onSelectHadith = () => {} } = {}) {
    this.root = typeof root === 'string' ? document.querySelector(root) : root;
    this.onSelectHadith = onSelectHadith;
    this.rows = [];
    this.mode = 'source';
    this.path = { collection: '', book: '', chapter: '' };
  }
  setRows(rows = []) { this.rows = rows.map(hadithViewModel); this.path = { collection:'',book:'',chapter:'' }; this.render(); }
  setMode(mode) { this.mode = mode === 'topics' ? 'topics' : 'source'; this.path = { collection:'',book:'',chapter:'' }; this.render(); }
  render() {
    if (!this.root) return;
    this.root.innerHTML = `<div class="hadith-explorer-tabs">${button('Koleksionet',`data-mode="source" ${this.mode==='source'?'aria-current="page"':''}`)}${button('Tematikat',`data-mode="topics" ${this.mode==='topics'?'aria-current="page"':''}`)}</div><div class="hadith-explorer-body"></div>`;
    this.root.querySelectorAll('[data-mode]').forEach(el => el.onclick=()=>this.setMode(el.dataset.mode));
    this.mode === 'topics' ? this.renderTopics() : this.renderSource();
  }
  renderSource() {
    const body=this.root.querySelector('.hadith-explorer-body'), tree=buildSourceTree(this.rows), {collection,book,chapter}=this.path;
    if(!collection){body.innerHTML=`<div class="meta">Koleksion → Libër → Kapitull → Hadith</div><div class="grid">${[...tree.entries()].map(([name,books])=>`<button class="collection" data-collection="${esc(name)}"><h3>${esc(name)}</h3><p>${[...books.values()].reduce((n,chs)=>n+[...chs.values()].reduce((s,hs)=>s+hs.length,0),0)} hadithe • ${books.size} libra</p></button>`).join('')}</div>`;body.querySelectorAll('[data-collection]').forEach(el=>el.onclick=()=>{this.path.collection=el.dataset.collection;this.renderSource()});return;}
    const books=tree.get(collection)||new Map();
    if(!book){body.innerHTML=`${button('← Koleksionet','data-back="collections"')}<h3>${esc(collection)}</h3><div class="grid">${[...books.entries()].map(([name,chs])=>`<button class="collection" data-book="${esc(name)}"><h3>${esc(name)}</h3><p>${[...chs.values()].reduce((s,hs)=>s+hs.length,0)} hadithe • ${chs.size} kapituj</p></button>`).join('')}</div>`;body.querySelector('[data-back]').onclick=()=>{this.path.collection='';this.renderSource()};body.querySelectorAll('[data-book]').forEach(el=>el.onclick=()=>{this.path.book=el.dataset.book;this.renderSource()});return;}
    const chapters=books.get(book)||new Map();
    if(!chapter){body.innerHTML=`${button('← Librat','data-back="books"')}<h3>${esc(book)}</h3><div class="grid">${[...chapters.entries()].map(([name,hs])=>`<button class="collection" data-chapter="${esc(name)}"><h3>${esc(name)}</h3><p>${hs.length} hadithe</p></button>`).join('')}</div>`;body.querySelector('[data-back]').onclick=()=>{this.path.book='';this.renderSource()};body.querySelectorAll('[data-chapter]').forEach(el=>el.onclick=()=>{this.path.chapter=el.dataset.chapter;this.renderSource()});return;}
    const hadiths=chapters.get(chapter)||[]; body.innerHTML=`${button('← Kapitujt','data-back="chapters"')}<h3>${esc(chapter)}</h3><div>${hadiths.map(h=>this.hadithCard(h)).join('')}</div>`;body.querySelector('[data-back]').onclick=()=>{this.path.chapter='';this.renderSource()};this.bindHadiths(body);
  }
  renderTopics(){const body=this.root.querySelector('.hadith-explorer-body'),index=buildTopicIndex(this.rows);body.innerHTML=`<div class="meta">Tematikat janë indeks i pavarur; nuk ndryshojnë koleksionin, librin apo kapitullin burimor.</div><div class="grid">${[...index.entries()].sort((a,b)=>a[0].localeCompare(b[0],'sq')).map(([topic,hs])=>`<button class="collection" data-topic="${esc(topic)}"><h3>${esc(topic)}</h3><p>${hs.length} hadithe</p></button>`).join('')}</div><div data-topic-results></div>`;body.querySelectorAll('[data-topic]').forEach(el=>el.onclick=()=>{const hs=index.get(el.dataset.topic)||[],out=body.querySelector('[data-topic-results]');out.innerHTML=`<h3>${esc(el.dataset.topic)}</h3>${hs.map(h=>this.hadithCard(h)).join('')}`;this.bindHadiths(out)});}
  hadithCard(h){
    const grade=h.preferredGrade||{}, hierarchy=h.hierarchy||{}, audio=h.audio||{};
    const arabicAudio=safeUrl(audio.arabic), albanianAudio=safeUrl(audio.albanian), download=safeUrl(audio.download), server=safeUrl(audio.server), source=safeUrl(h.sourceUrl);
    return `<article class="item"><h3>${esc(h.title||`Hadithi ${h.number||''}`)}</h3><div class="meta">${esc(hierarchy.collection)}${hierarchy.book?` • ${esc(hierarchy.book)}`:''}${hierarchy.chapter?` • ${esc(hierarchy.chapter)}`:''}${h.number?` • #${esc(h.number)}`:''}</div>${h.arabic?`<span class="label">Metni arab</span><div class="arabic">${esc(h.arabic)}</div>`:''}${h.transliteration?`<span class="label">Transkriptimi</span><p>${esc(h.transliteration)}</p>`:''}${h.albanian?`<span class="label">Përkthimi shqip</span><p class="translation">${esc(h.albanian)}</p>`:''}${h.chain?`<span class="label">Senedi / Isnadi</span><p>${esc(h.chain)}</p>`:''}${h.companion?`<div class="facts"><span class="fact">Transmetuesi: ${esc(h.companion)}</span></div>`:''}${grade.grade?`<div class="facts"><span class="fact grade">${esc(h.gradeLabel)}: ${esc(grade.grade)}</span>${grade.grader?`<span class="fact">${esc(grade.grader)}</span>`:''}${grade.source?`<span class="fact">${esc(grade.source)}</span>`:''}</div>`:''}${h.commentary?`<span class="label">Shpjegimi i verifikuar</span><p>${esc(h.commentary)}</p>`:''}${h.hanafiCommentary?`<span class="label">Lidhja me Fikhun Hanefi</span><p>${esc(h.hanafiCommentary)}</p>`:''}${h.reference||h.hanafiSources||source?`<div class="source">${h.reference?`<b>Referenca:</b> ${esc(h.reference)}`:''}${h.hanafiSources?`<br><b>Burime Hanefi:</b> ${esc(h.hanafiSources)}`:''}${source?`<br><a href="${esc(source)}" target="_blank" rel="noopener">Hap burimin ↗</a>`:''}</div>`:''}${arabicAudio?`<div class="audioBox"><b>Audio arabisht</b><audio controls preload="metadata" src="${esc(arabicAudio)}"></audio></div>`:''}${albanianAudio?`<div class="audioBox"><b>Audio shqip</b><audio controls preload="metadata" src="${esc(albanianAudio)}"></audio></div>`:''}<div class="learnbar">${download?`<a class="btn" href="${esc(download)}" target="_blank" rel="noopener">Shkarko audio</a>`:''}${server?`<a class="btn" href="${esc(server)}" target="_blank" rel="noopener">Server audio</a>`:''}<button class="btn" data-hadith-id="${esc(h.id)}">Hap / Mëso</button></div></article>`;
  }
  bindHadiths(scope){scope.querySelectorAll('[data-hadith-id]').forEach(el=>el.onclick=()=>{const h=this.rows.find(row=>String(row.id)===String(el.dataset.hadithId));if(h)this.onSelectHadith(h)});}
}

export async function loadHadithCollections(manifestUrl='../../data/hadith/manifest.json',baseUrl='../../data/hadith/'){
  const manifest=await fetch(manifestUrl).then(r=>{if(!r.ok)throw new Error(`Manifest ${r.status}`);return r.json()});
  const results=await Promise.allSettled((manifest.collections||[]).map(async c=>{const response=await fetch(baseUrl+c.file);if(!response.ok)throw new Error(`${c.file} ${response.status}`);const data=parseCollectionJson(await response.text(),c.file);return {collection:c,rows:Array.isArray(data.rows)?data.rows:[]}}));
  const available=[],unavailable=[];for(const result of results){if(result.status==='fulfilled')available.push(result.value);else unavailable.push(String(result.reason?.message||result.reason||'Koleksion i palexueshëm'));}
  const rows=available.flatMap(group=>group.rows).map(hadithViewModel);
  if(!rows.length)throw new Error('Asnjë koleksion real i Hadithit nuk u lexua');
  return {manifest:{...manifest,availableCollections:available.map(group=>group.collection),unavailableCollections:unavailable},rows};
}