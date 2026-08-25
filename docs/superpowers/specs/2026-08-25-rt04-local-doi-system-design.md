# Design Document: RT-04 Local DOI Resolution System & Direct Payload Signposting

**Date:** 2026-08-25  
**Topic:** RT-04 (No Landing Page Solution) Local DOI Resolution & Signposted Payloads  
**Status:** Approved by User  

---

## 1. Philosophical & Empirical Motivation (RT-04 vs. Conventional PIDs)

In standard Web / Persistent Identifier (PID) architecture:
* **The Traditional Dogma:** Persistent identifiers (like CrossRef or DataCite DOIs) are configured to resolve (via HTTP 302/303 redirects) to an **intermediate HTML landing page** on a publisher's portal.
* **The Consequences:**
  1. **Machine Friction ("The Extra Hop"):** Machine agents querying a DOI cannot directly receive the publication PDF or dataset payload; they must fetch and scrape HTML, heuristically locating download links.
  2. **The "Broken Chain" on Direct Access:** If an agent or human reaches the payload file directly (e.g. `/data/ro-crate-paper.pdf`), the PID context, authorship, licensing, and semantic graph are severed because raw downloads typically lack HTTP link headers.
  3. **Mandatory UI Chokepoints:** Repositories are pressured to construct heavy HTML landing pages for every entity, entangling conceptual identity with human-oriented presentation.

### The RT-04 ("No Landing Page Solution") Paradigm
RT-04 reframes the digital artifact relationship:
1. **Payload as First-Class Resolution Target:** When a client dereferences a DOI (e.g., `http://localhost:8080/doi/10.3897/biss.6.94630`), the server directly redirects (`303 See Other`) to the **actual payload file** (e.g., `/data/ro-crate-paper.pdf` or `/data/arms-mbon-rocrate.zip`).
2. **Payload HTTP Signposting (RFC 8288):** The payload response itself delivers the semantic affordances via HTTP response headers:
   * `Link: <http://localhost:8080/doi/10.3897/biss.6.94630>; rel="cite-as"` *(Identity persistence / citation anchor)*
   * `Link: <http://localhost:8080/id/publication/ro-crate-paper.ttl>; rel="describedby"; type="text/turtle"` *(Semantic description)*
   * `Link: <http://localhost:8080/id/publication/ro-crate-paper.jsonld>; rel="describedby"; type="application/ld+json"`
   * `Link: <http://localhost:8080/id/publication/ro-crate-paper.html>; rel="describedby"; type="text/html"` *(Optional human-readable view)*
   * `Link: <http://localhost:8080/id/publication/ro-crate-paper.linkset.json>; rel="linkset"; type="application/linkset+json"` *(RFC 9264 linkset)*
3. **Role of RT-03 (Content Negotiation):** Canonical resource URIs (`/id/...`) continue to serve as the conneg entry points for negotiating between HTML views and RDF serializations (`.ttl`, `.jsonld`, `.rdf`), directly accessible via the `rel="describedby"` links on the payload.

---

## 2. System Architecture & Routing

```
                                  Client Request:
                      GET /doi/10.3897/biss.6.94630
                                        │
                                        ▼
                         ┌─────────────────────────────┐
                         │   Nginx Local DOI Router    │
                         │      (Port 8080 / 8081)     │
                         └──────────────┬──────────────┘
                                        │
                                        ▼ (Direct 303 Redirect)
                         Location: /data/ro-crate-paper.pdf
                                        │
                                        ▼
                         ┌─────────────────────────────┐
                         │  Static Payload File Server │
                         └──────────────┬──────────────┘
                                        │
                                        ▼
                          HTTP 200 (PDF / CSV / ZIP)
                          + RFC 8288 Link Headers:
                            • rel="cite-as" ➔ /doi/...
                            • rel="describedby" ➔ /id/...ttl, /id/...html
                            • rel="linkset" ➔ /id/...linkset.json
```

---

## 3. Detailed Component Specifications

### 3.1. DOI Mapping Registry (`generator/resources.ts` & `generator/index.ts`)
The generator inspects all registered entities and constructs the DOI resolution table:

| Entity ID | Local DOI URI Path | Primary Payload URI | Canonical Resource ID |
| :--- | :--- | :--- | :--- |
| `resource-ro-crate-paper` | `/doi/10.3897/biss.6.94630` | `/data/ro-crate-paper.pdf` | `/id/publication/ro-crate-paper` |
| `resource-arms-mbon` | `/doi/10.14284/578` | `/data/arms-mbon-rocrate.zip` | `/id/dataset/arms-mbon` |
| `resource-arms-2018` | `/doi/10.14284/412` | `/data/arms-2018-samples.csv` | `/id/dataset/arms-2018` |

### 3.2. Nginx Configuration (`nginx.conf` & `nginx-coneg.conf`)
1. **Dynamic Map in `nginx-coneg.conf`:**
```nginx
map $uri $doi_payload_uri {
    default "";
    "/doi/10.3897/biss.6.94630"  "/data/ro-crate-paper.pdf";
    "/doi/10.14284/578"          "/data/arms-mbon-rocrate.zip";
    "/doi/10.14284/412"          "/data/arms-2018-samples.csv";
}
```

2. **Routing Block in `nginx.conf` (Port 8080):**
```nginx
location ~ ^/doi/ {
    if ($doi_payload_uri = "") {
        return 404;
    }
    add_header Access-Control-Allow-Origin * always;
    add_header Access-Control-Expose-Headers "Location, Link" always;
    return 303 $scheme://$http_host$doi_payload_uri;
}
```

### 3.3. HTTP Link Header Signposting on Payloads (`dist/nginx-headers.conf`)
In `generator/index.ts`, generate signposting headers for all physical data payloads:

* **`/data/ro-crate-paper.pdf`:**
  * `Link: <http://localhost:8080/doi/10.3897/biss.6.94630>; rel="cite-as"`
  * `Link: <http://localhost:8080/id/publication/ro-crate-paper.ttl>; rel="describedby"; type="text/turtle"`
  * `Link: <http://localhost:8080/id/publication/ro-crate-paper.jsonld>; rel="describedby"; type="application/ld+json"`
  * `Link: <http://localhost:8080/id/publication/ro-crate-paper.html>; rel="describedby"; type="text/html"`
  * `Link: <http://localhost:8080/id/publication/ro-crate-paper.linkset.json>; rel="linkset"; type="application/linkset+json"`

* **`/data/arms-mbon-rocrate.zip` & `/data/arms-mbon-18s.csv`:**
  * `Link: <http://localhost:8080/doi/10.14284/578>; rel="cite-as"`
  * `Link: <http://localhost:8080/id/profile/marine-genomic-dataset-profile>; rel="profile"`
  * `Link: <http://localhost:8080/id/dataset/arms-mbon.ttl>; rel="describedby"; type="text/turtle"`
  * `Link: <http://localhost:8080/id/dataset/arms-mbon.html>; rel="describedby"; type="text/html"`
  * `Link: <http://localhost:8080/id/dataset/arms-mbon.linkset.json>; rel="linkset"; type="application/linkset+json"`

* **`/data/arms-2018-samples.csv`:**
  * `Link: <http://localhost:8080/doi/10.14284/412>; rel="cite-as"`
  * `Link: <http://localhost:8080/id/dataset/arms-2018.ttl>; rel="describedby"; type="text/turtle"`
  * `Link: <http://localhost:8080/id/dataset/arms-2018.html>; rel="describedby"; type="text/html"`
  * `Link: <http://localhost:8080/id/dataset/arms-2018.linkset.json>; rel="linkset"; type="application/linkset+json"`

### 3.4. Gapped Server Simulation (Port 8081)
On Port 8081 (`nginx-gapped.conf` & `gappedGenerator.ts`), demonstrate the legacy anti-pattern:
1. **DOI Redirects to HTML Silo:**
   `GET http://localhost:8081/doi/10.3897/biss.6.94630` ➔ `303 See Other` to `/id/publication/ro-crate-paper.html` (forcing human landing page chokepoint).
2. **Payload Missing `cite-as`:**
   `GET http://localhost:8081/data/ro-crate-paper.pdf` ➔ Returns `200 OK` with **no `cite-as` header** (broken chain).

---

## 4. Verification & Testing Plan

### Automated Tests (`bun test`)
1. **DOI Resolution Tests (`test/nginxIntegration.test.ts`):**
   * Assert `nginx-coneg.conf` contains `$doi_payload_uri` mappings for all DOIs.
   * Verify generated payload headers in `nginx-headers.conf` contain `rel="cite-as"` pointing to the local `/doi/...` URI.
   * Verify PDF payload headers include both `rel="cite-as"` and `rel="describedby"` (Turtle & HTML).
2. **Gapped Server Contrast Tests (`test/gappedServer.test.ts`):**
   * Assert Gapped DOI redirects to the HTML landing page instead of the payload file.
   * Assert Gapped PDF payload omits `rel="cite-as"`.

### Live Verification with `curl`
* `curl -I http://localhost:8080/doi/10.3897/biss.6.94630` ➔ Expect `303 See Other`, `Location: http://localhost:8080/data/ro-crate-paper.pdf`
* `curl -I http://localhost:8080/data/ro-crate-paper.pdf` ➔ Expect `200 OK`, `Link: <.../doi/10.3897/biss.6.94630>; rel="cite-as"`
* `curl -I http://localhost:8081/doi/10.3897/biss.6.94630` ➔ Expect `303 See Other`, `Location: http://localhost:8081/id/publication/ro-crate-paper.html`
