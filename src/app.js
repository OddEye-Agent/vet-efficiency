const app = document.getElementById('app');
const menuItems = [...document.querySelectorAll('.menu-item')];

function setActive(view) {
  menuItems.forEach((b) => b.classList.toggle('active', b.dataset.view === view));
}

function renderDashboard() {
  app.innerHTML = `
    <h2>Dashboard</h2>
    <div class="grid">
      <button class="tile" data-go="transfusion"><div class="icon">🐶🩸</div><h3>Canine Transfusion Volume</h3><p>Estimate blood transfusion mL from PCV/HCT values.</p></button>
      <button class="tile" data-go="rounding"><div class="icon">🩺📋</div><h3>UCI Vet Rounding Sheet</h3><p>Capture ICU round and handoff details.</p></button>
      <button class="tile" data-go="cri"><div class="icon">💉⚙️</div><h3>CRI Safety Calculator</h3><p>Compute infusion rate with safety checks.</p></button>
      <button class="tile" data-go="compatibility"><div class="icon">🧪🔗</div><h3>Drug Compatibility Checker</h3><p>Check common co-infusion compatibility combinations.</p></button>
    </div>
  `;
  app.querySelectorAll('[data-go]').forEach((btn) => btn.addEventListener('click', () => renderView(btn.dataset.go)));
}

function renderTransfusion() {
  app.innerHTML = `
    <h2>Canine Transfusion Volume Calculator</h2>
    <section class="panel">
      <div class="form-grid">
        <div><label>Dog Weight (kg)</label><input id="w" type="number" step="0.1"></div>
        <div><label>Recipient PCV (%)</label><input id="r" type="number" step="0.1"></div>
        <div><label>Target PCV (%)</label><input id="t" type="number" step="0.1" value="25"></div>
        <div><label>Donor PCV (%)</label><input id="d" type="number" step="0.1" value="45"></div>
        <div><label>Blood Volume (mL/kg)</label><select id="f"><option value="90">90</option><option value="85">85</option><option value="95">95</option></select></div>
      </div>
      <div class="actions"><button class="primary" id="calc">Calculate Volume</button></div>
      <div class="result" id="out">Enter values and calculate.</div>
    </section>
  `;
  document.getElementById('calc').addEventListener('click', () => {
    const w = Number(document.getElementById('w').value || 0);
    const r = Number(document.getElementById('r').value || 0);
    const t = Number(document.getElementById('t').value || 0);
    const d = Number(document.getElementById('d').value || 0);
    const f = Number(document.getElementById('f').value || 90);
    if (!w || !d || t <= r) return (document.getElementById('out').textContent = 'Need weight > 0, donor PCV > 0, and target > recipient.');
    const ml = (w * f * (t - r)) / d;
    document.getElementById('out').innerHTML = `Estimated transfusion volume: <strong>${Math.round(ml)} mL</strong> (exact ${ml.toFixed(1)} mL)`;
  });
}

function renderRounding() {
  app.innerHTML = `
    <h2>UCI Vet Rounding Sheet</h2>
    <section class="panel">
      <div class="form-grid">
        <div><label>Patient Name</label><input></div>
        <div><label>Species / Breed</label><input></div>
        <div><label>Weight (kg)</label><input type="number" step="0.1"></div>
        <div><label>Primary Diagnosis</label><input></div>
        <div><label>Temp (°C)</label><input type="number" step="0.1"></div>
        <div><label>Heart Rate (bpm)</label><input type="number"></div>
        <div><label>Resp Rate (/min)</label><input type="number"></div>
        <div><label>BP (mmHg)</label><input placeholder="120/75"></div>
        <div><label>Pain Score (0-10)</label><input type="number" min="0" max="10"></div>
        <div><label>Urine Output (mL/kg/hr)</label><input type="number" step="0.1"></div>
        <div><label>Fluid Plan</label><input></div>
        <div><label>Next Recheck Time</label><input type="time"></div>
      </div>
      <div style="margin-top:10px"><label>Technician Notes / Handoff</label><textarea></textarea></div>
      <div class="actions"><button>Save Draft</button><button class="primary">Complete Round</button></div>
    </section>
  `;
}

function renderCri() {
  app.innerHTML = `
    <h2>CRI Safety Calculator</h2>
    <section class="panel">
      <div class="form-grid">
        <div><label>Drug Template</label><select id="drug"><option value="dopamine">Dopamine</option><option value="fentanyl">Fentanyl</option><option value="lidocaine">Lidocaine</option><option value="insulin">Regular Insulin</option></select></div>
        <div><label>Patient Weight (kg)</label><input id="kg" type="number" step="0.1"></div>
        <div><label>Dose (mcg/kg/min)</label><input id="dose" type="number" step="0.01"></div>
        <div><label>Final Concentration (mg/mL)</label><input id="conc" type="number" step="0.001"></div>
        <div><label>2nd Verifier Initials</label><input id="ver"></div>
      </div>
      <div class="actions"><button class="primary" id="calcCri">Calculate CRI Rate</button></div>
      <div class="result" id="criOut">Enter CRI details to calculate infusion pump rate.</div>
    </section>
  `;

  const ranges = { dopamine: [2, 20], fentanyl: [1, 10], lidocaine: [20, 80], insulin: [0.02, 0.2] };
  document.getElementById('calcCri').addEventListener('click', () => {
    const drug = document.getElementById('drug').value;
    const kg = Number(document.getElementById('kg').value || 0);
    const dose = Number(document.getElementById('dose').value || 0);
    const conc = Number(document.getElementById('conc').value || 0);
    const ver = (document.getElementById('ver').value || '').trim();
    if (!kg || !dose || !conc) return (document.getElementById('criOut').textContent = 'Enter weight, dose, concentration.');
    const mlHr = (((dose / 1000) * kg) / conc) * 60;
    const mgMin = (dose / 1000) * kg;
    const [min, max] = ranges[drug];
    const warnings = [];
    if (dose < min || dose > max) warnings.push(`Dose outside typical ${drug} range (${min}-${max} mcg/kg/min).`);
    if (!ver) warnings.push('Second verifier initials not entered.');
    document.getElementById('criOut').innerHTML = `<div><strong>Pump Rate:</strong> ${mlHr.toFixed(2)} mL/hr</div><div><strong>Drug delivery:</strong> ${mgMin.toFixed(3)} mg/min</div>${warnings.length ? `<div class="warn">${warnings.join('<br>')}</div>` : ''}`;
  });
}

function renderCompatibility() {
  const drugGroups = {
    'CRI / Vasoactive': ['Dopamine', 'Norepinephrine', 'Dobutamine', 'Lidocaine', 'Regular Insulin', 'Potassium Chloride'],
    Antibiotics: ['Ampicillin-Sulbactam', 'Cefazolin', 'Ceftriaxone', 'Enrofloxacin', 'Metronidazole', 'Piperacillin-Tazobactam'],
    'Pain / Sedation': ['Fentanyl', 'Hydromorphone', 'Ketamine', 'Methadone', 'Midazolam', 'Dexmedetomidine'],
    'GI / Supportive': ['Maropitant', 'Ondansetron', 'Pantoprazole', 'Famotidine', 'Metoclopramide', 'Lactulose'],
    Chemo: ['Vincristine', 'Cyclophosphamide', 'Doxorubicin', 'Lomustine', 'Carboplatin'],
    Steroids: ['Dexamethasone SP', 'Prednisolone Sodium Succinate', 'Methylprednisolone Sodium Succinate'],
    Other: ['Sodium Bicarbonate']
  };

  const renderOptions = () =>
    Object.entries(drugGroups)
      .map(([group, items]) => `<optgroup label="${group}">${items.map((d) => `<option>${d}</option>`).join('')}</optgroup>`)
      .join('');

  app.innerHTML = `
    <h2>Drug Compatibility Checker</h2>
    <section class="panel">
      <div class="form-grid">
        <div>
          <label>Primary Medication / Infusion</label>
          <select id="cmpA">${renderOptions()}</select>
        </div>
        <div>
          <label>Secondary Medication / Infusion</label>
          <select id="cmpB">${renderOptions()}</select>
        </div>
        <div>
          <label>Carrier Fluid</label>
          <select id="cmpFluid">
            <option value="ns">0.9% NaCl</option>
            <option value="lrs">LRS</option>
            <option value="d5">D5W</option>
          </select>
        </div>
      </div>
      <div class="actions"><button class="primary" id="cmpCheck">Check Compatibility</button></div>
      <div class="result" id="cmpOut">Select two medications and check compatibility.</div>
    </section>
  `;

  const incompatiblePairs = new Set([
    'dopamine|sodium bicarbonate',
    'norepinephrine|sodium bicarbonate',
    'dobutamine|sodium bicarbonate',
    'ampicillin-sulbactam|dexamethasone sp',
    'pantoprazole|dexamethasone sp',
    'vincristine|doxorubicin'
  ]);

  const cautionPairs = new Set([
    'dopamine|lidocaine',
    'norepinephrine|dobutamine',
    'regular insulin|potassium chloride',
    'fentanyl|midazolam',
    'ketamine|midazolam',
    'cefazolin|metronidazole',
    'enrofloxacin|metoclopramide',
    'maropitant|ondansetron',
    'cyclophosphamide|prednisolone sodium succinate'
  ]);

  const normalize = (s) => s.toLowerCase().trim();
  const keyFor = (a, b) => {
    const x = normalize(a);
    const y = normalize(b);
    return [x, y].sort().join('|');
  };

  document.getElementById('cmpCheck').addEventListener('click', () => {
    const a = document.getElementById('cmpA').value;
    const b = document.getElementById('cmpB').value;
    const fluid = document.getElementById('cmpFluid').value;
    const out = document.getElementById('cmpOut');

    if (normalize(a) === normalize(b)) {
      out.innerHTML = '<div class="warn">Select two different medications to compare.</div>';
      return;
    }

    const key = keyFor(a, b);

    if (incompatiblePairs.has(key)) {
      out.innerHTML = `<div class="warn"><strong>Result: Incompatible</strong><br>${a} + ${b} should not run together in the same line. Use separate lumens/lines and verify institutional policy.</div>`;
      return;
    }

    let cautionText = '';
    if (cautionPairs.has(key)) {
      cautionText = `<div class="warn"><strong>Caution:</strong> ${a} + ${b} may be conditionally compatible depending on concentration, contact time, and formulation. Verify with pharmacy/reference before Y-site co-infusion.</div>`;
    }

    const fluidNote = fluid === 'lrs'
      ? 'LRS selected: confirm compatibility for each medication with calcium-containing fluids.'
      : fluid === 'd5'
        ? 'D5W selected: confirm drug stability in dextrose-containing fluids.'
        : '0.9% NaCl selected: generally preferred for many continuous infusions.';

    out.innerHTML = `
      <div><strong>Result:</strong> No hard conflict detected for this pair in current prototype rules.</div>
      <div style="margin-top:6px"><strong>Fluid check:</strong> ${fluidNote}</div>
      ${cautionText}
      <div style="margin-top:8px">Always confirm against your hospital formulary and a current compatibility reference before bedside administration.</div>
    `;
  });
}

function renderView(view) {
  setActive(view);
  if (view === 'dashboard') return renderDashboard();
  if (view === 'transfusion') return renderTransfusion();
  if (view === 'rounding') return renderRounding();
  if (view === 'cri') return renderCri();
  if (view === 'compatibility') return renderCompatibility();
}

menuItems.forEach((btn) => btn.addEventListener('click', () => renderView(btn.dataset.view)));
renderView('dashboard');
