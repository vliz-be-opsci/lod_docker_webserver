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
