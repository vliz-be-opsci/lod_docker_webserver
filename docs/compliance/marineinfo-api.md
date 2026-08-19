# Radical Transparency Audit & Gap Analysis: MarineInfo Subsetting API

**Entity ID:** `resource-marineinfo-api`  
**Semantic Type:** `dcat:DataService / schema:API`  
**Upstream Source URI:** [https://marineinfo.org/api](https://marineinfo.org/api)  

## 1. Upstream Source State

MarineInfo web API without RFC 9727 API catalog discovery or RFC 9264 linksets.

## 2. Identified Protocol Gaps (vs. Radical Transparency Standard)

- ❌ **No RFC 9727 `/.well-known/api-catalog` discovery file.**
- ❌ **No `Link: </.well-known/api-catalog>; rel="api-catalog"` headers on responses.**
- ❌ **OpenAPI 3.0 specification not discoverable via DCAT-3 `dcat:endpointDescription`.**

## 3. Ideal Radical Transparency Enhancements Delivered in this Webserver

### HTTP Link Headers (RFC 8288 & FAIR Signposting)
```http
Link: <https://www.rfc-editor.org/info/rfc9727>; rel="profile"
Link: </.well-known/api-catalog>; rel="api-catalog"
```

### RFC 9264 Standalone JSON Linkset
- **Linkset Path:** `/.well-known/api-catalog`

### Data Distributions & Downloads
- 📥 **OpenAPI: /api/openapi.json (OpenAPI 3.0 specification)**
- 📥 **Swagger UI: /api/docs/ (Interactive explorer)**

### Machine-Readable RDF Representations
- 🐢 `/id/service/marineinfo-api.ttl`
- 🐢 `/id/service/marineinfo-api.jsonld`

### Content Negotiation (RFC 9110)
Endpoint discoverable via RFC 9727 and DCAT-3.

