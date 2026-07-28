import { harianTools } from './tools/harian.js';
import { converterTools } from './tools/converters.js';
import { textTools } from './tools/text.js';
import { imageTools } from './tools/image.js';
import { devTools } from './tools/dev.js';
import { getFavorites, isFavorite, toggleFavorite, getRecents, pushRecent, getTheme, setTheme } from './helpers.js';

const ALL_TOOLS = [...harianTools, ...converterTools, ...textTools, ...imageTools, ...devTools];
const TOOL_MAP = Object.fromEntries(ALL_TOOLS.map(t => [t.id, t]));
const CATEGORIES = ['Harian', 'Converter', 'Text', 'Image', 'Dev'];
const CATEGORY_CODE = { Harian: 'H', Converter: 'C', Text: 'T', Image: 'I', Dev: 'D' };

// Bin code: each tool's shelf position within its category, e.g. "H-03".
const catCounters = {};
const TOOL_CODE = {};
ALL_TOOLS.forEach((t) => {
  catCounters[t.category] = (catCounters[t.category] || 0) + 1;
  TOOL_CODE[t.id] = `${CATEGORY_CODE[t.category]}-${String(catCounters[t.category]).padStart(2, '0')}`;
});

const els = {
  tabs: document.getElementById('tabs'),
  search: document.getElementById('toolSearch'),
  homeView: document.getElementById('homeView'),
  toolView: document.getElementById('toolView'),
  toolMount: document.getElementById('toolMount'),
  favSection: document.getElementById('favSection'),
  favGrid: document.getElementById('favGrid'),
  recentSection: document.getElementById('recentSection'),
  recentGrid: document.getElementById('recentGrid'),
  mainGrid: document.getElementById('mainGrid'),
  mainGridTitle: document.getElementById('mainGridTitle'),
  noResults: document.getElementById('noResults'),
  backBtn: document.getElementById('backBtn'),
  favToggleBtn: document.getElementById('favToggleBtn'),
  toolCode: document.getElementById('toolCode'),
  themeToggle: document.getElementById('themeToggle'),
  brandLink: document.getElementById('brandLink'),
};

let activeTab = 'all';
let searchQuery = '';

function toolCard(tool) {
  const fav = isFavorite(tool.id);
  const div = document.createElement('div');
  div.className = 'tool-card';
  div.innerHTML = `
    <button class="tool-card__star ${fav ? 'active' : ''}" data-fav="${tool.id}">${fav ? '★' : '☆'}</button>
    <div class="tool-card__tag">${TOOL_CODE[tool.id]}</div>
    <div class="tool-card__name">${tool.name}</div>
    <div class="tool-card__blurb">${tool.blurb || ''}</div>
  `;
  div.addEventListener('click', (e) => {
    if (e.target.closest('[data-fav]')) return;
    location.hash = tool.id;
  });
  div.querySelector('[data-fav]').addEventListener('click', (e) => {
    e.stopPropagation();
    const nowFav = toggleFavorite(tool.id);
    e.target.classList.toggle('active', nowFav);
    e.target.textContent = nowFav ? '★' : '☆';
    renderHome();
  });
  return div;
}

function buildTabs() {
  els.tabs.innerHTML = '';
  const allBtn = document.createElement('button');
  allBtn.className = 'tab' + (activeTab === 'all' ? ' active' : '');
  allBtn.textContent = 'Semua';
  allBtn.onclick = () => { activeTab = 'all'; renderHome(); };
  els.tabs.appendChild(allBtn);
  CATEGORIES.forEach((cat) => {
    const btn = document.createElement('button');
    btn.className = 'tab' + (activeTab === cat ? ' active' : '');
    btn.textContent = cat;
    btn.onclick = () => { activeTab = cat; renderHome(); };
    els.tabs.appendChild(btn);
  });
}

function renderHome() {
  buildTabs();
  const q = searchQuery.trim().toLowerCase();

  const favs = getFavorites().map(id => TOOL_MAP[id]).filter(Boolean);
  if (favs.length && activeTab === 'all' && !q) {
    els.favSection.hidden = false;
    els.favGrid.innerHTML = '';
    favs.forEach(t => els.favGrid.appendChild(toolCard(t)));
  } else {
    els.favSection.hidden = true;
  }

  const recents = getRecents().map(id => TOOL_MAP[id]).filter(Boolean);
  if (recents.length && activeTab === 'all' && !q) {
    els.recentSection.hidden = false;
    els.recentGrid.innerHTML = '';
    recents.forEach(t => els.recentGrid.appendChild(toolCard(t)));
  } else {
    els.recentSection.hidden = true;
  }

  let list = ALL_TOOLS;
  if (activeTab !== 'all') list = list.filter(t => t.category === activeTab);
  if (q) list = list.filter(t => t.name.toLowerCase().includes(q) || (t.blurb || '').toLowerCase().includes(q));

  els.mainGridTitle.textContent = q ? `Hasil pencarian "${searchQuery}"` : activeTab === 'all' ? 'Semua tools' : activeTab;
  els.mainGrid.innerHTML = '';
  list.forEach(t => els.mainGrid.appendChild(toolCard(t)));
  els.noResults.hidden = list.length > 0;
}

function showHome() {
  els.homeView.hidden = false;
  els.toolView.hidden = true;
  document.title = 'Bengkel — Multitool untuk Kerjaan Kecil';
  renderHome();
}

function showTool(tool) {
  els.homeView.hidden = true;
  els.toolView.hidden = false;
  els.toolMount.innerHTML = '';
  tool.mount(els.toolMount);
  document.title = `${tool.name} — Bengkel`;
  pushRecent(tool.id);
  els.toolCode.textContent = TOOL_CODE[tool.id];

  const fav = isFavorite(tool.id);
  els.favToggleBtn.classList.toggle('active', fav);
  els.favToggleBtn.textContent = fav ? '★ Favorit' : '☆ Favoritkan';
  els.favToggleBtn.onclick = () => {
    const nowFav = toggleFavorite(tool.id);
    els.favToggleBtn.classList.toggle('active', nowFav);
    els.favToggleBtn.textContent = nowFav ? '★ Favorit' : '☆ Favoritkan';
  };
  window.scrollTo(0, 0);
}

function route() {
  const id = location.hash.slice(1);
  const tool = TOOL_MAP[id];
  if (tool) showTool(tool); else showHome();
}

window.addEventListener('hashchange', route);
els.backBtn.addEventListener('click', () => { location.hash = ''; });
els.brandLink.addEventListener('click', (e) => { e.preventDefault(); location.hash = ''; });
els.search.addEventListener('input', (e) => { searchQuery = e.target.value; if (!els.homeView.hidden) renderHome(); else if (searchQuery) { location.hash = ''; renderHome(); } });

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  els.themeToggle.textContent = theme === 'dark' ? '🌙' : '☀️';
}
els.themeToggle.addEventListener('click', () => {
  const next = getTheme() === 'dark' ? 'light' : 'dark';
  setTheme(next);
  applyTheme(next);
});
applyTheme(getTheme());

route();
