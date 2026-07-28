import { header, card, copyText } from '../helpers.js';

// ---------- 1. Unit Converter ----------
const UNIT_GROUPS = {
  panjang: { base: 'm', units: { mm: 0.001, cm: 0.01, m: 1, km: 1000, inch: 0.0254, feet: 0.3048, yard: 0.9144, mile: 1609.34 } },
  berat: { base: 'kg', units: { mg: 0.000001, g: 0.001, kg: 1, ton: 1000, oz: 0.0283495, lb: 0.453592 } },
  suhu: { special: true },
};
function convertTemp(val, from, to) {
  let c;
  if (from === 'celsius') c = val;
  else if (from === 'fahrenheit') c = (val - 32) * 5 / 9;
  else c = val - 273.15;
  if (to === 'celsius') return c;
  if (to === 'fahrenheit') return c * 9 / 5 + 32;
  return c + 273.15;
}
function mountUnitConverter(mount) {
  header(mount, 'Harian', 'Unit Converter', 'Konversi panjang, berat, dan suhu — tinggal pilih satuan dan ketik angkanya.');
  const c = card(`
    <label>Kategori</label>
    <select id="uc-group">
      <option value="panjang">Panjang</option>
      <option value="berat">Berat</option>
      <option value="suhu">Suhu</option>
    </select>
    <div class="row" style="margin-top:14px">
      <div>
        <label>Dari</label>
        <input type="number" id="uc-val" value="1">
        <select id="uc-from" style="margin-top:8px"></select>
      </div>
      <div>
        <label>Ke</label>
        <div class="output" id="uc-result" style="margin-bottom:8px"></div>
        <select id="uc-to"></select>
      </div>
    </div>
  `);
  mount.appendChild(c);
  const $group = c.querySelector('#uc-group');
  const $from = c.querySelector('#uc-from');
  const $to = c.querySelector('#uc-to');
  const $val = c.querySelector('#uc-val');
  const $result = c.querySelector('#uc-result');

  function populateUnits() {
    const group = $group.value;
    let opts;
    if (group === 'suhu') opts = [['celsius', 'Celsius (°C)'], ['fahrenheit', 'Fahrenheit (°F)'], ['kelvin', 'Kelvin (K)']];
    else opts = Object.keys(UNIT_GROUPS[group].units).map(u => [u, u]);
    $from.innerHTML = opts.map(([v, l]) => `<option value="${v}">${l}</option>`).join('');
    $to.innerHTML = opts.map(([v, l]) => `<option value="${v}">${l}</option>`).join('');
    $to.selectedIndex = Math.min(1, opts.length - 1);
    compute();
  }
  function compute() {
    const group = $group.value;
    const val = parseFloat($val.value);
    if (isNaN(val)) { $result.textContent = ''; return; }
    let out;
    if (group === 'suhu') out = convertTemp(val, $from.value, $to.value);
    else {
      const units = UNIT_GROUPS[group].units;
      out = val * units[$from.value] / units[$to.value];
    }
    $result.textContent = `${out.toLocaleString('id-ID', { maximumFractionDigits: 6 })}`;
  }
  $group.addEventListener('change', populateUnits);
  [$from, $to, $val].forEach(el => el.addEventListener('input', compute));
  populateUnits();
}

// ---------- 2. BMI Calculator ----------
function mountBmiCalculator(mount) {
  header(mount, 'Harian', 'Kalkulator BMI', 'Hitung Body Mass Index dari berat dan tinggi badan, lengkap sama kategorinya.');
  const c = card(`
    <div class="row">
      <div><label>Berat badan (kg)</label><input type="number" id="bmi-w" value="60"></div>
      <div><label>Tinggi badan (cm)</label><input type="number" id="bmi-h" value="165"></div>
    </div>
    <div class="btn-row"><button class="btn" id="bmi-calc">Hitung</button></div>
    <label style="margin-top:16px">Hasil</label>
    <div class="output" id="bmi-out"></div>
    <div class="hint">Kategori WHO: &lt;18.5 kurus · 18.5–24.9 normal · 25–29.9 kelebihan berat · ≥30 obesitas. Ini estimasi umum, bukan pengganti saran medis.</div>
  `);
  mount.appendChild(c);
  c.querySelector('#bmi-calc').onclick = () => {
    const w = parseFloat(c.querySelector('#bmi-w').value);
    const h = parseFloat(c.querySelector('#bmi-h').value) / 100;
    if (!w || !h) return;
    const bmi = w / (h * h);
    let cat;
    if (bmi < 18.5) cat = 'Kurus (underweight)';
    else if (bmi < 25) cat = 'Normal';
    else if (bmi < 30) cat = 'Kelebihan berat (overweight)';
    else cat = 'Obesitas';
    c.querySelector('#bmi-out').textContent = `BMI: ${bmi.toFixed(1)} — ${cat}`;
  };
  c.querySelector('#bmi-calc').click();
}

// ---------- 3. Age Calculator ----------
function mountAgeCalculator(mount) {
  header(mount, 'Harian', 'Kalkulator Umur', 'Hitung umur persis dari tanggal lahir, plus hitung mundur ke ulang tahun berikutnya.');
  const c = card(`
    <label>Tanggal lahir</label>
    <input type="date" id="ag-in">
    <div class="btn-row"><button class="btn" id="ag-calc">Hitung umur</button></div>
    <table class="kv" style="margin-top:16px">
      <tr><td>Umur</td><td id="ag-age"></td></tr>
      <tr><td>Total hari hidup</td><td id="ag-days"></td></tr>
      <tr><td>Ulang tahun berikutnya</td><td id="ag-next"></td></tr>
    </table>
  `);
  mount.appendChild(c);
  c.querySelector('#ag-calc').onclick = () => {
    const val = c.querySelector('#ag-in').value;
    if (!val) return;
    const birth = new Date(val);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    let days = now.getDate() - birth.getDate();
    if (days < 0) { months--; days += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
    if (months < 0) { years--; months += 12; }
    const totalDays = Math.floor((now - birth) / 86400000);
    let next = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
    if (next < now) next.setFullYear(next.getFullYear() + 1);
    const daysToNext = Math.ceil((next - now) / 86400000);

    c.querySelector('#ag-age').textContent = `${years} tahun, ${months} bulan, ${days} hari`;
    c.querySelector('#ag-days').textContent = totalDays.toLocaleString('id-ID') + ' hari';
    c.querySelector('#ag-next').textContent = `${daysToNext} hari lagi (${next.toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })})`;
  };
}

// ---------- 4. Discount & Percentage Calculator ----------
function mountDiscountCalculator(mount) {
  header(mount, 'Harian', 'Kalkulator Diskon & Persen', 'Hitung harga setelah diskon, atau berapa persen suatu angka dari angka lain.');
  const c1 = card(`
    <label class="tool-eyebrow" style="margin-bottom:10px">Harga setelah diskon</label>
    <div class="row">
      <div><label>Harga awal</label><input type="number" id="dc-price" value="100000"></div>
      <div><label>Diskon (%)</label><input type="number" id="dc-pct" value="20"></div>
    </div>
    <table class="kv" style="margin-top:14px">
      <tr><td>Hemat</td><td id="dc-save"></td></tr>
      <tr><td>Harga akhir</td><td id="dc-final"></td></tr>
    </table>
  `);
  const c2 = card(`
    <label class="tool-eyebrow" style="margin-bottom:10px">X adalah berapa persen dari Y?</label>
    <div class="row">
      <div><label>X</label><input type="number" id="dc-x" value="25"></div>
      <div><label>Y</label><input type="number" id="dc-y" value="200"></div>
    </div>
    <div class="output" id="dc-pctresult" style="margin-top:10px"></div>
  `);
  mount.appendChild(c1);
  mount.appendChild(c2);
  const idr = (n) => 'Rp' + Math.round(n).toLocaleString('id-ID');

  function calc1() {
    const price = parseFloat(c1.querySelector('#dc-price').value) || 0;
    const pct = parseFloat(c1.querySelector('#dc-pct').value) || 0;
    const save = price * pct / 100;
    c1.querySelector('#dc-save').textContent = idr(save);
    c1.querySelector('#dc-final').textContent = idr(price - save);
  }
  function calc2() {
    const x = parseFloat(c2.querySelector('#dc-x').value) || 0;
    const y = parseFloat(c2.querySelector('#dc-y').value) || 0;
    c2.querySelector('#dc-pctresult').textContent = y ? `${((x / y) * 100).toFixed(2)}%` : '';
  }
  c1.querySelectorAll('input').forEach(el => el.addEventListener('input', calc1));
  c2.querySelectorAll('input').forEach(el => el.addEventListener('input', calc2));
  calc1(); calc2();
}

// ---------- 5. Random Picker & Group Divider ----------
function mountRandomPicker(mount) {
  header(mount, 'Harian', 'Random Picker & Pembagi Kelompok', 'Tempel daftar nama (satu per baris), lalu pilih satu secara acak atau bagi jadi beberapa kelompok — buat undian, giliran, atau bagi tim.');
  const c = card(`
    <label>Daftar nama / item (satu per baris)</label>
    <textarea id="rp-list" style="min-height:140px">Agam
Budi
Citra
Dewi
Eka</textarea>
    <div class="btn-row">
      <button class="btn" id="rp-pick">🎲 Pilih satu acak</button>
      <button class="btn secondary" id="rp-shuffle">Acak urutan</button>
    </div>
    <div class="output" id="rp-out" style="margin-top:12px;font-size:16px"></div>
    <label style="margin-top:18px">Bagi jadi kelompok</label>
    <div class="row">
      <input type="number" id="rp-groups" value="2" min="2" max="20">
      <button class="btn secondary" id="rp-divide">Bagi kelompok</button>
    </div>
    <div class="output" id="rp-groups-out" style="margin-top:10px"></div>
  `);
  mount.appendChild(c);
  const getList = () => c.querySelector('#rp-list').value.split('\n').map(s => s.trim()).filter(Boolean);

  c.querySelector('#rp-pick').onclick = () => {
    const list = getList();
    if (!list.length) return;
    c.querySelector('#rp-out').textContent = '🎉 ' + list[Math.floor(Math.random() * list.length)];
  };
  c.querySelector('#rp-shuffle').onclick = () => {
    const list = getList();
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    c.querySelector('#rp-list').value = list.join('\n');
  };
  c.querySelector('#rp-divide').onclick = () => {
    const list = getList();
    const n = Math.max(2, Math.min(20, parseInt(c.querySelector('#rp-groups').value, 10) || 2));
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    const groups = Array.from({ length: n }, () => []);
    list.forEach((item, i) => groups[i % n].push(item));
    c.querySelector('#rp-groups-out').innerHTML = groups.map((g, i) => `<div style="margin-bottom:8px"><strong style="color:var(--amber)">Kelompok ${i + 1}:</strong> ${g.join(', ') || '-'}</div>`).join('');
  };
}

// ---------- 6. Countdown Timer (to a date) ----------
function mountCountdownTimer(mount) {
  header(mount, 'Harian', 'Countdown ke Tanggal', 'Hitung mundur ke tanggal & jam tertentu — buat acara, deadline, atau reminder.');
  const c = card(`
    <label>Target tanggal & jam</label>
    <input type="datetime-local" id="ct-target">
    <div class="btn-row"><button class="btn" id="ct-start">Mulai hitung mundur</button></div>
    <div class="output" id="ct-out" style="margin-top:16px;font-size:20px;text-align:center;letter-spacing:1px"></div>
  `);
  mount.appendChild(c);
  let interval;
  c.querySelector('#ct-start').onclick = () => {
    clearInterval(interval);
    const target = new Date(c.querySelector('#ct-target').value);
    if (isNaN(target)) return;
    function tick() {
      const diff = target - new Date();
      const $out = c.querySelector('#ct-out');
      if (!$out) { clearInterval(interval); return; }
      if (diff <= 0) { $out.textContent = '🎯 Waktunya udah sampai!'; clearInterval(interval); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      $out.textContent = `${d}h ${h}j ${m}m ${s}d`;
    }
    tick();
    interval = setInterval(tick, 1000);
  };
}

export const harianTools = [
  { id: 'unit-converter', name: 'Unit Converter', icon: '⇌', category: 'Harian', mount: mountUnitConverter },
  { id: 'bmi-calculator', name: 'Kalkulator BMI', icon: '⚖', category: 'Harian', mount: mountBmiCalculator },
  { id: 'age-calculator', name: 'Kalkulator Umur', icon: '🎂', category: 'Harian', mount: mountAgeCalculator },
  { id: 'discount-calculator', name: 'Kalkulator Diskon & Persen', icon: '%', category: 'Harian', mount: mountDiscountCalculator },
  { id: 'random-picker', name: 'Random Picker & Pembagi Kelompok', icon: '🎲', category: 'Harian', mount: mountRandomPicker },
  { id: 'countdown-timer', name: 'Countdown ke Tanggal', icon: '⏳', category: 'Harian', mount: mountCountdownTimer },
];
