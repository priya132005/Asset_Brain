const express = require('express');
const router = express.Router();
const { askClaude } = require('../utils/anthropic');
const { CORPUS, EQUIPMENT } = require('../data/corpus');

// POST /api/maintenance/rca  { equipment: "P-101" }
// -> { rootCause, contributingFactors[], recommendedActions[], riskScore, riskLabel, nextInspectionRecommendation, sources[] }
router.post('/rca', async (req, res) => {
  try {
    const { equipment } = req.body || {};
    if (!equipment || !EQUIPMENT.includes(equipment)) {
      return res.status(400).json({ error: `equipment must be one of: ${EQUIPMENT.join(', ')}` });
    }

    const related = CORPUS.filter((d) => d.text.includes(equipment) || d.title.includes(equipment));
    const context = related
      .map((d) => `[${d.id}] (${d.type}, ${d.date})\n${d.text}`)
      .join('\n\n---\n\n');

    const system = `You are a Maintenance Intelligence & RCA agent for an industrial plant. Using ONLY the supplied records for one asset, produce a root cause analysis and forward maintenance plan. Respond ONLY with valid JSON in this exact shape:
{"rootCause":"<1-2 sentences>","contributingFactors":["...","..."],"recommendedActions":["...","..."],"riskScore":<integer 0-100, likelihood of recurrence/failure>,"riskLabel":"<Low|Medium|High|Critical>","nextInspectionRecommendation":"<short instruction>"}`;
    const user = `ASSET: ${equipment}\n\nRECORDS:\n${context || '(no records found)'}\n\nProduce the RCA and maintenance plan.`;

    const result = await askClaude(system, user, true);
    res.json({ ...result, sources: related.map((r) => r.id) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
