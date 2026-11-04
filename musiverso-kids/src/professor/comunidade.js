/* Community pilot for approved Kids teachers; never reads student records. */
(()=>{
'use strict';
const client=window.KidsTeacherClient;
const types={forum:'Fórum pedagógico',activity:'Biblioteca colaborativa'};
const cat=['Metodologias','Repertório','Educação Infantil','Instrumentos','Dúvidas','Outros'];
let active=false,view='forum',lessonKey='',lessonTitle='',user=null,posts=[],comments=[],selectedPost='',busy=false;
const root=()=>document.getElementById('main');
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const message=(s,type='info')=>window.KidsFeedback?.show(s,type);
function setStatus(text){const el=document.getElementById('communityStatus');if(el)el.textContent=text}
function project(){document.querySelectorAll('[data-tab]').forEach(b=>{b.classList.remove('active');b.removeAttribute('aria-current')});document.querySelector('[data-community-tab]')?.classList.add('active')}
function title(text,subtitle){return `<div class="page-intro"><div><span class="eyebrow">PILOTO · SÓ PARA PROFESSORES APROVADOS</span><h1>${esc(text)}</h1><p class="lead">${esc(subtitle)}</p></div><span class="pill">Comunidade Musiverso</span></div>`}
function top(){
 return `${title('Comunidade Musiverso','Compartilhe experiências, comente aulas e descubra atividades criadas por outros professores.')}
 <div class="cm-tabs"><button data-cm-view="forum" class="${view==='forum'?'active':''}">💬 Fórum</button><button data-cm-view="activity" class="${view==='activity'?'active':''}">📚 Biblioteca de atividades</button><button data-cm-view="lesson" class="${view==='lesson'?'active':''}">🎼 Comentários das aulas</button></div>
 <p class="cm-guideline">Compartilhe apenas experiências profissionais. Não publique nomes, fotos, dados pessoais ou registros de alunos. Não envie letras de músicas, gravações ou materiais sem autorização dos titulares.</p>`;
}
function postCard(p){
 const own=p.author_id===user?.id;return `<article class="cm-card">
 <div class="cm-cardtop"><span class="cm-type">${p.kind==='activity'?'📚 ATIVIDADE COMPARTILHADA':'💬 DISCUSSÃO'} · ${esc(p.category)}</span><span class="cm-date">${new Date(p.created_at).toLocaleDateString('pt-BR')}</span></div>
 <h3>${esc(p.title)}</h3><p class="cm-author">Publicado por ${esc(p.author_name)}</p><p class="cm-body">${esc(p.body)}</p>
 ${p.kind==='activity'?`<p class="cm-meta"><strong>Faixa etária:</strong> ${esc(p.age_range||'Não informada')}</p><p class="cm-meta"><strong>Materiais:</strong> ${esc(p.materials||'Não informados')}</p>`:''}
 <div class="cm-actions"><button type="button" class="btn soft" data-cm-discuss="${p.id}">💬 Ver comentários</button>${own?`<button type="button" class="cm-delete" data-cm-delete-post="${p.id}">Excluir publicação</button>`:''}</div></article>`;
}
function commentCard(c){return `<article class="cm-comment"><div><strong>${esc(c.author_name)}</strong><span class="cm-date"> · ${new Date(c.created_at).toLocaleDateString('pt-BR')}</span></div><p>${esc(c.body)}</p>${c.author_id===user?.id?`<button type="button" data-cm-delete-comment="${c.id}" class="cm-delete">Excluir comentário</button>`:''}</article>`}
function formFields(){
 return `<form id="cmPostForm" class="cm-form">
 <h2>${view==='activity'?'Compartilhar uma atividade':'Iniciar discussão'}</h2>
 <div class="cm-formgrid"><label>Seu nome profissional<input name="author" required maxlength="60" minlength="2" placeholder="Como deseja aparecer na comunidade"></label>
 <label>Categoria<select name="category">${cat.map(x=>`<option>${esc(x)}</option>`).join('')}</select></label></div>
 <label>Título<input name="title" required minlength="5" maxlength="120" placeholder="${view==='activity'?'Ex.: A viagem do pequeno tambor':'Ex.: Como trabalhar pulsação com crianças pequenas?'}"></label>
 ${view==='activity'?`<div class="cm-formgrid"><label>Faixa etária<input name="age" maxlength="30" placeholder="Ex.: 2–3 anos"></label><label>Materiais<input name="materials" maxlength="500" placeholder="Ex.: chocalhos e cartões"></label></div>`:''}
 <label>${view==='activity'?'Descreva objetivos e passo a passo':'Sua pergunta ou experiência'}<textarea name="body" minlength="10" maxlength="2000" rows="5" required placeholder="Compartilhe uma proposta aplicável sem identificar crianças."></textarea></label>
 <button type="submit" class="btn" ${busy?'disabled':''}>${busy?'Publicando…':'Publicar na comunidade'}</button></form>`;
}
function commentForm(){return `<form id="cmCommentForm" class="cm-form"><h3>Escrever comentário</h3><label>Seu nome profissional<input name="author" required minlength="2" maxlength="60" placeholder="Nome exibido"></label><label>Sua contribuição<textarea name="body" rows="3" minlength="2" maxlength="1000" required placeholder="Qual experiência ou adaptação você deseja compartilhar?"></textarea></label><button class="btn" type="submit" ${busy?'disabled':''}>Enviar comentário</button></form>`}
function render(){
 if(!active||!root())return;project();
 let body='';
 if(view==='lesson'){
  body=`<section class="panel"><h2>Comentários vinculados às aulas</h2>
  ${lessonKey?`<p><strong>Aula:</strong> ${esc(lessonTitle)}</p><p class="note">Os relatos desta aula podem ser vistos pelos professores aprovados.</p>`:'<p>Abra uma aula pronta da faixa etária desejada e clique em <strong>Comentários dos professores</strong> para conversar sobre a proposta.</p><button data-cm-lessons type="button" class="btn soft">Abrir aulas prontas</button>'}</section>
  ${lessonKey?`<section class="panel"><h2>Experiências compartilhadas</h2><div class="cm-comments">${comments.length?comments.map(commentCard).join(''):'<p class="cm-empty">Ainda não há comentários. Compartilhe a primeira adaptação desta aula.</p>'}</div>${commentForm()}</section>`:''}`;
 }else{
  const list=posts.filter(p=>p.kind===view),selected=posts.find(p=>p.id===selectedPost);
  body=`${formFields()}<section class="cm-feed"><h2>${view==='forum'?'Discussões recentes':'Atividades dos professores'}</h2><div class="cm-cards">${list.length?list.map(postCard).join(''):'<p class="cm-empty">Nenhuma publicação ainda. Você pode criar a primeira!</p>'}</div></section>
  ${selected&&selected.kind===view?`<section class="panel" id="cmDiscussion"><h2>Comentários: ${esc(selected.title)}</h2><div class="cm-comments">${comments.length?comments.map(commentCard).join(''):'<p class="cm-empty">Ainda não há respostas nesta publicação.</p>'}</div>${commentForm()}</section>`:''}`;
 }
 root().innerHTML=`<section class="cm-workspace">${top()}<p class="cm-status" id="communityStatus" role="status"></p>${body}</section>`;
}
async function session(){
 if(!client)throw Error('Sessão do professor não inicializada.');
 const {data,error}=await client.auth.getUser();
 if(error||!data?.user)throw Error('Sua sessão não está disponível. Entre novamente no Kids.');
 user=data.user;
}
async function api(table,action,arg){
 await session();
 let query=client.from(table);
 if(action==='list'){const {data,error}=await query.select('*').order('created_at',{ascending:false}).limit(80);if(error)throw error;return data||[]}
 if(action==='add'){const {data,error}=await query.insert(arg).select('*').single();if(error)throw error;return data}
 if(action==='remove'){const {data,error}=await query.delete().eq('id',arg).eq('author_id',user.id).select('id');if(error)throw error;if(!data?.length)throw Error('Não foi possível confirmar a exclusão.');return true}
}
async function load(){
 if(!active)return;
 setStatus('Carregando publicações…');
 try{
  await session();
  if(view==='lesson'){comments=lessonKey?(await api('kids_community_comments','list')).filter(c=>c.lesson_key===lessonKey):[]}
  else{
   posts=await api('kids_community_posts','list');
   comments=selectedPost?(await api('kids_community_comments','list')).filter(c=>c.post_id===selectedPost):[];
  }
  render();setStatus('');
 }catch(err){setStatus('Não foi possível carregar a comunidade. Verifique sua conexão ou suas permissões.');message(err.message||'Erro ao carregar dados.','error')}
}
function open(which='forum',key='',name=''){
 active=true;view=which;lessonKey=key;lessonTitle=name;selectedPost='';comments=[];
 location.hash='comunidade';render();load();window.scrollTo({top:0,behavior:'instant'});
}
function close(){if(!active)return;active=false;document.querySelector('[data-community-tab]')?.classList.remove('active')}
async function execute(fn){
 if(busy)return;busy=true;try{await fn();message('Operação concluída na comunidade.','success');await load()}catch(e){message('Não foi possível concluir a operação. '+(e.message||''),'error')}finally{busy=false;render()}
}
document.addEventListener('click',async e=>{
 const lesson=e.target.closest('[data-community-lesson]');
 if(lesson){e.preventDefault();open('lesson',lesson.dataset.communityLesson,lesson.dataset.communityTitle||'Aula pronta');return}
 if(e.target.closest('[data-community-tab]')){e.preventDefault();open();return}
 if(e.target.closest('[data-tab],[data-go],[data-history-tab],[data-repertoire-tab]')){close();return}
 if(!active)return;
 const tab=e.target.closest('[data-cm-view]');
 if(tab){view=tab.dataset.cmView;selectedPost='';lessonKey='';render();await load();return}
 if(e.target.closest('[data-cm-lessons]')){close();document.querySelector('[data-tab="aulas"]')?.click();return}
 const discuss=e.target.closest('[data-cm-discuss]');
 if(discuss){selectedPost=discuss.dataset.cmDiscuss;await load();document.getElementById('cmDiscussion')?.scrollIntoView({behavior:'smooth'});return}
 const removePost=e.target.closest('[data-cm-delete-post]');
 if(removePost){if(!confirm('Excluir esta publicação e todos os comentários associados?'))return;await execute(async()=>{await api('kids_community_posts','remove',removePost.dataset.cmDeletePost);selectedPost=''});return}
 const removeComment=e.target.closest('[data-cm-delete-comment]');
 if(removeComment){if(!confirm('Excluir este comentário?'))return;await execute(async()=>{await api('kids_community_comments','remove',removeComment.dataset.cmDeleteComment)});return}
});
document.addEventListener('submit',async e=>{
 if(!active||!['cmPostForm','cmCommentForm'].includes(e.target.id))return;
 e.preventDefault();const form=e.target,values=new FormData(form);
 const author=String(values.get('author')||'').trim(),body=String(values.get('body')||'').trim();
 if(form.id==='cmPostForm'){
  const title=String(values.get('title')||'').trim(),category=String(values.get('category')||'Outros');
  await execute(async()=>{await api('kids_community_posts','add',{author_id:user.id,author_name:author,kind:view,category,title,body,age_range:String(values.get('age')||'').trim(),materials:String(values.get('materials')||'').trim()})});
 }else{
  await execute(async()=>{await api('kids_community_comments','add',{author_id:user.id,author_name:author,body,post_id:view==='lesson'?null:selectedPost,lesson_key:view==='lesson'?lessonKey:null})});
 }
});
window.addEventListener('hashchange',()=>{if(location.hash==='#comunidade'&&!active)open();else if(location.hash!=='#comunidade')close()});
window.addEventListener('teacher-refreshed',()=>{if(active)load()});
if(location.hash==='#comunidade')open();
})();
