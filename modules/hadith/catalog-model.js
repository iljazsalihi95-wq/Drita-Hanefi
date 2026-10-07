/* Drita Hanefi — Hadith catalog domain model.
   Collections/books/chapters are source hierarchy. Topics are independent tags.
   No grading is inferred or fabricated. */
export function normalizeHadith(raw = {}) {
  const originalGrade = clean(raw.originalGrade || raw.grade);
  const originalGrader = clean(raw.originalGrader || raw.grader);
  const hanafiGrade = clean(raw.hanafiGrade);
  const hanafiGrader = clean(raw.hanafiGrader);
  const hanafiGradeSource = clean(raw.hanafiGradeSource);
  const topics = unique([
    ...asArray(raw.topics),
    ...asArray(raw.topic),
    ...asArray(raw.subtopic)
  ].map(clean).filter(Boolean));

  return {
    ...raw,
    collection: clean(raw.collection),
    collectionLabel: clean(raw.collectionLabel),
    book: clean(raw.book),
    bookNumber: clean(raw.bookNumber),
    chapter: clean(raw.chapter),
    chapterId: clean(raw.chapterId),
    number: clean(raw.number),
    topics,
    originalGrade,
    originalGrader,
    hanafiGrade,
    hanafiGrader,
    hanafiGradeSource,
    otherGrades: asArray(raw.otherGrades).filter(Boolean),
    audioArabic: clean(raw.audioArabic || raw.audio),
    audioAlbanian: clean(raw.audioAlbanian),
    downloadUrl: clean(raw.downloadUrl),
    serverUrl: clean(raw.serverUrl)
  };
}

export function preferredGrade(hadith) {
  const h = normalizeHadith(hadith);
  if (h.hanafiGrade) return {
    grade: h.hanafiGrade,
    grader: h.hanafiGrader,
    source: h.hanafiGradeSource,
    basis: 'hanafi'
  };
  if (h.originalGrade) return {
    grade: h.originalGrade,
    grader: h.originalGrader,
    source: clean(hadith.gradeSource || hadith.reference),
    basis: 'original'
  };
  return { grade: '', grader: '', source: '', basis: 'unverified' };
}

export function sourceHierarchy(hadith) {
  const h = normalizeHadith(hadith);
  return [h.collectionLabel || h.collection, h.book, h.chapter, h.number ? `Hadithi ${h.number}` : '']
    .filter(Boolean);
}

export function topicTags(hadith) {
  return normalizeHadith(hadith).topics;
}

export function hasDocumentedHanafiGrade(hadith) {
  const h = normalizeHadith(hadith);
  return Boolean(h.hanafiGrade && h.hanafiGrader && h.hanafiGradeSource);
}

export function audioSources(hadith) {
  const h = normalizeHadith(hadith);
  return {
    arabic: h.audioArabic,
    albanian: h.audioAlbanian,
    download: h.downloadUrl,
    server: h.serverUrl
  };
}

function clean(value) { return String(value ?? '').trim(); }
function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value == null || value === '') return [];
  return String(value).split(/\s*[|;,]\s*/).filter(Boolean);
}
function unique(values) { return [...new Set(values)]; }
