/* Musiverso Kids — Supabase Auth (publishable key only; no secret keys in client). */
(function(){
'use strict';
const url='https://hwbmmypllglujmxuypdw.supabase.co';
const key='sb_publishable_wKe1DH_0_UIQuBXgkEYK_g_KGyVKLn-';
const $=id=>document.getElementById(id);
const form=$('auth-form'),tabs=$('auth-title');
if(!form)return;
const messages={
 'Invalid login credentials':'E-mail ou senha incorretos.',
 'Email not confirmed':'Confirme seu e-mail antes de entrar.',
 'User already registered':'Este e-mail já possui uma conta. Use Entrar.',
 'Password should be at least 6 characters':'Use uma senha com pelo menos oito caracteres.',
 'Email rate limit exceeded':'Muitas tentativas de envio. Aguarde um pouco e tente novamente.',
 'For security purposes, you can only request this after':'Por segurança, aguarde um pouco antes de tentar novamente.',
 'Signups not allowed for this instance':'O cadastro está indisponível no serviço de autenticação. Consulte o administrador.'
};
const client=window.supabase?.createClient?.(url,key,{auth:{autoRefreshToken:true,persistSession:true,detectSessionInUrl:true}});
let mode='login',busy=false;
function message(text,isError=false){const el=$('auth-message');el.hidden=!text;el.className='auth-message '+(isError?'error':'success');el.textContent=text||'';}
function errorMessage(error){let text=error?.message||'Não foi possível continuar. Verifique sua conexão.';for(const [part,pt] of Object.entries(messages))if(text.includes(part))return pt;return text;}
function setMode(next){
 mode=next;
 $('tab-login').setAttribute('aria-selected',String(mode==='login'));
 $('tab-signup').setAttribute('aria-selected',String(mode==='signup'));
 $('name-field').hidden=mode!=='signup';
 $('password-confirm-field').hidden=!['signup','reset'].includes(mode);
 $('auth-name').required=mode==='signup';
 $('auth-confirm').required=['signup','reset'].includes(mode);
 $('password-field').hidden=mode==='forgot';
 $('auth-password').required=mode!=='forgot';
 $('auth-password').autocomplete=mode==='login'?'current-password':'new-password';
 $('tab-login').disabled=mode==='reset';$('tab-signup').disabled=mode==='reset';
 $('auth-title').textContent=({login:'Bem-vindo de volta!',signup:'Sua aventura começa aqui!',forgot:'Recupere seu acesso',reset:'Escolha uma nova senha'})[mode];
 $('auth-desc').textContent=({login:'Entre com seu e-mail e sua senha para continuar a aventura.',signup:'Crie sua conta com e-mail e senha.',forgot:'Informe seu e-mail para receber as instruções de recuperação.',reset:'Digite sua nova senha e confirme para voltar à plataforma.'})[mode];
 $('auth-submit').textContent=({login:'Entrar na plataforma →',signup:'Criar minha conta →',forgot:'Enviar recuperação →',reset:'Salvar nova senha →'})[mode];
 $('forgot-link').textContent=mode==='login'?'Esqueci minha senha':'Voltar para entrar';
 $('auth-help').hidden=mode!=='signup';
 message('');
}
function setBusy(state){busy=state;$('auth-submit').disabled=state;$('auth-submit').setAttribute('aria-busy',String(state))}
$('tab-login').onclick=()=>setMode('login');
$('tab-signup').onclick=()=>setMode('signup');
$('forgot-link').onclick=()=>setMode(mode==='login'?'forgot':'login');
$('password-toggle').onclick=()=>{
 const input=$('auth-password');const showing=input.type==='password';input.type=showing?'text':'password';$('password-toggle').textContent=showing?'Ocultar':'Mostrar';$('password-toggle').setAttribute('aria-label',showing?'Ocultar senha':'Mostrar senha');
};
if(!client){message('Não foi possível carregar o sistema de login. Verifique a conexão com a internet.',true);$('auth-submit').disabled=true;return}
client.auth.onAuthStateChange((event)=>{
 if(event==='PASSWORD_RECOVERY')setMode('reset');
});
(async()=>{
 try{
  const {data}=await client.auth.getSession();
  if(new URLSearchParams(location.search).has('reset')&&(location.hash.includes('type=recovery')||data?.session?.user)&&mode!=='reset')setMode('reset');
 }catch{}
})();
form.addEventListener('submit',async(e)=>{
 e.preventDefault();if(busy)return;
 const email=$('auth-email').value.trim(),password=$('auth-password').value;
 if(mode!=='reset'&&!/^\S+@\S+\.\S+$/.test(email)){message('Informe um endereço de e-mail válido.',true);return}
 if(mode!=='forgot'&&password.length<8){message('A senha precisa ter pelo menos oito caracteres.',true);return}
 if(['signup','reset'].includes(mode)&&password!==$('auth-confirm').value){message('As senhas digitadas não são iguais.',true);return}
 const name=$('auth-name').value.trim();
 if(mode==='signup'&&name.length<2){message('Informe o nome do responsável ou professor.',true);return}
 setBusy(true);message('');
 try{
  if(mode==='login'){
   const {data,error}=await client.auth.signInWithPassword({email,password});
   if(error)throw error;
   if(!data?.session)throw Error('Não foi possível iniciar a sessão.');
   location.replace('plataforma.html');return;
  }
  if(mode==='signup'){
   const {data,error}=await client.auth.signUp({email,password,options:{data:{display_name:name},emailRedirectTo:new URL('acesso.html',location.href).href}});
   if(error)throw error;
   if(data?.session){location.replace('plataforma.html');return;}
   message('Cadastro recebido! Verifique sua caixa de entrada para confirmar o e-mail. Depois, volte para entrar.');
   $('auth-password').value='';$('auth-confirm').value='';return;
  }
  if(mode==='forgot'){
   const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:new URL('acesso.html?reset=1',location.href).href});
   if(error)throw error;
   message('Se este e-mail estiver cadastrado, você receberá as instruções para redefinir sua senha.');
   return;
  }
  if(mode==='reset'){
   const {error}=await client.auth.updateUser({password});
   if(error)throw error;
   message('Senha alterada com sucesso. Você já pode entrar na plataforma.');
   await client.auth.signOut();
   setMode('login');message('Senha atualizada. Faça login com a nova senha.');return;
  }
 }catch(err){message(errorMessage(err),true)}finally{setBusy(false)}
});
})();