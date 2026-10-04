'use strict';
const csvCell=v=>{
let s=String(v==null?'':v);
if(/^[=@]|^[+\-][^\d\s]/.test(s))s="'"+s;
return /[;"\r\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;
};
function csvDownload(name,rows){
const csv='\uFEFF'+rows.map(r=>r.map(csvCell).join(';')).join('\r\n');
const u=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
const a=document.createElement('a');
a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();
setTimeout(()=>URL.revokeObjectURL(u),3000);
toast('Fayl yuklab olindi: '+name);
}
function exportStudents(){
const rows=[['Ism','Telefon','Ota-ona telefoni','Guruh','Boshlagan sana','Chegirma %','Holat','Hisoblangan','Toʻlangan','Qarz','Avans','Telegram ID']];
S.students.slice().sort(byName).forEach(s=>{
const f=fin(s),g=group(s.groupId);
rows.push([s.name,s.phone,s.parent||'',g?g.name:'',s.joined,s.discount||0,s.status==='faol'?'Faol':'Ketgan',f.owed,f.paid,f.debt,f.adv,s.tg||'']);
});
csvDownload('oquvchilar-'+todayStr+'.csv',rows);
}
function exportPayments(){
const rows=[['№','Sana','Oʻquvchi','Guruh','Usul','Summa','Izoh']];
S.payments.slice().sort((a,b)=>a.date.localeCompare(b.date)).forEach(p=>{
const s=student(p.studentId)||{name:'(oʻchirilgan)'},g=group(s.groupId);
rows.push([receiptNo(p),p.date,s.name,g?g.name:'',p.method,p.amount,p.note||'']);
});
csvDownload('tolovlar-'+todayStr+'.csv',rows);
}
function exportFinance(){
const by={};
S.payments.forEach(p=>{
const k=p.date.slice(0,7),m=by[k]||(by[k]={sum:0,n:0});
m.sum+=p.amount;m.n++;m[p.method]=(m[p.method]||0)+p.amount;
});
const rows=[['Oy','Tushum','Naqd','Karta','Click','Payme','Toʻlovlar soni']];
let t=0,tn=0;
Object.keys(by).sort().forEach(k=>{
const m=by[k];t+=m.sum;tn+=m.n;
rows.push([k,m.sum,m.Naqd||0,m.Karta||0,m.Click||0,m.Payme||0,m.n]);
});
rows.push(['JAMI',t,'','','','',tn]);
csvDownload('moliya-'+todayStr+'.csv',rows);
}
function parseCsv(text){
text=text.replace(/^\uFEFF/,'');
const first=text.split(/\r?\n/)[0]||'';
const sep=(first.match(/;/g)||[]).length>=(first.match(/,/g)||[]).length?';':',';
const rows=[];let row=[],cur='',q=false;
const endRow=()=>{row.push(cur);cur='';if(row.some(x=>x.trim()!==''))rows.push(row);row=[]};
for(let i=0;i<text.length;i++){
const c=text[i];
if(q){if(c==='"'){if(text[i+1]==='"'){cur+='"';i++}else q=false}else cur+=c}
else if(c==='"')q=true;
else if(c===sep){row.push(cur);cur=''}
else if(c==='\n'||c==='\r'){if(c==='\r'&&text[i+1]==='\n')i++;endRow()}
else cur+=c;
}
if(cur!==''||row.length)endRow();
return rows;
}
const normDate=s=>{
s=String(s||'').trim();
if(/^\d{4}-\d{2}-\d{2}$/.test(s))return s;
const m=s.match(/^(\d{1,2})[.\/](\d{1,2})[.\/](\d{4})$/);
return m?`${m[3]}-${pad(+m[2])}-${pad(+m[1])}`:todayStr;
};
let csvPending=[];
function importPreview(text){
const rows=parseCsv(text);
if(rows.length<2){toast('Fayl boʻsh yoki sarlavha qatori yoʻq');return}
const H=rows[0].map(h=>h.trim().toLowerCase());
const col=names=>H.findIndex(h=>names.includes(h));
const ci={name:col(['ism','ism familiya','name']),phone:col(['telefon','phone','tel']),parent:col(['ota-ona telefoni','ota-ona','parent']),group:col(['guruh','group']),joined:col(['boshlagan sana','sana','joined','boshlash sanasi']),disc:col(['chegirma %','chegirma','discount']),tg:col(['telegram id','telegram'])};
if(ci.name<0||ci.phone<0||ci.group<0){toast('Sarlavhada "Ism", "Telefon" va "Guruh" ustunlari boʻlishi kerak');return}
const get=(r,i)=>i>=0&&r[i]!=null?String(r[i]).trim():'';
const dig=v=>String(v).replace(/\D/g,'');
const ok=[],bad=[];
rows.slice(1).forEach((r,i)=>{
const name=get(r,ci.name),phone=get(r,ci.phone),gname=get(r,ci.group).toLowerCase();
const g=S.groups.find(x=>x.name.trim().toLowerCase()===gname);
let why='';
if(!name)why='ism yoʻq';
else if(!phoneOK(phone))why='telefon notoʻgʻri';
else if(!g)why='guruh topilmadi: '+get(r,ci.group);
else if(S.students.some(s=>s.name.toLowerCase()===name.toLowerCase()&&dig(s.phone)===dig(phone))||ok.some(s=>s.name.toLowerCase()===name.toLowerCase()&&dig(s.phone)===dig(phone)))why='allaqachon bor';
if(why){bad.push(`${i+2}-qator: ${why}`);return}
const tg=get(r,ci.tg).replace(/\s/g,'');
ok.push({id:uid(),name,phone,parent:get(r,ci.parent),groupId:g.id,joined:normDate(get(r,ci.joined)),discount:Math.min(100,num(get(r,ci.disc))),status:'faol',tg:/^-?\d{5,}$/.test(tg)?tg:''});
});
csvPending=ok;
modal('Import natijasi',`<p style="margin-bottom:10px">Qoʻshiladi: <b>${ok.length}</b> ta oʻquvchi. Oʻtkazib yuboriladi: <b>${bad.length}</b> ta.</p>
${bad.length?`<div class="warnbox">${bad.slice(0,6).map(esc).join('<br>')}${bad.length>6?`<br>... va yana ${bad.length-6} ta`:''}</div>`:''}
<div class="mact"><button class="btn" data-act="closeModal">Bekor qilish</button>${ok.length?`<button class="btn pri" data-act="csvConfirm">${ok.length} ta oʻquvchini qoʻshish</button>`:''}</div>`);
}
A.csvPick=()=>{const f=$('#csvFile');if(f)f.click()};
A.csvConfirm=()=>{
const n=csvPending.length;
csvPending.forEach(s=>S.students.push(s));
csvPending=[];
closeModal();render();toast(n+' ta oʻquvchi import qilindi');
};
A.csvTemplate=()=>{
const g=S.groups[0];
csvDownload('oquvchilar-shablon.csv',[['Ism','Telefon','Ota-ona telefoni','Guruh','Boshlagan sana','Chegirma %','Telegram ID'],['Ali Valiyev','+998 90 123 45 67','+998 91 765 43 21',g?g.name:'Guruh nomi',todayStr,0,'']]);
};
A.exportStudents=exportStudents;
A.exportPayments=exportPayments;
A.exportFinance=exportFinance;
document.addEventListener('change',e=>{
const t=e.target;
if(t.id!=='csvFile'||!t.files||!t.files[0])return;
const f=t.files[0];
f.text().then(importPreview).catch(()=>toast('Faylni oʻqib boʻlmadi')).finally(()=>{t.value=''});
});