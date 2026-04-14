from html import escape
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, HTMLResponse, PlainTextResponse, Response

from .config import FORMAT_ALIAS_MAP, RESOURCE_MAP

app = FastAPI(
    title="LOD Docker Test Web Server",
    description=(
        "Lightweight test server that serves RDF/LOD resources with full "
        "content negotiation for py-sema harvest tests and WRX RDF-navigation tests."
    ),
)


def _relative_display_path(path: Path) -> str:
    """Return a stable path string for display in the homepage."""
    try:
        relative_path = path.relative_to(Path("/app"))
        return f"/app/{relative_path.as_posix()}"
    except ValueError:
        return path.as_posix()


def _build_homepage_sections() -> tuple[list[str], list[str]]:
    """Build table rows and file list items for the homepage."""
    endpoint_rows: list[str] = []
    file_rows: list[str] = []
    seen_files: set[str] = set()

    for endpoint, entry in sorted(RESOURCE_MAP.items()):
        kind = entry.get("kind", "conneg")

        if kind == "conneg":
            files = entry.get("files", {})
            file_lines = "<ul>" + "".join(
                f"<li><code>{escape(mime)}</code> - {escape(_relative_display_path(path))}</li>"
                for mime, path in sorted(files.items())
            ) + "</ul>"
            endpoint_rows.append(
                "<tr>"
                f"<td><code>{escape(endpoint)}</code></td>"
                f"<td>Content negotiation</td>"
                f"<td>{file_lines}</td>"
                f"<td><code>{escape(entry.get('default', ''))}</code></td>"
                f"<td><code>{escape(entry.get('vary', ''))}</code></td>"
                "</tr>"
            )
            for path in files.values():
                display_path = _relative_display_path(path)
                if display_path not in seen_files:
                    seen_files.add(display_path)
                    file_rows.append(
                        f"<li><code>{escape(display_path)}</code> <span class='muted'>({escape(endpoint)})</span></li>"
                    )
            continue

        file_path = entry["file"]
        content_type = "text/html" if kind == "html" else entry.get(
            "content_type", "application/octet-stream"
        )
        details = ""
        if entry.get("link_headers"):
            details = "<ul>" + "".join(
                f"<li><code>{escape(header)}</code></li>" for header in entry["link_headers"]
            ) + "</ul>"

        endpoint_rows.append(
            "<tr>"
            f"<td><code>{escape(endpoint)}</code></td>"
            f"<td>{escape(kind.title())}</td>"
            f"<td><code>{escape(_relative_display_path(file_path))}</code>{details}</td>"
            f"<td><code>{escape(content_type)}</code></td>"
            f"<td><code>{escape(content_type)}</code></td>"
            "</tr>"
        )

        display_path = _relative_display_path(file_path)
        if display_path not in seen_files:
            seen_files.add(display_path)
            file_rows.append(
                f"<li><code>{escape(display_path)}</code> <span class='muted'>({escape(endpoint)})</span></li>"
            )

    return endpoint_rows, file_rows


def _build_homepage_html() -> str:
    """Render a compact inventory of the configured resources."""
    endpoint_rows, file_rows = _build_homepage_sections()

    return f"""
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>LOD Docker Test Web Server</title>
    <style>
        :root {{
            color-scheme: light;
            --bg: #f5f7fb;
            --panel: #ffffff;
            --text: #172033;
            --muted: #5d6b82;
            --accent: #1346a8;
            --accent-soft: #dbe6ff;
            --border: #d7deea;
        }}
        * {{ box-sizing: border-box; }}
        body {{
            margin: 0;
            font-family: Inter, Segoe UI, Arial, sans-serif;
            background: linear-gradient(180deg, #eef3ff 0%, var(--bg) 100%);
            color: var(--text);
        }}
        .hero {{
            padding: 3.5rem 1.25rem 2rem;
            background: radial-gradient(circle at top left, rgba(19, 70, 168, 0.18), transparent 30%),
                        radial-gradient(circle at top right, rgba(32, 175, 130, 0.16), transparent 26%);
        }}
        .wrap {{ max-width: 1180px; margin: 0 auto; }}
        .eyebrow {{
            display: inline-block;
            padding: 0.35rem 0.75rem;
            border-radius: 999px;
            background: var(--accent-soft);
            color: var(--accent);
            font-size: 0.85rem;
            font-weight: 700;
            letter-spacing: 0.03em;
            text-transform: uppercase;
        }}
        h1 {{ margin: 1rem 0 0.5rem; font-size: clamp(2rem, 4vw, 3.5rem); line-height: 1.05; }}
        .lead {{ max-width: 72rem; font-size: 1.05rem; line-height: 1.6; color: var(--muted); }}
        .stats {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
            gap: 0.875rem;
            margin-top: 1.5rem;
        }}
        .stat {{
            background: rgba(255, 255, 255, 0.72);
            border: 1px solid var(--border);
            border-radius: 1rem;
            padding: 1rem;
            backdrop-filter: blur(8px);
        }}
        .stat strong {{ display: block; font-size: 1.5rem; margin-bottom: 0.25rem; }}
        .section {{ padding: 1rem 1.25rem 2.5rem; }}
        .card {{
            background: var(--panel);
            border: 1px solid var(--border);
            border-radius: 1.25rem;
            box-shadow: 0 18px 50px rgba(19, 32, 51, 0.06);
            overflow: hidden;
        }}
        .card-head {{ padding: 1.15rem 1.25rem; border-bottom: 1px solid var(--border); }}
        .card-head h2 {{ margin: 0; font-size: 1.2rem; }}
        .card-head p {{ margin: 0.35rem 0 0; color: var(--muted); }}
        .table-wrap {{ overflow-x: auto; }}
        table {{ width: 100%; border-collapse: collapse; }}
        th, td {{
            padding: 0.95rem 1.1rem;
            border-bottom: 1px solid var(--border);
            vertical-align: top;
            text-align: left;
        }}
        th {{ font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); background: #fbfcff; }}
        td code, li code {{
            background: #f3f6fc;
            border: 1px solid #e2e8f3;
            border-radius: 0.4rem;
            padding: 0.15rem 0.35rem;
            font-size: 0.92em;
        }}
        ul {{ margin: 0.2rem 0 0; padding-left: 1.2rem; }}
        li {{ margin: 0.15rem 0; }}
        .muted {{ color: var(--muted); }}
        .grid {{ display: grid; gap: 1rem; grid-template-columns: 1.5fr 1fr; }}
        @media (max-width: 960px) {{ .grid {{ grid-template-columns: 1fr; }} }}
        .footer {{ padding: 0 1.25rem 2rem; color: var(--muted); }}
        .footer code {{ background: transparent; border: 0; padding: 0; }}
    </style>
</head>
<body>
    <header class="hero">
        <div class="wrap">
            <span class="eyebrow">LOD Docker Test Web Server</span>
            <h1>Root homepage and resource inventory</h1>
            <p class="lead">This server is a controlled test fixture for content negotiation and WRX navigation scenarios. The table below mirrors the resources defined in <code>app/config.py</code>, so you can quickly see which URL serves which file and serialization.</p>
            <div class="stats">
                <div class="stat"><strong>{len(RESOURCE_MAP)}</strong><span class="muted">Configured endpoints</span></div>
                <div class="stat"><strong>{len(file_rows)}</strong><span class="muted">Unique files on disk</span></div>
                <div class="stat"><strong>HTTP + HTTPS</strong><span class="muted">Ports 80 and 443</span></div>
            </div>
        </div>
    </header>

    <main class="section wrap">
        <div class="card" style="margin-bottom: 1rem;">
            <div class="card-head">
                <h2>Configured endpoints</h2>
                <p>Each entry in <code>RESOURCE_MAP</code> and its backing file(s).</p>
            </div>
            <div class="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>URL</th>
                            <th>Type</th>
                            <th>Backing file(s)</th>
                            <th>Default / Content type</th>
                            <th>Vary</th>
                        </tr>
                    </thead>
                    <tbody>
                        {''.join(endpoint_rows)}
                    </tbody>
                </table>
            </div>
        </div>

        <div class="grid">
            <div class="card">
                <div class="card-head">
                    <h2>Filesystem assets</h2>
                    <p>Unique files referenced from the configuration.</p>
                </div>
                <div style="padding: 1rem 1.25rem;">
                    <ul>
                        {''.join(file_rows)}
                    </ul>
                </div>
            </div>
            <div class="card">
                <div class="card-head">
                    <h2>Notes</h2>
                    <p>What the server is optimized for.</p>
                </div>
                <div style="padding: 1rem 1.25rem; color: var(--muted); line-height: 1.6;">
                    <p>The same catch-all handler still serves all configured test resources below the root page.</p>
                    <p>Content-negotiated resources respond to <code>Accept</code> and <code>?format=</code> where configured.</p>
                    <p>HTML and static resources are served verbatim, including WRX signposting helpers such as <code>Link</code>, <code>robots.txt</code>, and <code>sitemap.xml</code>.</p>
                </div>
            </div>
        </div>
    </main>

    <footer class="footer wrap">
        Served from the configuration in <code>app/config.py</code>.
    </footer>
</body>
</html>
"""


@app.get("/", response_model=None)
async def homepage() -> HTMLResponse:
    """Serve the root homepage."""
    return HTMLResponse(content=_build_homepage_html())


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
            negotiated_file_path = entry["files"][mime]
        else:
            return PlainTextResponse(
                f"Unsupported format: {format_param}", status_code=406
            )
    else:
        accept_header = request.headers.get("accept", "*/*")
        negotiated_file_path = _negotiate_file(entry, accept_header)

    if negotiated_file_path is None:
        return PlainTextResponse("Resource file not found on disk", status_code=404)

    assert negotiated_file_path is not None

    if not negotiated_file_path.exists():
        return PlainTextResponse("Resource file not found on disk", status_code=404)

    vary = entry.get("vary", "Accept")
    return FileResponse(
        path=negotiated_file_path,
        media_type=_mime_for_path(negotiated_file_path),
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
