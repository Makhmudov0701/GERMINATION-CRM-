'use strict';
function viewMore(){
const st=S.settings;
return head('Sozlamalar','Telegram, Excel (CSV) va foydalanuvchi rollari')+`
<section class="panel set-sec"><h3>Markaz nomi</h3>
<div class="f"><label for="set_center">Kvitansiya va xabarlarda chiqadi</label><input id="set_center" value="${esc(st.center||'')}" autocomplete="off"></div></section>
<section class="panel set-sec"><h3>Telegram bot</h3>
<p class="hint" style="margin-bottom:10px">Toʻlov qabul qilinganda va davomat belgilanganda xabar yuboradi. Bot tokeni brauzerda emas, Supabase Edge Function (TELEGRAM_BOT_TOKEN) ichida turadi.</p>
<div class="chips" style="margin-bottom:12px">
<label class="opt"><input type="checkbox" id="set_tgOn" ${st.tgOn?'checked':''}><span>Xabarlar yoqilgan</span></label>
<label class="opt"><input type="checkbox" id="set_tgParents" ${st.tgParents?'checked':''}><span>Ota-onalarga ham</span></label></div>
<div class="f"><label for="set_tgStaff">Xodimlar chat ID (guruh yoki kanal)</label><input id="set_tgStaff" value="${esc(st.tgStaff||'')}" inputmode="text" autocomplete="off" placeholder="-1001234567890"><small class="hint">Ota-ona ID si oʻquvchi kartasida kiritiladi.</small></div>
<button class="btn" data-act="tgTest">Sinov xabarini yuborish</button></section>
<section class="panel set-sec"><h3>Excel (CSV)</h3>
<p class="hint" style="margin-bottom:10px">Fayllar Excel va Google Sheets'da ochiladi. Import uchun Excel'da "CSV UTF-8" formatida saqlang.</p>
<div class="pha"><button class="btn" data-act="exportStudents">Oʻquvchilar</button><button class="btn" data-act="exportPayments">Toʻlovlar</button><button class="btn" data-act="exportFinance">Moliya hisoboti</button></div>
<div class="pha" style="margin-top:10px"><button class="btn pri" data-act="csvPick">CSV dan oʻquvchi import</button><button class="btn" data-act="csvTemplate">Shablon</button></div>
<input type="file" id="csvFile" accept=".csv,text/csv" hidden></section>
<section class="panel set-sec"><h3>Foydalanuvchilar va rollar</h3>
<p class="hint">Yangi xodim: Supabase → Authentication → Add user. Keyin SQL Editor'da rol bering (schema2.sql dagi izohga qarang). Ustoz ismi guruhdagi "Ustoz" maydoni bilan bir xil boʻlishi shart. Ustoz faqat oʻz guruhlari va davomatni koʻradi.</p></section>`;
}
VIEWS.more=viewMore;
document.addEventListener('change',e=>{
const t=e.target,id=t.id||'';
if(id.indexOf('set_')!==0)return;
const k=id.slice(4);
let v=t.type==='checkbox'?t.checked:t.value.trim();
if(k==='tgStaff'&&v&&!/^(-?\d{5,}|@\w{4,})$/.test(v)){toast('Chat ID raqam (masalan -1001234567890) yoki @kanal boʻlishi kerak');return}
S.settings[k]=v;
saveSettings();
toast('Saqlandi');
});