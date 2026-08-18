# Design Spec: LOD Webserver Redesign (Radical Transparency Data Portal)

## 1. Overview & Vision
This project redesigns the Linked Open Data (LOD) webserver from an abstract crawler strategy test matrix into an authentic, production-grade **Marine Science Data Portal & Linked Open Data Repository**.

The webserver serves as the reference implementation of **Radical Transparency (RT)** as outlined by Marc Portier (VLIZ Open Science) and the 10 Linkset Usage Patterns (LSUP). It demonstrates how a data publisher can seamlessly provide human-friendly catalog browsing alongside machine-actionable web linking (RFC 8288), profile declarations (RFC 6906), linksets (RFC 9264), API catalogs (RFC 9727), DCAT-3 metadata, FAIR Signposting, and robust content negotiation.

### Taken-over Resources
Instead of generic placeholders, the portal takes over real-world marine entities from Flanders Marine Institute (VLIZ), MAREGRAPH, LifeWatch, EurOBIS, and Pensoft, elevating them into fully compliant RT resources with downloadable data payloads:
- **ARMS-MBON Metagenomic 18S Observations** (`https://marineinfo.org/id/dataset/8617`)
- **ARMS 2018 Community Ecology Baseline** (`https://marineinfo.org/id/dataset/6405`)
- **Belgian North Sea Sensor & Buoy Time-Series** (LifeWatch / VLIZ sensor feeds)
- **EurOBIS Marine Species Taxon Occurrences** (Biodiversity distribution records)
- **Flanders Marine Institute (VLIZ)** (`https://marineinfo.org/id/institute/36`)
- **MAREGRAPH Initiative** (`https://marineinfo.org/id/project/5484`)
- **RO-Crate Biodiversity Observation Publishing Paper** (`https://doi.org/10.3897/biss.6.94630`)
- **Marine Data Subsetting API** (`https://marineinfo.org/api`)
- **Research Staff** (Marc Portier, Katrina Exter, Laurian Van Maldeghem, Cedric Decruw, Joanna Goley with ORCID identifiers).

---

## 2. Information Architecture & URL Topology

```
/ (Data Portal Home)
├── datasets/
│   ├── arms-mbon.html          (ARMS-MBON Metagenomic 18S Observations)
│   ├── arms-2018.html          (ARMS 2018 Community Ecology Baseline)
│   ├── north-sea-sensors.html  (Belgian North Sea Buoy & Sensor Time-Series)
│   └── eurobis-occurrences.html(EurOBIS Marine Species Occurrences)
├── data/                       (Physical downloadable data payloads)
│   ├── arms-mbon-18s.csv
│   ├── arms-mbon-stations.geojson
│   ├── arms-mbon-rocrate.zip
│   ├── arms-2018-samples.csv
│   ├── north-sea-sensors-latest.csv
│   ├── north-sea-sensors-stream.json
│   ├── eurobis-occurrences.geojson
│   ├── eurobis-dwca-sample.zip
│   └── ro-crate-paper.pdf
├── catalog/
│   ├── index.html              (Human-readable DCAT Catalogue View)
│   ├── dcat.ttl                (W3C DCAT-3 / DCAT-AP Turtle serialization)
│   └── dcat.jsonld             (DCAT JSON-LD serialization)
├── institutes/
│   └── vliz.html               (Organization: Flanders Marine Institute)
├── publications/
│   └── ro-crate-paper.html     (Scholarly Article with PDF download)
├── projects/
│   └── maregraph.html          (Project: MAREGRAPH Initiative)
├── people/
│   ├── marc-portier.html
│   ├── laurian-van-maldeghem.html
│   ├── cedric-decruw.html
│   ├── katrina-exter.html
│   └── joanna-goley.html
├── api/
│   ├── docs/ (or index.html)   (Interactive Swagger/Redoc UI for Subsetting API)
│   ├── openapi.json            (OpenAPI 3.0 specification)
│   └── v1/observations         (Queryable observation JSON responses)
├── resource/:id                (Content-negotiated persistent URIs with 303 redirects)
├── rdf/:id.[ttl|jsonld|rdf]   (Direct RDF serializations)
├── linksets/:id.linkset.json   (RFC 9264 JSON Linkset files)
├── .well-known/
│   ├── api-catalog             (RFC 9727 API discovery linkset)
│   └── resource-map.json       (RFC 9264 site-wide resource map)
├── sitemap.xml & robots.txt    (Sitemap protocol + rs:ln / Signmap extensions)
└── docs/compliance/            (Audit notes detailing source state vs RT enhancements)
```

---

## 3. Protocol & Standards Implementation

### 3.1 HTTP Link Headers (RFC 8288 & FAIR Signposting)
Generated dynamically in `nginx-headers.conf` and served on all HTTP requests:
- **`rel="profile"`**: Identifies the semantic specification or schema profile (e.g. `https://schema.org/Dataset`, `https://schema.org/Organization`, `https://schema.org/ScholarlyArticle`, `https://www.w3.org/TR/vocab-dcat/`).
- **`rel="describedby"`**: Points to machine-readable metadata representations (`/rdf/:id.ttl`, `/rdf/:id.jsonld`).
- **`rel="alternate"`**: Lists content variants (`text/html`, `text/csv`, `application/geo+json`, `application/pdf`, `application/zip`).
- **`rel="linkset"`**: Points to external JSON Linksets (`/linksets/:id.linkset.json`).
- **`rel="collection"` & `rel="item"`**: Encodes hierarchy (linking datasets to the root catalog `/catalog/`).
- **`rel="api-catalog"`**: Directs consumers to the RFC 9727 API catalog (`/.well-known/api-catalog`).

### 3.2 RFC 9264 Standalone Linksets (`application/linkset+json`)
Dedicated JSON files provided per resource in `dist/linksets/:id.linkset.json` encoding anchors, profiles, descriptions, authors, publishers, distributions, and citations.

### 3.3 RFC 9727 API Catalog (`/.well-known/api-catalog`)
Provides linkset-based discovery for the Marine Data Subsetting API, referencing the OpenAPI 3.0 schema (`service-desc`), interactive docs (`service-doc`), status endpoint, and profiles.

### 3.4 Content Negotiation (RFC 9110)
Requests to `/resource/:id` return HTTP 303 See Other:
- `Accept: text/turtle` -> `/rdf/:id.ttl`
- `Accept: application/ld+json` -> `/rdf/:id.jsonld`
- `Accept: application/rdf+xml` -> `/rdf/:id.rdf`
- `Accept: text/html` -> corresponding HTML page (`/datasets/:id.html`, `/institutes/:id.html`, `/publications/:id.html`, etc.).

### 3.5 Host-wide Discovery (Sitemap with `rs:ln` / Signmap)
`/sitemap.xml` lists all catalog resources and decorates URLs with `<rs:ln>` and `<xhtml:link>` attributes referencing profiles, linksets, and DCAT endpoints.

---

## 4. UI & Visual Experience

- **Design System**: Vanilla CSS with custom HSL tokens, Outfit (headings) and Inter (body) typography, deep ocean navy (`#0f172a`, `#1e3a8a`), sea teal (`#0d9488`, `#06b6d4`), and crisp sand-tinted panels (`#f8fafc`).
- **Data Previews**: Embedded interactive sample tables on dataset pages showing realistic rows of observation metrics (event IDs, stations, depths, taxon reads, temperature/salinity values).
- **Download Center**: Actionable download buttons for CSV, GeoJSON, RO-Crate ZIP, Turtle, JSON-LD, and PDF with explicit file sizes and MIME types.
- **Entity Interlinking**: Rich bi-directional cross-links between datasets, authors, institutes, publications, and projects.
- **Interactive OpenAPI Explorer**: A clean Swagger/Redoc UI for the subsetting API at `/api/docs`.

---

## 5. Resource Audit & Gap Analysis Documentation (`docs/compliance/`)

Markdown audit documents created under `docs/compliance/` for each taken-over entity:
1. `arms-mbon-8617.md`
2. `arms-2018-6405.md`
3. `north-sea-sensors.md`
4. `eurobis-occurrences.md`
5. `vliz-institute-36.md`
6. `ro-crate-paper.md`
7. `maregraph-project-5484.md`
8. `marineinfo-api.md`
9. `orcid-researchers.md`

Each document outlines:
- Real upstream source URI & original exposed metadata.
- Missing protocol elements (lack of Link headers, missing `rel="profile"`, missing RFC 9264 linksets, lack of multi-format conneg).
- Enhancements implemented in this webserver to deliver the ideal Radical Transparency experience.

---

## 6. Verification Plan

1. **Build Verification**: Run `bun run generator/index.ts` (or `npm run generate`) to build all static pages, data distributions, linksets, RDF serializations, and Nginx map configs.
2. **Container Testing**: Run `docker compose up --build -d` and confirm Nginx starts cleanly on port 8080.
3. **HTTP Header & Conneg Validation**:
   - `curl -I http://localhost:8080/datasets/arms-mbon.html` (verify `Link:` headers for `rel="profile"`, `rel="linkset"`, `rel="describedby"`).
   - `curl -I -H "Accept: text/turtle" http://localhost:8080/resource/resource-arms-mbon` (verify 303 redirect to `/rdf/resource-arms-mbon.ttl`).
   - `curl -I -H "Accept: application/ld+json" http://localhost:8080/resource/resource-vliz` (verify 303 redirect to `/rdf/resource-vliz.jsonld`).
4. **Data Downloads & API**:
   - Verify CSV, GeoJSON, RO-Crate zip, and PDF downloads respond with HTTP 200 and proper Content-Type.
   - Verify `/.well-known/api-catalog` returns valid RFC 9727 linkset JSON.
   - Verify `/api/openapi.json` is valid OpenAPI 3.0 schema.
