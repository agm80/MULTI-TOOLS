import { converterTools } from './tools/converters.js';
import { textTools } from './tools/text.js';
import { imageTools } from './tools/image.js';
import { devTools } from './tools/dev.js';

const ALL_TOOLS = [...converterTools, ...textTools, ...imageTools, ...devTools];
const CATEGORY_ORDER = ['Converter', 'Text', 'Image', 'Dev'];

const nav = document.getElementById('pegboard__nav');
const toolMount = document.getElementById('toolMount');
const emptyState = document.getElementById('emptyState');
const search = document.getElementById('toolSearch');
const pegboard = document.getElementById('pegboard');
const navToggle = document.getElementById('navToggle');

function buildNav(filter = '') {
  nav.innerHTML = '';
  const f = filter.trim().toLowerCase();
  CATEGORY_ORDER.forEach((cat) => {
    const items = ALL_TOOLS.filter(t => t.category === cat && t.name.toLowerCase().includes(f));
    if (!items.length) return;
    const group = document.createElement('div');
    group.className = 'pegboard__group';
    group.innerHTML = `<div class="pegboard__group-label">${cat}</div>`;
    items.forEach((tool) => {
      const a = document.createElement('a');
      a.className = 'pegboard__item';
      a.href = `#${tool.id}`;
      a.dataset.id = tool.id;
      a.innerHTML = `<span class="pegboard__item-icon">${tool.icon}</span><span class="pegboard__item-name">${tool.name}</span>`;
      group.appendChild(a);
    });
    nav.appendChild(group);
  });
}

function loadTool(id) {
  const tool = ALL_TOOLS.find(t => t.id === id);
  nav.querySelectorAll('.pegboard__item').forEach(el => el.classList.toggle('active', el.dataset.id === id));
  if (!tool) {
    emptyState.hidden = false;
    toolMount.hidden = true;
    toolMount.innerHTML = '';
    return;
  }
  emptyState.hidden = true;
  toolMount.hidden = false;
  toolMount.innerHTML = '';
  tool.mount(toolMount);
  document.title = `${tool.name} — Bengkel`;
  pegboard.classList.remove('open');
}

window.addEventListener('hashchange', () => loadTool(location.hash.slice(1)));
search.addEventListener('input', (e) => {
  buildNav(e.target.value);
  const active = location.hash.slice(1);
  if (active) nav.querySelectorAll('.pegboard__item').forEach(el => el.classList.toggle('active', el.dataset.id === active));
});
navToggle.addEventListener('click', () => pegboard.classList.toggle('open'));

buildNav();
loadTool(location.hash.slice(1));
