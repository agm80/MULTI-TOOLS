import { header, card, copyText, escapeHtml, downloadBlob } from '../helpers.js';

// ---------- 17. CSS Gradient Generator ----------
function mountCssGradient(mount) {
  header(mount, 'Dev', 'CSS Gradient Generator', 'Susun gradient linear atau radial dengan preview langsung, lalu salin CSS-nya.');
  const c = card(`
    <div class="row">
      <div>
        <label>Warna 1</label>
        <input type="color" id="cg-c1" value="#e8a33d" style="height:44px;padding:4px;cursor:pointer">
      </div>
      <div>
        <label>Warna 2</label>
        <input type="color" id="cg-c2" value="#4fd1c5" style="height:44px;padding:4px;cursor:pointer">
      </div>
    </div>
    <div class="row" style="margin-top:14px">
      <div>
        <label>Tipe</label>
        <select id="cg-type">
          <option value="linear">Linear</option>
          <option value="radial">Radial</option>
        </select>
      </div>
      <div id="cg-angle-wrap">
        <label>Sudut: <span class="slider-val" id="cg-angle-val">90</span>°</label>
        <input type="range" id="cg-angle" min="0" max="360" value="90" style="width:100%">
      </div>
    </div>
    <div id="cg-preview" style="margin-top:18px;height:140px;border-radius:10px;border:1px solid var(--border)"></div>
    <label style="margin-top:16px">CSS</label>
    <div class="output" id="cg-out"></div>
    <div class="btn-row"><button class="btn" id="cg-copy">Salin CSS</button></div>
  `);
  mount.appendChild(c);
  function update() {
    const c1 = c.querySelector('#cg-c1').value;
    const c2 = c.querySelector('#cg-c2').value;
    const type = c.querySelector('#cg-type').value;
    const angle = c.querySelector('#cg-angle').value;
    c.querySelector('#cg-angle-wrap').style.display = type === 'linear' ? 'block' : 'none';
    const css = type === 'linear'
      ? `linear-gradient(${angle}deg, ${c1}, ${c2})`
      : `radial-gradient(circle, ${c1}, ${c2})`;
    c.querySelector('#cg-preview').style.background = css;
    c.querySelector('#cg-out').textContent = `background: ${css};`;
  }
  c.querySelectorAll('#cg-c1,#cg-c2,#cg-type,#cg-angle').forEach(el => el.addEventListener('input', update));
  c.querySelector('#cg-angle').addEventListener('input', (e) => { c.querySelector('#cg-angle-val').textContent = e.target.value; });
  c.querySelector('#cg-copy').onclick = (e) => copyText(c.querySelector('#cg-out').textContent, e.target);
  update();
}

// ---------- 18. Cron Expression Parser ----------
const CRON_FIELDS = ['menit', 'jam', 'tanggal', 'bulan', 'hari'];
function describeCronField(value, unit, names) {
  if (value === '*') return `setiap ${unit}`;
  if (value.includes('/')) {
    const [range, step] = value.split('/');
    return `setiap ${step} ${unit}` + (range !== '*' ? ` mulai ${range}` : '');
  }
  if (value.includes(',')) return `${unit} ${value.split(',').join(', ')}`;
  if (value.includes('-')) return `${unit} ${value.replace('-', ' sampai ')}`;
  return `${unit} ${names ? (names[+value] || value) : value}`;
}
function mountCronParser(mount) {
  header(mount, 'Dev', 'Cron Expression Parser', 'Tempel cron expression, dapat penjelasan dalam bahasa manusia.');
  const c = card(`
    <label>Cron expression (menit jam tanggal bulan hari)</label>
    <input type="text" id="cr-in" value="*/15 9-17 * * 1-5" placeholder="* * * * *">
    <label style="margin-top:16px">Penjelasan</label>
    <div class="output" id="cr-out"></div>
    <div class="hint">Format: menit(0-59) jam(0-23) tanggal(1-31) bulan(1-12) hari(0-6, 0=Minggu)</div>
  `);
  mount.appendChild(c);
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  function run() {
    const parts = c.querySelector('#cr-in').value.trim().split(/\s+/);
    const $out = c.querySelector('#cr-out');
    if (parts.length !== 5) {
      $out.textContent = 'Harus 5 field dipisah spasi: menit jam tanggal bulan hari.';
      $out.classList.add('error');
      return;
    }
    $out.classList.remove('error');
    const [min, hr, dom, mon, dow] = parts;
    const desc = [
      describeCronField(min, 'menit ke'),
      describeCronField(hr, 'jam'),
      dom !== '*' ? describeCronField(dom, 'tanggal') : null,
      mon !== '*' ? describeCronField(mon, 'bulan', months) : null,
      dow !== '*' ? describeCronField(dow, 'hari', days) : null,
    ].filter(Boolean);
    $out.textContent = 'Jalan pada ' + desc.join(', ') + '.';
  }
  c.querySelector('#cr-in').addEventListener('input', run);
  run();
}

// ---------- 19. Timestamp Converter ----------
function mountTimestampConverter(mount) {
  header(mount, 'Dev', 'Timestamp Converter', 'Konversi Unix timestamp ke tanggal yang bisa dibaca, dan sebaliknya.');
  const c = card(`
    <label>Unix timestamp (detik)</label>
    <div class="row">
      <input type="text" id="ts-in" placeholder="1700000000">
      <button class="btn secondary" id="ts-now" style="flex:0 0 auto">Pakai waktu sekarang</button>
    </div>
    <label style="margin-top:16px">Hasil</label>
    <table class="kv">
      <tr><td>Local time</td><td id="ts-local"></td></tr>
      <tr><td>UTC</td><td id="ts-utc"></td></tr>
      <tr><td>ISO 8601</td><td id="ts-iso"></td></tr>
      <tr><td>Relatif</td><td id="ts-rel"></td></tr>
    </table>
    <label style="margin-top:16px">Atau masukkan tanggal</label>
    <input type="datetime-local" id="ts-date">
    <div class="btn-row"><button class="btn" id="ts-todate">Ke Unix timestamp →</button></div>
    <div class="output" id="ts-date-out"></div>
  `);
  mount.appendChild(c);

  function fromTs() {
    const val = c.querySelector('#ts-in').value.trim();
    if (!val || isNaN(val)) return;
    const ms = Number(val) * (val.length <= 10 ? 1000 : 1);
    const d = new Date(ms);
    c.querySelector('#ts-local').textContent = d.toLocaleString();
    c.querySelector('#ts-utc').textContent = d.toUTCString();
    c.querySelector('#ts-iso').textContent = d.toISOString();
    const diffSec = (Date.now() - ms) / 1000;
    const abs = Math.abs(diffSec);
    let rel;
    if (abs < 60) rel = `${Math.round(abs)} detik ${diffSec > 0 ? 'lalu' : 'lagi'}`;
    else if (abs < 3600) rel = `${Math.round(abs / 60)} menit ${diffSec > 0 ? 'lalu' : 'lagi'}`;
    else if (abs < 86400) rel = `${Math.round(abs / 3600)} jam ${diffSec > 0 ? 'lalu' : 'lagi'}`;
    else rel = `${Math.round(abs / 86400)} hari ${diffSec > 0 ? 'lalu' : 'lagi'}`;
    c.querySelector('#ts-rel').textContent = rel;
  }
  c.querySelector('#ts-in').addEventListener('input', fromTs);
  c.querySelector('#ts-now').onclick = () => {
    c.querySelector('#ts-in').value = Math.floor(Date.now() / 1000);
    fromTs();
  };
  c.querySelector('#ts-todate').onclick = () => {
    const val = c.querySelector('#ts-date').value;
    if (!val) return;
    const ts = Math.floor(new Date(val).getTime() / 1000);
    c.querySelector('#ts-date-out').textContent = `${ts}`;
  };
  c.querySelector('#ts-in').value = Math.floor(Date.now() / 1000);
  fromTs();
}

// ---------- 20. UUID Generator ----------
function mountUuidGenerator(mount) {
  header(mount, 'Dev', 'UUID Generator', 'Generate UUID v4 acak, satu atau banyak sekaligus.');
  const c = card(`
    <div class="row">
      <div><label>Jumlah</label><input type="number" id="uu-count" value="5" min="1" max="200"></div>
    </div>
    <div class="btn-row">
      <button class="btn" id="uu-gen">Generate</button>
      <button class="btn secondary" id="uu-copy">Salin semua</button>
    </div>
    <label style="margin-top:16px">Hasil</label>
    <div class="output" id="uu-out"></div>
  `);
  mount.appendChild(c);
  const $out = c.querySelector('#uu-out');
  function gen() {
    const n = Math.max(1, Math.min(200, parseInt(c.querySelector('#uu-count').value, 10) || 1));
    const list = Array.from({ length: n }, () => crypto.randomUUID());
    $out.textContent = list.join('\n');
  }
  c.querySelector('#uu-gen').onclick = gen;
  c.querySelector('#uu-copy').onclick = (e) => copyText($out.textContent, e.target);
  gen();
}

// ---------- 21. Hash Generator ----------
async function sha(algo, text) {
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest(algo, enc);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}
function mountHashGenerator(mount) {
  header(mount, 'Dev', 'Hash Generator', 'Generate hash SHA-1, SHA-256, dan SHA-512 dari teks, langsung di browser.');
  const c = card(`
    <label>Teks</label>
    <textarea id="hg-in" placeholder="Tulis teks yang mau di-hash..."></textarea>
    <div class="btn-row"><button class="btn" id="hg-run">Generate hash</button></div>
    <table class="kv" style="margin-top:16px">
      <tr><td>SHA-1</td><td id="hg-sha1" style="font-family:var(--font-mono);word-break:break-all"></td></tr>
      <tr><td>SHA-256</td><td id="hg-sha256" style="font-family:var(--font-mono);word-break:break-all"></td></tr>
      <tr><td>SHA-512</td><td id="hg-sha512" style="font-family:var(--font-mono);word-break:break-all"></td></tr>
    </table>
    <div class="hint">Catatan: MD5 gak didukung Web Crypto API karena sudah dianggap gak aman — SHA-256 ke atas jadi standar sekarang.</div>
  `);
  mount.appendChild(c);
  c.querySelector('#hg-run').onclick = async () => {
    const text = c.querySelector('#hg-in').value;
    c.querySelector('#hg-sha1').textContent = await sha('SHA-1', text);
    c.querySelector('#hg-sha256').textContent = await sha('SHA-256', text);
    c.querySelector('#hg-sha512').textContent = await sha('SHA-512', text);
  };
}

// ---------- 22. JWT Decoder ----------
function base64UrlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return decodeURIComponent(escape(atob(str)));
}
function mountJwtDecoder(mount) {
  header(mount, 'Dev', 'JWT Decoder', 'Tempel JWT token, lihat isi header dan payload-nya. Cuma decode, gak verifikasi signature.');
  const c = card(`
    <label>JWT Token</label>
    <textarea id="jwt-in" style="min-height:100px" placeholder="eyJhbGciOiJIUzI1NiJ9...."></textarea>
    <label style="margin-top:16px">Header</label>
    <div class="output" id="jwt-header"></div>
    <label style="margin-top:16px">Payload</label>
    <div class="output" id="jwt-payload"></div>
    <div class="hint">⚠ Ini cuma decode isi token, bukan verifikasi keaslian signature-nya.</div>
  `);
  mount.appendChild(c);
  const $in = c.querySelector('#jwt-in');
  function update() {
    const parts = $in.value.trim().split('.');
    const $h = c.querySelector('#jwt-header'), $p = c.querySelector('#jwt-payload');
    if (parts.length < 2) { $h.textContent = ''; $p.textContent = ''; return; }
    try {
      $h.textContent = JSON.stringify(JSON.parse(base64UrlDecode(parts[0])), null, 2);
      $h.classList.remove('error');
    } catch (e) { $h.textContent = 'Header gak valid.'; $h.classList.add('error'); }
    try {
      $p.textContent = JSON.stringify(JSON.parse(base64UrlDecode(parts[1])), null, 2);
      $p.classList.remove('error');
    } catch (e) { $p.textContent = 'Payload gak valid.'; $p.classList.add('error'); }
  }
  $in.addEventListener('input', update);
}

// ---------- 23. JSON Diff ----------
function jdiffLines(a, b) {
  const linesA = a.split('\n'), linesB = b.split('\n');
  const m = linesA.length, n = linesB.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--)
    for (let j = n - 1; j >= 0; j--)
      dp[i][j] = linesA[i] === linesB[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  let i = 0, j = 0; const res = [];
  while (i < m && j < n) {
    if (linesA[i] === linesB[j]) { res.push({ t: 'same', x: linesA[i] }); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { res.push({ t: 'del', x: linesA[i] }); i++; }
    else { res.push({ t: 'add', x: linesB[j] }); j++; }
  }
  while (i < m) { res.push({ t: 'del', x: linesA[i] }); i++; }
  while (j < n) { res.push({ t: 'add', x: linesB[j] }); j++; }
  return res;
}
function mountJsonDiff(mount) {
  header(mount, 'Dev', 'JSON Diff', 'Bandingkan dua blok JSON — otomatis diformat rapi dulu, baru dibandingkan baris per baris.');
  const c = card(`
    <div class="row">
      <div><label>JSON A</label><textarea id="jd-a" style="min-height:160px">{"nama":"Agam","umur":20}</textarea></div>
      <div><label>JSON B</label><textarea id="jd-b" style="min-height:160px">{"nama":"Agam","umur":21,"kota":"Jakarta"}</textarea></div>
    </div>
    <div class="btn-row"><button class="btn" id="jd-run">Bandingkan</button></div>
    <label style="margin-top:16px">Hasil</label>
    <div class="output" id="jd-out"></div>
  `);
  mount.appendChild(c);
  c.querySelector('#jd-run').onclick = () => {
    const $out = c.querySelector('#jd-out');
    try {
      const a = JSON.stringify(JSON.parse(c.querySelector('#jd-a').value), null, 2);
      const b = JSON.stringify(JSON.parse(c.querySelector('#jd-b').value), null, 2);
      const diff = jdiffLines(a, b);
      $out.innerHTML = diff.map(l => {
        const cls = l.t === 'add' ? 'diff-add' : l.t === 'del' ? 'diff-del' : '';
        const prefix = l.t === 'add' ? '+ ' : l.t === 'del' ? '- ' : '  ';
        return `<div class="${cls}">${escapeHtml(prefix + l.x)}</div>`;
      }).join('');
      $out.classList.remove('error');
    } catch (e) {
      $out.textContent = 'JSON gak valid: ' + e.message;
      $out.classList.add('error');
    }
  };
  c.querySelector('#jd-run').click();
}

// ---------- 24. HTTP Status Code Lookup ----------
const HTTP_STATUSES = [
  [200, 'OK', 'Request berhasil'], [201, 'Created', 'Resource baru berhasil dibuat'],
  [204, 'No Content', 'Berhasil, tapi gak ada body response'], [301, 'Moved Permanently', 'Resource pindah permanen'],
  [302, 'Found', 'Redirect sementara'], [304, 'Not Modified', 'Cache masih valid, gak perlu di-download ulang'],
  [400, 'Bad Request', 'Request-nya salah format/invalid'], [401, 'Unauthorized', 'Butuh autentikasi dulu'],
  [403, 'Forbidden', 'Gak punya akses meski udah login'], [404, 'Not Found', 'Resource gak ketemu'],
  [405, 'Method Not Allowed', 'HTTP method gak diizinkan buat endpoint ini'], [408, 'Request Timeout', 'Server nunggu request kelamaan'],
  [409, 'Conflict', 'Request bentrok sama state saat ini'], [418, "I'm a teapot", 'April Fools joke dari HTTP spec asli'],
  [429, 'Too Many Requests', 'Kena rate limit'], [500, 'Internal Server Error', 'Error di sisi server'],
  [502, 'Bad Gateway', 'Server upstream ngasih response gak valid'], [503, 'Service Unavailable', 'Server lagi down/overload'],
  [504, 'Gateway Timeout', 'Server upstream kelamaan respon'],
];
function mountHttpStatus(mount) {
  header(mount, 'Dev', 'HTTP Status Code Lookup', 'Cari arti kode status HTTP yang sering muncul pas kerja sama API.');
  const c = card(`
    <input type="text" id="hs-search" placeholder="Cari kode atau kata kunci (misal: 404, not found)">
    <div id="hs-list" style="margin-top:14px"></div>
  `);
  mount.appendChild(c);
  const $list = c.querySelector('#hs-list');
  function render(filter = '') {
    const f = filter.toLowerCase();
    const items = HTTP_STATUSES.filter(([code, name, desc]) =>
      String(code).includes(f) || name.toLowerCase().includes(f) || desc.toLowerCase().includes(f));
    $list.innerHTML = items.map(([code, name, desc]) => {
      const color = code < 300 ? 'var(--ok)' : code < 400 ? 'var(--cat-converter)' : 'var(--danger)';
      return `<div style="display:flex;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)">
        <div style="font-family:var(--font-mono);font-weight:700;color:${color};width:48px;flex-shrink:0">${code}</div>
        <div><div style="font-weight:600;font-size:13.5px">${name}</div><div style="font-size:12.5px;color:var(--muted)">${desc}</div></div>
      </div>`;
    }).join('') || '<p class="hint">Gak ketemu.</p>';
  }
  c.querySelector('#hs-search').addEventListener('input', (e) => render(e.target.value));
  render();
}

// ---------- 25. Markdown to HTML Exporter ----------
function mdToHtml(md) {
  let html = escapeHtml(md);
  html = html.replace(/^### (.*)$/gm, '<h3>$1</h3>').replace(/^## (.*)$/gm, '<h2>$1</h2>').replace(/^# (.*)$/gm, '<h1>$1</h1>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>').replace(/`(.+?)`/g, '<code>$1</code>');
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
  html = html.replace(/^-\s+(.*)$/gm, '<li>$1</li>').replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
  return html.split(/\n{2,}/).map(b => /^<h\d|^<ul/.test(b.trim()) ? b : `<p>${b.replace(/\n/g, '<br>')}</p>`).join('\n');
}
function mountMdExporter(mount) {
  header(mount, 'Dev', 'Markdown to HTML Exporter', 'Convert Markdown jadi file HTML lengkap, langsung bisa diunduh.');
  const c = card(`
    <label>Markdown</label>
    <textarea id="me-in" style="min-height:200px"># Judul Halaman

Ini **paragraf** dengan *contoh* teks.

- Poin satu
- Poin dua</textarea>
    <div class="btn-row">
      <button class="btn" id="me-download">Unduh sebagai .html</button>
      <button class="btn secondary" id="me-copy">Salin HTML mentah</button>
    </div>
    <label style="margin-top:16px">Preview HTML</label>
    <div class="output" id="me-out" style="font-family:var(--font-body);line-height:1.6"></div>
  `);
  mount.appendChild(c);
  const $in = c.querySelector('#me-in');
  const $out = c.querySelector('#me-out');
  function update() { $out.innerHTML = mdToHtml($in.value); }
  $in.addEventListener('input', update);
  c.querySelector('#me-copy').onclick = (e) => copyText(mdToHtml($in.value), e.target);
  c.querySelector('#me-download').onclick = () => {
    const full = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Exported</title></head><body>${mdToHtml($in.value)}</body></html>`;
    downloadBlob(new Blob([full], { type: 'text/html' }), 'exported.html');
  };
  update();
}

export const devTools = [
  { id: 'css-gradient', name: 'CSS Gradient Generator', icon: '◐', category: 'Dev', blurb: 'Linear/radial gradient + preview', mount: mountCssGradient },
  { id: 'cron-parser', name: 'Cron Expression Parser', icon: '⏱', category: 'Dev', blurb: 'Cron jadi bahasa manusia', mount: mountCronParser },
  { id: 'timestamp-converter', name: 'Timestamp Converter', icon: '🕐', category: 'Dev', blurb: 'Unix timestamp ↔ tanggal', mount: mountTimestampConverter },
  { id: 'uuid-generator', name: 'UUID Generator', icon: '⬡', category: 'Dev', blurb: 'Generate UUID v4 acak', mount: mountUuidGenerator },
  { id: 'hash-generator', name: 'Hash Generator', icon: '#', category: 'Dev', blurb: 'SHA-1, SHA-256, SHA-512', mount: mountHashGenerator },
  { id: 'jwt-decoder', name: 'JWT Decoder', icon: '🔓', category: 'Dev', blurb: 'Lihat isi header & payload JWT', mount: mountJwtDecoder },
  { id: 'json-diff', name: 'JSON Diff', icon: '≠', category: 'Dev', blurb: 'Bandingkan 2 JSON', mount: mountJsonDiff },
  { id: 'http-status', name: 'HTTP Status Code Lookup', icon: '⚡', category: 'Dev', blurb: 'Cari arti kode status HTTP', mount: mountHttpStatus },
  { id: 'md-exporter', name: 'Markdown to HTML Exporter', icon: '⇥', category: 'Dev', blurb: 'Markdown jadi file .html', mount: mountMdExporter },
];
