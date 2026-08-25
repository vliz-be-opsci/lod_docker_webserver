import { MetroGraph } from "../models/MetroGraph";
import { PatternBoundingBox, CorridorBoundingBox } from "../engine/OctilinearLayoutEngine";
import { SvgRenderer } from "./SvgRenderer";
import { renderHeader, renderFooter } from "../../htmlTemplates";

export class HtmlPageRenderer {
  private svgRenderer = new SvgRenderer();

  public renderPage(
    graph: MetroGraph,
    bounds: PatternBoundingBox[],
    corridors: CorridorBoundingBox[] = [],
    baseUrl: string = "http://localhost:8080"
  ): string {
    const svgContent = this.svgRenderer.renderSvg(graph, bounds, corridors, 1680, 1520);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Radical Transparency 4-Corridor Metro Transit Map - VLIZ Portal</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="/style.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    .map-wrapper { max-width: 1680px; margin: 1.5rem auto 3rem; padding: 0 1.5rem; }
    .map-controls-bar { display: flex; flex-direction: column; gap: 1rem; background: var(--panel-bg); border: 1px solid var(--panel-border); border-radius: var(--radius-md); padding: 1.25rem 1.5rem; margin-bottom: 1.25rem; box-shadow: var(--shadow-sm); }
    .controls-row { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
    .controls-group { display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; }
    
    /* Search & Spotlight Input */
    .uri-input-bar { display: flex; align-items: center; gap: 0.5rem; flex: 1; min-width: 340px; background: var(--bg-subtle); padding: 0.4rem 0.8rem; border-radius: var(--radius-sm); border: 1px solid var(--panel-border); position: relative; }
    .uri-input-bar input { flex: 1; background: transparent; border: none; outline: none; font-family: monospace; font-size: 0.88rem; color: var(--text-primary); }
    
    /* Simulator Controls in Toolbar */
    .simulator-toolbar { display: flex; align-items: center; gap: 0.6rem; background: #0f172a; color: #ffffff; padding: 0.5rem 1rem; border-radius: var(--radius-sm); font-size: 0.82rem; }
    .sim-btn { background: #334155; color: #f8fafc; border: 1px solid #475569; border-radius: 4px; padding: 0.3rem 0.7rem; font-size: 0.8rem; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 0.35rem; transition: all 0.2s; }
    .sim-btn:hover { background: var(--marine-teal); color: #ffffff; border-color: var(--marine-teal); }
    .sim-btn.active { background: #059669; border-color: #10b981; }

    .toggle-pill { display: inline-flex; align-items: center; gap: 0.35rem; background: var(--bg-subtle); border: 1px solid var(--panel-border); padding: 0.3rem 0.65rem; border-radius: 9999px; font-size: 0.78rem; font-weight: 600; color: var(--text-secondary); cursor: pointer; user-select: none; transition: all 0.2s ease; }
    .toggle-pill.active { background: var(--vliz-blue); color: #ffffff; border-color: var(--vliz-blue); }
    .toggle-pill.teal.active { background: var(--marine-teal); border-color: var(--marine-teal); color: #ffffff; }
    .toggle-pill.layer-1.active { background: #0284c7; border-color: #0284c7; color: #ffffff; }
    .toggle-pill.layer-2.active { background: #ea580c; border-color: #ea580c; color: #ffffff; }
    .toggle-pill.layer-3.active { background: #6366f1; border-color: #6366f1; color: #ffffff; }
    .toggle-pill.layer-4.active { background: #16a34a; border-color: #16a34a; color: #ffffff; }

    /* Focus Status Banner */
    .focus-status-banner {
      display: none;
      align-items: center;
      justify-content: space-between;
      background: #eff6ff;
      border: 1.5px solid #60a5fa;
      border-radius: var(--radius-sm);
      padding: 0.6rem 1rem;
      margin-bottom: 1rem;
      font-size: 0.85rem;
      color: #1e3a8a;
      animation: fadeIn 0.3s ease;
    }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }

    /* Interactive Canvas Container */
    .metro-canvas-container {
      position: relative;
      background: #f8fafc;
      border: 2px solid var(--panel-border);
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-md);
      min-height: 860px;
      outline: none;
      transition: border-color 0.25s ease, box-shadow 0.25s ease;
    }
    .metro-canvas-container:focus,
    .metro-canvas-container:focus-within,
    .metro-canvas-container:hover {
      border-color: var(--marine-teal);
      box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.2), var(--shadow-lg);
    }
    
    .canvas-hint-pill {
      position: absolute;
      top: 14px;
      right: 14px;
      background: rgba(255, 255, 255, 0.94);
      backdrop-filter: blur(8px);
      border: 1px solid var(--panel-border);
      border-radius: 9999px;
      padding: 0.35rem 0.85rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-secondary);
      pointer-events: none;
      z-index: 10;
      box-shadow: var(--shadow-sm);
      display: flex;
      align-items: center;
      gap: 0.45rem;
    }

    svg#metroSvg {
      width: 100%;
      height: 880px;
      cursor: grab;
      background: radial-gradient(circle, #e2e8f0 1px, transparent 1px);
      background-size: 24px 24px;
      background-color: #fafbfc;
      user-select: none;
    }
    svg#metroSvg:active { cursor: grabbing; }
    
    /* Corridor Swimlanes */
    .corridor-swimlane { transition: opacity 0.35s ease; }
    .corridor-bg { transition: fill 0.3s, stroke 0.3s; }
    
    /* Tracks & Animation */
    .track { fill: none; stroke-width: 4.5px; stroke-linecap: round; stroke-linejoin: round; transition: opacity 0.35s ease, stroke-width 0.2s, stroke 0.3s; cursor: pointer; }
    .track:hover { stroke-width: 7.5px; filter: drop-shadow(0 0 6px rgba(13, 148, 136, 0.6)); }
    .track-domain { stroke: #0284c7; }
    .track-dataset { stroke: #ea580c; }
    .track-profile { stroke: #6366f1; }
    .track-linkset { stroke: #eab308; }
    .track-distribution { stroke: #16a34a; }
    .track-api { stroke: #0d9488; }
    .track-institute { stroke: #8b5cf6; }
    .track-person { stroke: #10b981; }

    @keyframes trackPulseFlow {
      0% { stroke-dashoffset: 24; }
      100% { stroke-dashoffset: 0; }
    }
    .track-simulating {
      stroke: #10b981 !important;
      stroke-width: 7.5px !important;
      stroke-dasharray: 8 4 !important;
      animation: trackPulseFlow 0.8s linear infinite;
      opacity: 1 !important;
    }

    .station-node { cursor: pointer; transition: opacity 0.35s ease, transform 0.2s; }
    .station-node:hover circle { r: 10.5px; filter: drop-shadow(0 0 6px rgba(15, 23, 42, 0.4)); }
    
    /* Dedicated Crawler Table Under Canvas */
    .crawler-sim-section {
      margin-top: 1.75rem;
      background: var(--panel-bg);
      border: 1px solid var(--panel-border);
      border-radius: var(--radius-lg);
      padding: 1.75rem;
      box-shadow: var(--shadow-sm);
    }
    .sim-table-row { cursor: pointer; transition: background 0.2s; }
    .sim-table-row:hover { background: #f1f5f9; }
    .sim-table-row.active-step { background: #ecfdf5 !important; border-left: 4px solid #10b981; }
    .sim-table-row.active-step td { font-weight: 600; color: #065f46; }

    /* Modals & Drawers */
    .station-modal { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #ffffff; border-radius: var(--radius-lg); padding: 2rem; max-width: 640px; width: 92%; box-shadow: var(--shadow-lg); border: 1px solid var(--panel-border); z-index: 1000; display: none; max-height: 85vh; overflow-y: auto; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); z-index: 999; display: none; }
    .modal-close { position: absolute; top: 1.25rem; right: 1.25rem; background: none; border: none; font-size: 1.25rem; cursor: pointer; color: var(--text-muted); }
    .modal-section { margin-bottom: 1.25rem; }
    .modal-section-title { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.5px; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.4rem; }
    .spec-badge-link { display: inline-flex; align-items: center; gap: 0.35rem; background: #f1f5f9; color: var(--vliz-blue); text-decoration: none; padding: 0.3rem 0.6rem; border-radius: var(--radius-sm); font-size: 0.8rem; font-weight: 600; border: 1px solid #cbd5e1; transition: all 0.2s; margin-right: 0.4rem; margin-bottom: 0.4rem; }
    .spec-badge-link:hover { background: var(--vliz-blue); color: #ffffff; border-color: var(--vliz-blue); }
    .pattern-card-link { display: flex; align-items: center; justify-content: space-between; background: var(--bg-subtle); border: 1px solid var(--panel-border); padding: 0.6rem 0.8rem; border-radius: var(--radius-sm); text-decoration: none; color: var(--text-primary); margin-bottom: 0.5rem; transition: all 0.2s; }
    .pattern-card-link:hover { border-color: var(--marine-teal); background: #f0fdfa; transform: translateX(2px); }

    /* Track Link Inspector Drawer */
    .track-drawer { position: fixed; bottom: 20px; right: 20px; background: #ffffff; border-radius: var(--radius-md); padding: 1.25rem; max-width: 480px; width: 90%; box-shadow: var(--shadow-lg); border: 1px solid var(--panel-border); z-index: 1000; display: none; }
    .curl-box { background: #0f172a; color: #38bdf8; padding: 0.5rem 0.75rem; border-radius: 4px; font-family: monospace; font-size: 0.75rem; overflow-x: auto; margin-top: 0.4rem; position: relative; }
    .copy-btn { position: absolute; right: 6px; top: 6px; background: #334155; color: #ffffff; border: none; border-radius: 3px; font-size: 0.7rem; padding: 2px 6px; cursor: pointer; }
    .copy-btn:hover { background: var(--marine-teal); }
  </style>
</head>
<body>
  ${renderHeader('map')}

  <div class="detail-header">
    <div class="detail-header-inner">
      <span class="hero-tag">Radical Transparency 4-Corridor Protocol Topology</span>
      <h2 class="detail-title">🗺️ Marine Linked Data Dynamic Discovery Map</h2>
      <p style="font-size: 1.05rem; color: var(--text-secondary); margin: 0.5rem 0 0; max-width: 960px;">
        Object-Oriented Linked Open Data transit network partitioned into 4 distinct architectural corridors (Discovery, Conneg, Profiles, Data & Sidecars). Simulates RFC 8288 Web Linking, RFC 9264 Linksets, RFC 9727 API Catalogs, and all 10 EOSC Radical Transparency Patterns.
      </p>
    </div>
  </div>

  <main class="map-wrapper">
    <!-- Top Interactive Controls Bar -->
    <div class="map-controls-bar">
      <!-- Row 1: Search & Spotlight + Crawler Simulator Controller -->
      <div class="controls-row">
        <!-- Search & Spotlight Input -->
        <div class="uri-input-bar">
          <i class="fa-solid fa-magnifying-glass" style="color: var(--marine-teal);"></i>
          <input type="text" id="uriInput" value="${graph.originUri}" placeholder="Search any PID, filename, or profile (e.g. /id/dataset/arms-mbon)" onkeydown="if(event.key==='Enter') executeSearch()">
          <select id="uriQuickSelect" onchange="selectPresetUri(this.value)" style="border: 1px solid var(--panel-border); border-radius: var(--radius-sm); padding: 0.2rem 0.5rem; font-size: 0.82rem;">
            <option value="">🎯 Quick Jump to URI...</option>
            <option value="/">🌐 Layer 1: Domain Root (/)</option>
            <option value="/robots.txt">🤖 Layer 1: robots.txt</option>
            <option value="/sitemap-index.xml">🗺️ Layer 1: sitemap-index.xml</option>
            <option value="/sitemap.xml">🗺️ Layer 1: sitemap.xml</option>
            <option value="/.well-known/api-catalog">🟢 Layer 1: RFC 9727 API Catalog</option>
            <option value="/id/dataset/arms-mbon">🟠 Layer 2: ARMS-MBON PID</option>
            <option value="/id/dataset/north-sea-sensors">🟠 Layer 2: Sensors PID</option>
            <option value="/id/profile/marine-genomic-dataset-profile.html">📑 Layer 3: Composite Profile</option>
            <option value="/data/arms-mbon-rocrate.zip">📦 Layer 4: RO-Crate ZIP Payload</option>
            <option value="/api/observations/v1">⚡ Layer 4: Subsetting API</option>
          </select>
          <button class="btn-download" onclick="executeSearch()" style="padding: 0.35rem 0.75rem; font-size: 0.82rem;">Spotlight &rarr;</button>
        </div>

        <!-- Automated Crawler Simulator Controls -->
        <div class="simulator-toolbar">
          <span style="font-weight: 700; color: #38bdf8;"><i class="fa-solid fa-robot"></i> Crawler Simulator:</span>
          <select id="simScenario" onchange="loadScenario(this.value)" style="background: #1e293b; color: #ffffff; border: 1px solid #475569; border-radius: 4px; padding: 0.25rem 0.5rem; font-size: 0.78rem;">
            <option value="harvest">1. Standard EOSC Harvester (Discovery &rarr; Conneg &rarr; Turtle)</option>
            <option value="modular">2. Modular Index & Split Linksets (RT-P07 &rarr; RT-P08)</option>
            <option value="direct">3. Direct Data Payloads (RT-P04 Cite-As Solution)</option>
            <option value="api">4. Subsetting API Traversal (RT-P05)</option>
          </select>
          <button class="sim-btn" id="btnSimPlay" onclick="toggleSimulation()"><i class="fa-solid fa-play"></i> Run</button>
          <button class="sim-btn" onclick="stepSimulation()"><i class="fa-solid fa-forward-step"></i> Step</button>
          <button class="sim-btn" onclick="resetSimulation()"><i class="fa-solid fa-rotate-left"></i> Reset</button>
        </div>
      </div>

      <!-- Row 2: Multi-Dimensional Filter Toolbar -->
      <div class="controls-row">
        <!-- Layer Filters -->
        <div class="controls-group">
          <span style="font-weight: 700; font-size: 0.78rem; color: var(--text-muted); text-transform: uppercase;">Corridor Layers:</span>
          <div class="toggle-pill active" id="layer-all" onclick="filterLayer('all')">All Layers</div>
          <div class="toggle-pill layer-1" id="layer-1" onclick="filterLayer(1)">Layer 1: Discovery</div>
          <div class="toggle-pill layer-2" id="layer-2" onclick="filterLayer(2)">Layer 2: Conneg</div>
          <div class="toggle-pill layer-3" id="layer-3" onclick="filterLayer(3)">Layer 3: Profiles</div>
          <div class="toggle-pill layer-4" id="layer-4" onclick="filterLayer(4)">Layer 4: Data & APIs</div>
        </div>

        <!-- Pattern Focus Filters -->
        <div class="controls-group">
          <span style="font-weight: 700; font-size: 0.78rem; color: var(--text-muted); text-transform: uppercase;">Pattern Focus:</span>
          <div class="toggle-pill active teal" id="pill-all" onclick="filterPattern('all')">All Patterns</div>
          <div class="toggle-pill" id="pill-RT_P01" onclick="filterPattern('RT_P01')">RT-P01</div>
          <div class="toggle-pill" id="pill-RT_P02" onclick="filterPattern('RT_P02')">RT-P02</div>
          <div class="toggle-pill" id="pill-RT_P03" onclick="filterPattern('RT_P03')">RT-P03</div>
          <div class="toggle-pill" id="pill-RT_P04" onclick="filterPattern('RT_P04')">RT-P04</div>
          <div class="toggle-pill" id="pill-RT_P05" onclick="filterPattern('RT_P05')">RT-P05</div>
          <div class="toggle-pill" id="pill-RT_P06" onclick="filterPattern('RT_P06')">RT-P06</div>
          <div class="toggle-pill" id="pill-RT_P07" onclick="filterPattern('RT_P07')">RT-P07</div>
          <div class="toggle-pill" id="pill-RT_P08" onclick="filterPattern('RT_P08')">RT-P08</div>
        </div>

        <!-- Zoom HUD Controls -->
        <div class="controls-group">
          <button class="zoom-btn" onclick="zoomIn()" title="Zoom In (+)" style="width: 30px; height: 30px; border-radius: 4px; border: 1px solid var(--panel-border); cursor: pointer;"><i class="fa-solid fa-plus"></i></button>
          <button class="zoom-btn" onclick="zoomOut()" title="Zoom Out (-)" style="width: 30px; height: 30px; border-radius: 4px; border: 1px solid var(--panel-border); cursor: pointer;"><i class="fa-solid fa-minus"></i></button>
          <button class="zoom-btn" onclick="resetZoom()" title="Reset View" style="width: 30px; height: 30px; border-radius: 4px; border: 1px solid var(--panel-border); cursor: pointer;"><i class="fa-solid fa-arrows-rotate"></i></button>
        </div>
      </div>
    </div>

    <!-- Focus & Subgraph Decluttering Info Banner -->
    <div class="focus-status-banner" id="focusStatusBanner">
      <div style="display: flex; align-items: center; gap: 0.6rem;">
        <i class="fa-solid fa-bullseye" style="color: #2563eb; font-size: 1.1rem;"></i>
        <div>
          <strong>Focused Subgraph Spotlight:</strong> <code id="focusUriDisplay" style="background:#dbeafe; color:#1e40af; padding:2px 6px; border-radius:4px; font-weight:700;">/id/dataset/arms-mbon</code>
          <span style="margin-left: 8px; color: #475569;" id="focusCountDisplay">(Showing only connected transit nodes & active corridors)</span>
        </div>
      </div>
      <button class="btn-download" onclick="resetFocus()" style="padding: 0.3rem 0.8rem; font-size: 0.8rem; background: #2563eb;">Show Full System Map (Reset Focus)</button>
    </div>

    <!-- Canvas Container with Interactive Focus & Hint -->
    <div class="metro-canvas-container" id="metroCanvasContainer" tabindex="0">
      <div class="canvas-hint-pill">
        <i class="fa-solid fa-mouse" style="color: var(--marine-teal);"></i>
        <span>Scroll to Zoom • Drag to Pan • Click Any Node to Isolate Connections</span>
      </div>
      ${svgContent}
    </div>

    <!-- Dedicated Crawler Simulation Steps Table Under Metro Map -->
    <div class="crawler-sim-section" id="crawlerSimSection">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
        <div>
          <h3 style="font-size: 1.25rem; margin: 0 0 0.25rem; color: var(--vliz-blue); display: flex; align-items: center; gap: 0.5rem;">
            <i class="fa-solid fa-robot" style="color: var(--marine-teal);"></i> Crawler Simulator Scenario Steps
          </h3>
          <p style="font-size: 0.88rem; color: var(--text-secondary); margin: 0;">
            Click on any step row below to isolate and spotlight the exact node, outgoing link relation, and target on the metro map.
          </p>
        </div>
        <div style="font-size: 0.82rem; font-weight: 600; color: #0284c7; background: #e0f2fe; padding: 0.35rem 0.8rem; border-radius: 9999px;">
          Active Scenario: <span id="activeScenarioLabel">1. Standard EOSC Harvester</span>
        </div>
      </div>

      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; font-size: 0.84rem;" id="simStepsTable">
          <thead>
            <tr style="background: var(--bg-subtle); border-bottom: 2px solid var(--panel-border); text-align: left;">
              <th style="padding: 0.6rem 0.8rem; width: 60px;">Step</th>
              <th style="padding: 0.6rem 0.8rem;">Endpoint URI</th>
              <th style="padding: 0.6rem 0.8rem;">HTTP Request</th>
              <th style="padding: 0.6rem 0.8rem;">HTTP Response & Link Headers</th>
              <th style="padding: 0.6rem 0.8rem;">Applicable Pattern</th>
              <th style="padding: 0.6rem 0.8rem;">Machine Harvester Reasoning</th>
            </tr>
          </thead>
          <tbody id="simStepsTbody">
            <!-- Dynamically populated by JavaScript -->
          </tbody>
        </table>
      </div>
    </div>

    <!-- Track & Link Inspector Drawer -->
    <div class="track-drawer" id="trackDrawer">
      <button class="modal-close" onclick="closeTrackDrawer()">&times;</button>
      <div style="font-size: 0.75rem; font-weight: 700; color: var(--marine-teal); text-transform: uppercase;" id="trackBadge">LINK CONNECTION</div>
      <h4 style="margin: 0.3rem 0; font-size: 1.1rem; color: var(--text-primary);" id="trackTitle">Link Relation</h4>
      <div style="font-size: 0.8rem; color: var(--text-secondary);" id="trackNodes">Source &rarr; Target</div>
      <div style="font-size: 0.8rem; font-family: monospace; background: var(--bg-subtle); padding: 0.3rem 0.5rem; border-radius: 4px; margin: 0.5rem 0;" id="trackHeader">Link: &lt;...&gt;; rel="..."</div>
      <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-top: 0.5rem;">Test in Terminal (curl):</div>
      <div class="curl-box">
        <button class="copy-btn" onclick="copyCurl()"><i class="fa-regular fa-copy"></i> Copy</button>
        <code id="trackCurl">curl -I http://localhost:8080/</code>
      </div>
    </div>

    <!-- Pattern Implementation Matrix -->
    <div style="margin-top: 2rem; background: var(--panel-bg); border: 1px solid var(--panel-border); border-radius: var(--radius-lg); padding: 1.75rem; box-shadow: var(--shadow-sm);">
      <h3 style="font-size: 1.3rem; margin: 0 0 0.5rem; color: var(--vliz-blue);"><i class="fa-solid fa-list-check" style="color: var(--marine-teal);"></i> Radical Transparency Patterns Implementation Status</h3>
      <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 1.25rem;">Live audit of all official EOSC Radical Transparency patterns implemented in this Docker container reference server:</p>
      
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
          <thead>
            <tr style="background: var(--bg-subtle); border-bottom: 2px solid var(--panel-border); text-align: left;">
              <th style="padding: 0.6rem 0.8rem;">Pattern</th>
              <th style="padding: 0.6rem 0.8rem;">Corridor Layer</th>
              <th style="padding: 0.6rem 0.8rem;">Status</th>
              <th style="padding: 0.6rem 0.8rem;">Key Relation</th>
              <th style="padding: 0.6rem 0.8rem;">Generated Files in /dist</th>
              <th style="padding: 0.6rem 0.8rem;">Specification</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid var(--panel-border);">
              <td style="padding: 0.6rem 0.8rem; font-weight: 700; color: #0284c7;">RT-P01: Profile Conformity Declarations</td>
              <td style="padding: 0.6rem 0.8rem;"><span class="hero-tag" style="background:#eef2ff; color:#6366f1;">Layer 3</span></td>
              <td style="padding: 0.6rem 0.8rem;"><span class="hero-tag" style="background:#f0fdf4; color:#16a34a; border-color:#bbf7d0; font-size: 0.75rem;">✅ Verified</span></td>
              <td style="padding: 0.6rem 0.8rem;"><code>rel="profile"</code></td>
              <td style="padding: 0.6rem 0.8rem;"><code>dist/id/profile/*.ttl</code>, <code>dist/id/*/*.ttl</code></td>
              <td style="padding: 0.6rem 0.8rem;"><a href="https://github.com/eosc-semantic-interop/if-solutions-proposals/blob/main/proposals/radical-transparency/linkset-usage-patterns/01-profile-declaration.md" target="_blank">01-profile-declaration.md</a></td>
            </tr>
            <tr style="border-bottom: 1px solid var(--panel-border);">
              <td style="padding: 0.6rem 0.8rem; font-weight: 700; color: #0369a1;">RT-P02: Profile Composition</td>
              <td style="padding: 0.6rem 0.8rem;"><span class="hero-tag" style="background:#eef2ff; color:#6366f1;">Layer 3</span></td>
              <td style="padding: 0.6rem 0.8rem;"><span class="hero-tag" style="background:#f0fdf4; color:#16a34a; border-color:#bbf7d0; font-size: 0.75rem;">✅ Verified</span></td>
              <td style="padding: 0.6rem 0.8rem;"><code>rel="http://schema.org/hasPart"</code></td>
              <td style="padding: 0.6rem 0.8rem;"><code>dist/id/profile/*.linkset.json</code></td>
              <td style="padding: 0.6rem 0.8rem;"><a href="https://github.com/eosc-semantic-interop/if-solutions-proposals/blob/main/proposals/radical-transparency/linkset-usage-patterns/02-profile-composition.md" target="_blank">02-profile-composition.md</a></td>
            </tr>
            <tr style="border-bottom: 1px solid var(--panel-border);">
              <td style="padding: 0.6rem 0.8rem; font-weight: 700; color: #ea580c;">RT-P03: Content Negotiation Menu</td>
              <td style="padding: 0.6rem 0.8rem;"><span class="hero-tag" style="background:#fff7ed; color:#ea580c;">Layer 2</span></td>
              <td style="padding: 0.6rem 0.8rem;"><span class="hero-tag" style="background:#f0fdf4; color:#16a34a; border-color:#bbf7d0; font-size: 0.75rem;">✅ Verified</span></td>
              <td style="padding: 0.6rem 0.8rem;"><code>rel="alternate"</code>, <code>rel="self"</code></td>
              <td style="padding: 0.6rem 0.8rem;"><code>dist/nginx-coneg.conf</code>, <code>dist/id/*/*.linkset.json</code></td>
              <td style="padding: 0.6rem 0.8rem;"><a href="https://github.com/eosc-semantic-interop/if-solutions-proposals/blob/main/proposals/radical-transparency/linkset-usage-patterns/03-content-negotiation-menu.md" target="_blank">03-content-negotiation-menu.md</a></td>
            </tr>
            <tr style="border-bottom: 1px solid var(--panel-border);">
              <td style="padding: 0.6rem 0.8rem; font-weight: 700; color: #16a34a;">RT-P04: No Landing Page Solution</td>
              <td style="padding: 0.6rem 0.8rem;"><span class="hero-tag" style="background:#f0fdf4; color:#16a34a;">Layer 4</span></td>
              <td style="padding: 0.6rem 0.8rem;"><span class="hero-tag" style="background:#f0fdf4; color:#16a34a; border-color:#bbf7d0; font-size: 0.75rem;">✅ Verified</span></td>
              <td style="padding: 0.6rem 0.8rem;"><code>rel="cite-as"</code>, <code>rel="describedby"</code></td>
              <td style="padding: 0.6rem 0.8rem;"><code>dist/data/arms-mbon-rocrate.zip</code></td>
              <td style="padding: 0.6rem 0.8rem;"><a href="https://github.com/eosc-semantic-interop/if-solutions-proposals/blob/main/proposals/radical-transparency/linkset-usage-patterns/04-no-landing-page-solution.md" target="_blank">04-no-landing-page-solution.md</a></td>
            </tr>
            <tr style="border-bottom: 1px solid var(--panel-border);">
              <td style="padding: 0.6rem 0.8rem; font-weight: 700; color: #0d9488;">RT-P05: Subsetting API</td>
              <td style="padding: 0.6rem 0.8rem;"><span class="hero-tag" style="background:#f0fdf4; color:#16a34a;">Layer 4</span></td>
              <td style="padding: 0.6rem 0.8rem;"><span class="hero-tag" style="background:#f0fdf4; color:#16a34a; border-color:#bbf7d0; font-size: 0.75rem;">✅ Verified</span></td>
              <td style="padding: 0.6rem 0.8rem;"><code>rel="cite-as"</code>, <code>rel="service-desc"</code></td>
              <td style="padding: 0.6rem 0.8rem;"><code>dist/api/openapi.json</code>, <code>dist/api/observations/v1.json</code></td>
              <td style="padding: 0.6rem 0.8rem;"><a href="https://github.com/eosc-semantic-interop/if-solutions-proposals/blob/main/proposals/radical-transparency/linkset-usage-patterns/05-subsetting-api.md" target="_blank">05-subsetting-api.md</a></td>
            </tr>
            <tr style="border-bottom: 1px solid var(--panel-border);">
              <td style="padding: 0.6rem 0.8rem; font-weight: 700; color: #0284c7;">RT-P06: Hostwide Resource Discovery</td>
              <td style="padding: 0.6rem 0.8rem;"><span class="hero-tag" style="background:#f0f9ff; color:#0284c7;">Layer 1</span></td>
              <td style="padding: 0.6rem 0.8rem;"><span class="hero-tag" style="background:#f0fdf4; color:#16a34a; border-color:#bbf7d0; font-size: 0.75rem;">✅ Verified</span></td>
              <td style="padding: 0.6rem 0.8rem;"><code>rs:ln rel="linkset"</code>, <code>rel="profile"</code></td>
              <td style="padding: 0.6rem 0.8rem;"><code>dist/robots.txt</code>, <code>dist/sitemap.xml</code></td>
              <td style="padding: 0.6rem 0.8rem;"><a href="https://github.com/eosc-semantic-interop/if-solutions-proposals/blob/main/proposals/radical-transparency/linkset-usage-patterns/06-hostwide-discovery.md" target="_blank">06-hostwide-discovery.md</a></td>
            </tr>
            <tr style="border-bottom: 1px solid var(--panel-border);">
              <td style="padding: 0.6rem 0.8rem; font-weight: 700; color: #0284c7;">RT-P07: Catalogue Assisted Exposure</td>
              <td style="padding: 0.6rem 0.8rem;"><span class="hero-tag" style="background:#f0f9ff; color:#0284c7;">Layer 1</span></td>
              <td style="padding: 0.6rem 0.8rem;"><span class="hero-tag" style="background:#f0fdf4; color:#16a34a; border-color:#bbf7d0; font-size: 0.75rem;">✅ Verified</span></td>
              <td style="padding: 0.6rem 0.8rem;"><code>rel="api-catalog"</code>, <code>sitemap-index</code></td>
              <td style="padding: 0.6rem 0.8rem;"><code>dist/sitemap-index.xml</code>, <code>dist/sitemap-catalog.xml</code></td>
              <td style="padding: 0.6rem 0.8rem;"><a href="https://github.com/eosc-semantic-interop/if-solutions-proposals/blob/main/proposals/radical-transparency/linkset-usage-patterns/07-catalog-assistance.md" target="_blank">07-catalog-assistance.md</a></td>
            </tr>
            <tr style="border-bottom: 1px solid var(--panel-border);">
              <td style="padding: 0.6rem 0.8rem; font-weight: 700; color: #ca8a04;">RT-P08: Large Linkset Split-Up</td>
              <td style="padding: 0.6rem 0.8rem;"><span class="hero-tag" style="background:#f0fdf4; color:#16a34a;">Layer 4</span></td>
              <td style="padding: 0.6rem 0.8rem;"><span class="hero-tag" style="background:#f0fdf4; color:#16a34a; border-color:#bbf7d0; font-size: 0.75rem;">✅ Verified Showcase</span></td>
              <td style="padding: 0.6rem 0.8rem;"><code>rel="item"</code>, <code>rel="collection"</code></td>
              <td style="padding: 0.6rem 0.8rem;"><code>dist/id/dataset/arms-mbon.*.linkset.json</code></td>
              <td style="padding: 0.6rem 0.8rem;"><a href="https://github.com/eosc-semantic-interop/if-solutions-proposals/blob/main/proposals/radical-transparency/linkset-usage-patterns/08-large-linksets.md" target="_blank">08-large-linksets.md</a></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>

  ${renderFooter()}

  <!-- Enhanced Station Inspector Modal -->
  <div class="modal-overlay" id="modalOverlay" onclick="closeStationModal()"></div>
  <div class="station-modal" id="stationModal">
    <button class="modal-close" onclick="closeStationModal()">&times;</button>
    <div style="font-size: 0.8rem; font-weight: 700; color: var(--marine-teal); text-transform: uppercase; margin-bottom: 0.35rem;" id="modalBadge">STATION NODE</div>
    <h3 style="font-family: 'Outfit', sans-serif; font-size: 1.35rem; margin: 0 0 0.5rem; color: var(--text-primary);" id="modalTitle">Station Name</h3>
    <p style="font-size: 0.85rem; font-family: monospace; background: var(--bg-subtle); padding: 0.4rem 0.6rem; border-radius: var(--radius-sm); color: var(--vliz-blue);" id="modalPath">/path</p>
    <p style="font-size: 0.95rem; line-height: 1.6; color: var(--text-secondary); margin: 0.8rem 0;" id="modalDesc">Description text goes here.</p>
    
    <!-- Files & Locations Matrix -->
    <div class="modal-section" style="background: var(--bg-subtle); padding: 0.8rem; border-radius: var(--radius-sm); border: 1px solid var(--panel-border);">
      <div class="modal-section-title" style="margin-bottom: 0.4rem;"><i class="fa-solid fa-folder-tree" style="color: var(--vliz-blue);"></i> Physical Files & Nginx Location:</div>
      <div style="font-size: 0.8rem; margin-bottom: 0.3rem;"><strong>Architecture Layer:</strong> <span id="modalLayerBadge" class="hero-tag" style="background:#0284c7; color:#ffffff; font-size:0.75rem;">Layer 1</span></div>
      <div style="font-size: 0.8rem; margin-bottom: 0.3rem;"><strong>Static File in /dist:</strong> <code id="modalStaticFile" style="color: #0369a1;">dist/...</code></div>
      <div style="font-size: 0.8rem; margin-bottom: 0.3rem;"><strong>Source Generator:</strong> <code id="modalSourceFile" style="color: #047857;">generator/...</code></div>
      <div style="font-size: 0.8rem;"><strong>Nginx Config:</strong> <code id="modalNginxLoc" style="color: #b45309;">location = ...</code></div>
    </div>

    <!-- Applicable RT Patterns -->
    <div class="modal-section">
      <div class="modal-section-title"><i class="fa-solid fa-layer-group" style="color: var(--marine-teal);"></i> Applicable Radical Transparency Patterns:</div>
      <div id="modalPatternsList"></div>
    </div>

    <!-- Implemented Specifications -->
    <div class="modal-section">
      <div class="modal-section-title"><i class="fa-solid fa-scroll" style="color: var(--vliz-blue);"></i> Implemented Standards & RFC Specifications:</div>
      <div id="modalSpecsList" style="display: flex; flex-wrap: wrap;"></div>
    </div>

    <div style="display: flex; gap: 0.75rem; margin-top: 1.25rem;">
      <a href="#" id="modalActionBtn" target="_blank" class="btn-download" style="flex: 1; text-align: center; padding: 0.6rem 1rem;">Open Live Resource &rarr;</a>
    </div>
  </div>

  <script>
    let currentZoom = 1, panX = 0, panY = 0, isDragging = false, startX, startY;
    let viewport = document.getElementById('viewport');
    let svg = document.getElementById('metroSvg');
    let currentFocusUri = null;

    function updateTransform() {
      if (viewport) {
        viewport.setAttribute('transform', \`translate(\${panX}, \${panY}) scale(\${currentZoom})\`);
      }
    }
    
    function zoomIn(factor = 1.2, centerX = null, centerY = null) {
      const newZoom = Math.min(currentZoom * factor, 4.0);
      if (centerX !== null && centerY !== null) {
        panX = centerX - (centerX - panX) * (newZoom / currentZoom);
        panY = centerY - (centerY - panY) * (newZoom / currentZoom);
      }
      currentZoom = newZoom;
      updateTransform();
    }

    function zoomOut(factor = 1.2, centerX = null, centerY = null) {
      const newZoom = Math.max(currentZoom / factor, 0.35);
      if (centerX !== null && centerY !== null) {
        panX = centerX - (centerX - panX) * (newZoom / currentZoom);
        panY = centerY - (centerY - panY) * (newZoom / currentZoom);
      }
      currentZoom = newZoom;
      updateTransform();
    }

    function resetZoom() {
      currentZoom = 1;
      panX = 0;
      panY = 0;
      updateTransform();
    }

    function centerOnCoordinates(cx, cy) {
      const container = document.getElementById('metroCanvasContainer');
      const cw = container.clientWidth || 1500;
      const ch = container.clientHeight || 880;
      panX = cw / 2 - cx * currentZoom;
      panY = ch / 2 - cy * currentZoom;
      updateTransform();
    }

    function setupCanvasInteractions() {
      svg = document.getElementById('metroSvg');
      viewport = document.getElementById('viewport');
      if (!svg) return;

      svg.addEventListener('mousedown', (e) => {
        if (e.target.closest('.station-node') || e.target.closest('.track') || e.target.closest('.track-label-group')) return;
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

      window.addEventListener('mouseup', () => { isDragging = false; });

      svg.addEventListener('wheel', (e) => {
        e.preventDefault();
        const rect = svg.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        if (e.deltaY < 0) {
          zoomIn(1.15, mouseX, mouseY);
        } else {
          zoomOut(1.15, mouseX, mouseY);
        }
      }, { passive: false });

      svg.addEventListener('dblclick', (e) => {
        if (e.target.closest('.station-node')) return;
        e.preventDefault();
        const rect = svg.getBoundingClientRect();
        zoomIn(1.4, e.clientX - rect.left, e.clientY - rect.top);
      });
    }

    setupCanvasInteractions();

    // =========================================================================
    // DYNAMIC SUBGRAPH DECLUTTERING (SPOTLIGHT FOCUS ENGINE)
    // =========================================================================
    function focusOnUri(targetUri, centerCanvas = true) {
      if (!targetUri) {
        resetFocus();
        return;
      }
      currentFocusUri = targetUri;

      const allNodes = Array.from(document.querySelectorAll('.station-node'));
      const allTracks = Array.from(document.querySelectorAll('.track'));
      const allLabels = Array.from(document.querySelectorAll('.track-label-group'));
      const allCorridors = Array.from(document.querySelectorAll('.corridor-swimlane'));
      const allClusters = Array.from(document.querySelectorAll('.rt-cluster'));

      // 1. Find matching target node
      const targetNode = allNodes.find(n => {
        const u = n.getAttribute('data-uri') || '';
        return u === targetUri || (targetUri.length > 2 && u.endsWith(targetUri));
      });

      if (!targetNode) {
        console.warn("No node matching URI:", targetUri);
        return;
      }

      const targetNodeId = targetNode.getAttribute('data-node-id');
      const targetLayer = parseInt(targetNode.getAttribute('data-layer') || '1', 10);
      const targetPatterns = JSON.parse(targetNode.getAttribute('data-patterns') || '[]');

      // 2. Discover directly connected tracks, neighbor nodes, active layers, and patterns
      const activeNodeIds = new Set([targetNodeId]);
      const activeTrackIds = new Set();
      const activeLayers = new Set([targetLayer]);
      const activePatternIds = new Set(targetPatterns.map(p => p.id));

      allTracks.forEach(track => {
        const srcId = track.getAttribute('data-source-id');
        const tgtId = track.getAttribute('data-target-id');
        if (srcId === targetNodeId || tgtId === targetNodeId) {
          activeTrackIds.add(track.getAttribute('data-track-id'));
          if (srcId) activeNodeIds.add(srcId);
          if (tgtId) activeNodeIds.add(tgtId);
        }
      });

      // Gather neighbor layers and patterns
      allNodes.forEach(node => {
        const nid = node.getAttribute('data-node-id');
        if (activeNodeIds.has(nid)) {
          const l = parseInt(node.getAttribute('data-layer') || '1', 10);
          activeLayers.add(l);
          const pats = JSON.parse(node.getAttribute('data-patterns') || '[]');
          pats.forEach(p => activePatternIds.add(p.id));
        }
      });

      // 3. Visual Decluttering on Nodes
      allNodes.forEach(node => {
        const nid = node.getAttribute('data-node-id');
        const circle = node.querySelector('circle');
        if (nid === targetNodeId) {
          node.style.opacity = '1';
          node.style.pointerEvents = 'auto';
          if (circle) {
            circle.setAttribute('stroke', '#ef4444');
            circle.setAttribute('fill', '#fee2e2');
            circle.setAttribute('r', '11');
            circle.style.filter = 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.8))';
          }
        } else if (activeNodeIds.has(nid)) {
          node.style.opacity = '1';
          node.style.pointerEvents = 'auto';
          if (circle) {
            circle.setAttribute('r', '8.5');
            circle.style.filter = 'drop-shadow(0 0 5px rgba(14, 165, 233, 0.5))';
          }
        } else {
          node.style.opacity = '0.04';
          node.style.pointerEvents = 'none';
          if (circle) circle.style.filter = 'none';
        }
      });

      // 4. Visual Decluttering on Tracks & Labels
      allTracks.forEach(track => {
        const tid = track.getAttribute('data-track-id');
        if (activeTrackIds.has(tid)) {
          track.style.opacity = '1';
          track.style.strokeWidth = '6.5px';
          track.style.pointerEvents = 'auto';
        } else {
          track.style.opacity = '0.03';
          track.style.strokeWidth = '2px';
          track.style.pointerEvents = 'none';
        }
      });

      allLabels.forEach(lbl => {
        const tid = lbl.getAttribute('data-track-ref');
        if (activeTrackIds.has(tid)) {
          lbl.style.opacity = '1';
          lbl.style.pointerEvents = 'auto';
        } else {
          lbl.style.opacity = '0.02';
          lbl.style.pointerEvents = 'none';
        }
      });

      // 5. Visual Decluttering on Corridors
      allCorridors.forEach(corridor => {
        const l = parseInt(corridor.getAttribute('id')?.replace('corridor-layer-', '') || '0', 10);
        if (activeLayers.has(l)) {
          corridor.style.opacity = '1';
        } else {
          corridor.style.opacity = '0.12';
        }
      });

      // 6. Visual Decluttering on Pattern Clusters
      allClusters.forEach(cluster => {
        const pid = cluster.getAttribute('data-pattern-id');
        if (activePatternIds.has(pid)) {
          cluster.style.opacity = '0.9';
        } else {
          cluster.style.opacity = '0.03';
        }
      });

      // 7. Update Focus Status Banner
      const banner = document.getElementById('focusStatusBanner');
      if (banner) {
        banner.style.display = 'flex';
        document.getElementById('focusUriDisplay').textContent = targetUri;
        document.getElementById('focusCountDisplay').textContent = \`(Showing only \${activeNodeIds.size} connected nodes in \${activeLayers.size} active corridors)\`;
      }

      // 8. Smoothly Center Viewport
      if (centerCanvas && targetNode) {
        const circle = targetNode.querySelector('circle');
        if (circle) {
          const cx = parseFloat(circle.getAttribute('cx') || '0');
          const cy = parseFloat(circle.getAttribute('cy') || '0');
          centerOnCoordinates(cx, cy);
        }
      }
    }

    function resetFocus() {
      currentFocusUri = null;
      document.querySelectorAll('.station-node').forEach(node => {
        node.style.opacity = '1';
        node.style.pointerEvents = 'auto';
        const circle = node.querySelector('circle');
        if (circle) {
          circle.setAttribute('r', '7.2');
          circle.style.filter = 'none';
        }
      });
      document.querySelectorAll('.track').forEach(t => {
        t.style.opacity = '1';
        t.style.strokeWidth = '4.5px';
        t.style.pointerEvents = 'auto';
      });
      document.querySelectorAll('.track-label-group').forEach(l => {
        l.style.opacity = '1';
        l.style.pointerEvents = 'auto';
      });
      document.querySelectorAll('.corridor-swimlane').forEach(c => {
        c.style.opacity = '1';
      });
      document.querySelectorAll('.rt-cluster').forEach(c => {
        c.style.opacity = '1';
      });
      const banner = document.getElementById('focusStatusBanner');
      if (banner) banner.style.display = 'none';
    }

    function executeSearch() {
      const val = document.getElementById('uriInput').value.trim();
      if (val) focusOnUri(val, true);
    }

    function selectPresetUri(val) {
      if (val) {
        document.getElementById('uriInput').value = val;
        focusOnUri(val, true);
      }
    }

    // Layer & Pattern Filters
    function filterLayer(layerNum) {
      resetFocus();
      document.querySelectorAll('[id^="layer-"]').forEach(el => el.classList.remove('active'));
      const activeEl = document.getElementById('layer-' + layerNum);
      if (activeEl) activeEl.classList.add('active');

      document.querySelectorAll('.corridor-swimlane').forEach(c => {
        if (layerNum === 'all') {
          c.style.opacity = '1';
        } else {
          c.style.opacity = c.classList.contains('corridor-layer-' + layerNum) ? '1' : '0.12';
        }
      });

      document.querySelectorAll('.station-node').forEach(n => {
        if (layerNum === 'all') {
          n.style.opacity = '1';
        } else {
          n.style.opacity = n.classList.contains('station-layer-' + layerNum) ? '1' : '0.04';
        }
      });
    }

    function filterPattern(pid) {
      resetFocus();
      document.querySelectorAll('.controls-row .toggle-pill[id^="pill-"]').forEach(el => el.classList.remove('active'));
      const activePill = document.getElementById('pill-' + pid);
      if (activePill) activePill.classList.add('active');

      document.querySelectorAll('.rt-cluster').forEach(c => {
        c.style.opacity = (pid === 'all' || c.id === 'cluster-' + pid) ? '1' : '0.04';
      });
    }

    // Node & Track Click Handlers
    function handleNodeClick(el, title, uri, desc, liveUrl, staticFile, sourceFile, nginxLocation, layer) {
      focusOnUri(uri, false);

      const patternsData = JSON.parse(el.getAttribute('data-patterns') || '[]');
      const specsData = JSON.parse(el.getAttribute('data-specs') || '[]');
      const staticFilePath = staticFile || el.getAttribute('data-static-file') || 'dist' + uri;
      const sourceFilePath = sourceFile || el.getAttribute('data-source-file') || 'generator/index.ts';
      const nginxLoc = nginxLocation || el.getAttribute('data-nginx-loc') || 'location = ' + uri;

      document.getElementById('modalTitle').textContent = title;
      document.getElementById('modalPath').textContent = uri;
      document.getElementById('modalDesc').textContent = desc || 'Station node participating in Radical Transparency linked data transit network.';
      document.getElementById('modalActionBtn').href = liveUrl;

      const layerBadge = document.getElementById('modalLayerBadge');
      if (layerBadge) {
        layerBadge.textContent = 'Layer ' + (layer || 1);
        layerBadge.style.background = layer === 1 ? '#0284c7' : (layer === 2 ? '#ea580c' : (layer === 3 ? '#6366f1' : '#16a34a'));
      }

      document.getElementById('modalStaticFile').textContent = staticFilePath;
      document.getElementById('modalSourceFile').textContent = sourceFilePath;
      document.getElementById('modalNginxLoc').textContent = nginxLoc;

      // Render RT Patterns
      const patternsListEl = document.getElementById('modalPatternsList');
      patternsListEl.innerHTML = '';
      if (patternsData.length === 0) {
        patternsListEl.innerHTML = '<span style="font-size:0.85rem; color:var(--text-muted);">None assigned.</span>';
      } else {
        patternsData.forEach(p => {
          const card = document.createElement('a');
          card.className = 'pattern-card-link';
          card.href = p.docUrl;
          card.target = '_blank';
          card.innerHTML = \`
            <div>
              <strong style="color: \${p.themeColor};">RT-P\${p.number < 10 ? '0' + p.number : p.number}: \${p.name}</strong>
              <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">EOSC Proposal Document &rarr;</div>
            </div>
            <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 0.8rem; color: var(--marine-teal);"></i>
          \`;
          patternsListEl.appendChild(card);
        });
      }

      // Render Specs
      const specsListEl = document.getElementById('modalSpecsList');
      specsListEl.innerHTML = '';
      if (specsData.length === 0) {
        specsListEl.innerHTML = '<span style="font-size:0.85rem; color:var(--text-muted);">No RFC specifications declared.</span>';
      } else {
        specsData.forEach(s => {
          const badge = document.createElement('a');
          badge.className = 'spec-badge-link';
          badge.href = s.specUrl || '#';
          badge.target = '_blank';
          badge.innerHTML = \`\${s.code} <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 0.7rem; opacity: 0.7;"></i>\`;
          badge.title = \`\${s.name} (\${s.publisher})\`;
          specsListEl.appendChild(badge);
        });
      }

      document.getElementById('modalOverlay').style.display = 'block';
      document.getElementById('stationModal').style.display = 'block';
    }

    function closeStationModal() {
      document.getElementById('modalOverlay').style.display = 'none';
      document.getElementById('stationModal').style.display = 'none';
    }

    function handleTrackClick(trackEl) {
      if (!trackEl) return;
      const src = trackEl.getAttribute('data-source-uri') || '';
      const tgt = trackEl.getAttribute('data-target-uri') || '';
      const rel = trackEl.getAttribute('data-relation') || '';
      const curl = trackEl.getAttribute('data-curl-cmd') || '';
      const hdr = trackEl.getAttribute('data-http-header') || '';

      document.getElementById('trackTitle').textContent = rel || 'Link Relation Connection';
      document.getElementById('trackNodes').textContent = src + ' \u2192 ' + tgt;
      document.getElementById('trackHeader').textContent = hdr;
      document.getElementById('trackCurl').textContent = curl;

      document.getElementById('trackDrawer').style.display = 'block';
    }

    function closeTrackDrawer() {
      document.getElementById('trackDrawer').style.display = 'none';
    }

    function copyCurl() {
      const txt = document.getElementById('trackCurl').textContent;
      navigator.clipboard.writeText(txt);
      alert('Copied curl snippet to clipboard!');
    }

    // =========================================================================
    // CRAWLER SIMULATOR ENGINE WITH DEDICATED STEPS TABLE
    // =========================================================================
    let simInterval = null;
    let simStepIdx = 0;

    const SIM_SCENARIOS = {
      harvest: {
        title: "1. Standard EOSC Harvester",
        steps: [
          {
            uri: "/robots.txt",
            req: "GET /robots.txt HTTP/1.1",
            res: "HTTP/1.1 200 OK | Content-Type: text/plain",
            pattern: "RT-P06 & RFC 8288",
            reasoning: "Harvesting bot begins at /robots.txt and discovers declared sitemap directives."
          },
          {
            uri: "/sitemap-index.xml",
            req: "GET /sitemap-index.xml HTTP/1.1 | Accept: application/xml",
            res: "HTTP/1.1 200 OK | Content-Type: application/xml",
            pattern: "RT-P07 Catalogue Assistance",
            reasoning: "Identifies modular sub-sitemaps for datasets, profiles, and catalogs."
          },
          {
            uri: "/sitemap.xml",
            req: "GET /sitemap.xml HTTP/1.1 | Accept: application/xml",
            res: "HTTP/1.1 200 OK | rs:ln rel='linkset'",
            pattern: "RT-P06 Hostwide Discovery",
            reasoning: "Parses rs:ln rel='linkset' entries and discovers ARMS-MBON persistent identifier."
          },
          {
            uri: "/id/dataset/arms-mbon",
            req: "GET /id/dataset/arms-mbon HTTP/1.1 | Accept: text/turtle",
            res: "HTTP/1.1 303 See Other | Location: /id/dataset/arms-mbon.ttl",
            pattern: "RT-P03 Content Negotiation",
            reasoning: "Server resolves Broken Chain issue via 303 Conneg and emits Link headers pointing to Linkset."
          },
          {
            uri: "/id/dataset/arms-mbon.ttl",
            req: "GET /id/dataset/arms-mbon.ttl HTTP/1.1",
            res: "HTTP/1.1 200 OK | Link: </id/profile/marine-genomic-dataset-profile>; rel='profile'",
            pattern: "RT-P01 Profile Conformity",
            reasoning: "Extracts machine-actionable triples, schema:conformsTo, and conforms to declared profile."
          }
        ]
      },
      modular: {
        title: "2. Modular Index & Split Linksets",
        steps: [
          {
            uri: "/sitemap-index.xml",
            req: "GET /sitemap-index.xml HTTP/1.1",
            res: "HTTP/1.1 200 OK | Delegated sub-sitemaps declared",
            pattern: "RT-P07 Catalogue Assistance",
            reasoning: "Harvester branches into dedicated sitemaps for granular resource exposure."
          },
          {
            uri: "/id/dataset/arms-mbon.linkset.json",
            req: "GET /id/dataset/arms-mbon.linkset.json HTTP/1.1 | Accept: application/linkset+json",
            res: "HTTP/1.1 200 OK | Contains rel='item' to child fragments",
            pattern: "RT-P08 Large Linkset Split-Up",
            reasoning: "Master linkset decomposes web links into smaller cacheable fragments using rel='item'."
          },
          {
            uri: "/id/dataset/arms-mbon.conneg.linkset.json",
            req: "GET /id/dataset/arms-mbon.conneg.linkset.json HTTP/1.1",
            res: "HTTP/1.1 200 OK | rel='collection' uplinks to Master",
            pattern: "RT-P08 Large Linkset Fragment",
            reasoning: "Fragment yields direct alternate formats while uplinking to master linkset."
          }
        ]
      },
      direct: {
        title: "3. Direct Data Payloads (No Landing Page Solution)",
        steps: [
          {
            uri: "/data/arms-mbon-rocrate.zip",
            req: "GET /data/arms-mbon-rocrate.zip HTTP/1.1",
            res: "HTTP/1.1 200 OK | Link: </id/dataset/arms-mbon>; rel='cite-as', </id/dataset/arms-mbon.linkset.json>; rel='linkset'",
            pattern: "RT-P04 Direct Payload Solution",
            reasoning: "Machine client bypasses landing page and cites parent dataset PID directly via rel='cite-as'."
          },
          {
            uri: "/id/dataset/arms-mbon.linkset.json",
            req: "GET /id/dataset/arms-mbon.linkset.json HTTP/1.1",
            res: "HTTP/1.1 200 OK | Content-Type: application/linkset+json",
            pattern: "RFC 9264 Linkset Hub",
            reasoning: "Client discovers complete profile declarations and alternate format representations from the cited dataset linkset."
          }
        ]
      },
      api: {
        title: "4. Subsetting API Traversal",
        steps: [
          {
            uri: "/.well-known/api-catalog",
            req: "GET /.well-known/api-catalog HTTP/1.1 | Accept: application/linkset+json",
            res: "HTTP/1.1 200 OK | Contains service endpoints",
            pattern: "RFC 9727 API Catalog",
            reasoning: "Harvester discovers dynamic Subsetting API for ARMS-MBON."
          },
          {
            uri: "/api/observations/v1",
            req: "GET /api/observations/v1 HTTP/1.1",
            res: "HTTP/1.1 200 OK | Link: </id/dataset/arms-mbon>; rel='cite-as', </api/openapi.json>; rel='service-desc'",
            pattern: "RT-P05 Subsetting API",
            reasoning: "API response returns dynamic observations anchored to dataset PID and OpenAPI documentation."
          }
        ]
      }
    };

    function loadScenario(scenarioKey) {
      const scenario = SIM_SCENARIOS[scenarioKey] || SIM_SCENARIOS.harvest;
      document.getElementById('activeScenarioLabel').textContent = scenario.title;
      
      const tbody = document.getElementById('simStepsTbody');
      tbody.innerHTML = '';

      scenario.steps.forEach((step, idx) => {
        const tr = document.createElement('tr');
        tr.className = 'sim-table-row';
        tr.id = \`sim-row-\${idx}\`;
        tr.onclick = () => executeSimStep(idx);
        tr.innerHTML = \`
          <td style="padding: 0.6rem 0.8rem; font-weight: 700; color: #0284c7;">#\${idx + 1}</td>
          <td style="padding: 0.6rem 0.8rem;"><code style="color: #0369a1; font-weight: 700;">\${step.uri}</code></td>
          <td style="padding: 0.6rem 0.8rem; font-family: monospace; color: #475569;">\${step.req}</td>
          <td style="padding: 0.6rem 0.8rem; font-family: monospace; color: #059669;">\${step.res}</td>
          <td style="padding: 0.6rem 0.8rem;"><span class="hero-tag" style="background:#f0fdf4; color:#16a34a; font-size:0.75rem;">\${step.pattern}</span></td>
          <td style="padding: 0.6rem 0.8rem; color: #334155;">\${step.reasoning}</td>
        \`;
        tbody.appendChild(tr);
      });

      simStepIdx = 0;
    }

    function executeSimStep(idx) {
      const scenarioKey = document.getElementById('simScenario').value;
      const scenario = SIM_SCENARIOS[scenarioKey] || SIM_SCENARIOS.harvest;
      if (idx < 0 || idx >= scenario.steps.length) return;

      simStepIdx = idx;
      const step = scenario.steps[idx];

      // Highlight active table row
      document.querySelectorAll('.sim-table-row').forEach(r => r.classList.remove('active-step'));
      const activeRow = document.getElementById(\`sim-row-\${idx}\`);
      if (activeRow) activeRow.classList.add('active-step');

      // Spotlight and declutter map
      focusOnUri(step.uri, true);
    }

    function toggleSimulation() {
      if (simInterval) {
        pauseSimulation();
      } else {
        startSimulation();
      }
    }

    function startSimulation() {
      const btn = document.getElementById('btnSimPlay');
      if (btn) {
        btn.innerHTML = '<i class="fa-solid fa-pause"></i> Pause';
        btn.classList.add('active');
      }
      
      executeSimStep(simStepIdx);
      simInterval = setInterval(() => {
        stepSimulation();
      }, 2500);
    }

    function pauseSimulation() {
      clearInterval(simInterval);
      simInterval = null;
      const btn = document.getElementById('btnSimPlay');
      if (btn) {
        btn.innerHTML = '<i class="fa-solid fa-play"></i> Run';
        btn.classList.remove('active');
      }
    }

    function resetSimulation() {
      pauseSimulation();
      simStepIdx = 0;
      document.querySelectorAll('.sim-table-row').forEach(r => r.classList.remove('active-step'));
      resetFocus();
    }

    function stepSimulation() {
      const scenarioKey = document.getElementById('simScenario').value;
      const scenario = SIM_SCENARIOS[scenarioKey] || SIM_SCENARIOS.harvest;
      
      simStepIdx = (simStepIdx + 1) % scenario.steps.length;
      executeSimStep(simStepIdx);
    }

    // Initialize scenario table on load
    loadScenario('harvest');
  </script>
</body>
</html>`;
  }
}
