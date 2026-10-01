(()=>{"use strict";
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
document.addEventListener("click",e=>{const b=e.target.closest(".tabs button");if(b){b.parentElement.querySelectorAll("button").forEach(x=>x.classList.remove("active"));b.classList.add("active")}});
const btn=document.getElementById("searchBtn"),q=document.getElementById("q"),r=document.getElementById("results");
if(btn&&q&&r)btn.addEventListener("click",()=>{const v=q.value.trim();if(v)location.href=(location.pathname.includes("/modules/")?"../tema/index.html":"modules/tema/index.html")+"?q="+encodeURIComponent(v)});
window.DH={esc};
})();