# Design Document: RT-P09 Release Linking & Lifecycle Navigation

**Date:** 2026-09-02  
**Topic:** EOSC Radical Transparency Linkset Usage Pattern 09 (Release Linking / RFC 5829)  
**Status:** Approved by User (Proposition 3 + Behavior A)  

---

## 1. Executive Summary & Pattern Objective

The objective of **RT-P09 (Release Linking)** is to enable autonomous, machine-actionable navigation through the lifecycle of digital assets (datasets, profiles, APIs, standards) within the Linked Open Data (LOD) web ecosystem.

Dynamic scientific assets evolve continuously, but scientific citation, archival verification, and programmatic reasoning require immutability. RT-P09 resolves this tension—termed **The Series / Release Paradox**—by combining:
1. **Conceptual Series URIs**: Stable, timeless identifiers representing the evolving entity, carrying a Series DOI and linking forward to the current authoritative snapshot (`rel="latest-version"`) and the archive (`rel="version-history"`).
2. **Release Snapshot URIs**: Immutable, point-in-time representations, carrying Release DOIs and linking backward across the chain of succession (`rel="predecessor-version"`) and to the archive (`rel="version-history"`).
3. **History Archive Resources**: Dedicated endpoints serving machine-readable version catalogs (RFC 9264 linksets with `item` listings containing `version`, `release-date`, and `title`).
4. **Pattern Weaving**:
   - **Profile Evolution (RT-P01 & RT-P02)**: Versioned profiles link to abstract profiles via `rel="http://schema.org/hasPart"` to ensure graceful degradation.
   - **Local DOI Direct Resolution (RT-04 Behavior A)**: Dereferencing the Series DOI resolves (`303 See Other`) directly to the latest authoritative data payload, signposted with both Release DOI (`cite-as`) and Series DOI (`collection`).

---

## 2. Resource Entities & URI Taxonomy

### 2.1. MarineInfo Dataset 90 (Macrobenthos of the Belgian North Sea)

| Resource Identity | Canonical URI | Role / Identifier | Physical Payloads |
| :--- | :--- | :--- | :--- |
| **Dataset 90 Conceptual Series** | `/id/dataset/dataset-90` | Series URI / DOI: `10.14284/90` | Resolved via Behavior A to v2.1 payload |
| **Dataset 90 Release v1.0** | `/id/dataset/dataset-90/v1.0` | Initial Snapshot (2023-06-02) / DOI: `10.14284/90.v1.0` | `/data/dataset-90-v1.0.csv` |
| **Dataset 90 Release v2.0** | `/id/dataset/dataset-90/v2.0` | Intermediate Snapshot (2025-02-06) / DOI: `10.14284/90.v2.0` | `/data/dataset-90-v2.0.csv` |
| **Dataset 90 Release v2.1** | `/id/dataset/dataset-90/v2.1` | Authoritative Latest (2026-08-26) / DOI: `10.14284/90.v2.1` | `/data/dataset-90-v2.1.csv` |
| **Dataset 90 History** | `/id/dataset/dataset-90/history` | Archive / Memento TimeMap | None (Catalog Resource) |

### 2.2. Profile Evolution (RO-Crate Package Profile)

| Profile Identity | Canonical URI | Conformance Target | Role |
| :--- | :--- | :--- | :--- |
| **Abstract RO-Crate Profile** | `/id/profile/ro-crate-package-profile` | `https://w3id.org/ro/crate` | Abstract conceptual profile |
| **RO-Crate Profile v1.0** | `/id/profile/ro-crate-package-profile/v1.0` | `https://w3id.org/ro/crate/1.0` | Initial profile release |
| **RO-Crate Profile v1.1** | `/id/profile/ro-crate-package-profile/v1.1` | `https://w3id.org/ro/crate/1.1` | Authoritative latest release |
| **RO-Crate Profile History** | `/id/profile/ro-crate-package-profile/history` | `https://www.rfc-editor.org/info/rfc5829` | Profile version catalog |

---

## 3. Web Architecture & Nginx Routing

### 3.1. Nested URI Content Negotiation
Nginx configuration (`nginx.conf`) handles both top-level entities and nested version/history URIs:

```nginx
# 1. Base entities: /id/{type}/{name}
location ~ ^/id/(?<res_type>[^/]+)/(?<res_name>[^/.]+)$ {
    add_header Vary Accept always;
    add_header Access-Control-Allow-Origin * always;
    add_header Link '<$scheme://$http_host/id/$res_type/$res_name.linkset.json>; rel="linkset"; type="application/linkset+json"' always;
    return 303 $scheme://$http_host/id/$res_type/$res_name.$conneg_suffix;
}

# 2. Nested Versioned URIs: /id/{type}/{name}/{version_or_sub}
location ~ ^/id/(?<res_type>[^/]+)/(?<res_name>[^/]+)/(?<res_sub>[^/.]+)$ {
    add_header Vary Accept always;
    add_header Access-Control-Allow-Origin * always;
    add_header Link '<$scheme://$http_host/id/$res_type/$res_name/$res_sub.linkset.json>; rel="linkset"; type="application/linkset+json"' always;
    return 303 $scheme://$http_host/id/$res_type/$res_name/$res_sub.$conneg_suffix;
}
```

### 3.2. Behavior A Local DOI Direct-to-Payload Mapping (`nginx-coneg.conf`)
Dereferencing the Series DOI redirects straight to the latest release payload, and each Release DOI redirects to its specific immutable file:

```nginx
map $uri $doi_payload_uri {
    default "";
    "/doi/10.14284/90"       "/data/dataset-90-v2.1.csv";   # Series DOI -> Latest Payload (Behavior A)
    "/doi/10.14284/90.v1.0"  "/data/dataset-90-v1.0.csv";   # Release v1.0
    "/doi/10.14284/90.v2.0"  "/data/dataset-90-v2.0.csv";   # Release v2.0
    "/doi/10.14284/90.v2.1"  "/data/dataset-90-v2.1.csv";   # Release v2.1
}
```

---

## 4. Complete HTTP Response Headers (`nginx-headers.conf`)

### 4.1. Dataset 90 Conceptual Series (`/id/dataset/dataset-90.html` / `.ttl` / `.jsonld`)
```http
Link: <http://localhost:8080/id/dataset/dataset-90/v2.1>; rel="latest-version"
Link: <http://localhost:8080/id/dataset/dataset-90/history>; rel="version-history"
Link: <http://localhost:8080/doi/10.14284/90>; rel="cite-as"
Link: <http://localhost:8080/id/dataset/dataset-90>; rel="describes"
Link: <https://schema.org/Dataset>; rel="type"
Link: <https://www.w3.org/TR/vocab-dcat/>; rel="profile"
Link: <http://localhost:8080/id/dataset/dataset-90.ttl>; rel="describedby"; type="text/turtle"
Link: <http://localhost:8080/id/dataset/dataset-90.jsonld>; rel="describedby"; type="application/ld+json"
Link: <http://localhost:8080/id/dataset/dataset-90.linkset.json>; rel="linkset"; type="application/linkset+json"
Link: <http://localhost:8080/catalog/>; rel="collection"
```

### 4.2. Dataset 90 Release v2.1 (`/id/dataset/dataset-90/v2.1.html` / `.ttl` / `.jsonld`)
```http
Link: <http://localhost:8080/id/dataset/dataset-90/v2.0>; rel="predecessor-version"
Link: <http://localhost:8080/id/dataset/dataset-90/history>; rel="version-history"
Link: <http://localhost:8080/id/dataset/dataset-90>; rel="collection"
Link: <http://localhost:8080/doi/10.14284/90.v2.1>; rel="cite-as"
Link: <http://localhost:8080/id/dataset/dataset-90/v2.1>; rel="describes"
Link: <http://localhost:8080/data/dataset-90-v2.1.csv>; rel="item"; type="text/csv"
Link: <http://localhost:8080/id/profile/dcat3-dataset-profile>; rel="profile"
Link: <http://localhost:8080/id/dataset/dataset-90/v2.1.ttl>; rel="describedby"; type="text/turtle"
Link: <http://localhost:8080/id/dataset/dataset-90/v2.1.linkset.json>; rel="linkset"; type="application/linkset+json"
```

### 4.3. Dataset 90 Release v2.0 (`/id/dataset/dataset-90/v2.0.html` / `.ttl`)
```http
Link: <http://localhost:8080/id/dataset/dataset-90/v1.0>; rel="predecessor-version"
Link: <http://localhost:8080/id/dataset/dataset-90/v2.1>; rel="successor-version"
Link: <http://localhost:8080/id/dataset/dataset-90/history>; rel="version-history"
Link: <http://localhost:8080/id/dataset/dataset-90>; rel="collection"
Link: <http://localhost:8080/doi/10.14284/90.v2.0>; rel="cite-as"
Link: <http://localhost:8080/data/dataset-90-v2.0.csv>; rel="item"; type="text/csv"
Link: <http://localhost:8080/id/dataset/dataset-90/v2.0.linkset.json>; rel="linkset"; type="application/linkset+json"
```

### 4.4. Dataset 90 Release v1.0 (`/id/dataset/dataset-90/v1.0.html` / `.ttl`)
```http
Link: <http://localhost:8080/id/dataset/dataset-90/v2.0>; rel="successor-version"
Link: <http://localhost:8080/id/dataset/dataset-90/history>; rel="version-history"
Link: <http://localhost:8080/id/dataset/dataset-90>; rel="collection"
Link: <http://localhost:8080/doi/10.14284/90.v1.0>; rel="cite-as"
Link: <http://localhost:8080/data/dataset-90-v1.0.csv>; rel="item"; type="text/csv"
Link: <http://localhost:8080/id/dataset/dataset-90/v1.0.linkset.json>; rel="linkset"; type="application/linkset+json"
```

### 4.5. Dataset 90 History Endpoint (`/id/dataset/dataset-90/history.html` & `.linkset.json`)
```http
Link: <http://localhost:8080/id/dataset/dataset-90>; rel="describes"
Link: <https://www.rfc-editor.org/info/rfc5829>; rel="profile"
Link: <http://localhost:8080/id/dataset/dataset-90/history.linkset.json>; rel="linkset"; type="application/linkset+json"
```

### 4.6. Physical Payload Signposting (`/data/dataset-90-v2.1.csv`)
```http
Link: <http://localhost:8080/doi/10.14284/90.v2.1>; rel="cite-as"
Link: <http://localhost:8080/doi/10.14284/90>; rel="collection"
Link: <http://localhost:8080/id/dataset/dataset-90/v2.1>; rel="collection"
Link: <http://localhost:8080/id/dataset/dataset-90/v2.1.linkset.json>; rel="linkset"; type="application/linkset+json"
```

### 4.7. RO-Crate Profile Evolution Headers
* **Abstract Profile (`/id/profile/ro-crate-package-profile.html`):**
  ```http
  Link: <http://localhost:8080/id/profile/ro-crate-package-profile/v1.1>; rel="latest-version"
  Link: <http://localhost:8080/id/profile/ro-crate-package-profile/history>; rel="version-history"
  Link: <http://www.w3.org/ns/dx/prof/Profile>; rel="type"
  ```
* **Release v1.1 Profile (`/id/profile/ro-crate-package-profile/v1.1.html`):**
  ```http
  Link: <http://localhost:8080/id/profile/ro-crate-package-profile>; rel="http://schema.org/hasPart"
  Link: <http://localhost:8080/id/profile/ro-crate-package-profile/v1.0>; rel="predecessor-version"
  Link: <http://localhost:8080/id/profile/ro-crate-package-profile/history>; rel="version-history"
  Link: <http://www.w3.org/ns/dx/prof/Profile>; rel="type"
  ```

---

## 5. Standalone RFC 9264 Linksets (`application/linkset+json`)

### 5.1. Dataset 90 Series Linkset (`/id/dataset/dataset-90.linkset.json`)
```json
{
  "linkset": [
    {
      "anchor": "http://localhost:8080/id/dataset/dataset-90",
      "latest-version": [
        { "href": "http://localhost:8080/id/dataset/dataset-90/v2.1" }
      ],
      "version-history": [
        { "href": "http://localhost:8080/id/dataset/dataset-90/history" }
      ],
      "cite-as": [
        { "href": "http://localhost:8080/doi/10.14284/90" }
      ],
      "type": [
        { "href": "https://schema.org/Dataset" }
      ],
      "alternate": [
        { "href": "http://localhost:8080/id/dataset/dataset-90.ttl", "type": "text/turtle; charset=utf-8" },
        { "href": "http://localhost:8080/id/dataset/dataset-90.jsonld", "type": "application/ld+json" },
        { "href": "http://localhost:8080/id/dataset/dataset-90.html", "type": "text/html; charset=utf-8" },
        { "href": "http://localhost:8080/id/dataset/dataset-90.rdf", "type": "application/rdf+xml" }
      ]
    },
    {
      "anchor": "http://localhost:8080/id/dataset/dataset-90.ttl",
      "self": [{ "href": "http://localhost:8080/id/dataset/dataset-90" }]
    },
    {
      "anchor": "http://localhost:8080/id/dataset/dataset-90.jsonld",
      "self": [{ "href": "http://localhost:8080/id/dataset/dataset-90" }]
    },
    {
      "anchor": "http://localhost:8080/id/dataset/dataset-90.html",
      "self": [{ "href": "http://localhost:8080/id/dataset/dataset-90" }]
    }
  ]
}
```

### 5.2. Dataset 90 Release v2.1 Linkset (`/id/dataset/dataset-90/v2.1.linkset.json`)
```json
{
  "linkset": [
    {
      "anchor": "http://localhost:8080/id/dataset/dataset-90/v2.1",
      "predecessor-version": [
        { "href": "http://localhost:8080/id/dataset/dataset-90/v2.0" }
      ],
      "version-history": [
        { "href": "http://localhost:8080/id/dataset/dataset-90/history" }
      ],
      "collection": [
        { "href": "http://localhost:8080/id/dataset/dataset-90" }
      ],
      "cite-as": [
        { "href": "http://localhost:8080/doi/10.14284/90.v2.1" }
      ],
      "profile": [
        { "href": "http://localhost:8080/id/profile/dcat3-dataset-profile" }
      ],
      "item": [
        {
          "href": "http://localhost:8080/data/dataset-90-v2.1.csv",
          "type": "text/csv",
          "title": "Macrobenthos Abundance Matrix v2.1 (CSV)"
        }
      ],
      "alternate": [
        { "href": "http://localhost:8080/id/dataset/dataset-90/v2.1.ttl", "type": "text/turtle; charset=utf-8" },
        { "href": "http://localhost:8080/id/dataset/dataset-90/v2.1.jsonld", "type": "application/ld+json" },
        { "href": "http://localhost:8080/id/dataset/dataset-90/v2.1.html", "type": "text/html; charset=utf-8" }
      ]
    },
    {
      "anchor": "http://localhost:8080/id/dataset/dataset-90/v2.1.ttl",
      "self": [{ "href": "http://localhost:8080/id/dataset/dataset-90/v2.1" }]
    }
  ]
}
```

### 5.3. Dataset 90 History Linkset (`/id/dataset/dataset-90/history.linkset.json`)
```json
{
  "linkset": [
    {
      "anchor": "http://localhost:8080/id/dataset/dataset-90/history",
      "item": [
        {
          "href": "http://localhost:8080/id/dataset/dataset-90/v1.0",
          "version": "1.0",
          "release-date": "2023-06-02",
          "title": "Initial release of Belgian North Sea macrobenthos baseline."
        },
        {
          "href": "http://localhost:8080/id/dataset/dataset-90/v2.0",
          "version": "2.0",
          "release-date": "2025-02-06",
          "title": "Taxonomic harmonization and station grid expansion."
        },
        {
          "href": "http://localhost:8080/id/dataset/dataset-90/v2.1",
          "version": "2.1",
          "release-date": "2026-08-26",
          "title": "Quality control flag additions and biomass recalibration."
        }
      ]
    }
  ]
}
```

---

## 6. Dual-Container Gapped Simulation Topology (Port 8080 vs. Port 8081)

In `docker-compose.yml`, the two webservers will contrast RT-P09 compliance:

1. **Port 8080 (`lod-reference-webserver`)**:
   - 100% compliant with RT-P01 through RT-P09.
   - Autonomous crawlers dereferencing `/id/dataset/dataset-90` discover `latest-version`, reach `/v2.1`, traverse `predecessor-version` back through `/v2.0` and `/v1.0`, and fetch the full history catalog.

2. **Port 8081 (`lod-gapped-webserver`)**:
   - Simulates the **Orphan Snapshot & Broken Lifecycle** anti-pattern:
     - On `/id/dataset/dataset-90`, omits `rel="latest-version"` and `rel="version-history"` (crawler cannot determine current authoritative release).
     - On `/id/dataset/dataset-90/v2.1`, omits `rel="predecessor-version"` (crawler encounters a dead-end snapshot).
     - Returns `404 Not Found` for `/id/dataset/dataset-90/history.linkset.json`.
   - Documented in `auditPageRenderer.ts` (`/audit.html`), `compliance.json`, and `docs/compliance/dataset-90-release-links.md`.

---

## 7. Verification & Automated Testing Plan

### 7.1. Unit & Integration Tests (`bun test`)
1. **Serialization & Generator Tests (`test/serialization.test.ts` & `test/linkset.test.ts`)**:
   - Verify `dataset-90.linkset.json` contains valid `latest-version` and `version-history` links.
   - Verify `dataset-90/v2.1.linkset.json` contains valid `predecessor-version` and `collection` links.
   - Verify `dataset-90/history.linkset.json` contains `item` array with 3 version entries (`1.0`, `2.0`, `2.1`).
2. **Nginx Header & Conneg Tests (`test/nginxIntegration.test.ts`)**:
   - Assert `curl -I http://localhost:8080/doi/10.14284/90` returns `303` to `/data/dataset-90-v2.1.csv` (Behavior A).
   - Assert `curl -I http://localhost:8080/id/dataset/dataset-90` returns `303` to `.ttl` on Turtle accept, carrying `latest-version` and `version-history` link headers.
   - Assert `curl -I http://localhost:8080/id/dataset/dataset-90/v2.1` returns `303` to `.ttl`, carrying `predecessor-version` and `collection` link headers.
3. **Gapped Server Contrast Tests (`test/gappedServer.test.ts`)**:
   - Assert 8080 has `rel="latest-version"` header; 8081 omits `rel="latest-version"`.
   - Assert 8080 serves history linkset; 8081 returns 404 for history linkset.
