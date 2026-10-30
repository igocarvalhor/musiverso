/* Access gate: authenticated browser session verified against Supabase Auth. */
(function(){
'use strict';
const message=document.getElementById('auth-status');
function show(text){if(message)message.textContent=text}
const client=window.supabase?.createClient?.(
  'https://hwbmmypllglujmxuypdw.supabase.co',
  'sb_publishable_wKe1DH_0_UIQuBXgkEYK_g_KGyVKLn-',
  {auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}
);
if(!client){show('Não foi possível carregar o serviço de autenticação. Verifique a conexão e atualize a página.');return}
window.MusiversoAuthClient=client;
client.auth.onAuthStateChange((event,session)=>{
 if(window.MusiversoAuthUser&&(event==='SIGNED_OUT'||(session?.user?.id&&session.user.id!==window.MusiversoAuthUser.id))){
  window.MusiversoPolyphony?.dispose();window.MusiversoCloudProgress?.stop();
  window.MusiversoAuthUser=null;
  document.getElementById('platform-content')?.setAttribute('hidden','');
  location.replace('acesso.html');
 }
});
(async function init(){
 try{
   const {data,error}=await client.auth.getUser();
   if(error||!data?.user){location.replace('acesso.html');return}
   window.MusiversoAuthUser=data.user;
   window.MusiversoProgressKey='musiverso-kids-v1:'+data.user.id;
   if(!window.MusiversoCloudProgress){show('Não foi possível carregar a sincronização. Atualize a página para tentar novamente.');return}
   show('Carregando o progresso da sua conta…');
   await window.MusiversoCloudProgress.init(client,data.user);
   if(!window.MusiversoAuthUser)return;
   document.getElementById('platform-content')?.removeAttribute('hidden');
   const script=document.createElement('script');
   script.src='app.js?v=polyphony-1';
   script.onload=()=>document.getElementById('auth-loading')?.remove();
   script.onerror=()=>show('Não foi possível iniciar o aplicativo. Atualize a página.');
   document.body.appendChild(script);
 }catch(e){show('Não foi possível validar seu acesso. Confira a conexão e tente novamente.')}
})();
window.addEventListener('pagehide',()=>document.getElementById('platform-content')?.setAttribute('hidden',''));
window.addEventListener('pageshow',e=>{if(e.persisted)location.reload()});
window.MusiversoLogout=async function(){
 window.MusiversoPolyphony?.dispose();
 try{await window.MusiversoCloudProgress?.sync();await client.auth.signOut()}finally{window.MusiversoPolyphony?.dispose();window.MusiversoCloudProgress?.stop();location.replace('acesso.html')}
};
})();
