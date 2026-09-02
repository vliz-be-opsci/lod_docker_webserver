# Radical Transparency Audit & Gap Analysis: Macrobenthos of the Belgian Part of the North Sea (Dataset 90)

**Entity ID:** `resource-dataset-90`  
**Semantic Type:** `schema:Dataset / dcat:Dataset (Series & Releases)`  
**Upstream Source URI:** [https://marineinfo.org/id/dataset/90](https://marineinfo.org/id/dataset/90)  

## 1. Upstream Source State

MarineInfo standard dataset landing page. Only displays current state without RFC 5829 lifecycle navigation, Release DOIs, or RFC 9264 version history linksets.

## 2. Identified Protocol Gaps (vs. Radical Transparency Standard)

- ❌ **No RFC 5829 lifecycle links (`rel="latest-version"`, `rel="predecessor-version"`, `rel="successor-version"`, `rel="version-history"`).**
- ❌ **No distinction between evolving conceptual series PID (`10.14284/90`) and immutable snapshot release PIDs (`10.14284/90.v1.0`, `10.14284/90.v2.0`, `10.14284/90.v2.1`).**
- ❌ **No standalone version history linkset (`/id/dataset/dataset-90/history.linkset.json`).**
- ❌ **Direct DOI resolution on series PID does not signpost both Series DOI and Release DOI simultaneously.**

## 3. Ideal Radical Transparency Enhancements Delivered in this Webserver

### HTTP Link Headers (RFC 8288 & FAIR Signposting)
```http
Link: </id/dataset/dataset-90/v2.1>; rel="latest-version"
Link: </id/dataset/dataset-90/history>; rel="version-history"
Link: </id/dataset/dataset-90/history.linkset.json>; rel="linkset"; type="application/linkset+json"
Link: </doi/10.14284/90>; rel="collection"
Link: </doi/10.14284/90.v2.1>; rel="cite-as"
```

### RFC 9264 Standalone JSON Linkset
- **Linkset Path:** `/id/dataset/dataset-90.linkset.json + /id/dataset/dataset-90/history.linkset.json`

### Data Distributions & Downloads
- 📥 **CSV v1.0: /data/dataset-90-v1.0.csv (Baseline snapshot)**
- 📥 **CSV v2.0: /data/dataset-90-v2.0.csv (Harmonized snapshot)**
- 📥 **CSV v2.1: /data/dataset-90-v2.1.csv (Authoritative latest snapshot)**

### Machine-Readable RDF Representations
- 🐢 `/id/dataset/dataset-90.ttl`
- 🐢 `/id/dataset/dataset-90/v1.0.ttl`
- 🐢 `/id/dataset/dataset-90/v2.0.ttl`
- 🐢 `/id/dataset/dataset-90/v2.1.ttl`

### Content Negotiation (RFC 9110)
GET /doi/10.14284/90 returns 303 to /data/dataset-90-v2.1.csv (Behavior A) with rel='cite-as' and rel='collection' signposts.

