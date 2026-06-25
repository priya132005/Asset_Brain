/**
 * Illustrative regulatory clauses used by the Compliance Intelligence agent.
 * `keywords` drive a simple evidence-retrieval step before the LLM call —
 * swap for a real clause/control library + embeddings in production.
 */
const REGULATIONS = [
  { id: 'OISD-105 §7.2', req: 'Pressure vessel thickness survey at intervals not exceeding 24 months.', keywords: ['V-203', 'thickness', 'vessel'] },
  { id: 'OISD-105 §9.1', req: 'Immediate fitness-for-service review if reading is below minimum allowable wall thickness.', keywords: ['V-203', 'minimum', 'thickness'] },
  { id: 'OISD-118 §4.3', req: 'Documented preventive seal-replacement program aligned to OEM max interval; no reliance on reactive repair alone.', keywords: ['P-101', 'seal', 'OEM', 'interval'] },
  { id: 'OISD-118 §5.1', req: 'Repeated leak events on same equipment within 12 months reviewed as systemic finding.', keywords: ['P-101', 'leak', 'recurring'] },
  { id: 'EN-22', req: 'Any hydrocarbon release logged in spill register within 24 hours with classification & root cause.', keywords: ['leak', 'spill', 'incident', 'near miss'] }
];

module.exports = { REGULATIONS };
