import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {adaptVerified,loadVerifiedBatches} from '../modules/hadith/verified-loader.js';
import {buildSourceTree,buildTopicIndex} from '../modules/hadith/catalog-controller.js';
const root=resolve(import.meta.dirname,'../data/hadith/verified');
const realFetch=globalThis.fetch;
globalThis.fetch=async url=>{try{return new Response(await readFile(resolve(root,String(url))),{headers:{'Content-Type':'application/json'}})}catch{return new Response('',{status:404})}};
try{
 const result=await loadVerifiedBatches('');
 assert(result.rows.length>4000,`Unexpected readable batch count: ${result.rows.length}`);
 assert(result.unavailable.length>=3,'Damaged batches must be explicitly reported');
 const h=result.rows.find(x=>x.sourceUrl==='https://sunnah.com/bukhari:509');assert(h?.albanian&&h.arabic&&h.chain&&h.grader);
 assert.equal(h.collection,'bukhari');assert.equal(h.bookNumber,'8');assert.equal(h.number,'509');
 assert.equal(adaptVerified({translationSq:'Incomplete'}),null);
 assert(result.rows.every(x=>x.sourceUrl.startsWith('https://')&&x.book&&x.chapter&&x.albanian));
 const source=buildSourceTree([h]);assert(source.get('Sahih el-Buhari').has(h.book));
 const topic=buildTopicIndex([{...h,topics:['namazi']}]);assert.equal(topic.get('namazi').length,1);assert.equal(source.has('namazi'),false);
 console.log(`PASS verified batches: ${result.rows.length} distinct source URLs, canonical hierarchy, Albanian/metn/isnad/grading fields, independent tags; ${result.unavailable.length} damaged files reported, ${result.excluded} incomplete rows excluded`);
}finally{globalThis.fetch=realFetch}
