'use strict';
let ROLE='admin',ME='',uiRole=null;
S.settings={tgOn:false,tgParents:true,tgStaff:'',center:CENTER};
I.settings='<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>';
I.doc='<path d="M7 3h8l4 4v14H7z"/><path d="M15 3v4h4M10 12h6M10 16h6"/>';
NAV.push(['more','Sozlamalar','Boshqa','settings']);
const T_NAV=['home','groups','att'];
const T_OK=['nav','closeModal','confirmYes','goAtt','setAtt','allCame','attDay','attPick','logout','retry'];
loadRemote=async function(){
const {data,error}=await sb.rpc('get_state');
if(error)throw error;
ROLE=data.role==='admin'?'admin':'teacher';
ME=data.name||'';
S.settings=Object.assign({tgOn:false,tgParents:true,tgStaff:'',center:CENTER},data.settings||{});
const x=data.data;
if(x&&Array.isArray(x.groups)){
Object.assign(S,{groups:x.groups,students:x.students||[],leads:x.leads||[],payments:x.payments||[],att:x.att||{}});
lastSnap=JSON.stringify(pack());
return true;
}
if(ROLE==='teacher'){Object.assign(S,emptyData());lastSnap=JSON.stringify(pack());return true}
return false;
};
const _saveNow=saveNow;
saveNow=async function(force){if(ROLE!=='admin')return;return _saveNow(force)};
async function saveSettings(){
if(ROLE!=='admin')return;
try{
const {error}=await sb.from('crm_state').upsert({id:'settings',data:S.settings,updated_at:new Date().toISOString()});
if(error)throw error;
}catch(e){toast('Sozlama saqlanmadi: '+(e.message||e))}
}
function buildNav(){
const items=NAV.filter(n=>ROLE==='admin'||T_NAV.includes(n[0]));
$('#sidenav').innerHTML=items.map(n=>`<button class="ni" data-act="nav" data-v="${n[0]}" data-nav="${n[0]}">${ic(n[3])}<span>${n[1]}</span></button>`).join('');
$('#tabbar').innerHTML=items.map(n=>`<button class="tb" data-act="nav" data-v="${n[0]}" data-nav="${n[0]}">${ic(n[3],22)}<span>${n[2]}</span></button>`).join('');
$('#tabbar').style.gridTemplateColumns=`repeat(${items.length},1fr)`;
}
function ensureUi(){
if(uiRole===ROLE)return;
uiRole=ROLE;
buildNav();
if(ROLE==='teacher'){
Object.keys(A).forEach(k=>{if(!T_OK.includes(k))A[k]=()=>toast('Bu amal faqat administrator uchun.')});
if(!T_NAV.includes(S.view))S.view='home';
}
}
const _render=render;
render=function(top){ensureUi();_render(top)};
function tHome(){
const nowD=new Date(),nowM=nowD.getHours()*60+nowD.getMinutes();
const todays=S.groups.filter(g=>g.days.includes(TODAY.getDay())).sort((a,b)=>a.time.localeCompare(b.time));
const rows=todays.length?todays.map(g=>{
const a=mins(g.time),st=nowM<a?'soon':nowM<a+g.dur?'live':'done';
const lbl={soon:'Kutilmoqda',live:'Hozir davom etmoqda',done:'Tugagan'}[st];
return `<div class="lesson ${st}"><div class="lt"><b>${g.time}</b><span>${endT(g)}</span></div><div class="lm"><b>${esc(g.name)}</b><span>${esc(g.room)}, ${activeIn(g.id).length} ta oʻquvchi</span><span class="pill ${st==='live'?'ok':''}">${lbl}</span></div><button class="btn sm" data-act="goAtt" data-id="${g.id}">Davomat</button></div>`;
}).join(''):`<div class="empty"><b>Bugun dars yoʻq</b>Boshqa kunlar uchun Guruhlar boʻlimiga qarang.</div>`;
return head('Bosh sahifa',`Ustoz: ${esc(ME)}. ${dFull(todayStr)}`)+`<section class="panel"><div class="pt"><h2>Bugungi darslar</h2><small>${todays.length} ta</small></div>${rows}</section><div class="pha" style="margin-top:12px"><button class="btn" data-act="logout">Chiqish</button></div>`;
}
function tGroups(){
const gs=[...S.groups].sort((a,b)=>a.time.localeCompare(b.time));
return head('Guruhlarim',`${gs.length} ta guruh`)+(gs.length?`<div class="gg">${gs.map(g=>{
const st=activeIn(g.id).sort(byName);
return `<article class="gcard"><div class="gtop"><h3>${esc(g.name)}</h3><span class="chip">${esc(g.course)}</span></div><p class="gt">${esc(g.room)}</p><div class="days">${DAY_ORDER.map(d=>`<i class="${g.days.includes(d)?'on':''}">${WDS[d]}</i>`).join('')}</div><p class="gtime">${g.time}–${endT(g)}</p><p class="gt" style="margin:0">${st.length?st.map(s=>esc(s.name)).join(', '):'Oʻquvchi yoʻq'}</p></article>`;
}).join('')}</div>`:`<div class="panel empty"><b>Sizga guruh biriktirilmagan</b>Administrator guruhdagi "Ustoz" maydoniga sizning ismingizni yozishi kerak.</div>`);
}
const _vh=VIEWS.home,_vg=VIEWS.groups;
VIEWS.home=()=>ROLE==='teacher'?tHome():_vh();
VIEWS.groups=()=>ROLE==='teacher'?tGroups():_vg();
let attChain=Promise.resolve();
function pushAtt(gid,d){
if(ROLE!=='teacher')return;
const rec=((S.att[gid]||{})[d])||{};
attChain=attChain.then(async()=>{
try{const {error}=await sb.rpc('save_att',{p_group:gid,p_date:d,p_rec:rec});if(error)throw error}
catch(e){toast('Davomat saqlanmadi: '+(e.message||e))}
});
}
['setAtt','allCame'].forEach(k=>{
const f=A[k];
A[k]=(el,e)=>{const gid=S.ui.attGroup,d=S.ui.attDate;f(el,e);pushAtt(gid,d);queueAtt(gid,d)};
});
async function checkUserRole() {
    try {
        const { data: { user } } = await _supabase.auth.getUser();
        if (user) {makhmudovislombek0701@gmail.com
            return 'admin';
        }
        return 'admin';
    } catch (e) {
        return 'admin';
    }
}
