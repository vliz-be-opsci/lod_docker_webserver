import { MarineEntity } from "./types";
import { getResourceById, RESOURCES } from "./resources";

export function getCssContent(): string {
  return `/* VLIZ Marine Linked Data Portal - Design System */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap');

:root {
  --bg-primary: #f8fafc;
  --bg-subtle: #f1f5f9;
  --panel-bg: #ffffff;
  --panel-border: rgba(15, 23, 42, 0.08);
  --text-primary: #0f172a;
  --text-secondary: #334155;
  --text-muted: #64748b;
  
  --vliz-blue: #1b3a6b;
  --vliz-blue-dark: #0f2444;
  --vliz-blue-light: #255091;
  --marine-teal: #0d9488;
  --marine-cyan: #06b6d4;
  --teal-glow: rgba(13, 148, 136, 0.12);
  
  --badge-bg: #e0f2fe;
  --badge-text: #0369a1;
  --badge-border: #bae6fd;
  
  --accent-gold: #f59e0b;
  --success: #10b981;
  --code-bg: #1e293b;
  --code-text: #e2e8f0;
  
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02);
  --shadow-md: 0 4px 16px rgba(15, 23, 42, 0.06);
  --shadow-lg: 0 10px 30px rgba(15, 23, 42, 0.08);
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  line-height: 1.6;
}

/* Header & Nav */
header {
  background: linear-gradient(135deg, var(--vliz-blue-dark) 0%, var(--vliz-blue) 100%);
  color: #ffffff;
  padding: 1rem 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: var(--shadow-md);
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.logo-badge {
  background: var(--marine-teal);
  color: #ffffff;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  padding: 0.35rem 0.75rem;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  letter-spacing: 1px;
}

h1.site-title {
  margin: 0;
  font-family: 'Outfit', sans-serif;
  font-size: 1.35rem;
  font-weight: 700;
  color: #ffffff;
}

h1.site-title a {
  color: #ffffff;
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.nav-links a {
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  padding: 0.35rem 0.5rem;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}

.nav-links a:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.1);
}

.nav-links a.active {
  color: #ffffff;
  background: rgba(13, 148, 136, 0.4);
  font-weight: 600;
}

/* Hero Section */
.hero {
  background: linear-gradient(180deg, #ffffff 0%, var(--bg-primary) 100%);
  border-bottom: 1px solid var(--panel-border);
  padding: 3.5rem 2rem 2.5rem;
  text-align: center;
}

.hero-container {
  max-width: 900px;
  margin: 0 auto;
}

.hero-tag {
  display: inline-block;
  background: var(--teal-glow);
  color: var(--marine-teal);
  font-weight: 600;
  font-size: 0.85rem;
  padding: 0.3rem 0.85rem;
  border-radius: 9999px;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.hero h2 {
  font-family: 'Outfit', sans-serif;
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 1rem;
  line-height: 1.2;
}

.hero p {
  font-size: 1.15rem;
  color: var(--text-secondary);
  margin: 0 0 2rem;
}

.stats-bar {
  display: flex;
  justify-content: center;
  gap: 2.5rem;
  margin-top: 1.5rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-num {
  font-family: 'Outfit', sans-serif;
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--vliz-blue);
}

.stat-label {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-weight: 500;
}

/* Radical Transparency Proposal Bar */
.rt-proposal-bar {
  background: linear-gradient(135deg, #0f2444 0%, #1b3a6b 100%);
  color: #ffffff;
  border-radius: var(--radius-md);
  padding: 1.5rem 2rem;
  margin: 2.25rem auto 0;
  max-width: 950px;
  text-align: left;
  box-shadow: var(--shadow-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.rt-proposal-info h4 {
  margin: 0 0 0.35rem;
  font-family: 'Outfit', sans-serif;
  font-size: 1.15rem;
  color: #ffffff;
}

.rt-proposal-info p {
  margin: 0;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.85);
}

.rt-proposal-buttons {
  display: flex;
  gap: 0.65rem;
  flex-wrap: wrap;
}

.rt-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.5rem 0.9rem;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.2s ease;
}

.rt-btn:hover {
  background: #ffffff;
  color: var(--vliz-blue);
  border-color: #ffffff;
}

.rt-btn.primary {
  background: var(--marine-teal);
  border-color: var(--marine-teal);
}

.rt-btn.primary:hover {
  background: #0f766e;
  color: #ffffff;
}

/* Layout */
.main-container {
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 2.5rem 2rem;
  flex: 1;
}

/* Search & Filters */
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.filter-pills {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-btn {
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  color: var(--text-secondary);
  padding: 0.45rem 1rem;
  border-radius: 9999px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn:hover, .filter-btn.active {
  background: var(--vliz-blue);
  color: #ffffff;
  border-color: var(--vliz-blue);
}

/* Cards Grid */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

.card {
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-md);
  padding: 1.75rem;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: rgba(27, 58, 107, 0.2);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.card-badge {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 0.25rem 0.6rem;
  border-radius: var(--radius-sm);
  letter-spacing: 0.5px;
}

.card-badge.dataset { background: #dcfce7; color: #166534; }
.card-badge.institute { background: #e0f2fe; color: #075985; }
.card-badge.publication { background: #fef3c7; color: #92400e; }
.card-badge.project { background: #f3e8ff; color: #6b21a8; }
.card-badge.api { background: #ffedd5; color: #9a3412; }
.card-badge.person { background: #f1f5f9; color: #334155; }

.card-title {
  font-family: 'Outfit', sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem;
  line-height: 1.35;
}

.card-title a {
  color: var(--text-primary);
  text-decoration: none;
}

.card-title a:hover {
  color: var(--vliz-blue);
}

.card-desc {
  font-size: 0.925rem;
  color: var(--text-secondary);
  margin: 0 0 1.25rem;
  flex-grow: 1;
}

.card-tags {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
}

.tag {
  background: var(--bg-subtle);
  color: var(--text-muted);
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--panel-border);
  padding-top: 1rem;
  font-size: 0.85rem;
}

.card-link {
  color: var(--vliz-blue);
  font-weight: 600;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.card-link:hover {
  text-decoration: underline;
}

/* Detail Page Layout */
.detail-header {
  background: #ffffff;
  border-bottom: 1px solid var(--panel-border);
  padding: 2.5rem 2rem;
  margin-bottom: 2rem;
}

.detail-header-inner {
  max-width: 1400px;
  margin: 0 auto;
}

.detail-title {
  font-family: 'Outfit', sans-serif;
  font-size: 2.25rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0.5rem 0 1rem;
  line-height: 1.2;
}

.meta-badges {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  align-items: center;
  margin-top: 1rem;
}

.meta-badge {
  background: var(--bg-subtle);
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 500;
  padding: 0.3rem 0.75rem;
  border-radius: var(--radius-sm);
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 2rem;
}

.content-section {
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-md);
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: var(--shadow-sm);
}

.section-heading {
  font-family: 'Outfit', sans-serif;
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Data Table */
.data-table-container {
  overflow-x: auto;
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-sm);
}

table.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  text-align: left;
}

table.data-table th {
  background: var(--bg-subtle);
  color: var(--text-primary);
  font-weight: 600;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--panel-border);
  white-space: nowrap;
}

table.data-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--panel-border);
  color: var(--text-secondary);
}

table.data-table tr:nth-child(even) {
  background: #fbfdff;
}

/* Distribution Download Cards */
.dist-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.dist-card {
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-sm);
  padding: 1.25rem;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.dist-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.dist-format {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  color: var(--marine-teal);
  font-size: 0.95rem;
}

.dist-size {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.dist-title {
  font-weight: 600;
  font-size: 0.95rem;
  margin: 0 0 0.5rem;
}

.dist-desc {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin: 0 0 1rem;
}

.btn-download {
  background: var(--vliz-blue);
  color: #ffffff;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.85rem;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-sm);
  text-align: center;
  transition: background 0.2s ease;
}

.btn-download:hover {
  background: var(--vliz-blue-dark);
}

/* Sidebar Meta Box */
.sidebar-panel {
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-md);
  padding: 1.75rem;
  box-shadow: var(--shadow-sm);
  margin-bottom: 1.5rem;
}

.meta-group {
  margin-bottom: 1.25rem;
}

.meta-group:last-child {
  margin-bottom: 0;
}

.meta-label {
  font-size: 0.8rem;
  text-transform: uppercase;
  font-weight: 700;
  color: var(--text-muted);
  letter-spacing: 0.5px;
  margin-bottom: 0.35rem;
}

.meta-value {
  font-size: 0.95rem;
  color: var(--text-primary);
  font-weight: 500;
}

.meta-value a {
  color: var(--vliz-blue);
  text-decoration: none;
}

.meta-value a:hover {
  text-decoration: underline;
}

.author-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: var(--bg-subtle);
  padding: 0.25rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.85rem;
  margin: 0.2rem 0.2rem 0.2rem 0;
  text-decoration: none;
  color: var(--text-primary);
}

.author-pill:hover {
  background: #e2e8f0;
}

/* RDF & Linkset Links Box */
.rt-box {
  background: #f0fdfa;
  border: 1px solid #99f6e4;
  border-radius: var(--radius-md);
  padding: 1.5rem;
}

.rt-box h4 {
  margin: 0 0 0.75rem;
  color: #0f766e;
  font-family: 'Outfit', sans-serif;
  font-size: 1.05rem;
}

.rt-links-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.rt-links-list li {
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
}

.rt-links-list a {
  color: #0d9488;
  font-weight: 600;
  text-decoration: none;
}

.rt-links-list a:hover {
  text-decoration: underline;
}

/* Footer */
footer {
  background: var(--vliz-blue-dark);
  color: rgba(255, 255, 255, 0.7);
  padding: 2.5rem 2rem;
  margin-top: auto;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.9rem;
}

.footer-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.footer-links a {
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  margin-left: 1.5rem;
}

.footer-links a:hover {
  color: #ffffff;
}

@media (max-width: 900px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
  .cards-grid {
    grid-template-columns: 1fr;
  }
  header {
    flex-direction: column;
    gap: 1rem;
  }
}
`;
}

function renderHeader(activeNav: string): string {
  return `
  <header>
    <div class="logo-container">
      <span class="logo-badge">LOD</span>
      <h1 class="site-title"><a href="/">VLIZ Marine Data Portal</a></h1>
    </div>
    <nav class="nav-links">
      <a href="/" class="${activeNav === 'datasets' ? 'active' : ''}">Datasets</a>
      <a href="/catalog/" class="${activeNav === 'catalog' ? 'active' : ''}">DCAT Catalog</a>
      <a href="/api/docs/" class="${activeNav === 'api' ? 'active' : ''}">Subsetting API</a>
      <a href="/publications/ro-crate-paper.html" class="${activeNav === 'publications' ? 'active' : ''}">Publications</a>
      <a href="/map.html" class="${activeNav === 'map' ? 'active' : ''}">Metro Map</a>
      <a href="/institutes/vliz.html" class="${activeNav === 'institutes' ? 'active' : ''}">Institute</a>
    </nav>
  </header>`;
}

function renderRtBox(resourceId: string, isDataset = false): string {
  return `
        <div class="rt-box">
          <h4>🌐 Radical Transparency Links</h4>
          <p style="font-size: 0.85rem; color: #134e4a; margin: 0 0 0.85rem;">
            This resource implements RFC 8288 web linking, RFC 9264 JSON linksets, and content negotiation.
          </p>
          <ul class="rt-links-list">
            <li>🐢 <a href="/rdf/${resourceId}.ttl">Download Turtle (RDF)</a></li>
            <li>📜 <a href="/rdf/${resourceId}.jsonld">Download JSON-LD</a></li>
            <li>🔗 <a href="/linksets/${resourceId}.linkset.json">RFC 9264 Linkset JSON</a></li>
            ${isDataset ? `<li>⚡ <a href="/api/docs/">Subsetting API Explorer</a></li>` : ''}
            <li>🗺️ <a href="/map.html"><strong>Interactive Protocol Metro Map</strong></a></li>
            <li style="border-top: 1px dashed #99f6e4; margin-top: 0.75rem; padding-top: 0.75rem;">📄 <a href="https://open-science.vliz.be/papers/2026-radical-transparency-position/2026-radical-transparency-position.pdf" target="_blank">RT Position Paper (PDF)</a></li>
            <li>📊 <a href="https://docs.google.com/presentation/d/1-dJbI4bJfCL5JKKE9QHYsqayXkZkOjy1rxcYCuu2ou8/edit" target="_blank">Presentation Slides (Google Docs)</a></li>
            <li>🐙 <a href="https://github.com/eosc-semantic-interop/if-solutions-proposals/tree/main/proposals/radical-transparency" target="_blank">EOSC Proposals Repo (GitHub)</a></li>
            <li>🌐 <a href="https://www.iana.org/assignments/link-relations" target="_blank">IANA Link Relations Registry</a></li>
          </ul>
        </div>`;
}

function renderFooter(): string {
  return `
  <footer>
    <div class="footer-container">
      <div>
        <strong>VLIZ Marine Linked Data Portal</strong> — Reference Implementation of <em>Radical Transparency</em> (RFC 8288, RFC 9264, RFC 9727).
      </div>
      <div class="footer-links">
        <a href="/map.html">🗺️ Metro Map</a>
        <a href="https://open-science.vliz.be/papers/2026-radical-transparency-position/2026-radical-transparency-position.pdf" target="_blank" title="Radical Transparency Position Paper">📄 Position Paper</a>
        <a href="https://docs.google.com/presentation/d/1-dJbI4bJfCL5JKKE9QHYsqayXkZkOjy1rxcYCuu2ou8/edit" target="_blank" title="Presentation Slides">📊 Slides</a>
        <a href="https://github.com/eosc-semantic-interop/if-solutions-proposals/tree/main/proposals/radical-transparency" target="_blank" title="EOSC Semantic Interoperability Proposals Repo">🐙 EOSC Repo</a>
        <a href="https://www.iana.org/assignments/link-relations" target="_blank" title="IANA Link Relations Registry">🌐 IANA Link Relations</a>
        <a href="/catalog/dcat.ttl">DCAT Turtle</a>
        <a href="/.well-known/api-catalog">API Catalog</a>
        <a href="/sitemap.xml">Sitemap (rs:ln)</a>
        <a href="https://github.com/vliz-be-opsci/lod_docker_webserver">GitHub</a>
      </div>
    </div>
  </footer>`;
}

export function renderCatalogHomeHtml(resources: MarineEntity[], baseUrl: string): string {
  const datasets = resources.filter(r => r.category === "dataset");
  const pubs = resources.filter(r => r.category === "publication");
  const apis = resources.filter(r => r.category === "api");
  const institutes = resources.filter(r => r.category === "institute");
  const people = resources.filter(r => r.category === "person");

  let cardsHtml = "";
  for (const res of resources) {
    const slug = res.id.replace("resource-", "");
    const href = 
      res.category === "dataset" ? `/datasets/${slug}.html` :
      res.category === "institute" ? `/institutes/${slug}.html` :
      res.category === "publication" ? `/publications/${slug}.html` :
      res.category === "project" ? `/projects/${slug}.html` :
      res.category === "person" ? `/people/${slug}.html` :
      res.category === "api" ? `/api/docs/` : `/pages/${slug}.html`;

    const tagFormats = res.distributions ? res.distributions.map(d => `<span class="tag">${d.format}</span>`).join(" ") : `<span class="tag">RDF / HTML</span>`;

    cardsHtml += `
      <div class="card" data-category="${res.category || 'other'}">
        <div class="card-header">
          <span class="card-badge ${res.category || 'other'}">${res.category || res.type}</span>
          ${res.doi ? `<span class="tag">DOI</span>` : ''}
        </div>
        <h3 class="card-title"><a href="${href}">${res.title}</a></h3>
        <p class="card-desc">${res.description}</p>
        <div class="card-tags">
          ${tagFormats}
        </div>
        <div class="card-footer">
          <span style="color: var(--text-muted); font-size: 0.8rem;">URI: /resource/${res.id}</span>
          <a href="${href}" class="card-link">Explore Resource &rarr;</a>
        </div>
      </div>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>VLIZ Marine Linked Data Portal & Research Catalogue</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="/style.css">
  <link rel="alternate" type="text/turtle" href="/catalog/dcat.ttl">
  <link rel="alternate" type="application/ld+json" href="/catalog/dcat.jsonld">
  <link rel="api-catalog" type="application/linkset+json" href="/.well-known/api-catalog">
</head>
<body>
  ${renderHeader('datasets')}

  <section class="hero">
    <div class="hero-container">
      <span class="hero-tag">Radical Transparency &bull; Linked Open Data</span>
      <h2>VLIZ Marine Research Data Portal</h2>
      <p>Discover, explore, and programmatically access high-fidelity marine genomic datasets, continuous sensor telemetry, species occurrences, and scientific publications.</p>
      
      <div class="stats-bar">
        <div class="stat-item">
          <span class="stat-num">${datasets.length}</span>
          <span class="stat-label">Datasets</span>
        </div>
        <div class="stat-item">
          <span class="stat-num">${pubs.length}</span>
          <span class="stat-label">Publications</span>
        </div>
        <div class="stat-item">
          <span class="stat-num">${apis.length}</span>
          <span class="stat-label">Data APIs</span>
        </div>
        <div class="stat-item">
          <span class="stat-num">${institutes.length}</span>
          <span class="stat-label">Institutes</span>
        </div>
        <div class="stat-item">
          <span class="stat-num">${people.length}</span>
          <span class="stat-label">Researchers</span>
        </div>
      </div>

      <div class="rt-proposal-bar">
        <div class="rt-proposal-info">
          <h4>Radical Transparency Specifications & Proposals</h4>
          <p>Practical interoperability via RFC 8288 web linking, RFC 9264 linksets, and bootstrap conventions.</p>
        </div>
        <div class="rt-proposal-buttons">
          <a href="/map.html" class="rt-btn" style="background: rgba(13, 148, 136, 0.5); border-color: #0d9488;">
            🗺️ RT Metro Map
          </a>
          <a href="https://open-science.vliz.be/papers/2026-radical-transparency-position/2026-radical-transparency-position.pdf" target="_blank" class="rt-btn primary">
            📄 Position Paper (PDF)
          </a>
          <a href="https://docs.google.com/presentation/d/1-dJbI4bJfCL5JKKE9QHYsqayXkZkOjy1rxcYCuu2ou8/edit" target="_blank" class="rt-btn">
            📊 Slides (Google Docs)
          </a>
          <a href="https://github.com/eosc-semantic-interop/if-solutions-proposals/tree/main/proposals/radical-transparency" target="_blank" class="rt-btn">
            🐙 EOSC Proposals Repo
          </a>
          <a href="https://www.iana.org/assignments/link-relations" target="_blank" class="rt-btn">
            🌐 IANA Link Relations
          </a>
        </div>
      </div>
    </div>
  </section>

  <main class="main-container">
    <div class="filter-bar">
      <div class="filter-pills">
        <button class="filter-btn active" onclick="filterCards('all')">All Resources (${resources.length})</button>
        <button class="filter-btn" onclick="filterCards('dataset')">Datasets (${datasets.length})</button>
        <button class="filter-btn" onclick="filterCards('publication')">Publications (${pubs.length})</button>
        <button class="filter-btn" onclick="filterCards('api')">APIs (${apis.length})</button>
        <button class="filter-btn" onclick="filterCards('institute')">Institutes (${institutes.length})</button>
        <button class="filter-btn" onclick="filterCards('person')">People (${people.length})</button>
      </div>
      <div>
        <input type="text" id="searchInput" placeholder="Search datasets, taxa, keywords..." onkeyup="searchCards()" style="padding: 0.5rem 1rem; border: 1px solid var(--panel-border); border-radius: var(--radius-sm); font-size: 0.9rem; width: 280px;">
      </div>
    </div>

    <div class="cards-grid" id="cardsGrid">
      ${cardsHtml}
    </div>
  </main>

  ${renderFooter()}

  <script>
    function filterCards(cat) {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      event.target.classList.add('active');
      const cards = document.querySelectorAll('.card');
      cards.forEach(c => {
        if (cat === 'all' || c.getAttribute('data-category') === cat) {
          c.style.display = 'flex';
        } else {
          c.style.display = 'none';
        }
      });
    }

    function searchCards() {
      const q = document.getElementById('searchInput').value.toLowerCase();
      const cards = document.querySelectorAll('.card');
      cards.forEach(c => {
        const text = c.innerText.toLowerCase();
        if (text.includes(q)) {
          c.style.display = 'flex';
        } else {
          c.style.display = 'none';
        }
      });
    }
  </script>
</body>
</html>`;
}

export function renderDatasetPageHtml(dataset: MarineEntity, baseUrl: string): string {
  const publisher = dataset.publisher ? getResourceById(dataset.publisher) : undefined;
  const creators = (dataset.creators || []).map(c => getResourceById(c)).filter(Boolean) as MarineEntity[];

  // Table Preview Markup
  let tableHtml = "";
  if (dataset.sampleData && dataset.sampleData.rows.length > 0) {
    const cols = dataset.sampleData.columns;
    tableHtml = `
      <div class="content-section">
        <h3 class="section-heading">📊 Live Data Preview (${dataset.sampleData.rows.length} Sample Records)</h3>
        <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1rem;">
          Representative observation sample from the underlying dataset distribution.
        </p>
        <div class="data-table-container">
          <table class="data-table">
            <thead>
              <tr>${cols.map(c => `<th>${c}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${dataset.sampleData.rows.map(row => `
                <tr>${cols.map(c => `<td>${row[c] !== undefined ? row[c] : ''}</td>`).join('')}</tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
  }

  // Distribution Cards Markup
  let distsHtml = "";
  if (dataset.distributions && dataset.distributions.length > 0) {
    distsHtml = `
      <div class="content-section">
        <h3 class="section-heading">📥 Download Center & Available Distributions</h3>
        <div class="dist-cards">
          ${dataset.distributions.map(d => `
            <div class="dist-card">
              <div>
                <div class="dist-card-header">
                  <span class="dist-format">${d.format}</span>
                  <span class="dist-size">${d.byteSize ? (d.byteSize / 1024).toFixed(1) + ' KB' : 'Standard'}</span>
                </div>
                <h4 class="dist-title">${d.title}</h4>
                <p class="dist-desc">${d.description}</p>
              </div>
              <a href="${d.downloadUrl}" class="btn-download" download>Download ${d.format}</a>
            </div>
          `).join('')}
        </div>
      </div>`;
  }

  const creatorsPills = creators.map(c => `
    <a href="/people/${c.id.replace('resource-', '')}.html" class="author-pill">👤 ${c.title}</a>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${dataset.title} - VLIZ Marine Data Portal</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="/style.css">
  <link rel="profile" href="https://schema.org/Dataset">
  <link rel="profile" href="https://www.w3.org/TR/vocab-dcat/">
  <link rel="describedby" type="text/turtle" href="/rdf/${dataset.id}.ttl">
  <link rel="describedby" type="application/ld+json" href="/rdf/${dataset.id}.jsonld">
  <link rel="linkset" type="application/linkset+json" href="/linksets/${dataset.id}.linkset.json">
  ${(dataset.distributions || []).map(d => `<link rel="item" type="${d.mediaType}" href="${d.downloadUrl}">`).join('\n  ')}
</head>
<body>
  ${renderHeader('datasets')}

  <div class="detail-header">
    <div class="detail-header-inner">
      <a href="/" style="color: var(--vliz-blue); text-decoration: none; font-weight: 600; font-size: 0.9rem;">&larr; Back to Catalogue</a>
      <h2 class="detail-title">${dataset.title}</h2>
      <div class="meta-badges">
        <span class="card-badge dataset">Dataset</span>
        ${dataset.doi ? `<span class="meta-badge">🔗 DOI: <a href="${dataset.doi}" target="_blank" style="color: inherit;">${dataset.doi.replace('https://doi.org/', '')}</a></span>` : ''}
        ${dataset.license ? `<span class="meta-badge">⚖️ ${dataset.license}</span>` : ''}
        ${dataset.temporalCoverage ? `<span class="meta-badge">📅 ${dataset.temporalCoverage}</span>` : ''}
        ${dataset.spatialCoverage ? `<span class="meta-badge">📍 ${dataset.spatialCoverage}</span>` : ''}
      </div>
    </div>
  </div>

  <main class="main-container">
    <div class="detail-grid">
      <div>
        <div class="content-section">
          <h3 class="section-heading">📝 Abstract & Description</h3>
          <p style="font-size: 1.05rem; line-height: 1.7; color: var(--text-secondary); margin: 0;">
            ${dataset.description}
          </p>
        </div>

        ${tableHtml}
        ${distsHtml}
      </div>

      <aside>
        <div class="sidebar-panel">
          <div class="meta-group">
            <div class="meta-label">Publisher</div>
            <div class="meta-value">
              ${publisher ? `<a href="/institutes/${publisher.id.replace('resource-', '')}.html">🏛️ ${publisher.title}</a>` : 'VLIZ'}
            </div>
          </div>

          <div class="meta-group">
            <div class="meta-label">Creators / Authors</div>
            <div class="meta-value">
              ${creatorsPills || 'VLIZ Science Team'}
            </div>
          </div>

          <div class="meta-group">
            <div class="meta-label">Permanent Persistent Identifier</div>
            <div class="meta-value" style="word-break: break-all;">
              <code>${baseUrl}/resource/${dataset.id}</code>
            </div>
          </div>

          ${dataset.sourceUri ? `
          <div class="meta-group">
            <div class="meta-label">Upstream Provenance Source</div>
            <div class="meta-value">
              <a href="${dataset.sourceUri}" target="_blank">${dataset.sourceUri}</a>
            </div>
          </div>` : ''}
        </div>

        ${renderRtBox(dataset.id, true)}
      </aside>
    </div>
  </main>

  ${renderFooter()}
</body>
</html>`;
}

export function renderInstitutePageHtml(institute: MarineEntity, baseUrl: string): string {
  const members = (RESOURCES.filter(r => r.category === "person" && (r.properties["schema:worksFor"] === institute.id || (institute.properties["schema:member"] as string[] || []).includes(r.id))));
  const datasets = RESOURCES.filter(r => r.category === "dataset" && r.publisher === institute.id);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${institute.title} - VLIZ Marine Data Portal</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="/style.css">
  <link rel="profile" href="https://schema.org/Organization">
  <link rel="describedby" type="text/turtle" href="/rdf/${institute.id}.ttl">
  <link rel="describedby" type="application/ld+json" href="/rdf/${institute.id}.jsonld">
  <link rel="linkset" type="application/linkset+json" href="/linksets/${institute.id}.linkset.json">
</head>
<body>
  ${renderHeader('institutes')}

  <div class="detail-header">
    <div class="detail-header-inner">
      <a href="/" style="color: var(--vliz-blue); text-decoration: none; font-weight: 600; font-size: 0.9rem;">&larr; Back to Catalogue</a>
      <h2 class="detail-title">${institute.title}</h2>
      <div class="meta-badges">
        <span class="card-badge institute">Research Organization</span>
        ${institute.doi ? `<span class="meta-badge">🏛️ ROR ID: <a href="${institute.doi}" target="_blank" style="color: inherit;">${institute.doi}</a></span>` : ''}
        <span class="meta-badge">📍 Oostende, Belgium</span>
      </div>
    </div>
  </div>

  <main class="main-container">
    <div class="detail-grid">
      <div>
        <div class="content-section">
          <h3 class="section-heading">🏛️ About the Organization</h3>
          <p style="font-size: 1.05rem; line-height: 1.7; color: var(--text-secondary); margin: 0;">
            ${institute.description}
          </p>
        </div>

        <div class="content-section">
          <h3 class="section-heading">📦 Published Datasets (${datasets.length})</h3>
          <div class="dist-cards">
            ${datasets.map(ds => `
              <div class="dist-card">
                <div>
                  <span class="dist-format">Dataset</span>
                  <h4 class="dist-title">${ds.title}</h4>
                  <p class="dist-desc">${ds.description.substring(0, 120)}...</p>
                </div>
                <a href="/datasets/${ds.id.replace('resource-', '')}.html" class="btn-download">View Dataset &rarr;</a>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="content-section">
          <h3 class="section-heading">👥 Research Staff & Data Officers (${members.length})</h3>
          <div class="meta-badges">
            ${members.map(m => `
              <a href="/people/${m.id.replace('resource-', '')}.html" class="author-pill" style="padding: 0.4rem 0.8rem;">
                👤 <strong>${m.title}</strong> &bull; ${m.properties["schema:jobTitle"] || 'Scientist'}
              </a>
            `).join('')}
          </div>
        </div>
      </div>

      <aside>
        <div class="sidebar-panel">
          <div class="meta-group">
            <div class="meta-label">Location</div>
            <div class="meta-value">${institute.properties["schema:location"] || 'Oostende, Belgium'}</div>
          </div>
          <div class="meta-group">
            <div class="meta-label">Official Website</div>
            <div class="meta-value"><a href="https://www.vliz.be" target="_blank">www.vliz.be</a></div>
          </div>
          <div class="meta-group">
            <div class="meta-label">Persistent Identifier</div>
            <div class="meta-value"><code>${baseUrl}/resource/${institute.id}</code></div>
          </div>
        </div>

        ${renderRtBox(institute.id, false)}
      </aside>
    </div>
  </main>

  ${renderFooter()}
</body>
</html>`;
}

export function renderPublicationPageHtml(pub: MarineEntity, baseUrl: string): string {
  const authors = (pub.properties["schema:author"] as string[] || []).map(a => getResourceById(a)).filter(Boolean) as MarineEntity[];
  const aboutDataset = pub.properties["schema:about"] ? getResourceById(pub.properties["schema:about"] as string) : undefined;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${pub.title} - VLIZ Marine Data Portal</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="/style.css">
  <link rel="profile" href="https://schema.org/ScholarlyArticle">
  <link rel="describedby" type="text/turtle" href="/rdf/${pub.id}.ttl">
  <link rel="describedby" type="application/ld+json" href="/rdf/${pub.id}.jsonld">
  <link rel="linkset" type="application/linkset+json" href="/linksets/${pub.id}.linkset.json">
  <link rel="alternate" type="application/pdf" href="/data/ro-crate-paper.pdf">
</head>
<body>
  ${renderHeader('publications')}

  <div class="detail-header">
    <div class="detail-header-inner">
      <a href="/" style="color: var(--vliz-blue); text-decoration: none; font-weight: 600; font-size: 0.9rem;">&larr; Back to Catalogue</a>
      <h2 class="detail-title">${pub.title}</h2>
      <div class="meta-badges">
        <span class="card-badge publication">Scientific Publication</span>
        ${pub.doi ? `<span class="meta-badge">📄 DOI: <a href="${pub.doi}" target="_blank" style="color: inherit;">${pub.doi.replace('https://doi.org/', '')}</a></span>` : ''}
        <span class="meta-badge">📅 Published: ${pub.properties["schema:datePublished"] || '2022-10-12'}</span>
        <span class="meta-badge">📖 Pensoft Publishers &bull; BISS</span>
      </div>
    </div>
  </div>

  <main class="main-container">
    <div class="detail-grid">
      <div>
        <div class="content-section">
          <h3 class="section-heading">📝 Abstract</h3>
          <p style="font-size: 1.05rem; line-height: 1.7; color: var(--text-secondary); margin: 0;">
            ${pub.description}
          </p>
        </div>

        <div class="content-section">
          <h3 class="section-heading">📥 Full Article Download</h3>
          <div class="dist-cards">
            <div class="dist-card">
              <div>
                <span class="dist-format">PDF Article</span>
                <h4 class="dist-title">Peer-Reviewed Publication (Open Access)</h4>
                <p class="dist-desc">Official PDF document detailing RO-Crate and GitHub Actions data pipelines.</p>
              </div>
              <a href="/data/ro-crate-paper.pdf" class="btn-download" download>Download Article PDF (210 KB)</a>
            </div>
          </div>
        </div>

        ${aboutDataset ? `
        <div class="content-section">
          <h3 class="section-heading">🔗 Linked Underlying Dataset</h3>
          <div class="dist-card">
            <div>
              <span class="dist-format">Dataset</span>
              <h4 class="dist-title">${aboutDataset.title}</h4>
              <p class="dist-desc">${aboutDataset.description}</p>
            </div>
            <a href="/datasets/${aboutDataset.id.replace('resource-', '')}.html" class="btn-download">Explore ARMS-MBON Dataset &rarr;</a>
          </div>
        </div>` : ''}
      </div>

      <aside>
        <div class="sidebar-panel">
          <div class="meta-group">
            <div class="meta-label">Authors</div>
            <div class="meta-value">
              ${authors.map(a => `<a href="/people/${a.id.replace('resource-', '')}.html" class="author-pill">👤 ${a.title}</a>`).join('')}
            </div>
          </div>

          <div class="meta-group">
            <div class="meta-label">Citation (BibTeX)</div>
            <pre style="background: var(--bg-subtle); padding: 0.75rem; border-radius: var(--radius-sm); font-size: 0.75rem; overflow-x: auto;">@article{portier2022rocrate,
  title={Contemporary data management for biodiversity observation networks},
  author={Portier, Marc and Decruw, Cedric and Exter, Katrina and Van Maldeghem, Laurian},
  journal={Biodiversity Information Science and Standards},
  volume={6},
  pages={e94630},
  year={2022},
  publisher={Pensoft Publishers}
}</pre>
          </div>
        </div>

        ${renderRtBox(pub.id, false)}
      </aside>
    </div>
  </main>

  ${renderFooter()}
</body>
</html>`;
}

export function renderProjectPageHtml(proj: MarineEntity, baseUrl: string): string {
  const parts = (proj.properties["schema:hasPart"] as string[] || []).map(p => getResourceById(p)).filter(Boolean) as MarineEntity[];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${proj.title} - VLIZ Marine Data Portal</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="/style.css">
  <link rel="profile" href="https://schema.org/Project">
  <link rel="describedby" type="text/turtle" href="/rdf/${proj.id}.ttl">
  <link rel="describedby" type="application/ld+json" href="/rdf/${proj.id}.jsonld">
  <link rel="linkset" type="application/linkset+json" href="/linksets/${proj.id}.linkset.json">
</head>
<body>
  ${renderHeader('datasets')}

  <div class="detail-header">
    <div class="detail-header-inner">
      <a href="/" style="color: var(--vliz-blue); text-decoration: none; font-weight: 600; font-size: 0.9rem;">&larr; Back to Catalogue</a>
      <h2 class="detail-title">${proj.title}</h2>
      <div class="meta-badges">
        <span class="card-badge project">Research Initiative</span>
        <span class="meta-badge">🏛️ Sponsor: Flanders Marine Institute (VLIZ)</span>
      </div>
    </div>
  </div>

  <main class="main-container">
    <div class="detail-grid">
      <div>
        <div class="content-section">
          <h3 class="section-heading">🎯 Project Objective</h3>
          <p style="font-size: 1.05rem; line-height: 1.7; color: var(--text-secondary); margin: 0;">
            ${proj.description}
          </p>
        </div>

        <div class="content-section">
          <h3 class="section-heading">📦 Associated Datasets (${parts.length})</h3>
          <div class="dist-cards">
            ${parts.map(p => `
              <div class="dist-card">
                <div>
                  <span class="dist-format">Dataset</span>
                  <h4 class="dist-title">${p.title}</h4>
                  <p class="dist-desc">${p.description.substring(0, 100)}...</p>
                </div>
                <a href="/datasets/${p.id.replace('resource-', '')}.html" class="btn-download">Explore Dataset &rarr;</a>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <aside>
        ${renderRtBox(proj.id, false)}
      </aside>
    </div>
  </main>

  ${renderFooter()}
</body>
</html>`;
}

export function renderPersonPageHtml(person: MarineEntity, baseUrl: string): string {
  const orcid = person.properties["owl:sameAs"] as string;
  const authoredDatasets = RESOURCES.filter(r => r.category === "dataset" && (r.creators || []).includes(person.id));
  const authoredPubs = RESOURCES.filter(r => r.category === "publication" && ((r.properties["schema:author"] as string[] || []).includes(person.id)));

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${person.title} - VLIZ Marine Data Portal</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="/style.css">
  <link rel="profile" href="https://schema.org/Person">
  <link rel="describedby" type="text/turtle" href="/rdf/${person.id}.ttl">
  <link rel="describedby" type="application/ld+json" href="/rdf/${person.id}.jsonld">
  <link rel="linkset" type="application/linkset+json" href="/linksets/${person.id}.linkset.json">
</head>
<body>
  ${renderHeader('datasets')}

  <div class="detail-header">
    <div class="detail-header-inner">
      <a href="/" style="color: var(--vliz-blue); text-decoration: none; font-weight: 600; font-size: 0.9rem;">&larr; Back to Catalogue</a>
      <h2 class="detail-title">👤 ${person.title}</h2>
      <div class="meta-badges">
        <span class="card-badge person">${person.properties["schema:jobTitle"] || 'Researcher'}</span>
        ${orcid ? `<span class="meta-badge">🟢 ORCID: <a href="${orcid}" target="_blank" style="color: inherit;">${orcid.replace('https://orcid.org/', '')}</a></span>` : ''}
        <span class="meta-badge"><a href="/institutes/vliz.html" style="color: inherit; text-decoration: none;">🏛️ Flanders Marine Institute</a></span>
      </div>
    </div>
  </div>

  <main class="main-container">
    <div class="detail-grid">
      <div>
        <div class="content-section">
          <h3 class="section-heading">📋 Biography</h3>
          <p style="font-size: 1.05rem; line-height: 1.7; color: var(--text-secondary); margin: 0;">
            ${person.description}
          </p>
        </div>

        ${authoredDatasets.length > 0 ? `
        <div class="content-section">
          <h3 class="section-heading">📦 Authored & Curated Datasets (${authoredDatasets.length})</h3>
          <div class="dist-cards">
            ${authoredDatasets.map(d => `
              <div class="dist-card">
                <div>
                  <span class="dist-format">Dataset</span>
                  <h4 class="dist-title">${d.title}</h4>
                </div>
                <a href="/datasets/${d.id.replace('resource-', '')}.html" class="btn-download">View Dataset &rarr;</a>
              </div>
            `).join('')}
          </div>
        </div>` : ''}

        ${authoredPubs.length > 0 ? `
        <div class="content-section">
          <h3 class="section-heading">📄 Publications (${authoredPubs.length})</h3>
          <div class="dist-cards">
            ${authoredPubs.map(p => `
              <div class="dist-card">
                <div>
                  <span class="dist-format">Publication</span>
                  <h4 class="dist-title">${p.title}</h4>
                </div>
                <a href="/publications/${p.id.replace('resource-', '')}.html" class="btn-download">View Publication &rarr;</a>
              </div>
            `).join('')}
          </div>
        </div>` : ''}
      </div>

      <aside>
        ${renderRtBox(person.id, false)}
      </aside>
    </div>
  </main>

  ${renderFooter()}
</body>
</html>`;
}

export function renderDcatHtml(resources: MarineEntity[], baseUrl: string): string {
  const datasets = resources.filter(r => r.category === "dataset");
  const apis = resources.filter(r => r.category === "api");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>DCAT Data Catalogue - VLIZ Marine Linked Data Portal</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="/style.css">
  <link rel="profile" href="https://www.w3.org/TR/vocab-dcat/">
  <link rel="alternate" type="text/turtle" href="/catalog/dcat.ttl">
  <link rel="alternate" type="application/ld+json" href="/catalog/dcat.jsonld">
</head>
<body>
  ${renderHeader('catalog')}

  <div class="detail-header">
    <div class="detail-header-inner">
      <h2 class="detail-title">📚 W3C DCAT-3 Data Catalogue</h2>
      <p style="color: var(--text-secondary); font-size: 1.1rem; margin: 0 0 1rem;">
        Standardized DCAT-AP v2 / DCAT-3 catalogue describing marine data assets, distributions, and APIs published by Flanders Marine Institute (VLIZ).
      </p>
      <div class="meta-badges">
        <a href="/catalog/dcat.ttl" class="meta-badge" download>🐢 Download dcat.ttl (Turtle)</a>
        <a href="/catalog/dcat.jsonld" class="meta-badge" download>📜 Download dcat.jsonld (JSON-LD)</a>
      </div>
    </div>
  </div>

  <main class="main-container">
    <div class="content-section">
      <h3 class="section-heading">📦 Catalogue Datasets (${datasets.length})</h3>
      <div class="cards-grid">
        ${datasets.map(ds => `
          <div class="card">
            <h3 class="card-title"><a href="/datasets/${ds.id.replace('resource-', '')}.html">${ds.title}</a></h3>
            <p class="card-desc">${ds.description}</p>
            <div class="card-tags">
              ${(ds.distributions || []).map(d => `<span class="tag">${d.format}</span>`).join(' ')}
            </div>
            <div class="card-footer">
              <a href="/datasets/${ds.id.replace('resource-', '')}.html" class="card-link">View Dataset Details &rarr;</a>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="content-section">
      <h3 class="section-heading">⚡ Data Services / APIs (${apis.length})</h3>
      <div class="cards-grid">
        ${apis.map(api => `
          <div class="card">
            <h3 class="card-title"><a href="/api/docs/">${api.title}</a></h3>
            <p class="card-desc">${api.description}</p>
            <div class="card-tags">
              <span class="tag">OpenAPI 3.0</span>
              <span class="tag">JSON Subsetting</span>
            </div>
            <div class="card-footer">
              <a href="/api/docs/" class="card-link">Explore Swagger UI &rarr;</a>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </main>

  ${renderFooter()}
</body>
</html>`;
}
