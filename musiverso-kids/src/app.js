'use strict';
const $=s=>document.querySelector(s), esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const initial={name:'Explorador',avatar:'🧒',xp:0,done:[],wins:[],sound:true,narration:false,large:false,reduced:false,composerUnlocked:1,composerDone:[]};let saved;try{saved=JSON.parse(localStorage.getItem((window.MusiversoProgressKey||'musiverso-kids-v1'))||'null')}catch{}let state={...initial,...saved};let page='home',audioCtx,stopTimer,session=0,activeGame=null;const save=()=>{const fresh=window.MusiversoMedals?.sync()||[];try{localStorage.setItem((window.MusiversoProgressKey||'musiverso-kids-v1'),JSON.stringify(state))}catch{toast('O navegador não permitiu salvar o progresso.')}window.MusiversoCloudProgress?.save(state);if(fresh.length)window.MusiversoMedals.announce(fresh)};

window.MusiversoApplyCloudProgress=function(incoming){const before=JSON.stringify([state.xp,state.done,state.wins]);state={...initial,...window.MusiversoCloudProgress.merge(state,incoming)};chrome();if(page==='profile')profile();else if(page==='home'&&before!==JSON.stringify([state.xp,state.done,state.wins]))home()};
const worlds=[
{title:'Os primeiros sons',icon:'🪨',color:'#dff4df',subtitle:'Voz, corpo e natureza',text:'Muito antes dos pianos e dos violões, as pessoas já podiam explorar sons com a voz, o corpo e materiais da natureza. Instrumentos antigos feitos de osso sobreviveram por milhares de anos. Não sabemos exatamente quando a música começou: vamos imaginar possibilidades e experimentar!',discover:['Bata palmas bem devagar.','Bata as mãos nas pernas.','Combine os dois sons e invente um ritmo.'],questions:[['Qual destes sons você faz com o corpo?',['Palmas','Buzina','Piano'],0],['Qual material pode produzir som ao ser tocado?',['Madeira','Sombra','Reflexo'],0],['Sabemos exatamente quando a música começou?',['Sim, ontem','Não sabemos','Quando surgiu o piano'],1]]},
{title:'Músicas da Antiguidade',icon:'🏛️',subtitle:'Muitos povos, muitos sons',text:'No Egito, na Grécia, na China e em muitos outros lugares, a música fazia parte de festas, cerimônias e da vida cotidiana. Havia flautas, tambores, liras e muitos outros instrumentos. Cada povo tinha seus próprios caminhos musicais.',discover:['Imagine o som de uma corda vibrando.','Compare uma flauta com um tambor.','Descubra: instrumentos de sopro usam ar!'],questions:[['Como uma flauta produz som?',['Com luz','Com o ar','Com tinta'],1],['Qual instrumento tem cordas?',['Lira','Tambor','Chocalho'],0],['Na Antiguidade, a música existia…',['Em diferentes povos','Só em um país','Só nos computadores'],0]]},
{title:'Castelos e cantigas',icon:'🏰',subtitle:'Uma janela para a Europa medieval',text:'Na Europa medieval, a música podia ser ouvida nas igrejas, nas ruas e nos castelos. Trovadores criavam canções. Muitas músicas eram transmitidas pela escuta; outras eram escritas. Hildegard von Bingen foi uma compositora dessa época.',discover:['Cante uma frase sozinho.','Convide alguém para cantar junto.','Uma pessoa canta solo; várias podem formar um coro.'],questions:[['Um grupo de pessoas cantando forma um…',['Coro','Violino','Tambor'],0],['Quem foi Hildegard von Bingen?',['Uma compositora','Um instrumento','Uma dança'],0],['Trovadores criavam…',['Computadores','Canções','Pianos elétricos'],1]]},
{title:'Vozes do Renascimento',icon:'🎶',subtitle:'Melodias que se encontram',text:'No Renascimento europeu, compositores como Josquin des Prez exploraram melodias que acontecem ao mesmo tempo. Chamamos essa combinação de polifonia. A impressão musical ajudou a compartilhar partituras. Em outras partes do mundo, muitas tradições também seguiam se desenvolvendo.',discover:['Cante uma nota longa.','Peça a alguém que cante outra nota.','Escute como as vozes se misturam.'],questions:[['O que pode acontecer na polifonia?',['Várias melodias juntas','Só silêncio','Nenhuma voz'],0],['Uma partitura ajuda a…',['Registrar música','Cozinhar','Acender uma luz'],0],['Josquin des Prez foi um…',['Compositor','Tambor','Microfone'],0]]},
{title:'O mundo do Barroco',icon:'🎻',subtitle:'Bach, Vivaldi e novas descobertas',text:'Bach e Vivaldi viveram no período que chamamos de Barroco na história da música europeia. O cravo e o violino estavam presentes em muitas obras. Vivaldi escreveu As Quatro Estações, uma coleção de concertos que nos convida a imaginar cenas da natureza.',discover:['Imagine uma chuva em forma de música.','Como seria uma música sobre o verão?','No menu Compositores, ouça um trecho de Bach.'],questions:[['Quem escreveu As Quatro Estações?',['Vivaldi','Mozart','Chopin'],0],['Qual destes é um instrumento de cordas?',['Violino','Flauta','Triângulo'],0],['Bach é associado ao…',['Barroco','Cinema mudo apenas','Rock dos anos 1990'],0]]},
{title:'O palco do Classicismo',icon:'🎹',subtitle:'Mozart, Haydn e a orquestra',text:'No Classicismo europeu, Mozart e Haydn criaram sinfonias, sonatas e outras obras. Na orquestra, diferentes famílias de instrumentos fazem música juntas. Mozart também escreveu óperas: histórias contadas com música, canto e teatro!',discover:['Imagine uma conversa entre dois instrumentos.','Escolha quem pergunta e quem responde.','Ouça Mozart no menu Compositores.'],questions:[['O que é uma ópera?',['História com música, canto e teatro','Um tipo de tambor','Uma peça de roupa'],0],['Quem compôs A Flauta Mágica?',['Mozart','Vivaldi','Bach'],0],['Uma orquestra reúne…',['Diferentes instrumentos','Somente pianos','Somente cantores'],0]]},
{title:'Histórias do Romantismo',icon:'🌙',subtitle:'Imaginação e expressão',text:'Beethoven ajudou a abrir caminhos entre o Classicismo e o Romantismo. Depois, artistas como Schubert, Chopin e Clara Schumann criaram obras muito expressivas. Uma mesma música pode despertar ideias diferentes em cada pessoa. Não existe uma única emoção certa para sentir!',discover:['Ouça uma melodia de olhos fechados.','Imagine uma cena para ela.','Conte o que você imaginou.'],questions:[['Clara Schumann foi pianista e…',['Compositora','Instrumento','Rainha do Egito'],0],['Chopin escreveu muitas obras para…',['Piano','Bateria eletrônica','Buzina'],0],['Duas pessoas podem imaginar cenas diferentes ouvindo a mesma música?',['Sim','Não','Só com fones'],0]]},
{title:'Muitos caminhos musicais',icon:'🎧',subtitle:'Do século XX até hoje',text:'Nos séculos XX e XXI, gravações, rádio, cinema e computadores ampliaram as formas de criar e compartilhar música. Jazz, rock, música eletrônica e muitos outros caminhos ganharam espaço. Compositores também criam trilhas para filmes e jogos. A música continua mudando!',discover:['Escute os sons ao seu redor.','Escolha um som para uma cena de aventura.','Crie sua trilha em Maestro por um dia.'],questions:[['Uma trilha sonora pode acompanhar…',['Um filme ou jogo','Apenas uma partitura','Somente um violino'],0],['Qual recurso permite guardar uma apresentação sonora?',['Gravação','Uma sombra','Uma lanterna'],0],['A música de hoje…',['Continua se transformando','Parou de mudar','Existe em um único estilo'],0]]},
{title:'Brasil de muitos sons',icon:'🪘',subtitle:'Culturas, encontros e tradições',text:'A música no Brasil reúne muitas histórias. Povos indígenas têm tradições próprias e diversas. Culturas africanas e afro-brasileiras, europeias e de outras origens participam dessa riqueza. Chiquinha Gonzaga, Pixinguinha, Villa-Lobos e muitos outros artistas fazem parte desses caminhos. Em Pernambuco, frevo, maracatu e ciranda convidam a descobrir!',discover:['Pergunte à família qual música faz parte da sua história.','Conheça um ritmo da sua região.','Descubra uma música que você ainda não ouviu.'],questions:[['Qual destes ritmos faz parte da cultura de Pernambuco?',['Frevo','Valsa vienense apenas','Flamenco apenas'],0],['Chiquinha Gonzaga foi…',['Compositora e pianista','Uma flauta','Uma figura de pausa'],0],['As tradições musicais indígenas são…',['Diversas, como seus povos','Todas iguais','Uma única canção'],0]]}
];
const games=[['polyphony','🎙️','Brincar de polifonia','Grave vozes e descubra melodias juntas.','#e8dcff'],['sound','🔊','Que som é esse?','Descubra os timbres.','#ffe1e8'],['memory','🃏','Memória sonora','Encontre os pares de sons.','#d9f5e5'],['echo','👏','Eco musical','Escute e repita o ritmo.','#d9eeff'],['composer','🎼','Quem compôs?','Conheça melodias e seus criadores.','#fff0c6'],['rhythm','🥁','Oficina de ritmos','Invente uma batida só sua.','#eadbff'],['maestro','🪄','Maestro por um dia','Misture sons e crie sua trilha.','#dcf3fa'],['figures','♩','Sons e silêncios','Descubra as figuras musicais.','#fff0d4'],['families','🎻','Famílias dos instrumentos','Junte cada instrumento à sua família.','#fce6cb'],['staff','🎼','Notas na pauta','Escolha, observe e descubra a nota.','#e2efff']];
const homeCuriosities=[
 "Violino, violoncelo e contrabaixo pertencem à família das cordas: suas cordas vibram para produzir o som.",
 "Flauta, clarinete, oboé e fagote são instrumentos de sopro: o ar participa da produção do som.",
 "Os tímpanos são instrumentos de percussão. O músico toca suas peles esticadas com baquetas.",
 "No piano acústico, as teclas acionam pequenos martelos que fazem as cordas vibrarem.",
 "As cordas do violão vibram quando são dedilhadas ou tocadas.",
 "Um tambor produz som quando sua membrana vibra depois de uma batida.",
 "Um mesmo tambor pode produzir timbres diferentes quando tocamos o centro ou a borda.",
 "O piano começou a ganhar forma na Itália por volta de 1700, com Bartolomeo Cristofori.",
 "A pauta musical tem cinco linhas e quatro espaços principais para escrever as notas.",
 "As linhas e os espaços da pauta são contados de baixo para cima.",
 "A clave ajuda a identificar os nomes e as alturas das notas escritas na pauta.",
 "Na clave de sol, Dó4 fica na linha suplementar logo abaixo da pauta; Ré4 fica no espaço acima dele.",
 "A mesma posição na pauta pode representar notas diferentes nas claves de sol e de fá.",
 "As figuras musicais ajudam a escrever quanto tempo um som dura.",
 "Quando a semínima vale um pulso, a mínima dura dois pulsos e a semibreve dura quatro.",
 "Quando a semínima vale um pulso, duas colcheias cabem nesse mesmo pulso.",
 "Uma pausa também faz parte da música: ela indica uma duração de silêncio.",
 "Antes dos instrumentos de teclado, as pessoas já podiam fazer música com a voz, as palmas e os pés.",
 "Não sabemos exatamente quando a música começou. Instrumentos antigos ajudam a estudar o passado, mas não contam toda a história.",
 "Na Antiguidade, diferentes povos faziam música em festas, cerimônias e na vida cotidiana.",
 "Hildegard von Bingen foi uma compositora da Idade Média que criou músicas para vozes.",
 "Os trovadores criavam canções que podiam ser ouvidas na Europa medieval.",
 "Na Idade Média, a escola de Notre-Dame, em Paris, ficou ligada ao desenvolvimento do organum, com vozes diferentes cantando juntas.",
 "Léonin e Pérotin são nomes importantes da música ligada a Notre-Dame e ao organum medieval.",
 "Guillaume de Machaut foi um compositor do século XIV ligado à Ars Nova.",
 "Polifonia é quando duas ou mais melodias diferentes soam ao mesmo tempo.",
 "No Renascimento europeu, a impressão musical ajudou a compartilhar partituras.",
 "Vivaldi compôs As Quatro Estações, obra que convida a imaginar cenas da natureza.",
 "Bach compôs para vozes, órgão, cravo e muitos outros instrumentos.",
 "Mozart compôs A Flauta Mágica. Uma ópera conta uma história com música, canto e teatro.",
 "Haydn explorou contrastes de intensidade: na Sinfonia Surpresa, um acorde forte interrompe uma passagem suave.",
 "Chiquinha Gonzaga foi compositora, pianista e regente e criou músicas para o teatro e o carnaval.",
 "O frevo é uma tradição musical de Pernambuco que também inspira passos cheios de energia.",
 "Frevo, maracatu e ciranda fazem parte da riqueza musical de Pernambuco.",
 "As tradições musicais indígenas são diversas, assim como os povos que as mantêm.",
 "Gravações permitem ouvir novamente uma apresentação musical em outro momento."
];
const homeCuriosityMedia=[
 {
  "images": [
   {
    "src": "assets/instruments/violin.jpg",
    "alt": "Violino"
   },
   {
    "src": "assets/instruments/cello.jpg",
    "alt": "Violoncelo"
   },
   {
    "src": "assets/instruments/contrabass.jpg",
    "alt": "Contrabaixo"
   }
  ],
  "caption": "A família das cordas"
 },
 {
  "images": [
   {
    "src": "assets/instruments/flute.jpg",
    "alt": "Flauta doce"
   },
   {
    "src": "assets/instruments/clarinet.jpg",
    "alt": "Clarinete"
   },
   {
    "src": "assets/instruments/oboe.jpg",
    "alt": "Oboé"
   },
   {
    "src": "assets/instruments/bassoon.jpg",
    "alt": "Fagote"
   }
  ],
  "caption": "Instrumentos de sopro"
 },
 {
  "images": [
   {
    "src": "assets/instruments/timpani.jpg",
    "alt": "Tímpanos, instrumentos de percussão"
   }
  ],
  "caption": "Tímpanos"
 },
 {
  "images": [
   {
    "src": "assets/instruments/piano.jpg",
    "alt": "Piano acústico, um instrumento com teclas e cordas"
   }
  ],
  "caption": "O piano acústico"
 },
 {
  "images": [
   {
    "src": "assets/instruments/guitar.png",
    "alt": "Violão com suas cordas"
   }
  ],
  "caption": "As cordas do violão"
 },
 {
  "images": [
   {
    "src": "assets/instruments/drum.jpg",
    "alt": "Tambor com uma membrana esticada"
   }
  ],
  "caption": "O tambor"
 },
 {
  "images": [
   {
    "src": "assets/facts/tambor.svg",
    "alt": "Ilustração de um tambor com o centro e a borda indicados"
   }
  ],
  "caption": "Centro e borda: timbres diferentes"
 },
 {
  "images": [
   {
    "src": "assets/instruments/piano.jpg",
    "alt": "Piano acústico"
   }
  ],
  "caption": "O piano e sua história"
 },
 {
  "images": [
   {
    "src": "assets/facts/pauta.svg",
    "alt": "Pauta com cinco linhas e quatro espaços, numerados de baixo para cima"
   }
  ],
  "caption": "Cinco linhas e quatro espaços"
 },
 {
  "images": [
   {
    "src": "assets/facts/pauta.svg",
    "alt": "Linhas de um a cinco e espaços de um a quatro, contados de baixo para cima"
   }
  ],
  "caption": "A leitura começa de baixo para cima"
 },
 {
  "images": [
   {
    "src": "assets/facts/claves.svg",
    "alt": "A linha inferior representa Mi4 na clave de sol e Sol2 na clave de fá"
   }
  ],
  "caption": "A clave muda a leitura da pauta"
 },
 {
  "images": [
   {
    "src": "assets/facts/do-re.svg",
    "alt": "Dó4 na linha suplementar inferior e Ré4 no espaço logo acima, na clave de sol"
   }
  ],
  "caption": "Dó4 e Ré4 na clave de sol"
 },
 {
  "images": [
   {
    "src": "assets/facts/claves.svg",
    "alt": "Notas na mesma posição da pauta, identificadas como Mi4 na clave de sol e Sol2 na clave de fá"
   }
  ],
  "caption": "Mesma posição, notas diferentes"
 },
 {
  "images": [
   {
    "src": "assets/facts/figuras.svg",
    "alt": "Semibreve, mínima e semínima com durações de quatro, dois e um pulso quando a semínima vale um pulso"
   }
  ],
  "caption": "As figuras registram a duração"
 },
 {
  "images": [
   {
    "src": "assets/facts/figuras.svg",
    "alt": "Comparação entre semibreve, mínima e semínima, com a semínima valendo um pulso"
   }
  ],
  "caption": "Quatro, dois e um pulso"
 },
 {
  "images": [
   {
    "src": "assets/facts/colcheias.svg",
    "alt": "Duas colcheias ligadas por uma barra equivalem à duração de uma semínima"
   }
  ],
  "caption": "Duas colcheias e uma semínima"
 },
 {
  "images": [
   {
    "src": "assets/facts/pausa.svg",
    "alt": "Figura de pausa de semínima, um sinal de silêncio"
   }
  ],
  "caption": "A pausa também faz parte da música"
 },
 {
  "images": [
   {
    "src": "assets/history/clapping.jpg",
    "alt": "Fotografia atual de mãos batendo palmas"
   }
  ],
  "caption": "Palmas: música com o corpo"
 },
 {
  "images": [
   {
    "src": "assets/history/bone-flute.jpg",
    "alt": "Fotografia de uma flauta antiga feita de osso"
   }
  ],
  "caption": "Uma flauta de osso encontrada por pesquisadores"
 },
 {
  "images": [
   {
    "src": "assets/history/lyre.jpg",
    "alt": "Reconstrução de uma lira da Antiguidade"
   }
  ],
  "caption": "Uma reconstrução de lira antiga"
 },
 {
  "images": [
   {
    "src": "assets/people/hildegard.jpg",
    "alt": "Representação histórica de Hildegard von Bingen"
   }
  ],
  "caption": "Hildegard von Bingen"
 },
 {
  "images": [
   {
    "src": "assets/history/troubadour.jpg",
    "alt": "Imagem de um manuscrito medieval representando o trovador Perdigon"
   }
  ],
  "caption": "Um trovador medieval"
 },
 {
  "images": [
   {
    "src": "assets/history/notre-dame.jpg",
    "alt": "Fotografia atual da Catedral de Notre-Dame, em Paris"
   }
  ],
  "caption": "Notre-Dame de Paris"
 },
 {
  "images": [
   {
    "src": "assets/history/perotin-score.jpg",
    "alt": "Página de manuscrito com música atribuída a Pérotin"
   }
  ],
  "caption": "Música atribuída a Pérotin"
 },
 {
  "images": [
   {
    "src": "assets/history/machaut.jpg",
    "alt": "Miniatura histórica representando Guillaume de Machaut"
   }
  ],
  "caption": "Guillaume de Machaut"
 },
 {
  "images": [
   {
    "src": "assets/facts/polifonia.svg",
    "alt": "Duas linhas melódicas diferentes alinhadas no mesmo tempo, representando duas vozes"
   }
  ],
  "caption": "Polifonia: melodias ao mesmo tempo"
 },
 {
  "images": [
   {
    "src": "assets/history/manuscript.gif",
    "alt": "Trecho de manuscrito musical de Johannes Ockeghem, do século XV"
   }
  ],
  "caption": "Música escrita no Renascimento"
 },
 {
  "images": [
   {
    "src": "assets/people/vivaldi.jpg",
    "alt": "Retrato de Antonio Vivaldi"
   }
  ],
  "caption": "Antonio Vivaldi"
 },
 {
  "images": [
   {
    "src": "assets/people/bach.jpg",
    "alt": "Retrato de Johann Sebastian Bach"
   }
  ],
  "caption": "Johann Sebastian Bach"
 },
 {
  "images": [
   {
    "src": "assets/people/mozart.jpg",
    "alt": "Retrato de Wolfgang Amadeus Mozart"
   },
   {
    "src": "assets/history/magic-flute.jpg",
    "alt": "Projeto de cenário de cerca de 1815 para A Flauta Mágica, de Mozart"
   }
  ],
  "caption": "Mozart e A Flauta Mágica"
 },
 {
  "images": [
   {
    "src": "assets/people/haydn.jpg",
    "alt": "Retrato de Joseph Haydn"
   }
  ],
  "caption": "Joseph Haydn"
 },
 {
  "images": [
   {
    "src": "assets/people/chiquinha.jpg",
    "alt": "Retrato de Chiquinha Gonzaga"
   }
  ],
  "caption": "Chiquinha Gonzaga"
 },
 {
  "images": [
   {
    "src": "assets/history/frevo.jpg",
    "alt": "Passistas de frevo com sombrinhas coloridas, em Pernambuco"
   }
  ],
  "caption": "Passistas de frevo"
 },
 {
  "images": [
   {
    "src": "assets/history/frevo.jpg",
    "alt": "Passistas de frevo, um exemplo da diversidade musical de Pernambuco"
   }
  ],
  "caption": "O frevo de Pernambuco"
 },
 {
  "images": [
   {
    "src": "assets/facts/diversidade.svg",
    "alt": "Ilustração abstrata com linhas musicais diferentes, representando a diversidade de tradições"
   }
  ],
  "caption": "Diversidade musical · ilustração"
 },
 {
  "images": [
   {
    "src": "assets/history/phonograph.jpg",
    "alt": "Fonógrafo Edison Standard, aparelho antigo de gravação e reprodução de sons"
   }
  ],
  "caption": "Um fonógrafo antigo"
 }
];
const prefetchedHomeFactImages=new Set();
function renderHomeCuriosityMedia(index){
 const item=homeCuriosityMedia[index];
 if(!item)return '';
 const images=item.images.map(image=>'<button type="button" class="fact-image-button" data-enlarge="'+esc(image.src)+'" data-image-title="'+esc(item.caption)+'" aria-label="Ampliar imagem: '+esc(image.alt)+'"><img src="'+esc(image.src)+'" alt="'+esc(image.alt)+'" width="320" height="180" decoding="async" draggable="false"></button>').join('');
 const ownIllustration=item.images.every(image=>image.src.startsWith('assets/facts/'));
 return '<div class="fact-images '+(item.images.length>1?'fact-images-group':'')+'" style="--fact-image-columns:'+item.images.length+'">'+images+'</div><figcaption>'+esc(item.caption)+'<span class="fact-media-help">Toque para ampliar'+(ownIllustration?'':' · <a href="creditos.html">Créditos</a>')+'</span></figcaption>';
}
function prefetchHomeCuriosityMedia(){
 if(typeof Image!=='function')return;
 for(const offset of [-1,1]){
  const index=(homeCuriosityIndex+offset+homeCuriosities.length)%homeCuriosities.length;
  for(const picture of homeCuriosityMedia[index].images){
   if(prefetchedHomeFactImages.has(picture.src))continue;
   prefetchedHomeFactImages.add(picture.src);
   const image=new Image();image.src=picture.src;
  }
 }
}
const HOME_CURIOSITY_INTERVAL=5*60*1000;
let homeCuriosityIndex=-1,homeCuriosityChangedAt=0,homeCuriosityTimer=null,homeCuriosityPaused=false;
let homeCuriosityAnimation=null,homeCuriosityTransition=0;
function homeCuriosityCategory(index){
 if(index<8)return ['🎻','Instrumentos'];
 if(index<13)return ['🎼','Pauta e claves'];
 if(index<17)return ['♩','Sons e silêncios'];
 if(index<27)return ['🏰','História da música'];
 if(index<31)return ['🎹','Compositores'];
 if(index<35)return ['🪘','Música do Brasil'];
 return ['🎧','Música e tecnologia'];
}
function chooseHomeCuriosity(force=false,direction=1){
 const now=Date.now();
 if(homeCuriosityIndex<0){homeCuriosityIndex=Math.floor(Math.random()*homeCuriosities.length);homeCuriosityChangedAt=now}
 else if(force||(!homeCuriosityPaused&&now-homeCuriosityChangedAt>=HOME_CURIOSITY_INTERVAL)){
  homeCuriosityIndex=(homeCuriosityIndex+(direction<0?-1:1)+homeCuriosities.length)%homeCuriosities.length;
  homeCuriosityChangedAt=now;
 }
 return homeCuriosities[homeCuriosityIndex];
}
function stopHomeCuriosityAnimation(){
 homeCuriosityTransition++;
 homeCuriosityAnimation?.cancel();
 homeCuriosityAnimation=null;
 $('#homeFactViewport')?.setAttribute('aria-busy','false');
}
function updateHomeCuriosityControls(){
 const category=homeCuriosityCategory(homeCuriosityIndex);
 const text=$('#homeFactText');
 if(text){text.dataset.factIndex=String(homeCuriosityIndex);text.setAttribute('aria-label','Curiosidade '+(homeCuriosityIndex+1)+' de '+homeCuriosities.length)}
 const media=$('#homeFactMedia');
 if(media&&media.dataset.factIndex!==String(homeCuriosityIndex)){media.innerHTML=renderHomeCuriosityMedia(homeCuriosityIndex);media.dataset.factIndex=String(homeCuriosityIndex);prefetchHomeCuriosityMedia()}
 const icon=$('#homeFactIcon'),topic=$('#homeFactTopic'),position=$('#homeFactPosition'),progress=$('#homeFactProgress'),pause=$('#pauseHomeFacts');
 if(icon)icon.textContent=category[0];
 if(topic)topic.textContent=category[1];
 if(position)position.textContent=(homeCuriosityIndex+1)+' / '+homeCuriosities.length;
 if(progress)progress.style.width=((homeCuriosityIndex+1)/homeCuriosities.length*100)+'%';
 if(pause){pause.textContent=homeCuriosityPaused?'▶ Retomar':'Ⅱ Pausar';pause.setAttribute('aria-label',homeCuriosityPaused?'Retomar troca automática':'Pausar troca automática');pause.setAttribute('aria-pressed',String(homeCuriosityPaused))}
}
function scheduleHomeCuriosity(){
 clearTimeout(homeCuriosityTimer);
 if(page!=='home'||document.hidden||homeCuriosityPaused||!$('#homeFactText'))return;
 const remaining=HOME_CURIOSITY_INTERVAL-(Date.now()-homeCuriosityChangedAt);
 homeCuriosityTimer=setTimeout(()=>refreshHomeCuriosity(),Math.max(1,remaining));
}
async function refreshHomeCuriosity(force=false,direction=1){
 const text=$('#homeFactText');
 if(page!=='home'||!text)return;
 stopHomeCuriosityAnimation();
 const transition=homeCuriosityTransition,nextText=chooseHomeCuriosity(force,direction);
 const changed=text.textContent!==nextText;
 const slide=$('#homeFactSlide')||text;
 const animate=changed&&!document.hidden&&!state.reduced&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&typeof slide.animate==='function';
 const valid=()=>transition===homeCuriosityTransition&&page==='home'&&text.isConnected;
 const apply=()=>{text.textContent=nextText;updateHomeCuriosityControls()};
 try{
  if(animate){
   $('#homeFactViewport')?.setAttribute('aria-busy','true');
   homeCuriosityAnimation=slide.animate([{opacity:1,transform:'translateX(0)'},{opacity:0,transform:'translateX('+(-direction*18)+'px)'}],{duration:180,easing:'ease-in',fill:'forwards'});
   await homeCuriosityAnimation.finished;
   if(!valid())return;
   homeCuriosityAnimation.cancel();apply();
   homeCuriosityAnimation=slide.animate([{opacity:0,transform:'translateX('+(direction*24)+'px)'},{opacity:1,transform:'translateX(0)'}],{duration:420,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'});
   await homeCuriosityAnimation.finished;
   if(!valid())return;
   homeCuriosityAnimation.cancel();homeCuriosityAnimation=null;
  }else apply();
 }catch{/* Navigation or a newer gesture can cancel the previous transition. */}
 finally{if(valid()){$('#homeFactViewport')?.setAttribute('aria-busy','false');scheduleHomeCuriosity()}}
}
function setupHomeCuriosityCarousel(){
 updateHomeCuriosityControls();
 $('#nextHomeFact').onclick=()=>refreshHomeCuriosity(true,1);
 $('#previousHomeFact').onclick=()=>refreshHomeCuriosity(true,-1);
 $('#pauseHomeFacts').onclick=()=>{homeCuriosityPaused=!homeCuriosityPaused;homeCuriosityChangedAt=Date.now();updateHomeCuriosityControls();scheduleHomeCuriosity()};
 const carousel=$('#homeFactCarousel'),viewport=$('#homeFactViewport');
 carousel.onkeydown=e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();refreshHomeCuriosity(true,e.key==='ArrowLeft'?-1:1)}};
 let touch=null,suppressClickUntil=0;
 viewport.addEventListener('click',e=>{if(Date.now()<suppressClickUntil){e.preventDefault();e.stopPropagation()}},true);
 viewport.addEventListener('touchstart',e=>{const t=e.touches[0];touch=e.touches.length===1&&t.clientX>24&&t.clientX<innerWidth-24?{x:t.clientX,y:t.clientY}:null},{passive:true});
 viewport.addEventListener('touchend',e=>{if(!touch)return;const t=e.changedTouches[0],dx=t.clientX-touch.x,dy=t.clientY-touch.y;touch=null;if(Math.abs(dx)>=45&&Math.abs(dx)>Math.abs(dy)*1.4){suppressClickUntil=Date.now()+500;refreshHomeCuriosity(true,dx<0?1:-1)}},{passive:true});
 viewport.addEventListener('touchcancel',()=>{touch=null},{passive:true});
 scheduleHomeCuriosity();
}
document.addEventListener('visibilitychange',()=>{
 if(document.hidden){clearTimeout(homeCuriosityTimer);stopHomeCuriosityAnimation()}
 else refreshHomeCuriosity();
});
const homeExploreCards=[
 {
  "page": "games",
  "title": "Jogos musicais",
  "description": "Brinque e descubra novos sons.",
  "action": "Vamos jogar",
  "image": "assets/explore/games.svg",
  "alt": "",
  "theme": "games"
 },
 {
  "page": "instruments",
  "title": "Instrumentos",
  "description": "Conheça cada família e seu som.",
  "action": "Descobrir sons",
  "image": "assets/instruments/guitar.png",
  "alt": "Violão",
  "theme": "instruments"
 },
 {
  "page": "composers",
  "title": "Compositores",
  "description": "Descubra quem criou grandes músicas.",
  "action": "Conhecer artistas",
  "image": "assets/people/mozart.jpg",
  "alt": "Retrato de Mozart",
  "theme": "composers"
 },
 {
  "page": "medals",
  "title": "Minhas medalhas",
  "description": "Celebre cada nova conquista.",
  "action": "Ver meu álbum",
  "image": "assets/explore/medals.svg",
  "alt": "",
  "theme": "medals"
 },
 {
  "page": "piano",
  "title": "Piano das cores",
  "description": "Toque, escute e crie melodias.",
  "action": "Quero tocar",
  "image": "assets/explore/piano.svg",
  "alt": "",
  "theme": "piano"
 },
 {
  "page": "journey",
  "title": "História da música",
  "description": "Viaje por épocas e descobertas.",
  "action": "Começar viagem",
  "image": "assets/explore/journey.svg",
  "alt": "",
  "theme": "journey"
 }
];
const HOME_EXPLORE_INTERVAL=15000,HOME_EXPLORE_SIZE=6;
let homeExploreCatalogCache=null,homeExploreGroup=0,homeExploreTimer=null,homeExploreNextAt=0;
let homeExplorePaused=false,homeExploreHovered=false,homeExploreFocused=false,homeExploreVisible=false;
let homeExploreObserver=null,homeExploreAnimation=null,homeExploreTransition=0,homeExploreAnimating=false;
function homeExploreSummary(text,max=120){const value=String(text).replace(/\s+/g,' ').trim();if(value.length<=max)return value;const short=value.slice(0,max);return short.slice(0,short.lastIndexOf(' '))+'…'}
function getHomeExploreCatalog(){
 if(homeExploreCatalogCache)return homeExploreCatalogCache;
 const main=homeExploreCards.map(card=>({...card,key:'page:'+card.page,category:'Seu universo musical'}));
 const gameImages={sound:'assets/instruments/drum.jpg',memory:'assets/explore/games.svg',echo:'assets/history/clapping.jpg',composer:'assets/people/beethoven.jpg',rhythm:'assets/instruments/drum.jpg',maestro:'assets/history/orchestra.jpg',figures:'assets/facts/figuras.svg',families:'assets/instruments/violin.jpg',staff:'assets/facts/pauta.svg'};
 const gameCards=games.map(([id,icon,title,description])=>({key:'game:'+id,game:id,title,description,action:'Vamos jogar',image:gameImages[id]||'assets/explore/games.svg',alt:'',theme:id==='composer'?'composers':'games',category:'Jogos e atividades'}));
 const instrumentCards=instruments.map((instrument,index)=>({key:'instrument:'+instrument.type,instrument:index,title:instrument.name,description:instrument.desc||'Conheça a história e ouça o som deste instrumento.',action:'História e som',image:'assets/instruments/'+instrument.type+(instrument.type==='guitar'?'.png':'.jpg'),alt:instrument.name,theme:'instruments',category:'Conheça os instrumentos'}));
 const personCards=people.map(person=>({key:'person:'+person.id,person:person.id,title:person.short||person.name,description:homeExploreSummary(person.era+' · '+person.desc),action:'História e obras',image:'assets/people/'+person.id+'.jpg',alt:person.name,theme:'composers',category:'Compositores e suas histórias'}));
 const worldImages=['clapping.jpg','lyre.jpg','notre-dame.jpg','manuscript.gif','violin.png','magic-flute.jpg','orchestra.jpg','studio.jpg','frevo.jpg'];
 const worldCards=worlds.map((world,index)=>({key:'world:'+index,lesson:index,title:world.title,description:homeExploreSummary(world.subtitle+'. '+world.text),action:'Explorar esta época',image:'assets/history/'+worldImages[index],alt:'',theme:'journey',category:'Sua viagem no tempo'}));
 const pools=[gameCards,instrumentCards,personCards,worldCards],all=[...main];
 for(let i=0;i<Math.max(...pools.map(pool=>pool.length));i++)for(const pool of pools)if(pool[i])all.push(pool[i]);
 homeExploreCatalogCache=all;return all;
}
function homeExploreAction(card){
 if(card.game)return 'data-game="'+esc(card.game)+'"';
 if(Number.isInteger(card.instrument))return 'data-instrument-info="'+card.instrument+'"';
 if(card.person)return 'data-person="'+esc(card.person)+'"';
 if(Number.isInteger(card.lesson))return 'data-lesson="'+card.lesson+'" data-story-part="'+journeyNextPart(card.lesson)+'"';
 return 'data-nav="'+esc(card.page)+'"';
}
function renderHomeExploreCards(){
 const all=getHomeExploreCatalog(),groups=Math.ceil(all.length/HOME_EXPLORE_SIZE);
 homeExploreGroup=(homeExploreGroup+groups)%groups;
 const visible=Array.from({length:Math.min(HOME_EXPLORE_SIZE,all.length)},(_,i)=>all[(homeExploreGroup*HOME_EXPLORE_SIZE+i)%all.length]);
 return visible.map(card=>'<button type="button" class="explore-card explore-card-'+card.theme+'" '+homeExploreAction(card)+' data-explore-key="'+esc(card.key)+'" aria-label="'+esc('Abrir '+card.title+' — '+card.category)+'"><span class="explore-art" aria-hidden="true"><span class="explore-orbit"></span><img src="'+esc(card.image)+'" alt="'+esc(card.alt)+'" width="320" height="180" decoding="async"><span class="explore-spark explore-spark-one">✦</span><span class="explore-spark explore-spark-two">♪</span></span><span class="explore-copy"><span class="explore-category">'+esc(card.category)+'</span><strong class="explore-title">'+esc(card.title)+'</strong><span class="explore-description">'+esc(card.description)+'</span><span class="explore-footer"><span>'+esc(card.action)+'</span><span class="explore-arrow" aria-hidden="true">↗</span></span></span></button>').join('');
}
function homeExploreBlocked(){
 return page!=='home'||document.hidden||!homeExploreVisible||homeExplorePaused||homeExploreHovered||homeExploreFocused||document.body.classList.contains('modal-open')||($('#imageViewer')&&!$('#imageViewer').hidden);
}
function cancelHomeExploreAnimation(){
 homeExploreTransition++;homeExploreAnimation?.cancel();homeExploreAnimation=null;homeExploreAnimating=false;
 $('#homeExploreGrid')?.setAttribute('aria-busy','false');
}
function stopHomeExplore(){
 clearTimeout(homeExploreTimer);homeExploreObserver?.disconnect();homeExploreObserver=null;
 cancelHomeExploreAnimation();homeExploreVisible=false;homeExploreHovered=false;homeExploreFocused=false;
}
function scheduleHomeExplore(){
 clearTimeout(homeExploreTimer);
 if(homeExploreBlocked()||homeExploreAnimating||!$('#homeExploreGrid'))return;
 homeExploreTimer=setTimeout(()=>changeHomeExplore(1,false),Math.max(1,homeExploreNextAt-Date.now()));
}
function resumeHomeExplore(){homeExploreNextAt=Date.now()+HOME_EXPLORE_INTERVAL;scheduleHomeExplore()}
function suspendHomeExplore(){clearTimeout(homeExploreTimer);cancelHomeExploreAnimation()}
function updateHomeExploreControls(manual=false){
 const all=getHomeExploreCatalog(),groups=Math.ceil(all.length/HOME_EXPLORE_SIZE);
 const count=$('#homeExploreCount'),dots=$('#homeExploreDots'),pause=$('#pauseHomeExplore'),announce=$('#homeExploreAnnouncement');
 if(count)count.textContent=all.length+' descobertas · '+(homeExploreGroup+1)+' de '+groups;
 if(dots)dots.innerHTML=Array.from({length:groups},(_,i)=>'<span class="'+(i===homeExploreGroup?'active':'')+'"></span>').join('');
 if(pause){pause.textContent=homeExplorePaused?'▶ Retomar':'Ⅱ Pausar';pause.setAttribute('aria-pressed',String(homeExplorePaused));pause.setAttribute('aria-label',homeExplorePaused?'Retomar troca automática dos cards':'Pausar troca automática dos cards')}
 if(manual&&announce)announce.textContent='Grupo '+(homeExploreGroup+1)+' de '+groups+'. Novas descobertas para explorar.';
}
async function changeHomeExplore(direction=1,manual=true){
 const grid=$('#homeExploreGrid');if(page!=='home'||!grid||(!manual&&homeExploreBlocked()))return;
 suspendHomeExplore();const transition=homeExploreTransition,groups=Math.ceil(getHomeExploreCatalog().length/HOME_EXPLORE_SIZE),next=(homeExploreGroup+direction+groups)%groups;
 homeExploreAnimating=true;
 const valid=()=>transition===homeExploreTransition&&page==='home'&&grid.isConnected;
 const apply=()=>{homeExploreGroup=next;grid.innerHTML=renderHomeExploreCards();updateHomeExploreControls(manual)};
 const animate=!state.reduced&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&typeof grid.animate==='function';
 try{
  if(animate){
   grid.setAttribute('aria-busy','true');
   homeExploreAnimation=grid.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(7px)'}],{duration:160,easing:'ease-in',fill:'forwards'});
   await homeExploreAnimation.finished;if(!valid())return;
   homeExploreAnimation.cancel();apply();
   homeExploreAnimation=grid.animate([{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:420,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'});
   await homeExploreAnimation.finished;if(!valid())return;
   homeExploreAnimation.cancel();homeExploreAnimation=null;
  }else apply();
 }catch{/* A new action or navigation can cancel the previous transition. */}
 finally{if(valid()){homeExploreAnimating=false;grid.setAttribute('aria-busy','false');resumeHomeExplore()}}
}
function setupHomeExplore(){
 stopHomeExplore();const section=$('#homeExploreCarousel'),grid=$('#homeExploreGrid');if(!section||!grid)return;
 updateHomeExploreControls();homeExploreNextAt=Date.now()+HOME_EXPLORE_INTERVAL;
 $('#previousHomeExplore').onclick=()=>changeHomeExplore(-1,true);
 $('#nextHomeExplore').onclick=()=>changeHomeExplore(1,true);
 $('#pauseHomeExplore').onclick=()=>{homeExplorePaused=!homeExplorePaused;updateHomeExploreControls();resumeHomeExplore()};
 section.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){homeExploreHovered=true;suspendHomeExplore()}});
 section.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse'){homeExploreHovered=false;resumeHomeExplore()}});
 grid.addEventListener('focusin',()=>{homeExploreFocused=true;suspendHomeExplore()});
 grid.addEventListener('focusout',e=>{if(!grid.contains(e.relatedTarget)){homeExploreFocused=false;resumeHomeExplore()}});
 grid.addEventListener('pointerdown',()=>{suspendHomeExplore();resumeHomeExplore()});
 if(typeof IntersectionObserver==='function'){
  homeExploreObserver=new IntersectionObserver(entries=>{for(const entry of entries){homeExploreVisible=entry.isIntersecting;if(homeExploreVisible)resumeHomeExplore();else suspendHomeExplore()}},{threshold:.1});
  homeExploreObserver.observe(section);
 }else{homeExploreVisible=true;resumeHomeExplore()}
}
document.addEventListener('visibilitychange',()=>{if(document.hidden)suspendHomeExplore();else resumeHomeExplore()});
window.addEventListener('pagehide',stopHomeExplore);
const instrumentFamilies={piano:'strings',flute:'wind',guitar:'strings',drum:'percussion',violin:'strings',cello:'strings',clarinet:'wind',oboe:'wind',bassoon:'wind',timpani:'percussion',contrabass:'strings'};
const instruments=[{name:'Piano',icon:'🎹',type:'piano',desc:'As teclas acionam martelos que fazem as cordas vibrarem.'},{name:'Flauta doce',icon:'🪈',type:'flute',desc:'O ar em vibração produz seu som.'},{name:'Violão',icon:'🎸',type:'guitar',desc:'As cordas vibram quando são dedilhadas ou tocadas.'},{name:'Tambor',icon:'🥁',type:'drum',desc:'A membrana vibra quando recebe uma batida.'}];instruments.push(...(window.MUSIVERSO_EXTRA_INSTRUMENTS||[]));for(const item of window.MUSIVERSO_EXTRA_INSTRUMENTS||[])window.MUSIVERSO_LIBRARY.instruments[item.type]=item;
const composers=[{name:'Bach',full:'Johann Sebastian Bach',era:'Barroco',icon:'🎼',dates:'1685–1750',desc:'Bach compôs para vozes, órgão, cravo e muitos outros instrumentos. Aqui ouvimos seu Prelúdio em dó maior.',melody:[[60,.22],[64,.22],[67,.22],[72,.22],[76,.22],[67,.22],[72,.22],[76,.22],[60,.22],[64,.22],[67,.22],[72,.22],[76,.22]],title:'Prelúdio em dó maior, BWV 846'}, {name:'Mozart',full:'Wolfgang Amadeus Mozart',era:'Classicismo',icon:'🎹',dates:'1756–1791',desc:'Mozart criou óperas, concertos e sinfonias. Esta melodia abre Uma pequena serenata noturna.',melody:[[67,.35],[0,.12],[62,.25],[67,.35],[0,.12],[62,.25],[67,.22],[62,.22],[67,.22],[71,.22],[74,.55]],title:'Uma pequena serenata noturna, K. 525'}, {name:'Beethoven',full:'Ludwig van Beethoven',era:'Entre Classicismo e Romantismo',icon:'🎻',dates:'1770–1827',desc:'Beethoven ampliou as possibilidades da orquestra. Ouça o tema conhecido como Ode à alegria.',melody:[[64,.35],[64,.35],[65,.35],[67,.35],[67,.35],[65,.35],[64,.35],[62,.35],[60,.35],[60,.35],[62,.35],[64,.35],[64,.5],[62,.18],[62,.7]],title:'Ode à alegria — Sinfonia nº 9'}];

const people=[
{id:'hildegard',name:'Hildegard von Bingen',era:'Idade Média',lesson:2,desc:'Esta é uma representação histórica de Hildegard. Ela foi uma compositora da Idade Média e criou músicas para vozes.'},
{id:'josquin',name:'Josquin des Prez',era:'Renascimento',lesson:3,desc:'Este retrato representa Josquin des Prez. Ele criou músicas em que diferentes vozes cantam melodias ao mesmo tempo.'},
{id:'bach',name:'Johann Sebastian Bach',short:'Bach',era:'Barroco',lesson:4,desc:composers[0].desc,music:0},
{id:'vivaldi',name:'Antonio Vivaldi',era:'Barroco',lesson:4,desc:'Este é Antonio Vivaldi. Ele tocava violino e compôs As Quatro Estações. Suas músicas podem nos fazer imaginar cenas da natureza.'},
{id:'mozart',name:'Wolfgang Amadeus Mozart',short:'Mozart',era:'Classicismo',lesson:5,desc:composers[1].desc,music:1},
{id:'haydn',name:'Joseph Haydn',era:'Classicismo',lesson:5,desc:'Este é Joseph Haydn. Ele criou muitas sinfonias e músicas para grupos de instrumentos.'},
{id:'beethoven',name:'Ludwig van Beethoven',short:'Beethoven',era:'Classicismo e Romantismo',lesson:6,desc:composers[2].desc,music:2},
{id:'schubert',name:'Franz Schubert',era:'Romantismo',lesson:6,desc:'Este é Franz Schubert. Ele criou muitas canções, combinando poesia, voz e piano.'},
{id:'chopin',name:'Frédéric Chopin',era:'Romantismo',lesson:6,desc:'Este é Frédéric Chopin. Ele era pianista e criou muitas músicas para piano.'},
{id:'clara',name:'Clara Schumann',era:'Romantismo',lesson:6,desc:'Esta é Clara Schumann. Ela foi pianista e compositora. Apresentou concertos e criou suas próprias músicas.'},
{id:'chiquinha',name:'Chiquinha Gonzaga',era:'Brasil',lesson:8,desc:'Esta é Chiquinha Gonzaga. Ela foi pianista, compositora e regente brasileira. Criou músicas para o teatro e o carnaval.'},
{id:'pixinguinha',name:'Pixinguinha',era:'Brasil',lesson:8,desc:'Este é Pixinguinha, músico e compositor brasileiro. Ele tocava flauta e saxofone e é um grande nome do choro.'},
{id:'villa-lobos',name:'Heitor Villa-Lobos',era:'Brasil',lesson:8,desc:'Este é Heitor Villa-Lobos. Ele foi um compositor brasileiro e explorou muitas sonoridades em suas obras.'}
];
const personImage=p=>`<img class="person-photo" src="assets/people/${p.id}.jpg" alt="Retrato de ${esc(p.name)}" loading="lazy" width="320" height="360">`;
const instrumentImage=x=>`<img class="instrument-photo" src="assets/instruments/${x.type==='guitar'?'guitar.png':x.type==='flute'?'flute.jpg':x.type+'.jpg'}" alt="Fotografia de ${esc(x.name)}" loading="lazy" width="320" height="260">`;
function personCard(p,compact=false){return `<article class="collect-card person-card ${compact?'compact':''}"><button class="portrait-button" data-person="${p.id}" aria-label="Conhecer a história de ${esc(p.name)}">${personImage(p)}<span class="photo-play" aria-hidden="true">⌕</span></button><div class="person-info"><small class="era-label">${p.era}</small><h3>${p.short||p.name}</h3>${pianoPieces().some(x=>x.composerId===p.id)?`<button class="voice-button" data-piano-composer="${p.id}">🎹 Tocar no piano</button>`:''}<button class="voice-button" data-person="${p.id}" aria-label="Ler história e ouvir obras de ${esc(p.name)}">📖 História e obras</button><button class="voice-button music-button" data-say="${esc(p.name+'. '+p.desc)}" aria-label="Ouvir apresentação de ${esc(p.name)}">🔊 Ouvir resumo</button></div></article>`}
let narratorAudio=null;let voiceReady=false;document.addEventListener('pointerdown',()=>voiceReady=true,{once:true});document.addEventListener('keydown',()=>voiceReady=true,{once:true});
function screenText(){const m=$('#main'),title=m.querySelector('h1')?.innerText||'',lead=m.querySelector('.lead')?.innerText||'';const question=worlds.flatMap(w=>w.questions).find(q=>q[0]===title);if(question)return question[0]+' Você pode escolher: '+question[1].join(', ')+'.';if(page==='lesson'&&m.querySelector('.lesson-copy'))return title+'. '+m.querySelector('.lesson-copy').innerText;if(window.MUSIVERSO_SCREEN_VOICE?.[page])return window.MUSIVERSO_SCREEN_VOICE[page];if(page==='lesson'&&m.querySelector('.lesson-copy'))return title+'. '+m.querySelector('.lesson-copy').innerText+' Vamos experimentar? '+[...m.querySelectorAll('.panel p')].map(x=>x.innerText).join(' ');const answers=[...m.querySelectorAll('[data-answer]')].map((b,i)=>`Opção ${i+1}: ${b.innerText}.`).join(' ');return title+'. '+lead+' '+answers}
function readScreen(){speak(screenText())}
function autoRead(){if(state.narration&&voiceReady)readScreen()}
function narratorWelcome(){return `<div class="narrator-welcome"><span class="narrator-face" aria-hidden="true">♫</span><div><strong>Eu leio para você!</strong><p>Toque no alto-falante para ouvir. Vamos descobrir juntos?</p></div><button class="voice-button" data-read-screen aria-label="Ouvir esta tela">🔊 Ouvir</button><button class="voice-button auto-voice ${state.narration?'enabled':''}" data-auto-voice aria-pressed="${state.narration}">${state.narration?'✓ Voz automática':'Ativar voz automática'}</button></div>`}

function toast(t){$('#toast').textContent=t;$('#toast').style.display='block';setTimeout(()=>$('#toast').style.display='none',3000)}
function gainXP(n,key){if(key&&state.wins.includes(key))return;if(key)state.wins.push(key);state.xp+=n;save();chrome();toast(`⭐ +${n} estrelas! Muito bem!`)}
function chrome(){document.body.classList.toggle('large-text',state.large);document.body.classList.toggle('reduced',state.reduced);const nav=[['home','🏠','Início'],['journey','🗺️','Jornada'],['piano','🎹','Piano'],['medals','🏅','Medalhas'],['games','🎮','Jogos'],['profile','☺','Perfil']];let active=page==='collection'?'medals':['lesson'].includes(page)?'journey':['sound','memory','echo','composer','rhythm','maestro','families'].includes(page)?'games':page;const links=nav.map(([id,ic,n])=>`<button data-nav="${id}" class="${active===id?'active':''}" ${active===id?'aria-current="page"':''}><span class="ico">${ic}</span>${n}</button>`).join('');$('#sidebar').innerHTML=`<div class="brand">Musiverso<span><b>K</b><b>i</b><b>ds</b> ♪</span></div><div class="side-links">${links}<a href="professor/" style="display:block;padding:14px;color:inherit;text-decoration:none;font-weight:800">📚 Espaço do Professor</a></div><div class="side-note"><div class="note">♫</div><strong>Uma descoberta por dia!</strong><p>Seu universo fica maior a cada novo som.</p></div>`;$('#bottom').innerHTML=links;$('#header').innerHTML=`<span class="crumb">${innerWidth<701?'Musiverso Kids':'SEU UNIVERSO DE DESCOBERTAS'}</span><div class="stats"><button class="header-voice" data-read-screen aria-label="Ouvir esta tela" title="Ouvir esta tela">🔊<span>Ouvir</span></button><button class="header-voice stop-voice" data-stop-voice aria-label="Parar narração" title="Parar narração" hidden>■</button><button class="header-voice stop-instrument" data-stop-instrument aria-label="Parar som do instrumento" title="Parar som do instrumento" hidden>■</button><span class="pill" title="Estrelas conquistadas">⭐ ${state.xp}</span><span class="pill" title="Medalhas conquistadas">🏅 ${medalDefinitions().filter(m=>m.earned).length}</span><button class="avatar" data-nav="profile" aria-label="Abrir meu perfil">${state.avatar}</button></div>`}
function go(p,quiet=false){window.MusiversoPolyphony?.dispose();stopHomeExplore();clearTimeout(homeCuriosityTimer);stopHomeCuriosityAnimation();stopConcert();stopInstrumentAudio();stopNarration();session++;clearTimeout(stopTimer);if(audioCtx&&audioCtx.state!=='closed'){audioCtx.close().catch(()=>{});audioCtx=null}activeGame=null;activeGameLevel=null;page=p;chrome();const render={home,journey,games:gameMenu,profile,instruments:instrumentPage,composers:composerPage,figures:figuresPage,collection:medalsPage,piano:pianoPage,medals:medalsPage};(render[p]||home)();window.scrollTo(0,0);if(!quiet)autoRead()}
function home(){let next=worlds.findIndex((_,i)=>!state.done.includes(i));if(next<0)next=0;const curiosity=chooseHomeCuriosity();$('#main').innerHTML=`<div class="eyebrow">APRENDER É UMA AVENTURA</div><h1>Olá, ${esc(state.name)}! <span style="font-size:25px">👋</span></h1><p class="lead">Um mundo de sons está esperando por você.</p>${narratorWelcome()}<div class="home-layout"><div><section class="hero"><div class="hero-content"><span class="badge">CAPÍTULO ${next+1} · SUA PRÓXIMA DESCOBERTA</span><h2>Vamos viajar<br>pela música?</h2><p>Explore épocas, descubra sons e solte a imaginação.</p><button class="btn continue-journey-btn" data-lesson="${next}" data-story-part="${journeyNextPart(next)}">▶ Continuar jornada</button></div></section><section class="home-explore" id="homeExploreCarousel" role="region" aria-roledescription="carrossel" aria-labelledby="explore-title"><div class="section-head explore-heading"><div><span class="explore-eyebrow">UM UNIVERSO DE POSSIBILIDADES</span><h2 id="explore-title">O que vamos explorar?</h2><p>Escolha seu próximo caminho musical.</p></div><span class="explore-heading-star" aria-hidden="true">✦</span></div><div class="explore-grid" id="homeExploreGrid">${renderHomeExploreCards()}</div><div class="explore-carousel-controls"><div class="explore-pagination"><span id="homeExploreCount"></span><span class="explore-dots" id="homeExploreDots" aria-hidden="true"></span></div><div class="explore-carousel-buttons"><button type="button" class="fact-arrow" id="previousHomeExplore" aria-label="Grupo anterior de descobertas">‹</button><button type="button" class="fact-pause" id="pauseHomeExplore" aria-pressed="false">Ⅱ Pausar</button><button type="button" class="fact-arrow" id="nextHomeExplore" aria-label="Próximo grupo de descobertas">›</button></div></div><p class="explore-auto-hint">Novos cards a cada 15 segundos. A troca pausa enquanto você escolhe.</p><span id="homeExploreAnnouncement" class="sr-only" role="status" aria-live="polite"></span></section><div class="mini-banner"><span class="ico">♩</span><div><strong>Sons, silêncios e figuras musicais</strong><p>Descubra como escrever a duração dos sons.</p></div><button class="text-button" data-nav="figures">DESCOBRIR →</button></div><div class="mini-banner"><span class="ico">🧭</span><div><strong>Cada época, uma nova descoberta</strong><p>Dos primeiros sons às músicas que ouvimos hoje.</p></div><button class="text-button" data-nav="journey">EXPLORAR →</button></div></div><aside class="home-aside"><div class="panel"><div class="eyebrow">PEQUENAS GRANDES CONQUISTAS</div><h3>Seu passaporte musical 🗺️</h3><div class="quest"><span class="quest-icon">🌍</span><div><strong>Explore a história</strong><small>${state.done.length} de 9 aventuras concluídas</small></div></div><div class="progress"><i style="width:${state.done.length/9*100}%"></i></div><div class="quest"><span class="quest-icon" style="background:#e7ddfc">🎧</span><div><strong>Brinque com os sons</strong><small>${state.wins.filter(x=>x.startsWith('game')).length} jogos descobertos</small></div></div><div class="quest"><span class="quest-icon" style="background:#e0f5e9">⭐</span><div><strong>Colecione descobertas</strong><small>${state.xp} estrelas para celebrar</small></div></div></div><section class="panel tip fact-carousel" id="homeFactCarousel" role="region" aria-roledescription="carrossel" aria-label="Você sabia? Curiosidades musicais"><h3>Você sabia? 💡</h3><div class="fact-meta"><span class="fact-icon" id="homeFactIcon" aria-hidden="true"></span><span id="homeFactTopic"></span><span class="fact-position" id="homeFactPosition"></span></div><div class="fact-viewport" id="homeFactViewport" tabindex="0" aria-label="Use as setas para explorar as curiosidades"><div class="fact-slide" id="homeFactSlide"><figure class="fact-media" id="homeFactMedia"></figure><p id="homeFactText" role="group" aria-roledescription="slide" aria-live="polite" aria-atomic="true">${esc(curiosity)}</p></div></div><div class="fact-progress" aria-hidden="true"><span id="homeFactProgress"></span></div><div class="fact-controls"><button type="button" class="fact-arrow" id="previousHomeFact" aria-label="Curiosidade anterior">‹</button><button type="button" class="fact-pause" id="pauseHomeFacts" aria-label="Pausar troca automática" aria-pressed="false">Ⅱ Pausar</button><button type="button" class="fact-arrow" id="nextHomeFact" aria-label="Próxima curiosidade">›</button></div><small class="fact-timing">Uma nova descoberta a cada 5 minutos</small></section></aside></div>`;setupHomeCuriosityCarousel();setupHomeExplore()}
function gameMenu(){$('#main').innerHTML=`<div class="eyebrow">OUVIR · BRINCAR · CRIAR</div><h1>Jogos musicais</h1><p class="lead">Escolha sua brincadeira. Aqui, cada tentativa é uma descoberta!</p>${gameLevelSettings()}<div class="game-grid">${games.map(([id,i,n,d,c])=>`<button class="game-card" style="background:${c}" data-game="${id}"><span class="game-tag">${state.wins.includes('game-'+id)?'⭐ DESCOBERTO':'VAMOS BRINCAR'}</span><span class="art">${id==='composer'?'<img class="game-photo" src="assets/people/beethoven.jpg" alt="Retrato de Beethoven">':id==='sound'?'<img class="game-photo instrument" src="assets/instruments/drum.jpg" alt="Fotografia de tambor">':i}</span><h3>${n}</h3><p>${d}</p></button>`).join('')}</div>`}
const journeyStepTitles=[["O corpo também faz música", "Sons da natureza e primeiros instrumentos", "O mistério dos primeiros sons"], ["Flautas e instrumentos de sopro", "As cordas da lira", "Muitos povos, muitos sons"], ["Canto medieval e coro", "Hildegard von Bingen", "Trovadores e suas canções", "Notre-Dame e Léonin", "Pérotin e as várias vozes", "Machaut e a Ars Nova"], ["Melodias que se encontram", "A música registrada no papel", "Josquin des Prez"], ["Vivaldi e As Quatro Estações", "Conhecendo o violino", "Bach e os instrumentos de teclado"], ["A ópera: música e teatro", "Mozart e A Flauta Mágica", "Haydn e a orquestra"], ["Beethoven e Clara Schumann", "Chopin e o piano", "O que sentimos ao ouvir música"], ["Música para filmes e jogos", "Gravar e ouvir de novo", "Música em transformação"], ["O frevo de Pernambuco", "Chiquinha, Pixinguinha e Villa-Lobos", "A diversidade musical brasileira"]];

function journeyCompletedParts(i){if(state.done.includes(i))return worlds[i].questions.map((_,n)=>n);const parts=state.journeyAnswers?.[i];return Array.isArray(parts)?[...new Set(parts.filter(n=>Number.isInteger(n)&&n>=0&&n<worlds[i].questions.length))]:[]}
function journeyNextPart(i){const done=journeyCompletedParts(i);return worlds[i].questions.findIndex((_,n)=>!done.includes(n))<0?0:worlds[i].questions.findIndex((_,n)=>!done.includes(n))}
const journeySuggestions=[
 ['Sons com o corpo','Façam uma roda e inventem uma sequência de palmas, estalos ou batidas nas pernas.','Procurem sons pela casa ou no quintal: água, folhas, passos ou objetos. Imitem um som e deixem a criança responder.'],
 ['Instrumentos da Antiguidade','Construam uma lira de brincadeira com um pote e elásticos de diferentes espessuras. Comparem os sons sem esticar os elásticos demais.','Façam uma banda de sons antigos: uma pessoa marca o pulso batendo palmas, outra sopra como uma flauta e outra dedilha como uma lira.'],
 ['Cantos e vozes medievais','Brinquem de pergunta e resposta cantada: o adulto inventa uma frase curta e a criança responde com outra.','Cantem a mesma melodia juntos, bem devagar. Depois, uma pessoa sustenta uma nota enquanto a outra canta a melodia por cima.'],
 ['Polifonia: duas melodias juntas','Criem duas vozes diferentes e cantem com um amigo: uma pessoa canta uma nota longa ou um padrão simples; a outra inventa uma melodia curta por cima.','Façam uma brincadeira de imitação: uma voz canta “lá-lá”; depois a outra começa a mesma frase um pouco mais tarde. Escutem como as melodias se encontram.'],
 ['Sons do Barroco','Escolham uma estação do ano e criem uma paisagem sonora: gotas com os dedos, vento soprando e passos regulares.','Uma pessoa inventa uma frase musical curta; a outra repete e acrescenta um som. Continuem alternando como um pequeno concerto.'],
 ['Música em forma de conversa','Inventem uma conversa entre dois instrumentos: um faz uma frase musical como pergunta e o outro responde.','Cantem uma melodia curta primeiro forte, depois suave. Conversem sobre como a mudança de volume alterou a sensação.'],
 ['Música e sentimentos','Escolham uma música e imaginem juntos uma cena para ela. Cada pessoa pode imaginar algo diferente.','Cantem uma melodia conhecida de dois jeitos: como se fosse uma canção de ninar e como se fosse uma aventura.'],
 ['Sons de hoje','Gravem sons do cotidiano com o celular, com ajuda de um adulto, e organizem-nos para criar uma trilha de uma história.','Escolham uma cena de filme ou desenho e façam ao vivo os sons que poderiam acompanhá-la, usando a voz e objetos seguros.'],
 ['Ritmos do Brasil','Criem uma batida de frevo com palmas e passos no lugar. Alternem quem inventa o ritmo e quem responde.','Conversem sobre uma música presente na família ou na comunidade. Escutem juntos e acompanhem o pulso com palmas suaves.']
];
function journey(){
 let next=worlds.findIndex((_,i)=>!state.done.includes(i));if(next<0)next=0;
 const opened=Array.isArray(state.journeyOpen)?state.journeyOpen:[next];
 $('#main').innerHTML=`<div class="eyebrow">CADA ÉPOCA, UM CAMINHO</div><h1>Sua viagem musical</h1><p class="lead">Abra a época que quiser explorar. Escolha uma parada para ler, observar as imagens e responder. Você pode fechar e reabrir os caminhos quando quiser.</p><div class="journey-controls" aria-label="Organizar caminhos"><button class="voice-button" id="openJourneyPaths">＋ Abrir todos os caminhos</button><button class="voice-button" id="closeJourneyPaths">－ Fechar todos os caminhos</button><span>Seu progresso fica guardado.</span></div><div class="journey journey-accordion">${worlds.map((w,i)=>{const completed=journeyCompletedParts(i),total=w.questions.length,current=journeyNextPart(i);return `<details class="journey-chapter" data-chapter="${i}" ${opened.includes(i)?'open':''}><summary aria-label="Abrir ou fechar caminho: ${esc(w.title)}"><span class="chapter-symbol" aria-hidden="true">${w.icon}</span><span class="chapter-heading"><span class="chapter-index">ÉPOCA ${i+1}</span><span class="chapter-title">${esc(w.title)}</span><span class="chapter-subtitle">${esc(w.subtitle)}</span><span class="chapter-status">${completed.length} de ${total} paradas concluídas ${state.done.includes(i)?'· ✓ Capítulo concluído':''}</span></span><span class="chapter-disclosure"><span class="chapter-open-label">Abrir caminho</span><span class="chapter-close-label">Fechar caminho</span><span class="chapter-chevron" aria-hidden="true">⌄</span></span></summary><div class="chapter-content"><div class="chapter-progress"><div class="progress" role="progressbar" aria-label="Progresso em ${esc(w.title)}" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${completed.length}"><i style="width:${completed.length/total*100}%"></i></div><button class="btn continue-journey-btn" data-lesson="${i}" data-story-part="${current}">${state.done.includes(i)?'↻ Rever desde o início':'▶ Continuar meu caminho'}</button></div><ol class="journey-path" aria-label="Paradas de ${esc(w.title)}">${w.questions.map((_,part)=>{const done=completed.includes(part),active=!state.done.includes(i)&&part===current;return `<li class="journey-step ${done?'step-done':''} ${active?'step-current':''}"><button class="journey-stop" data-lesson="${i}" data-story-part="${part}" aria-label="${done?'Rever':'Abrir'} parada ${part+1}: ${esc(journeyStepTitles[i][part])}"><span class="journey-stop-number" aria-hidden="true">${done?'✓':part+1}</span><span class="journey-stop-copy"><strong>${esc(journeyStepTitles[i][part])}</strong><small>${done?'✓ Concluída · Ler e responder novamente':active?'Sua próxima descoberta · Ler e responder':'História ilustrada + pergunta'}</small></span><span class="journey-stop-arrow" aria-hidden="true">›</span></button></li>`}).join('')}</ol><details class="journey-suggestions"><summary><span>💡 Sugestões para fazer juntos</span><small>2 ideias</small></summary><p class="journey-suggestion-theme">${esc(journeySuggestions[i][0])}</p><div class="journey-suggestion-grid">${journeySuggestions[i].slice(1).map((idea,n)=>`<article class="journey-suggestion"><span class="journey-suggestion-number">${n+1}</span><div><strong>Ideia ${n+1}</strong><p>${esc(idea)}</p></div></article>`).join('')}</div></details><button class="chapter-fold text-button" data-fold-chapter="${i}">Fechar este caminho ↑</button></div></details>`}).join('')}</div>`;
 const details=[...document.querySelectorAll('.journey-chapter')],remember=()=>{if(page!=='journey')return;state.journeyOpen=details.filter(d=>d.open).map(d=>+d.dataset.chapter);save()};
 details.forEach(d=>d.addEventListener('toggle',remember));
 $('#openJourneyPaths').onclick=()=>{details.forEach(d=>d.open=true);remember()};$('#closeJourneyPaths').onclick=()=>{details.forEach(d=>d.open=false);remember()};
 document.querySelectorAll('[data-fold-chapter]').forEach(b=>b.onclick=()=>{const detail=details.find(d=>d.dataset.chapter===b.dataset.foldChapter);detail.open=false;remember();detail.querySelector('summary').focus();detail.scrollIntoView({block:'nearest',behavior:state.reduced?'auto':'smooth'})})
}
worlds[2].title="Vozes da Idade Média";worlds[2].subtitle="Do canto medieval à polifonia e à Ars Nova";worlds[2].questions=[["Um grupo de pessoas cantando forma um…", ["Coro", "Violino", "Tambor"], 0], ["Quem foi Hildegard von Bingen?", ["Uma compositora", "Um instrumento", "Uma dança"], 0], ["Trovadores criavam…", ["Computadores", "Canções", "Pianos elétricos"], 1], ["Qual compositor se destacou pelo organum a duas vozes na Escola de Notre-Dame?", ["Léonin", "Chopin", "Mozart"], 0], ["Nas obras de Pérotin, o organum podia chegar a…", ["Três e quatro vozes", "Somente uma voz", "Nenhuma voz"], 0], ["Qual compositor do século XIV está ligado à Ars Nova?", ["Guillaume de Machaut", "Léonin", "Pérotin"], 0]];
const journeyStories=[["Quando a música ainda não tinha nome", "Muito, muito antes do piano, do violão e das músicas gravadas, as pessoas já tinham uma grande possibilidade de fazer sons: o próprio corpo! A voz podia chamar, cantar e imitar. As mãos podiam bater palmas, e os pés marcavam batidas no chão. Imagine uma roda de pessoas respondendo umas às outras com sons. Nosso corpo continua sendo um instrumento que levamos para toda parte!", "Além da voz e do corpo, havia sons por toda a natureza. Madeira, pedras, sementes e outros materiais podiam soar quando eram batidos, sacudidos ou raspados. Com o passar do tempo, diferentes grupos humanos criaram instrumentos. Alguns instrumentos muito antigos, como flautas feitas de osso, chegaram até os nossos dias. Que pistas sonoras o passado deixou para nós!", "Mas quem fez a primeira música? E em que dia isso aconteceu? Essa parte da história ainda é um mistério: não sabemos exatamente quando a música começou. Os instrumentos encontrados pelos pesquisadores são pistas, mas não contam tudo. A voz e as palmas, por exemplo, não ficam guardadas na terra como um objeto. Por isso, estudamos o que restou sem inventar uma data para o nascimento da música."], ["A música ganha muitos lugares", "O tempo passou, e diferentes povos da Antiguidade fizeram da música uma companhia para festas, cerimônias e a vida cotidiana. Havia muitos tipos de instrumentos. Nas flautas, o sopro fazia o ar vibrar e produzir som. Imagine escutar uma melodia atravessando um pátio: era o ar ganhando uma forma que nossos ouvidos podiam perceber!", "Outros instrumentos faziam música com cordas. Entre eles estava a lira, conhecida em sociedades da Antiguidade, como a Grécia. Ao tocar suas cordas, o músico as fazia vibrar. Cada instrumento tinha seu jeito de soar: a flauta com o ar, a lira com as cordas, o tambor com as batidas. Assim, os sons podiam se encontrar de muitas maneiras.", "A história da música não aconteceu em um lugar só. No Egito, na Grécia, na China e em muitos outros lugares, as pessoas desenvolveram práticas musicais próprias. Instrumentos, modos de cantar e ocasiões para fazer música variavam. Imagine muitas janelas abertas, cada uma deixando entrar um som diferente. Desde muito cedo, a humanidade teve muitos caminhos musicais!"], ["Vozes e descobertas da Idade Média", "Na Europa medieval, a música podia ser ouvida nas igrejas, nas ruas e nos castelos. Nas igrejas, havia o cantochão, incluindo o canto gregoriano. Nele, os cantores seguiam uma única linha melódica, como um só caminho de notas. Isso não significa que apenas uma pessoa cantava: um grupo inteiro podia cantar a mesma melodia! Quando várias pessoas cantam juntas, podem formar um coro.", "Na Idade Média também viveu Hildegard von Bingen, no século XII. Ela criou músicas para vozes e foi uma importante compositora. Parte de suas obras foi preservada em manuscritos, livros escritos à mão. Imagine uma melodia atravessando tantos séculos graças a essas páginas! A música de Hildegard nos ajuda a conhecer um dos muitos caminhos musicais daquele tempo.", "Fora e dentro das cortes, poesia e música também se encontravam. Os trovadores criavam canções que podiam contar sentimentos e histórias. Muitas músicas eram aprendidas pela escuta e pela repetição; outras eram registradas por escrito. Antes das gravações, lembrar e compartilhar uma canção era uma maneira de fazê-la viajar. A música medieval não acontecia somente nas igrejas!", "Entre os séculos XII e XIII, a Catedral de Notre-Dame, em Paris, tornou-se um importante centro musical. Ali, compositores ajudaram a desenvolver a polifonia: diferentes linhas melódicas soando ao mesmo tempo. Léonin destacou-se pelo organum a duas vozes. Imagine um canto que avança bem devagar enquanto outra voz desenha uma melodia sobre ele. A polifonia já existia antes, mas ganhou novos caminhos nesse ambiente.", "Pérotin também está ligado à chamada Escola de Notre-Dame. Ele ampliou as possibilidades do organum, criando obras que chegavam a três e quatro vozes. Agora, imagine mais caminhos musicais se encontrando: cada voz participa da combinação. Viderunt omnes é uma de suas obras conhecidas. Não era uma invenção começando do zero, mas uma nova etapa de uma história que já vinha sendo construída!", "No século XIV, depois da época de Léonin e Pérotin, viveu Guillaume de Machaut, também chamado Guilherme de Machaut. Poeta e compositor, ele foi um grande nome da Ars Nova, expressão que significa arte nova. Nesse movimento, a escrita musical permitiu explorar novas possibilidades de ritmo. Machaut criou canções e obras religiosas, como a Messe de Nostre Dame. A música medieval seguia mudando, muito antes de chegar o Renascimento!"], ["Quando as melodias se encontram", "A polifonia já vinha sendo desenvolvida na Idade Média. No Renascimento europeu, compositores continuaram explorando novas combinações de melodias. Vamos imaginar uma voz começando uma melodia e outra entrando com uma melodia diferente. Elas continuam juntas, como caminhos que se cruzam sem perder seu movimento. Essa combinação de melodias é chamada polifonia: uma história com raízes medievais que ganhou novos caminhos no Renascimento.", "Mas como levar essas músicas para outras pessoas? A partitura ajudava a registrar o que seria cantado ou tocado. Com a impressão musical, tornou-se possível produzir e distribuir mais exemplares. Imagine páginas saindo de uma oficina e chegando a outros músicos! A música continuava sendo aprendida pelo ouvido, mas também podia viajar pelo papel.", "Um dos compositores desse período foi Josquin des Prez. Ele criou obras em que diferentes vozes cantam melodias ao mesmo tempo. Ao ouvir uma música assim, podemos tentar acompanhar uma voz e depois prestar atenção em outra. É como observar os fios de um tecido: eles se entrelaçam e formam algo maior. Enquanto isso, outras tradições musicais seguiam seus próprios caminhos pelo mundo."], ["O Barroco e as estações em música", "A história da música europeia chegou ao período Barroco. Nessa época viveu Antonio Vivaldi, violinista e compositor. Ele escreveu As Quatro Estações, uma coleção de concertos. Seus sons nos convidam a imaginar cenas da natureza: o canto dos pássaros, a chuva, o calor e o frio. A música não precisa mostrar uma imagem para despertar uma paisagem na nossa imaginação!", "O violino teve grande presença na música desse período. Ele tem cordas que vibram para produzir som, muitas vezes tocadas com um arco. Imagine uma corda vibrando e espalhando seu som pela sala. Por isso, o violino pertence à família dos instrumentos de cordas. Vivaldi conhecia muito bem esse instrumento e escreveu muitas músicas para ele.", "Outro grande compositor do Barroco foi Johann Sebastian Bach. Ele criou músicas para vozes, órgão, cravo e muitos outros instrumentos. Em suas obras, melodias podem se responder, aparecer novamente e se combinar. É como escutar uma conversa musical cheia de ideias. Bach e Vivaldi viveram no mesmo período, mas cada um criou seu próprio jeito de fazer música."], ["Quando a música conta histórias no palco", "Depois do Barroco, chegamos ao Classicismo europeu. Mozart e Haydn são dois compositores muito conhecidos desse período. Nos teatros, havia uma maneira especial de contar histórias: a ópera. Nela, personagens cantam, atuam e participam de uma história acompanhada por música. Imagine a cortina se abrindo e uma conversa se transformando em canto!", "Wolfgang Amadeus Mozart criou muitas obras: sinfonias, concertos, sonatas e óperas. Uma delas se chama A Flauta Mágica. Nessa obra, música, canto e teatro trabalham juntos para contar uma história. Os personagens têm vozes e músicas próprias, e a orquestra ajuda a construir as cenas. É uma história que também acontece pelos ouvidos!", "A orquestra também ganhou destaque nos concertos. Ela reúne diferentes instrumentos, como violinos, flautas e outros grupos de sons. Às vezes, um instrumento apresenta uma ideia e os outros respondem; às vezes, muitos tocam juntos. Haydn e Mozart escreveram obras para essa grande combinação. Imagine quantas cores sonoras cabem em um único palco!"], ["Músicas que despertam sentimentos", "Beethoven ajudou a abrir caminhos entre o Classicismo e o Romantismo. Depois, muitos artistas exploraram novas maneiras de expressar ideias e sentimentos. Entre eles estava Clara Schumann, pianista e compositora. Ela se apresentou em concertos e criou suas próprias músicas. Suas obras fazem parte dessa história que também foi escrita por mulheres.", "Frédéric Chopin foi outro compositor desse período. Pianista, escreveu muitas obras para piano. Com teclas, mãos e imaginação, esse instrumento pode produzir melodias delicadas, passagens agitadas e muitos contrastes. Imagine uma música que parece caminhar e outra que parece dançar. O piano ganhou um lugar muito especial nas obras de Chopin.", "Ao ouvir uma música, uma pessoa pode imaginar uma festa e outra pode lembrar de um lugar tranquilo. Isso acontece porque cada ouvinte leva suas experiências para a escuta. As músicas expressivas desse período nos convidam a perceber essas possibilidades. Não existe uma única emoção certa para sentir: duas pessoas podem ouvir a mesma obra e imaginar cenas diferentes."], ["Os sons começam a viajar de outro jeito", "Nos séculos XX e XXI, a música encontrou novas maneiras de chegar às pessoas. Rádio, cinema, televisão e computadores passaram a fazer parte dessa história. Compositores também criaram trilhas sonoras para filmes e jogos. Imagine uma cena de aventura com música e depois sem ela. Os sons podem ajudar a construir a sensação de suspense, alegria ou movimento!", "As gravações mudaram nossa relação com os sons. Uma apresentação podia ser registrada e ouvida novamente, mesmo depois de terminar. Com o tempo, diferentes tecnologias permitiram guardar e compartilhar música. Imagine como seria ouvir apenas as músicas tocadas perto de você! A gravação abriu muitas possibilidades para conhecer vozes e instrumentos de outros lugares.", "Jazz, rock, música eletrônica e muitos outros caminhos se desenvolveram. Novos instrumentos e tecnologias se juntaram a práticas musicais que continuavam vivas. Essa história não tem uma última página pronta: hoje, pessoas seguem criando, misturando ideias e transformando seus modos de fazer música. Cada nova criação pode acrescentar mais um som a essa grande história."], ["Brasil: muitas histórias, muitos sons", "Vamos olhar agora para o Brasil e para algumas de suas muitas tradições. Em Pernambuco, o frevo reúne música e dança e é muito presente no carnaval. As sombrinhas coloridas ajudam a reconhecer seus passos cheios de movimento! Maracatu e ciranda também fazem parte da riqueza musical pernambucana. Há muitas histórias para escutar pertinho da gente.", "Entre os artistas brasileiros está Chiquinha Gonzaga. Ela foi compositora, pianista e regente e criou músicas para o teatro e o carnaval. Pixinguinha, grande nome do choro, e Villa-Lobos, compositor de muitas obras, também fazem parte desses caminhos. Conhecer seus nomes é abrir portas para escutar músicas feitas em diferentes momentos da história do Brasil.", "A música no Brasil reúne muitas histórias. Os povos indígenas têm tradições musicais próprias e diversas: não existe uma única música que represente todos eles. Culturas africanas e afro-brasileiras, europeias e de outras origens também participam dessa riqueza. Cada povo e comunidade tem experiências para compartilhar. Conhecer a história da música é aprender a escutar essa diversidade com curiosidade e respeito."]];
const journeySceneAlts=["Ilustração de pessoas produzindo sons com o corpo e materiais da natureza.", "Ilustração de músicos da Antiguidade com flauta e lira.", "Ilustração de canto em grupo e de um músico em uma praça medieval.", "Ilustração de cantores compartilhando uma partitura no Renascimento.", "Ilustração de músicos tocando violino e instrumento de teclado no Barroco.", "Ilustração de músicos de uma orquestra do Classicismo.", "Ilustração de um recital de piano em um salão do Romantismo.", "Ilustração de um estúdio de gravação com microfone, teclado e computador.", "Ilustração de música e dança em uma festa de Pernambuco."];
function storyArt(i,part=0,small=false){const library=window.MUSIVERSO_JOURNEY_MEDIA,keys=library.chapters[i][part],selected=small?keys.slice(0,1):keys;return `<section class="story-gallery ${small?'story-gallery-small':''}" aria-label="Imagens do trecho"><div class="gallery-heading">${small?'PARA LEMBRAR':'OLHE ENQUANTO A HISTÓRIA É CONTADA'}</div><div class="story-photo-grid">${selected.map(key=>{const m=library.images[key];return `<figure class="story-photo-card"><button class="story-photo-open" data-enlarge="${esc(m.src)}" data-image-title="${esc(m.title+' — '+m.kind)}" aria-label="Ampliar imagem: ${esc(m.title)}"><img src="${esc(m.src)}" alt="${esc(m.title+'. '+m.caption)}" loading="eager"><span>⌕ Ampliar</span></button><figcaption><strong>${esc(m.title)}</strong><small>${esc(m.kind)}</small><p>${esc(m.caption)}</p><small class="photo-credit-inline">${esc(m.authorShort||m.author)} · <a href="${esc(m.licenseUrl)}" target="_blank" rel="noopener">${esc(m.license)}</a></small><details class="photo-credit"><summary>Ver fonte</summary><p>${esc(m.author)} · <a href="${esc(m.licenseUrl)}" target="_blank" rel="noopener">${esc(m.license)}</a> · <a href="${esc(m.source)}" target="_blank" rel="noopener">Ver fonte</a></p></details></figcaption></figure>`}).join('')}</div>${small?'':'<p class="gallery-help">Toque em uma imagem para mostrar em tamanho maior.</p>'}</section>`}
function focusStory(){window.scrollTo(0,0);const h=$('#main h1');h?.setAttribute('tabindex','-1');h?.focus({preventScroll:true})}
function lesson(i,part=0){window.MusiversoPolyphony?.dispose();stopHomeExplore();stopConcert();stopInstrumentAudio();stopNarration();session++;clearTimeout(stopTimer);page='lesson';chrome();const story=journeyStories[i],w=worlds[i];$('#main').innerHTML=`<button class="back" data-nav="journey" aria-label="Voltar para jornada">‹</button><div class="eyebrow">CAPÍTULO ${i+1} DE 9 · HISTÓRIA ${part+1} DE ${w.questions.length}</div><h1>${esc(story[0])}</h1><p class="lead">${esc(w.title)} · A história da música contada para crianças</p><section class="storybook photo-storybook">${storyArt(i,part)}<div class="story-content"><span class="reading-label">VAMOS CONHECER ESSA HISTÓRIA…</span><p class="lesson-copy">${esc(story[part+1])}</p><details class="adult-reading-guide"><summary>Para quem lê com a criança</summary><p>${esc(window.MUSIVERSO_JOURNEY_MEDIA.guides[i][part])}</p>${i===2?`<a class="source-link" href="${esc(window.MUSIVERSO_JOURNEY_MEDIA.medievalSources[part])}" target="_blank" rel="noopener">Referência para o adulto ↗</a>`:""}</details><div class="story-actions"><button class="btn soft" id="narrate">🔊 Ouvir história</button><button class="btn" id="lessonQuiz">Vamos responder? →</button></div><p class="helper">Leia com o professor ou toque em “Ouvir história”. A pergunta vem depois.</p>${part?'<button class="text-button" id="previousStory">‹ Voltar à história anterior</button>':''}</div></section>`;$('#narrate').onclick=()=>speak(story[part+1]);$('#lessonQuiz').onclick=()=>startQuiz(i,part);if(part)$('#previousStory').onclick=()=>lesson(i,part-1);focusStory();autoRead()}

function startQuiz(i,index=0){stopNarration();let locked=false;const total=worlds[i].questions.length,q=worlds[i].questions[index],options=q[1].map((x,j)=>({x,right:j===q[2]}));for(let k=options.length-1;k>0;k--){const j=Math.floor(Math.random()*(k+1));[options[k],options[j]]=[options[j],options[k]]}$('#main').innerHTML=`<div class="activity-box story-question"><div class="progress"><i style="width:${journeyCompletedParts(i).length/total*100}%"></i></div><div class="eyebrow">CAPÍTULO ${i+1} · PERGUNTA ${index+1} DE ${total}</div>${storyArt(i,index,true)}<p class="reading-label">AGORA, SOBRE O QUE VOCÊ DESCOBRIU…</p><h1>${esc(q[0])}</h1><div class="answers">${options.map((o,j)=>`<button class="answer" data-answer="${j}">${esc(o.x)}</button>`).join('')}</div><div class="feedback" role="status" aria-live="polite"></div><div class="story-actions"><button class="btn soft" id="rereadStory">📖 Reler a história</button><button class="btn soft" data-read-screen>🔊 Ouvir pergunta</button></div><button class="text-button" data-nav="journey">Voltar aos caminhos</button></div>`;$('#rereadStory').onclick=()=>lesson(i,index);focusStory();autoRead();document.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{if(locked)return;if(!options[+b.dataset.answer].right){b.classList.add('wrong');b.setAttribute('aria-label',b.textContent+' — tente outra opção');$('.feedback').textContent='Vamos lembrar da história? Você pode reler e tentar de novo!';if(state.narration)speak($('.feedback').textContent);return}locked=true;b.classList.add('correct');document.querySelectorAll('[data-answer]').forEach(x=>x.disabled=true);state.journeyAnswers=state.journeyAnswers&&typeof state.journeyAnswers==='object'&&!Array.isArray(state.journeyAnswers)?state.journeyAnswers:{};state.journeyAnswers[i]=[...new Set([...journeyCompletedParts(i),index])];save();const complete=journeyCompletedParts(i).length===total,finish=complete&&(!state.done.includes(i)||index===total-1),label=finish?'Concluir capítulo':index<total-1?'Continuar a história':'Ver meu caminho';$('.feedback').className='feedback good';$('.feedback').innerHTML=`🎉 Isso mesmo! Você acertou! <button class="btn game-continue-btn" id="nextQ">${label} →</button>`;if(state.narration)speak('Isso mesmo! Toque em '+label+'.');$('#nextQ').onclick=()=>{stopNarration();if(finish){if(!state.done.includes(i)){state.done.push(i);state.xp+=30;save()}chrome();$('#main').innerHTML=`<div class="activity-box"><div style="font-size:70px">🏅</div><h1>Capítulo concluído!</h1><p>Você conheceu mais um pedacinho da história da música. Vamos continuar?</p><div class="chips" style="justify-content:center"><span class="chip">${state.done.length} de 9 capítulos</span><span class="chip">⭐ ${state.xp} estrelas</span></div><div class="story-actions">${i<worlds.length-1?`<button class="btn" data-lesson="${i+1}" data-story-part="${journeyNextPart(i+1)}">Próximo capítulo →</button>`:''}<button class="btn soft" data-nav="journey">Ver os caminhos</button></div></div>`;focusStory();if(state.narration)speak('Capítulo concluído! Vamos continuar a nossa viagem musical?');return}if(index<total-1){lesson(i,index+1);return}const next=journeyNextPart(i);$('#main').innerHTML=`<div class="activity-box"><div style="font-size:60px">⭐</div><h1>Parada concluída!</h1><p>Você já concluiu ${journeyCompletedParts(i).length} de ${total} paradas deste caminho. Escolha outra descoberta para continuar.</p><div class="story-actions"><button class="btn" data-lesson="${i}" data-story-part="${next}">Continuar de onde falta →</button><button class="btn soft" data-nav="journey">Ver os caminhos</button></div></div>`;focusStory()}})}
function instrumentPage(){$('#main').innerHTML=`<div class="eyebrow">VEJA · ESCUTE · DESCUBRA</div><h1>Conheça os instrumentos</h1><p class="lead">Olhe as fotografias. Toque na fotografia para ampliar e conhecer sua história. Use o alto-falante para ouvir!</p><div class="collect-grid instrument-gallery">${instruments.map((x,i)=>`<article class="collect-card instrument-card"><button class="portrait-button" data-instrument-info="${i}" aria-label="Conhecer ${esc(x.name)}">${instrumentImage(x)}<span class="photo-play" aria-hidden="true">⌕</span></button><div class="person-info"><h3>${x.name}</h3><button class="voice-button" data-instrument-info="${i}">📖 Imagem e história</button><button class="voice-button" data-say="${esc(x.name+'. '+x.desc)}">🔊 Ouvir explicação</button><button class="voice-button music-button" data-instrument="${i}">♫ Ouvir o som</button></div></article>`).join('')}</div><p class="helper">Fotografias de instrumentos reais e exemplos sonoros por amostras MIDI. Compare cordas, sopros e percussão; cada instrumento tem seu próprio timbre.</p><a class="credits-link" href="creditos.html" target="_blank" rel="noopener">Créditos das imagens</a>`;document.querySelectorAll('[data-instrument]').forEach(b=>b.onclick=()=>playInstrument(+b.dataset.instrument))}
function composerPage(){$('#main').innerHTML=`<div class="eyebrow">ROSTOS E HISTÓRIAS DA MÚSICA</div><h1>Quem vamos conhecer?</h1><p class="lead">Toque em um retrato para ampliar a imagem, ler a história e ouvir suas obras!</p><div class="composer-intro"><button class="btn" data-game="composer">▶ Brincar com os retratos</button><button class="btn soft" data-say="Vamos conhecer pessoas que criaram música! Toque em uma imagem para ouvir a história. Nas fichas dos compositores, você também encontra obras para ouvir.">🔊 Como brincar?</button></div><div class="collect-grid portrait-gallery">${people.map(p=>personCard(p)).join('')}</div><p class="helper">Retratos e representações históricas; fotografias quando disponíveis. As fichas incluem gravações em vídeo de artistas e instituições. Os exemplos dos jogos usam amostras de instrumentos MIDI.</p><a class="credits-link" href="creditos.html" target="_blank" rel="noopener">Créditos das imagens</a>`}
function collection(){$('#main').innerHTML=`<div class="eyebrow">LEMBRANÇAS DA SUA VIAGEM</div><h1>Minha coleção</h1><p class="lead">Conclua aventuras para guardar estas descobertas no seu passaporte.</p><div class="collect-grid">${worlds.map((w,i)=>`<article class="collect-card" style="${!state.done.includes(i)?'background:#f0ebf7;opacity:.75':''}"><span class="art">${state.done.includes(i)?w.icon:'🔒'}</span><h3>${w.title}</h3><p>${state.done.includes(i)?'Descoberta guardada!':'Conclua a aventura para colecionar.'}</p><button class="text-button" data-lesson="${i}">${state.done.includes(i)?'REVISITAR':'EXPLORAR'} →</button></article>`).join('')}</div>`}
function profile(){$('#main').innerHTML=`<div class="settings"><div class="profile-top"><div class="portrait">${state.avatar}</div><h1>${esc(state.name)}</h1><span class="chip">⭐ ${state.xp} estrelas · 🏅 ${state.done.length} aventuras</span></div><div class="panel"><h3>Minha jornada</h3><div class="progress"><i style="width:${state.done.length/9*100}%"></i></div><small>${state.done.length} de 9 aventuras concluídas</small></div>${[['avatar','🧒','Meu avatar e nome','›'],['collection','🏆','Minhas conquistas','›'],['sound','🔊','Som',state.sound?'Ligado':'Desligado'],['narration','🗣️','Narração automática',state.narration?'Ligada':'Desligada'],['large','🔠','Texto ampliado',state.large?'Ligado':'Desligado'],['reduced','✨','Reduzir movimento',state.reduced?'Ligado':'Desligado'],['teacher','📚','Espaço do Professor','›'],['parents','🔒','Área dos responsáveis','›'],['sync','☁️','Sincronizar agora','›'],['install','📲','Abrir como aplicativo','›'],...(window.MusiversoAuthUser?.app_metadata?.musiverso_kids_admin===true?[['admin','🛡️','Painel de administração','›']]:[]),['logout','🚪','Sair da conta','›']].map(([id,i,n,v])=>`<button class="setting-row" data-setting="${id}"><span class="ico">${i}</span>${n}<span>${v}</span></button>`).join('')}<p class="helper">Conta: ${esc(window.MusiversoAuthUser?.email||'')}<br>Seu progresso fica salvo na sua conta e é sincronizado entre dispositivos.<br><span data-sync-status role="status">${esc(window.MusiversoCloudProgress?.getStatus()||'Conferindo sincronização…')}</span></p></div>`;document.querySelectorAll('[data-setting]').forEach(b=>b.onclick=()=>{const s=b.dataset.setting;if(s==='sync'){window.MusiversoCloudProgress?.sync();return}else if(s==='install'){window.MusiversoInstall?.();return}else if(s==='teacher'){location.href='professor/';return}else if(s==='admin'){location.href='admin.html';return}else if(s==='logout'){window.MusiversoLogout?.();return}else if(s==='collection')go('collection');else if(s==='avatar')avatarDialog();else if(s==='parents')parentGate();else{state[s]=!state[s];if((s==='sound'&&!state.sound)||(s==='narration'&&!state.narration))stopNarration();if(s==='narration'&&state.narration)speak('Voz automática ativada. Eu vou ler as instruções para você.');if(s==='sound'&&!state.sound)stopInstrumentAudio();if(s==='sound'&&!state.sound&&audioCtx){audioCtx.close().catch(()=>{});audioCtx=null}save();chrome();profile()}})}
let modalOpener=null,imageOpener=null;
function modal(html,options={}){suspendHomeExplore();modalOpener=document.activeElement;document.body.classList.add('modal-open');$('#modal').hidden=false;$('#modal').innerHTML=`<div class="dialog ${options.wide?'detail-dialog':''}" role="dialog" aria-modal="true" aria-label="${esc(options.title||'Configurações')}"><button class="close" aria-label="Fechar">×</button>${html}</div>`;$('#modal .close').onclick=closeModal;$('#modal').onclick=e=>{if(e.target===$('#modal'))closeModal()};setTimeout(()=>$('#modal button')?.focus(),0)}function closeModal(){stopInstrumentAudio();stopNarration();closeImage();$('#modal').hidden=true;$('#modal').innerHTML='';document.body.classList.remove('modal-open');modalOpener?.focus?.();resumeHomeExplore()}document.addEventListener('keydown',e=>{if(e.key==='Escape'){if($('#imageViewer')&&!$('#imageViewer').hidden)closeImage();else closeModal()}const topLayer=$('#imageViewer')&&!$('#imageViewer').hidden?$('#imageViewer'):!$('#modal').hidden?$('#modal'):null;if(e.key==='Tab'&&topLayer){const focusable=[...topLayer.querySelectorAll('button,input,a[href],iframe,audio[controls],[tabindex="0"]')].filter(x=>!x.disabled&&x.getClientRects().length);const a=focusable[0],z=focusable.at(-1);if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}});
function avatarDialog(){modal(`<h2>Do seu jeitinho!</h2><label for="childName">Como quer ser chamado?</label><input id="childName" maxlength="24" value="${esc(state.name)}" autocomplete="off"><p>Escolha seu avatar:</p><div class="avatar-options">${['🧒','👧','👦','🧑🏾','👩🏿‍🦱','🧑🏻‍🦰','🦊','🐼'].map(x=>`<button data-avatar="${x}" aria-label="Escolher avatar ${x}">${x}</button>`).join('')}</div><button class="btn" id="saveName">Salvar</button>`);let chosen=state.avatar;document.querySelectorAll('[data-avatar]').forEach(b=>b.onclick=()=>{chosen=b.dataset.avatar;document.querySelectorAll('[data-avatar]').forEach(x=>x.style.outline='none');b.style.outline='3px solid #8b44de'});$('#saveName').onclick=()=>{state.name=$('#childName').value.trim()||'Explorador';state.avatar=chosen;save();closeModal();chrome();profile()}}
function parentGate(){const a=8+Math.floor(Math.random()*9),b=7+Math.floor(Math.random()*7);modal(`<div style="font-size:40px">🔒</div><h2>Área dos responsáveis</h2><p>Peça ajuda a um adulto para continuar.</p><label for="gate">Quanto é ${a} × ${b}?</label><input id="gate" type="number" inputmode="numeric"><p class="helper" id="gateError"></p><button class="btn" id="gateGo">Acessar</button><p class="helper">Esta barreira evita acessos por toque acidental; não é uma autenticação.</p>`);$('#gateGo').onclick=()=>{if(+$('#gate').value!==a*b){$('#gateError').textContent='Confira a resposta com um adulto.';return}modal(`<h2>Família e professores</h2><p><strong>${esc(state.name)}</strong> concluiu ${state.done.length} aventuras e somou ${state.xp} estrelas.</p><p>Explore junto, converse sobre os sons e respeite o ritmo de cada criança.</p><p class="helper">Versão inicial: dados locais, sem cadastro, pagamentos ou painel de turmas. Os exemplos sonoros usam amostras de instrumentos MIDI.</p><button class="btn soft" id="resetData">Reiniciar progresso</button>`);$('#resetData').onclick=()=>{modal(`<h2>Reiniciar a viagem?</h2><p>Isso apaga as estrelas, conquistas e aventuras salvas neste navegador.</p><button class="btn purple" id="confirmReset">Sim, reiniciar</button>`);$('#confirmReset').onclick=()=>{state={...initial,done:[],wins:[]};save();closeModal();go('home')}}}}
// MIDI timbres are played from locally bundled FluidR3_GM instrument samples.
// Activity clips use native media playback, like the instrument examples.
// Call play() directly in the touch/click gesture for Safari and iOS.
const activityAudio=document.createElement('audio'),tapSounds=Array.from({length:6},()=>{const a=document.createElement('audio');a.src='assets/audio/echo-tap.mp3';a.preload='auto';a.setAttribute('playsinline','');a.hidden=true;document.body.append(a);return a});let tapSoundIndex=0,activityPlaybackToken=0;let stopRhythm=()=>{};const rhythmAudio=document.createElement('audio');rhythmAudio.setAttribute('playsinline','');rhythmAudio.preload='auto';rhythmAudio.hidden=true;document.body.append(rhythmAudio);
activityAudio.preload='auto';activityAudio.setAttribute('playsinline','');activityAudio.hidden=true;document.body.append(activityAudio);
function stopActivityAudio(){stopRhythm();activityPlaybackToken++;document.querySelectorAll('[data-figure]').forEach(b=>b.setAttribute('aria-pressed','false'));activityAudio.onended=null;activityAudio.onplaying=null;activityAudio.onerror=null;activityAudio.pause();activityAudio.currentTime=0;tapSounds.forEach(a=>{a.pause();a.currentTime=0})}
function activityClip(name,onStart=()=>{},onEnd=()=>{},onError=()=>{}){if(!state.sound){toast('Ative o som no Perfil para ouvir.');return}stopNarration();stopInstrumentAudio();if(audioCtx){audioCtx.close().catch(()=>{});audioCtx=null}const guard=session,playbackToken=activityPlaybackToken;const isCurrent=()=>guard===session&&playbackToken===activityPlaybackToken;activityAudio.src='assets/audio/'+name+'.mp3';activityAudio.volume=.9;const failed=()=>{if(!isCurrent())return;onError();toast('Não consegui iniciar o som. Toque novamente para tentar.')};activityAudio.onplaying=()=>{if(isCurrent())onStart()};activityAudio.onended=()=>{if(isCurrent())onEnd()};activityAudio.onerror=failed;activityAudio.play().catch(failed)}
function tapSound(){if(!state.sound)return;const a=tapSounds[tapSoundIndex++%tapSounds.length];a.pause();a.currentTime=0;a.volume=.9;a.play().catch(()=>toast('Toque novamente para ativar o som da batida.'))}
function context(){if(!state.sound){toast('Ative o som no Perfil para ouvir.');return null}try{if(!audioCtx||audioCtx.state==='closed')audioCtx=new(window.AudioContext||window.webkitAudioContext)();audioCtx.resume().catch(()=>toast('Toque novamente para ativar o áudio.'));return audioCtx}catch{toast('Este navegador não conseguiu iniciar o áudio.');return null}}
function tone(midi,duration=.35,offset=0,type='piano'){const c=context();if(!c||!midi)return;const token=session;window.MusiversoSampler.note(c,midi,duration,offset,type,()=>session===token&&state.sound&&c.state!=='closed',()=>toast('Não consegui carregar o instrumento. Tente novamente.'))}
function stopInstrumentAudio(){const a=$('#instrumentAudio');if(a){a.pause();a.currentTime=0}const b=$('[data-stop-instrument]');if(b)b.hidden=true;const status=$('#instrumentAudioStatus');if(status)status.textContent=''}
function playInstrument(i){if(!state.sound){toast('Ative o som no Perfil para ouvir.');return}const x=instruments[i];if(!x)return;stopNarration();stopInstrumentAudio();if(audioCtx){audioCtx.close().catch(()=>{});audioCtx=null}const audio=$('#instrumentAudio');audio.src='assets/audio/'+x.type+'-example.mp3';audio.volume=.85;audio.onplaying=()=>{const b=$('[data-stop-instrument]');if(b)b.hidden=false;$('#instrumentAudioStatus').textContent='Reproduzindo som do instrumento.'};audio.onended=()=>{const b=$('[data-stop-instrument]');if(b)b.hidden=true;$('#instrumentAudioStatus').textContent='Som concluído.'};audio.onerror=()=>{stopInstrumentAudio();toast('Não consegui carregar o som. Toque para tentar novamente.')};audio.play().catch(()=>toast('Toque novamente em Ouvir para iniciar o som.'))}
function melody(notes){stopInstrumentAudio();stopNarration();let t=0;notes.forEach(([n,d])=>{if(n)tone(n,d*.88,t);t+=d});return t}
function speak(t){if(concert){haltPianoVoices(concert);concert.mode='idle';const listen=$('#pianoListen');if(listen)listen.textContent='♫ Ouvir exemplo'}stopInstrumentAudio();if(!state.sound){toast('Ative o som no Perfil para ouvir.');return}stopNarration();if(!['rhythm','maestro'].includes(page)&&audioCtx){audioCtx.close().catch(()=>{});audioCtx=null}const text=t.replace(/\s+/g,' ').trim(),src=window.MUSIVERSO_VOICE?.[text];if(src){const clip=new Audio(src);clip.playbackRate=.92;narratorAudio=clip;clip.preload='auto';clip.onplaying=()=>{const b=$('[data-stop-voice]');if(b)b.hidden=false};clip.onended=()=>{if(narratorAudio===clip){narratorAudio=null;const b=$('[data-stop-voice]');if(b)b.hidden=true}};clip.onerror=()=>{if(narratorAudio===clip){narratorAudio=null;toast('Não consegui carregar a voz. Toque em Ouvir para tentar novamente.')}};clip.play().catch(()=>{if(narratorAudio===clip){narratorAudio=null;toast('Toque em Ouvir para iniciar a narração.')}});return}if(!('speechSynthesis'in window)){toast('A narração não está disponível neste navegador.');return}if(!state.sound){toast('Ative o som no Perfil para ouvir.');return}speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang='pt-BR';u.rate=.86;u.pitch=1.05;const voices=speechSynthesis.getVoices();const voice=voices.find(v=>v.lang.toLowerCase()==='pt-br')||voices.find(v=>v.lang.toLowerCase().startsWith('pt'));if(voice)u.voice=voice;u.onstart=()=>{const b=$('[data-stop-voice]');if(b)b.hidden=false};u.onend=()=>{const b=$('[data-stop-voice]');if(b)b.hidden=true};u.onerror=e=>{const b=$('[data-stop-voice]');if(b)b.hidden=true;if(!['canceled','interrupted'].includes(e.error))toast('A voz não pôde iniciar. Confira as vozes em português do aparelho e toque em Ouvir novamente.');};speechSynthesis.speak(u)}
function stopNarration(){stopActivityAudio();if(narratorAudio){narratorAudio.pause();narratorAudio.currentTime=0;narratorAudio=null}if('speechSynthesis'in window)speechSynthesis.cancel();const b=$('[data-stop-voice]');if(b)b.hidden=true}
function game(id,selected){go('games',true);page=id;chrome();activeGameLevel=selected??null;if(gameLevelsOn(id)&&selected===undefined){gameLevelMenu(id);return}const f={polyphony:()=>window.MusiversoPolyphony.mount($('#main'),{silence:stopNarration}),sound:soundGame,memory:memoryGame,echo:echoGame,composer:composerGame,rhythm:rhythmGame,maestro:maestroGame,figures:figuresPage,families:instrumentFamiliesGame,staff:staffGame};f[id]?.();if(id==='figures')autoRead()}
function gameShell(title,subtitle,body){$('#main').innerHTML=`<button class="back" data-nav="games" aria-label="Voltar aos jogos">‹</button><section class="activity-box"><h1>${title}</h1><p class="lead">${subtitle}</p><button class="voice-button instructions" data-say="${esc(title+'. '+subtitle)}" aria-label="Ouvir instruções do jogo">🔊 Ouvir instruções</button>${body}</section>`;autoRead()}
function instrumentFamiliesGame(){
 const familyInfo={strings:{name:'Cordas',icon:'🎻',help:'Cordas vibram para produzir o som. O piano entra aqui como cordas percutidas.'},wind:{name:'Sopro',icon:'🎷',help:'O ar põe o instrumento em vibração.'},percussion:{name:'Percussão',icon:'🥁',help:'O som nasce ao bater, sacudir ou raspar.'}};
 const levels=[['piano','flute','drum','guitar','clarinet','timpani'],['piano','flute','drum','guitar','clarinet','timpani','violin','cello','oboe'],Object.keys(instrumentFamilies)];
 const allowed=activeGameLevel===null?Object.keys(instrumentFamilies):levels[activeGameLevel];let remaining=allowed.filter(type=>instruments.some(item=>item.type===type)).sort(()=>Math.random()-.5),sorted={strings:[],wind:[],percussion:[]},selected=null,message='Toque em um instrumento e depois na família correspondente.',messageClass='family-feedback',wrongBin='';
 function draw(){
  const count=allowed.length-remaining.length;
  gameShell('Famílias dos instrumentos','Junte cada instrumento à família correta: cordas, sopro ou percussão.',`<div class="family-game"><div class="family-game-top"><span class="chip">${count} de ${allowed.length} instrumentos agrupados</span><span class="helper">${allowed.length-count} para descobrir</span></div><div class="family-bins">${Object.entries(familyInfo).map(([key,f])=>`<button class="family-bin ${wrongBin===key?'wrong-family':''}" data-family-bin="${key}" aria-label="Agrupar em ${f.name}"><span class="family-bin-icon">${f.icon}</span><strong>${f.name}</strong><small>${f.help}</small><span class="family-bin-items">${sorted[key].map(x=>`<span class="family-sorted-chip">${esc(x.name)}</span>`).join('')||'<span class="family-bin-empty">Toque para agrupar aqui</span>'}</span></button>`).join('')}</div><h2>Escolha um instrumento</h2><div class="family-instrument-grid">${remaining.map(type=>{const x=instruments.find(item=>item.type===type);return `<button class="family-instrument-card ${selected===type?'selected':''}" data-family-instrument="${type}" aria-pressed="${selected===type}"><img src="${x.type==='guitar'?'assets/instruments/guitar.png':`assets/instruments/${x.type}.jpg`}" alt=""><strong>${esc(x.name)}</strong></button>`}).join('')}</div><p class="${messageClass}" id="familyFeedback" role="status" aria-live="polite">${esc(message)}</p></div>`);
  document.querySelectorAll('[data-family-instrument]').forEach(button=>button.onclick=()=>{selected=button.dataset.familyInstrument;const item=instruments.find(x=>x.type===selected);message=`Agora escolha a família de ${item.name}.`;messageClass='family-feedback';wrongBin='';draw()});
  document.querySelectorAll('[data-family-bin]').forEach(button=>button.onclick=()=>{if(!selected){message='Primeiro toque em um instrumento.';messageClass='family-feedback';draw();return}const key=button.dataset.familyBin,item=instruments.find(x=>x.type===selected);if(instrumentFamilies[selected]!==key){message=`Quase! ${item.name} pertence à família ${familyInfo[instrumentFamilies[selected]].name}. Tente novamente.`;messageClass='family-feedback family-feedback-wrong';wrongBin=key;draw();return}sorted[key].push(item);remaining=remaining.filter(type=>type!==selected);selected=null;wrongBin='';message=`Muito bem! ${item.name} pertence à família ${familyInfo[key].name}.`;messageClass='family-feedback family-feedback-good';if(!remaining.length){finish('families','Você organizou as famílias!','Cordas, sopro e percussão: cada instrumento encontrou seu grupo.');return}draw()});
 }
 draw()
}
function soundGame(){const choices=activeGameLevel===null?4:[2,4,6][activeGameLevel];let round=0,correct=0,target,locked=false;function draw(){locked=false;target=Math.floor(Math.random()*instruments.length);const options=[target,...instruments.map((_,i)=>i).filter(i=>i!==target).sort(()=>Math.random()-.5).slice(0,choices-1)].sort(()=>Math.random()-.5);gameShell('Que som é esse?','Toque, escute e escolha o instrumento.',`<div class="eyebrow">DESAFIO ${round+1} DE 4</div><button class="audio-btn" id="listen" aria-label="Ouvir instrumento">🔊</button><p class="helper">Ouça o timbre MIDI e escolha a fotografia do instrumento.</p><div class="answers">${options.map(i=>{const x=instruments[i];return `<button class="answer picture-answer" data-choice="${i}" aria-label="Escolher ${esc(x.name)}">${instrumentImage(x)}<span class="picture-caption">${x.name}</span></button>`}).join('')}</div><div class="feedback" role="status"></div>`);$('#listen').onclick=()=>playInstrument(target);document.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>{if(locked)return;if(+b.dataset.choice!==target){b.classList.add('wrong');$('.feedback').textContent='Escute outra vez e experimente!';if(state.narration)speak('Escute outra vez e experimente!');return}locked=true;correct++;b.classList.add('correct');if(state.narration)speak('Isso! É o instrumento '+instruments[target].name+'. Toque em continuar.');$('.feedback').className='feedback good';$('.feedback').innerHTML='✨ Muito bem! Você reconheceu o som! <button id="nextSound" class="btn game-continue-btn">Continuar →</button>';$('#nextSound').onclick=()=>{round++;if(round<4)draw();else finish('sound','Ouvidos atentos!','Você reconheceu quatro exemplos sonoros.')}})}draw()}
function finish(id,title,txt){gainXP(20,'game-'+id);gameShell(title,txt,`<div style="font-size:90px">🌟</div><p>Mais uma descoberta para o seu universo!</p><div class="toolbar"><button class="btn game-continue-btn" data-game="${id}">Jogar de novo</button><button class="btn soft" data-nav="games">Outros jogos</button></div>`)}
function memoryGame(){
 const pairs=activeGameLevel===null?4:activeGameLevel+2,deck=[...Array(pairs).keys(),...Array(pairs).keys()].sort(()=>Math.random()-.5),figures=[['whole','Semibreve',4],['half','Mínima',2],['quarter','Semínima',1],['eighth','Colcheia',.5]];
 let open=[],matched=[],busy=false,moves=0;const mySession=session;
 const back='<span class="memory-back" aria-hidden="true">♫</span><small>Toque para ouvir</small>';
 gameShell('Memória sonora','Encontre os cartões que tocam a mesma nota.',`<p class="helper">Toque em um cartão para ouvir e revelar a figura musical. Depois, procure seu par!</p><div class="memory-grid">${deck.map((_,i)=>`<button class="memory-card" data-card="${i}" aria-label="Ouvir cartão ${i+1}">${back}</button>`).join('')}</div><p class="helper" id="moves">0 tentativas · 0 de ${pairs} pares</p><div class="feedback" role="status"></div>`);
 $('#main .activity-box').classList.add('memory-activity');
 document.querySelectorAll('[data-card]').forEach(b=>b.onclick=()=>{
  const i=+b.dataset.card;if(busy||open.includes(i)||matched.includes(i))return;
  if(!state.sound){toast('Ative o som no Perfil para ouvir.');return}
  const [kind,name,pulses]=figures[deck[i]];
  activityClip('memory-'+kind);b.innerHTML=noteSvg(kind)+`<strong>${name}</strong><small>${pulses===.5?'½ pulso':pulses+' '+(pulses===1?'pulso':'pulsos')}</small>`;
  b.setAttribute('aria-label',`Cartão ${i+1}: ${name}, ${pulses===.5?'meio pulso':pulses+' '+(pulses===1?'pulso':'pulsos')}`);b.classList.add('open');open.push(i);
  if(open.length===2){
   moves++;
   if(deck[open[0]]===deck[open[1]]){
    open.forEach(n=>{const card=$(`[data-card="${n}"]`);card.classList.add('matched');card.setAttribute('aria-label',card.getAttribute('aria-label')+', par encontrado');matched.push(n)});open=[];
    $('.feedback').className='feedback good';$('.feedback').textContent=matched.length===pairs*2?'🌟 Muito bem! Você encontrou todos os pares!':'👏 Par encontrado! Sua memória musical está afiada!';if(matched.length===pairs*2){$('.feedback').innerHTML='🌟 Muito bem! Você encontrou todos os pares! <button class="btn game-continue-btn" id="memDone">Concluir →</button>';$('#memDone').onclick=()=>{stopNarration();finish('memory','Boa memória musical!','Você encontrou todos os pares sonoros.')}}
   }else{
    busy=true;setTimeout(()=>{if(session!==mySession)return;open.forEach(n=>{const el=$(`[data-card="${n}"]`);if(el){el.innerHTML=back;el.setAttribute('aria-label',`Ouvir cartão ${n+1}`);el.classList.remove('open')}});open=[];busy=false},Math.max(1200,pulses*.6*1000+150))
   }
   $('#moves').textContent=`${moves} tentativas · ${matched.length/2} de ${pairs} pares`;
  }
 });
}
function echoGame(){
 const patterns=[
  {level:0,name:'Passos regulares',figures:'Semínimas',beats:[0,1,2,3]},
  {level:0,name:'Dois passos e uma pausa',figures:'Semínimas e silêncio',beats:[0,1,3]},
  {level:0,name:'Passo, pausa, passo',figures:'Semínimas e silêncio',beats:[0,2,3]},
  {level:0,name:'Três passos e uma pausa',figures:'Semínimas e silêncio',beats:[0,1,2,4]},
  {level:0,name:'Passos com espaço',figures:'Semínimas e silêncio',beats:[0,1,3,4]},
  {level:1,name:'Colcheias em pares',figures:'Colcheias',beats:[0,.5,1,1.5]},
  {level:1,name:'Semínima e duas colcheias',figures:'Semínima + colcheias',beats:[0,1,1.5]},
  {level:1,name:'Duas colcheias e semínima',figures:'Colcheias + semínima',beats:[0,.5,1.5]},
  {level:1,name:'Alternando as figuras',figures:'Semínimas + colcheias',beats:[0,.5,1.5,2,3]},
  {level:1,name:'Colcheias no contratempo',figures:'Colcheias',beats:[0,.5,1.5,2.5]},
  {level:2,name:'Pequenos grupos rápidos',figures:'Semicolcheias',beats:[0,.25,.5,.75,1]},
  {level:2,name:'Semínima e grupo rápido',figures:'Semínima + semicolcheias',beats:[0,1,1.25,1.5,1.75]},
  {level:2,name:'Síncope de colcheia',figures:'Colcheias sincopadas',beats:[0,.5,1.5,2.5]},
  {level:2,name:'Síncope antecipada',figures:'Semínimas + contratempo',beats:[0,1.5,2,3]},
  {level:2,name:'Síncope e semicolcheias',figures:'Semicolcheias sincopadas',beats:[0,.25,1,1.75,2.25,3]}
 ];
 const rounds=activeGameLevel===null?patterns:patterns.filter(p=>p.level===activeGameLevel);
 let round=0,pattern,target=[],recording=false,taps=[],started=0,ready=false,inputMode='screen',playbackTimers=[],micStream=null,micContext=null,micAnalyser=null,micSource=null,micFrame=0,micBuffer=null,micLastCheck=0,micPreviousRms=0,micNoiseFloor=.004,micPeak=0,micLastAttack=0,micQuietFrames=0,micArmed=false;
 const clearPlayback=()=>{playbackTimers.forEach(clearTimeout);playbackTimers=[]};
 const stopMic=()=>{cancelAnimationFrame(micFrame);micFrame=0;if(micStream){micStream.getTracks().forEach(track=>track.stop());micStream=null}try{micSource?.disconnect()}catch{}micSource=null;micAnalyser=null;if(micContext&&micContext.state!=='closed')micContext.close().catch(()=>{});micContext=null;micBuffer=null;micArmed=false};
 const updateInput=()=>{const tap=$('#tap'),status=$('#echoMicStatus'),screen=$('#echoScreen'),mic=$('#echoMic');if(!tap||!status)return;const listening=inputMode==='mic';tap.closest('.echo-tap-wrap').hidden=listening;status.hidden=!listening;screen.classList.toggle('selected-filter',!listening);screen.setAttribute('aria-pressed',String(!listening));mic.classList.toggle('selected-filter',listening);mic.setAttribute('aria-pressed',String(listening));mic.textContent=listening?'⏹ Desligar microfone':'🎙️ Usar microfone'};
 const recordBeat=(stamp,playSound=false)=>{if(!ready||taps.length>=target.length)return;if(!recording){recording=true;started=stamp}taps.push((stamp-started)/1000);if(playSound)tapSound();$('#echoHelp').textContent=`${taps.length} de ${target.length} batidas`;if(taps.length===target.length){ready=false;$('#checkEcho').disabled=false}};
 const listenMic=guard=>{const loop=now=>{if(guard!==session||page!=='echo'||!micStream){stopMic();return}if(now-micLastCheck<22){micFrame=requestAnimationFrame(loop);return}micLastCheck=now;const samples=micBuffer;micAnalyser.getFloatTimeDomainData(samples);let energy=0;for(let i=0;i<samples.length;i++)energy+=samples[i]*samples[i];const rms=Math.sqrt(energy/samples.length),threshold=Math.max(.01,micNoiseFloor*3.2),quiet=rms<threshold*.65;
  if(quiet){micQuietFrames++;micNoiseFloor=micNoiseFloor*.96+rms*.04;if(micQuietFrames>=2){micArmed=true;micPeak=0}}
  else{micQuietFrames=0;if(!micArmed&&now-micLastAttack>45&&rms<micPeak*.48){micArmed=true;micPeak=0}if(rms>micPeak)micPeak=rms;const onset=rms>threshold&&rms>Math.max(micPreviousRms*1.45,micNoiseFloor*3.2);if(inputMode==='mic'&&ready&&micArmed&&onset){micArmed=false;micPeak=rms;micLastAttack=now;recordBeat(now,false)}}
  micPreviousRms=rms;micFrame=requestAnimationFrame(loop)};micFrame=requestAnimationFrame(loop)};
 function draw(){
  pattern=rounds[round];target=pattern.beats.map(beat=>beat*.6);ready=false;recording=false;taps=[];clearPlayback();
  gameShell('Eco musical','Escute e repita. Explore semínimas, colcheias, semicolcheias e síncopes.',`<div class="eyebrow">${activeGameLevel===null?'RITMO':'NÍVEL '+(activeGameLevel+1)+' · RITMO'} ${round+1} DE ${rounds.length}</div><div class="echo-pattern-card"><span>${pattern.figures}</span></div><div class="echo-input-switch"><button class="btn soft" id="echoScreen" aria-pressed="true">👏 Repetir com o botão</button><button class="voice-button" id="echoMic" aria-pressed="false">🎙️ Usar microfone</button></div><button class="btn soft echo-listen" id="echoListen">🔊 Ouvir o ritmo</button><div class="echo-tap-wrap"><button class="echo-tap-button" id="tap" aria-label="Repetir o ritmo com palmas"><span aria-hidden="true">👏</span><strong>REPETIR</strong></button></div><p class="echo-mic-status" id="echoMicStatus" role="status" hidden>Microfone ligado. Bata palmas ou toque um instrumento rítmico perto do aparelho, uma batida por vez.</p><p class="helper" id="echoHelp">Primeiro, ouça o exemplo.</p><div class="feedback" role="status"></div><button class="btn" id="checkEcho" disabled>Conferir meu ritmo</button>`);
  updateInput();
  $('#echoScreen').onclick=()=>{stopMic();inputMode='screen';updateInput();$('#echoHelp').textContent='Modo de tela ativo. Toque em Ouvir o ritmo para começar.'};
  $('#echoMic').onclick=async()=>{if(micStream){stopMic();inputMode='screen';updateInput();$('#echoHelp').textContent='Microfone desligado. Você pode repetir com o botão.';return}if(!navigator.mediaDevices?.getUserMedia){$('#echoHelp').textContent='Este navegador não oferece acesso ao microfone nesta página. Abra o site em um endereço seguro (HTTPS).';return}const guard=session;try{const AudioContextClass=window.AudioContext||window.webkitAudioContext;if(!AudioContextClass)throw new Error('audio');micContext=new AudioContextClass();const resume=micContext.resume(),stream=await navigator.mediaDevices.getUserMedia({audio:{channelCount:1,echoCancellation:false,noiseSuppression:false,autoGainControl:false},video:false});if(guard!==session||page!=='echo'){stream.getTracks().forEach(track=>track.stop());return}micStream=stream;await resume;micAnalyser=micContext.createAnalyser();micAnalyser.fftSize=2048;micAnalyser.smoothingTimeConstant=0;micSource=micContext.createMediaStreamSource(stream);micSource.connect(micAnalyser);micBuffer=new Float32Array(micAnalyser.fftSize);micNoiseFloor=.004;micPreviousRms=0;micArmed=false;micQuietFrames=0;inputMode='mic';updateInput();$('#echoHelp').textContent='Microfone pronto. Ouça o ritmo e depois bata palmas ou toque seu instrumento perto do aparelho.';listenMic(guard)}catch(error){stopMic();inputMode='screen';updateInput();$('#echoHelp').textContent=error?.name==='NotAllowedError'?'Permita o acesso ao microfone para usar esta forma de resposta.':'Não consegui iniciar o microfone. Você pode repetir com o botão grande.'}};
  $('#echoListen').onclick=()=>{stopNarration();if(!state.sound){toast('Ative o som no Perfil para ouvir.');return}stopActivityAudio();const guard=session;ready=false;recording=false;taps=[];$('#checkEcho').disabled=true;$('#echoHelp').textContent='Escute o padrão…';micArmed=false;tapSound();pattern.beats.slice(1).forEach(beat=>playbackTimers.push(setTimeout(()=>{if(guard===session&&page==='echo')tapSound()},beat*600)));playbackTimers.push(setTimeout(()=>{if(guard!==session||page!=='echo')return;ready=true;micArmed=true;micQuietFrames=2;$('#echoHelp').textContent=`Sua vez! Repita ${target.length} batidas ${inputMode==='mic'?'com o microfone':'no botão grande'}.`},pattern.beats.at(-1)*600+650))};
  const tapPad=$('#tap');tapPad.addEventListener('dblclick',event=>event.preventDefault());const screenTap=()=>{if(inputMode==='screen')recordBeat(performance.now(),true)};
  if(window.PointerEvent){tapPad.addEventListener('pointerdown',event=>{if(!event.isPrimary||(event.pointerType==='mouse'&&event.button!==0))return;event.preventDefault();screenTap()});tapPad.onclick=event=>{if(event.detail===0)screenTap()}}
  else{let lastTouch=-Infinity;tapPad.addEventListener('touchstart',event=>{if(event.touches.length!==1)return;event.preventDefault();lastTouch=performance.now();screenTap()},{passive:false});tapPad.onclick=()=>{if(performance.now()-lastTouch>700)screenTap()}}
  $('#checkEcho').onclick=()=>{const actual=taps.at(-1),expected=target.at(-1),ratio=actual/expected,normalized=taps.map(time=>time/(ratio||1)),error=normalized.reduce((sum,time,i)=>sum+Math.abs(time-target[i]),0)/target.length;if(error<.20&&ratio>.45&&ratio<2.1){$('.feedback').className='feedback good';$('.feedback').className='feedback good';$('.feedback').innerHTML=`🎉 Muito bem! Você repetiu o ritmo! <button class="btn echo-next game-continue-btn" id="echoNext">Continuar →</button>`;$('#echoNext').onclick=()=>{round++;if(round<rounds.length)draw();else{stopMic();finish('echo','Seu ritmo ganhou vida!','Você repetiu '+rounds.length+' padrões com semínimas, colcheias, semicolcheias e síncopes.')}}}else{$('.feedback').textContent='Quase! Ouça o padrão novamente e tente outra vez.';taps=[];recording=false;ready=false;micArmed=true;$('#checkEcho').disabled=true;$('#echoHelp').textContent='Toque em Ouvir o ritmo para recomeçar.'}};
 }
 draw()
}
function composerGame(){
 const catalog=window.MUSIVERSO_COMPOSER_GAME,levels=[{name:'Primeiras descobertas',ids:['bach','mozart','beethoven'],choices:3},{name:'Novos encontros',ids:['vivaldi','haydn','chopin'],choices:4},{name:'Grande desafio',ids:catalog.map(c=>c.id),choices:6}];
 const shuffle=items=>{const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
 const unlocked=()=>3;
 function menu(){stopNarration();gameShell('Quem compôs?','Ouça a melodia e toque no retrato da pessoa que a criou.',`<p class="helper">Cada nível traz novos compositores e mais retratos para comparar. Seu avanço fica salvo neste aparelho.</p><div class="composer-levels">${levels.map((l,i)=>`<button class="collect-card" data-composer-level="${i}" ${i>=unlocked()?'disabled':''}><span class="chip">${i>=unlocked()?'🔒':(state.composerDone||[]).includes(i)?'⭐ CONCLUÍDO':'🎧 VAMOS OUVIR'}</span><h2>Nível ${i+1}</h2><h3>${l.name}</h3><p>${l.ids.length} melodias · ${l.choices} retratos por pergunta</p><small>${i===0?'Bach, Mozart e Beethoven':i===1?'Vivaldi, Haydn e Chopin':'Os seis compositores juntos'}</small></button>`).join('')}</div>`);document.querySelectorAll('[data-composer-level]').forEach(b=>b.onclick=()=>start(+b.dataset.composerLevel))}
 function start(level){if(gameLevelsOn('composer')&&!enabledGameLevels('composer').includes(level)){gameLevelMenu('composer');return}let round=0;const config=levels[level],order=shuffle(config.ids);
  function complete(){stopNarration();state.composerUnlocked=Math.max(unlocked(),Math.min(3,level+2));state.composerDone=[...new Set([...(state.composerDone||[]),level])];gainXP(20,level===0?'game-composer':'composer-level-'+level);save();chrome();gameShell(`Nível ${level+1} concluído!`,'Você reconheceu novas melodias e seus compositores.',`<div style="font-size:70px">🌟</div><p>${level<2?'O próximo nível está liberado!':'Você completou todos os níveis. Pode jogar novamente com outra ordem!'}</p><div class="toolbar">${level<2?'<button class="btn game-continue-btn" id="nextComposerLevel">Próximo nível →</button>':''}<button class="btn soft" id="composerLevels">Ver níveis</button><button class="btn soft" data-nav="games">Outros jogos</button></div>`);if(level<2)$('#nextComposerLevel').onclick=()=>start(level+1);$('#composerLevels').onclick=()=>game('composer')}
  function draw(){stopNarration();const target=catalog.find(c=>c.id===order[round]),p=people.find(p=>p.id===target.id),pool=level===0?catalog.filter(c=>config.ids.includes(c.id)):catalog;const options=shuffle([target,...shuffle(pool.filter(c=>c.id!==target.id)).slice(0,config.choices-1)]);let locked=false;
   gameShell('Quem compôs?','Ouça a melodia e toque no retrato da pessoa que a criou.',`<button class="text-button" id="backComposerLevels">‹ Escolher nível</button><div class="eyebrow">NÍVEL ${level+1} · MELODIA ${round+1} DE ${order.length}</div><div class="progress"><i style="width:${round/order.length*100}%"></i></div><button class="audio-btn" id="piece" aria-label="Ouvir melodia">▶</button><p class="helper" id="pieceStatus" role="status">Trecho simplificado, tocado com amostras de piano MIDI.</p><div class="answers">${options.map(c=>{const person=people.find(p=>p.id===c.id);return `<button class="answer picture-answer portrait-answer" data-guess="${c.id}" aria-label="Escolher retrato de ${esc(person.name)}">${personImage(person)}<span class="picture-caption">${person.short||person.name}</span></button>`}).join('')}</div><div class="feedback" role="status"></div><button class="text-button" id="hint">PRECISO DE UMA PISTA</button>`);
   $('#backComposerLevels').onclick=()=>game('composer');
   $('#piece').onclick=()=>activityClip('composer-'+target.id,()=>{$('#pieceStatus').textContent='Escutando… Observe os retratos e descubra quem compôs.'},()=>{$('#pieceStatus').textContent='Melodia concluída. Toque para ouvir novamente.'});
   $('#hint').onclick=()=>{stopNarration();$('.feedback').textContent=`Pista: ${target.title}. Explore a história no menu Compositores!`};
   document.querySelectorAll('[data-guess]').forEach(b=>b.onclick=()=>{if(locked)return;if(b.dataset.guess!==target.id){b.classList.add('wrong');$('.feedback').textContent='Experimente outra opção. Cada escuta ajuda!';return}locked=true;stopNarration();b.classList.add('correct');$('.feedback').className='feedback good';$('.feedback').innerHTML=`✨ Muito bem! Você reconheceu ${esc(target.title)}! <a class="source-link" href="${esc(target.source)}" target="_blank" rel="noopener">Consultar a obra ↗</a><button class="btn game-continue-btn" id="composerNext">Continuar →</button>`;$('#composerNext').onclick=()=>{round++;if(round<order.length)draw();else complete()}})
  }draw()
 }start(activeGameLevel??2)
}
function rhythmGame(){
 const tracks=activeGameLevel===null?3:activeGameLevel+1;let pattern=[[true,false,false,false,true,false,false,false],[false,false,true,false,false,false,true,false],[true,false,true,false,true,false,true,false]],playing=false,frame=0,loop=null,revision=0;pattern=pattern.map((row,i)=>i<tracks?row:row.map(()=>false));
 gameShell('Oficina de ritmos','Acenda os quadradinhos para criar sua batida.',`<div class="rhythm-grid">${['Bumbo','Tambor','Sino'].slice(0,tracks).map((x,r)=>`<span class="rhythm-label">${x}</span>${Array.from({length:8},(_,c)=>`<button class="step ${pattern[r][c]?'on':''}" data-r="${r}" data-c="${c}" aria-label="${x}, passo ${c+1}" aria-pressed="${pattern[r][c]}"></button>`).join('')}`).join('')}</div><label for="tempo">Velocidade: <strong id="bpm">100</strong> BPM</label><input id="tempo" type="range" min="60" max="160" value="100" style="display:block;width:100%;margin:20px 0"><div class="toolbar"><button class="btn" id="sequencePlay">▶ Tocar</button><button class="btn soft" id="sequenceSave">⭐ Concluir criação</button></div><p class="helper">Cada quadradinho representa uma divisão do pulso. Experimente deixar espaços de silêncio!</p><p id="sequenceStatus" class="helper" role="status">Escolha os sons e toque em Tocar.</p>`);
 const audio=rhythmAudio;
 const clearBeat=()=>document.querySelectorAll('.step.beat').forEach(b=>b.classList.remove('beat'));
 const highlight=()=>{if(!playing||page!=='rhythm')return;const beat=Math.min(7,Math.floor(audio.currentTime/(loop?.step||.3)));document.querySelectorAll('.step').forEach(b=>b.classList.toggle('beat',+b.dataset.c===beat));frame=requestAnimationFrame(highlight)};
 const stop=()=>{revision++;playing=false;cancelAnimationFrame(frame);audio.pause();audio.onplaying=null;audio.onloadedmetadata=null;audio.onerror=null;audio.removeAttribute('src');audio.load();if(loop){URL.revokeObjectURL(loop.url);loop=null}clearBeat();if(page==='rhythm'&&$('#sequencePlay')){$('#sequencePlay').textContent='▶ Tocar';$('#sequenceStatus').textContent='Ritmo parado.'}};
 stopRhythm=stop;
 const playLoop=(phase=0)=>{const current=++revision;cancelAnimationFrame(frame);audio.pause();const previous=loop;loop=window.MusiversoRhythm.create(pattern,+$('#tempo').value);audio.src=loop.url;audio.loop=true;audio.volume=.9;if(previous)URL.revokeObjectURL(previous.url);audio.onloadedmetadata=()=>{if(current===revision&&phase)audio.currentTime=phase*loop.duration};const failed=()=>{if(current!==revision)return;stop();toast('Não consegui iniciar o ritmo. Toque em Tocar novamente.')};audio.onerror=failed;audio.onplaying=()=>{if(current!==revision)return;$('#sequenceStatus').textContent=pattern.some(row=>row.some(Boolean))?'Tocando seu ritmo. Você pode mudar os quadradinhos!':'Todos os quadradinhos estão apagados: um compasso de silêncio.';cancelAnimationFrame(frame);highlight()};audio.play().catch(failed)};
 document.querySelectorAll('.step').forEach(b=>b.onclick=()=>{const r=+b.dataset.r,c=+b.dataset.c;pattern[r][c]=!pattern[r][c];b.classList.toggle('on',pattern[r][c]);b.setAttribute('aria-pressed',pattern[r][c]);if(playing)playLoop(loop?audio.currentTime/loop.duration:0)});
 $('#tempo').oninput=e=>{$('#bpm').textContent=e.target.value;if(playing)playLoop(loop?audio.currentTime/loop.duration:0)};
 $('#sequencePlay').onclick=()=>{if(playing){stop();return}if(!state.sound){toast('Ative o som no Perfil para ouvir.');return}stopNarration();stopInstrumentAudio();playing=true;$('#sequencePlay').textContent='■ Parar';playLoop()};
 $('#sequenceSave').onclick=()=>{stopRhythm();finish('rhythm','Você criou música!','Sons e silêncios formam o seu ritmo.')};
}
function maestroGame(){const layerCount=activeGameLevel===null?4:activeGameLevel+2;let layers=[true,false,false,false],playing=false,beat=0;gameShell('Maestro por um dia','Escolha quais sons entram na sua música.',`<div class="answers">${[['🥁','Percussão'],['🎸','Baixo'],['🎹','Acordes'],['🪈','Melodia']].slice(0,layerCount).map(([i,n],j)=>`<button class="answer ${layers[j]?'selected':''}" data-layer="${j}" aria-pressed="${layers[j]}"><span class="art">${i}</span>${n}</button>`).join('')}</div><div class="toolbar"><button class="btn" id="maestroPlay">▶ Tocar minha trilha</button><button class="btn soft" id="maestroDone">⭐ Concluir criação</button></div><p class="helper">Ative e desative as camadas enquanto a música toca. Timbres MIDI com amostras de instrumentos.</p>`);document.querySelectorAll('[data-layer]').forEach(b=>b.onclick=()=>{const i=+b.dataset.layer;layers[i]=!layers[i];b.classList.toggle('selected',layers[i]);b.setAttribute('aria-pressed',layers[i])});const tick=()=>{if(!playing||page!=='maestro')return;if(layers[0])tone(45,.18,0,'drum');if(layers[1]&&beat%2===0)tone([48,48,53,55][Math.floor(beat/2)],.4,0,'guitar');if(layers[2]&&beat%4===0)[60,64,67].forEach(n=>tone(n,.8));if(layers[3])tone([72,76,79,76,74,77,79,74][beat],.26,0,'flute');beat=(beat+1)%8;stopTimer=setTimeout(tick,400)};$('#maestroPlay').onclick=()=>{if(!context())return;playing=!playing;$('#maestroPlay').textContent=playing?'■ Parar':'▶ Tocar minha trilha';if(playing)tick();else clearTimeout(stopTimer)};$('#maestroDone').onclick=()=>{playing=false;clearTimeout(stopTimer);finish('maestro','Sua trilha está pronta!','Você combinou camadas para criar música.')}}

function noteSvg(kind){const head=kind==='whole'?'<ellipse cx="40" cy="48" rx="14" ry="9" fill="none" stroke="currentColor" stroke-width="4"/>':`<ellipse cx="34" cy="57" rx="11" ry="7" transform="rotate(-20 34 57)" fill="${kind==='half'?'white':'currentColor'}" stroke="currentColor" stroke-width="3"/><path d="M44 54V12" stroke="currentColor" stroke-width="4"/>${kind==='eighth'?'<path d="M44 13 Q69 26 52 41 Q63 26 44 25" fill="currentColor"/>':''}`;return `<svg viewBox="0 0 80 80" width="80" height="80" aria-hidden="true">${kind==='eighth-rest'?'<path d="M30 31Q42 39 52 20L34 68" fill="none" stroke="currentColor" stroke-width="5"/><circle cx="29" cy="29" r="7"/>':kind==='rest'?'<path d="M36 12L47 27L35 41L48 54Q25 49 34 68Q16 55 31 48L23 38L36 24L30 12Z" fill="currentColor"/>':head}</svg>`}
function figuresPage(){const figures=[['whole','Semibreve',4],['half','Mínima',2],['quarter','Semínima',1],['eighth','Colcheia',.5],['rest','Pausa de semínima',1],['eighth-rest','Pausa de colcheia',.5]].slice(0,activeGameLevel===null?6:[2,4,6][activeGameLevel]);$('#main').innerHTML=`<button class="back" data-nav="games" aria-label="Voltar aos jogos">‹</button><div class="eyebrow">O TEMPO DA MÚSICA</div><h1>Sons e silêncios</h1><p class="lead">As figuras ajudam a escrever quanto tempo um som dura.</p><div class="panel"><h3>Vamos combinar uma regra?</h3><p>Nesta brincadeira, a semínima vale <strong>1 pulso</strong>. A mínima dura 2 pulsos e a semibreve dura 4. Duas colcheias cabem em 1 pulso. A pausa de semínima pede 1 pulso de silêncio; a pausa de colcheia pede meio pulso.</p><p class="helper">Essas relações continuam iguais, mesmo quando mudamos a velocidade. A unidade de tempo pode ser outra em diferentes compassos.</p></div><div class="collect-grid">${figures.map(([kind,n,v],i)=>`<button class="collect-card" data-figure="${i}" aria-pressed="false">${noteSvg(kind)}<h3>${n}</h3><p>${v===.5?'Meio pulso':v+' '+(v===1?'pulso':'pulsos')}${kind.includes('rest')?' de silêncio':''}</p><span class="chip">▶ Experimentar</span></button>`).join('')}</div><div class="panel" style="margin-top:25px;text-align:center"><h3 id="figureStatus" role="status">Escolha uma figura para experimentar.</h3><p class="helper">Você ouvirá uma contagem de quatro pulsos. Depois, o som escolhido começa; o som agudo marca os pulsos e o final da duração. Na pausa, só as marcas de início e fim tocam. Cada pulso dura 0,6 segundo (100 BPM).</p><button class="btn" id="figDone">Concluir descoberta</button></div>`;document.querySelectorAll('[data-figure]').forEach(b=>b.onclick=()=>{const [kind,n,v]=figures[+b.dataset.figure];activityClip('figure-'+kind,()=>{document.querySelectorAll('[data-figure]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));$('#figureStatus').textContent=kind.includes('rest')?'Conte quatro pulsos. Depois, '+(v===.5?'meio pulso':'um pulso')+' de silêncio entre as marcas.':`${n}: conte quatro pulsos e escute ${v===.5?'meio pulso':v+' '+(v===1?'pulso':'pulsos')} de som (${String(v*.6).replace('.',',')} s).`},()=>{b.setAttribute('aria-pressed','false');$('#figureStatus').textContent=`${n}: exemplo concluído. Toque para ouvir novamente.`},()=>{$('#figureStatus').textContent='Toque na figura para tentar ouvir novamente.'})});$('#figDone').onclick=()=>{stopNarration();finish('figures','Sons e silêncios descobertos!','Você conheceu as primeiras figuras musicais.')}}


function worksHtml(person){const d=window.MUSIVERSO_LIBRARY.people[person.id];return `<section class="works-section"><div class="eyebrow">ESCUTA COM O INSTRUTOR</div><h2>Vamos ouvir?</h2><p class="helper">Escolha um pequeno trecho e converse sobre o que vocês perceberam.</p>${d.works.map((w,i)=>`<article class="work-card"><div class="work-number">${i+1}</div><div class="work-body"><h3>${esc(w.title)}</h3>${w.credit?`<p class="performer">${esc(w.credit)}</p>`:''}<p>${esc(w.guide)}</p>${w.video?`<div class="work-actions"><button class="voice-button music-button" data-recording="${person.id}:${i}">▶ Reproduzir gravação</button><a class="voice-button external-listen" href="https://www.youtube.com/watch?v=${w.video}${w.start?'&t='+w.start+'s':''}" target="_blank" rel="noopener">Abrir na fonte ↗</a></div><div class="recording-slot" data-slot="${person.id}:${i}"></div>`:`<span class="recommendation-tag">🎧 Indicação de escuta</span><a class="source-link" href="${esc(w.source)}" target="_blank" rel="noopener">Consultar obra e referências ↗</a>`}</div></article>`).join('')}<p class="helper">Os vídeos são reproduzidos pelo YouTube e podem ter anúncios ou restrições do provedor. Se o player não carregar, use “Abrir na fonte”.</p></section>`}
function openPerson(id){stopInstrumentAudio();const p=people.find(x=>x.id===id),d=window.MUSIVERSO_LIBRARY?.people[id];if(!p||!d)return;stopNarration();modal(`<div class="detail-top"><span class="eyebrow">CONHECER · LER · OUVIR</span><h1>${esc(p.name)}</h1><p class="lead">${esc(p.era)} · ${esc(d.years)}</p></div><div class="detail-hero"><div><button class="detail-image" data-enlarge="assets/people/${id}.jpg" data-image-title="${esc(p.name)}" aria-label="Ampliar retrato de ${esc(p.name)}">${personImage(p)}<span>⌕ Só imagem · ampliar</span></button><button class="voice-button" data-say="${esc(p.name+'. '+p.desc)}">🔊 Ouvir resumo</button></div><section class="reading-story"><span class="reading-label">PARA LER COM O ALUNO</span><h2>Uma breve história</h2><p>${esc(d.story)}</p><div class="conversation"><strong>💬 Vamos conversar?</strong><p>${esc(d.question)}</p></div><a class="source-link" href="${esc(d.source)}" target="_blank" rel="noopener">Saiba mais e consulte a referência ↗</a></section></div>${worksHtml(p)}`,{wide:true,title:'História e obras de '+p.name})}
function openInstrument(i){stopInstrumentAudio();const x=instruments[i],d=window.MUSIVERSO_LIBRARY?.instruments[x?.type];if(!x||!d)return;stopNarration();const src='assets/instruments/'+(x.type==='guitar'?'guitar.png':x.type+'.jpg');modal(`<div class="detail-top"><span class="eyebrow">VEJA DE PERTO</span><h1>${esc(x.name)}</h1><p class="lead">Uma imagem para observar. Uma história para compartilhar.</p></div><div class="detail-hero"><div><button class="detail-image instrument-detail" data-enlarge="${src}" data-image-title="${esc(x.name)}" aria-label="Ampliar fotografia de ${esc(x.name)}">${instrumentImage(x)}<span>⌕ Só imagem · ampliar</span></button><div class="work-actions"><button class="voice-button" data-say="${esc(x.name+'. '+x.desc)}">🔊 Ouvir resumo</button><button class="voice-button music-button" data-play-instrument="${i}">♫ Ouvir exemplo</button><button class="voice-button" data-stop-instrument>■ Parar som</button></div></div><section class="reading-story"><span class="reading-label">PARA LER COM O ALUNO</span><h2>De onde vem esse som?</h2><p>${esc(d.story)}</p><div class="conversation"><strong>💬 Experimente com o aluno</strong><p>${esc(d.question)}</p></div><p class="listening-tip">🎧 ${esc(d.example)}</p>${x.type==='drum'?'<p class="helper">O exemplo usa um timbre MIDI de tambor. A fotografia mostra um djembê.</p>':''}<a class="source-link" href="${esc(d.source)}" target="_blank" rel="noopener">Consultar referência ↗</a></section></div>`,{wide:true,title:'História do instrumento '+x.name})}
function openImage(src,title){suspendHomeExplore();stopNarration();imageOpener=document.activeElement;let layer=$('#imageViewer');if(!layer){layer=document.createElement('div');layer.id='imageViewer';layer.className='overlay image-overlay';document.body.append(layer)}layer.hidden=false;layer.innerHTML=`<div class="image-dialog" role="dialog" aria-modal="true" aria-label="Imagem ampliada de ${esc(title)}"><div class="image-toolbar"><strong>${esc(title)}</strong><button class="voice-button" data-image-zoom aria-pressed="false">＋ Ampliar</button><button class="voice-button" data-close-image aria-label="Fechar imagem ampliada">✕ Voltar à leitura</button></div><div class="image-stage" tabindex="0" aria-label="Imagem ampliada; use a rolagem ao aproximar"><img src="${esc(src)}" alt="${esc(title)}"></div></div>`;$('#modal .dialog')?.setAttribute('aria-hidden','true');layer.onclick=e=>{if(e.target===layer)closeImage()};layer.querySelector('[data-close-image]').focus()}
function closeImage(){const layer=$('#imageViewer');if(!layer||layer.hidden)return;layer.hidden=true;layer.innerHTML='';$('#modal .dialog')?.removeAttribute('aria-hidden');imageOpener?.focus?.();resumeHomeExplore()}
function playRecording(key){stopInstrumentAudio();const [id,num]=key.split(':'),w=window.MUSIVERSO_LIBRARY?.people[id]?.works[+num];if(!w?.video||!/^[-_a-zA-Z0-9]{11}$/.test(w.video))return;stopNarration();if(audioCtx){audioCtx.close().catch(()=>{});audioCtx=null}document.querySelectorAll('.recording-slot').forEach(s=>s.innerHTML='');const slot=[...document.querySelectorAll('[data-slot]')].find(s=>s.dataset.slot===key);if(!slot)return;slot.innerHTML=`<div class="video-frame"><iframe src="https://www.youtube-nocookie.com/embed/${w.video}?autoplay=1&playsinline=1&rel=0${w.start?'&start='+w.start:''}" title="${esc(w.title+' — '+w.credit)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div><button class="text-button" data-stop-recording>■ Fechar reprodução</button>`;slot.scrollIntoView({block:'nearest',behavior:state.reduced?'auto':'smooth'})}

document.addEventListener('click',e=>{const composerPiano=e.target.closest('[data-piano-composer]');if(composerPiano){go('piano');const piece=pianoPieces().find(x=>x.composerId===composerPiano.dataset.pianoComposer);if(piece)openPianoPiece(piece.id);return}if(e.target.closest('[data-stop-instrument]')){stopInstrumentAudio();return}const person=e.target.closest('[data-person]'),instrument=e.target.closest('[data-instrument-info]'),enlarge=e.target.closest('[data-enlarge]'),closeImg=e.target.closest('[data-close-image]'),zoom=e.target.closest('[data-image-zoom]'),record=e.target.closest('[data-recording]'),stopRecord=e.target.closest('[data-stop-recording]'),playInst=e.target.closest('[data-play-instrument]');if(person){openPerson(person.dataset.person);return}if(instrument){openInstrument(+instrument.dataset.instrumentInfo);return}if(enlarge){openImage(enlarge.dataset.enlarge,enlarge.dataset.imageTitle);return}if(closeImg){closeImage();return}if(zoom){const on=$('#imageViewer .image-stage').classList.toggle('zoomed');zoom.setAttribute('aria-pressed',on);zoom.textContent=on?'－ Afastar':'＋ Ampliar';return}if(record){playRecording(record.dataset.recording);return}if(stopRecord){document.querySelectorAll('.recording-slot').forEach(s=>s.innerHTML='');return}if(playInst){playInstrument(+playInst.dataset.playInstrument);return}const say=e.target.closest('[data-say]'),read=e.target.closest('[data-read-screen]'),stop=e.target.closest('[data-stop-voice]'),auto=e.target.closest('[data-auto-voice]'),music=e.target.closest('[data-music]');if(say){speak(say.dataset.say);return}if(read){voiceReady=true;readScreen();return}if(stop){stopNarration();return}if(auto){voiceReady=true;state.narration=!state.narration;save();auto.setAttribute('aria-pressed',state.narration);auto.classList.toggle('enabled',state.narration);auto.textContent=state.narration?'✓ Voz automática':'Ativar voz automática';if(state.narration)speak('Voz automática ativada. Eu vou ler as instruções e contar as histórias para você.');else stopNarration();return}if(music){melody(composers[+music.dataset.music].melody);return}const nav=e.target.closest('[data-nav]'),l=e.target.closest('[data-lesson]'),g=e.target.closest('[data-game]');if(nav){stopNarration();go(nav.dataset.nav)}else if(l)lesson(+l.dataset.lesson,+(l.dataset.storyPart||0));else if(g)game(g.dataset.game)});
window.addEventListener('pagehide',()=>{stopConcert();stopInstrumentAudio();stopNarration();clearTimeout(stopTimer);if(audioCtx)audioCtx.close().catch(()=>{});if('speechSynthesis'in window)speechSynthesis.cancel()});window.MusiversoMedals?.sync();try{localStorage.setItem((window.MusiversoProgressKey||'musiverso-kids-v1'),JSON.stringify(state))}catch{}go('home');


