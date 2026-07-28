// Small shared helpers used by every tool module.

export function header(mount, eyebrow, title, desc) {
  mount.innerHTML = `
    <div class="tool-eyebrow">${eyebrow}</div>
    <h1 class="tool-title">${title}</h1>
    <p class="tool-desc">${desc}</p>
  `;
}

export function card(html) {
  const div = document.createElement('div');
  div.className = 'card';
  div.innerHTML = html;
  return div;
}

export async function copyText(text, btn) {
  try {
    await navigator.clipboard.writeText(text);
    if (btn) {
      const original = btn.textContent;
      btn.textContent = 'Tersalin ✓';
      setTimeout(() => (btn.textContent = original), 1200);
    }
  } catch (e) {
    alert('Gagal menyalin ke clipboard.');
  }
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function debounce(fn, ms = 200) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

export function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ---- Persisted state (favorites, recents, theme) ----
const LS_FAV = 'bengkel:favorites';
const LS_RECENT = 'bengkel:recents';
const LS_THEME = 'bengkel:theme';

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) { return fallback; }
}
function writeJSON(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* storage unavailable, ignore */ }
}

export function getFavorites() { return readJSON(LS_FAV, []); }
export function isFavorite(id) { return getFavorites().includes(id); }
export function toggleFavorite(id) {
  const favs = getFavorites();
  const idx = favs.indexOf(id);
  if (idx === -1) favs.push(id); else favs.splice(idx, 1);
  writeJSON(LS_FAV, favs);
  return favs.includes(id);
}

export function getRecents() { return readJSON(LS_RECENT, []); }
export function pushRecent(id) {
  let recents = getRecents().filter(r => r !== id);
  recents.unshift(id);
  recents = recents.slice(0, 8);
  writeJSON(LS_RECENT, recents);
}

export function getTheme() { return localStorage.getItem(LS_THEME) || 'dark'; }
export function setTheme(theme) { localStorage.setItem(LS_THEME, theme); }
