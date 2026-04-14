# WRX Strategy Test Resources

This directory contains test resources for all seven discovery strategies implemented
by [`wrx.js`](https://github.com/cedricdcc/wrx) — a zero-dependency Bun/TypeScript
module that extracts RDF metadata from any URI using a **cascading strategy** (each
step is tried in priority order; the first success is returned immediately).

Refer to the full
[wrx DOCUMENTATION.md](https://github.com/cedricdcc/wrx/blob/main/DOCUMENTATION.md)
for the detailed flowcharts and design decisions behind each strategy.

---

## Strategy Overview

| Priority | Strategy | `source` value | Landing URL |
|----------|----------|----------------|-------------|
| 1 | Content Negotiation | `content-negotiation` | `/wrx/s1/resource` |
| 2 | HTTP Link Header — DescribedBy/Profile | `signposting-link-header` | `/wrx/s2/resource` |
| 3 | HTTP Link Header — Linkset | `linkset` | `/wrx/s3/resource` |
| 4 | HTML DescribedBy Link Tag | `signposting-html-link` | `/wrx/s4/resource` |
| 5 | HTML Linkset Link Tag | `linkset` | `/wrx/s5/resource` |
| 6 | Embedded RDF Script | `embedded-script` | `/wrx/s6/resource` |
| 7 | Sitemap Signposting | `sitemap-signposting` | `/wrx/s7/resource` |

> **Note:** strategies S2–S7 all serve an HTML landing page for non-RDF Accept
> headers. Only S1 performs pure content negotiation directly on the landing URL.

---

## S1 — Content Negotiation

**Norm:** the server inspects the `Accept` header and returns the best-matching RDF
serialisation ([RFC 7231 §5.3](https://www.rfc-editor.org/rfc/rfc7231#section-5.3)).

**How wrx finds RDF:** `fetchRDF(uri)` sends a combined `Accept` header with all
supported RDF MIME types (q-values descending). If the response `Content-Type` is a
recognised RDF MIME the content is returned immediately.

### Resources

| URL | Content-Type | File |
|-----|-------------|------|
| `/wrx/s1/resource` | `text/turtle` (default) | `s1/resource.ttl` |
| `/wrx/s1/resource` | `application/ld+json` | `s1/resource.jsonld` |
| `/wrx/s1/resource` | `application/rdf+xml` | `s1/resource.rdf` |
| `/wrx/s1/resource` | `application/n-triples` | `s1/resource.nt` |
| `/wrx/s1/resource` | `text/n3` | `s1/resource.n3` |

```bash
# Test with curl
curl -H "Accept: text/turtle"           http://localhost/wrx/s1/resource
curl -H "Accept: application/ld+json"   http://localhost/wrx/s1/resource
curl -H "Accept: application/rdf+xml"   http://localhost/wrx/s1/resource
curl -H "Accept: application/n-triples" http://localhost/wrx/s1/resource
curl -H "Accept: text/n3"               http://localhost/wrx/s1/resource
```

---

## S2 — HTTP Link Header DescribedBy / Profile

**Norm:** [FAIR Signposting](https://signposting.org/FAIR/) — the server adds an HTTP
`Link` response header with `rel="describedby"` (or `rel="profile"`) pointing to a
separate RDF metadata document
([RFC 8288](https://www.rfc-editor.org/rfc/rfc8288.html)).

**How wrx finds RDF:** after receiving a non-RDF response, it parses the `Link`
response header. For each candidate with `rel=describedby` or `rel=profile` it calls
`fetchRDF(candidateURL)` and returns the first RDF response.

### Resources

| URL | Content-Type | Notes |
|-----|-------------|-------|
| `/wrx/s2/resource` | `text/html` | Landing page; carries `Link` header |
| `/wrx/s2/resource.ttl` | `text/turtle` | RDF target from `rel="describedby"` |
| `/wrx/s2/resource.jsonld` | `application/ld+json` | RDF target from `rel="describedby"` |

**HTTP response header on `/wrx/s2/resource`:**
```
Link: </wrx/s2/resource.ttl>;   rel="describedby"; type="text/turtle",
      </wrx/s2/resource.jsonld>; rel="describedby"; type="application/ld+json"
```

```bash
curl -v http://localhost/wrx/s2/resource 2>&1 | grep -i link
curl http://localhost/wrx/s2/resource.ttl
```

---

## S3 — HTTP Link Header Linkset

**Norm:** [RFC 9264 — Linkset](https://www.rfc-editor.org/rfc/rfc9264.html) — the
server advertises an `application/linkset+json` document via an HTTP `Link` header
with `rel="linkset"`. The linkset lists `describedby` and/or `profile` targets.

**How wrx finds RDF:** after a non-RDF response, it collects `rel=linkset` entries
from the `Link` header and calls `tryExtractFromLinkset(linksetUrl, baseUri)`, which
fetches the linkset JSON and iterates over `describedby`/`profile` targets.

### Resources

| URL | Content-Type | Notes |
|-----|-------------|-------|
| `/wrx/s3/resource` | `text/html` | Landing page; carries `Link: rel=linkset` header |
| `/wrx/s3/linkset.json` | `application/linkset+json` | RFC 9264 linkset document |
| `/wrx/s3/resource.ttl` | `text/turtle` | RDF target listed in the linkset |
| `/wrx/s3/resource.jsonld` | `application/ld+json` | RDF target listed in the linkset |

**HTTP response header on `/wrx/s3/resource`:**
```
Link: </wrx/s3/linkset.json>; rel="linkset"; type="application/linkset+json"
```

**`/wrx/s3/linkset.json` (RFC 9264 §4.2 format):**
```json
{
  "linkset": [
    {
      "describedby": [
        { "href": "/wrx/s3/resource.ttl",   "type": "text/turtle" },
        { "href": "/wrx/s3/resource.jsonld", "type": "application/ld+json" }
      ]
    }
  ]
}
```

---

## S4 — HTML DescribedBy Link Tag (Signposting via HTML)

**Norm:** [FAIR Signposting](https://signposting.org/FAIR/) via HTML — the HTML
`<head>` contains `<link rel="describedby" href="…">` elements pointing to RDF
documents ([RFC 8288](https://www.rfc-editor.org/rfc/rfc8288.html) via HTML).

**How wrx finds RDF:** it parses the HTML body for `<link>` tags. For each
`rel=describedby` href it calls `fetchRDF(href)` and returns the first RDF response.

### Resources

| URL | Content-Type | Notes |
|-----|-------------|-------|
| `/wrx/s4/resource` | `text/html` | HTML page with `<link rel="describedby">` in `<head>` |
| `/wrx/s4/resource.ttl` | `text/turtle` | RDF target |
| `/wrx/s4/resource.jsonld` | `application/ld+json` | RDF target |

**HTML `<head>` of `/wrx/s4/resource`:**
```html
<link rel="describedby" href="/wrx/s4/resource.ttl"    type="text/turtle"/>
<link rel="describedby" href="/wrx/s4/resource.jsonld"  type="application/ld+json"/>
```

---

## S5 — HTML Linkset Link Tag

**Norm:** [RFC 9264 — Linkset](https://www.rfc-editor.org/rfc/rfc9264.html) via HTML —
the HTML `<head>` contains `<link rel="linkset" href="…">` pointing to an
`application/linkset+json` document.

**How wrx finds RDF:** it finds `<link rel=linkset>` hrefs in the HTML, then calls
`tryExtractFromLinkset(linksetUrl, uri)` on each one (same resolver as S3).

### Resources

| URL | Content-Type | Notes |
|-----|-------------|-------|
| `/wrx/s5/resource` | `text/html` | HTML page with `<link rel="linkset">` in `<head>` |
| `/wrx/s5/linkset.json` | `application/linkset+json` | RFC 9264 linkset document |
| `/wrx/s5/resource.ttl` | `text/turtle` | RDF target listed in the linkset |
| `/wrx/s5/resource.jsonld` | `application/ld+json` | RDF target listed in the linkset |

**HTML `<head>` of `/wrx/s5/resource`:**
```html
<link rel="linkset" href="/wrx/s5/linkset.json" type="application/linkset+json"/>
```

---

## S6 — Embedded RDF Script

**Norm:** [JSON-LD](https://json-ld.org/) embedded in HTML via
`<script type="application/ld+json">` — a well-established pattern for publishing
structured data directly in web pages (used by Google, schema.org, etc.).

**How wrx finds RDF:** it scans all `<script>` tags in the HTML. If the `type`
attribute is a recognised RDF MIME type and the content is non-empty, the script
content is returned as the RDF payload — no additional HTTP request is needed.

### Resources

| URL | Content-Type | Notes |
|-----|-------------|-------|
| `/wrx/s6/resource` | `text/html` | HTML page with embedded `<script type="application/ld+json">` |

**Embedded script block in `/wrx/s6/resource`:**
```json
{
  "@context": { "ex": "http://example.org/wrx/s6/", … },
  "@id": "http://example.org/wrx/s6/resource",
  "@type": "ex:WRXTestResource",
  "rdfs:label": "WRX Strategy 6 — Embedded RDF Script"
}
```

---

## S7 — Sitemap Signposting

**Norm:** [Sitemap Protocol](http://sitemaps.org/) +
[RFC 9309 — Robots Exclusion Protocol](https://www.rfc-editor.org/rfc/rfc9309.html)
+ FAIR Signposting in sitemaps — `robots.txt` advertises `sitemap.xml`, which lists
resource URLs with `<xhtml:link rel="describedby">` entries pointing to RDF files.

**How wrx finds RDF:**
1. Derives `robots.txt` URL from the URI's host (`{protocol}//{host}/robots.txt`).
2. Parses `Sitemap:` directives.
3. Fetches each sitemap XML and looks for a `<url><loc>` matching the requested URI.
4. Reads `<xhtml:link rel="describedby" href="…">` from that `<url>` entry and
   fetches the target.

### Resources

| URL | Content-Type | Notes |
|-----|-------------|-------|
| `/wrx/s7/resource` | `text/html` | Landing page (no special markup needed) |
| `/robots.txt` | `text/plain` | Advertises `/sitemap.xml` |
| `/sitemap.xml` | `application/xml` | Lists `/wrx/s7/resource` with `xhtml:link rel=describedby` |
| `/wrx/s7/resource.ttl` | `text/turtle` | RDF target |
| `/wrx/s7/resource.jsonld` | `application/ld+json` | RDF target |

**`/robots.txt`:**
```
User-agent: *
Allow: /
Sitemap: http://localhost/sitemap.xml
```

**Relevant fragment of `/sitemap.xml`:**
```xml
<url>
  <loc>http://localhost/wrx/s7/resource</loc>
  <xhtml:link rel="describedby"
              href="/wrx/s7/resource.ttl"
              type="text/turtle"/>
  <xhtml:link rel="describedby"
              href="/wrx/s7/resource.jsonld"
              type="application/ld+json"/>
</url>
```

> **Deployment note:** The `<loc>` value and the `Sitemap:` directive in `robots.txt`
> must use absolute URLs — this is a hard requirement of the
> [Sitemap Protocol](http://sitemaps.org/) and [RFC 9309](https://www.rfc-editor.org/rfc/rfc9309.html),
> and wrx performs an exact-string match of `<loc>` against the requested URI.
> Both files are pre-configured for `http://localhost`. If you run the server on a
> different hostname or port, update `robots.txt` and `sitemap.xml` accordingly
> (or mount them as Docker volumes with the correct values).

---

## Supported RDF MIME Types

As defined in the [wrx source](https://github.com/cedricdcc/wrx/blob/main/wrx.ts):

| MIME type | Serialisation |
|-----------|--------------|
| `text/turtle` | Turtle |
| `application/ld+json` | JSON-LD |
| `application/rdf+xml` | RDF/XML |
| `application/n-triples` | N-Triples |
| `text/n3` | Notation3 |
| `application/n-quads` | N-Quads |
| `application/trig` | TriG |

---

## Quick Reference — `bun run wrx.js`

```bash
# First-match mode (stops at the first successful strategy)
bun run wrx.js http://localhost/wrx/s1/resource
bun run wrx.js http://localhost/wrx/s2/resource
bun run wrx.js http://localhost/wrx/s3/resource
bun run wrx.js http://localhost/wrx/s4/resource
bun run wrx.js http://localhost/wrx/s5/resource
bun run wrx.js http://localhost/wrx/s6/resource
bun run wrx.js http://localhost/wrx/s7/resource

# Explore all strategies at once (--all mode)
bun run wrx.js --all http://localhost/wrx/s1/resource
```
