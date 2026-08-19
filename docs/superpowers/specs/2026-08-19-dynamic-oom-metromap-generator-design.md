# Design Spec: Dynamic OOM Metro Map Generator & Radical Transparency Topology Engine

**Date:** 2026-08-19  
**Status:** Approved by User  
**Target:** `generator/metromap/` & `dist/map.html`  

---

## 1. Executive Summary

This specification outlines the architecture for transforming the hardcoded SVG `metromapgenerator` into a dynamic, Object-Oriented Modeling (OOM) **Linked Open Data Discovery & Topology Engine**. 

The system models the web of linked marine research data as an authentic transit/subway map. It introduces a **URI-Centric Discovery Cascade Engine** that can take *any* origin URI (defaulting to the domain root `/` or focusing on a specific dataset PID, HTML landing page, or API endpoint) and dynamically trace its discovery graph, route octilinear transit lines, and calculate visual boundary blocks for **Radical Transparency (RT) Linkset Usage Patterns (LSUP)** and standard RFC/W3C specifications.

---

## 2. Key Architecture & Design Principles

1. **Object-Oriented Modeling (OOM) Compliance**: Strict separation between Domain Graph Models (`MetroNode`, `MetroTrack`, `MetroGraph`), Standard Specifications (`Specification`), Pattern Registries (`RTPattern`), Layout Engines (`OctilinearLayoutEngine`), Discovery Cascade Logic (`DiscoveryCascadeEngine`), and Renderers (`SvgRenderer`, `HtmlPageRenderer`).
2. **URI-Centric Dynamic Discovery**: The graph can be centered on any arbitrary URI identifier. The engine cascades outward through domain directives (`robots.txt`, `sitemap.xml` with `rs:ln`), content negotiation hubs (HTTP 303), web linking headers (RFC 8288), standalone JSON linksets (RFC 9264), physical data payloads (CSV, GeoJSON, RO-Crate ZIP), and API catalogs (RFC 9727).
3. **Multi-Spec Radical Transparency Pattern Enclosures**: Official integration with the EOSC Semantic Interoperability Radical Transparency Linkset Usage Patterns (RT-P01 through RT-P08 and RT-P10). Each pattern is a first-class visual block enclosing its constituent stations and badging its underlying RFC standards.
4. **Isomorphic Dual-Engine Architecture**: 
   - **Build-Time**: Generates clean, fast-loading, pre-rendered static SVG maps into `dist/map.html` during the static site build.
   - **Browser Runtime**: Embedded client-side engine enabling instant interactive exploration, URI switching, and live layout recalculation in the browser.

---

## 3. Directory & Module Structure

```
generator/
├── metromap/
│   ├── models/
│   │   ├── MetroNode.ts              # Vertex model (URI, label, category, lane, specs)
│   │   ├── MetroTrack.ts             # Directed edge model (source, target, lineType, relationLabel)
│   │   ├── MetroGraph.ts             # Graph aggregate container
│   │   ├── Specification.ts          # RFC / W3C standard entity
│   │   └── RTPattern.ts              # Radical Transparency Pattern entity
│   ├── registry/
│   │   ├── specsRegistry.ts          # RFC 8288, RFC 9264, RFC 9727, RFC 9110, DCAT-3, etc.
│   │   └── rtPatternsRegistry.ts     # RT-P01 to RT-P10 pattern definitions
│   ├── engine/
│   │   ├── DiscoveryCascadeEngine.ts # Evaluates discovery signals from any entry URI
│   │   ├── MetroGraphBuilder.ts      # Builds MetroGraph from resources & discovery signals
│   │   └── OctilinearLayoutEngine.ts # Computes lane coordinates, 90°/45° turns, and dynamic bounding boxes
│   ├── renderers/
│   │   ├── SvgRenderer.ts            # Generates semantic SVG markup, markers, tracks, and stations
│   │   └── HtmlPageRenderer.ts       # Renders complete interactive HTML page with controls & modal
│   └── index.ts                      # Public API: MetroMapGenerator orchestrator class
├── metroMapGenerator.ts              # Facade exporting generateMetroMapHtml for backwards compatibility
└── index.ts                          # Main static site generator entrypoint
```

---

## 4. Domain Models & Class Specifications

### 4.1 Specification Class
Encapsulates individual RFCs, W3C Recommendations, and community standards:
```typescript
export class Specification {
  constructor(
    public readonly id: string, // e.g. "RFC_9264"
    public readonly code: string, // e.g. "RFC 9264"
    public readonly name: string, // e.g. "Linkset: Media Types and a Link Relation Type"
    public readonly publisher: "IETF" | "W3C" | "OGC" | "Schema.org" | "Community",
    public readonly specUrl: string,
    public readonly description: string
  ) {}
}
```

### 4.2 Radical Transparency Pattern Class
Encapsulates multi-spec patterns and node matching predicates:
```typescript
export class RTPattern {
  constructor(
    public readonly id: string, // e.g. "RT_P03_CONNEG_MENU"
    public readonly number: number, // e.g. 3
    public readonly name: string, // e.g. "Content Negotiation Menu"
    public readonly description: string,
    public readonly specs: Specification[], // e.g. [RFC_9110, RFC_8288, RFC_9264, RFC_6906]
    public readonly themeColor: string, // e.g. "#ea580c"
    public readonly bgTint: string, // e.g. "#fff7ed"
    public readonly matchesNode: (node: MetroNode) => boolean
  ) {}
}
```

### 4.3 MetroNode (Station Node)
```typescript
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
    public readonly category: "domain" | "dataset" | "linkset" | "distribution" | "api" | "institute" | "publication" | "person",
    public readonly specs: Specification[],
    public readonly description: string,
    public readonly liveUrl?: string,
    public readonly isOrigin: boolean = false
  ) {}
}
```

### 4.4 MetroTrack (Transit Track)
```typescript
export class MetroTrack {
  public pathPoints: { x: number; y: number }[] = [];

  constructor(
    public readonly id: string,
    public readonly source: MetroNode,
    public readonly target: MetroNode,
    public readonly lineType: "domain" | "dataset" | "linkset" | "distribution" | "api" | "institute" | "person",
    public readonly relationLabel?: string,
    public readonly strokeColor?: string,
    public readonly isDashed: boolean = false
  ) {}
}
```

---

## 5. Official Radical Transparency Linkset Usage Patterns (LSUP) Registry

The generator implements the official EOSC Radical Transparency patterns:

| Pattern ID | Pattern Name | Encompassed Specifications | Primary Mechanism & Signals |
| :--- | :--- | :--- | :--- |
| **`RT-P01`** | **Profile Conformity Declarations** | `RFC 6906`, `RFC 8288`, `RFC 7284` | `rel="profile"` header and linkset statements declaring conformance to schemas. |
| **`RT-P02`** | **Profile Composition** | `RFC 6906`, `RFC 6573`, `RFC 8288` | `rel="item"` relations connecting composite `<profile-uri>`s. |
| **`RT-P03`** | **Content Negotiation Menu** | `RFC 9110 (303)`, `RFC 8288`, `RFC 9264`, `RFC 6906` | Resolves "Broken Chain" on 303 redirects via `rel="alternate"`, `rel="self"`, `rel="linkset"`. |
| **`RT-P04`** | **No Landing Page Solution** | `RFC 8574`, `RFC 8288`, `RFC 9264` | `rel="cite-as"` and `rel="describedby"` anchoring data downloads directly back to PID. |
| **`RT-P05`** | **Subsetting API** | `RFC 9727`, `RFC 8631`, `RFC 6573`, `RFC 8574`, `OpenAPI 3.0` | `rel="collection"` to API base, `rel="cite-as"` to dataset PID, `rel="service-desc"` to OpenAPI. |
| **`RT-P06`** | **Hostwide Resource Discovery** | `ResourceSync (Z39.99)`, `Sitemaps.org`, `WHATWG XHTML`, `RFC 8288` | XML-namespace mixin in `sitemap.xml` with `<rs:ln>` and `<xhtml:link>` signmaps. |
| **`RT-P07`** | **Catalogue Assisted Resource Exposure** | `RFC 9727`, `W3C DCAT-3`, `Sitemaps Hierarchy`, `ResourceSync` | Sitemap index delegating to RFC 9727 `api-catalog` and W3C DCAT-3 catalogue. |
| **`RT-P08`** | **Large Linkset Split-up** | `RFC 6573`, `RFC 9264` | Decomposing large linksets into cached fragments using `rel="item"` / `rel="collection"`. |
| **`RT-P10`** | **Detached Local Storage Sidecars** | `RFC 6906`, `RFC 9264`, `RO-Crate 1.1` | Preserving profile compliance on downloaded files via `.linkset.json` and RO-Crate packages. |

---

## 6. Layout & Routing Engine (`OctilinearLayoutEngine`)

The layout engine organizes stations into 5 semantic transit lanes:
* **Lane 0 (Domain Entry & Catalogs)**: `x = 120` (Domain Root, Robots.txt, Sitemap.xml, API Catalog, DCAT-3).
* **Lane 1 (Persistent Identifiers & Conneg 303 Hubs)**: `x = 520` (`/resource/:id`).
* **Lane 2 (Representations & Semantic Profiles)**: `x = 720` (HTML Landing Pages, Turtle, JSON-LD, RDF/XML).
* **Lane 3 (Decoupled JSON Linksets)**: `x = 1000` (`/linksets/:id.linkset.json`).
* **Lane 4 (Physical Payloads & APIs)**: `x = 1260` (CSV, GeoJSON, RO-Crate ZIP, OpenAPI / Swagger UI).

### Track Routing Rules:
- Lines connect stations using horizontal lines, vertical trunks, and smooth 45° bends (`M x1 y1 L x2 y2...`).
- Automated vertical offset calculation between parallel tracks prevents line overlaps.
- Dynamic bounding boxes expand around nodes belonging to each `RTPattern` with a 24px padding margin and styled header badges.

---

## 7. Interactive Web Experience (`dist/map.html`)

1. **Origin URI Explorer Bar**:
   - Autocomplete dropdown of known catalog URIs + freeform URL text input.
   - Triggers the `DiscoveryCascadeEngine` client-side, re-centering the transit map on the chosen URI and highlighting its active RT patterns.
2. **Dual Filtering System**:
   - **Pattern Filter Pills**: Select any RT Pattern (RT-P01 through RT-P10) to highlight its bounding box and dim unrelated elements.
   - **Specification Filter Pills**: Filter transit lines by standard (`[RFC 8288]`, `[RFC 9264]`, `[RFC 9727]`, `[RFC 9110]`, `[DCAT-3]`, `[RO-Crate]`).
3. **Station & Pattern Inspector Modal**:
   - Displays station identity, URI, live resource link, implemented RFC specifications with links, and live HTTP header snippets with reproducible `curl` commands.
4. **Pan & Zoom Canvas**:
   - Smooth mouse drag panning, zoom controls (+, -, reset), and SVG responsive scaling.

---

## 8. Verification & Test Plan

1. **Unit Tests (`test/metromap.test.ts`)**:
   - Test `DiscoveryCascadeEngine` produces complete node/edge graphs for root `/` and individual dataset PIDs.
   - Test `OctilinearLayoutEngine` computes valid non-overlapping coordinates and dynamic bounding boxes for all active RT patterns.
   - Test `SvgRenderer` generates valid, well-formed SVG without NaN or invalid path strings.
2. **Static Generation Verification**:
   - Run `bun run generator/index.ts` and ensure `dist/map.html` is generated without errors.
3. **Browser Verification**:
   - Launch local server (`docker compose up` or local preview).
   - Test changing the Origin URI in the explorer bar to verify dynamic client-side graph re-rendering.
   - Test pattern and specification filter pills.
   - Open the station inspector modal on various nodes (PID, Linkset, CSV distribution, API docs) to verify metadata correctness.
