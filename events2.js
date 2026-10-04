'use strict';
A.newGroup=()=>groupForm();
A.editGroup=el=>groupForm(el.dataset.id);
A.saveGroup=el=>{
const name=val('gName'),course=val('gCourse'),teacher=val('gTeacher');
if(!name)return fail('Guruh nomi kiritilmagan.','gName');
if(!course)return fail('Kursni kiriting yoki roʻyxatdan tanlang.','gCourse');
if(!teacher)return fail('Ustoz ismini kiriting.','gTeacher');
const days=[...document.querySelectorAll('#mdl input[name=day]:checked')].map(i=>+i.value);
if(!days.length)return fail('Kamida bitta dars kunini tanlang.');
const price=num(val('gPrice'));if(price<=0)return fail('Oylik narxni kiriting.','gPrice');
const cap=num(val('gCap'));if(cap<1)return fail('Oʻrinlar soni kamida 1 boʻlishi kerak.','gCap');
if(!val('gTime'))return fail('Boshlanish vaqtini tanlang.','gTime');
let g;
if(el.dataset.id)g=group(el.dataset.id);else{g={id:uid()};S.groups.push(g)}
Object.assign(g,{name,course,teacher,room:val('gRoom'),days,time:val('gTime'),dur:+val('gDur'),price,cap});
closeModal();render();toast('Guruh saqlandi');
};
A.openGroup=el=>{
const g=group(el.dataset.id);if(!g)return;
const all=S.students.filter(s=>s.groupId===g.id&&s.status==='faol').sort(byName);
modal(g.name,`
<div class="kv">
<div><span>Kurs</span><b>${esc(g.course)}</b></div><div><span>Ustoz</span><b>${esc(g.teacher)}</b></div>
<div><span>Jadval</span><b>${g.days.slice().sort((a,b)=>(a||7)-(b||7)).map(d=>WDS[d]).join(', ')}, ${g.time}–${endT(g)}</b></div>
<div><span>Oylik narx</span><b>${som(g.price)}</b></div>
</div>
<h3 class="sub">Oʻquvchilar (${all.length} / ${g.cap})</h3>
${all.length?`<div class="mlist">${all.map(s=>{const f=fin(s);return `<div class="rw" data-act="openStudent" data-id="${s.id}" tabindex="0" style="cursor:pointer">${av(s.name)}<div class="gr"><b>${esc(s.name)}</b></div>${balPill(f,s)}</div>`}).join('')}</div>`:'<p class="hint" style="margin-bottom:16px">Guruhda hali oʻquvchi yoʻq.</p>'}
<div class="mact">
<button class="btn danger" data-act="delGroupAsk" data-id="${g.id}">Oʻchirish</button>
<button class="btn" data-act="editGroup" data-id="${g.id}">Tahrirlash</button>
<button class="btn pri" data-act="goAtt" data-id="${g.id}">Davomat</button>
</div>`);
};
A.delGroupAsk=el=>{
const g=group(el.dataset.id);
if(S.students.some(s=>s.groupId===g.id)){closeModal();toast('Guruhda oʻquvchilar bor. Avval ularni boshqa guruhga oʻtkazing.');return}
confirmDialog('Guruhni oʻchirish',`“${esc(g.name)}” guruhi oʻchiriladi. Davom etasizmi?`,'Oʻchirish',()=>{S.groups=S.groups.filter(x=>x.id!==g.id);delete S.att[g.id];render();toast('Guruh oʻchirildi')});
};
A.setAtt=el=>{
const gid=S.ui.attGroup,d=S.ui.attDate;if(d>todayStr)return;
S.att[gid]=S.att[gid]||{};S.att[gid][d]=S.att[gid][d]||{};
const r=S.att[gid][d],sid=el.dataset.s,v=el.dataset.v;
if(r[sid]===v)delete r[sid];else r[sid]=v;
render();
};
A.allCame=()=>{
const gid=S.ui.attGroup,d=S.ui.attDate;
S.att[gid]=S.att[gid]||{};S.att[gid][d]=S.att[gid][d]||{};
S.students.filter(s=>s.groupId===gid&&s.status==='faol'&&s.joined<=d).forEach(s=>{if(!S.att[gid][d][s.id])S.att[gid][d][s.id]='k'});
render();toast('Belgilanmaganlar “Keldi” deb qoʻyildi');
};
A.attDay=el=>{
const v=el.dataset.v;
let d=v==='today'?TODAY:addDays(parse(S.ui.attDate),+v);
if(d>TODAY)d=TODAY;
S.ui.attDate=ymd(d);render();
};
A.attPick=el=>{S.ui.attDate=el.dataset.v;render(true)};
A.payTab=el=>{S.ui.payTab=el.dataset.v;render()};
A.payFor=el=>payForm(el.dataset.id||'');
A.savePay=()=>{
const sid=val('payStudent'),amount=num(val('amt')),date=val('payDate');
if(!sid||!student(sid))return fail('Oʻquvchini tanlang.','payStudent');
if(amount<=0)return fail('Summa kiritilmagan. Toʻlov summasini yozing.','amt');
if(!date||date>todayStr)return fail('Sana bugundan keyin boʻlishi mumkin emas.','payDate');
const m=document.querySelector('#mdl input[name=method]:checked');
S.payments.push({id:uid(),studentId:sid,amount,method:m?m.value:'Naqd',date,note:val('payNote')});
closeModal();render();toast(`Toʻlov qabul qilindi: ${som(amount)}`);
};
A.delPayAsk=el=>{
const p=S.payments.find(x=>x.id===el.dataset.id);if(!p)return;
const s=student(p.studentId);
confirmDialog('Toʻlovni bekor qilish',`${esc(s?s.name:'')} uchun ${som(p.amount)} toʻlov (${dText(p.date)}) bekor qilinadi. Qarz qayta hisoblanadi.`,'Bekor qilish',()=>{S.payments=S.payments.filter(x=>x.id!==p.id);render();toast('Toʻlov bekor qilindi')});
};
A.remind=el=>{
const s=student(el.dataset.id);if(!s)return;
modal('Qarz haqida eslatma',`<p style="color:var(--ink2);margin-bottom:12px">${esc(s.name)} uchun tayyor matn. Nusxalab SMS yoki Telegram orqali yuboring.</p>
<textarea id="msg" class="msgbox" aria-label="Eslatma matni">${esc(remindText(s))}</textarea>
<div class="mact" style="margin-top:12px"><button class="btn" data-act="closeModal">Yopish</button><button class="btn pri" data-act="copyMsg">Matnni nusxalash</button></div>`);
};
A.copyMsg=async()=>{
const t=$('#msg');
try{await navigator.clipboard.writeText(t.value);toast('Matn nusxalandi')}
catch(e){t.focus();t.select();try{document.execCommand('copy');toast('Matn nusxalandi')}catch(_){toast('Matnni qoʻlda belgilab nusxalang')}}
};
const resetUi=()=>{S.ui.stQ='';S.ui.stGroup='all';S.ui.stFilter='active';S.ui.payQ='';S.ui.payTab='debt';S.ui.attDate=todayStr;fixAtt()};
A.demoAsk=()=>confirmDialog('Demo maʼlumotlarni yuklash','Hozirgi barcha maʼlumotlar oʻrniga demo maʼlumotlar yoziladi. Davom etasizmi?','Yuklash',()=>{Object.assign(S,seed());resetUi();S.view='home';render(true);toast('Demo maʼlumotlar yuklandi')});
A.clearAsk=()=>confirmDialog('Maʼlumotni tozalash','Barcha guruh, oʻquvchi, lead va toʻlovlar oʻchiriladi. Bu amalni qaytarib boʻlmaydi.','Hammasini oʻchirish',()=>{Object.assign(S,emptyData());resetUi();S.view='home';render(true);toast('Maʼlumotlar tozalandi')});
A.logout=()=>logout();
A.retry=()=>{started=false;startApp()};
document.addEventListener('click',e=>{
if(e.target.closest('a[href]'))return;
const el=e.target.closest('[data-act]');if(!el||el.disabled)return;
const f=A[el.dataset.act];if(f)f(el,e);
});
document.addEventListener('keydown',e=>{
if(e.key==='Escape'&&$('#mroot').firstChild){closeModal();return}
if((e.key==='Enter'||e.key===' ')&&e.target.matches&&e.target.matches('[data-act][tabindex]')){
e.preventDefault();e.target.click();
}
});
document.addEventListener('input',e=>{
const t=e.target;
if(t.id==='stQ'){S.ui.stQ=t.value;$('#stList').innerHTML=stRows()}
else if(t.id==='payQ'){S.ui.payQ=t.value;$('#payList').innerHTML=payList()}
else if(t.id==='amt'){const n=num(t.value);const h=$('#amtFmt');if(h)h.textContent=n?som(n):''}
});
document.addEventListener('change',e=>{
const t=e.target;
if(t.id==='stGroup'){S.ui.stGroup=t.value;$('#stList').innerHTML=stRows()}
else if(t.id==='attGroup'){S.ui.attGroup=t.value;render()}
else if(t.id==='attDate'){let v=t.value||todayStr;if(v>todayStr)v=todayStr;S.ui.attDate=v;render()}
else if(t.id==='payStudent'){
const s=student(t.value);if(!s)return;const f=fin(s);
$('#payHint').textContent=hintFor(f);
const a=f.debt||f.monthly;$('#amt').value=a?money(a):'';
$('#amtFmt').textContent=a?som(a):'';
}
});
document.addEventListener('dragstart',e=>{
const c=e.target.closest&&e.target.closest('.lead');if(!c)return;
e.dataTransfer.setData('text/plain',c.dataset.id);e.dataTransfer.effectAllowed='move';c.classList.add('drag');
});
document.addEventListener('dragend',()=>{document.querySelectorAll('.drag,.over').forEach(n=>n.classList.remove('drag','over'))});
document.addEventListener('dragover',e=>{const z=e.target.closest&&e.target.closest('[data-drop]');if(z){e.preventDefault();z.classList.add('over')}});
document.addEventListener('dragleave',e=>{const z=e.target.closest&&e.target.closest('[data-drop]');if(z&&!z.contains(e.relatedTarget))z.classList.remove('over')});
document.addEventListener('drop',e=>{
const z=e.target.closest&&e.target.closest('[data-drop]');if(!z)return;
e.preventDefault();z.classList.remove('over');
const id=e.dataTransfer.getData('text/plain');if(id)moveLead(id,z.dataset.drop);
});
