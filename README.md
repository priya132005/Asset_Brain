# ASSET BRAIN
### Unified Industrial Knowledge Intelligence Platform
**ET AI Hackathon 2026 · Problem Statement 8 · Team priyak.dd22.cs**

ASSET BRAIN ingests heterogeneous industrial documents — P&IDs, work orders, SOPs, OEM manuals, inspection reports, incident reports, email archives, and regulatory text — and makes their collective intelligence queryable through one knowledge graph and four AI agents:

- **Expert Knowledge Copilot** — RAG chat with source citations and a confidence score
- **Maintenance Intelligence & RCA Agent** — fuses work orders, OEM specs, inspections and incidents into a root-cause analysis and predictive risk score
- **Quality & Regulatory Compliance Intelligence** — maps regulatory clauses against procedures and records, flags gaps, and exports an audit evidence package
- **Knowledge Graph** — a live, click-to-inspect graph linking documents, equipment, people and regulation

This repo is a real, runnable full-stack prototype: a Node/Express backend that holds the API key and does all the reasoning calls, and a plain HTML/CSS/JS frontend that never talks to the AI provider directly.

```
asset-brain/
├── backend/                  Express API server
│   ├── server.js             entrypoint — also serves the frontend statically
│   ├── src/
│   │   ├── data/             demo corpus + regulatory clauses (swap for a real DB)
│   │   ├── routes/           /api/corpus, /api/copilot, /api/maintenance, /api/compliance
│   │   └── utils/            Anthropic API client + simple keyword retrieval
│   ├── package.json
│   └── .env.example
└── frontend/                 static HTML/CSS/JS, no build step
    ├── index.html
    ├── css/styles.css
    └── js/  config.js · api.js · graph.js · app.js
```

## Quick start

```bash
git clone <your-fork-url>
cd asset-brain/backend
npm install
cp .env.example .env        # then add your ANTHROPIC_API_KEY
npm start
```

Open **http://localhost:8787** — the backend serves the frontend too, so that's the whole app.

Get an API key at [console.anthropic.com](https://console.anthropic.com/). Without a key, the Dashboard, Document Ingestion and Knowledge Graph tabs still work fully (entity extraction is local/deterministic); the Expert Copilot, Maintenance & RCA, and Compliance Intelligence tabs need the key since they call an LLM.

## How it works

1. **Ingestion** — the frontend extracts equipment tags, people, dates and regulatory references from each document with a deterministic regex pass (fast, free, auditable). This feeds the knowledge graph.
2. **Knowledge graph** — a D3.js force-directed graph of `Document ↔ Equipment ↔ Person ↔ Regulation` nodes, built client-side from the extracted entities.
3. **Reasoning agents** — Copilot / RCA / Compliance all follow the same pattern: the backend retrieves the relevant source documents by keyword overlap, builds a prompt that includes only that evidence, and asks the model to return **structured JSON** (answer + citations + confidence, or root cause + risk score, or compliance status + finding). The frontend renders that JSON — it never sees raw model text or your API key.

## API reference

| Method | Path | Body | Returns |
|---|---|---|---|
| GET | `/api/corpus` | – | `{ documents[], equipment[] }` |
| GET | `/api/regulations` | – | `{ regulations[] }` |
| POST | `/api/copilot/ask` | `{ question }` | `{ answer, citations[], confidence, sources[] }` |
| POST | `/api/maintenance/rca` | `{ equipment }` | `{ rootCause, contributingFactors[], recommendedActions[], riskScore, riskLabel, nextInspectionRecommendation, sources[] }` |
| POST | `/api/compliance/check` | `{ regulationId }` | `{ id, req, status, finding, evidence[] }` |
| POST | `/api/compliance/scan` | – | `{ results[], gapCount, totalClauses }` |
| GET | `/api/health` | – | `{ ok, hasApiKey }` |

## Swapping in real data

The demo ships with a synthetic 8–10 document corpus (`backend/src/data/corpus.js`) modeled on a refinery unit, so the app is fully runnable out of the box. To point it at real documents:

1. Replace `backend/src/data/corpus.js` with a loader that reads from your CMMS/DMS/email export (or a database).
2. Replace `backend/src/utils/retrieval.js`'s keyword search with a real vector index (e.g. embeddings + a vector DB) for better recall at scale.
3. The route handlers and prompt contracts (`backend/src/routes/*.js`) don't need to change — they're already decoupled from the data source.

## Deploying separately (frontend + backend on different hosts)

- Deploy `backend/` to any Node host (Render, Railway, Fly.io, a VM) with `ANTHROPIC_API_KEY` set as an environment variable.
- Deploy `frontend/` as static files (GitHub Pages, Vercel, Netlify).
- In `frontend/js/config.js`, set `window.API_BASE` to your backend's URL, e.g. `https://asset-brain-api.onrender.com`.
- Make sure CORS is allowed for your frontend's origin (the backend uses the permissive `cors()` default — tighten this for production).

## Tech stack

- **Backend**: Node.js, Express, the Anthropic Messages API
- **Frontend**: vanilla HTML/CSS/JS, D3.js (force-directed graph), no build step or framework required
- **Data**: in-memory demo corpus — designed to be swapped for a real document store / graph database

## License

MIT — see [LICENSE](LICENSE).

---
*Team priyak.dd22.cs · ET AI Hackathon 2026 · Problem Statement 8: AI for Industrial Knowledge Intelligence*
