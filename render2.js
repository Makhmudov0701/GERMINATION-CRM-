'use strict';
function lastLessonDates(g,n=6){
const out=[];
for(let k=0;k<70&&out.length<n;k++){const d=addDays(TODAY,-k);if(g.days.includes(d.getDay()))out.push(ymd(d))}
return out.reverse();
}
function viewAtt(){
if(!S.groups.length)return head('Davomat')+`<div class="panel empty"><b>Guruh yoʻq</b>Davomat olish uchun avval guruh yarating.</div>`;
if(!group(S.ui.attGroup))S.ui.attGroup=S.groups[0].id;
const g=group(S.ui.attGroup),d=S.ui.attDate;
const isLesson=g.days.includes(parse(d).getDay());
const list=S.students.filter(s=>s.groupId===g.id&&s.status==='faol'&&s.joined<=d).sort(byName);
const rec=(S.att[g.id]||{})[d]||{};
const c={k:0,x:0,s:0,n:0};
list.forEach(s=>{const v=rec[s.id];if(v)c[v]++;else c.n++});
const rows=list.length?list.map(s=>{
const v=rec[s.id],a=attStat(s);
return `<div class="arow">${av(s.name)}<div class="an"><b>${esc(s.name)}</b><small>${a.pct==null?'Davomat maʼlumoti yoʻq':`Umumiy davomat ${a.pct}%`}</small></div>
<div class="seg" role="group" aria-label="${esc(s.name)} davomati">${[['k','Keldi'],['x','Kelmadi'],['s','Sababli']].map(([k,l])=>`<button class="${k}" aria-pressed="${v===k}" data-act="setAtt" data-s="${s.id}" data-v="${k}">${l}</button>`).join('')}</div></div>`;
}).join(''):`<div class="empty"><b>Bu guruhda faol oʻquvchi yoʻq</b>Oʻquvchilar boʻlimidan guruhga oʻquvchi qoʻshing.</div>`;
const dates=lastLessonDates(g);
const mxRows=list.map(s=>`<tr><td>${esc(s.name)}</td>${dates.map(dt=>{
const v=((S.att[g.id]||{})[dt]||{})[s.id];
return `<td><span class="dot ${v||''}" title="${dText(dt)}">${v==='k'?'✓':v==='x'?'✕':v==='s'?'S':''}</span></td>`;
}).join('')}</tr>`).join('');
return head('Davomat','Guruhni va sanani tanlang, har bir oʻquvchi uchun holatni belgilang. Oʻzgarishlar darhol saqlanadi.')+`
<div class="atools">
<select id="attGroup" aria-label="Guruh">${S.groups.map(x=>`<option value="${x.id}" ${x.id===g.id?'selected':''}>${esc(x.name)}, ${x.time}</option>`).join('')}</select>
<div class="dnav">
<button class="icb bd" data-act="attDay" data-v="-1" aria-label="Oldingi kun">${ic('left',18)}</button>
<input type="date" id="attDate" value="${d}" max="${todayStr}" aria-label="Sana">
<button class="icb bd" data-act="attDay" data-v="1" aria-label="Keyingi kun" ${d>=todayStr?'disabled':''}>${ic('right',18)}</button>
${d!==todayStr?`<button class="btn sm" data-act="attDay" data-v="today">Bugun</button>`:''}
</div>
</div>
${isLesson?'':`<div class="warnbox">Bu guruhning dars kunlari: ${g.days.slice().sort((a,b)=>(a||7)-(b||7)).map(x=>WDS[x]).join(', ')}. Tanlangan sana (${WD[parse(d).getDay()]}) dars kuni emas.</div>`}
<div class="sum"><span class="pill ok">Keldi ${c.k}</span><span class="pill debt">Kelmadi ${c.x}</span><span class="pill warn">Sababli ${c.s}</span><span class="pill">Belgilanmagan ${c.n}</span>
${list.length?`<button class="btn sm" data-act="allCame" style="margin-left:auto">Hammasi keldi</button>`:''}</div>
<section class="panel" style="margin-bottom:16px">${rows}</section>
${list.length?`<section class="panel"><div class="pt"><h2>Oxirgi darslar</h2><small>Sanani bossangiz, shu kunga oʻtadi</small></div>
<div class="mxw"><table class="mx"><thead><tr><th>Oʻquvchi</th>${dates.map(dt=>`<th><button data-act="attPick" data-v="${dt}">${dShort(dt)}</button></th>`).join('')}</tr></thead><tbody>${mxRows}</tbody></table></div></section>`:''}`;
}
function payList(){
const q=S.ui.payQ.trim().toLowerCase();
if(S.ui.payTab==='debt'){
const dl=debtors().filter(({s})=>!q||s.name.toLowerCase().includes(q));
if(!dl.length)return `<div class="empty"><b>${q?'Hech kim topilmadi':'Qarzdorlar yoʻq'}</b>${q?'Qidiruvni oʻzgartirib koʻring.':'Hamma toʻlovlar oʻz vaqtida.'}</div>`;
return dl.map(({s,f})=>`<div class="rw">${av(s.name)}<div class="gr"><b>${esc(s.name)}</b><small>${esc((group(s.groupId)||{}).name||'Guruhsiz')}, ${monthsBehind(f)} oylik qarz</small></div>
<span class="amt neg">${som(f.debt)}</span>
<div class="acts"><button class="btn sm pri" data-act="payFor" data-id="${s.id}">Toʻlov</button><button class="btn sm" data-act="remind" data-id="${s.id}">Eslatma</button></div></div>`).join('');
}
const list=S.payments.filter(p=>{const s=student(p.studentId);return s&&(!q||s.name.toLowerCase().includes(q))})
.sort((a,b)=>b.date.localeCompare(a.date)).slice(0,80);
if(!list.length)return `<div class="empty"><b>Toʻlovlar topilmadi</b>Yangi toʻlov qabul qilish uchun yuqoridagi tugmani bosing.</div>`;
return list.map(p=>{const s=student(p.studentId);
return `<div class="rw">${av(s.name)}<div class="gr"><b>${esc(s.name)}</b><small>${dText(p.date)}, ${esc(p.method)}${p.note?', '+esc(p.note):''}</small></div>
<span class="amt">${som(p.amount)}</span>
<button class="icb" data-act="delPayAsk" data-id="${p.id}" aria-label="Toʻlovni bekor qilish">${ic('x',18)}</button></div>`}).join('');
}
function viewPay(){
const dl=debtors(),total=dl.reduce((a,x)=>a+x.f.debt,0);
const monthRev=S.payments.filter(p=>p.date.slice(0,7)===ym(TODAY)).reduce((a,p)=>a+p.amount,0);
return head('Toʻlovlar','Qarzdorlik oʻquvchi qoʻshilgan oydan boshlab oylik narx boʻyicha hisoblanadi.',
`<button class="btn pri" data-act="payFor" data-id="">${ic('plus',18)}Toʻlov qabul qilish</button>`)+`
<section class="panel stats" style="grid-template-columns:repeat(3,1fr)">
<div class="stat"><b>${short(monthRev)}</b><span>Shu oy tushum, soʻm</span></div>
<div class="stat"><b>${short(total)}</b><span>Umumiy qarz, soʻm</span></div>
<div class="stat"><b>${dl.length}</b><span>Qarzdor oʻquvchi</span></div>
</section>
<div class="tabs" role="tablist">
<button class="tab" role="tab" aria-selected="${S.ui.payTab==='debt'}" data-act="payTab" data-v="debt">Qarzdorlar</button>
<button class="tab" role="tab" aria-selected="${S.ui.payTab==='hist'}" data-act="payTab" data-v="hist">Toʻlovlar tarixi</button>
</div>
<div class="tools"><div class="sbox">${ic('search',18)}<input id="payQ" type="search" placeholder="Oʻquvchi ismi" value="${esc(S.ui.payQ)}" aria-label="Qidirish" autocomplete="off"></div></div>
<div class="panel" id="payList">${payList()}</div>`;
}
const VIEWS={home:viewHome,leads:viewLeads,students:viewStudents,groups:viewGroups,att:viewAtt,pay:viewPay};
const NAV=[['home','Bosh sahifa','Bosh','home'],['leads','Leadlar','Leadlar','funnel'],['students','Oʻquvchilar','Oʻquvchi','users'],['groups','Guruhlar','Guruh','grid'],['att','Davomat','Davomat','check'],['pay','Toʻlovlar','Toʻlov','wallet']];
function render(top){
const ae=document.activeElement;let sel=null;
if(ae&&ae.dataset&&ae.dataset.act&&$('#view').contains(ae)&&!['INPUT','SELECT','TEXTAREA'].includes(ae.tagName)){
sel=`[data-act="${ae.dataset.act}"]`+['id','s','v','dir'].filter(k=>ae.dataset[k]!==undefined).map(k=>`[data-${k}="${ae.dataset[k]}"]`).join('');
}
$('#view').innerHTML=VIEWS[S.view]();
document.querySelectorAll('[data-nav]').forEach(b=>{
const on=b.dataset.nav===S.view;b.classList.toggle('on',on);
if(on)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');
});
if(top)window.scrollTo(0,0);
if(sel){try{const n=$(sel,$('#view'));if(n)n.focus({preventScroll:true})}catch(e){}}
save();
}
