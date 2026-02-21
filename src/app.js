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
  const drugCatalog = [
    { generic: 'Dopamine', common: 'Dopamine CRI', brands: ['Intropin'], bolus: 'Usually CRI only; bolus generally avoided unless directed by criticalist.', monitor: 'ECG/HR, BP, perfusion, arrhythmias.' },
    { generic: 'Norepinephrine', common: 'Noradrenaline', brands: ['Levophed'], bolus: 'Typically CRI; if bolus used, micro-dosing only per protocol.', monitor: 'Continuous BP, perfusion, arrhythmias.' },
    { generic: 'Dobutamine', common: 'Dobutamine CRI', brands: ['Dobutrex'], bolus: 'Generally CRI, avoid bolus.', monitor: 'ECG/HR, BP, lactate/perfusion.' },
    { generic: 'Lidocaine', common: 'Lido', brands: ['Xylocaine'], bolus: 'Slow IV over ~1–2 min per antiarrhythmic protocol.', monitor: 'ECG, neurologic signs, BP.' },
    { generic: 'Regular Insulin', common: 'Insulin CRI', brands: ['Humulin R', 'Novolin R'], bolus: 'Usually no IV bolus unless protocol-directed.', monitor: 'Glucose q1–2h, potassium, mentation.' },
    { generic: 'Potassium Chloride', common: 'KCl', brands: ['KCl concentrate'], bolus: 'NEVER IV bolus.', monitor: 'ECG, rate/concentration limits, serial electrolytes.' },
    { generic: 'Magnesium Sulfate', common: 'Magnesium', brands: ['MgSO4 injection'], bolus: 'Slow controlled IV per protocol (not rapid push).', monitor: 'ECG, BP, reflexes, magnesium level.' },

    { generic: 'Ampicillin-Sulbactam', common: 'Unasyn', brands: ['Unasyn'], bolus: 'Intermittent infusion over protocol interval.', monitor: 'Allergy signs, GI tolerance.' },
    { generic: 'Cefazolin', common: 'Cefazolin', brands: ['Ancef'], bolus: 'Slow IV over several minutes / short infusion.', monitor: 'Allergy, GI signs.' },
    { generic: 'Ceftriaxone', common: 'Ceftriaxone', brands: ['Rocephin'], bolus: 'Slow IV / infusion per protocol.', monitor: 'Allergy, biliary/GI effects.' },
    { generic: 'Enrofloxacin', common: 'Baytril', brands: ['Baytril'], bolus: 'Avoid rapid IV push; use slow infusion per label/protocol.', monitor: 'Site reaction, neurologic/GI signs.' },
    { generic: 'Metronidazole', common: 'Metro', brands: ['Flagyl'], bolus: 'Infuse slowly (usually 20–60 min).', monitor: 'GI tolerance, neuro signs with prolonged use.' },
    { generic: 'Piperacillin-Tazobactam', common: 'Pip-Tazo', brands: ['Zosyn'], bolus: 'Intermittent infusion per protocol.', monitor: 'Allergy, renal function.' },

    { generic: 'Fentanyl', common: 'Fentanyl CRI', brands: ['Sublimaze'], bolus: 'Slow IV over 1–2 min.', monitor: 'Respiratory rate/effort, sedation, BP.' },
    { generic: 'Hydromorphone', common: 'Hydromorphone', brands: ['Dilaudid'], bolus: 'Slow IV over 2–3 min.', monitor: 'Respiratory status, sedation, nausea/temperature.' },
    { generic: 'Ketamine', common: 'Ketamine', brands: ['Ketalar'], bolus: 'Slow IV over 1–2 min when used as bolus.', monitor: 'HR/BP, dysphoria, sedation depth.' },
    { generic: 'Methadone', common: 'Methadone', brands: ['Dolophine'], bolus: 'Slow IV over 2–3 min.', monitor: 'Respiratory status, sedation, HR.' },
    { generic: 'Midazolam', common: 'Midaz', brands: ['Versed'], bolus: 'Slow IV over 1–2 min.', monitor: 'Sedation, respiratory status, paradoxical excitement.' },
    { generic: 'Dexmedetomidine', common: 'Dexdomitor', brands: ['Dexdomitor'], bolus: 'Slow IV over 10 min or IM per protocol.', monitor: 'HR/rhythm, BP, perfusion, sedation depth.' },

    { generic: 'Maropitant', common: 'Cerenia', brands: ['Cerenia'], bolus: 'Usually slow IV or SC per label.', monitor: 'Nausea/vomiting response, injection discomfort.' },
    { generic: 'Ondansetron', common: 'Ondansetron', brands: ['Zofran'], bolus: 'Slow IV over 2–5 min.', monitor: 'Nausea control, QT risk in predisposed patients.' },
    { generic: 'Pantoprazole', common: 'Pantoprazole', brands: ['Protonix'], bolus: 'Slow IV over several minutes or infusion.', monitor: 'GI signs, line compatibility.' },
    { generic: 'Famotidine', common: 'Famotidine', brands: ['Pepcid'], bolus: 'Slow IV over 2 min.', monitor: 'HR/BP, GI response.' },
    { generic: 'Metoclopramide', common: 'Metoclopramide CRI', brands: ['Reglan'], bolus: 'Slow IV bolus or CRI per protocol.', monitor: 'GI motility response, behavior changes.' },
    { generic: 'Lactulose', common: 'Lactulose', brands: ['Kristalose'], bolus: 'Enteral medication, not IV infusion.', monitor: 'Stool output, hydration, electrolytes.' },

    { generic: 'Vincristine', common: 'Vincristine', brands: ['Oncovin'], bolus: 'Chemo protocol only; controlled IV administration.', monitor: 'Extravasation risk, CBC, GI signs.' },
    { generic: 'Cyclophosphamide', common: 'Cyclophosphamide', brands: ['Cytoxan'], bolus: 'Protocol-dependent controlled administration.', monitor: 'CBC, GI signs, urine precautions.' },
    { generic: 'Doxorubicin', common: 'Doxorubicin', brands: ['Adriamycin'], bolus: 'Protocol infusion; avoid rapid push.', monitor: 'Extravasation, arrhythmia risk, CBC/chemistry.' },
    { generic: 'Lomustine', common: 'CCNU', brands: ['CeeNU'], bolus: 'Oral chemo (not IV infusion).', monitor: 'CBC, liver enzymes.' },
    { generic: 'Carboplatin', common: 'Carboplatin', brands: ['Paraplatin'], bolus: 'Protocol-dependent infusion timing.', monitor: 'CBC, renal values.' },

    { generic: 'Dexamethasone SP', common: 'Dex SP', brands: ['Decadron'], bolus: 'Slow IV over 2–5 min.', monitor: 'Glucose, GI effects, immune suppression.' },
    { generic: 'Prednisolone Sodium Succinate', common: 'Pred-S', brands: ['Solu-Delta-Cortef'], bolus: 'Slow IV over 2–5 min.', monitor: 'Glucose, GI status, fluid balance.' },
    { generic: 'Methylprednisolone Sodium Succinate', common: 'MPSS', brands: ['Solu-Medrol'], bolus: 'Slow IV over 2–5 min.', monitor: 'BP, glucose, GI/immune effects.' },

    { generic: 'Sodium Bicarbonate', common: 'Bicarb', brands: ['NaHCO3 injection'], bolus: 'Give slowly with protocol-guided dosing.', monitor: 'Blood gas, electrolytes (Ca/K), ECG.' },
    { generic: 'Epinephrine', common: 'Adrenaline', brands: ['Adrenalin'], bolus: 'Emergency protocol dosing only.', monitor: 'ECG, BP, perfusion, lactate.' },
    { generic: 'Atropine', common: 'Atropine', brands: ['Atropen'], bolus: 'Slow IV/IM per ACLS/CPR protocol.', monitor: 'HR/rhythm, anticholinergic effects.' },
    { generic: 'Naloxone', common: 'Naloxone', brands: ['Narcan'], bolus: 'Slow IV titration to effect.', monitor: 'Respiratory drive, pain rebound.' },
    { generic: 'Flumazenil', common: 'Flumazenil', brands: ['Romazicon'], bolus: 'Slow IV titration to effect.', monitor: 'Sedation reversal, seizure risk.' },
    { generic: 'Calcium Gluconate', common: 'Calcium', brands: ['Calcium gluconate 10%'], bolus: 'Slow IV with ECG monitoring.', monitor: 'ECG continuously, perfusion, calcium level.' },
    { generic: 'Mannitol', common: 'Mannitol', brands: ['Osmitrol'], bolus: 'Controlled infusion over protocol window.', monitor: 'Urine output, osmolality, volume status.' }
  ];

  const normalize = (s) => s.toLowerCase().trim();
  const catalogByGeneric = new Map(drugCatalog.map((d) => [normalize(d.generic), d]));
  const aliasToGeneric = new Map();

  drugCatalog.forEach((d) => {
    [d.generic, d.common, ...(d.brands || [])].forEach((name) => {
      if (name) aliasToGeneric.set(normalize(name), d.generic);
    });
  });

  app.innerHTML = `
    <h2>Drug Compatibility Checker</h2>
    <section class="panel">
      <div class="form-grid">
        <div>
          <label>Add medication (type generic/common/brand/trade name)</label>
          <input id="cmpDrugInput" class="text-input" list="cmpDrugList" placeholder="e.g. Baytril, Enrofloxacin, Cerenia..." />
          <datalist id="cmpDrugList">
            ${drugCatalog.map((d) => `<option value="${d.generic}">${d.common} | ${(d.brands || []).join(', ')}</option>`).join('')}
            ${drugCatalog.flatMap((d) => [d.common, ...(d.brands || [])]).filter(Boolean).map((n) => `<option value="${n}"></option>`).join('')}
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
        <div>
          <label>Rule Policy</label>
          <select id="cmpPolicy">
            <option value="standard" selected>Standard (evidence-tiered)</option>
            <option value="conservative">Conservative (limited evidence => avoid shared line)</option>
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

  const pairRules = {
    'ampicillin-sulbactam|dexamethasone sp': {
      level: 'incompatible', evidence: 'strong',
      reason: 'Reported pH/solution instability concern in co-line setups.',
      recommendation: 'Use separate lines/lumens.'
    },
    'dobutamine|sodium bicarbonate': {
      level: 'incompatible', evidence: 'strong',
      reason: 'Catecholamine degradation risk in alkaline conditions.',
      recommendation: 'Do not co-infuse via same line.'
    },
    'dopamine|sodium bicarbonate': {
      level: 'incompatible', evidence: 'strong',
      reason: 'Catecholamine degradation risk in alkaline conditions.',
      recommendation: 'Do not co-infuse via same line.'
    },
    'norepinephrine|sodium bicarbonate': {
      level: 'incompatible', evidence: 'strong',
      reason: 'Catecholamine degradation risk in alkaline conditions.',
      recommendation: 'Do not co-infuse via same line.'
    },
    'pantoprazole|dexamethasone sp': {
      level: 'incompatible', evidence: 'moderate',
      reason: 'Potential pH-driven instability depending on concentration/formulation.',
      recommendation: 'Use separate lumen; verify compounding reference.'
    },
    'vincristine|doxorubicin': {
      level: 'incompatible', evidence: 'strong',
      reason: 'Operationally high-risk chemotherapy combination in shared line context.',
      recommendation: 'Separate chemo administration pathway only.'
    },

    'cefazolin|metronidazole': {
      level: 'caution', evidence: 'limited',
      reason: 'Condition-dependent compatibility in some settings.',
      recommendation: 'Verify concentrations and Y-site reference before co-infusion.'
    },
    'cyclophosphamide|prednisolone sodium succinate': {
      level: 'caution', evidence: 'limited',
      reason: 'Compatibility may vary by product/formulation.',
      recommendation: 'Prefer separate lumen when feasible.'
    },
    'dopamine|lidocaine': {
      level: 'caution', evidence: 'limited',
      reason: 'Some references report condition-specific results only.',
      recommendation: 'Use caution; verify before shared line.'
    },
    'enrofloxacin|metoclopramide': {
      level: 'caution', evidence: 'limited',
      reason: 'Potential compatibility variability with concentration/vehicle.',
      recommendation: 'Prefer separate line if uncertain.'
    },
    'fentanyl|midazolam': {
      level: 'caution', evidence: 'moderate',
      reason: 'Often used together but still concentration/formulation dependent.',
      recommendation: 'Accept with protocol + monitor line clarity/response.'
    },
    'ketamine|midazolam': {
      level: 'caution', evidence: 'moderate',
      reason: 'Common combination but depends on prep parameters.',
      recommendation: 'Use protocol concentrations and verify policy.'
    },
    'magnesium sulfate|enrofloxacin': {
      level: 'limited', evidence: 'limited',
      reason: 'Conflicting/insufficient compatibility evidence reported.',
      recommendation: 'Avoid shared line when possible; separate lumen preferred.'
    },
    'maropitant|ondansetron': {
      level: 'caution', evidence: 'limited',
      reason: 'Data may be incomplete for all concentrations/formulations.',
      recommendation: 'Check current compatibility source before Y-site.'
    },
    'norepinephrine|dobutamine': {
      level: 'caution', evidence: 'moderate',
      reason: 'Concurrent use common but requires protocolized line management.',
      recommendation: 'Confirm concentration compatibility and monitor closely.'
    },
    'regular insulin|potassium chloride': {
      level: 'caution', evidence: 'moderate',
      reason: 'Frequent co-therapy; line compatibility depends on dilution/setup.',
      recommendation: 'Use standardized ICU protocol and close monitoring.'
    }
  };

  const keyFor = (a, b) => [normalize(a), normalize(b)].sort().join('|');
  const getPairRule = (a, b) => pairRules[keyFor(a, b)] || null;
  const selected = [];
  const selectedEl = document.getElementById('cmpSelected');
  const outEl = document.getElementById('cmpOut');
  const guideEl = document.getElementById('cmpGuidance');

  function canonicalize(input) {
    const raw = normalize(input || '');
    if (!raw) return null;
    if (catalogByGeneric.has(raw)) return catalogByGeneric.get(raw).generic;
    return aliasToGeneric.get(raw) || null;
  }

  function renderSelected() {
    if (!selected.length) {
      selectedEl.textContent = 'No drugs selected yet.';
      guideEl.textContent = 'Bolus/monitoring guidance will appear for selected drugs.';
      return;
    }

    selectedEl.innerHTML = selected
      .map((generic, idx) => {
        const d = catalogByGeneric.get(normalize(generic));
        const label = d ? `${d.generic} (${d.common}${d.brands?.length ? ` | ${d.brands.join(', ')}` : ''})` : generic;
        return `<span style="display:inline-flex;align-items:center;gap:6px;border:1px solid #c9d5e6;border-radius:999px;padding:4px 9px;margin:3px;">${label} <button data-remove="${idx}" style="border:none;background:transparent;cursor:pointer;">✕</button></span>`;
      })
      .join('');

    selectedEl.querySelectorAll('[data-remove]').forEach((btn) => {
      btn.addEventListener('click', () => {
        selected.splice(Number(btn.dataset.remove), 1);
        renderSelected();
      });
    });

    guideEl.innerHTML = '<strong>Bolus / Monitoring Guidance:</strong>' + selected.map((generic) => {
      const d = catalogByGeneric.get(normalize(generic));
      if (!d) return '';
      return `<div style="margin-top:8px;"><strong>${d.generic}</strong> <span style="color:#60718a;">(${d.common}${d.brands?.length ? ` | ${d.brands.join(', ')}` : ''})</span><br><em>Bolus/Rate:</em> ${d.bolus}<br><em>Monitoring:</em> ${d.monitor}</div>`;
    }).join('');
  }

  document.getElementById('cmpAddDrug').addEventListener('click', () => {
    const input = document.getElementById('cmpDrugInput');
    const canonical = canonicalize(input.value);
    if (!canonical) {
      outEl.innerHTML = '<div class="warn">Drug not recognized. Type a generic/common/brand name from suggestions.</div>';
      return;
    }
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
    const policy = document.getElementById('cmpPolicy').value;
    if (selected.length < 2) {
      outEl.innerHTML = '<div class="status-card status-red">Add at least two drugs to compare.</div>';
      return;
    }

    const rows = [];
    let red = 0;
    let yellow = 0;
    let green = 0;

    for (let i = 0; i < selected.length; i++) {
      for (let j = i + 1; j < selected.length; j++) {
        const a = selected[i];
        const b = selected[j];
        const rule = getPairRule(a, b);

        if (!rule) {
          green += 1;
          rows.push(`<div class="status-card status-green"><strong>COMPATIBLE (no conflict in current prototype set)</strong> — ${a} + ${b}</div>`);
          continue;
        }

        if (rule.level === 'incompatible') {
          red += 1;
          rows.push(`<div class="status-card status-red"><strong>INCOMPATIBLE</strong> — ${a} + ${b}<br><strong>Evidence:</strong> ${rule.evidence}<br>${rule.reason}<br><strong>Action:</strong> ${rule.recommendation}</div>`);
          continue;
        }

        if (rule.level === 'limited') {
          if (policy === 'conservative') {
            red += 1;
            rows.push(`<div class="status-card status-red"><strong>LIMITED EVIDENCE (Conservative Policy => Treat as INCOMPATIBLE)</strong> — ${a} + ${b}<br>${rule.reason}<br><strong>Action:</strong> ${rule.recommendation}</div>`);
          } else {
            yellow += 1;
            rows.push(`<div class="status-card status-yellow"><strong>CONFLICTING / LIMITED DATA</strong> — ${a} + ${b}<br><strong>Evidence:</strong> ${rule.evidence}<br>${rule.reason}<br><strong>Action:</strong> ${rule.recommendation}</div>`);
          }
          continue;
        }

        yellow += 1;
        rows.push(`<div class="status-card status-yellow"><strong>USE CAUTION</strong> — ${a} + ${b}<br><strong>Evidence:</strong> ${rule.evidence}<br>${rule.reason}<br><strong>Action:</strong> ${rule.recommendation}</div>`);
      }
    }
    const fluidNote = fluid === 'lrs'
      ? 'LRS selected: calcium-containing fluid can change compatibility for some drugs.'
      : fluid === 'd5'
        ? 'D5W selected: dextrose vehicle may alter stability for some medications.'
        : '0.9% NaCl selected: often preferred for many ICU infusions.';

    const overall = red > 0
      ? `<div class="status-card status-red"><strong>Overall Outcome: HIGH RISK</strong> — ${red} incompatible pair(s), ${yellow} caution pair(s), ${green} prototype-compatible pair(s).</div>`
      : yellow > 0
        ? `<div class="status-card status-yellow"><strong>Overall Outcome: USE CAUTION</strong> — ${yellow} conflicting/caution pair(s), ${green} prototype-compatible pair(s).</div>`
        : `<div class="status-card status-green"><strong>Overall Outcome: NO CONFLICTS FOUND IN PROTOTYPE RULES</strong> — ${green} pair(s) checked.</div>`;

    outEl.innerHTML = `
      ${overall}
      <div class="status-summary">Checked ${selected.length} drugs (${(selected.length * (selected.length - 1)) / 2} pairings). Policy: <strong>${policy}</strong>.</div>
      ${rows.join('')}
      <div class="status-summary"><strong>Fluid Note:</strong> ${fluidNote}</div>
      <div class="status-summary">Always confirm against hospital formulary + current compatibility reference before administration.</div>
    `;
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
