/**
 * Synthetic demo corpus — stands in for the output of a real OCR / document
 * ingestion pipeline (scanned PDFs, P&IDs, CMMS exports, email archives...).
 * Swap this module out for a real database / search index in production.
 */
const CORPUS = [
  { id: 'PID-A12', type: 'P&ID / Equipment List', title: 'Unit A — Equipment Register', date: '2025-06-01',
    text: `Unit A Equipment Register (from P&ID set A-100 series). P-101: Centrifugal Pump, service: hydrocarbon transfer, mechanical seal type B. V-203: Pressure Vessel, design pressure 12 barg, carbon steel, min. wall thickness 8.0mm. E-305: Shell & Tube Heat Exchanger, cooling service. All three assets are part of the Unit A feed train and are inspected under the Unit A integrity program.` },

  { id: 'OEM-PM-205', type: 'OEM Manual', title: 'Centrifugal Pump P-101 — Maintenance Manual Extract', date: '2023-05-10',
    text: `OEM Manual, Pump Model CP-205 (installed as P-101). Section 6.3 Seal Maintenance: mechanical seal (Type B) shall be inspected every 6 months and replaced at a maximum interval of 18 months under normal hydrocarbon service, or earlier if vibration exceeds 4.5 mm/s RMS. Operating outside this interval significantly increases probability of seal face wear and process leakage.` },

  { id: 'WO-4471', type: 'Maintenance Work Order', title: 'WO-4471 — P-101 Seal Leak Repair', date: '2026-02-14',
    text: `Work Order 4471. Equipment: P-101. Reported by: Rakesh Sharma (Shift Technician). Fault: visible leakage at mechanical seal, minor hydrocarbon drip at base of pump. Action taken: tightened gland, topped up seal flush, leak reduced but not eliminated. Note: seal last fully replaced 2024-04-02 (per maintenance history), no replacement logged since. Technician recommends full seal replacement at next shutdown.` },

  { id: 'INC-0087', type: 'Incident / Near-Miss Report', title: 'INC-0087 — P-101 Seal Failure (Near Miss)', date: '2026-02-15',
    text: `Incident Report INC-0087. Equipment: P-101. Classification: Near miss, minor hydrocarbon release, contained, no injury. Description: one day after WO-4471, seal leak recurred and worsened overnight shift. Investigated by: Anita Verma (HSE). Preliminary cause: seal wear consistent with operating beyond OEM-recommended 18-month replacement interval (seal in service ~22 months at time of incident). Recommendation: enforce seal replacement scheduling against OEM interval, not reactive repair only.` },

  { id: 'EMAIL-3342', type: 'Email Archive', title: 'Email — Repeated P-101 Leak Complaints', date: '2026-01-20',
    text: `From: Operations Manager. Subject: P-101 leaking again. This is the third complaint this quarter about P-101 seal leakage from the shift team. Maintenance keeps doing temporary gland tightening instead of a full seal replacement. Please check when this was last actually replaced and whether we are following the OEM schedule. Escalating before this becomes a bigger spill.` },

  { id: 'INSP-2291', type: 'Inspection Report', title: 'INSP-2291 — Vessel V-203 Thickness Survey', date: '2026-03-02',
    text: `Inspection Report INSP-2291. Equipment: V-203 (Pressure Vessel). Inspector: Anita Verma. Method: ultrasonic thickness gauging, 12 grid points. Findings: average wall thickness 7.1mm against design minimum 8.0mm at 3 of 12 points — localized corrosion below minimum allowable thickness. Last documented thickness survey prior to this: 2023-11-10, an interval of ~28 months. Recommendation: engineering fitness-for-service review and re-rating or repair before next operating campaign; increase inspection frequency.` },

  { id: 'SOP-118', type: 'Standard Operating Procedure', title: 'SOP-118 — P-101 Startup, Shutdown & Seal Care', date: '2022-09-01',
    text: `SOP-118: Pump P-101 Operating Procedure. Section 4: Seal Care. Operators shall visually check for seal leakage every shift and log readings. Section 7: any leakage beyond a light weep shall trigger a maintenance work order within 24 hours. This SOP does not currently specify a mandatory seal replacement interval — maintenance scheduling is left to the maintenance team's discretion, referencing OEM documentation as needed.` },

  { id: 'REG-OISD-105', type: 'Regulatory Standard', title: 'OISD-STD-105 — Pressure Vessel Integrity (excerpt)', date: '2021-01-01',
    text: `OISD-STD-105 (excerpt, illustrative for this demo). Clause 7.2: Pressure vessels in hydrocarbon service shall undergo thickness survey at intervals not exceeding 24 months, or earlier if corrosion rate data indicates a shorter remaining life. Clause 9.1: Any reading below minimum allowable wall thickness shall trigger an immediate engineering fitness-for-service assessment before continued operation.` },

  { id: 'REG-OISD-118', type: 'Regulatory Standard', title: 'OISD-STD-118 — Rotating Equipment Seal & Leak Management (excerpt)', date: '2021-01-01',
    text: `OISD-STD-118 (excerpt, illustrative for this demo). Clause 4.3: Facilities shall maintain a documented preventive seal-replacement program for rotating equipment in hydrocarbon service, aligned to OEM-specified maximum intervals, and shall not rely solely on reactive repair following observed leakage. Clause 5.1: Repeated leak events on the same equipment within a 12-month period shall be reviewed as a systemic maintenance-program finding, not treated as isolated repairs.` },

  { id: 'REG-ENV-22', type: 'Environmental Norm', title: 'Environmental Norm EN-22 — Hydrocarbon Spill Reporting (excerpt)', date: '2020-01-01',
    text: `Environmental Norm EN-22 (excerpt, illustrative). Any hydrocarbon release to the environment, however contained, shall be logged in the spill register within 24 hours, with classification (contained / near-miss / reportable) and root cause noted, contributing to the facility's annual environmental compliance return.` }
];

const EQUIPMENT = ['P-101', 'V-203', 'E-305'];

module.exports = { CORPUS, EQUIPMENT };
