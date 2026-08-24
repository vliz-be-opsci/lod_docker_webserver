# 4-Corridor Metro Map Canvas & Advanced Tooling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the Protocol Metro Map (`/map.html`) into an interactive 4-corridor architectural canvas featuring an automated Crawler Simulator, Multi-Dimensional Filters, Spotlight Search, and Track Link Inspector.

**Architecture:** Partition the canvas layout into 4 distinct horizontal swimlanes corresponding to the 4 layers of the Radical Transparency Interlocking Pattern Web. Enrich nodes and tracks with layer coordinates, simulation step metadata, and interactive inspector attributes. Implement the client-side simulator, filters, and HUD in pure Vanilla JavaScript and CSS.

**Tech Stack:** TypeScript, SVG, Vanilla JS, Vanilla CSS, Bun, Nginx.

**Spec:** `docs/superpowers/specs/2026-08-24-metromap-layered-canvas-and-controls-design.md`

## Global Constraints
- Pure TypeScript, SVG, Vanilla JS, and Vanilla CSS. No heavy external visual frameworks.
- Preserve all existing 30 unit tests while adding test coverage for corridor layout calculations and simulation step sequences.
- Keep all files self-contained and co-located under `generator/metromap/`.

---

### Task 1: Layered Graph & Corridor Model Extensions
**Files:**
- Modify: `generator/metromap/models/MetroNode.ts`
- Modify: `generator/metromap/models/MetroTrack.ts`
- Modify: `generator/metromap/engine/DiscoveryCascadeEngine.ts`
- Test: `test/metromap/discoveryBuilder.test.ts`

**Interfaces:**
- Produces: `MetroNode.layer: 1 | 2 | 3 | 4`, `MetroTrack.curlCommand: string`, `MetroTrack.rfcRelation: string`

- [ ] **Step 1: Write failing test for layer and track metadata**
- [ ] **Step 2: Run test to verify failure (`bun test test/metromap/discoveryBuilder.test.ts`)**
- [ ] **Step 3: Update `MetroNode`, `MetroTrack`, and `DiscoveryCascadeEngine` with layer indexing and curl snippets**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit changes**

---

### Task 2: 4-Corridor Swimlane Layout Engine
**Files:**
- Modify: `generator/metromap/engine/OctilinearLayoutEngine.ts`
- Test: `test/metromap/layoutEngine.test.ts`

**Interfaces:**
- Consumes: `MetroGraph` with node layers
- Produces: `CorridorBoundingBox[]`, structured Y-coordinates per corridor (`Corridor 1: 80-320px`, `Corridor 2: 400-680px`, `Corridor 3: 760-1000px`, `Corridor 4: 1080-1460px`)

- [ ] **Step 1: Write failing test for corridor bounds calculation**
- [ ] **Step 2: Run test to verify failure (`bun test test/metromap/layoutEngine.test.ts`)**
- [ ] **Step 3: Implement 4-corridor swimlane partitioning in `OctilinearLayoutEngine`**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit changes**

---

### Task 3: Corridor Swimlanes & Cross-Corridor SvgRenderer
**Files:**
- Modify: `generator/metromap/renderers/SvgRenderer.ts`
- Test: `test/metromap/renderer.test.ts`

**Interfaces:**
- Consumes: Corridor bounds, nodes, tracks
- Produces: SVG with corridor background panels, layer headers, badges, glowing relation tags, and DOM data attributes (`data-layer`, `data-curl-cmd`, etc.)

- [ ] **Step 1: Write failing test for corridor SVG rendering**
- [ ] **Step 2: Run test to verify failure (`bun test test/metromap/renderer.test.ts`)**
- [ ] **Step 3: Implement corridor backgrounds, layer headers, and relation badges in `SvgRenderer`**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit changes**

---

### Task 4: Interactive Tooling UI (Crawler Simulator, Multi-Filters, Spotlight Search, Link Inspector)
**Files:**
- Modify: `generator/metromap/renderers/HtmlPageRenderer.ts`
- Test: `test/metromap/e2e.test.ts`

**Interfaces:**
- Produces: Complete `/map.html` with Crawler Simulator player, Multi-dimensional filter toolbar, Spotlight search, and bottom Track Inspector drawer.

- [ ] **Step 1: Write failing test for interactive UI elements in HTML output**
- [ ] **Step 2: Run test to verify failure (`bun test test/metromap/e2e.test.ts`)**
- [ ] **Step 3: Implement simulator engine, scenario sequences, multi-filters, and drawer in `HtmlPageRenderer`**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit changes**

---

### Task 5: End-to-End Build & Visual Verification
**Files:**
- Modify: `generator/index.ts`
- Test: All tests (`bun test`)

- [ ] **Step 1: Run full static build (`bun generator/index.ts`)**
- [ ] **Step 2: Run complete test suite (`bun test`)**
- [ ] **Step 3: Verify output files in `dist/`**
- [ ] **Step 4: Commit changes**
