# Resource URL & Directory Reorganization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganize all semantic resources, RDF variants, RFC 9264 linksets, and Nginx content negotiation into the canonical `/id/{type}/{name}` hierarchy with co-located files in `dist/id/{type}/`.

**Architecture:** Refactor resource category mapping, `expandUri` helper, HTML template links, RDF serializers, linkset generators, profile generators, DCAT/OpenAPI generators, Discovery Cascade Engine, and Nginx configuration so that all resources have abstract PIDs at `/id/{type}/{name}` and their variants (`.html`, `.ttl`, `.jsonld`, `.rdf`, `.linkset.json`) sit side-by-side in `dist/id/{type}/`.

**Tech Stack:** TypeScript, Bun, N3.js, Nginx, RFC 9110 (HTTP Semantics / Conneg), RFC 8288 (Web Linking), RFC 9264 (Linksets), RFC 9727 (API Catalog), W3C DCAT-3, W3C dx-prof.

**Spec:** `docs/superpowers/specs/2026-08-19-resource-url-reorganization-design.md`

## Global Constraints
- Canonical entity URIs: `${baseUrl}/id/${type}/${name}`
- Types: `dataset`, `institute`, `person`, `publication`, `project`, `service`, `profile`
- Co-located sibling files: `dist/id/{type}/{name}.{html,ttl,jsonld,rdf,linkset.json}`
- Profile catalog path: `/id/profiles` (file: `dist/id/profiles/index.html`)
- All tests run with `bun test`

---

### Task 1: Type Definitions, Resource Categories & Profile Mapping

**Files:**
- Modify: `generator/types.ts`
- Modify: `generator/resources.ts`
- Modify: `generator/profiles.ts`
- Test: `test/profiles.test.ts`

**Interfaces:**
- Produces:
  - `function getEntityTypeSlug(res: MarineEntity): string`
  - `function getEntityNameSlug(res: MarineEntity): string`
  - `function getEntityIdPath(res: MarineEntity): string` (returns `/id/{type}/{name}`)
  - `function getEntityHtmlPath(res: MarineEntity): string` (returns `/id/{type}/{name}.html`)
  - `category: "service"` (updated from `"api"`) in `generator/resources.ts`

- [ ] **Step 1: Write the failing tests in `test/profiles.test.ts`**

Update `test/profiles.test.ts` to expect `/id/profile/` links and `/id/profiles` catalog path.

```typescript
import { describe, it, expect } from "bun:test";
import { PROFILES, getProfileById } from "../generator/profiles";
import {
  generateProfileHtml,
  generateProfileCatalogHtml,
  generateProfileTurtle,
  generateProfileJsonLd,
  generateProfileLinkset
} from "../generator/profileGenerator";

describe("Profiles System & RT-P02 Composition", () => {
  it("contains defined atomic and composite profiles", () => {
    expect(PROFILES.length).toBeGreaterThanOrEqual(6);
    const genomicProfile = getProfileById("marine-genomic-dataset-profile");
    expect(genomicProfile).toBeDefined();
    expect(genomicProfile?.isAtomic).toBe(false);
    expect(genomicProfile?.composedProfiles?.length).toBe(4);
  });

  it("generates valid W3C dx-prof Turtle RDF with SHACL shapes under /id/profile/", () => {
    const genomicProfile = getProfileById("marine-genomic-dataset-profile")!;
    const ttl = generateProfileTurtle(genomicProfile, "http://localhost:8080");

    expect(ttl).toContain("http://localhost:8080/id/profile/marine-genomic-dataset-profile");
    expect(ttl).toContain("a prof:Profile ;");
    expect(ttl).toContain("prof:isProfileOf");
    expect(ttl).toContain("vliz:MarineGenomicShape");
  });

  it("generates RFC 9264 JSON Linkset encoding rel=\"item\" sub-profile hierarchy under /id/profile/", () => {
    const genomicProfile = getProfileById("marine-genomic-dataset-profile")!;
    const linkset = generateProfileLinkset(genomicProfile, "http://localhost:8080");

    expect(linkset.linkset).toBeDefined();
    expect(linkset.linkset[0].anchor).toBe("http://localhost:8080/id/profile/marine-genomic-dataset-profile");
    expect(linkset.linkset[0]["http://www.w3.org/1999/xhtml/vocab#item"]).toBeDefined();
    expect(linkset.linkset[0]["http://www.w3.org/1999/xhtml/vocab#item"][0].href).toContain("/id/profile/schema-dataset-profile.html");
  });

  it("renders profile catalog at /id/profiles and individual profile HTML", () => {
    const catalogHtml = generateProfileCatalogHtml(PROFILES, "http://localhost:8080");
    expect(catalogHtml).toContain("Semantic Profiles & Composition Registry");
    expect(catalogHtml).toContain("/id/profile/marine-genomic-dataset-profile.html");

    const genomicProfile = getProfileById("marine-genomic-dataset-profile")!;
    const profileHtml = generateProfileHtml(genomicProfile, "http://localhost:8080");
    expect(profileHtml).toContain("Marine Genomic & Metabarcoding Dataset Composite Profile");
    expect(profileHtml).toContain("/id/profile/marine-genomic-dataset-profile.ttl");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test test/profiles.test.ts`
Expected: FAIL with old `/profiles/` paths.

- [ ] **Step 3: Update `generator/types.ts`, `generator/resources.ts`, and `generator/profiles.ts`**

In `generator/types.ts`:
- Update `category?: "dataset" | "institute" | "publication" | "project" | "person" | "service";`
- Add helper functions `getEntityTypeSlug`, `getEntityNameSlug`, `getEntityIdPath`, `getEntityHtmlPath`.

In `generator/resources.ts`:
- Update resource `"resource-api-service"` to have `category: "service"`.

In `generator/profiles.ts`:
- Ensure helper functions work cleanly with profile URIs at `${baseUrl}/id/profile/${id}`.

- [ ] **Step 4: Update `generator/profileGenerator.ts` to output `/id/profile/` paths**

Update `generateProfileHtml`, `generateProfileCatalogHtml`, `generateProfileTurtle`, `generateProfileJsonLd`, `generateProfileLinkset` to use `${baseUrl}/id/profile/${profile.id}` as anchor and `/id/profile/${profile.id}.{html,ttl,jsonld,linkset.json}`.

- [ ] **Step 5: Run tests and verify they pass**

Run: `bun test test/profiles.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add generator/types.ts generator/resources.ts generator/profiles.ts generator/profileGenerator.ts test/profiles.test.ts
git commit -m "feat(types): update resource category mapping and profile generators for /id/{type}/{name}"
```

---

### Task 2: RDF Serializers & RFC 9264 Linkset Generator

**Files:**
- Modify: `generator/rdfSerializer.ts`
- Modify: `generator/linksetGenerator.ts`
- Test: `test/serialization.test.ts` (create new test)

**Interfaces:**
- Consumes: `RESOURCES`, `getResourceById`, `getEntityTypeSlug`, `getEntityNameSlug`, `getEntityIdPath`
- Produces:
  - `expandUri(uriOrId: string, baseUri: string): string` $\rightarrow$ returns `${baseUri}/id/${type}/${name}` for internal resource IDs
  - `generateLinkset(resource: MarineEntity, baseUrl: string): object` $\rightarrow$ returns linkset with anchor `${baseUrl}/id/${type}/${name}` and co-located siblings

- [ ] **Step 1: Write tests for RDF serialization and linksets**

Create `test/serialization.test.ts`:
```typescript
import { describe, it, expect } from "bun:test";
import { RESOURCES, getResourceById } from "../generator/resources";
import { serializeTurtle, serializeJsonLd, expandUri } from "../generator/rdfSerializer";
import { generateLinkset } from "../generator/linksetGenerator";

describe("RDF Serialization & Linkset Generation", () => {
  const dataset = getResourceById("resource-arms-mbon")!;

  it("expands resource IDs to /id/{type}/{name}", () => {
    const uri = expandUri("resource-arms-mbon", "http://localhost:8080");
    expect(uri).toBe("http://localhost:8080/id/dataset/arms-mbon");

    const personUri = expandUri("resource-katrina", "http://localhost:8080");
    expect(personUri).toBe("http://localhost:8080/id/person/katrina");

    const instituteUri = expandUri("resource-vliz", "http://localhost:8080");
    expect(instituteUri).toBe("http://localhost:8080/id/institute/vliz");
  });

  it("serializes Turtle with canonical /id/ subject and object URIs", () => {
    const ttl = serializeTurtle(dataset, "http://localhost:8080");
    expect(ttl).toContain("<http://localhost:8080/id/dataset/arms-mbon>");
    expect(ttl).toContain("schema:publisher <http://localhost:8080/id/institute/vliz>");
  });

  it("serializes JSON-LD with @id under /id/{type}/{name}", () => {
    const jsonldStr = serializeJsonLd(dataset, "http://localhost:8080");
    const jsonld = JSON.parse(jsonldStr);
    expect(jsonld["@id"]).toBe("http://localhost:8080/id/dataset/arms-mbon");
  });

  it("generates RFC 9264 Linkset with co-located siblings in /id/dataset/", () => {
    const linkset = generateLinkset(dataset, "http://localhost:8080") as any;
    expect(linkset.linkset[0].anchor).toBe("http://localhost:8080/id/dataset/arms-mbon");
    expect(linkset.linkset[0].describedby.some((d: any) => d.href === "http://localhost:8080/id/dataset/arms-mbon.ttl")).toBe(true);
    expect(linkset.linkset[0].alternate.some((a: any) => a.href === "http://localhost:8080/id/dataset/arms-mbon.html")).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test test/serialization.test.ts`
Expected: FAIL with old `/resource/` and `/rdf/` paths.

- [ ] **Step 3: Update `generator/rdfSerializer.ts` and `generator/linksetGenerator.ts`**

In `generator/rdfSerializer.ts`:
- Update `expandUri(uriOrId: string, baseUri: string): string`:
  Lookup entity in `RESOURCES` (or parse `resource-{slug}`), map category to `{type}`, and return `${baseUri}/id/${type}/${slug}`.
  If it starts with `profile-` or is in `PROFILES`, return `${baseUri}/id/profile/${id}`.

In `generator/linksetGenerator.ts`:
- Update `generateLinkset`:
  - `anchor`: `${baseUrl}/id/${type}/${name}`
  - `describedby`:
    - `${baseUrl}/id/${type}/${name}.ttl`
    - `${baseUrl}/id/${type}/${name}.jsonld`
    - `${baseUrl}/id/${type}/${name}.rdf`
  - `alternate`: `${baseUrl}/id/${type}/${name}.html`
  - `profile`: point to `${baseUrl}/id/profile/{profileId}.html` or schema.org/dcat
  - `collection`: `${baseUrl}/catalog/`

- [ ] **Step 4: Run tests and verify they pass**

Run: `bun test test/serialization.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add generator/rdfSerializer.ts generator/linksetGenerator.ts test/serialization.test.ts
git commit -m "feat(rdf): update expandUri and linksets to /id/{type}/{name} scheme"
```

---

### Task 3: HTML Templates & UI Interlinking

**Files:**
- Modify: `generator/htmlTemplates.ts`
- Test: `test/htmlTemplates.test.ts` (create new test)

**Interfaces:**
- Consumes: `RESOURCES`, `PROFILES`, `expandUri`, `getEntityHtmlPath`
- Produces: HTML renderers linking to `/id/{type}/{name}.html` and signposting `<link>` tags pointing to co-located `.ttl`, `.jsonld`, `.linkset.json`

- [ ] **Step 1: Write tests for HTML template links**

Create `test/htmlTemplates.test.ts`:
```typescript
import { describe, it, expect } from "bun:test";
import { RESOURCES, getResourceById } from "../generator/resources";
import { renderDatasetPageHtml, renderInstitutePageHtml, renderCatalogHomeHtml } from "../generator/htmlTemplates";

describe("HTML Template Rendering", () => {
  const dataset = getResourceById("resource-arms-mbon")!;
  const institute = getResourceById("resource-vliz")!;

  it("renders dataset HTML with /id/ links and signposts", () => {
    const html = renderDatasetPageHtml(dataset, "http://localhost:8080");
    expect(html).toContain('href="/id/dataset/arms-mbon.ttl"');
    expect(html).toContain('href="/id/dataset/arms-mbon.jsonld"');
    expect(html).toContain('href="/id/dataset/arms-mbon.linkset.json"');
    expect(html).toContain('href="/id/institute/vliz.html"');
    expect(html).toContain('href="/id/person/katrina.html"');
    expect(html).toContain('href="/id/profiles"');
  });

  it("renders institute HTML with /id/ links", () => {
    const html = renderInstitutePageHtml(institute, "http://localhost:8080");
    expect(html).toContain('href="/id/institute/vliz.ttl"');
    expect(html).toContain('href="/id/institute/vliz.linkset.json"');
  });

  it("renders home page cards pointing to /id/{type}/{name}.html", () => {
    const html = renderCatalogHomeHtml(RESOURCES, "http://localhost:8080");
    expect(html).toContain('href="/id/dataset/arms-mbon.html"');
    expect(html).toContain('href="/id/institute/vliz.html"');
    expect(html).toContain('href="/id/profiles"');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test test/htmlTemplates.test.ts`
Expected: FAIL

- [ ] **Step 3: Update `generator/htmlTemplates.ts`**

Update:
- Navigation bar links: Profiles link $\rightarrow$ `/id/profiles`
- Signposting `<link>` tags in `<head>`:
  - `<link rel="describedby" type="text/turtle" href="/id/${type}/${name}.ttl">`
  - `<link rel="describedby" type="application/ld+json" href="/id/${type}/${name}.jsonld">`
  - `<link rel="describedby" type="application/rdf+xml" href="/id/${type}/${name}.rdf">`
  - `<link rel="linkset" type="application/linkset+json" href="/id/${type}/${name}.linkset.json">`
- Conneg dropdown links in header:
  - Turtle $\rightarrow$ `/id/${type}/${name}.ttl`
  - JSON-LD $\rightarrow$ `/id/${type}/${name}.jsonld`
  - RDF/XML $\rightarrow$ `/id/${type}/${name}.rdf`
  - Linkset $\rightarrow$ `/id/${type}/${name}.linkset.json`
- Entity cross-reference links:
  - Creators $\rightarrow$ `/id/person/${slug}.html`
  - Publisher $\rightarrow$ `/id/institute/${slug}.html`
  - Projects $\rightarrow$ `/id/project/${slug}.html`
  - Publications $\rightarrow$ `/id/publication/${slug}.html`
  - Profiles $\rightarrow$ `/id/profile/${profileId}.html`

- [ ] **Step 4: Run tests and verify they pass**

Run: `bun test test/htmlTemplates.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add generator/htmlTemplates.ts test/htmlTemplates.test.ts
git commit -m "feat(html): update template links and signposting to /id/{type}/{name}"
```

---

### Task 4: DCAT, OpenAPI, Compliance Docs & Generator Pipeline

**Files:**
- Modify: `generator/dcatGenerator.ts`
- Modify: `generator/openApiGenerator.ts`
- Modify: `generator/complianceDocs.ts`
- Modify: `generator/index.ts`
- Modify: `generator/strategies.ts`

**Interfaces:**
- Consumes: `RESOURCES`, `PROFILES`, serialization helpers
- Produces:
  - `cleanDist()` and `ensureDirs()` creating `dist/id/{dataset,institute,person,publication,project,service,profile,profiles}`
  - Generator writing all representations to `dist/id/{type}/`
  - `nginx-coneg.conf`, `nginx-headers.conf`, `sitemap.xml` referencing `/id/{type}/{name}`

- [ ] **Step 1: Update `generator/dcatGenerator.ts`, `openApiGenerator.ts`, and `complianceDocs.ts`**

- In `dcatGenerator.ts`: Ensure dataset/service URIs in DCAT catalog point to `/id/{type}/{name}`.
- In `openApiGenerator.ts`: Update API docs and sample links.
- In `complianceDocs.ts`: Update documentation templates referencing `/id/{type}/{name}`.
- In `strategies.ts`: Update reference snippets if any hardcode `/resource/` or `/rdf/`.

- [ ] **Step 2: Update `generator/index.ts`**

- Update `ensureDirs`:
  ```typescript
  const dirs = [
    DIST_DIR,
    path.join(DIST_DIR, "id", "dataset"),
    path.join(DIST_DIR, "id", "institute"),
    path.join(DIST_DIR, "id", "person"),
    path.join(DIST_DIR, "id", "publication"),
    path.join(DIST_DIR, "id", "project"),
    path.join(DIST_DIR, "id", "service"),
    path.join(DIST_DIR, "id", "profile"),
    path.join(DIST_DIR, "id", "profiles"),
    path.join(DIST_DIR, "catalog"),
    path.join(DIST_DIR, "data"),
    path.join(DIST_DIR, "api", "docs"),
    path.join(DIST_DIR, ".well-known")
  ];
  ```
- Output all HTML, TTL, JSON-LD, RDF, Linkset files into `dist/id/{type}/`.
- Output profile catalog to `dist/id/profiles/index.html`.
- Update `sitemap.xml` with `/id/profiles` and `/id/{type}/{name}.html` with co-located signposts.
- Update `nginx-coneg.conf` and `nginx-headers.conf`.

- [ ] **Step 3: Run `bun run generate` to verify build**

Run: `bun run generate`
Expected: Output successfully written to `dist/id/` with all subdirectories populated.

- [ ] **Step 4: Commit**

```bash
git add generator/dcatGenerator.ts generator/openApiGenerator.ts generator/complianceDocs.ts generator/index.ts generator/strategies.ts
git commit -m "feat(generator): output all entities and variants to dist/id/{type}/"
```

---

### Task 5: MetroMap Discovery Cascade Engine & MetroGraphBuilder

**Files:**
- Modify: `generator/metromap/engine/DiscoveryCascadeEngine.ts`
- Modify: `generator/metromap/engine/MetroGraphBuilder.ts`
- Modify: `generator/metromap/renderers/HtmlPageRenderer.ts`
- Modify: `generator/metromap/registry/rtPatternsRegistry.ts`
- Test: `test/metromap/discoveryBuilder.test.ts`
- Test: `test/metromap/e2e.test.ts`

**Interfaces:**
- Consumes: `RESOURCES`, `PROFILES`
- Produces: Discovery Cascade and Metro Graph that models `/id/{type}/{name}` PIDs, 303 Conneg transitions, and sibling files

- [ ] **Step 1: Update DiscoveryCascadeEngine signals**

In `generator/metromap/engine/DiscoveryCascadeEngine.ts`:
- Update domain signals to point to `/id/profiles` for profile registry.
- Update featured entity PIDs to `/id/${type}/${slug}` (e.g. `/id/dataset/arms-mbon`).
- Update 303 conneg arcs to target `/id/${type}/${slug}.html` and sibling `.ttl`, `.jsonld`, `.linkset.json`.
- Update profile URIs to `/id/profile/${profileId}.html`.

- [ ] **Step 2: Update MetroMap tests**

Update `test/metromap/discoveryBuilder.test.ts` and `test/metromap/e2e.test.ts` to test `/id/dataset/arms-mbon` and `/id/profile/`.

- [ ] **Step 3: Run tests and verify they pass**

Run: `bun test test/metromap/discoveryBuilder.test.ts test/metromap/e2e.test.ts`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add generator/metromap/ test/metromap/
git commit -m "feat(metromap): update discovery cascade and metro map graph to /id/{type}/{name}"
```

---

### Task 6: Nginx Configuration & Full Pipeline Validation

**Files:**
- Modify: `nginx.conf`
- Modify: `README.md`

**Interfaces:**
- Produces: Updated Nginx config with generic `/id/(?<res_type>[^/]+)/(?<res_name>[^/.]+)$` conneg and static MIME routing

- [ ] **Step 1: Update `nginx.conf`**

```nginx
events {
    worker_connections 1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;

    map_hash_bucket_size 128;
    map_hash_max_size 4096;

    # Include content-negotiation map ($http_accept -> $conneg_suffix)
    include /usr/share/nginx/html/nginx-coneg.conf;

    sendfile        on;
    keepalive_timeout  65;

    server {
        listen       80;
        server_name  localhost;

        root   /usr/share/nginx/html;
        index  index.html;

        # Enable Global CORS for LOD extraction utilities & web crawlers
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, OPTIONS";
        add_header Access-Control-Allow-Headers "Range, DNT, User-Agent, X-Requested-With, If-Modified-Since, Cache-Control, Content-Type, Accept";

        # Serve content-negotiated resource URIs (RFC 9110 / 303 See Other)
        location ~ ^/id/(?<res_type>[^/]+)/(?<res_name>[^/.]+)$ {
            add_header Vary Accept always;
            add_header Access-Control-Allow-Origin * always;
            return 303 $scheme://$http_host/id/$res_type/$res_name.$conneg_suffix;
        }

        # Profile registry overview
        location /id/profiles {
            try_files $uri $uri/ /id/profiles/index.html;
        }

        # MIME types for resources and variants in /id/
        location /id/ {
            types {
                text/html                     html;
                text/turtle                   ttl;
                application/ld+json           jsonld;
                application/rdf+xml           rdf;
                application/linkset+json      json;
            }
        }

        # Serve API resources with JSON type
        location /api/ {
            default_type application/json;
        }

        # Serve Swagger documentation at /api/docs/
        location /api/docs/ {
            default_type text/html;
            try_files $uri $uri/ /api/docs/index.html =404;
        }

        # Serve .well-known endpoints with linkset JSON MIME type
        location /.well-known/ {
            default_type application/linkset+json;
            types {
                application/linkset+json      api-catalog;
                application/linkset+json      json;
            }
        }

        # Serve downloadable data payloads with correct MIME types
        location /data/ {
            types {
                text/csv                      csv;
                application/geo+json          geojson;
                application/zip               zip;
                application/pdf               pdf;
                application/json              json;
            }
        }

        # Include dynamically generated per-resource Link headers (RFC 8288)
        include /usr/share/nginx/html/nginx-headers.conf;

        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }
    }
}
```

- [ ] **Step 2: Run all test suites**

Run: `bun test`
Expected: 100% tests pass.

- [ ] **Step 3: Run full generation and inspect dist output**

Run: `bun run generate`
Expected: All files generated cleanly in `dist/id/{type}/`.

- [ ] **Step 4: Commit**

```bash
git add nginx.conf README.md
git commit -m "feat(nginx): configure generic /id/ content negotiation and MIME routing"
```
