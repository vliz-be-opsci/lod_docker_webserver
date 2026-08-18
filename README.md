# VLIZ Marine Linked Data Portal & Radical Transparency Reference Webserver

A production-grade, static Linked Open Data (LOD) Marine Science Data Portal and reference implementation of **Radical Transparency (RT)** as designed by Marc Portier (VLIZ Open Science) and the 10 Linkset Usage Patterns (LSUP).

This webserver demonstrates how scientific publishers can provide rich, human-friendly data catalogue browsing alongside standards-compliant machine-actionable web linking (RFC 8288), profile declarations (RFC 6906), linksets (RFC 9264), API catalogs (RFC 9727), DCAT-3 metadata, FAIR Signposting, and robust content negotiation.

---

## 🚀 Quick Start

### Prerequisites
* [Node.js](https://nodejs.org/) (v18+) or [Bun](https://bun.sh/) (v1.1+)
* [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)

### 1. Build and Generate Assets
Generate the complete static portal assets, physical data payloads, DCAT catalogue, OpenAPI explorer, and RFC 9264 linksets:
```bash
# Install dependencies
bun install

# Run static generator (populates /dist and /docs/compliance)
bun run generate
```

### 2. Run the Dockerized Server
Spin up the Dockerized Nginx webserver:
```bash
docker compose up --build -d
```

The portal will be accessible at:
👉 **[http://localhost:8080](http://localhost:8080)**

---

## 📦 Hosted Marine Resources & Data Payloads

The webserver takes over real-world marine entities from Flanders Marine Institute (VLIZ), LifeWatch, EurOBIS, and Pensoft, elevating them into 100% compliant Radical Transparency resources with real downloadable data payloads:

| Resource | Category | Formats & Payloads | Upstream URI |
| :--- | :--- | :--- | :--- |
| **ARMS-MBON Metagenomic 18S Observations** | Dataset | CSV, GeoJSON, RO-Crate ZIP, Turtle, JSON-LD | [marineinfo.org/id/dataset/8617](https://marineinfo.org/id/dataset/8617) |
| **ARMS 2018 Ecological Baseline** | Dataset | CSV (Sampling Matrix), Turtle, JSON-LD | [marineinfo.org/id/dataset/6405](https://marineinfo.org/id/dataset/6405) |
| **Belgian North Sea Sensor & Buoy Series** | Dataset | CSV, Streaming JSON telemetry, Turtle | [lifewatch.be/data/north-sea-buoys](https://lifewatch.be/data/north-sea-buoys) |
| **EurOBIS Species Occurrences** | Dataset | GeoJSON (Points), DwC-A ZIP, Turtle | [eurobis.org](https://www.eurobis.org/) |
| **Flanders Marine Institute (VLIZ)** | Institute | Organization profile, Turtle, JSON-LD, RDF/XML | [marineinfo.org/id/institute/36](https://marineinfo.org/id/institute/36) |
| **RO-Crate Biodiversity Publishing Paper** | Publication | PDF Full Text, DOI, Turtle, JSON-LD | [doi.org/10.3897/biss.6.94630](https://doi.org/10.3897/biss.6.94630) |
| **MAREGRAPH Research Initiative** | Project | Project roadmap, Dataset parts, Turtle | [marineinfo.org/id/project/5484](https://marineinfo.org/id/project/5484) |
| **MarineInfo Subsetting API** | API | OpenAPI 3.0, Swagger UI, JSON responses | [marineinfo.org/api](https://marineinfo.org/api) |
| **Research Staff (Marc, Katrina, Cedric, Laurian, Joanna)** | People | Researcher profiles, ORCIDs, Turtle, Linksets | [orcid.org/0000-0002-9648-6484](https://orcid.org/0000-0002-9648-6484) |

---

## 🌐 Radical Transparency & Web Architecture

### 1. HTTP Link Headers (RFC 8288 & FAIR Signposting)
Every HTTP response carries typed link headers:
```http
Link: <https://schema.org/Dataset>; rel="profile"
Link: <https://www.w3.org/TR/vocab-dcat/>; rel="profile"
Link: <http://localhost:8080/rdf/resource-arms-mbon.ttl>; rel="describedby"; type="text/turtle"
Link: <http://localhost:8080/rdf/resource-arms-mbon.jsonld>; rel="describedby"; type="application/ld+json"
Link: <http://localhost:8080/linksets/resource-arms-mbon.linkset.json>; rel="linkset"; type="application/linkset+json"
Link: <http://localhost:8080/data/arms-mbon-18s.csv>; rel="item"; type="text/csv"
Link: <http://localhost:8080/catalog/>; rel="collection"
```

### 2. Standalone Linksets (RFC 9264 `application/linkset+json`)
Machine-readable JSON linkset documents are served at `/linksets/:id.linkset.json` detailing anchors, profiles, descriptions, distributions, and citations.

### 3. Subsetting API & API Catalog (RFC 9727)
- **`/.well-known/api-catalog`**: Declares API anchors, OpenAPI 3.0 schema (`service-desc`), and documentation (`service-doc`).
- **Interactive Swagger UI**: Hosted at `/api/docs/` with live query testing against `/api/v1/observations`.

### 4. W3C DCAT-3 Catalogue
- **HTML Catalogue**: `/catalog/`
- **Turtle Serialization**: `/catalog/dcat.ttl`
- **JSON-LD Serialization**: `/catalog/dcat.jsonld`

### 5. Content Negotiation (RFC 9110 / HTTP 303)
Persistent resource URIs (`/resource/:id`) negotiate representations dynamically:
- `Accept: text/turtle` ➔ `303 See Other` to `/rdf/:id.ttl`
- `Accept: application/ld+json` ➔ `303 See Other` to `/rdf/:id.jsonld`
- `Accept: text/html` ➔ `303 See Other` to corresponding HTML page (`/datasets/:id.html`, `/institutes/:id.html`, etc.)

---

## 📂 Site Topology & Project Structure

```
├── dist/                          # Generated static assets served by Nginx
│   ├── .well-known/               # RFC 9727 api-catalog & resource maps
│   ├── api/                       # OpenAPI 3.0 schema, mock responses, Swagger UI
│   ├── catalog/                   # DCAT-3 catalog (HTML, TTL, JSON-LD)
│   ├── data/                      # Physical CSV, GeoJSON, RO-Crate ZIP, PDF files
│   ├── datasets/                  # Dataset detail pages with live previews
│   ├── institutes/                # Organization profiles
│   ├── publications/              # Scholarly article pages with PDF downloads
│   ├── projects/                  # Research project pages
│   ├── people/                    # Researcher profiles with ORCID badges
│   ├── rdf/                       # Direct RDF serializations (TTL, JSON-LD, RDF/XML)
│   ├── linksets/                  # RFC 9264 JSON Linkset files
│   ├── index.html                 # Data Portal homepage with search & filters
│   ├── sitemap.xml / robots.txt   # Sitemap protocol with ResourceSync rs:ln
│   ├── nginx-coneg.conf           # Dynamic Nginx content negotiation maps
│   └── nginx-headers.conf         # Dynamic Nginx RFC 8288 Link headers
├── docs/
│   ├── compliance/                # Audit & gap analysis notes for each taken-over entity
│   └── superpowers/               # Design specs and implementation plans
├── generator/                     # TypeScript build generator
├── Dockerfile                     # Multi-stage Bun build + Nginx static serving
├── docker-compose.yml             # Docker service definition
└── nginx.conf                     # Nginx server configuration with CORS & conneg
```

---

## 📋 Compliance & Gap Analysis Reports

Detailed audit documents are generated under [`docs/compliance/`](docs/compliance/) analyzing what was originally present at the real upstream sources versus the Radical Transparency enhancements delivered in this webserver:

1. [ARMS-MBON Metagenomic 18S Dataset (8617)](docs/compliance/arms-mbon-8617.md)
2. [Raw ARMS 2018 Ecological Baseline (6405)](docs/compliance/arms-2018-6405.md)
3. [LifeWatch North Sea Sensor Buoy Series](docs/compliance/north-sea-sensors.md)
4. [EurOBIS Marine Species Occurrences](docs/compliance/eurobis-occurrences.md)
5. [Flanders Marine Institute (VLIZ)](docs/compliance/vliz-institute-36.md)
6. [RO-Crate Biodiversity Publishing Article](docs/compliance/ro-crate-paper.md)
7. [MAREGRAPH Initiative](docs/compliance/maregraph-project-5484.md)
8. [MarineInfo Subsetting API](docs/compliance/marineinfo-api.md)
9. [Research Staff & ORCID Profiles](docs/compliance/orcid-researchers.md)

---

## 📚 References & Standards

* **IANA Link Relations Registry**: [https://www.iana.org/assignments/link-relations](https://www.iana.org/assignments/link-relations)
* **Radical Transparency Position Paper**: [https://open-science.vliz.be/papers/2026-radical-transparency-position/2026-radical-transparency-position.pdf](https://open-science.vliz.be/papers/2026-radical-transparency-position/2026-radical-transparency-position.pdf)
* **Radical Transparency Slides**: [Google Slides Presentation](https://docs.google.com/presentation/d/1-dJbI4bJfCL5JKKE9QHYsqayXkZkOjy1rxcYCuu2ou8/edit)
* **EOSC Semantic Interoperability Proposals**: [GitHub Repository](https://github.com/eosc-semantic-interop/if-solutions-proposals/tree/main/proposals/radical-transparency)
* **RFC 8288** — Web Linking
* **RFC 9264** — Linkset: Media Types and a Link Relation Type for Link Sets
* **RFC 9727** — The API Catalog Link Relation Type
* **RFC 6906** — The 'profile' Link Relation Type
