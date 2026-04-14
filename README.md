# lod_docker_webserver

A lightweight, self-contained Dockerised test web server designed for
**py-sema harvest tests** and **WRX RDF-navigation tests**.

It serves RDF/LOD resources with full **content negotiation**
(Accept header → best-matching serialisation: `text/turtle`,
`application/ld+json`, `application/rdf+xml`, `text/n3`, …) plus support
for `?format=` and `?mode=` query parameters used by the test suites.

Both **HTTP (port 80)** and **HTTPS (port 443)** are exposed using a
self-signed certificate.

---

## Project Structure

```
lod_docker_webserver/
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── generate-certs.sh          # run once to create certs/server.{key,crt}
├── certs/                     # self-signed TLS certificate (git-ignored)
├── resources/
│   ├── sema/                  # py-sema dereference_test*.yml resources
│   │   ├── input/             # *.ttl  *.jsonld  *.rdf  *.n3
│   │   ├── output/
│   │   └── config/
│   └── wrx-iso/               # WRX ISO-norm test resources
│       └── iso-test-resource-1/
│           ├── resource.ttl
│           ├── resource.jsonld
│           └── resource.rdf
└── app/
    ├── __init__.py
    ├── config.py              # URL → file mapping + available formats
    └── main.py                # FastAPI app with negotiation logic
```

---

## Quick Start

### 1. Generate a self-signed TLS certificate (once)

```bash
./generate-certs.sh
```

### 2. Add your test resources

Copy the relevant files from your test repos:

```bash
# py-sema
cp -r /path/to/py-sema/tests/harvest/scenarios/input/* resources/sema/input/

# WRX ISO-norm resources
cp -r /path/to/wrx/iso-resources/* resources/wrx-iso/
```

Update `app/config.py` to map any new URLs.

### 3. Build and run

```bash
docker compose up --build
```

The server is now live at:
- `http://localhost`
- `https://localhost` (accept the self-signed cert)

---

## Content Negotiation

Send an `Accept` header to request a specific serialisation:

```bash
curl -H "Accept: text/turtle"           http://localhost/dereference_test1
curl -H "Accept: application/ld+json"   http://localhost/dereference_test1
curl -H "Accept: application/rdf+xml"   http://localhost/dereference_test1
```

Or use the `?format=` query parameter:

```bash
curl http://localhost/dereference_test1?format=turtle
curl http://localhost/dereference_test1?format=jsonld
```

---

## Extending the Resource Map

Edit `app/config.py` and add entries to `RESOURCE_MAP`:

```python
"/my-new-resource": {
    "files": {
        "text/turtle":        BASE_RESOURCES / "sema/input/my-resource.ttl",
        "application/ld+json": BASE_RESOURCES / "sema/input/my-resource.jsonld",
    },
    "default": "text/turtle",
    "vary": "Accept",
},
```

No rebuild is needed when using `docker compose up` with the volume mount – just
restart the container.

