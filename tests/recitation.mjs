import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const context={};vm.createContext(context);vm.runInContext(readFileSync('assets/js/recitation.js','utf8'),context);
const {align,normalize}=context.DritaRecitation;
assert.equal(normalize('ٱلرَّحْمَٰنِ'),'الرحمن');
assert.equal(align('بسم الله الرحمن الرحيم','بسم الله الرحمن الرحيم').words.every(w=>w.match),true);
assert.equal(align('بسم الله الرحمن الرحيم','بسم الرحمن الرحيم').words[1].match,false);
assert.equal(align('بسم الله الرحمن الرحيم','بسم الرحمن الرحيم').words[2].match,true);
assert.equal(align('بسم الله','بسم هو الله').extra[0],'هو');
assert.equal(align('بسم الله','').words.some(w=>w.match),false);
for(const module of ['quran','abetare']){
 const html=readFileSync(`modules/${module}/index.html`,'utf8');
 for(const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi))if(!/src=/.test(match[1])&&match[2].trim())new vm.Script(match[2]);
}
console.log('PASS: Arabic normalization, exact/missing/extra/empty alignment and module script syntax');
