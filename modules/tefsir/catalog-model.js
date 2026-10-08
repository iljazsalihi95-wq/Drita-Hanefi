(function(g){
'use strict';
const clean=v=>String(v??'').trim();
const pick=(o,...keys)=>{for(const k of keys){const v=o?.[k];if(clean(v))return v}return ''};
const raw=(r,...keys)=>pick(r?.raw||{},...keys);
const verseKey=(reference,surah,ayah)=>{
  const m=clean(reference).match(/(\d{1,3})\s*:\s*(\d{1,3})/);
  return m?`${m[1]}:${m[2]}`:(clean(surah)&&clean(ayah)?`${clean(surah)}:${clean(ayah)}`:'');
};
function normalize(r={}){
  const reference=pick(r,'reference')||raw(r,'Referenca');
  const surah=pick(r,'surah')||raw(r,'Sure');
  const ayah=pick(r,'ayah')||raw(r,'Ajeti');
  return {
    id:pick(r,'id')||raw(r,'ID'), surah, ayah, key:verseKey(reference,surah,ayah),
    title:pick(r,'title','topic')||raw(r,'Tema'), subtopic:pick(r,'subtopic')||raw(r,'Nëntema'),
    arabic:pick(r,'arabic')||raw(r,'Teksti arab','Teksti Arab'),
    transliteration:pick(r,'transliteration')||raw(r,'Transkriptimi'),
    translation:pick(r,'albanian','translation')||raw(r,'Përkthimi shqip'),
    tafsir:pick(r,'tafsir','commentary')||raw(r,'Tefsiri i plotë'),
    originalTafsirArabic:pick(r,'originalTafsirArabic')||raw(r,'Teksti burimor i tefsirit'),
    author:pick(r,'author')||raw(r,'Autori'), work:pick(r,'work')||raw(r,'Vepra'),
    section:pick(r,'section')||raw(r,'Kitab/Bab/Fasl'), reference,
    occasion:pick(r,'occasion')||raw(r,'Sebeb en-nuzul'), fiqh:pick(r,'fiqh')||raw(r,'Fikh'),
    aqidah:pick(r,'aqidah')||raw(r,'Akide'), language:pick(r,'language')||raw(r,'Gjuhë/Lugha'),
    editorial:pick(r,'editorial')||raw(r,'Koment redaksional'),
    additional:pick(r,'additional')||raw(r,'Burime plotësuese'), keywords:pick(r,'keywords')||raw(r,'Fjalë kyçe'),
    status:raw(r,'Statusi')||pick(r,'status'), verified:pick(r,'verified')||raw(r,'Data verifikimit'),
    url:pick(r,'url')||raw(r,'URL burimi')
  };
}
function publishable(x){
  const required=[x.id,x.surah,x.ayah,x.arabic,x.translation,x.tafsir,x.author,x.work,x.reference];
  const audit=[x.title,x.tafsir,x.editorial,x.reference,x.additional].join(' ');
  const invalidSource=x.url&&/dar-alifta\.org\/ar\/fatwa\/details\/21036\/?$/i.test(x.url);
  return required.every(Boolean)&&!invalidSource&&(!x.status||/^PUBLIKUAR\b/i.test(x.status))&&
    !/^(?:Material|Përmbledhje tematike)$/i.test(x.title)&&
    !/JO CITIM LITERAL|PROVIZOR|PËR VERIFIKIM|PËR T[.’']?U SHTUAR|DO TË PLOTËSOHEN|MBETET I VEÇUAR|PLACEHOLDER|DEMO/i.test(audit);
}
function build(rows=[]){
  const seen=new Set(), records=rows.map(normalize).filter(publishable).filter(x=>x.id&&!seen.has(x.id)&&seen.add(x.id));
  const verses=new Map(), authors=new Map();
  records.forEach(x=>{
    const vk=x.key||`${x.surah}:${x.ayah}`;
    if(!verses.has(vk))verses.set(vk,{key:vk,surah:x.surah,ayah:x.ayah,arabic:x.arabic,translation:x.translation,transliteration:x.transliteration,commentaries:[]});
    verses.get(vk).commentaries.push(x);
    if(!authors.has(x.author))authors.set(x.author,{name:x.author,works:new Map(),count:0});
    const a=authors.get(x.author);a.count++;
    if(!a.works.has(x.work))a.works.set(x.work,[]);a.works.get(x.work).push(x);
  });
  return {records,verses,authors,byVerse:key=>verses.get(String(key))||null,byAuthor:name=>authors.get(String(name))||null};
}
g.DritaTefsir={normalize,publishable,build,verseKey};
})(window);
