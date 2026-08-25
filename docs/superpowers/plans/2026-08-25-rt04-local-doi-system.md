# RT-04 Local DOI Resolution System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a local DOI resolution subsystem in the Nginx/TypeScript webserver stack where persistent identifiers (DOIs) resolve directly to digital payloads (e.g. publication PDFs, dataset packages) under RT-04 (No Landing Page Solution) with RFC 8288 signposting and RT-03 content negotiation on `/id/...`.

**Architecture:** Extend the TypeScript static generator to build Nginx `$doi_payload_uri` maps and RFC 8288 payload Link headers (`rel="cite-as"`, `rel="describedby"`, `rel="linkset"`). Configure Port 8080 Nginx to route `/doi/...` directly to `/data/...` payloads with 303 redirects, and Port 8081 Nginx to simulate the gapped HTML landing page silo.

**Tech Stack:** TypeScript, Bun, Nginx, Docker Compose, Bun Test.

**Spec:** [docs/superpowers/specs/2026-08-25-rt04-local-doi-system-design.md](file:///c:/Users/cedricd/Documents/Github/lod_docker_webserver/docs/superpowers/specs/2026-08-25-rt04-local-doi-system-design.md)

## Global Constraints

- **Platform:** Windows environment, Bun test runner (`bun test`), Nginx static configuration.
- **Reference Port:** 8080 (`http://localhost:8080`).
- **Gapped Port:** 8081 (`http://localhost:8081`).
- **DOI Path Format:** `/doi/{doiPrefix}/{doiSuffix}` (e.g. `/doi/10.3897/biss.6.94630`, `/doi/10.14284/578`, `/doi/10.14284/412`).
- **RT-04 Direct Payload Semantics:** Resolving `/doi/...` on Port 8080 returns `303 See Other` to the primary payload in `/data/...`.
- **Signposting Headers on Payloads:** Payloads must carry `rel="cite-as"` pointing to the local DOI, `rel="describedby"` pointing to Turtle and HTML metadata, and `rel="linkset"` pointing to RFC 9264 JSON linkset.

---

### Task 1: Generate DOI-to-Payload Nginx Maps and Configure `/doi/` Route

**Files:**
- Modify: `generator/index.ts:289-310`
- Modify: `nginx.conf:30-45`
- Test: `test/nginxIntegration.test.ts`

**Interfaces:**
- Consumes: `RESOURCES` from `generator/resources.ts`
- Produces: `map $uri $doi_payload_uri` in `dist/nginx-coneg.conf`, `location ~ ^/doi/` in `nginx.conf`

- [ ] **Step 1: Write failing test in `test/nginxIntegration.test.ts`**

Add tests checking that `dist/nginx-coneg.conf` contains the DOI map and that `nginx.conf` contains the `/doi/` location routing block:

```typescript
it("generates DOI-to-payload redirect map in nginx-coneg.conf", () => {
  const conegConf = fs.readFileSync(path.join(DIST_DIR, "nginx-coneg.conf"), "utf-8");
  expect(conegConf).toContain("map $uri $doi_payload_uri {");
  expect(conegConf).toContain('"/doi/10.3897/biss.6.94630" "/data/ro-crate-paper.pdf";');
  expect(conegConf).toContain('"/doi/10.14284/578" "/data/arms-mbon-rocrate.zip";');
  expect(conegConf).toContain('"/doi/10.14284/412" "/data/arms-2018-samples.csv";');
});

it("configures /doi/ routing block in nginx.conf", () => {
  const nginxConf = fs.readFileSync(path.resolve(process.cwd(), "nginx.conf"), "utf-8");
  expect(nginxConf).toContain("location ~ ^/doi/");
  expect(nginxConf).toContain("return 303 $scheme://$http_host$doi_payload_uri;");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test test/nginxIntegration.test.ts`
Expected: FAIL with missing DOI mappings in `nginx-coneg.conf`.

- [ ] **Step 3: Implement DOI map generation in `generator/index.ts` and update `nginx.conf`**

In `generator/index.ts`:
```typescript
  // 10. Generate Nginx Content-Negotiation Map & DOI-to-Payload Map (nginx-coneg.conf)
  console.log(`Generating nginx-coneg.conf...`);
  let conegConf = `# Dynamic Content-Negotiation Map (RFC 9110 / 303 See Other)\n`;
  conegConf += `map $http_accept $conneg_suffix {\n`;
  conegConf += `    default                           html;\n`;
  conegConf += `    "~*text/turtle"                   ttl;\n`;
  conegConf += `    "~*application/ld\\+json"          jsonld;\n`;
  conegConf += `    "~*application/rdf\\+xml"          rdf;\n`;
  conegConf += `    "~*application/linkset\\+json"      linkset.json;\n`;
  conegConf += `}\n\n`;

  conegConf += `# RT-P04 Local DOI Direct-to-Payload Resolution Map\n`;
  conegConf += `map $uri $doi_payload_uri {\n`;
  conegConf += `    default "";\n`;
  for (const res of RESOURCES) {
    if (res.doi && res.doi.startsWith("https://doi.org/")) {
      const doiSuffix = res.doi.replace("https://doi.org/", "");
      const primaryPayload = res.distributions && res.distributions.length > 0 ? res.distributions[0].downloadUrl : null;
      if (primaryPayload) {
        conegConf += `    "/doi/${doiSuffix}" "${primaryPayload}";\n`;
      }
    }
  }
  conegConf += `}\n`;
  fs.writeFileSync(path.join(DIST_DIR, "nginx-coneg.conf"), conegConf);
```

In `nginx.conf`:
```nginx
        # RT-P04 Local DOI Direct-to-Payload Resolver
        location ~ ^/doi/ {
            if ($doi_payload_uri = "") {
                return 404;
            }
            add_header Access-Control-Allow-Origin * always;
            add_header Access-Control-Expose-Headers "Location, Link" always;
            return 303 $scheme://$http_host$doi_payload_uri;
        }
```

- [ ] **Step 4: Run static generator and run tests to verify they pass**

Run:
```bash
bun run generate
bun test test/nginxIntegration.test.ts
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add generator/index.ts nginx.conf test/nginxIntegration.test.ts
git commit -m "feat: generate local DOI-to-payload map and nginx /doi/ routing"
```

---

### Task 2: Implement Signposting Link Headers for Payloads in `generator/index.ts`

**Files:**
- Modify: `generator/index.ts:470-510`
- Test: `test/nginxIntegration.test.ts`

**Interfaces:**
- Consumes: `RESOURCES`, `BASE_URL`
- Produces: `location = /data/ro-crate-paper.pdf` and updated payload blocks with local DOI `rel="cite-as"` in `dist/nginx-headers.conf`

- [ ] **Step 1: Write failing test in `test/nginxIntegration.test.ts`**

```typescript
it("generates RT-P04 signposting headers for ro-crate-paper.pdf in nginx-headers.conf", () => {
  const headersConf = fs.readFileSync(path.join(DIST_DIR, "nginx-headers.conf"), "utf-8");
  expect(headersConf).toContain("location = /data/ro-crate-paper.pdf");
  expect(headersConf).toContain('<http://localhost:8080/doi/10.3897/biss.6.94630>; rel="cite-as"');
  expect(headersConf).toContain('<http://localhost:8080/id/publication/ro-crate-paper.ttl>; rel="describedby"; type="text/turtle"');
  expect(headersConf).toContain('<http://localhost:8080/id/publication/ro-crate-paper.html>; rel="describedby"; type="text/html"');
  expect(headersConf).toContain('<http://localhost:8080/id/publication/ro-crate-paper.linkset.json>; rel="linkset"; type="application/linkset+json"');
});

it("anchors dataset payloads back to local DOI in cite-as header", () => {
  const headersConf = fs.readFileSync(path.join(DIST_DIR, "nginx-headers.conf"), "utf-8");
  expect(headersConf).toContain('<http://localhost:8080/doi/10.14284/578>; rel="cite-as"');
  expect(headersConf).toContain('<http://localhost:8080/doi/10.14284/412>; rel="cite-as"');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test test/nginxIntegration.test.ts`
Expected: FAIL with missing `/data/ro-crate-paper.pdf` location block.

- [ ] **Step 3: Implement payload headers in `generator/index.ts`**

Update `generator/index.ts` around line 470:
```typescript
  // Headers for RT-P04 Direct Data Payloads (No Landing Page Solution)
  const armsZipLinks = [
    `<${BASE_URL}/doi/10.14284/578>; rel="cite-as"`,
    `<${BASE_URL}/id/dataset/arms-mbon>; rel="cite-as"`,
    `<${BASE_URL}/id/profile/marine-genomic-dataset-profile>; rel="profile"`,
    `<${BASE_URL}/id/profile/ro-crate-package-profile>; rel="profile"`,
    `<${BASE_URL}/id/dataset/arms-mbon.ttl>; rel="describedby"; type="text/turtle"`,
    `<${BASE_URL}/id/dataset/arms-mbon.html>; rel="describedby"; type="text/html"`,
    `<${BASE_URL}/id/dataset/arms-mbon.linkset.json>; rel="linkset"; type="application/linkset+json"`
  ];
  headersConf += `location = /data/arms-mbon-rocrate.zip {\n`;
  headersConf += `    add_header Link '${armsZipLinks.join(", ")}' always;\n`;
  headersConf += `}\n\n`;

  const armsCsvLinks = [
    `<${BASE_URL}/doi/10.14284/578>; rel="cite-as"`,
    `<${BASE_URL}/id/dataset/arms-mbon>; rel="cite-as"`,
    `<${BASE_URL}/id/profile/marine-genomic-dataset-profile>; rel="profile"`,
    `<${BASE_URL}/id/dataset/arms-mbon.ttl>; rel="describedby"; type="text/turtle"`,
    `<${BASE_URL}/id/dataset/arms-mbon.html>; rel="describedby"; type="text/html"`,
    `<${BASE_URL}/id/dataset/arms-mbon.linkset.json>; rel="linkset"; type="application/linkset+json"`
  ];
  headersConf += `location = /data/arms-mbon-18s.csv {\n`;
  headersConf += `    add_header Link '${armsCsvLinks.join(", ")}' always;\n`;
  headersConf += `}\n\n`;

  const arms2018CsvLinks = [
    `<${BASE_URL}/doi/10.14284/412>; rel="cite-as"`,
    `<${BASE_URL}/id/dataset/arms-2018>; rel="cite-as"`,
    `<${BASE_URL}/id/profile/marine-ecological-baseline-profile>; rel="profile"`,
    `<${BASE_URL}/id/dataset/arms-2018.ttl>; rel="describedby"; type="text/turtle"`,
    `<${BASE_URL}/id/dataset/arms-2018.html>; rel="describedby"; type="text/html"`,
    `<${BASE_URL}/id/dataset/arms-2018.linkset.json>; rel="linkset"; type="application/linkset+json"`
  ];
  headersConf += `location = /data/arms-2018-samples.csv {\n`;
  headersConf += `    add_header Link '${arms2018CsvLinks.join(", ")}' always;\n`;
  headersConf += `}\n\n`;

  const paperPdfLinks = [
    `<${BASE_URL}/doi/10.3897/biss.6.94630>; rel="cite-as"`,
    `<${BASE_URL}/id/publication/ro-crate-paper>; rel="cite-as"`,
    `<${BASE_URL}/id/publication/ro-crate-paper.ttl>; rel="describedby"; type="text/turtle"`,
    `<${BASE_URL}/id/publication/ro-crate-paper.jsonld>; rel="describedby"; type="application/ld+json"`,
    `<${BASE_URL}/id/publication/ro-crate-paper.html>; rel="describedby"; type="text/html"`,
    `<${BASE_URL}/id/publication/ro-crate-paper.linkset.json>; rel="linkset"; type="application/linkset+json"`
  ];
  headersConf += `location = /data/ro-crate-paper.pdf {\n`;
  headersConf += `    add_header Link '${paperPdfLinks.join(", ")}' always;\n`;
  headersConf += `}\n\n`;
```

- [ ] **Step 4: Run generator and tests to verify they pass**

Run:
```bash
bun run generate
bun test test/nginxIntegration.test.ts
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add generator/index.ts test/nginxIntegration.test.ts
git commit -m "feat: add RT-P04 payload signposting headers including publication PDF"
```

---

### Task 3: Implement Gapped Server Simulation for DOI Landing Page Trap

**Files:**
- Modify: `generator/gappedGenerator.ts:130-150, 260-270`
- Modify: `nginx-gapped.conf:30-45`
- Test: `test/gappedServer.test.ts`

**Interfaces:**
- Consumes: `RESOURCES`, `baseUrl` (Port 8081)
- Produces: Gapped DOI redirect map pointing to `.html` landing pages, `/doi/` block in `nginx-gapped.conf`

- [ ] **Step 1: Write failing test in `test/gappedServer.test.ts`**

```typescript
it("simulates gapped DOI redirecting to HTML landing page instead of payload", () => {
  const gappedConeg = fs.readFileSync(path.join(DIST_GAPPED_DIR, "nginx-coneg.conf"), "utf-8");
  expect(gappedConeg).toContain('"/doi/10.3897/biss.6.94630" "/id/publication/ro-crate-paper.html";');
});

it("omits cite-as link header on gapped PDF payload", () => {
  const gappedHeaders = fs.readFileSync(path.join(DIST_GAPPED_DIR, "nginx-headers.conf"), "utf-8");
  expect(gappedHeaders).toContain("location = /data/ro-crate-paper.pdf");
  expect(gappedHeaders).not.toContain('rel="cite-as"');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test test/gappedServer.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement gapped DOI map in `generator/gappedGenerator.ts` and `nginx-gapped.conf`**

In `generator/gappedGenerator.ts`:
```typescript
  // Gapped DOI Map: forces redirect to HTML landing page (chokepoint)
  gappedConegConf += `# Gapped Simulation: DOI forces redirect to HTML Landing Page\n`;
  gappedConegConf += `map $uri $doi_payload_uri {\n`;
  gappedConegConf += `    default "";\n`;
  for (const res of RESOURCES) {
    if (res.doi && res.doi.startsWith("https://doi.org/")) {
      const doiSuffix = res.doi.replace("https://doi.org/", "");
      const typeSlug = res.category || res.type.toLowerCase();
      const nameSlug = res.id.replace("resource-", "");
      gappedConegConf += `    "/doi/${doiSuffix}" "/id/${typeSlug}/${nameSlug}.html";\n`;
    }
  }
  gappedConegConf += `}\n`;
```

In `nginx-gapped.conf`:
```nginx
        # Gapped DOI Resolver: Redirects to HTML landing page
        location ~ ^/doi/ {
            if ($doi_payload_uri = "") {
                return 404;
            }
            add_header Access-Control-Allow-Origin * always;
            add_header Access-Control-Expose-Headers "Location" always;
            return 303 $scheme://$http_host$doi_payload_uri;
        }
```

- [ ] **Step 4: Run generator and tests to verify they pass**

Run:
```bash
bun run generate
bun test test/gappedServer.test.ts
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add generator/gappedGenerator.ts nginx-gapped.conf test/gappedServer.test.ts
git commit -m "feat: simulate gapped DOI HTML landing page trap on port 8081"
```

---

### Task 4: Update Audit Dashboard, Compliance Docs, and Full Test Suite

**Files:**
- Modify: `generator/auditPageRenderer.ts`
- Modify: `generator/complianceDocs.ts`
- Modify: `README.md`
- Test: `test/nginxIntegration.test.ts`, `test/gappedServer.test.ts`

**Interfaces:**
- Consumes: Generated compliance JSON and test commands
- Produces: Updated `/audit.html`, `/compliance.json`, `docs/compliance/ro-crate-paper.md`

- [ ] **Step 1: Update compliance audit entries in `generator/auditPageRenderer.ts` and `generator/complianceDocs.ts`**

Update the test commands and descriptions for `ro-crate-paper` to include testing the local DOI resolution:
```typescript
    testCommand8080: "curl -I http://localhost:8080/doi/10.3897/biss.6.94630 && curl -I http://localhost:8080/data/ro-crate-paper.pdf",
    testCommand8081: "curl -I http://localhost:8081/doi/10.3897/biss.6.94630 && curl -I http://localhost:8081/data/ro-crate-paper.pdf",
```

- [ ] **Step 2: Run full build and test suite**

Run:
```bash
bun run generate
bun test
```
Expected: All tests PASS with 0 failures.

- [ ] **Step 3: Commit**

```bash
git add generator/auditPageRenderer.ts generator/complianceDocs.ts README.md
git commit -m "docs: update compliance docs and audit dashboard for RT-04 local DOI"
```
