# Radical Transparency Audit & Gap Analysis: LifeWatch Belgian North Sea Sensor Time-Series

**Entity ID:** `resource-north-sea-sensors`  
**Semantic Type:** `schema:Dataset / dcat:Dataset`  
**Upstream Source URI:** [https://lifewatch.be/data/north-sea-buoys](https://lifewatch.be/data/north-sea-buoys)  

## 1. Upstream Source State

LifeWatch portal telemetry viewer. Provides dashboard charts and streaming API without standardized LOD link headers or DCAT-3 metadata.

## 2. Identified Protocol Gaps (vs. Radical Transparency Standard)

- ❌ **No HTTP Link headers for semantic profile or external linksets.**
- ❌ **Lack of DCAT-3 / DCAT-AP distribution typing for telemetry stream.**
- ❌ **No standalone RFC 9264 linkset file.**
- ❌ **No persistent URI with content negotiation.**

## 3. Ideal Radical Transparency Enhancements Delivered in this Webserver

### HTTP Link Headers (RFC 8288 & FAIR Signposting)
```http
Link: <https://schema.org/Dataset>; rel="profile"
Link: </rdf/resource-north-sea-sensors.ttl>; rel="describedby"; type="text/turtle"
Link: </linksets/resource-north-sea-sensors.linkset.json>; rel="linkset"; type="application/linkset+json"
Link: </data/north-sea-sensors-latest.csv>; rel="item"; type="text/csv"
Link: </data/north-sea-sensors-stream.json>; rel="item"; type="application/json"
```

### RFC 9264 Standalone JSON Linkset
- **Linkset Path:** `/linksets/resource-north-sea-sensors.linkset.json`

### Data Distributions & Downloads
- 📥 **CSV: /data/north-sea-sensors-latest.csv (Buoy temperature/salinity/turbidity)**
- 📥 **JSON Stream: /data/north-sea-sensors-stream.json (Telemetry feed)**

### Machine-Readable RDF Representations
- 🐢 `/rdf/resource-north-sea-sensors.ttl`
- 🐢 `/rdf/resource-north-sea-sensors.jsonld`

### Content Negotiation (RFC 9110)
GET /resource/resource-north-sea-sensors with Accept: text/turtle returns 303 to /rdf/resource-north-sea-sensors.ttl.

