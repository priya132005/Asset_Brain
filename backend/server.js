require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const corpusRoutes = require('./src/routes/corpus');
const copilotRoutes = require('./src/routes/copilot');
const maintenanceRoutes = require('./src/routes/maintenance');
const complianceRoutes = require('./src/routes/compliance');

const app = express();
const PORT = process.env.PORT || 8787;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// ---- API routes ----
app.use('/api', corpusRoutes);
app.use('/api/copilot', copilotRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/compliance', complianceRoutes);

app.get('/api/health', (req, res) => {
  res.json({ ok: true, hasApiKey: Boolean(process.env.ANTHROPIC_API_KEY) });
});

// ---- Serve the static frontend (so `npm start` here runs the whole app) ----
const frontendDir = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendDir));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(frontendDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`ASSET BRAIN backend running on http://localhost:${PORT}`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('⚠ ANTHROPIC_API_KEY is not set — Copilot, RCA and Compliance calls will fail. See backend/.env.example');
  }
});
