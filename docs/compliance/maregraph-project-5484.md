# Radical Transparency Audit & Gap Analysis: MAREGRAPH Project (Project 5484)

**Entity ID:** `resource-maregraph`  
**Semantic Type:** `schema:Project`  
**Upstream Source URI:** [https://marineinfo.org/id/project/5484](https://marineinfo.org/id/project/5484)  

## 1. Upstream Source State

MarineInfo project summary page with description and partner list. Lacks RFC 8288 link headers, RFC 9264 linksets, and RDF conneg.

## 2. Identified Protocol Gaps (vs. Radical Transparency Standard)

- ❌ **No RFC 8288 link headers.**
- ❌ **No RFC 9264 linkset aggregating project datasets.**
- ❌ **No content negotiation.**

## 3. Ideal Radical Transparency Enhancements Delivered in this Webserver

### HTTP Link Headers (RFC 8288 & FAIR Signposting)
```http
Link: <https://schema.org/Project>; rel="profile"
Link: </id/project/maregraph.ttl>; rel="describedby"; type="text/turtle"
Link: </id/project/maregraph.linkset.json>; rel="linkset"; type="application/linkset+json"
```

### RFC 9264 Standalone JSON Linkset
- **Linkset Path:** `/id/project/maregraph.linkset.json`

### Machine-Readable RDF Representations
- 🐢 `/id/project/maregraph.ttl`
- 🐢 `/id/project/maregraph.jsonld`

### Content Negotiation (RFC 9110)
GET /id/project/maregraph returns 303.

