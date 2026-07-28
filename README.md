# 🔧 Bengkel — Multitool Web

Koleksi 21 tools kecil yang sering kepake sehari-hari — converter, text tools, image tools, dan dev tools — dikumpulkan jadi satu situs statis. Semuanya jalan **100% di browser**: gak ada backend, gak ada database, gak ada data yang dikirim ke server manapun.

## Daftar tools

**Converter**
JSON Formatter · Base64 Encode/Decode · URL Encoder/Decoder · Color Converter · QR Code Generator · Password Generator · Lorem Ipsum Generator · Word & Character Counter

**Text**
Text Case Converter · Markdown Previewer · Diff Checker · Regex Tester

**Image**
Image Compressor · Image to Base64 · Favicon Generator · Image Resizer

**Dev**
CSS Gradient Generator · Cron Expression Parser · Timestamp Converter · UUID Generator · Hash Generator

## Tech stack

Vanilla HTML, CSS, dan JavaScript (ES modules) — tanpa framework, tanpa build step, tanpa `npm install`. Tinggal deploy folder ini apa adanya ke Vercel atau Netlify.

## Struktur

```
multitool/
├── index.html          ← shell halaman + sidebar
├── style.css            ← semua styling
├── js/
│   ├── main.js           ← router: baca URL hash, tampilkan tool yang aktif
│   ├── helpers.js        ← fungsi bantu (copy, download, dll)
│   └── tools/
│       ├── converters.js ← 8 tools (JSON, Base64, URL, Color, QR, Password, Lorem, Word Counter)
│       ├── text.js       ← 4 tools (Case, Markdown, Diff, Regex)
│       ├── image.js      ← 4 tools (Compress, to Base64, Favicon, Resize)
│       └── dev.js        ← 5 tools (Gradient, Cron, Timestamp, UUID, Hash)
├── vercel.json
└── netlify.toml
```

Nambah tool baru = bikin fungsi `mount(container)` baru di file kategori yang sesuai, terus daftarkan di array export-nya. Gak perlu sentuh file lain.

## Cara coba di HP/laptop dulu sebelum deploy

Karena filenya pakai ES module (`type="module"`), gak bisa dibuka langsung dobel klik `index.html` (browser akan blokir karena `file://`). Harus lewat server lokal kecil:

```bash
cd multitool
python3 -m http.server 8000
```

Lalu buka `http://localhost:8000` di browser.
