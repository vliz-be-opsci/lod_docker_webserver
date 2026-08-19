# Radical Transparency Audit & Gap Analysis: EurOBIS European Marine Species Taxon Occurrences

**Entity ID:** `resource-eurobis-occurrences`  
**Semantic Type:** `schema:Dataset / dcat:Dataset`  
**Upstream Source URI:** [https://www.eurobis.org/dataset/sample](https://www.eurobis.org/dataset/sample)  

## 1. Upstream Source State

EurOBIS database interface and IPT Darwin Core Archive provider. Lacks HTTP Link headers, RFC 9264 linksets, and GeoJSON distributions.

## 2. Identified Protocol Gaps (vs. Radical Transparency Standard)

- ❌ **No RFC 8288 link headers declaring profiles or descriptions.**
- ❌ **No RFC 9264 linkset mapping species occurrences to spatial points.**
- ❌ **No direct GeoJSON distribution for lightweight web mapping.**

## 3. Ideal Radical Transparency Enhancements Delivered in this Webserver

### HTTP Link Headers (RFC 8288 & FAIR Signposting)
```http
Link: <https://schema.org/Dataset>; rel="profile"
Link: </id/dataset/eurobis-occurrences.ttl>; rel="describedby"; type="text/turtle"
Link: </id/dataset/eurobis-occurrences.linkset.json>; rel="linkset"; type="application/linkset+json"
Link: </data/eurobis-occurrences.geojson>; rel="item"; type="application/geo+json"
Link: </data/eurobis-dwca-sample.zip>; rel="item"; type="application/zip"
```

### RFC 9264 Standalone JSON Linkset
- **Linkset Path:** `/id/dataset/eurobis-occurrences.linkset.json`

### Data Distributions & Downloads
- 📥 **GeoJSON: /data/eurobis-occurrences.geojson (Species coordinates)**
- 📥 **DwC-A ZIP: /data/eurobis-dwca-sample.zip (Standard Darwin Core Archive)**

### Machine-Readable RDF Representations
- 🐢 `/id/dataset/eurobis-occurrences.ttl`
- 🐢 `/id/dataset/eurobis-occurrences.jsonld`

### Content Negotiation (RFC 9110)
GET /id/dataset/eurobis-occurrences with Accept: text/turtle returns 303.

