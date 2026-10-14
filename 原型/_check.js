
(function(){
'use strict';
var WA='996220709230';
var $=function(s){return document.querySelector(s)};
var $$=function(s){return Array.prototype.slice.call(document.querySelectorAll(s))};

/* ── база данных (localStorage) ─────────────────────────── */
var SEED={cats:['Кроссовки','Кеды','Беговые'],prods:[
 {id:'p1',n:'SB Dunk Low Pro',b:'Nike',cat:'Кроссовки',p:13990,old:0,sz:[40,41,42,43,44,45],colors:[{n:'Серый/белый',h:'#b9bcc2',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/2023_Nike_SB_Dunk_Low_Pro_%281%29.jpg/960px-2023_Nike_SB_Dunk_Low_Pro_%281%29.jpg'}]},
 {id:'p2',n:'Air Force 1 \'07',b:'Nike',cat:'Кроссовки',p:11990,old:13490,sz:[39,40,41,42,43,44],colors:[{n:'Белый',h:'#f2f2ee',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Air_Force_1_%283199944288%29.jpg/960px-Air_Force_1_%283199944288%29.jpg'},{n:'Чёрный',h:'#232323',img:''}]},
 {id:'p3',n:'Samba OG',b:'adidas',cat:'Кеды',p:12490,old:0,sz:[38,39,40,41,42,43],colors:[{n:'Чёрный',h:'#26262a',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Adidas_Samba_OG.jpg/960px-Adidas_Samba_OG.jpg'},{n:'Белый',h:'#efece4',img:''}]},
 {id:'p4',n:'Campus 00s',b:'adidas',cat:'Кеды',p:10990,old:0,sz:[38,39,40,41,42,43],colors:[{n:'Коричневый',h:'#8a5a3b',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Adidas_Campus_00s.jpg/960px-Adidas_Campus_00s.jpg'}]},
 {id:'p5',n:'550',b:'New Balance',cat:'Кроссовки',p:12990,old:14990,sz:[39,40,41,42,43,44],colors:[{n:'Белый/зелёный',h:'#d8dcd2',img:'https://upload.wikimedia.org/wikipedia/commons/7/75/New_Balance_550.jpg'},{n:'Серый',h:'#9aa0a6',img:''}]},
 {id:'p6',n:'574',b:'New Balance',cat:'Кроссовки',p:9990,old:0,sz:[39,40,41,42,43,44,45],colors:[{n:'Серый',h:'#a7a49c',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/New_Balance_574.jpg/960px-New_Balance_574.jpg'}]},
 {id:'p7',n:'Gel-Kayano 14',b:'Asics',cat:'Беговые',p:16990,old:0,sz:[40,41,42,43,44],colors:[{n:'Бежевый',h:'#d6c9b4',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Gel-Kayano_14_Artizia.jpg/960px-Gel-Kayano_14_Artizia.jpg'}]},
 {id:'p8',n:'Smash Leather',b:'Puma',cat:'Кроссовки',p:8990,old:10490,sz:[38,39,40,41,42,43],colors:[{n:'Белый',h:'#f0efe9',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Puma_Smash_Leather.jpg/960px-Puma_Smash_Leather.jpg'},{n:'Тёмно-синий',h:'#2b3a55',img:''}]}
]};
function clone(o){return JSON.parse(JSON.stringify(o))}
var mem={},canStore=true;
try{localStorage.setItem('shag_t','1');localStorage.removeItem('shag_t')}catch(e){canStore=false}
function loadDB(){
 var r=null;try{r=localStorage.getItem('shagdb2')}catch(e){r=mem.db}
 if(r){try{var d=JSON.parse(r);if(d&&d.prods)return d}catch(e){}}
 return clone(SEED);
}
var DB=loadDB();
function saveDB(){
 var s=JSON.stringify(DB);
 if(canStore){try{localStorage.setItem('shagdb2',s);return true}catch(e){}}
 mem.db=s;
 if(!saveDB._w){saveDB._w=1;toast('Хранилище недоступно: изменения только до перезагрузки')}
 return true;
}

/* ── утилиты ────────────────────────────────────────────── */
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function fmt(n){return n.toLocaleString('ru-RU')+'\u00a0₽'}
function toast(m){var t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(toast._h);toast._h=setTimeout(function(){t.classList.remove('show')},2800)}
function prod(id){for(var i=0;i<DB.prods.length;i++)if(DB.prods[i].id===id)return DB.prods[i];return null}
function txtColor(hex){var h=hex.replace('#','');if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];var r=parseInt(h.substr(0,2),16),g=parseInt(h.substr(2,2),16),b=parseInt(h.substr(4,2),16);return (r*299+g*587+b*114)/1000>150?'#1a1a18':'#ffffff'}
function mediaHTML(p,ci,lazy){var c=p.colors[ci]||p.colors[0];if(c.img)return '<img src="'+esc(c.img)+'" width="960" height="960" alt="'+esc(p.b+' '+p.n+', цвет: '+c.n)+'"'+(lazy?' loading="lazy" decoding="async"':' fetchpriority="high"')+'>';return '<div class="tile" style="background:'+esc(c.h)+'"><span style="color:'+txtColor(c.h)+'">'+esc(c.n)+'</span></div>'}

/* ── витрина ────────────────────────────────────────────── */
var filter={cat:'all',brand:'all'};
function cardHTML(p,i){
 var dots=p.colors.map(function(c,ci){return '<button class="dot" data-ci="'+ci+'" style="--d:'+esc(c.h)+'" aria-pressed="'+(ci===0)+'" aria-label="Цвет: '+esc(c.n)+'" title="'+esc(c.n)+'"></button>'}).join('');
 var old=p.old&&p.old>p.p?' <s class="old num">'+fmt(p.old)+'</s>':'';
 return '<article class="pcard rv" data-id="'+esc(p.id)+'" data-brand="'+esc(p.b)+'" data-cat="'+esc(p.cat)+'" data-ci="0" style="transition-delay:'+((i%4)*60)+'ms">'+
  '<div class="pmedia">'+mediaHTML(p,0,true)+'<div class="padmin"><button class="pmini" data-edit="'+esc(p.id)+'">Изменить</button><button class="pmini" data-del="'+esc(p.id)+'">Удалить</button></div></div>'+
  '<div class="pbody"><span class="pbrand">'+esc(p.b)+' · '+esc(p.cat)+'</span><h3 class="pname">'+esc(p.n)+'</h3>'+
  '<div class="dots" role="group" aria-label="Цвета">'+dots+'</div>'+
  '<p class="pprice num">'+fmt(p.p)+old+'</p>'+
  '<button class="btn btn-dark" data-add="'+esc(p.id)+'">В корзину</button></div></article>';
}
function renderCatalog(){
 $('#pgrid').innerHTML=DB.prods.map(cardHTML).join('');
 var brands=[];DB.prods.forEach(function(p){if(brands.indexOf(p.b)<0)brands.push(p.b)});
 $('#brandChips').innerHTML='<button class="chip" data-brand="all" aria-pressed="'+(filter.brand==='all')+'">Все бренды</button>'+brands.map(function(b){return '<button class="chip" data-brand="'+esc(b)+'" aria-pressed="'+(filter.brand===b)+'">'+esc(b)+'</button>'}).join('');
 $('#catChips').innerHTML='<button class="chip" data-cat="all" aria-pressed="'+(filter.cat==='all')+'">Все категории</button>'+DB.cats.map(function(c){return '<button class="chip" data-cat="'+esc(c)+'" aria-pressed="'+(filter.cat===c)+'">'+esc(c)+'</button>'}).join('');
 applyFilter();watchRv();
}
function plural(n){n=Math.abs(n)%100;var d=n%10;if(n>10&&n<20)return 'моделей';if(d>1&&d<5)return 'модели';if(d===1)return 'модель';return 'моделей'}
function applyFilter(){
 var vis=0;
 $$('#pgrid .pcard').forEach(function(c){var ok=(filter.cat==='all'||c.dataset.cat===filter.cat)&&(filter.brand==='all'||c.dataset.brand===filter.brand);c.hidden=!ok;if(ok)vis++});
 $('#catCount').textContent=vis+' '+plural(vis);
 var empty=$('#catEmpty');
 if(vis===0&&DB.prods.length){empty.hidden=false;$('#catEmptyText').textContent='Под этот фильтр товаров нет. Попробуйте другой.'}
 else if(vis===0&&!DB.prods.length){empty.hidden=false;$('#catEmptyText').textContent='В каталоге пока пусто. Добавьте товары в админ-панели.'}
 else empty.hidden=true;
}
function watchRv(){
 if(!('IntersectionObserver' in window)){$$('.rv').forEach(function(el){el.classList.add('in')});return}
 if(!watchRv.io)watchRv.io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');watchRv.io.unobserve(e.target)}})},{threshold:.12});
 $$('#pgrid .rv, .cat-head.rv, .chips.rv, .svc-media.rv, .step.rv').forEach(function(el){if(!el.classList.contains('in'))watchRv.io.observe(el)});
}

/* ── корзина ────────────────────────────────────────────── */
var cart={};
function countQty(){var k=0;for(var key in cart)k+=cart[key].qty;return k}
function renderBadge(){var n=countQty(),b=$('#cartCount');b.hidden=n===0;b.textContent=n;$('#cartBtn').setAttribute('aria-label','Корзина, товаров: '+n)}
function renderCart(){
 var list=$('#cartList'),keys=Object.keys(cart),html='',total=0,alive=false;
 keys.forEach(function(key){
  var it=cart[key],p=prod(it.id);if(!p)return;alive=true;
  if(it.ci>=p.colors.length)it.ci=0;
  var c=p.colors[it.ci],sum=p.p*it.qty;total+=sum;
  var cOpt=p.colors.map(function(cc,ci){return '<option value="'+ci+'"'+(ci===it.ci?' selected':'')+'>'+esc(cc.n)+'</option>'}).join('');
  var szs=p.sz&&p.sz.length?p.sz:[36,37,38,39,40,41,42,43,44,45,46];
  var sOpt=szs.map(function(s){return '<option value="'+s+'"'+(s===it.sz?' selected':'')+'>'+s+'</option>'}).join('');
  html+='<div class="cline" data-key="'+esc(key)+'"><div class="cinfo"><span class="pbrand">'+esc(p.b)+'</span><strong>'+esc(p.n)+'</strong><span class="csum num">'+fmt(sum)+'</span></div>'+
   '<div class="cctrl"><select aria-label="Цвет: '+esc(p.n)+'">'+cOpt+'</select><select aria-label="Размер: '+esc(p.n)+'">'+sOpt+'</select>'+
   '<div class="qty"><button data-a="dec" aria-label="Меньше"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14"/></svg></button><span class="num">'+it.qty+'</span><button data-a="inc" aria-label="Больше"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></button></div>'+
   '<button class="cdel" data-a="del" aria-label="Удалить: '+esc(p.n)+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div></div>';
 });
 list.innerHTML=html;
 $('#cartEmpty').hidden=alive;
 $('#cartFoot').hidden=!alive;
 if(!alive&&keys.length){cart={};renderBadge()}
 $('#cartTotal').textContent=fmt(total);
 renderBadge();
}
function add(id,ci){
 var p=prod(id);if(!p)return;
 ci=ci||0;var sz=(p.sz&&p.sz.length)?p.sz[Math.floor(p.sz.length/2)]:42;
 var key=id+':'+ci+':'+sz;
 if(cart[key])cart[key].qty++;else cart[key]={id:id,ci:ci,sz:sz,qty:1};
 renderCart();openCart();
}
function waOrder(){
 var keys=Object.keys(cart),rows=[],total=0,i=1,drop=false;
 keys.forEach(function(key){
  var it=cart[key],p=prod(it.id);if(!p){drop=true;return}
  var c=p.colors[it.ci]||p.colors[0],sum=p.p*it.qty;total+=sum;
  rows.push(i+') '+p.b+' '+p.n+'. Цвет: '+c.n+', размер: '+it.sz+', '+it.qty+' шт: '+fmt(sum));i++;
 });
 if(drop){renderCart();toast('Некоторые товары уже удалены из базы, заказ обновлён')}
 if(!rows.length){toast('Корзина пуста');return}
 var msg='Новый заказ с сайта ШАГ\n'+rows.join('\n')+'\nИтого: '+fmt(total)+'\n\nЗдравствуйте! Подтвердите, пожалуйста, заказ.';
 window.open('https://wa.me/'+WA+'?text='+encodeURIComponent(msg),'_blank','noopener');
}
function openCart(){lastFocus=document.activeElement;$('#drawer').classList.add('open');$('#scrim').classList.add('open');document.body.classList.add('locked');$('#closeCart').focus()}
function closeCart(){$('#drawer').classList.remove('open');$('#scrim').classList.remove('open');document.body.classList.remove('locked');if(lastFocus)lastFocus.focus()}
var lastFocus=null;

/* ── оверлеи (вход / админка) ───────────────────────────── */
function openOv(sel){var ov=$(sel);ov.classList.add('open');document.body.classList.add('locked');var f=ov.querySelector('.atabs .chip')||ov.querySelector('input,button,select');if(f)f.focus()}
function closeOv(ov){ov.classList.remove('open');if(!$('.ov.open')&&!$('#drawer').classList.contains('open'))document.body.classList.remove('locked')}
$$('.ov').forEach(function(ov){ov.addEventListener('click',function(e){if(e.target===ov)closeOv(ov)})});
$$('.ov [data-close]').forEach(function(b){b.addEventListener('click',function(){closeOv(b.closest('.ov'))})});
document.addEventListener('keydown',function(e){
 var ov=$('.ov.open');
 if(e.key==='Escape'){
  if(ov){closeOv(ov);return}
  if($('#drawer').classList.contains('open')){closeCart();return}
 }
 if(e.key!=='Tab')return;
 var box=ov?ov:($('#drawer').classList.contains('open')?$('#drawer'):null);
 if(!box)return;
 var f=box.querySelectorAll('button,select,input,a[href]');
 if(!f.length)return;
 var first=f[0],last=f[f.length-1];
 if(e.shiftKey&&document.activeElement===first){last.focus();e.preventDefault()}
 else if(!e.shiftKey&&document.activeElement===last){first.focus();e.preventDefault()}
});

/* ── админка ────────────────────────────────────────────── */
function isAdm(){try{return sessionStorage.getItem('shagAdm')==='1'}catch(e){return mem.adm==='1'}}
function syncLoginBtn(){$('#btnLogin').textContent=isAdm()?'Админка':'Войти'}
$('#loginForm').addEventListener('submit',function(e){
 e.preventDefault();
 if($('#lUser').value.trim()==='admin'&&$('#lPass').value==='admin'){
  try{sessionStorage.setItem('shagAdm','1')}catch(e){mem.adm='1'}$('#lErr').hidden=true;$('#lPass').value='';
  syncLoginBtn();closeOv($('#ovLogin'));document.body.classList.add('admin');openOv('#ovAdmin');renderAdmin();
 }else{$('#lErr').hidden=false}
});
$('#btnLogin').addEventListener('click',function(){
 if(isAdm()){document.body.classList.add('admin');openOv('#ovAdmin');renderAdmin()}
 else openOv('#ovLogin');
});
$('#btnLogout').addEventListener('click',function(){
 try{sessionStorage.removeItem('shagAdm')}catch(e){delete mem.adm};document.body.classList.remove('admin');
 syncLoginBtn();closeOv($('#ovAdmin'));toast('Вы вышли из админ-панели');
});
$$('.atabs .chip').forEach(function(t){t.addEventListener('click',function(){
 $$('.atabs .chip').forEach(function(c){c.setAttribute('aria-pressed',c===t?'true':'false')});
 ['prods','cats','db'].forEach(function(id){$('#tab-'+id).hidden=id!==t.dataset.tab});
})});
function renderAdmin(){renderProdList();renderCatAdmin();renderCatSelect()}
function renderProdList(){
 $('#pc').textContent='('+DB.prods.length+')';
 $('#plist').innerHTML=DB.prods.map(function(p){
  return '<div class="arow"><div><strong>'+esc(p.n)+'</strong><span class="meta">'+esc(p.b)+' · '+esc(p.cat)+' · '+fmt(p.p)+'</span></div>'+
  '<div class="row" style="gap:8px;"><button class="pmini" data-edit="'+esc(p.id)+'">Изменить</button><button class="pmini" data-del="'+esc(p.id)+'">Удалить</button></div></div>';
 }).join('')||'<p class="dnote">Товаров нет. Нажмите «Добавить товар».</p>';
}
function renderCatAdmin(){
 $('#catList').innerHTML=DB.cats.map(function(c){
  var used=DB.prods.filter(function(p){return p.cat===c}).length;
  return '<div class="arow"><div><strong>'+esc(c)+'</strong><span class="meta">товаров: '+used+'</span></div><button class="pmini" data-delcat="'+esc(c)+'">Удалить</button></div>';
 }).join('')||'<p class="dnote">Категорий нет.</p>';
}
function renderCatSelect(){
 $('#fCat').innerHTML=DB.cats.map(function(c){return '<option>'+esc(c)+'</option>'}).join('');
}
$('#btnAddCat').addEventListener('click',function(){
 var v=$('#catName').value.trim();if(!v){toast('Введите название категории');return}
 if(DB.cats.indexOf(v)>=0){toast('Такая категория уже есть');return}
 DB.cats.push(v);$('#catName').value='';saveDB();renderCatAdmin();renderCatSelect();renderCatalog();toast('Категория добавлена');
});
$('#catList').addEventListener('click',function(e){
 var b=e.target.closest('[data-delcat]');if(!b)return;
 var c=b.dataset.delcat,used=DB.prods.filter(function(p){return p.cat===c}).length;
 if(used){toast('Категория используется в '+used+' '+(used>1?'товарах':'товаре'));return}
 DB.cats.splice(DB.cats.indexOf(c),1);if(filter.cat===c)filter.cat='all';
 saveDB();renderCatAdmin();renderCatSelect();renderCatalog();toast('Категория удалена');
});
function colorRow(c){
 c=c||{n:'',h:'#cccccc',img:''};
 var d=document.createElement('div');d.className='crow';
 d.innerHTML='<input class="inp c-n" placeholder="Название цвета" value="'+esc(c.n)+'">'+
 '<input class="c-h" type="color" value="'+esc(c.h)+'" aria-label="Цвет">'+
 '<input class="inp c-u" placeholder="URL фото (необязательно)" value="'+esc(c.img)+'">'+
 '<button type="button" class="iconbtn c-file" aria-label="Загрузить фото с устройства" title="Загрузить файл"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 16V4M7 9l5-5 5 5M4 20h16"/></svg></button>'+
 '<input type="file" accept="image/*" class="c-f" hidden>'+
 '<button type="button" class="cdel c-rm" aria-label="Удалить цвет"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>';
 d._img=null;
 d.querySelector('.c-file').addEventListener('click',function(){d.querySelector('.c-f').click()});
 d.querySelector('.c-f').addEventListener('change',function(e){
  var file=e.target.files[0];if(!file)return;
  var r=new FileReader();
  r.onload=function(){var im=new Image();im.onload=function(){
   var k=Math.min(1,900/Math.max(im.width,im.height)),cv=document.createElement('canvas');
   cv.width=Math.round(im.width*k);cv.height=Math.round(im.height*k);
   cv.getContext('2d').drawImage(im,0,0,cv.width,cv.height);
   d._img=cv.toDataURL('image/jpeg',.82);d.querySelector('.c-u').value='';toast('Фото загружено и сжато');
  };im.onerror=function(){toast('Не удалось прочитать файл')};im.src=r.result};
  r.readAsDataURL(file);
 });
 d.querySelector('.c-rm').addEventListener('click',function(){d.remove()});
 return d;
}
$('#btnAddColor').addEventListener('click',function(){$('#fColors').appendChild(colorRow())});
var editId=null;
$('#btnNew').addEventListener('click',function(){editId=null;$('#formTitle').textContent='Новый товар';$('#pform').reset();$('#fColors').innerHTML='';$('#fColors').appendChild(colorRow());renderCatSelect();$('#pform').hidden=false;$('#fN').focus()});
$('#btnCancel').addEventListener('click',function(){$('#pform').hidden=true});
function openEdit(id){
 var p=prod(id);if(!p)return;editId=id;
 $('#formTitle').textContent='Изменить: '+p.n;
 $('#fN').value=p.n;$('#fB').value=p.b;$('#fP').value=p.p;$('#fOld').value=p.old||'';
 $('#fSz').value=(p.sz||[]).join(',');
 renderCatSelect();$('#fCat').value=p.cat;
 $('#fColors').innerHTML='';p.colors.forEach(function(c){$('#fColors').appendChild(colorRow(c))});
 $('#pform').hidden=false;$('#ovAdmin').scrollTo(0,0);
}
function parseSizes(s){
 if(!s.trim())return [36,37,38,39,40,41,42,43,44,45,46];
 var out=[];s.split(',').forEach(function(part){
  part=part.trim();var m=part.match(/^(\d+)\s*-\s*(\d+)$/);
  if(m){for(var i=+m[1];i<=+m[2];i++)out.push(i)}else if(/^\d+$/.test(part))out.push(+part);
 });
 return out.filter(function(v,i,a){return v>=28&&v<=52&&a.indexOf(v)===i}).sort(function(a,b){return a-b});
}
$('#pform').addEventListener('submit',function(e){
 e.preventDefault();
 var rows=$$('#fColors .crow');
 var colors=rows.map(function(d){return {n:d.querySelector('.c-n').value.trim()||'Цвет',h:d.querySelector('.c-h').value,img:(d.querySelector('.c-u').value.trim()||d._img||'')}});
 if(!colors.length)colors=[{n:'Цвет',h:'#cccccc',img:''}];
 var data={n:$('#fN').value.trim(),b:$('#fB').value.trim()||'Без бренда',cat:$('#fCat').value||DB.cats[0]||'Кроссовки',p:+$('#fP').value||0,old:+$('#fOld').value||0,sz:parseSizes($('#fSz').value||''),colors:colors};
 if(!data.n||!data.p){toast('Заполните название и цену');return}
 if(editId){var p=prod(editId);if(p)Object.assign(p,data)}
 else{data.id='p'+Date.now();DB.prods.unshift(data)}
 saveDB();$('#pform').hidden=true;renderCatalog();renderProdList();
 toast(editId?'Товар обновлён':'Товар добавлен в каталог');
});
document.addEventListener('click',function(e){
 var ed=e.target.closest('[data-edit]');if(ed){openEdit(ed.dataset.edit);return}
 var dl=e.target.closest('[data-del]');if(dl){
  var p=prod(dl.dataset.del);if(!p)return;
  if(confirm('Удалить «'+p.n+'» из каталога?')){
   DB.prods.splice(DB.prods.indexOf(p),1);saveDB();renderCatalog();renderProdList();toast('Товар удалён');
  }
 }
});

/* ── база: экспорт / импорт / сброс ─────────────────────── */
$('#btnExport').addEventListener('click',function(){
 var blob=new Blob([JSON.stringify(DB,null,1)],{type:'application/json'});
 var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='shag-db.json';
 document.body.appendChild(a);a.click();a.remove();
 setTimeout(function(){URL.revokeObjectURL(a.href)},2000);
});
$('#btnImport').addEventListener('click',function(){$('#impFile').click()});
$('#impFile').addEventListener('change',function(e){
 var f=e.target.files[0];if(!f)return;
 var r=new FileReader();
 r.onload=function(){try{
  var d=JSON.parse(r.result);
  if(!d||!Array.isArray(d.prods))throw 0;
  d.cats=Array.isArray(d.cats)?d.cats:[];
  DB=d;saveDB();renderCatalog();renderAdmin();toast('База импортирована: товаров: '+DB.prods.length);
 }catch(err){toast('Файл не похож на базу магазина')}};r.readAsText(f);
 e.target.value='';
});
$('#btnReset').addEventListener('click',function(){
 if(confirm('Вернуть демо-каталог? Текущие товары будут заменены.')){DB=clone(SEED);saveDB();renderCatalog();renderAdmin();toast('База сброшена к демо-данным')}
});

/* ── события витрины ────────────────────────────────────── */
$('#catChips').addEventListener('click',function(e){
 var chip=e.target.closest('.chip');if(!chip)return;filter.cat=chip.dataset.cat;
 $$('#catChips .chip').forEach(function(c){c.setAttribute('aria-pressed',c===chip?'true':'false')});applyFilter();
});
$('#brandChips').addEventListener('click',function(e){
 var chip=e.target.closest('.chip');if(!chip)return;filter.brand=chip.dataset.brand;
 $$('#brandChips .chip').forEach(function(c){c.setAttribute('aria-pressed',c===chip?'true':'false')});applyFilter();
});
$('#resetFilter').addEventListener('click',function(){filter.cat='all';filter.brand='all';renderCatalog()});
$('#pgrid').addEventListener('click',function(e){
 var dot=e.target.closest('.dot');
 if(dot){
  var card=dot.closest('.pcard'),ci=+dot.dataset.ci;
  card.dataset.ci=ci;
  dot.parentElement.querySelectorAll('.dot').forEach(function(d){d.setAttribute('aria-pressed',d===dot?'true':'false')});
  var p=prod(card.dataset.id);if(!p)return;
  var media=card.querySelector('.pmedia'),old=media.querySelector('img,.tile');
  var tmp=document.createElement('div');tmp.innerHTML=mediaHTML(p,ci,true);var nu=tmp.firstChild;
  nu.style.opacity='0';media.appendChild(nu);
  if(old)old.remove();
  requestAnimationFrame(function(){requestAnimationFrame(function(){nu.style.opacity='1'})});
  return;
 }
 var btn=e.target.closest('[data-add]');
 if(btn){
  var card2=btn.closest('.pcard');
  add(card2.dataset.id,+card2.dataset.ci||0);
  btn.classList.add('added');btn.textContent='Добавлено';
  setTimeout(function(){btn.classList.remove('added');btn.textContent='В корзину'},1200);
 }
});
$('#cartBtn').addEventListener('click',openCart);
$('#closeCart').addEventListener('click',closeCart);
$('#scrim').addEventListener('click',closeCart);
$('#emptyGo').addEventListener('click',function(){
 closeCart();
 var r=document.getElementById('catalog').getBoundingClientRect();
 window.scrollTo({top:r.top+window.scrollY-72,behavior:'smooth'});
});
$('#checkout').addEventListener('click',waOrder);
$('#cartList').addEventListener('click',function(e){
 var btn=e.target.closest('[data-a]');if(!btn)return;
 var line=btn.closest('.cline'),key=line.dataset.key,it=cart[key];
 if(btn.dataset.a==='inc')it.qty++;
 if(btn.dataset.a==='dec'){it.qty--;if(it.qty<1)delete cart[key]}
 if(btn.dataset.a==='del')delete cart[key];
 renderCart();
});
$('#cartList').addEventListener('change',function(e){
 var sel=e.target.closest('select');if(!sel)return;
 var line=sel.closest('.cline'),key=line.dataset.key,it=cart[key],p=prod(it.id);if(!p)return;
 var isColor=(sel.getAttribute('aria-label')||'').indexOf('Цвет')===0;
 var next=isColor?it.id+':'+sel.value+':'+it.sz:it.id+':'+it.ci+':'+sel.value;
 if(next===key)return;
 delete cart[key];
 if(cart[next])cart[next].qty+=it.qty;
 else{it.ci=+next.split(':')[1];it.sz=+next.split(':')[2];cart[next]=it}
 renderCart();
});

/* ── тема ───────────────────────────────────────────────── */
var mq=window.matchMedia('(prefers-color-scheme: dark)');
document.documentElement.dataset.theme=mq.matches?'dark':'light';
$('#themeBtn').addEventListener('click',function(){
 var r=document.documentElement;
 r.dataset.theme=r.dataset.theme==='dark'?'light':'dark';
});

/* ── старт ──────────────────────────────────────────────── */
syncLoginBtn();
if(isAdm())document.body.classList.add('admin');
renderCatalog();
renderCart();
})();

