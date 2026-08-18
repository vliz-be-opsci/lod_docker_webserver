import fs from "fs";
import path from "path";
import { RESOURCES, getResourceById } from "./resources";
import { serializeJsonLd, serializeTurtle, serializeRDFXML, expandUri } from "./rdfSerializer";
import { generateDcatCatalog } from "./dcatGenerator";
import { generateLinkset, generateApiCatalog } from "./linksetGenerator";
import { generateDataPayloads } from "./dataPayloads";
import { generateOpenApiSpec, generateApiDocsHtml, generateApiSampleResponses } from "./openApiGenerator";
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
    path.join(DIST_DIR, "datasets"),
    path.join(DIST_DIR, "institutes"),
    path.join(DIST_DIR, "publications"),
    path.join(DIST_DIR, "projects"),
    path.join(DIST_DIR, "people"),
    path.join(DIST_DIR, "catalog"),
    path.join(DIST_DIR, "data"),
    path.join(DIST_DIR, "rdf"),
    path.join(DIST_DIR, "linksets"),
    path.join(DIST_DIR, "api"),
    path.join(DIST_DIR, "api", "docs"),
    path.join(DIST_DIR, ".well-known")
  ];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

function getHtmlPathForEntity(entity: typeof RESOURCES[0]): string {
  const slug = entity.id.replace("resource-", "");
  switch (entity.category) {
    case "dataset": return `/datasets/${slug}.html`;
    case "institute": return `/institutes/${slug}.html`;
    case "publication": return `/publications/${slug}.html`;
    case "project": return `/projects/${slug}.html`;
    case "person": return `/people/${slug}.html`;
    case "api": return `/api/docs/`;
    default: return `/datasets/${slug}.html`;
  }
}

async function main() {
  console.log(`Starting static generation for Radical Transparency Marine Data Portal...`);
  console.log(`Base URL: ${BASE_URL}`);

  cleanDist();
  ensureDirs();

  // 1. Write Shared CSS
  fs.writeFileSync(path.join(DIST_DIR, "style.css"), getCssContent());

  // 2. Generate Physical Downloadable Data Payloads (CSV, GeoJSON, RO-Crate ZIP, PDF)
  console.log(`Generating downloadable data payloads in /data/...`);
  await generateDataPayloads(DIST_DIR);

  // 3. Serialize all entities into RDF (Turtle, JSON-LD, RDF/XML)
  console.log(`Serializing RDF graphs in /rdf/...`);
  for (const resource of RESOURCES) {
    const jsonld = serializeJsonLd(resource, BASE_URL);
    const ttl = serializeTurtle(resource, BASE_URL);
    const rdf = serializeRDFXML(resource, BASE_URL);

    fs.writeFileSync(path.join(DIST_DIR, "rdf", `${resource.id}.jsonld`), jsonld);
    fs.writeFileSync(path.join(DIST_DIR, "rdf", `${resource.id}.ttl`), ttl);
    fs.writeFileSync(path.join(DIST_DIR, "rdf", `${resource.id}.rdf`), rdf);
  }

  // 4. Generate RFC 9264 JSON Linksets
  console.log(`Generating RFC 9264 Linksets in /linksets/...`);
  for (const resource of RESOURCES) {
    const linkset = generateLinkset(resource, BASE_URL);
    fs.writeFileSync(
      path.join(DIST_DIR, "linksets", `${resource.id}.linkset.json`),
      JSON.stringify(linkset, null, 2)
    );
  }

  // 5. Generate DCAT-3 Catalogue (Turtle, JSON-LD, HTML)
  console.log(`Generating DCAT-3 Catalogue in /catalog/...`);
  const dcat = generateDcatCatalog(RESOURCES, BASE_URL);
  fs.writeFileSync(path.join(DIST_DIR, "catalog", "dcat.ttl"), dcat.ttl);
  fs.writeFileSync(path.join(DIST_DIR, "catalog", "dcat.jsonld"), dcat.jsonld);
  fs.writeFileSync(path.join(DIST_DIR, "catalog", "index.html"), renderDcatHtml(RESOURCES, BASE_URL));

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

  // Entity Detail Pages
  for (const res of RESOURCES) {
    const slug = res.id.replace("resource-", "");
    if (res.category === "dataset") {
      fs.writeFileSync(path.join(DIST_DIR, "datasets", `${slug}.html`), renderDatasetPageHtml(res, BASE_URL));
    } else if (res.category === "institute") {
      fs.writeFileSync(path.join(DIST_DIR, "institutes", `${slug}.html`), renderInstitutePageHtml(res, BASE_URL));
    } else if (res.category === "publication") {
      fs.writeFileSync(path.join(DIST_DIR, "publications", `${slug}.html`), renderPublicationPageHtml(res, BASE_URL));
    } else if (res.category === "project") {
      fs.writeFileSync(path.join(DIST_DIR, "projects", `${slug}.html`), renderProjectPageHtml(res, BASE_URL));
    } else if (res.category === "person") {
      fs.writeFileSync(path.join(DIST_DIR, "people", `${slug}.html`), renderPersonPageHtml(res, BASE_URL));
    }
  }

  // 9. Generate Sitemap with ResourceSync rs:ln / Signmap
  console.log(`Generating sitemap.xml and robots.txt...`);
  let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  sitemapXml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
  sitemapXml += `        xmlns:rs="http://www.openarchives.org/rs/terms/"\n`;
  sitemapXml += `        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;

  // Root URL
  sitemapXml += `  <url>\n    <loc>${BASE_URL}/</loc>\n`;
  sitemapXml += `    <rs:ln rel="api-catalog" href="${BASE_URL}/.well-known/api-catalog" />\n`;
  sitemapXml += `    <rs:ln rel="dcat-catalog" href="${BASE_URL}/catalog/dcat.ttl" />\n`;
  sitemapXml += `  </url>\n`;

  // Catalog URL
  sitemapXml += `  <url>\n    <loc>${BASE_URL}/catalog/</loc>\n`;
  sitemapXml += `    <rs:ln rel="profile" href="https://www.w3.org/TR/vocab-dcat/" />\n`;
  sitemapXml += `    <rs:ln rel="alternate" href="${BASE_URL}/catalog/dcat.ttl" type="text/turtle" />\n`;
  sitemapXml += `  </url>\n`;

  // Each entity URL
  for (const res of RESOURCES) {
    const htmlPath = getHtmlPathForEntity(res);
    const profileUri = res.alternateProfiles?.[0] || (res.type === "Dataset" ? "https://schema.org/Dataset" : "https://schema.org/Thing");
    sitemapXml += `  <url>\n    <loc>${BASE_URL}${htmlPath}</loc>\n`;
    sitemapXml += `    <rs:ln rel="profile" href="${profileUri}" />\n`;
    sitemapXml += `    <rs:ln rel="linkset" href="${BASE_URL}/linksets/${res.id}.linkset.json" type="application/linkset+json" />\n`;
    sitemapXml += `    <rs:ln rel="describedby" href="${BASE_URL}/rdf/${res.id}.ttl" type="text/turtle" />\n`;
    sitemapXml += `  </url>\n`;
  }

  sitemapXml += `</urlset>\n`;
  fs.writeFileSync(path.join(DIST_DIR, "sitemap.xml"), sitemapXml);

  const robotsTxt = `User-agent: *\nAllow: /\nSitemap: ${BASE_URL}/sitemap.xml\n`;
  fs.writeFileSync(path.join(DIST_DIR, "robots.txt"), robotsTxt);

  // 10. Generate Nginx Content-Negotiation Map (nginx-coneg.conf)
  console.log(`Generating nginx-coneg.conf...`);
  let conegConf = `# Dynamic Content-Negotiation Map\n`;
  conegConf += `map $http_accept $rdf_suffix {\n`;
  conegConf += `    default                 html;\n`;
  conegConf += `    "~text/turtle"          ttl;\n`;
  conegConf += `    "~application/ld\\+json" jsonld;\n`;
  conegConf += `    "~application/rdf\\+xml" rdf;\n`;
  conegConf += `}\n\n`;

  conegConf += `map $res_id $html_path_for_res {\n`;
  for (const res of RESOURCES) {
    const htmlPath = getHtmlPathForEntity(res);
    conegConf += `    "${res.id}" "${htmlPath}";\n`;
  }
  conegConf += `    default "/";\n`;
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

  // Headers for each entity page
  for (const res of RESOURCES) {
    const htmlPath = getHtmlPathForEntity(res);
    const profile = res.alternateProfiles?.[0] || (res.type === "Dataset" ? "https://schema.org/Dataset" : `https://schema.org/${res.type}`);
    const linkHeaders: string[] = [
      `<${profile}>; rel="profile"`,
      `<${BASE_URL}/rdf/${res.id}.ttl>; rel="describedby"; type="text/turtle"`,
      `<${BASE_URL}/rdf/${res.id}.jsonld>; rel="describedby"; type="application/ld+json"`,
      `<${BASE_URL}/linksets/${res.id}.linkset.json>; rel="linkset"; type="application/linkset+json"`,
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
