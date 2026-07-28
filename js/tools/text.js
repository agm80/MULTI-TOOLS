import { header, card, copyText, escapeHtml } from '../helpers.js';

// ---------- 9. Text Case Converter ----------
function toTitleCase(str) {
  return str.replace(/\w\S*/g, (t) => t[0].toUpperCase() + t.slice(1).toLowerCase());
}
function toCamelCase(str) {
  return str.trim().toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase());
}
function toSnakeCase(str) {
  return str.trim().toLowerCase().replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}
function toKebabCase(str) {
  return str.trim().toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
function mountTextCase(mount) {
  header(mount, 'Text', 'Text Case Converter', 'Ubah teks ke berbagai format huruf: UPPER, lower, Title, camelCase, snake_case, kebab-case.');
  const c = card(`
    <label>Teks input</label>
    <textarea id="tc-in" placeholder="Tulis teks di sini..."></textarea>
    <div class="btn-row">
      <button class="btn secondary" data-mode="upper">UPPERCASE</button>
      <button class="btn secondary" data-mode="lower">lowercase</button>
      <button class="btn secondary" data-mode="title">Title Case</button>
      <button class="btn secondary" data-mode="camel">camelCase</button>
      <button class="btn secondary" data-mode="snake">snake_case</button>
      <button class="btn secondary" data-mode="kebab">kebab-case</button>
    </div>
    <label style="margin-top:16px">Hasil</label>
    <div class="output" id="tc-out"></div>
    <div class="btn-row"><button class="btn" id="tc-copy">Salin hasil</button></div>
  `);
  mount.appendChild(c);
  const $in = c.querySelector('#tc-in');
  const $out = c.querySelector('#tc-out');
  c.querySelectorAll('[data-mode]').forEach((btn) => {
    btn.onclick = () => {
      const v = $in.value;
      const map = {
        upper: v.toUpperCase(),
        lower: v.toLowerCase(),
        title: toTitleCase(v),
        camel: toCamelCase(v),
        snake: toSnakeCase(v),
        kebab: toKebabCase(v),
      };
      $out.textContent = map[btn.dataset.mode];
    };
  });
  c.querySelector('#tc-copy').onclick = (e) => copyText($out.textContent, e.target);
}

// ---------- 10. Markdown Previewer ----------
function renderMarkdown(md) {
  let html = escapeHtml(md);
  html = html.replace(/^### (.*)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*)$/gm, '<h1>$1</h1>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/`(.+?)`/g, '<code>$1</code>');
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  html = html.replace(/^\> (.*)$/gm, '<blockquote>$1</blockquote>');
  html = html.replace(/^-\s+(.*)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
  html = html.split(/\n{2,}/).map(block => {
    if (/^<h\d|^<ul|^<blockquote/.test(block.trim())) return block;
    return `<p>${block.replace(/\n/g, '<br>')}</p>`;
  }).join('\n');
  return html;
}
function mountMarkdownPreview(mount) {
  header(mount, 'Text', 'Markdown Previewer', 'Tulis Markdown di sebelah kiri, lihat hasil render-nya langsung di sebelah kanan.');
  const c = card(`
    <div class="row">
      <div>
        <label>Markdown</label>
        <textarea id="md-in" style="min-height:280px">## Halo dunia

Ini **contoh** markdown dengan *italic* dan \`inline code\`.

- Item satu
- Item dua

> Kutipan singkat.

[Link ke Anthropic](https://anthropic.com)</textarea>
      </div>
      <div>
        <label>Preview</label>
        <div class="output" id="md-out" style="min-height:280px;font-family:var(--font-body);line-height:1.6"></div>
      </div>
    </div>
  `);
  mount.appendChild(c);
  const $in = c.querySelector('#md-in');
  const $out = c.querySelector('#md-out');
  const update = () => ($out.innerHTML = renderMarkdown($in.value));
  $in.addEventListener('input', update);
  update();
}

// ---------- 11. Diff Checker ----------
function diffLines(a, b) {
  const linesA = a.split('\n');
  const linesB = b.split('\n');
  const m = linesA.length, n = linesB.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--)
    for (let j = n - 1; j >= 0; j--)
      dp[i][j] = linesA[i] === linesB[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  let i = 0, j = 0;
  const result = [];
  while (i < m && j < n) {
    if (linesA[i] === linesB[j]) { result.push({ type: 'same', text: linesA[i] }); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { result.push({ type: 'del', text: linesA[i] }); i++; }
    else { result.push({ type: 'add', text: linesB[j] }); j++; }
  }
  while (i < m) { result.push({ type: 'del', text: linesA[i] }); i++; }
  while (j < n) { result.push({ type: 'add', text: linesB[j] }); j++; }
  return result;
}
function mountDiffChecker(mount) {
  header(mount, 'Text', 'Diff Checker', 'Bandingkan dua blok teks baris per baris — tambahan dan pengurangan ditandai warna.');
  const c = card(`
    <div class="row">
      <div><label>Teks A (asli)</label><textarea id="diff-a" style="min-height:160px"></textarea></div>
      <div><label>Teks B (baru)</label><textarea id="diff-b" style="min-height:160px"></textarea></div>
    </div>
    <div class="btn-row"><button class="btn" id="diff-run">Bandingkan</button></div>
    <label style="margin-top:16px">Hasil</label>
    <div class="output" id="diff-out"></div>
  `);
  mount.appendChild(c);
  c.querySelector('#diff-run').onclick = () => {
    const a = c.querySelector('#diff-a').value;
    const b = c.querySelector('#diff-b').value;
    const lines = diffLines(a, b);
    const html = lines.map(l => {
      const cls = l.type === 'add' ? 'diff-add' : l.type === 'del' ? 'diff-del' : '';
      const prefix = l.type === 'add' ? '+ ' : l.type === 'del' ? '- ' : '  ';
      return `<div class="${cls}">${escapeHtml(prefix + l.text)}</div>`;
    }).join('');
    c.querySelector('#diff-out').innerHTML = html || '<span style="color:var(--muted)">Tidak ada perbedaan.</span>';
  };
}

// ---------- 12. Regex Tester ----------
function mountRegexTester(mount) {
  header(mount, 'Text', 'Regex Tester', 'Coba pola regex terhadap teks dan lihat semua bagian yang cocok, dengan highlight langsung.');
  const c = card(`
    <div class="row">
      <div style="flex:2">
        <label>Pattern</label>
        <input type="text" id="rx-pattern" placeholder="\\b[A-Z][a-z]+\\b">
      </div>
      <div>
        <label>Flags</label>
        <input type="text" id="rx-flags" value="g" placeholder="g, i, m">
      </div>
    </div>
    <label style="margin-top:14px">Teks uji</label>
    <textarea id="rx-text" style="min-height:140px" placeholder="Tempel teks yang mau dicoba di sini..."></textarea>
    <label style="margin-top:16px">Hasil (highlight) <span id="rx-count" class="badge" style="margin-left:8px"></span></label>
    <div class="output" id="rx-out"></div>
  `);
  mount.appendChild(c);
  const $p = c.querySelector('#rx-pattern');
  const $f = c.querySelector('#rx-flags');
  const $t = c.querySelector('#rx-text');
  const $out = c.querySelector('#rx-out');
  const $count = c.querySelector('#rx-count');

  function run() {
    const pattern = $p.value;
    const text = $t.value;
    if (!pattern) { $out.textContent = ''; $count.textContent = ''; return; }
    try {
      const flags = $f.value.includes('g') ? $f.value : $f.value + 'g';
      const re = new RegExp(pattern, flags);
      let match, last = 0, html = '', count = 0;
      while ((match = re.exec(text)) !== null) {
        count++;
        html += escapeHtml(text.slice(last, match.index));
        html += `<mark style="background:var(--amber);color:#1a1305;border-radius:3px;padding:0 2px">${escapeHtml(match[0])}</mark>`;
        last = match.index + match[0].length;
        if (match[0] === '') re.lastIndex++;
      }
      html += escapeHtml(text.slice(last));
      $out.innerHTML = html || '<span style="color:var(--muted)">Tidak ada kecocokan.</span>';
      $count.textContent = `${count} match`;
      $count.className = count ? 'badge ok' : 'badge';
    } catch (e) {
      $out.innerHTML = `<span style="color:var(--red)">Regex error: ${escapeHtml(e.message)}</span>`;
      $count.textContent = '';
    }
  }
  $p.addEventListener('input', run);
  $f.addEventListener('input', run);
  $t.addEventListener('input', run);
}

export const textTools = [
  { id: 'text-case', name: 'Text Case Converter', icon: 'Aa', category: 'Text', mount: mountTextCase },
  { id: 'markdown-preview', name: 'Markdown Previewer', icon: '📝', category: 'Text', mount: mountMarkdownPreview },
  { id: 'diff-checker', name: 'Diff Checker', icon: '≠', category: 'Text', mount: mountDiffChecker },
  { id: 'regex-tester', name: 'Regex Tester', icon: '.*', category: 'Text', mount: mountRegexTester },
];
