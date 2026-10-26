const text=v=>typeof v==='string'||typeof v==='number'?String(v).trim():'';
const labels={bukhari:'Sahih el-Buhari',tirmidhi:'Xhami et-Tirmidhi',abudawud:'Sunen Ebu Davud'};
export function adaptVerified(row,batch={},file='',position=0){
 const url=text(row.sourceUrl||row.url),match=url.match(/sunnah\.com\/(bukhari|tirmidhi|abudawud):([^/?#]+)/);
 const collection=match?.[1]||text(batch.collection||row.collection).toLowerCase().replace(/[^a-z]/g,'');
 const number=text(row.canonicalNumber||row.hadithNumber||row.number||match?.[2]);
 const arabic=text(row.arabic||row.matnArabic),albanian=text(row.translationSq||row.albanian);
 const book=text(row.book||batch.book),chapter=text(row.chapter),sourceUrl=/^https:\/\//.test(url)?url:'';
 if(!collection||!number||!arabic||!albanian||!book||!chapter||!sourceUrl)return null;
 return {...row,id:`verified-${file}-${position}`,collection,collectionLabel:labels[collection]||text(batch.collectionLabel||row.collectionLabel||row.collection),number,book,bookNumber:text(row.bookNumber||batch.bookNumber),chapter,arabic,albanian,chain:text(row.isnad||row.chain),companion:text(row.narrator||row.companion),grader:text(row.gradeAuthority||row.grader),gradeSource:text(row.gradeReference||sourceUrl),commentary:text(row.comment||row.commentary),hanafiCommentary:text(row.hanafiFiqh||row.hanafiCommentary),topics:row.themes||row.topics||row.topic||[],sourceUrl,reference:text(row.reference||row.gradeReference)||sourceUrl,audioArabic:text(row.audioArabic||row.audioUrl),audioAlbanian:text(row.audioAlbanian),verifiedBatch:file};
}
export async function loadVerifiedBatches(baseUrl='../../data/hadith/verified/'){
 let index;try{const response=await fetch(baseUrl+'index.json');if(!response.ok)throw Error();index=await response.json()}catch{return {rows:[],unavailable:['Indeksi i batch-eve të Hadithit nuk u ngarkua.'],excluded:0}}
 const rows=[],unavailable=(index.unavailable||[]).map(x=>x.file+': '+x.error);let cursor=0,excluded=0;
 async function worker(){while(cursor<(index.files||[]).length){const entry=index.files[cursor++];if(!/^[a-zA-Z0-9_.-]+\.json$/.test(entry.file)){unavailable.push('Emër skedari i pavlefshëm');continue}try{const response=await fetch(baseUrl+entry.file);if(!response.ok)throw Error(response.status);const data=await response.json();for(const [i,row] of (Array.isArray(data)?data:data.rows||[]).entries()){const adapted=adaptVerified(row,Array.isArray(data)?{}:data,entry.file,i);if(adapted)rows.push(adapted);else excluded++}}catch{unavailable.push(entry.file+': nuk u lexua')}}}
 await Promise.all(Array.from({length:8},worker));
 // Deduplicate only an identical canonical source URL. Never merge by topic or by local source number.
 const bySource=new Map();for(const row of rows.sort((a,b)=>a.id.localeCompare(b.id))){const prior=bySource.get(row.sourceUrl);if(!prior||row.albanian.length+row.arabic.length>prior.albanian.length+prior.arabic.length)bySource.set(row.sourceUrl,row)}
 return {rows:[...bySource.values()],unavailable,excluded};
}
