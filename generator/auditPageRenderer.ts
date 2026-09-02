import { MarineEntity, getEntityTypeSlug, getEntityNameSlug } from "./types";
import { RESOURCES } from "./resources";
import { renderHeader, renderFooter } from "./htmlTemplates";

export interface ResourceGapSpec {
  resourceId: string;
  nameSlug: string;
  typeSlug: string;
  title: string;
  category: string;
  archetype: string;
  port8080Status: "100% Compliant";
  port8081Status: string;
  missingPatterns: string[];
  compliantPatterns: string[];
  description: string;
  testCommand8080: string;
  testCommand8081: string;
  expectedDiff: string;
}

export const RESOURCE_GAP_SPECS: ResourceGapSpec[] = [
  {
    resourceId: "resource-arms-mbon",
    nameSlug: "arms-mbon",
    typeSlug: "dataset",
    title: "ARMS-MBON Metagenomic 18S Observations",
    category: "Dataset",
    archetype: "Gold Standard Baseline",
    port8080Status: "100% Compliant",
    port8081Status: "100% Compliant",
    missingPatterns: [],
    compliantPatterns: ["RT-P01", "RT-P02", "RT-P03", "RT-P04", "RT-P05", "RT-P06", "RT-P07", "RT-P08"],
    description: "Fully compliant control baseline on both servers for side-by-side comparison.",
    testCommand8080: "curl -I http://localhost:8080/id/dataset/arms-mbon",
    testCommand8081: "curl -I http://localhost:8081/id/dataset/arms-mbon",
    expectedDiff: "Both servers return 303 redirect with full RFC 8288 Link headers and RFC 9264 Linkset."
  },
  {
    resourceId: "resource-arms-2018",
    nameSlug: "arms-2018",
    typeSlug: "dataset",
    title: "ARMS 2018 Ecological Baseline",
    category: "Dataset",
    archetype: "Legacy Plain-HTML Silo",
    port8080Status: "100% Compliant",
    port8081Status: "Missing 303 Conneg, RDF & Link Headers (HTML Only)",
    missingPatterns: ["RT-P01", "RT-P03", "RT-P04", "RT-P08"],
    compliantPatterns: [],
    description: "Serves plain HTML directly. No 303 redirection, no RDF formats (.ttl/.jsonld return 404), no Link headers, no linkset.",
    testCommand8080: "curl -I -H 'Accept: text/turtle' http://localhost:8080/id/dataset/arms-2018",
    testCommand8081: "curl -I -H 'Accept: text/turtle' http://localhost:8081/id/dataset/arms-2018",
    expectedDiff: "8080 returns 303 to arms-2018.ttl; 8081 returns 200 plain HTML, ignoring Accept header."
  },
  {
    resourceId: "resource-north-sea-sensors",
    nameSlug: "north-sea-sensors",
    typeSlug: "dataset",
    title: "North Sea Acoustic Telemetry Sensors",
    category: "Dataset",
    archetype: "Silent Server (No HTTP Signposts)",
    port8080Status: "100% Compliant",
    port8081Status: "Missing RFC 8288 Link Response Headers",
    missingPatterns: ["RT-P01", "RT-P03 (Headers)"],
    compliantPatterns: ["RT-P03 (Conneg)", "RT-P04", "RT-P07"],
    description: "303 conneg works, but Nginx emits zero RFC 8288 Link headers. Harvesters cannot discover linkset or profile metadata.",
    testCommand8080: "curl -I http://localhost:8080/id/dataset/north-sea-sensors.ttl",
    testCommand8081: "curl -I http://localhost:8081/id/dataset/north-sea-sensors.ttl",
    expectedDiff: "8080 includes Link: <...linkset.json>; rel='linkset'; 8081 omits all Link headers."
  },
  {
    resourceId: "resource-eurobis",
    nameSlug: "eurobis-occurrences",
    typeSlug: "dataset",
    title: "EurOBIS European Marine Species Occurrences",
    category: "Dataset",
    archetype: "Missing Profile & Schema Conformance",
    port8080Status: "100% Compliant",
    port8081Status: "Missing W3C DX-PROF & schema:conformsTo",
    missingPatterns: ["RT-P01", "RT-P02"],
    compliantPatterns: ["RT-P03", "RT-P04", "RT-P07"],
    description: "Conneg and linkset work, but omits rel='profile' headers and schema:conformsTo in the RDF serialization.",
    testCommand8080: "curl -s http://localhost:8080/id/dataset/eurobis-occurrences.ttl | grep conformsTo",
    testCommand8081: "curl -s http://localhost:8081/id/dataset/eurobis-occurrences.ttl | grep conformsTo",
    expectedDiff: "8080 contains schema:conformsTo profile URI; 8081 contains no profile conformance assertions."
  },
  {
    resourceId: "resource-vliz",
    nameSlug: "vliz",
    typeSlug: "institute",
    title: "Flanders Marine Institute (VLIZ)",
    category: "Institute",
    archetype: "Missing RFC 9264 Linkset File",
    port8080Status: "100% Compliant",
    port8081Status: "404 Not Found on .linkset.json",
    missingPatterns: ["RT-P03 (Linkset File)", "RT-P08"],
    compliantPatterns: ["RT-P01", "RT-P03 (Conneg)", "RT-P07"],
    description: "Emits Link headers and conneg, but the advertised /id/institute/vliz.linkset.json returns HTTP 404.",
    testCommand8080: "curl -I http://localhost:8080/id/institute/vliz.linkset.json",
    testCommand8081: "curl -I http://localhost:8081/id/institute/vliz.linkset.json",
    expectedDiff: "8080 returns 200 OK with valid JSON linkset; 8081 returns 404 Not Found."
  },
  {
    resourceId: "resource-rocrate-paper",
    nameSlug: "ro-crate-paper",
    typeSlug: "publication",
    title: "Contemporary Data Management with RO-Crate Paper",
    category: "Publication",
    archetype: "Unanchored Data Payload Download",
    port8080Status: "100% Compliant",
    port8081Status: "Missing rel='cite-as' on Download Payload",
    missingPatterns: ["RT-P04 (Cite-As)"],
    compliantPatterns: ["RT-P03", "RT-P07"],
    description: "PDF file is served, but omits Link: <PID>; rel='cite-as'. Machines cannot trace downloaded PDF to its conceptual PID.",
    testCommand8080: "curl -I http://localhost:8080/doi/10.3897/biss.6.94630 && curl -I http://localhost:8080/data/ro-crate-paper.pdf",
    testCommand8081: "curl -I http://localhost:8081/doi/10.3897/biss.6.94630 && curl -I http://localhost:8081/data/ro-crate-paper.pdf",
    expectedDiff: "8080 DOI 303s directly to PDF payload with rel='cite-as' to DOI; 8081 DOI redirects to HTML landing page and PDF omits cite-as."
  },
  {
    resourceId: "resource-marineinfo-api",
    nameSlug: "marineinfo-api",
    typeSlug: "service",
    title: "Marine Observations Subsetting API",
    category: "API Service",
    archetype: "Orphan Subsetting API Endpoint",
    port8080Status: "100% Compliant",
    port8081Status: "Omitted from RFC 9727 API Catalog & Missing cite-as",
    missingPatterns: ["RT-P05", "RT-P06"],
    compliantPatterns: [],
    description: "API returns observations, but omits rel='cite-as', rel='service-desc', and is unindexed in /.well-known/api-catalog.",
    testCommand8080: "curl -s http://localhost:8080/.well-known/api-catalog | grep /api/observations/v1",
    testCommand8081: "curl -s http://localhost:8081/.well-known/api-catalog | grep /api/observations/v1",
    expectedDiff: "8080 catalog registers the observations endpoint; 8081 catalog does not register the API."
  },
  {
    resourceId: "resource-maregraph",
    nameSlug: "maregraph",
    typeSlug: "project",
    title: "MareGraph Project Infrastructure",
    category: "Project",
    archetype: "Flat Legacy Sitemap Without ResourceSync",
    port8080Status: "100% Compliant",
    port8081Status: "Missing from Modular Sitemaps & No rs:ln",
    missingPatterns: ["RT-P07"],
    compliantPatterns: ["RT-P03"],
    description: "Omitted from modular sub-sitemaps (sitemap-catalog.xml). Only present in legacy sitemap without rs:ln signposts.",
    testCommand8080: "curl -s http://localhost:8080/sitemap.xml | grep maregraph",
    testCommand8081: "curl -s http://localhost:8081/sitemap.xml | grep maregraph",
    expectedDiff: "8080 uses ResourceSync rs:ln rel='type' and rel='profile'; 8081 uses plain <loc> tags."
  },
  {
    resourceId: "resource-katrina",
    nameSlug: "katrina",
    typeSlug: "person",
    title: "Dr. Katrina P. (Marine Biologist)",
    category: "Person",
    archetype: "Malformed Linkset (No Inverse self Bindings)",
    port8080Status: "100% Compliant",
    port8081Status: "Missing Inverse Format anchor/self Entries",
    missingPatterns: ["RT-P03 (Inverse Bindings)"],
    compliantPatterns: ["RT-P01", "RT-P07"],
    description: "Linkset has anchor: PID + alternate, but omits reverse format anchor entries (anchor: ...ttl, self: PID).",
    testCommand8080: "curl -s http://localhost:8080/id/person/katrina.linkset.json",
    testCommand8081: "curl -s http://localhost:8081/id/person/katrina.linkset.json",
    expectedDiff: "8080 contains 5 anchor blocks (bidirectional); 8081 contains only the single primary anchor block."
  },
  {
    resourceId: "resource-dataset-90",
    nameSlug: "dataset-90",
    typeSlug: "dataset",
    title: "Macrobenthos of the Belgian Part of the North Sea (Dataset 90)",
    category: "Dataset",
    archetype: "Unlinked Releases & Missing Lifecycle Navigation",
    port8080Status: "100% Compliant",
    port8081Status: "Missing RFC 5829 Lifecycle Links & History Archive",
    missingPatterns: ["RT-P09"],
    compliantPatterns: ["RT-P01", "RT-P03", "RT-P04"],
    description: "Series DOI and releases exist on port 8081, but omit RFC 5829 latest-version, predecessor-version, successor-version, and version-history links.",
    testCommand8080: "curl -I http://localhost:8080/id/dataset/dataset-90.html",
    testCommand8081: "curl -I http://localhost:8081/id/dataset/dataset-90.html",
    expectedDiff: "8080 includes rel='latest-version' and rel='version-history' pointing to releases and archive; 8081 omits lifecycle headers."
  }
];

export function generateComplianceJson(baseUrl8080: string, baseUrl8081: string): object {
  return {
    title: "EOSC Radical Transparency Dual-Container Compliance Audit",
    generatedAt: new Date().toISOString(),
    instances: {
      referenceServer: {
        baseUrl: baseUrl8080,
        port: 8080,
        description: "100% Fully Compliant Reference Implementation (RT-P01 through RT-P09)",
        complianceScore: "100%"
      },
      gappedServer: {
        baseUrl: baseUrl8081,
        port: 8081,
        description: "Simulated Legacy / Gapped Repository exhibiting realistic defects across resources",
        complianceScore: "33%"
      }
    },
    resources: RESOURCE_GAP_SPECS.map(spec => ({
      resourceId: spec.resourceId,
      slug: spec.nameSlug,
      category: spec.category,
      title: spec.title,
      archetype: spec.archetype,
      referencePort8080: {
        status: spec.port8080Status,
        compliantPatterns: ["RT-P01", "RT-P02", "RT-P03", "RT-P04", "RT-P05", "RT-P06", "RT-P07", "RT-P08"],
        missingPatterns: []
      },
      gappedPort8081: {
        status: spec.port8081Status,
        compliantPatterns: spec.compliantPatterns,
        missingPatterns: spec.missingPatterns
      },
      verificationDiff: {
        command8080: spec.testCommand8080,
        command8081: spec.testCommand8081,
        expectedDifference: spec.expectedDiff
      }
    }))
  };
}

export function generateAuditHtml(baseUrl8080: string, baseUrl8081: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Radical Transparency Compliance & Gap Audit - VLIZ Portal</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="/style.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="alternate" type="application/json" href="/compliance.json">
</head>
<body>
  ${renderHeader('audit')}

  <section class="hero">
    <div class="hero-container">
      <span class="hero-tag">Radical Transparency &bull; Dual-Container Audit</span>
      <h2>Radical Transparency Compliance & Gap Audit</h2>
      <p>Side-by-side verification matrix comparing the <strong>Gold Standard Reference Implementation (Port 8080)</strong> against the <strong>Simulated Gapped Repository (Port 8081)</strong> exhibiting real-world semantic deficiencies across all catalog resources.</p>
      
      <div class="rt-proposal-bar" style="margin-top: 1.5rem;">
        <div class="rt-proposal-info">
          <h4>Dual-Container Verification & Compliance API</h4>
          <p>Automated parity diagnostics and machine-readable JSON evaluating RT-P01 through RT-P08 specifications.</p>
        </div>
        <div class="rt-proposal-buttons">
          <a href="/compliance.json" target="_blank" class="rt-btn primary">
            <i class="fa-solid fa-download"></i> Machine-Readable JSON (/compliance.json)
          </a>
          <a href="/map.html" class="rt-btn" style="background: rgba(13, 148, 136, 0.5); border-color: #0d9488;">
            🗺️ RT Metro Map
          </a>
          <a href="/id/profiles" class="rt-btn" style="background: rgba(99, 102, 241, 0.4); border-color: #6366f1;">
            📑 Semantic Profiles
          </a>
        </div>
      </div>
    </div>
  </section>

  <main class="main-container">
    <div class="server-cards">
      <div class="server-card ref">
        <span class="badge-port" style="color: #16a34a; background: #f0fdf4; border-color: #bbf7d0;"><i class="fa-solid fa-server"></i> REFERENCE CONTAINER (PORT 8080)</span>
        <h3>Gold Standard Reference Instance</h3>
        <p style="color: var(--text-secondary); font-size: 0.92rem; line-height: 1.5; margin: 0 0 1rem;">
          100% compliant implementation featuring all 8 EOSC Radical Transparency patterns (RT-P01 through RT-P08), bidirectional RFC 9264 JSON Linksets, W3C DX-PROF validation shapes, RFC 9727 API catalogs, and ResourceSync sitemaps.
        </p>
        <div style="font-size: 0.85rem; font-weight: 700; color: #16a34a;">
          ✅ Compliance Score: 100% (All 9 Resources Pass)
        </div>
      </div>

      <div class="server-card gapped">
        <span class="badge-port" style="color: #d97706; background: #fffbeb; border-color: #fde68a;"><i class="fa-solid fa-triangle-exclamation"></i> GAPPED CONTAINER (PORT 8081)</span>
        <h3>Simulated Gapped Repository Instance</h3>
        <p style="color: var(--text-secondary); font-size: 0.92rem; line-height: 1.5; margin: 0 0 1rem;">
          Deliberately injects distinct semantic gaps across 8 resources (missing 303 conneg, silent server lacking HTTP link headers, 404 on linksets, missing profile assertions, orphan APIs, and broken reverse format anchors).
        </p>
        <div style="font-size: 0.85rem; font-weight: 700; color: #b45309;">
          ⚠️ Simulated Maturity Score: 33% (8 Resources Gapped, 1 Control Baseline)
        </div>
      </div>
    </div>

    <div class="matrix-table-wrap">
      <table class="matrix-table">
        <thead>
          <tr>
            <th style="width: 220px;">Resource & Category</th>
            <th style="width: 180px;">Simulated Gap Archetype</th>
            <th style="width: 160px;">Port 8080 (Reference)</th>
            <th style="width: 220px;">Port 8081 (Gapped Server)</th>
            <th>Missing Patterns</th>
            <th>Verification Diagnostic</th>
          </tr>
        </thead>
        <tbody>
          ${RESOURCE_GAP_SPECS.map(spec => `
            <tr>
              <td>
                <div style="font-weight: 700; color: var(--text-primary);"><a href="/id/${spec.typeSlug}/${spec.nameSlug}.html" style="color: var(--text-primary); text-decoration: none;">${spec.title}</a></div>
                <div style="font-size: 0.8rem; color: var(--marine-teal); font-family: monospace; margin: 0.2rem 0;">/id/${spec.typeSlug}/${spec.nameSlug}</div>
                <span class="card-badge ${spec.category.toLowerCase()}" style="font-size: 0.72rem; padding: 0.15rem 0.5rem;">${spec.category}</span>
              </td>
              <td>
                <span class="status-badge gap">${spec.archetype}</span>
              </td>
              <td>
                <span class="status-badge pass"><i class="fa-solid fa-check"></i> 100% Pass</span>
              </td>
              <td>
                <span class="status-badge ${spec.missingPatterns.length === 0 ? 'pass' : 'fail'}">
                  ${spec.missingPatterns.length === 0 ? '<i class="fa-solid fa-check"></i> 100% Pass' : '<i class="fa-solid fa-triangle-exclamation"></i> ' + spec.port8081Status}
                </span>
              </td>
              <td>
                ${spec.missingPatterns.length === 0
                  ? '<span style="color: #16a34a; font-size: 0.82rem; font-weight: 600;">None (100% OK)</span>'
                  : spec.missingPatterns.map(p => `<span class="status-badge fail" style="margin-right: 0.25rem; margin-bottom: 0.25rem;">${p}</span>`).join('')
                }
              </td>
              <td>
                <div style="font-size: 0.88rem; color: var(--text-primary); margin-bottom: 0.35rem;">${spec.description}</div>
                <div style="font-size: 0.78rem; color: var(--text-muted); font-weight: 500;">Expected Diff: ${spec.expectedDiff}</div>
                <div class="code-box"># Test 8080: ${spec.testCommand8080}\n# Test 8081: ${spec.testCommand8081}</div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  </main>

  ${renderFooter()}
</body>
</html>`;
}
