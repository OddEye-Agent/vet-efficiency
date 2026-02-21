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
  const allDrugs = [
    'Dopamine', 'Norepinephrine', 'Dobutamine', 'Lidocaine', 'Regular Insulin', 'Potassium Chloride',
    'Ampicillin-Sulbactam', 'Cefazolin', 'Ceftriaxone', 'Enrofloxacin', 'Metronidazole', 'Piperacillin-Tazobactam',
    'Fentanyl', 'Hydromorphone', 'Ketamine', 'Methadone', 'Midazolam', 'Dexmedetomidine',
    'Maropitant', 'Ondansetron', 'Pantoprazole', 'Famotidine', 'Metoclopramide', 'Lactulose',
    'Vincristine', 'Cyclophosphamide', 'Doxorubicin', 'Lomustine', 'Carboplatin',
    'Dexamethasone SP', 'Prednisolone Sodium Succinate', 'Methylprednisolone Sodium Succinate',
    'Sodium Bicarbonate'
  ];

  const guidance = {
    'dopamine': { bolus: 'Usually CRI only; bolus generally avoided unless directed by criticalist.', monitor: 'ECG/HR, BP, perfusion, arrhythmias.' },
    'norepinephrine': { bolus: 'Typically CRI; if bolus used, slow titrated micro-doses only per protocol.', monitor: 'Continuous BP, peripheral perfusion, arrhythmias.' },
    'dobutamine': { bolus: 'Generally CRI, avoid bolus.', monitor: 'ECG/HR, BP, lactate/perfusion trends.' },
    'lidocaine': { bolus: 'Give over ~1–2 min (antiarrhythmic loading per protocol).', monitor: 'ECG, neurologic signs, BP.' },
    'regular insulin': { bolus: 'Usually no IV bolus in ICU unless specific protocol.', monitor: 'Glucose q1–2h, potassium, mentation.' },
    'potassium chloride': { bolus: 'NEVER IV bolus.', monitor: 'ECG, infusion concentration/rate limits, serial electrolytes.' },
    'fentanyl': { bolus: 'Slow IV over 1–2 min.', monitor: 'Respiratory rate/effort, sedation score, BP.' },
    'hydromorphone': { bolus: 'Slow IV over 2–3 min.', monitor: 'Respiratory status, sedation, nausea/temperature.' },
    'ketamine': { bolus: 'Slow IV over 1–2 min when used as bolus.', monitor: 'HR/BP, dysphoria, sedation depth.' },
    'methadone': { bolus: 'Slow IV over 2–3 min.', monitor: 'Respiratory status, sedation, HR.' },
    'midazolam': { bolus: 'Slow IV over 1–2 min.', monitor: 'Sedation, respiratory status, paradoxical excitement.' },
    'dexmedetomidine': { bolus: 'Slow IV over 10 min or IM per protocol.', monitor: 'HR/rhythm, BP, perfusion, sedation depth.' },
    'metronidazole': { bolus: 'Infuse slowly (usually over 20–60 min).', monitor: 'GI tolerance, neuro signs with prolonged use.' },
    'enrofloxacin': { bolus: 'Avoid rapid IV push; slow infusion per label/protocol.', monitor: 'Site reaction, GI signs, neurologic status.' },
    'vincristine': { bolus: 'Administer ONLY via chemo protocol (slow controlled IV).', monitor: 'Extravasation risk, CBC trend, GI signs.' },
    'doxorubicin': { bolus: 'Use dedicated chemo protocol; avoid rapid push.', monitor: 'Extravasation, arrhythmia risk, CBC/chemistry.' },
    'cyclophosphamide': { bolus: 'Protocol-dependent; generally controlled administration.', monitor: 'CBC, GI signs, urine/hematuria precautions.' },
    'carboplatin': { bolus: 'Protocol-dependent infusion timing.', monitor: 'CBC (myelosuppression), renal values.' },
    'dexamethasone sp': { bolus: 'Slow IV over 2–5 min.', monitor: 'Glucose, GI effects, immune suppression considerations.' },
    'prednisolone sodium succinate': { bolus: 'Slow IV over 2–5 min.', monitor: 'Glucose, GI status, fluid balance.' },
    'methylprednisolone sodium succinate': { bolus: 'Slow IV over 2–5 min.', monitor: 'BP, glucose, GI/immune effects.' },
    'sodium bicarbonate': { bolus: 'Give slowly with protocol-guided dosing.', monitor: 'Blood gas, electrolytes (esp. ionized Ca/K), ECG.' }
  };

  app.innerHTML = `
    <h2>Drug Compatibility Checker</h2>
    <section class="panel">
      <div class="form-grid">
        <div>
          <label>Add medication (type to search)</label>
          <input id="cmpDrugInput" class="text-input" list="cmpDrugList" placeholder="Start typing drug name..." />
          <datalist id="cmpDrugList">
            ${allDrugs.map((d) => `<option value="${d}"></option>`).join('')}
          </datalist>
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

      <div class="actions">
        <button class="primary" id="cmpAddDrug">Add Drug</button>
        <button id="cmpCheck">Check All Compatibility</button>
        <button id="cmpClear">Clear</button>
      </div>

      <div id="cmpSelected" class="result">No drugs selected yet.</div>
      <div class="result" id="cmpOut">Add at least two drugs to run a compatibility check.</div>
      <div class="result" id="cmpGuidance">Bolus/monitoring guidance will appear for selected drugs.</div>
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
  const keyFor = (a, b) => [normalize(a), normalize(b)].sort().join('|');

  const selected = [];
  const selectedEl = document.getElementById('cmpSelected');
  const outEl = document.getElementById('cmpOut');
  const guideEl = document.getElementById('cmpGuidance');

  function renderSelected() {
    if (!selected.length) {
      selectedEl.textContent = 'No drugs selected yet.';
      guideEl.textContent = 'Bolus/monitoring guidance will appear for selected drugs.';
      return;
    }

    selectedEl.innerHTML = selected
      .map((drug, idx) => `<span style="display:inline-flex;align-items:center;gap:6px;border:1px solid #c9d5e6;border-radius:999px;padding:4px 9px;margin:3px;">${drug} <button data-remove="${idx}" style="border:none;background:transparent;cursor:pointer;">✕</button></span>`)
      .join('');

    selectedEl.querySelectorAll('[data-remove]').forEach((btn) => {
      btn.addEventListener('click', () => {
        selected.splice(Number(btn.dataset.remove), 1);
        renderSelected();
      });
    });

    guideEl.innerHTML = '<strong>Bolus / Monitoring Guidance:</strong>' + selected.map((drug) => {
      const info = guidance[normalize(drug)] || { bolus: 'No guidance loaded yet for this drug.', monitor: 'Use hospital protocol and monitor patient closely.' };
      return `<div style="margin-top:8px;"><strong>${drug}</strong><br><em>Bolus/Rate:</em> ${info.bolus}<br><em>Monitoring:</em> ${info.monitor}</div>`;
    }).join('');
  }

  document.getElementById('cmpAddDrug').addEventListener('click', () => {
    const input = document.getElementById('cmpDrugInput');
    const value = (input.value || '').trim();
    if (!value) return;
    if (!allDrugs.some((d) => normalize(d) === normalize(value))) {
      outEl.innerHTML = '<div class="warn">Drug not in current list. Pick from suggestions (auto-fill list).</div>';
      return;
    }
    const canonical = allDrugs.find((d) => normalize(d) === normalize(value));
    if (!selected.some((d) => normalize(d) === normalize(canonical))) selected.push(canonical);
    input.value = '';
    renderSelected();
  });

  document.getElementById('cmpClear').addEventListener('click', () => {
    selected.length = 0;
    outEl.textContent = 'Add at least two drugs to run a compatibility check.';
    renderSelected();
  });

  document.getElementById('cmpCheck').addEventListener('click', () => {
    const fluid = document.getElementById('cmpFluid').value;
    if (selected.length < 2) {
      outEl.innerHTML = '<div class="warn">Add at least two drugs to compare.</div>';
      return;
    }

    const results = [];
    for (let i = 0; i < selected.length; i++) {
      for (let j = i + 1; j < selected.length; j++) {
        const a = selected[i];
        const b = selected[j];
        const key = keyFor(a, b);
        if (incompatiblePairs.has(key)) {
          results.push(`<div class="warn"><strong>Incompatible:</strong> ${a} + ${b} — use separate lines/lumens.</div>`);
        } else if (cautionPairs.has(key)) {
          results.push(`<div class="warn"><strong>Caution:</strong> ${a} + ${b} — conditionally compatible; verify concentration/reference.</div>`);
        } else {
          results.push(`<div><strong>OK (no hard conflict in prototype rules):</strong> ${a} + ${b}</div>`);
        }
      }
    }

    const fluidNote = fluid === 'lrs'
      ? 'Fluid note: LRS contains calcium; verify compatibility carefully.'
      : fluid === 'd5'
        ? 'Fluid note: D5W may alter stability for some medications.'
        : 'Fluid note: 0.9% NaCl is commonly preferred for many ICU infusions.';

    outEl.innerHTML = `${results.join('')}<div style="margin-top:8px"><strong>${fluidNote}</strong><br>Always verify with hospital formulary + current compatibility reference before administration.</div>`;
  });

  renderSelected();
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
