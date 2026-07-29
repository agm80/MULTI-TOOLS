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

// ---------- 17. Color Palette Extractor ----------
function mountPaletteExtractor(mount) {
  header(mount, 'Image', 'Color Palette Extractor', 'Upload gambar, dapatkan 5 warna dominan yang muncul di dalamnya.');
  const c = card(`
    ${makeDropzone('pe-file')}
    <div id="pe-result" hidden style="margin-top:16px">
      <img class="preview-img" id="pe-preview" style="max-height:200px">
      <div class="row" id="pe-swatches" style="margin-top:14px"></div>
    </div>
  `);
  mount.appendChild(c);
  wireDropzone(c, 'pe-file', (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        c.querySelector('#pe-preview').src = e.target.result;
        const canvas = document.createElement('canvas');
        const w = canvas.width = 80, h = canvas.height = Math.round(80 * img.height / img.width);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const data = ctx.getImageData(0, 0, w, h).data;
        const buckets = {};
        for (let i = 0; i < data.length; i += 4) {
          const r = Math.round(data[i] / 32) * 32, g = Math.round(data[i + 1] / 32) * 32, b = Math.round(data[i + 2] / 32) * 32;
          const key = `${r},${g},${b}`;
          buckets[key] = (buckets[key] || 0) + 1;
        }
        const top = Object.entries(buckets).sort((a, b) => b[1] - a[1]).slice(0, 5);
        const swatches = c.querySelector('#pe-swatches');
        swatches.innerHTML = '';
        top.forEach(([rgb]) => {
          const [r, g, b] = rgb.split(',').map(Number);
          const hex = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
          const div = document.createElement('div');
          div.innerHTML = `<div class="swatch" style="background:${hex};cursor:pointer" title="Klik buat salin"></div><div style="text-align:center;font-family:var(--font-mono);font-size:12px;margin-top:6px">${hex}</div>`;
          div.querySelector('.swatch').onclick = (ev) => copyText(hex, ev.target);
          swatches.appendChild(div);
        });
        c.querySelector('#pe-result').hidden = false;
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// ---------- 18. Grayscale / Sepia Filter ----------
function mountImageFilter(mount) {
  header(mount, 'Image', 'Grayscale / Sepia Filter', 'Ubah gambar jadi hitam-putih atau sephia langsung di browser.');
  const c = card(`
    ${makeDropzone('if-file')}
    <div id="if-controls" hidden style="margin-top:16px">
      <div class="btn-row">
        <button class="btn secondary" data-filter="none">Original</button>
        <button class="btn secondary" data-filter="gray">Grayscale</button>
        <button class="btn secondary" data-filter="sepia">Sepia</button>
      </div>
      <img class="preview-img" id="if-preview" style="margin-top:14px">
      <div class="btn-row"><button class="btn" id="if-download">Unduh hasil</button></div>
    </div>
  `);
  mount.appendChild(c);
  let img = new Image();
  let resultBlob = null;
  wireDropzone(c, 'if-file', (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      img = new Image();
      img.onload = () => {
        c.querySelector('#if-preview').src = e.target.result;
        c.querySelector('#if-controls').hidden = false;
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
  c.querySelectorAll('[data-filter]').forEach(btn => {
    btn.onclick = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width; canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const filter = btn.dataset.filter;
      if (filter !== 'none') {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
          const gray = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
          if (filter === 'gray') { d[i] = d[i + 1] = d[i + 2] = gray; }
          else if (filter === 'sepia') {
            d[i] = Math.min(255, gray + 40); d[i + 1] = Math.min(255, gray + 20); d[i + 2] = Math.max(0, gray - 20);
          }
        }
        ctx.putImageData(imgData, 0, 0);
      }
      canvas.toBlob((blob) => { resultBlob = blob; c.querySelector('#if-preview').src = URL.createObjectURL(blob); });
    };
  });
  c.querySelector('#if-download').onclick = () => resultBlob && downloadBlob(resultBlob, 'filtered.png');
}

// ---------- 19. Meme Generator ----------
function mountMemeGenerator(mount) {
  header(mount, 'Image', 'Meme Generator', 'Upload gambar, tambahin teks atas & bawah ala meme klasik, unduh hasilnya.');
  const c = card(`
    ${makeDropzone('mg-file')}
    <div id="mg-controls" hidden style="margin-top:16px">
      <div class="row">
        <div><label>Teks atas</label><input type="text" id="mg-top" value="TERNYATA"></div>
        <div><label>Teks bawah</label><input type="text" id="mg-bottom" value="INI CUMA MEME"></div>
      </div>
      <canvas id="mg-canvas" style="max-width:100%;border-radius:10px;border:1px solid var(--border);margin-top:14px"></canvas>
      <div class="btn-row"><button class="btn" id="mg-download">Unduh meme</button></div>
    </div>
  `);
  mount.appendChild(c);
  let img = new Image();
  wireDropzone(c, 'mg-file', (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      img = new Image();
      img.onload = () => { c.querySelector('#mg-controls').hidden = false; draw(); };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
  function draw() {
    const canvas = c.querySelector('#mg-canvas');
    canvas.width = img.width; canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const fontSize = Math.round(img.width / 10);
    ctx.font = `900 ${fontSize}px Impact, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = fontSize / 15;
    const top = c.querySelector('#mg-top').value.toUpperCase();
    const bottom = c.querySelector('#mg-bottom').value.toUpperCase();
    ctx.textBaseline = 'top';
    ctx.strokeText(top, img.width / 2, 10);
    ctx.fillText(top, img.width / 2, 10);
    ctx.textBaseline = 'bottom';
    ctx.strokeText(bottom, img.width / 2, img.height - 10);
    ctx.fillText(bottom, img.width / 2, img.height - 10);
  }
  c.querySelector('#mg-top').addEventListener('input', draw);
  c.querySelector('#mg-bottom').addEventListener('input', draw);
  c.querySelector('#mg-download').onclick = () => {
    c.querySelector('#mg-canvas').toBlob((blob) => downloadBlob(blob, 'meme.png'));
  };
}

// ---------- 20. Image Cropper ----------
function mountImageCropper(mount) {
  header(mount, 'Image', 'Image Cropper', 'Pilih area gambar dengan drag, lalu potong dan unduh hasilnya.');
  const c = card(`
    ${makeDropzone('cr-file')}
    <div id="cr-controls" hidden style="margin-top:16px">
      <div style="position:relative;display:inline-block;max-width:100%">
        <img id="cr-img" draggable="false" style="max-width:100%;display:block;border-radius:8px;-webkit-user-drag:none">
        <div id="cr-box" style="position:absolute;border:2px dashed var(--accent);background:rgba(110,98,229,0.15);cursor:move;touch-action:none">
          <div id="cr-handle" style="position:absolute;right:-8px;bottom:-8px;width:18px;height:18px;background:var(--accent);border-radius:50%;cursor:nwse-resize;touch-action:none"></div>
        </div>
      </div>
      <div class="btn-row">
        <button class="btn" id="cr-crop">Potong</button>
        <button class="btn secondary" id="cr-download" hidden>Unduh hasil</button>
      </div>
      <img class="preview-img" id="cr-result" style="margin-top:14px" hidden>
    </div>
  `);
  mount.appendChild(c);
  let img = new Image();
  let scale = 1;

  wireDropzone(c, 'cr-file', (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      img = new Image();
      img.onload = () => {
        const $img = c.querySelector('#cr-img');
        $img.src = e.target.result;
        c.querySelector('#cr-controls').hidden = false;
        $img.onload = () => {
          scale = img.width / $img.clientWidth;
          const box = c.querySelector('#cr-box');
          const bw = $img.clientWidth * 0.5, bh = $img.clientHeight * 0.5;
          Object.assign(box.style, { left: bw / 2 + 'px', top: bh / 2 + 'px', width: bw + 'px', height: bh + 'px' });
        };
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

  const box = c.querySelector('#cr-box');
  const handle = c.querySelector('#cr-handle');
  let dragging = false, startX, startY, origLeft, origTop;
  box.addEventListener('pointerdown', (e) => {
    if (e.target === handle) return;
    dragging = true; startX = e.clientX; startY = e.clientY;
    origLeft = box.offsetLeft; origTop = box.offsetTop;
    box.setPointerCapture(e.pointerId);
  });
  box.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    box.style.left = Math.max(0, origLeft + (e.clientX - startX)) + 'px';
    box.style.top = Math.max(0, origTop + (e.clientY - startY)) + 'px';
  });
  box.addEventListener('pointerup', () => { dragging = false; });

  let resizing = false, resizeStartX, resizeStartY, origW, origH;
  handle.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    resizing = true; resizeStartX = e.clientX; resizeStartY = e.clientY;
    origW = box.offsetWidth; origH = box.offsetHeight;
    handle.setPointerCapture(e.pointerId);
  });
  handle.addEventListener('pointermove', (e) => {
    if (!resizing) return;
    box.style.width = Math.max(24, origW + (e.clientX - resizeStartX)) + 'px';
    box.style.height = Math.max(24, origH + (e.clientY - resizeStartY)) + 'px';
  });
  handle.addEventListener('pointerup', () => { resizing = false; });

  c.querySelector('#cr-crop').onclick = () => {
    const $img = c.querySelector('#cr-img');
    const cropX = box.offsetLeft * scale, cropY = box.offsetTop * scale;
    const cropW = box.offsetWidth * scale, cropH = box.offsetHeight * scale;
    const canvas = document.createElement('canvas');
    canvas.width = cropW; canvas.height = cropH;
    canvas.getContext('2d').drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
    const $result = c.querySelector('#cr-result');
    $result.src = canvas.toDataURL('image/png');
    $result.hidden = false;
    const $dl = c.querySelector('#cr-download');
    $dl.hidden = false;
    $dl.onclick = () => canvas.toBlob((blob) => downloadBlob(blob, 'cropped.png'));
  };
}

export const imageTools = [
  { id: 'image-compressor', name: 'Image Compressor', icon: '🗜', category: 'Image', blurb: 'Kompres JPEG/PNG dengan kualitas atur', mount: mountImageCompressor },
  { id: 'image-to-base64', name: 'Image to Base64', icon: '⇄', category: 'Image', blurb: 'Gambar jadi data URI', mount: mountImageToBase64 },
  { id: 'favicon-generator', name: 'Favicon Generator', icon: '◈', category: 'Image', blurb: 'Generate beberapa ukuran favicon', mount: mountFaviconGenerator },
  { id: 'image-resizer', name: 'Image Resizer', icon: '⤢', category: 'Image', blurb: 'Ubah ukuran, kunci rasio aspek', mount: mountImageResizer },
  { id: 'palette-extractor', name: 'Color Palette Extractor', icon: '🎨', category: 'Image', blurb: '5 warna dominan dari gambar', mount: mountPaletteExtractor },
  { id: 'image-filter', name: 'Grayscale / Sepia Filter', icon: '◑', category: 'Image', blurb: 'Filter hitam-putih atau sepia', mount: mountImageFilter },
  { id: 'meme-generator', name: 'Meme Generator', icon: '😂', category: 'Image', blurb: 'Teks atas-bawah ala meme klasik', mount: mountMemeGenerator },
  { id: 'image-cropper', name: 'Image Cropper', icon: '✂', category: 'Image', blurb: 'Potong area gambar dengan drag', mount: mountImageCropper },
];
