'use strict';
const nextNo=()=>S.payments.reduce((m,p)=>Math.max(m,Number(p.no)||0),0)+1;
const receiptNo=p=>{
if(p.no)return String(p.no).padStart(5,'0');
const i=S.payments.slice().sort((a,b)=>a.date.localeCompare(b.date)).findIndex(x=>x.id===p.id);
return String(i+1).padStart(5,'0');
};
function balText(s){
const f=fin(s);
return f.debt>0?`Qarz ${som(f.debt)}`:f.adv>0?`Avans ${som(f.adv)}`:'Qarz yoʻq';
}
function receiptText(p){
const s=student(p.studentId)||{name:'-'},g=group(s.groupId);
return `🧾 ${S.settings.center||CENTER}\nToʻlov kvitansiyasi № ${receiptNo(p)}\nSana: ${dFull(p.date)}\nOʻquvchi: ${s.name}\nGuruh: ${g?g.name:'-'}\nUsul: ${p.method}\nSumma: ${som(p.amount)}\n${s.id?balText(s):''}`;
}
function openReceipt(id){
const p=S.payments.find(x=>x.id===id);if(!p)return;
const s=student(p.studentId);if(!s)return;
const g=group(s.groupId);
modal('Kvitansiya',`<div class="rcpt">
<h3>${esc(S.settings.center||CENTER)}</h3>
<p class="rc-sub">Toʻlov kvitansiyasi № ${receiptNo(p)}</p>
<dl><dt>Sana</dt><dd>${dFull(p.date)}</dd><dt>Oʻquvchi</dt><dd>${esc(s.name)}</dd><dt>Guruh</dt><dd>${esc(g?g.name:'-')}</dd><dt>Toʻlov usuli</dt><dd>${esc(p.method)}</dd>${p.note?`<dt>Izoh</dt><dd>${esc(p.note)}</dd>`:''}</dl>
<div class="rc-sum"><span>Summa</span><span>${som(p.amount)}</span></div>
<dl><dt>Hozirgi balans</dt><dd>${balText(s)}</dd></dl>
<div class="rc-sign"><span>Qabul qildi: ____________</span><span>Imzo: ________</span></div></div>
<div class="mact noprint"><button class="btn" data-act="closeModal">Yopish</button>${tgOn()?`<button class="btn" data-act="rcTg" data-id="${p.id}">Telegramga yuborish</button>`:''}<button class="btn pri" data-act="rcPrint">Chop etish / PDF</button></div>`);
}
A.receipt=el=>openReceipt(el.dataset.id);
A.rcPrint=()=>window.print();
A.rcTg=async el=>{
const p=S.payments.find(x=>x.id===el.dataset.id);if(!p)return;
const s=student(p.studentId),chat=(s&&s.tg)||S.settings.tgStaff;
if(!chat){toast('Telegram chat ID kiritilmagan');return}
if(await tgSend(chat,receiptText(p)))toast('Kvitansiya Telegramga yuborildi');
};
const _sp=A.savePay;
A.savePay=()=>{
const n=S.payments.length;
_sp();
if(S.payments.length>n){
const p=S.payments[S.payments.length-1];
p.no=nextNo();
notifyPay(p);
openReceipt(p.id);
}
};
const _payList=payList;
payList=function(){
return _payList().replace(/<button class="icb" data-act="delPayAsk" data-id="([^"]+)"/g,
`<button class="icb" data-act="receipt" data-id="$1" aria-label="Kvitansiya">${ic('doc',18)}</button><button class="icb" data-act="delPayAsk" data-id="$1"`);
};