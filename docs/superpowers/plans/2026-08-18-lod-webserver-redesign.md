# LOD Webserver Redesign (Radical Transparency Data Portal) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the LOD webserver into a production-grade Marine Science Data Portal and Linked Open Data Hub implementing Radical Transparency (RFC 8288, RFC 6906, RFC 9264, RFC 9727, DCAT-3, and FAIR Signposting) with real taken-over marine resources and downloadable data payloads.

**Architecture:** A static generation pipeline compiles rich HTML views, physical dataset distributions (CSV, GeoJSON, RO-Crate ZIP), DCAT-3 serializations, OpenAPI 3.0 endpoints, RFC 9264 linksets, and Nginx routing maps (`nginx-coneg.conf`, `nginx-headers.conf`). An Nginx Docker container serves all assets with full content negotiation, HTTP Link headers, and CORS.

**Tech Stack:** TypeScript, Bun, N3.js (RDF serializer), Vanilla CSS (Inter + Outfit design system), Swagger UI static bundle, Nginx, Docker.

**Spec:** [docs/superpowers/specs/2026-08-18-lod-webserver-redesign-design.md](file:///c:/Users/cedricd/Documents/Github/lod_docker_webserver/docs/superpowers/specs/2026-08-18-lod-webserver-redesign-design.md)

## Global Constraints
- Pure static build: All pages, linksets, RDF representations, and sample data files must be generated into `dist/`.
- Zero Node/Bun runtime in production: Nginx serves all static files, HTTP Link headers, and 303 redirects directly.
- Strict RFC compliance: RFC 8288 (Link header syntax), RFC 6906 (`rel="profile"`), RFC 9264 (`application/linkset+json`), RFC 9727 (`/.well-known/api-catalog`), RFC 9110 (Content Negotiation).
- Real marine resources: Flanders Marine Institute (VLIZ), ARMS-MBON, ARMS-2018, North Sea sensor series, EurOBIS, MAREGRAPH, RO-Crate paper, and ORCID researchers.
- Documentation: Gap analysis audit markdown files generated for all 9 entities under `docs/compliance/`.

---

### Task 1: Resource Model & Data Payloads Generator

**Files:**
- Create: `generator/dataPayloads.ts`
- Modify: `generator/types.ts`
- Modify: `generator/resources.ts`

**Interfaces:**
- Consumes: None (root data modeling).
- Produces:
  - `export interface ResourceDistribution` in `generator/types.ts`
  - `export interface MarineEntity` (Dataset, Institute, Publication, Project, Person, API) in `generator/types.ts`
  - `export const RESOURCES: MarineEntity[]` in `generator/resources.ts`
  - `export function generateDataPayloads(distDir: string): Promise<void>` in `generator/dataPayloads.ts`

- [ ] **Step 1: Write test script for data payloads generation**
Create `scratch/test-payloads.ts` that checks whether `generateDataPayloads` creates valid CSV, GeoJSON, and sample files in a test directory.

- [ ] **Step 2: Run test to verify it fails**
Run: `bun run scratch/test-payloads.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Update types and resource definitions**
Add distribution metadata, observation sample rows, and entity properties to `generator/types.ts` and `generator/resources.ts`.

- [ ] **Step 4: Implement `generateDataPayloads` in `generator/dataPayloads.ts`**
Generate:
- `arms-mbon-18s.csv` (sample 18S sequencing reads by station and date)
- `arms-mbon-stations.geojson` (geospatial coordinates of reef structures in Belgian North Sea)
- `arms-mbon-rocrate.zip` (synthetic RO-Crate package with `ro-crate-metadata.json`)
- `arms-2018-samples.csv` (baseline ecological sampling matrix)
- `north-sea-sensors-latest.csv` (time-series of seawater temperature, salinity, turbidity)
- `north-sea-sensors-stream.json` (JSON telemetry feed)
- `eurobis-occurrences.geojson` (marine species occurrences with coordinates)
- `eurobis-dwca-sample.zip` (Darwin Core Archive zip sample)
- `ro-crate-paper.pdf` (mock publication PDF payload)

- [ ] **Step 5: Run test to verify it passes**
Run: `bun run scratch/test-payloads.ts`
Expected: PASS (all files generated with correct sizes and valid formats).

- [ ] **Step 6: Commit Task 1**
```bash
git add generator/types.ts generator/resources.ts generator/dataPayloads.ts
git commit -m "feat: add marine resource models and downloadable data payloads generator"
```

---

### Task 2: DCAT-3 Catalogue & RFC 9264 Linkset Generator

**Files:**
- Create: `generator/dcatGenerator.ts`
- Create: `generator/linksetGenerator.ts`
- Modify: `generator/rdfSerializer.ts`

**Interfaces:**
- Consumes: `RESOURCES` from `generator/resources.ts`
- Produces:
  - `export function generateDcatCatalog(resources: MarineEntity[], baseUrl: string): { ttl: string; jsonld: string }`
  - `export function generateLinkset(resource: MarineEntity, baseUrl: string): object`
  - `export function generateApiCatalog(baseUrl: string): object`

- [ ] **Step 1: Write test script for DCAT and Linksets**
Create `scratch/test-dcat-linksets.ts` to test that DCAT Turtle validates and that generated Linkset JSON matches RFC 9264 and RFC 9727 schemas.

- [ ] **Step 2: Run test to verify it fails**
Run: `bun run scratch/test-dcat-linksets.ts`
Expected: FAIL.

- [ ] **Step 3: Implement DCAT-3 generator in `generator/dcatGenerator.ts`**
Generate DCAT-3 / DCAT-AP v2 `dcat:Catalog`, `dcat:Dataset`, `dcat:Distribution`, and `dcat:DataService` triples serialized in Turtle and JSON-LD.

- [ ] **Step 4: Implement Linkset & API Catalog generator in `generator/linksetGenerator.ts`**
Generate RFC 9264 compliant `application/linkset+json` structures with `anchor`, `profile`, `describedby`, `item`, `author`, and `publisher` links. Generate `/.well-known/api-catalog` compliant with RFC 9727.

- [ ] **Step 5: Run test to verify it passes**
Run: `bun run scratch/test-dcat-linksets.ts`
Expected: PASS.

- [ ] **Step 6: Commit Task 2**
```bash
git add generator/dcatGenerator.ts generator/linksetGenerator.ts generator/rdfSerializer.ts
git commit -m "feat: implement DCAT-3 catalog and RFC 9264/RFC 9727 linkset generators"
```

---

### Task 3: OpenAPI 3.0 Schema & Interactive Subsetting API Explorer

**Files:**
- Create: `generator/openApiGenerator.ts`

**Interfaces:**
- Consumes: `baseUrl: string`
- Produces:
  - `export function generateOpenApiSpec(baseUrl: string): object`
  - `export function generateApiDocsHtml(baseUrl: string): string`
  - `export function generateApiSampleResponses(distDir: string): void`

- [ ] **Step 1: Write test for OpenAPI spec validity**
Create `scratch/test-openapi.ts` to verify valid OpenAPI 3.0 JSON and swagger HTML output.

- [ ] **Step 2: Run test to verify it fails**
Run: `bun run scratch/test-openapi.ts`
Expected: FAIL.

- [ ] **Step 3: Implement OpenAPI 3.0 specification & Swagger UI in `generator/openApiGenerator.ts`**
Define endpoints:
- `GET /api/v1/observations`: Query observations with filters (`dataset`, `station`, `taxon`, `year`, `limit`).
- `GET /api/v1/datasets`: List marine datasets.
- `GET /api/v1/stations`: List North Sea observation stations.
Generate standalone Swagger UI viewer at `dist/api/docs/index.html` loading `/api/openapi.json`.

- [ ] **Step 4: Generate sample mock responses**
Write sample JSON responses in `dist/api/v1/observations` and `dist/api/v1/datasets` to serve real query results statically.

- [ ] **Step 5: Run test to verify it passes**
Run: `bun run scratch/test-openapi.ts`
Expected: PASS.

- [ ] **Step 6: Commit Task 3**
```bash
git add generator/openApiGenerator.ts
git commit -m "feat: add OpenAPI 3.0 specification and interactive Swagger explorer"
```

---

### Task 4: Marine UI Design System & HTML Page Templates

**Files:**
- Modify: `generator/htmlTemplates.ts`

**Interfaces:**
- Consumes: `MarineEntity`, `RESOURCES`, `baseUrl: string`
- Produces:
  - `export function renderCatalogHomeHtml(resources: MarineEntity[], baseUrl: string): string`
  - `export function renderDatasetPageHtml(dataset: MarineEntity, baseUrl: string): string`
  - `export function renderInstitutePageHtml(institute: MarineEntity, baseUrl: string): string`
  - `export function renderPublicationPageHtml(pub: MarineEntity, baseUrl: string): string`
  - `export function renderProjectPageHtml(proj: MarineEntity, baseUrl: string): string`
  - `export function renderPersonPageHtml(person: MarineEntity, baseUrl: string): string`
  - `export function renderDcatHtml(catalog: any, baseUrl: string): string`

- [ ] **Step 1: Write visual / markup test**
Create `scratch/test-html-templates.ts` to test HTML rendering for all entity types without broken links.

- [ ] **Step 2: Run test to verify it fails**
Run: `bun run scratch/test-html-templates.ts`
Expected: FAIL.

- [ ] **Step 3: Implement Marine Design System CSS in `generator/htmlTemplates.ts`**
Incorporate Outfit & Inter typography, deep ocean navy (`#0f172a`, `#1e3a8a`), sea teal (`#0d9488`, `#06b6d4`), card grids, data tables, distribution badges, and responsive header/footer.

- [ ] **Step 4: Implement Page Renderers**
- Portal Home (`index.html`): Search bar, entity type filters (All, Datasets, Publications, APIs, Institutes, People), metrics stats, featured dataset cards.
- Dataset Pages (`/datasets/:id.html`): Abstract, creators with ORCID badges, license, DOI, live sample observation table, and download center (CSV, GeoJSON, RO-Crate, Turtle, JSON-LD).
- Institute Pages (`/institutes/:id.html`): Organization details, staff members, hosted datasets.
- Publication Pages (`/publications/:id.html`): Abstract, authors, direct PDF download link, linked dataset, citation block.
- People & Project Pages (`/people/:id.html`, `/projects/:id.html`).
- DCAT Portal Page (`/catalog/index.html`): Human view of the catalogue with direct TTL/JSON-LD download links.

- [ ] **Step 5: Run test to verify it passes**
Run: `bun run scratch/test-html-templates.ts`
Expected: PASS.

- [ ] **Step 6: Commit Task 4**
```bash
git add generator/htmlTemplates.ts
git commit -m "feat: implement Marine UI design system and entity page templates"
```

---

### Task 5: Main Build Pipeline, Sitemap `rs:ln`, and Nginx Configuration

**Files:**
- Modify: `generator/index.ts`
- Modify: `nginx.conf`
- Modify: `package.json`

**Interfaces:**
- Consumes: All generators from Tasks 1-4.
- Produces:
  - Clean build output in `dist/` with all HTML, data files, linksets, RDF serializations, and `nginx-coneg.conf` / `nginx-headers.conf`.
  - Nginx configuration with CORS, 303 conneg redirects, and per-resource Link headers.

- [ ] **Step 1: Refactor `generator/index.ts`**
Assemble all build steps:
1. Initialize directories (`dist/datasets`, `dist/institutes`, `dist/publications`, `dist/projects`, `dist/people`, `dist/data`, `dist/rdf`, `dist/linksets`, `dist/.well-known`, `dist/api`, `dist/catalog`).
2. Generate downloadable data payloads (`generateDataPayloads`).
3. Generate RDF serializations (Turtle, JSON-LD, RDF/XML) for each entity.
4. Generate RFC 9264 linksets for each entity.
5. Generate DCAT-3 catalog files (`dcat.ttl`, `dcat.jsonld`, `catalog/index.html`).
6. Generate OpenAPI schema, mock query responses, and Swagger UI.
7. Generate all HTML views.
8. Generate `sitemap.xml` with `rs:ln` / Signmap markup and `robots.txt`.
9. Generate Nginx conneg map (`nginx-coneg.conf`) and HTTP Link header rules (`nginx-headers.conf`).

- [ ] **Step 2: Update `nginx.conf`**
Ensure routing rules handle:
- `/resource/:id` -> 303 conneg redirect based on `Accept` header.
- `/datasets/*`, `/institutes/*`, `/publications/*`, `/projects/*`, `/people/*`, `/catalog/*`, `/api/*`, `/data/*`, `/linksets/*`.
- Correct MIME types (`application/linkset+json`, `application/geo+json`, `text/turtle`, `application/ld+json`, `application/zip`, `application/pdf`).

- [ ] **Step 3: Run build pipeline**
Run: `bun run generator/index.ts`
Expected: Exit code 0, complete `dist/` hierarchy created.

- [ ] **Step 4: Commit Task 5**
```bash
git add generator/index.ts nginx.conf package.json
git commit -m "feat: assemble main build pipeline, sitemap rs:ln, and Nginx configurations"
```

---

### Task 6: Compliance & Gap Analysis Documentation (`docs/compliance/`)

**Files:**
- Create: `generator/complianceDocs.ts`
- Create: `docs/compliance/arms-mbon-8617.md`
- Create: `docs/compliance/arms-2018-6405.md`
- Create: `docs/compliance/north-sea-sensors.md`
- Create: `docs/compliance/eurobis-occurrences.md`
- Create: `docs/compliance/vliz-institute-36.md`
- Create: `docs/compliance/ro-crate-paper.md`
- Create: `docs/compliance/maregraph-project-5484.md`
- Create: `docs/compliance/marineinfo-api.md`
- Create: `docs/compliance/orcid-researchers.md`

**Interfaces:**
- Consumes: Resource definitions and upstream URLs.
- Produces: 9 structured audit documents under `docs/compliance/`.

- [ ] **Step 1: Write compliance generator / documentation files**
Implement generator or write detailed audit files documenting for each entity:
- Upstream real source URI.
- Identified protocol gaps (missing Link headers, missing `rel="profile"`, missing linksets, lack of multi-format conneg).
- Radical Transparency implementations delivered in this webserver.

- [ ] **Step 2: Verify all 9 files are generated and valid**
Run check to ensure all 9 markdown files exist with non-empty content.

- [ ] **Step 3: Commit Task 6**
```bash
git add docs/compliance/ generator/complianceDocs.ts
git commit -m "docs: add Radical Transparency compliance and gap analysis documentation for all taken-over entities"
```

---

### Task 7: End-to-End Build, Docker Verification & Protocol Testing

**Files:**
- Modify: `README.md`
- Modify: `docker-compose.yml`

- [ ] **Step 1: Build static assets**
Run: `bun run generator/index.ts`
Expected: Exit code 0.

- [ ] **Step 2: Start Docker container**
Run: `docker compose up --build -d`
Expected: Nginx starts on port 8080.

- [ ] **Step 3: Test HTTP Link headers and Conneg via curl**
- `curl -I http://localhost:8080/datasets/arms-mbon.html` (verify `Link:` headers).
- `curl -I -H "Accept: text/turtle" http://localhost:8080/resource/resource-arms-mbon` (verify 303 to `.ttl`).
- `curl -I -H "Accept: application/ld+json" http://localhost:8080/resource/resource-vliz` (verify 303 to `.jsonld`).
- `curl -I http://localhost:8080/data/arms-mbon-18s.csv` (verify 200 OK, `text/csv`).
- `curl -I http://localhost:8080/data/ro-crate-paper.pdf` (verify 200 OK, `application/pdf`).
- `curl http://localhost:8080/.well-known/api-catalog` (verify valid JSON linkset).

- [ ] **Step 4: Update README.md**
Update documentation to reflect the new Marine Data Portal architecture, Radical Transparency features, and quickstart instructions.

- [ ] **Step 5: Commit Task 7**
```bash
git add README.md docker-compose.yml
git commit -m "chore: complete end-to-end verification and update documentation"
```
