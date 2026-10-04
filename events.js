'use strict';
const A={};
A.nav=el=>{S.view=el.dataset.v;render(true)};
A.closeModal=(el,e)=>{if(el.classList.contains('ovl')&&e.target!==el)return;closeModal()};
A.confirmYes=()=>{const f=pendingConfirm;pendingConfirm=null;closeModal();if(f)f()};
A.goAtt=el=>{S.ui.attGroup=el.dataset.id;S.ui.attDate=todayStr;S.view='att';render(true)};
A.newLead=()=>leadForm();
A.openLead=el=>leadForm(el.dataset.id);
A.mvLead=el=>{
const l=S.leads.find(x=>x.id===el.dataset.id);if(!l)return;
const dir=+el.dataset.dir;
if(l.stage==='yoqotildi'){moveLead(l.id,'aloqa');return}
const i=FLOW.indexOf(l.stage)+dir;
if(i>=0&&i<FLOW.length)moveLead(l.id,FLOW[i]);
};
function moveLead(id,stage){
const l=S.leads.find(x=>x.id===id);if(!l||l.stage===stage)return;
if(stage==='yozildi'&&!l.studentId){convertForm(id);return}
l.stage=stage;render();
}
A.saveLead=el=>{
const name=val('lName'),ph=val('lPhone');
if(!name)return fail('Ism kiritilmagan. Ism maydonini toʻldiring.','lName');
if(!phoneOK(ph))return fail('Telefon raqami toʻliq emas. Kamida 9 ta raqam kiriting.','lPhone');
let l;
if(el.dataset.id){l=S.leads.find(x=>x.id===el.dataset.id)}
else{l={id:uid(),created:todayStr};S.leads.push(l)}
Object.assign(l,{name,phone:ph,course:val('lCourse'),source:val('lSource'),note:val('lNote')});
const st=val('lStage');
if(st==='yozildi'&&!l.studentId){l.stage=l.stage||'yangi';closeModal();render();convertForm(l.id);return}
l.stage=st;closeModal();render();toast('Lead saqlandi');
};
A.delLeadAsk=el=>{const id=el.dataset.id;confirmDialog('Leadni oʻchirish','Bu lead butunlay oʻchiriladi. Davom etasizmi?','Oʻchirish',()=>{S.leads=S.leads.filter(x=>x.id!==id);render();toast('Lead oʻchirildi')})};
A.convertLead=el=>convertForm(el.dataset.id);
A.saveConvert=el=>{
const l=S.leads.find(x=>x.id===el.dataset.id);
const gid=val('cGroup');if(!gid)return fail('Boʻsh oʻrinli guruh yoʻq. Avval guruhda joy oching.','cGroup');
const st={id:uid(),name:l.name,phone:l.phone,parent:'',groupId:gid,joined:val('cJoined')||todayStr,discount:Math.min(100,num(val('cDisc'))),status:'faol'};
S.students.push(st);l.stage='yozildi';l.studentId=st.id;
closeModal();render();toast(`${l.name} oʻquvchilar roʻyxatiga qoʻshildi`);
};
A.stFilter=el=>{S.ui.stFilter=el.dataset.v;render()};
A.newStudent=()=>studentForm();
A.editStudent=el=>studentForm(el.dataset.id);
A.saveStudent=el=>{
const name=val('sName'),ph=val('sPhone'),par=val('sParent');
if(!name)return fail('Ism kiritilmagan. Ism maydonini toʻldiring.','sName');
if(!phoneOK(ph))return fail('Telefon raqami toʻliq emas. Kamida 9 ta raqam kiriting.','sPhone');
if(par&&par.replace(/\D/g,'').length>3&&!phoneOK(par))return fail('Ota-ona telefoni toʻliq emas. Toʻldiring yoki boʻsh qoldiring.','sParent');
const joined=val('sJoined');if(!joined)return fail('Boshlagan sanani tanlang.','sJoined');
let s;
if(el.dataset.id)s=student(el.dataset.id);else{s={id:uid()};S.students.push(s)}
Object.assign(s,{name,phone:ph,parent:phoneOK(par)?par:'',groupId:val('sGroup'),joined,discount:Math.min(100,num(val('sDisc')))});
const stt=$('#sStatus')?val('sStatus'):'faol';
s.status=stt;
if(stt==='chiqqan'){if(!s.left)s.left=todayStr}else delete s.left;
closeModal();render();toast('Oʻquvchi saqlandi');
};
A.openStudent=el=>{
const s=student(el.dataset.id);if(!s)return;
const g=group(s.groupId),f=fin(s),a=attStat(s);
const pays=S.payments.filter(p=>p.studentId===s.id).sort((x,y)=>y.date.localeCompare(x.date));
const ar=S.att[s.groupId]||{};
const recs=Object.keys(ar).filter(d=>ar[d][s.id]).sort().reverse().slice(0,10).reverse();
modal(s.name,`
<div class="kv">
<div><span>Guruh</span><b>${esc(g?g.name:'Guruhsiz')}</b></div>
<div><span>Holat</span><b>${s.status==='faol'?'Faol':'Ketgan'}</b></div>
<div><span>Telefon</span><b><a href="tel:${esc(s.phone.replace(/[^\d+]/g,''))}">${esc(s.phone)}</a></b></div>
<div><span>Ota-ona telefoni</span><b>${s.parent?`<a href="tel:${esc(s.parent.replace(/[^\d+]/g,''))}">${esc(s.parent)}</a>`:'Kiritilmagan'}</b></div>
<div><span>Boshlagan sana</span><b>${dFull(s.joined)}</b></div>
<div><span>Oylik narx</span><b>${som(f.monthly)}${s.discount?`, chegirma ${s.discount}%`:''}</b></div>
</div>
<div class="bal"><div><span>Hisoblangan</span><b>${money(f.owed)}</b></div><div><span>Toʻlangan</span><b>${money(f.paid)}</b></div>
<div><span>${f.adv>0?'Avans':'Qarz'}</span><b style="color:${f.debt>0?'var(--anor-d)':f.adv>0?'var(--cobalt)':'var(--turq-d)'}">${money(f.debt||f.adv)}</b></div></div>
<h3 class="sub">Davomat${a.pct==null?'':`, ${a.pct}%`}</h3>
${recs.length?`<div class="dots">${recs.map(d=>{const v=ar[d][s.id];return `<span class="dot ${v}" title="${dText(d)}">${v==='k'?'✓':v==='x'?'✕':'S'}</span>`}).join('')}</div>`:'<p class="hint" style="margin-bottom:16px">Hali davomat belgilanmagan.</p>'}
<h3 class="sub">Oxirgi toʻlovlar</h3>
${pays.length?`<div class="mlist">${pays.slice(0,4).map(p=>`<div class="rw"><div class="gr"><b>${dText(p.date)}</b><small>${esc(p.method)}</small></div><span class="amt">${som(p.amount)}</span></div>`).join('')}</div>`:'<p class="hint" style="margin-bottom:16px">Toʻlov hali yoʻq.</p>'}
<div class="mact">
<button class="btn" data-act="editStudent" data-id="${s.id}">Tahrirlash</button>
${f.debt>0?`<button class="btn" data-act="remind" data-id="${s.id}">Eslatma</button>`:''}
${s.status==='faol'?`<button class="btn pri" data-act="payFor" data-id="${s.id}">Toʻlov qabul qilish</button>`:''}
</div>`);
};
