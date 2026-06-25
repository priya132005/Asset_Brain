/**
 * Builds and renders the knowledge graph from the corpus + per-document
 * extracted entities. Kept separate from app.js so the graph logic can be
 * reused/tested independently.
 */
const KnowledgeGraph = (() => {
  let nodes = [];
  let links = [];

  function build(corpus, entityStore) {
    const seen = new Set();
    const _nodes = [];
    const _links = [];

    function addNode(id, type, label) {
      if (seen.has(id)) return;
      seen.add(id);
      _nodes.push({ id, type, label });
    }

    corpus.forEach((d) => addNode(d.id, 'document', d.id));
    corpus.forEach((d) => {
      const e = entityStore[d.id];
      if (!e) return;
      e.equipment.forEach((eq) => {
        addNode(eq, 'equipment', eq);
        _links.push({ source: d.id, target: eq });
      });
      e.people.forEach((p) => {
        addNode('P:' + p, 'person', p);
        _links.push({ source: d.id, target: 'P:' + p });
      });
      e.regulations.forEach((r) => {
        addNode(r, 'regulation', r);
        _links.push({ source: d.id, target: r });
      });
    });

    nodes = _nodes;
    links = _links;
    return { nodes, links };
  }

  function render(svgSelector, onNodeClick) {
    const svgEl = document.querySelector(svgSelector);
    const width = svgEl.clientWidth || 700;
    const height = svgEl.clientHeight || 520;
    const svg = d3.select(svgSelector).attr('viewBox', `0 0 ${width} ${height}`);
    svg.selectAll('*').remove();

    if (nodes.length === 0) {
      svg
        .append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#5E6670')
        .attr('font-family', 'IBM Plex Mono')
        .attr('font-size', 12)
        .text('No graph yet — extract entities in Document Ingestion, or click Rebuild.');
      return;
    }

    const color = { document: '#FF7A1A', equipment: '#2DD4BF', person: '#F4C430', regulation: '#8E76FF' };
    const radius = { document: 9, equipment: 11, person: 8, regulation: 9 };

    const sim = d3
      .forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d) => d.id).distance(85).strength(0.5))
      .force('charge', d3.forceManyBody().strength(-180))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide(28));

    const link = svg
      .append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#2E353E')
      .attr('stroke-width', 1.2);

    const node = svg
      .append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', (d) => radius[d.type])
      .attr('fill', (d) => color[d.type])
      .attr('stroke', '#13161A')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('click', (ev, d) => onNodeClick && onNodeClick(d, links))
      .call(
        d3
          .drag()
          .on('start', (ev, d) => {
            if (!ev.active) sim.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (ev, d) => {
            d.fx = ev.x;
            d.fy = ev.y;
          })
          .on('end', (ev, d) => {
            if (!ev.active) sim.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    const label = svg
      .append('g')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .text((d) => d.label)
      .attr('font-size', 9.5)
      .attr('font-family', 'IBM Plex Mono')
      .attr('fill', '#8E96A1')
      .attr('dx', 12)
      .attr('dy', 4);

    sim.on('tick', () => {
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);
      node.attr('cx', (d) => d.x).attr('cy', (d) => d.y);
      label.attr('x', (d) => d.x).attr('y', (d) => d.y);
    });
  }

  function renderHero(svgSelector) {
    const svg = d3.select(svgSelector).attr('viewBox', '0 0 340 170');
    svg.selectAll('*').remove();
    const center = { x: 60, y: 85 };
    svg.append('circle').attr('cx', center.x).attr('cy', center.y).attr('r', 16).attr('fill', '#FF7A1A');
    const pts = [
      [150, 30],
      [230, 55],
      [300, 40],
      [180, 110],
      [260, 120],
      [150, 140]
    ];
    pts.forEach((p, i) => {
      svg
        .append('line')
        .attr('x1', center.x)
        .attr('y1', center.y)
        .attr('x2', p[0])
        .attr('y2', p[1])
        .attr('stroke', '#2E353E')
        .attr('stroke-width', 1.2);
      const c = svg
        .append('circle')
        .attr('cx', p[0])
        .attr('cy', p[1])
        .attr('r', 6.5)
        .attr('fill', i % 2 === 0 ? '#2DD4BF' : '#F4C430');
      c.append('animate')
        .attr('attributeName', 'r')
        .attr('values', '6.5;8.5;6.5')
        .attr('dur', '2.4s')
        .attr('begin', i * 0.3 + 's')
        .attr('repeatCount', 'indefinite');
    });
  }

  return { build, render, renderHero };
})();
