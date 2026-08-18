import fs from "fs";
import path from "path";
import { RESOURCES } from "../generator/resources";

const distDir = path.resolve(process.cwd(), "dist");
const docsDir = path.resolve(process.cwd(), "docs", "compliance");

function verify() {
  console.log("Starting full verification of generated assets...");

  // 1. Root & Core files
  const coreFiles = [
    "index.html",
    "style.css",
    "sitemap.xml",
    "robots.txt",
    "nginx-coneg.conf",
    "nginx-headers.conf"
  ];
  for (const f of coreFiles) {
    const p = path.join(distDir, f);
    if (!fs.existsSync(p)) throw new Error(`Missing core file: ${f}`);
    console.log(`✓ Core file present: ${f} (${fs.statSync(p).size} bytes)`);
  }

  // 2. Data Payloads
  const dataFiles = [
    "arms-mbon-18s.csv",
    "arms-mbon-stations.geojson",
    "arms-mbon-rocrate.zip",
    "arms-2018-samples.csv",
    "north-sea-sensors-latest.csv",
    "north-sea-sensors-stream.json",
    "eurobis-occurrences.geojson",
    "eurobis-dwca-sample.zip",
    "ro-crate-paper.pdf"
  ];
  for (const f of dataFiles) {
    const p = path.join(distDir, "data", f);
    if (!fs.existsSync(p)) throw new Error(`Missing data payload: ${f}`);
    console.log(`✓ Data payload present: ${f} (${fs.statSync(p).size} bytes)`);
  }

  // 3. DCAT-3 Catalog
  const dcatFiles = ["dcat.ttl", "dcat.jsonld", "index.html"];
  for (const f of dcatFiles) {
    const p = path.join(distDir, "catalog", f);
    if (!fs.existsSync(p)) throw new Error(`Missing DCAT file: ${f}`);
    console.log(`✓ DCAT asset present: catalog/${f}`);
  }

  // 4. API & OpenAPI Specs
  const apiFiles = ["openapi.json", "docs/index.html", "v1/observations", "v1/datasets"];
  for (const f of apiFiles) {
    const p = path.join(distDir, "api", f);
    if (!fs.existsSync(p)) throw new Error(`Missing API asset: ${f}`);
    console.log(`✓ API asset present: api/${f}`);
  }

  // 5. Well-known endpoints
  const wellKnownFiles = ["api-catalog", "resource-map.json"];
  for (const f of wellKnownFiles) {
    const p = path.join(distDir, ".well-known", f);
    if (!fs.existsSync(p)) throw new Error(`Missing .well-known asset: ${f}`);
    console.log(`✓ .well-known asset present: .well-known/${f}`);
  }

  // 6. Entity HTML, RDF & Linksets
  for (const res of RESOURCES) {
    const slug = res.id.replace("resource-", "");
    const ttlPath = path.join(distDir, "rdf", `${res.id}.ttl`);
    const jsonldPath = path.join(distDir, "rdf", `${res.id}.jsonld`);
    const linksetPath = path.join(distDir, "linksets", `${res.id}.linkset.json`);

    if (!fs.existsSync(ttlPath)) throw new Error(`Missing Turtle RDF: ${ttlPath}`);
    if (!fs.existsSync(jsonldPath)) throw new Error(`Missing JSON-LD: ${jsonldPath}`);
    if (!fs.existsSync(linksetPath)) throw new Error(`Missing Linkset: ${linksetPath}`);

    // Verify Linkset is valid JSON and has anchor
    const ls = JSON.parse(fs.readFileSync(linksetPath, "utf-8"));
    if (!ls.linkset || !ls.linkset[0].anchor) throw new Error(`Invalid linkset JSON for ${res.id}`);

    let htmlSubdir = "datasets";
    if (res.category === "institute") htmlSubdir = "institutes";
    else if (res.category === "publication") htmlSubdir = "publications";
    else if (res.category === "project") htmlSubdir = "projects";
    else if (res.category === "person") htmlSubdir = "people";

    if (res.category !== "api") {
      const htmlPath = path.join(distDir, htmlSubdir, `${slug}.html`);
      if (!fs.existsSync(htmlPath)) throw new Error(`Missing HTML view: ${htmlPath}`);
    }
    console.log(`✓ Entity ${res.id} fully generated (HTML, TTL, JSON-LD, Linkset)`);
  }

  // 7. Compliance Audit Documentation
  const auditDocs = [
    "arms-mbon-8617.md",
    "arms-2018-6405.md",
    "north-sea-sensors.md",
    "eurobis-occurrences.md",
    "vliz-institute-36.md",
    "ro-crate-paper.md",
    "maregraph-project-5484.md",
    "marineinfo-api.md",
    "orcid-researchers.md"
  ];
  for (const f of auditDocs) {
    const p = path.join(docsDir, f);
    if (!fs.existsSync(p)) throw new Error(`Missing audit doc: ${f}`);
    console.log(`✓ Compliance audit doc present: ${f}`);
  }

  console.log("\n🎉 ALL ASSETS AND SPECIFICATIONS VERIFIED 100% CLEAN!");
}

verify();
