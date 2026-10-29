/* Musiverso Kids — cancioneiro brasileiro: arranjos pedagógicos simplificados
   de cantigas de tradição oral. As alturas e ritmos são adaptações para estudo,
   não transcrições musicológicas de uma variante regional específica. */
(function(){
  'use strict';
  const repertoire=window.MUSIVERSO_PIANO_PIECES;
  if(!Array.isArray(repertoire))return;
  const pitch={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
  const allowed=new Set([.5,1,1.5,2,4]);
  function parse(bars,meter){
    const total=meter[0]*4/meter[1];
    return bars.flatMap((bar,i)=>{
      const notes=bar.split(/\s+/).map(token=>{
        const match=/^([A-G])([3-5]):(0\.5|1\.5|1|2|4)$/.exec(token);
        if(!match)throw Error('Nota ou figura inválida: '+token);
        const beats=Number(match[3]);
        if(!allowed.has(beats))throw Error('Duração não permitida');
        return {midi:(Number(match[2])+1)*12+pitch[match[1]],beats,spelling:match[1]};
      });
      if(Math.abs(notes.reduce((sum,n)=>sum+n.beats,0)-total)>.00001)
        throw Error('Compasso '+(i+1)+' incompleto');
      return notes;
    });
  }
  const defaults={
    composer:'Cancioneiro popular brasileiro',
    composerId:'traditional-brasil',
    key:'C',meter:[4,4],
    license:'Melodia tradicional de circulação oral; arranjo didático original',
    licenseUrl:'https://www.unirio.br/cla/ivl/publicacoes-sueli/livro-cancoes-do-brasil-tomo-7',
    source:'https://www.unirio.br/cla/ivl/publicacoes-sueli/livro-cancoes-do-brasil-tomo-7',
    sourceLabel:'Cancioneiro tradicional brasileiro · arranjo pedagógico Musiverso Kids',
    rhythmScale:1
  };
  const songs=[
    {
      id:'br-ciranda-cirandinha',title:'Ciranda, Cirandinha',level:'Iniciante',bpm:94,
      subtitle:'Cantiga de roda · arranjo de estudo em 8 compassos',
      bars:[
        'C4:1 C4:1 D4:1 E4:1','F4:1 E4:1 D4:1 C4:1',
        'D4:1 E4:1 F4:1 G4:1','G4:2 F4:1 E4:1',
        'G4:1 G4:1 A4:1 G4:1','F4:1 E4:1 D4:1 C4:1',
        'D4:1 F4:1 E4:1 D4:1','C4:4'
      ]
    },
    {
      id:'br-marcha-soldado',title:'Marcha Soldado',level:'Iniciante',bpm:105,
      subtitle:'Cantiga de marcha · versão de estudo em 8 compassos',
      bars:[
        'C4:1 E4:1 G4:1 G4:1','A4:1 G4:1 E4:2',
        'F4:1 F4:1 E4:1 D4:1','E4:2 C4:2',
        'G4:1 G4:1 A4:1 G4:1','F4:1 E4:1 D4:2',
        'E4:1 G4:1 D4:1 B3:1','C4:4'
      ]
    },
    {
      id:'br-sapo-cururu',title:'Sapo Cururu',level:'Iniciante',bpm:78,
      subtitle:'Cantiga folclórica · versão de estudo em 8 compassos',
      bars:[
        'G4:1 G4:1 E4:1 E4:1','F4:1 E4:1 D4:2',
        'F4:1 F4:1 D4:1 D4:1','E4:1 D4:1 C4:2',
        'G4:1 G4:1 A4:1 G4:1','F4:1 E4:1 D4:2',
        'E4:1 F4:1 D4:1 B3:1','C4:4'
      ]
    },
    {
      id:'br-cai-cai-balao',title:'Cai, Cai Balão',level:'Intermediário',bpm:92,
      subtitle:'Cantiga junina · arranjo de estudo em 8 compassos',
      bars:[
        'G4:1 G4:1 A4:1 G4:1','E4:1 F4:1 G4:2',
        'A4:1.5 G4:0.5 F4:1 E4:1','D4:2 C4:2',
        'G4:1 G4:1 A4:1 G4:1','E4:1 G4:1 C5:2',
        'B4:1.5 A4:0.5 G4:1 D4:1','C4:4'
      ]
    },
    {
      id:'br-peixe-vivo',title:'Peixe Vivo',level:'Intermediário',bpm:84,
      subtitle:'Cantiga tradicional · versão de estudo em 8 compassos',
      bars:[
        'C4:1 E4:1 G4:1 G4:1','A4:1 G4:1 F4:2',
        'E4:1.5 D4:0.5 E4:1 F4:1','G4:2 E4:2',
        'G4:1 A4:1 G4:1 E4:1','F4:1 E4:1 D4:2',
        'C4:1 D4:1 E4:1 D4:1','C4:4'
      ]
    },
    {
      id:'br-escravos-de-jo',title:'Escravos de Jó',level:'Intermediário',bpm:110,
      subtitle:'Cantiga de brincadeira rítmica · versão em 8 compassos',
      bars:[
        'C4:0.5 D4:0.5 E4:1 E4:1 E4:1','F4:1 E4:1 D4:1 C4:1',
        'E4:0.5 F4:0.5 G4:1 G4:1 G4:1','A4:1 G4:1 F4:1 E4:1',
        'G4:1 E4:1 G4:1 E4:1','F4:1 E4:1 D4:2',
        'C4:1 D4:1 E4:1 D4:1','C4:4'
      ]
    },
    {
      id:'br-o-cravo-e-a-rosa',title:'O Cravo e a Rosa',level:'Iniciante',bpm:82,
      subtitle:'Cantiga tradicional · arranjo de estudo em 8 compassos',
      bars:[
        'C4:1 D4:1 E4:1 F4:1','G4:1 G4:1 E4:2',
        'F4:1 F4:1 E4:1 D4:1','E4:2 C4:2',
        'G4:1 A4:1 G4:1 F4:1','E4:1 F4:1 G4:2',
        'E4:1 D4:1 C4:1 D4:1','C4:4'
      ]
    }
  ];
  // A versão anterior tinha melodias inventadas e não correspondia às cantigas.
  // Não permitir tocar nem premiar o aluno por executar uma melodia incorreta.
  // Novas versões só serão ativadas após conferência de alturas e ritmo com partitura.
  const flagged=new Set(songs.map(song=>song.id));
  for(let i=repertoire.length-1;i>=0;i--){
    if(flagged.has(repertoire[i].id))repertoire.splice(i,1);
  }
  window.MUSIVERSO_PIANO_FOLK_REVIEW=songs.map(song=>({
    id:song.id,title:song.title,composer:'Cancioneiro tradicional brasileiro',
    status:'revisao-melodica',level:song.level,
    description:'A partitura anterior foi retirada por não reproduzir fielmente a cantiga. Em revisão para garantir notas e ritmo corretos.',
    source:song.id==='br-ciranda-cirandinha'?
      'https://www.unirio.br/cla/ivl/publicacoes/cancoes_do_brasil_tomo1.pdf':
      song.id==='br-sapo-cururu'?
      'https://www.teses.usp.br/teses/disponiveis/27/27158/tde-08032013-110447/publico/LIUMANYING.pdf':
      'https://cantigasderoda.com.br/albuns/'
  }));
  /* Asa Branca: Luiz Gonzaga / Humberto Teixeira (1947).
     A obra NÃO está em domínio público. Não inserir notas ou áudio sem licença. */
  window.MUSIVERSO_PIANO_LICENSED_PENDING=[{
    id:'br-asa-branca',title:'Asa Branca',
    composer:'Luiz Gonzaga e Humberto Teixeira',
    description:'Clássico do baião pernambucano. Partitura interativa e reprodução aguardam autorização dos titulares.',
    source:'https://discografiabrasileira.com.br/fonograma/76278/asa-branca'
  }];
})();
