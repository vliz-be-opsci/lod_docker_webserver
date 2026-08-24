import { MetroGraph } from "../models/MetroGraph";
import { PatternBoundingBox, CorridorBoundingBox } from "../engine/OctilinearLayoutEngine";

export class SvgRenderer {
  public renderSvg(
    graph: MetroGraph,
    bounds: PatternBoundingBox[],
    corridors: CorridorBoundingBox[] = [],
    width: number = 1680,
    height: number = 1520
  ): string {
    // 1. Render 4 Corridor Swimlanes
    const corridorsSvg = corridors.map(c => `
      <g class="corridor-swimlane corridor-layer-${c.layer}" id="corridor-layer-${c.layer}">
        <rect class="corridor-bg" x="${c.x}" y="${c.y}" width="${c.width}" height="${c.height}" fill="${c.bgColor}" stroke="${c.borderColor}" stroke-width="2" rx="16" ry="16" />
        <!-- Corridor Header Banner -->
        <rect x="${c.x}" y="${c.y}" width="${c.width}" height="38" fill="${c.borderColor}" opacity="0.45" rx="16" ry="16" />
        <rect x="${c.x}" y="${c.y + 22}" width="${c.width}" height="16" fill="${c.borderColor}" opacity="0.45" />
        <text class="corridor-badge" x="${c.x + 20}" y="${c.y + 24}" fill="${c.themeColor}" font-family="'Outfit', sans-serif" font-size="13px" font-weight="800" letter-spacing="0.5px">
          ${c.name}
        </text>
        <text class="corridor-subtitle" x="${c.x + 20}" y="${c.y + 54}" fill="#64748b" font-family="'Inter', sans-serif" font-size="10.5px" font-weight="500">
          ${c.subtitle}
        </text>
        <!-- Pattern Tags inside Corridor -->
        <g transform="translate(${c.x + c.width - 240}, ${c.y + 12})">
          ${c.patterns.map((pId, pIdx) => `
            <rect x="${pIdx * 105}" y="0" width="96" height="20" rx="4" fill="#ffffff" stroke="${c.themeColor}" stroke-width="1.2" />
            <text x="${pIdx * 105 + 48}" y="14" text-anchor="middle" font-family="'Inter', sans-serif" font-size="9.5px" font-weight="700" fill="${c.themeColor}">
              ${pId.replace('_', '-')}
            </text>
          `).join("")}
        </g>
      </g>
    `).join("\n");

    // 2. Render Pattern Clusters
    const clustersSvg = bounds.map(b => `
      <g class="rt-cluster rt-pattern-${b.pattern.id}" id="cluster-${b.pattern.id}">
        <rect class="rt-cluster-bg" x="${b.x}" y="${b.y}" width="${b.width}" height="${b.height}" fill="${b.pattern.bgTint}" stroke="${b.pattern.themeColor}" rx="12" ry="12" stroke-dasharray="5 3" stroke-width="1.5" opacity="0.6" />
        <text class="rt-cluster-header" x="${b.x + 12}" y="${b.y + 18}" fill="${b.pattern.themeColor}" font-family="'Outfit', sans-serif" font-size="11px" font-weight="700">
          RT-P${b.pattern.number < 10 ? '0' + b.pattern.number : b.pattern.number}: ${b.pattern.name.toUpperCase()}
        </text>
      </g>
    `).join("\n");

    // 3. Render Tracks with Flow Animation & Inspector Click Handler
    const tracksSvg = graph.tracks.map((t, idx) => {
      const d = t.pathPoints.map((p, pIdx) => `${pIdx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(" ");
      const strokeClass = `track-${t.lineType}`;
      const dashedAttr = t.isDashed ? 'stroke-dasharray="6 3"' : '';
      const curlCmd = t.curlCommand || `curl -I ${t.source.liveUrl || t.source.uri}`;
      const httpHeader = t.httpHeader || `Link: <${t.target.uri}>; ${t.relationLabel || 'rel="related"'}`;
      const escapedRelation = (t.relationLabel || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');

      return `
        <path class="track ${strokeClass}" 
              id="track-${idx}"
              d="${d}" 
              ${dashedAttr} 
              fill="none" 
              stroke-width="4.5px" 
              stroke-linecap="round" 
              stroke-linejoin="round"
              data-track-id="track-${idx}"
              data-source-uri="${t.source.uri}"
              data-target-uri="${t.target.uri}"
              data-relation="${escapedRelation}"
              data-curl-cmd="${curlCmd.replace(/"/g, '&quot;')}"
              data-http-header="${httpHeader.replace(/"/g, '&quot;')}"
              onclick="handleTrackClick(this)" />
      `;
    }).join("\n");

    // 4. Render Track Relation Labels
    const labelsSvg = graph.tracks.filter(t => t.relationLabel).map((t, idx) => {
      const p1 = t.pathPoints[0];
      const p2 = t.pathPoints[1] || p1;
      const lx = p1.x + (p2.x - p1.x) * 0.5 + 8;
      const ly = p1.y + (p2.y - p1.y) * 0.5 - 6;
      const escapedRelation = (t.relationLabel || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
      const curlCmd = t.curlCommand || `curl -I ${t.source.liveUrl || t.source.uri}`;
      const httpHeader = t.httpHeader || `Link: <${t.target.uri}>; ${t.relationLabel || 'rel="related"'}`;

      return `
        <g class="track-label-group" 
           data-track-ref="track-${idx}"
           onclick="handleTrackClick(document.getElementById('track-${idx}'))"
           style="cursor: pointer;">
          <rect x="${lx - 4}" y="${ly - 10}" width="${(t.relationLabel?.length || 0) * 6.2 + 8}" height="14" rx="3" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.8" opacity="0.95" />
          <text class="track-label" x="${lx}" y="${ly}" font-family="'Inter', sans-serif" font-size="8.5px" font-weight="600" fill="#334155">${t.relationLabel}</text>
        </g>
      `;
    }).join("\n");

    // 5. Render Station Nodes
    const nodesSvg = graph.nodes.map(n => {
      const strokeColor = n.isOrigin ? "#ef4444" : (n.layer === 1 ? "#0284c7" : (n.layer === 2 ? "#ea580c" : (n.layer === 3 ? "#6366f1" : "#16a34a")));
      const fillColor = n.isOrigin ? "#fee2e2" : "#ffffff";
      
      const matchingPatterns = graph.patterns.filter(p => p.matchesNode(n));
      const patternsJson = JSON.stringify(matchingPatterns.map(p => ({
        id: p.id,
        number: p.number,
        name: p.name,
        docUrl: p.docUrl || "https://github.com/eosc-semantic-interop/if-solutions-proposals/tree/main/proposals/radical-transparency/linkset-usage-patterns",
        themeColor: p.themeColor
      }))).replace(/"/g, '&quot;');

      const specsJson = JSON.stringify(n.specs.map(s => ({
        id: s.id,
        code: s.code,
        name: s.name,
        specUrl: s.specUrl,
        publisher: s.publisher
      }))).replace(/"/g, '&quot;');

      const staticFile = n.staticFilePath || `dist${n.uri}`;
      const sourceFile = n.sourceGenerator || "generator/index.ts";
      const nginxLocation = n.nginxConfigLocation || `location = ${n.uri}`;
      const curlCmd = `curl -I ${n.liveUrl || n.uri}`;

      const escapedTitle = n.label.replace(/'/g, "\\'");
      const escapedDesc = n.description.replace(/'/g, "\\'").replace(/"/g, '&quot;');
      const liveUrl = n.liveUrl || "#";

      return `
        <g class="station-node station-layer-${n.layer} station-${n.category}" 
           id="node-${n.id}"
           data-node-id="${n.id}"
           data-uri="${n.uri}"
           data-layer="${n.layer}"
           data-static-file="${staticFile}"
           data-source-file="${sourceFile}"
           data-nginx-loc="${nginxLocation}"
           data-curl-cmd="${curlCmd.replace(/"/g, '&quot;')}"
           data-patterns="${patternsJson}"
           data-specs="${specsJson}"
           onclick="handleNodeClick(this, '${escapedTitle}', '${n.uri}', '${escapedDesc}', '${liveUrl}', '${staticFile}', '${sourceFile}', '${nginxLocation}', ${n.layer})">
          <circle class="station-circle" cx="${n.x}" cy="${n.y}" r="${n.isOrigin ? 9.5 : 7.2}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${n.isOrigin ? 3.5 : 2.8}" />
          <text class="station-label" x="${n.x + 14}" y="${n.y + 4}" font-family="'Inter', sans-serif" font-size="11px" font-weight="600" fill="#1e293b" paint-order="stroke" stroke="#ffffff" stroke-width="3px">${n.label}</text>
          ${n.sublabel ? `<text class="station-sublabel" x="${n.x + 14}" y="${n.y + 16}" font-family="'Inter', sans-serif" font-size="9px" font-weight="500" fill="#64748b" paint-order="stroke" stroke="#ffffff" stroke-width="3px">${n.sublabel}</text>` : ''}
        </g>
      `;
    }).join("\n");

    return `
      <svg id="metroSvg" viewBox="0 0 ${width} ${height}">
        <g id="viewport">
          <g id="corridorsGroup">${corridorsSvg}</g>
          <g id="clusterGroup">${clustersSvg}</g>
          <g id="tracksGroup">${tracksSvg}</g>
          <g id="relationLabelsGroup">${labelsSvg}</g>
          <g id="stationsGroup">${nodesSvg}</g>
        </g>
      </svg>
    `;
  }
}
