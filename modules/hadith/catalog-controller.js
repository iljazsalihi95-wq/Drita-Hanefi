import { normalizeHadith, sourceHierarchy, topicTags, preferredGrade, audioSources } from './catalog-model.js';

export function normalizeRows(rows = []) {
  return rows.map(normalizeHadith);
}

export function buildSourceTree(rows = []) {
  const collections = new Map();
  for (const raw of rows) {
    const h = normalizeHadith(raw);
    const collection = h.collectionLabel || h.collection || 'Pa koleksion';
    const book = h.book || 'Pa libër';
    const chapter = h.chapter || 'Pa kapitull';
    if (!collections.has(collection)) collections.set(collection, new Map());
    const books = collections.get(collection);
    if (!books.has(book)) books.set(book, new Map());
    const chapters = books.get(book);
    if (!chapters.has(chapter)) chapters.set(chapter, []);
    chapters.get(chapter).push(h);
  }
  return collections;
}

export function buildTopicIndex(rows = []) {
  const topics = new Map();
  for (const raw of rows) {
    const h = normalizeHadith(raw);
    for (const topic of topicTags(h)) {
      if (!topics.has(topic)) topics.set(topic, []);
      topics.get(topic).push(h);
    }
  }
  return topics;
}

export function hadithViewModel(raw) {
  const h = normalizeHadith(raw);
  const grade = preferredGrade(h);
  const hierarchy = {
    collection: h.collectionLabel || h.collection || 'Pa koleksion',
    book: h.book || 'Pa libër',
    chapter: h.chapter || 'Pa kapitull',
    number: h.number || ''
  };
  return {
    ...h,
    hierarchy,
    breadcrumb: sourceHierarchy(h),
    topicTags: topicTags(h),
    preferredGrade: grade,
    audio: audioSources(h),
    hasVerifiedGrade: Boolean(grade.grade),
    gradeLabel: grade.basis === 'hanafi' ? 'Gradimi Hanefi' : grade.basis === 'original' ? 'Gradimi burimor' : 'Pa gradim të verifikuar'
  };
}

export function filterByTopic(rows = [], topic = '') {
  const wanted = String(topic || '').trim();
  if (!wanted) return normalizeRows(rows);
  return normalizeRows(rows).filter(h => topicTags(h).includes(wanted));
}

export function filterByHierarchy(rows = [], { collection = '', book = '', chapter = '' } = {}) {
  return normalizeRows(rows).filter(h => {
    const collectionName = h.collectionLabel || h.collection;
    return (!collection || collectionName === collection) && (!book || h.book === book) && (!chapter || h.chapter === chapter);
  });
}
