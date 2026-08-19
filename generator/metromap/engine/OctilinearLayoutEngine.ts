import { MetroGraph } from "../models/MetroGraph";
import { MetroNode } from "../models/MetroNode";
import { RTPattern } from "../models/RTPattern";

export interface PatternBoundingBox {
  pattern: RTPattern;
  x: number;
  y: number;
  width: number;
  height: number;
  enclosedNodes: MetroNode[];
}

export class OctilinearLayoutEngine {
  private laneXCoordinates = [120, 420, 720, 1000, 1280, 1560];

  public computeLayout(graph: MetroGraph): void {
    // 1. Assign semantic lanes
    const laneCounters = [0, 0, 0, 0, 0, 0];
    const ySpacing = 85;
    const yOffset = 140;

    for (const node of graph.nodes) {
      let laneIndex = 1;
      if (node.category === "domain" || node.id.includes("root") || node.id.includes("robots") || node.id.includes("sitemap")) {
        laneIndex = 0;
      } else if (node.id.includes("pid") || (node.uri.startsWith("/id/") && !node.uri.includes(".")) || node.uri.includes("/resource/")) {
        laneIndex = 1;
      } else if ((node.uri.endsWith(".html") && node.uri.includes("/id/")) || node.uri.includes("/datasets/") || node.uri.includes("/institutes/") || node.uri.includes("/publications/") || node.uri.includes("/projects/")) {
        laneIndex = 2;
      } else if (node.category === "profile" || node.uri.includes("/profiles/") || node.uri.includes("/id/profile")) {
        laneIndex = 3;
      } else if (node.category === "linkset" || node.uri.includes(".linkset.json") || node.uri.includes("/linksets/")) {
        laneIndex = 4;
      } else if (node.category === "distribution" || node.category === "api" || node.uri.includes("/data/") || node.uri.includes("/api/")) {
        laneIndex = 5;
      }

      node.lane = laneIndex;
      node.sublane = laneCounters[laneIndex]++;
      node.x = this.laneXCoordinates[laneIndex];
      node.y = yOffset + node.sublane * ySpacing;
    }

    // 2. Compute 90°/45° octilinear path routes for tracks
    for (const track of graph.tracks) {
      const sx = track.source.x;
      const sy = track.source.y;
      const tx = track.target.x;
      const ty = track.target.y;

      if (sx === tx) {
        // Vertical trunk line
        track.pathPoints = [{ x: sx, y: sy }, { x: tx, y: ty }];
      } else if (sy === ty) {
        // Direct horizontal line
        track.pathPoints = [{ x: sx, y: sy }, { x: tx, y: ty }];
      } else {
        // 45° / 90° metro transition
        const midX = sx + (tx - sx) * 0.45;
        track.pathPoints = [
          { x: sx, y: sy },
          { x: midX, y: sy },
          { x: midX + 35, y: ty },
          { x: tx, y: ty }
        ];
      }
    }
  }

  public computePatternBounds(graph: MetroGraph): PatternBoundingBox[] {
    const bounds: PatternBoundingBox[] = [];
    const padding = 28;

    for (const pattern of graph.patterns) {
      const matchingNodes = graph.nodes.filter(n => pattern.matchesNode(n));
      if (matchingNodes.length === 0) continue;

      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const n of matchingNodes) {
        if (n.x < minX) minX = n.x;
        if (n.y < minY) minY = n.y;
        if (n.x > maxX) maxX = n.x;
        if (n.y > maxY) maxY = n.y;
      }

      bounds.push({
        pattern,
        x: Math.max(minX - padding, 20),
        y: Math.max(minY - padding - 36, 20),
        width: Math.max(maxX - minX + padding * 2 + 190, 220),
        height: Math.max(maxY - minY + padding * 2 + 50, 90),
        enclosedNodes: matchingNodes
      });
    }

    return bounds;
  }
}
