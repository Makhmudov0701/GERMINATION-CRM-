'use strict';
const CFG_URL=String(SUPABASE_URL).trim().replace(/\/+$/,'').replace(/\/(rest|auth)\/v1.*$/,'');
const CFG_KEY=String(SUPABASE_ANON_KEY).trim();
function cfgProblem(){
if(/SIZNING|LOYIHA/i.test(CFG_URL))return 'config.js da SUPABASE_URL hali yozilmagan. Supabase → Project Settings → API dan Project URL ni nusxalab qoʻying.';
if(!/^https:\/\/[^\s\/]+\.[a-z]{2,}$/i.test(CFG_URL))return 'config.js dagi SUPABASE_URL notoʻgʻri. U https://abcdxyz.supabase.co koʻrinishida boʻlishi kerak.';
if(CFG_KEY.indexOf('SIZNING')===0||CFG_KEY.length<30)return 'config.js da SUPABASE_ANON_KEY hali yozilmagan. Project Settings → API dan anon public kalitni nusxalab qoʻying.';
return '';
}
let sb=null;
try{if(window.supabase&&window.supabase.createClient&&!cfgProblem())sb=window.supabase.createClient(CFG_URL,CFG_KEY)}catch(e){}
const $id=id=>document.getElementById(id);
let started=false;
function showLogin(msg){$id('login').hidden=false;$id('loginError').textContent=msg||''}
function hideLogin(){$id('login').hidden=true}
const isNet=m=>/failed to fetch|network|load failed|fetch/i.test(String(m||''));
async function diagnose(){
try{
const r=await fetch(CFG_URL+'/auth/v1/health',{headers:{apikey:CFG_KEY}});
if(r.ok)return 'Server ishlayapti, lekin soʻrov bloklandi. Sahifani yangilab qayta urining, VPN yoki reklama bloklagichni oʻchiring.';
return 'Server javob berdi (kod '+r.status+'). SUPABASE_ANON_KEY ni tekshiring.';
}catch(e){
return 'Serverga ulanib boʻlmadi: '+CFG_URL+' . Sabablari: URL xato yozilgan; loyiha Supabase panelida Paused holatda (Restore project ni bosing); yoki internet/VPN muammosi.';
}
}
function authMsg(m){
m=String(m||'');
if(/invalid login credentials/i.test(m))return 'Email yoki parol notoʻgʻri.';
if(/email not confirmed/i.test(m))return 'Email tasdiqlanmagan. Supabase panelida foydalanuvchini tasdiqlang.';
if(/api key|apikey|jwt/i.test(m))return 'API kalit notoʻgʻri. config.js ga anon public kalitni yozing.';
return 'Kirishda xatolik: '+m;
}
async function startApp(){
if(started)return;
started=true;
try{
if(!(await loadRemote()))await saveNow(true);
}catch(e){
started=false;
$('#view').innerHTML=`<div class="panel empty"><b>Maʼlumotni yuklab boʻlmadi</b>${esc(e.message||e)}<br>crm_state jadvali va RLS siyosatlari yaratilganini tekshiring.<div class="pha" style="justify-content:center;margin-top:14px"><button class="btn pri" data-act="retry">Qayta urinish</button><button class="btn" data-act="logout">Chiqish</button></div></div>`;
return;
}
ready=true;
fixAtt();
render(true);
}
async function handleLogin(e){
e.preventDefault();
const email=$id('loginEmail').value.trim(),password=$id('loginPassword').value;
const err=$id('loginError'),btn=$id('loginBtn');
err.textContent='';
const cp=cfgProblem();if(cp){err.textContent=cp;return}
if(!sb){err.textContent='Supabase kutubxonasi yuklanmadi. Internetni va index.html dagi CDN skriptini tekshiring.';return}
if(!email||!password){err.textContent='Email va parolni kiriting.';return}
btn.disabled=true;btn.textContent='Kirilmoqda...';
try{
const {error}=await sb.auth.signInWithPassword({email,password});
if(error){err.textContent=isNet(error.message)?await diagnose():authMsg(error.message);return}
hideLogin();
await startApp();
}catch(ex){
err.textContent=isNet(ex.message)?await diagnose():authMsg(ex.message);
}finally{
btn.disabled=false;btn.textContent='Kirish';
}
}
async function logout(){
try{if(sb)await sb.auth.signOut()}catch(e){}
location.reload();
}
async function initAuth(){
$id('loginForm').addEventListener('submit',handleLogin);
const cp=cfgProblem();
if(cp){showLogin(cp);return}
if(!sb){showLogin('Supabase kutubxonasi yuklanmadi. Internetni va index.html dagi CDN skriptini tekshiring.');return}
try{
const {data}=await sb.auth.getSession();
if(data&&data.session){hideLogin();await startApp()}
}catch(e){showLogin(isNet(e.message)?await diagnose():authMsg(e.message))}
sb.auth.onAuthStateChange(ev=>{if(ev==='SIGNED_OUT'&&started)location.reload()});
}
document.addEventListener('visibilitychange',async()=>{
if(document.visibilityState!=='visible'||!ready||!sb)return;
if(JSON.stringify(pack())!==lastSnap||$('#mroot').firstChild)return;
try{if(await loadRemote())render()}catch(e){}
});
