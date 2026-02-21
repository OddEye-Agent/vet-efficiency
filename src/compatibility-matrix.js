// Data-only compatibility registry (pairwise)
window.compatibilityRegistry = {
  source: {
    name: 'Thames Valley Y-Site Intravenous Drugs Compatibility Chart',
    version: '2.1',
    date: '2011-03',
    notes: [
      'Pairwise Y-site guide only; do not extrapolate to 3-drug combinations.',
      'Manufacturer concentration assumptions; higher concentrations may change compatibility.',
      'Physical compatibility emphasized over full chemical compatibility in many references.',
      'Carrier-fluid compatibility must also be validated separately.'
    ]
  },
  legend: {
    compatible: {
      chartSymbol: '✓',
      mappedLevel: 'compatible',
      uiColor: 'green',
      guidance: 'Compatible at chart conditions; still validate fluid/concentration.'
    },
    incompatible: {
      chartSymbol: '✗',
      mappedLevel: 'incompatible',
      uiColor: 'red',
      guidance: 'Do not Y-site co-infuse; use separate line/lumen.'
    },
    variable: {
      chartSymbol: 'v',
      mappedLevel: 'limited',
      uiColor: 'yellow',
      guidance: 'Variable/conflicting data; consult pharmacy/reference before Y-site co-infusion.'
    },
    unknown: {
      chartSymbol: '?',
      mappedLevel: 'limited',
      uiColor: 'yellow',
      guidance: 'Not known; do not assume compatibility.'
    }
  },
  rules: [
    { a: 'Ampicillin-Sulbactam', b: 'Dexamethasone SP', chartStatus: 'incompatible', level: 'incompatible', evidence: 'strong', reason: 'Reported pH/solution instability concern in co-line setups.', recommendation: 'Use separate lines/lumens.', reference: 'Thames Valley 2011 / Trissel' },
    { a: 'Dobutamine', b: 'Sodium Bicarbonate', chartStatus: 'incompatible', level: 'incompatible', evidence: 'strong', reason: 'Catecholamine degradation risk in alkaline conditions.', recommendation: 'Do not co-infuse via same line.', reference: 'Thames Valley 2011' },
    { a: 'Dopamine', b: 'Sodium Bicarbonate', chartStatus: 'incompatible', level: 'incompatible', evidence: 'strong', reason: 'Catecholamine degradation risk in alkaline conditions.', recommendation: 'Do not co-infuse via same line.', reference: 'Thames Valley 2011' },
    { a: 'Norepinephrine', b: 'Sodium Bicarbonate', chartStatus: 'incompatible', level: 'incompatible', evidence: 'strong', reason: 'Catecholamine degradation risk in alkaline conditions.', recommendation: 'Do not co-infuse via same line.', reference: 'Thames Valley 2011' },
    { a: 'Pantoprazole', b: 'Dexamethasone SP', chartStatus: 'incompatible', level: 'incompatible', evidence: 'moderate', reason: 'Potential pH-driven instability depending on concentration/formulation.', recommendation: 'Use separate lumen; verify compounding reference.', reference: 'Thames Valley 2011 / local rule' },
    { a: 'Potassium Phosphate', b: 'Calcium Gluconate', chartStatus: 'incompatible', level: 'incompatible', evidence: 'strong', reason: 'Calcium-phosphate precipitation risk.', recommendation: 'Do not co-infuse in same line.', reference: 'Core IV compatibility principle' },
    { a: 'Potassium Phosphate', b: 'Calcium Chloride', chartStatus: 'incompatible', level: 'incompatible', evidence: 'strong', reason: 'Calcium-phosphate precipitation risk.', recommendation: 'Do not co-infuse in same line.', reference: 'Core IV compatibility principle' },
    { a: 'Vincristine', b: 'Doxorubicin', chartStatus: 'incompatible', level: 'incompatible', evidence: 'strong', reason: 'Operationally high-risk chemotherapy combination in shared line context.', recommendation: 'Separate chemo administration pathway only.', reference: 'Oncology handling policy' },

    { a: 'Cefazolin', b: 'Metronidazole', chartStatus: 'variable', level: 'caution', evidence: 'limited', reason: 'Condition-dependent compatibility in some settings.', recommendation: 'Verify concentrations and Y-site reference before co-infusion.', reference: 'Thames Valley 2011' },
    { a: 'Cyclophosphamide', b: 'Prednisolone Sodium Succinate', chartStatus: 'variable', level: 'caution', evidence: 'limited', reason: 'Compatibility may vary by product/formulation.', recommendation: 'Prefer separate lumen when feasible.', reference: 'Prototype rule' },
    { a: 'Dopamine', b: 'Lidocaine', chartStatus: 'variable', level: 'caution', evidence: 'limited', reason: 'Some references report condition-specific results only.', recommendation: 'Use caution; verify before shared line.', reference: 'Thames Valley 2011' },
    { a: 'Enrofloxacin', b: 'Metoclopramide', chartStatus: 'variable', level: 'caution', evidence: 'limited', reason: 'Potential compatibility variability with concentration/vehicle.', recommendation: 'Prefer separate line if uncertain.', reference: 'Prototype rule' },
    { a: 'Fentanyl', b: 'Midazolam', chartStatus: 'compatible', level: 'caution', evidence: 'moderate', reason: 'Often used together but still concentration/formulation dependent.', recommendation: 'Accept with protocol + monitor line clarity/response.', reference: 'Thames Valley 2011 + ICU practice' },
    { a: 'Ketamine', b: 'Midazolam', chartStatus: 'compatible', level: 'caution', evidence: 'moderate', reason: 'Common combination but depends on prep parameters.', recommendation: 'Use protocol concentrations and verify policy.', reference: 'ICU protocol pattern' },
    { a: 'Maropitant', b: 'Ondansetron', chartStatus: 'variable', level: 'caution', evidence: 'limited', reason: 'Data may be incomplete for all concentrations/formulations.', recommendation: 'Check current compatibility source before Y-site.', reference: 'Prototype rule' },
    { a: 'Norepinephrine', b: 'Dobutamine', chartStatus: 'compatible', level: 'caution', evidence: 'moderate', reason: 'Concurrent use common but requires protocolized line management.', recommendation: 'Confirm concentration compatibility and monitor closely.', reference: 'Thames Valley 2011 / ICU practice' },
    { a: 'Regular Insulin', b: 'Potassium Chloride', chartStatus: 'compatible', level: 'caution', evidence: 'moderate', reason: 'Frequent co-therapy; line compatibility depends on dilution/setup.', recommendation: 'Use standardized ICU protocol and close monitoring.', reference: 'ICU protocol pattern' },

    { a: 'Magnesium Sulfate', b: 'Enrofloxacin', chartStatus: 'variable', level: 'limited', evidence: 'limited', reason: 'Conflicting/insufficient compatibility evidence reported.', recommendation: 'Avoid shared line when possible; separate lumen preferred.', reference: 'User-flagged + limited sources' },
    { a: 'Magnesium Sulfate', b: 'Sodium Bicarbonate', chartStatus: 'variable', level: 'limited', evidence: 'limited', reason: 'Potential precipitation/instability concern reported in some references.', recommendation: 'Prefer separate lumen; verify Y-site data at actual concentrations.', reference: 'Thames Valley pattern + local caution' },
    { a: 'Omeprazole', b: 'Vancomycin', chartStatus: 'unknown', level: 'limited', evidence: 'limited', reason: 'pH-related compatibility concerns noted for omeprazole with some co-infusions.', recommendation: 'Avoid shared line unless compatibility explicitly confirmed.', reference: 'Thames Valley pattern + local caution' },
    { a: 'Propofol', b: 'Vancomycin', chartStatus: 'unknown', level: 'limited', evidence: 'limited', reason: 'Emulsion compatibility may vary by formulation/line conditions.', recommendation: 'Use separate lumen when possible.', reference: 'Prototype rule' },
    { a: 'Thiopental', b: 'Sodium Bicarbonate', chartStatus: 'variable', level: 'caution', evidence: 'limited', reason: 'Alkaline chemistry/physical instability concerns in mixed conditions.', recommendation: 'Check protocol and avoid unnecessary line co-mingling.', reference: 'Thames Valley pattern' }
  ]
};

// Backward-compatible alias
window.compatibilityMatrix = window.compatibilityRegistry.rules;
