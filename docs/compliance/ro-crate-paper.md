# Radical Transparency Audit & Gap Analysis: RO-Crate Biodiversity Observation Publishing Paper

**Entity ID:** `resource-ro-crate-paper`  
**Semantic Type:** `schema:ScholarlyArticle`  
**Upstream Source URI:** [https://doi.org/10.3897/biss.6.94630](https://doi.org/10.3897/biss.6.94630)  

## 1. Upstream Source State

Pensoft BISS journal article page with DOI redirection and HTML abstract. Does not expose RFC 9264 linkset pointing back to the described dataset or authors.

## 2. Identified Protocol Gaps (vs. Radical Transparency Standard)

- ❌ **No RFC 8288 link headers for profile or external linksets.**
- ❌ **No RFC 9264 linkset linking article to underlying dataset (ARMS-MBON) and author ORCIDs.**
- ❌ **No content negotiation on persistent resource URI.**

## 3. Ideal Radical Transparency Enhancements Delivered in this Webserver

### HTTP Link Headers (RFC 8288 & FAIR Signposting)
```http
Link: <https://schema.org/ScholarlyArticle>; rel="profile"
Link: </id/publication/ro-crate-paper.ttl>; rel="describedby"; type="text/turtle"
Link: </id/publication/ro-crate-paper.linkset.json>; rel="linkset"; type="application/linkset+json"
Link: </data/ro-crate-paper.pdf>; rel="alternate"; type="application/pdf"
```

### RFC 9264 Standalone JSON Linkset
- **Linkset Path:** `/id/publication/ro-crate-paper.linkset.json`

### Data Distributions & Downloads
- 📥 **PDF: /data/ro-crate-paper.pdf (Full open access article)**

### Machine-Readable RDF Representations
- 🐢 `/id/publication/ro-crate-paper.ttl`
- 🐢 `/id/publication/ro-crate-paper.jsonld`

### Content Negotiation (RFC 9110)
GET /id/publication/ro-crate-paper returns 303.

