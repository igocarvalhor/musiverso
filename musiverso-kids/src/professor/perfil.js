/* Perfil profissional do educador. Somente professores aprovados. */
(()=>{
'use strict';
const db=window.KidsTeacherClient;
const TABLE='kids_teacher_profiles',BUCKET='kids-teacher-avatars';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let self=null,active=false,selectedId='',profiles=new Map(),avatars=new Map(),editing=false,busy=false,loadError='';
const main=()=>document.getElementById('main');
const feedback=(s,type='success')=>window.KidsFeedback?.show(s,type);
function initials(name){return esc(String(name||'P').trim().slice(0,1).toUpperCase())}
function avatar(person,size='large'){
 const path=person?.avatar_path,url=path?avatars.get(path):'';
 return url?`<img class="kp-avatar kp-${size}" src="${esc(url)}" alt="Foto de perfil de ${esc(person.display_name)}">`:`<span class="kp-avatar kp-${size}" aria-hidden="true">${initials(person?.display_name)}</span>`;
}
async function getSelf(){const {data,error}=await db.auth.getUser();if(error||!data?.user)throw Error('Sua sessão expirou. Entre novamente.');self=data.user;return self}
async function loadAvatar(person){if(!person?.avatar_path||avatars.has(person.avatar_path))return;const {data,error}=await db.storage.from(BUCKET).createSignedUrl(person.avatar_path,3600);if(!error&&data?.signedUrl)avatars.set(person.avatar_path,data.signedUrl)}
async function getProfile(id){
 if(!id)return null;
 const {data,error}=await db.from(TABLE).select('user_id,display_name,headline,bio,skills,courses,education,experience,avatar_path,updated_at').eq('user_id',id).maybeSingle();
 if(error)throw error;
 if(data){profiles.set(id,data);await loadAvatar(data)}return data;
}
function profileFor(id){return profiles.get(id)}
function headerPhoto(p){return `<div class="kp-cover"><span>♪</span><span>♫</span><span>♬</span></div><div class="kp-profile-top">${avatar(p)}<div class="kp-profile-title"><h2>${esc(p?.display_name||'Professor')}</h2><p>${esc(p?.headline||'Professor(a) de música · Musiverso Kids')}</p></div></div>`}
function section(title,value,placeholder){return `<section class="kp-section"><h3>${title}</h3><p>${value?esc(value):`<span class="kp-muted">${placeholder}</span>`}</p></section>`}
function view(p,own){
 return `<article class="kp-profile-card">${headerPhoto(p)}
 <div class="kp-profile-content">${section('Sobre mim',p?.bio,'Este professor ainda não escreveu uma apresentação.')}
 <div class="kp-two">${section('Habilidades',p?.skills,'Habilidades não informadas.')}${section('Formação acadêmica',p?.education,'Formação não informada.')}</div>
 <div class="kp-two">${section('Cursos e capacitações',p?.courses,'Nenhum curso adicionado.')}${section('Experiência profissional',p?.experience,'Experiência não informada.')}</div>
 <div class="kp-actions">${own?'<button class="btn" data-kp-edit type="button">✎ Editar meu perfil</button>':'<button class="btn soft" data-kp-back type="button">← Voltar à comunidade</button>'}</div></div></article>`;
}
function field(label,key,value,max,placeholder,multiline=false){
 return `<label class="kp-field">${label}${multiline?`<textarea name="${key}" rows="4" maxlength="${max}" placeholder="${placeholder}">${esc(value||'')}</textarea>`:`<input name="${key}" maxlength="${max}" value="${esc(value||'')}" placeholder="${placeholder}">`}</label>`;
}
function edit(p){
 return `<form class="kp-edit" id="kpForm"><h2>Editar perfil profissional</h2>
 <div class="kp-photo-edit">${avatar(p,'medium')}<label>Foto de perfil <input type="file" name="avatar" accept="image/png,image/jpeg,image/webp"><small>JPG, PNG ou WebP · até 2 MB. Visível aos professores aprovados.</small></label></div>
 ${field('Nome profissional','display_name',p?.display_name||self?.user_metadata?.full_name||'',60,'Nome que será exibido')}
 ${field('Título profissional','headline',p?.headline,120,'Ex.: Professora de musicalização infantil')}
 ${field('Apresentação','bio',p?.bio,1200,'Conte sobre sua abordagem de ensino, interesses e atuação.',true)}
 ${field('Habilidades','skills',p?.skills,600,'Ex.: piano, percussão, Orff, contação de histórias.',true)}
 ${field('Formação acadêmica','education',p?.education,1200,'Ex.: Licenciatura em Música, instituição e ano.',true)}
 ${field('Cursos e capacitações','courses',p?.courses,1200,'Ex.: cursos livres, certificações e oficinas.',true)}
 ${field('Experiência profissional','experience',p?.experience,1500,'Ex.: aulas de música para Educação Infantil desde 2020.',true)}
 <div class="kp-actions"><button class="btn" type="submit" ${busy?'disabled':''}>${busy?'Salvando…':'Salvar perfil'}</button><button type="button" class="btn soft" data-kp-cancel>Cancelar</button></div></form>`;
}
function render(){
 if(!active||!main())return;
 const own=!selectedId||selectedId===self?.id,p=profileFor(own?self?.id:selectedId);
 document.querySelectorAll('[data-tab]').forEach(b=>{b.classList.remove('active');b.removeAttribute('aria-current')});
 const nav=document.querySelector('[data-kp-tab]');nav?.classList.add('active');nav?.setAttribute('aria-current','page');
 main().innerHTML=`<section class="kp-page"><div class="page-intro"><div><span class="eyebrow">COMUNIDADE MUSIVERSO · PERFIL PROFISSIONAL</span><h1>${own?'Meu perfil':'Perfil do professor'}</h1><p class="lead">Formação, habilidades, cursos e experiências compartilhados entre educadores.</p></div></div>
 ${loadError?`<p role="alert" class="kp-error">${esc(loadError)}</p>`:''}
 ${own&&editing?edit(p):view(p,own)}
 <p class="kp-privacy">O perfil e a foto são acessíveis somente a professores aprovados. Não publique informações pessoais de alunos.</p></section>`;
}
async function open(id=''){
 active=true;selectedId=id;editing=false;loadError='';
 location.hash='perfil-professor';
 try{await getSelf();await getProfile(id||self.id)}catch(e){loadError=e.message||'Falha ao abrir o perfil.'}
 render();window.scrollTo({top:0,behavior:'instant'});
}
function close(){if(!active)return;active=false;document.querySelector('[data-kp-tab]')?.classList.remove('active')}
async function save(form){
 if(busy)return;busy=true;render(); // do not replace form values until captured
}
document.addEventListener('click',e=>{
 const target=e.target.closest('[data-kp-tab]');if(target){e.preventDefault();e.stopImmediatePropagation();open();return}
 const profile=e.target.closest('[data-kp-user]');if(profile){e.preventDefault();e.stopImmediatePropagation();open(profile.dataset.kpUser);return}
 if(e.target.closest('[data-tab],[data-community-tab],[data-repertoire-tab]')){close();return}
 if(!active)return;
 if(e.target.closest('[data-kp-edit]')){editing=true;render()}
 if(e.target.closest('[data-kp-cancel]')){editing=false;render()}
 if(e.target.closest('[data-kp-back]')){document.querySelector('[data-community-tab]')?.click()}
});
document.addEventListener('submit',async e=>{
 if(!active||e.target.id!=='kpForm')return;
 e.preventDefault();if(busy)return;
 const form=e.target,f=new FormData(form),name=String(f.get('display_name')||'').trim();
 if(name.length<2){feedback('Informe um nome profissional com pelo menos duas letras.','error');return}
 const data={user_id:self.id,display_name:name};
 for(const key of ['headline','bio','skills','education','courses','experience'])data[key]=String(f.get(key)||'').trim();
 const file=f.get('avatar');busy=true;
 try{
  const current=profileFor(self.id);data.avatar_path=current?.avatar_path||null;
  if(file&&file.size){
   if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>2097152)throw Error('Escolha uma imagem JPG, PNG ou WebP de até 2 MB.');
   const ext={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[file.type];
   const path=self.id+'/avatar.'+ext;
   const {error}=await db.storage.from(BUCKET).upload(path,file,{upsert:true,contentType:file.type,cacheControl:'60'});
   if(error)throw error;
   data.avatar_path=path;avatars.delete(path);
  }
  data.updated_at=new Date().toISOString();
  const {data:updated,error}=await db.from(TABLE).upsert(data,{onConflict:'user_id'}).select('*').single();
  if(error||!updated)throw error||Error('Não foi possível confirmar o salvamento.');
  profiles.set(self.id,updated);await loadAvatar(updated);
  editing=false;feedback('Perfil profissional salvo com sucesso.','success');
  window.dispatchEvent(new CustomEvent('kids-profile-updated',{detail:{user_id:self.id}}));
 }catch(err){feedback('Não foi possível salvar o perfil: '+(err.message||'tente novamente.'),'error')}
 finally{busy=false;render()}
});
window.addEventListener('hashchange',()=>{if(location.hash==='#perfil-professor'&&!active)open();else if(location.hash!=='#perfil-professor')close()});
window.KidsProfilePhotos=avatars;window.KidsProfiles={get:getProfile,peek:profileFor,avatar:avatar,open:open};
if(location.hash==='#perfil-professor')open();
})();
