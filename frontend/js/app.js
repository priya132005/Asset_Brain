/**
 * ASSET BRAIN frontend app logic.
 * Entity extraction is done client-side with deterministic regex (fast,
 * auditable, no API cost). Copilot / RCA / Compliance reasoning calls go
 * through Api -> our backend -> Anthropic (see js/api.js).
 */

let CORPUS = [];
let EQUIPMENT = [];
let REGULATIONS = [];
let entityStore = {};
let totalEntities = 0;
let selectedEq = null;

/* ===================== BOOTSTRAP ===================== */
async function bootstrap() {
  try {
    const corpusRes = await Api.getCorpus();
    CORPUS = corpusRes.documents;
    EQUIPMENT = corpusRes.equipment;

    const regsRes = await Api.getRegulations();
    REGULATIONS = regsRes.regulations;

    selectedEq = EQUIPMENT[0];
    renderDocList();
    renderEqSelect();
    renderCompTable();
    KnowledgeGraph.renderHero('#heroGraph');
    extractAll();
  } catch (err) {
    document.querySelector('.main').innerHTML = `
      <div class="card" style="margin-top:40px;">
        <div class="panel-title">Couldn't reach the backend</div>
        <div class="panel-desc">${err.message}</div>
        <div class="panel-desc">Is the backend running? From the repo root: <code>cd backend && npm install && npm start</code></div>
      </div>`;
  }
}

/* ===================== NAV ===================== */
function goTab(tab) {
  document.querySelectorAll('.nav-item').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.tab-page').forEach((p) => p.classList.toggle('active', p.id === 'page-' + tab));
  if (tab === 'graph') setTimeout(() => KnowledgeGraph.render('#kgCanvas', showNodeDetail), 30);
}
document.getElementById('navList').addEventListener('click', (e) => {
  const btn = e.target.closest('.nav-item');
  if (!btn) return;
  goTab(btn.dataset.tab);
});

/* ===================== INGESTION (client-side deterministic extraction) ===================== */
function regexEntities(text) {
  const equip = Array.from(new Set(text.match(/\b[A-Z]{1,2}-\d{2,4}\b/g) || []));
  const people = Array.from(
    new Set(
      (text.match(/(?:[A-Z][a-z]+ (?:Sharma|Verma|Singh|Kumar|Reddy|Mehta|Iyer|Manager|Technician))/g) || []).map((s) =>
        s.replace(' Manager', '').replace(' Technician', '')
      )
    )
  );
  const dates = Array.from(new Set(text.match(/\b\d{4}-\d{2}-\d{2}\b/g) || []));
  const regs = Array.from(new Set(text.match(/OISD-STD-\d+|EN-\d+/g) || []));
  return { equipment: equip, people: Array.from(new Set(people)), dates, regulations: regs };
}

function renderDocList() {
  const list = document.getElementById('docList');
  list.innerHTML = CORPUS.map(
    (d) => `
    <div class="doc-row" id="row-${d.id}">
      <div class="doc-icon">${d.id}</div>
      <div class="doc-meta">
        <div class="doc-title">${d.title}</div>
        <div class="doc-sub">${d.type} · ${d.date}</div>
        <div class="entity-box" id="ent-${d.id}"></div>
      </div>
      <div class="doc-status" id="status-${d.id}">not processed</div>
      <button class="btn ghost sm" onclick="extractDoc('${d.id}')">Extract</button>
    </div>
  `
  ).join('');
}

function showEntities(doc, ents) {
  const box = document.getElementById('ent-' + doc.id);
  box.classList.add('show');
  box.innerHTML = `
    <div class="row"><span class="k">Equipment</span>${ents.equipment.map((e) => `<span class="tag">${e}</span>`).join('') || '<span class="tag">—</span>'}</div>
    <div class="row"><span class="k">People</span>${ents.people.map((e) => `<span class="tag">${e}</span>`).join('') || '<span class="tag">—</span>'}</div>
    <div class="row"><span class="k">Dates</span>${ents.dates.map((e) => `<span class="tag">${e}</span>`).join('') || '<span class="tag">—</span>'}</div>
    <div class="row"><span class="k">Regulations</span>${ents.regulations.map((e) => `<span class="tag">${e}</span>`).join('') || '<span class="tag">—</span>'}</div>
  `;
}

function extractDoc(id) {
  const doc = CORPUS.find((d) => d.id === id);
  const ents = regexEntities(doc.text);
  entityStore[id] = ents;
  document.getElementById('status-' + id).innerHTML = '<span style="color:var(--green)">✓ indexed</span>';
  showEntities(doc, ents);
  totalEntities = Object.values(entityStore).reduce(
    (sum, e) => sum + e.equipment.length + e.people.length + e.dates.length + e.regulations.length,
    0
  );
  document.getElementById('kpiEntities').textContent = totalEntities;
}
function extractAll() {
  CORPUS.forEach((d) => extractDoc(d.id));
  rebuildGraph();
}

/* ===================== KNOWLEDGE GRAPH ===================== */
function rebuildGraph() {
  CORPUS.forEach((d) => {
    if (!entityStore[d.id]) entityStore[d.id] = regexEntities(d.text);
  });
  KnowledgeGraph.build(CORPUS, entityStore);
  document.getElementById('kpiEntities').textContent = Object.values(entityStore).reduce(
    (s, e) => s + e.equipment.length + e.people.length + e.dates.length + e.regulations.length,
    0
  );
  if (document.getElementById('page-graph').classList.contains('active')) {
    KnowledgeGraph.render('#kgCanvas', showNodeDetail);
  }
}

function showNodeDetail(d, links) {
  const linkedDocs = links
    .filter((l) => l.source.id === d.id || l.target.id === d.id)
    .map((l) => (l.source.id === d.id ? l.target : l.source));
  const body = document.getElementById('kgDetailBody');
  body.classList.remove('empty');
  body.innerHTML = `
    <div style="font-family:var(--font-mono); font-size:11px; color:var(--text-dim2); text-transform:uppercase; margin-bottom:4px;">${d.type}</div>
    <div style="font-weight:700; font-size:15px; margin-bottom:10px;">${d.label}</div>
    <div class="section-label">Linked nodes (${linkedDocs.length})</div>
    <div style="display:flex; flex-wrap:wrap; gap:6px;">${linkedDocs.map((n) => `<span class="tag">${n.label}</span>`).join('') || '<span class="tag">none</span>'}</div>
  `;
}

/* ===================== EXPERT COPILOT (RAG via backend) ===================== */
function appendMsg(role, html) {
  const log = document.getElementById('chatLog');
  const div = document.createElement('div');
  div.className = 'msg ' + role;
  div.innerHTML = html;
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
  return div;
}

function askSuggested(q) {
  document.getElementById('chatInput').value = q;
  sendChat();
}

async function sendChat() {
  const input = document.getElementById('chatInput');
  const q = input.value.trim();
  if (!q) return;
  appendMsg('user', escapeHtml(q));
  input.value = '';
  const loadingDiv = appendMsg('bot', '<span class="loading-text"><span class="spinner"></span> retrieving sources & reasoning…</span>');

  try {
    const result = await Api.askCopilot(q);
    loadingDiv.remove();
    const cites = (result.citations || []).map((c) => `<span class="cite" onclick="goTab('ingest')">${c}</span>`).join('');
    appendMsg(
      'bot',
      `<div>${escapeHtml(result.answer || '')}</div><div>${cites}</div><div class="conf">● confidence ${result.confidence ?? '—'}%</div>`
    );
  } catch (err) {
    loadingDiv.remove();
    appendMsg('bot', `<div>Sorry — couldn't reach the reasoning model just now. (${escapeHtml(err.message)})</div>`);
  }
}

/* ===================== MAINTENANCE & RCA ===================== */
function renderEqSelect() {
  const wrap = document.getElementById('eqSelect');
  wrap.innerHTML =
    EQUIPMENT.map((e) => `<button class="eq-chip ${e === selectedEq ? 'active' : ''}" onclick="selectEq('${e}')">${e}</button>`).join('') +
    `<button class="btn sm" style="margin-left:auto;" onclick="runRCA()">⚙ Generate RCA &amp; maintenance plan</button>`;
}
function selectEq(e) {
  selectedEq = e;
  renderEqSelect();
  document.getElementById('rcaOutput').innerHTML = '';
}

async function runRCA() {
  const out = document.getElementById('rcaOutput');
  out.innerHTML = `<div class="loading-text" style="margin-top:10px;"><span class="spinner"></span> fusing work orders, OEM spec, inspection &amp; incident history for ${selectedEq}…</div>`;

  try {
    const result = await Api.getRCA(selectedEq);
    const riskColor = result.riskScore > 70 ? 'var(--red)' : result.riskScore > 40 ? 'var(--amber)' : 'var(--green)';
    out.innerHTML = `
      <div class="rca-grid">
        <div class="card">
          <div class="panel-title">Root cause analysis — ${selectedEq}</div>
          <div style="font-size:13.5px; margin:8px 0 4px;">${escapeHtml(result.rootCause || '')}</div>
          <div class="section-label">Contributing factors</div>
          <ul class="clean">${(result.contributingFactors || []).map((f) => `<li>${escapeHtml(f)}</li>`).join('')}</ul>
          <div class="section-label">Recommended actions</div>
          <ul class="clean">${(result.recommendedActions || []).map((f) => `<li>${escapeHtml(f)}</li>`).join('')}</ul>
        </div>
        <div class="card">
          <div class="panel-title">Predictive risk</div>
          <div class="risk-meter">
            <div class="risk-bar"><div class="risk-fill" style="width:${result.riskScore}%; background:${riskColor};"></div></div>
            <div style="font-family:var(--font-mono); font-weight:700; color:${riskColor};">${result.riskScore}%</div>
          </div>
          <div class="badge" style="margin-top:8px; background:rgba(255,255,255,.06); color:var(--text); border:1px solid var(--border);">${result.riskLabel} risk of recurrence</div>
          <div class="section-label">Next inspection / action</div>
          <div style="font-size:13px;">${escapeHtml(result.nextInspectionRecommendation || '')}</div>
          <div class="section-label">Source records fused</div>
          <div style="display:flex; flex-wrap:wrap; gap:6px;">${(result.sources || []).map((r) => `<span class="tag">${r}</span>`).join('')}</div>
        </div>
      </div>
    `;
  } catch (err) {
    out.innerHTML = `<div class="card">Couldn't generate RCA right now. (${escapeHtml(err.message)})</div>`;
  }
}

/* ===================== COMPLIANCE INTELLIGENCE ===================== */
function renderCompTable() {
  document.getElementById('compBody').innerHTML = REGULATIONS.map(
    (r) => `
    <tr id="comp-${r.id.replace(/\W/g, '')}">
      <td class="tag">${r.id}</td>
      <td>${r.req}</td>
      <td><span class="badge" style="background:rgba(255,255,255,.06); color:var(--text-dim);">pending</span></td>
      <td style="color:var(--text-dim2); font-family:var(--font-mono); font-size:11.5px;">not yet scanned</td>
    </tr>
  `
  ).join('');
}

let lastComplianceResults = [];

async function runComplianceScan() {
  const btn = document.getElementById('scanBtn');
  btn.disabled = true;
  btn.textContent = 'Scanning…';
  REGULATIONS.forEach((r) => {
    const row = document.getElementById('comp-' + r.id.replace(/\W/g, ''));
    row.children[2].innerHTML = '<span class="loading-text"><span class="spinner"></span></span>';
  });

  try {
    const { results, gapCount } = await Api.runComplianceScan();
    lastComplianceResults = results;
    results.forEach((r) => {
      const row = document.getElementById('comp-' + r.id.replace(/\W/g, ''));
      const cls = r.status === 'Compliant' ? 'compliant' : r.status === 'Gap' ? 'gap' : 'partial';
      row.children[2].innerHTML = `<span class="badge ${cls}">${r.status}</span>`;
      row.children[3].innerHTML = `<div style="font-size:12.5px;">${escapeHtml(r.finding)}</div>`;
    });

    document.getElementById('kpiGaps').textContent = gapCount;
    document.getElementById('compSummary').innerHTML = `
      <div class="card">
        <div class="panel-title">Audit evidence package</div>
        <div class="panel-desc">Generated from ${REGULATIONS.length} clauses scanned against ${CORPUS.length} source documents. ${gapCount} open gap${gapCount === 1 ? '' : 's'} require remediation before next audit cycle.</div>
        <button class="btn ghost sm" onclick="downloadAuditPack()">⬇ Download evidence package (.txt)</button>
      </div>`;
  } catch (err) {
    document.getElementById('compSummary').innerHTML = `<div class="card">Compliance scan failed: ${escapeHtml(err.message)}</div>`;
  }
  btn.disabled = false;
  btn.textContent = '▣ Run compliance gap scan';
}

function downloadAuditPack() {
  let out = 'AUDIT EVIDENCE PACKAGE — ASSET BRAIN\nGenerated: ' + new Date().toISOString() + '\n\n';
  lastComplianceResults.forEach((r) => {
    out += `Clause: ${r.id}\nRequirement: ${r.req}\nStatus: ${r.status}\nFinding: ${r.finding}\nEvidence: ${(r.evidence || []).join(', ') || 'none'}\n\n`;
  });
  const blob = new Blob([out], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'audit_evidence_package.txt';
  a.click();
}

/* ===================== UTIL ===================== */
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* init */
bootstrap();
