const express = require('express');
const router = express.Router();
const { askClaude } = require('../utils/anthropic');
const { retrieve } = require('../utils/retrieval');

// POST /api/copilot/ask  { question: string }
// -> { answer, citations: string[], confidence: number, sources: string[] }
router.post('/ask', async (req, res) => {
  try {
    const { question } = req.body || {};
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'question (string) is required' });
    }

    const sources = retrieve(question, 3);
    const context = sources
      .map((s) => `[${s.id}] (${s.type}, ${s.date})\n${s.text}`)
      .join('\n\n---\n\n');

    const system = `You are an Industrial Knowledge Copilot for a plant operations team. Answer ONLY using the provided source excerpts. Always cite the source document IDs you used. If the sources don't fully answer the question, say what's missing. Respond ONLY with valid JSON, no markdown, no preamble, in this exact shape:
{"answer":"<2-4 sentence answer in plain operational language>","citations":["DOC_ID", "DOC_ID"],"confidence":<integer 0-100>}`;
    const user = `SOURCES:\n${context || '(no matching sources found in corpus)'}\n\nQUESTION: ${question}`;

    const result = await askClaude(system, user, true);
    res.json({ ...result, sources: sources.map((s) => s.id) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
