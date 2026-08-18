# Radical Transparency Audit & Gap Analysis: Flanders Marine Institute (Organization 36)

**Entity ID:** `resource-vliz`  
**Semantic Type:** `schema:Organization`  
**Upstream Source URI:** [https://marineinfo.org/id/institute/36](https://marineinfo.org/id/institute/36)  

## 1. Upstream Source State

MarineInfo institute record with institutional address and staff list. Lacks RFC 8288 link headers, RFC 9264 linksets, and direct conneg to RDF.

## 2. Identified Protocol Gaps (vs. Radical Transparency Standard)

- ❌ **No RFC 8288 link headers on HTTP responses.**
- ❌ **No external linkset linking institute to its published datasets and staff members.**
- ❌ **No 303 content negotiation on persistent URI.**

## 3. Ideal Radical Transparency Enhancements Delivered in this Webserver

### HTTP Link Headers (RFC 8288 & FAIR Signposting)
```http
Link: <https://schema.org/Organization>; rel="profile"
Link: </rdf/resource-vliz.ttl>; rel="describedby"; type="text/turtle"
Link: </linksets/resource-vliz.linkset.json>; rel="linkset"; type="application/linkset+json"
```

### RFC 9264 Standalone JSON Linkset
- **Linkset Path:** `/linksets/resource-vliz.linkset.json`

### Machine-Readable RDF Representations
- 🐢 `/rdf/resource-vliz.ttl`
- 🐢 `/rdf/resource-vliz.jsonld`
- 🐢 `/rdf/resource-vliz.rdf`

### Content Negotiation (RFC 9110)
GET /resource/resource-vliz with Accept: text/turtle returns 303 to /rdf/resource-vliz.ttl.

