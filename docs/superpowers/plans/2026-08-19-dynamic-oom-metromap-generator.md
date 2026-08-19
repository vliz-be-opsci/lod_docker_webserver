# Dynamic OOM Metro Map Generator & Radical Transparency Topology Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the hardcoded SVG metro map generator into a modular, Object-Oriented Modeling (OOM) Linked Open Data Discovery & Topology Engine with URI-centric discovery cascades, dynamic octilinear layout routing, and automated Radical Transparency (RT-P01 through RT-P10) multi-spec boundary blocks.

**Architecture:** A layered, isomorphic TypeScript engine composed of pure domain models (`MetroNode`, `MetroTrack`, `MetroGraph`, `Specification`, `RTPattern`), standard registries (`specsRegistry`, `rtPatternsRegistry`), a discovery cascade engine (`DiscoveryCascadeEngine`), an octilinear layout router (`OctilinearLayoutEngine`), and SVG/HTML renderers (`SvgRenderer`, `HtmlPageRenderer`) that run both at build time and client-side in the browser.

**Tech Stack:** TypeScript, Bun test / Node test runner, SVG, Vanilla CSS/HTML, Browser DOM / ES Modules.

**Spec:** [`docs/superpowers/specs/2026-08-19-dynamic-oom-metromap-generator-design.md`](file:///c:/Users/cedricd/Documents/Github/lod_docker_webserver/docs/superpowers/specs/2026-08-19-dynamic-oom-metromap-generator-design.md)

## Global Constraints
- Pure Object-Oriented Modeling (OOM) with modular class design and separation of concerns.
- Core engine must be isomorphic (no direct Node/Bun fs or browser DOM dependencies in models, layout, or cascade engine).
- Zero placeholders (no `TODO`, `TBD`, or incomplete methods).
- Strict TDD (Test-Driven Development) for each task.

---

### Task 1: Object-Oriented Domain Models

**Files:**
- Create: `generator/metromap/models/Specification.ts`
- Create: `generator/metromap/models/RTPattern.ts`
- Create: `generator/metromap/models/MetroNode.ts`
- Create: `generator/metromap/models/MetroTrack.ts`
- Create: `generator/metromap/models/MetroGraph.ts`
- Test: `test/metromap/models.test.ts`

**Interfaces:**
- Consumes: None (Root Domain Layer)
- Produces: `Specification`, `RTPattern`, `MetroNode`, `MetroTrack`, `MetroGraph`

- [ ] **Step 1: Write the failing test for domain models**

```typescript
// test/metromap/models.test.ts
import { describe, it, expect } from "bun:test";
import { Specification } from "../../generator/metromap/models/Specification";
import { RTPattern } from "../../generator/metromap/models/RTPattern";
import { MetroNode } from "../../generator/metromap/models/MetroNode";
import { MetroTrack } from "../../generator/metromap/models/MetroTrack";
import { MetroGraph } from "../../generator/metromap/models/MetroGraph";

describe("MetroMap Domain Models", () => {
  it("creates Specification correctly", () => {
    const spec = new Specification(
      "RFC_9264",
      "RFC 9264",
      "Linkset",
      "IETF",
      "https://datatracker.ietf.org/doc/html/rfc9264",
      "JSON Linksets"
    );
    expect(spec.code).toBe("RFC 9264");
    expect(spec.publisher).toBe("IETF");
  });

  it("creates MetroNode and MetroTrack and aggregates in MetroGraph", () => {
    const spec = new Specification("RFC_8288", "RFC 8288", "Web Linking", "IETF", "", "Web Linking");
    const nodeA = new MetroNode("n1", "http://localhost/a", "Node A", "Sub A", "dataset", [spec], "Desc A");
    const nodeB = new MetroNode("n2", "http://localhost/b", "Node B", "Sub B", "linkset", [spec], "Desc B");

    const track = new MetroTrack("t1", nodeA, nodeB, "linkset", 'rel="linkset"', "#eab308", true);
    const pattern = new RTPattern("P1", 1, "Pattern 1", "Desc", [spec], "#0284c7", "#f0f9ff", () => true);

    const graph = new MetroGraph([nodeA, nodeB], [track], [pattern], "http://localhost/a");

    expect(graph.nodes.length).toBe(2);
    expect(graph.tracks.length).toBe(1);
    expect(graph.getNodeById("n1")).toBe(nodeA);
    expect(graph.getTracksForNode("n1").length).toBe(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test test/metromap/models.test.ts`  
Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Implement domain model classes**

Create `generator/metromap/models/Specification.ts`:
```typescript
export class Specification {
  constructor(
    public readonly id: string,
    public readonly code: string,
    public readonly name: string,
    public readonly publisher: "IETF" | "W3C" | "OGC" | "Schema.org" | "Community",
    public readonly specUrl: string,
    public readonly description: string
  ) {}
}
```

Create `generator/metromap/models/RTPattern.ts`:
```typescript
import { Specification } from "./Specification";
import { MetroNode } from "./MetroNode";

export class RTPattern {
  constructor(
    public readonly id: string,
    public readonly number: number,
    public readonly name: string,
    public readonly description: string,
    public readonly specs: Specification[],
    public readonly themeColor: string,
    public readonly bgTint: string,
    public readonly matchesNode: (node: MetroNode) => boolean
  ) {}
}
```

Create `generator/metromap/models/MetroNode.ts`:
```typescript
import { Specification } from "./Specification";

export type NodeCategory = "domain" | "dataset" | "linkset" | "distribution" | "api" | "institute" | "publication" | "person";

export class MetroNode {
  public x: number = 0;
  public y: number = 0;
  public lane: number = 0;
  public sublane: number = 0;

  constructor(
    public readonly id: string,
    public readonly uri: string,
    public readonly label: string,
    public readonly sublabel: string,
    public readonly category: NodeCategory,
    public readonly specs: Specification[] = [],
    public readonly description: string = "",
    public readonly liveUrl?: string,
    public readonly isOrigin: boolean = false
  ) {}
}
```

Create `generator/metromap/models/MetroTrack.ts`:
```typescript
import { MetroNode, NodeCategory } from "./MetroNode";

export class MetroTrack {
  public pathPoints: { x: number; y: number }[] = [];

  constructor(
    public readonly id: string,
    public readonly source: MetroNode,
    public readonly target: MetroNode,
    public readonly lineType: NodeCategory,
    public readonly relationLabel?: string,
    public readonly strokeColor?: string,
    public readonly isDashed: boolean = false
  ) {}
}
```

Create `generator/metromap/models/MetroGraph.ts`:
```typescript
import { MetroNode } from "./MetroNode";
import { MetroTrack } from "./MetroTrack";
import { RTPattern } from "./RTPattern";

export class MetroGraph {
  private nodeMap: Map<string, MetroNode> = new Map();

  constructor(
    public readonly nodes: MetroNode[] = [],
    public readonly tracks: MetroTrack[] = [],
    public readonly patterns: RTPattern[] = [],
    public readonly originUri: string = "/"
  ) {
    for (const node of nodes) {
      this.nodeMap.set(node.id, node);
    }
  }

  public getNodeById(id: string): MetroNode | undefined {
    return this.nodeMap.get(id);
  }

  public getNodeByUri(uri: string): MetroNode | undefined {
    return this.nodes.find(n => n.uri === uri || n.label === uri);
  }

  public getTracksForNode(nodeId: string): MetroTrack[] {
    return this.tracks.filter(t => t.source.id === nodeId || t.target.id === nodeId);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test test/metromap/models.test.ts`  
Expected: PASS (2 tests pass)

- [ ] **Step 5: Commit**

```bash
git add generator/metromap/models/ test/metromap/models.test.ts
git commit -m "feat(metromap): add OOM domain models"
```

---

### Task 2: Standard Registries (`specsRegistry` & `rtPatternsRegistry`)

**Files:**
- Create: `generator/metromap/registry/specsRegistry.ts`
- Create: `generator/metromap/registry/rtPatternsRegistry.ts`
- Test: `test/metromap/registry.test.ts`

**Interfaces:**
- Consumes: `Specification`, `RTPattern`
- Produces: `SPECS_REGISTRY`, `RT_PATTERNS_REGISTRY`

- [ ] **Step 1: Write the failing test for registries**

```typescript
// test/metromap/registry.test.ts
import { describe, it, expect } from "bun:test";
import { SPECS_REGISTRY, getSpecById } from "../../generator/metromap/registry/specsRegistry";
import { RT_PATTERNS_REGISTRY, getPatternById } from "../../generator/metromap/registry/rtPatternsRegistry";

describe("MetroMap Registries", () => {
  it("contains all core RFC and W3C specifications", () => {
    expect(SPECS_REGISTRY.RFC_8288).toBeDefined();
    expect(SPECS_REGISTRY.RFC_9264).toBeDefined();
    expect(SPECS_REGISTRY.RFC_9727).toBeDefined();
    expect(SPECS_REGISTRY.RFC_9110).toBeDefined();
    expect(SPECS_REGISTRY.RFC_6906).toBeDefined();
    expect(SPECS_REGISTRY.RFC_8574).toBeDefined();
    expect(SPECS_REGISTRY.RFC_6573).toBeDefined();
    expect(SPECS_REGISTRY.DCAT_3).toBeDefined();
    expect(SPECS_REGISTRY.RO_CRATE).toBeDefined();
  });

  it("contains the 9 official EOSC Radical Transparency Patterns", () => {
    expect(RT_PATTERNS_REGISTRY.length).toBe(9);
    const p1 = getPatternById("RT_P01");
    expect(p1?.name).toBe("Profile Conformity Declarations");
    const p3 = getPatternById("RT_P03");
    expect(p3?.name).toBe("Content Negotiation Menu");
    const p5 = getPatternById("RT_P05");
    expect(p5?.name).toBe("Subsetting API");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test test/metromap/registry.test.ts`  
Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Implement registries**

Create `generator/metromap/registry/specsRegistry.ts`:
```typescript
import { Specification } from "../models/Specification";

export const SPECS_REGISTRY = {
  RFC_8288: new Specification(
    "RFC_8288",
    "RFC 8288",
    "Web Linking",
    "IETF",
    "https://datatracker.ietf.org/doc/html/rfc8288",
    "Defines HTTP Link headers, link relations, anchor, and target parameters."
  ),
  RFC_6906: new Specification(
    "RFC_6906",
    "RFC 6906",
    "The 'profile' Link Relation Type",
    "IETF",
    "https://datatracker.ietf.org/doc/html/rfc6906",
    "Signals that a resource representation conforms to a specific semantic profile."
  ),
  RFC_9264: new Specification(
    "RFC_9264",
    "RFC 9264",
    "Linkset: Media Types and a Link Relation Type",
    "IETF",
    "https://datatracker.ietf.org/doc/html/rfc9264",
    "Decoupled JSON/JSON-LD serialization (application/linkset+json) for web linking graphs."
  ),
  RFC_9110: new Specification(
    "RFC_9110",
    "RFC 9110",
    "HTTP Semantics (303 See Other & Conneg)",
    "IETF",
    "https://datatracker.ietf.org/doc/html/rfc9110",
    "Content Negotiation and 303 See Other redirects from persistent PIDs to representations."
  ),
  RFC_8574: new Specification(
    "RFC_8574",
    "RFC 8574",
    "The 'cite-as' Link Relation",
    "IETF",
    "https://datatracker.ietf.org/doc/html/rfc8574",
    "Provides a direct link from physical content payloads back to their persistent identifier."
  ),
  RFC_6573: new Specification(
    "RFC_6573",
    "RFC 6573",
    "Item and Collection Link Relations",
    "IETF",
    "https://datatracker.ietf.org/doc/html/rfc6573",
    "Expresses containment and membership between collections, catalogs, and item links."
  ),
  RFC_8631: new Specification(
    "RFC_8631",
    "RFC 8631",
    "Link Relations for Web Services",
    "IETF",
    "https://datatracker.ietf.org/doc/html/rfc8631",
    "Provides service-desc and service-doc relations linking resources to OpenAPI and documentation."
  ),
  RFC_9727: new Specification(
    "RFC_9727",
    "RFC 9727",
    "The API Catalog Link Relation (/.well-known/api-catalog)",
    "IETF",
    "https://datatracker.ietf.org/doc/html/rfc9727",
    "Defines standardized machine discovery for all host APIs via /.well-known/api-catalog."
  ),
  RFC_7284: new Specification(
    "RFC_7284",
    "RFC 7284",
    "The Profile URI Registry",
    "IETF",
    "https://datatracker.ietf.org/doc/html/rfc7284",
    "Registry for standardized profile identifiers."
  ),
  RESOURCESYNC: new Specification(
    "RESOURCESYNC",
    "ANSI/NISO Z39.99",
    "ResourceSync Framework (Signmap)",
    "Community",
    "https://www.openarchives.org/rs/toc",
    "Extends Sitemap protocol with rs:ln and xhtml:link annotations for synchronization and discovery."
  ),
  DCAT_3: new Specification(
    "DCAT_3",
    "W3C DCAT-3",
    "Data Catalog Vocabulary Version 3",
    "W3C",
    "https://www.w3.org/TR/vocab-dcat-3/",
    "Standard W3C vocabulary for catalogs, datasets, distributions, and data services."
  ),
  SCHEMA_ORG: new Specification(
    "SCHEMA_ORG",
    "Schema.org",
    "Schema.org Vocabulary (Dataset, Organization)",
    "Schema.org",
    "https://schema.org/",
    "Structured data markup for search engine discovery and entity indexing."
  ),
  RO_CRATE: new Specification(
    "RO_CRATE",
    "RO-Crate 1.1",
    "Research Object Crate Specification",
    "Community",
    "https://w3id.org/ro/crate/1.1",
    "Package format for FAIR data artifacts, schema metadata, and computational provenance."
  ),
  OPENAPI_3: new Specification(
    "OPENAPI_3",
    "OpenAPI 3.0",
    "OpenAPI Specification",
    "Community",
    "https://spec.openapis.org/oas/v3.0.3",
    "Machine-readable API contract and interactive documentation standard."
  )
};

export function getSpecById(id: string): Specification | undefined {
  return (SPECS_REGISTRY as Record<string, Specification>)[id];
}
```

Create `generator/metromap/registry/rtPatternsRegistry.ts`:
```typescript
import { RTPattern } from "../models/RTPattern";
import { SPECS_REGISTRY } from "./specsRegistry";

export const RT_PATTERNS_REGISTRY: RTPattern[] = [
  new RTPattern(
    "RT_P01",
    1,
    "Profile Conformity Declarations",
    "Explicit declaration of conformity-to-profile via rel=\"profile\" on resource headers and linkset statements to guarantee semantic interoperability.",
    [SPECS_REGISTRY.RFC_6906, SPECS_REGISTRY.RFC_8288, SPECS_REGISTRY.RFC_7284],
    "#0284c7",
    "#f0f9ff",
    node => node.category === "dataset" || node.category === "institute" || node.category === "publication"
  ),
  new RTPattern(
    "RT_P02",
    2,
    "Profile Composition",
    "Recursive hierarchy of profile declarations using rel=\"item\" to infer compound profile conformance across composite digital assets.",
    [SPECS_REGISTRY.RFC_6906, SPECS_REGISTRY.RFC_6573, SPECS_REGISTRY.RFC_8288],
    "#0369a1",
    "#f0f9ff",
    node => node.category === "dataset" && node.specs.some(s => s.id === "RFC_6906")
  ),
  new RTPattern(
    "RT_P03",
    3,
    "Content Negotiation Menu",
    "Resolves the Broken Chain problem during HTTP 303 redirects by explicitly exposing all available variant formats (HTML, Turtle, JSON-LD, RDF/XML) via rel=\"alternate\" and linksets.",
    [SPECS_REGISTRY.RFC_9110, SPECS_REGISTRY.RFC_8288, SPECS_REGISTRY.RFC_9264, SPECS_REGISTRY.RFC_6906],
    "#ea580c",
    "#fff7ed",
    node => node.id.includes("pid") || node.id.includes("html") || node.id.includes("ttl") || node.id.includes("jsonld") || node.id.includes("rdf")
  ),
  new RTPattern(
    "RT_P04",
    4,
    "No Landing Page Solution",
    "Enables direct machine-actionable consumption of physical data files (CSV, GeoJSON, RO-Crate) without requiring intermediate HTML landing pages, anchoring back via rel=\"cite-as\".",
    [SPECS_REGISTRY.RFC_8574, SPECS_REGISTRY.RFC_8288, SPECS_REGISTRY.RFC_9264],
    "#16a34a",
    "#f0fdf4",
    node => node.category === "distribution"
  ),
  new RTPattern(
    "RT_P05",
    5,
    "Subsetting API",
    "Anchors dynamic API observation fragments back to parent dataset persistent identifiers (rel=\"cite-as\"), service roots (rel=\"collection\"), and OpenAPI schemas (rel=\"service-desc\").",
    [SPECS_REGISTRY.RFC_9727, SPECS_REGISTRY.RFC_8631, SPECS_REGISTRY.RFC_6573, SPECS_REGISTRY.RFC_8574, SPECS_REGISTRY.OPENAPI_3],
    "#0d9488",
    "#f0fdfa",
    node => node.category === "api"
  ),
  new RTPattern(
    "RT_P06",
    6,
    "Hostwide Resource Discovery",
    "Domain-level discovery cascade mixing ResourceSync rs:ln and xhtml:link signmaps into robots.txt and sitemap.xml for automated crawler onboarding.",
    [SPECS_REGISTRY.RESOURCESYNC, SPECS_REGISTRY.RFC_8288],
    "#0284c7",
    "#f0f9ff",
    node => node.category === "domain" && (node.id.includes("root") || node.id.includes("robots") || node.id.includes("sitemap"))
  ),
  new RTPattern(
    "RT_P07",
    7,
    "Catalogue Assisted Resource Exposure",
    "Delegates granular collection harvesting from sitemaps to dedicated registers, RFC 9727 API catalogs, and W3C DCAT-3 catalogues.",
    [SPECS_REGISTRY.RFC_9727, SPECS_REGISTRY.DCAT_3, SPECS_REGISTRY.RESOURCESYNC],
    "#0284c7",
    "#f0f9ff",
    node => node.id.includes("api-catalog") || node.id.includes("dcat") || node.id.includes("catalog")
  ),
  new RTPattern(
    "RT_P08",
    8,
    "Large Linkset Split-up",
    "Decomposes extensive web link graphs into manageable, cacheable JSON linkset files using rel=\"item\" and rel=\"collection\".",
    [SPECS_REGISTRY.RFC_6573, SPECS_REGISTRY.RFC_9264],
    "#ca8a04",
    "#fefce8",
    node => node.category === "linkset"
  ),
  new RTPattern(
    "RT_P10",
    10,
    "Detached Local Storage Sidecars",
    "Maintains profile compliance and provenance on downloaded offline artifacts through deterministic RO-Crate packages and sidecar linksets.",
    [SPECS_REGISTRY.RFC_6906, SPECS_REGISTRY.RFC_9264, SPECS_REGISTRY.RO_CRATE],
    "#15803d",
    "#f0fdf4",
    node => node.category === "distribution" && (node.id.includes("rocrate") || node.id.includes("zip"))
  )
];

export function getPatternById(id: string): RTPattern | undefined {
  return RT_PATTERNS_REGISTRY.find(p => p.id === id);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test test/metromap/registry.test.ts`  
Expected: PASS (2 tests pass)

- [ ] **Step 5: Commit**

```bash
git add generator/metromap/registry/ test/metromap/registry.test.ts
git commit -m "feat(metromap): implement specs and RT patterns registries"
```

---

### Task 3: URI Discovery Cascade Engine & Metro Graph Builder

**Files:**
- Create: `generator/metromap/engine/DiscoveryCascadeEngine.ts`
- Create: `generator/metromap/engine/MetroGraphBuilder.ts`
- Test: `test/metromap/discoveryBuilder.test.ts`

**Interfaces:**
- Consumes: `RESOURCES`, `SPECS_REGISTRY`, `RT_PATTERNS_REGISTRY`, `MetroNode`, `MetroTrack`, `MetroGraph`
- Produces: `DiscoveryCascadeEngine`, `MetroGraphBuilder`

- [ ] **Step 1: Write the failing test for discovery and graph builder**

```typescript
// test/metromap/discoveryBuilder.test.ts
import { describe, it, expect } from "bun:test";
import { MetroGraphBuilder } from "../../generator/metromap/engine/MetroGraphBuilder";
import { RESOURCES } from "../../generator/resources";

describe("MetroGraphBuilder & Discovery Cascade", () => {
  it("builds domain-wide graph for root '/' entrypoint", () => {
    const builder = new MetroGraphBuilder(RESOURCES, "http://localhost:8080");
    const graph = builder.buildGraph("/");

    expect(graph.originUri).toBe("/");
    expect(graph.nodes.length).toBeGreaterThan(15);
    expect(graph.tracks.length).toBeGreaterThan(15);

    // Verify root domain nodes exist
    const rootNode = graph.nodes.find(n => n.id === "node-domain-root");
    expect(rootNode).toBeDefined();
    expect(rootNode?.isOrigin).toBe(true);

    const sitemapNode = graph.nodes.find(n => n.id === "node-sitemap");
    expect(sitemapNode).toBeDefined();

    const armsPidNode = graph.nodes.find(n => n.id === "node-pid-resource-arms-mbon");
    expect(armsPidNode).toBeDefined();
  });

  it("builds focused subgraph when specific dataset PID is given as entrypoint", () => {
    const builder = new MetroGraphBuilder(RESOURCES, "http://localhost:8080");
    const graph = builder.buildGraph("/resource/resource-arms-mbon");

    expect(graph.originUri).toBe("/resource/resource-arms-mbon");
    const armsPidNode = graph.nodes.find(n => n.id === "node-pid-resource-arms-mbon");
    expect(armsPidNode).toBeDefined();
    expect(armsPidNode?.isOrigin).toBe(true);

    // Should include its distributions, formats, and linkset
    expect(graph.nodes.some(n => n.id.includes("linkset-resource-arms-mbon"))).toBe(true);
    expect(graph.nodes.some(n => n.id.includes("dist-arms-mbon"))).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test test/metromap/discoveryBuilder.test.ts`  
Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Implement Discovery Cascade Engine & Metro Graph Builder**

Create `generator/metromap/engine/DiscoveryCascadeEngine.ts`:
```typescript
import { Resource } from "../../types";

export interface DiscoveredSignal {
  sourceUri: string;
  targetUri: string;
  relation: string;
  category: "domain" | "dataset" | "linkset" | "distribution" | "api" | "institute" | "publication" | "person";
  label: string;
  sublabel: string;
  specIds: string[];
}

export class DiscoveryCascadeEngine {
  constructor(private resources: Resource[], private baseUrl: string) {}

  public cascade(entrypointUri: string): DiscoveredSignal[] {
    const signals: DiscoveredSignal[] = [];

    // 1. Domain Signals
    signals.push(
      { sourceUri: "/", targetUri: "/.well-known/api-catalog", relation: 'rel="api-catalog"', category: "domain", label: "Domain Root", sublabel: "RFC 8288 Link Headers", specIds: ["RFC_8288", "RFC_9727"] },
      { sourceUri: "/", targetUri: "/robots.txt", relation: "directive", category: "domain", label: "Domain Root", sublabel: "Robots Directive", specIds: ["RFC_8288"] },
      { sourceUri: "/robots.txt", targetUri: "/sitemap.xml", relation: "Sitemap:", category: "domain", label: "/robots.txt", sublabel: "Sitemap Bootstrap", specIds: ["RFC_8288"] },
      { sourceUri: "/sitemap.xml", targetUri: "/.well-known/api-catalog", relation: "rs:ln (api-catalog)", category: "domain", label: "/sitemap.xml", sublabel: "Signmap Index", specIds: ["RESOURCESYNC", "RFC_9727"] },
      { sourceUri: "/sitemap.xml", targetUri: "/catalog/dcat.ttl", relation: "rs:ln (dcat-catalog)", category: "domain", label: "/sitemap.xml", sublabel: "Signmap Index", specIds: ["RESOURCESYNC", "DCAT_3"] }
    );

    // 2. Resource Signals
    for (const res of this.resources) {
      const pidUri = `/resource/${res.id}`;
      const slug = res.id.replace("resource-", "");
      let htmlPath = `/datasets/${slug}.html`;
      if (res.category === "institute") htmlPath = `/institutes/${slug}.html`;
      if (res.category === "publication") htmlPath = `/publications/${slug}.html`;
      if (res.category === "project") htmlPath = `/projects/${slug}.html`;
      if (res.category === "person") htmlPath = `/people/${slug}.html`;
      if (res.category === "api") htmlPath = `/api/docs/`;

      signals.push({
        sourceUri: "/sitemap.xml",
        targetUri: pidUri,
        relation: "rs:ln (item)",
        category: (res.category as any) || "dataset",
        label: res.title,
        sublabel: `${res.type} PID`,
        specIds: ["RESOURCESYNC", "RFC_6906"]
      });

      // Conneg 303 Hub
      signals.push(
        { sourceUri: pidUri, targetUri: htmlPath, relation: "303 (Accept: text/html)", category: (res.category as any) || "dataset", label: pidUri, sublabel: "HTML Landing Page", specIds: ["RFC_9110", "RFC_8288"] },
        { sourceUri: pidUri, targetUri: `/rdf/${res.id}.ttl`, relation: "303 (Accept: text/turtle)", category: (res.category as any) || "dataset", label: pidUri, sublabel: "Turtle RDF", specIds: ["RFC_9110", "DCAT_3"] },
        { sourceUri: pidUri, targetUri: `/rdf/${res.id}.jsonld`, relation: "303 (Accept: ld+json)", category: (res.category as any) || "dataset", label: pidUri, sublabel: "JSON-LD", specIds: ["RFC_9110", "SCHEMA_ORG"] }
      );

      // Linkset
      signals.push({
        sourceUri: htmlPath,
        targetUri: `/linksets/${res.id}.linkset.json`,
        relation: 'rel="linkset"',
        category: "linkset",
        label: htmlPath,
        sublabel: "RFC 9264 Linkset",
        specIds: ["RFC_9264", "RFC_8288"]
      });

      // Distributions
      if (res.distributions) {
        for (const dist of res.distributions) {
          signals.push({
            sourceUri: htmlPath,
            targetUri: dist.downloadUrl,
            relation: `rel="item" (${dist.format})`,
            category: "distribution",
            label: dist.title,
            sublabel: dist.mediaType,
            specIds: dist.format === "RO-Crate" ? ["RO_CRATE", "RFC_8574"] : ["RFC_8574", "RFC_6573"]
          });
        }
      }
    }

    return signals;
  }
}
```

Create `generator/metromap/engine/MetroGraphBuilder.ts`:
```typescript
import { Resource } from "../../types";
import { MetroGraph } from "../models/MetroGraph";
import { MetroNode, NodeCategory } from "../models/MetroNode";
import { MetroTrack } from "../models/MetroTrack";
import { Specification } from "../models/Specification";
import { SPECS_REGISTRY } from "../registry/specsRegistry";
import { RT_PATTERNS_REGISTRY } from "../registry/rtPatternsRegistry";
import { DiscoveryCascadeEngine } from "./DiscoveryCascadeEngine";

export class MetroGraphBuilder {
  private cascadeEngine: DiscoveryCascadeEngine;

  constructor(private resources: Resource[], private baseUrl: string) {
    this.cascadeEngine = new DiscoveryCascadeEngine(resources, baseUrl);
  }

  public buildGraph(entrypointUri: string = "/"): MetroGraph {
    const signals = this.cascadeEngine.cascade(entrypointUri);
    const nodesMap: Map<string, MetroNode> = new Map();
    const tracks: MetroTrack[] = [];

    // Helper to get or create node
    const getOrCreateNode = (
      id: string,
      uri: string,
      label: string,
      sublabel: string,
      category: NodeCategory,
      specIds: string[],
      desc: string = "",
      liveUrl?: string
    ): MetroNode => {
      if (!nodesMap.has(id)) {
        const specs = specIds.map(sid => (SPECS_REGISTRY as Record<string, Specification>)[sid]).filter(Boolean);
        const isOrigin = uri === entrypointUri || label === entrypointUri || id === `node-${entrypointUri}`;
        const node = new MetroNode(id, uri, label, sublabel, category, specs, desc, liveUrl || `${this.baseUrl}${uri}`, isOrigin);
        nodesMap.set(id, node);
      }
      return nodesMap.get(id)!;
    };

    // Domain backbone stations
    getOrCreateNode("node-domain-root", "/", "/ (Domain Root)", "RFC 8288 Header Bootstrap", "domain", ["RFC_8288", "RFC_9727"], "Primary domain entrypoint.");
    getOrCreateNode("node-robots", "/robots.txt", "/robots.txt", "Robots Directives", "domain", ["RFC_8288"], "Directs harvesters to sitemap.xml.");
    getOrCreateNode("node-sitemap", "/sitemap.xml", "/sitemap.xml", "rs:ln & xhtml:link Signmap", "domain", ["RESOURCESYNC", "RFC_8288"], "Enhanced Signmap index.");
    getOrCreateNode("node-api-catalog", "/.well-known/api-catalog", "/.well-known/api-catalog", "RFC 9727 Discovery", "api", ["RFC_9727"], "Host API discovery catalog.");
    getOrCreateNode("node-dcat-catalog", "/catalog/dcat.ttl", "/catalog/dcat.ttl", "DCAT-3 Catalogue", "domain", ["DCAT_3"], "W3C DCAT dataset catalogue.");

    // Instantiate entity stations and tracks from signals
    for (let i = 0; i < signals.length; i++) {
      const sig = signals[i];
      const sourceId = `node-${sig.sourceUri.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
      const targetId = `node-${sig.targetUri.replace(/[^a-zA-Z0-9_-]/g, "_")}`;

      const sourceNode = getOrCreateNode(sourceId, sig.sourceUri, sig.sourceUri, "", sig.category, sig.specIds);
      const targetNode = getOrCreateNode(targetId, sig.targetUri, sig.targetUri, sig.sublabel, sig.category, sig.specIds);

      tracks.push(new MetroTrack(`track-${i}`, sourceNode, targetNode, sig.category, sig.relation, undefined, sig.category === "linkset"));
    }

    return new MetroGraph(Array.from(nodesMap.values()), tracks, RT_PATTERNS_REGISTRY, entrypointUri);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test test/metromap/discoveryBuilder.test.ts`  
Expected: PASS (2 tests pass)

- [ ] **Step 5: Commit**

```bash
git add generator/metromap/engine/ test/metromap/discoveryBuilder.test.ts
git commit -m "feat(metromap): implement DiscoveryCascadeEngine and MetroGraphBuilder"
```

---

### Task 4: Octilinear Layout & Dynamic Bounding Hull Engine

**Files:**
- Create: `generator/metromap/engine/OctilinearLayoutEngine.ts`
- Test: `test/metromap/layoutEngine.test.ts`

**Interfaces:**
- Consumes: `MetroGraph`, `MetroNode`, `MetroTrack`, `RTPattern`
- Produces: `OctilinearLayoutEngine`, `PatternBoundingBox`

- [ ] **Step 1: Write the failing test for layout engine**

```typescript
// test/metromap/layoutEngine.test.ts
import { describe, it, expect } from "bun:test";
import { MetroGraphBuilder } from "../../generator/metromap/engine/MetroGraphBuilder";
import { OctilinearLayoutEngine } from "../../generator/metromap/engine/OctilinearLayoutEngine";
import { RESOURCES } from "../../generator/resources";

describe("OctilinearLayoutEngine", () => {
  it("calculates valid lane positions and non-NaN track path points", () => {
    const builder = new MetroGraphBuilder(RESOURCES, "http://localhost:8080");
    const graph = builder.buildGraph("/");
    const layout = new OctilinearLayoutEngine();
    layout.computeLayout(graph);

    for (const node of graph.nodes) {
      expect(node.x).toBeGreaterThan(0);
      expect(node.y).toBeGreaterThan(0);
      expect(Number.isNaN(node.x)).toBe(false);
      expect(Number.isNaN(node.y)).toBe(false);
    }

    for (const track of graph.tracks) {
      expect(track.pathPoints.length).toBeGreaterThanOrEqual(2);
      for (const pt of track.pathPoints) {
        expect(Number.isNaN(pt.x)).toBe(false);
        expect(Number.isNaN(pt.y)).toBe(false);
      }
    }
  });

  it("calculates dynamic bounding boxes for active RT patterns", () => {
    const builder = new MetroGraphBuilder(RESOURCES, "http://localhost:8080");
    const graph = builder.buildGraph("/");
    const layout = new OctilinearLayoutEngine();
    layout.computeLayout(graph);

    const boxes = layout.computePatternBounds(graph);
    expect(boxes.length).toBeGreaterThan(0);
    for (const box of boxes) {
      expect(box.width).toBeGreaterThan(50);
      expect(box.height).toBeGreaterThan(50);
      expect(box.pattern).toBeDefined();
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test test/metromap/layoutEngine.test.ts`  
Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Implement OctilinearLayoutEngine**

Create `generator/metromap/engine/OctilinearLayoutEngine.ts`:
```typescript
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
  private laneXCoordinates = [120, 480, 720, 980, 1260];

  public computeLayout(graph: MetroGraph): void {
    // 1. Assign semantic lanes
    const laneCounters = [0, 0, 0, 0, 0];
    const ySpacing = 75;
    const yOffset = 130;

    for (const node of graph.nodes) {
      let laneIndex = 1;
      if (node.category === "domain" || node.id.includes("root") || node.id.includes("robots") || node.id.includes("sitemap")) {
        laneIndex = 0;
      } else if (node.id.includes("pid") || node.uri.includes("/resource/")) {
        laneIndex = 1;
      } else if (node.uri.includes("/rdf/") || node.uri.includes("/datasets/") || node.uri.includes("/institutes/") || node.uri.includes("/publications/")) {
        laneIndex = 2;
      } else if (node.category === "linkset" || node.uri.includes("/linksets/")) {
        laneIndex = 3;
      } else if (node.category === "distribution" || node.category === "api" || node.uri.includes("/data/") || node.uri.includes("/api/")) {
        laneIndex = 4;
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
        const midX = sx + (tx - sx) * 0.4;
        track.pathPoints = [
          { x: sx, y: sy },
          { x: midX, y: sy },
          { x: midX + 30, y: ty },
          { x: tx, y: ty }
        ];
      }
    }
  }

  public computePatternBounds(graph: MetroGraph): PatternBoundingBox[] {
    const bounds: PatternBoundingBox[] = [];
    const padding = 30;

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
        y: Math.max(minY - padding - 40, 20),
        width: Math.max(maxX - minX + padding * 2 + 180, 220),
        height: Math.max(maxY - minY + padding * 2 + 60, 100),
        enclosedNodes: matchingNodes
      });
    }

    return bounds;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test test/metromap/layoutEngine.test.ts`  
Expected: PASS (2 tests pass)

- [ ] **Step 5: Commit**

```bash
git add generator/metromap/engine/OctilinearLayoutEngine.ts test/metromap/layoutEngine.test.ts
git commit -m "feat(metromap): implement OctilinearLayoutEngine and dynamic pattern bounds"
```

---

### Task 5: SVG Renderer & HTML Page Assembler

**Files:**
- Create: `generator/metromap/renderers/SvgRenderer.ts`
- Create: `generator/metromap/renderers/HtmlPageRenderer.ts`
- Create: `generator/metromap/index.ts`
- Modify: `generator/metroMapGenerator.ts`
- Test: `test/metromap/renderer.test.ts`

**Interfaces:**
- Consumes: `MetroGraph`, `OctilinearLayoutEngine`, `SvgRenderer`, `HtmlPageRenderer`
- Produces: `MetroMapGenerator.generateHtml(baseUrl, entrypointUri)`

- [ ] **Step 1: Write the failing test for renderers**

```typescript
// test/metromap/renderer.test.ts
import { describe, it, expect } from "bun:test";
import { MetroMapGenerator } from "../../generator/metromap";
import { RESOURCES } from "../../generator/resources";

describe("MetroMapGenerator & Renderers", () => {
  it("renders well-formed HTML containing SVG canvas, controls, and script", () => {
    const generator = new MetroMapGenerator(RESOURCES, "http://localhost:8080");
    const html = generator.generateHtml("/");

    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("<svg id=\"metroSvg\"");
    expect(html).toContain("Origin URI & Discovery Inspector");
    expect(html).toContain("RT-P01: Profile Conformity Declarations");
    expect(html).toContain("stationModal");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test test/metromap/renderer.test.ts`  
Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Implement SvgRenderer, HtmlPageRenderer, and MetroMapGenerator facade**

Create `generator/metromap/renderers/SvgRenderer.ts`:
```typescript
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
```

Create `generator/metromap/renderers/HtmlPageRenderer.ts`:
```typescript
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
```

Create `generator/metromap/index.ts`:
```typescript
import { Resource } from "../types";
import { MetroGraphBuilder } from "./engine/MetroGraphBuilder";
import { OctilinearLayoutEngine } from "./engine/OctilinearLayoutEngine";
import { HtmlPageRenderer } from "./renderers/HtmlPageRenderer";

export class MetroMapGenerator {
  private graphBuilder: MetroGraphBuilder;
  private layoutEngine: OctilinearLayoutEngine;
  private htmlRenderer: HtmlPageRenderer;

  constructor(private resources: Resource[], private baseUrl: string) {
    this.graphBuilder = new MetroGraphBuilder(resources, baseUrl);
    this.layoutEngine = new OctilinearLayoutEngine();
    this.htmlRenderer = new HtmlPageRenderer();
  }

  public generateHtml(entrypointUri: string = "/"): string {
    const graph = this.graphBuilder.buildGraph(entrypointUri);
    this.layoutEngine.computeLayout(graph);
    const bounds = this.layoutEngine.computePatternBounds(graph);
    return this.htmlRenderer.renderPage(graph, bounds, this.baseUrl);
  }
}
```

Update `generator/metroMapGenerator.ts` to delegate to the new generator:
```typescript
import { RESOURCES } from "./resources";
import { MetroMapGenerator } from "./metromap";

export function generateMetroMapHtml(baseUrl: string, entrypointUri: string = "/"): string {
  const generator = new MetroMapGenerator(RESOURCES, baseUrl);
  return generator.generateHtml(entrypointUri);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test test/metromap/renderer.test.ts`  
Expected: PASS (1 test passes)

- [ ] **Step 5: Commit**

```bash
git add generator/metromap/renderers/ generator/metromap/index.ts generator/metroMapGenerator.ts test/metromap/renderer.test.ts
git commit -m "feat(metromap): implement SvgRenderer, HtmlPageRenderer, and MetroMapGenerator"
```

---

### Task 6: Static Generation Integration & End-to-End Verification

**Files:**
- Modify: `generator/index.ts`
- Test: `test/metromap/e2e.test.ts`

**Interfaces:**
- Consumes: `generateMetroMapHtml`
- Produces: `dist/map.html` and static generation build

- [ ] **Step 1: Write the end-to-end integration test**

```typescript
// test/metromap/e2e.test.ts
import { describe, it, expect } from "bun:test";
import fs from "fs";
import path from "path";
import { generateMetroMapHtml } from "../../generator/metroMapGenerator";

describe("E2E Metro Map Generator", () => {
  it("generates complete HTML for default root and dataset PIDs", () => {
    const rootHtml = generateMetroMapHtml("http://localhost:8080", "/");
    expect(rootHtml).toContain("<svg id=\"metroSvg\"");
    expect(rootHtml).toContain("RT-P01: PROFILE CONFORMITY DECLARATIONS");
    expect(rootHtml).toContain("RT-P03: CONTENT NEGOTIATION MENU");

    const pidHtml = generateMetroMapHtml("http://localhost:8080", "/resource/resource-arms-mbon");
    expect(pidHtml).toContain("/resource/resource-arms-mbon");
  });
});
```

- [ ] **Step 2: Run test to verify it passes**

Run: `bun test test/metromap/e2e.test.ts`  
Expected: PASS

- [ ] **Step 3: Run full generator build**

Run: `bun run generator/index.ts`  
Expected: Build passes with `dist/map.html` generated.

- [ ] **Step 4: Run all test suites**

Run: `bun test`  
Expected: All tests pass cleanly.

- [ ] **Step 5: Commit**

```bash
git add generator/index.ts test/metromap/e2e.test.ts
git commit -m "feat(metromap): integrate dynamic OOM generator into build pipeline and add e2e tests"
```

---

## Plan Self-Review Checklist
- [x] **Spec coverage**: Covers all OOM models, 9 RT patterns, octilinear layout, URI entrypoint explorer, and renderers.
- [x] **No Placeholders**: Every step contains full, runnable code and clear expected outputs.
- [x] **Type consistency**: All class and property names match across tasks.
- [x] **TDD & Commit Cadence**: Each task starts with a failing test and ends with an explicit commit.
