'use strict';
const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad=n=>String(n).padStart(2,'0');
const ymd=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const ym=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}`;
const parse=s=>{const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)};
const addDays=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
const TODAY=(()=>{const d=new Date();d.setHours(0,0,0,0);return d})();
const todayStr=ymd(TODAY);
const uid=()=>Math.random().toString(36).slice(2,9);
const MONTHS=['yanvar','fevral','mart','aprel','may','iyun','iyul','avgust','sentabr','oktabr','noyabr','dekabr'];
const MSHORT=['yan','fev','mar','apr','may','iyn','iyl','avg','sen','okt','noy','dek'];
const WD=['yakshanba','dushanba','seshanba','chorshanba','payshanba','juma','shanba'];
const WDS=['Yak','Du','Se','Chor','Pay','Ju','Sha'];
const dText=s=>{const d=parse(s);return `${d.getDate()}-${MONTHS[d.getMonth()]}`};
const dFull=s=>{const d=parse(s);return `${d.getDate()}-${MONTHS[d.getMonth()]} ${d.getFullYear()}`};
const dShort=s=>{const d=parse(s);return `${pad(d.getDate())}.${pad(d.getMonth()+1)}`};
const ago=s=>{const n=Math.round((TODAY-parse(s))/864e5);return n<=0?'bugun':n===1?'kecha':`${n} kun oldin`};
const monthsBetween=(fromStr,to)=>{const f=parse(fromStr);return (to.getFullYear()-f.getFullYear())*12+(to.getMonth()-f.getMonth())+1};
const money=n=>Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g,'\u00A0');
const som=n=>money(n)+'\u00A0soʻm';
const short=n=>n>=1e6?(Math.round(n/1e5)/10).toString().replace('.',',')+' mln':n>=1e3?Math.round(n/1e3)+' ming':String(Math.round(n));
const phoneOK=v=>String(v).replace(/\D/g,'').length>=9;
const byName=(a,b)=>a.name.localeCompare(b.name,'uz');
const mins=t=>{const [h,m]=t.split(':').map(Number);return h*60+m};
const endT=g=>{const e=mins(g.time)+g.dur;return `${pad(Math.floor(e/60)%24)}:${pad(e%60)}`};
const I={
home:'<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
funnel:'<path d="M3 4h18l-7 8.5V19l-4 2v-8.5z"/>',
users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18.5 14.4c1.9.8 3 2.7 3 5.6"/>',
grid:'<rect x="3" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5"/>',
check:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 13l2.2 2.2L15.5 11"/>',
wallet:'<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18M16.5 15h1.5"/>',
plus:'<path d="M12 5v14M5 12h14"/>',
x:'<path d="M6 6l12 12M18 6L6 18"/>',
left:'<path d="M15 5l-7 7 7 7"/>',
right:'<path d="M9 5l7 7-7 7"/>',
search:'<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>'
};
const ic=(n,s=20)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n]}</svg>`;
const AVC=[['#E7ECFA','#1F3C99'],['#DDF3F1','#0B6F69'],['#FCF1D8','#8A5A00'],['#FAE3E8','#9C2440'],['#E9E4F7','#4B3A99']];
const av=name=>{let h=0;for(const ch of name)h=(h*31+ch.charCodeAt(0))>>>0;const c=AVC[h%AVC.length];
const ini=name.split(' ').filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase();
return `<span class="av" style="background:${c[0]};color:${c[1]}" aria-hidden="true">${esc(ini)}</span>`};
const CENTER='Ufq';
const METHODS=['Naqd','Karta','Click','Payme'];
const SOURCES=['Instagram','Telegram','Tavsiya','Tashrif','Reklama','Boshqa'];
const STAGES=[
{k:'yangi',n:'Yangi',c:'var(--cobalt)'},
{k:'aloqa',n:'Aloqada',c:'var(--saf)'},
{k:'sinov',n:'Sinov darsi',c:'var(--turq)'},
{k:'yozildi',n:'Yozildi',c:'#2F8F4E'},
{k:'yoqotildi',n:'Yoʻqotildi',c:'#8B94AB'}
];
const FLOW=['yangi','aloqa','sinov','yozildi'];
const DAY_ORDER=[1,2,3,4,5,6,0];
const emptyData=()=>({groups:[],students:[],payments:[],att:{},leads:[]});
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function seed(){
const R=rng(2026);
const pick=a=>a[Math.floor(R()*a.length)];
const groups=[
{id:'g1',name:'Ingliz tili A2 (ertalab)',course:'Ingliz tili',teacher:'Dilnoza Rahimova',room:'2-xona',days:[1,3,5],time:'09:00',dur:90,price:550000,cap:8},
{id:'g2',name:'IELTS 6.5',course:'IELTS',teacher:'Jasur Ergashev',room:'3-xona',days:[2,4,6],time:'15:00',dur:120,price:900000,cap:8},
{id:'g3',name:'Matematika 9-sinf',course:'Matematika',teacher:'Sherzod Toshpoʻlatov',room:'1-xona',days:[1,3,5],time:'16:30',dur:90,price:500000,cap:10},
{id:'g4',name:'Python asoslari',course:'Python',teacher:'Bekzod Aliyev',room:'Kompyuter xonasi',days:[2,4],time:'18:00',dur:120,price:800000,cap:8},
{id:'g5',name:'Rus tili boshlangʻich',course:'Rus tili',teacher:'Nigora Saidova',room:'2-xona',days:[1,3],time:'11:00',dur:90,price:450000,cap:8},
{id:'g6',name:'Ingliz tili Kids',course:'Ingliz tili',teacher:'Dilnoza Rahimova',room:'4-xona',days:[2,4,6],time:'10:00',dur:60,price:500000,cap:8}
];
const names=['Azizbek Karimov','Madina Yusupova','Sardor Abdullayev','Nilufar Rashidova','Jasurbek Tursunov','Zarina Mamatova','Ulugʻbek Nazarov','Dilorom Ismoilova','Behruz Qodirov','Malika Hasanova','Otabek Sobirov','Sevara Normatova','Shohruh Xolmatov','Kamola Ergasheva','Islom Rustamov','Gulnoza Abdurahmonova','Doniyor Mirzayev','Feruza Qosimova','Temur Aliqulov','Lola Karimova','Aziza Toirova','Bobur Yoʻldoshev','Madinabonu Sodiqova','Akmal Pulatov'];
const ops=['90','91','93','94','95','97','99','88','33'];
const phone=()=>`+998 ${pick(ops)} ${100+Math.floor(R()*900)} ${10+Math.floor(R()*90)} ${10+Math.floor(R()*90)}`;
const start=new Date(2026,3,1), span=Math.floor((new Date(2026,8,28)-start)/864e5);
const students=names.map((n,i)=>({
id:'s'+(i+1),name:n,phone:phone(),parent:i%3===0?phone():'',groupId:groups[i%groups.length].id,
joined:ymd(addDays(start,Math.floor(R()*span))),discount:i%7===3?10:0,status:'faol'
}));
const payments=[];
students.forEach(s=>{
const g=groups.find(x=>x.id===s.groupId);
const monthly=Math.round(g.price*(1-s.discount/100));
const months=monthsBetween(s.joined,TODAY);
const r=R();
const behind=r<.5?0:r<.75?1:r<.9?2:-1;
const paid=Math.max(0,months-behind);
const j=parse(s.joined);
for(let i=0;i<paid;i++){
let d=new Date(j.getFullYear(),j.getMonth()+i,Math.min(28,2+Math.floor(R()*6)));
if(d<j)d=new Date(j);
if(d>TODAY)d=new Date(TODAY);
let amt=monthly;
if(i===paid-1&&behind>0&&R()<.35)amt=Math.round(monthly/2/10000)*10000;
payments.push({id:uid(),studentId:s.id,amount:amt,method:pick(METHODS),date:ymd(d),note:''});
}
});
const att={};
groups.forEach(g=>{
att[g.id]={};
const gs=students.filter(s=>s.groupId===g.id);
for(let k=1;k<=21;k++){
const d=addDays(TODAY,-k);
if(!g.days.includes(d.getDay()))continue;
const key=ymd(d);att[g.id][key]={};
gs.forEach(s=>{if(parse(s.joined)>d)return;const r=R();att[g.id][key][s.id]=r<.84?'k':r<.93?'x':'s'});
}
});
const L=(name,phoneN,course,source,stage,days,note,extra)=>Object.assign({id:uid(),name,phone:phoneN,course,source,stage,created:ymd(addDays(TODAY,-days)),note:note||''},extra||{});
const leads=[
L('Sevinch Ortiqova','+998 90 211 34 56','Ingliz tili','Instagram','yangi',0,'Direktga yozgan, narxni soʻragan.'),
L('Rustam Joʻraev','+998 93 540 12 78','Python','Telegram','yangi',1,''),
L('Dildora Hamidova','+998 97 330 45 21','IELTS','Tavsiya','yangi',2,'Ayol dugonasi Madina tavsiya qilgan.'),
L('Anvar Soliyev','+998 91 777 08 09','Matematika','Tashrif','aloqa',3,'Dushanba kuni qayta qoʻngʻiroq qilish.'),
L('Muhlisa Aliyeva','+998 99 120 60 33','Ingliz tili','Instagram','aloqa',4,'Qizi uchun, 8 yosh. Kids guruhi.'),
L('Qobil Raxmonov','+998 94 888 17 40','Rus tili','Reklama','aloqa',6,''),
L('Shaxzoda Ibragimova','+998 88 450 22 19','IELTS','Telegram','sinov',5,'Shanba kuni 15:00 da sinov darsi.'),
L('Jahongir Tojiyev','+998 90 909 31 31','Python','Tavsiya','sinov',7,'Sinov darsiga keldi, fikrini aytmagan.'),
L('Odina Sharipova','+998 95 613 70 02','Matematika','Instagram','yozildi',9,'',{studentId:'seed'}),
L('Farhod Umarov','+998 33 205 18 64','Ingliz tili','Reklama','yoqotildi',12,'Narx qimmat deb rad etdi.')
];
return {groups,students,payments,att,leads};
}
const S=Object.assign({
view:'home',
ui:{stQ:'',stGroup:'all',stFilter:'active',attGroup:null,attDate:todayStr,payTab:'debt',payQ:''}
},emptyData());
let saveT,lastSnap='',ready=false;
const pack=()=>({groups:S.groups,students:S.students,leads:S.leads,payments:S.payments,att:S.att});
function save(){clearTimeout(saveT);saveT=setTimeout(saveNow,700)}
async function saveNow(force){
if(!sb||(!ready&&!force))return;
const snap=JSON.stringify(pack());
if(snap===lastSnap&&!force)return;
try{
const {error}=await sb.from('crm_state').upsert({id:'main',data:pack(),updated_at:new Date().toISOString()});
if(error)throw error;
lastSnap=snap;
}catch(e){toast('Saqlanmadi: '+(e.message||e))}
}
async function loadRemote(){
const {data,error}=await sb.from('crm_state').select('data').eq('id','main').maybeSingle();
if(error)throw error;
const x=data&&data.data;
if(x&&Array.isArray(x.groups)){
Object.assign(S,{groups:x.groups,students:x.students||[],leads:x.leads||[],payments:x.payments||[],att:x.att||{}});
lastSnap=JSON.stringify(pack());
return true;
}
return false;
}
function fixAtt(){
const t=S.groups.find(g=>g.days.includes(TODAY.getDay()));
S.ui.attGroup=(t||S.groups[0]||{}).id||null;
}
const group=id=>S.groups.find(g=>g.id===id);
const student=id=>S.students.find(s=>s.id===id);
const activeIn=gid=>S.students.filter(s=>s.groupId===gid&&s.status==='faol');
function fin(s){
const g=group(s.groupId);
const monthly=g?Math.round(g.price*(1-(s.discount||0)/100)):0;
const end=s.left?parse(s.left):TODAY;
const months=Math.max(0,monthsBetween(s.joined,end));
const owed=monthly*months;
const paid=S.payments.filter(p=>p.studentId===s.id).reduce((a,p)=>a+p.amount,0);
const bal=paid-owed;
return {monthly,months,owed,paid,debt:Math.max(0,-bal),adv:Math.max(0,bal)};
}
function attStat(s){
let k=0,t=0;const a=S.att[s.groupId]||{};
for(const d in a){const v=a[d][s.id];if(v){t++;if(v==='k')k++}}
return {k,t,pct:t?Math.round(k*100/t):null};
}
function debtors(){
return S.students.map(s=>({s,f:fin(s)})).filter(x=>x.f.debt>0).sort((a,b)=>b.f.debt-a.f.debt);
}
const balPill=(f,s)=>s.status==='chiqqan'&&f.debt<=0?'<span class="pill">Ketgan</span>'
:f.debt>0?`<span class="pill debt">Qarz ${money(f.debt)}</span>`
:f.adv>0?`<span class="pill adv">Avans ${money(f.adv)}</span>`
:'<span class="pill ok">Toʻlangan</span>';
const monthsBehind=f=>f.monthly?Math.ceil(f.debt/f.monthly):0;
const head=(title,sub,actions='')=>`<header class="pagehead"><div><h1>${title}</h1>${sub?`<p>${sub}</p>`:''}</div><div class="pha">${actions}</div></header>`;
