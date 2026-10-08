(()=>{
'use strict';
const MODULES=[
 {id:'quran',label:'Kurani',icon:'📖',href:'modules/quran/index.html'},
 {id:'hadith',label:'Hadithi',icon:'📜',href:'modules/hadith/index.html'},
 {id:'fikh',label:'Fikhu',icon:'⚖️',href:'modules/fikh/index.html'},
 {id:'tefsir',label:'Tefsiri',icon:'📚',href:'modules/tefsir/index.html'},
 {id:'akide',label:'Akide',icon:'✦',href:'modules/akide/index.html'},
 {id:'abetare',label:'Abetarja',icon:'ا',href:'modules/abetare/index.html'}
];
const isRoot=location.pathname.endsWith('/')||/\/index\.html$/.test(location.pathname)&&!location.pathname.includes('/modules/')&&!location.pathname.includes('/admin/');
const root=isRoot?'':'../../';
const current=location.pathname.match(/\/modules\/([^/]+)/)?.[1]||'home';
try{if(current!=='home')localStorage.setItem('dh:lastModule',JSON.stringify({id:current,href:location.pathname,at:Date.now()}));}catch(_){ }
function installNav(){
 if(document.querySelector('.dh-bottom-nav'))return;
 const nav=document.createElement('nav');nav.className='dh-bottom-nav';nav.setAttribute('aria-label','Navigimi kryesor');
 const primary=[{id:'home',label:'Ballina',icon:'⌂',href:root+'index.html'},...MODULES.slice(0,4).map(x=>({...x,href:root+x.href}))];
 nav.innerHTML=primary.map(x=>`<a class="${current===x.id?'active':''}" href="${x.href}"><span>${x.icon}</span><small>${x.label}</small></a>`).join('');
 document.body.appendChild(nav);
}
function installStyles(){
 if(document.getElementById('dh-shell-style'))return;
 const s=document.createElement('style');s.id='dh-shell-style';s.textContent=`.dh-bottom-nav{position:fixed;z-index:95;left:50%;bottom:max(10px,env(safe-area-inset-bottom));transform:translateX(-50%);width:min(620px,calc(100% - 20px));display:grid;grid-template-columns:repeat(5,1fr);gap:3px;padding:7px;background:#061b18ed;border:1px solid #ffffff20;border-radius:20px;box-shadow:0 14px 45px #0009;backdrop-filter:blur(18px)}.dh-bottom-nav a{min-width:0;padding:7px 3px 6px;border-radius:13px;text-decoration:none;color:#9fc1b8;text-align:center;font:700 10px/1.1 system-ui}.dh-bottom-nav a span{display:block;font-size:19px;line-height:22px;margin-bottom:3px}.dh-bottom-nav a.active{background:#e8c96d;color:#14251f}.dh-continue{margin:0 0 18px;padding:14px 16px;border:1px solid #e8c96d55;border-radius:17px;background:linear-gradient(135deg,#153d33,#09251f);display:flex;align-items:center;gap:12px;text-decoration:none;color:#f8f5e9}.dh-continue b{display:block;color:#f4d978}.dh-continue small{color:#b8cec5}.dh-continue .go{margin-left:auto;color:#e8c96d;font-size:22px}@media(min-width:900px){.dh-bottom-nav{bottom:16px}}`;
 document.head.appendChild(s);
}
function continueCard(){
 if(!isRoot)return;
 let last=null;try{last=JSON.parse(localStorage.getItem('dh:lastModule')||'null')}catch(_){ }
 if(!last?.id)return;
 const m=MODULES.find(x=>x.id===last.id);if(!m)return;
 const grid=document.querySelector('.grid');if(!grid)return;
 const a=document.createElement('a');a.className='dh-continue';a.href=m.href;a.innerHTML=`<span style="font-size:28px">${m.icon}</span><span><b>Vazhdo aty ku mbete</b><small>${m.label} · progresi ruhet në këtë pajisje</small></span><span class="go">›</span>`;
 grid.parentNode.insertBefore(a,grid);
}
function moduleLinks(){
 if(current==='home')return;
 const host=document.querySelector('main,.wrap,.app');if(!host||document.querySelector('.dh-related'))return;
 const related={quran:['tefsir','fikh'],tefsir:['quran','fikh'],fikh:['quran','hadith'],hadith:['fikh','quran'],akide:['quran','tefsir'],abetare:['quran','texhvid']}[current];if(!related)return;
 const box=document.createElement('div');box.className='dh-related';box.style.cssText='display:flex;gap:8px;flex-wrap:wrap;margin:14px 0 70px';
 box.innerHTML=related.map(id=>{const m=MODULES.find(x=>x.id===id)||{id,label:id,icon:'•',href:`modules/${id}/index.html`};return `<a href="${root}${m.href}" style="text-decoration:none;color:#f4d978;border:1px solid #e8c96d55;background:#0b3028;padding:9px 12px;border-radius:12px;font:800 12px system-ui">${m.icon} ${m.label}</a>`}).join('');
 host.appendChild(box);
}
installStyles();installNav();continueCard();moduleLinks();
})();
