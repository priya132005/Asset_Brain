/**
 * If the frontend is served by the same Express app as the backend
 * (the default `npm start` setup in this repo), leave this as ''  —
 * relative /api/... calls just work.
 *
 * If you deploy the frontend separately (e.g. GitHub Pages / Vercel)
 * and the backend elsewhere (e.g. Render / Railway), set the full
 * backend origin here, e.g.:
 *   window.API_BASE = 'https://asset-brain-api.onrender.com';
 */
window.API_BASE = window.API_BASE || '';
