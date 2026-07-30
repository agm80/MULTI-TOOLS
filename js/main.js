import { harianTools } from './tools/harian.js';
import { converterTools } from './tools/converters.js';
import { textTools } from './tools/text.js';
import { imageTools } from './tools/image.js';
import { devTools } from './tools/dev.js';
import { getFavorites, isFavorite, toggleFavorite, getRecents, pushRecent, getTheme, setTheme } from './helpers.js';

const ALL_TOOLS = [...harianTools, ...converterTools, ...textTools, ...imageTools, ...devTools];
const TOOL_MAP = Object.fromEntries(ALL_TOOLS.map(t => [t.id, t]));
const CATEGORIES = ['Harian', 'Converter', 'Text', 'Image', 'Dev'];

// Small line-icon set (no emoji) — one glyph per category, reused everywhere.
const ICONS = {
  Harian: '<path d="M8 3v4M16 3v4M4 9h16M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z"/>',
  Converter: '<path d="M7 7h11l-3-3M17 17H6l3 3"/>',
  Text: '<path d="M5 6h14M5 12h9M5 18h6"/>',
  Image: '<path d="M4 6h16v12H4z"/><circle cx="9" cy="10" r="1.5"/><path d="M20 16l-5-5-4 4-2-2-5 5"/>',
  Dev: '<path d="M9 8l-4 4 4 4M15 8l4 4-4 4"/>',
  star: '<path d="M12 3l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.2L6.6 19.3l1.3-6-4.6-4.1 6.1-.6L12 3Z"/>',
};
function iconSvg(name, extraClass = '') {
  return `<svg class="${extraClass}" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg>`;
}

const els = {
  nav: document.getElementById('nav'),
  search: document.getElementById('toolSearch'),
  emptyState: document.getElementById('emptyState'),
  toolView: document.getElementById('toolView'),
  toolMount: document.getElementById('toolMount'),
  toolToolbar: document.getElementById('toolToolbar'),
  sidebar: document.getElementById('sidebar'),
  navToggle: document.getElementById('navToggle'),
  navClose: document.getElementById('navClose'),
  backdrop: document.getElementById('backdrop'),
  themeToggle: document.getElementById('themeToggle'),
  brandLink: document.getElementById('brandLink'),
  homeFavSection: document.getElementById('homeFavSection'),
  homeFavGrid: document.getElementById('homeFavGrid'),
  homeRecentSection: document.getElementById('homeRecentSection'),
  homeRecentGrid: document.getElementById('homeRecentGrid'),
  homeCatGrid: document.getElementById('homeCatGrid'),
  categoryView: document.getElementById('categoryView'),
  categoryBack: document.getElementById('categoryBack'),
  categoryEyebrow: document.getElementById('categoryEyebrow'),
  categoryTitle: document.getElementById('categoryTitle'),
  categoryDesc: document.getElementById('categoryDesc'),
  categoryGrid: document.getElementById('categoryGrid'),
};

function openNav() {
  els.sidebar.classList.add('open');
  els.backdrop.classList.add('open');
  document.body.classList.add('nav-open');
}
function closeNav() {
  els.sidebar.classList.remove('open');
  els.backdrop.classList.remove('open');
  document.body.classList.remove('nav-open');
}

let activeQuery = '';

function navItem(tool) {
  const fav = isFavorite(tool.id);
  const item = document.createElement('button');
  item.className = 'nav__item';
  item.dataset.id = tool.id;
  item.innerHTML = `
    <span class="nav__item-icon">${iconSvg(tool.category)}</span>
    <span class="nav__item-name">${tool.name}</span>
    <span class="nav__item-star ${fav ? 'active' : ''}" data-fav="${tool.id}">${fav ? '★' : '☆'}</span>
  `;
  item.addEventListener('click', (e) => {
    if (e.target.closest('[data-fav]')) return;
    location.hash = tool.id;
  });
  item.querySelector('[data-fav]').addEventListener('click', (e) => {
    e.stopPropagation();
    const nowFav = toggleFavorite(tool.id);
    e.target.classList.toggle('active', nowFav);
    e.target.textContent = nowFav ? '★' : '☆';
    if (activeQuery.trim() === '') buildNav('');
  });
  return item;
}

function group(label, tools) {
  if (!tools.length) return '';
  const wrap = document.createElement('div');
  wrap.className = 'nav__group';
  wrap.innerHTML = `<div class="nav__group-label">${label}</div>`;
  tools.forEach(t => wrap.appendChild(navItem(t)));
  return wrap;
}

const CATEGORY_DESC = {
  Harian: 'Kalkulator & utilitas harian',
  Converter: 'Ubah & generate format data',
  Text: 'Olah & analisis teks',
  Image: 'Edit & convert gambar',
  Dev: 'Utilitas buat developer',
};

function tile(tool) {
  const btn = document.createElement('button');
  btn.className = 'tile';
  btn.innerHTML = `${iconSvg(tool.category, 'tile__icon')}<span>${tool.name}</span>`;
  btn.onclick = () => { location.hash = tool.id; };
  return btn;
}

function renderHome() {
  const favs = getFavorites().map(id => TOOL_MAP[id]).filter(Boolean);
  els.homeFavSection.hidden = favs.length === 0;
  els.homeFavGrid.innerHTML = '';
  favs.forEach(t => els.homeFavGrid.appendChild(tile(t)));

  const recents = getRecents().map(id => TOOL_MAP[id]).filter(Boolean);
  els.homeRecentSection.hidden = recents.length === 0;
  els.homeRecentGrid.innerHTML = '';
  recents.forEach(t => els.homeRecentGrid.appendChild(tile(t)));

  els.homeCatGrid.innerHTML = '';
  CATEGORIES.forEach((cat) => {
    const items = ALL_TOOLS.filter(t => t.category === cat);
    const card = document.createElement('button');
    card.className = 'cat-card';
    card.innerHTML = `
      <div class="cat-card__icon-frame">${iconSvg(cat, 'cat-card__icon')}</div>
      <div class="cat-card__name">${cat}</div>
      <div class="cat-card__count">${items.length} tools</div>
    `;
    card.onclick = () => { location.hash = 'cat:' + cat; };
    els.homeCatGrid.appendChild(card);
  });
}
function buildNav(filter = '') {
  activeQuery = filter;
  const f = filter.trim().toLowerCase();
  els.nav.innerHTML = '';

  if (!f) {
    const favs = getFavorites().map(id => TOOL_MAP[id]).filter(Boolean);
    if (favs.length) els.nav.appendChild(group('Favorit', favs));
    const recents = getRecents().map(id => TOOL_MAP[id]).filter(Boolean);
    if (recents.length) els.nav.appendChild(group('Baru dipakai', recents));
  }

  let any = false;
  CATEGORIES.forEach((cat) => {
    const items = ALL_TOOLS.filter(t => t.category === cat &&
      (t.name.toLowerCase().includes(f) || (t.blurb || '').toLowerCase().includes(f)));
    if (items.length) { any = true; els.nav.appendChild(group(cat, items)); }
  });
  if (!any) {
    const p = document.createElement('p');
    p.className = 'nav__empty';
    p.textContent = 'Gak ketemu tool yang cocok.';
    els.nav.appendChild(p);
  }
  markActive();
}

function markActive() {
  const id = location.hash.slice(1);
  els.nav.querySelectorAll('.nav__item').forEach(el => el.classList.toggle('active', el.dataset.id === id));
}

function showCategory(cat) {
  els.emptyState.hidden = true;
  els.toolView.hidden = true;
  els.categoryView.hidden = false;
  document.title = `${cat} — Bengkel`;
  els.categoryEyebrow.textContent = 'Kategori';
  els.categoryTitle.textContent = cat;
  els.categoryDesc.textContent = CATEGORY_DESC[cat] || '';
  els.categoryGrid.innerHTML = '';
  ALL_TOOLS.filter(t => t.category === cat).forEach(t => els.categoryGrid.appendChild(tile(t)));
  window.scrollTo(0, 0);
  closeNav();
}

function showEmpty() {
  els.emptyState.hidden = false;
  els.toolView.hidden = true;
  els.categoryView.hidden = true;
  document.title = 'Bengkel — Multitool untuk Kerjaan Kecil';
  renderHome();
}

function showTool(tool) {
  els.emptyState.hidden = true;
  els.categoryView.hidden = true;
  els.toolView.hidden = false;
  els.toolMount.innerHTML = '';
  tool.mount(els.toolMount);
  document.title = `${tool.name} — Bengkel`;
  pushRecent(tool.id);

  const fav = isFavorite(tool.id);
  els.toolToolbar.innerHTML = `<button class="star-btn ${fav ? 'active' : ''}" id="favToggleBtn">${iconSvg('star')} ${fav ? 'Favorit' : 'Favoritkan'}</button>`;
  els.toolToolbar.querySelector('#favToggleBtn').onclick = (e) => {
    const nowFav = toggleFavorite(tool.id);
    const btn = e.currentTarget;
    btn.classList.toggle('active', nowFav);
    btn.innerHTML = `${iconSvg('star')} ${nowFav ? 'Favorit' : 'Favoritkan'}`;
    if (activeQuery.trim() === '') buildNav('');
  };
  window.scrollTo(0, 0);
  closeNav();
}

function route() {
  const id = location.hash.slice(1);
  if (id.startsWith('cat:')) {
    const cat = decodeURIComponent(id.slice(4));
    if (CATEGORIES.includes(cat)) { showCategory(cat); markActive(); return; }
  }
  const tool = TOOL_MAP[id];
  if (tool) showTool(tool); else showEmpty();
  markActive();
}

window.addEventListener('hashchange', route);
els.categoryBack.addEventListener('click', () => { location.hash = ''; });
els.search.addEventListener('input', (e) => buildNav(e.target.value));
els.navToggle.addEventListener('click', openNav);
els.navClose.addEventListener('click', closeNav);
els.backdrop.addEventListener('click', closeNav);
els.brandLink.addEventListener('click', (e) => { e.preventDefault(); location.hash = ''; });

function applyTheme(theme) { document.documentElement.setAttribute('data-theme', theme); }
els.themeToggle.addEventListener('click', () => {
  const next = getTheme() === 'dark' ? 'light' : 'dark';
  setTheme(next);
  applyTheme(next);
});
applyTheme(getTheme());

buildNav();
route();
