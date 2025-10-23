// เปิดลิงก์ในแท็บใหม่ทันที + คงตัวกรองหมวด & dropdown
const grid = document.getElementById('grid');
const combo = document.getElementById('appCombo');
const comboInput = document.getElementById('comboInput');
const comboBtn = document.getElementById('comboBtn');
const comboList = document.getElementById('comboList');
const clearBtn = document.getElementById('clearSearch');
const chips = [...document.querySelectorAll('.chip')];

let APPS = [];
let currentCat = 'ALL';
let filtered = [];

async function loadApps(){
  try{
    const res = await fetch('apps.json', {cache:'no-store'});
    APPS = await res.json();
  }catch(e){
    console.error('โหลด apps.json ไม่ได้:', e);
    APPS = [];
  }
}

function setSmartIcon(imgEl, app){
  const cands = [];
  if (app.icon) cands.push(app.icon);
  if (app.id) cands.push(`${app.id}.png`, `${app.id}.jpg`, `${app.id}.svg`);
  cands.push('icon-192.png');
  let i = 0;
  imgEl.onerror = () => { if (i < cands.length - 1) { i++; imgEl.src = cands[i]; } };
  imgEl.src = cands[0];
}

function byCategory(list, cat){
  if(cat === 'ALL') return list.slice();
  return list.filter(a => (a.category || '').toUpperCase() === cat.toUpperCase());
}

function renderGrid(list = APPS){
  grid.innerHTML = '';
  if(list.length === 0){
    const empty = document.createElement('div');
    empty.className = 'card';
    empty.innerHTML = '<div class="app"><div class="icon-wrap"><img class="icon" src="icon-192.png" alt=""></div><div class="name">ไม่พบแอพ</div></div>';
    grid.appendChild(empty);
    return;
  }
  for(const app of list){
    const li = document.createElement('li');
    li.className = 'card app';

    const a = document.createElement('a');
    a.href = app.url || '#';
    a.target = '_blank';
    a.rel = 'noopener';

    const wrap = document.createElement('div');
    wrap.className = 'icon-wrap';

    const img = document.createElement('img');
    img.className = 'icon';
    img.alt = 'ไอคอน ' + (app.name || '');
    setSmartIcon(img, app);

    const name = document.createElement('div');
    name.className = 'name';
    name.textContent = app.name || 'App';

    wrap.appendChild(img);
    a.appendChild(wrap);
    a.appendChild(name);
    li.appendChild(a);
    grid.appendChild(li);
  }
}

function filterByText(list, q){
  const s = (q||'').trim().toLowerCase();
  if(!s) return list.slice();
  return list.filter(a =>
    (a.name||'').toLowerCase().includes(s) ||
    (a.id||'').toLowerCase().includes(s) ||
    (a.category||'').toLowerCase().includes(s)
  );
}

function applyFilters(){
  const q = comboInput.value;
  const fromSearch = filterByText(APPS, q);
  const byCat = byCategory(fromSearch, currentCat);
  filtered = byCat;
  renderGrid(filtered);
  buildList(filtered);
}

function openCombo(){ combo.setAttribute('aria-expanded', 'true'); comboList.hidden = false; }
function closeCombo(){ combo.setAttribute('aria-expanded', 'false'); comboList.hidden = true; comboInput.setAttribute('aria-activedescendant',''); }
function buildList(items){
  comboList.innerHTML = '';
  if(items.length === 0){
    const li = document.createElement('li');
    li.className = 'combo-empty';
    li.textContent = 'ไม่พบผลลัพธ์';
    comboList.appendChild(li);
    return;
  }
  items.slice(0, 100).forEach((app) => {
    const li = document.createElement('li');
    li.id = 'opt-' + app.id;
    li.className = 'combo-item';
    li.role = 'option';
    li.setAttribute('data-id', app.id);

    const img = document.createElement('img');
    setSmartIcon(img, app); img.alt = '';

    const span = document.createElement('span');
    span.innerHTML = app.name + (app.category ? ` <small style="color:#64748b">(${app.category})</small>` : '');

    li.appendChild(img);
    li.appendChild(span);
    li.addEventListener('click', () => { closeCombo(); if (app.url) window.open(app.url, '_blank', 'noopener'); });
    comboList.appendChild(li);
  });
}

comboInput.addEventListener('input', () => { applyFilters(); openCombo(); });
comboInput.addEventListener('keydown', (e) => {
  const items = [...comboList.querySelectorAll('.combo-item')];
  const currentId = comboInput.getAttribute('aria-activedescendant');
  let idx = items.findIndex(el => el.id === currentId);
  if(e.key === 'ArrowDown'){ e.preventDefault(); if(items.length){ idx = (idx+1) % items.length; setActive(items[idx]); } }
  else if(e.key === 'ArrowUp'){ e.preventDefault(); if(items.length){ idx = (idx-1+items.length) % items.length; setActive(items[idx]); } }
  else if(e.key === 'Enter'){
    if(currentId){
      e.preventDefault();
      const el = document.getElementById(currentId);
      const id = el?.getAttribute('data-id');
      const app = APPS.find(a => a.id === id);
      if(app && app.url){ closeCombo(); window.open(app.url, '_blank', 'noopener'); }
    }
  }else if(e.key === 'Escape'){ closeCombo(); }
});
function setActive(el){
  [...comboList.querySelectorAll('.combo-item')].forEach(i=>i.setAttribute('aria-selected','false'));
  el.setAttribute('aria-selected','true');
  comboInput.setAttribute('aria-activedescendant', el.id);
  el.scrollIntoView({block:'nearest'});
}
comboBtn.addEventListener('click', () => { if(comboList.hidden){ buildList(filtered); openCombo(); } else { closeCombo(); } comboInput.focus(); });
document.addEventListener('click', (e)=>{ if(!combo.contains(e.target)){ closeCombo(); } });
clearBtn.addEventListener('click', () => { comboInput.value = ''; applyFilters(); comboInput.focus(); });

chips.forEach(ch => {
  ch.addEventListener('click', () => {
    chips.forEach(c => { c.classList.remove('active'); c.setAttribute('aria-selected','false'); });
    ch.classList.add('active'); ch.setAttribute('aria-selected','true');
    currentCat = ch.dataset.cat;
    applyFilters();
  });
});

(async function init(){
  await loadApps();
  filtered = APPS.slice();
  applyFilters();
})();