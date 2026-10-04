'use strict';
function viewHome(){
const nowD=new Date(),nowM=nowD.getHours()*60+nowD.getMinutes();
const todays=S.groups.filter(g=>g.days.includes(TODAY.getDay())).sort((a,b)=>a.time.localeCompare(b.time));
const lessons=todays.length?todays.map(g=>{
const a=mins(g.time),st=nowM<a?'soon':nowM<a+g.dur?'live':'done';
const marked=Object.keys((S.att[g.id]||{})[todayStr]||{}).length;
const lbl={soon:'Kutilmoqda',live:'Hozir davom etmoqda',done:'Tugagan'}[st];
return `<div class="lesson ${st}">
<div class="lt"><b>${g.time}</b><span>${endT(g)}</span></div>
<div class="lm"><b>${esc(g.name)}</b><span>${esc(g.teacher)}, ${esc(g.room)}, ${activeIn(g.id).length} ta oʻquvchi</span>
<span class="pill ${st==='live'?'ok':''}">${lbl}</span>${marked?'<span class="pill adv">Davomat belgilangan</span>':''}</div>
<button class="btn sm" data-act="goAtt" data-id="${g.id}">Davomat</button></div>`;
}).join(''):`<div class="empty"><b>Bugun dars yoʻq</b>Dars kunlarini Guruhlar boʻlimida oʻzgartirishingiz mumkin.</div>`;
const act=S.students.filter(s=>s.status==='faol');
const dl=debtors();
const totalDebt=dl.reduce((a,x)=>a+x.f.debt,0);
const monthRev=S.payments.filter(p=>p.date.slice(0,7)===ym(TODAY)).reduce((a,p)=>a+p.amount,0);
const newLeads=S.leads.filter(l=>l.stage==='yangi').length;
const months=[];
for(let i=5;i>=0;i--){const d=new Date(TODAY.getFullYear(),TODAY.getMonth()-i,1);months.push({key:ym(d),lbl:MSHORT[d.getMonth()],sum:0,cur:i===0})}
S.payments.forEach(p=>{const m=months.find(x=>x.key===p.date.slice(0,7));if(m)m.sum+=p.amount});
const mx=Math.max(1,...months.map(m=>m.sum));
const bars=months.map(m=>`<div class="bar ${m.cur?'cur':''}"><em>${m.sum?short(m.sum):'0'}</em><div class="bt"><i style="height:${Math.max(2,Math.round(m.sum*100/mx))}%"></i></div><small>${m.lbl}</small></div>`).join('');
const counts=STAGES.map(st=>({st,n:S.leads.filter(l=>l.stage===st.k).length}));
const cmax=Math.max(1,...counts.map(c=>c.n));
const funnel=counts.map(c=>`<div class="fn" style="--c:${c.st.c}"><span>${c.st.n}</span><div class="tr"><i style="width:${Math.round(c.n*100/cmax)}%"></i></div><b>${c.n}</b></div>`).join('');
const drows=dl.slice(0,5).map(({s,f})=>`<div class="rw">${av(s.name)}<div class="gr"><b>${esc(s.name)}</b><small>${esc((group(s.groupId)||{}).name||'Guruhsiz')}, ${monthsBehind(f)} oylik</small></div>
<span class="amt neg">${money(f.debt)}</span></div>`).join('');
const d=TODAY;
const welcome=S.groups.length?'':`<section class="panel empty" style="margin-bottom:16px"><b>Xush kelibsiz!</b>Boshlash uchun avval guruh yarating, keyin oʻquvchi va leadlarni qoʻshing. Yoki demo maʼlumotlar bilan tanishib chiqing.<div class="pha" style="justify-content:center;margin-top:14px"><button class="btn pri" data-act="newGroup">Guruh yaratish</button><button class="btn" data-act="demoAsk">Demo yuklash</button></div></section>`;
return head('Bosh sahifa',`${WD[d.getDay()][0].toUpperCase()+WD[d.getDay()].slice(1)}, ${dFull(todayStr)}`)+welcome+`
<section class="panel stats" aria-label="Asosiy koʻrsatkichlar">
<div class="stat"><b>${act.length}</b><span>Faol oʻquvchi</span></div>
<div class="stat"><b>${short(monthRev)}</b><span>Shu oy tushum, soʻm</span></div>
<div class="stat"><b>${short(totalDebt)}</b><span>Umumiy qarz, soʻm</span></div>
<div class="stat"><b>${newLeads}</b><span>Yangi lead</span></div>
</section>
<div class="g2">
<section class="panel"><div class="pt"><h2>Bugungi darslar</h2><small>${todays.length} ta</small></div>${lessons}</section>
<section class="panel"><div class="pt"><h2>Qarzdorlar</h2><button class="btn sm" data-act="nav" data-v="pay">Hammasi</button></div>${drows||'<div class="empty"><b>Qarzdorlar yoʻq</b>Hamma toʻlovlar oʻz vaqtida.</div>'}</section>
</div>
<div class="g2">
<section class="panel"><div class="pt"><h2>Oylik tushum</h2><small>soʻm</small></div><div class="bars">${bars}</div></section>
<section class="panel"><div class="pt"><h2>Leadlar bosqichlari</h2><button class="btn sm" data-act="nav" data-v="leads">Ochish</button></div><div style="padding:6px 0">${funnel}</div></section>
</div>
<div class="pha" style="margin-top:4px"><button class="btn" data-act="demoAsk">Demo yuklash</button><button class="btn danger" data-act="clearAsk">Maʼlumotni tozalash</button><button class="btn" data-act="logout">Chiqish</button></div>`;
}
function leadCard(l){
const i=FLOW.indexOf(l.stage);
let mv='';
if(l.stage==='yoqotildi')mv=`<button data-act="mvLead" data-id="${l.id}" data-dir="-1" aria-label="Aloqada bosqichiga qaytarish">${ic('left',16)}</button>`;
else mv=`${i>0?`<button data-act="mvLead" data-id="${l.id}" data-dir="-1" aria-label="Oldingi bosqich">${ic('left',16)}</button>`:''}${i<FLOW.length-1?`<button data-act="mvLead" data-id="${l.id}" data-dir="1" aria-label="Keyingi bosqich">${ic('right',16)}</button>`:''}`;
return `<article class="lead" draggable="true" data-id="${l.id}" data-act="openLead" tabindex="0">
<b>${esc(l.name)}</b>
<a class="tel" href="tel:${esc(l.phone.replace(/[^\d+]/g,''))}">${esc(l.phone)}</a>
<div class="tags"><span class="chip">${esc(l.course)}</span><span class="src">${esc(l.source)}</span></div>
${l.note?`<p class="note">${esc(l.note)}</p>`:''}
<div class="lf"><small>${ago(l.created)}</small><span class="mv">${mv}</span></div></article>`;
}
function viewLeads(){
const open=S.leads.filter(l=>!['yozildi','yoqotildi'].includes(l.stage)).length;
const cols=STAGES.map(st=>{
const items=S.leads.filter(l=>l.stage===st.k).sort((a,b)=>b.created.localeCompare(a.created));
return `<section class="col" style="--c:${st.c}" aria-label="${st.n}"><div class="col-h"><b>${st.n}</b><span>${items.length}</span></div>
<div class="col-b" data-drop="${st.k}">${items.map(leadCard).join('')}</div></section>`;
}).join('');
return head('Leadlar',`${open} ta faol lead. Kartani bosqichlar orasida surishingiz mumkin.`,
`<button class="btn pri" data-act="newLead">${ic('plus',18)}Yangi lead</button>`)+`<div class="board">${cols}</div>`;
}
function stRows(){
const q=S.ui.stQ.trim().toLowerCase(),qd=q.replace(/\s/g,'');
const list=S.students.filter(s=>{
if(S.ui.stGroup!=='all'&&s.groupId!==S.ui.stGroup)return false;
if(q&&!(s.name.toLowerCase().includes(q)||s.phone.replace(/\s/g,'').includes(qd)))return false;
const f=fin(s);
if(S.ui.stFilter==='active')return s.status==='faol';
if(S.ui.stFilter==='debt')return f.debt>0;
if(S.ui.stFilter==='left')return s.status==='chiqqan';
return true;
}).sort(byName);
if(!list.length)return `<div class="empty"><b>Hech kim topilmadi</b>Qidiruvni yoki filtrni oʻzgartiring, yoki yangi oʻquvchi qoʻshing.</div>`;
return `<table class="tbl"><thead><tr><th>Oʻquvchi</th><th class="hide-m">Telefon</th><th class="hide-m">Davomat</th><th class="r">Balans</th></tr></thead><tbody>${
list.map(s=>{
const f=fin(s),a=attStat(s),g=group(s.groupId);
return `<tr data-act="openStudent" data-id="${s.id}" tabindex="0">
<td><div class="nm">${av(s.name)}<div><b>${esc(s.name)}</b><small>${esc(g?g.name:'Guruhsiz')}</small></div></div></td>
<td class="hide-m">${esc(s.phone)}</td>
<td class="hide-m">${a.pct==null?'<span class="hint">Yoʻq</span>':`<span class="mini">${a.pct}%<i><u style="width:${a.pct}%"></u></i></span>`}</td>
<td class="r">${balPill(f,s)}</td></tr>`;
}).join('')}</tbody></table>`;
}
function viewStudents(){
const fl=[['active','Faol'],['debt','Qarzdorlar'],['left','Ketganlar'],['all','Hammasi']];
return head('Oʻquvchilar',`${S.students.filter(s=>s.status==='faol').length} ta faol oʻquvchi`,
`<button class="btn pri" data-act="newStudent">${ic('plus',18)}Yangi oʻquvchi</button>`)+`
<div class="tools">
<div class="sbox">${ic('search',18)}<input id="stQ" type="search" placeholder="Ism yoki telefon" value="${esc(S.ui.stQ)}" aria-label="Qidirish" autocomplete="off"></div>
<select id="stGroup" aria-label="Guruh boʻyicha"><option value="all">Barcha guruhlar</option>${S.groups.map(g=>`<option value="${g.id}" ${S.ui.stGroup===g.id?'selected':''}>${esc(g.name)}</option>`).join('')}</select>
<div class="fchips">${fl.map(([k,l])=>`<button class="fchip" aria-pressed="${S.ui.stFilter===k}" data-act="stFilter" data-v="${k}">${l}</button>`).join('')}</div>
</div>
<div class="panel" id="stList">${stRows()}</div>`;
}
function viewGroups(){
const gs=[...S.groups].sort((a,b)=>a.time.localeCompare(b.time));
return head('Guruhlar',`${S.groups.length} ta guruh`,`<button class="btn pri" data-act="newGroup">${ic('plus',18)}Yangi guruh</button>`)+
(gs.length?`<div class="gg">${gs.map(g=>{
const n=activeIn(g.id).length;
return `<article class="gcard" data-act="openGroup" data-id="${g.id}" tabindex="0">
<div class="gtop"><h3>${esc(g.name)}</h3><span class="chip">${esc(g.course)}</span></div>
<p class="gt">${esc(g.teacher)}, ${esc(g.room)}</p>
<div class="days" aria-label="Dars kunlari">${DAY_ORDER.map(d=>`<i class="${g.days.includes(d)?'on':''}">${WDS[d]}</i>`).join('')}</div>
<p class="gtime">${g.time}–${endT(g)}</p>
<div class="seats" aria-hidden="true">${Array.from({length:g.cap},(_,i)=>`<b class="${i<n?'f':''}"></b>`).join('')}</div>
<div class="gfoot"><span>${n} / ${g.cap} oʻrin band</span><b>${som(g.price)} / oy</b></div></article>`;
}).join('')}</div>`:`<div class="panel empty"><b>Guruhlar hali yoʻq</b>Birinchi guruhni yarating, keyin oʻquvchilarni qoʻshing.</div>`);
}
