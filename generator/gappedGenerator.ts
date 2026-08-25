import fs from "fs";
import path from "path";
import { getEntityTypeSlug, getEntityNameSlug, getEntityHtmlPath } from "./types";
import { RESOURCES } from "./resources";
import { PROFILES } from "./profiles";

export async function generateGappedSite(distGappedDir: string, baseUrl: string): Promise<void> {
  const distDir = path.resolve(process.cwd(), "dist");
  if (!fs.existsSync(distDir)) {
    throw new Error("Base dist/ directory must be generated before building dist-gapped/");
  }

  // 1. Recreate clean dist-gapped directory
  if (!fs.existsSync(distGappedDir)) {
    fs.mkdirSync(distGappedDir, { recursive: true });
  } else {
    for (const item of fs.readdirSync(distGappedDir)) {
      try {
        fs.rmSync(path.join(distGappedDir, item), { recursive: true, force: true });
      } catch {}
    }
  }

  // 2. Recursive copy from dist to dist-gapped
  function copyRecursive(src: string, dest: string) {
    if (!fs.existsSync(src)) return;
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
      if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
      for (const child of fs.readdirSync(src)) {
        copyRecursive(path.join(src, child), path.join(dest, child));
      }
    } else {
      fs.copyFileSync(src, dest);
    }
  }

  copyRecursive(distDir, distGappedDir);

  // =========================================================================
  // APPLY DELIBERATE REALISTIC GAPS
  // =========================================================================

  // GAP 1: arms-2018 (Legacy Plain-HTML Silo)
  // Delete all RDF formats and linkset for arms-2018, keeping only HTML
  const arms2018Dir = path.join(distGappedDir, "id", "dataset");
  const arms2018Ttl = path.join(arms2018Dir, "arms-2018.ttl");
  const arms2018Jsonld = path.join(arms2018Dir, "arms-2018.jsonld");
  const arms2018Rdf = path.join(arms2018Dir, "arms-2018.rdf");
  const arms2018Linkset = path.join(arms2018Dir, "arms-2018.linkset.json");
  if (fs.existsSync(arms2018Ttl)) fs.unlinkSync(arms2018Ttl);
  if (fs.existsSync(arms2018Jsonld)) fs.unlinkSync(arms2018Jsonld);
  if (fs.existsSync(arms2018Rdf)) fs.unlinkSync(arms2018Rdf);
  if (fs.existsSync(arms2018Linkset)) fs.unlinkSync(arms2018Linkset);

  // GAP 4: vliz (Missing RFC 9264 Linkset File -> 404)
  const vlizLinkset = path.join(distGappedDir, "id", "institute", "vliz.linkset.json");
  if (fs.existsSync(vlizLinkset)) fs.unlinkSync(vlizLinkset);

  // GAP 3: eurobis-occurrences (Missing Profile & Schema Conformance in RDF)
  const eurobisTtlPath = path.join(distGappedDir, "id", "dataset", "eurobis-occurrences.ttl");
  if (fs.existsSync(eurobisTtlPath)) {
    let ttl = fs.readFileSync(eurobisTtlPath, "utf-8");
    ttl = ttl.replace(/schema:conformsTo\s+<[^>]+>\s*;/g, "");
    ttl = ttl.replace(/dcterms:conformsTo\s+<[^>]+>\s*;/g, "");
    fs.writeFileSync(eurobisTtlPath, ttl);
  }

  const eurobisJsonldPath = path.join(distGappedDir, "id", "dataset", "eurobis-occurrences.jsonld");
  if (fs.existsSync(eurobisJsonldPath)) {
    try {
      const jsonld = JSON.parse(fs.readFileSync(eurobisJsonldPath, "utf-8"));
      delete jsonld["schema:conformsTo"];
      delete jsonld["dcterms:conformsTo"];
      fs.writeFileSync(eurobisJsonldPath, JSON.stringify(jsonld, null, 2));
    } catch {}
  }

  const eurobisLinksetPath = path.join(distGappedDir, "id", "dataset", "eurobis-occurrences.linkset.json");
  if (fs.existsSync(eurobisLinksetPath)) {
    try {
      const linkset = JSON.parse(fs.readFileSync(eurobisLinksetPath, "utf-8"));
      if (linkset.linkset && linkset.linkset[0]) {
        delete linkset.linkset[0].profile;
      }
      fs.writeFileSync(eurobisLinksetPath, JSON.stringify(linkset, null, 2));
    } catch {}
  }

  // GAP 7: marineinfo-api (Orphan API -> remove from api-catalog)
  const apiCatalogPath = path.join(distGappedDir, ".well-known", "api-catalog");
  if (fs.existsSync(apiCatalogPath)) {
    const emptyCatalog = {
      linkset: [
        {
          anchor: `${baseUrl}/.well-known/api-catalog`,
          item: []
        }
      ]
    };
    fs.writeFileSync(apiCatalogPath, JSON.stringify(emptyCatalog, null, 2));
  }

  // GAP 9: katrina (Malformed Linkset -> remove reverse format anchor entries)
  const katrinaLinksetPath = path.join(distGappedDir, "id", "person", "katrina.linkset.json");
  if (fs.existsSync(katrinaLinksetPath)) {
    try {
      const katrinaLinkset = JSON.parse(fs.readFileSync(katrinaLinksetPath, "utf-8"));
      // Retain only the primary anchor entry
      if (katrinaLinkset.linkset && katrinaLinkset.linkset.length > 0) {
        katrinaLinkset.linkset = [katrinaLinkset.linkset[0]];
      }
      fs.writeFileSync(katrinaLinksetPath, JSON.stringify(katrinaLinkset, null, 2));
    } catch {}
  }

  // GAP 8: maregraph (Flat legacy sitemap without rs:ln)
  const sitemapPath = path.join(distGappedDir, "sitemap.xml");
  if (fs.existsSync(sitemapPath)) {
    let sitemap = fs.readFileSync(sitemapPath, "utf-8");
    // Replace maregraph rs:ln block with plain loc
    const maregraphRegex = /<url>\s*<loc>[^<]*\/id\/project\/maregraph<\/loc>[\s\S]*?<\/url>/;
    sitemap = sitemap.replace(maregraphRegex, `<url>\n    <loc>${baseUrl}/id/project/maregraph</loc>\n  </url>`);
    fs.writeFileSync(sitemapPath, sitemap);
  }

  // =========================================================================
  // GENERATE GAPPED NGINX CONFIGURATIONS
  // =========================================================================

  // 1. Gapped Content-Negotiation Map (nginx-coneg.conf)
  let gappedConegConf = `# Dynamic Content-Negotiation Map (Gapped Simulation)\n`;
  gappedConegConf += `map $http_accept $conneg_suffix {\n`;
  gappedConegConf += `    default                          ttl;\n`;
  gappedConegConf += `    "~text/html"                     html;\n`;
  gappedConegConf += `    "~text/turtle"                   ttl;\n`;
  gappedConegConf += `    "~application/ld\\+json"          jsonld;\n`;
  gappedConegConf += `    "~application/rdf\\+xml"          rdf;\n`;
  gappedConegConf += `    "~application/linkset\\+json"     linkset.json;\n`;
  gappedConegConf += `}\n`;
  fs.writeFileSync(path.join(distGappedDir, "nginx-coneg.conf"), gappedConegConf);

  // 2. Gapped Nginx HTTP Headers (nginx-headers.conf)
  let gappedHeadersConf = `# Dynamically generated RFC 8288 Link headers (Gapped Simulation)\n`;

  // Root and Catalog
  gappedHeadersConf += `location = / {\n`;
  gappedHeadersConf += `    add_header Link '<${baseUrl}/.well-known/api-catalog>; rel="api-catalog", <${baseUrl}/catalog/dcat.ttl>; rel="describedby"; type="text/turtle"' always;\n`;
  gappedHeadersConf += `}\n\n`;

  gappedHeadersConf += `location = /.well-known/api-catalog {\n`;
  gappedHeadersConf += `    default_type application/linkset+json;\n`;
  gappedHeadersConf += `    add_header Access-Control-Allow-Origin * always;\n`;
  gappedHeadersConf += `    add_header Link '<${baseUrl}/.well-known/api-catalog>; rel="api-catalog"' always;\n`;
  gappedHeadersConf += `}\n\n`;

  gappedHeadersConf += `location = /catalog/ {\n`;
  gappedHeadersConf += `    add_header Link '<https://www.w3.org/TR/vocab-dcat/>; rel="type", <${baseUrl}/catalog/dcat.ttl>; rel="alternate"; type="text/turtle"' always;\n`;
  gappedHeadersConf += `}\n\n`;

  // GAP 7: marineinfo-api -> Omit rel="cite-as" and rel="service-desc"
  gappedHeadersConf += `location = /api/v1/observations {\n`;
  gappedHeadersConf += `    default_type application/json;\n`;
  gappedHeadersConf += `    add_header Access-Control-Allow-Origin * always;\n`;
  gappedHeadersConf += `    try_files /api/v1/observations.json /api/v1/observations =404;\n`;
  gappedHeadersConf += `}\n\n`;

  gappedHeadersConf += `location = /api/v1/observations.json {\n`;
  gappedHeadersConf += `    default_type application/json;\n`;
  gappedHeadersConf += `    add_header Access-Control-Allow-Origin * always;\n`;
  gappedHeadersConf += `}\n\n`;

  // Profile headers
  for (const prof of PROFILES) {
    gappedHeadersConf += `location = /id/profile/${prof.id}.html {\n`;
    gappedHeadersConf += `    add_header Link '<http://www.w3.org/ns/dx/prof/Profile>; rel="type", <${baseUrl}/id/profile/${prof.id}.linkset.json>; rel="linkset"; type="application/linkset+json"' always;\n`;
    gappedHeadersConf += `}\n\n`;

    gappedHeadersConf += `location = /id/profile/${prof.id}.ttl {\n`;
    gappedHeadersConf += `    add_header Link '<${baseUrl}/id/profile/${prof.id}>; rel="describes", <http://www.w3.org/ns/dx/prof/Profile>; rel="type"' always;\n`;
    gappedHeadersConf += `}\n\n`;

    gappedHeadersConf += `location = /id/profile/${prof.id}.jsonld {\n`;
    gappedHeadersConf += `    add_header Link '<${baseUrl}/id/profile/${prof.id}>; rel="describes", <http://www.w3.org/ns/dx/prof/Profile>; rel="type"' always;\n`;
    gappedHeadersConf += `}\n\n`;

    gappedHeadersConf += `location = /id/profile/${prof.id}.linkset.json {\n`;
    gappedHeadersConf += `    add_header Link '<${baseUrl}/id/profile/${prof.id}>; rel="describes"' always;\n`;
    gappedHeadersConf += `}\n\n`;
  }

  // Entity headers with selective gap exclusions
  for (const res of RESOURCES) {
    const htmlPath = getEntityHtmlPath(res);
    const typeSlug = getEntityTypeSlug(res);
    const nameSlug = getEntityNameSlug(res);
    const entityPid = `${baseUrl}/id/${typeSlug}/${nameSlug}`;
    const profileUri = res.profileId ? `${baseUrl}/id/profile/${res.profileId}` : undefined;
    const typeUri = res.type === "Dataset" ? "https://schema.org/Dataset" : `https://schema.org/${res.type}`;

    // GAP 2: north-sea-sensors -> SILENT SERVER (Emit ZERO Link headers)
    if (nameSlug === "north-sea-sensors") {
      continue;
    }

    // GAP 1: arms-2018 -> Plain HTML only (No headers on formats)
    if (nameSlug === "arms-2018") {
      continue;
    }

    // GAP 3: eurobis-occurrences -> Strip rel="profile"
    const profileHeaders = (profileUri && nameSlug !== "eurobis-occurrences") ? [`<${profileUri}>; rel="profile"`] : [];
    const typeHeader = `<${typeUri}>; rel="type"`;

    const htmlLinks: string[] = [
      ...profileHeaders,
      typeHeader,
      `<${baseUrl}/id/${typeSlug}/${nameSlug}.ttl>; rel="describedby"; type="text/turtle"`,
      `<${baseUrl}/id/${typeSlug}/${nameSlug}.linkset.json>; rel="linkset"; type="application/linkset+json"`,
      `<${baseUrl}/catalog/>; rel="collection"`
    ];

    gappedHeadersConf += `location = ${htmlPath} {\n`;
    gappedHeadersConf += `    add_header Link '${htmlLinks.join(", ")}' always;\n`;
    gappedHeadersConf += `}\n\n`;

    const rdfLinks: string[] = [
      `<${entityPid}>; rel="describes"`,
      ...profileHeaders,
      typeHeader,
      `<${baseUrl}/id/${typeSlug}/${nameSlug}.linkset.json>; rel="linkset"; type="application/linkset+json"`
    ];

    gappedHeadersConf += `location = /id/${typeSlug}/${nameSlug}.ttl {\n`;
    gappedHeadersConf += `    add_header Link '${rdfLinks.join(", ")}' always;\n`;
    gappedHeadersConf += `}\n\n`;

    gappedHeadersConf += `location = /id/${typeSlug}/${nameSlug}.jsonld {\n`;
    gappedHeadersConf += `    add_header Link '${rdfLinks.join(", ")}' always;\n`;
    gappedHeadersConf += `}\n\n`;

    gappedHeadersConf += `location = /id/${typeSlug}/${nameSlug}.rdf {\n`;
    gappedHeadersConf += `    add_header Link '${rdfLinks.join(", ")}' always;\n`;
    gappedHeadersConf += `}\n\n`;

    // GAP 4: vliz linkset location still declared so Nginx serves 404 when file is missing
    gappedHeadersConf += `location = /id/${typeSlug}/${nameSlug}.linkset.json {\n`;
    gappedHeadersConf += `    add_header Link '<${entityPid}>; rel="describes"' always;\n`;
    gappedHeadersConf += `}\n\n`;
  }

  // Data Payloads
  // arms-mbon zip has cite-as
  const armsZipLinks = [
    `<${baseUrl}/id/dataset/arms-mbon>; rel="cite-as"`,
    `<${baseUrl}/id/profile/marine-genomic-dataset-profile>; rel="profile"`,
    `<${baseUrl}/id/dataset/arms-mbon.ttl>; rel="describedby"; type="text/turtle"`,
    `<${baseUrl}/id/dataset/arms-mbon.linkset.json>; rel="linkset"; type="application/linkset+json"`
  ];
  gappedHeadersConf += `location = /data/arms-mbon-rocrate.zip {\n`;
  gappedHeadersConf += `    add_header Link '${armsZipLinks.join(", ")}' always;\n`;
  gappedHeadersConf += `}\n\n`;

  // GAP 6: ro-crate-paper -> Omits cite-as header
  gappedHeadersConf += `location = /data/ro-crate-paper.pdf {\n`;
  gappedHeadersConf += `    default_type application/pdf;\n`;
  gappedHeadersConf += `}\n\n`;

  fs.writeFileSync(path.join(distGappedDir, "nginx-headers.conf"), gappedHeadersConf);
}
