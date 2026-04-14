from pathlib import Path

BASE_RESOURCES = Path("/app/resources")

# Maps URL paths (and optional query strings) to their available serialisations.
# Extend this dict with every URL from the py-sema dereference_test*.yml scenarios
# and any WRX ISO-norm test resources.
RESOURCE_MAP: dict = {
    # ------------------------------------------------------------------
    # py-sema dereference tests
    # ------------------------------------------------------------------
    "/dereference_test1": {
        "files": {
            "text/turtle": BASE_RESOURCES / "sema/input/resource1.ttl",
            "application/ld+json": BASE_RESOURCES / "sema/input/resource1.jsonld",
            "application/rdf+xml": BASE_RESOURCES / "sema/input/resource1.rdf",
            "text/n3": BASE_RESOURCES / "sema/input/resource1.n3",
        },
        "default": "text/turtle",
        "vary": "Accept",
    },
    "/dereference_test2": {
        "files": {
            "text/turtle": BASE_RESOURCES / "sema/input/resource2.ttl",
            "application/ld+json": BASE_RESOURCES / "sema/input/resource2.jsonld",
            "application/rdf+xml": BASE_RESOURCES / "sema/input/resource2.rdf",
        },
        "default": "text/turtle",
        "vary": "Accept",
    },
    "/dereference_test3": {
        "files": {
            "text/turtle": BASE_RESOURCES / "sema/input/resource3.ttl",
            "application/ld+json": BASE_RESOURCES / "sema/input/resource3.jsonld",
            "application/rdf+xml": BASE_RESOURCES / "sema/input/resource3.rdf",
        },
        "default": "text/turtle",
        "vary": "Accept",
    },
    "/dereference_test4": {
        "files": {
            "text/turtle": BASE_RESOURCES / "sema/input/resource4.ttl",
            "application/ld+json": BASE_RESOURCES / "sema/input/resource4.jsonld",
        },
        "default": "text/turtle",
        "vary": "Accept",
    },
    "/dereference_test5": {
        "files": {
            "text/turtle": BASE_RESOURCES / "sema/input/resource5.ttl",
            "application/ld+json": BASE_RESOURCES / "sema/input/resource5.jsonld",
        },
        "default": "text/turtle",
        "vary": "Accept",
    },
    # Query-param variant: ?mode=stop
    "/dereference_test1?mode=stop": {
        "files": {
            "text/turtle": BASE_RESOURCES / "sema/input/resource1.ttl",
            "application/ld+json": BASE_RESOURCES / "sema/input/resource1.jsonld",
        },
        "default": "text/turtle",
        "vary": "Accept",
    },
    "/dereference_test1?mode=nostop": {
        "files": {
            "text/turtle": BASE_RESOURCES / "sema/input/resource1.ttl",
            "application/ld+json": BASE_RESOURCES / "sema/input/resource1.jsonld",
        },
        "default": "text/turtle",
        "vary": "Accept",
    },
    # ------------------------------------------------------------------
    # WRX ISO-norm test resources
    # ------------------------------------------------------------------
    "/wrx-iso/iso-test-resource-1": {
        "files": {
            "text/turtle": BASE_RESOURCES / "wrx-iso/iso-test-resource-1/resource.ttl",
            "application/ld+json": BASE_RESOURCES / "wrx-iso/iso-test-resource-1/resource.jsonld",
            "application/rdf+xml": BASE_RESOURCES / "wrx-iso/iso-test-resource-1/resource.rdf",
        },
        "default": "application/ld+json",
        "vary": "Accept",
    },

    # ==================================================================
    # WRX strategy test resources  (one landing URL per strategy S1–S7)
    # See resources/wrx/README.md for a full explanation.
    # ==================================================================

    # ------------------------------------------------------------------
    # S1 — Content Negotiation
    # The server returns the RDF serialisation that best matches the
    # client's Accept header (text/turtle, application/ld+json, etc.).
    # ------------------------------------------------------------------
    "/wrx/s1/resource": {
        "files": {
            "text/turtle":          BASE_RESOURCES / "wrx/s1/resource.ttl",
            "application/ld+json":  BASE_RESOURCES / "wrx/s1/resource.jsonld",
            "application/rdf+xml":  BASE_RESOURCES / "wrx/s1/resource.rdf",
            "application/n-triples": BASE_RESOURCES / "wrx/s1/resource.nt",
            "text/n3":              BASE_RESOURCES / "wrx/s1/resource.n3",
        },
        "default": "text/turtle",
        "vary": "Accept",
    },

    # ------------------------------------------------------------------
    # S2 — HTTP Link Header DescribedBy / Profile
    # Landing page is HTML; the HTTP response carries:
    #   Link: </wrx/s2/resource.ttl>; rel="describedby"; type="text/turtle"
    # wrx fetches the describedby target to obtain RDF.
    # ------------------------------------------------------------------
    "/wrx/s2/resource": {
        "kind": "html",
        "file": BASE_RESOURCES / "wrx/s2/resource.html",
        "link_headers": [
            '</wrx/s2/resource.ttl>;   rel="describedby"; type="text/turtle"',
            '</wrx/s2/resource.jsonld>; rel="describedby"; type="application/ld+json"',
        ],
    },
    "/wrx/s2/resource.ttl":    {"kind": "static", "file": BASE_RESOURCES / "wrx/s2/resource.ttl",    "content_type": "text/turtle"},
    "/wrx/s2/resource.jsonld": {"kind": "static", "file": BASE_RESOURCES / "wrx/s2/resource.jsonld", "content_type": "application/ld+json"},

    # ------------------------------------------------------------------
    # S3 — HTTP Link Header Linkset
    # Landing page is HTML; the HTTP response carries:
    #   Link: </wrx/s3/linkset.json>; rel="linkset"; type="application/linkset+json"
    # wrx fetches the linkset, which lists describedby targets.
    # ------------------------------------------------------------------
    "/wrx/s3/resource": {
        "kind": "html",
        "file": BASE_RESOURCES / "wrx/s3/resource.html",
        "link_headers": [
            '</wrx/s3/linkset.json>; rel="linkset"; type="application/linkset+json"',
        ],
    },
    "/wrx/s3/linkset.json":    {"kind": "static", "file": BASE_RESOURCES / "wrx/s3/linkset.json",    "content_type": "application/linkset+json"},
    "/wrx/s3/resource.ttl":    {"kind": "static", "file": BASE_RESOURCES / "wrx/s3/resource.ttl",    "content_type": "text/turtle"},
    "/wrx/s3/resource.jsonld": {"kind": "static", "file": BASE_RESOURCES / "wrx/s3/resource.jsonld", "content_type": "application/ld+json"},

    # ------------------------------------------------------------------
    # S4 — HTML DescribedBy Link Tag (signposting via HTML link)
    # The HTML page contains:
    #   <link rel="describedby" href="/wrx/s4/resource.ttl" type="text/turtle">
    # wrx parses the HTML and fetches the describedby target.
    # ------------------------------------------------------------------
    "/wrx/s4/resource": {
        "kind": "html",
        "file": BASE_RESOURCES / "wrx/s4/resource.html",
    },
    "/wrx/s4/resource.ttl":    {"kind": "static", "file": BASE_RESOURCES / "wrx/s4/resource.ttl",    "content_type": "text/turtle"},
    "/wrx/s4/resource.jsonld": {"kind": "static", "file": BASE_RESOURCES / "wrx/s4/resource.jsonld", "content_type": "application/ld+json"},

    # ------------------------------------------------------------------
    # S5 — HTML Linkset Link Tag
    # The HTML page contains:
    #   <link rel="linkset" href="/wrx/s5/linkset.json" type="application/linkset+json">
    # wrx parses the HTML, fetches the linkset, then the describedby targets.
    # ------------------------------------------------------------------
    "/wrx/s5/resource": {
        "kind": "html",
        "file": BASE_RESOURCES / "wrx/s5/resource.html",
    },
    "/wrx/s5/linkset.json":    {"kind": "static", "file": BASE_RESOURCES / "wrx/s5/linkset.json",    "content_type": "application/linkset+json"},
    "/wrx/s5/resource.ttl":    {"kind": "static", "file": BASE_RESOURCES / "wrx/s5/resource.ttl",    "content_type": "text/turtle"},
    "/wrx/s5/resource.jsonld": {"kind": "static", "file": BASE_RESOURCES / "wrx/s5/resource.jsonld", "content_type": "application/ld+json"},

    # ------------------------------------------------------------------
    # S6 — Embedded RDF Script
    # The HTML page embeds a <script type="application/ld+json"> block
    # containing JSON-LD metadata. No separate fetch required.
    # ------------------------------------------------------------------
    "/wrx/s6/resource": {
        "kind": "html",
        "file": BASE_RESOURCES / "wrx/s6/resource.html",
    },

    # ------------------------------------------------------------------
    # S7 — Sitemap Signposting
    # /robots.txt  →  Sitemap: /sitemap.xml
    # /sitemap.xml →  <xhtml:link rel="describedby"> for this resource
    # wrx walks the chain and fetches the describedby RDF target.
    # ------------------------------------------------------------------
    "/wrx/s7/resource": {
        "kind": "html",
        "file": BASE_RESOURCES / "wrx/s7/resource.html",
    },
    "/wrx/s7/resource.ttl":    {"kind": "static", "file": BASE_RESOURCES / "wrx/s7/resource.ttl",    "content_type": "text/turtle"},
    "/wrx/s7/resource.jsonld": {"kind": "static", "file": BASE_RESOURCES / "wrx/s7/resource.jsonld", "content_type": "application/ld+json"},
    # robots.txt and sitemap.xml served from well-known root paths
    "/robots.txt":  {"kind": "static", "file": BASE_RESOURCES / "wrx/s7/robots.txt",  "content_type": "text/plain"},
    "/sitemap.xml": {"kind": "static", "file": BASE_RESOURCES / "wrx/s7/sitemap.xml", "content_type": "application/xml"},
}

# Map from short format aliases (used by ?format= query param) to MIME types.
FORMAT_ALIAS_MAP: dict = {
    "turtle": "text/turtle",
    "ttl": "text/turtle",
    "jsonld": "application/ld+json",
    "json-ld": "application/ld+json",
    "json": "application/ld+json",
    "rdfxml": "application/rdf+xml",
    "rdf": "application/rdf+xml",
    "xml": "application/rdf+xml",
    "n3": "text/n3",
}
