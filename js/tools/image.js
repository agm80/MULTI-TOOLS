import { header, card, copyText, downloadBlob } from '../helpers.js';

function makeDropzone(id, accept = 'image/*') {
  return `
    <div class="dropzone" id="${id}-zone">
      <div id="${id}-label">📁 Klik atau drag gambar ke sini</div>
      <input type="file" id="${id}" accept="${accept}">
    </div>
  `;
}
function wireDropzone(c, id, onFile) {
  const zone = c.querySelector(`#${id}-zone`);
  const input = c.querySelector(`#${id}`);
  zone.onclick = () => input.click();
  input.onchange = () => input.files[0] && onFile(input.files[0]);
  zone.ondragover = (e) => { e.preventDefault(); zone.classList.add('drag'); };
  zone.ondragleave = () => zone.classList.remove('drag');
  zone.ondrop = (e) => {
    e.preventDefault(); zone.classList.remove('drag');
    if (e.dataTransfer.files[0]) onFile(e.dataTransfer.files[0]);
  };
}

// ---------- 13. Image Compressor ----------
function mountImageCompressor(mount) {
  header(mount, 'Image', 'Image Compressor', 'Kompres gambar JPEG/PNG langsung di browser dengan kualitas yang bisa diatur.');
  const c = card(`
    ${makeDropzone('ic-file')}
    <div id="ic-controls" hidden style="margin-top:16px">
      <label>Kualitas: <span class="slider-val" id="ic-q-val">80</span>%</label>
      <input type="range" id="ic-q" min="10" max="100" value="80" style="width:100%">
      <div class="row" style="margin-top:14px">
        <div><label>Sebelum</label><img class="preview-img" id="ic-before"></div>
        <div><label>Sesudah <span id="ic-size" class="badge"></span></label><img class="preview-img" id="ic-after"></div>
      </div>
      <div class="btn-row"><button class="btn" id="ic-download">Unduh hasil</button></div>
    </div>
  `);
  mount.appendChild(c);
  let img = new Image();
  let originalSize = 0;
  let resultBlob = null;

  wireDropzone(c, 'ic-file', (file) => {
    originalSize = file.size;
    const reader = new FileReader();
    reader.onload = (e) => {
      img = new Image();
      img.onload = () => {
        c.querySelector('#ic-before').src = e.target.result;
        c.querySelector('#ic-controls').hidden = false;
        compress();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

  function compress() {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    const q = c.querySelector('#ic-q').value / 100;
    canvas.toBlob((blob) => {
      resultBlob = blob;
      c.querySelector('#ic-after').src = URL.createObjectURL(blob);
      const pct = Math.round((1 - blob.size / originalSize) * 100);
      c.querySelector('#ic-size').textContent = `${(blob.size / 1024).toFixed(1)} KB (${pct >= 0 ? '-' : '+'}${Math.abs(pct)}%)`;
    }, 'image/jpeg', q);
  }
  c.querySelector('#ic-q').addEventListener('input', (e) => {
    c.querySelector('#ic-q-val').textContent = e.target.value;
    compress();
  });
  c.querySelector('#ic-download').onclick = () => resultBlob && downloadBlob(resultBlob, 'compressed.jpg');
}

// ---------- 14. Image to Base64 ----------
function mountImageToBase64(mount) {
  header(mount, 'Image', 'Image to Base64', 'Ubah gambar jadi string Base64 / data URI untuk ditempel langsung di kode.');
  const c = card(`
    ${makeDropzone('ib-file')}
    <div id="ib-result" hidden style="margin-top:16px">
      <img class="preview-img" id="ib-preview" style="max-height:160px">
      <label style="margin-top:14px">Data URI</label>
      <textarea id="ib-out" style="min-height:120px" readonly></textarea>
      <div class="btn-row"><button class="btn" id="ib-copy">Salin</button></div>
    </div>
  `);
  mount.appendChild(c);
  wireDropzone(c, 'ib-file', (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      c.querySelector('#ib-preview').src = e.target.result;
      c.querySelector('#ib-out').value = e.target.result;
      c.querySelector('#ib-result').hidden = false;
    };
    reader.readAsDataURL(file);
  });
  c.querySelector('#ib-copy').onclick = (e) => copyText(c.querySelector('#ib-out').value, e.target);
}

// ---------- 15. Favicon Generator ----------
function mountFaviconGenerator(mount) {
  header(mount, 'Image', 'Favicon Generator', 'Upload gambar, dapatkan beberapa ukuran favicon standar sekaligus (16, 32, 48, 180px).');
  const sizes = [16, 32, 48, 180];
  const c = card(`
    ${makeDropzone('fv-file')}
    <div id="fv-result" hidden style="margin-top:16px">
      <div class="row" id="fv-previews"></div>
      <div class="btn-row" id="fv-downloads"></div>
    </div>
  `);
  mount.appendChild(c);
  wireDropzone(c, 'fv-file', (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const previews = c.querySelector('#fv-previews');
        const downloads = c.querySelector('#fv-downloads');
        previews.innerHTML = '';
        downloads.innerHTML = '';
        sizes.forEach((size) => {
          const canvas = document.createElement('canvas');
          canvas.width = size; canvas.height = size;
          canvas.getContext('2d').drawImage(img, 0, 0, size, size);
          const wrap = document.createElement('div');
          wrap.style.textAlign = 'center';
          wrap.innerHTML = `<div style="font-family:var(--font-mono);font-size:11px;color:var(--muted);margin-bottom:6px">${size}×${size}</div>`;
          canvas.style.border = '1px solid var(--border)';
          canvas.style.borderRadius = '6px';
          canvas.style.background = '#fff';
          wrap.appendChild(canvas);
          previews.appendChild(wrap);
          canvas.toBlob((blob) => {
            const a = document.createElement('a');
            a.className = 'btn secondary';
            a.textContent = `Unduh ${size}px`;
            a.href = URL.createObjectURL(blob);
            a.download = `favicon-${size}x${size}.png`;
            downloads.appendChild(a);
          });
        });
        c.querySelector('#fv-result').hidden = false;
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// ---------- 16. Image Resizer ----------
function mountImageResizer(mount) {
  header(mount, 'Image', 'Image Resizer', 'Ubah ukuran gambar dengan opsi kunci rasio aspek, lalu unduh hasilnya.');
  const c = card(`
    ${makeDropzone('ir-file')}
    <div id="ir-controls" hidden style="margin-top:16px">
      <div class="row">
        <div><label>Lebar (px)</label><input type="number" id="ir-w"></div>
        <div><label>Tinggi (px)</label><input type="number" id="ir-h"></div>
      </div>
      <label style="display:flex;align-items:center;gap:8px;margin-top:10px;font-family:var(--font-body);color:var(--text)">
        <input type="checkbox" id="ir-lock" checked> Kunci rasio aspek
      </label>
      <div class="btn-row">
        <button class="btn" id="ir-resize">Resize</button>
        <button class="btn secondary" id="ir-download">Unduh</button>
      </div>
      <label style="margin-top:16px">Preview</label>
      <img class="preview-img" id="ir-preview">
    </div>
  `);
  mount.appendChild(c);
  let img = new Image();
  let ratio = 1;
  let resultBlob = null;

  wireDropzone(c, 'ir-file', (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      img = new Image();
      img.onload = () => {
        ratio = img.width / img.height;
        c.querySelector('#ir-w').value = img.width;
        c.querySelector('#ir-h').value = img.height;
        c.querySelector('#ir-controls').hidden = false;
        c.querySelector('#ir-preview').src = e.target.result;
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

  const $w = c.querySelector('#ir-w'), $h = c.querySelector('#ir-h');
  $w.addEventListener('input', () => { if (c.querySelector('#ir-lock').checked) $h.value = Math.round($w.value / ratio); });
  $h.addEventListener('input', () => { if (c.querySelector('#ir-lock').checked) $w.value = Math.round($h.value * ratio); });

  c.querySelector('#ir-resize').onclick = () => {
    const w = parseInt($w.value, 10), h = parseInt($h.value, 10);
    if (!w || !h) return;
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    canvas.getContext('2d').drawImage(img, 0, 0, w, h);
    canvas.toBlob((blob) => {
      resultBlob = blob;
      c.querySelector('#ir-preview').src = URL.createObjectURL(blob);
    });
  };
  c.querySelector('#ir-download').onclick = () => resultBlob && downloadBlob(resultBlob, 'resized.png');
}

export const imageTools = [
  { id: 'image-compressor', name: 'Image Compressor', icon: '🗜', category: 'Image', mount: mountImageCompressor },
  { id: 'image-to-base64', name: 'Image to Base64', icon: '⇄', category: 'Image', mount: mountImageToBase64 },
  { id: 'favicon-generator', name: 'Favicon Generator', icon: '◈', category: 'Image', mount: mountFaviconGenerator },
  { id: 'image-resizer', name: 'Image Resizer', icon: '⤢', category: 'Image', mount: mountImageResizer },
];
