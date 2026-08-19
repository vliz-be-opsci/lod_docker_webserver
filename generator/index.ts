import fs from "fs";
import path from "path";
import { RESOURCES, getResourceById } from "./resources";
import { PROFILES, getProfileById } from "./profiles";
import { serializeJsonLd, serializeTurtle, serializeRDFXML, expandUri } from "./rdfSerializer";
import { generateDcatCatalog } from "./dcatGenerator";
import { generateLinkset, generateApiCatalog } from "./linksetGenerator";
import { generateDataPayloads } from "./dataPayloads";
import { generateOpenApiSpec, generateApiDocsHtml, generateApiSampleResponses } from "./openApiGenerator";
import {
  generateProfileHtml,
  generateProfileCatalogHtml,
  generateProfileTurtle,
  generateProfileJsonLd,
  generateProfileLinkset
} from "./profileGenerator";
import {
  getCssContent,
  renderCatalogHomeHtml,
  renderDatasetPageHtml,
  renderInstitutePageHtml,
  renderPublicationPageHtml,
  renderProjectPageHtml,
  renderPersonPageHtml,
  renderDcatHtml
} from "./htmlTemplates";
import { getEntityTypeSlug, getEntityNameSlug, getEntityIdPath, getEntityHtmlPath } from "./types";
import { generateMetroMapHtml } from "./metroMapGenerator";
import { generateComplianceDocs } from "./complianceDocs";

const BASE_URL = process.env.BASE_URL || "http://localhost:8080";
const DIST_DIR = path.resolve(process.cwd(), "dist");

function cleanDist() {
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
  }
}

function ensureDirs() {
  const dirs = [
    DIST_DIR,
    path.join(DIST_DIR, "id", "dataset"),
    path.join(DIST_DIR, "id", "institute"),
    path.join(DIST_DIR, "id", "person"),
    path.join(DIST_DIR, "id", "publication"),
    path.join(DIST_DIR, "id", "project"),
    path.join(DIST_DIR, "id", "service"),
    path.join(DIST_DIR, "id", "profile"),
    path.join(DIST_DIR, "id", "profiles"),
    path.join(DIST_DIR, "catalog"),
    path.join(DIST_DIR, "data"),
    path.join(DIST_DIR, "api", "docs"),
    path.join(DIST_DIR, ".well-known")
  ];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

async function main() {
  console.log(`Starting static generation for Radical Transparency Marine Data Portal...`);
  console.log(`Base URL: ${BASE_URL}`);

  cleanDist();
  ensureDirs();

  // 1. Write Shared CSS
  fs.writeFileSync(path.join(DIST_DIR, "style.css"), getCssContent());

  // 2. Generate Physical Download Payloads (CSV, GeoJSON, RO-Crate ZIP)
  console.log(`Generating downloadable data payloads in /data/...`);
  await generateDataPayloads(DIST_DIR);

  // 3. Serialize all entities into RDF (Turtle, JSON-LD, RDF/XML) and Linksets in dist/id/{type}/
  console.log(`Serializing RDF graphs and RFC 9264 Linksets in dist/id/...`);
  for (const resource of RESOURCES) {
    const typeSlug = getEntityTypeSlug(resource);
    const nameSlug = getEntityNameSlug(resource);
    const targetDir = path.join(DIST_DIR, "id", typeSlug);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const jsonld = serializeJsonLd(resource, BASE_URL);
    const ttl = serializeTurtle(resource, BASE_URL);
    const rdf = serializeRDFXML(resource, BASE_URL);
    const linkset = generateLinkset(resource, BASE_URL);

    fs.writeFileSync(path.join(targetDir, `${nameSlug}.jsonld`), jsonld);
    fs.writeFileSync(path.join(targetDir, `${nameSlug}.ttl`), ttl);
    fs.writeFileSync(path.join(targetDir, `${nameSlug}.rdf`), rdf);
    fs.writeFileSync(path.join(targetDir, `${nameSlug}.linkset.json`), JSON.stringify(linkset, null, 2));
  }

  // 4. Generate DCAT-3 Catalogue (Turtle, JSON-LD, HTML)
  console.log(`Generating DCAT-3 Catalogue in /catalog/...`);
  const dcat = generateDcatCatalog(RESOURCES, BASE_URL);
  fs.writeFileSync(path.join(DIST_DIR, "catalog", "dcat.ttl"), dcat.ttl);
  fs.writeFileSync(path.join(DIST_DIR, "catalog", "dcat.jsonld"), dcat.jsonld);
  fs.writeFileSync(path.join(DIST_DIR, "catalog", "index.html"), renderDcatHtml(RESOURCES, BASE_URL));

  // 5. Generate Semantic Profiles (HTML, Turtle, JSON-LD, Linksets) in dist/id/profile/ and dist/id/profiles/
  console.log(`Generating Semantic Profiles & Composition Registry in /id/profile/ and /id/profiles/...`);
  fs.writeFileSync(path.join(DIST_DIR, "id", "profiles", "index.html"), generateProfileCatalogHtml(PROFILES, BASE_URL));
  fs.writeFileSync(path.join(DIST_DIR, "id", "profile", "index.html"), generateProfileCatalogHtml(PROFILES, BASE_URL));

  for (const profile of PROFILES) {
    fs.writeFileSync(path.join(DIST_DIR, "id", "profile", `${profile.id}.html`), generateProfileHtml(profile, BASE_URL));
    fs.writeFileSync(path.join(DIST_DIR, "id", "profile", `${profile.id}.ttl`), generateProfileTurtle(profile, BASE_URL));
    fs.writeFileSync(path.join(DIST_DIR, "id", "profile", `${profile.id}.jsonld`), generateProfileJsonLd(profile, BASE_URL));
    fs.writeFileSync(path.join(DIST_DIR, "id", "profile", `${profile.id}.linkset.json`), JSON.stringify(generateProfileLinkset(profile, BASE_URL), null, 2));
  }

  // 6. Generate OpenAPI Specification & Subsetting API Explorer
  console.log(`Generating OpenAPI specification & Swagger UI in /api/...`);
  const openApiSpec = generateOpenApiSpec(BASE_URL);
  fs.writeFileSync(path.join(DIST_DIR, "api", "openapi.json"), JSON.stringify(openApiSpec, null, 2));
  fs.writeFileSync(path.join(DIST_DIR, "api", "docs", "index.html"), generateApiDocsHtml(BASE_URL));
  generateApiSampleResponses(DIST_DIR);

  // 7. Generate RFC 9727 API Catalog & Resource Map in /.well-known/
  console.log(`Generating RFC 9727 API Catalog in /.well-known/...`);
  const apiCatalog = generateApiCatalog(BASE_URL);
  fs.writeFileSync(path.join(DIST_DIR, ".well-known", "api-catalog"), JSON.stringify(apiCatalog, null, 2));
  fs.writeFileSync(path.join(DIST_DIR, ".well-known", "resource-map.json"), JSON.stringify(apiCatalog, null, 2));

  // 8. Generate HTML Views for all entities
  console.log(`Generating portal HTML views...`);
  // Homepage
  fs.writeFileSync(path.join(DIST_DIR, "index.html"), renderCatalogHomeHtml(RESOURCES, BASE_URL));

  // Radical Transparency Metro Transit Map Page
  fs.writeFileSync(path.join(DIST_DIR, "map.html"), generateMetroMapHtml(BASE_URL));

  // Entity Detail Pages
  for (const res of RESOURCES) {
    const typeSlug = getEntityTypeSlug(res);
    const nameSlug = getEntityNameSlug(res);
    const targetDir = path.join(DIST_DIR, "id", typeSlug);

    if (res.category === "dataset") {
      fs.writeFileSync(path.join(targetDir, `${nameSlug}.html`), renderDatasetPageHtml(res, BASE_URL));
    } else if (res.category === "institute") {
      fs.writeFileSync(path.join(targetDir, `${nameSlug}.html`), renderInstitutePageHtml(res, BASE_URL));
    } else if (res.category === "publication") {
      fs.writeFileSync(path.join(targetDir, `${nameSlug}.html`), renderPublicationPageHtml(res, BASE_URL));
    } else if (res.category === "project") {
      fs.writeFileSync(path.join(targetDir, `${nameSlug}.html`), renderProjectPageHtml(res, BASE_URL));
    } else if (res.category === "person") {
      fs.writeFileSync(path.join(targetDir, `${nameSlug}.html`), renderPersonPageHtml(res, BASE_URL));
    } else if (res.category === "service" || res.category === "api") {
      fs.writeFileSync(path.join(targetDir, `${nameSlug}.html`), generateApiDocsHtml(BASE_URL));
    }
  }

  // 9. Generate Sitemap with ResourceSync rs:ln and xhtml:link (Signmap)
  console.log(`Generating sitemap.xml with rs:ln and xhtml:link extensions...`);
  let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  sitemapXml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
  sitemapXml += `        xmlns:rs="http://www.openarchives.org/rs/terms/"\n`;
  sitemapXml += `        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;

  // Root URL
  sitemapXml += `  <url>\n    <loc>${BASE_URL}/</loc>\n`;
  sitemapXml += `    <rs:ln rel="api-catalog" href="${BASE_URL}/.well-known/api-catalog" />\n`;
  sitemapXml += `    <rs:ln rel="dcat-catalog" href="${BASE_URL}/catalog/dcat.ttl" />\n`;
  sitemapXml += `    <xhtml:link rel="api-catalog" href="${BASE_URL}/.well-known/api-catalog" />\n`;
  sitemapXml += `    <xhtml:link rel="dcat-catalog" href="${BASE_URL}/catalog/dcat.ttl" />\n`;
  sitemapXml += `  </url>\n`;

  // Metro Map URL
  sitemapXml += `  <url>\n    <loc>${BASE_URL}/map.html</loc>\n`;
  sitemapXml += `    <rs:ln rel="profile" href="https://schema.org/Thing" />\n`;
  sitemapXml += `    <xhtml:link rel="profile" href="https://schema.org/Thing" />\n`;
  sitemapXml += `  </url>\n`;

  // Profiles Registry & Profiles
  sitemapXml += `  <url>\n    <loc>${BASE_URL}/id/profiles</loc>\n`;
  sitemapXml += `    <rs:ln rel="profile" href="https://www.w3.org/TR/dx-prof/" />\n`;
  sitemapXml += `    <xhtml:link rel="profile" href="https://www.w3.org/TR/dx-prof/" />\n`;
  sitemapXml += `  </url>\n`;

  for (const prof of PROFILES) {
    sitemapXml += `  <url>\n    <loc>${BASE_URL}/id/profile/${prof.id}.html</loc>\n`;
    sitemapXml += `    <rs:ln rel="profile" href="https://www.w3.org/TR/dx-prof/" />\n`;
    sitemapXml += `    <rs:ln rel="linkset" href="${BASE_URL}/id/profile/${prof.id}.linkset.json" type="application/linkset+json" />\n`;
    sitemapXml += `    <rs:ln rel="describedby" href="${BASE_URL}/id/profile/${prof.id}.ttl" type="text/turtle" />\n`;
    sitemapXml += `    <xhtml:link rel="profile" href="https://www.w3.org/TR/dx-prof/" />\n`;
    sitemapXml += `    <xhtml:link rel="linkset" href="${BASE_URL}/id/profile/${prof.id}.linkset.json" type="application/linkset+json" />\n`;
    sitemapXml += `    <xhtml:link rel="describedby" href="${BASE_URL}/id/profile/${prof.id}.ttl" type="text/turtle" />\n`;
    sitemapXml += `  </url>\n`;
  }

  // Catalog URL
  sitemapXml += `  <url>\n    <loc>${BASE_URL}/catalog/</loc>\n`;
  sitemapXml += `    <rs:ln rel="profile" href="https://www.w3.org/TR/vocab-dcat/" />\n`;
  sitemapXml += `    <rs:ln rel="alternate" href="${BASE_URL}/catalog/dcat.ttl" type="text/turtle" />\n`;
  sitemapXml += `    <xhtml:link rel="profile" href="https://www.w3.org/TR/vocab-dcat/" />\n`;
  sitemapXml += `    <xhtml:link rel="alternate" href="${BASE_URL}/catalog/dcat.ttl" type="text/turtle" />\n`;
  sitemapXml += `    <xhtml:link rel="alternate" href="${BASE_URL}/catalog/dcat.jsonld" type="application/ld+json" />\n`;
  sitemapXml += `  </url>\n`;

  // Each entity URL
  for (const res of RESOURCES) {
    const htmlPath = getEntityHtmlPath(res);
    const typeSlug = getEntityTypeSlug(res);
    const nameSlug = getEntityNameSlug(res);
    const profileUri = res.profileId ? `${BASE_URL}/id/profile/${res.profileId}.html` : (res.alternateProfiles?.[0] || (res.type === "Dataset" ? "https://schema.org/Dataset" : `https://schema.org/${res.type}`));
    sitemapXml += `  <url>\n    <loc>${BASE_URL}${htmlPath}</loc>\n`;
    sitemapXml += `    <rs:ln rel="profile" href="${profileUri}" />\n`;
    sitemapXml += `    <rs:ln rel="linkset" href="${BASE_URL}/id/${typeSlug}/${nameSlug}.linkset.json" type="application/linkset+json" />\n`;
    sitemapXml += `    <rs:ln rel="describedby" href="${BASE_URL}/id/${typeSlug}/${nameSlug}.ttl" type="text/turtle" />\n`;
    sitemapXml += `    <xhtml:link rel="profile" href="${profileUri}" />\n`;
    sitemapXml += `    <xhtml:link rel="linkset" href="${BASE_URL}/id/${typeSlug}/${nameSlug}.linkset.json" type="application/linkset+json" />\n`;
    sitemapXml += `    <xhtml:link rel="describedby" href="${BASE_URL}/id/${typeSlug}/${nameSlug}.ttl" type="text/turtle" />\n`;
    sitemapXml += `    <xhtml:link rel="describedby" href="${BASE_URL}/id/${typeSlug}/${nameSlug}.jsonld" type="application/ld+json" />\n`;
    sitemapXml += `    <xhtml:link rel="describedby" href="${BASE_URL}/id/${typeSlug}/${nameSlug}.rdf" type="application/rdf+xml" />\n`;
    if (res.distributions) {
      for (const d of res.distributions) {
        sitemapXml += `    <xhtml:link rel="item" href="${BASE_URL}${d.downloadUrl}" type="${d.mediaType}" />\n`;
      }
    }
    sitemapXml += `  </url>\n`;
  }

  sitemapXml += `</urlset>\n`;
  fs.writeFileSync(path.join(DIST_DIR, "sitemap.xml"), sitemapXml);

  const robotsTxt = `User-agent: *\nAllow: /\nSitemap: ${BASE_URL}/sitemap.xml\n`;
  fs.writeFileSync(path.join(DIST_DIR, "robots.txt"), robotsTxt);

  // 10. Generate Nginx Content-Negotiation Map (nginx-coneg.conf)
  console.log(`Generating nginx-coneg.conf...`);
  let conegConf = `# Dynamic Content-Negotiation Map\n`;
  conegConf += `map $http_accept $conneg_suffix {\n`;
  conegConf += `    default                          html;\n`;
  conegConf += `    "~text/turtle"                   ttl;\n`;
  conegConf += `    "~application/ld\\+json"          jsonld;\n`;
  conegConf += `    "~application/rdf\\+xml"          rdf;\n`;
  conegConf += `    "~application/linkset\\+json"     linkset.json;\n`;
  conegConf += `}\n`;

  fs.writeFileSync(path.join(DIST_DIR, "nginx-coneg.conf"), conegConf);

  // 11. Generate Nginx HTTP Headers (nginx-headers.conf)
  console.log(`Generating nginx-headers.conf with RFC 8288 Link headers...`);
  let headersConf = `# Dynamically generated RFC 8288 Link headers\n`;

  // Headers for root and catalog
  headersConf += `location = / {\n`;
  headersConf += `    add_header Link '<${BASE_URL}/.well-known/api-catalog>; rel="api-catalog", <${BASE_URL}/catalog/dcat.ttl>; rel="describedby"; type="text/turtle"' always;\n`;
  headersConf += `}\n\n`;

  headersConf += `location = /catalog/ {\n`;
  headersConf += `    add_header Link '<https://www.w3.org/TR/vocab-dcat/>; rel="profile", <${BASE_URL}/catalog/dcat.ttl>; rel="alternate"; type="text/turtle", <${BASE_URL}/catalog/dcat.jsonld>; rel="alternate"; type="application/ld+json"' always;\n`;
  headersConf += `}\n\n`;

  // Headers for Profiles Catalog
  headersConf += `location = /id/profiles {\n`;
  headersConf += `    default_type text/html;\n`;
  headersConf += `    add_header Link '<https://www.w3.org/TR/dx-prof/>; rel="profile"' always;\n`;
  headersConf += `    try_files /id/profiles/index.html =404;\n`;
  headersConf += `}\n\n`;

  headersConf += `location = /id/profiles/ {\n`;
  headersConf += `    default_type text/html;\n`;
  headersConf += `    add_header Link '<https://www.w3.org/TR/dx-prof/>; rel="profile"' always;\n`;
  headersConf += `    try_files /id/profiles/index.html =404;\n`;
  headersConf += `}\n\n`;

  // Headers for Profiles
  for (const prof of PROFILES) {
    const profileLinks = [
      `<https://www.w3.org/TR/dx-prof/>; rel="profile"`,
      `<${BASE_URL}/id/profile/${prof.id}.ttl>; rel="describedby"; type="text/turtle"`,
      `<${BASE_URL}/id/profile/${prof.id}.jsonld>; rel="describedby"; type="application/ld+json"`,
      `<${BASE_URL}/id/profile/${prof.id}.linkset.json>; rel="linkset"; type="application/linkset+json"`,
      `<${BASE_URL}/id/profiles>; rel="collection"`
    ];

    if (prof.composedProfiles && prof.composedProfiles.length > 0) {
      for (const subId of prof.composedProfiles) {
        profileLinks.push(`<${BASE_URL}/id/profile/${subId}.html>; rel="item"`);
      }
    }

    headersConf += `location = /id/profile/${prof.id}.html {\n`;
    headersConf += `    add_header Link '${profileLinks.join(", ")}' always;\n`;
    headersConf += `}\n\n`;
  }

  // Headers for each entity page
  for (const res of RESOURCES) {
    const htmlPath = getEntityHtmlPath(res);
    const typeSlug = getEntityTypeSlug(res);
    const nameSlug = getEntityNameSlug(res);
    const profile = res.profileId ? `${BASE_URL}/id/profile/${res.profileId}.html` : (res.alternateProfiles?.[0] || (res.type === "Dataset" ? "https://schema.org/Dataset" : `https://schema.org/${res.type}`));
    const linkHeaders: string[] = [
      `<${profile}>; rel="profile"`,
      `<${BASE_URL}/id/${typeSlug}/${nameSlug}.ttl>; rel="describedby"; type="text/turtle"`,
      `<${BASE_URL}/id/${typeSlug}/${nameSlug}.jsonld>; rel="describedby"; type="application/ld+json"`,
      `<${BASE_URL}/id/${typeSlug}/${nameSlug}.rdf>; rel="describedby"; type="application/rdf+xml"`,
      `<${BASE_URL}/id/${typeSlug}/${nameSlug}.linkset.json>; rel="linkset"; type="application/linkset+json collaboration"`,
      `<${BASE_URL}/catalog/>; rel="collection"`
    ];

    if (res.distributions) {
      for (const d of res.distributions) {
        linkHeaders.push(`<${BASE_URL}${d.downloadUrl}>; rel="item"; type="${d.mediaType}"`);
      }
    }

    headersConf += `location = ${htmlPath} {\n`;
    headersConf += `    add_header Link '${linkHeaders.join(", ")}' always;\n`;
    headersConf += `}\n\n`;
  }

  fs.writeFileSync(path.join(DIST_DIR, "nginx-headers.conf"), headersConf);

  // 12. Generate Radical Transparency Compliance & Gap Documentation
  console.log(`Generating Radical Transparency compliance audit documentation in docs/compliance/...`);
  generateComplianceDocs();

  console.log(`✅ Generation completed successfully! All assets written to /dist.`);
}

main().catch(err => {
  console.error("Build failed:", err);
  process.exit(1);
});
