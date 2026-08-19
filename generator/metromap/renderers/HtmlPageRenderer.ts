import { MetroGraph } from "../models/MetroGraph";
import { PatternBoundingBox } from "../engine/OctilinearLayoutEngine";
import { SvgRenderer } from "./SvgRenderer";

export class HtmlPageRenderer {
  private svgRenderer = new SvgRenderer();

  public renderPage(graph: MetroGraph, bounds: PatternBoundingBox[], baseUrl: string): string {
    const svgContent = this.svgRenderer.renderSvg(graph, bounds, 1580, 1350);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Radical Transparency Dynamic Metro Map - VLIZ Portal</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="/style.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    .map-wrapper { max-width: 1580px; margin: 1.5rem auto 3rem; padding: 0 1.5rem; }
    .map-controls-bar { display: flex; flex-direction: column; gap: 1rem; background: var(--panel-bg); border: 1px solid var(--panel-border); border-radius: var(--radius-md); padding: 1.25rem 1.5rem; margin-bottom: 1.5rem; box-shadow: var(--shadow-sm); }
    .controls-row { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
    .controls-group { display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; }
    .uri-input-bar { display: flex; align-items: center; gap: 0.5rem; flex: 1; min-width: 340px; background: var(--bg-subtle); padding: 0.4rem 0.8rem; border-radius: var(--radius-sm); border: 1px solid var(--panel-border); }
    .uri-input-bar input { flex: 1; background: transparent; border: none; outline: none; font-family: monospace; font-size: 0.9rem; color: var(--text-primary); }
    .toggle-pill { display: inline-flex; align-items: center; gap: 0.35rem; background: var(--bg-subtle); border: 1px solid var(--panel-border); padding: 0.35rem 0.75rem; border-radius: 9999px; font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); cursor: pointer; user-select: none; transition: all 0.2s ease; }
    .toggle-pill.active { background: var(--vliz-blue); color: #ffffff; border-color: var(--vliz-blue); }
    .toggle-pill.teal.active { background: var(--marine-teal); border-color: var(--marine-teal); color: #ffffff; }
    .metro-canvas-container { position: relative; background: #f8fafc; border: 1px solid var(--panel-border); border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-md); min-height: 850px; }
    svg#metroSvg { width: 100%; height: 880px; cursor: grab; background: radial-gradient(circle, #e2e8f0 1px, transparent 1px); background-size: 24px 24px; background-color: #fafbfc; }
    svg#metroSvg:active { cursor: grabbing; }
    .track { fill: none; stroke-width: 4.5px; stroke-linecap: round; stroke-linejoin: round; transition: stroke-opacity 0.3s, stroke-width 0.2s; }
    .track-domain { stroke: #0284c7; }
    .track-dataset { stroke: #ea580c; }
    .track-linkset { stroke: #eab308; }
    .track-distribution { stroke: #16a34a; }
    .track-api { stroke: #0d9488; }
    .track-institute { stroke: #8b5cf6; }
    .track-person { stroke: #10b981; }
    .station-node { cursor: pointer; transition: transform 0.2s; }
    .station-node:hover circle { r: 10.5px; filter: drop-shadow(0 0 6px rgba(15, 23, 42, 0.4)); }
    .rt-cluster { transition: opacity 0.3s; }
    
    /* Enhanced Modal Styling */
    .station-modal { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #ffffff; border-radius: var(--radius-lg); padding: 2rem; max-width: 620px; width: 92%; box-shadow: var(--shadow-lg); border: 1px solid var(--panel-border); z-index: 1000; display: none; max-height: 85vh; overflow-y: auto; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); z-index: 999; display: none; }
    .modal-close { position: absolute; top: 1.25rem; right: 1.25rem; background: none; border: none; font-size: 1.25rem; cursor: pointer; color: var(--text-muted); }
    .modal-section { margin-bottom: 1.25rem; }
    .modal-section-title { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.5px; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.4rem; }
    .spec-badge-link { display: inline-flex; align-items: center; gap: 0.35rem; background: #f1f5f9; color: var(--vliz-blue); text-decoration: none; padding: 0.3rem 0.6rem; border-radius: var(--radius-sm); font-size: 0.8rem; font-weight: 600; border: 1px solid #cbd5e1; transition: all 0.2s; margin-right: 0.4rem; margin-bottom: 0.4rem; }
    .spec-badge-link:hover { background: var(--vliz-blue); color: #ffffff; border-color: var(--vliz-blue); }
    .pattern-card-link { display: flex; align-items: center; justify-content: space-between; background: var(--bg-subtle); border: 1px solid var(--panel-border); padding: 0.6rem 0.8rem; border-radius: var(--radius-sm); text-decoration: none; color: var(--text-primary); margin-bottom: 0.5rem; transition: all 0.2s; }
    .pattern-card-link:hover { border-color: var(--marine-teal); background: #f0fdfa; transform: translateX(2px); }
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
          <button class="toggle-pill active teal" id="btnToggleClusters" onclick="toggleOverlays()"><i class="fa-solid fa-layer-group"></i> RT Patterns</button>
          <button class="toggle-pill active" id="btnToggleLabels" onclick="toggleLabels()"><i class="fa-solid fa-tag"></i> Relation Labels</button>
        </div>
      </div>

      <!-- Pattern & Spec Filters -->
      <div class="controls-row">
        <div class="controls-group">
          <span style="font-weight: 700; font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Filter Pattern:</span>
          <div class="toggle-pill active" id="pill-all" onclick="filterPattern('all')">All</div>
          <div class="toggle-pill" id="pill-RT_P01" onclick="filterPattern('RT_P01')">RT-P01 Profile</div>
          <div class="toggle-pill" id="pill-RT_P03" onclick="filterPattern('RT_P03')">RT-P03 Conneg</div>
          <div class="toggle-pill" id="pill-RT_P04" onclick="filterPattern('RT_P04')">RT-P04 Direct Payloads</div>
          <div class="toggle-pill" id="pill-RT_P05" onclick="filterPattern('RT_P05')">RT-P05 Subsetting API</div>
          <div class="toggle-pill" id="pill-RT_P06" onclick="filterPattern('RT_P06')">RT-P06 Hostwide</div>
          <div class="toggle-pill" id="pill-RT_P07" onclick="filterPattern('RT_P07')">RT-P07 Catalog</div>
          <div class="toggle-pill" id="pill-RT_P08" onclick="filterPattern('RT_P08')">RT-P08 Linkset</div>
        </div>
        <div class="controls-group">
          <button class="zoom-btn" onclick="zoomIn()" style="width: 32px; height: 32px; border-radius: 4px; border: 1px solid var(--panel-border); cursor: pointer;"><i class="fa-solid fa-plus"></i></button>
          <button class="zoom-btn" onclick="zoomOut()" style="width: 32px; height: 32px; border-radius: 4px; border: 1px solid var(--panel-border); cursor: pointer;"><i class="fa-solid fa-minus"></i></button>
          <button class="zoom-btn" onclick="resetZoom()" style="width: 32px; height: 32px; border-radius: 4px; border: 1px solid var(--panel-border); cursor: pointer;"><i class="fa-solid fa-arrows-rotate"></i></button>
        </div>
      </div>
    </div>

    <!-- Canvas -->
    <div class="metro-canvas-container" id="metroCanvasContainer">
      ${svgContent}
    </div>
  </main>

  <!-- Enhanced Inspector Modal -->
  <div class="modal-overlay" id="modalOverlay" onclick="closeStationModal()"></div>
  <div class="station-modal" id="stationModal">
    <button class="modal-close" onclick="closeStationModal()">&times;</button>
    <div style="font-size: 0.8rem; font-weight: 700; color: var(--marine-teal); text-transform: uppercase; margin-bottom: 0.35rem;" id="modalBadge">STATION NODE</div>
    <h3 style="font-family: 'Outfit', sans-serif; font-size: 1.35rem; margin: 0 0 0.5rem; color: var(--text-primary);" id="modalTitle">Station Name</h3>
    <p style="font-size: 0.85rem; font-family: monospace; background: var(--bg-subtle); padding: 0.4rem 0.6rem; border-radius: var(--radius-sm); color: var(--vliz-blue);" id="modalPath">/path</p>
    <p style="font-size: 0.95rem; line-height: 1.6; color: var(--text-secondary); margin: 0.8rem 0;" id="modalDesc">Description text goes here.</p>
    
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

    function updateTransform() {
      if (viewport) {
        viewport.setAttribute('transform', \`translate(\${panX}, \${panY}) scale(\${currentZoom})\`);
      }
    }
    function zoomIn() { currentZoom = Math.min(currentZoom * 1.2, 3); updateTransform(); }
    function zoomOut() { currentZoom = Math.max(currentZoom / 1.2, 0.5); updateTransform(); }
    function resetZoom() { currentZoom = 1; panX = 0; panY = 0; updateTransform(); }

    function setupDragEvents() {
      svg = document.getElementById('metroSvg');
      viewport = document.getElementById('viewport');
      if (!svg) return;
      svg.addEventListener('mousedown', (e) => { isDragging = true; startX = e.clientX - panX; startY = e.clientY - panY; });
      window.addEventListener('mousemove', (e) => { if (!isDragging) return; panX = e.clientX - startX; panY = e.clientY - startY; updateTransform(); });
      window.addEventListener('mouseup', () => { isDragging = false; });
    }

    setupDragEvents();

    function toggleOverlays() {
      const g = document.getElementById('clusterGroup');
      if (g) g.style.display = g.style.display === 'none' ? 'inline' : 'none';
      document.getElementById('btnToggleClusters').classList.toggle('active', g && g.style.display !== 'none');
    }
    function toggleLabels() {
      const g = document.getElementById('relationLabelsGroup');
      if (g) g.style.display = g.style.display === 'none' ? 'inline' : 'none';
      document.getElementById('btnToggleLabels').classList.toggle('active', g && g.style.display !== 'none');
    }
    function filterPattern(pid) {
      document.querySelectorAll('.controls-row .toggle-pill').forEach(el => {
        if (el.id && el.id.startsWith('pill-')) el.classList.remove('active');
      });
      const activePill = document.getElementById('pill-' + pid);
      if (activePill) activePill.classList.add('active');

      document.querySelectorAll('.rt-cluster').forEach(c => {
        c.style.opacity = (pid === 'all' || c.id === 'cluster-' + pid) ? '1' : '0.12';
      });
    }
    function selectPresetUri(val) {
      document.getElementById('uriInput').value = val;
      traceUri();
    }
    function traceUri() {
      const targetUri = document.getElementById('uriInput').value.trim();
      if (!targetUri) return;
      document.querySelectorAll('.station-node circle').forEach(c => {
        c.setAttribute('stroke', '#0284c7');
        c.setAttribute('fill', '#ffffff');
        c.setAttribute('r', '7');
      });
      document.querySelectorAll('.station-node').forEach(node => {
        const nodeUri = node.getAttribute('data-uri') || '';
        if (nodeUri === targetUri || nodeUri.includes(targetUri)) {
          const circle = node.querySelector('circle');
          if (circle) {
            circle.setAttribute('stroke', '#ef4444');
            circle.setAttribute('fill', '#fee2e2');
            circle.setAttribute('r', '9.5');
          }
          node.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        }
      });
    }

    function handleNodeClick(el, title, uri, desc, liveUrl) {
      const patternsData = JSON.parse(el.getAttribute('data-patterns') || '[]');
      const specsData = JSON.parse(el.getAttribute('data-specs') || '[]');

      document.getElementById('modalTitle').textContent = title;
      document.getElementById('modalPath').textContent = uri;
      document.getElementById('modalDesc').textContent = desc || 'Node endpoint participating in Radical Transparency linked data transit graph.';
      document.getElementById('modalActionBtn').href = liveUrl;

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
              <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">EOSC Semantic Interop Proposal Document &rarr;</div>
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

    const urlParams = new URLSearchParams(window.location.search);
    const originParam = urlParams.get('origin');
    if (originParam) {
      document.getElementById('uriInput').value = originParam;
      setTimeout(traceUri, 300);
    }
  </script>
</body>
</html>`;
  }
}
