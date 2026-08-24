# Design Specification: Unified 4-Corridor Metro Map Canvas & Advanced Interactive Tooling

## 1. Overview
This specification details the overhaul of the Linked Open Data (LOD) Protocol Metro Map (`/map.html`) into an interactive, visually rich, 4-corridor architectural canvas with live simulation and debugging tooling.

It translates the theoretical **EOSC Radical Transparency 4-Layer Interlocking Web** (RT-P01 through RT-P10) into a structured visual experience:
- **Layer 1**: Hostwide Discovery & Catalog Assistance (RT-P06 & RT-P07)
- **Layer 2**: Content Negotiation & Broken Chain Resolution (RT-P03)
- **Layer 3**: Profile Declarations & Composition Hierarchy (RT-P01 & RT-P02)
- **Layer 4**: Direct Data Payloads, Subsetting API, Split Linksets & Offline Sidecars (RT-P04, RT-P05, RT-P08, RT-P10)

---

## 2. Architecture & Components

```
+---------------------------------------------------------------------------------------------------------+
|                                    METRO MAP CONTROLS & HUD TOOLBAR                                     |
|  [🔍 Search & Spotlight PIDs/Files]  [🤖 Crawler Simulator: ▶ Play / Scenarios]  [🎛️ Multi-Filters]    |
+---------------------------------------------------------------------------------------------------------+
|  CANVAS (Unified 4-Corridor Swimlanes)                                                                 |
|                                                                                                         |
|  [ LAYER 1: HOSTWIDE DISCOVERY & CATALOG ASSISTANCE (RT-P06 & RT-P07) ]  (Soft Blue #f0f9ff)            |
|    /robots.txt ---> /sitemap-index.xml ---> /sitemap.xml ---> /catalog/dcat.ttl                         |
|                                         \--> /sitemap-catalog.xml ---> /.well-known/api-catalog         |
|         |                                      |                                                        |
|         | rs:ln rel="linkset"                  | rs:ln rel="type"                                       |
|         v                                      v                                                        |
|  [ LAYER 2: CONTENT NEGOTIATION & 303 PID HUBS (RT-P03) ]  (Soft Amber #fff7ed)                         |
|    /id/dataset/arms-mbon (PID Hub)                                                                      |
|      +-- 303 (HTML) ---> /id/dataset/arms-mbon.html                                                     |
|      +-- 303 (Turtle) -> /id/dataset/arms-mbon.ttl (rel="describes" -> PID)                             |
|      +-- 303 (JSON-LD) > /id/dataset/arms-mbon.jsonld                                                   |
|         |                                      |                                                        |
|         | rel="profile" (RT-P01)               | rel="linkset" (RFC 9264)                               |
|         v                                      v                                                        |
|  [ LAYER 3: PROFILES CONFORMITY & COMPOSITION HIERARCHY (RT-P01 & RT-P02) ]  (Soft Indigo #eef2ff)     |
|    /id/profile/marine-genomic-dataset-profile.html (Composite Profile)                                  |
|      +-- rel="http://schema.org/hasPart" (RT-P02) ---> dna-metabarcoding-profile.html                   |
|      +-- rel="http://schema.org/hasPart" (RT-P02) ---> marine-ecological-baseline-profile.html          |
|      +-- rel="http://schema.org/hasPart" (RT-P02) ---> ro-crate-package-profile.html                   |
|         |                                                                                               |
|         | rel="cite-as" (RT-P04 / RT-P05 / RT-P10)                                                      |
|         v                                                                                               |
|  [ LAYER 4: DATA PAYLOADS, SUBSETTING API & OFFLINE SIDECARS (RT-P04, RT-P05, RT-P08, RT-P10) ]         |
|    * Direct Payloads: /data/arms-mbon-rocrate.zip  <-[offline sidecar]-> arms-mbon-rocrate.zip.linkset  |
|    * Subsetting API:  /api/v1/observations ---> /api/openapi.json & /api/docs/                         |
|    * Split Linksets:  arms-mbon.linkset.json --rel="item"--> .conneg / .profiles / .provenance linksets|
+---------------------------------------------------------------------------------------------------------+
|  [ 📑 TRACK & NODE INSPECTOR DRAWER: Live Headers, File Locations & Copyable `curl` Commands ]          |
+---------------------------------------------------------------------------------------------------------+
```

### Component 1: Corridor-Aware Layout Engine (`generator/metromap/engine/OctilinearLayoutEngine.ts`)
- Partitions the SVG canvas into 4 structured horizontal corridors:
  - **Corridor 1 (Discovery & Catalog Assistance, Y: 80 - 320px)**
  - **Corridor 2 (Conneg & 303 PID Hubs, Y: 400 - 680px)**
  - **Corridor 3 (Profiles & Composition, Y: 760 - 1000px)**
  - **Corridor 4 (Data Payloads, APIs & Sidecars, Y: 1080 - 1460px)**
- Renders rounded swimlane backdrops with headers, color codes, pattern tags, and specification badges.
- Cross-corridor tracks are routed using octilinear geometry (0°, 45°, 90°) with smooth radii and relation labels.

### Component 2: Discovery Cascade & Graph Model (`generator/metromap/engine/DiscoveryCascadeEngine.ts`)
- Assigns each node a concrete layer index (`1 | 2 | 3 | 4`).
- Defines exact semantic link relations (`rel="cite-as"`, `rel="http://schema.org/hasPart"`, `rel="item"`, `rel="collection"`, `rs:ln`, `rel="profile"`).
- Connects the new stations: `sitemap-index.xml`, `sitemap-catalog.xml`, `.linkset.json` fragments, and `.linkset.json` sidecars.

### Component 3: SvgRenderer & Cross-Corridor Bridges (`generator/metromap/renderers/SvgRenderer.ts`)
- Renders corridor swimlanes, cluster boundaries, tracks, arrow markers, and station nodes.
- Attaches comprehensive DOM data attributes (`data-layer`, `data-patterns`, `data-specs`, `data-static-file`, `data-source-file`, `data-nginx-loc`, `data-curl-cmd`) to every node and track.

### Component 4: Interactive Tooling & HUD (`generator/metromap/renderers/HtmlPageRenderer.ts`)
- **Crawler Simulator Engine**:
  - Play, Pause, Next Step, Reset, Speed Control (1x / 2x / 5x).
  - 4 Pre-built simulation scenarios:
    1. *Standard EOSC Harvester* (Discovery $\rightarrow$ Conneg $\rightarrow$ Turtle).
    2. *Modular Index & Large Linksets* (Sitemap Index $\rightarrow$ Sub-sitemaps $\rightarrow$ Master Linkset $\rightarrow$ Fragments).
    3. *Direct Data & Offline Sidecars* (Direct payload $\rightarrow$ `cite-as` $\rightarrow$ `.linkset.json` sidecar & SHA-256).
    4. *Subsetting API Traversal* (API Catalog $\rightarrow$ `/api/v1/observations` $\rightarrow$ OpenAPI & Parent PID).
  - Live console HUD outputting HTTP request, headers, and machine reasoning at each step.
- **Multi-Dimensional Filter Toolbar**:
  - Filter by Layer (1-4).
  - Filter by Pattern (RT-P01 to RT-P10).
  - Filter by Specification (RFC 8288, RFC 9264, RFC 9727, RFC 6906, DX-PROF, DCAT-3, OpenAPI 3, RO-Crate).
- **Search & Spotlight Bar**:
  - Search input with auto-suggest dropdown and smooth viewport zoom-to-fit on match.
- **Track & Connection Inspector**:
  - Bottom drawer showing exact IANA relation, source/target nodes, Nginx location block, and copyable `curl` commands.

---

## 3. Implementation Plan Reference
After approval of this design, the `writing-plans` skill will be invoked to break implementation down into executable subtasks with verification checkpoints.
