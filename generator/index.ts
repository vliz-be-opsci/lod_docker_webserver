import fs from "fs";
import path from "path";
import { DiscoveryStrategy, PageConfig, ExpectedGraph, GraphNode, GraphEdge } from "./types";
import { RESOURCES, getResourceById } from "./resources";
import { serializeJsonLd, serializeTurtle, serializeRDFXML, expandUri, isRelationProperty, expandPredicate } from "./rdfSerializer";
import { STRATEGIES_META, generateMatrix, getStrategyHeaders, getStrategyMetadataTags, getStrategyBodyMarkup } from "./strategies";
import { getCssContent, renderPageHtml } from "./htmlTemplates";

const BASE_URL = process.env.BASE_URL || "http://localhost:8080";
const GEN_LIMIT = parseInt(process.env.GEN_LIMIT || "150", 10);
const DIST_DIR = path.resolve(process.cwd(), "dist");

// Helper to ensure target directories exist
function ensureDirs() {
  const dirs = [
    DIST_DIR,
    path.join(DIST_DIR, "pages"),
    path.join(DIST_DIR, "rdf"),
    path.join(DIST_DIR, "api"),
    path.join(DIST_DIR, "manifests"),
    path.join(DIST_DIR, "graph"),
    path.join(DIST_DIR, "channels"),
    path.join(DIST_DIR, ".well-known")
  ];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

function cleanDist() {
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
  }
}

// Builds the sidebar navigation dynamically, hiding the detailed test pages and exposing overview, matrix, and channels.
function buildNavigation(activeId: string): string {
  let html = `<li><a href="/" class="item-link ${activeId === 'index' ? 'active' : ''}">Overview</a></li>\n`;
  html += `<li><a href="/pages/matrix.html" class="item-link ${activeId === 'matrix' ? 'active' : ''}">Total Pages Test</a></li>\n`;
  html += `<li><a href="/pages/classification.html" class="item-link ${activeId === 'classification' ? 'active' : ''}">Classification Matrix</a></li>\n`;
  html += `<li class="section-title">Discovery Channels</li>\n`;
  for (const strat of STRATEGIES_META) {
    const activeClass = activeId === `channel-${strat.id}` ? 'active' : '';
    html += `<li><a href="/channels/${strat.id.toLowerCase()}.html" class="item-link ${activeClass}">${strat.name}</a></li>\n`;
  }
  return html;
}

async function main() {
  console.log(`Starting static generation for LOD Testbed...`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Limit: ${GEN_LIMIT} pages`);

  cleanDist();
  ensureDirs();

  // 1. Write Shared CSS
  fs.writeFileSync(path.join(DIST_DIR, "style.css"), getCssContent());

  // 2. Generate Page Matrix
  const pages = generateMatrix(GEN_LIMIT);
  console.log(`Generated ${pages.length} pages in the matrix.`);

  // 3. Serialize all resources into RDF folder & APIs
  const resourceSerializations: Record<string, { jsonld: string; ttl: string; rdf: string }> = {};
  for (const resource of RESOURCES) {
    const jsonld = serializeJsonLd(resource, BASE_URL);
    const ttl = serializeTurtle(resource, BASE_URL);
    const rdf = serializeRDFXML(resource, BASE_URL);

    resourceSerializations[resource.id] = { jsonld, ttl, rdf };

    // Write RDF files
    fs.writeFileSync(path.join(DIST_DIR, "rdf", `${resource.id}.ttl`), ttl);
    fs.writeFileSync(path.join(DIST_DIR, "rdf", `${resource.id}.jsonld`), jsonld);
    fs.writeFileSync(path.join(DIST_DIR, "rdf", `${resource.id}.rdf`), rdf);

    // Write API resource endpoints
    fs.writeFileSync(path.join(DIST_DIR, "api", resource.id), jsonld);
  }

  // 4. Render Individual testbed pages (page-x.html)
  const nginxHeaders: string[] = [];
  const navigationHtml = buildNavigation(""); // Empty active ID for specific pages since they aren't directly in sidebar

  for (let idx = 0; idx < pages.length; idx++) {
    const page = pages[idx];
    const resource = page.resourceId ? getResourceById(page.resourceId) : undefined;
    const serials = resource ? resourceSerializations[resource.id] : undefined;

    // Collect metadata tags and body markup
    let metadataTags = "";
    let bodyMarkup = "";

    // Handle standard pagination strategy
    if (page.strategies.includes(DiscoveryStrategy.PAGINATION)) {
      let prevPage: PageConfig | null = null;
      for (let p = idx - 1; p >= 0; p--) {
        if (!pages[p].isHidden) {
          prevPage = pages[p];
          break;
        }
      }
      let nextPage: PageConfig | null = null;
      for (let p = idx + 1; p < pages.length; p++) {
        if (!pages[p].isHidden) {
          nextPage = pages[p];
          break;
        }
      }

      if (prevPage) {
        metadataTags += `  <link rel="prev" href="/pages/${prevPage.id}.html">\n`;
      }
      if (nextPage) {
        metadataTags += `  <link rel="next" href="/pages/${nextPage.id}.html">\n`;
      }
    }

    for (const strat of page.strategies) {
      metadataTags += getStrategyMetadataTags(strat, page, BASE_URL) + "\n";
      if (serials && resource) {
        bodyMarkup += getStrategyBodyMarkup(strat, page, BASE_URL, serials.jsonld, serials.ttl, resource) + "\n";
      }
    }

    // Build Nginx Headers for this page
    const headersMap: Record<string, string> = {};
    for (const strat of page.strategies) {
      const h = getStrategyHeaders(strat, page, BASE_URL);
      Object.assign(headersMap, h);
    }
    if (page.customHeaders) {
      Object.assign(headersMap, page.customHeaders);
    }

    if (Object.keys(headersMap).length > 0) {
      nginxHeaders.push(`location = /pages/${page.id}.html {`);
      for (const [hk, hv] of Object.entries(headersMap)) {
        nginxHeaders.push(`    add_header ${hk} ${JSON.stringify(hv)};`);
      }
      nginxHeaders.push(`}`);
    }

    // Build center content HTML (Page Dashboard/Details)
    let centerHtml = "";
    if (resource) {
      const resUri = expandUri(resource.id, BASE_URL);
      const hasMicrodata = page.strategies.includes(DiscoveryStrategy.MICRODATA);
      const hasRdfa = page.strategies.includes(DiscoveryStrategy.RDFA);

      let outerAttrs = "";
      if (hasMicrodata) {
        outerAttrs += ` itemscope itemtype="https://schema.org/${resource.type}" itemid="${resUri}"`;
      }
      if (hasRdfa) {
        outerAttrs += ` vocab="https://schema.org/" prefix="rdf: http://www.w3.org/1999/02/22-rdf-syntax-ns# schema: https://schema.org/ foaf: http://xmlns.com/foaf/0.1/ prov: http://www.w3.org/ns/prov# owl: http://www.w3.org/2002/07/owl# skos: http://www.w3.org/2004/02/skos/core#" typeof="${resource.type}" about="${resUri}"`;
      }

      centerHtml = `
        <div${outerAttrs}>
          <div class="resource-header">
            <span class="resource-type-badge">${resource.type}</span>
            <h2 class="resource-title">${resource.title}</h2>
            <p class="resource-desc">${resource.description}</p>
          </div>
          
          <table class="properties-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
      `;

      // Base properties
      let nameAttrs = "";
      if (hasMicrodata) nameAttrs += ` itemprop="https://schema.org/name"`;
      if (hasRdfa) nameAttrs += ` property="https://schema.org/name"`;

      let descAttrs = "";
      if (hasMicrodata) descAttrs += ` itemprop="https://schema.org/description"`;
      if (hasRdfa) descAttrs += ` property="https://schema.org/description"`;

      let typeAttrs = "";
      if (hasRdfa) typeAttrs += ` property="http://www.w3.org/1999/02/22-rdf-syntax-ns#type"`;

      centerHtml += `
        <tr>
          <td class="property-key">http://www.w3.org/1999/02/22-rdf-syntax-ns#type</td>
          <td class="property-val"><code ${typeAttrs}>https://schema.org/${resource.type}</code></td>
        </tr>
        <tr>
          <td class="property-key">https://schema.org/name</td>
          <td class="property-val" ${nameAttrs}>${resource.title}</td>
        </tr>
        <tr>
          <td class="property-key">https://schema.org/description</td>
          <td class="property-val" ${descAttrs}>${resource.description}</td>
        </tr>
      `;

      // Custom attributes
      for (const [key, value] of Object.entries(resource.properties)) {
        const isRel = isRelationProperty(key);
        const mdProp = expandPredicate(key);
        const rdfaProp = expandPredicate(key);
        const values = Array.isArray(value) ? value : [value];
        const valHtml = values.map(v => {
          if (isRel) {
            const targetUri = expandUri(v, BASE_URL);
            const targetRes = v.startsWith("resource-") ? getResourceById(v) : undefined;
            
            let linkAttrs = "";
            if (hasMicrodata) {
              linkAttrs += ` itemprop="${mdProp}" itemscope itemid="${targetUri}"`;
              if (targetRes) {
                linkAttrs += ` itemtype="https://schema.org/${targetRes.type}"`;
              }
            }
            if (hasRdfa) {
              linkAttrs += ` rel="${rdfaProp}" resource="${targetUri}"`;
            }

            if (v.startsWith("resource-")) {
              const matchedPage = pages.find(p => p.resourceId === v && !p.isHidden);
              const path = matchedPage ? `/pages/${matchedPage.id}.html` : `/rdf/${v}.ttl`;
              return `<a href="${path}" ${linkAttrs}><code>${v}</code></a>`;
            }
            return `<a href="${v}" target="_blank" ${linkAttrs}><code>${v}</code></a>`;
          }
          
          let propAttrs = "";
          if (hasMicrodata) propAttrs += ` itemprop="${mdProp}"`;
          if (hasRdfa) propAttrs += ` property="${rdfaProp}"`;
          return `<span ${propAttrs}>${v}</span>`;
        }).join(", ");

        centerHtml += `
          <tr>
            <td class="property-key">${expandPredicate(key)}</td>
            <td class="property-val">${valHtml}</td>
          </tr>
        `;
      }

      centerHtml += `
            </tbody>
          </table>
        </div>

        <h3>Alternate Formats</h3>
        <p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: -0.5rem; margin-bottom: 1rem;">
          These formats are linked using Strategy 9 (Alternate Links) and represent the formal Linked Data graph.
        </p>
        <div class="alt-formats">
          <a href="/rdf/${resource.id}.ttl" class="btn-format ttl" target="_blank">Turtle (TTL)</a>
          <a href="/rdf/${resource.id}.jsonld" class="btn-format jsonld" target="_blank">JSON-LD</a>
          <a href="/rdf/${resource.id}.rdf" class="btn-format rdf" target="_blank">RDF/XML</a>
        </div>
      `;
    } else {
      centerHtml = `
        <div class="resource-header">
          <h2 class="resource-title">${page.title}</h2>
          <p class="resource-desc">No semantic resource directly bound to this node. Running discovery matrix linkage.</p>
        </div>
      `;
    }

    // Build sidebar strategies HTML (guides testers and crawlers)
    let strategiesListHtml = "";
    for (const stratMeta of STRATEGIES_META) {
      const isActive = page.strategies.includes(stratMeta.id);
      strategiesListHtml += `
        <div class="strategy-card ${isActive ? 'active' : ''}">
          <div class="strategy-card-header">
            <span class="strategy-title">${stratMeta.name}</span>
            <span class="strategy-status ${isActive ? 'active' : 'inactive'}">${isActive ? 'ACTIVE' : 'INACTIVE'}</span>
          </div>
          <p class="strategy-desc">${stratMeta.description}</p>
          ${isActive ? `<pre class="strategy-code">${escapeHtml(stratMeta.codeSnippet)}</pre>` : ""}
        </div>
      `;
    }

    // Embed direct links in HTML body for Strategy 1
    let bodyLinksMarkup = "";
    if (page.strategies.includes(DiscoveryStrategy.HTML_LINKS) || page.linkedPages.length > 0) {
      bodyLinksMarkup += `<div class="doc-info" style="margin-top: 2rem;">
        <h3>HTML Hyperlinks (Strategy 1)</h3>
        <p style="color: var(--text-secondary); font-size: 0.85rem; margin: 0 0 0.75rem 0;">Direct crawler links available in this page body:</p>
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
      `;
      for (const targetId of page.linkedPages) {
        const targetPage = pages.find(p => p.id === targetId);
        if (targetPage) {
          bodyLinksMarkup += `<a href="/pages/${targetPage.id}.html" style="color: var(--sea-blue); text-decoration: none; font-size: 0.95rem; font-weight: bold;">&rarr; Crawl to: ${targetPage.title} (${targetPage.id}.html)</a>`;
        }
      }
      bodyLinksMarkup += `</div></div>`;
    }

    const finalCenterHtml = centerHtml + bodyLinksMarkup;

    // Render HTML page
    const renderedHtml = renderPageHtml(
      page,
      metadataTags,
      bodyMarkup,
      navigationHtml,
      finalCenterHtml
    );

    fs.writeFileSync(path.join(DIST_DIR, "pages", `${page.id}.html`), renderedHtml);
  }

  // 5. Generate Channel Description Pages (/channels/{id}.html)
  for (const strat of STRATEGIES_META) {
    const pagesUsingThisChannel = pages.filter(p => p.strategies.includes(strat.id));

    let tableHtml = `
      <table class="properties-table">
        <thead>
          <tr>
            <th>Page Link</th>
            <th>Title</th>
            <th>Associated Resource</th>
          </tr>
        </thead>
        <tbody>
    `;

    if (pagesUsingThisChannel.length === 0) {
      tableHtml += `
        <tr>
          <td colspan="3" style="text-align: center; color: var(--text-muted); font-style: italic;">
            No matrix pages directly use this channel (it may be exposed centrally via feed/manifest/robots.txt).
          </td>
        </tr>
      `;
    } else {
      for (const p of pagesUsingThisChannel) {
        tableHtml += `
          <tr>
            <td class="property-key"><a href="/pages/${p.id}.html">/pages/${p.id}.html</a></td>
            <td class="property-val" style="font-weight: 500;">${p.title}</td>
            <td class="property-val">${p.resourceId ? `<code>${p.resourceId}</code>` : '<span style="color: var(--text-muted);">None</span>'}</td>
          </tr>
        `;
      }
    }
    tableHtml += `
        </tbody>
      </table>
    `;

    const channelCenterHtml = `
      <div class="resource-header">
        <span class="resource-type-badge">${strat.category}</span>
        <h2 class="resource-title">${strat.name}</h2>
        <p class="resource-desc">${strat.description}</p>
      </div>

      <div class="doc-info" style="margin-bottom: 2rem;">
        <h3>Standard & Origin Information</h3>
        <p style="margin: 0.5rem 0;"><strong>Standard Protocol:</strong> <a href="${strat.specLink}" target="_blank" class="badge-pill" style="font-size: 0.85rem; background: var(--sea-blue-glow); color: var(--vliz-blue); font-weight: bold; border-color: var(--sea-blue); text-decoration: none;">${strat.standard} &rarr;</a></p>
        <p style="margin: 0.5rem 0;"><strong>Origin / Provenance:</strong> <span>${strat.provenance}</span></p>
        <p style="margin: 1rem 0 0 0; font-size: 0.9rem; line-height: 1.5; color: var(--text-secondary); border-top: 1px solid var(--border-color); padding-top: 0.75rem;"><strong>Context &amp; Usage:</strong> ${strat.extraInfo}</p>
      </div>

      ${strat.proposedRdfRetrieval ? `
      <h3>Proposed RDF Retrieval Design</h3>
      <p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: -0.5rem; margin-bottom: 1rem;">
        Describes how the testbed maps the raw parameters/syntax of this method into standard RDF statements.
      </p>
      <div class="doc-info" style="background: var(--sea-blue-glow); border-color: var(--sea-blue); margin-bottom: 2rem;">
        <pre style="font-family: monospace; font-size: 0.85rem; white-space: pre-wrap; margin: 0; color: var(--text-primary);">${escapeHtml(strat.proposedRdfRetrieval)}</pre>
      </div>
      ` : ""}

      <h3>Discovery Markup / Headers Code</h3>
      <p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: -0.5rem; margin-bottom: 1rem;">
        This shows the typical configuration or HTML markup representation for this channel.
      </p>
      <pre class="strategy-code">${escapeHtml(strat.codeSnippet)}</pre>

      <h3 style="margin-top: 2rem;">Pages Exercising This Channel</h3>
      <p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: -0.5rem; margin-bottom: 1rem;">
        Below are all pages in the crawling matrix that contain this active metadata discovery channel.
      </p>
      ${tableHtml}
    `;

    // Build sidebar showing all channels with this one highlighted
    let sidebarHtml = "";
    for (const stratMeta of STRATEGIES_META) {
      const isActive = stratMeta.id === strat.id;
      sidebarHtml += `
        <div class="strategy-card ${isActive ? 'active' : ''}">
          <div class="strategy-card-header">
            <span class="strategy-title">${stratMeta.name}</span>
            <span class="strategy-status ${isActive ? 'active' : 'inactive'}">${isActive ? 'VIEWING' : 'INACTIVE'}</span>
          </div>
          <p class="strategy-desc">${stratMeta.description}</p>
        </div>
      `;
    }

    const renderedChannelHtml = renderPageHtml(
      { id: `channel-${strat.id}`, title: `${strat.name} Channel`, resourceId: null, strategies: [], linkedPages: [], linkedResources: [] },
      "",
      "",
      buildNavigation(`channel-${strat.id}`),
      channelCenterHtml
    );

    fs.writeFileSync(path.join(DIST_DIR, "channels", `${strat.id.toLowerCase()}.html`), renderedChannelHtml);
  }

  // 6. Generate Total Pages Test Matrix Page (/pages/matrix.html)
  let matrixTableHtml = `
    <table class="properties-table">
      <thead>
        <tr>
          <th>URL Path</th>
          <th>Page Title</th>
          <th>Active Discovery Channels</th>
        </tr>
      </thead>
      <tbody>
  `;
  for (const p of pages) {
    const badges = p.strategies.map(s => {
      const meta = STRATEGIES_META.find(sm => sm.id === s);
      return `<span class="badge-pill" style="font-size: 0.75rem; font-weight: 600; padding: 0.15rem 0.45rem; border-radius: 9999px; background: var(--vliz-blue-glow); color: var(--vliz-blue); border: 1px solid var(--border-color); display: inline-block; margin-right: 0.25rem; margin-bottom: 0.25rem;">${meta ? meta.name : s}</span>`;
    }).join("");

    matrixTableHtml += `
      <tr>
        <td class="property-key"><a href="/pages/${p.id}.html">/pages/${p.id}.html</a></td>
        <td class="property-val" style="font-weight: 600; color: var(--vliz-blue);">${p.title}</td>
        <td class="property-val">${badges || '<span style="color: var(--text-muted); font-style: italic;">None (direct link traversal only)</span>'}</td>
      </tr>
    `;
  }
  matrixTableHtml += `
      </tbody>
    </table>
  `;

  const matrixCenterHtml = `
    <div class="resource-header">
      <span class="resource-type-badge">Compliance Matrix</span>
      <h2 class="resource-title">Total Pages Test Matrix</h2>
      <p class="resource-desc">
        A complete grid of all generated testbed URLs. It maps every physical page to the set of semantic discovery channels active on it.
      </p>
    </div>
    ${matrixTableHtml}
  `;

  let matrixSidebarHtml = "";
  for (const stratMeta of STRATEGIES_META) {
    matrixSidebarHtml += `
      <div class="strategy-card">
        <div class="strategy-card-header">
          <a href="/channels/${stratMeta.id.toLowerCase()}.html" class="strategy-title" style="text-decoration: none; color: var(--vliz-blue); font-weight: bold;">${stratMeta.name} &rarr;</a>
        </div>
        <p class="strategy-desc">${stratMeta.description}</p>
      </div>
    `;
  }

  const renderedMatrixHtml = renderPageHtml(
    { id: "matrix", title: "Total Pages Test Matrix", resourceId: null, strategies: [], linkedPages: [], linkedResources: [] },
    "",
    "",
    buildNavigation("matrix"),
    matrixCenterHtml
  );
  fs.writeFileSync(path.join(DIST_DIR, "pages", "matrix.html"), renderedMatrixHtml);

  // 6.5 Generate Classification Matrix Page (/pages/classification.html)
  const classificationPage: PageConfig = {
    id: "classification",
    title: "Classification Matrix",
    resourceId: null,
    strategies: [],
    linkedPages: [],
    linkedResources: []
  };

  const q1Count = STRATEGIES_META.filter(s => (s.location === "Resource" || s.location === "Both") && (s.extraction === "Direct" || s.extraction === "Both")).length;
  const q2Count = STRATEGIES_META.filter(s => (s.location === "Resource" || s.location === "Both") && (s.extraction === "Inferenced" || s.extraction === "Both")).length;
  const q3Count = STRATEGIES_META.filter(s => (s.location === "Domain" || s.location === "Both") && (s.extraction === "Direct" || s.extraction === "Both")).length;
  const q4Count = STRATEGIES_META.filter(s => (s.location === "Domain" || s.location === "Both") && (s.extraction === "Inferenced" || s.extraction === "Both")).length;

  const classificationCenterHtml = `
    <div class="resource-header">
      <span class="resource-type-badge">LOD Taxonomy</span>
      <h2 class="resource-title">Discovery Classification Matrix</h2>
      <p class="resource-desc">
        A 2x2 taxonomy dividing the 30 web resource discovery methods based on their <strong>Location of Discovery</strong> (Resource vs. Domain level) and their <strong>Extraction Type</strong> (Direct vs. Inferenced RDF).
      </p>
    </div>

    <div class="classification-grid">
      <!-- Q1: Resource Level & Direct RDF -->
      <div class="quadrant-card active" id="card-q1" onclick="selectQuadrant('q1')">
        <div class="quadrant-header">
          <span>Resource Level &amp; Direct</span>
          <span class="quadrant-badge">Q1</span>
        </div>
        <p class="quadrant-desc">RDF retrieved directly from the resource URI itself as native serialization (Turtle, JSON-LD, etc.).</p>
        <div class="quadrant-count" id="count-q1">${q1Count}</div>
      </div>

      <!-- Q2: Resource Level & Inferenced RDF -->
      <div class="quadrant-card" id="card-q2" onclick="selectQuadrant('q2')">
        <div class="quadrant-header">
          <span>Resource Level &amp; Inferenced</span>
          <span class="quadrant-badge">Q2</span>
        </div>
        <p class="quadrant-desc">RDF parsed and mapped from non-RDF tags/markup (Microdata, RDFa, Open Graph) on the resource page.</p>
        <div class="quadrant-count" id="count-q2">${q2Count}</div>
      </div>

      <!-- Q3: Domain Level & Direct RDF -->
      <div class="quadrant-card" id="card-q3" onclick="selectQuadrant('q3')">
        <div class="quadrant-header">
          <span>Domain Level &amp; Direct</span>
          <span class="quadrant-badge">Q3</span>
        </div>
        <p class="quadrant-desc">RDF retrieved directly from separate domain/catalog-wide endpoints (DCAT catalogs, Linksets, etc.).</p>
        <div class="quadrant-count" id="count-q3">${q3Count}</div>
      </div>

      <!-- Q4: Domain Level & Inferenced RDF -->
      <div class="quadrant-card" id="card-q4" onclick="selectQuadrant('q4')">
        <div class="quadrant-header">
          <span>Domain Level &amp; Inferenced</span>
          <span class="quadrant-badge">Q4</span>
        </div>
        <p class="quadrant-desc">RDF inferred or harvested from domain-wide XML index files (Sitemaps, robots.txt, Atom/RSS feeds).</p>
        <div class="quadrant-count" id="count-q4">${q4Count}</div>
      </div>
    </div>

    <div class="strategies-list-container">
      <h3 style="margin-top: 0; color: var(--vliz-blue);" id="list-title">Resource Level &amp; Direct RDF Strategies</h3>
      <p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: -0.5rem; margin-bottom: 1.5rem;" id="list-desc">
        Showing all discovery strategies matching the selected quadrant.
      </p>

      <div class="scrollable-list" style="max-height: 500px; overflow-y: auto;">
        <table class="properties-table" id="strategies-table" style="margin-bottom: 0;">
          <thead>
            <tr>
              <th style="width: 20%;">Strategy Name</th>
              <th style="width: 40%;">Description &amp; Context</th>
              <th style="width: 25%;">Specification &amp; Origin</th>
              <th style="width: 15%;">Details</th>
            </tr>
          </thead>
          <tbody id="strategies-tbody">
            <!-- Dynamically populated -->
          </tbody>
        </table>
      </div>
    </div>

    <script>
      const STRATEGIES_DATA = ${JSON.stringify(STRATEGIES_META).replace(/<\/script/ig, '<\\/script')};

      function selectQuadrant(quadId) {
        // Toggle card active states
        document.querySelectorAll('.quadrant-card').forEach(card => card.classList.remove('active'));
        document.getElementById('card-' + quadId).classList.add('active');

        const tbody = document.getElementById('strategies-tbody');
        tbody.innerHTML = '';

        let filtered = [];
        let title = '';
        let desc = '';

        if (quadId === 'q1') {
          filtered = STRATEGIES_DATA.filter(s => (s.location === "Resource" || s.location === "Both") && (s.extraction === "Direct" || s.extraction === "Both"));
          title = "Resource Level &amp; Direct RDF Strategies";
          desc = "Native RDF payloads retrieved directly from the resource URI itself (e.g. content negotiation, describedby headers/links, embedded JSON-LD scripts).";
        } else if (quadId === 'q2') {
          filtered = STRATEGIES_DATA.filter(s => (s.location === "Resource" || s.location === "Both") && (s.extraction === "Inferenced" || s.extraction === "Both"));
          title = "Resource Level &amp; Inferenced RDF Strategies";
          desc = "Non-RDF payloads retrieved from the resource URI (like HTML pages) where the client parses attributes (Microdata, RDFa, Open Graph) to map them into RDF.";
        } else if (quadId === 'q3') {
          filtered = STRATEGIES_DATA.filter(s => (s.location === "Domain" || s.location === "Both") && (s.extraction === "Direct" || s.extraction === "Both"));
          title = "Domain Level &amp; Direct RDF Strategies";
          desc = "Native RDF payloads retrieved from separate host/domain level endpoints (such as DCAT catalogs, domain-wide Linksets, or RDF-based resource maps).";
        } else if (quadId === 'q4') {
          filtered = STRATEGIES_DATA.filter(s => (s.location === "Domain" || s.location === "Both") && (s.extraction === "Inferenced" || s.extraction === "Both"));
          title = "Domain Level &amp; Inferenced RDF Strategies";
          desc = "Non-RDF payloads retrieved from separate domain level endpoints (like sitemaps, robots.txt, Atom/RSS XML feeds) which are parsed to discover resource endpoints.";
        }

        document.getElementById('list-title').innerHTML = title;
        document.getElementById('list-desc').innerHTML = desc;

        filtered.forEach(strat => {
          const row = document.createElement('tr');
          
          let locationBadge = '<span class="badge-pill" style="font-size: 0.75rem; padding: 0.15rem 0.4rem; margin: 0;">' + strat.location + '</span>';
          if (strat.location === "Both") {
            locationBadge = '<span class="badge-pill" style="font-size: 0.75rem; padding: 0.15rem 0.4rem; margin: 0; background: var(--sand-glow); color: #b48a3c;">Both</span>';
          }
          
          let extractionBadge = '<span class="badge-pill" style="font-size: 0.75rem; padding: 0.15rem 0.4rem; margin: 0;">' + strat.extraction + '</span>';
          if (strat.extraction === "Both") {
            extractionBadge = '<span class="badge-pill" style="font-size: 0.75rem; padding: 0.15rem 0.4rem; margin: 0; background: var(--sand-glow); color: #b48a3c;">Both</span>';
          }

          row.innerHTML = \`
            <td class="property-key" style="font-family: 'Inter', sans-serif; font-weight: 600; width: 20%;"><a href="/channels/\${strat.id.toLowerCase()}.html">\${strat.name}</a></td>
            <td class="property-val" style="width: 40%;">
              <div style="font-weight: 500; margin-bottom: 0.4rem; color: var(--text-primary);">\${strat.description}</div>
              <div style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.45; border-left: 2px solid var(--sea-blue); padding-left: 0.5rem; margin-top: 0.25rem;">
                \${strat.extraInfo}
              </div>
            </td>
            <td class="property-val" style="width: 25%;">
              <a href="\${strat.specLink}" target="_blank" class="badge-pill" style="display: inline-block; background: var(--sea-blue-glow); color: var(--vliz-blue); border-color: var(--sea-blue); font-weight: 600; text-decoration: none; padding: 0.3rem 0.6rem; font-size: 0.8rem; transition: all 0.2s ease;">
                \${strat.standard} &rarr;
              </a>
              <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.35rem; padding-left: 0.25rem;">
                Source: \${strat.provenance}
              </div>
            </td>
            <td class="property-val" style="font-size: 0.8rem; width: 15%;">
              <div style="margin-bottom: 0.35rem;"><span class="badge-pill" style="background: var(--vliz-blue-glow); color: var(--vliz-blue); font-size: 0.7rem; padding: 0.1rem 0.35rem; margin: 0; font-weight: 600;">\${strat.category}</span></div>
              <div style="margin-bottom: 0.25rem; color: var(--text-secondary);"><strong>Loc:</strong> \${locationBadge}</div>
              <div style="color: var(--text-secondary);"><strong>Ext:</strong> \${extractionBadge}</div>
            </td>
          \`;
          tbody.appendChild(row);
        });
      }

      // Initial select Q1
      selectQuadrant('q1');
    </script>
  `;

  const renderedClassificationHtml = renderPageHtml(
    classificationPage,
    "",
    "",
    buildNavigation("classification"),
    classificationCenterHtml
  );
  fs.writeFileSync(path.join(DIST_DIR, "pages", "classification.html"), renderedClassificationHtml);

  // 7. Generate Index/Overview Page (index.html)
  const indexPage: PageConfig = {
    id: "index",
    title: "Overview",
    resourceId: null,
    strategies: [],
    linkedPages: [],
    linkedResources: []
  };

  const indexCenterHtml = `
    <div class="resource-header">
      <span class="resource-type-badge">LOD Compliance Testbed</span>
      <h2 class="resource-title">Overview Dashboard</h2>
      <p class="resource-desc">
        A deterministic local environment designed to systematically exercise crawler discovery mechanisms. It models realistic Linked Open Data graphs and physical web navigation paths.
      </p>
    </div>

    <div class="dashboard-grid">
      <div class="dashboard-card">
        <h3>Total Test Pages</h3>
        <div class="stats-number">${pages.length}</div>
        <p style="color: var(--text-secondary); margin: 0;">Unique test configurations generated deterministically.</p>
      </div>
      <div class="dashboard-card">
        <h3>Discovery Channels</h3>
        <div class="stats-number">30</div>
        <p style="color: var(--text-secondary); margin: 0;">Distinct discovery strategies executed across pages.</p>
      </div>
    </div>

    <div class="doc-info" style="margin-top: 1.5rem;">
      <h3>Linked Data Contexts</h3>
      <p style="color: var(--text-secondary); font-size: 0.9rem;">
        Resources are represented across <strong>schema.org</strong>, <strong>FOAF</strong>, <strong>SKOS</strong>, <strong>OWL SameAs</strong>, and <strong>PROV-O</strong> standards.
      </p>
      <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0;">
        Start crawl traversal: <a href="/pages/matrix.html" style="color: var(--sea-blue); font-weight: bold; text-decoration: none;">View Total Pages Matrix &rarr;</a>
      </p>
    </div>
  `;

  let indexSidebarHtml = "";
  for (const stratMeta of STRATEGIES_META) {
    indexSidebarHtml += `
      <div class="strategy-card active" style="border-left-color: var(--vliz-blue);">
        <div class="strategy-card-header">
          <a href="/channels/${stratMeta.id.toLowerCase()}.html" class="strategy-title" style="text-decoration: none; color: var(--vliz-blue); font-weight: bold;">${stratMeta.name} &rarr;</a>
          <span class="strategy-status active" style="background: var(--vliz-blue-glow); color: var(--vliz-blue); font-size: 0.75rem;">${stratMeta.category}</span>
        </div>
        <p class="strategy-desc">${stratMeta.description}</p>
      </div>
    `;
  }

  const renderedIndexHtml = renderPageHtml(
    indexPage,
    "",
    "",
    buildNavigation("index"),
    indexCenterHtml
  );
  fs.writeFileSync(path.join(DIST_DIR, "index.html"), renderedIndexHtml);

  // 8. Generate Syndication Feeds
  // RSS 2.0
  let rss = `<?xml version="1.0" encoding="utf-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n  <channel>\n    <title>LOD Discovery RSS Feed</title>\n    <link>${BASE_URL}</link>\n    <description>Syndication feed for LOD crawling compliance testbed</description>\n    <atom:link href="${BASE_URL}/feed.rss" rel="self" type="application/rss+xml" />\n`;
  for (const page of pages.filter(p => !p.isHidden)) {
    rss += `    <item>\n      <title>${page.title}</title>\n      <link>${BASE_URL}/pages/${page.id}.html</link>\n      <guid>${BASE_URL}/pages/${page.id}.html</guid>\n      <description>Discovery test node utilizing: ${page.strategies.join(", ")}</description>\n    </item>\n`;
  }
  rss += `  </channel>\n</rss>`;
  fs.writeFileSync(path.join(DIST_DIR, "feed.rss"), rss);

  // Atom
  let atom = `<?xml version="1.0" encoding="utf-8"?>\n<feed xmlns="http://www.w3.org/2005/Atom">\n  <title>LOD Discovery Atom Feed</title>\n  <link href="${BASE_URL}/feed.atom" rel="self"/>\n  <link href="${BASE_URL}"/>\n  <updated>${new Date().toISOString()}</updated>\n  <id>${BASE_URL}/feed.atom</id>\n`;
  for (const page of pages.filter(p => !p.isHidden)) {
    atom += `  <entry>\n    <title>${page.title}</title>\n    <link href="${BASE_URL}/pages/${page.id}.html"/>\n    <id>${BASE_URL}/pages/${page.id}.html</id>\n    <updated>${new Date().toISOString()}</updated>\n    <summary>Discovery test node utilizing: ${page.strategies.join(", ")}</summary>\n  </entry>\n`;
  }
  atom += `</feed>`;
  fs.writeFileSync(path.join(DIST_DIR, "feed.atom"), atom);

  // 9. Generate Sitemap
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;
  sitemap += `  <url>\n    <loc>${BASE_URL}/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
  sitemap += `  <url>\n    <loc>${BASE_URL}/pages/matrix.html</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
  for (const page of pages) {
    sitemap += `  <url>\n    <loc>${BASE_URL}/pages/${page.id}.html</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n`;
    if (page.resourceId) {
      sitemap += `    <xhtml:link rel="describedby" href="${BASE_URL}/rdf/${page.resourceId}.ttl"/>\n`;
      sitemap += `    <xhtml:link rel="alternate" type="text/turtle" href="${BASE_URL}/rdf/${page.resourceId}.ttl"/>\n`;
      sitemap += `    <xhtml:link rel="alternate" type="application/ld+json" href="${BASE_URL}/rdf/${page.resourceId}.jsonld"/>\n`;
      sitemap += `    <xhtml:link rel="alternate" type="application/rdf+xml" href="${BASE_URL}/rdf/${page.resourceId}.rdf"/>\n`;
    }
    sitemap += `  </url>\n`;
  }
  sitemap += `</urlset>`;
  fs.writeFileSync(path.join(DIST_DIR, "sitemap.xml"), sitemap);

  // 10. Generate Robots.txt
  let robots = `# Robots.txt for LOD Testbed\nUser-agent: *\nAllow: /\n\n# Sitemap Reference (Strategy 18)\nSitemap: ${BASE_URL}/sitemap.xml\n\n# Special robots entry pointing to page-110 (Strategy 18 / Hidden Scenario 1)\nDisallow: /private/\nAllow: /pages/page-110.html\n`;
  fs.writeFileSync(path.join(DIST_DIR, "robots.txt"), robots);

  // 11. Generate Web Manifest
  const webManifest = {
    name: "LOD Discovery Testbed",
    short_name: "LOD Testbed",
    start_url: "/",
    display: "standalone",
    background_color: "#fffbe6",
    theme_color: "#354d9b",
    description: "LOD compliance testing matrix",
    related_applications: [
      {
        platform: "web",
        url: `${BASE_URL}/manifests/site.webmanifest`
      }
    ]
  };
  fs.writeFileSync(path.join(DIST_DIR, "manifests", "site.webmanifest"), JSON.stringify(webManifest, null, 2));

  // 12. Generate Well-Known Endpoints
  const lodWellKnown = {
    description: "LOD crawler landing endpoint",
    version: "1.0",
    sitemap: `${BASE_URL}/sitemap.xml`,
    resource_map: `${BASE_URL}/.well-known/resource-map.json`,
    rss: `${BASE_URL}/feed.rss`
  };
  fs.writeFileSync(path.join(DIST_DIR, ".well-known", "lod-catalog"), JSON.stringify(lodWellKnown, null, 2));

  const resourceMap: Record<string, any> = { resources: [] };
  for (const resource of RESOURCES) {
    const page = pages.find(p => p.resourceId === resource.id && !p.isHidden);
    resourceMap.resources.push({
      uri: expandUri(resource.id, BASE_URL),
      type: resource.type,
      name: resource.title,
      html_representation: page ? `${BASE_URL}/pages/${page.id}.html` : null,
      rdf_representations: [
        { type: "text/turtle", url: `${BASE_URL}/rdf/${resource.id}.ttl` },
        { type: "application/ld+json", url: `${BASE_URL}/rdf/${resource.id}.jsonld` },
        { type: "application/rdf+xml", url: `${BASE_URL}/rdf/${resource.id}.rdf` }
      ]
    });
  }
  fs.writeFileSync(path.join(DIST_DIR, ".well-known", "resource-map.json"), JSON.stringify(resourceMap, null, 2));

  // 13. Generate expected graph expected.json (Gold Standard Graph)
  const expectedGraph: ExpectedGraph = { physical: { nodes: [], edges: [] }, logical: { nodes: [], edges: [] } };

  // A. Physical Graph Nodes
  expectedGraph.physical.nodes.push({ id: `${BASE_URL}/`, type: "page", label: "Overview" });
  expectedGraph.physical.nodes.push({ id: `${BASE_URL}/pages/matrix.html`, type: "page", label: "Total Pages Test" });
  expectedGraph.physical.nodes.push({ id: `${BASE_URL}/sitemap.xml`, type: "sitemap", label: "Sitemap" });
  expectedGraph.physical.nodes.push({ id: `${BASE_URL}/feed.rss`, type: "feed", label: "RSS Feed" });
  expectedGraph.physical.nodes.push({ id: `${BASE_URL}/feed.atom`, type: "feed", label: "Atom Feed" });
  expectedGraph.physical.nodes.push({ id: `${BASE_URL}/manifests/site.webmanifest`, type: "manifest", label: "Web Manifest" });
  expectedGraph.physical.nodes.push({ id: `${BASE_URL}/.well-known/resource-map.json`, type: "resource-map", label: "Resource Map" });
  expectedGraph.physical.nodes.push({ id: `${BASE_URL}/.well-known/lod-catalog`, type: "well-known", label: "Well Known lod-catalog" });

  for (const strat of STRATEGIES_META) {
    expectedGraph.physical.nodes.push({
      id: `${BASE_URL}/channels/${strat.id.toLowerCase()}.html`,
      type: "channel-desc",
      label: `${strat.name} Channel`
    });
  }
  for (const page of pages) {
    expectedGraph.physical.nodes.push({
      id: `${BASE_URL}/pages/${page.id}.html`,
      type: "page",
      label: page.title
    });
  }
  for (const res of RESOURCES) {
    expectedGraph.physical.nodes.push({ id: `${BASE_URL}/rdf/${res.id}.ttl`, type: "rdf-turtle", label: `${res.title} (TTL)` });
    expectedGraph.physical.nodes.push({ id: `${BASE_URL}/rdf/${res.id}.jsonld`, type: "rdf-jsonld", label: `${res.title} (JSON-LD)` });
    expectedGraph.physical.nodes.push({ id: `${BASE_URL}/rdf/${res.id}.rdf`, type: "rdf-xml", label: `${res.title} (RDF/XML)` });
    expectedGraph.physical.nodes.push({ id: `${BASE_URL}/api/${res.id}`, type: "api-endpoint", label: `${res.title} (API)` });
  }

  // Physical Graph Edges
  expectedGraph.physical.edges.push({ source: `${BASE_URL}/`, target: `${BASE_URL}/pages/matrix.html`, type: "html-link" });
  expectedGraph.physical.edges.push({ source: `${BASE_URL}/robots.txt`, target: `${BASE_URL}/sitemap.xml`, type: "sitemap-ref" });
  expectedGraph.physical.edges.push({ source: `${BASE_URL}/robots.txt`, target: `${BASE_URL}/pages/page-110.html`, type: "robots-only-ref" });

  // Channel Pages links
  for (const strat of STRATEGIES_META) {
    expectedGraph.physical.edges.push({
      source: `${BASE_URL}/`,
      target: `${BASE_URL}/channels/${strat.id.toLowerCase()}.html`,
      type: "channel-link"
    });
  }

  // Matrix links to pages
  for (const page of pages) {
    expectedGraph.physical.edges.push({
      source: `${BASE_URL}/pages/matrix.html`,
      target: `${BASE_URL}/pages/${page.id}.html`,
      type: "matrix-link"
    });
  }

  // Sitemap and Feed entries
  for (const page of pages) {
    expectedGraph.physical.edges.push({ source: `${BASE_URL}/sitemap.xml`, target: `${BASE_URL}/pages/${page.id}.html`, type: "sitemap-entry" });
  }
  for (const page of pages.filter(p => !p.isHidden)) {
    expectedGraph.physical.edges.push({ source: `${BASE_URL}/feed.rss`, target: `${BASE_URL}/pages/${page.id}.html`, type: "feed-entry" });
    expectedGraph.physical.edges.push({ source: `${BASE_URL}/feed.atom`, target: `${BASE_URL}/pages/${page.id}.html`, type: "feed-entry" });
  }

  for (const page of pages) {
    const pageUrl = `${BASE_URL}/pages/${page.id}.html`;

    // HTML Links
    for (const linkId of page.linkedPages) {
      expectedGraph.physical.edges.push({
        source: pageUrl,
        target: `${BASE_URL}/pages/${linkId}.html`,
        type: "html-link"
      });
    }

    // Link headers
    if (page.strategies.includes(DiscoveryStrategy.LINK_HEADERS) && page.resourceId) {
      expectedGraph.physical.edges.push({
        source: pageUrl,
        target: `${BASE_URL}/rdf/${page.resourceId}.ttl`,
        type: "link-header"
      });
    }

    // Alternates and DescribedBy links
    if (page.resourceId) {
      if (page.strategies.includes(DiscoveryStrategy.ALTERNATE)) {
        expectedGraph.physical.edges.push({ source: pageUrl, target: `${BASE_URL}/rdf/${page.resourceId}.ttl`, type: "alternate-link" });
        expectedGraph.physical.edges.push({ source: pageUrl, target: `${BASE_URL}/rdf/${page.resourceId}.jsonld`, type: "alternate-link" });
        expectedGraph.physical.edges.push({ source: pageUrl, target: `${BASE_URL}/rdf/${page.resourceId}.rdf`, type: "alternate-link" });
      }
      if (page.strategies.includes(DiscoveryStrategy.DESCRIBED_BY_LINK)) {
        expectedGraph.physical.edges.push({ source: pageUrl, target: `${BASE_URL}/rdf/${page.resourceId}.ttl`, type: "describedby-link" });
      }
    }

    // Manifest
    if (page.strategies.includes(DiscoveryStrategy.MANIFEST)) {
      expectedGraph.physical.edges.push({ source: pageUrl, target: `${BASE_URL}/manifests/site.webmanifest`, type: "manifest-ref" });
    }
  }

  // B. Logical Graph Nodes & Edges
  for (const res of RESOURCES) {
    expectedGraph.logical.nodes.push({
      id: expandUri(res.id, BASE_URL),
      type: res.type,
      label: res.title
    });
  }
  for (const res of RESOURCES) {
    const sUri = expandUri(res.id, BASE_URL);
    for (const [pred, val] of Object.entries(res.properties)) {
      if (isRelationProperty(pred)) {
        const values = Array.isArray(val) ? val : [val];
        for (const v of values) {
          expectedGraph.logical.edges.push({
            source: sUri,
            target: expandUri(v, BASE_URL),
            type: pred
          });
        }
      }
    }
  }

  fs.writeFileSync(path.join(DIST_DIR, "graph", "expected.json"), JSON.stringify(expectedGraph, null, 2));

  // 14. Write Nginx headers config file
  fs.writeFileSync(path.join(DIST_DIR, "nginx-headers.conf"), nginxHeaders.join("\n"));

  console.log(`Testbed generation completed successfully!`);
}

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

main().catch(err => {
  console.error(`Generation failed:`, err);
  process.exit(1);
});
