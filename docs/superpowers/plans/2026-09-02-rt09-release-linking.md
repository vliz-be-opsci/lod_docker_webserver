# RT-P09 Release Linking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the EOSC Radical Transparency RT-P09 (Release Linking) pattern in `lod_docker_webserver`, adding lifecycle navigation (RFC 5829) for MarineInfo Dataset 90 and RO-Crate Profile Evolution, with Behavior A local DOI resolution, standalone RFC 9264 linksets, full HTTP response signposting, and dual-server gap audit.

**Architecture:** 
- Model conceptual series and immutable releases with explicit parent/predecessor pointers in `generator/types.ts` and `generator/resources.ts`.
- Generate standalone RFC 9264 JSON linksets for series, releases, history archive, and profiles in `generator/linksetGenerator.ts`.
- Update Nginx regex routing and content negotiation maps (`nginx.conf` and `nginx-coneg.conf`) to support nested version paths (`/id/{type}/{name}/{sub}`) and Behavior A direct-to-latest payload resolution.
- Enhance `generator/index.ts` to output all formats (.html, .ttl, .jsonld, .rdf, .linkset.json) and emit RFC 8288 Link headers for all representations.
- Model the RT-P09 gap in `generator/gappedGenerator.ts` and `generator/auditPageRenderer.ts` for Port 8081 side-by-side compliance audits.

**Tech Stack:** TypeScript, Bun, Nginx, Docker Compose, RDF/Turtle, JSON-LD, RFC 8288 Web Linking, RFC 9264 Linkset, RFC 5829 Versioning.

**Spec:** [`docs/superpowers/specs/2026-09-02-rt09-release-linking-design.md`](file:///c:/Users/cedricd/Documents/Github/lod_docker_webserver/docs/superpowers/specs/2026-09-02-rt09-release-linking-design.md)

## Global Constraints
- Target Dataset: MarineInfo Dataset 90 (*Macrobenthos of the Belgian Part of the North Sea*), upstream URI `https://marineinfo.org/id/dataset/90`.
- Series DOI: `https://doi.org/10.14284/90` (resolves via Behavior A to `/data/dataset-90-v2.1.csv`).
- Release DOIs: `https://doi.org/10.14284/90.v1.0`, `https://doi.org/10.14284/90.v2.0`, `https://doi.org/10.14284/90.v2.1`.
- RFC 5829 relations: `latest-version`, `predecessor-version`, `successor-version`, `version-history`.
- Profile weaving relation: `http://schema.org/hasPart` pointing from versioned profile to abstract profile.
- History endpoint path: `/id/dataset/dataset-90/history`.

---

### Task 1: Type Definitions, Resources & Data Payloads

**Files:**
- Modify: `generator/types.ts`
- Modify: `generator/resources.ts`
- Modify: `generator/profiles.ts`
- Modify: `generator/dataPayloads.ts`
- Test: `test/resources.test.ts` (create)

**Interfaces:**
- Produces:
  - `MarineEntity` lifecycle fields: `seriesId?: string`, `version?: string`, `releaseDate?: string`, `latestVersionId?: string`, `predecessorVersionId?: string`, `successorVersionId?: string`, `historyUri?: string`
  - Resource definitions: `resource-dataset-90`, `resource-dataset-90-v1.0`, `resource-dataset-90-v2.0`, `resource-dataset-90-v2.1`
  - Profile definitions: `ro-crate-package-profile` (abstract), `ro-crate-package-profile-v1.0`, `ro-crate-package-profile-v1.1`
  - Data files: `dist/data/dataset-90-v1.0.csv`, `dist/data/dataset-90-v2.0.csv`, `dist/data/dataset-90-v2.1.csv`

- [ ] **Step 1: Write the failing test**

Create `test/resources.test.ts`:
```typescript
import { describe, expect, it } from "bun:test";
import { RESOURCES, getResourceById } from "../generator/resources";
import { PROFILES, getProfileById } from "../generator/profiles";
import { getEntityIdPath } from "../generator/types";

describe("RT-P09 Resource & Profile Modeling", () => {
  it("defines Dataset 90 series and 3 releases with valid lifecycle pointers", () => {
    const series = getResourceById("resource-dataset-90");
    expect(series).toBeDefined();
    expect(series?.latestVersionId).toBe("resource-dataset-90-v2.1");
    expect(series?.doi).toBe("https://doi.org/10.14284/90");

    const v1 = getResourceById("resource-dataset-90-v1.0");
    expect(v1).toBeDefined();
    expect(v1?.version).toBe("1.0");
    expect(v1?.seriesId).toBe("resource-dataset-90");
    expect(v1?.successorVersionId).toBe("resource-dataset-90-v2.0");

    const v2 = getResourceById("resource-dataset-90-v2.0");
    expect(v2?.predecessorVersionId).toBe("resource-dataset-90-v1.0");
    expect(v2?.successorVersionId).toBe("resource-dataset-90-v2.1");

    const v21 = getResourceById("resource-dataset-90-v2.1");
    expect(v21?.predecessorVersionId).toBe("resource-dataset-90-v2.0");
  });

  it("formats nested entity paths correctly", () => {
    const v21 = getResourceById("resource-dataset-90-v2.1")!;
    expect(getEntityIdPath(v21)).toBe("/id/dataset/dataset-90/v2.1");
  });

  it("defines RO-Crate abstract profile and releases", () => {
    const absProf = getProfileById("ro-crate-package-profile");
    expect(absProf).toBeDefined();
    expect(absProf?.latestVersionId).toBe("ro-crate-package-profile-v1.1");

    const v11 = getProfileById("ro-crate-package-profile-v1.1");
    expect(v11?.predecessorVersionId).toBe("ro-crate-package-profile-v1.0");
    expect(v11?.abstractProfileId).toBe("ro-crate-package-profile");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test test/resources.test.ts`  
Expected: FAIL with "series is undefined" or missing properties.

- [ ] **Step 3: Implement lifecycle properties in types, resources, profiles, and data payloads**

1. In `generator/types.ts`:
   - Add lifecycle fields to `Resource`:
     ```typescript
     seriesId?: string;
     version?: string;
     releaseDate?: string;
     latestVersionId?: string;
     predecessorVersionId?: string;
     successorVersionId?: string;
     historyUri?: string;
     ```
   - Update `getEntityIdPath`:
     ```typescript
     export function getEntityIdPath(entity: MarineEntity): string {
       const typeSlug = getEntityTypeSlug(entity);
       if (entity.seriesId && entity.version) {
         const parentNameSlug = entity.seriesId.replace(/^resource-/, "");
         return `/id/${typeSlug}/${parentNameSlug}/v${entity.version}`;
       }
       const nameSlug = getEntityNameSlug(entity);
       return `/id/${typeSlug}/${nameSlug}`;
     }
     ```
2. In `generator/resources.ts`:
   - Register `resource-dataset-90` (Series, `doi: "https://doi.org/10.14284/90"`, `latestVersionId: "resource-dataset-90-v2.1"`).
   - Register `resource-dataset-90-v1.0` (Release v1.0, `doi: "https://doi.org/10.14284/90.v1.0"`, `version: "1.0"`, `releaseDate: "2023-06-02"`).
   - Register `resource-dataset-90-v2.0` (Release v2.0, `doi: "https://doi.org/10.14284/90.v2.0"`, `version: "2.0"`, `releaseDate: "2025-02-06"`).
   - Register `resource-dataset-90-v2.1` (Release v2.1, `doi: "https://doi.org/10.14284/90.v2.1"`, `version: "2.1"`, `releaseDate: "2026-08-26"`).
3. In `generator/profiles.ts`:
   - Update `Profile` interface with `version?: string`, `releaseDate?: string`, `latestVersionId?: string`, `predecessorVersionId?: string`, `abstractProfileId?: string`.
   - Update `ro-crate-package-profile` (Abstract), and add `ro-crate-package-profile-v1.0`, `ro-crate-package-profile-v1.1`.
4. In `generator/dataPayloads.ts`:
   - Generate CSV files for `dataset-90-v1.0.csv`, `dataset-90-v2.0.csv`, `dataset-90-v2.1.csv` with realistic macrobenthos abundance counts.

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test test/resources.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
git add generator/types.ts generator/resources.ts generator/profiles.ts generator/dataPayloads.ts test/resources.test.ts
git commit -m "feat(types): add lifecycle and release properties for RT-P09"
```

---

### Task 2: Standalone RFC 9264 Linkset Generators

**Files:**
- Modify: `generator/linksetGenerator.ts`
- Modify: `generator/profileGenerator.ts`
- Test: `test/linksetGenerator.test.ts` (create)

**Interfaces:**
- Consumes: `MarineEntity` and `Profile` models from Task 1
- Produces:
  - `generateSeriesLinkset(resource: MarineEntity, baseUrl: string): object`
  - `generateReleaseLinkset(resource: MarineEntity, baseUrl: string): object`
  - `generateHistoryLinkset(series: MarineEntity, releases: MarineEntity[], baseUrl: string): object`
  - `generateProfileReleaseLinkset(profile: Profile, baseUrl: string): object`
  - `generateProfileHistoryLinkset(profile: Profile, versions: Profile[], baseUrl: string): object`

- [ ] **Step 1: Write the failing test**

Create `test/linksetGenerator.test.ts`:
```typescript
import { describe, expect, it } from "bun:test";
import { getResourceById, RESOURCES } from "../generator/resources";
import { generateLinkset, generateHistoryLinkset } from "../generator/linksetGenerator";

describe("RT-P09 Standalone Linksets", () => {
  const BASE_URL = "http://localhost:8080";

  it("generates Series linkset with latest-version and version-history", () => {
    const series = getResourceById("resource-dataset-90")!;
    const ls: any = generateLinkset(series, BASE_URL);
    const anchor = ls.linkset[0];
    expect(anchor.anchor).toBe(`${BASE_URL}/id/dataset/dataset-90`);
    expect(anchor["latest-version"][0].href).toBe(`${BASE_URL}/id/dataset/dataset-90/v2.1`);
    expect(anchor["version-history"][0].href).toBe(`${BASE_URL}/id/dataset/dataset-90/history`);
    expect(anchor["cite-as"][0].href).toBe(`${BASE_URL}/doi/10.14284/90`);
  });

  it("generates Release v2.1 linkset with predecessor-version and collection", () => {
    const v21 = getResourceById("resource-dataset-90-v2.1")!;
    const ls: any = generateLinkset(v21, BASE_URL);
    const anchor = ls.linkset[0];
    expect(anchor.anchor).toBe(`${BASE_URL}/id/dataset/dataset-90/v2.1`);
    expect(anchor["predecessor-version"][0].href).toBe(`${BASE_URL}/id/dataset/dataset-90/v2.0`);
    expect(anchor["version-history"][0].href).toBe(`${BASE_URL}/id/dataset/dataset-90/history`);
    expect(anchor.collection[0].href).toBe(`${BASE_URL}/id/dataset/dataset-90`);
    expect(anchor["cite-as"][0].href).toBe(`${BASE_URL}/doi/10.14284/90.v2.1`);
  });

  it("generates History linkset with item entries containing version, release-date, and title", () => {
    const series = getResourceById("resource-dataset-90")!;
    const releases = [
      getResourceById("resource-dataset-90-v1.0")!,
      getResourceById("resource-dataset-90-v2.0")!,
      getResourceById("resource-dataset-90-v2.1")!
    ];
    const ls: any = generateHistoryLinkset(series, releases, BASE_URL);
    expect(ls.linkset[0].anchor).toBe(`${BASE_URL}/id/dataset/dataset-90/history`);
    expect(ls.linkset[0].item).toHaveLength(3);
    expect(ls.linkset[0].item[0].version).toBe("1.0");
    expect(ls.linkset[0].item[0]["release-date"]).toBe("2023-06-02");
    expect(ls.linkset[0].item[2].version).toBe("2.1");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test test/linksetGenerator.test.ts`  
Expected: FAIL with "generateHistoryLinkset is not a function" or missing links.

- [ ] **Step 3: Implement linkset generator functions**

1. In `generator/linksetGenerator.ts`:
   - Check if `resource.latestVersionId` is present (Series): emit `latest-version` and `version-history`.
   - Check if `resource.seriesId` is present (Release): emit `predecessor-version`, `version-history`, and `collection`. If `successorVersionId` is present, emit `successor-version`.
   - Implement `generateHistoryLinkset(series, releases, baseUrl)` returning the extended linkset structure with `item` array containing `href`, `version`, `release-date`, `title`.
2. In `generator/profileGenerator.ts`:
   - Implement `generateProfileLinkset` support for versioned profiles:
     - Abstract profile emits `latest-version` and `version-history`.
     - Release profile emits `http://schema.org/hasPart` pointing to abstract parent, `predecessor-version`, and `version-history`.
   - Implement `generateProfileHistoryLinkset(profile, versions, baseUrl)`.

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test test/linksetGenerator.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
git add generator/linksetGenerator.ts generator/profileGenerator.ts test/linksetGenerator.test.ts
git commit -m "feat(linksets): implement RFC 5829 release linksets and history generator"
```

---

### Task 3: HTML and RDF Serialization for Versioned Resources & History Archive

**Files:**
- Modify: `generator/htmlTemplates.ts`
- Modify: `generator/rdfSerializer.ts`
- Test: `test/htmlAndRdf.test.ts` (create)

**Interfaces:**
- Consumes: `MarineEntity` and `Profile` objects from Task 1
- Produces:
  - `renderDatasetPageHtml()` rendering version badges, predecessor/successor banners, and history links
  - `renderHistoryPageHtml()` rendering the interactive version archive timeline
  - `serializeTurtle()` & `serializeJsonLd()` emitting `dcterms:hasVersion`, `dcterms:isVersionOf`, and `prov:wasRevisionOf`

- [ ] **Step 1: Write the failing test**

Create `test/htmlAndRdf.test.ts`:
```typescript
import { describe, expect, it } from "bun:test";
import { getResourceById } from "../generator/resources";
import { renderDatasetPageHtml, renderHistoryPageHtml } from "../generator/htmlTemplates";
import { serializeTurtle } from "../generator/rdfSerializer";

describe("RT-P09 HTML & RDF Serialization", () => {
  const BASE_URL = "http://localhost:8080";

  it("renders series page with latest version callout and history button", () => {
    const series = getResourceById("resource-dataset-90")!;
    const html = renderDatasetPageHtml(series, BASE_URL);
    expect(html).toContain("Latest Authoritative Release");
    expect(html).toContain("/id/dataset/dataset-90/v2.1");
    expect(html).toContain("/id/dataset/dataset-90/history");
  });

  it("renders release page with predecessor navigation and immutable DOI banner", () => {
    const v21 = getResourceById("resource-dataset-90-v2.1")!;
    const html = renderDatasetPageHtml(v21, BASE_URL);
    expect(html).toContain("Predecessor Version");
    expect(html).toContain("/id/dataset/dataset-90/v2.0");
    expect(html).toContain("10.14284/90.v2.1");
  });

  it("renders history archive page listing all version entries", () => {
    const series = getResourceById("resource-dataset-90")!;
    const html = renderHistoryPageHtml(series, BASE_URL);
    expect(html).toContain("Version History Archive");
    expect(html).toContain("v1.0 (2023-06-02)");
    expect(html).toContain("v2.0 (2025-02-06)");
    expect(html).toContain("v2.1 (2026-08-26)");
  });

  it("serializes RDF with versioning relations", () => {
    const v21 = getResourceById("resource-dataset-90-v2.1")!;
    const ttl = serializeTurtle(v21, BASE_URL);
    expect(ttl).toContain("dcterms:isVersionOf");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test test/htmlAndRdf.test.ts`  
Expected: FAIL with "renderHistoryPageHtml is not defined".

- [ ] **Step 3: Implement HTML templates and RDF serialization**

1. In `generator/htmlTemplates.ts`:
   - Enhance `renderDatasetPageHtml` to check for `latestVersionId`, `predecessorVersionId`, `successorVersionId`, and `seriesId`.
   - Add visual banner for Series: "Current Authoritative Release: v2.1 [View Release] [Browse History]".
   - Add visual banner for Releases: "Release v2.1 (Snapshot: 2026-08-26) | Series Parent: [Dataset 90] | Predecessor: [v2.0]".
   - Implement `renderHistoryPageHtml(series, releases, baseUrl)` with a timeline card component for each release with links to HTML, CSV, RDF, and Linkset.
2. In `generator/rdfSerializer.ts`:
   - If `entity.seriesId`, add `dcterms:isVersionOf <baseUrl/id/...>` and `prov:wasRevisionOf <baseUrl/id/...>`.
   - If `entity.latestVersionId`, add `dcterms:hasVersion <baseUrl/id/...>`.

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test test/htmlAndRdf.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
git add generator/htmlTemplates.ts generator/rdfSerializer.ts test/htmlAndRdf.test.ts
git commit -m "feat(ui): add version navigation UI and RDF versioning triples"
```

---

### Task 4: Nginx Routing, Conneg (Behavior A), and RFC 8288 Headers

**Files:**
- Modify: `nginx.conf`
- Modify: `generator/index.ts`
- Test: `test/nginxIntegration.test.ts`

**Interfaces:**
- Consumes: Resources and profiles from Tasks 1-3
- Produces:
  - Updated `nginx.conf` matching nested `/id/{type}/{name}/{sub}`
  - Updated `nginx-coneg.conf` mapping `/doi/10.14284/90` and releases
  - Updated `nginx-headers.conf` with exact Link headers for all representations
  - Output files in `dist/id/dataset/dataset-90/` and `dist/id/profile/ro-crate-package-profile/`

- [ ] **Step 1: Write the failing test**

Add to `test/nginxIntegration.test.ts`:
```typescript
it("generates Behavior A DOI mapping in nginx-coneg.conf", () => {
  const coneg = fs.readFileSync(path.join(DIST_DIR, "nginx-coneg.conf"), "utf8");
  expect(coneg).toContain('"/doi/10.14284/90" "/data/dataset-90-v2.1.csv";');
  expect(coneg).toContain('"/doi/10.14284/90.v1.0" "/data/dataset-90-v1.0.csv";');
  expect(coneg).toContain('"/doi/10.14284/90.v2.1" "/data/dataset-90-v2.1.csv";');
});

it("generates RFC 8288 Link headers for Dataset 90 Series and Releases in nginx-headers.conf", () => {
  const headers = fs.readFileSync(path.join(DIST_DIR, "nginx-headers.conf"), "utf8");
  // Series headers
  expect(headers).toContain('rel="latest-version"');
  expect(headers).toContain('rel="version-history"');
  // Release headers
  expect(headers).toContain('rel="predecessor-version"');
  // History headers
  expect(headers).toContain('/id/dataset/dataset-90/history.linkset.json');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test test/nginxIntegration.test.ts`  
Expected: FAIL with mapping not found.

- [ ] **Step 3: Update `nginx.conf` and `generator/index.ts`**

1. In `nginx.conf`:
   - Add nested URI location block:
     ```nginx
     location ~ ^/id/(?<res_type>[^/]+)/(?<res_name>[^/]+)/(?<res_sub>[^/.]+)$ {
         add_header Vary Accept always;
         add_header Access-Control-Allow-Origin * always;
         add_header Link '<$scheme://$http_host/id/$res_type/$res_name/$res_sub.linkset.json>; rel="linkset"; type="application/linkset+json"' always;
         return 303 $scheme://$http_host/id/$res_type/$res_name/$res_sub.$conneg_suffix;
     }
     ```
2. In `generator/index.ts`:
   - Ensure nested directories `dist/id/dataset/dataset-90/` and `dist/id/profile/ro-crate-package-profile/` are created.
   - For `dataset-90` series, emit `dataset-90.html`, `.ttl`, `.jsonld`, `.rdf`, `.linkset.json`.
   - For `dataset-90/history`, emit `history.html`, `history.ttl`, `history.linkset.json`.
   - For `dataset-90/v1.0`, `v2.0`, `v2.1`, emit format representations and linksets into `dist/id/dataset/dataset-90/`.
   - In `nginx-coneg.conf` builder:
     - Map `/doi/10.14284/90` to `/data/dataset-90-v2.1.csv` (Behavior A).
     - Map `/doi/10.14284/90.v1.0`, `v2.0`, `v2.1` to their respective payload files.
   - In `nginx-headers.conf` builder:
     - Emit RFC 8288 headers with `latest-version`, `version-history`, `predecessor-version`, `successor-version`, and `collection` matching the specification.
     - Emit payload signposting headers for `/data/dataset-90-v*.csv` with `cite-as` and `collection`.
   - Update `sitemap.xml` and `sitemap-datasets.xml` with ResourceSync `rs:ln` version links.

- [ ] **Step 4: Run test to verify it passes**

Run: `bun run generate; bun test test/nginxIntegration.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
git add nginx.conf generator/index.ts test/nginxIntegration.test.ts
git commit -m "feat(nginx): configure nested conneg routing and RT-P09 response headers"
```

---

### Task 5: Dual-Container Gapped Simulation, Compliance Docs & Audit Dashboard

**Files:**
- Modify: `generator/gappedGenerator.ts`
- Modify: `generator/auditPageRenderer.ts`
- Modify: `generator/complianceDocs.ts`
- Test: `test/gappedServer.test.ts`

**Interfaces:**
- Consumes: Dataset 90 and RO-Crate profiles
- Produces:
  - Gapped site configuration in `dist-gapped/` omitting `latest-version`, `predecessor-version`, and 404ing on history linkset
  - Audit gap entry in `auditPageRenderer.ts` and `/compliance.json`
  - Compliance documentation: `docs/compliance/dataset-90-release-links.md`

- [ ] **Step 1: Write the failing test**

Add to `test/gappedServer.test.ts`:
```typescript
it("verifies Port 8080 (Reference) vs Port 8081 (Gapped) contrast on RT-P09", () => {
  const refHeaders = fs.readFileSync(path.join(process.cwd(), "dist", "nginx-headers.conf"), "utf8");
  const gappedHeaders = fs.readFileSync(path.join(process.cwd(), "dist-gapped", "nginx-headers.conf"), "utf8");

  // 8080 contains latest-version on dataset-90; 8081 omits it
  expect(refHeaders).toContain('/id/dataset/dataset-90/v2.1>; rel="latest-version"');
  expect(gappedHeaders).not.toContain('/id/dataset/dataset-90/v2.1>; rel="latest-version"');

  // 8081 does not produce history linkset (404 simulation)
  expect(fs.existsSync(path.join(process.cwd(), "dist", "id", "dataset", "dataset-90", "history.linkset.json"))).toBe(true);
  expect(fs.existsSync(path.join(process.cwd(), "dist-gapped", "id", "dataset", "dataset-90", "history.linkset.json"))).toBe(false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test test/gappedServer.test.ts`  
Expected: FAIL

- [ ] **Step 3: Implement Gapped simulation and compliance documentation**

1. In `generator/gappedGenerator.ts`:
   - When generating headers for `dataset-90` on 8081, omit `rel="latest-version"` and `rel="version-history"`.
   - On release `v2.1`, omit `rel="predecessor-version"`.
   - Exclude `dist-gapped/id/dataset/dataset-90/history.linkset.json` so it returns 404.
2. In `generator/auditPageRenderer.ts`:
   - Add `resource-dataset-90` to `RESOURCE_GAP_SPECS`:
     - Archetype: "Orphan Snapshot & Broken Version Navigator"
     - Port 8080: "100% Compliant (RT-P01..09)"
     - Port 8081: "Missing latest-version, predecessor-version & 404 on history linkset"
     - Missing Patterns: `["RT-P09 (Release Links)"]`
     - Test commands with `curl` for both servers.
3. In `generator/complianceDocs.ts`:
   - Generate `docs/compliance/dataset-90-release-links.md` auditing the upstream MarineInfo Dataset 90 vs RT-P09 enhancements.

- [ ] **Step 4: Run test to verify it passes**

Run: `bun run generate; bun test test/gappedServer.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
git add generator/gappedGenerator.ts generator/auditPageRenderer.ts generator/complianceDocs.ts test/gappedServer.test.ts
git commit -m "feat(gap-audit): add RT-P09 gap simulation, audit specs, and compliance docs"
```

---

### Task 6: Full Build, Docker Verification & Walkthrough

**Files:**
- Modify: `README.md`
- Test: All test suites (`bun test`)
- Run: `docker compose build` & curl verification

**Interfaces:**
- Consumes: Complete codebase
- Produces:
  - Verified passing test suite across all units and integration points
  - Updated `README.md` documenting RT-P09 Release Links
  - Walkthrough artifact with concrete verification outputs

- [ ] **Step 1: Run complete test suite**

Run: `bun test`  
Expected: All tests pass (0 failures).

- [ ] **Step 2: Run full asset generation**

Run: `bun run generate`  
Expected: Builds `dist/` and `dist-gapped/` cleanly without warnings.

- [ ] **Step 3: Update `README.md`**

Add RT-P09 (Release Linking) to:
- Key link relations table in Section 5.
- Hosted Resources table (Dataset 90).
- Gap matrix table (Dataset 90 row).

- [ ] **Step 4: Commit changes and verify Docker stack**

```bash
git add README.md
git commit -m "docs: update README with RT-P09 release linking documentation"
```
Verify `docker compose build` succeeds with zero errors.
