/* Community notification center, visible throughout the approved teacher workspace. */
(()=>{
'use strict';
const db=window.KidsTeacherClient;
const escape=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
let items=[],open=false,loading=false,initialized=false,user=null,bell=null,panel=null,noticeTimer=0;
const labels={like:'curtiu sua publicação',follow:'começou a seguir você',comment:'comentou na sua publicação',mention:'mencionou você',share:'compartilhou uma publicação com você'};
function row(n){return `<button type="button" class="kn-item ${n.read_at?'':'kn-unread'}" data-kn-item="${n.id}" aria-label="${escape(n.actor_name+' '+(labels[n.kind]||'interagiu com você'))}">
 <span class="kn-symbol" aria-hidden="true">${{like:'♡',follow:'♙',comment:'☏',mention:'@',share:'↗'}[n.kind]||'♫'}</span>
 <span class="kn-text"><strong>${escape(n.actor_name)}</strong> ${escape(labels[n.kind]||'interagiu com você')}
 ${n.detail?`<small>${escape(n.detail)}</small>`:''}
 <span class="kn-date">${new Date(n.created_at).toLocaleString('pt-BR',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}</span></span>
 ${n.read_at?'':'<span class="kn-dot" aria-label="Não lida"></span>'}
 </button>`}
function render(){
 if(!initialized)return;
 const unread=items.filter(n=>!n.read_at).length;
 bell.setAttribute('aria-expanded',String(open));bell.setAttribute('aria-label',unread?`Notificações: ${unread} não lidas`:'Notificações');
 bell.innerHTML=`<span aria-hidden="true">🔔</span>${unread?`<span class="kn-count">${unread>99?'99+':unread}</span>`:''}`;
 panel.hidden=!open;
 panel.innerHTML=`<div class="kn-head"><div><strong>Notificações</strong><small>${unread?unread+' não lida(s)':'Tudo em dia'}</small></div><button type="button" data-kn-close aria-label="Fechar">✕</button></div>
 ${items.length?`<div class="kn-list">${items.map(row).join('')}</div>`:`<p class="kn-empty">${loading?'Carregando avisos…':'Nenhuma notificação por enquanto. Quando outros professores interagirem, você verá aqui.'}</p>`}
 ${unread?'<div class="kn-footer"><button type="button" data-kn-all>Marcar todas como lidas</button></div>':''}`;
}
function mount(){
 if(initialized)return;const header=document.querySelector('#teacherContent header .teacher');if(!header)return;
 const holder=document.createElement('div');holder.className='kn-holder';
 holder.innerHTML='<button type="button" class="kn-bell" aria-expanded="false" aria-label="Notificações">🔔</button><div class="kn-panel" hidden role="region" aria-label="Central de notificações"></div>';
 header.prepend(holder);bell=holder.querySelector('.kn-bell');panel=holder.querySelector('.kn-panel');initialized=true;render();
}
async function getUser(){if(!db)return null;const {data,error}=await db.auth.getUser();if(error||!data?.user)return null;return data.user}
async function refresh(){
 if(loading)return;loading=true;
 try{
  user=await getUser();if(!user)return;
  const {data,error}=await db.from('kids_community_notifications').select('id,actor_id,actor_name,kind,post_id,lesson_key,detail,read_at,created_at').eq('recipient_id',user.id).order('created_at',{ascending:false}).limit(60);
  if(error)throw error;
  const previous=new Set(items.map(i=>i.id));const newest=(data||[]).filter(i=>!i.read_at&&!previous.has(i.id));
  items=data||[];render();
  if(previous.size&&newest.length&&document.visibilityState==='visible')window.KidsFeedback?.show(newest.length===1?'Você recebeu uma nova notificação da comunidade.':`Você recebeu ${newest.length} novas notificações.`,'info');
 }catch(e){if(open){panel.innerHTML='<p class="kn-empty">Não foi possível carregar as notificações. Tente novamente.</p>'}}
 finally{loading=false;render()}
}
async function mark(ids){
 if(!ids.length||!user)return false;
 const {data,error}=await db.from('kids_community_notifications').update({read_at:new Date().toISOString()}).eq('recipient_id',user.id).in('id',ids).is('read_at',null).select('id');
 if(error)throw error;
 const updated=new Set((data||[]).map(x=>x.id));items=items.map(i=>updated.has(i.id)?{...i,read_at:new Date().toISOString()}:i);render();return true;
}
document.addEventListener('click',async e=>{
 if(e.target.closest('.kn-bell')){open=!open;render();if(open)refresh();return}
 if(e.target.closest('[data-kn-close]')){open=false;render();return}
 if(e.target.closest('[data-kn-all]')){try{await mark(items.filter(i=>!i.read_at).map(i=>i.id));window.KidsFeedback?.show('Notificações marcadas como lidas.','success')}catch{window.KidsFeedback?.error('Não foi possível marcar as notificações.')}return}
 const item=e.target.closest('[data-kn-item]');if(item){const n=items.find(x=>String(x.id)===item.dataset.knItem);if(!n)return;try{if(!n.read_at)await mark([n.id]);open=false;render();if(n.post_id||n.lesson_key)window.KidsCommunityOpenAlert?.(n);else document.querySelector('[data-community-tab]')?.click()}catch{window.KidsFeedback?.error('Não foi possível abrir a notificação.')}return}
 if(open&&!e.target.closest('.kn-holder')){open=false;render()}
});
window.addEventListener('teacher-refreshed',refresh);
window.addEventListener('focus',()=>{if(initialized)refresh()});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&initialized)refresh()});
mount();refresh();
setInterval(()=>{if(!document.hidden&&initialized)refresh()},25000);
})();
