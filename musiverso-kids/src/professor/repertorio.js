/* Musiverso Kids — teacher-only repertoire and activity library.
 * Works exclusively within Kids TeacherStorage; no Studio endpoint or shared data.
 */
(()=>{
'use strict';
const SONGS=[
 {id:'seven-jumps',title:'Seven Jumps',artist:'Shenanigans',collection:'Dance Music for Children',kind:'Movimento e pulso',icon:'🦶',goal:'Vivenciar pulsação regular, escuta das mudanças musicais e imitação de gestos.',activity:'Caminhe com a turma seguindo a música. Nas mudanças musicais, proponha um gesto simples: levantar os braços, agachar ou tocar a cabeça. Não exija os sete movimentos originais.',materials:'Espaço seguro para caminhar; cartões com gestos.',tip:'Crianças que não querem caminhar podem fazer os gestos sentadas.',time:'5–7 min'},
 {id:'shoemakers',title:"Shoemaker’s Dance",artist:'Shenanigans',collection:'Dance Music for Children',kind:'Imitação e ritmo',icon:'👞',goal:'Explorar batidas regulares e sequências simples de movimentos.',activity:'Conte que uma oficina fabrica sapatos mágicos. As crianças imitam marteladas suaves nas pernas, depois costuram no ar e caminham com sapatos imaginários.',materials:'Sapato de brinquedo; tambor; caixa cenográfica.',tip:'Faça apenas dois gestos por vez e repita antes de acrescentar outro.',time:'5–7 min'},
 {id:'la-raspa',title:'La Raspa',artist:'Shenanigans',collection:'Danças e jogos folclóricos',kind:'Movimento e pulso',icon:'🎀',goal:'Experimentar pulso em deslocamentos e contrastes entre trechos musicais.',activity:'Com fitas de tecido, alternar caminhada no pulso e movimentos das fitas para cima e para baixo conforme a música. Não usar a coreografia completa.',materials:'Fitas curtas de tecido bem presas; espaço livre.',tip:'Não prenda fitas ao pescoço ou às mãos; acompanhe a movimentação de perto.',time:'5–7 min'},
 {id:'shake-stop',title:'Shake and Stop',artist:'Lynn Kleiner',collection:'Kids Make Music, Babies Make Music Too!',kind:'Som e silêncio',icon:'🪇',goal:'Responder a momentos de tocar e silenciar; desenvolver escuta e autocontrole.',activity:'Primeiro explore os chocalhos livremente. Depois acompanhe a gravação: tocar enquanto houver indicação musical e congelar nas paradas.',materials:'Chocalhos infantis íntegros; fantoche de maestro.',tip:'Experimente movimentos baixos e altos sem cobrar sincronia perfeita.',time:'5–8 min'},
 {id:'up-so-high',title:'Up So High',artist:'Lynn Kleiner',collection:'Kids Make Music, Babies Make Music Too!',kind:'Movimento e pulso',icon:'🙌',goal:'Relacionar frase musical e movimento, promovendo imitação e coordenação.',activity:'Mover as mãos para cima, para baixo e para os lados; nas repetições, acompanhar o pulso com chocalhos.',materials:'Chocalhos; cartões com setas grandes.',tip:'O professor demonstra cada gesto antes da gravação.',time:'4–6 min'},
 {id:'jig-jog',title:'Jig Jog',artist:'Lynn Kleiner',collection:'Kids Make Music, Babies Make Music Too!',kind:'Movimento e pulso',icon:'🐴',goal:'Experimentar pulsação por meio do balanço corporal e de repetições vocais.',activity:'Na roda, as crianças balançam o corpo suavemente como num passeio de cavalinho; o professor marca o pulso com um tambor.',materials:'Fantoche de cavalo; tambor; tapetes.',tip:'O balanço pode ser realizado sentado ou com a criança apoiada pelo responsável.',time:'4–6 min'},
 {id:'con-mi-mano',title:'Con mi mano (Choco la mesa)',artist:'El Pequeño Caracolito / Fátima Gómez',collection:'Canção de percussão corporal',kind:'Imitação e ritmo',icon:'👏',goal:'Explorar percussão corporal e imitar pequenas células rítmicas.',activity:'Bata suavemente uma mão de cada vez sobre as pernas ou uma mesa infantil. Convide a turma a repetir padrões curtos, sem exigir a velocidade da gravação.',materials:'Mesa infantil ou tapete; cartões de mãos.',tip:'Comece com uma única batida por pulso; aumente a dificuldade apenas se a turma demonstrar conforto.',time:'5–7 min'},
 {id:'mariposa',title:'Mariposa, mariposa',artist:'El Pequeño Caracolito / Fátima Gómez',collection:'Canção de movimento',kind:'Expressão e movimento',icon:'🦋',goal:'Associar pulsação, coordenação manual e gestos expressivos.',activity:'As mãos viram borboletas que voam no pulso e pousam ao sinal do professor. Utilize o tecido leve apenas como recurso opcional.',materials:'Fantoche de borboleta; lenços leves; flores ilustradas.',tip:'Permita exploração livre antes de convidar para acompanhar o pulso.',time:'5–7 min'},
 {id:'lion',title:'Marche royale du lion',artist:'Camille Saint-Saëns',collection:'Le Carnaval des animaux',kind:'Escuta instrumental',icon:'🦁',goal:'Vivenciar a pulsação de marcha e perceber caráter musical.',activity:'O rei leão inicia um desfile. As crianças caminham com passos fortes e controlados; em trechos de rugido, fazem gestos de leão.',materials:'Fantoche ou figura de leão; tambor.',tip:'Separe um pequeno trecho da gravação e explore a marcha antes de contar a história.',time:'6–8 min'},
 {id:'tortues',title:'Tortues',artist:'Camille Saint-Saëns',collection:'Le Carnaval des animaux',kind:'Escuta instrumental',icon:'🐢',goal:'Perceber a pulsação lenta e desenvolver atenção à escuta instrumental.',activity:'As tartarugas atravessam um jardim imaginário, lentamente. As crianças caminham ou balançam o corpo no pulso indicado pelo professor.',materials:'Fantoche de tartaruga; imagens de jardim; tambor.',tip:'Não exigir deslocamento; as mãos também podem representar o passeio.',time:'5–7 min'}
];
const KEY='kids-teacher-repertorio-favorites-v1';
let active=false,filter='Todas',favoritesOnly=false,selected=null;
const main=()=>document.getElementById('main');
function safeJson(value){try{return JSON.parse(value)}catch{return []}}
function favorites(){return new Set((safeJson(window.TeacherStorage?.getItem(KEY)||'[]')||[]).filter(x=>typeof x==='string'))}
function persist(ids){window.TeacherStorage?.setItem(KEY,JSON.stringify([...ids]))}
function escapeHtml(value){return String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]))}
function spotify(song){return 'https://open.spotify.com/search/'+encodeURIComponent(song.title+' '+song.artist)}
function card(song,stars){
 const fav=stars.has(song.id),expanded=selected===song.id;
 return `<article class="rp-card">
  <div class="rp-card-head"><span class="rp-emoji" aria-hidden="true">${song.icon}</span><div class="rp-card-heading"><span class="rp-category">${escapeHtml(song.kind)}</span><h3>${escapeHtml(song.title)}</h3><p>${escapeHtml(song.artist)}</p></div><button type="button" class="rp-favorite ${fav?'saved':''}" data-rp-favorite="${song.id}" aria-label="${fav?'Remover dos':'Adicionar aos'} favoritos" aria-pressed="${fav}">${fav?'♥':'♡'}</button></div>
  <p class="rp-summary"><strong>Objetivo:</strong> ${escapeHtml(song.goal)}</p><div class="rp-card-actions"><button type="button" class="rp-open" data-rp-open="${song.id}" aria-expanded="${expanded}">${expanded?'Recolher proposta':'Ver atividade e materiais'}</button><a href="${spotify(song)}" rel="noopener noreferrer" target="_blank">Buscar no Spotify ↗</a></div>
  ${expanded?`<div class="rp-details"><p><strong>Como fazer:</strong> ${escapeHtml(song.activity)}</p><p><strong>Materiais:</strong> ${escapeHtml(song.materials)}</p><p><strong>Adaptação:</strong> ${escapeHtml(song.tip)}</p><span class="rp-time">⏱ ${escapeHtml(song.time)} de exploração</span></div>`:''}
 </article>`;
}
function render(){
 if(!active||!main())return;
 document.querySelectorAll('[data-tab]').forEach(b=>{b.classList.remove('active');b.removeAttribute('aria-current')});
 const nav=document.querySelector('[data-repertoire-tab]');nav?.classList.add('active');nav?.setAttribute('aria-current','page');
 const stars=favorites(),types=['Todas',...new Set(SONGS.map(s=>s.kind))],items=SONGS.filter(s=>(filter==='Todas'||s.kind===filter)&&(!favoritesOnly||stars.has(s.id)));
 main().innerHTML=`<section class="rp-library">
 <div class="page-intro"><div><span class="eyebrow">CURADORIA · MUSICALIZAÇÃO INFANTIL</span><h1>Repertório e Atividades</h1><p class="lead">10 experiências musicais para crianças de 2–3 anos: pulso, ritmo, movimento e escuta ativa.</p></div><span class="pill">Coleção 01 · Pulso e ritmo</span></div>
 <div class="rp-banner"><span class="rp-big-icon" aria-hidden="true">🎶</span><div><h2>Uma música, muitas descobertas!</h2><p>Inspirações em Shenanigans, Lynn Kleiner, El Pequeño Caracolito e O Carnaval dos Animais. Atividades adaptadas para 2–3 anos e orientadas pelo professor.</p></div></div>
 <div class="rp-toolbar"><label>Habilidade musical<select id="rpFilter">${types.map(t=>`<option value="${escapeHtml(t)}" ${filter===t?'selected':''}>${escapeHtml(t)}</option>`).join('')}</select></label><label class="rp-favcheck"><input type="checkbox" id="rpFavoriteOnly" ${favoritesOnly?'checked':''}> Apenas favoritos (${stars.size})</label><span class="rp-total">${items.length} música(s)</span></div>
 <div class="rp-cards">${items.length?items.map(s=>card(s,stars)).join(''):'<p class="rp-empty">Não há músicas favoritas neste filtro. Toque no coração de uma música para adicioná-la.</p>'}</div>
 <section class="rp-class-plan"><h2>Roteiro sugerido · 30 minutos</h2><p>Uma sequência pronta para experimentar as diferentes habilidades em uma única aula.</p>
 <ol><li><strong>Jig Jog · 5 min</strong> — acolhimento e balanço no pulso</li><li><strong>Shake and Stop · 6 min</strong> — chocalhos, som e silêncio</li><li><strong>Con mi mano · 6 min</strong> — percussão corporal</li><li><strong>Marche royale du lion · 7 min</strong> — marcha e história participativa</li><li><strong>Tortues · 6 min</strong> — movimento lento e escuta</li></ol><button type="button" class="btn" data-rp-print>⎙ Imprimir roteiro e repertório</button></section>
 <p class="rp-footnote">Os links abrem uma pesquisa pelo título e artista no Spotify, não um áudio hospedado pelo Kids. Confirme a gravação antes da aula. Os favoritos são salvos exclusivamente na conta do professor do Kids. Nunca exija sincronização rítmica perfeita de crianças pequenas.</p>
 </section>`;
}
function open(){active=true;location.hash='repertorio';render();window.scrollTo({top:0,behavior:'instant'})}
function close(){if(!active)return;active=false;document.querySelector('[data-repertoire-tab]')?.classList.remove('active')}
document.addEventListener('click',event=>{
 const nav=event.target.closest('[data-repertoire-tab]');if(nav){event.preventDefault();open();return}
 if(event.target.closest('[data-tab],[data-go]')){close();return}
 if(!active)return;
 const fav=event.target.closest('[data-rp-favorite]');if(fav){const ids=favorites(),id=fav.dataset.rpFavorite;ids.has(id)?ids.delete(id):ids.add(id);persist(ids);render();return}
 const exp=event.target.closest('[data-rp-open]');if(exp){selected=selected===exp.dataset.rpOpen?null:exp.dataset.rpOpen;render();return}
 if(event.target.closest('[data-rp-print]')){window.print();return}
});
document.addEventListener('change',event=>{
 if(!active)return;
 if(event.target.id==='rpFilter'){filter=event.target.value;render()}
 if(event.target.id==='rpFavoriteOnly'){favoritesOnly=event.target.checked;render()}
});
window.addEventListener('hashchange',()=>{if(location.hash==='#repertorio'){active=true;render()}else close()});
window.addEventListener('teacher-refreshed',()=>{if(active)queueMicrotask(render)});
if(location.hash==='#repertorio')open();
})();
