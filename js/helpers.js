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
