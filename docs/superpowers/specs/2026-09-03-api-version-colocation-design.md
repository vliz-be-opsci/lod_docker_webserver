# Design Specification: API Versioned Directory Co-location

**Date:** 2026-09-03  
**Author:** Antigravity  
**Status:** Approved  
**Topic:** Co-location of API endpoints, documentation, OpenAPI contracts, semantic metadata, and linksets under versioned directory paths (`/api/{service}/{version}/`).

---

## 1. Context & Motivation

In the current implementation of `lod_docker_webserver`, the observations API endpoint is located at `/api/observations/v1`, while its documentation and contract are located globally at the top level:
- OpenAPI specification: `/api/openapi.json`
- Interactive Swagger UI: `/api/docs/`
- Semantic metadata: `/id/service/marineinfo-api.ttl`
- RFC 9264 standalone linkset: `/api/observations/v1.linkset.json`

This layout presents several structural limitations:
1. **Single-API Bias**: Placing `openapi.json` and `docs/` directly under `/api/` assumes a single API on the host.
2. **Version Inelasticity**: Multiple versions (e.g. `v1`, `v2`) or multiple independent APIs cannot cleanly co-exist without collision or arbitrary naming conventions.
3. **Scattered Metadata**: API contracts, human documentation, semantic RDF metadata, and linksets are separated across different directory hierarchies.

### Solution
Restructure API artifacts into a self-contained, versioned directory pattern:
`dist/api/{serviceName}/{version}/`
Where all associated documentation (`docs/`), specifications (`openapi.json`), metadata (`meta.ttl`), and link graphs (`linkset.json`) reside directly alongside the API endpoint.

---

## 2. Architecture & File Layout

### 2.1 Filesystem Structure
For the `observations` service (v1):

```
dist/api/observations/v1/
├── data.json              # Sample observation records served for GET /api/observations/v1
├── openapi.json           # Machine-readable OpenAPI 3.0.3 specification
├── openapi.yaml           # YAML serialization of OpenAPI 3.0.3 specification
├── meta.ttl               # W3C DCAT-3 DataService RDF metadata
├── linkset.json           # RFC 9264 Standalone JSON Linkset
└── docs/
    └── index.html         # Swagger UI loading ../openapi.json
```

The legacy top-level files `dist/api/openapi.json`, `dist/api/openapi.yaml`, and `dist/api/docs/` are completely removed (hard break).

---

## 2.2 URI Hierarchy & Roles

| Role | Canonical URI | Method / Media Type | Description |
| :--- | :--- | :--- | :--- |
| **API Data Endpoint** | `/api/observations/v1` | `GET` `application/json` | Primary data service endpoint. |
| **OpenAPI Spec (`service-desc`)** | `/api/observations/v1/openapi.json` | `GET` `application/json` | OpenAPI 3.0.3 machine contract. |
| **OpenAPI Spec YAML** | `/api/observations/v1/openapi.yaml` | `GET` `application/yaml` | OpenAPI YAML alternative. |
| **Interactive Docs (`service-doc`)**| `/api/observations/v1/docs/` | `GET` `text/html` | Swagger UI explorer. |
| **Service Metadata (`service-meta`)**| `/api/observations/v1/meta.ttl` | `GET` `text/turtle` | DCAT-3 Turtle metadata. |
| **Standalone Linkset (`linkset`)** | `/api/observations/v1/linkset.json` | `GET` `application/linkset+json` | RFC 9264 JSON Linkset. |

---

## 3. Link Relations & Machine Discovery

### 3.1 RFC 8288 HTTP Response Headers on `/api/observations/v1`
When an HTTP client requests `GET /api/observations/v1` or `HEAD /api/observations/v1`:

```http
HTTP/1.1 200 OK
Content-Type: application/json
Link: <http://localhost:8080/id/dataset/arms-mbon>; rel="cite-as",
      <http://localhost:8080/api/observations/v1/openapi.json>; rel="service-desc"; type="application/json",
      <http://localhost:8080/api/observations/v1/docs/>; rel="service-doc"; type="text/html",
      <http://localhost:8080/api/observations/v1/meta.ttl>; rel="service-meta"; type="text/turtle",
      <http://localhost:8080/api/observations/v1/linkset.json>; rel="linkset"; type="application/linkset+json",
      <http://localhost:8080/.well-known/api-catalog>; rel="api-catalog"
```

### 3.2 RFC 9264 Standalone JSON Linkset (`/api/observations/v1/linkset.json`)

```json
{
  "linkset": [
    {
      "anchor": "http://localhost:8080/api/observations/v1",
      "cite-as": [
        { "href": "http://localhost:8080/id/dataset/arms-mbon" }
      ],
      "api-catalog": [
        { "href": "http://localhost:8080/.well-known/api-catalog" }
      ],
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
      ]
    }
  ]
}
```

### 3.3 RFC 9727 Host API Catalog (`/.well-known/api-catalog`)
Remains anchored to the host catalog and references the versioned endpoint:
```json
{
  "linkset": [
    {
      "anchor": "http://localhost:8080/.well-known/api-catalog",
      "item": [
        { "href": "http://localhost:8080/api/observations/v1" }
      ]
    }
  ]
}
```

### 3.4 Service Metadata (`/api/observations/v1/meta.ttl`)
Serialized in W3C DCAT-3 Turtle format:
```turtle
@prefix dcat: <http://www.w3.org/ns/dcat#> .
@prefix dcterms: <http://purl.org/dc/terms/> .

<http://localhost:8080/id/service/marineinfo-api> a dcat:DataService ;
    dcterms:title "ARMS-MBON Subsetting & Observation API (v1)" ;
    dcterms:description "Parameterized observation querying service for marine genomics." ;
    dcat:endpointURL <http://localhost:8080/api/observations/v1> ;
    dcat:endpointDescription <http://localhost:8080/api/observations/v1/openapi.json> ;
    dcat:servesDataset <http://localhost:8080/id/dataset/arms-mbon> .
```

---

## 4. Nginx Server Configuration

### 4.1 Routing (`nginx.conf`)
```nginx
# 1. Primary API observations endpoint (exact match, clean URI without trailing slash)
location = /api/observations/v1 {
    default_type application/json;
    add_header Access-Control-Allow-Origin * always;
    add_header Access-Control-Expose-Headers "Link, Content-Type, Location" always;
    try_files /api/observations/v1/data.json =404;
}

# 2. Swagger UI documentation directory
location /api/observations/v1/docs/ {
    try_files $uri $uri/ /api/observations/v1/docs/index.html =404;
}

# 3. Static serving for co-located API assets with proper MIME types
location /api/ {
    types {
        text/html                     html;
        application/json              json;
        text/turtle                   ttl;
        application/linkset+json      json;
    }
}
```

### 4.2 Gapped Server Simulation (`nginx-gapped.conf`)
- Route `/api/observations/v1` serves `data.json` but omits `cite-as` and `service-desc` headers to simulate an orphan API endpoint (Scenario 7).

---

## 5. Generator Updates Summary

1. **`generator/openApiGenerator.ts`**:
   - Updates output paths to write `data.json`, `openapi.json`, `openapi.yaml`, `meta.ttl`, and `docs/index.html` under `dist/api/observations/v1/`.
   - Updates Swagger UI JS configuration to reference `/api/observations/v1/openapi.json`.
   - Generates DCAT-3 `meta.ttl`.
2. **`generator/linksetGenerator.ts`**:
   - Updates `generateApiServiceLinkset` target links to `/api/observations/v1/{openapi.json,docs/,meta.ttl}`.
3. **`generator/index.ts`**:
   - Removes generation of top-level `/api/openapi.json`, `/api/openapi.yaml`, and `/api/docs/`.
   - Writes the linkset to `dist/api/observations/v1/linkset.json`.
   - Emits RFC 8288 headers in `nginx-headers.conf` for `/api/observations/v1` and `/api/observations/v1/docs/`.
   - Updates `sitemap-catalog.xml` entries for the API.
4. **`generator/dcatGenerator.ts` & `generator/resources.ts`**:
   - Updates `dcat:endpointDescription` to `http://localhost:8080/api/observations/v1/openapi.json`.
5. **`generator/htmlTemplates.ts`**:
   - Updates the site header navigation link for "Subsetting API" to `/api/observations/v1/docs/`.
6. **`generator/metromap/`**:
   - Updates `DiscoveryCascadeEngine.ts` and `MetroGraphBuilder.ts` nodes and tracks to point to `/api/observations/v1/openapi.json` and `/api/observations/v1/docs/`.
7. **`generator/complianceDocs.ts` & `generator/gappedGenerator.ts`**:
   - Updates compliance markdown documentation and gapped simulation output.

---

## 6. Testing & Verification

1. **Automated Integration Tests (`test/nginxIntegration.test.ts`)**:
   - Verify `dist/api/observations/v1/data.json` exists.
   - Verify `dist/api/observations/v1/openapi.json` exists and is valid OpenAPI 3.0.3 JSON.
   - Verify `dist/api/observations/v1/docs/index.html` exists and points to `/api/observations/v1/openapi.json`.
   - Verify `dist/api/observations/v1/meta.ttl` exists and contains `dcat:DataService`.
   - Verify `dist/api/observations/v1/linkset.json` exists and matches the new structure.
   - Verify `dist/api/openapi.json` and `dist/api/docs/` do NOT exist.
   - Verify `nginx-headers.conf` contains the updated `Link:` headers.
2. **Visualizer & Gapped Tests (`test/metromap/`, `test/gappedServer.test.ts`)**:
   - Verify Metro Map builds clean discovery tracks to the new API paths.
   - Verify Gapped simulation tests pass.
3. **Full Project Suite**:
   - `bun test` passes with 0 failures.
4. **Docker Verification**:
   - `docker compose build --no-cache && docker compose up -d`
   - Live curl verification for all endpoints.
