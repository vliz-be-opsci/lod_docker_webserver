# API Versioned Directory Co-location Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the observations API documentation, OpenAPI specifications, DCAT metadata, and RFC 9264 standalone linkset into a self-contained, versioned directory path (`/api/observations/v1/`), eliminating global top-level `/api/openapi.json` and `/api/docs/` to support scalable multi-API and multi-version co-location.

**Architecture:** 
- In `generator/openApiGenerator.ts`, generate `data.json`, `openapi.json`, `openapi.yaml`, `meta.ttl` (DCAT-3), and `docs/index.html` (Swagger UI) inside `dist/api/observations/v1/`.
- In `generator/linksetGenerator.ts`, update `generateApiServiceLinkset` to output `service-desc`, `service-doc`, and `service-meta` pointing to `/api/observations/v1/` sub-paths, and save to `dist/api/observations/v1/linkset.json`.
- In `nginx.conf`, route `GET /api/observations/v1` directly to `data.json` via `try_files` (clean URI without trailing slash), and serve static sub-paths with appropriate MIME types and RFC 8288 Link headers.
- Update discovery cascades (`DiscoveryCascadeEngine.ts`), site header navigation, sitemaps, gapped simulation, and compliance documentation.

**Tech Stack:** TypeScript, Bun, Nginx, OpenAPI 3.0.3, Swagger UI, W3C DCAT-3, RFC 8288 Web Linking, RFC 9264 Linksets.

**Spec:** [`docs/superpowers/specs/2026-09-03-api-version-colocation-design.md`](file:///c:/Users/cedricd/Documents/Github/lod_docker_webserver/docs/superpowers/specs/2026-09-03-api-version-colocation-design.md)

## Global Constraints
- Primary API endpoint URI: `http://localhost:8080/api/observations/v1`
- OpenAPI Specification URI (`service-desc`): `http://localhost:8080/api/observations/v1/openapi.json`
- Interactive Swagger UI URI (`service-doc`): `http://localhost:8080/api/observations/v1/docs/`
- Service Metadata URI (`service-meta`): `http://localhost:8080/api/observations/v1/meta.ttl`
- Standalone Linkset URI (`linkset`): `http://localhost:8080/api/observations/v1/linkset.json`
- Hard break: Top-level `/api/openapi.json`, `/api/openapi.yaml`, and `/api/docs/` are deleted with no redirect aliases.

---

### Task 1: API Generator & Co-located Artifacts Generation

**Files:**
- Modify: `generator/openApiGenerator.ts`
- Modify: `generator/linksetGenerator.ts`
- Modify: `generator/dcatGenerator.ts`
- Modify: `generator/resources.ts`
- Create: `test/openApiColocation.test.ts`

**Interfaces:**
- Produces:
  - `dist/api/observations/v1/data.json`
  - `dist/api/observations/v1/openapi.json`
  - `dist/api/observations/v1/openapi.yaml`
  - `dist/api/observations/v1/meta.ttl`
  - `dist/api/observations/v1/docs/index.html`
  - `generateApiServiceLinkset()` with updated `service-desc`, `service-doc`, `service-meta`

- [ ] **Step 1: Write the failing test**

Create `test/openApiColocation.test.ts`:
```typescript
import { describe, it, expect } from "bun:test";
import { generateOpenApiSpec, generateSwaggerHtml, generateApiSampleResponses } from "../generator/openApiGenerator";
import { generateApiServiceLinkset } from "../generator/linksetGenerator";
import { getResourceById } from "../generator/resources";
import fs from "fs";
import path from "path";

describe("API Versioned Directory Co-location", () => {
  const baseUrl = "http://localhost:8080";
  const apiResource = getResourceById("resource-marineinfo-api")!;

  it("generates API linkset pointing to co-located v1 paths", () => {
    const linkset = generateApiServiceLinkset(apiResource, baseUrl) as any;
    const entry = linkset.linkset[0];

    expect(entry.anchor).toBe("http://localhost:8080/api/observations/v1");
    expect(entry["service-desc"][0].href).toBe("http://localhost:8080/api/observations/v1/openapi.json");
    expect(entry["service-doc"][0].href).toBe("http://localhost:8080/api/observations/v1/docs/");
    expect(entry["service-meta"][0].href).toBe("http://localhost:8080/api/observations/v1/meta.ttl");
  });

  it("generates Swagger UI pointing to co-located openapi.json", () => {
    const html = generateSwaggerHtml(baseUrl);
    expect(html).toContain("url: '/api/observations/v1/openapi.json'");
    expect(html).toContain('href="/api/observations/v1/openapi.json"');
  });

  it("writes data.json, openapi.json, meta.ttl, and docs in dist/api/observations/v1/", () => {
    const testDist = path.resolve(process.cwd(), "test-dist-api");
    if (fs.existsSync(testDist)) fs.rmSync(testDist, { recursive: true });

    generateApiSampleResponses(testDist, baseUrl);

    expect(fs.existsSync(path.join(testDist, "api", "observations", "v1", "data.json"))).toBe(true);
    expect(fs.existsSync(path.join(testDist, "api", "observations", "v1", "openapi.json"))).toBe(true);
    expect(fs.existsSync(path.join(testDist, "api", "observations", "v1", "meta.ttl"))).toBe(true);
    expect(fs.existsSync(path.join(testDist, "api", "observations", "v1", "docs", "index.html"))).toBe(true);

    const metaTtl = fs.readFileSync(path.join(testDist, "api", "observations", "v1", "meta.ttl"), "utf-8");
    expect(metaTtl).toContain("dcat:DataService");
    expect(metaTtl).toContain("http://localhost:8080/api/observations/v1/openapi.json");

    fs.rmSync(testDist, { recursive: true });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test test/openApiColocation.test.ts`  
Expected: FAIL due to `/api/openapi.json` paths and missing files.

- [ ] **Step 3: Implement minimal code changes**

1. In `generator/linksetGenerator.ts`:
   Update `generateApiServiceLinkset()`:
   - `service-desc` href: `${baseUrl}/api/observations/v1/openapi.json`
   - `service-doc` href: `${baseUrl}/api/observations/v1/docs/`
   - `service-meta` href: `${baseUrl}/api/observations/v1/meta.ttl`
2. In `generator/openApiGenerator.ts`:
   - Update `generateSwaggerHtml(baseUrl)`:
     - Change link rel `describedby` and `service-desc` to `/api/observations/v1/openapi.json` and `/api/observations/v1/openapi.yaml`.
     - Change Swagger UI script `url: '/api/observations/v1/openapi.json'`.
   - Update `generateApiSampleResponses(distDir, baseUrl)`:
     - Target directory: `path.join(distDir, "api", "observations", "v1")`.
     - Write `data.json` with sample observations.
     - Write `openapi.json` and `openapi.yaml`.
     - Generate and write `meta.ttl` containing DCAT-3 DataService metadata.
     - Create directory `path.join(distDir, "api", "observations", "v1", "docs")` and write `index.html` (from `generateSwaggerHtml`).
3. In `generator/dcatGenerator.ts` & `generator/resources.ts`:
   - Update `dcat:endpointDescription` to `${baseUrl}/api/observations/v1/openapi.json`.

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test test/openApiColocation.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
git add generator/openApiGenerator.ts generator/linksetGenerator.ts generator/dcatGenerator.ts generator/resources.ts test/openApiColocation.test.ts
git commit -m "feat(api): co-locate openapi, docs, and metadata under api/observations/v1/"
```

---

### Task 2: Static Generator Pipeline, Sitemaps & Portal Navigation

**Files:**
- Modify: `generator/index.ts`
- Modify: `generator/htmlTemplates.ts`
- Test: `test/htmlTemplates.test.ts`

**Interfaces:**
- Consumes: `openApiGenerator.ts` updates
- Produces:
  - Clean `dist/api/observations/v1/linkset.json`
  - Removal of top-level `/api/openapi.json` and `/api/docs/`
  - Updated site header navigation pointing to `/api/observations/v1/docs/`
  - Updated `sitemap-catalog.xml` referencing `/api/observations/v1/docs/`

- [ ] **Step 1: Write test assertion in `test/htmlTemplates.test.ts`**

Update `test/htmlTemplates.test.ts` to check that the header navigation points to `/api/observations/v1/docs/`:
```typescript
it("renders header with link to versioned subsetting API docs", () => {
  const headerHtml = renderHeader("api");
  expect(headerHtml).toContain('href="/api/observations/v1/docs/"');
  expect(headerHtml).not.toContain('href="/api/docs/"');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test test/htmlTemplates.test.ts`  
Expected: FAIL on `href="/api/observations/v1/docs/"`.

- [ ] **Step 3: Implement pipeline updates**

1. In `generator/htmlTemplates.ts`:
   - In `renderHeader()`, change `<a href="/api/docs/"` to `<a href="/api/observations/v1/docs/"`.
   - In `renderCatalogHomeHtml()`, update any references to `/api/docs/` to `/api/observations/v1/docs/`.
2. In `generator/index.ts`:
   - In step 5 (OpenAPI generation): call updated `generateApiSampleResponses(DIST_DIR, BASE_URL)`. Remove top-level `fs.writeFileSync` for `api/openapi.json` and `api/docs/index.html`.
   - In step 6 (API linkset): write linkset to `path.join(DIST_DIR, "api", "observations", "v1", "linkset.json")`.
   - In step 9 (Sitemaps): update `sitemap-catalog.xml` to list `<loc>${BASE_URL}/api/observations/v1/docs/</loc>` with `<rs:ln rel="service-desc" href="${BASE_URL}/api/observations/v1/openapi.json" />`.

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test test/htmlTemplates.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
git add generator/index.ts generator/htmlTemplates.ts test/htmlTemplates.test.ts
git commit -m "feat(generator): update build pipeline and navigation for versioned API paths"
```

---

### Task 3: Nginx Routing, RFC 8288 Headers & Gapped Server Simulation

**Files:**
- Modify: `nginx.conf`
- Modify: `generator/index.ts` (section 10: `nginx-headers.conf`)
- Modify: `generator/gappedGenerator.ts`
- Modify: `test/nginxIntegration.test.ts`
- Modify: `test/gappedServer.test.ts`

**Interfaces:**
- Produces:
  - `nginx.conf` routing for `/api/observations/v1` -> `data.json`
  - `nginx-headers.conf` Link headers for `/api/observations/v1`, `/api/observations/v1/docs/`, and `/api/observations/v1/openapi.json`
  - Updated gapped simulation omitting `cite-as` on port 8081

- [ ] **Step 1: Write integration tests in `test/nginxIntegration.test.ts`**

Update `test/nginxIntegration.test.ts`:
```typescript
it("generates valid co-located API Linkset at /api/observations/v1/linkset.json", () => {
  const linksetFile = path.join(process.cwd(), "dist", "api", "observations", "v1", "linkset.json");
  expect(fs.existsSync(linksetFile)).toBe(true);
  const apiLinkset = JSON.parse(fs.readFileSync(linksetFile, "utf-8"));
  expect(apiLinkset.linkset[0]["service-desc"][0].href).toBe("http://localhost:8080/api/observations/v1/openapi.json");
  expect(apiLinkset.linkset[0]["service-doc"][0].href).toBe("http://localhost:8080/api/observations/v1/docs/");
  expect(apiLinkset.linkset[0]["service-meta"][0].href).toBe("http://localhost:8080/api/observations/v1/meta.ttl");
});

it("confirms legacy top-level API paths are removed", () => {
  expect(fs.existsSync(path.join(process.cwd(), "dist", "api", "openapi.json"))).toBe(false);
  expect(fs.existsSync(path.join(process.cwd(), "dist", "api", "docs", "index.html"))).toBe(false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test test/nginxIntegration.test.ts`  
Expected: FAIL until generator and Nginx configs are updated.

- [ ] **Step 3: Implement Nginx routing and header generation**

1. In `nginx.conf`:
   - Replace `/api/observations/v1` location with:
     ```nginx
     location = /api/observations/v1 {
         default_type application/json;
         add_header Access-Control-Allow-Origin * always;
         add_header Access-Control-Expose-Headers "Link, Content-Type, Location" always;
         try_files /api/observations/v1/data.json =404;
     }

     location /api/observations/v1/docs/ {
         try_files $uri $uri/ /api/observations/v1/docs/index.html =404;
     }
     ```
2. In `generator/index.ts` (`nginx-headers.conf` generation):
   - Output `location = /api/observations/v1`:
     `Link: <http://localhost:8080/id/dataset/arms-mbon>; rel="cite-as", <http://localhost:8080/api/observations/v1/openapi.json>; rel="service-desc"; type="application/json", <http://localhost:8080/api/observations/v1/docs/>; rel="service-doc"; type="text/html", <http://localhost:8080/api/observations/v1/meta.ttl>; rel="service-meta"; type="text/turtle", <http://localhost:8080/api/observations/v1/linkset.json>; rel="linkset"; type="application/linkset+json", <http://localhost:8080/.well-known/api-catalog>; rel="api-catalog"`
   - Output `location = /api/observations/v1/docs/`:
     `Link: <http://localhost:8080/api/observations/v1/openapi.json>; rel="service-desc"; type="application/json", <http://localhost:8080/api/observations/v1>; rel="service"`
   - Output `location = /api/observations/v1/openapi.json`:
     `Link: <http://localhost:8080/api/observations/v1>; rel="service", <https://www.openapis.org/#profile>; rel="profile"`
3. In `generator/gappedGenerator.ts` & `nginx-gapped.conf`:
   - Update gapped server location for `/api/observations/v1` to `try_files /api/observations/v1/data.json =404;`.
   - Update `test/gappedServer.test.ts` Scenario 7 assertions.

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun run generate; bun test test/nginxIntegration.test.ts; bun test test/gappedServer.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
git add nginx.conf nginx-gapped.conf generator/index.ts generator/gappedGenerator.ts test/nginxIntegration.test.ts test/gappedServer.test.ts
git commit -m "feat(nginx): configure Nginx routing and Link headers for co-located API paths"
```

---

### Task 4: Metro Transit Map Visualizer, Compliance Docs & Verification

**Files:**
- Modify: `generator/metromap/engine/DiscoveryCascadeEngine.ts`
- Modify: `generator/metromap/engine/MetroGraphBuilder.ts`
- Modify: `generator/complianceDocs.ts`
- Modify: `docs/compliance/marineinfo-api.md`
- Modify: `README.md`
- Test: `test/metromap/discoveryBuilder.test.ts`

**Interfaces:**
- Produces:
  - Discovery tracks pointing to `/api/observations/v1/openapi.json` and `/api/observations/v1/docs/`
  - Updated documentation in `docs/compliance/` and `README.md`
  - Complete green test suite across all 15 test files

- [ ] **Step 1: Write test assertion in `test/metromap/discoveryBuilder.test.ts`**

Update `test/metromap/discoveryBuilder.test.ts` to assert that discovery signals link `/api/observations/v1` to `/api/observations/v1/openapi.json` and `/api/observations/v1/docs/`:
```typescript
it("builds discovery tracks to co-located API OpenAPI spec and docs", () => {
  const builder = new MetroGraphBuilder(RESOURCES, "http://localhost:8080");
  const graph = builder.buildGraph("/");

  const descTrack = graph.tracks.find(t => t.relationLabel?.includes("service-desc"));
  expect(descTrack?.target.uri).toBe("/api/observations/v1/openapi.json");

  const docTrack = graph.tracks.find(t => t.relationLabel?.includes("service-doc"));
  expect(docTrack?.target.uri).toBe("/api/observations/v1/docs/");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test test/metromap/discoveryBuilder.test.ts`  
Expected: FAIL on target URIs.

- [ ] **Step 3: Update visualizer, compliance docs, and README**

1. In `generator/metromap/engine/DiscoveryCascadeEngine.ts`:
   - Update targetUri of `service-desc` to `/api/observations/v1/openapi.json`.
   - Update targetUri of `service-doc` to `/api/observations/v1/docs/`.
2. In `generator/metromap/engine/MetroGraphBuilder.ts`:
   - Update `getNodeStaticFile` and `getNodeSourceFile` for `/api/observations/v1/openapi.json` and `/api/observations/v1/docs/`.
3. In `generator/complianceDocs.ts`:
   - Update `marineinfo-api` compliance documentation to reference the `/api/observations/v1/` sub-paths.
4. In `README.md`:
   - Update API table rows and code blocks to reference the versioned paths.

- [ ] **Step 4: Run all tests and generate all assets**

Run: `bun run generate; bun test`  
Expected: All 69+ tests pass (0 failures).

- [ ] **Step 5: Commit changes**

```bash
git add generator/metromap/ generator/complianceDocs.ts docs/compliance/ README.md test/metromap/discoveryBuilder.test.ts
git commit -m "feat(metromap): update discovery tracks and docs for co-located API paths"
```
