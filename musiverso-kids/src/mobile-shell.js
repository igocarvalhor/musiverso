/* Reduce accidental navigation without trapping browser history or blocking multitouch. */
(function(){
'use strict';
const standalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
let start=null,installPrompt=null;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e});
window.addEventListener('appinstalled',()=>{installPrompt=null});
document.addEventListener('touchstart',e=>{
 if(e.touches.length!==1){start=null;return}
 const t=e.touches[0],edge=24;
 start=t.clientX<=edge||t.clientX>=innerWidth-edge?{x:t.clientX,y:t.clientY,target:e.target}:null;
},{passive:true});
document.addEventListener('touchmove',e=>{
 if(!start||e.touches.length!==1)return;
 const dx=e.touches[0].clientX-start.x,dy=e.touches[0].clientY-start.y;
 if(Math.abs(dx)<10||Math.abs(dx)<=Math.abs(dy))return;
 // Preserve actual horizontal scrolling (piano keyboards, tables, carousels).
 for(let el=start.target;el&&el!==document.body;el=el.parentElement){
  if(el.scrollWidth>el.clientWidth+2&&/auto|scroll/.test(getComputedStyle(el).overflowX)){
   const remaining=el.scrollWidth-el.clientWidth-el.scrollLeft;
   if((dx<0&&remaining>1)||(dx>0&&el.scrollLeft>1))return;
  }
 }
 if(e.cancelable)e.preventDefault();
},{passive:false});
for(const event of ['touchend','touchcancel'])document.addEventListener(event,()=>{start=null},{passive:true});
window.MusiversoInstall=async function(){
 if(installPrompt){const prompt=installPrompt;installPrompt=null;await prompt.prompt();return}
 const dialog=document.createElement('dialog');dialog.className='install-dialog';
 const title=document.createElement('h2');title.textContent=standalone()?'Você já está no aplicativo':'Abrir como aplicativo';
 const text=document.createElement('p');
 const apple=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
 text.textContent=standalone()?'Use Sair da conta no Perfil para encerrar sua sessão. Para fechar o aplicativo, use os gestos do aparelho.':apple?'No Safari, toque em Compartilhar → Adicionar à Tela de Início. Ative Abrir como App, se aparecer, e toque em Adicionar. Depois, abra o Musiverso pelo novo ícone.':'No menu do navegador, escolha Instalar aplicativo ou Adicionar à tela inicial. Depois, abra o Musiverso pelo novo ícone.';
 const note=document.createElement('p');note.className='helper';note.textContent='O modo aplicativo reduz saídas acidentais pela navegação do navegador. Os gestos do sistema continuam disponíveis. Ao abrir pelo ícone, entre com a mesma conta para carregar o progresso sincronizado. Antes de trocar de aparelho, confira a sincronização no Perfil.';
 const close=document.createElement('button');close.textContent='Entendi';close.type='button';close.onclick=()=>dialog.close();dialog.append(title,text,note,close);document.body.append(dialog);dialog.addEventListener('close',()=>dialog.remove(),{once:true});dialog.showModal();close.focus();
};
})();
