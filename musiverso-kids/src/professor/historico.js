/* Histórico de frequência dos alunos — somente dados próprios do professor no Musiverso Kids. */
(()=>{
'use strict';
const ATTENDANCE_KEY='musiverso-teacher-demo-attendance';
const STUDENTS_KEY='musiverso-demo-students';
const statuses={presente:'Presente',falta:'Falta',justificada:'Falta justificada'};
const lessons={historia:'História',instrumentos:'Instrumentos',teoria:'Teoria',solfejo:'Solfejo'};
let active=false,studentId='',from='',to='',statusFilter='todos';
const main=()=>document.getElementById('main');
const escaped=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function read(key,fallback){try{const data=JSON.parse(window.TeacherStorage?.getItem(key)||'null');return data&&typeof data==='object'?data:fallback}catch{return fallback}}
function students(){const entries=read(STUDENTS_KEY,[]);return Array.isArray(entries)?entries.filter(s=>s&&typeof s.id==='string'&&typeof s.name==='string'):[]}
function allRecords(id){
 const records=read(ATTENDANCE_KEY,{});
 if(!records||Array.isArray(records))return [];
 return Object.entries(records).flatMap(([key,row])=>{
  if(!row||typeof row!=='object')return [];
  const parts=key.split('|'),recordId=parts[parts.length-1];
  if(recordId!==id||!Object.prototype.hasOwnProperty.call(statuses,row.status))return [];
  const date=typeof row.date==='string'?row.date:parts[0];
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return [];
  return [{key,date,status:row.status,mode:row.mode||parts[parts.length-2]||'',lesson:row.lesson||parts[1]||'',name:row.name||''}];
 }).sort((a,b)=>b.date.localeCompare(a.date)||a.lesson.localeCompare(b.lesson));
}
function periodRecords(items){return items.filter(x=>(!from||x.date>=from)&&(!to||x.date<=to))}
function formatDate(s){const [y,m,d]=s.split('-');return d+'/'+m+'/'+y}
function percent(a,total){return total?Math.round((a/total)*100):null}
function render(){
 if(!active||!main())return;
 const list=students();if(!list.some(s=>s.id===studentId))studentId=list[0]?.id||'';
 const student=list.find(s=>s.id===studentId);
 const records=student?periodRecords(allRecords(student.id)):[];
 const counts={presente:0,falta:0,justificada:0};
 records.forEach(r=>{counts[r.status]++});
 const total=records.length;
 const frequency=percent(counts.presente,total);
 const visible=records.filter(r=>statusFilter==='todos'||r.status===statusFilter);
 document.querySelectorAll('[data-tab]').forEach(btn=>{btn.classList.remove('active');btn.removeAttribute('aria-current')});
 const nav=document.querySelector('[data-history-tab]');nav?.classList.add('active');nav?.setAttribute('aria-current','page');
 main().innerHTML=`<section class="history-workspace">
 <div class="page-intro"><div><span class="eyebrow">ACOMPANHAMENTO INDIVIDUAL</span><h1>Histórico dos alunos</h1><p class="lead">Consulte presenças, faltas e faltas justificadas em cada encontro já registrado.</p></div><span class="pill">Diário de frequência</span></div>
 ${!list.length?`<section class="panel"><h2>Cadastre seu primeiro aluno</h2><p>O histórico aparece depois que você cadastra um aluno e registra uma presença ou falta.</p><button class="btn" data-history-registration>Ir para alunos e horários</button></section>`:`
 <section class="panel"><div class="history-filters">
 <label>Aluno <select id="historyStudent">${list.map(s=>`<option value="${escaped(s.id)}" ${s.id===studentId?'selected':''}>${escaped(s.name)}</option>`).join('')}</select></label>
 <label>De <input type="date" id="historyFrom" value="${escaped(from)}"></label>
 <label>Até <input type="date" id="historyTo" value="${escaped(to)}"></label>
 <label>Situação <select id="historyStatus"><option value="todos" ${statusFilter==='todos'?'selected':''}>Todas</option>${Object.entries(statuses).map(([key,label])=>`<option value="${key}" ${statusFilter===key?'selected':''}>${label}</option>`).join('')}</select></label>
 </div>${from&&to&&from>to?'<p class="history-warning" role="status">A data inicial é posterior à data final. Ajuste o intervalo para ver os encontros.</p>':''}</section>
 <div class="history-summary" aria-label="Resumo de frequência">
 <article><span>Encontros registrados</span><strong>${total}</strong></article>
 <article><span>Presenças</span><strong>${counts.presente}</strong></article>
 <article><span>Faltas</span><strong>${counts.falta}</strong></article>
 <article><span>Faltas justificadas</span><strong>${counts.justificada}</strong></article>
 <article><span>Frequência</span><strong>${frequency===null?'—':frequency+'%'}</strong></article>
 </div>
 <section class="panel"><div class="history-section-header"><div><h2>${escaped(student?.name||'Aluno')}</h2><p class="note">Resumo calculado somente sobre as aulas com presença ou falta registrada no intervalo de datas. Datas sem lançamento não são consideradas faltas.</p></div><div class="actions"><button class="btn soft" type="button" id="historyExport" ${visible.length?'':'disabled'}>↓ Exportar histórico CSV</button><button class="btn soft" type="button" data-history-attendance>Registrar frequência</button></div></div>
 ${visible.length?`<div class="table-wrap"><table class="history-table"><thead><tr><th>DATA</th><th>ENCONTRO</th><th>MODALIDADE</th><th>SITUAÇÃO</th></tr></thead><tbody>${visible.map(r=>`<tr><td>${formatDate(r.date)}</td><td>${escaped(lessons[r.lesson]||r.lesson||'Aula')}</td><td>${r.mode==='individual'?'Individual':r.mode==='turma'?'Turma':escaped(r.mode||'—')}</td><td><span class="history-tag history-${r.status}">${statuses[r.status]}</span></td></tr>`).join('')}</tbody></table></div>`:'<p class="history-empty">Nenhum registro encontrado para este aluno e filtro. As presenças e faltas salvas no Diário de presença aparecerão aqui.</p>'}
 </section>`}
 </section>`;
}
function open(){active=true;window.location.hash='historico';render();window.scrollTo({top:0,behavior:'instant'})}
function close(){if(!active)return;active=false;document.querySelector('[data-history-tab]')?.classList.remove('active')}
function goTab(tab){close();const button=document.querySelector('[data-tab="'+tab+'"]');if(button)button.click();else window.location.hash=tab}
function exportCsv(){
 const student=students().find(s=>s.id===studentId);if(!student)return;
 const entries=periodRecords(allRecords(student.id)).filter(r=>statusFilter==='todos'||r.status===statusFilter);
 if(!entries.length){window.KidsFeedback?.error('Não há registros para exportar neste filtro.');return}
 const csvCell=value=>'"'+String(value??'').replace(/^[=+@-]/,"'").replace(/"/g,'""')+'"';
 const lines=[['Aluno','Data','Encontro','Modalidade','Situação'],...entries.map(r=>[student.name,formatDate(r.date),lessons[r.lesson]||r.lesson,r.mode==='individual'?'Individual':r.mode==='turma'?'Turma':r.mode,statuses[r.status]])];
 const csv='\uFEFF'+lines.map(row=>row.map(csvCell).join(';')).join('\r\n');
 const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
 const link=document.createElement('a');link.href=url;link.download='historico-frequencia-'+student.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')+'.csv';link.click();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
 window.KidsFeedback?.show('Histórico preparado para exportação.','success');
}
document.addEventListener('click',event=>{
 if(event.target.closest('[data-history-tab]')){event.preventDefault();open();return}
 if(event.target.closest('[data-tab],[data-go]')){close();return}
 if(!active)return;
 if(event.target.closest('[data-history-attendance]')){goTab('presenca');return}
 if(event.target.closest('[data-history-registration]')){goTab('cadastro');return}
 if(event.target.closest('#historyExport'))exportCsv();
});
document.addEventListener('change',event=>{
 if(!active)return;
 const el=event.target;
 if(el.id==='historyStudent'){studentId=el.value;render()}
 if(el.id==='historyFrom'){from=el.value;render()}
 if(el.id==='historyTo'){to=el.value;render()}
 if(el.id==='historyStatus'){statusFilter=el.value;render()}
});
window.addEventListener('hashchange',()=>{if(location.hash==='#historico'){active=true;render()}else close()});
window.addEventListener('teacher-refreshed',()=>{if(active)queueMicrotask(render)});
if(location.hash==='#historico')open();
})();