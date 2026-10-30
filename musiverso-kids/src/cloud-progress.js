(function(){
'use strict';
const fields=['name','avatar','sound','narration','large','reduced','journeyOpen','homeCuriosityIndex'];
const defaults={name:'Explorador',avatar:'🧒',sound:true,narration:false,large:false,reduced:false};
const clone=x=>JSON.parse(JSON.stringify(x||{}));
const object=x=>x&&typeof x==='object'&&!Array.isArray(x)?x:{};
const union=(a,b)=>[...new Set([...(Array.isArray(a)?a:[]),...(Array.isArray(b)?b:[])])].filter(x=>typeof x==='string'||Number.isInteger(x));
function merge(a,b){
 a=object(a);b=object(b);const out={...a,...b},ac=object(a._fieldUpdated),bc=object(b._fieldUpdated);out._fieldUpdated={};
 for(const key of fields){const at=Number(ac[key])||0,bt=Number(bc[key])||0;if(at>bt&&key in a)out[key]=clone({value:a[key]}).value;out._fieldUpdated[key]=Math.max(at,bt)}
 for(const key of ['done','wins','composerDone'])out[key]=union(a[key],b[key]);
 out.journeyAnswers={};for(const key of new Set([...Object.keys(object(a.journeyAnswers)),...Object.keys(object(b.journeyAnswers))]))out.journeyAnswers[key]=union(a.journeyAnswers?.[key],b.journeyAnswers?.[key]);
 out.composerUnlocked=Math.max(Number(a.composerUnlocked)||1,Number(b.composerUnlocked)||1);
 out.xp=Math.max(Number(a.xp)||0,Number(b.xp)||0,out.done.length*30+out.wins.length*20);
 return out;
}
let client,userId,key,working={},dirty=false,timer,busy=null,stopped=true,lastStatus='';
function status(text){lastStatus=text;window.dispatchEvent(new CustomEvent('musiverso-sync-status',{detail:text}));document.querySelectorAll('[data-sync-status]').forEach(el=>el.textContent=text)}
function storeLocal(){try{localStorage.setItem(key,JSON.stringify(working));localStorage.setItem(key+':pending',String(dirty))}catch{}}
function notify(){window.MusiversoApplyCloudProgress?.(clone(working))}
async function bounded(query){const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),8000);try{return await query.abortSignal(controller.signal)}finally{clearTimeout(timeout)}}
async function cycle(){
 if(stopped)return;
 const session=await client.auth.getSession();if(session.data?.session?.user?.id!==userId){stop();return}
 status(navigator.onLine===false?'Sem conexão — progresso salvo neste aparelho.':'Sincronizando sua conta…');
 if(navigator.onLine===false)return;
 for(let attempt=0;attempt<5&&!stopped;attempt++){
  const {data:remote,error}=await bounded(client.from('kids_progress').select('progress,revision,updated_at').eq('user_id',userId).maybeSingle());if(error)throw error;
  if(stopped)return;
  working=merge(working,remote?.progress||{});storeLocal();notify();
  if(!dirty&&remote){status('Progresso sincronizado com sua conta.');return}
  const snapshot=clone(working);
  const query=remote?client.from('kids_progress').update({progress:snapshot,revision:Number(remote.revision)+1}).eq('user_id',userId).eq('revision',remote.revision).select('revision'):client.from('kids_progress').insert({user_id:userId,progress:snapshot,revision:1}).select('revision');
  const write=await bounded(query);if(stopped)return;
  if(write.error){if(write.error.code==='23505')continue;throw write.error}
  if(!write.data?.length)continue; // Another device wrote first: read and merge again.
  if(JSON.stringify(working)===JSON.stringify(snapshot)){dirty=false;storeLocal();status('Progresso sincronizado com sua conta.');return}
 }
 if(dirty)schedule(1000);
}
function schedule(delay=500){clearTimeout(timer);if(!stopped)timer=setTimeout(()=>sync(),delay)}
function sync(){if(stopped)return Promise.resolve();if(busy)return busy;busy=cycle().catch(()=>{if(!stopped){status('Não foi possível sincronizar. Seus avanços continuam salvos neste aparelho.');schedule(15000)}}).finally(()=>{busy=null});return busy}
function save(state){if(stopped)return;const next=clone(state);next._fieldUpdated={...object(working._fieldUpdated)};for(const f of fields)if(JSON.stringify(next[f])!==JSON.stringify(working[f]))next._fieldUpdated[f]=Date.now();working=merge(working,next);dirty=true;storeLocal();status(navigator.onLine===false?'Sem conexão — progresso salvo neste aparelho.':'Alterações salvas neste aparelho; sincronização pendente.');schedule()}
function stop(){stopped=true;clearTimeout(timer)}
async function init(auth,user){client=auth;userId=user.id;key='musiverso-kids-v1:'+userId;stopped=false;working={...defaults};try{working={...defaults,...object(JSON.parse(localStorage.getItem(key)||'{}'))}}catch{}dirty=true;await sync();window.addEventListener('online',()=>sync());window.addEventListener('focus',()=>sync());document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')sync();else if(dirty)sync()});window.addEventListener('pagehide',()=>{if(dirty)sync()});setInterval(()=>{if(!stopped&&document.visibilityState==='visible')sync()},15000);return clone(working)}
window.MusiversoCloudProgress={init,save,sync,stop,merge,getStatus:()=>lastStatus};
})();
