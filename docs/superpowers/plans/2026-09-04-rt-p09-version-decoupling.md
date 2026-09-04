# RT-P09 Version Decoupling & Release Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Decouple the versioning lifecycles of Dataset 90, its CSV distributions, its metadata records, and its semantic profiles, while updating RFC 5829 `version-history` links to point directly to machine-readable RFC 9264 linksets typed as `application/linkset+json`.

**Architecture:** 
1. Define pure SemVer versions without `'v'` prefix for domain profile `dcat-dataset-profile` (`1.0.0`, `2.0.0`, `3.0.0`) and packaging profile `ro-crate-package-profile` (`1.0.0`, `1.1.0`).
2. Add `metadataProfileId` to `MarineEntity` so dataset releases can conform to a domain dataset profile while their `.ttl` metadata records independently conform to an archival packaging profile.
3. Update `generateLinkset` and `generateProfileLinkset` to emit `rel="version-history"` targeting `.../history.linkset.json` with `type="application/linkset+json"` and remove obsolete `collection` relations.
4. Align `generator/index.ts`, `DiscoveryCascadeEngine.ts`, and Nginx headers with the decoupled schema and verify with `bun test` and Docker curl assertions.

**Tech Stack:** TypeScript, Bun, Nginx, RFC 5829 (Versioning), RFC 9264 (Linkset JSON), RFC 8288 (HTTP Link Headers).

**Spec:** [`docs/superpowers/specs/2026-09-04-rt-p09-version-decoupling-design.md`](file:///c:/Users/cedricd/Documents/Github/lod_docker_webserver/docs/superpowers/specs/2026-09-04-rt-p09-version-decoupling-design.md)

## Global Constraints

- Profiles must use Semantic Versioning without `'v'` prefix in their release URIs (e.g. `/id/profile/dcat-dataset-profile/1.0.0`).
- The `version-history` link relation must explicitly include `type="application/linkset+json"` and point to `/id/.../history.linkset.json`.
- All standard representations (`.ttl`, `.jsonld`, `.html`, `.rdf`), DOIs (`cite-as`), and data payloads (`item`) must remain preserved in linksets.
- Do NOT include `rel="collection"` on standalone dataset releases.
- All existing tests in `bun test` must pass.

---

## Task Decomposition

### Task 1: Profile Schema & Lifecycle Decoupling

**Files:**
- Modify: `generator/profiles.ts:50-145`
- Modify: `generator/profileGenerator.ts:1-120`
- Test: `test/linksetGenerator.test.ts`

**Interfaces:**
- Consumes: `Profile` interface from `generator/profiles.ts`
- Produces: Decoupled SemVer profile definitions (`dcat-dataset-profile-1.0.0`, `2.0.0`, `3.0.0` and `ro-crate-package-profile-1.0.0`, `1.1.0`) with `history.linkset.json` support.

- [ ] **Step 1: Write the failing test**

In `test/linksetGenerator.test.ts`, update profile tests to assert pure SemVer URIs and typed `version-history` linksets:

```ts
it("generates Profile release linkset with rel=http://schema.org/hasPart and typed version-history linkset", () => {
  const v11 = getProfileById("ro-crate-package-profile-1.1.0")!;
  const ls: any = generateProfileLinkset(v11, BASE_URL);
  const anchor = ls.linkset[0];
  expect(anchor.anchor).toBe(`${BASE_URL}/id/profile/ro-crate-package-profile/1.1.0`);
  expect(anchor["http://schema.org/hasPart"][0].href).toBe(`${BASE_URL}/id/profile/ro-crate-package-profile`);
  expect(anchor["predecessor-version"][0].href).toBe(`${BASE_URL}/id/profile/ro-crate-package-profile/1.0.0`);
  expect(anchor["version-history"][0].href).toBe(`${BASE_URL}/id/profile/ro-crate-package-profile/history.linkset.json`);
  expect(anchor["version-history"][0].type).toBe("application/linkset+json");
});

it("generates DCAT-3 AP Dataset Profile releases with SemVer", () => {
  const dcat3 = getProfileById("dcat-dataset-profile-3.0.0")!;
  const ls: any = generateProfileLinkset(dcat3, BASE_URL);
  const anchor = ls.linkset[0];
  expect(anchor.anchor).toBe(`${BASE_URL}/id/profile/dcat-dataset-profile/3.0.0`);
  expect(anchor["predecessor-version"][0].href).toBe(`${BASE_URL}/id/profile/dcat-dataset-profile/2.0.0`);
  expect(anchor["version-history"][0].href).toBe(`${BASE_URL}/id/profile/dcat-dataset-profile/history.linkset.json`);
  expect(anchor["version-history"][0].type).toBe("application/linkset+json");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test test/linksetGenerator.test.ts`  
Expected: FAIL due to missing profile IDs and legacy URI generation.

- [ ] **Step 3: Update `generator/profiles.ts` and `generator/profileGenerator.ts`**

1. In `generator/profiles.ts`:
   - Replace `dcat3-dataset-profile` with conceptual profile `dcat-dataset-profile` (latest: `dcat-dataset-profile-3.0.0`) and releases `dcat-dataset-profile-1.0.0`, `dcat-dataset-profile-2.0.0`, `dcat-dataset-profile-3.0.0`.
   - Update `ro-crate-package-profile` releases to `ro-crate-package-profile-1.0.0` (version `"1.0.0"`) and `ro-crate-package-profile-1.1.0` (version `"1.1.0"`).
2. In `generator/profileGenerator.ts`:
   - Update `getProfileUri` to format without `'v'` prefix: `${baseUrl}/id/profile/${profile.abstractProfileId}/${profile.version}`.
   - Update `generateProfileLinkset`:
     - Set `version-history`: `[{ href: `${absUri}/history.linkset.json`, type: "application/linkset+json" }]`.
   - Update `generateProfileHistoryLinkset`:
     - Set anchor to `${profileUri}/history.linkset.json`.

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test test/linksetGenerator.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add generator/profiles.ts generator/profileGenerator.ts test/linksetGenerator.test.ts
git commit -m "feat(profiles): decouple profile versioning with SemVer and history linksets"
```

---

### Task 2: Resource Entity Definitions & Decoupled Profile Conformance

**Files:**
- Modify: `generator/types.ts:40-60`
- Modify: `generator/resources.ts:220-380`
- Modify: `test/resources.test.ts`

**Interfaces:**
- Consumes: `metadataProfileId` in `MarineEntity`
- Produces: Updated Dataset 90 entities referencing decoupled profiles and history linkset.

- [ ] **Step 1: Write the failing test**

In `test/resources.test.ts`, assert that Dataset 90 and its releases reference the decoupled profiles and `history.linkset.json`:

```ts
it("configures Dataset 90 with decoupled domain profile and history linkset", () => {
  const series = getResourceById("resource-dataset-90")!;
  expect(series.profileId).toBe("dcat-dataset-profile");
  expect(series.historyUri).toBe("/id/dataset/dataset-90/history.linkset.json");

  const v21 = getResourceById("resource-dataset-90-v2.1")!;
  expect(v21.profileId).toBe("dcat-dataset-profile-3.0.0");
  expect(v21.metadataProfileId).toBe("ro-crate-package-profile-1.1.0");

  const v20 = getResourceById("resource-dataset-90-v2.0")!;
  expect(v20.profileId).toBe("dcat-dataset-profile-2.0.0");
  expect(v20.metadataProfileId).toBe("ro-crate-package-profile-1.0.0");

  const v10 = getResourceById("resource-dataset-90-v1.0")!;
  expect(v10.profileId).toBe("dcat-dataset-profile-1.0.0");
  expect(v10.metadataProfileId).toBe("ro-crate-package-profile-1.0.0");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test test/resources.test.ts`  
Expected: FAIL due to mismatched profileId and missing metadataProfileId.

- [ ] **Step 3: Update `generator/types.ts` and `generator/resources.ts`**

1. In `generator/types.ts`, add `metadataProfileId?: string;` to `Resource`.
2. In `generator/resources.ts`:
   - Update `resource-dataset-90`: `profileId: "dcat-dataset-profile"`, `historyUri: "/id/dataset/dataset-90/history.linkset.json"`.
   - Update `resource-dataset-90-v1.0`: `profileId: "dcat-dataset-profile-1.0.0"`, `metadataProfileId: "ro-crate-package-profile-1.0.0"`.
   - Update `resource-dataset-90-v2.0`: `profileId: "dcat-dataset-profile-2.0.0"`, `metadataProfileId: "ro-crate-package-profile-1.0.0"`.
   - Update `resource-dataset-90-v2.1`: `profileId: "dcat-dataset-profile-3.0.0"`, `metadataProfileId: "ro-crate-package-profile-1.1.0"`.

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test test/resources.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add generator/types.ts generator/resources.ts test/resources.test.ts
git commit -m "feat(resources): decouple profile conformance for Dataset 90 and metadata records"
```

---

### Task 3: Linkset Generation & Navigation Architecture

**Files:**
- Modify: `generator/linksetGenerator.ts:80-150`
- Modify: `test/linksetGenerator.test.ts`

**Interfaces:**
- Consumes: `generateLinkset` and `generateHistoryLinkset`
- Produces: RFC 9264 linksets with typed `version-history`, metadata packaging profile anchors, and no deprecated `collection` links.

- [ ] **Step 1: Write the failing test**

In `test/linksetGenerator.test.ts`:

```ts
it("generates Series linkset with latest-version and typed version-history linkset", () => {
  const series = getResourceById("resource-dataset-90")!;
  const ls: any = generateLinkset(series, BASE_URL);
  const anchor = ls.linkset[0];
  expect(anchor.anchor).toBe(`${BASE_URL}/id/dataset/dataset-90`);
  expect(anchor["latest-version"][0].href).toBe(`${BASE_URL}/id/dataset/dataset-90/v2.1`);
  expect(anchor["version-history"][0].href).toBe(`${BASE_URL}/id/dataset/dataset-90/history.linkset.json`);
  expect(anchor["version-history"][0].type).toBe("application/linkset+json");
});

it("generates Release v2.1 linkset with predecessor-version, profile, and metadata profile", () => {
  const v21 = getResourceById("resource-dataset-90-v2.1")!;
  const ls: any = generateLinkset(v21, BASE_URL);
  const primary = ls.linkset[0];
  expect(primary.anchor).toBe(`${BASE_URL}/id/dataset/dataset-90/v2.1`);
  expect(primary["predecessor-version"][0].href).toBe(`${BASE_URL}/id/dataset/dataset-90/v2.0`);
  expect(primary["version-history"][0].href).toBe(`${BASE_URL}/id/dataset/dataset-90/history.linkset.json`);
  expect(primary["version-history"][0].type).toBe("application/linkset+json");
  expect(primary.profile[0].href).toBe(`${BASE_URL}/id/profile/dcat-dataset-profile/3.0.0`);
  expect(primary.collection).toBeUndefined();

  const ttlAnchor = ls.linkset.find((entry: any) => entry.anchor === `${BASE_URL}/id/dataset/dataset-90/v2.1.ttl`);
  expect(ttlAnchor).toBeDefined();
  expect(ttlAnchor.profile[0].href).toBe(`${BASE_URL}/id/profile/ro-crate-package-profile/1.1.0`);
});

it("generates History linkset with anchor pointing to history.linkset.json", () => {
  const series = getResourceById("resource-dataset-90")!;
  const releases = [
    getResourceById("resource-dataset-90-v1.0")!,
    getResourceById("resource-dataset-90-v2.0")!,
    getResourceById("resource-dataset-90-v2.1")!
  ];
  const ls: any = generateHistoryLinkset(series, releases, BASE_URL);
  expect(ls.linkset[0].anchor).toBe(`${BASE_URL}/id/dataset/dataset-90/history.linkset.json`);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test test/linksetGenerator.test.ts`  
Expected: FAIL due to legacy history link without type, present `collection` link, and missing metadata profile on `.ttl`.

- [ ] **Step 3: Update `generator/linksetGenerator.ts`**

1. In `generateLinkset`:
   - For `latestVersionId`:
     `primaryObj["version-history"] = [{ href: `${baseUrl}${idPath}/history.linkset.json`, type: "application/linkset+json" }];`
   - For `seriesId`:
     `primaryObj["version-history"] = [{ href: `${seriesUri}/history.linkset.json`, type: "application/linkset+json" }];`
     (Remove `primaryObj.collection = [{ href: seriesUri }]`).
   - For `.ttl` anchor:
     If `resource.metadataProfileId` is present:
     Resolve target profile URI via `getProfileById` + `getProfileUri` or `${baseUrl}/id/profile/...` and set `ttlObj.profile = [{ href: metadataProfileUri }]`.
2. In `generateHistoryLinkset`:
   - Set anchor to `${baseUrl}${idPath}/history.linkset.json`.

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test test/linksetGenerator.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add generator/linksetGenerator.ts test/linksetGenerator.test.ts
git commit -m "feat(linkset): implement typed history linksets and metadata packaging profile anchors"
```

---

### Task 4: Build Pipeline, Nginx Headers & Cascade Engine Alignment

**Files:**
- Modify: `generator/index.ts:130-170, 660-785`
- Modify: `generator/metromap/engine/DiscoveryCascadeEngine.ts:125-145`
- Modify: `test/nginxIntegration.test.ts`
- Modify: `test/htmlAndRdf.test.ts`

**Interfaces:**
- Consumes: Static generator output
- Produces: Clean `dist/` build, `nginx-headers.conf`, and verified discovery paths.

- [ ] **Step 1: Write the failing test**

Update `test/nginxIntegration.test.ts` and `test/htmlAndRdf.test.ts` to expect:
1. `nginx-headers.conf` without `collection` on `dataset-90-v*.csv` payloads.
2. `nginx-headers.conf` location blocks for `dcat-dataset-profile/history.linkset.json`.
3. HTML and RDF representations referencing decoupled profiles.

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test test/nginxIntegration.test.ts`  
Expected: FAIL.

- [ ] **Step 3: Update `generator/index.ts` and `DiscoveryCascadeEngine.ts`**

1. In `generator/index.ts`:
   - Output versioned profiles to `dist/id/profile/{abstractProfileId}/{version}.*` (without `'v'` prefix).
   - Generate history linkset for `dcat-dataset-profile`: `dist/id/profile/dcat-dataset-profile/history.linkset.json`.
   - Update `nginx-headers.conf` generation:
     - Remove `rel="collection"` from `dataset-90-v1.0.csv`, `dataset-90-v2.0.csv`, `dataset-90-v2.1.csv`.
     - Add `location = /id/profile/dcat-dataset-profile/history.linkset.json` with `default_type application/linkset+json;`.
2. In `generator/metromap/engine/DiscoveryCascadeEngine.ts`:
   - Update targetUri of history link to `/id/dataset/dataset-90/history.linkset.json`.
   - Update profile track targets to match the new profile IDs.

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test`  
Expected: All tests pass across the entire test suite.

- [ ] **Step 5: Commit**

```bash
git add generator/index.ts generator/metromap/engine/DiscoveryCascadeEngine.ts test/nginxIntegration.test.ts test/htmlAndRdf.test.ts
git commit -m "fix(build): align build pipeline, Nginx headers, and discovery engine with decoupled schema"
```

---

### Task 5: Full Build, Docker Deployment & Empirical Verification

**Files:**
- Output: `dist/`
- Runtime: Docker containers (`lod-webserver-reference`, port 8080)

**Interfaces:**
- Consumes: `bun run build`
- Produces: Running, verified Docker containers passing live curl inspections and RT assertions.

- [ ] **Step 1: Build the portal**

Run: `bun run build`  
Verify that all artifacts, linksets, and Nginx configurations are compiled without errors.

- [ ] **Step 2: Restart Docker container**

Run: `docker compose down && docker compose up -d`  
Wait 3 seconds for Nginx to initialize on port 8080.

- [ ] **Step 3: Empirically verify live endpoints via curl**

Verify:
```bash
# 1. Conceptual Dataset linkset header
curl -I http://localhost:8080/id/dataset/dataset-90
# Check: Link: <http://localhost:8080/id/dataset/dataset-90.linkset.json>; rel="linkset"; type="application/linkset+json"

# 2. Conceptual Linkset content
curl -s http://localhost:8080/id/dataset/dataset-90.linkset.json | jq .
# Check: version-history points to /history.linkset.json with type "application/linkset+json"

# 3. History Linkset content
curl -s http://localhost:8080/id/dataset/dataset-90/history.linkset.json | jq .
# Check: anchor is /history.linkset.json and item contains all 3 releases

# 4. Release v2.1 Linkset content
curl -s http://localhost:8080/id/dataset/dataset-90/v2.1.linkset.json | jq .
# Check: profile is dcat-dataset-profile/3.0.0, .ttl anchor profile is ro-crate-package-profile/1.1.0

# 5. CSV Payload headers
curl -I http://localhost:8080/data/dataset-90-v2.1.csv
# Check: cite-as points to /id/dataset/dataset-90/v2.1; NO rel="collection"
```

- [ ] **Step 4: Run full test suite & RT verification**

Run: `bun test`  
Run: `bash test/rt-test/run-all-tests.sh` (or bun runner)  
Expected: 100% PASS with zero regressions.

- [ ] **Step 5: Commit & Finalize Walkthrough**

```bash
git add dist/
git commit -m "chore(release): compile decoupled RT-P09 release artifacts and verify live system"
```
