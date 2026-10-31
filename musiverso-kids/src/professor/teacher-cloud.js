/* Account-scoped teacher storage. Independent rows prevent unrelated students or days overwriting one another. */
(async()=>{
'use strict';
const loading=document.getElementById('teacherLoading'),content=document.getElementById('teacherContent'),status=document.getElementById('teacherSync');
let client,user,cacheKey,records={},pending={},busy=false,stopped=false,timer;
const tell=t=>status.textContent=t;
const persist=()=>{localStorage.setItem(cacheKey,JSON.stringify({records,pending}))};
async function query(q){const c=new AbortController(),t=setTimeout(()=>c.abort(),10000);try{return await q.abortSignal(c.signal)}finally{clearTimeout(t)}}
async function sync(){
 if(busy||stopped)return;busy=true;
 try{
  const {data:session}=await client.auth.getSession();if(session.session?.user?.id!==user.id){stopped=true;content.hidden=true;location.replace('../acesso.html');return}
  tell('Sincronizando sua conta…');
  while(Object.keys(pending).length){
   const batch=Object.entries(pending).slice(0,100);const {error}=await query(client.from('kids_teacher_records').upsert(batch.map(([record_key,value])=>({user_id:user.id,record_key,value,updated_at:new Date().toISOString()})),{onConflict:'user_id,record_key'}));if(error)throw error;
   for(const [k,v] of batch)if(JSON.stringify(pending[k])===JSON.stringify(v))delete pending[k];persist();
  }
  const remote={};let offset=0;
  while(true){const {data,error}=await query(client.from('kids_teacher_records').select('record_key,value').eq('user_id',user.id).order('record_key').range(offset,offset+499));if(error)throw error;for(const r of data)remote[r.record_key]=r.value;if(data.length<500)break;offset+=500;}
  records={...remote,...pending};persist();tell(Object.keys(pending).length?'Alterações pendentes de sincronização.':'Dados sincronizados com sua conta.');
 }catch{tell('Sem sincronização no momento. Alterações guardadas neste aparelho; tente novamente.')}finally{busy=false;}
}
function write(entries){const next={...records,...entries},queue={...pending,...entries};localStorage.setItem(cacheKey,JSON.stringify({records:next,pending:queue}));records=next;pending=queue;tell('Salvo neste aparelho; sincronização pendente…');clearTimeout(timer);timer=setTimeout(sync,200)}
window.TeacherStorage={
 getItem(key){
  if(key==='musiverso-demo-students')return JSON.stringify(Object.entries(records).filter(([k,v])=>k.startsWith('student:')&&v).map(([,v])=>v).sort((a,b)=>a.id.localeCompare(b.id)));
  if(key==='musiverso-teacher-demo-attendance')return JSON.stringify(Object.fromEntries(Object.entries(records).filter(([k,v])=>k.startsWith('attendance:')&&v).map(([k,v])=>[k.slice(11),v])));
  return records[key]===undefined||records[key]===null?null:JSON.stringify(records[key]);
 },
 setItem(key,value){
  if(key==='musiverso-demo-students'){const entries={};for(const s of JSON.parse(value))if(JSON.stringify(records['student:'+s.id])!==JSON.stringify(s))entries['student:'+s.id]=s;write(entries);return}
  if(key==='musiverso-teacher-demo-attendance'){const next=JSON.parse(value),entries={};for(const [k,v] of Object.entries(next))if(JSON.stringify(records['attendance:'+k])!==JSON.stringify(v))entries['attendance:'+k]=v;for(const k of Object.keys(records).filter(k=>k.startsWith('attendance:')))if(!(k.slice(11) in next))entries[k]=null;write(entries);return}
  // Age preference is a plain string; reports are JSON objects.
  let parsed;try{parsed=JSON.parse(value)}catch{parsed=value}write({[key]:parsed});
 }
};
// Preserve the localStorage string contract for the age selector.
const get=TeacherStorage.getItem;TeacherStorage.getItem=key=>key==='musiverso-course-age'?(records[key]||null):get(key);
try{
 client=window.supabase.createClient('https://hwbmmypllglujmxuypdw.supabase.co','sb_publishable_wKe1DH_0_UIQuBXgkEYK_g_KGyVKLn-');
 const {data,error}=await client.auth.getUser();if(error||!data.user){location.replace('../acesso.html');return}user=data.user;cacheKey='musiverso-teacher-v1:'+user.id;
 client.auth.onAuthStateChange((event,session)=>{if(event==='SIGNED_OUT'||(session?.user?.id&&session.user.id!==user.id)){stopped=true;content.hidden=true;location.replace('../acesso.html')}});
 try{const saved=JSON.parse(localStorage.getItem(cacheKey)||'{}');records=saved.records||{};pending=saved.pending||{}}catch{}
 await sync();if(stopped)return;
 for(const file of ['registration.js','preschool.js','demo.js'])await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=file+'?v=teacher-1';s.onload=resolve;s.onerror=reject;document.body.append(s)});
 content.hidden=false;loading.remove();document.getElementById('teacherSyncNow').onclick=async()=>{await sync();window.dispatchEvent(new Event('teacher-refreshed'))};
 window.addEventListener('online',sync);window.addEventListener('focus',sync);setInterval(()=>{if(!document.hidden)sync()},15000);
 window.addEventListener('beforeunload',e=>{if(Object.keys(pending).length){e.preventDefault();e.returnValue=''}});
 window.addEventListener('pagehide',()=>{content.hidden=true});window.addEventListener('pageshow',e=>{if(e.persisted)location.reload()});
}catch{loading.textContent='Não foi possível abrir o Espaço do Professor. Verifique a conexão e atualize a página.'}
})();
