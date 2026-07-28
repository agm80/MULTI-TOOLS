# 🔧 Bengkel — Multitool Web

Koleksi 48 tools kecil yang sering kepake sehari-hari — kalkulator harian, converter, text tools, image tools, dan dev tools — dikumpulkan jadi satu situs. Semuanya jalan **100% di browser**: gak ada backend, gak ada database, gak ada data yang dikirim ke server manapun.

## Fitur situs

- ⭐ **Favorit** — pin tool yang sering dipake, tersimpan di browser kamu (localStorage)
- 🕐 **Baru dipakai** — 8 tool terakhir yang dibuka otomatis muncul di beranda
- 🌙/☀️ **Tema gelap & terang** — tinggal klik ikon di pojok kanan atas
- 🔍 **Pencarian** — cari tool dari 48 pilihan tanpa scroll manual
- 📱 **Installable (PWA)** — bisa di-"Add to Home Screen" di HP

## Daftar tools

**Harian** — Unit Converter · Kalkulator BMI · Kalkulator Umur · Kalkulator Diskon & Persen · Random Picker & Pembagi Kelompok · Countdown ke Tanggal · Kalkulator Tabungan & Bunga · Kalkulator Zakat Maal · Pomodoro Timer · Kalkulator Air & Kalori Harian

**Converter** — JSON Formatter · Base64 Encode/Decode · URL Encoder/Decoder · Color Converter · QR Code Generator · Password Generator · Lorem Ipsum Generator · Word & Char Counter · Number Base Converter · Slug Generator · Random Name/Username Generator · Barcode Generator · Text to ASCII Art

**Text** — Text Case Converter · Markdown Previewer · Diff Checker · Regex Tester · Find & Replace Bulk · Text Reverser & Palindrome Checker · Duplicate Line Remover · Text Sorter

**Image** — Image Compressor · Image to Base64 · Favicon Generator · Image Resizer · Color Palette Extractor · Grayscale/Sepia Filter · Meme Generator · Image Cropper

**Dev** — CSS Gradient Generator · Cron Expression Parser · Timestamp Converter · UUID Generator · Hash Generator · JWT Decoder · JSON Diff · HTTP Status Code Lookup · Markdown to HTML Exporter

## Tech stack

Vanilla HTML, CSS, dan JavaScript (ES modules) — tanpa framework, tanpa build step, tanpa `npm install`. Satu dependency eksternal: [JsBarcode](https://github.com/lindell/JsBarcode) via CDN (cuma dipakai di tool Barcode Generator). Tinggal deploy folder ini apa adanya ke Vercel atau Netlify.

## Struktur

```
multitool/
├── index.html          ← shell halaman (header, tabs kategori, grid beranda)
├── style.css            ← semua styling + tema gelap/terang
├── manifest.json         ← PWA manifest biar bisa di-install
├── js/
│   ├── main.js            ← router: grid beranda, favorit, recently used, tema
│   ├── helpers.js         ← fungsi bantu (copy, download, localStorage)
│   └── tools/
│       ├── harian.js       ← 10 tools kalkulator harian
│       ├── converters.js   ← 13 tools converter/generator
│       ├── text.js         ← 8 tools text
│       ├── image.js        ← 8 tools image
│       └── dev.js          ← 9 tools dev
```

Nambah tool baru = bikin fungsi `mount(container)` baru di file kategori yang sesuai, terus daftarkan di array export-nya (id, name, icon, category, blurb, mount). Gak perlu sentuh file lain.

## Cara coba lokal sebelum deploy

Karena filenya pakai ES module (`type="module"`), gak bisa dibuka langsung dobel klik `index.html`. Harus lewat server lokal kecil:

```bash
cd multitool
python3 -m http.server 8000
```

Lalu buka `http://localhost:8000` di browser.
