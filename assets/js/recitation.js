/* Text alignment is a learning aid, never a tajwid verdict. No audio is stored. */
(function(g){
'use strict';
const normalize=s=>String(s||'').normalize('NFKC').replace(/[\u0610-\u061a\u064b-\u065f\u0670\u06d6-\u06edـ]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/[^\u0621-\u064a\s]/g,'').trim();
function align(expected,heard){
 const a=String(expected).trim().split(/\s+/),b=normalize(heard).split(/\s+/).filter(Boolean),n=a.map(normalize),d=Array.from({length:a.length+1},()=>Array(b.length+1).fill(0));
 for(let i=0;i<=a.length;i++)d[i][0]=i;for(let j=0;j<=b.length;j++)d[0][j]=j;
 for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(n[i-1]===b[j-1]?0:1));
 let i=a.length,j=b.length,extra=[];const out=a.map(text=>({text,match:false}));
 while(i||j){if(i&&j&&d[i][j]===d[i-1][j-1]+(n[i-1]===b[j-1]?0:1)){out[i-1].match=n[i-1]===b[j-1];i--;j--}else if(i&&d[i][j]===d[i-1][j]+1)i--;else{extra.unshift(b[j-1]);j--}}
 return {words:out,extra};
}
let active=null;
function mount(host,options){
 if(active)active.cancel();
 const box=document.createElement('section');box.className='recitation';
 const start=document.createElement('button');start.type='button';start.className='mini btn';start.textContent='🎙️ Lexo ti';
 const stop=document.createElement('button');stop.type='button';stop.className='mini btn';stop.textContent='Ndal mikrofonin';stop.hidden=true;
 const status=document.createElement('p');status.setAttribute('role','status');status.textContent='Krahasim i tekstit të njohur, jo vlerësim i texhvidit. Njohja zanore mund të përdorë shërbimin online të pajisjes; aplikacioni nuk ruan zërin.';
 const result=document.createElement('div');result.dir='rtl';result.className='recitation-words';box.append(start,stop,status,result);host.append(box);
 let recognition=null,received=false,target=options.text,run=0;
 const cancel=()=>{run++;if(recognition)recognition.abort();if(g.DritaSpeech)g.DritaSpeech.cancel();start.disabled=false;stop.hidden=true};active={cancel};
 const finish=(text,confidence)=>{received=true;start.disabled=false;stop.hidden=true;result.replaceChildren();if(!text||!Number.isFinite(confidence)||confidence<0.65){status.textContent='Përputhja është e pasigurt — provo përsëri.';return}
 const aligned=align(target,text);if(normalize(target).split(/\s+/).length===1){status.textContent='Për këtë shkronjë/fjalë njohja e tekstit nuk verifikon harakatet ose texhvidin. Rezultati është vetëm përputhje teksti.';}status.textContent=(normalize(target).split(/\s+/).length===1?'Përputhje teksti; harakatet dhe texhvidi nuk verifikohen. ':'')+'Teksti që u kuptua: '+text+(aligned.extra.length?' • Fjalë shtesë: '+aligned.extra.join(' '):'');
 aligned.words.forEach(w=>{const button=document.createElement('button');button.type='button';button.textContent=w.text;button.className=w.match?'recitation-good':'recitation-bad';button.setAttribute('aria-label',w.text+(w.match?' — përputhet':' — mospërputhje'));
 button.onclick=()=>{result.querySelectorAll('button').forEach(b=>b.removeAttribute('aria-current'));button.setAttribute('aria-current','true');status.textContent='Përsërite: '+w.text+'. '+(options.wordAudio?'Dëgjo modelin.':'Audio e veçantë e fjalës nuk është verifikuar; dëgjo ajetin/shembullin e plotë.');target=w.text;start.textContent='🎙️ Provo përsëri';if(options.wordAudio)options.wordAudio(w.text);else if(options.listen)options.listen()};result.append(button)});
 if(options.onResult)options.onResult(aligned);
 };
 start.onclick=()=>{if(active&&active.cancel!==cancel)active.cancel();active={cancel};received=false;const id=++run;start.disabled=true;stop.hidden=false;status.textContent='Duke dëgjuar arabishten…';if(options.pause)options.pause();
 if(g.DritaSpeech){g.__dritaSpeechResult=(text,confidence,error)=>{if(id!==run)return;if(error){start.disabled=false;stop.hidden=true;status.textContent=error;return}finish(text,confidence)};g.DritaSpeech.start();return}
 const R=g.SpeechRecognition||g.webkitSpeechRecognition;if(!R){start.disabled=false;stop.hidden=true;status.textContent='Njohja zanore nuk mbështetet këtu. Hape në Android Drita Hanefi ose në një shfletues që mbështet arabishten.';return}
 recognition=new R();recognition.lang='ar-SA';recognition.interimResults=false;recognition.maxAlternatives=1;
 recognition.onresult=e=>{if(id!==run)return;const r=e.results[0][0];finish(r.transcript,r.confidence)};
 recognition.onerror=e=>{if(id!==run)return;received=true;start.disabled=false;stop.hidden=true;status.textContent=e.error==='not-allowed'?'Mikrofoni nuk është aktivizuar.':'Nuk u kuptua leximi. Provo përsëri.'};
 recognition.onend=()=>{if(id!==run)return;start.disabled=false;stop.hidden=true;if(!received)status.textContent='Nuk u kuptua leximi. Provo përsëri.'};try{recognition.start()}catch(e){start.disabled=false;stop.hidden=true;status.textContent='Mikrofoni nuk u nis. Provo përsëri.'}
 };stop.onclick=()=>{cancel();status.textContent='Mikrofoni u ndal.'};return {cancel,element:box};
}
g.DritaRecitation={normalize,align,mount};g.addEventListener&&g.addEventListener('pagehide',()=>active&&active.cancel());
})(typeof window==='undefined'?globalThis:window);
