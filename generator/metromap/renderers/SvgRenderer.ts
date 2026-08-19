import { MetroGraph } from "../models/MetroGraph";
import { PatternBoundingBox } from "../engine/OctilinearLayoutEngine";

export class SvgRenderer {
  public renderSvg(graph: MetroGraph, bounds: PatternBoundingBox[], width: number = 1500, height: number = 1200): string {
    const clustersSvg = bounds.map(b => `
      <g class="rt-cluster rt-pattern-${b.pattern.id}" id="cluster-${b.pattern.id}">
        <rect class="rt-cluster-bg" x="${b.x}" y="${b.y}" width="${b.width}" height="${b.height}" fill="${b.pattern.bgTint}" stroke="${b.pattern.themeColor}" rx="14" ry="14" stroke-dasharray="6 4" stroke-width="1.8" opacity="0.85" />
        <text class="rt-cluster-header" x="${b.x + 16}" y="${b.y + 24}" fill="${b.pattern.themeColor}" font-family="'Outfit', sans-serif" font-size="12px" font-weight="700">
          RT-P${b.pattern.number < 10 ? '0' + b.pattern.number : b.pattern.number}: ${b.pattern.name.toUpperCase()}
        </text>
        <text class="rt-cluster-spec" x="${b.x + 16}" y="${b.y + 40}" fill="#64748b" font-family="'Inter', sans-serif" font-size="9.5px" font-weight="600">
          ${b.pattern.specs.map(s => s.code).join(" • ")}
        </text>
      </g>
    `).join("\n");

    const tracksSvg = graph.tracks.map(t => {
      const d = t.pathPoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(" ");
      const strokeClass = `track-${t.lineType}`;
      const dashedAttr = t.isDashed ? 'stroke-dasharray="6 3"' : '';
      return `<path class="track ${strokeClass}" d="${d}" ${dashedAttr} fill="none" stroke-width="4.5px" stroke-linecap="round" stroke-linejoin="round" />`;
    }).join("\n");

    const labelsSvg = graph.tracks.filter(t => t.relationLabel).map(t => {
      const p1 = t.pathPoints[0];
      const p2 = t.pathPoints[1] || p1;
      const lx = p1.x + (p2.x - p1.x) * 0.5 + 8;
      const ly = p1.y + (p2.y - p1.y) * 0.5 - 6;
      return `<text class="track-label" x="${lx}" y="${ly}" font-family="'Inter', sans-serif" font-size="9px" font-weight="600" fill="#475569" paint-order="stroke" stroke="#ffffff" stroke-width="3px">${t.relationLabel}</text>`;
    }).join("\n");

    const nodesSvg = graph.nodes.map(n => {
      const strokeColor = n.isOrigin ? "#ef4444" : "#0284c7";
      const fillColor = n.isOrigin ? "#fee2e2" : "#ffffff";
      const specCodes = n.specs.map(s => s.code).join(", ");
      const escapedDesc = n.description.replace(/"/g, "&quot;");
      const clickHandler = `openStationModal('${n.label.replace(/'/g, "\\'")}', '${n.uri}', '${escapedDesc}', '${n.liveUrl || '#'}', '${specCodes}')`;

      return `
        <g class="station-node station-${n.category}" onclick="${clickHandler}">
          <circle class="station-circle" cx="${n.x}" cy="${n.y}" r="${n.isOrigin ? 10 : 7.5}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${n.isOrigin ? 4 : 3}" />
          <text class="station-label" x="${n.x + 14}" y="${n.y + 4}" font-family="'Inter', sans-serif" font-size="11px" font-weight="600" fill="#1e293b" paint-order="stroke" stroke="#ffffff" stroke-width="3px">${n.label}</text>
          ${n.sublabel ? `<text class="station-sublabel" x="${n.x + 14}" y="${n.y + 16}" font-family="'Inter', sans-serif" font-size="9px" font-weight="500" fill="#64748b" paint-order="stroke" stroke="#ffffff" stroke-width="3px">${n.sublabel}</text>` : ''}
        </g>
      `;
    }).join("\n");

    return `
      <svg id="metroSvg" viewBox="0 0 ${width} ${height}">
        <g id="viewport">
          <g id="clusterGroup">${clustersSvg}</g>
          <g id="tracksGroup">${tracksSvg}</g>
          <g id="relationLabelsGroup">${labelsSvg}</g>
          <g id="stationsGroup">${nodesSvg}</g>
        </g>
      </svg>
    `;
  }
}
