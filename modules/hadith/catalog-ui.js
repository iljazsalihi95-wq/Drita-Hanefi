import { buildSourceTree, buildTopicIndex, hadithViewModel } from './catalog-controller.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

function button(label, attrs = '') {
  return `<button class="chip" ${attrs}>${esc(label)}</button>`;
}

export class HadithCatalogExplorer {
  constructor({ root, onSelectHadith = () => {} } = {}) {
    this.root = typeof root === 'string' ? document.querySelector(root) : root;
    this.onSelectHadith = onSelectHadith;
    this.rows = [];
    this.mode = 'source';
    this.path = { collection: '', book: '', chapter: '' };
  }

  setRows(rows = []) {
    this.rows = rows.map(hadithViewModel);
    this.path = { collection: '', book: '', chapter: '' };
    this.render();
  }

  setMode(mode) {
    this.mode = mode === 'topics' ? 'topics' : 'source';
    this.path = { collection: '', book: '', chapter: '' };
    this.render();
  }

  render() {
    if (!this.root) return;
    this.root.innerHTML = `<div class="hadith-explorer-tabs">${button('Koleksionet', `data-mode="source" ${this.mode === 'source' ? 'aria-current="page"' : ''}`)}${button('Tematikat', `data-mode="topics" ${this.mode === 'topics' ? 'aria-current="page"' : ''}`)}</div><div class="hadith-explorer-body"></div>`;
    this.root.querySelectorAll('[data-mode]').forEach(el => el.onclick = () => this.setMode(el.dataset.mode));
    if (this.mode === 'topics') this.renderTopics(); else this.renderSource();
  }

  renderSource() {
    const body = this.root.querySelector('.hadith-explorer-body');
    const tree = buildSourceTree(this.rows);
    const { collection, book, chapter } = this.path;
    if (!collection) {
      body.innerHTML = `<div class="meta">Koleksion → Libër → Kapitull → Hadith</div><div class="grid">${[...tree.entries()].map(([name, books]) => `<button class="collection" data-collection="${esc(name)}"><h3>${esc(name)}</h3><p>${[...books.values()].reduce((n, chapters) => n + [...chapters.values()].reduce((s, hs) => s + hs.length, 0), 0)} hadithe • ${books.size} libra</p></button>`).join('')}</div>`;
      body.querySelectorAll('[data-collection]').forEach(el => el.onclick = () => { this.path.collection = el.dataset.collection; this.renderSource(); });
      return;
    }
    const books = tree.get(collection) || new Map();
    if (!book) {
      body.innerHTML = `${button('← Koleksionet','data-back="collections"')}<h3>${esc(collection)}</h3><div class="grid">${[...books.entries()].map(([name, chapters]) => `<button class="collection" data-book="${esc(name)}"><h3>${esc(name)}</h3><p>${[...chapters.values()].reduce((s, hs) => s + hs.length, 0)} hadithe • ${chapters.size} kapituj</p></button>`).join('')}</div>`;
      body.querySelector('[data-back]').onclick = () => { this.path.collection=''; this.renderSource(); };
      body.querySelectorAll('[data-book]').forEach(el => el.onclick = () => { this.path.book = el.dataset.book; this.renderSource(); });
      return;
    }
    const chapters = books.get(book) || new Map();
    if (!chapter) {
      body.innerHTML = `${button('← Librat','data-back="books"')}<h3>${esc(book)}</h3><div class="grid">${[...chapters.entries()].map(([name, hs]) => `<button class="collection" data-chapter="${esc(name)}"><h3>${esc(name)}</h3><p>${hs.length} hadithe</p></button>`).join('')}</div>`;
      body.querySelector('[data-back]').onclick = () => { this.path.book=''; this.renderSource(); };
      body.querySelectorAll('[data-chapter]').forEach(el => el.onclick = () => { this.path.chapter = el.dataset.chapter; this.renderSource(); });
      return;
    }
    const hadiths = chapters.get(chapter) || [];
    body.innerHTML = `${button('← Kapitujt','data-back="chapters"')}<h3>${esc(chapter)}</h3><div>${hadiths.map(h => this.hadithCard(h)).join('')}</div>`;
    body.querySelector('[data-back]').onclick = () => { this.path.chapter=''; this.renderSource(); };
    this.bindHadiths(body);
  }

  renderTopics() {
    const body = this.root.querySelector('.hadith-explorer-body');
    const index = buildTopicIndex(this.rows);
    body.innerHTML = `<div class="meta">Tematikat janë indeks i pavarur; nuk ndryshojnë koleksionin, librin apo kapitullin burimor.</div><div class="grid">${[...index.entries()].sort((a,b)=>a[0].localeCompare(b[0],'sq')).map(([topic, hs]) => `<button class="collection" data-topic="${esc(topic)}"><h3>${esc(topic)}</h3><p>${hs.length} hadithe</p></button>`).join('')}</div><div data-topic-results></div>`;
    body.querySelectorAll('[data-topic]').forEach(el => el.onclick = () => {
      const hs = index.get(el.dataset.topic) || [];
      const out = body.querySelector('[data-topic-results]');
      out.innerHTML = `<h3>${esc(el.dataset.topic)}</h3>${hs.map(h => this.hadithCard(h)).join('')}`;
      this.bindHadiths(out);
    });
  }

  hadithCard(h) {
    const grade = h.preferredGrade || {};
    const hierarchy = h.hierarchy || {};
    return `<article class="item"><h3>${esc(h.title || `Hadithi ${h.number || ''}`)}</h3><div class="meta">${esc(hierarchy.collection)}${hierarchy.book ? ` • ${esc(hierarchy.book)}` : ''}${hierarchy.chapter ? ` • ${esc(hierarchy.chapter)}` : ''}</div>${h.arabic ? `<div class="arabic">${esc(h.arabic)}</div>` : ''}${h.albanian ? `<p class="translation">${esc(h.albanian)}</p>` : ''}${grade.grade ? `<div class="facts"><span class="fact grade">${esc(h.gradeLabel)}: ${esc(grade.grade)}</span>${grade.grader ? `<span class="fact">${esc(grade.grader)}</span>` : ''}${grade.source ? `<span class="fact">${esc(grade.source)}</span>` : ''}</div>` : ''}<button class="btn" data-hadith-id="${esc(h.id)}">Hap hadithin</button></article>`;
  }

  bindHadiths(scope) {
    scope.querySelectorAll('[data-hadith-id]').forEach(el => el.onclick = () => {
      const h = this.rows.find(row => String(row.id) === String(el.dataset.hadithId));
      if (h) this.onSelectHadith(h);
    });
  }
}

export async function loadHadithCollections(manifestUrl='../../data/hadith/manifest.json', baseUrl='../../data/hadith/') {
  const manifest = await fetch(manifestUrl).then(r => { if (!r.ok) throw new Error(`Manifest ${r.status}`); return r.json(); });
  const groups = await Promise.all((manifest.collections || []).map(async c => {
    const data = await fetch(baseUrl + c.file).then(r => { if (!r.ok) throw new Error(`${c.file} ${r.status}`); return r.json(); });
    return Array.isArray(data.rows) ? data.rows : [];
  }));
  return { manifest, rows: groups.flat().map(hadithViewModel) };
}
