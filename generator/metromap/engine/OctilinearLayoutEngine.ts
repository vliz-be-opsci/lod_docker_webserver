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

export interface CorridorBoundingBox {
  layer: 1 | 2 | 3 | 4;
  name: string;
  title: string;
  subtitle: string;
  themeColor: string;
  bgColor: string;
  borderColor: string;
  x: number;
  y: number;
  width: number;
  height: number;
  patterns: string[];
}

export class OctilinearLayoutEngine {
  public static readonly CORRIDOR_DEFINITIONS: Record<1 | 2 | 3 | 4, {
    name: string;
    title: string;
    subtitle: string;
    themeColor: string;
    bgColor: string;
    borderColor: string;
    yStart: number;
    height: number;
    patterns: string[];
  }> = {
    1: {
      name: "LAYER 1: HOSTWIDE DISCOVERY & CATALOG ASSISTANCE",
      title: "Discovery & Catalog Gateway",
      subtitle: "Domain Onboarding, Sitemap Indexing, W3C DCAT-3 & RFC 9727 API Catalogs",
      themeColor: "#0284c7",
      bgColor: "#f0f9ff",
      borderColor: "#bae6fd",
      yStart: 60,
      height: 280,
      patterns: ["RT_P06", "RT_P07"]
    },
    2: {
      name: "LAYER 2: CONTENT NEGOTIATION & PID 303 HUBS",
      title: "Semantic Content Negotiation (Conneg)",
      subtitle: "Base Persistent Identifiers (PIDs), 303 Redirects, HTML Landing Pages & RDF Graphs (Turtle, JSON-LD, RDF/XML)",
      themeColor: "#ea580c",
      bgColor: "#fff7ed",
      borderColor: "#fed7aa",
      yStart: 380,
      height: 310,
      patterns: ["RT_P03"]
    },
    3: {
      name: "LAYER 3: PROFILES CONFORMITY & COMPOSITION HIERARCHY",
      title: "Profile Conformance & Composition",
      subtitle: "W3C DX-PROF Declarations (rel=\"profile\") & Recursive Compound Profiles (rel=\"http://schema.org/hasPart\")",
      themeColor: "#6366f1",
      bgColor: "#eef2ff",
      borderColor: "#c7d2fe",
      yStart: 730,
      height: 290,
      patterns: ["RT_P01", "RT_P02"]
    },
    4: {
      name: "LAYER 4: DIRECT DATA PAYLOADS, SUBSETTING APIS & SPLIT LINKSETS",
      title: "Machine Data Payloads & APIs",
      subtitle: "No-Landing Direct Binary Downloads (rel=\"cite-as\"), RFC 9727 Subsetting API & Large Linkset Fragments",
      themeColor: "#16a34a",
      bgColor: "#f0fdf4",
      borderColor: "#bbf7d0",
      yStart: 1060,
      height: 420,
      patterns: ["RT_P04", "RT_P05", "RT_P08"]
    }
  };

  public computeLayout(graph: MetroGraph, canvasWidth: number = 1680): void {
    // 1. Group nodes by layer (1..4)
    const layerNodes: Record<1 | 2 | 3 | 4, MetroNode[]> = {
      1: [],
      2: [],
      3: [],
      4: []
    };

    for (const node of graph.nodes) {
      layerNodes[node.layer].push(node);
    }

    // 2. Position nodes within Layer 1 (Discovery)
    const l1Nodes = layerNodes[1];
    for (let i = 0; i < l1Nodes.length; i++) {
      const node = l1Nodes[i];
      const col = i % 4;
      const row = Math.floor(i / 4);
      node.x = 100 + col * 380;
      node.y = 120 + row * 90;
    }

    // 3. Position nodes within Layer 2 (Conneg & 303 Hubs)
    const l2Nodes = layerNodes[2];
    for (let i = 0; i < l2Nodes.length; i++) {
      const node = l2Nodes[i];
      const col = i % 4;
      const row = Math.floor(i / 4);
      node.x = 100 + col * 380;
      node.y = 440 + row * 100;
    }

    // 4. Position nodes within Layer 3 (Profiles)
    const l3Nodes = layerNodes[3];
    for (let i = 0; i < l3Nodes.length; i++) {
      const node = l3Nodes[i];
      const col = i % 4;
      const row = Math.floor(i / 4);
      node.x = 100 + col * 380;
      node.y = 790 + row * 95;
    }

    // 5. Position nodes within Layer 4 (Data Payloads & Sidecars)
    const l4Nodes = layerNodes[4];
    for (let i = 0; i < l4Nodes.length; i++) {
      const node = l4Nodes[i];
      const col = i % 4;
      const row = Math.floor(i / 4);
      node.x = 100 + col * 380;
      node.y = 1120 + row * 95;
    }

    // 6. Compute 90°/45° smooth octilinear path routes for tracks
    for (const track of graph.tracks) {
      const sx = track.source.x;
      const sy = track.source.y;
      const tx = track.target.x;
      const ty = track.target.y;

      if (sx === tx) {
        track.pathPoints = [{ x: sx, y: sy }, { x: tx, y: ty }];
      } else if (sy === ty) {
        track.pathPoints = [{ x: sx, y: sy }, { x: tx, y: ty }];
      } else {
        const midY = sy + (ty - sy) * 0.5;
        track.pathPoints = [
          { x: sx, y: sy },
          { x: sx, y: midY },
          { x: tx, y: midY },
          { x: tx, y: ty }
        ];
      }
    }
  }

  public computeCorridorBounds(canvasWidth: number = 1680): CorridorBoundingBox[] {
    const corridors: CorridorBoundingBox[] = [];
    for (const layerKey of [1, 2, 3, 4] as const) {
      const def = OctilinearLayoutEngine.CORRIDOR_DEFINITIONS[layerKey];
      corridors.push({
        layer: layerKey,
        name: def.name,
        title: def.title,
        subtitle: def.subtitle,
        themeColor: def.themeColor,
        bgColor: def.bgColor,
        borderColor: def.borderColor,
        x: 40,
        y: def.yStart,
        width: canvasWidth - 80,
        height: def.height,
        patterns: def.patterns
      });
    }
    return corridors;
  }

  public computePatternBounds(graph: MetroGraph): PatternBoundingBox[] {
    const bounds: PatternBoundingBox[] = [];
    const padding = 24;

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
        y: Math.max(minY - padding - 24, 20),
        width: Math.max(maxX - minX + padding * 2 + 180, 220),
        height: Math.max(maxY - minY + padding * 2 + 40, 80),
        enclosedNodes: matchingNodes
      });
    }

    return bounds;
  }
}
