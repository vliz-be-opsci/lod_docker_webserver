import { PageConfig } from "./types";

export function getCssContent(): string {
  return `/* LOD Discovery Testbed Design System */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap');

:root {
  --bg-color: #fffbe6; /* Licht zand background */
  --panel-bg: #ffffff; /* Wit panels */
  --border-color: rgba(53, 77, 155, 0.12); /* Subtle VLIZ-blauw border */
  --text-primary: #1e293b; /* Dark Slate */
  --text-secondary: #475569; /* Slate */
  --text-muted: #64748b; /* Muted Slate */
  --vliz-blue: #354d9b; /* VLIZ-blauw */
  --vliz-blue-glow: rgba(53, 77, 155, 0.06);
  --sea-blue: #31b7bc; /* Zeeblauw */
  --sea-blue-glow: rgba(49, 183, 188, 0.08);
  --sand: #f7c97c; /* Zand */
  --sand-glow: rgba(247, 201, 124, 0.15);
  --light-sand: #fff7d0; /* Licht zand */
  --success: #10b981;
  --card-hover: rgba(53, 77, 155, 0.03);
  --glass-shadow: 0 4px 20px 0 rgba(53, 77, 155, 0.05);
  --glow-shadow: 0 4px 14px rgba(53, 77, 155, 0.15);
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: 'Inter', sans-serif;
  background-color: var(--bg-color);
  color: var(--text-primary);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-image: 
    radial-gradient(circle at 15% 20%, rgba(49, 183, 188, 0.05) 0%, transparent 40%),
    radial-gradient(circle at 85% 80%, rgba(247, 201, 124, 0.08) 0%, transparent 40%);
  background-attachment: fixed;
  line-height: 1.5;
}

header {
  background: var(--vliz-blue);
  color: #ffffff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding: 1.25rem 2rem;
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-badge {
  background: var(--sea-blue);
  color: #ffffff;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  font-size: 0.9rem;
  letter-spacing: 1px;
}

h1.site-title {
  margin: 0;
  font-family: 'Outfit', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.nav-links a {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  padding: 0.25rem 0;
  transition: color 0.2s ease;
}

.nav-links a:hover {
  color: #ffffff;
}

.nav-links a.active {
  color: var(--sand);
  border-bottom: 2px solid var(--sand);
}

main {
  flex: 1;
  max-width: 1600px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
  display: grid;
  grid-template-columns: 340px 1fr; /* Updated to 2 columns */
  gap: 2rem;
}

/* Sidebar and Panel Containers */
.panel {
  background: var(--panel-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: var(--glass-shadow);
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 180px);
}

.panel h2 {
  font-family: 'Outfit', sans-serif;
  font-size: 1.2rem;
  color: var(--vliz-blue);
  margin-top: 0;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.scrollable {
  overflow-y: auto;
  flex: 1;
  padding-right: 0.5rem;
}

.scrollable::-webkit-scrollbar {
  width: 6px;
}

.scrollable::-webkit-scrollbar-track {
  background: transparent;
}

.scrollable::-webkit-scrollbar-thumb {
  background: rgba(53, 77, 155, 0.15);
  border-radius: 3px;
}

.scrollable::-webkit-scrollbar-thumb:hover {
  background: rgba(53, 77, 155, 0.25);
}

/* List styles */
.item-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.section-title {
  font-family: 'Outfit', sans-serif;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--vliz-blue);
  letter-spacing: 0.75px;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  padding-left: 0.5rem;
  border-left: 2px solid var(--sea-blue);
}

.item-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0.8rem;
  border-radius: 6px;
  color: var(--text-secondary);
  text-decoration: none;
  background: rgba(53, 77, 155, 0.02);
  border: 1px solid transparent;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.item-link:hover {
  background: var(--card-hover);
  border-color: var(--border-color);
  color: var(--vliz-blue);
  transform: translateX(4px);
}

.item-link.active {
  background: var(--vliz-blue-glow);
  border-color: var(--vliz-blue);
  color: var(--vliz-blue);
  font-weight: 600;
}

.item-link.active-on-page {
  background: var(--sea-blue-glow);
  border-color: var(--sea-blue);
  color: var(--vliz-blue);
  border-left: 3px solid var(--sea-blue);
}

.item-link .badge {
  font-size: 0.75rem;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  background: rgba(53, 77, 155, 0.08);
  color: var(--vliz-blue);
}

.item-link.active .badge {
  background: var(--vliz-blue);
  color: #ffffff;
}

/* Details and Cards */
.resource-header {
  margin-bottom: 1.5rem;
}

.resource-type-badge {
  display: inline-block;
  font-family: 'Outfit', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--vliz-blue);
  background: var(--vliz-blue-glow);
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  border: 1px solid var(--border-color);
  margin-bottom: 0.5rem;
}

.resource-title {
  font-family: 'Outfit', sans-serif;
  font-size: 2.2rem;
  color: var(--vliz-blue);
  margin: 0.5rem 0;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.resource-desc {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin-top: 0;
  margin-bottom: 1.5rem;
}

.properties-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 2rem;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.properties-table th, .properties-table td {
  padding: 1rem;
  text-align: left;
}

.properties-table th {
  background: var(--vliz-blue-glow);
  font-family: 'Outfit', sans-serif;
  font-size: 0.95rem;
  color: var(--vliz-blue);
  border-bottom: 1px solid var(--border-color);
}

.properties-table td {
  border-bottom: 1px solid var(--border-color);
  font-size: 0.95rem;
}

.properties-table tr:last-child td {
  border-bottom: none;
}

.property-key {
  font-family: monospace;
  color: var(--vliz-blue);
  font-weight: 600;
  width: 40%;
  word-break: break-all;
}

.property-val {
  word-break: break-all;
}

.property-val a {
  color: var(--sea-blue);
  text-decoration: none;
  font-weight: 500;
  transition: text-decoration 0.2s ease;
}

.property-val a:hover {
  text-decoration: underline;
}

.alt-formats {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-format {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
  border: 1px solid var(--border-color);
  background: #ffffff;
  color: var(--text-primary);
  transition: all 0.2s ease;
}

.btn-format:hover {
  background: var(--card-hover);
  border-color: var(--vliz-blue);
  transform: translateY(-2px);
}

.btn-format.ttl { border-color: var(--vliz-blue); color: var(--vliz-blue); }
.btn-format.jsonld { border-color: var(--sea-blue); color: var(--sea-blue); }
.btn-format.rdf { border-color: var(--sand); color: #b48a3c; }

/* Strategy details (re-styled for inline content blocks) */
.strategy-card {
  background: rgba(53, 77, 155, 0.01);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.strategy-card.active {
  border-left: 4px solid var(--sea-blue);
  background: var(--sea-blue-glow);
}

.strategy-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.strategy-title {
  font-family: 'Outfit', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--vliz-blue);
}

.strategy-status {
  font-size: 0.75rem;
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
  font-weight: 600;
}

.strategy-status.active {
  background: var(--sea-blue);
  color: #ffffff;
}

.strategy-status.inactive {
  background: rgba(0, 0, 0, 0.05);
  color: var(--text-muted);
}

.strategy-desc {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin: 0;
}

.strategy-code {
  font-family: monospace;
  font-size: 0.75rem;
  background: var(--light-sand);
  padding: 0.6rem;
  border-radius: 6px;
  margin-top: 0.5rem;
  overflow-x: auto;
  border: 1px solid var(--border-color);
  color: var(--vliz-blue);
}

/* Footer */
footer {
  border-top: 1px solid var(--border-color);
  padding: 1.5rem;
  text-align: center;
  font-size: 0.8rem;
  color: var(--text-muted);
  background: rgba(53, 77, 155, 0.03);
}

/* Dashboard styles */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-top: 1rem;
}

.dashboard-card {
  background: #ffffff;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
}

.dashboard-card h3 {
  margin-top: 0;
  font-family: 'Outfit', sans-serif;
  color: var(--vliz-blue);
}

.stats-number {
  font-size: 3rem;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  color: var(--vliz-blue);
  line-height: 1;
  margin: 0.5rem 0;
}

.doc-info {
  background: var(--vliz-blue-glow);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.25rem;
  margin-top: 1rem;
}

.doc-info h3 {
  margin-top: 0;
  font-size: 1rem;
  color: var(--vliz-blue);
}

/* Badge styles */
.badge-pill {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.15rem 0.45rem;
  border-radius: 9999px;
  background: var(--vliz-blue-glow);
  color: var(--vliz-blue);
  border: 1px solid var(--border-color);
  margin-right: 0.25rem;
  margin-bottom: 0.25rem;
}

/* Custom layout adjustments for dynamic rendering */
@media (max-width: 1200px) {
  main {
    grid-template-columns: 1fr;
  }
  .panel {
    max-height: none;
  }
}

/* Classification matrix styles */
.classification-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-gap: 1.5rem;
  margin-top: 1.5rem;
}

.quadrant-card {
  background: var(--vliz-blue-glow);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.quadrant-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--glow-shadow);
  border-color: var(--sea-blue);
  background: #ffffff;
}

.quadrant-card.active {
  border-color: var(--vliz-blue);
  background: var(--sand-glow);
  box-shadow: var(--glow-shadow);
}

.quadrant-header {
  font-family: 'Outfit', sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--vliz-blue);
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quadrant-badge {
  font-size: 0.7rem;
  background: var(--sea-blue-glow);
  color: var(--sea-blue);
  border: 1px solid rgba(49, 183, 188, 0.2);
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
}

.quadrant-desc {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.quadrant-count {
  font-size: 1.75rem;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  color: var(--vliz-blue);
}

.strategies-list-container {
  margin-top: 2rem;
  background: #ffffff;
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 1.5rem;
}

.classification-tabs {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.tab-btn {
  background: var(--vliz-blue-glow);
  border: 1px solid var(--border-color);
  color: var(--vliz-blue);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

.tab-btn:hover, .tab-btn.active {
  background: var(--vliz-blue);
  color: #ffffff;
  border-color: var(--vliz-blue);
}

/* Network Connection Graph styling */
.network-container {
  display: flex;
  gap: 1.5rem;
  width: 100%;
}

@media (max-width: 992px) {
  .network-container {
    flex-direction: column !important;
  }
  #resource-network, #network-details-card {
    flex: none !important;
    width: 100% !important;
    height: 400px !important;
    max-height: 400px !important;
  }
}

#resource-network {
  box-shadow: inset 0 2px 6px rgba(53, 77, 155, 0.05);
  transition: border-color 0.2s ease;
}

#resource-network:hover {
  border-color: var(--vliz-blue) !important;
}

#network-details-card {
  transition: all 0.3s ease;
}

#network-details-card:hover {
  box-shadow: var(--glow-shadow);
}
`;
}

export function renderPageHtml(
  page: PageConfig,
  activeStrategyMetadataTags: string,
  activeStrategyBodyMarkup: string,
  navigationHtml: string,
  centerContentHtml: string
): string {
  const pageTitle = page.title;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageTitle} | LOD Testbed</title>
  <link rel="stylesheet" href="/style.css?v=2">
  ${activeStrategyMetadataTags}
</head>
<body>
  <header>
    <div class="logo-container">
      <div class="logo-badge">LOD</div>
      <h1 class="site-title">Discovery Compliance Testbed</h1>
    </div>
    <nav class="nav-links">
      <a href="/" class="${page.id === 'index' ? 'active' : ''}">Overview</a>
      <a href="/pages/matrix.html" class="${page.id === 'matrix' ? 'active' : ''}">Total Pages Test</a>
      <a href="/pages/classification.html" class="${page.id === 'classification' ? 'active' : ''}">Classification Matrix</a>
      <a href="/graph/expected.json" target="_blank">Expected Graph</a>
      <a href="/.well-known/resource-map.json" target="_blank">Resource Map</a>
    </nav>
  </header>
  
  <main>
    <!-- Left Navigation Bar -->
    <aside class="panel">
      <h2>Explorer</h2>
      <div class="scrollable">
        <ul class="item-list">
          ${navigationHtml}
        </ul>
      </div>
    </aside>

    <!-- Center content (Right sidebar has been removed) -->
    <section class="panel" style="max-height: none;">
      ${centerContentHtml}
      ${activeStrategyBodyMarkup}
    </section>
  </main>

  <footer>
    <div>LOD Compliance Discovery Testbed &bull; Configured with Base URL: <code style="color: var(--vliz-blue);">http://localhost:8080</code></div>
    <div style="margin-top: 0.5rem; font-size: 0.75rem;">Reproducible Static Generation via Bun + TypeScript. Served by Nginx in Docker.</div>
  </footer>
</body>
</html>`;
}
