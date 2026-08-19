# Resource URL & Directory Reorganization Design

## Overview
This specification details the structural reorganization of all semantic entities, RDF serializations, RFC 9264 linksets, and Nginx content negotiation in the Radical Transparency LOD Marine Data Portal.

Resources and their conneg variants/linksets are restructured from separate top-level folders (`/rdf/`, `/linksets/`, `/datasets/`, etc.) into a cohesive canonical hierarchy under `/id/{type}/{name}`.

---

## 1. Canonical URI Scheme & Type Mapping

Each entity receives an abstract identifier URI:
`http://localhost:8080/id/{type}/{name}`

| Category / Entity Kind | Type Path Component (`{type}`) | Canonical Identifier URI | HTML Landing Page |
| :--- | :--- | :--- | :--- |
| **Dataset** | `dataset` | `/id/dataset/{name}` | `/id/dataset/{name}.html` |
| **Institute** | `institute` | `/id/institute/{name}` | `/id/institute/{name}.html` |
| **Person** | `person` | `/id/person/{name}` | `/id/person/{name}.html` |
| **Publication** | `publication` | `/id/publication/{name}` | `/id/publication/{name}.html` |
| **Project** | `project` | `/id/project/{name}` | `/id/project/{name}.html` |
| **Service (API)** | `service` | `/id/service/{name}` | `/id/service/{name}.html` (or `/api/docs/`) |
| **Profile** | `profile` | `/id/profile/{name}` | `/id/profile/{name}.html` |

The profile registry catalog overview is located at `/id/profiles` (alias `/id/profiles/index.html`).

---

## 2. Directory Layout & Co-Located Variants

All representations and metadata linksets for an entity are co-located in `dist/id/{type}/`:

```
dist/
├── id/
│   ├── dataset/
│   │   ├── arms-mbon.html          (HTML Landing)
│   │   ├── arms-mbon.ttl           (Turtle)
│   │   ├── arms-mbon.jsonld        (JSON-LD)
│   │   ├── arms-mbon.rdf           (RDF/XML)
│   │   ├── arms-mbon.linkset.json  (RFC 9264 Linkset)
│   │   ├── arms-2018.html / .ttl / .jsonld / .rdf / .linkset.json
│   │   ├── eurobis-occurrences.html / .ttl / .jsonld / .rdf / .linkset.json
│   │   └── north-sea-sensors.html / .ttl / .jsonld / .rdf / .linkset.json
│   ├── institute/
│   │   └── vliz.html / .ttl / .jsonld / .rdf / .linkset.json
│   ├── person/
│   │   ├── katrina.html / .ttl / .jsonld / .rdf / .linkset.json
│   │   ├── marc.html / .ttl / .jsonld / .rdf / .linkset.json
│   │   ├── cedric.html / .ttl / .jsonld / .rdf / .linkset.json
│   │   └── laurian.html / .ttl / .jsonld / .rdf / .linkset.json
│   ├── publication/
│   │   └── ro-crate-paper.html / .ttl / .jsonld / .rdf / .linkset.json
│   ├── project/
│   │   └── maregraph.html / .ttl / .jsonld / .rdf / .linkset.json
│   ├── service/
│   │   └── marineinfo-api.html / .ttl / .jsonld / .rdf / .linkset.json
│   └── profile/
│       ├── marine-genomic-dataset-profile.html / .ttl / .jsonld / .linkset.json
│       ├── marine-ecological-baseline-profile.html / .ttl / .jsonld / .linkset.json
│       └── ...
├── id/profiles/
│   └── index.html                  (Semantic Profiles & Composition Registry)
├── catalog/
│   ├── index.html                  (DCAT-3 Catalog Page)
│   ├── dcat.ttl
│   └── dcat.jsonld
├── data/                           (CSV, GeoJSON, RO-Crate ZIP physical payloads)
├── api/                            (OpenAPI spec, Swagger UI, JSON sample endpoints)
├── .well-known/                    (RFC 9727 api-catalog, resource-map.json)
├── index.html                      (Portal Homepage)
├── map.html                        (Metro Transit Map)
├── sitemap.xml                     (ResourceSync signmap)
├── robots.txt
├── style.css
├── nginx-coneg.conf
└── nginx-headers.conf
```

---

## 3. Content Negotiation (Nginx RFC 9110 303 Redirects)

### Dynamic Accept Mapping
`nginx-coneg.conf` maps `$http_accept` header values to file extensions:

```nginx
map $http_accept $conneg_suffix {
    default                          html;
    "~text/turtle"                   ttl;
    "~application/ld\+json"          jsonld;
    "~application/rdf\+xml"          rdf;
    "~application/linkset\+json"     linkset.json;
}
```

### Generic 303 Location Rule
In `nginx.conf`:
```nginx
# Serve content-negotiated resource URIs (RFC 9110 / 303 See Other)
location ~ ^/id/(?<res_type>[^/]+)/(?<res_name>[^/.]+)$ {
    add_header Vary Accept always;
    add_header Access-Control-Allow-Origin * always;
    return 303 $scheme://$http_host/id/$res_type/$res_name.$conneg_suffix;
}

# Profile registry route
location /id/profiles {
    try_files $uri $uri/ /id/profiles/index.html;
}

# Static typing for LOD files in /id/
location /id/ {
    types {
        text/html                     html;
        text/turtle                   ttl;
        application/ld+json           jsonld;
        application/rdf+xml           rdf;
        application/linkset+json      json;
    }
}
```

---

## 4. RFC 8288 HTTP Signposting & Interlinking

On every representation `/id/{type}/{name}.{ext}`:
- `rel="describedby"` $\rightarrow$ `/id/{type}/{name}.ttl` (text/turtle), `/id/{type}/{name}.jsonld` (application/ld+json)
- `rel="linkset"` $\rightarrow$ `/id/{type}/{name}.linkset.json` (application/linkset+json)
- `rel="canonical"` $\rightarrow$ `/id/{type}/{name}` (or external source URI if specified)
- `rel="profile"` $\rightarrow$ `/id/profile/{profileId}.html` (or schema.org / DCAT)
- `rel="collection"` $\rightarrow$ `/catalog/`
- `rel="item"` $\rightarrow$ distributions under `/data/...`

---

## 5. Generator & System Component Updates

1. **`generator/types.ts`**: Update type definition to support `service` and helper to extract `{type}` and `{name}` from resource IDs.
2. **`generator/resources.ts`**: Update `category: "api"` $\rightarrow$ `"service"`. Use consistent naming for slugs and related entity references.
3. **`generator/profiles.ts` & `generator/profileGenerator.ts`**: Output profile files into `dist/id/profile/` and catalog to `dist/id/profiles/index.html`.
4. **`generator/rdfSerializer.ts`**: Generate subject/object URIs as `${baseUrl}/id/${type}/${name}`.
5. **`generator/linksetGenerator.ts`**: Generate link anchors as `${baseUrl}/id/${type}/${name}` and co-located link targets.
6. **`generator/htmlTemplates.ts`**: Update all HTML breadcrumbs, author pills, profile tags, and conneg dropdown links to `/id/{type}/{name}`.
7. **`generator/openApiGenerator.ts` & `generator/dcatGenerator.ts`**: Update references to `/id/{type}/{name}`.
8. **`generator/metromap/`**: Update `DiscoveryCascadeEngine` and metro graph builder to trace `/id/{type}/{name}` nodes and 303 arcs to sibling variants.
9. **`generator/index.ts`**: Wire all builders to output to `dist/id/{type}/` and create `nginx-coneg.conf`, `nginx-headers.conf`, and `sitemap.xml`.
10. **`nginx.conf`**: Update routing, MIME types, and 303 redirection rules.
11. **`test/`**: Update test assertions to match the new `/id/{type}/{name}` paths.

---

## 6. Verification Plan

1. **Automated Tests**: Run `bun test` ensuring all profile, metromap, cascade, and serialization tests pass.
2. **Generator Build**: Run `bun run generate` and verify `dist/id/{type}/` directory contents (HTML, TTL, JSON-LD, RDF, linkset.json).
3. **Link & Signpost Verification**: Validate that all generated HTML files contain proper `<link rel="describedby">`, `<link rel="linkset">`, and `<link rel="profile">` referencing `/id/...`.
