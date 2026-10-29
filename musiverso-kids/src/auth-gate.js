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
(async function init(){
 try{
   const {data,error}=await client.auth.getUser();
   if(error||!data?.user){location.replace('acesso.html');return}
   window.MusiversoAuthUser=data.user;
   window.MusiversoProgressKey='musiverso-kids-v1:'+data.user.id;
   document.getElementById('auth-loading')?.remove();
   document.getElementById('platform-content')?.removeAttribute('hidden');
   const script=document.createElement('script');
   script.src='app.js?v=auth1';
   script.onerror=()=>show('Não foi possível iniciar o aplicativo. Atualize a página.');
   document.body.appendChild(script);
 }catch(e){show('Não foi possível validar seu acesso. Confira a conexão e tente novamente.')}
})();
window.MusiversoLogout=async function(){
 try{await client.auth.signOut()}finally{location.replace('acesso.html')}
};
})();