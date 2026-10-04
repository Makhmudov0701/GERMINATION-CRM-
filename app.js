'use strict';
$('#sidenav').innerHTML=NAV.map(n=>`<button class="ni" data-act="nav" data-v="${n[0]}" data-nav="${n[0]}">${ic(n[3])}<span>${n[1]}</span></button>`).join('');
$('#tabbar').innerHTML=NAV.map(n=>`<button class="tb" data-act="nav" data-v="${n[0]}" data-nav="${n[0]}">${ic(n[3],22)}<span>${n[2]}</span></button>`).join('');
initAuth();
