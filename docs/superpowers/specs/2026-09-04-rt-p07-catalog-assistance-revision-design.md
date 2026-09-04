# Radical Transparency Pattern 7 (RT-P07) Revision: Catalogue-Assisted Resource Exposure

## Status
- **Date**: 2026-09-04
- **Author**: Antigravity & User Pair Programming
- **Topic**: RT-P07 Catalogue-Assisted Resource Exposure Revision
- **Target Components**: Nginx webserver configuration, TypeScript static generator, Sitemaps hierarchy, RFC 9727 API Catalog, and API endpoints.

---

## 1. Context & Motivation

The Radical Transparency specification for **Catalogue-Assisted Resource Exposure ([RT-P07](https://github.com/eosc-semantic-interop/if-solutions-proposals/blob/main/proposals/radical-transparency/linkset-usage-patterns/07-catalog-assistance.md))** defines a structured hand-over mechanism. Instead of inundating static web sitemaps with millions of granular observation records, the host establishes a tripartite architecture connecting:
1. **Sitemaps Hierarchy (sitemaps.org + ResourceSync `rs:ln`)**: Navigable starting from `/robots.txt` and `/sitemap-index.xml`.
2. **Authoritative API Catalog (RFC 9727 `/.well-known/api-catalog`)**: Machine-readable service registry listing hosted APIs and endpoints.
3. **API Services & Query Gateways (`/api/observations/v1`)**: Subsetting APIs that expose query entry points, documentation, schemas, and dedicated feed alternatives.

### 1.1 Empirical Audit Findings
Running the empirical compliance test suite (`rt-test`) against `http://localhost:8080` revealed 3 structural gaps:
1. **Missing `rel="self"` on `/sitemap-catalog.xml`**: Harvesters fetching the catalog sitemap could not bind it back to the canonical `/.well-known/api-catalog` entity.
2. **Missing `rel="alternate"` on `/api/observations/v1`**: Harvesters discovering the API endpoint lacked a direct pointer to its dedicated XML feed.
3. **Missing dedicated API sitemap (`/api/observations/v1/sitemap.xml`)**: The dedicated sub-sitemap for `/api/observations/v1` returned `404 Not Found`, breaking sitemap delegation.

---

## 2. Tripartite Architecture (Pattern 7)

```
[Host / robots.txt]
       │
       ▼ (Sitemap directive)
[Pillar 2: Sitemaps Hierarchy (sitemaps.org)]
   ├── Root Sitemap Index: /sitemap-index.xml
   │     ├── <sitemap> Catalog Sitemap: /sitemap-catalog.xml
   │     └── <sitemap> Dedicated API Sitemap: /api/observations/v1/sitemap.xml
   │
   ├── Catalog Sitemap: /sitemap-catalog.xml
   │     ├── rel="self" (HTTP Link + <rs:ln>) ──────────────┐
   │     └── <loc> entries to API endpoints (/api/observations/v1)
   │                                                           │
   └── Dedicated API Sitemap: /api/observations/v1/sitemap.xml  │
         ├── rel="self" (HTTP Link + <rs:ln>) ────────┐      │
         └── <loc> entries to API query/subresources    │      │
                                                        │      │
[Pillar 3: RFC 9727 API Catalog]                        │      │
   └── /.well-known/api-catalog ◄───────────────────────┼──────┘
         ├── rel="alternate" ──► /sitemap-catalog.xml   │
         └── rel="item" ───────► /api/observations/v1   │
                                                        │
[Pillar 1: API Services & Subresources]                 │
   └── Endpoint: /api/observations/v1 ◄─────────────────┘
         ├── rel="api-catalog" ──► /.well-known/api-catalog
         ├── rel="alternate"   ──► /api/observations/v1/sitemap.xml
         └── Subresources / query samples emit rel="collection" back to /api/observations/v1
```

---

## 3. Resource Specifications & Contracts

### 3.1 `GET /robots.txt`
- **File**: `dist/robots.txt`
- **MIME**: `text/plain`
- **Content**:
  ```txt
  User-agent: *
  Allow: /
  Sitemap: http://localhost:8080/sitemap-index.xml
  Sitemap: http://localhost:8080/sitemap.xml
  ```

### 3.2 `GET /sitemap-index.xml`
- **File**: `dist/sitemap-index.xml`
- **MIME**: `application/xml`
- **Content**:
  ```xml
  <?xml version="1.0" encoding="UTF-8"?>
  <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <sitemap>
      <loc>http://localhost:8080/sitemap.xml</loc>
    </sitemap>
    <sitemap>
      <loc>http://localhost:8080/sitemap-datasets.xml</loc>
    </sitemap>
    <sitemap>
      <loc>http://localhost:8080/sitemap-profiles.xml</loc>
    </sitemap>
    <sitemap>
      <loc>http://localhost:8080/sitemap-catalog.xml</loc>
    </sitemap>
    <sitemap>
      <loc>http://localhost:8080/api/observations/v1/sitemap.xml</loc>
    </sitemap>
  </sitemapindex>
  ```

### 3.3 `GET /sitemap-catalog.xml`
- **File**: `dist/sitemap-catalog.xml`
- **MIME**: `application/xml`
- **HTTP Response Headers**:
  ```http
  HTTP/1.1 200 OK
  Content-Type: application/xml
  Link: <http://localhost:8080/.well-known/api-catalog>; rel="self"
  ```
- **Content**:
  ```xml
  <?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
          xmlns:rs="http://www.openarchives.org/rs/terms/">
    <rs:ln rel="self" href="http://localhost:8080/.well-known/api-catalog" />
    <url>
      <loc>http://localhost:8080/catalog/</loc>
      <rs:ln rel="type" href="https://www.w3.org/TR/vocab-dcat/" />
      <rs:ln rel="alternate" href="http://localhost:8080/catalog/dcat.ttl" type="text/turtle" />
    </url>
    <url>
      <loc>http://localhost:8080/.well-known/api-catalog</loc>
      <rs:ln rel="profile" href="https://www.rfc-editor.org/info/rfc9727" />
    </url>
    <url>
      <loc>http://localhost:8080/api/observations/v1</loc>
      <rs:ln rel="cite-as" href="http://localhost:8080/id/dataset/arms-mbon" />
      <rs:ln rel="alternate" href="http://localhost:8080/api/observations/v1/sitemap.xml" type="application/xml" />
    </url>
    <url>
      <loc>http://localhost:8080/api/observations/v1/docs/</loc>
      <rs:ln rel="service-desc" href="http://localhost:8080/api/observations/v1/openapi.json" />
    </url>
  </urlset>
  ```

### 3.4 `GET /.well-known/api-catalog`
- **File**: `dist/.well-known/api-catalog`
- **MIME**: `application/linkset+json`
- **HTTP Response Headers**:
  ```http
  HTTP/1.1 200 OK
  Content-Type: application/linkset+json
  Link: <http://localhost:8080/sitemap-catalog.xml>; rel="alternate"; type="application/xml",
        <http://localhost:8080/api/observations/v1>; rel="item"
  ```
- **Content**:
  ```json
  {
    "linkset": [
      {
        "anchor": "http://localhost:8080/.well-known/api-catalog",
        "item": [
          { "href": "http://localhost:8080/api/observations/v1" }
        ],
        "alternate": [
          {
            "href": "http://localhost:8080/sitemap-catalog.xml",
            "type": "application/xml"
          }
        ]
      }
    ]
  }
  ```

### 3.5 `GET /api/observations/v1`
- **Target**: `dist/api/observations/v1/data.json` (served on query parameters; 307 on empty query)
- **MIME**: `application/json`
- **HTTP Response Headers**:
  ```http
  HTTP/1.1 200 OK
  Content-Type: application/json
  Link: <http://localhost:8080/id/dataset/arms-mbon>; rel="cite-as",
        <http://localhost:8080/api/observations/v1/openapi.json>; rel="service-desc"; type="application/json",
        <http://localhost:8080/api/observations/v1/docs/>; rel="service-doc"; type="text/html",
        <http://localhost:8080/api/observations/v1/meta.ttl>; rel="service-meta"; type="text/turtle",
        <http://localhost:8080/api/observations/v1/linkset.json>; rel="linkset"; type="application/linkset+json",
        <http://localhost:8080/.well-known/api-catalog>; rel="api-catalog",
        <http://localhost:8080/api/observations/v1/sitemap.xml>; rel="alternate"; type="application/xml",
        <http://localhost:8080/api/observations/v1>; rel="collection"
  ```

### 3.6 `GET /api/observations/v1/sitemap.xml`
- **File**: `dist/api/observations/v1/sitemap.xml`
- **MIME**: `application/xml`
- **HTTP Response Headers**:
  ```http
  HTTP/1.1 200 OK
  Content-Type: application/xml
  Link: <http://localhost:8080/api/observations/v1>; rel="self",
        <http://localhost:8080/.well-known/api-catalog>; rel="api-catalog"
  ```
- **Content**:
  ```xml
  <?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
          xmlns:rs="http://www.openarchives.org/rs/terms/">
    <rs:ln rel="self" href="http://localhost:8080/api/observations/v1" />
    <url>
      <loc>http://localhost:8080/api/observations/v1?marker_gene=18S&amp;limit=20</loc>
      <rs:ln rel="collection" href="http://localhost:8080/api/observations/v1" />
      <rs:ln rel="cite-as" href="http://localhost:8080/id/dataset/arms-mbon" />
    </url>
    <url>
      <loc>http://localhost:8080/api/observations/v1?marker_gene=COI&amp;limit=20</loc>
      <rs:ln rel="collection" href="http://localhost:8080/api/observations/v1" />
      <rs:ln rel="cite-as" href="http://localhost:8080/id/dataset/arms-mbon" />
    </url>
    <url>
      <loc>http://localhost:8080/api/observations/v1?marker_gene=ITS&amp;limit=20</loc>
      <rs:ln rel="collection" href="http://localhost:8080/api/observations/v1" />
      <rs:ln rel="cite-as" href="http://localhost:8080/id/dataset/arms-mbon" />
    </url>
  </urlset>
  ```

### 3.7 `GET /api/observations/v1/linkset.json`
- **File**: `dist/api/observations/v1/linkset.json`
- **MIME**: `application/linkset+json`
- **HTTP Response Headers**:
  ```http
  HTTP/1.1 200 OK
  Content-Type: application/linkset+json
  Link: <http://localhost:8080/api/observations/v1>; rel="describes",
        <http://localhost:8080/.well-known/api-catalog>; rel="collection"
  ```
- **Content**:
  ```json
  {
    "linkset": [
      {
        "anchor": "http://localhost:8080/api/observations/v1",
        "cite-as": [{ "href": "http://localhost:8080/id/dataset/arms-mbon" }],
        "api-catalog": [{ "href": "http://localhost:8080/.well-known/api-catalog" }],
        "service-desc": [
          {
            "href": "http://localhost:8080/api/observations/v1/openapi.json",
            "type": "application/json",
            "profile": "https://www.openapis.org/#profile"
          }
        ],
        "service-doc": [
          {
            "href": "http://localhost:8080/api/observations/v1/docs/",
            "type": "text/html"
          }
        ],
        "service-meta": [
          {
            "href": "http://localhost:8080/api/observations/v1/meta.ttl",
            "type": "text/turtle"
          }
        ],
        "alternate": [
          {
            "href": "http://localhost:8080/api/observations/v1/sitemap.xml",
            "type": "application/xml"
          }
        ]
      }
    ]
  }
  ```

---

## 4. Implementation Plan

### 4.1 Generator Modifications
1. **`generator/openApiGenerator.ts`**:
   - Add `generateApiSitemapXml(baseUrl: string): string` generating the XML feed for `/api/observations/v1`.
   - Update `generateApiSampleResponses()` to write `dist/api/observations/v1/sitemap.xml`.
2. **`generator/linksetGenerator.ts`**:
   - Update `generateApiServiceLinkset()` to include `rel="alternate"` pointing to `${baseUrl}/api/observations/v1/sitemap.xml`.
3. **`generator/index.ts`**:
   - In `sitemap-catalog.xml` generation: add top-level `<rs:ln rel="self" href="${BASE_URL}/.well-known/api-catalog" />` and `<rs:ln rel="alternate" href="${BASE_URL}/api/observations/v1/sitemap.xml" type="application/xml" />` on the `/api/observations/v1` entry.
   - In `sitemap-index.xml` generation: add `<sitemap><loc>${BASE_URL}/api/observations/v1/sitemap.xml</loc></sitemap>`.
   - In `nginx-headers.conf` generation:
     - Add location block for `/sitemap-catalog.xml` with `Link: <${BASE_URL}/.well-known/api-catalog>; rel="self"`.
     - Add location block for `/api/observations/v1/sitemap.xml` with `Link: <${BASE_URL}/api/observations/v1>; rel="self", <${BASE_URL}/.well-known/api-catalog>; rel="api-catalog"`.
     - Update `location = /.well-known/api-catalog` Link header to include `<${BASE_URL}/api/observations/v1>; rel="item"`.
     - Update `location = /api/observations/v1` Link header to include `<${BASE_URL}/api/observations/v1/sitemap.xml>; rel="alternate"; type="application/xml"` and `<${BASE_URL}/api/observations/v1>; rel="collection"`.
4. **Metromap Engine (`generator/metromap/`)**:
   - Update graph builder and discovery cascade engine to recognize the new `/api/observations/v1/sitemap.xml` station and its relations.

---

## 5. Verification Plan

### 5.1 Unit and Integration Tests
Run `bun test` in `lod_docker_webserver` to verify:
- Generator builds `dist/api/observations/v1/sitemap.xml` with valid XML and `<rs:ln>` annotations.
- `dist/sitemap-catalog.xml` contains `rel="self"` and `rel="alternate"`.
- `dist/sitemap-index.xml` delegates to `/api/observations/v1/sitemap.xml`.
- `nginx-headers.conf` contains all required RFC 8288 Link headers.

### 5.2 Container Deployment Verification
- Rebuild/restart reference and gapped webserver containers: `docker compose up -d --build`.
- Run curl checks against `http://localhost:8080`:
  - `curl -sI http://localhost:8080/sitemap-catalog.xml` -> verify `rel="self"`.
  - `curl -sI http://localhost:8080/api/observations/v1/sitemap.xml` -> verify `200 OK` and `rel="self"`.
  - `curl -sI "http://localhost:8080/api/observations/v1?marker_gene=18S&limit=20"` -> verify `rel="alternate"` and `rel="collection"`.

### 5.3 Empirical Test Suite Verification
Run `python rt_test.py -c config_localhost_empirical.yaml` in `grmp-test-implementations/rt-test/`:
- Verify all PT-07 assertions pass.
- Verify 0 failures across the entire suite (all 131+ assertions pass).
- Verify the tripartite diagram renders green.
