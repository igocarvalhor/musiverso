/* Comunidade Musiverso: professional three-column feed for approved Kids educators. */
(()=>{
'use strict';
const db=window.KidsTeacherClient;
const KINDS={forum:'Discussões',activity:'Atividades'};
const CATEGORIES=['Metodologias','Repertório','Educação Infantil','Instrumentos','Dúvidas','Outros'];
const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const main=()=>document.getElementById('main');
let active=false,view='forum',lessonKey='',lessonTitle='',posts=[],comments=[],selectedPost='',user=null,loading=false,busy=false,compose=false,queryText='',category='Todas',errorText='',authorDraft='';
const notify=(text,type='success')=>window.KidsFeedback?.show(text,type);
const badge=name=>escape((name||'P').trim().slice(0,1).toUpperCase());
const stamp=date=>{try{return new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(date))}catch{return ''}};
function authorName(){return authorDraft||user?.user_metadata?.full_name||user?.email?.split('@')[0]||'Professor'}
function markNav(){
 document.querySelectorAll('[data-tab]').forEach(el=>{el.classList.remove('active');el.removeAttribute('aria-current')});
 const nav=document.querySelector('[data-community-tab]');nav?.classList.add('active');nav?.setAttribute('aria-current','page');
}
function views(){return `<div class="cm-switcher" role="group" aria-label="Áreas da comunidade">
  <button type="button" data-cm-view="forum" class="${view==='forum'?'active':''}" aria-pressed="${view==='forum'}">▤ <span>Feed de professores</span></button>
  <button type="button" data-cm-view="activity" class="${view==='activity'?'active':''}" aria-pressed="${view==='activity'}">▦ <span>Biblioteca colaborativa</span></button>
  <button type="button" data-cm-view="lesson" class="${view==='lesson'?'active':''}" aria-pressed="${view==='lesson'}">◫ <span>Conversas das aulas</span></button>
 </div>`}
function leftRail(){return `<aside class="cm-rail cm-profile">
 <div class="cm-cover" aria-hidden="true"><span>♪</span><span>♫</span><span>♬</span></div>
 <span class="cm-avatar cm-avatar-lg" aria-hidden="true">${badge(authorName())}</span>
 <div class="cm-profile-body"><strong>${escape(authorName())}</strong><p>Professor(a) · Musiverso Kids</p><span class="cm-verified">✓ Comunidade de educadores</span></div>
 <div class="cm-profile-foot"><strong>Seu espaço pedagógico</strong><p>Compartilhe ideias, experiências e atividades que ampliam a musicalização infantil.</p></div>
 <button type="button" class="cm-text-link" data-cm-lessons>↗ Explorar aulas prontas</button>
 </aside>`}
function rightRail(){return `<aside class="cm-rail cm-discover">
 <section class="cm-side-card"><span class="cm-side-icon">✦</span><h3>Inspire outras aulas</h3><p>Uma experiência simples pode ajudar outro professor a criar um encontro musical inesquecível.</p><button type="button" data-cm-compose="activity" class="cm-side-action">+ Compartilhar atividade</button></section>
 <section class="cm-side-card cm-side-note"><h3>Boas práticas da comunidade</h3><ul><li>Compartilhe propostas pedagógicas autorais.</li><li>Não publique nomes, fotos ou informações de alunos.</li><li>Respeite direitos autorais de músicas e materiais.</li><li>Valorize a troca respeitosa de experiências.</li></ul></section>
 <div class="cm-brandline">♫ Musiverso Kids <span>· Comunidade piloto</span></div>
 </aside>`}
function editor(){return `<section class="cm-editor cm-surface">
 <div class="cm-editor-top"><span class="cm-avatar" aria-hidden="true">${badge(authorName())}</span><button type="button" class="cm-editor-prompt" data-cm-compose="${view==='activity'?'activity':'forum'}">${view==='activity'?'Qual atividade você quer compartilhar?':'Compartilhe uma descoberta ou faça uma pergunta...'}</button></div>
 <div class="cm-editor-actions"><button type="button" data-cm-compose="forum">✎ Criar discussão</button><button type="button" data-cm-compose="activity">▦ Compartilhar atividade</button></div>
 </section>`}
function postForm(){
 const kind=view==='activity'?'activity':'forum';
 return `<section class="cm-compose-panel cm-surface" id="cmComposer"><div class="cm-card-heading"><div><span class="cm-eyebrow">NOVA PUBLICAÇÃO</span><h2>${kind==='activity'?'Compartilhe uma atividade':'Inicie uma conversa'}</h2></div><button type="button" class="cm-icon-button" data-cm-close-compose aria-label="Fechar formulário">✕</button></div>
 <form id="cmPostForm" class="cm-form">
 <label>Nome que aparecerá na publicação<input name="author" value="${escape(authorName())}" required minlength="2" maxlength="60" autocomplete="name"></label>
 <label>Assunto<input name="title" placeholder="Dê um título claro à sua publicação" minlength="5" maxlength="120" required></label>
 <div class="cm-form-pair"><label>Categoria<select name="category">${CATEGORIES.map(c=>`<option>${escape(c)}</option>`).join('')}</select></label>${kind==='activity'?'<label>Faixa etária<input name="age" placeholder="Ex.: 2–3 anos" maxlength="30"></label>':''}</div>
 ${kind==='activity'?'<label>Materiais necessários<input name="materials" maxlength="500" placeholder="Ex.: tambores, cartões e tecidos"></label>':''}
 <label>${kind==='activity'?'Objetivos e desenvolvimento da atividade':'Sua pergunta ou experiência'}<textarea name="body" required minlength="10" maxlength="2000" rows="5" placeholder="Descreva sua experiência. Não inclua informações pessoais de crianças."></textarea></label>
 <div class="cm-form-footer"><span>Somente professores aprovados podem visualizar.</span><button class="cm-primary" type="submit" ${busy?'disabled':''}>${busy?'Publicando…':'Publicar agora'}</button></div></form></section>`;
}
function commentHTML(c){const own=c.author_id===user?.id;return `<div class="cm-comment"><span class="cm-avatar cm-avatar-sm" aria-hidden="true">${badge(c.author_name)}</span><div class="cm-comment-body"><div class="cm-comment-header"><strong>${escape(c.author_name)}</strong><span>${stamp(c.created_at)}</span></div><p>${escape(c.body)}</p>${own?`<button type="button" class="cm-minilink" data-cm-delete-comment="${escape(c.id)}">Excluir comentário</button>`:''}</div></div>`}
function commentForm(){return `<form id="cmCommentForm" class="cm-comment-form"><span class="cm-avatar cm-avatar-sm" aria-hidden="true">${badge(authorName())}</span><div class="cm-comment-fields"><label class="cm-visually-hidden" for="cmName">Nome profissional</label><input id="cmName" name="author" value="${escape(authorName())}" minlength="2" maxlength="60" required aria-label="Nome profissional"><label class="cm-visually-hidden" for="cmCommentBody">Comentário</label><textarea id="cmCommentBody" name="body" rows="2" minlength="2" maxlength="1000" placeholder="Compartilhe uma ideia ou experiência..." required></textarea><button type="submit" class="cm-primary" ${busy?'disabled':''}>Comentar</button></div></form>`}
function postCard(p){const own=p.author_id===user?.id,opened=p.id===selectedPost;return `<article class="cm-post cm-surface">
 <header class="cm-post-header"><span class="cm-avatar" aria-hidden="true">${badge(p.author_name)}</span><div class="cm-poster"><strong>${escape(p.author_name)}</strong><span>Professor(a) · ${stamp(p.created_at)}</span></div><span class="cm-kind">${p.kind==='activity'?'Atividade':'Discussão'}</span></header>
 <div class="cm-post-content"><span class="cm-topic">◈ ${escape(p.category)}</span><h3>${escape(p.title)}</h3><p>${escape(p.body)}</p>
 ${p.kind==='activity'?`<div class="cm-resource"><span>◷ <strong>Faixa etária:</strong> ${escape(p.age_range||'Não informada')}</span><span>▦ <strong>Materiais:</strong> ${escape(p.materials||'Não informados')}</span></div>`:''}</div>
 <div class="cm-post-actions"><button type="button" data-cm-discuss="${escape(p.id)}" aria-expanded="${opened}">▤ ${opened?'Ocultar comentários':'Comentar / Ver conversa'}</button>${own?`<button type="button" class="cm-danger-link" data-cm-delete-post="${escape(p.id)}">♧ Excluir</button>`:''}</div>
 ${opened?`<div class="cm-inline-comments" id="cmDiscussion"><div class="cm-comments-title">Conversa da publicação</div>${comments.length?comments.map(commentHTML).join(''):'<p class="cm-empty-comments">Seja o primeiro a contribuir com esta conversa.</p>'}${commentForm()}</div>`:''}
 </article>`}
function lessonContent(){return `<section class="cm-surface cm-lesson-card"><div class="cm-section-head"><span class="cm-section-icon">♫</span><div><h2>${lessonKey?escape(lessonTitle):'Discussões das aulas prontas'}</h2><p>${lessonKey?'Troque experiências sobre esta aula com outros professores.':'Cada aula tem uma conversa própria, conectada ao planejamento.'}</p></div></div>
 ${lessonKey?`<div class="cm-lessons-comments">${comments.length?comments.map(commentHTML).join(''):'<p class="cm-empty-comments">Ainda não há comentários para esta aula. Que tal compartilhar sua primeira adaptação?</p>'}</div>${commentForm()}`:'<button type="button" class="cm-primary" data-cm-lessons>Escolher uma aula pronta ↗</button>'}</section>`}
function feedContent(){
 let items=posts.filter(p=>p.kind===view);
 if(category!=='Todas')items=items.filter(p=>p.category===category);
 const search=queryText.trim().toLocaleLowerCase('pt-BR');
 if(search)items=items.filter(p=>[p.title,p.body,p.author_name,p.category].some(x=>String(x||'').toLocaleLowerCase('pt-BR').includes(search)));
 return `${compose?postForm():editor()}
 <div class="cm-feed-toolbar"><div><h2>${view==='activity'?'Biblioteca colaborativa':'Seu feed pedagógico'}</h2><span>${items.length} ${items.length===1?'publicação':'publicações'}</span></div><button type="button" data-cm-reload aria-label="Atualizar publicações">↻ Atualizar</button></div>
 <div class="cm-filter-row"><label class="cm-search-box"><span>⌕</span><input id="cmSearch" type="search" placeholder="Buscar assunto ou professor" value="${escape(queryText)}" autocomplete="off"></label><label class="cm-category"><span class="cm-visually-hidden">Filtrar categoria</span><select id="cmCategory"><option value="Todas">Todas as categorias</option>${CATEGORIES.map(c=>`<option value="${escape(c)}" ${category===c?'selected':''}>${escape(c)}</option>`).join('')}</select></label></div>
 <div class="cm-post-list">${items.length?items.map(postCard).join(''):`<div class="cm-surface cm-no-posts"><span>♫</span><h3>Nenhuma publicação por aqui</h3><p>${posts.length?'Experimente outra pesquisa ou categoria.':'Comece uma conversa e convide outros professores a participar.'}</p></div>`}</div>`;
}
function render(){
 if(!active||!main())return;markNav();
 main().innerHTML=`<section class="cm-page">
 <div class="cm-hero"><div><span class="cm-eyebrow">ESPAÇO DO PROFESSOR · PILOTO</span><h1>Comunidade Musiverso</h1><p>Conexões que inspiram novas experiências musicais.</p></div><span class="cm-hero-decoration" aria-hidden="true">♫</span></div>
 ${views()}<p class="cm-status" id="communityStatus" role="status">${escape(errorText||(loading?'Atualizando comunidade…':''))}</p>
 <div class="cm-layout">${leftRail()}<div class="cm-center">${view==='lesson'?lessonContent():feedContent()}</div>${rightRail()}</div>
 </section>`;
}
async function requireUser(){if(!db)throw Error('A sessão do professor não está disponível.');const {data,error}=await db.auth.getUser();if(error||!data?.user)throw Error('Entre novamente na sua conta do Kids.');user=data.user;return user}
async function list(table,filter){
 await requireUser();let q=db.from(table).select('*').order('created_at',{ascending:false}).limit(100);
 if(filter?.lesson_key)q=q.eq('lesson_key',filter.lesson_key);
 if(filter?.post_id)q=q.eq('post_id',filter.post_id);
 const {data,error}=await q;if(error)throw error;return data||[];
}
async function insert(table,data){await requireUser();const {data:row,error}=await db.from(table).insert(data).select('id').single();if(error||!row?.id)throw error||Error('Não foi possível confirmar a publicação.');return row}
async function remove(table,id){
 await requireUser();const {data,error}=await db.from(table).delete().eq('id',id).eq('author_id',user.id).select('id');
 if(error||!data?.length)throw error||Error('Não foi possível confirmar a exclusão.');
}
async function load(){
 if(!active)return;loading=true;errorText='';render();
 try{await requireUser();if(view==='lesson')comments=lessonKey?await list('kids_community_comments',{lesson_key:lessonKey}):[];
 else{posts=await list('kids_community_posts');comments=selectedPost?await list('kids_community_comments',{post_id:selectedPost}):[]}}
 catch(e){errorText='Não foi possível carregar as publicações. Confira a conexão e sua permissão de professor.';notify(errorText,'error')}
 finally{loading=false;render()}
}
function open(which='forum',key='',name=''){
 active=true;view=which;lessonKey=key;lessonTitle=name;comments=[];selectedPost='';compose=false;category='Todas';queryText='';
 location.hash='comunidade';render();load();window.scrollTo({top:0,behavior:'instant'});
}
function close(){if(!active)return;active=false;document.querySelector('[data-community-tab]')?.classList.remove('active')}
function goLessons(){close();document.querySelector('[data-tab="aulas"]')?.click()}
async function act(operation,success){
 if(busy)return;busy=true;
 try{await operation();notify(success,'success');compose=false;await load()}
 catch(e){notify('Não foi possível concluir. '+(e.message||'Verifique sua conexão.'),'error')}
 finally{busy=false;render()}
}
document.addEventListener('click',async e=>{
 const lesson=e.target.closest('[data-community-lesson]');
 if(lesson){e.preventDefault();open('lesson',lesson.dataset.communityLesson,lesson.dataset.communityTitle||'Aula pronta');return}
 if(e.target.closest('[data-community-tab]')){e.preventDefault();open();return}
 if(e.target.closest('[data-tab],[data-go],[data-history-tab],[data-repertoire-tab]')){close();return}
 if(!active)return;
 const tab=e.target.closest('[data-cm-view]');if(tab){view=tab.dataset.cmView;selectedPost='';lessonKey='';compose=false;category='Todas';queryText='';comments=[];await load();return}
 const action=e.target.closest('[data-cm-compose]');
 if(action){view=action.dataset.cmCompose;compose=true;selectedPost='';render();document.getElementById('cmComposer')?.scrollIntoView({block:'start',behavior:'smooth'});return}
 if(e.target.closest('[data-cm-close-compose]')){compose=false;render();return}
 if(e.target.closest('[data-cm-lessons]')){goLessons();return}
 if(e.target.closest('[data-cm-reload]')){await load();return}
 const discussion=e.target.closest('[data-cm-discuss]');
 if(discussion){selectedPost=selectedPost===discussion.dataset.cmDiscuss?'':discussion.dataset.cmDiscuss;await load();if(selectedPost)document.getElementById('cmDiscussion')?.scrollIntoView({block:'nearest',behavior:'smooth'});return}
 const drop=e.target.closest('[data-cm-delete-post]');
 if(drop){if(!confirm('Deseja excluir esta publicação e seus comentários?'))return;await act(async()=>{await remove('kids_community_posts',drop.dataset.cmDeletePost);selectedPost=''},'Publicação excluída com sucesso.');return}
 const dropComment=e.target.closest('[data-cm-delete-comment]');
 if(dropComment){if(!confirm('Deseja excluir este comentário?'))return;await act(()=>remove('kids_community_comments',dropComment.dataset.cmDeleteComment),'Comentário excluído com sucesso.')}
});
document.addEventListener('input',e=>{
 if(!active)return;
 if(e.target.id==='cmSearch'){queryText=e.target.value;const start=e.target.selectionStart;render();const field=document.getElementById('cmSearch');field?.focus();if(typeof start==='number')field?.setSelectionRange(start,start)}
});
document.addEventListener('change',e=>{if(active&&e.target.id==='cmCategory'){category=e.target.value;render()}});
document.addEventListener('submit',async e=>{
 if(!active||!['cmPostForm','cmCommentForm'].includes(e.target.id))return;
 e.preventDefault();if(busy)return;
 const f=new FormData(e.target),name=String(f.get('author')||'').trim(),body=String(f.get('body')||'').trim();
 if(name.length<2||!body)return;authorDraft=name;
 await requireUser().catch(()=>{});
 if(!user){notify('Sua sessão não está disponível. Entre novamente.','error');return}
 if(e.target.id==='cmPostForm'){
  const kind=view==='activity'?'activity':'forum';
  await act(()=>insert('kids_community_posts',{author_id:user.id,author_name:name,kind,category:String(f.get('category')||'Outros'),title:String(f.get('title')||'').trim(),body,age_range:String(f.get('age')||'').trim(),materials:String(f.get('materials')||'').trim()}),'Publicação criada com sucesso.');
 }else{
  if(view==='lesson'&&!lessonKey){notify('Selecione uma aula antes de comentar.','error');return}
  await act(()=>insert('kids_community_comments',{author_id:user.id,author_name:name,body,post_id:view==='lesson'?null:selectedPost,lesson_key:view==='lesson'?lessonKey:null}),'Comentário publicado com sucesso.');
 }
});
window.addEventListener('hashchange',()=>{if(location.hash==='#comunidade'&&!active)open();else if(location.hash!=='#comunidade')close()});
window.addEventListener('teacher-refreshed',()=>{if(active)load()});
if(location.hash==='#comunidade')open();
})();
