import { MarineEntity, getEntityTypeSlug, getEntityNameSlug } from "./types";
import { RESOURCES } from "./resources";

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
    testCommand8080: "curl -I http://localhost:8080/data/ro-crate-paper.pdf",
    testCommand8081: "curl -I http://localhost:8081/data/ro-crate-paper.pdf",
    expectedDiff: "8080 includes Link: </id/publication/ro-crate-paper>; rel='cite-as'; 8081 omits cite-as header."
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
    testCommand8080: "curl -s http://localhost:8080/.well-known/api-catalog | grep /api/v1/observations",
    testCommand8081: "curl -s http://localhost:8081/.well-known/api-catalog | grep /api/v1/observations",
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
        description: "100% Fully Compliant Reference Implementation (RT-P01 through RT-P08)",
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
  <title>Radical Transparency Compliance & Gap Audit</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="/style.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <style>
    :root {
      --bg-dark: #0f172a;
      --bg-panel: #1e293b;
      --panel-border: #334155;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --accent-blue: #38bdf8;
      --accent-teal: #2dd4bf;
      --accent-green: #4ade80;
      --accent-red: #f87171;
      --accent-amber: #fbbf24;
    }
    body {
      background: var(--bg-dark);
      color: var(--text-main);
      font-family: 'Inter', sans-serif;
      margin: 0;
      padding: 0;
    }
    .audit-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2.5rem 1.5rem;
    }
    .audit-header {
      text-align: center;
      margin-bottom: 3rem;
    }
    .audit-header h1 {
      font-family: 'Outfit', sans-serif;
      font-size: 2.75rem;
      font-weight: 900;
      margin: 0 0 0.75rem;
      background: linear-gradient(135deg, #38bdf8 0%, #2dd4bf 50%, #4ade80 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .audit-header p {
      font-size: 1.15rem;
      color: var(--text-muted);
      max-width: 800px;
      margin: 0 auto 1.5rem;
      line-height: 1.6;
    }
    .server-cards {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 3rem;
    }
    .server-card {
      background: var(--bg-panel);
      border: 1px solid var(--panel-border);
      border-radius: 12px;
      padding: 1.75rem;
    }
    .server-card.ref {
      border-top: 4px solid var(--accent-green);
    }
    .server-card.gapped {
      border-top: 4px solid var(--accent-amber);
    }
    .server-card h3 {
      font-family: 'Outfit', sans-serif;
      font-size: 1.4rem;
      margin: 0 0 0.5rem;
    }
    .badge-port {
      display: inline-block;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.85rem;
      font-weight: 700;
      padding: 0.25rem 0.6rem;
      border-radius: 6px;
      background: #0f172a;
      border: 1px solid var(--panel-border);
      margin-bottom: 1rem;
    }
    .matrix-table-wrap {
      background: var(--bg-panel);
      border: 1px solid var(--panel-border);
      border-radius: 12px;
      overflow-x: auto;
      margin-bottom: 3rem;
    }
    table.matrix-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.9rem;
    }
    table.matrix-table th {
      background: #0f172a;
      padding: 1rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      font-size: 0.78rem;
      border-bottom: 1px solid var(--panel-border);
    }
    table.matrix-table td {
      padding: 1rem;
      border-bottom: 1px solid var(--panel-border);
      vertical-align: top;
    }
    table.matrix-table tr:hover {
      background: rgba(255, 255, 255, 0.02);
    }
    .status-badge {
      display: inline-block;
      font-size: 0.78rem;
      font-weight: 700;
      padding: 0.25rem 0.6rem;
      border-radius: 9999px;
    }
    .status-badge.pass {
      background: #14532d;
      color: #86efac;
    }
    .status-badge.fail {
      background: #7f1d1d;
      color: #fca5a5;
    }
    .status-badge.gap {
      background: #78350f;
      color: #fde68a;
    }
    .code-box {
      background: #090d16;
      border: 1px solid #1e293b;
      border-radius: 6px;
      padding: 0.5rem 0.75rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8rem;
      color: #38bdf8;
      margin-top: 0.4rem;
      overflow-x: auto;
      white-space: pre;
    }
  </style>
</head>
<body>
  <header style="background: #090d16; border-bottom: 1px solid #1e293b; padding: 1rem 1.5rem;">
    <div style="max-width: 1400px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;">
      <a href="/" style="color: #ffffff; text-decoration: none; font-family: 'Outfit', sans-serif; font-size: 1.25rem; font-weight: 800;">
        ⚓ VLIZ Marine LOD Portal
      </a>
      <div style="display: flex; gap: 1rem; font-size: 0.9rem;">
        <a href="/" style="color: #94a3b8; text-decoration: none;">Catalogue</a>
        <a href="/map.html" style="color: #94a3b8; text-decoration: none;">🗺️ Metro Map</a>
        <a href="/id/profiles" style="color: #94a3b8; text-decoration: none;">Profiles</a>
        <a href="/audit.html" style="color: #38bdf8; font-weight: 700; text-decoration: none;">📊 Gap Audit</a>
      </div>
    </div>
  </header>

  <main class="audit-container">
    <div class="audit-header">
      <h1>Radical Transparency Compliance & Gap Audit</h1>
      <p>
        Side-by-side verification matrix comparing the <strong>Gold Standard Reference Implementation (Port 8080)</strong> against the <strong>Simulated Gapped Repository (Port 8081)</strong> implementing real-world semantic deficiencies across all catalog resources.
      </p>
      <a href="/compliance.json" target="_blank" class="author-pill" style="background: #0284c7; color: #ffffff; padding: 0.5rem 1rem; text-decoration: none; font-weight: 600;">
        <i class="fa-solid fa-download"></i> Download Machine-Readable Audit JSON (/compliance.json)
      </a>
    </div>

    <div class="server-cards">
      <div class="server-card ref">
        <span class="badge-port" style="color: #4ade80;"><i class="fa-solid fa-server"></i> REFERENCE CONTAINER (PORT 8080)</span>
        <h3>Gold Standard Reference Instance</h3>
        <p style="color: #94a3b8; font-size: 0.92rem; line-height: 1.5;">
          100% compliant implementation featuring all 8 EOSC Radical Transparency patterns (RT-P01 through RT-P08), bidirectional RFC 9264 JSON Linksets, W3C DX-PROF validation shapes, RFC 9727 API catalogs, and ResourceSync sitemaps.
        </p>
        <div style="font-size: 0.85rem; font-weight: 700; color: #86efac;">
          ✅ Compliance Score: 100% (All 9 Resources Pass)
        </div>
      </div>

      <div class="server-card gapped">
        <span class="badge-port" style="color: #fbbf24;"><i class="fa-solid fa-triangle-exclamation"></i> GAPPED CONTAINER (PORT 8081)</span>
        <h3>Simulated Gapped Repository Instance</h3>
        <p style="color: #94a3b8; font-size: 0.92rem; line-height: 1.5;">
          Deliberately injects distinct semantic gaps across 8 resources (missing 303 conneg, silent server lacking HTTP link headers, 404 on linksets, missing profile assertions, orphan APIs, and broken reverse format anchors).
        </p>
        <div style="font-size: 0.85rem; font-weight: 700; color: #fde68a;">
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
                <div style="font-weight: 700; color: #f8fafc;">${spec.title}</div>
                <div style="font-size: 0.8rem; color: #38bdf8; font-family: monospace;">/id/${spec.typeSlug}/${spec.nameSlug}</div>
                <span class="status-badge" style="background: #1e293b; color: #94a3b8; margin-top: 0.3rem;">${spec.category}</span>
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
                  ? '<span style="color: #4ade80; font-size: 0.8rem; font-weight: 600;">None (100% OK)</span>'
                  : spec.missingPatterns.map(p => `<span class="status-badge fail" style="margin-right: 0.25rem; margin-bottom: 0.25rem;">${p}</span>`).join('')
                }
              </td>
              <td>
                <div style="font-size: 0.85rem; color: #cbd5e1; margin-bottom: 0.35rem;">${spec.description}</div>
                <div style="font-size: 0.75rem; color: #94a3b8;">Expected Diff: ${spec.expectedDiff}</div>
                <div class="code-box"># Test 8080: ${spec.testCommand8080}\n# Test 8081: ${spec.testCommand8081}</div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  </main>

  <footer style="background: #090d16; border-top: 1px solid #1e293b; padding: 2rem 1.5rem; text-align: center; color: #64748b; font-size: 0.85rem;">
    <div><strong>VLIZ Marine Linked Data Portal</strong> — Dual-Container Radical Transparency Test Topology</div>
  </footer>
</body>
</html>`;
}
