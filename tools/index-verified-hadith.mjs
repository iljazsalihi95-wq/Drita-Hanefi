import {readdir,readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'../data/hadith/verified');
const files=[],unavailable=[];
for(const name of (await readdir(root)).filter(n=>n.endsWith('.json')&&n!=='index.json').sort()){
 try{const data=JSON.parse(await readFile(resolve(root,name),'utf8'));const rows=Array.isArray(data)?data:data.rows;if(!Array.isArray(rows))throw Error('No row array');files.push({file:name,rows:rows.length})}
 catch(e){unavailable.push({file:name,error:'JSON i pavlefshëm; skedari burimor u ruajt pa ndryshime.'})}
}
await writeFile(resolve(root,'index.json'),JSON.stringify({version:1,files,unavailable},null,2)+'\n');
console.log(`Verified-batch index: ${files.length} readable files; ${unavailable.length} damaged files explicitly excluded`);
