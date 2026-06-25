/**
 * Thin fetch wrapper around the ASSET BRAIN backend. The browser never
 * talks to the Anthropic API directly or holds an API key — every AI
 * call is proxied through our own server (see backend/src/routes/*.js).
 */
const Api = (() => {
  async function request(path, options = {}) {
    const res = await fetch(`${window.API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `Request to ${path} failed (${res.status})`);
    }
    return data;
  }

  return {
    getCorpus: () => request('/api/corpus'),
    getRegulations: () => request('/api/regulations'),
    askCopilot: (question) =>
      request('/api/copilot/ask', { method: 'POST', body: JSON.stringify({ question }) }),
    getRCA: (equipment) =>
      request('/api/maintenance/rca', { method: 'POST', body: JSON.stringify({ equipment }) }),
    runComplianceScan: () =>
      request('/api/compliance/scan', { method: 'POST', body: JSON.stringify({}) })
  };
})();
