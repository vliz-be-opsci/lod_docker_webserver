from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, PlainTextResponse, Response

from .config import RESOURCE_MAP, FORMAT_ALIAS_MAP

app = FastAPI(
    title="LOD Docker Test Web Server",
    description=(
        "Lightweight test server that serves RDF/LOD resources with full "
        "content negotiation for py-sema harvest tests and WRX RDF-navigation tests."
    ),
)


def _negotiate_file(entry: dict, accept_header: str) -> Path | None:
    """Return the best matching file path for the given Accept header."""
    for token in accept_header.split(","):
        mime = token.split(";")[0].strip()
        if mime in entry["files"]:
            return entry["files"][mime]
    # Wildcard fallbacks
    for token in accept_header.split(","):
        mime = token.split(";")[0].strip()
        if mime in ("*/*", "text/*", "application/*"):
            return entry["files"][entry["default"]]
    return entry["files"][entry["default"]]


@app.get("/{path:path}", response_model=None)
async def serve_resource(request: Request, path: str) -> Response:
    """Serve an RDF resource with content negotiation.

    Supports:
    - Accept header negotiation (text/turtle, application/ld+json, application/rdf+xml, text/n3)
    - ?format= query parameter override (e.g. ?format=turtle)
    - ?mode= query parameter pass-through (used by some test suites)
    """
    # Build the lookup key, optionally including query params for keyed variants.
    base_key = f"/{path}"
    query_string = str(request.query_params) if request.query_params else ""

    # Try the full key (path + query string) first, then fall back to path only.
    full_key = f"{base_key}?{query_string}" if query_string else base_key
    entry = RESOURCE_MAP.get(full_key) or RESOURCE_MAP.get(base_key)

    if entry is None:
        return PlainTextResponse("Resource not found", status_code=404)

    # ?format= override takes priority over the Accept header.
    format_param = request.query_params.get("format")
    if format_param:
        mime = FORMAT_ALIAS_MAP.get(format_param.lower())
        if mime and mime in entry["files"]:
            file_path: Path = entry["files"][mime]
        else:
            return PlainTextResponse(
                f"Unsupported format: {format_param}", status_code=406
            )
    else:
        accept_header = request.headers.get("accept", "*/*")
        file_path = _negotiate_file(entry, accept_header)

    if file_path is None or not file_path.exists():
        return PlainTextResponse("Resource file not found on disk", status_code=404)

    vary = entry.get("vary", "Accept")
    return FileResponse(
        path=file_path,
        media_type=_mime_for_path(file_path),
        headers={"Vary": vary},
    )


def _mime_for_path(path: Path) -> str:
    """Return the correct MIME type based on the file extension."""
    suffix_map = {
        ".ttl": "text/turtle",
        ".jsonld": "application/ld+json",
        ".rdf": "application/rdf+xml",
        ".n3": "text/n3",
        ".nt": "application/n-triples",
        ".trig": "application/trig",
        ".nq": "application/n-quads",
    }
    return suffix_map.get(path.suffix.lower(), "application/octet-stream")
