# Design Document: RT-P09 Version Decoupling & Release Navigation

**Date:** 2026-09-04  
**Topic:** EOSC Radical Transparency Linkset Usage Pattern 09 (Release Linking & Version Navigation)  
**Status:** Approved by User  

---

## 1. Executive Summary & Problem Context

In the initial implementation of **RT-P09 (Release Linking)**, dataset releases, physical CSV distributions, metadata records, and semantic profiles shared identical version numbers by coincidence (e.g. `v1.0`, `v2.0`, `v2.1`).

In real-world Linked Open Data ecosystems:
1. **Independent Lifecycles**: A dataset release entity, its underlying raw CSV data payload, its metadata description record, and the semantic profiles it conforms to evolve on completely separate release cycles.
2. **Profile Conformance Separation**:
   - The **Dataset entity** conforms to a domain dataset profile (e.g. `dcat-dataset-profile` with SemVer `1.0.0`, `2.0.0`, `3.0.0`).
   - The **Metadata record** (`.ttl`) conforms to an archival/packaging profile (e.g. `ro-crate-package-profile` with SemVer `1.0.0`, `1.1.0`).
3. **Machine-Actionable Version History**:
   - The `rel="version-history"` link points directly to a machine-readable RFC 9264 linkset (`/id/dataset/dataset-90/history.linkset.json`) with `type="application/linkset+json"`, rather than relying on an HTML web page.
4. **Linkset-Driven Navigation**:
   - The HTTP response headers remain lean, advertising the primary linkset via `rel="linkset"`. The detailed lifecycle relations (`latest-version`, `predecessor-version`, `successor-version`, `version-history`) are declared inside the respective linksets.

---

## 2. Resource Hierarchy & Decoupled Version Taxonomy

### 2.1. Dataset 90 Lifecycle & Entities

| Entity Role | Canonical URI | Metadata Record (`describedby`) | Data Payload (`item`) | Profile Conformance |
| :--- | :--- | :--- | :--- | :--- |
| **Conceptual Dataset** | `/id/dataset/dataset-90` | `/id/dataset/dataset-90.ttl` | — | `/id/profile/dcat-dataset-profile` |
| **Release v1.0** | `/id/dataset/dataset-90/v1.0` | `/id/dataset/dataset-90/v1.0.ttl` | `/data/dataset-90-v1.0.csv` | `/id/profile/dcat-dataset-profile/1.0.0` |
| **Release v2.0** | `/id/dataset/dataset-90/v2.0` | `/id/dataset/dataset-90/v2.0.ttl` | `/data/dataset-90-v2.0.csv` | `/id/profile/dcat-dataset-profile/2.0.0` |
| **Release v2.1** (Latest) | `/id/dataset/dataset-90/v2.1` | `/id/dataset/dataset-90/v2.1.ttl` | `/data/dataset-90-v2.1.csv` | `/id/profile/dcat-dataset-profile/3.0.0` |

### 2.2. Metadata Records & Packaging Profile Conformance

Each metadata record (`.ttl`) describes the dataset release and declares conformance to its packaging profile:

| Metadata Record URI | Described Dataset Release | Packaging Profile Conformance |
| :--- | :--- | :--- |
| `/id/dataset/dataset-90/v1.0.ttl` | `/id/dataset/dataset-90/v1.0` | `/id/profile/ro-crate-package-profile/1.0.0` |
| `/id/dataset/dataset-90/v2.0.ttl` | `/id/dataset/dataset-90/v2.0` | `/id/profile/ro-crate-package-profile/1.0.0` |
| `/id/dataset/dataset-90/v2.1.ttl` | `/id/dataset/dataset-90/v2.1` | `/id/profile/ro-crate-package-profile/1.1.0` |

### 2.3. Semantic Profile Families (SemVer without `'v'`)

Profiles adopt standard Semantic Versioning (`MAJOR.MINOR.PATCH`):

#### A. Domain Dataset Profile (`dcat-dataset-profile`)
* **Conceptual Profile**: `/id/profile/dcat-dataset-profile`
* **Releases**: `/id/profile/dcat-dataset-profile/1.0.0`, `/2.0.0`, `/3.0.0`
* **History Linkset**: `/id/profile/dcat-dataset-profile/history.linkset.json`

#### B. Packaging / Metadata Profile (`ro-crate-package-profile`)
* **Conceptual Profile**: `/id/profile/ro-crate-package-profile`
* **Releases**: `/id/profile/ro-crate-package-profile/1.0.0`, `/1.1.0`
* **History Linkset**: `/id/profile/ro-crate-package-profile/history.linkset.json`

---

## 3. Linkset Architectures & Schemas

### 3.1. Conceptual Dataset Linkset (`/id/dataset/dataset-90.linkset.json`)

```json
{
  "linkset": [
    {
      "anchor": "http://localhost:8080/id/dataset/dataset-90",
      "type": [
        { "href": "https://schema.org/Dataset" }
      ],
      "alternate": [
        { "href": "http://localhost:8080/id/dataset/dataset-90.ttl", "type": "text/turtle; charset=utf-8" },
        { "href": "http://localhost:8080/id/dataset/dataset-90.jsonld", "type": "application/ld+json" },
        { "href": "http://localhost:8080/id/dataset/dataset-90.html", "type": "text/html; charset=utf-8" },
        { "href": "http://localhost:8080/id/dataset/dataset-90.rdf", "type": "application/rdf+xml" }
      ],
      "cite-as": [
        { "href": "http://localhost:8080/doi/10.14284/90" }
      ],
      "latest-version": [
        { "href": "http://localhost:8080/id/dataset/dataset-90/v2.1" }
      ],
      "version-history": [
        {
          "href": "http://localhost:8080/id/dataset/dataset-90/history.linkset.json",
          "type": "application/linkset+json"
        }
      ],
      "profile": [
        { "href": "http://localhost:8080/id/profile/dcat-dataset-profile" }
      ]
    },
    {
      "anchor": "http://localhost:8080/id/dataset/dataset-90.ttl",
      "self": [
        { "href": "http://localhost:8080/id/dataset/dataset-90" }
      ],
      "cite-as": [
        { "href": "http://localhost:8080/doi/10.14284/90" }
      ]
    },
    {
      "anchor": "http://localhost:8080/id/dataset/dataset-90.html",
      "self": [
        { "href": "http://localhost:8080/id/dataset/dataset-90" }
      ]
    },
    {
      "anchor": "http://localhost:8080/id/dataset/dataset-90.jsonld",
      "self": [
        { "href": "http://localhost:8080/id/dataset/dataset-90" }
      ]
    },
    {
      "anchor": "http://localhost:8080/id/dataset/dataset-90.rdf",
      "self": [
        { "href": "http://localhost:8080/id/dataset/dataset-90" }
      ]
    }
  ]
}
```

### 3.2. Dataset Release Linkset (e.g. `/id/dataset/dataset-90/v2.1.linkset.json`)

```json
{
  "linkset": [
    {
      "anchor": "http://localhost:8080/id/dataset/dataset-90/v2.1",
      "type": [
        { "href": "https://schema.org/Dataset" }
      ],
      "alternate": [
        { "href": "http://localhost:8080/id/dataset/dataset-90/v2.1.ttl", "type": "text/turtle; charset=utf-8" },
        { "href": "http://localhost:8080/id/dataset/dataset-90/v2.1.jsonld", "type": "application/ld+json" },
        { "href": "http://localhost:8080/id/dataset/dataset-90/v2.1.html", "type": "text/html; charset=utf-8" },
        { "href": "http://localhost:8080/id/dataset/dataset-90/v2.1.rdf", "type": "application/rdf+xml" }
      ],
      "cite-as": [
        { "href": "http://localhost:8080/doi/10.14284/90.v2.1" }
      ],
      "item": [
        {
          "href": "http://localhost:8080/data/dataset-90-v2.1.csv",
          "type": "text/csv",
          "title": "Macrobenthos Abundance Matrix v2.1 (CSV)"
        }
      ],
      "profile": [
        { "href": "http://localhost:8080/id/profile/dcat-dataset-profile/3.0.0" }
      ],
      "predecessor-version": [
        { "href": "http://localhost:8080/id/dataset/dataset-90/v2.0" }
      ],
      "version-history": [
        {
          "href": "http://localhost:8080/id/dataset/dataset-90/history.linkset.json",
          "type": "application/linkset+json"
        }
      ]
    },
    {
      "anchor": "http://localhost:8080/id/dataset/dataset-90/v2.1.ttl",
      "self": [
        { "href": "http://localhost:8080/id/dataset/dataset-90/v2.1" }
      ],
      "profile": [
        { "href": "http://localhost:8080/id/profile/ro-crate-package-profile/1.1.0" }
      ],
      "cite-as": [
        { "href": "http://localhost:8080/doi/10.14284/90.v2.1" }
      ]
    },
    {
      "anchor": "http://localhost:8080/id/dataset/dataset-90/v2.1.html",
      "self": [
        { "href": "http://localhost:8080/id/dataset/dataset-90/v2.1" }
      ]
    },
    {
      "anchor": "http://localhost:8080/id/dataset/dataset-90/v2.1.jsonld",
      "self": [
        { "href": "http://localhost:8080/id/dataset/dataset-90/v2.1" }
      ]
    },
    {
      "anchor": "http://localhost:8080/id/dataset/dataset-90/v2.1.rdf",
      "self": [
        { "href": "http://localhost:8080/id/dataset/dataset-90/v2.1" }
      ]
    }
  ]
}
```

### 3.3. History Linkset (`/id/dataset/dataset-90/history.linkset.json`)

```json
{
  "linkset": [
    {
      "anchor": "http://localhost:8080/id/dataset/dataset-90/history.linkset.json",
      "describes": [
        { "href": "http://localhost:8080/id/dataset/dataset-90" }
      ],
      "item": [
        {
          "href": "http://localhost:8080/id/dataset/dataset-90/v1.0",
          "version": "1.0",
          "release-date": "2023-06-02",
          "title": "Macrobenthos Release v1.0"
        },
        {
          "href": "http://localhost:8080/id/dataset/dataset-90/v2.0",
          "version": "2.0",
          "release-date": "2025-02-06",
          "title": "Macrobenthos Release v2.0"
        },
        {
          "href": "http://localhost:8080/id/dataset/dataset-90/v2.1",
          "version": "2.1",
          "release-date": "2026-08-26",
          "title": "Macrobenthos Release v2.1"
        }
      ]
    }
  ]
}
```

---

## 4. HTTP Headers & Nginx Configuration

### 4.1. Lean HTTP Signposting
The HTTP responses for conceptual and versioned entities signpost their primary linkset and representations:

* **Conceptual Entity (`/id/dataset/dataset-90`)**:
  ```http
  Link: </id/dataset/dataset-90.linkset.json>; rel="linkset"; type="application/linkset+json",
        </id/dataset/dataset-90.ttl>; rel="describedby"; type="text/turtle"
  ```
* **Release Entity (`/id/dataset/dataset-90/v2.1`)**:
  ```http
  Link: </id/dataset/dataset-90/v2.1.linkset.json>; rel="linkset"; type="application/linkset+json",
        </id/dataset/dataset-90/v2.1.ttl>; rel="describedby"; type="text/turtle"
  ```
* **Distribution Payload (`/data/dataset-90-v2.1.csv`)**:
  ```http
  Link: </id/dataset/dataset-90/v2.1>; rel="cite-as",
        </id/dataset/dataset-90/v2.1.ttl>; rel="describedby"; type="text/turtle"
  ```

### 4.2. MIME Type Support
Nginx config ensures static linksets are delivered as `application/linkset+json`:
```nginx
types {
    application/linkset+json linkset.json;
}
```

---

## 5. Generator Architecture Changes

1. **`generator/resources.ts`**:
   - Refactor dataset releases `resource-dataset-90-v1.0`, `v2.0`, `v2.1` to refer to decoupled profiles:
     - `v1.0`: `profileId: "dcat-dataset-profile-1.0.0"`, `metadataProfileId: "ro-crate-package-profile-1.0.0"`
     - `v2.0`: `profileId: "dcat-dataset-profile-2.0.0"`, `metadataProfileId: "ro-crate-package-profile-1.0.0"`
     - `v2.1`: `profileId: "dcat-dataset-profile-3.0.0"`, `metadataProfileId: "ro-crate-package-profile-1.1.0"`
   - Set `historyUri: "/id/dataset/dataset-90/history.linkset.json"`.

2. **`generator/profiles.ts` & `generator/profileGenerator.ts`**:
   - Define versioned profiles with pure SemVer without `'v'` prefix:
     - `dcat-dataset-profile`: `1.0.0`, `2.0.0`, `3.0.0`
     - `ro-crate-package-profile`: `1.0.0`, `1.1.0`
   - Generate history linkset for profiles as `/id/profile/{name}/history.linkset.json`.

3. **`generator/linksetGenerator.ts`**:
   - Update `version-history` link generation to target `.../history.linkset.json` with `type: "application/linkset+json"`.
   - Remove deprecated `collection` link from standalone releases.
   - Inject `profile` link on the metadata record anchor (`.ttl`) using `metadataProfileId`.

4. **Metromap Engine (`DiscoveryCascadeEngine.ts`)**:
   - Update version cascade rules to track `version-history` pointing to `.linkset.json` and decoupled profile nodes.

---

## 6. Verification Plan

### 6.1. Unit & Integration Tests (`bun test`)
* **`test/linksetGenerator.test.ts`**:
  - Verify conceptual dataset linkset has `latest-version` and `version-history` with `type="application/linkset+json"`.
  - Verify release linksets contain `predecessor-version`, `successor-version`, `item` (CSV), `profile` (DCAT SemVer), and `.ttl` anchor has packaging profile.
  - Verify history linkset lists all releases with their dates and versions.
* **`test/resources.test.ts`**:
  - Verify all resources validate against decoupled profile IDs.
* **`test/nginxIntegration.test.ts`**:
  - Verify Nginx configuration files reflect the updated history linkset and headers.

### 6.2. Docker Verification
* Rebuild and restart docker container.
* Execute curl checks against port 8080:
  - Header inspection of `/id/dataset/dataset-90`.
  - Content inspection of `/id/dataset/dataset-90.linkset.json`.
  - Content inspection of `/id/dataset/dataset-90/history.linkset.json`.
  - Content inspection of `/id/dataset/dataset-90/v2.1.linkset.json`.
