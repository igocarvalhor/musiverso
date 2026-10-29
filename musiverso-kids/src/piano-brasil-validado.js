/* Partitura conferida visualmente: Cai, Cai, Balão (cantiga tradicional).
 * Fonte: Tania C. F. S. Rossetto, 2008, ANEXO D I, pág. 95 da monografia.
 * https://bvsms.saude.gov.br/bvs/publicacoes/premio2008/tania_rosseto.pdf
 * As alturas e relações rítmicas foram transcritas da partitura (em sol maior).
 * Os valores foram DOBRADOS (2/4 -> 4/4) somente para substituir semicolcheias
 * por colcheias no piano infantil, preservando as proporções originais.
 * O compasso de anacruse tem 1 tempo no arranjo dobrado.
 */
(function(){
  'use strict';
  const pieces=window.MUSIVERSO_PIANO_PIECES;
  if(!Array.isArray(pieces))return;
  const pitches={G4:67,A4:69,B4:71,C5:72,D5:74,E5:76};
  function note(token){
    const [spelling,beatText,flag]=token.split(':');
    const beats=Number(beatText);
    if(!Object.prototype.hasOwnProperty.call(pitches,spelling)||
        ![0.5,1,1.5,2,4].includes(beats))
      throw Error('Partitura de Cai, Cai, Balão: nota ou figura inválida '+token);
    const n={midi:pitches[spelling],beats,spelling:spelling.slice(0,1)};
    if(flag==='next')n.tieNext=true;
    if(flag==='prev')n.tiePrevious=true;
    return n;
  }
  const bars=[
    ['D5:1'], // anacruse: colcheia original
    ['D5:1.5','C5:0.5','B4:1','D5:1'],
    ['D5:1.5','C5:0.5','B4:1','D5:1'],
    ['E5:1','D5:1','C5:1','B4:1'],
    ['A4:2:next','A4:1:prev','A4:0.5','B4:0.5'],
    ['C5:1','A4:0.5','B4:0.5','C5:1','A4:0.5','B4:0.5'],
    ['C5:2','D5:1','E5:1'],
    ['D5:1','C5:1','B4:1','A4:1'],
    ['G4:4']
  ];
  bars.forEach((bar,i)=>{
    const sum=bar.reduce((n,s)=>n+Number(s.split(':')[1]),0);
    if(sum!==(i===0?1:4))throw Error('Compasso inválido: '+i+' total '+sum);
  });
  const song={
    id:'br-cai-cai-balao',
    composerId:'traditional-brasil',
    composer:'Folclore brasileiro',
    title:'Cai, Cai, Balão',
    subtitle:'Melodia transcrita de partitura · 8 compassos + anacruse · ritmo proporcional preservado',
    level:'Intermediário',
    bpm:110,meter:[4,4],pickupBeats:1,key:'G',
    notes:bars.flatMap(bar=>bar.map(note)),
    source:'https://bvsms.saude.gov.br/bvs/publicacoes/premio2008/tania_rosseto.pdf',
    sourceLabel:'Rossetto (2008) · Anexo D I, p. 95 · Cai, Cai, Balão',
    sourceCredit:'Transcrição da linha melódica publicada no Anexo D I da monografia de Tania C. F. S. Rossetto (2008). A tonalidade é sol maior; as durações são duplicadas para permitir que semicolcheias da fonte sejam representadas como colcheias na atividade. Não houve troca das alturas ou das proporções rítmicas. Anacruse preservada.',
    license:'Cantiga tradicional · transcrição pedagógica própria',
    licenseUrl:'https://creativecommons.org/publicdomain/mark/1.0/',
    scope:'Melodia completa da edição consultada',
    rhythmScale:2
  };
  const old=pieces.findIndex(p=>p.id===song.id);
  if(old>=0)pieces.splice(old,1);
  pieces.push(song);
  if(Array.isArray(window.MUSIVERSO_PIANO_FOLK_REVIEW)){
    window.MUSIVERSO_PIANO_FOLK_REVIEW=
      window.MUSIVERSO_PIANO_FOLK_REVIEW.filter(p=>p.id!==song.id);
  }
})();


/* Escravos de Jó — transcrição da melodia do Anexo G I, p. 99 da mesma fonte.
   A fonte usa 2/4, com anacruse de uma colcheia. Durações dobradas para
   o estudo em 4/4 sem perder o ritmo proporcional. Ligaduras de expressão
   entre alturas DIFERENTES não são representadas como ligaduras de duração. */
(function(){
  const pieces=window.MUSIVERSO_PIANO_PIECES;
  const midi={C4:60,D4:62,E4:64,F4:65,G4:67,A4:69,B4:71,C5:72,D5:74,E5:76};
  const bars=[
    ['G4:1'],
    ['C5:2','B4:1','A4:1'],
    ['G4:3','A4:1'],
    ['G4:1','A4:1','G4:1','F4:1'],
    ['E4:4'],
    ['G4:2','E4:2'],
    ['G4:2','E4:2'],
    ['E5:2','E5:1','D5:1'],
    ['C5:2','R:1','G4:1'],
    ['F4:1','E4:1','C4:1','E4:1'],
    ['F4:1','E4:1','C4:1','E4:1'],
    ['F4:1','E4:1','F4:1','G4:1'],
    ['A4:2','R:1','G4:1'],
    ['F4:1','E4:1','C4:1','E4:1'],
    ['F4:1','E4:1','C4:1','E4:1'],
    ['F4:1','E4:1','F4:1','G4:1'],
    ['A4:2','R:1']
  ];
  const notes=bars.flatMap((bar,i)=>{
    const events=bar.map(s=>{
      const [spelling,beatsRaw]=s.split(':');
      const beats=Number(beatsRaw);
      if(![.5,1,1.5,2,4].includes(beats)||!(spelling==='R'||Object.hasOwn(midi,spelling)))
        throw Error('Escravos de Jó: figura ou nota inválida '+s);
      return spelling==='R'?{midi:null,beats}:{midi:midi[spelling],beats,spelling:spelling.slice(0,1)};
    });
    const sum=events.reduce((acc,n)=>acc+n.beats,0);
    if(sum!==(i===0?1:i===bars.length-1?3:4))
      throw Error('Escravos de Jó: erro no compasso '+i+' ('+sum+')');
    return events;
  });
  const song={
    id:'br-escravos-de-jo',
    composerId:'traditional-brasil',composer:'Folclore brasileiro',
    title:'Escravos de Jó',
    subtitle:'Partitura de referência · 16 compassos + anacruse',
    level:'Intermediário',bpm:118,meter:[4,4],pickupBeats:1,key:'C',
    notes,
    source:'https://bvsms.saude.gov.br/bvs/publicacoes/premio2008/tania_rosseto.pdf',
    sourceLabel:'Rossetto (2008) · Anexo G I, p. 99 · Escravos de Jó',
    sourceCredit:'Transcrição do Anexo G I da monografia de Tania C. F. S. Rossetto (2008), preservando alturas, pausas e ritmos proporcionais. Como a fonte usa 2/4 com semicolcheias ocasionais, as durações são duplicadas para o modo didático do piano infantil.',
    license:'Cantiga tradicional · transcrição pedagógica própria',
    licenseUrl:'https://creativecommons.org/publicdomain/mark/1.0/',
    scope:'Melodia da edição consultada · 16 compassos',rhythmScale:2
  };
  const prev=pieces.findIndex(p=>p.id===song.id);
  if(prev>=0)pieces.splice(prev,1);
  pieces.push(song);
  if(Array.isArray(window.MUSIVERSO_PIANO_FOLK_REVIEW))
    window.MUSIVERSO_PIANO_FOLK_REVIEW=window.MUSIVERSO_PIANO_FOLK_REVIEW.filter(x=>x.id!==song.id);
})();
