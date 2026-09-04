# RT-P07 Catalogue-Assisted Resource Exposure Revision Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the webserver to fully conform with Radical Transparency Pattern 7 (RT-P07: Catalogue-Assisted Resource Exposure) across the sitemaps hierarchy, RFC 9727 API Catalog, and API services.

**Architecture:** Implement dual-layer signaling (HTTP headers + ResourceSync XML `<rs:ln>` and JSON linksets) across three pillars: (1) Sitemaps hierarchy with root index delegating to both the catalog sitemap (`/sitemap-catalog.xml`) and dedicated API sitemap (`/api/observations/v1/sitemap.xml`); (2) Lean RFC 9727 API Catalog (`/.well-known/api-catalog`) binding to the catalog sitemap and API endpoints; (3) API endpoint (`/api/observations/v1`) linking to the catalog and dedicated sitemap, and query samples linking back to the collection.

**Tech Stack:** TypeScript, Node.js/Bun, Nginx, XML (sitemaps.org + ResourceSync), JSON (RFC 9264 linksets), Docker Compose, Python (`rt-test`).

**Spec:** [docs/superpowers/specs/2026-09-04-rt-p07-catalog-assistance-revision-design.md](file:///c:/Users/cedricd/Documents/Github/lod_docker_webserver/docs/superpowers/specs/2026-09-04-rt-p07-catalog-assistance-revision-design.md)

## Global Constraints
- Every sitemap must declare `xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"` and `xmlns:rs="http://www.openarchives.org/rs/terms/"`.
- `sitemap-catalog.xml` must emit `Link: <${BASE_URL}/.well-known/api-catalog>; rel="self"`.
- `/api/observations/v1/sitemap.xml` must emit `Link: <${BASE_URL}/api/observations/v1>; rel="self"`.
- `/api/observations/v1` must emit `rel="alternate"` pointing to its sitemap `/api/observations/v1/sitemap.xml` and `rel="api-catalog"` to `/.well-known/api-catalog`.
- All existing tests in `bun test` must stay green.
- All 131+ assertions in `grmp-test-implementations/rt-test/` must pass with 0 failures.

---

### Task 1: Generate Dedicated API Sub-Sitemap (`/api/observations/v1/sitemap.xml`) and Update API Linkset

**Files:**
- Modify: `generator/openApiGenerator.ts`
- Modify: `generator/linksetGenerator.ts`
- Test: `test/nginxIntegration.test.ts`

**Interfaces:**
- Consumes: `baseUrl: string` from generator
- Produces:
  - `generateApiSitemapXml(baseUrl: string): string` in `generator/openApiGenerator.ts`
  - `dist/api/observations/v1/sitemap.xml`
  - Updated `generateApiServiceLinkset` with `rel="alternate"` in `generator/linksetGenerator.ts`

- [ ] **Step 1: Write failing unit test for `/api/observations/v1/sitemap.xml`**

In `test/nginxIntegration.test.ts`, add:
```typescript
  it("generates dedicated API sub-sitemap in dist/api/observations/v1/sitemap.xml with rel=self and query entry points", () => {
    const apiSitemapPath = path.join(distDir, "api", "observations", "v1", "sitemap.xml");
    expect(fs.existsSync(apiSitemapPath)).toBe(true);

    const xml = fs.readFileSync(apiSitemapPath, "utf-8");
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
    expect(xml).toContain('xmlns:rs="http://www.openarchives.org/rs/terms/"');
    expect(xml).toContain('<rs:ln rel="self" href="http://localhost:8080/api/observations/v1" />');
    expect(xml).toContain('<loc>http://localhost:8080/api/observations/v1?marker_gene=18S&amp;limit=20</loc>');
    expect(xml).toContain('<rs:ln rel="collection" href="http://localhost:8080/api/observations/v1" />');
    expect(xml).toContain('<rs:ln rel="cite-as" href="http://localhost:8080/id/dataset/arms-mbon" />');

    const apiLinksetPath = path.join(distDir, "api", "observations", "v1", "linkset.json");
    const linksetJson = JSON.parse(fs.readFileSync(apiLinksetPath, "utf-8"));
    const primaryAnchor = linksetJson.linkset[0];
    expect(primaryAnchor.alternate).toBeDefined();
    expect(primaryAnchor.alternate[0].href).toBe("http://localhost:8080/api/observations/v1/sitemap.xml");
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test test/nginxIntegration.test.ts`
Expected: FAIL (`dist/api/observations/v1/sitemap.xml` does not exist).

- [ ] **Step 3: Implement `generateApiSitemapXml` and write file in `openApiGenerator.ts` and `linksetGenerator.ts`**

In `generator/openApiGenerator.ts`:
```typescript
export function generateApiSitemapXml(baseUrl: string = "http://localhost:8080"): string {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
  xml += `        xmlns:rs="http://www.openarchives.org/rs/terms/">\n`;
  xml += `  <rs:ln rel="self" href="${baseUrl}/api/observations/v1" />\n`;
  xml += `  <url>\n`;
  xml += `    <loc>${baseUrl}/api/observations/v1?marker_gene=18S&amp;limit=20</loc>\n`;
  xml += `    <rs:ln rel="collection" href="${baseUrl}/api/observations/v1" />\n`;
  xml += `    <rs:ln rel="cite-as" href="${baseUrl}/id/dataset/arms-mbon" />\n`;
  xml += `  </url>\n`;
  xml += `  <url>\n`;
  xml += `    <loc>${baseUrl}/api/observations/v1?marker_gene=COI&amp;limit=20</loc>\n`;
  xml += `    <rs:ln rel="collection" href="${baseUrl}/api/observations/v1" />\n`;
  xml += `    <rs:ln rel="cite-as" href="${baseUrl}/id/dataset/arms-mbon" />\n`;
  xml += `  </url>\n`;
  xml += `  <url>\n`;
  xml += `    <loc>${baseUrl}/api/observations/v1?marker_gene=ITS&amp;limit=20</loc>\n`;
  xml += `    <rs:ln rel="collection" href="${baseUrl}/api/observations/v1" />\n`;
  xml += `    <rs:ln rel="cite-as" href="${baseUrl}/id/dataset/arms-mbon" />\n`;
  xml += `  </url>\n`;
  xml += `</urlset>\n`;
  return xml;
}
```
In `generateApiSampleResponses()` of `generator/openApiGenerator.ts`:
```typescript
  // 5. Co-located dedicated API sitemap
  fs.writeFileSync(path.join(v1Dir, "sitemap.xml"), generateApiSitemapXml(baseUrl));
```
In `generator/linksetGenerator.ts` `generateApiServiceLinkset()`:
```typescript
        "alternate": [
          {
            href: `${baseUrl}/api/observations/v1/sitemap.xml`,
            type: "application/xml"
          }
        ],
```

- [ ] **Step 4: Re-generate and run test to verify it passes**

Run: `bun run generate:all; bun test test/nginxIntegration.test.ts`
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
git add generator/openApiGenerator.ts generator/linksetGenerator.ts test/nginxIntegration.test.ts
git commit -m "feat: generate dedicated API sub-sitemap and update API linkset"
```

---

### Task 2: Update Catalog Sitemap (`/sitemap-catalog.xml`) and Sitemap Index (`/sitemap-index.xml`)

**Files:**
- Modify: `generator/index.ts`
- Test: `test/nginxIntegration.test.ts`

**Interfaces:**
- Consumes: `BASE_URL` in `generator/index.ts`
- Produces:
  - `dist/sitemap-catalog.xml` with `<rs:ln rel="self">` and alternate to API sitemap
  - `dist/sitemap-index.xml` with delegation to `/api/observations/v1/sitemap.xml`

- [ ] **Step 1: Write failing test in `test/nginxIntegration.test.ts`**

Update `test/nginxIntegration.test.ts`:
```typescript
    expect(indexXml).toContain("<loc>http://localhost:8080/api/observations/v1/sitemap.xml</loc>");

    const catalogXml = fs.readFileSync(sitemapCatalogPath, "utf-8");
    expect(catalogXml).toContain('<rs:ln rel="self" href="http://localhost:8080/.well-known/api-catalog" />');
    expect(catalogXml).toContain('<rs:ln rel="alternate" href="http://localhost:8080/api/observations/v1/sitemap.xml" type="application/xml" />');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test test/nginxIntegration.test.ts`
Expected: FAIL (missing sitemap index delegation and catalog sitemap self/alternate tags).

- [ ] **Step 3: Update `sitemap-catalog.xml` and `sitemap-index.xml` in `generator/index.ts`**

In `generator/index.ts`:
```typescript
  // 3. sitemap-catalog.xml
  let sitemapCatalog = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n        xmlns:rs="http://www.openarchives.org/rs/terms/">\n`;
  sitemapCatalog += `  <rs:ln rel="self" href="${BASE_URL}/.well-known/api-catalog" />\n`;
  sitemapCatalog += `  <url>\n    <loc>${BASE_URL}/catalog/</loc>\n    <rs:ln rel="type" href="https://www.w3.org/TR/vocab-dcat/" />\n    <rs:ln rel="alternate" href="${BASE_URL}/catalog/dcat.ttl" type="text/turtle" />\n  </url>\n`;
  sitemapCatalog += `  <url>\n    <loc>${BASE_URL}/.well-known/api-catalog</loc>\n    <rs:ln rel="profile" href="https://www.rfc-editor.org/info/rfc9727" />\n  </url>\n`;
  sitemapCatalog += `  <url>\n    <loc>${BASE_URL}/api/observations/v1</loc>\n    <rs:ln rel="cite-as" href="${BASE_URL}/id/dataset/arms-mbon" />\n    <rs:ln rel="alternate" href="${BASE_URL}/api/observations/v1/sitemap.xml" type="application/xml" />\n  </url>\n`;
  sitemapCatalog += `  <url>\n    <loc>${BASE_URL}/api/observations/v1/docs/</loc>\n    <rs:ln rel="service-desc" href="${BASE_URL}/api/observations/v1/openapi.json" />\n  </url>\n`;
  sitemapCatalog += `</urlset>\n`;
  fs.writeFileSync(path.join(DIST_DIR, "sitemap-catalog.xml"), sitemapCatalog);

  // 4. sitemap-index.xml
  let sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  sitemapIndex += `  <sitemap>\n    <loc>${BASE_URL}/sitemap.xml</loc>\n  </sitemap>\n`;
  sitemapIndex += `  <sitemap>\n    <loc>${BASE_URL}/sitemap-datasets.xml</loc>\n  </sitemap>\n`;
  sitemapIndex += `  <sitemap>\n    <loc>${BASE_URL}/sitemap-profiles.xml</loc>\n  </sitemap>\n`;
  sitemapIndex += `  <sitemap>\n    <loc>${BASE_URL}/sitemap-catalog.xml</loc>\n  </sitemap>\n`;
  sitemapIndex += `  <sitemap>\n    <loc>${BASE_URL}/api/observations/v1/sitemap.xml</loc>\n  </sitemap>\n`;
  sitemapIndex += `</sitemapindex>\n`;
  fs.writeFileSync(path.join(DIST_DIR, "sitemap-index.xml"), sitemapIndex);
```

- [ ] **Step 4: Re-generate and run test to verify it passes**

Run: `bun run generate:all; bun test test/nginxIntegration.test.ts`
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
git add generator/index.ts test/nginxIntegration.test.ts
git commit -m "feat: add self-binding and API alternate to catalog sitemap and index"
```

---

### Task 3: Configure Nginx Location Blocks and RFC 8288 Headers for Pattern 7

**Files:**
- Modify: `generator/index.ts`
- Test: `test/nginxIntegration.test.ts`

**Interfaces:**
- Produces:
  - Location `/sitemap-catalog.xml` with `Link: <${BASE_URL}/.well-known/api-catalog>; rel="self"`
  - Location `/api/observations/v1/sitemap.xml` with `Link: <${BASE_URL}/api/observations/v1>; rel="self", <${BASE_URL}/.well-known/api-catalog>; rel="api-catalog"`
  - Location `/.well-known/api-catalog` with `rel="item"` to `${BASE_URL}/api/observations/v1`
  - Location `/api/observations/v1` with `rel="alternate"` and `rel="collection"`

- [ ] **Step 1: Write failing test in `test/nginxIntegration.test.ts`**

Add test assertions to `test/nginxIntegration.test.ts`:
```typescript
  it("configures RT-P07 RFC 8288 Link headers in nginx-headers.conf for catalog sitemap, API sitemap, and endpoint", () => {
    const headersConf = fs.readFileSync(path.join(distDir, "nginx-headers.conf"), "utf-8");

    // /sitemap-catalog.xml
    expect(headersConf).toContain("location = /sitemap-catalog.xml");
    expect(headersConf).toContain('<http://localhost:8080/.well-known/api-catalog>; rel="self"');

    // /api/observations/v1/sitemap.xml
    expect(headersConf).toContain("location = /api/observations/v1/sitemap.xml");
    expect(headersConf).toContain('<http://localhost:8080/api/observations/v1>; rel="self"');
    expect(headersConf).toContain('<http://localhost:8080/.well-known/api-catalog>; rel="api-catalog"');

    // /.well-known/api-catalog
    const catBlock = headersConf.substring(
      headersConf.indexOf("location = /.well-known/api-catalog"),
      headersConf.indexOf("}", headersConf.indexOf("location = /.well-known/api-catalog"))
    );
    expect(catBlock).toContain('<http://localhost:8080/api/observations/v1>; rel="item"');
    expect(catBlock).toContain('<http://localhost:8080/sitemap-catalog.xml>; rel="alternate"; type="application/xml"');

    // /api/observations/v1
    const apiBlock = headersConf.substring(
      headersConf.indexOf("location = /api/observations/v1 {"),
      headersConf.indexOf("}", headersConf.indexOf("location = /api/observations/v1 {"))
    );
    expect(apiBlock).toContain('<http://localhost:8080/api/observations/v1/sitemap.xml>; rel="alternate"; type="application/xml"');
    expect(apiBlock).toContain('<http://localhost:8080/api/observations/v1>; rel="collection"');
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test test/nginxIntegration.test.ts`
Expected: FAIL

- [ ] **Step 3: Update `nginx-headers.conf` generation in `generator/index.ts`**

In `generator/index.ts`:
```typescript
  headersConf += `location = /sitemap-catalog.xml {\n`;
  headersConf += `    default_type application/xml;\n`;
  headersConf += `    add_header Access-Control-Allow-Origin * always;\n`;
  headersConf += `    add_header Link '<${BASE_URL}/.well-known/api-catalog>; rel="self"' always;\n`;
  headersConf += `}\n\n`;

  headersConf += `location = /api/observations/v1/sitemap.xml {\n`;
  headersConf += `    default_type application/xml;\n`;
  headersConf += `    add_header Access-Control-Allow-Origin * always;\n`;
  headersConf += `    add_header Link '<${BASE_URL}/api/observations/v1>; rel="self", <${BASE_URL}/.well-known/api-catalog>; rel="api-catalog"' always;\n`;
  headersConf += `}\n\n`;

  headersConf += `location = /.well-known/api-catalog {\n`;
  headersConf += `    default_type application/linkset+json;\n`;
  headersConf += `    add_header Access-Control-Allow-Origin * always;\n`;
  headersConf += `    add_header Link '<${BASE_URL}/sitemap-catalog.xml>; rel="alternate"; type="application/xml", <${BASE_URL}/api/observations/v1>; rel="item"' always;\n`;
  headersConf += `}\n\n`;

  // Headers for Subsetting API (RT-P05 & RT-P07)
  const apiLinks = [
    `<${BASE_URL}/id/dataset/arms-mbon>; rel="cite-as"`,
    `<${BASE_URL}/api/observations/v1/openapi.json>; rel="service-desc"; type="application/json"`,
    `<${BASE_URL}/api/observations/v1/docs/>; rel="service-doc"; type="text/html"`,
    `<${BASE_URL}/api/observations/v1/meta.ttl>; rel="service-meta"; type="text/turtle"`,
    `<${BASE_URL}/api/observations/v1/linkset.json>; rel="linkset"; type="application/linkset+json"`,
    `<${BASE_URL}/api/observations/v1/sitemap.xml>; rel="alternate"; type="application/xml"`,
    `<${BASE_URL}/.well-known/api-catalog>; rel="api-catalog"`,
    `<${BASE_URL}/api/observations/v1>; rel="collection"`
  ];
```

- [ ] **Step 4: Re-generate and run test to verify it passes**

Run: `bun run generate:all; bun test test/nginxIntegration.test.ts`
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
git add generator/index.ts test/nginxIntegration.test.ts
git commit -m "feat: configure Nginx headers for RT-P07 sitemaps and API endpoint"
```

---

### Task 4: Update Discovery Cascade & Metromap Engine

**Files:**
- Modify: `generator/metromap/engine/MetroGraphBuilder.ts`
- Modify: `generator/metromap/engine/DiscoveryCascadeEngine.ts`
- Test: `test/` (All existing tests)

**Interfaces:**
- Produces: Station `/api/observations/v1/sitemap.xml` registered in graph and discovery cascade

- [ ] **Step 1: Check existing Metromap and cascade links**

In `generator/metromap/engine/MetroGraphBuilder.ts`:
Add file resolution for `/api/observations/v1/sitemap.xml`:
```typescript
if (uri === "/api/observations/v1/sitemap.xml") return "dist/api/observations/v1/sitemap.xml";
```
In `generator/metromap/engine/DiscoveryCascadeEngine.ts`:
Add edge from `/sitemap-index.xml` to `/api/observations/v1/sitemap.xml` and from `/api/observations/v1/sitemap.xml` to `/api/observations/v1`.

- [ ] **Step 2: Run all unit tests**

Run: `bun run generate:all; bun test`
Expected: All 74+ tests pass.

- [ ] **Step 3: Commit changes**

```bash
git add generator/metromap/engine/MetroGraphBuilder.ts generator/metromap/engine/DiscoveryCascadeEngine.ts
git commit -m "feat: register dedicated API sitemap in metromap engine"
```

---

### Task 5: Docker Reload, Live Verification, & Empirical Test Suite Execution

**Files:**
- Test verification: live curl checks and external empirical test runner

- [ ] **Step 1: Restart Docker containers to load updated `dist/` and `nginx-headers.conf`**

Run: `docker compose up -d --build`
Expected: Containers restarted and healthy.

- [ ] **Step 2: Verify live HTTP response headers with curl**

Run:
```powershell
curl.exe -sI http://localhost:8080/sitemap-catalog.xml
curl.exe -sI http://localhost:8080/api/observations/v1/sitemap.xml
curl.exe -sI "http://localhost:8080/api/observations/v1?marker_gene=18S&limit=20"
curl.exe -sI http://localhost:8080/.well-known/api-catalog
```
Expected:
- `/sitemap-catalog.xml`: `Link: <http://localhost:8080/.well-known/api-catalog>; rel="self"`
- `/api/observations/v1/sitemap.xml`: `HTTP/1.1 200 OK`, `Link: <http://localhost:8080/api/observations/v1>; rel="self"`
- `/api/observations/v1`: `rel="alternate"` pointing to `/api/observations/v1/sitemap.xml` and `rel="collection"`
- `/.well-known/api-catalog`: `rel="alternate"` pointing to `/sitemap-catalog.xml` and `rel="item"` to `/api/observations/v1`

- [ ] **Step 3: Run the empirical test suite in `rt-test`**

Run:
```powershell
python c:\Users\cedricd\Documents\Github\grmp-test-implementations\rt-test\src\rt_test.py -c c:\Users\cedricd\Documents\Github\grmp-test-implementations\rt-test\config_localhost_empirical.yaml
```
Expected:
- 0 failed, 0 errors
- 131+ assertions passed
- PT-07 tripartite diagram shows all checks `[✓ PASS]`
