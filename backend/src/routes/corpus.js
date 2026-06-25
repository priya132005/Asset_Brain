const express = require('express');
const router = express.Router();
const { CORPUS, EQUIPMENT } = require('../data/corpus');
const { REGULATIONS } = require('../data/regulations');

// GET /api/corpus -> all ingested documents (front-end uses this to render
// the Document Ingestion tab and build the knowledge graph)
router.get('/corpus', (req, res) => {
  res.json({ documents: CORPUS, equipment: EQUIPMENT });
});

// GET /api/regulations -> regulatory clauses tracked by the Compliance module
router.get('/regulations', (req, res) => {
  res.json({ regulations: REGULATIONS.map(({ id, req: text }) => ({ id, req: text })) });
});

module.exports = router;
