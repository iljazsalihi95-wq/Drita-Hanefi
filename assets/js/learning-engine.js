/* Drita Hanefi — shared learning engine for Quran/Hadith. No remote data, no placeholders. */
(function(g){
  "use strict";
  const DAY=86400000, INTERVALS=[0,1,3,7,30];
  function today(t=Date.now()){const d=new Date(t);d.setHours(0,0,0,0);return d.getTime()}
  function safeParse(s,f){try{return JSON.parse(s)}catch(e){return f}}
  class LearningEngine{
    constructor(opts={}){
      this.kind=opts.kind==="hadith"?"hadith":"quran";
      this.key=opts.storageKey||`drita_hanefi_${this.kind}_learning_v1`;
      this.goalChoices=this.kind==="hadith"?[1,2,3]:[1,3,5];
      this.data=safeParse(localStorage.getItem(this.key),null)||{goal:this.goalChoices[0],items:{},streak:{last:0,count:0}};
      if(!this.goalChoices.includes(Number(this.data.goal)))this.data.goal=this.goalChoices[0];
      this.data.items=this.data.items||{};this.data.streak=this.data.streak||{last:0,count:0};this.save();
    }
    save(){localStorage.setItem(this.key,JSON.stringify(this.data))}
    setGoal(n){n=Number(n);if(!this.goalChoices.includes(n))throw Error("Objektiv i palejuar");this.data.goal=n;this.save();return n}
    getGoal(){return Number(this.data.goal)}
    item(id){id=String(id);return this.data.items[id]||(this.data.items[id]={stage:0,score:0,mistakes:0,repetitions:0,nextReview:today(),lastReview:0,learned:false})}
    phase(id){return ["Dëgjo","Ndiq","Përsërit","Testo"][Math.min(3,this.item(id).stage||0)]}
    advance(id){const x=this.item(id);x.stage=Math.min(3,(x.stage||0)+1);this.save();return this.phase(id)}
    recordRepeat(id,count=1){const x=this.item(id);x.repetitions=(x.repetitions||0)+Math.max(1,Number(count)||1);this.save();return x.repetitions}
    grade(id,score){score=Math.max(0,Math.min(100,Number(score)||0));const x=this.item(id);x.score=score;x.lastReview=Date.now();if(score<60){x.learned=false;x.mistakes=(x.mistakes||0)+1;x.stage=Math.min(2,x.stage||0);x.nextReview=today()+DAY}else if(score<85){x.learned=false;x.stage=3;x.nextReview=today()+DAY}else{x.learned=true;x.stage=3;const reviews=(x.successfulReviews||0)+1;x.successfulReviews=reviews;x.nextReview=today()+INTERVALS[Math.min(reviews,INTERVALS.length-1)]*DAY}this._streak();this.save();return x}
    miss(id){const x=this.item(id);x.mistakes=(x.mistakes||0)+1;x.learned=false;x.nextReview=today();this.save();return x}
    due(at=Date.now()){const t=today(at);return Object.entries(this.data.items).filter(([,x])=>Number(x.nextReview||0)<=t).sort((a,b)=>(b[1].mistakes||0)-(a[1].mistakes||0)).map(([id,x])=>({id,...x}))}
    dailyQueue(ids=[]){const due=this.due().map(x=>x.id),seen=new Set(due),fresh=ids.map(String).filter(id=>!seen.has(id)&&!this.data.items[id]).slice(0,this.getGoal());return [...due,...fresh]}
    progress(ids=[]){const list=ids.map(String),done=list.filter(id=>this.data.items[id]?.learned).length;return{total:list.length,learned:done,percent:list.length?Math.round(done/list.length*100):0,due:this.due().length,goal:this.getGoal(),streak:this.data.streak.count||0}}
    _streak(){const t=today(),last=today(this.data.streak.last||0);if(last===t)return;if(last===t-DAY)this.data.streak.count=(this.data.streak.count||0)+1;else this.data.streak.count=1;this.data.streak.last=t}
    static shuffle(parts){const a=[...parts];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
    static chunks(text,size=3){const a=String(text||"").trim().split(/\s+/).filter(Boolean),out=[];for(let i=0;i<a.length;i+=size)out.push(a.slice(i,i+size).join(" "));return out}
    static missingWord(text){const a=String(text||"").trim().split(/\s+/).filter(Boolean);if(!a.length)return null;const i=Math.floor(Math.random()*a.length),answer=a[i];a[i]="_____";return{prompt:a.join(" "),answer,index:i}}
    static nextPart(parts,index){index=Number(index)||0;return index>=0&&index<parts.length-1?parts[index+1]:null}
  }
  g.DritaLearning=LearningEngine;
})(window);
