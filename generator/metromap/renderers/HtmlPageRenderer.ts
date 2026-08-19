import { MetroGraph } from "../models/MetroGraph";
import { PatternBoundingBox } from "../engine/OctilinearLayoutEngine";
import { SvgRenderer } from "./SvgRenderer";

export class HtmlPageRenderer {
  private svgRenderer = new SvgRenderer();

  public renderPage(graph: MetroGraph, bounds: PatternBoundingBox[], baseUrl: string): string {
    const svgContent = this.svgRenderer.renderSvg(graph, bounds, 1500, 1300);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Radical Transparency Dynamic Metro Map - VLIZ Portal</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="/style.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    .map-wrapper { max-width: 1550px; margin: 1.5rem auto 3rem; padding: 0 1.5rem; }
    .map-controls-bar { display: flex; flex-direction: column; gap: 1rem; background: var(--panel-bg); border: 1px solid var(--panel-border); border-radius: var(--radius-md); padding: 1.25rem 1.5rem; margin-bottom: 1.5rem; box-shadow: var(--shadow-sm); }
    .controls-row { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
    .controls-group { display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; }
    .uri-input-bar { display: flex; align-items: center; gap: 0.5rem; flex: 1; min-width: 320px; background: var(--bg-subtle); padding: 0.4rem 0.8rem; border-radius: var(--radius-sm); border: 1px solid var(--panel-border); }
    .uri-input-bar input { flex: 1; background: transparent; border: none; outline: none; font-family: monospace; font-size: 0.9rem; color: var(--text-primary); }
    .toggle-pill { display: inline-flex; align-items: center; gap: 0.35rem; background: var(--bg-subtle); border: 1px solid var(--panel-border); padding: 0.35rem 0.75rem; border-radius: 9999px; font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); cursor: pointer; user-select: none; transition: all 0.2s ease; }
    .toggle-pill.active { background: var(--vliz-blue); color: #ffffff; border-color: var(--vliz-blue); }
    .toggle-pill.teal.active { background: var(--marine-teal); border-color: var(--marine-teal); color: #ffffff; }
    .metro-canvas-container { position: relative; background: #f8fafc; border: 1px solid var(--panel-border); border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-md); min-height: 850px; }
    svg#metroSvg { width: 100%; height: 880px; cursor: grab; background: radial-gradient(circle, #e2e8f0 1px, transparent 1px); background-size: 24px 24px; background-color: #fafbfc; }
    svg#metroSvg:active { cursor: grabbing; }
    .track-domain { stroke: #0284c7; }
    .track-dataset { stroke: #ea580c; }
    .track-linkset { stroke: #eab308; }
    .track-distribution { stroke: #16a34a; }
    .track-api { stroke: #0d9488; }
    .track-institute { stroke: #8b5cf6; }
    .track-person { stroke: #10b981; }
    .station-node { cursor: pointer; }
    .station-node:hover circle { r: 11px; filter: drop-shadow(0 0 6px rgba(15, 23, 42, 0.4)); }
    .station-modal { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #ffffff; border-radius: var(--radius-lg); padding: 2rem; max-width: 580px; width: 90%; box-shadow: var(--shadow-lg); border: 1px solid var(--panel-border); z-index: 1000; display: none; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); z-index: 999; display: none; }
    .modal-close { position: absolute; top: 1.25rem; right: 1.25rem; background: none; border: none; font-size: 1.25rem; cursor: pointer; color: var(--text-muted); }
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
      <h2 class="detail-title">🗺️ Marine Linked Data Dynamic Discovery Map</h2>
      <p style="font-size: 1.05rem; color: var(--text-secondary); margin: 0.5rem 0 0; max-width: 900px;">
        Object-Oriented Linked Open Data transit network visualizing RFC 8288 Web Linking, RFC 9264 Linksets, RFC 9727 API Catalogs, and official EOSC Radical Transparency Patterns.
      </p>
    </div>
  </div>

  <main class="map-wrapper">
    <div class="map-controls-bar">
      <!-- Origin URI Inspector -->
      <div class="controls-row">
        <div class="uri-input-bar">
          <i class="fa-solid fa-compass" style="color: var(--marine-teal);"></i>
          <span style="font-weight: 700; font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase;">Origin URI:</span>
          <input type="text" id="uriInput" value="${graph.originUri}" placeholder="Enter any URI (e.g. / or /resource/resource-arms-mbon)" onkeydown="if(event.key==='Enter') traceUri()">
          <select id="uriQuickSelect" onchange="selectPresetUri(this.value)" style="border: 1px solid var(--panel-border); border-radius: var(--radius-sm); padding: 0.2rem 0.5rem; font-size: 0.85rem;">
            <option value="/">🌐 Domain Root (/)</option>
            <option value="/resource/resource-arms-mbon">🟠 ARMS-MBON (PID 8617)</option>
            <option value="/resource/resource-arms-2018">🟠 ARMS 2018 (PID 6405)</option>
            <option value="/resource/resource-north-sea-sensors">🟠 North Sea Sensors</option>
            <option value="/resource/resource-vliz">🟣 VLIZ Institute</option>
            <option value="/.well-known/api-catalog">🟢 RFC 9727 API Catalog</option>
          </select>
          <button class="btn-download" onclick="traceUri()" style="padding: 0.35rem 0.8rem; font-size: 0.85rem;">Trace &rarr;</button>
        </div>
        <div class="controls-group">
          <button class="toggle-pill active teal" onclick="toggleOverlays()"><i class="fa-solid fa-layer-group"></i> RT Patterns</button>
          <button class="toggle-pill active" onclick="toggleLabels()"><i class="fa-solid fa-tag"></i> Relation Labels</button>
        </div>
      </div>

      <!-- Pattern & Spec Filters -->
      <div class="controls-row">
        <div class="controls-group">
          <span style="font-weight: 700; font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Filter Pattern:</span>
          <div class="toggle-pill active" onclick="filterPattern('all')">All</div>
          <div class="toggle-pill" onclick="filterPattern('RT_P01')">RT-P01 Profile</div>
          <div class="toggle-pill" onclick="filterPattern('RT_P03')">RT-P03 Conneg</div>
          <div class="toggle-pill" onclick="filterPattern('RT_P04')">RT-P04 Direct Payloads</div>
          <div class="toggle-pill" onclick="filterPattern('RT_P05')">RT-P05 Subsetting API</div>
          <div class="toggle-pill" onclick="filterPattern('RT_P06')">RT-P06 Hostwide</div>
          <div class="toggle-pill" onclick="filterPattern('RT_P07')">RT-P07 Catalog</div>
          <div class="toggle-pill" onclick="filterPattern('RT_P08')">RT-P08 Linkset</div>
        </div>
        <div class="controls-group">
          <button class="zoom-btn" onclick="zoomIn()" style="width: 32px; height: 32px; border-radius: 4px; border: 1px solid var(--panel-border); cursor: pointer;"><i class="fa-solid fa-plus"></i></button>
          <button class="zoom-btn" onclick="zoomOut()" style="width: 32px; height: 32px; border-radius: 4px; border: 1px solid var(--panel-border); cursor: pointer;"><i class="fa-solid fa-minus"></i></button>
          <button class="zoom-btn" onclick="resetZoom()" style="width: 32px; height: 32px; border-radius: 4px; border: 1px solid var(--panel-border); cursor: pointer;"><i class="fa-solid fa-arrows-rotate"></i></button>
        </div>
      </div>
    </div>

    <!-- Canvas -->
    <div class="metro-canvas-container">
      ${svgContent}
    </div>
  </main>

  <!-- Modal -->
  <div class="modal-overlay" id="modalOverlay" onclick="closeStationModal()"></div>
  <div class="station-modal" id="stationModal">
    <button class="modal-close" onclick="closeStationModal()">&times;</button>
    <div style="font-size: 0.8rem; font-weight: 700; color: var(--marine-teal); text-transform: uppercase; margin-bottom: 0.35rem;" id="modalBadge">STATION NODE</div>
    <h3 style="font-family: 'Outfit', sans-serif; font-size: 1.35rem; margin: 0 0 0.5rem; color: var(--text-primary);" id="modalTitle">Station Name</h3>
    <p style="font-size: 0.85rem; font-family: monospace; background: var(--bg-subtle); padding: 0.4rem 0.6rem; border-radius: var(--radius-sm); color: var(--vliz-blue);" id="modalPath">/path</p>
    <p style="font-size: 0.95rem; line-height: 1.6; color: var(--text-secondary); margin: 0.8rem 0;" id="modalDesc">Description text goes here.</p>
    <div style="background: var(--bg-subtle); border-radius: var(--radius-sm); padding: 0.6rem 0.8rem; margin-bottom: 1.2rem; font-size: 0.85rem;">
      <strong>Implemented Specifications:</strong>
      <div id="modalSpecs" style="color: var(--marine-teal); font-weight: 600; margin-top: 0.25rem;">RFC 8288, RFC 9264</div>
    </div>
    <a href="#" id="modalActionBtn" target="_blank" class="btn-download" style="display: block; text-align: center; padding: 0.6rem 1rem;">Open Live Resource &rarr;</a>
  </div>

  <script>
    let currentZoom = 1, panX = 0, panY = 0, isDragging = false, startX, startY;
    const viewport = document.getElementById('viewport');
    const svg = document.getElementById('metroSvg');

    function updateTransform() {
      viewport.setAttribute('transform', \`translate(\${panX}, \${panY}) scale(\${currentZoom})\`);
    }
    function zoomIn() { currentZoom = Math.min(currentZoom * 1.2, 3); updateTransform(); }
    function zoomOut() { currentZoom = Math.max(currentZoom / 1.2, 0.5); updateTransform(); }
    function resetZoom() { currentZoom = 1; panX = 0; panY = 0; updateTransform(); }

    svg.addEventListener('mousedown', (e) => { isDragging = true; startX = e.clientX - panX; startY = e.clientY - panY; });
    window.addEventListener('mousemove', (e) => { if (!isDragging) return; panX = e.clientX - startX; panY = e.clientY - startY; updateTransform(); });
    window.addEventListener('mouseup', () => { isDragging = false; });

    function toggleOverlays() {
      const g = document.getElementById('clusterGroup');
      g.style.display = g.style.display === 'none' ? 'inline' : 'none';
    }
    function toggleLabels() {
      const g = document.getElementById('relationLabelsGroup');
      g.style.display = g.style.display === 'none' ? 'inline' : 'none';
    }
    function filterPattern(pid) {
      document.querySelectorAll('.rt-cluster').forEach(c => {
        c.style.opacity = (pid === 'all' || c.id === 'cluster-' + pid) ? '1' : '0.15';
      });
    }
    function selectPresetUri(val) {
      document.getElementById('uriInput').value = val;
      traceUri();
    }
    function traceUri() {
      const uri = document.getElementById('uriInput').value;
      window.location.href = '/map.html?origin=' + encodeURIComponent(uri);
    }
    function openStationModal(title, path, desc, liveUrl, specs) {
      document.getElementById('modalTitle').textContent = title;
      document.getElementById('modalPath').textContent = path;
      document.getElementById('modalDesc').textContent = desc;
      document.getElementById('modalActionBtn').href = liveUrl;
      document.getElementById('modalSpecs').textContent = specs || 'None declared';
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
}
