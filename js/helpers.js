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
    showToast('Tersalin ke clipboard');
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
export function setFavorites(list) { writeJSON(LS_FAV, Array.isArray(list) ? list : []); }
export function isFavorite(id) { return getFavorites().includes(id); }
export function toggleFavorite(id) {
  const favs = getFavorites();
  const idx = favs.indexOf(id);
  if (idx === -1) favs.push(id); else favs.splice(idx, 1);
  writeJSON(LS_FAV, favs);
  return favs.includes(id);
}

export function getRecents() { return readJSON(LS_RECENT, []); }
export function setRecents(list) { writeJSON(LS_RECENT, Array.isArray(list) ? list : []); }
export function pushRecent(id) {
  let recents = getRecents().filter(r => r !== id);
  recents.unshift(id);
  recents = recents.slice(0, 8);
  writeJSON(LS_RECENT, recents);
}

export function getTheme() { return localStorage.getItem(LS_THEME) || 'dark'; }
export function setTheme(theme) { localStorage.setItem(LS_THEME, theme); }

// ---- Usage stats ----
const LS_USAGE = 'bengkel:usage';
export function trackUsage(id) {
  const usage = readJSON(LS_USAGE, {});
  usage[id] = (usage[id] || 0) + 1;
  writeJSON(LS_USAGE, usage);
}
export function getUsageStats() {
  const usage = readJSON(LS_USAGE, {});
  return Object.entries(usage)
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => b.count - a.count);
}

// ---- Export / import personal data (favorites, recents, usage) ----
export function exportData() {
  return JSON.stringify({
    version: 1,
    exportedAt: new Date().toISOString(),
    favorites: getFavorites(),
    recents: getRecents(),
    usage: readJSON(LS_USAGE, {}),
  }, null, 2);
}
export function importData(jsonString) {
  const data = JSON.parse(jsonString);
  if (Array.isArray(data.favorites)) setFavorites(data.favorites);
  if (Array.isArray(data.recents)) setRecents(data.recents);
  if (data.usage && typeof data.usage === 'object') writeJSON(LS_USAGE, data.usage);
  return true;
}

// ---- Toast notification ----
let toastTimer = null;
export function showToast(message) {
  let toast = document.getElementById('bengkelToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'bengkelToast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('toast--show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('toast--show'), 1600);
}
