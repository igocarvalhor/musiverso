/* Consistent Kids teacher feedback for local saves, cloud sync and removals. */
(()=>{
'use strict';
let timer,sequence=0;
function show(message,type='success'){
 const root=document.getElementById('kidsFeedback');if(!root)return;
 const symbol={success:'✓',info:'◷',error:'!',delete:'✓'}[type]||'✓';
 const glyph=root.querySelector('.kids-feedback-icon'),text=root.querySelector('.kids-feedback-text');
 glyph.textContent=symbol;text.textContent=message;
 root.dataset.type=type;root.hidden=false;root.classList.add('visible');
 clearTimeout(timer);const current=++sequence;
 timer=setTimeout(()=>{if(current===sequence){root.classList.remove('visible');root.hidden=true}},5200);
}
window.KidsFeedback={show,savedLocal:(label='Alteração')=>show(label+' salvo neste dispositivo. Sincronização pendente.','info'),synced:()=>show('Alterações sincronizadas com sucesso na sua conta.','success'),error:(message='Não foi possível salvar. Tente novamente.')=>show(message,'error'),deleted:(label='Item')=>show(label+' removido neste dispositivo. Sincronização pendente.','delete')};
})();
