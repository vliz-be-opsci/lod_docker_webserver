# Radical Transparency Audit & Gap Analysis: Research Staff & ORCID Entities

**Entity ID:** `resource-marc / resource-katrina / resource-cedric / resource-laurian / resource-joanna`  
**Semantic Type:** `schema:Person / foaf:Person`  
**Upstream Source URI:** [https://orcid.org/0000-0002-9648-6484](https://orcid.org/0000-0002-9648-6484)  

## 1. Upstream Source State

Standard ORCID researcher profile web pages. ORCID provides RDF conneg at orcid.org, but host institutions rarely link profiles via RFC 9264 linksets.

## 2. Identified Protocol Gaps (vs. Radical Transparency Standard)

- ❌ **Lack of local institutional linksets mapping researcher identifiers to authored datasets and published papers.**
- ❌ **Missing `rel="profile"` and `rel="describedby"` headers on local researcher pages.**

## 3. Ideal Radical Transparency Enhancements Delivered in this Webserver

### HTTP Link Headers (RFC 8288 & FAIR Signposting)
```http
Link: <https://schema.org/Person>; rel="profile"
Link: </rdf/:id.ttl>; rel="describedby"; type="text/turtle"
Link: </linksets/:id.linkset.json>; rel="linkset"; type="application/linkset+json"
```

### RFC 9264 Standalone JSON Linkset
- **Linkset Path:** `/linksets/resource-marc.linkset.json (and for each researcher)`

### Machine-Readable RDF Representations
- 🐢 `/rdf/resource-marc.ttl`
- 🐢 `/rdf/resource-katrina.ttl`
- 🐢 `/rdf/resource-cedric.ttl`
- 🐢 `/rdf/resource-laurian.ttl`
- 🐢 `/rdf/resource-joanna.ttl`

### Content Negotiation (RFC 9110)
GET /resource/resource-marc with Accept: text/turtle returns 303 to /rdf/resource-marc.ttl.

