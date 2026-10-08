/* Drita Hanefi • Hadith learning controller. Works only with real rendered hadith records. */
(function(){
'use strict';
const Engine=window.DritaLearning;
if(!Engine)return;
const engine=new Engine({kind:'hadith',storageKey:'drita_hanefi_hadith_learning_v1'});
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const repeatRuns=new Map();
function idOf(card){return String(card.id||'').replace(/^h-/,'')}
function textOf(card){return $('.arabic',card)?.textContent.trim()||''}
function ensurePanel(){
 let p=$('#hadithLearningPanel'); if(p)return p;
 p=document.createElement('section');p.id='hadithLearningPanel';p.className='item';
 p.innerHTML='<h3>🧠 Mësimi i Hadithit</h3><div class="facts"><label class="fact">Objektivi ditor <select id="hadithGoal" class="select"><option>1</option><option>2</option><option>3</option></select></label><span class="fact" id="hadithDue"></span><span class="fact" id="hadithStreak"></span></div><p class="learnnote">Dëgjo → Ndiq → Përsërit → Testo. Përsëritjet planifikohen pas 1, 3, 7 dhe 30 ditësh; gabimet kthehen më shpesh. Audio luhet vetëm kur rekordi ka burim real.</p>';
 const hero=$('.hero');hero?.insertAdjacentElement('afterend',p);
 $('#hadithGoal').value=String(engine.getGoal());$('#hadithGoal').onchange=e=>{engine.setGoal(e.target.value);refresh()};return p;
}
function refresh(){ensurePanel();const cards=$$('.item[id^="h-"]'),ids=cards.map(idOf),pr=engine.progress(ids);$('#hadithDue').textContent='Për përsëritje: '+pr.due;$('#hadithStreak').textContent='Seria: '+pr.streak+' ditë';cards.forEach(decorate)}
function decorate(card){const id=idOf(card);if(!id||$('.dh-learn',card))return;const bar=$('.learnbar',card)||card.appendChild(document.createElement('div'));bar.classList.add('learnbar');const box=document.createElement('div');box.className='dh-learn';box.style.cssText='display:flex;gap:7px;flex-wrap:wrap;width:100%;margin-top:8px;align-items:center';box.innerHTML='<button class="statebtn dh-phase">🧠 '+engine.phase(id)+'</button><button class="statebtn dh-repeat">↻ Përsërit</button><select class="select dh-repeat-count" aria-label="Numri i përsëritjeve"><option value="1">1×</option><option value="3">3×</option><option value="5">5×</option><option value="10">10×</option></select><select class="select dh-speed" aria-label="Shpejtësia"><option value="0.75">0.75×</option><option value="1" selected>1×</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option></select><button class="statebtn dh-test">Testo</button><span class="learnnote dh-score"></span>';bar.appendChild(box);updateCard(card,id);
 $('.dh-phase',box).onclick=()=>{engine.advance(id);updateCard(card,id)};
 const audio=$('audio',card),repeatBtn=$('.dh-repeat',box),repeatSelect=$('.dh-repeat-count',box),speed=$('.dh-speed',box);
 if(!audio){repeatBtn.disabled=true;repeatSelect.disabled=true;speed.disabled=true;repeatBtn.title='Ky rekord nuk ka audio reale të regjistruar';}
 else{
   speed.onchange=()=>{audio.playbackRate=Number(speed.value)||1};
   repeatBtn.onclick=()=>startRepeat(card,id);
   audio.addEventListener('ended',()=>continueRepeat(card,id));
 }
 $('.dh-test',box).onclick=()=>quiz(card,id);
}
function startRepeat(card,id){const audio=$('audio',card);if(!audio)return;const count=Math.max(1,Number($('.dh-repeat-count',card)?.value)||1);repeatRuns.set(id,{remaining:count});audio.currentTime=0;audio.play().catch(()=>{repeatRuns.delete(id)});engine.recordRepeat(id);updateRepeatLabel(card,id,count)}
function continueRepeat(card,id){const run=repeatRuns.get(id);if(!run)return;run.remaining-=1;if(run.remaining>0){const audio=$('audio',card);if(audio){audio.currentTime=0;audio.play().catch(()=>repeatRuns.delete(id));engine.recordRepeat(id);updateRepeatLabel(card,id,run.remaining);return;}}repeatRuns.delete(id);updateRepeatLabel(card,id,0);updateCard(card,id)}
function updateRepeatLabel(card,id,remaining){const b=$('.dh-repeat',card);if(b)b.textContent=remaining>0?'↻ Mbeten '+remaining:'↻ Përsërit'}
function updateCard(card,id){const x=engine.item(id),b=$('.dh-phase',card),s=$('.dh-score',card);if(b)b.textContent='🧠 '+engine.phase(id);if(s)s.textContent='Përsëritje '+(x.repetitions||0)+' • Rezultat '+(x.score||0)+'%'+(x.learned?' • ✓ Mësuar':'')}
function quiz(card,id){const text=textOf(card);if(!text)return;const q=Engine.missingWord(text);if(!q)return;const old=$('.dh-quiz',card);old?.remove();const box=document.createElement('div');box.className='notice dh-quiz';box.innerHTML='<b>Plotëso fjalën që mungon:</b><div class="arabic" style="margin-top:8px">'+esc(q.prompt)+'</div><input class="search dh-answer" autocomplete="off" placeholder="Shkruaj fjalën arabe"><button class="btn gold dh-check">Kontrollo</button><span class="learnnote dh-result"></span>';$('.learnbar',card)?.insertAdjacentElement('beforebegin',box);$('.dh-check',box).onclick=()=>{const ans=$('.dh-answer',box).value.trim(),ok=norm(ans)===norm(q.answer),score=ok?100:40;engine.grade(id,score);$('.dh-result',box).textContent=ok?' ✓ Saktë — planifikohet përsëritja.':' ✗ Përgjigjja: '+q.answer+' — ky hadith kthehet përsëri.';updateCard(card,id);refresh()}}
function norm(s){return String(s||'').normalize('NFKD').replace(/[\u064B-\u065F\u0670]/g,'').replace(/\s+/g,' ').trim()}
function esc(s){return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
const observer=new MutationObserver(()=>refresh());
document.addEventListener('DOMContentLoaded',()=>{ensurePanel();refresh();observer.observe(document.body,{childList:true,subtree:true})});
})();