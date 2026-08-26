# Radical Transparency URI Patterns & RT Pattern Reference Guide

This document provides a comprehensive reference and patterned overview of all Uniform Resource Identifiers (URIs), content negotiation mechanisms, HTTP Link headers, and their alignment with the **8 Radical Transparency Patterns (RT-P01 through RT-P08)** defined by the EOSC Semantic Interoperability Task Force.

---

## 1. Master URI Pattern Archetypes Overview

Similar resources in the webserver follow standardized, predictable URI patterns. The table below summarizes these architectural archetypes:

| Archetype / Concept | URI Pattern / Template | Example Target URI | HTTP Behavior & Output | Key HTTP Link Headers | Applicable RT Patterns | Standards & Specs |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Core Entity PID** | `/id/{typeSlug}/{nameSlug}` | `/id/dataset/arms-mbon` | `303 See Other` conneg redirect to representation | Varied per target representation | **RT-P01, RT-P03** | RFC 9110, RFC 8288 |
| **HTML Landing Page** | `/id/{typeSlug}/{nameSlug}.html` | `/id/dataset/arms-mbon.html` | `200 OK` (`text/html`) Human portal view | `rel="describes"` (to PID)<br>`rel="cite-as"` (to DOI)<br>`rel="profile"`<br>`rel="type"`<br>`rel="describedby"` (to .ttl)<br>`rel="linkset"`<br>`rel="collection"` (to /catalog/) | **RT-P01, RT-P03** | RFC 8288, RFC 6906, FAIR Signposting |
| **RDF Turtle Variant** | `/id/{typeSlug}/{nameSlug}.ttl` | `/id/dataset/arms-mbon.ttl` | `200 OK` (`text/turtle`) RDF graph | `rel="describes"` (to PID)<br>`rel="cite-as"` (to DOI)<br>`rel="profile"`<br>`rel="type"`<br>`rel="linkset"` | **RT-P01, RT-P03** | W3C Turtle, RFC 8288, RFC 9264 |
| **RDF JSON-LD Variant** | `/id/{typeSlug}/{nameSlug}.jsonld` | `/id/dataset/arms-mbon.jsonld` | `200 OK` (`application/ld+json`) | `rel="describes"` (to PID)<br>`rel="cite-as"` (to DOI)<br>`rel="profile"`<br>`rel="type"`<br>`rel="linkset"` | **RT-P01, RT-P03** | W3C JSON-LD 1.1, RFC 8288 |
| **RDF/XML Variant** | `/id/{typeSlug}/{nameSlug}.rdf` | `/id/dataset/arms-mbon.rdf` | `200 OK` (`application/rdf+xml`) | `rel="describes"` (to PID)<br>`rel="cite-as"` (to DOI)<br>`rel="profile"`<br>`rel="type"`<br>`rel="linkset"` | **RT-P01, RT-P03** | W3C RDF 1.1, RFC 8288 |
| **RFC 9264 Master Linkset** | `/id/{typeSlug}/{nameSlug}.linkset.json` | `/id/dataset/arms-mbon.linkset.json` | `200 OK` (`application/linkset+json`) Full machine-actionable link graph | `rel="describes"` (to PID)<br>`rel="cite-as"` (to DOI)<br>`rel="item"` (to child linkset fragments if split) | **RT-P01, RT-P03, RT-P08** | RFC 9264, RFC 8288, RFC 6573 |
| **RT-P08 Split Linkset Fragment** | `/id/{typeSlug}/{nameSlug}.{conneg\|profiles\|provenance}.linkset.json` | `/id/dataset/arms-mbon.conneg.linkset.json` | `200 OK` (`application/linkset+json`) Granular link subset | `rel="describes"` (to PID)<br>`rel="collection"` (to Master Linkset) | **RT-P08** | RFC 9264, RFC 6573 |
| **Local DOI Direct Resolution** | `/doi/{doiSuffix}` | `/doi/10.14284/578` | `303 See Other` direct redirect to primary payload file (`/data/...`) | Inherited from Nginx redirect map | **RT-P04** | RFC 9110, RFC 8574 |
| **Physical Data Payloads** | `/data/{filename}` | `/data/arms-mbon-18s.csv`<br>`/data/arms-mbon-rocrate.zip`<br>`/data/ro-crate-paper.pdf` | `200 OK` (`text/csv`, `application/zip`, `application/pdf`, etc.) | `rel="cite-as"` (to local DOI & PID)<br>`rel="profile"`<br>`rel="describedby"` (to .ttl & .html)<br>`rel="linkset"` | **RT-P04, RT-P01, RT-P03** | RFC 8574, RFC 8288, RO-Crate 1.1 |
| **Subsetting API Endpoint** | `/api/observations/v1` | `/api/observations/v1` | `200 OK` (`application/json`) Parameterized subsetting query | `rel="api-catalog"`<br>`rel="collection"`<br>`rel="linkset"`<br>`rel="cite-as"` (to parent dataset PID) | **RT-P05, RT-P07** | RFC 9727, RFC 8631, OpenAPI 3.0 |
| **API Documentation & Spec** | `/api/openapi.json`<br>`/api/docs/` | `/api/openapi.json`<br>`/api/docs/` | `200 OK` OpenAPI schema / Swagger UI interactive explorer | `rel="service-desc"`, `rel="service-doc"` | **RT-P05** | OpenAPI 3.0, Swagger |
| **RFC 9727 API Catalog** | `/.well-known/api-catalog` | `/.well-known/api-catalog` | `200 OK` (`application/linkset+json`) Registry of hosted APIs | `rel="api-catalog"` (incoming)<br>`rel="item"` in JSON anchor pointing to API | **RT-P05, RT-P07** | RFC 9727, RFC 8615 |
| **Semantic Profile Registry** | `/id/profiles`<br>`/id/profile/` | `/id/profiles` | `200 OK` (`text/html`) Catalog of atomic and composite profiles | `rel="type"` (`http://www.w3.org/ns/dx/prof/Profile`) | **RT-P01, RT-P02, RT-P07** | W3C DX-PROF |
| **Semantic Profile Record** | `/id/profile/{profileId}` | `/id/profile/marine-genomic-dataset-profile` | `200 OK` (.html, .ttl, .jsonld, .linkset.json) Profile declaration + SHACL | `rel="type"` (Profile)<br>`rel="describedby"`<br>`rel="linkset"`<br>`rel="collection"` (to /id/profiles)<br>`rel="http://schema.org/hasPart"` (sub-profiles) | **RT-P01, RT-P02** | W3C DX-PROF, W3C SHACL |
| **W3C DCAT-3 Catalogue** | `/catalog/`<br>`/catalog/dcat.ttl`<br>`/catalog/dcat.jsonld` | `/catalog/` | `200 OK` Comprehensive repository catalog | `rel="type"` (`https://www.w3.org/TR/vocab-dcat/`)<br>`rel="alternate"` (to TTL & JSON-LD) | **RT-P07** | W3C DCAT-3 |
| **ResourceSync Sitemaps** | `/sitemap.xml`<br>`/sitemap-index.xml`<br>`/sitemap-{datasets\|profiles\|catalog}.xml` | `/sitemap.xml` | `200 OK` (`application/xml`) Sitemaps with `<rs:ln>` signpost extensions | Delegated via `<sitemapindex>` | **RT-P06, RT-P07** | ResourceSync (ANSI/NISO Z39.99), Sitemaps.org |
| **Crawler Discovery & Robots** | `/robots.txt` | `/robots.txt` | `200 OK` (`text/plain`) Crawler directive pointing to sitemaps | `Sitemap: /sitemap-index.xml`<br>`Sitemap: /sitemap.xml` | **RT-P06** | RFC 9309 (REP) |
| **Interactive Visualizations** | `/map.html`<br>`/audit.html`<br>`/compliance.json` | `/map.html` | `200 OK` Metro Transit Map, Gap Audit Dashboard, Compliance API | `rel="type"` (`schema:Thing`) | **RT-P01..08** | SVG, HTML5, JSON API |

---

## 2. Radical Transparency Pattern Requirements & Link Relations (RT-P01 to RT-P08)

The section below details the exact `rel="X"` link relations required for each Radical Transparency pattern, including HTTP response headers, JSON Linkset statements, and reciprocal link verification on target URIs.

```
+-------------------------------------------------------------------------------------------------------+
|                                    RADICAL TRANSPARENCY ECOSYSTEM                                     |
|                                                                                                       |
|    [robots.txt] ──(Sitemap)──> [sitemap-index.xml] ──(delegate)──> [sitemap-datasets.xml] (RT-P06/07)  |
|                                                                             │                         |
|                                                                          (rs:ln)                      |
|                                                                             ▼                         |
|   [Local DOI] ──(303 Redirect)──> [Physical Data Payload] <────(item)── [Dataset Landing Page]        |
|    (/doi/...)       (RT-P04)         (/data/*.csv, *.zip)                   (/id/.../name.html)       |
|        │                                     │                                       │                |
|    (cite-as)                             (cite-as)                             (describedby)          |
|        │                                     │                                       │                |
|        ▼                                     ▼                                       ▼                |
|   [Dataset PID] <──────(describes)─────── [RDF Formats] <───────(linkset)─────── [Linkset Hub]       |
| (/id/.../name)                           (*.ttl, *.jsonld)                   (*.linkset.json) (RT-P08)|
|        │                                     │                                       │                |
|    (profile)                             (profile)                                (item)              |
|        ▼                                     ▼                                       ▼                |
|  [Profile Record] <────(hasPart)──── [Composite Profile]             [Child Linksets: conneg, prov]   |
|     (RT-P01)                               (RT-P02)                                  │                |
|        ▲                                                                        (collection)          |
|        └─────────────────────────────────────────────────────────────────────────────┘                |
+-------------------------------------------------------------------------------------------------------+
```

---

### RT-P01: Profile Conformity Declarations

* **Standard Ref**: [RFC 6906](https://datatracker.ietf.org/doc/html/rfc6906), [RFC 8288](https://datatracker.ietf.org/doc/html/rfc8288)
* **Goal**: Enable machine agents to definitively and unambiguously determine semantic profile conformance without parsing arbitrary RDF bodies.

#### Required Link Relations (`rel="X"`)

| Source / Anchor URI | Transport Mechanism | Required Link Relation | Target URI | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `<resource-pid-uri>` | HTTP Header / Linkset | `rel="profile"` | `<profile-uri>` | Declares that the resource conforms to the designated profile. |
| `<representation-uri>` (`.html`, `.ttl`, `.jsonld`, `.rdf`) | HTTP Header | `rel="profile"` | `<profile-uri>` | Ensures profile discoverability post-redirect. |
| `<resource-pid-uri>` (in `.linkset.json`) | JSON Linkset | `"profile": [{ "href": "..." }]` | `<profile-uri>` | Machine-readable profile discovery in linkset. |
| `<profile-uri>` (Target URI) | HTTP Header | `rel="type"` | `http://www.w3.org/ns/dx/prof/Profile` | Declares that the target itself is a standard Profile entity. |
| `<profile-uri>` (Target URI) | HTTP Header | `rel="describedby"` | `<profile-uri>.ttl` | Provides direct access to the SHACL validation shapes. |
| `<profile-uri>` (Target URI) | HTTP Header | `rel="linkset"` | `<profile-uri>.linkset.json` | Provides link graph for the profile entity. |

#### Reciprocal Verification Check
* When navigating from `/id/dataset/arms-mbon` ➔ `rel="profile"` ➔ `/id/profile/marine-genomic-dataset-profile`, the target endpoint `/id/profile/marine-genomic-dataset-profile.html` responds with `rel="type"` (`dx-prof:Profile`), `rel="describedby"` (to its SHACL TTL), and `rel="collection"` (to `/id/profiles`).

---

### RT-P02: Profile Composition

* **Standard Ref**: [W3C DX-PROF](https://www.w3.org/TR/dx-prof/), [RFC 6573](https://datatracker.ietf.org/doc/html/rfc6573)
* **Goal**: Model composite digital assets that conform to multiple standard profiles simultaneously through recursive part-whole hierarchies.

#### Required Link Relations (`rel="X"`)

| Source / Anchor URI | Transport Mechanism | Required Link Relation | Target URI | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `<resource-pid-uri>` | HTTP Header | `rel="profile"` | `<composite-profile-uri>` | Declares conformance to the composite top-level profile. |
| `<composite-profile-uri>` | HTTP Header | `rel="http://schema.org/hasPart"` | `<member-profile-uri>` | Declares constituent atomic profile parts. |
| `<composite-profile-uri>` (in `.linkset.json`) | JSON Linkset | `"http://schema.org/hasPart"` | `<member-profile-uri>` | Encodes composition hierarchy in RFC 9264 JSON. |
| `<composite-profile-uri>` | HTTP Header | `rel="collection"` | `/id/profiles` | Points to the master profile registry catalog. |
| `<member-profile-uri>` (Target URI) | HTTP Header | `rel="type"` | `http://www.w3.org/ns/dx/prof/Profile` | Confirms atomic profile entity type. |

#### Reciprocal Verification Check
* In the webserver, `/id/profile/marine-genomic-dataset-profile.html` emits `rel="http://schema.org/hasPart"` to:
  1. `schema-dataset-profile`
  2. `dcat3-dataset-profile`
  3. `ro-crate-package-profile`
  4. `darwin-core-occurrence-profile`
* Each atomic sub-profile resolves with its own dedicated SHACL constraints (`sh:and` composite validation).

---

### RT-P03: Content Negotiation Menu

* **Standard Ref**: [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html), [RFC 8288](https://datatracker.ietf.org/doc/html/rfc8288), [RFC 9264](https://www.rfc-editor.org/rfc/rfc9264.html)
* **Goal**: Eliminate the "Broken Chain" problem during HTTP 303 redirects by maintaining reciprocal identity links and exposing the complete representation menu.

#### Required Link Relations (`rel="X"`)

| Source / Anchor URI | Transport Mechanism | Required Link Relation | Target URI | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `<conceptual-pid-uri>` | Conneg Menu Header | `rel="alternate"` (with `type="..."`) | `<representation-uri>` (`.html`, `.ttl`, `.jsonld`, `.rdf`) | Exposes available serialized variants. |
| `<conceptual-pid-uri>` | HTTP Header | `rel="linkset"` | `<linkset-uri>` | Exposes standalone JSON linkset menu. |
| `<representation-uri>` | HTTP Header | `rel="describes"` | `<conceptual-pid-uri>` | **Identity Anchor**: Restores identity context from variant back to PID. |
| `<representation-uri>` | HTTP Header | `rel="cite-as"` | `<local-doi-uri>` | Canonical citation target for the entity. |
| `<representation-uri>` | HTTP Header | `rel="linkset"` | `<linkset-uri>` | Allows discovering all other variants from any representation. |
| `<representation-uri>.html` | HTTP Header | `rel="describedby"` (with `type="text/turtle"`) | `<representation-uri>.ttl` | Direct shortcut to primary machine-readable metadata. |
| `<representation-uri>` (in `.linkset.json`) | JSON Linkset | `"self": [{ "href": "<conceptual-pid-uri>" }]` | `<conceptual-pid-uri>` | Reverse self-binding in RFC 9264 Linkset. |

#### Reciprocal Verification Check
* Requesting `GET /id/dataset/arms-mbon` negotiates to `/id/dataset/arms-mbon.ttl`.
* The TTL response headers contain `<http://localhost:8080/id/dataset/arms-mbon>; rel="describes"`, `<http://localhost:8080/doi/10.14284/578>; rel="cite-as"`, and `<http://localhost:8080/id/dataset/arms-mbon.linkset.json>; rel="linkset"`. The agent can seamlessly reverse-navigate back to the PID or jump to any other format.

---

### RT-P04: No Landing Page Solution (Direct Payloads)

* **Standard Ref**: [RFC 8574](https://datatracker.ietf.org/doc/html/rfc8574), [RFC 8288](https://datatracker.ietf.org/doc/html/rfc8288), [FAIR Signposting](https://signposting.org/)
* **Goal**: Allow persistent identifiers (DOIs) to resolve directly to downloadable data payloads (CSV, GeoJSON, RO-Crate ZIP, PDF) with complete Signposting headers, bypassing mandatory HTML landing pages.

#### Required Link Relations (`rel="X"`)

| Source / Anchor URI | Transport Mechanism | Required Link Relation | Target URI | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `<local-doi-uri>` (`/doi/...`) | HTTP 303 Redirect | N/A (Redirect Target) | `<payload-download-uri>` (`/data/...`) | Direct resolution to physical file payload. |
| `<payload-download-uri>` | HTTP Header | `rel="cite-as"` | `<local-doi-uri>` | Identifies the DOI as the canonical citation for this file. |
| `<payload-download-uri>` | HTTP Header | `rel="cite-as"` | `<resource-pid-uri>` | Links the physical file back to its conceptual parent dataset PID. |
| `<payload-download-uri>` | HTTP Header | `rel="describedby"` (with `type="text/turtle"`) | `<resource-pid-uri>.ttl` | Points machine agents directly to rich RDF metadata. |
| `<payload-download-uri>` | HTTP Header | `rel="describedby"` (with `type="text/html"`) | `<resource-pid-uri>.html` | Optional human-oriented description view. |
| `<payload-download-uri>` | HTTP Header | `rel="linkset"` | `<resource-pid-uri>.linkset.json` | Full link graph access from the physical data file. |
| `<payload-download-uri>` | HTTP Header | `rel="profile"` | `<profile-uri>` | Semantic profile for the payload (e.g. RO-Crate). |
| `<resource-pid-uri>.html` | HTTP Header / Linkset | `rel="item"` | `<payload-download-uri>` | Reciprocal downlink from metadata to payload file. |

#### Reciprocal Verification Check
* `GET /doi/10.14284/578` ➔ redirects (303) to `/data/arms-mbon-18s.csv`.
* `/data/arms-mbon-18s.csv` carries:
  - `Link: <http://localhost:8080/doi/10.14284/578>; rel="cite-as"`
  - `Link: <http://localhost:8080/id/dataset/arms-mbon>; rel="cite-as"`
  - `Link: <http://localhost:8080/id/dataset/arms-mbon.ttl>; rel="describedby"; type="text/turtle"`
  - `Link: <http://localhost:8080/id/dataset/arms-mbon.linkset.json>; rel="linkset"`
* From the CSV file alone, a machine crawler can cite the dataset, download its Turtle metadata, or follow its full linkset without ever touching an HTML page.

---

### RT-P05: Subsetting API

* **Standard Ref**: [RFC 9727](https://www.rfc-editor.org/rfc/rfc9727.html), [RFC 8631](https://datatracker.ietf.org/doc/html/rfc8631), [OpenAPI 3.0](https://www.openapis.org/)
* **Goal**: Prevent "Semantic Drift" by anchoring parameterized API queries and observation slices back to their parent dataset, OpenAPI schemas, and API Catalogs.

#### Required Link Relations (`rel="X"`)

| Source / Anchor URI | Transport Mechanism | Required Link Relation | Target URI | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `<fragment-api-uri>` (`/api/observations/v1?...`) | HTTP Header | `rel="collection"` | `<base-api-uri>` (`/api/observations/v1`) | Anchors query slice to API service root. |
| `<base-api-uri>` | HTTP Header | `rel="cite-as"` | `<dataset-pid-uri>` (`/id/dataset/arms-mbon`) | Cites parent dataset from which observations are derived. |
| `<base-api-uri>` | HTTP Header | `rel="api-catalog"` | `/.well-known/api-catalog` | Points to RFC 9727 API Catalog. |
| `<base-api-uri>` | HTTP Header | `rel="linkset"` | `/api/observations/v1.linkset.json` | Dedicated API Linkset Hub. |
| `<base-api-uri>` (in `.linkset.json`) | JSON Linkset | `"service-desc"` | `/api/openapi.json` | Machine-readable OpenAPI 3.0 schema. |
| `<base-api-uri>` (in `.linkset.json`) | JSON Linkset | `"service-doc"` | `/api/docs/` | Interactive Swagger UI documentation. |
| `<base-api-uri>` (in `.linkset.json`) | JSON Linkset | `"service-meta"` | `/id/service/marineinfo-api.ttl` | RDF service description. |
| `/.well-known/api-catalog` | JSON Linkset | `"item"` | `<base-api-uri>` | API Catalog lists the service as a member item. |

#### Reciprocal Verification Check
* Querying `GET /api/observations/v1?marker_gene=18S&limit=20` returns data records with headers:
  - `Link: <http://localhost:8080/id/dataset/arms-mbon>; rel="cite-as"`
  - `Link: <http://localhost:8080/api/observations/v1>; rel="collection"`
  - `Link: <http://localhost:8080/.well-known/api-catalog>; rel="api-catalog"`
* Following `rel="cite-as"` lands on `/id/dataset/arms-mbon`, establishing full provenance and licensing.

---

### RT-P06: Hostwide Resource Discovery

* **Standard Ref**: [ResourceSync (ANSI/NISO Z39.99)](http://www.openarchives.org/rs/toc), [RFC 9309 (Robots Exclusion Protocol)](https://datatracker.ietf.org/doc/html/rfc9309)
* **Goal**: Provide automated crawler bootstrapping by embedding typed links (`<rs:ln>`) directly into `robots.txt` and XML sitemaps.

#### Required Link Relations (`rel="X"`) & Directives

| Source / Anchor URI | Transport Mechanism | Directive / Attribute | Target URI | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `/robots.txt` | Crawler Directive | `Sitemap:` | `/sitemap-index.xml`<br>`/sitemap.xml` | Directs crawlers to the signmap index. |
| `/sitemap.xml` (Root URL) | XML Element `<rs:ln>` | `rel="api-catalog"` | `/.well-known/api-catalog` | Exposes API catalog at host root. |
| `/sitemap.xml` (Root URL) | XML Element `<rs:ln>` | `rel="alternate"` | `/catalog/dcat.ttl` | Exposes DCAT-3 catalogue at host root. |
| `/sitemap.xml` (Resource URL) | XML Element `<rs:ln>` | `rel="linkset"` | `/id/{type}/{name}.linkset.json` | Exposes RFC 9264 linkset directly in sitemap. |
| `/sitemap.xml` (Resource URL) | XML Element `<rs:ln>` | `rel="profile"` | `/id/profile/{profileId}` | Semantic profile signpost in sitemap. |
| `/sitemap.xml` (Resource URL) | XML Element `<rs:ln>` | `rel="type"` | `https://schema.org/Dataset` | Entity type declaration. |

#### Reciprocal Verification Check
* Crawlers fetching `/robots.txt` follow `Sitemap: http://localhost:8080/sitemap.xml`.
* Inside `/sitemap.xml`, `<loc>http://localhost:8080/id/dataset/arms-mbon</loc>` embeds `<rs:ln rel="linkset" href="http://localhost:8080/id/dataset/arms-mbon.linkset.json" type="application/linkset+json" />`. Crawlers harvest linksets immediately without scraping HTML.

---

### RT-P07: Catalogue Assisted Resource Exposure

* **Standard Ref**: [W3C DCAT-3](https://www.w3.org/TR/vocab-dcat-3/), [RFC 9727](https://www.rfc-editor.org/rfc/rfc9727.html), [ResourceSync](http://www.openarchives.org/rs/toc)
* **Goal**: Prevent sitemap bloat by delegating collection harvesting to specialized catalogues (DCAT-3 and RFC 9727 API Catalog) via hierarchical sitemap indexes.

#### Required Link Relations (`rel="X"`)

| Source / Anchor URI | Transport Mechanism | Required Link Relation | Target URI | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `/sitemap-index.xml` | XML Element `<sitemap>` | `<loc>` | `/sitemap-datasets.xml`<br>`/sitemap-profiles.xml`<br>`/sitemap-catalog.xml` | Delegates discovery into domain-specific sub-sitemaps. |
| `/catalog/` | HTTP Header | `rel="type"` | `https://www.w3.org/TR/vocab-dcat/` | Declares W3C DCAT catalog type. |
| `/catalog/` | HTTP Header | `rel="alternate"` (with `type="text/turtle"`) | `/catalog/dcat.ttl` | Machine-actionable Turtle catalog dump. |
| `/catalog/` | HTTP Header | `rel="alternate"` (with `type="application/ld+json"`) | `/catalog/dcat.jsonld` | JSON-LD catalog dump. |
| `/.well-known/api-catalog` | HTTP Header | `Content-Type` | `application/linkset+json` | Declares RFC 9727 API Catalog format. |
| `/.well-known/api-catalog` | JSON Linkset | `"item"` | `/api/observations/v1` | Registers API service endpoints. |
| `/id/{type}/{name}.html` | HTTP Header | `rel="collection"` | `/catalog/` | Points member entities back to parent catalogue. |

#### Reciprocal Verification Check
* `/sitemap-index.xml` routes harvesters to `/sitemap-catalog.xml`, which points to `/catalog/` and `/.well-known/api-catalog`.
* `/catalog/` returns `rel="alternate"` to `/catalog/dcat.ttl` (complete DCAT-3 dump).

---

### RT-P08: Large Linkset Split-Up

* **Standard Ref**: [RFC 9264](https://www.rfc-editor.org/rfc/rfc9264.html), [RFC 6573 (Item/Collection)](https://datatracker.ietf.org/doc/html/rfc6573)
* **Goal**: Decompose monolithic linkset graphs into modular, cacheable child linksets (conneg, profiles, provenance) using item/collection hierarchies.

#### Required Link Relations (`rel="X"`)

| Source / Anchor URI | Transport Mechanism | Required Link Relation | Target URI | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `<resource-pid-uri>` | HTTP Header | `rel="linkset"` | `<master-linkset-uri>` (`arms-mbon.linkset.json`) | Entry point to Master Linkset Hub. |
| `<master-linkset-uri>` (in JSON body) | JSON Linkset | `"linkset"` | `<child-linkset-uri>` (`.conneg.linkset.json`, `.profiles.linkset.json`, `.provenance.linkset.json`) | **Resource Anchor**: References child linksets for the resource. |
| `<master-linkset-uri>` | HTTP Header | `rel="item"` | `<child-linkset-uri>` | **Collection Downlink**: Declares child linksets as items of the master file. |
| `<master-linkset-uri>` | HTTP Header | `rel="describes"` | `<resource-pid-uri>` | Anchors master linkset document back to the entity PID. |
| `<master-linkset-uri>` | HTTP Header | `rel="cite-as"` | `<local-doi-uri>` | Cites the DOI for the entity. |
| `<child-linkset-uri>` | HTTP Header | `rel="collection"` | `<master-linkset-uri>` | **Uplink**: Child linksets reference parent master linkset. |
| `<child-linkset-uri>` | HTTP Header | `rel="describes"` | `<resource-pid-uri>` | Child linksets anchor back to entity PID. |
| `<child-linkset-uri>` (in JSON body) | JSON Linkset | `"self"`: `[{ "href": "<child-linkset-uri>" }]` | `<child-linkset-uri>` | Fragment identity self-binding. |
| `<child-linkset-uri>` (in JSON body) | JSON Linkset | `"collection": [{ "href": "<master-linkset-uri>" }]` | `<master-linkset-uri>` | Structural uplink in JSON body. |

#### Reciprocal Verification Check
* `GET /id/dataset/arms-mbon.linkset.json` headers contain:
  - `<http://localhost:8080/id/dataset/arms-mbon.conneg.linkset.json>; rel="item"`
  - `<http://localhost:8080/id/dataset/arms-mbon.profiles.linkset.json>; rel="item"`
  - `<http://localhost:8080/id/dataset/arms-mbon.provenance.linkset.json>; rel="item"`
* `GET /id/dataset/arms-mbon.conneg.linkset.json` headers contain:
  - `<http://localhost:8080/id/dataset/arms-mbon.linkset.json>; rel="collection"`
  - `<http://localhost:8080/id/dataset/arms-mbon>; rel="describes"`
* The Item ➔ Collection bidirectional link cycle is completely closed and verifiable.

---

## 3. Concrete Inventory of All Hosted Resources

Below is the complete inventory of all entities configured in `generator/resources.ts` and `generator/profiles.ts`, mapped to their exact URIs, formats, DOI resolution paths, and RT patterns:

### 3.1 Datasets (`/id/dataset/{name}`)

| Entity Name & Title | Persistent PID | Format Representations | Standalone Linksets | DOI URI & Payload Target | Attached Profile | Mapped RT Patterns |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **ARMS-MBON Metagenomic 18S Observations** | `/id/dataset/arms-mbon` | `.html`<br>`.ttl`<br>`.jsonld`<br>`.rdf` | `/id/dataset/arms-mbon.linkset.json`<br>`/id/dataset/arms-mbon.conneg.linkset.json`<br>`/id/dataset/arms-mbon.profiles.linkset.json`<br>`/id/dataset/arms-mbon.provenance.linkset.json` | `/doi/10.14284/578`<br>➔ `/data/arms-mbon-18s.csv`<br>➔ `/data/arms-mbon-stations.geojson`<br>➔ `/data/arms-mbon-rocrate.zip` | `/id/profile/marine-genomic-dataset-profile` | **RT-P01, RT-P02, RT-P03, RT-P04, RT-P08** |
| **ARMS 2018 Ecological Baseline** | `/id/dataset/arms-2018` | `.html`<br>`.ttl`<br>`.jsonld`<br>`.rdf` | `/id/dataset/arms-2018.linkset.json` | `/doi/10.14284/412`<br>➔ `/data/arms-2018-samples.csv` | `/id/profile/marine-ecological-baseline-profile` | **RT-P01, RT-P02, RT-P03, RT-P04** |
| **North Sea Sensor & Buoy Series** | `/id/dataset/north-sea-sensors` | `.html`<br>`.ttl`<br>`.jsonld`<br>`.rdf` | `/id/dataset/north-sea-sensors.linkset.json` | N/A (Direct downloads:<br>`/data/north-sea-sensors-latest.csv`<br>`/data/north-sea-sensors-stream.json`) | `/id/profile/marine-buoy-telemetry-profile` | **RT-P01, RT-P02, RT-P03, RT-P04** |
| **EurOBIS Species Occurrences Sample** | `/id/dataset/eurobis-occurrences` | `.html`<br>`.ttl`<br>`.jsonld`<br>`.rdf` | `/id/dataset/eurobis-occurrences.linkset.json` | N/A (Direct downloads:<br>`/data/eurobis-occurrences.geojson`<br>`/data/eurobis-dwca-sample.zip`) | `/id/profile/darwin-core-occurrence-profile` | **RT-P01, RT-P03, RT-P04** |

---

### 3.2 Publications (`/id/publication/{name}`)

| Entity Name & Title | Persistent PID | Format Representations | Standalone Linksets | DOI URI & Payload Target | Attached Target | Mapped RT Patterns |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **RO-Crate Biodiversity Publishing Paper** | `/id/publication/ro-crate-paper` | `.html`<br>`.ttl`<br>`.jsonld`<br>`.rdf` | `/id/publication/ro-crate-paper.linkset.json` | `/doi/10.3897/biss.6.94630`<br>➔ `/data/ro-crate-paper.pdf` | About: `/id/dataset/arms-mbon` | **RT-P01, RT-P03, RT-P04** |
| **Radical Transparency Position Paper** | `/id/publication/rt-position-paper` | `.html`<br>`.ttl`<br>`.jsonld`<br>`.rdf` | `/id/publication/rt-position-paper.linkset.json` | N/A (External PDF link) | Author: `/id/person/marc` | **RT-P01, RT-P03** |

---

### 3.3 Organizations & People (`/id/institute/{name}` & `/id/person/{name}`)

| Entity Category & Name | Persistent PID | Format Representations | Standalone Linksets | External Identifiers | Members / Affiliations | Mapped RT Patterns |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Institute: Flanders Marine Institute (VLIZ)** | `/id/institute/vliz` | `.html`, `.ttl`, `.jsonld`, `.rdf` | `/id/institute/vliz.linkset.json` | ROR: `https://ror.org/0496xx721`<br>MarineInfo: `36` | Members: Marc, Cedric, Katrina, Laurian, Joanna | **RT-P01, RT-P03** |
| **Person: Marc Portier** | `/id/person/marc` | `.html`, `.ttl`, `.jsonld`, `.rdf` | `/id/person/marc.linkset.json` | ORCID: `0000-0002-9648-6484` | Affiliation: `/id/institute/vliz` | **RT-P01, RT-P03** |
| **Person: Katrina Exter** | `/id/person/katrina` | `.html`, `.ttl`, `.jsonld`, `.rdf` | `/id/person/katrina.linkset.json` | ORCID: `0000-0002-5911-1536` | Affiliation: `/id/institute/vliz` | **RT-P01, RT-P03** |
| **Person: Cedric Decruw** | `/id/person/cedric` | `.html`, `.ttl`, `.jsonld`, `.rdf` | `/id/person/cedric.linkset.json` | ORCID: `0000-0001-6387-5988` | Affiliation: `/id/institute/vliz` | **RT-P01, RT-P03** |
| **Person: Laurian Van Maldeghem** | `/id/person/laurian` | `.html`, `.ttl`, `.jsonld`, `.rdf` | `/id/person/laurian.linkset.json` | ORCID: `0000-0003-0663-5907` | Affiliation: `/id/institute/vliz` | **RT-P01, RT-P03** |
| **Person: Joanna Goley** | `/id/person/joanna` | `.html`, `.ttl`, `.jsonld`, `.rdf` | `/id/person/joanna.linkset.json` | ORCID: `0000-0002-4242-8553` | Affiliation: `/id/institute/vliz` | **RT-P01, RT-P03** |

---

### 3.4 Research Projects (`/id/project/{name}`)

| Entity Name & Title | Persistent PID | Format Representations | Standalone Linksets | Parts & Relations | Mapped RT Patterns |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **MAREGRAPH Initiative** | `/id/project/maregraph` | `.html`, `.ttl`, `.jsonld`, `.rdf` | `/id/project/maregraph.linkset.json` | Sponsor: `/id/institute/vliz`<br>Parts: `arms-mbon`, `arms-2018`, `north-sea-sensors` | **RT-P01, RT-P03** |

---

### 3.5 APIs & Data Services (`/id/service/{name}` & `/api/...`)

| Service Name | Persistent PID | Subsetting Endpoint | OpenAPI & Documentation | RFC 9727 API Catalog | Serves Dataset | Mapped RT Patterns |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **ARMS-MBON Subsetting API** | `/id/service/marineinfo-api` | `/api/observations/v1`<br>`/api/observations/v1.json`<br>`/api/observations/v1.linkset.json` | `/api/openapi.json`<br>`/api/docs/` | `/.well-known/api-catalog` | `/id/dataset/arms-mbon` | **RT-P05, RT-P07** |

---

### 3.6 Semantic Profiles (`/id/profile/{name}`)

| Profile ID & Title | Profile Type | HTML & RDF Endpoints | Profile Linkset | Composed Sub-Profiles | Standard Specification | Mapped RT Patterns |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Schema.org Dataset Profile** | Atomic | `/id/profile/schema-dataset-profile.{html\|ttl\|jsonld}` | `/id/profile/schema-dataset-profile.linkset.json` | None | `https://schema.org/Dataset` | **RT-P01** |
| **W3C DCAT-3 AP Dataset Profile** | Atomic | `/id/profile/dcat3-dataset-profile.{html\|ttl\|jsonld}` | `/id/profile/dcat3-dataset-profile.linkset.json` | None | `https://www.w3.org/TR/vocab-dcat-3/` | **RT-P01** |
| **RO-Crate 1.1 Archival Profile** | Atomic | `/id/profile/ro-crate-package-profile.{html\|ttl\|jsonld}` | `/id/profile/ro-crate-package-profile.linkset.json` | None | `https://w3id.org/ro/crate/1.1` | **RT-P01** |
| **Darwin Core Occurrence Profile** | Atomic | `/id/profile/darwin-core-occurrence-profile.{html\|ttl\|jsonld}` | `/id/profile/darwin-core-occurrence-profile.linkset.json` | None | `http://rs.tdwg.org/dwc/terms/` | **RT-P01** |
| **Sensor Telemetry Time-Series Profile** | Atomic | `/id/profile/sensor-telemetry-timeseries-profile.{html\|ttl\|jsonld}` | `/id/profile/sensor-telemetry-timeseries-profile.linkset.json` | None | `https://www.ogc.org/standard/om/` | **RT-P01** |
| **Marine Genomic Composite Profile** | Composite | `/id/profile/marine-genomic-dataset-profile.{html\|ttl\|jsonld}` | `/id/profile/marine-genomic-dataset-profile.linkset.json` | `schema-dataset-profile`<br>`dcat3-dataset-profile`<br>`ro-crate-package-profile`<br>`darwin-core-occurrence-profile` | W3C DX-PROF / SHACL `sh:and` | **RT-P01, RT-P02** |
| **Marine Ecological Baseline Profile** | Composite | `/id/profile/marine-ecological-baseline-profile.{html\|ttl\|jsonld}` | `/id/profile/marine-ecological-baseline-profile.linkset.json` | `schema-dataset-profile`<br>`dcat3-dataset-profile`<br>`darwin-core-occurrence-profile` | W3C DX-PROF / SHACL `sh:and` | **RT-P01, RT-P02** |
| **Marine Buoy Telemetry Composite Profile** | Composite | `/id/profile/marine-buoy-telemetry-profile.{html\|ttl\|jsonld}` | `/id/profile/marine-buoy-telemetry-profile.linkset.json` | `schema-dataset-profile`<br>`dcat3-dataset-profile`<br>`sensor-telemetry-timeseries-profile` | W3C DX-PROF / SHACL `sh:and` | **RT-P01, RT-P02** |

---

## 4. Key Link Header & JSON Relation Rules

When building machine clients or implementing new resources on this webserver, adhere to the following relation conventions:

1. **Persistent DOI Identification (`cite-as`)**:
   - In RFC 8288 HTTP response headers: `<http://localhost:8080/doi/10.14284/578>; rel="cite-as"`
   - In RFC 9264 JSON Linksets: `"cite-as": [{ "href": "http://localhost:8080/doi/10.14284/578" }]`
2. **Master-to-Child Split Linkset Decomposition (RT-P08)**:
   - In the master Linkset JSON document (`arms-mbon.linkset.json`), child linksets are anchored to the resource PID using `"linkset": [{ "href": "...conneg.linkset.json" }, ...]`.
   - On the HTTP response headers of `GET /id/dataset/arms-mbon.linkset.json`, the child fragments are exposed as `rel="item"`.
   - On the HTTP response headers of child fragments (`arms-mbon.conneg.linkset.json`), they uplink to the master via `rel="collection"`.
3. **Direct Data Payloads (RT-P04)**:
   - Files in `/data/` emit `rel="cite-as"` pointing both to their DOI and their parent dataset PID.
   - Files in `/data/` emit `rel="linkset"` pointing to the parent dataset's linkset, enabling clients to bypass landing pages completely.
