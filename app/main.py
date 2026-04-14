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
    """Serve a resource — three dispatch modes determined by the entry's ``kind`` field:

    * ``conneg`` (default when ``files`` key is present) — full content
      negotiation via Accept header and optional ``?format=`` query param.
    * ``html`` — return an HTML file, optionally adding HTTP ``Link`` headers
      for FAIR signposting (S2: describedby, S3: linkset).
    * ``static`` — return a file verbatim with a fixed Content-Type (used for
      RDF files, linkset documents, ``robots.txt``, ``sitemap.xml``, etc.).
    """
    # Build the lookup key, optionally including query params for keyed variants.
    base_key = f"/{path}"
    query_string = str(request.query_params) if request.query_params else ""

    # Try the full key (path + query string) first, then fall back to path only.
    full_key = f"{base_key}?{query_string}" if query_string else base_key
    entry = RESOURCE_MAP.get(full_key) or RESOURCE_MAP.get(base_key)

    if entry is None:
        return PlainTextResponse("Resource not found", status_code=404)

    kind = entry.get("kind", "conneg")

    # ------------------------------------------------------------------
    # HTML page — serve an HTML file, optionally with Link headers
    # ------------------------------------------------------------------
    if kind == "html":
        file_path: Path = entry["file"]
        if not file_path.exists():
            return PlainTextResponse("Resource file not found on disk", status_code=404)
        extra_headers: dict[str, str] = {}
        link_headers: list[str] = entry.get("link_headers", [])
        if link_headers:
            extra_headers["Link"] = ", ".join(link_headers)
        return FileResponse(path=file_path, media_type="text/html", headers=extra_headers)

    # ------------------------------------------------------------------
    # Static file — serve verbatim with a fixed Content-Type
    # ------------------------------------------------------------------
    if kind == "static":
        file_path = entry["file"]
        if not file_path.exists():
            return PlainTextResponse("Resource file not found on disk", status_code=404)
        return FileResponse(path=file_path, media_type=entry["content_type"])

    # ------------------------------------------------------------------
    # Content negotiation (default)
    # ------------------------------------------------------------------
    # ?format= override takes priority over the Accept header.
    format_param = request.query_params.get("format")
    if format_param:
        mime = FORMAT_ALIAS_MAP.get(format_param.lower())
        if mime and mime in entry["files"]:
            file_path = entry["files"][mime]
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

