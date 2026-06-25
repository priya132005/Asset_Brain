const { CORPUS } = require('../data/corpus');

/**
 * Very small keyword-overlap retriever — a stand-in for a real vector /
 * hybrid search index. Scores each document by how many query terms it
 * contains and returns the top `k`.
 */
function retrieve(query, k = 3) {
  const terms = query.toLowerCase().split(/\W+/).filter((w) => w.length > 2);
  const scored = CORPUS.map((doc) => {
    const haystack = (doc.title + ' ' + doc.text).toLowerCase();
    let score = 0;
    terms.forEach((t) => {
      const occurrences = haystack.split(t).length - 1;
      score += occurrences;
    });
    return { doc, score };
  });
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map((s) => s.doc);
}

/** Documents whose title or text mention the given equipment tag / keyword list. */
function relatedDocs(keywords) {
  return CORPUS.filter((d) =>
    keywords.some((k) => (d.text + ' ' + d.title).toLowerCase().includes(k.toLowerCase()))
  );
}

module.exports = { retrieve, relatedDocs };
