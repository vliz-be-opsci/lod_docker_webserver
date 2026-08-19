# Radical Transparency Audit & Gap Analysis: ARMS-MBON Metagenomic 18S Observations (Dataset 8617)

**Entity ID:** `resource-arms-mbon`  
**Semantic Type:** `schema:Dataset / dcat:Dataset`  
**Upstream Source URI:** [https://marineinfo.org/id/dataset/8617](https://marineinfo.org/id/dataset/8617)  

## 1. Upstream Source State

MarineInfo standard dataset landing page. Provides HTML summary with schema.org Dataset JSON-LD embedded in `<script>`. Lacks RFC 8288 HTTP Link headers, external linksets, and multi-format content negotiation.

## 2. Identified Protocol Gaps (vs. Radical Transparency Standard)

- ❌ **No RFC 8288 `Link:` headers on HTTP responses (missing `rel="profile"`, `rel="describedby"`, `rel="linkset"`, `rel="item"`).**
- ❌ **No RFC 9264 standalone JSON Linkset (`application/linkset+json`).**
- ❌ **No direct HTTP 303 Content Negotiation for Turtle, JSON-LD, or RDF/XML representations on persistent URI.**
- ❌ **Data files are linked as generic download URLs without machine-actionable `rel="item"` or DCAT-3 distribution typing.**
- ❌ **Lack of RO-Crate package with full provenance graph.**

## 3. Ideal Radical Transparency Enhancements Delivered in this Webserver

### HTTP Link Headers (RFC 8288 & FAIR Signposting)
```http
Link: <https://schema.org/Dataset>; rel="profile"
Link: <https://www.w3.org/TR/vocab-dcat/>; rel="profile"
Link: </id/profile/marine-genomic-dataset-profile.html>; rel="profile"
Link: </id/dataset/arms-mbon.ttl>; rel="describedby"; type="text/turtle"
Link: </id/dataset/arms-mbon.jsonld>; rel="describedby"; type="application/ld+json"
Link: </id/dataset/arms-mbon.rdf>; rel="describedby"; type="application/rdf+xml"
Link: </id/dataset/arms-mbon.linkset.json>; rel="linkset"; type="application/linkset+json"
Link: </data/arms-mbon-18s.csv>; rel="item"; type="text/csv"
Link: </data/arms-mbon-stations.geojson>; rel="item"; type="application/geo+json"
Link: </data/arms-mbon-rocrate.zip>; rel="item"; type="application/zip"; profile="https://w3id.org/ro/crate"
```

### RFC 9264 Standalone JSON Linkset
- **Linkset Path:** `/id/dataset/arms-mbon.linkset.json`

### Data Distributions & Downloads
- 📥 **CSV: /data/arms-mbon-18s.csv (Metabarcoding read counts)**
- 📥 **GeoJSON: /data/arms-mbon-stations.geojson (North Sea monitoring reef stations)**
- 📥 **RO-Crate: /data/arms-mbon-rocrate.zip (Complete RO-Crate metadata + data)**

### Machine-Readable RDF Representations
- 🐢 `/id/dataset/arms-mbon.ttl`
- 🐢 `/id/dataset/arms-mbon.jsonld`
- 🐢 `/id/dataset/arms-mbon.rdf`

### Content Negotiation (RFC 9110)
GET /id/dataset/arms-mbon with Accept: text/turtle returns 303 to /id/dataset/arms-mbon.ttl; Accept: text/html returns 303 to /id/dataset/arms-mbon.html.

