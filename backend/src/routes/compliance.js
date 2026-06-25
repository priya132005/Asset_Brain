const express = require('express');
const router = express.Router();
const { askClaude } = require('../utils/anthropic');
const { relatedDocs } = require('../utils/retrieval');
const { REGULATIONS } = require('../data/regulations');

async function checkOne(reg) {
  const evidence = relatedDocs(reg.keywords);
  const context = evidence.map((d) => `[${d.id}] ${d.text}`).join('\n\n');

  const system = `You are a Compliance Intelligence agent. Compare ONE regulatory requirement against the supplied plant evidence (procedures, inspections, work orders, incidents). Classify status as exactly one of: Compliant, Partial, Gap. Respond ONLY with valid JSON: {"status":"Compliant|Partial|Gap","finding":"<1-2 sentence evidence-based finding citing doc IDs in brackets>"}`;
  const user = `REQUIREMENT (${reg.id}): ${reg.req}\n\nEVIDENCE:\n${context || '(no related evidence found in corpus)'}`;

  const result = await askClaude(system, user, true);
  return {
    id: reg.id,
    req: reg.req,
    status: result.status || 'Partial',
    finding: result.finding || result.raw || 'No finding returned.',
    evidence: evidence.map((e) => e.id)
  };
}

// POST /api/compliance/check  { regulationId: "OISD-105 §7.2" } -> single clause result
router.post('/check', async (req, res) => {
  try {
    const { regulationId } = req.body || {};
    const reg = REGULATIONS.find((r) => r.id === regulationId);
    if (!reg) return res.status(400).json({ error: 'unknown regulationId' });
    res.json(await checkOne(reg));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/compliance/scan -> runs every tracked clause, returns full results + gap count
router.post('/scan', async (req, res) => {
  try {
    const results = [];
    for (const reg of REGULATIONS) {
      results.push(await checkOne(reg)); // sequential: keeps demo output order stable & easy to follow in logs
    }
    const gapCount = results.filter((r) => r.status === 'Gap').length;
    res.json({ results, gapCount, totalClauses: REGULATIONS.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
