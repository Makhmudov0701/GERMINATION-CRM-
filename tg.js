'use strict';
let ATT_DELAY=60000;
const attTimers={},attPend=new Set();
const sentSet=(()=>{try{return new Set(JSON.parse(localStorage.getItem('ufq_sent')||'[]'))}catch(e){return new Set()}})();
const markSent=k=>{sentSet.add(k);try{localStorage.setItem('ufq_sent',JSON.stringify([...sentSet].slice(-500)))}catch(e){}};
const tgOn=()=>!!(sb&&S.settings&&S.settings.tgOn);
const tgName=()=>S.settings.center||CENTER;
async function tgSend(chat,text){
if(!chat)return false;
try{
const {data,error}=await sb.functions.invoke('tg-send',{body:{chat_id:String(chat).trim(),text}});
if(error)throw error;
if(data&&data.ok===false)throw new Error(data.description||data.error||'Telegram xatosi');
return true;
}catch(e){
let m=e.message||String(e);
try{const j=await e.context.json();m=j.description||j.error||m}catch(_){}
toast('Telegram: '+m);
return false;
}
}
async function notifyPay(p){
if(!tgOn())return;
const s=student(p.studentId);if(!s)return;
const g=group(s.groupId),f=fin(s),no=receiptNo(p);
const bal=f.debt>0?`Qarz: ${som(f.debt)}`:f.adv>0?`Avans: ${som(f.adv)}`:'Qarz yoʻq';
if(S.settings.tgStaff)await tgSend(S.settings.tgStaff,`💰 Toʻlov qabul qilindi\n№ ${no}\nOʻquvchi: ${s.name}\nGuruh: ${g?g.name:'-'}\nSumma: ${som(p.amount)}\nUsul: ${p.method}\n${bal}`);
if(S.settings.tgParents&&s.tg)await tgSend(s.tg,`${tgName()}: ${s.name} uchun ${som(p.amount)} toʻlov qabul qilindi (№ ${no}). ${bal}. Rahmat!`);
}
async function flushAtt(gid,d){
const k=gid+'|'+d;
clearTimeout(attTimers[k]);delete attTimers[k];attPend.delete(k);
if(!tgOn())return;
const g=group(gid),rec=((S.att[gid]||{})[d])||{},ids=Object.keys(rec);
if(!g||!ids.length)return;
const nm=v=>ids.filter(i=>rec[i]===v).map(i=>(student(i)||{}).name).filter(Boolean);
const ok=nm('k'),no=nm('x'),sb2=nm('s');
if(S.settings.tgStaff)await tgSend(S.settings.tgStaff,`📋 Davomat: ${g.name}\n${dText(d)}, ${g.time}\n✅ Keldi: ${ok.length}\n❌ Kelmadi: ${no.length}${no.length?' ('+no.join(', ')+')':''}\n⚠️ Sababli: ${sb2.length}${sb2.length?' ('+sb2.join(', ')+')':''}`);
if(S.settings.tgParents){
for(const i of ids){
if(rec[i]!=='x')continue;
const st=student(i),sk='abs|'+gid+'|'+d+'|'+i;
if(!st||!st.tg||sentSet.has(sk))continue;
if(await tgSend(st.tg,`${tgName()}: hurmatli ota-ona, ${st.name} ${dText(d)} kuni ${g.name} darsiga kelmadi. Sababini maʼlum qiling.`))markSent(sk);
}
}
}
function queueAtt(gid,d){
if(!tgOn())return;
const k=gid+'|'+d;
clearTimeout(attTimers[k]);attPend.add(k);
attTimers[k]=setTimeout(()=>flushAtt(gid,d),ATT_DELAY);
}
function flushAll(){[...attPend].forEach(k=>{const [g,d]=k.split('|');flushAtt(g,d)})}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flushAll()});
window.addEventListener('pagehide',flushAll);
const _sf=studentForm;
studentForm=function(id){
_sf(id);
const s=id?student(id):null,e=$('#err');
if(e)e.insertAdjacentHTML('beforebegin',`<div class="f"><label for="sTg">Telegram chat ID (ixtiyoriy)</label><input id="sTg" inputmode="numeric" value="${esc((s&&s.tg)||'')}" autocomplete="off"><small class="hint">Ota-onaga bot orqali xabar yuborish uchun.</small></div>`);
};
const _ss=A.saveStudent;
A.saveStudent=el=>{
const tg=val('sTg').replace(/\s/g,''),n=S.students.length;
if(tg&&!/^-?\d{5,}$/.test(tg))return fail('Telegram chat ID faqat raqamlardan iborat boʻlishi kerak.','sTg');
_ss(el);
if($('#mdl'))return;
const s=el.dataset.id?student(el.dataset.id):S.students[S.students.length-1];
if(s&&(el.dataset.id||S.students.length>n)){s.tg=tg;save()}
};
A.tgTest=async()=>{
const c=S.settings.tgStaff;
if(!c){toast('Avval xodimlar chat ID sini kiriting');return}
if(await tgSend(c,`✅ ${tgName()} CRM: sinov xabari`))toast('Sinov xabari yuborildi');
};