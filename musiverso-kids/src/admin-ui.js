'use strict';
const base='https://hwbmmypllglujmxuypdw.supabase.co',key='sb_publishable_wKe1DH_0_UIQuBXgkEYK_g_KGyVKLn-';
const $=id=>document.getElementById(id),client=window.supabase?.createClient(base,key);
let rows=[],page=1,more=false,busy=false,epoch=0,target=null;
const date=v=>v?new Date(v).toLocaleString('pt-BR'):'Ainda não entrou';
function clear(){rows=[];$('users').replaceChildren();$('panel').hidden=true}
function message(text,error=false){$('status').textContent=text;$('status').className=error?'error':''}
async function request(method='GET',body=null,query=''){
 if(!client)throw Error('Não foi possível carregar o login. Atualize a página.');
 const {data,error}=await client.auth.getSession();if(error||!data.session){$('login').hidden=false;throw Error('Entre na sua conta de administrador para continuar.')}
 const identity=data.session.user.id,current=epoch;
 const res=await fetch(base+'/functions/v1/kids-admin'+query,{method,headers:{apikey:key,Authorization:'Bearer '+data.session.access_token,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{}),cache:'no-store'});
 const payload=await res.json();
 const latest=await client.auth.getSession();if(current!==epoch||latest.data?.session?.user?.id!==identity)throw Error('A sessão mudou. Entre novamente.');
 if(!res.ok){if(res.status===401)$('login').hidden=false;throw Error(payload.error||'Não foi possível concluir a solicitação.')}return payload;
}
function render(){
 const q=$('search').value.trim().toLocaleLowerCase('pt-BR'),selected=rows.filter(u=>(u.name+' '+u.email).toLocaleLowerCase('pt-BR').includes(q));$('users').replaceChildren();
 for(const u of selected){const tr=document.createElement('tr');for(const value of [(u.name||'Sem nome informado')+'\n'+u.email,date(u.created_at),date(u.last_sign_in_at),u.progress?u.progress.xp+' estrelas · '+u.progress.chapters+' capítulos\nSalvo: '+date(u.progress.saved_at):'Ainda sem progresso sincronizado',(u.providers||[]).join(', ')||'—',u.admin?'Administrador':u.email_confirmed?'E-mail confirmado':'E-mail pendente']){const td=document.createElement('td');td.textContent=value;td.style.whiteSpace='pre-line';tr.append(td)}
 const td=document.createElement('td'),button=document.createElement('button');button.type='button';button.textContent='Excluir';button.className='danger';button.disabled=busy||u.admin||!u.kids_account;button.setAttribute('aria-label','Excluir conta '+u.email);button.title=u.admin?'Contas administradoras são protegidas':!u.kids_account?'Conta ainda não identificada como usuária do Kids':'';button.onclick=()=>openDelete(u);td.append(button);tr.append(td);$('users').append(tr)}
 if(!selected.length){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=7;td.textContent='Nenhum usuário encontrado nesta página.';tr.append(td);$('users').append(tr)}
 $('count').textContent=selected.length+' conta(s) exibida(s) nesta página.';$('page').textContent='Página '+page;$('previous').disabled=busy||page===1;$('next').disabled=busy||!more;$('reload').disabled=busy;$('create-submit').disabled=busy;
}
async function load(targetPage=page){if(busy)return;busy=true;clear();message('Conferindo acesso e carregando usuários…');try{const payload=await request('GET',null,'?page='+targetPage);page=targetPage;rows=payload.users;more=payload.has_more;$('login').hidden=true;$('panel').hidden=false;message('Acesso autorizado. Dados atualizados.')}catch(e){clear();message(e.message||'Falha de conexão. Tente atualizar a página.',true)}finally{busy=false;render()}}
function openDelete(u){target=u;$('delete-email').textContent=u.email;$('delete-confirm').value='';$('delete-error').textContent='';$('delete-submit').disabled=true;$('delete-dialog').showModal();$('delete-confirm').focus()}
$('delete-confirm').oninput=()=>{$('delete-submit').disabled=busy||$('delete-confirm').value.trim().toLowerCase()!==target?.email?.toLowerCase()};
$('delete-cancel').onclick=()=>$('delete-dialog').close();
$('delete-form').onsubmit=async e=>{e.preventDefault();if(busy||!target||$('delete-confirm').value.trim().toLowerCase()!==target.email.toLowerCase())return;busy=true;$('delete-submit').disabled=true;try{const payload=await request('DELETE',{user_id:target.id});$('delete-dialog').close();target=null;busy=false;await load();message(payload.message)}catch(e){$('delete-error').textContent=e.message}finally{busy=false;render()}};
$('create-form').onsubmit=async e=>{e.preventDefault();if(busy)return;busy=true;render();message('Criando a conta…');try{const payload=await request('POST',{name:$('new-name').value,email:$('new-email').value,password:$('new-password').value});$('create-form').reset();busy=false;await load(1);message(payload.message)}catch(e){message(e.message,true)}finally{busy=false;render()}};
$('search').addEventListener('input',render);$('reload').onclick=()=>load();$('previous').onclick=()=>load(page-1);$('next').onclick=()=>load(page+1);
function signedOut(){epoch++;clear();$('create-form').reset();if($('delete-dialog').open)$('delete-dialog').close();message('Sessão encerrada.');$('login').hidden=false}
$('logout').onclick=async()=>{signedOut();try{await client?.auth.signOut()}finally{location.replace('acesso.html')}};
client?.auth.onAuthStateChange(event=>{if(event==='SIGNED_OUT')signedOut()});window.addEventListener('pagehide',()=>{epoch++;clear();$('create-form').reset()});window.addEventListener('pageshow',e=>{if(e.persisted)load()});load();
