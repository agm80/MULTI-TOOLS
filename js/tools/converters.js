import { header, card, copyText } from '../helpers.js';

// ---------- 1. JSON Formatter ----------
function mountJsonFormatter(mount) {
  header(mount, 'Converter', 'JSON Formatter', 'Rapikan atau validasi JSON. Error ditunjukkan langsung kalau formatnya salah.');
  const c = card(`
    <label>Input JSON</label>
    <textarea id="jf-in" placeholder='{"contoh": [1,2,3], "ok": true}'></textarea>
    <div class="btn-row">
      <button class="btn" id="jf-format">Format</button>
      <button class="btn secondary" id="jf-minify">Minify</button>
      <button class="btn secondary" id="jf-copy">Salin hasil</button>
    </div>
    <label style="margin-top:16px">Hasil</label>
    <div class="output" id="jf-out"></div>
  `);
  mount.appendChild(c);

  const $in = c.querySelector('#jf-in');
  const $out = c.querySelector('#jf-out');

  function run(minify) {
    const val = $in.value.trim();
    if (!val) { $out.textContent = ''; $out.classList.remove('error'); return; }
    try {
      const parsed = JSON.parse(val);
      $out.textContent = minify ? JSON.stringify(parsed) : JSON.stringify(parsed, null, 2);
      $out.classList.remove('error');
    } catch (e) {
      $out.textContent = 'Error: ' + e.message;
      $out.classList.add('error');
    }
  }

  c.querySelector('#jf-format').onclick = () => run(false);
  c.querySelector('#jf-minify').onclick = () => run(true);
  c.querySelector('#jf-copy').onclick = (e) => copyText($out.textContent, e.target);
}

// ---------- 2. Base64 Encode/Decode ----------
function mountBase64(mount) {
  header(mount, 'Converter', 'Base64 Encode / Decode', 'Ubah teks ke Base64 atau sebaliknya. Mendukung karakter UTF-8.');
  const c = card(`
    <label>Teks / Base64</label>
    <textarea id="b64-in" placeholder="Tulis teks di sini..."></textarea>
    <div class="btn-row">
      <button class="btn" id="b64-enc">Encode →</button>
      <button class="btn secondary" id="b64-dec">Decode ←</button>
      <button class="btn secondary" id="b64-copy">Salin hasil</button>
    </div>
    <label style="margin-top:16px">Hasil</label>
    <div class="output" id="b64-out"></div>
  `);
  mount.appendChild(c);
  const $in = c.querySelector('#b64-in');
  const $out = c.querySelector('#b64-out');

  c.querySelector('#b64-enc').onclick = () => {
    try {
      $out.textContent = btoa(unescape(encodeURIComponent($in.value)));
      $out.classList.remove('error');
    } catch (e) { $out.textContent = 'Error: ' + e.message; $out.classList.add('error'); }
  };
  c.querySelector('#b64-dec').onclick = () => {
    try {
      $out.textContent = decodeURIComponent(escape(atob($in.value.trim())));
      $out.classList.remove('error');
    } catch (e) { $out.textContent = 'Bukan Base64 yang valid.'; $out.classList.add('error'); }
  };
  c.querySelector('#b64-copy').onclick = (e) => copyText($out.textContent, e.target);
}

// ---------- 3. URL Encoder/Decoder ----------
function mountUrlEncoder(mount) {
  header(mount, 'Converter', 'URL Encoder / Decoder', 'Encode karakter spesial untuk dipakai di URL, atau decode balik ke bentuk aslinya.');
  const c = card(`
    <label>Teks / URL</label>
    <textarea id="url-in" placeholder="https://contoh.com/cari?q=halo dunia"></textarea>
    <div class="btn-row">
      <button class="btn" id="url-enc">Encode →</button>
      <button class="btn secondary" id="url-dec">Decode ←</button>
      <button class="btn secondary" id="url-copy">Salin hasil</button>
    </div>
    <label style="margin-top:16px">Hasil</label>
    <div class="output" id="url-out"></div>
  `);
  mount.appendChild(c);
  const $in = c.querySelector('#url-in');
  const $out = c.querySelector('#url-out');
  c.querySelector('#url-enc').onclick = () => { $out.textContent = encodeURIComponent($in.value); $out.classList.remove('error'); };
  c.querySelector('#url-dec').onclick = () => {
    try { $out.textContent = decodeURIComponent($in.value); $out.classList.remove('error'); }
    catch (e) { $out.textContent = 'Gagal decode: format tidak valid.'; $out.classList.add('error'); }
  };
  c.querySelector('#url-copy').onclick = (e) => copyText($out.textContent, e.target);
}

// ---------- 4. Color Converter ----------
function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const num = parseInt(hex, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}
function mountColorConverter(mount) {
  header(mount, 'Converter', 'Color Converter', 'Konversi warna antara HEX, RGB, dan HSL secara langsung.');
  const c = card(`
    <div class="row">
      <div>
        <label>Pilih warna</label>
        <input type="color" id="col-picker" value="#e8a33d" style="height:44px;padding:4px;cursor:pointer">
      </div>
      <div>
        <label>HEX</label>
        <input type="text" id="col-hex" value="#e8a33d">
      </div>
    </div>
    <div class="swatch" id="col-swatch" style="margin-top:16px;background:#e8a33d"></div>
    <table class="kv" style="margin-top:16px">
      <tr><td>HEX</td><td id="col-out-hex">#e8a33d</td></tr>
      <tr><td>RGB</td><td id="col-out-rgb"></td></tr>
      <tr><td>HSL</td><td id="col-out-hsl"></td></tr>
    </table>
  `);
  mount.appendChild(c);
  const $picker = c.querySelector('#col-picker');
  const $hex = c.querySelector('#col-hex');
  const $swatch = c.querySelector('#col-swatch');

  function update(hex) {
    if (!/^#?[0-9a-fA-F]{3}$|^#?[0-9a-fA-F]{6}$/.test(hex)) return;
    if (!hex.startsWith('#')) hex = '#' + hex;
    const { r, g, b } = hexToRgb(hex);
    const { h, s, l } = rgbToHsl(r, g, b);
    $swatch.style.background = hex;
    $picker.value = hex.length === 4 ? '#' + hex.slice(1).split('').map(c => c + c).join('') : hex;
    c.querySelector('#col-out-hex').textContent = hex;
    c.querySelector('#col-out-rgb').textContent = `rgb(${r}, ${g}, ${b})`;
    c.querySelector('#col-out-hsl').textContent = `hsl(${h}, ${s}%, ${l}%)`;
  }
  $picker.oninput = (e) => { $hex.value = e.target.value; update(e.target.value); };
  $hex.oninput = (e) => update(e.target.value);
  update('#e8a33d');
}

// ---------- 5. QR Code Generator ----------
function mountQrGenerator(mount) {
  header(mount, 'Converter', 'QR Code Generator', 'Bikin QR code dari teks atau link, langsung bisa diunduh sebagai PNG.');
  const c = card(`
    <label>Teks atau URL</label>
    <input type="text" id="qr-in" placeholder="https://contoh.com">
    <div class="btn-row"><button class="btn" id="qr-gen">Generate</button></div>
    <div id="qr-holder" style="margin-top:18px;text-align:center"></div>
  `);
  mount.appendChild(c);
  const $in = c.querySelector('#qr-in');
  const $holder = c.querySelector('#qr-holder');

  c.querySelector('#qr-gen').onclick = () => {
    const val = $in.value.trim();
    if (!val) return;
    $holder.innerHTML = '';
    const img = document.createElement('img');
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(val)}`;
    img.alt = 'QR code';
    img.style.borderRadius = '8px';
    img.style.background = '#fff';
    img.style.padding = '12px';
    $holder.appendChild(img);
    const dl = document.createElement('div');
    dl.className = 'btn-row';
    dl.style.justifyContent = 'center';
    dl.innerHTML = `<a class="btn secondary" href="${img.src}" download="qrcode.png" target="_blank" rel="noopener">Unduh PNG</a>`;
    $holder.appendChild(dl);
  };
  $in.addEventListener('keydown', (e) => { if (e.key === 'Enter') c.querySelector('#qr-gen').click(); });
}

// ---------- 6. Password Generator ----------
function mountPasswordGenerator(mount) {
  header(mount, 'Converter', 'Password Generator', 'Generate password acak dan aman langsung di browser — gak pernah dikirim kemana-mana.');
  const c = card(`
    <label>Panjang: <span class="slider-val" id="pw-len-val">16</span></label>
    <input type="range" id="pw-len" min="4" max="64" value="16" style="width:100%">
    <div class="row" style="margin-top:14px">
      <label style="display:flex;align-items:center;gap:8px;font-family:var(--font-body);color:var(--text)"><input type="checkbox" id="pw-upper" checked> Huruf besar (A-Z)</label>
      <label style="display:flex;align-items:center;gap:8px;font-family:var(--font-body);color:var(--text)"><input type="checkbox" id="pw-lower" checked> Huruf kecil (a-z)</label>
    </div>
    <div class="row" style="margin-top:6px">
      <label style="display:flex;align-items:center;gap:8px;font-family:var(--font-body);color:var(--text)"><input type="checkbox" id="pw-num" checked> Angka (0-9)</label>
      <label style="display:flex;align-items:center;gap:8px;font-family:var(--font-body);color:var(--text)"><input type="checkbox" id="pw-sym" checked> Simbol (!@#$)</label>
    </div>
    <div class="btn-row">
      <button class="btn" id="pw-gen">Generate</button>
      <button class="btn secondary" id="pw-copy">Salin</button>
    </div>
    <label style="margin-top:16px">Hasil</label>
    <div class="output" id="pw-out" style="font-size:16px;letter-spacing:1px"></div>
    <div class="hint" id="pw-strength"></div>
  `);
  mount.appendChild(c);

  const $len = c.querySelector('#pw-len');
  const $lenVal = c.querySelector('#pw-len-val');
  const $out = c.querySelector('#pw-out');
  $len.oninput = () => ($lenVal.textContent = $len.value);

  function gen() {
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lower = 'abcdefghijkmnopqrstuvwxyz';
    const nums = '23456789';
    const syms = '!@#$%^&*()-_=+[]{}';
    let pool = '';
    if (c.querySelector('#pw-upper').checked) pool += upper;
    if (c.querySelector('#pw-lower').checked) pool += lower;
    if (c.querySelector('#pw-num').checked) pool += nums;
    if (c.querySelector('#pw-sym').checked) pool += syms;
    if (!pool) { $out.textContent = 'Pilih minimal 1 jenis karakter.'; return; }
    const len = parseInt($len.value, 10);
    const bytes = new Uint32Array(len);
    crypto.getRandomValues(bytes);
    let result = '';
    for (let i = 0; i < len; i++) result += pool[bytes[i] % pool.length];
    $out.textContent = result;
    const strength = pool.length * len > 200 ? 'Kuat' : pool.length * len > 100 ? 'Cukup' : 'Lemah — tambah panjang atau jenis karakter';
    c.querySelector('#pw-strength').textContent = `Estimasi kekuatan: ${strength}`;
  }
  c.querySelector('#pw-gen').onclick = gen;
  c.querySelector('#pw-copy').onclick = (e) => copyText($out.textContent, e.target);
  gen();
}

// ---------- 7. Lorem Ipsum Generator ----------
const LOREM_WORDS = ('lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore ' +
  'et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo ' +
  'consequat duis aute irure in reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint ' +
  'occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum').split(' ');

function loremSentence() {
  const len = 6 + Math.floor(Math.random() * 10);
  let words = [];
  for (let i = 0; i < len; i++) words.push(LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]);
  words[0] = words[0][0].toUpperCase() + words[0].slice(1);
  return words.join(' ') + '.';
}
function loremParagraph() {
  const sentences = 3 + Math.floor(Math.random() * 4);
  return Array.from({ length: sentences }, loremSentence).join(' ');
}
function mountLoremIpsum(mount) {
  header(mount, 'Converter', 'Lorem Ipsum Generator', 'Bikin teks placeholder dengan cepat, satuannya bisa paragraf, kalimat, atau kata.');
  const c = card(`
    <div class="row">
      <div>
        <label>Jumlah</label>
        <input type="number" id="li-count" value="3" min="1" max="50">
      </div>
      <div>
        <label>Satuan</label>
        <select id="li-unit">
          <option value="paragraph">Paragraf</option>
          <option value="sentence">Kalimat</option>
          <option value="word">Kata</option>
        </select>
      </div>
    </div>
    <div class="btn-row">
      <button class="btn" id="li-gen">Generate</button>
      <button class="btn secondary" id="li-copy">Salin</button>
    </div>
    <label style="margin-top:16px">Hasil</label>
    <div class="output" id="li-out"></div>
  `);
  mount.appendChild(c);
  const $out = c.querySelector('#li-out');
  c.querySelector('#li-gen').onclick = () => {
    const count = Math.max(1, Math.min(50, parseInt(c.querySelector('#li-count').value, 10) || 1));
    const unit = c.querySelector('#li-unit').value;
    let result;
    if (unit === 'paragraph') result = Array.from({ length: count }, loremParagraph).join('\n\n');
    else if (unit === 'sentence') result = Array.from({ length: count }, loremSentence).join(' ');
    else result = Array.from({ length: count }, () => LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]).join(' ');
    $out.textContent = result;
  };
  c.querySelector('#li-copy').onclick = (e) => copyText($out.textContent, e.target);
  c.querySelector('#li-gen').click();
}

// ---------- 8. Word / Character Counter ----------
function mountWordCounter(mount) {
  header(mount, 'Converter', 'Word & Character Counter', 'Hitung kata, karakter, kalimat, dan estimasi waktu baca secara real-time.');
  const c = card(`
    <label>Teks</label>
    <textarea id="wc-in" style="min-height:220px" placeholder="Tempel atau ketik teks di sini..."></textarea>
    <table class="kv" style="margin-top:16px">
      <tr><td>Kata</td><td id="wc-words">0</td></tr>
      <tr><td>Karakter (termasuk spasi)</td><td id="wc-chars">0</td></tr>
      <tr><td>Karakter (tanpa spasi)</td><td id="wc-chars-ns">0</td></tr>
      <tr><td>Kalimat</td><td id="wc-sentences">0</td></tr>
      <tr><td>Paragraf</td><td id="wc-paragraphs">0</td></tr>
      <tr><td>Estimasi waktu baca</td><td id="wc-time">0 detik</td></tr>
    </table>
  `);
  mount.appendChild(c);
  const $in = c.querySelector('#wc-in');
  function update() {
    const text = $in.value;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const charsNs = text.replace(/\s/g, '').length;
    const sentences = (text.match(/[.!?]+(\s|$)/g) || []).length;
    const paragraphs = text.trim() ? text.trim().split(/\n\s*\n/).length : 0;
    const minutes = words / 200;
    const timeStr = minutes < 1 ? `${Math.round(minutes * 60)} detik` : `${minutes.toFixed(1)} menit`;
    c.querySelector('#wc-words').textContent = words;
    c.querySelector('#wc-chars').textContent = chars;
    c.querySelector('#wc-chars-ns').textContent = charsNs;
    c.querySelector('#wc-sentences').textContent = sentences;
    c.querySelector('#wc-paragraphs').textContent = paragraphs;
    c.querySelector('#wc-time').textContent = timeStr;
  }
  $in.addEventListener('input', update);
  update();
}

// ---------- 9. Number Base Converter ----------
function mountNumberBase(mount) {
  header(mount, 'Converter', 'Number Base Converter', 'Konversi angka antara biner, oktal, desimal, dan heksadesimal secara langsung.');
  const c = card(`
    <div class="row">
      <div><label>Desimal</label><input type="text" id="nb-dec" value="255"></div>
      <div><label>Biner</label><input type="text" id="nb-bin"></div>
    </div>
    <div class="row" style="margin-top:14px">
      <div><label>Oktal</label><input type="text" id="nb-oct"></div>
      <div><label>Heksadesimal</label><input type="text" id="nb-hex"></div>
    </div>
  `);
  mount.appendChild(c);
  const $dec = c.querySelector('#nb-dec'), $bin = c.querySelector('#nb-bin');
  const $oct = c.querySelector('#nb-oct'), $hex = c.querySelector('#nb-hex');

  function update(from, value) {
    const base = { dec: 10, bin: 2, oct: 8, hex: 16 }[from];
    const n = parseInt(value, base);
    if (isNaN(n) || value.trim() === '') return;
    if ($dec !== document.activeElement) $dec.value = n.toString(10);
    if ($bin !== document.activeElement) $bin.value = n.toString(2);
    if ($oct !== document.activeElement) $oct.value = n.toString(8);
    if ($hex !== document.activeElement) $hex.value = n.toString(16).toUpperCase();
  }
  $dec.addEventListener('input', () => update('dec', $dec.value));
  $bin.addEventListener('input', () => update('bin', $bin.value));
  $oct.addEventListener('input', () => update('oct', $oct.value));
  $hex.addEventListener('input', () => update('hex', $hex.value));
  update('dec', '255');
}

// ---------- 10. Slug Generator ----------
function mountSlugGenerator(mount) {
  header(mount, 'Converter', 'Slug Generator', 'Ubah judul jadi slug URL-friendly (lowercase, dash-separated) buat link artikel atau produk.');
  const c = card(`
    <label>Judul / teks</label>
    <input type="text" id="sg-in" value="Cara Bikin Server Minecraft Sendiri!">
    <label style="margin-top:16px">Slug</label>
    <div class="output" id="sg-out"></div>
    <div class="btn-row"><button class="btn" id="sg-copy">Salin</button></div>
  `);
  mount.appendChild(c);
  const $in = c.querySelector('#sg-in');
  const $out = c.querySelector('#sg-out');
  function update() {
    const slug = $in.value.trim().toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
    $out.textContent = slug;
  }
  $in.addEventListener('input', update);
  c.querySelector('#sg-copy').onclick = (e) => copyText($out.textContent, e.target);
  update();
}

// ---------- 11. Random Name / Username Generator ----------
const NAME_ADJ = ['Swift', 'Silent', 'Crimson', 'Golden', 'Shadow', 'Frozen', 'Blazing', 'Mystic', 'Iron', 'Cosmic', 'Rogue', 'Lunar'];
const NAME_NOUN = ['Wolf', 'Falcon', 'Phoenix', 'Ranger', 'Ninja', 'Knight', 'Tiger', 'Dragon', 'Hunter', 'Pixel', 'Comet', 'Raven'];
function mountUsernameGenerator(mount) {
  header(mount, 'Converter', 'Random Name / Username Generator', 'Generate ide username acak — kepake buat akun game, forum, atau server Minecraft/Discord.');
  const c = card(`
    <div class="row">
      <div><label>Jumlah</label><input type="number" id="ug-count" value="8" min="1" max="30"></div>
      <div><label>Tambahkan angka?</label>
        <select id="ug-num"><option value="yes">Ya</option><option value="no">Tidak</option></select>
      </div>
    </div>
    <div class="btn-row"><button class="btn" id="ug-gen">Generate</button></div>
    <label style="margin-top:16px">Hasil</label>
    <div class="output" id="ug-out"></div>
  `);
  mount.appendChild(c);
  c.querySelector('#ug-gen').onclick = () => {
    const n = Math.max(1, Math.min(30, parseInt(c.querySelector('#ug-count').value, 10) || 1));
    const withNum = c.querySelector('#ug-num').value === 'yes';
    const list = Array.from({ length: n }, () => {
      const adj = NAME_ADJ[Math.floor(Math.random() * NAME_ADJ.length)];
      const noun = NAME_NOUN[Math.floor(Math.random() * NAME_NOUN.length)];
      const num = withNum ? Math.floor(Math.random() * 900 + 100) : '';
      return `${adj}${noun}${num}`;
    });
    c.querySelector('#ug-out').textContent = list.join('\n');
  };
  c.querySelector('#ug-gen').click();
}

// ---------- 12. Barcode Generator ----------
function mountBarcodeGenerator(mount) {
  header(mount, 'Converter', 'Barcode Generator', 'Bikin barcode format CODE128 dari teks atau angka, langsung bisa diunduh sebagai SVG.');
  const c = card(`
    <label>Teks / angka</label>
    <input type="text" id="bc-in" value="1234567890">
    <div class="btn-row"><button class="btn" id="bc-gen">Generate</button></div>
    <div id="bc-holder" style="margin-top:18px;text-align:center;background:#fff;border-radius:10px;padding:12px"></div>
    <div class="btn-row" id="bc-dl-row"></div>
  `);
  mount.appendChild(c);
  const $holder = c.querySelector('#bc-holder');
  const $dlRow = c.querySelector('#bc-dl-row');

  function gen() {
    const val = c.querySelector('#bc-in').value.trim();
    if (!val || typeof JsBarcode === 'undefined') return;
    $holder.innerHTML = '<svg id="bc-svg"></svg>';
    try {
      JsBarcode('#bc-svg', val, { format: 'CODE128', lineColor: '#000', width: 2, height: 80, displayValue: true });
      $dlRow.innerHTML = '';
      const svg = c.querySelector('#bc-svg');
      const svgData = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const a = document.createElement('a');
      a.className = 'btn secondary';
      a.textContent = 'Unduh SVG';
      a.href = URL.createObjectURL(blob);
      a.download = 'barcode.svg';
      $dlRow.appendChild(a);
    } catch (e) {
      $holder.innerHTML = `<span style="color:var(--danger)">Gagal generate: teks tidak valid buat CODE128.</span>`;
    }
  }
  c.querySelector('#bc-gen').onclick = gen;
  gen();
}

// ---------- 13. Text to ASCII Art ----------
const ASCII_FONT = {
  A: [' █ ', '█ █', '███', '█ █', '█ █'], B: ['██ ', '█ █', '██ ', '█ █', '██ '],
  C: [' ██', '█  ', '█  ', '█  ', ' ██'], D: ['██ ', '█ █', '█ █', '█ █', '██ '],
  E: ['███', '█  ', '██ ', '█  ', '███'], F: ['███', '█  ', '██ ', '█  ', '█  '],
  G: [' ██', '█  ', '█ █', '█ █', ' ██'], H: ['█ █', '█ █', '███', '█ █', '█ █'],
  I: ['███', ' █ ', ' █ ', ' █ ', '███'], J: ['  █', '  █', '  █', '█ █', ' █ '],
  K: ['█ █', '█ █', '██ ', '█ █', '█ █'], L: ['█  ', '█  ', '█  ', '█  ', '███'],
  M: ['█ █', '███', '███', '█ █', '█ █'], N: ['█ █', '███', '███', '███', '█ █'],
  O: [' █ ', '█ █', '█ █', '█ █', ' █ '], P: ['██ ', '█ █', '██ ', '█  ', '█  '],
  Q: [' █ ', '█ █', '█ █', '███', ' ██'], R: ['██ ', '█ █', '██ ', '█ █', '█ █'],
  S: [' ██', '█  ', ' █ ', '  █', '██ '], T: ['███', ' █ ', ' █ ', ' █ ', ' █ '],
  U: ['█ █', '█ █', '█ █', '█ █', ' █ '], V: ['█ █', '█ █', '█ █', '█ █', ' █ '],
  W: ['█ █', '█ █', '███', '███', '█ █'], X: ['█ █', '█ █', ' █ ', '█ █', '█ █'],
  Y: ['█ █', '█ █', ' █ ', ' █ ', ' █ '], Z: ['███', '  █', ' █ ', '█  ', '███'],
  0: [' █ ', '█ █', '█ █', '█ █', ' █ '], 1: [' █ ', '██ ', ' █ ', ' █ ', '███'],
  2: ['██ ', '  █', ' █ ', '█  ', '███'], 3: ['██ ', '  █', ' █ ', '  █', '██ '],
  4: ['█ █', '█ █', '███', '  █', '  █'], 5: ['███', '█  ', '██ ', '  █', '██ '],
  6: [' ██', '█  ', '██ ', '█ █', ' █ '], 7: ['███', '  █', ' █ ', ' █ ', ' █ '],
  8: [' █ ', '█ █', ' █ ', '█ █', ' █ '], 9: [' █ ', '█ █', ' ██', '  █', ' █ '],
  ' ': ['  ', '  ', '  ', '  ', '  '], '!': ['█', '█', '█', ' ', '█'],
  '?': ['██', ' █', ' █', '  ', ' █'], '.': [' ', ' ', ' ', ' ', '█'],
};
function mountAsciiArt(mount) {
  header(mount, 'Converter', 'Text to ASCII Art', 'Ubah teks pendek jadi banner ASCII art blok — kepake buat header file README atau iseng-iseng terminal.');
  const c = card(`
    <label>Teks (huruf, angka, spasi — maks 12 karakter)</label>
    <input type="text" id="aa-in" value="HELLO" maxlength="12">
    <label style="margin-top:16px">Hasil</label>
    <div class="output" id="aa-out" style="font-size:12px;line-height:1.3"></div>
    <div class="btn-row"><button class="btn" id="aa-copy">Salin</button></div>
  `);
  mount.appendChild(c);
  const $in = c.querySelector('#aa-in');
  const $out = c.querySelector('#aa-out');
  function update() {
    const text = $in.value.toUpperCase();
    const rows = ['', '', '', '', ''];
    for (const ch of text) {
      const glyph = ASCII_FONT[ch] || ASCII_FONT['?'];
      for (let i = 0; i < 5; i++) rows[i] += (glyph[i] || '   ') + ' ';
    }
    $out.textContent = rows.join('\n');
  }
  $in.addEventListener('input', update);
  c.querySelector('#aa-copy').onclick = (e) => copyText($out.textContent, e.target);
  update();
}

export const converterTools = [
  { id: 'json-formatter', name: 'JSON Formatter', icon: '{ }', category: 'Converter', blurb: 'Rapikan & validasi JSON', mount: mountJsonFormatter },
  { id: 'base64', name: 'Base64 Encode/Decode', icon: '⇄', category: 'Converter', blurb: 'Teks ke Base64, dan sebaliknya', mount: mountBase64 },
  { id: 'url-encoder', name: 'URL Encoder/Decoder', icon: '%', category: 'Converter', blurb: 'Encode karakter buat URL', mount: mountUrlEncoder },
  { id: 'color-converter', name: 'Color Converter', icon: '🎨', category: 'Converter', blurb: 'HEX, RGB, HSL saling konversi', mount: mountColorConverter },
  { id: 'qr-generator', name: 'QR Code Generator', icon: '▦', category: 'Converter', blurb: 'Bikin QR dari teks/link', mount: mountQrGenerator },
  { id: 'password-generator', name: 'Password Generator', icon: '🔑', category: 'Converter', blurb: 'Password acak yang aman', mount: mountPasswordGenerator },
  { id: 'lorem-ipsum', name: 'Lorem Ipsum Generator', icon: '¶', category: 'Converter', blurb: 'Teks placeholder buat mockup', mount: mountLoremIpsum },
  { id: 'word-counter', name: 'Word & Char Counter', icon: '#', category: 'Converter', blurb: 'Hitung kata & karakter', mount: mountWordCounter },
  { id: 'number-base', name: 'Number Base Converter', icon: '10²', category: 'Converter', blurb: 'Biner, oktal, desimal, hex', mount: mountNumberBase },
  { id: 'slug-generator', name: 'Slug Generator', icon: '/-/', category: 'Converter', blurb: 'Judul jadi slug URL', mount: mountSlugGenerator },
  { id: 'username-generator', name: 'Random Name/Username', icon: '👤', category: 'Converter', blurb: 'Ide username acak', mount: mountUsernameGenerator },
  { id: 'barcode-generator', name: 'Barcode Generator', icon: '▮▯', category: 'Converter', blurb: 'Barcode CODE128 dari teks', mount: mountBarcodeGenerator },
  { id: 'ascii-art', name: 'Text to ASCII Art', icon: '▓', category: 'Converter', blurb: 'Teks jadi banner ASCII', mount: mountAsciiArt },
];
