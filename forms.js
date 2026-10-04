'use strict';
function modal(title,body){
$('#mroot').innerHTML=`<div class="ovl" data-act="closeModal"><div class="mdl" id="mdl" role="dialog" aria-modal="true" aria-label="${esc(title)}" tabindex="-1">
<div class="mh"><h2>${esc(title)}</h2><button class="icb" data-act="closeModal" aria-label="Yopish">${ic('x')}</button></div><div class="mb">${body}</div></div></div>`;
document.body.classList.add('lock');
const first=$('#mdl input:not([type=radio]):not([type=checkbox]),#mdl select,#mdl textarea');
(first||$('#mdl')).focus({preventScroll:true});
}
function closeModal(){$('#mroot').innerHTML='';document.body.classList.remove('lock')}
let tt;
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('show'),2800)}
function fail(msg,id){
const e=$('#err');if(e)e.textContent=msg;
document.querySelectorAll('#mdl [aria-invalid]').forEach(n=>n.removeAttribute('aria-invalid'));
const f=id&&$('#'+id);if(f){f.setAttribute('aria-invalid','true');f.focus()}
}
const val=id=>{const n=$('#'+id);return n?n.value.trim():''};
const num=v=>parseInt(String(v).replace(/\D/g,''),10)||0;
const field=(label,id,inner)=>`<div class="f"><label for="${id}">${label}</label>${inner}</div>`;
const actions=(extra)=>`<p class="err" id="err" role="alert"></p><div class="mact"><button class="btn" data-act="closeModal">Bekor qilish</button>${extra}</div>`;
let pendingConfirm=null;
function confirmDialog(title,text,yes,fn){
pendingConfirm=fn;
modal(title,`<p style="margin-bottom:16px;color:var(--ink2)">${text}</p><div class="mact"><button class="btn" data-act="closeModal">Bekor qilish</button><button class="btn danger" data-act="confirmYes">${yes}</button></div>`);
}
const courses=extra=>{const c=[...new Set(S.groups.map(g=>g.course))];if(extra&&!c.includes(extra))c.push(extra);return c};
function leadForm(id){
const l=id?S.leads.find(x=>x.id===id):{name:'',phone:'+998 ',course:(S.groups[0]||{}).course||'',source:'Instagram',stage:'yangi',note:''};
modal(id?'Lead maʼlumoti':'Yangi lead',`
${field('Ism','lName',`<input id="lName" value="${esc(l.name)}" autocomplete="off">`)}
${field('Telefon','lPhone',`<input id="lPhone" type="tel" inputmode="tel" value="${esc(l.phone)}" autocomplete="off">`)}
<div class="row2">
${field('Qiziqqan kurs','lCourse',`<select id="lCourse">${courses(l.course).map(c=>`<option ${c===l.course?'selected':''}>${esc(c)}</option>`).join('')}</select>`)}
${field('Manba','lSource',`<select id="lSource">${SOURCES.map(c=>`<option ${c===l.source?'selected':''}>${c}</option>`).join('')}</select>`)}
</div>
${field('Bosqich','lStage',`<select id="lStage">${STAGES.map(s=>`<option value="${s.k}" ${s.k===l.stage?'selected':''}>${s.n}</option>`).join('')}</select>`)}
${field('Izoh','lNote',`<textarea id="lNote">${esc(l.note)}</textarea>`)}
${actions(`${id?`<button class="btn danger" data-act="delLeadAsk" data-id="${id}">Oʻchirish</button>`:''}${id&&!l.studentId?`<button class="btn" data-act="convertLead" data-id="${id}">Oʻquvchiga aylantirish</button>`:''}<button class="btn pri" data-act="saveLead" data-id="${id||''}">Saqlash</button>`)}`);
}
function convertForm(id){
const l=S.leads.find(x=>x.id===id);
const gs=[...S.groups].sort((a,b)=>(b.course===l.course)-(a.course===l.course));
const firstOpen=gs.find(g=>activeIn(g.id).length<g.cap);
modal('Oʻquvchiga aylantirish',`
<p style="margin-bottom:14px;color:var(--ink2)"><b style="color:var(--ink)">${esc(l.name)}</b> ${esc(l.course)} kursiga qiziqqan. Guruhni tanlang.</p>
${field('Guruh','cGroup',`<select id="cGroup">${gs.map(g=>{const n=activeIn(g.id).length,full=n>=g.cap;return `<option value="${g.id}" ${full?'disabled':''} ${firstOpen&&g.id===firstOpen.id?'selected':''}>${esc(g.name)} (${n}/${g.cap})${full?', toʻla':''}</option>`}).join('')}</select>`)}
<div class="row2">
${field('Boshlash sanasi','cJoined',`<input type="date" id="cJoined" value="${todayStr}">`)}
${field('Chegirma (%)','cDisc',`<input id="cDisc" inputmode="numeric" value="0">`)}
</div>
${actions(`<button class="btn pri" data-act="saveConvert" data-id="${id}">Oʻquvchi qilish</button>`)}`);
}
function studentForm(id){
const s=id?student(id):{name:'',phone:'+998 ',parent:'',groupId:(S.groups[0]||{}).id,joined:todayStr,discount:0,status:'faol'};
if(!S.groups.length){toast('Avval guruh yarating');return}
modal(id?'Oʻquvchini tahrirlash':'Yangi oʻquvchi',`
${field('Ism familiya','sName',`<input id="sName" value="${esc(s.name)}" autocomplete="off">`)}
<div class="row2">
${field('Telefon','sPhone',`<input id="sPhone" type="tel" inputmode="tel" value="${esc(s.phone)}" autocomplete="off">`)}
${field('Ota-ona telefoni','sParent',`<input id="sParent" type="tel" inputmode="tel" value="${esc(s.parent)}" autocomplete="off">`)}
</div>
${field('Guruh','sGroup',`<select id="sGroup">${S.groups.map(g=>`<option value="${g.id}" ${g.id===s.groupId?'selected':''}>${esc(g.name)}</option>`).join('')}</select>`)}
<div class="row2">
${field('Boshlagan sana','sJoined',`<input type="date" id="sJoined" value="${s.joined}">`)}
${field('Chegirma (%)','sDisc',`<input id="sDisc" inputmode="numeric" value="${s.discount||0}">`)}
</div>
${id?field('Holat','sStatus',`<select id="sStatus"><option value="faol" ${s.status==='faol'?'selected':''}>Faol</option><option value="chiqqan" ${s.status==='chiqqan'?'selected':''}>Ketgan</option></select>`):''}
${actions(`<button class="btn pri" data-act="saveStudent" data-id="${id||''}">Saqlash</button>`)}`);
}
function groupForm(id){
const g=id?group(id):{name:'',course:'',teacher:'',room:'',days:[1,3,5],time:'15:00',dur:90,price:600000,cap:8};
modal(id?'Guruhni tahrirlash':'Yangi guruh',`
${field('Guruh nomi','gName',`<input id="gName" value="${esc(g.name)}" autocomplete="off">`)}
<div class="row2">
${field('Kurs','gCourse',`<input id="gCourse" list="gCourses" value="${esc(g.course)}" autocomplete="off"><datalist id="gCourses">${courses().map(c=>`<option value="${esc(c)}">`).join('')}</datalist>`)}
${field('Ustoz','gTeacher',`<input id="gTeacher" value="${esc(g.teacher)}" autocomplete="off">`)}
</div>
<div class="f"><span class="lab">Dars kunlari</span><div class="chips">${DAY_ORDER.map(d=>`<label class="opt"><input type="checkbox" name="day" value="${d}" ${g.days.includes(d)?'checked':''}><span>${WDS[d]}</span></label>`).join('')}</div></div>
<div class="row2">
${field('Boshlanish vaqti','gTime',`<input type="time" id="gTime" value="${g.time}">`)}
${field('Davomiyligi','gDur',`<select id="gDur">${[45,60,90,120,150].map(m=>`<option value="${m}" ${m===g.dur?'selected':''}>${m} daqiqa</option>`).join('')}</select>`)}
</div>
<div class="row2">
${field('Oylik narx (soʻm)','gPrice',`<input id="gPrice" inputmode="numeric" value="${money(g.price)}">`)}
${field('Oʻrinlar soni','gCap',`<input id="gCap" inputmode="numeric" value="${g.cap}">`)}
</div>
${field('Xona','gRoom',`<input id="gRoom" value="${esc(g.room)}" autocomplete="off">`)}
${actions(`<button class="btn pri" data-act="saveGroup" data-id="${id||''}">Saqlash</button>`)}`);
}
function hintFor(f){
if(!f)return '';
return f.debt>0?`Qarz: ${som(f.debt)}. Oylik narx: ${som(f.monthly)}.`:`Qarz yoʻq. Oylik narx: ${som(f.monthly)}.`;
}
function payForm(sid){
const act=S.students.filter(s=>s.status==='faol').sort(byName);
if(!act.length){toast('Faol oʻquvchi yoʻq');return}
const sel=sid&&student(sid)?sid:act[0].id;
const s0=student(sel),f0=fin(s0),amt=f0.debt||f0.monthly;
modal('Toʻlov qabul qilish',`
${field('Oʻquvchi','payStudent',`<select id="payStudent">${act.map(s=>`<option value="${s.id}" ${s.id===sel?'selected':''}>${esc(s.name)}${group(s.groupId)?', '+esc(group(s.groupId).name):''}</option>`).join('')}</select><small class="hint" id="payHint">${hintFor(f0)}</small>`)}
${field('Summa (soʻm)','amt',`<input id="amt" inputmode="numeric" value="${amt?money(amt):''}" autocomplete="off"><small class="hint" id="amtFmt"></small>`)}
<div class="f"><span class="lab">Toʻlov usuli</span><div class="chips">${METHODS.map((m,i)=>`<label class="opt"><input type="radio" name="method" value="${m}" ${i===0?'checked':''}><span>${m}</span></label>`).join('')}</div></div>
${field('Sana','payDate',`<input type="date" id="payDate" value="${todayStr}" max="${todayStr}">`)}
${field('Izoh (ixtiyoriy)','payNote',`<input id="payNote" autocomplete="off">`)}
${actions(`<button class="btn pri" data-act="savePay">Qabul qilish</button>`)}`);
}
function remindText(s){
const f=fin(s),g=group(s.groupId);
return `Assalomu alaykum, ${s.name.split(' ')[0]}! ${CENTER} oʻquv markazidan eslatma: ${g?g.name:'kurs'} boʻyicha ${som(f.debt)} toʻlov qarzingiz bor. Iltimos, toʻlovni imkon qadar tezroq amalga oshiring. Rahmat!`;
}
