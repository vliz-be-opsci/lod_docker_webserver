import fs from "fs";
import path from "path";
import { RESOURCES, getResourceById } from "./resources";
import { MarineEntity } from "./types";

export function generateMetroMapHtml(baseUrl: string): string {
  const datasets = RESOURCES.filter(r => r.category === "dataset");
  const pubs = RESOURCES.filter(r => r.category === "publication");
  const institutes = RESOURCES.filter(r => r.category === "institute");
  const people = RESOURCES.filter(r => r.category === "person");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Radical Transparency Metro Map & Protocol Topology - VLIZ Portal</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="/style.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    .map-wrapper {
      max-width: 1500px;
      margin: 1.5rem auto 3rem;
      padding: 0 1.5rem;
    }

    .map-controls-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
      background: var(--panel-bg);
      border: 1px solid var(--panel-border);
      border-radius: var(--radius-md);
      padding: 1rem 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: var(--shadow-sm);
    }

    .controls-group {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .toggle-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: var(--bg-subtle);
      border: 1px solid var(--panel-border);
      padding: 0.4rem 0.85rem;
      border-radius: 9999px;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-secondary);
      cursor: pointer;
      user-select: none;
      transition: all 0.2s ease;
    }

    .toggle-pill.active {
      background: var(--vliz-blue);
      color: #ffffff;
      border-color: var(--vliz-blue);
    }

    .toggle-pill.teal.active {
      background: var(--marine-teal);
      border-color: var(--marine-teal);
      color: #ffffff;
    }

    .toggle-pill.purple.active {
      background: #8b5cf6;
      border-color: #8b5cf6;
      color: #ffffff;
    }

    .zoom-btn {
      background: #ffffff;
      border: 1px solid var(--panel-border);
      border-radius: var(--radius-sm);
      width: 34px;
      height: 34px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-weight: bold;
      color: var(--text-primary);
      transition: background 0.2s;
    }

    .zoom-btn:hover {
      background: #f1f5f9;
    }

    .metro-canvas-container {
      position: relative;
      background: #f8fafc;
      border: 1px solid var(--panel-border);
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-md);
      min-height: 820px;
    }

    svg#metroSvg {
      width: 100%;
      height: 850px;
      cursor: grab;
      background: radial-gradient(circle, #e2e8f0 1px, transparent 1px);
      background-size: 24px 24px;
      background-color: #fafbfc;
    }

    svg#metroSvg:active {
      cursor: grabbing;
    }

    /* SVG Elements Styling */
    .track {
      fill: none;
      stroke-width: 4.5px;
      stroke-linecap: round;
      stroke-linejoin: round;
      transition: stroke-opacity 0.3s;
    }

    .track-domain { stroke: #0284c7; }
    .track-dataset { stroke: #ea580c; }
    .track-linkset { stroke: #eab308; stroke-dasharray: 6 3; }
    .track-api { stroke: #0d9488; }
    .track-institute { stroke: #8b5cf6; }
    .track-person { stroke: #10b981; }

    .track-label {
      font-family: 'Inter', sans-serif;
      font-size: 10px;
      font-weight: 700;
      fill: #475569;
      background: #ffffff;
      paint-order: stroke;
      stroke: #ffffff;
      stroke-width: 3px;
    }

    .station-node {
      cursor: pointer;
      transition: transform 0.2s, filter 0.2s;
    }

    .station-node:hover {
      filter: drop-shadow(0 0 6px rgba(15, 23, 42, 0.3));
    }

    .station-circle {
      stroke-width: 3px;
      transition: r 0.2s;
    }

    .station-node:hover .station-circle {
      r: 10px;
    }

    .station-label {
      font-family: 'Inter', sans-serif;
      font-size: 11px;
      font-weight: 600;
      fill: #1e293b;
      pointer-events: none;
      paint-order: stroke;
      stroke: #ffffff;
      stroke-width: 3px;
    }

    .station-sublabel {
      font-family: 'Inter', sans-serif;
      font-size: 9.5px;
      font-weight: 500;
      fill: #64748b;
      pointer-events: none;
      paint-order: stroke;
      stroke: #ffffff;
      stroke-width: 3px;
    }

    /* Bounding Boxes / Overlays */
    .rt-cluster {
      transition: opacity 0.3s, stroke-width 0.3s;
    }

    .rt-cluster-bg {
      rx: 16px;
      ry: 16px;
      stroke-dasharray: 8 5;
      stroke-width: 2px;
      opacity: 0.75;
    }

    .rt-cluster-header {
      font-family: 'Outfit', sans-serif;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }

    .rt-cluster-spec {
      font-family: 'Inter', sans-serif;
      font-size: 10px;
      font-weight: 600;
    }

    /* Legend Box */
    .legend-box {
      position: absolute;
      bottom: 20px;
      right: 20px;
      background: rgba(255, 255, 255, 0.94);
      backdrop-filter: blur(8px);
      border: 1px solid var(--panel-border);
      border-radius: var(--radius-md);
      padding: 1rem 1.25rem;
      box-shadow: var(--shadow-md);
      font-size: 0.8rem;
      max-width: 320px;
      z-index: 10;
    }

    .legend-title {
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 0.6rem;
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.5px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      margin-bottom: 0.4rem;
    }

    .legend-color {
      width: 22px;
      height: 4px;
      border-radius: 2px;
    }

    /* Modal / Inspector Drawer */
    .station-modal {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #ffffff;
      border-radius: var(--radius-lg);
      padding: 2rem;
      max-width: 550px;
      width: 90%;
      box-shadow: var(--shadow-lg);
      border: 1px solid var(--panel-border);
      z-index: 1000;
      display: none;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      z-index: 999;
      display: none;
    }

    .modal-close {
      position: absolute;
      top: 1.25rem;
      right: 1.25rem;
      background: none;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      color: var(--text-muted);
    }
  </style>
</head>
<body>
  <header>
    <div class="logo-container">
      <span class="logo-badge">LOD</span>
      <h1 class="site-title"><a href="/" style="color: #ffffff; text-decoration: none;">VLIZ Marine Data Portal</a></h1>
    </div>
    <nav class="nav-links">
      <a href="/">Datasets</a>
      <a href="/catalog/">DCAT Catalog</a>
      <a href="/api/docs/">Subsetting API</a>
      <a href="/publications/ro-crate-paper.html">Publications</a>
      <a href="/map.html" class="active">Metro Map</a>
      <a href="/institutes/vliz.html">Institute</a>
    </nav>
  </header>

  <div class="detail-header">
    <div class="detail-header-inner">
      <span class="hero-tag">Radical Transparency Protocol Topology</span>
      <h2 class="detail-title">🗺️ Marine Linked Data Transit & Protocol Map</h2>
      <p style="font-size: 1.05rem; color: var(--text-secondary); margin: 0.5rem 0 0; max-width: 900px;">
        Visualizing the complete web linking graph, content negotiation tracks, RFC 9264 linksets, and discovery entrypoints connecting marine research entities.
      </p>
    </div>
  </div>

  <main class="map-wrapper">
    <!-- Controls Bar -->
    <div class="map-controls-bar">
      <div class="controls-group">
        <span style="font-weight: 700; font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase;">Overlays & Specs:</span>
        <div class="toggle-pill active teal" id="toggleClusters" onclick="toggleOverlays()">
          <i class="fa-solid fa-layer-group"></i> RT Principles & Bounding Boxes
        </div>
        <div class="toggle-pill active" id="toggleLabels" onclick="toggleRelationLabels()">
          <i class="fa-solid fa-tag"></i> Relation Labels (rel=)
        </div>
      </div>

      <div class="controls-group">
        <span style="font-weight: 700; font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase;">Filter Lines:</span>
        <div class="toggle-pill active" id="btnFilterAll" onclick="filterTrack('all')">All Lines</div>
        <div class="toggle-pill" id="btnFilterDomain" onclick="filterTrack('domain')">🔵 Domain/Crawl</div>
        <div class="toggle-pill" id="btnFilterDatasets" onclick="filterTrack('dataset')">🟠 Datasets</div>
        <div class="toggle-pill" id="btnFilterLinksets" onclick="filterTrack('linkset')">🟡 Linksets</div>
      </div>

      <div class="controls-group">
        <button class="zoom-btn" onclick="zoomIn()" title="Zoom In"><i class="fa-solid fa-plus"></i></button>
        <button class="zoom-btn" onclick="zoomOut()" title="Zoom Out"><i class="fa-solid fa-minus"></i></button>
        <button class="zoom-btn" onclick="resetZoom()" title="Reset View"><i class="fa-solid fa-arrows-rotate"></i></button>
      </div>
    </div>

    <!-- Metro Canvas -->
    <div class="metro-canvas-container">
      <svg id="metroSvg" viewBox="0 0 1420 840">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 8 5 L 0 9 z" fill="#64748b" />
          </marker>
        </defs>

        <g id="viewport">
          <!-- ========================================== -->
          <!-- 1. RADICAL TRANSPARENCY BOUNDING BOXES     -->
          <!-- ========================================== -->
          <g id="clusterGroup" class="rt-cluster">
            <!-- Cluster 1: Domain Discovery & Sitemap Bootstrap -->
            <g class="cluster-domain">
              <rect class="rt-cluster-bg" x="30" y="30" width="370" height="760" fill="#f0f9ff" stroke="#0284c7" />
              <text class="rt-cluster-header" x="50" y="65" fill="#0369a1">🌐 1. DOMAIN DISCOVERY BOOTSTRAP</text>
              <text class="rt-cluster-spec" x="50" y="85" fill="#0284c7">RFC 9727 • Robots.txt • Sitemap (rs:ln & xhtml:link) • DCAT-3</text>
            </g>

            <!-- Cluster 2: Persistent URIs & Content Negotiation -->
            <g class="cluster-conneg">
              <rect class="rt-cluster-bg" x="425" y="30" width="460" height="760" fill="#fff7ed" stroke="#ea580c" />
              <text class="rt-cluster-header" x="445" y="65" fill="#c2410c">🎯 2. PERSISTENT URI & CONNEG 303</text>
              <text class="rt-cluster-spec" x="445" y="85" fill="#ea580c">RFC 9110 (303 See Other) • RFC 8288 Link Headers • Schema.org Profiles</text>
            </g>

            <!-- Cluster 3: Decoupled Standalone Linksets -->
            <g class="cluster-linksets">
              <rect class="rt-cluster-bg" x="910" y="30" width="480" height="370" fill="#fefce8" stroke="#ca8a04" />
              <text class="rt-cluster-header" x="930" y="65" fill="#a16207">🔗 3. DECOUPLED STANDALONE LINKSETS</text>
              <text class="rt-cluster-spec" x="930" y="85" fill="#ca8a04">RFC 9264 (application/linkset+json) • LSUP Graph Linkage</text>
            </g>

            <!-- Cluster 4: FAIR Data Payloads & OpenAPI -->
            <g class="cluster-payloads">
              <rect class="rt-cluster-bg" x="910" y="420" width="480" height="370" fill="#f0fdf4" stroke="#16a34a" />
              <text class="rt-cluster-header" x="930" y="455" fill="#15803d">📥 4. ACTIONABLE DATA & SUBSETTING API</text>
              <text class="rt-cluster-spec" x="930" y="475" fill="#16a34a">CSV • GeoJSON • RO-Crate ZIP • DwC-A • OpenAPI 3.0 / Swagger UI</text>
            </g>
          </g>

          <!-- ========================================== -->
          <!-- 2. TRANSIT TRACKS (LINES)                  -->
          <!-- ========================================== -->
          <g id="tracksGroup">
            <!-- Domain Backbone Track (Blue) -->
            <path class="track track-domain" d="M 120 140 L 120 230 L 120 330 L 120 450 L 120 580 L 120 700" />
            
            <!-- Domain to Resources Trunk Lines -->
            <path class="track track-domain" d="M 120 230 L 220 230 L 520 230" />
            <path class="track track-domain" d="M 120 330 L 220 330 L 220 500 L 520 500" />
            <path class="track track-domain" d="M 120 450 L 260 450 L 260 620 L 520 620" />
            <path class="track track-domain" d="M 120 580 L 280 580 L 280 720 L 520 720" />

            <!-- DCAT to Catalog -->
            <path class="track track-domain" d="M 120 700 L 280 700" />

            <!-- Dataset 1 Branches (ARMS-MBON: Orange) -->
            <!-- Conneg splits from /resource/resource-arms-mbon -->
            <path class="track track-dataset" d="M 520 230 L 680 170" /> <!-- to HTML -->
            <path class="track track-dataset" d="M 520 230 L 680 230" /> <!-- to TTL -->
            <path class="track track-dataset" d="M 520 230 L 680 290" /> <!-- to JSON-LD -->
            
            <!-- ARMS-MBON Links to Linkset & Distributions -->
            <path class="track track-linkset" d="M 680 170 L 980 140" />
            <path class="track track-dataset" d="M 680 170 L 800 170 L 980 520" /> <!-- to CSV -->
            <path class="track track-dataset" d="M 680 170 L 800 170 L 980 570" /> <!-- to GeoJSON -->
            <path class="track track-dataset" d="M 680 170 L 800 170 L 980 620" /> <!-- to RO-Crate -->

            <!-- Dataset 2 Branches (ARMS-2018) -->
            <path class="track track-dataset" d="M 520 370 L 680 370" />
            <path class="track track-linkset" d="M 680 370 L 980 200" />
            <path class="track track-dataset" d="M 680 370 L 820 370 L 980 670" /> <!-- to 2018 CSV -->

            <!-- Dataset 3 Branches (North Sea Sensors) -->
            <path class="track track-dataset" d="M 520 500 L 680 500" />
            <path class="track track-linkset" d="M 680 500 L 980 260" />
            <path class="track track-dataset" d="M 680 500 L 840 500 L 980 720" /> <!-- to Telemetry CSV -->

            <!-- Organization & Publication Trunk (Purple / Green) -->
            <path class="track track-institute" d="M 520 620 L 680 620" />
            <path class="track track-linkset" d="M 680 620 L 980 320" />

            <path class="track track-person" d="M 520 720 L 680 720" />
            <path class="track track-linkset" d="M 680 720 L 980 360" />

            <!-- API Trunk (Teal) -->
            <path class="track track-api" d="M 280 450 L 980 770" />
          </g>

          <!-- ========================================== -->
          <!-- 3. RELATION LABELS (rel=)                  -->
          <!-- ========================================== -->
          <g id="relationLabelsGroup">
            <text class="track-label" x="125" y="185">Sitemap:</text>
            <text class="track-label" x="125" y="280">\\url/loc</text>
            <text class="track-label" x="125" y="390">\\rs:ln (api)</text>
            <text class="track-label" x="125" y="515">\\rs:ln (dcat)</text>
            
            <text class="track-label" x="550" y="195">303 (Accept: text/html)</text>
            <text class="track-label" x="550" y="245">303 (Accept: text/turtle)</text>
            <text class="track-label" x="550" y="285">303 (Accept: ld+json)</text>

            <text class="track-label" x="780" y="145">rel="linkset"</text>
            <text class="track-label" x="780" y="275">rel="linkset"</text>
            <text class="track-label" x="780" y="525">rel="item" (CSV)</text>
            <text class="track-label" x="780" y="575">rel="item" (GeoJSON)</text>
            <text class="track-label" x="780" y="625">rel="item" (RO-Crate)</text>
            <text class="track-label" x="780" y="775">rel="service-desc"</text>
          </g>

          <!-- ========================================== -->
          <!-- 4. STATIONS / NODES                        -->
          <!-- ========================================== -->
          <g id="stationsGroup">
            <!-- Domain Root Station -->
            <g class="station-node" onclick="openStationModal('Domain Root', '/', 'Primary domain entrypoint. Injects Link: &lt;/.well-known/api-catalog&gt;; rel=\&quot;api-catalog\&quot; headers.', 'http://localhost:8080/')">
              <circle class="station-circle" cx="120" cy="140" r="8" fill="#ffffff" stroke="#0284c7" stroke-width="4" />
              <text class="station-label" x="135" y="144">/ (Domain Root)</text>
              <text class="station-sublabel" x="135" y="157">RFC 8288 Header Bootstrap</text>
            </g>

            <!-- Robots.txt Station -->
            <g class="station-node" onclick="openStationModal('Robots.txt', '/robots.txt', 'Directs search engine harvesters to the Radical Transparency sitemap.xml.', 'http://localhost:8080/robots.txt')">
              <circle class="station-circle" cx="120" cy="230" r="7" fill="#ffffff" stroke="#0284c7" stroke-width="3" />
              <text class="station-label" x="135" y="234">/robots.txt</text>
            </g>

            <!-- Sitemap.xml Station -->
            <g class="station-node" onclick="openStationModal('Sitemap.xml (Signmap)', '/sitemap.xml', 'XML sitemap enhanced with ResourceSync rs:ln and xhtml:link attributes pointing to profiles, linksets, and DCAT catalog.', 'http://localhost:8080/sitemap.xml')">
              <circle class="station-circle" cx="120" cy="330" r="8" fill="#0284c7" stroke="#ffffff" stroke-width="2" />
              <text class="station-label" x="135" y="334">/sitemap.xml</text>
              <text class="station-sublabel" x="135" y="347">rs:ln & xhtml:link Signmap</text>
            </g>

            <!-- API Catalog Station -->
            <g class="station-node" onclick="openStationModal('RFC 9727 API Catalog', '/.well-known/api-catalog', 'Standardized API catalog link relation discovery document.', 'http://localhost:8080/.well-known/api-catalog')">
              <circle class="station-circle" cx="120" cy="450" r="7" fill="#0d9488" stroke="#ffffff" stroke-width="2" />
              <text class="station-label" x="135" y="454">/.well-known/api-catalog</text>
              <text class="station-sublabel" x="135" y="467">RFC 9727 Discovery</text>
            </g>

            <!-- DCAT Catalog Station -->
            <g class="station-node" onclick="openStationModal('DCAT-3 Catalogue', '/catalog/dcat.ttl', 'Standard W3C DCAT-AP v2 / DCAT-3 dataset catalogue in Turtle serialization.', 'http://localhost:8080/catalog/dcat.ttl')">
              <circle class="station-circle" cx="120" cy="580" r="7" fill="#0284c7" stroke="#ffffff" stroke-width="2" />
              <text class="station-label" x="135" y="584">/catalog/dcat.ttl</text>
              <text class="station-sublabel" x="135" y="597">DCAT-3 Catalogue</text>
            </g>

            <!-- Persistent URI Stations (Center Column) -->
            <!-- ARMS-MBON URI -->
            <g class="station-node" onclick="openStationModal('ARMS-MBON Persistent URI', '/resource/resource-arms-mbon', 'Persistent URI returning HTTP 303 See Other conneg redirects to HTML, Turtle, JSON-LD, or RDF/XML.', 'http://localhost:8080/resource/resource-arms-mbon')">
              <circle class="station-circle" cx="520" cy="230" r="9" fill="#ea580c" stroke="#ffffff" stroke-width="3" />
              <text class="station-label" x="535" y="225">/resource/resource-arms-mbon</text>
              <text class="station-sublabel" x="535" y="238">PID (Conneg 303 Hub)</text>
            </g>

            <!-- ARMS-MBON HTML Landing Page -->
            <g class="station-node" onclick="openStationModal('ARMS-MBON Landing Page', '/datasets/arms-mbon.html', 'Human-friendly HTML page with live sample table and RFC 8288 link headers.', 'http://localhost:8080/datasets/arms-mbon.html')">
              <circle class="station-circle" cx="680" cy="170" r="8" fill="#ffffff" stroke="#ea580c" stroke-width="4" />
              <text class="station-label" x="695" y="165">/datasets/arms-mbon.html</text>
              <text class="station-sublabel" x="695" y="178">HTML Landing Page</text>
            </g>

            <!-- ARMS-MBON Turtle RDF -->
            <g class="station-node" onclick="openStationModal('ARMS-MBON Turtle RDF', '/rdf/resource-arms-mbon.ttl', 'Direct W3C Turtle RDF graph of the dataset and its distributions.', 'http://localhost:8080/rdf/resource-arms-mbon.ttl')">
              <circle class="station-circle" cx="680" cy="230" r="6" fill="#ea580c" stroke="#ffffff" stroke-width="2" />
              <text class="station-label" x="695" y="234">/rdf/resource-arms-mbon.ttl</text>
            </g>

            <!-- ARMS-MBON JSON-LD -->
            <g class="station-node" onclick="openStationModal('ARMS-MBON JSON-LD', '/rdf/resource-arms-mbon.jsonld', 'Compacted JSON-LD representation with Schema.org and DCAT context.', 'http://localhost:8080/rdf/resource-arms-mbon.jsonld')">
              <circle class="station-circle" cx="680" cy="290" r="6" fill="#ea580c" stroke="#ffffff" stroke-width="2" />
              <text class="station-label" x="695" y="294">/rdf/resource-arms-mbon.jsonld</text>
            </g>

            <!-- ARMS-2018 Station -->
            <g class="station-node" onclick="openStationModal('ARMS-2018 Ecological Baseline', '/datasets/arms-2018.html', 'Morphological community biomass dataset from European ARMS observatories.', 'http://localhost:8080/datasets/arms-2018.html')">
              <circle class="station-circle" cx="680" cy="370" r="8" fill="#ffffff" stroke="#ea580c" stroke-width="4" />
              <text class="station-label" x="695" y="374">/datasets/arms-2018.html</text>
            </g>

            <!-- North Sea Sensors Station -->
            <g class="station-node" onclick="openStationModal('North Sea Sensor Series', '/datasets/north-sea-sensors.html', 'High-frequency buoy telemetry time-series dataset.', 'http://localhost:8080/datasets/north-sea-sensors.html')">
              <circle class="station-circle" cx="680" cy="500" r="8" fill="#ffffff" stroke="#ea580c" stroke-width="4" />
              <text class="station-label" x="695" y="504">/datasets/north-sea-sensors.html</text>
            </g>

            <!-- VLIZ Institute Station -->
            <g class="station-node" onclick="openStationModal('Flanders Marine Institute', '/institutes/vliz.html', 'Research institute organization profile (ROR: 0496xx721).', 'http://localhost:8080/institutes/vliz.html')">
              <circle class="station-circle" cx="680" cy="620" r="8" fill="#8b5cf6" stroke="#ffffff" stroke-width="2" />
              <text class="station-label" x="695" y="624">/institutes/vliz.html</text>
              <text class="station-sublabel" x="695" y="637">schema:Organization</text>
            </g>

            <!-- RT Position Paper Station -->
            <g class="station-node" onclick="openStationModal('Radical Transparency Position Paper', '/publications/ro-crate-paper.html', 'Scientific publication and position paper defining Radical Transparency.', 'https://open-science.vliz.be/papers/2026-radical-transparency-position/2026-radical-transparency-position.pdf')">
              <circle class="station-circle" cx="680" cy="720" r="8" fill="#10b981" stroke="#ffffff" stroke-width="2" />
              <text class="station-label" x="695" y="724">/publications/ro-crate-paper.html</text>
              <text class="station-sublabel" x="695" y="737">schema:ScholarlyArticle</text>
            </g>

            <!-- Standalone Linkset Stations (Top Right Column) -->
            <g class="station-node" onclick="openStationModal('ARMS-MBON Linkset', '/linksets/resource-arms-mbon.linkset.json', 'RFC 9264 JSON Linkset containing all typed relationships for dataset 8617.', 'http://localhost:8080/linksets/resource-arms-mbon.linkset.json')">
              <circle class="station-circle" cx="980" cy="140" r="7" fill="#eab308" stroke="#ffffff" stroke-width="2" />
              <text class="station-label" x="995" y="144">/linksets/resource-arms-mbon.linkset.json</text>
              <text class="station-sublabel" x="995" y="157">RFC 9264 Linkset</text>
            </g>

            <g class="station-node" onclick="openStationModal('ARMS-2018 Linkset', '/linksets/resource-arms-2018.linkset.json', 'RFC 9264 JSON Linkset for dataset 6405.', 'http://localhost:8080/linksets/resource-arms-2018.linkset.json')">
              <circle class="station-circle" cx="980" cy="200" r="7" fill="#eab308" stroke="#ffffff" stroke-width="2" />
              <text class="station-label" x="995" y="204">/linksets/resource-arms-2018.linkset.json</text>
            </g>

            <g class="station-node" onclick="openStationModal('North Sea Sensor Linkset', '/linksets/resource-north-sea-sensors.linkset.json', 'RFC 9264 JSON Linkset for sensor telemetry.', 'http://localhost:8080/linksets/resource-north-sea-sensors.linkset.json')">
              <circle class="station-circle" cx="980" cy="260" r="7" fill="#eab308" stroke="#ffffff" stroke-width="2" />
              <text class="station-label" x="995" y="264">/linksets/resource-north-sea-sensors.linkset.json</text>
            </g>

            <g class="station-node" onclick="openStationModal('VLIZ Institute Linkset', '/linksets/resource-vliz.linkset.json', 'RFC 9264 JSON Linkset linking institute to datasets and researchers.', 'http://localhost:8080/linksets/resource-vliz.linkset.json')">
              <circle class="station-circle" cx="980" cy="320" r="7" fill="#eab308" stroke="#ffffff" stroke-width="2" />
              <text class="station-label" x="995" y="324">/linksets/resource-vliz.linkset.json</text>
            </g>

            <!-- Physical Data Payload Stations (Bottom Right Column) -->
            <g class="station-node" onclick="openStationModal('18S Metabarcoding CSV', '/data/arms-mbon-18s.csv', 'Physical CSV file containing taxon observations and read counts.', 'http://localhost:8080/data/arms-mbon-18s.csv')">
              <circle class="station-circle" cx="980" cy="520" r="7" fill="#16a34a" stroke="#ffffff" stroke-width="2" />
              <text class="station-label" x="995" y="524">/data/arms-mbon-18s.csv (text/csv)</text>
              <text class="station-sublabel" x="995" y="537">rel="item" Distribution</text>
            </g>

            <g class="station-node" onclick="openStationModal('Reef Stations GeoJSON', '/data/arms-mbon-stations.geojson', 'Physical GeoJSON file with deployment reef coordinates.', 'http://localhost:8080/data/arms-mbon-stations.geojson')">
              <circle class="station-circle" cx="980" cy="570" r="7" fill="#16a34a" stroke="#ffffff" stroke-width="2" />
              <text class="station-label" x="995" y="574">/data/arms-mbon-stations.geojson (geo+json)</text>
            </g>

            <g class="station-node" onclick="openStationModal('RO-Crate Package ZIP', '/data/arms-mbon-rocrate.zip', 'Standardized Research Object Crate ZIP archive with ro-crate-metadata.json.', 'http://localhost:8080/data/arms-mbon-rocrate.zip')">
              <circle class="station-circle" cx="980" cy="620" r="7" fill="#16a34a" stroke="#ffffff" stroke-width="2" />
              <text class="station-label" x="995" y="624">/data/arms-mbon-rocrate.zip (application/zip)</text>
            </g>

            <g class="station-node" onclick="openStationModal('ARMS 2018 Biomass CSV', '/data/arms-2018-samples.csv', 'Physical CSV matrix with dry weight fractions.', 'http://localhost:8080/data/arms-2018-samples.csv')">
              <circle class="station-circle" cx="980" cy="670" r="7" fill="#16a34a" stroke="#ffffff" stroke-width="2" />
              <text class="station-label" x="995" y="674">/data/arms-2018-samples.csv</text>
            </g>

            <g class="station-node" onclick="openStationModal('Sensor Telemetry JSON Feed', '/data/north-sea-sensors-stream.json', 'Live sensor telemetry feed in JSON format.', 'http://localhost:8080/data/north-sea-sensors-stream.json')">
              <circle class="station-circle" cx="980" cy="720" r="7" fill="#16a34a" stroke="#ffffff" stroke-width="2" />
              <text class="station-label" x="995" y="724">/data/north-sea-sensors-stream.json</text>
            </g>

            <!-- OpenAPI Subsetting API Station -->
            <g class="station-node" onclick="openStationModal('OpenAPI 3.0 & Swagger UI', '/api/docs/', 'Interactive Swagger UI explorer querying observations via /api/v1/observations.', 'http://localhost:8080/api/docs/')">
              <circle class="station-circle" cx="980" cy="770" r="8" fill="#0d9488" stroke="#ffffff" stroke-width="3" />
              <text class="station-label" x="995" y="774">/api/docs/ (Swagger UI)</text>
              <text class="station-sublabel" x="995" y="787">OpenAPI 3.0 Subsetting API</text>
            </g>
          </g>
        </g>
      </svg>

      <!-- Legend -->
      <div class="legend-box">
        <div class="legend-title">Metro Lines & Link Types</div>
        <div class="legend-item">
          <div class="legend-color track-domain"></div>
          <span><strong>Domain & Crawl Line</strong> (RFC 9727 / Sitemap)</span>
        </div>
        <div class="legend-item">
          <div class="legend-color track-dataset"></div>
          <span><strong>Datasets & Conneg</strong> (RFC 9110 / 303)</span>
        </div>
        <div class="legend-item">
          <div class="legend-color track-linkset" style="border-top: 2px dashed #ca8a04; height: 0;"></div>
          <span><strong>RFC 9264 Linkset Track</strong> (application/linkset+json)</span>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background: #16a34a;"></div>
          <span><strong>Data Payloads</strong> (CSV, GeoJSON, RO-Crate)</span>
        </div>
        <div class="legend-item">
          <div class="legend-color track-api"></div>
          <span><strong>Subsetting API</strong> (OpenAPI 3.0)</span>
        </div>
      </div>
    </div>
  </main>

  <!-- Station Inspector Modal -->
  <div class="modal-overlay" id="modalOverlay" onclick="closeStationModal()"></div>
  <div class="station-modal" id="stationModal">
    <button class="modal-close" onclick="closeStationModal()">&times;</button>
    <div style="font-size: 0.8rem; font-weight: 700; color: var(--marine-teal); text-transform: uppercase; margin-bottom: 0.35rem;" id="modalBadge">STATION NODE</div>
    <h3 style="font-family: 'Outfit', sans-serif; font-size: 1.4rem; margin: 0 0 0.5rem; color: var(--text-primary);" id="modalTitle">Station Name</h3>
    <p style="font-size: 0.85rem; font-family: monospace; background: var(--bg-subtle); padding: 0.4rem 0.6rem; border-radius: var(--radius-sm); color: var(--vliz-blue);" id="modalPath">/path</p>
    <p style="font-size: 0.95rem; line-height: 1.6; color: var(--text-secondary); margin: 1rem 0 1.5rem;" id="modalDesc">Description text goes here.</p>
    <div style="display: flex; gap: 0.75rem;">
      <a href="#" id="modalActionBtn" target="_blank" class="btn-download" style="flex: 1; padding: 0.6rem 1rem;">Open Live Resource &rarr;</a>
    </div>
  </div>

  <footer>
    <div class="footer-container">
      <div>
        <strong>VLIZ Marine Linked Data Portal</strong> — Reference Implementation of <em>Radical Transparency</em> (RFC 8288, RFC 9264, RFC 9727).
      </div>
      <div class="footer-links">
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
  </footer>

  <script>
    let currentZoom = 1;
    let panX = 0;
    let panY = 0;
    let isDragging = false;
    let startX, startY;
    let showOverlays = true;
    let showLabels = true;

    const viewport = document.getElementById('viewport');
    const svg = document.getElementById('metroSvg');

    function updateTransform() {
      viewport.setAttribute('transform', \`translate(\${panX}, \${panY}) scale(\${currentZoom})\`);
    }

    function zoomIn() {
      currentZoom = Math.min(currentZoom * 1.2, 3);
      updateTransform();
    }

    function zoomOut() {
      currentZoom = Math.max(currentZoom / 1.2, 0.5);
      updateTransform();
    }

    function resetZoom() {
      currentZoom = 1;
      panX = 0;
      panY = 0;
      updateTransform();
    }

    svg.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX - panX;
      startY = e.clientY - panY;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      panX = e.clientX - startX;
      panY = e.clientY - startY;
      updateTransform();
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    function toggleOverlays() {
      showOverlays = !showOverlays;
      const group = document.getElementById('clusterGroup');
      const pill = document.getElementById('toggleClusters');
      group.style.display = showOverlays ? 'inline' : 'none';
      pill.classList.toggle('active', showOverlays);
    }

    function toggleRelationLabels() {
      showLabels = !showLabels;
      const group = document.getElementById('relationLabelsGroup');
      const pill = document.getElementById('toggleLabels');
      group.style.display = showLabels ? 'inline' : 'none';
      pill.classList.toggle('active', showLabels);
    }

    function filterTrack(trackType) {
      document.querySelectorAll('.map-controls-bar .toggle-pill').forEach(el => {
        if (el.id.startsWith('btnFilter')) el.classList.remove('active');
      });

      const tracks = document.querySelectorAll('.track');
      if (trackType === 'all') {
        document.getElementById('btnFilterAll').classList.add('active');
        tracks.forEach(t => t.style.opacity = '1');
      } else {
        if (trackType === 'domain') document.getElementById('btnFilterDomain').classList.add('active');
        if (trackType === 'dataset') document.getElementById('btnFilterDatasets').classList.add('active');
        if (trackType === 'linkset') document.getElementById('btnFilterLinksets').classList.add('active');

        tracks.forEach(t => {
          if (t.classList.contains(\`track-\${trackType}\`)) {
            t.style.opacity = '1';
            t.style.strokeWidth = '6px';
          } else {
            t.style.opacity = '0.15';
            t.style.strokeWidth = '4px';
          }
        });
      }
    }

    function openStationModal(title, path, desc, liveUrl) {
      document.getElementById('modalTitle').textContent = title;
      document.getElementById('modalPath').textContent = path;
      document.getElementById('modalDesc').textContent = desc;
      document.getElementById('modalActionBtn').href = liveUrl;
      document.getElementById('modalOverlay').style.display = 'block';
      document.getElementById('stationModal').style.display = 'block';
    }

    function closeStationModal() {
      document.getElementById('modalOverlay').style.display = 'none';
      document.getElementById('stationModal').style.display = 'none';
    }
  </script>
</body>
</html>`;
}
