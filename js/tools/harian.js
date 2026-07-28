import { header, card } from '../helpers.js';

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
      if (!$out || !$out.isConnected) { clearInterval(interval); return; }
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

// ---------- 7. Kalkulator Tabungan & Bunga ----------
function mountSavingsCalculator(mount) {
  header(mount, 'Harian', 'Kalkulator Tabungan & Bunga', 'Hitung hasil akhir tabungan dengan bunga sederhana atau majemuk (compound).');
  const c = card(`
    <div class="row">
      <div><label>Modal awal (Rp)</label><input type="number" id="sv-principal" value="1000000"></div>
      <div><label>Bunga per tahun (%)</label><input type="number" id="sv-rate" value="5"></div>
    </div>
    <div class="row" style="margin-top:14px">
      <div><label>Lama (tahun)</label><input type="number" id="sv-years" value="5"></div>
      <div><label>Tipe bunga</label>
        <select id="sv-type"><option value="compound">Majemuk (compound)</option><option value="simple">Sederhana (simple)</option></select>
      </div>
    </div>
    <div class="btn-row"><button class="btn" id="sv-calc">Hitung</button></div>
    <table class="kv" style="margin-top:16px">
      <tr><td>Total akhir</td><td id="sv-total"></td></tr>
      <tr><td>Total bunga</td><td id="sv-interest"></td></tr>
    </table>
  `);
  mount.appendChild(c);
  const idr = (n) => 'Rp' + Math.round(n).toLocaleString('id-ID');
  c.querySelector('#sv-calc').onclick = () => {
    const p = parseFloat(c.querySelector('#sv-principal').value) || 0;
    const r = (parseFloat(c.querySelector('#sv-rate').value) || 0) / 100;
    const y = parseFloat(c.querySelector('#sv-years').value) || 0;
    const type = c.querySelector('#sv-type').value;
    const total = type === 'compound' ? p * Math.pow(1 + r, y) : p * (1 + r * y);
    c.querySelector('#sv-total').textContent = idr(total);
    c.querySelector('#sv-interest').textContent = idr(total - p);
  };
  c.querySelector('#sv-calc').click();
}

// ---------- 8. Kalkulator Zakat Maal ----------
function mountZakatCalculator(mount) {
  header(mount, 'Harian', 'Kalkulator Zakat Maal', 'Hitung zakat maal 2.5% dari total harta, kalau udah melewati nisab.');
  const c = card(`
    <div class="row">
      <div><label>Total harta (Rp)</label><input type="number" id="zk-wealth" value="50000000"></div>
      <div><label>Nilai nisab (Rp)</label><input type="number" id="zk-nisab" value="85000000"></div>
    </div>
    <div class="btn-row"><button class="btn" id="zk-calc">Hitung</button></div>
    <div class="output" id="zk-out" style="margin-top:16px"></div>
    <div class="hint">Nisab default berdasarkan estimasi 85 gram emas — sesuaikan dengan harga emas terkini. Zakat maal = 2.5% dari total harta kalau sudah mencapai nisab dan telah dimiliki 1 tahun (haul).</div>
  `);
  mount.appendChild(c);
  const idr = (n) => 'Rp' + Math.round(n).toLocaleString('id-ID');
  c.querySelector('#zk-calc').onclick = () => {
    const wealth = parseFloat(c.querySelector('#zk-wealth').value) || 0;
    const nisab = parseFloat(c.querySelector('#zk-nisab').value) || 0;
    const $out = c.querySelector('#zk-out');
    if (wealth < nisab) {
      $out.textContent = `Belum wajib zakat — harta kamu di bawah nisab (${idr(nisab)}).`;
    } else {
      $out.textContent = `Wajib zakat: ${idr(wealth * 0.025)} (2.5% dari ${idr(wealth)})`;
    }
  };
  c.querySelector('#zk-calc').click();
}

// ---------- 9. Pomodoro Timer ----------
function mountPomodoroTimer(mount) {
  header(mount, 'Harian', 'Pomodoro Timer', 'Teknik fokus 25 menit kerja, 5 menit istirahat — bantu kamu tetap produktif.');
  const c = card(`
    <div class="row">
      <div><label>Durasi fokus (menit)</label><input type="number" id="pm-work" value="25"></div>
      <div><label>Durasi istirahat (menit)</label><input type="number" id="pm-break" value="5"></div>
    </div>
    <div class="output" id="pm-display" style="margin-top:16px;font-size:36px;text-align:center;font-weight:700"></div>
    <div class="output" id="pm-mode" style="text-align:center;margin-top:8px"></div>
    <div class="btn-row" style="justify-content:center">
      <button class="btn" id="pm-start">Mulai</button>
      <button class="btn secondary" id="pm-pause">Jeda</button>
      <button class="btn secondary" id="pm-reset">Reset</button>
    </div>
  `);
  mount.appendChild(c);
  let seconds = 25 * 60, mode = 'Fokus', interval = null;
  const $display = c.querySelector('#pm-display');
  const $mode = c.querySelector('#pm-mode');

  function render() {
    const m = Math.floor(seconds / 60), s = seconds % 60;
    $display.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    $mode.textContent = mode === 'Fokus' ? '🎯 Waktunya fokus' : '☕ Waktunya istirahat';
  }
  function tick() {
    if (!$display.isConnected) { clearInterval(interval); return; }
    seconds--;
    if (seconds < 0) {
      mode = mode === 'Fokus' ? 'Istirahat' : 'Fokus';
      seconds = (mode === 'Fokus' ? parseFloat(c.querySelector('#pm-work').value) : parseFloat(c.querySelector('#pm-break').value)) * 60;
    }
    render();
  }
  c.querySelector('#pm-start').onclick = () => { if (!interval) interval = setInterval(tick, 1000); };
  c.querySelector('#pm-pause').onclick = () => { clearInterval(interval); interval = null; };
  c.querySelector('#pm-reset').onclick = () => {
    clearInterval(interval); interval = null; mode = 'Fokus';
    seconds = (parseFloat(c.querySelector('#pm-work').value) || 25) * 60;
    render();
  };
  render();
}

// ---------- 10. Kalkulator Air & Kalori Harian ----------
function mountWaterCalorieCalculator(mount) {
  header(mount, 'Harian', 'Kalkulator Air & Kalori Harian', 'Estimasi kebutuhan air dan kalori harian berdasarkan berat badan dan aktivitas.');
  const c = card(`
    <div class="row">
      <div><label>Berat badan (kg)</label><input type="number" id="wc-weight" value="65"></div>
      <div><label>Tinggi badan (cm)</label><input type="number" id="wc-height" value="170"></div>
    </div>
    <div class="row" style="margin-top:14px">
      <div><label>Umur</label><input type="number" id="wc-age" value="25"></div>
      <div><label>Jenis kelamin</label><select id="wc-gender"><option value="m">Pria</option><option value="f">Wanita</option></select></div>
    </div>
    <label style="margin-top:14px">Level aktivitas</label>
    <select id="wc-activity">
      <option value="1.2">Jarang olahraga</option>
      <option value="1.375">Olahraga ringan (1-3x/minggu)</option>
      <option value="1.55">Olahraga sedang (3-5x/minggu)</option>
      <option value="1.725">Olahraga berat (6-7x/minggu)</option>
    </select>
    <div class="btn-row"><button class="btn" id="wc-calc">Hitung</button></div>
    <table class="kv" style="margin-top:16px">
      <tr><td>Kebutuhan air</td><td id="wc-water"></td></tr>
      <tr><td>Estimasi kalori harian</td><td id="wc-cal"></td></tr>
    </table>
    <div class="hint">Estimasi umum pakai rumus Mifflin-St Jeor — bukan pengganti saran ahli gizi.</div>
  `);
  mount.appendChild(c);
  c.querySelector('#wc-calc').onclick = () => {
    const w = parseFloat(c.querySelector('#wc-weight').value) || 0;
    const h = parseFloat(c.querySelector('#wc-height').value) || 0;
    const age = parseFloat(c.querySelector('#wc-age').value) || 0;
    const gender = c.querySelector('#wc-gender').value;
    const activity = parseFloat(c.querySelector('#wc-activity').value);
    const water = w * 0.033;
    const bmr = gender === 'm' ? 10 * w + 6.25 * h - 5 * age + 5 : 10 * w + 6.25 * h - 5 * age - 161;
    c.querySelector('#wc-water').textContent = `${water.toFixed(1)} liter/hari`;
    c.querySelector('#wc-cal').textContent = `${Math.round(bmr * activity).toLocaleString('id-ID')} kkal/hari`;
  };
  c.querySelector('#wc-calc').click();
}

export const harianTools = [
  { id: 'unit-converter', name: 'Unit Converter', icon: '⇌', category: 'Harian', blurb: 'Panjang, berat, suhu', mount: mountUnitConverter },
  { id: 'bmi-calculator', name: 'Kalkulator BMI', icon: '⚖', category: 'Harian', blurb: 'Body Mass Index + kategori', mount: mountBmiCalculator },
  { id: 'age-calculator', name: 'Kalkulator Umur', icon: '🎂', category: 'Harian', blurb: 'Umur persis dari tanggal lahir', mount: mountAgeCalculator },
  { id: 'discount-calculator', name: 'Kalkulator Diskon & Persen', icon: '%', category: 'Harian', blurb: 'Harga diskon & persentase', mount: mountDiscountCalculator },
  { id: 'random-picker', name: 'Random Picker & Pembagi Kelompok', icon: '🎲', category: 'Harian', blurb: 'Undian & bagi kelompok', mount: mountRandomPicker },
  { id: 'countdown-timer', name: 'Countdown ke Tanggal', icon: '⏳', category: 'Harian', blurb: 'Hitung mundur ke acara/deadline', mount: mountCountdownTimer },
  { id: 'savings-calculator', name: 'Kalkulator Tabungan & Bunga', icon: '💰', category: 'Harian', blurb: 'Bunga sederhana & majemuk', mount: mountSavingsCalculator },
  { id: 'zakat-calculator', name: 'Kalkulator Zakat Maal', icon: '🕌', category: 'Harian', blurb: 'Zakat 2.5% dari harta', mount: mountZakatCalculator },
  { id: 'pomodoro-timer', name: 'Pomodoro Timer', icon: '🍅', category: 'Harian', blurb: 'Fokus 25 menit, istirahat 5 menit', mount: mountPomodoroTimer },
  { id: 'water-calorie', name: 'Kalkulator Air & Kalori Harian', icon: '💧', category: 'Harian', blurb: 'Kebutuhan air & kalori harian', mount: mountWaterCalorieCalculator },
];
