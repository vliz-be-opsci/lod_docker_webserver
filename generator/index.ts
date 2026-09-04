import fs from "fs";
import path from "path";
import { RESOURCES, getResourceById } from "./resources";
import { PROFILES, getProfileById } from "./profiles";
import { serializeJsonLd, serializeTurtle, serializeRDFXML, expandUri } from "./rdfSerializer";
import { generateDcatCatalog } from "./dcatGenerator";
import { generateLinkset, generateSplitLinksets, generateApiCatalog, generateHistoryLinkset } from "./linksetGenerator";
import { generateDataPayloads } from "./dataPayloads";
import { generateOpenApiSpec, generateApiDocsHtml, generateApiSampleResponses } from "./openApiGenerator";
import {
  generateProfileHtml,
  generateProfileCatalogHtml,
  generateProfileTurtle,
  generateProfileJsonLd,
  generateProfileLinkset,
  generateProfileHistoryLinkset
} from "./profileGenerator";
import {
  getCssContent,
  renderCatalogHomeHtml,
  renderDatasetPageHtml,
  renderHistoryPageHtml,
  renderInstitutePageHtml,
  renderPublicationPageHtml,
  renderProjectPageHtml,
  renderPersonPageHtml,
  renderDcatHtml
} from "./htmlTemplates";
import { getEntityTypeSlug, getEntityNameSlug, getEntityIdPath, getEntityHtmlPath } from "./types";
import { generateMetroMapHtml } from "./metroMapGenerator";
import { generateComplianceDocs } from "./complianceDocs";
import { generateAuditHtml, generateComplianceJson } from "./auditPageRenderer";
import { generateGappedSite } from "./gappedGenerator";

const BASE_URL = process.env.BASE_URL || "http://localhost:8080";
const BASE_URL_GAPPED = process.env.BASE_URL_GAPPED || "http://localhost:8081";
const DIST_DIR = path.resolve(process.cwd(), "dist");
const DIST_GAPPED_DIR = path.resolve(process.cwd(), "dist-gapped");

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
    path.join(DIST_DIR, "api", "observations"),
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
  await generateDataPayloads(DIST_DIR, BASE_URL);

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

    // Flat files
    fs.writeFileSync(path.join(targetDir, `${nameSlug}.jsonld`), jsonld);
    fs.writeFileSync(path.join(targetDir, `${nameSlug}.ttl`), ttl);
    fs.writeFileSync(path.join(targetDir, `${nameSlug}.rdf`), rdf);
    fs.writeFileSync(path.join(targetDir, `${nameSlug}.linkset.json`), JSON.stringify(linkset, null, 2));

    // Nested versioned files (e.g., dist/id/dataset/dataset-90/v2.1.ttl)
    if (resource.seriesId && resource.version) {
      const parentSlug = getEntityNameSlug(resource.seriesId);
      const nestedDir = path.join(targetDir, parentSlug);
      if (!fs.existsSync(nestedDir)) {
        fs.mkdirSync(nestedDir, { recursive: true });
      }
      fs.writeFileSync(path.join(nestedDir, `v${resource.version}.jsonld`), jsonld);
      fs.writeFileSync(path.join(nestedDir, `v${resource.version}.ttl`), ttl);
      fs.writeFileSync(path.join(nestedDir, `v${resource.version}.rdf`), rdf);
      fs.writeFileSync(path.join(nestedDir, `v${resource.version}.linkset.json`), JSON.stringify(linkset, null, 2));
    }

    // Showcase RT-P08: Large Linkset Split-Up on arms-mbon
    if (resource.id === "resource-arms-mbon") {
      const splitLinksets = generateSplitLinksets(resource, BASE_URL);
      fs.writeFileSync(path.join(targetDir, `${nameSlug}.conneg.linkset.json`), JSON.stringify(splitLinksets.conneg, null, 2));
      fs.writeFileSync(path.join(targetDir, `${nameSlug}.profiles.linkset.json`), JSON.stringify(splitLinksets.profiles, null, 2));
      fs.writeFileSync(path.join(targetDir, `${nameSlug}.provenance.linkset.json`), JSON.stringify(splitLinksets.provenance, null, 2));
    }
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

    if (profile.abstractProfileId && profile.version) {
      const nestedProfDir = path.join(DIST_DIR, "id", "profile", profile.abstractProfileId);
      if (!fs.existsSync(nestedProfDir)) {
        fs.mkdirSync(nestedProfDir, { recursive: true });
      }
      fs.writeFileSync(path.join(nestedProfDir, `v${profile.version}.html`), generateProfileHtml(profile, BASE_URL));
      fs.writeFileSync(path.join(nestedProfDir, `v${profile.version}.ttl`), generateProfileTurtle(profile, BASE_URL));
      fs.writeFileSync(path.join(nestedProfDir, `v${profile.version}.jsonld`), generateProfileJsonLd(profile, BASE_URL));
      fs.writeFileSync(path.join(nestedProfDir, `v${profile.version}.linkset.json`), JSON.stringify(generateProfileLinkset(profile, BASE_URL), null, 2));
    }
  }

  // Generate RO-Crate Profile History Linkset
  const roCrateAbstract = getProfileById("ro-crate-package-profile");
  if (roCrateAbstract) {
    const roCrateVersions = [
      getProfileById("ro-crate-package-profile-v1.0")!,
      getProfileById("ro-crate-package-profile-v1.1")!
    ].filter(Boolean);
    const roCrateHistDir = path.join(DIST_DIR, "id", "profile", "ro-crate-package-profile");
    if (!fs.existsSync(roCrateHistDir)) {
      fs.mkdirSync(roCrateHistDir, { recursive: true });
    }
    fs.writeFileSync(path.join(roCrateHistDir, "history.linkset.json"), JSON.stringify(generateProfileHistoryLinkset(roCrateAbstract, roCrateVersions, BASE_URL), null, 2));
  }

  // 6. Generate OpenAPI Specification & Subsetting API Explorer in /api/observations/v1/
  console.log(`Generating OpenAPI specification & Swagger UI in /api/observations/v1/...`);
  generateApiSampleResponses(DIST_DIR, BASE_URL);

  // Clean up legacy top-level API files if they exist in dist
  const legacyOpenApi = path.join(DIST_DIR, "api", "openapi.json");
  if (fs.existsSync(legacyOpenApi)) fs.rmSync(legacyOpenApi);
  const legacyOpenApiYaml = path.join(DIST_DIR, "api", "openapi.yaml");
  if (fs.existsSync(legacyOpenApiYaml)) fs.rmSync(legacyOpenApiYaml);
  const legacyDocs = path.join(DIST_DIR, "api", "docs");
  if (fs.existsSync(legacyDocs)) fs.rmSync(legacyDocs, { recursive: true, force: true });
  const legacyLinkset = path.join(DIST_DIR, "api", "observations", "v1.linkset.json");
  if (fs.existsSync(legacyLinkset)) fs.rmSync(legacyLinkset);

  // Generate dedicated RT-P05 API Linkset
  const apiResource = RESOURCES.find(r => r.id === "resource-marineinfo-api")!;
  const apiLinksetJson = generateLinkset(apiResource, BASE_URL);
  fs.writeFileSync(path.join(DIST_DIR, "api", "observations", "v1", "linkset.json"), JSON.stringify(apiLinksetJson, null, 2));

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

    let htmlContent = "";
    if (res.category === "dataset") {
      htmlContent = renderDatasetPageHtml(res, BASE_URL);
    } else if (res.category === "institute") {
      htmlContent = renderInstitutePageHtml(res, BASE_URL);
    } else if (res.category === "publication") {
      htmlContent = renderPublicationPageHtml(res, BASE_URL);
    } else if (res.category === "project") {
      htmlContent = renderProjectPageHtml(res, BASE_URL);
    } else if (res.category === "person") {
      htmlContent = renderPersonPageHtml(res, BASE_URL);
    } else if (res.category === "service" || res.category === "api") {
      htmlContent = generateApiDocsHtml(BASE_URL);
    }

    fs.writeFileSync(path.join(targetDir, `${nameSlug}.html`), htmlContent);

    if (res.seriesId && res.version) {
      const parentSlug = getEntityNameSlug(res.seriesId);
      const nestedDir = path.join(targetDir, parentSlug);
      if (!fs.existsSync(nestedDir)) {
        fs.mkdirSync(nestedDir, { recursive: true });
      }
      fs.writeFileSync(path.join(nestedDir, `v${res.version}.html`), htmlContent);
    }
  }

  // Generate RT-P09 History Page & Linkset for Dataset 90
  const series90 = getResourceById("resource-dataset-90");
  if (series90) {
    const releases90 = [
      getResourceById("resource-dataset-90-v1.0")!,
      getResourceById("resource-dataset-90-v2.0")!,
      getResourceById("resource-dataset-90-v2.1")!
    ].filter(Boolean);
    const d90HistoryDir = path.join(DIST_DIR, "id", "dataset", "dataset-90");
    if (!fs.existsSync(d90HistoryDir)) {
      fs.mkdirSync(d90HistoryDir, { recursive: true });
    }
    fs.writeFileSync(path.join(d90HistoryDir, "history.html"), renderHistoryPageHtml(series90, releases90, BASE_URL));
    fs.writeFileSync(path.join(d90HistoryDir, "history.linkset.json"), JSON.stringify(generateHistoryLinkset(series90, releases90, BASE_URL), null, 2));
  }

  // 9. Generate Sitemap with ResourceSync rs:ln (Signmap)
  console.log(`Generating sitemap.xml with ResourceSync rs:ln extensions...`);
  let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  sitemapXml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
  sitemapXml += `        xmlns:rs="http://www.openarchives.org/rs/terms/">\n`;

  // Root URL
  sitemapXml += `  <url>\n    <loc>${BASE_URL}/</loc>\n`;
  sitemapXml += `    <rs:ln rel="api-catalog" href="${BASE_URL}/.well-known/api-catalog" type="application/linkset+json" />\n`;
  sitemapXml += `    <rs:ln rel="alternate" href="${BASE_URL}/catalog/dcat.ttl" type="text/turtle" />\n`;
  sitemapXml += `  </url>\n`;

  // Metro Map URL
  sitemapXml += `  <url>\n    <loc>${BASE_URL}/map.html</loc>\n`;
  sitemapXml += `    <rs:ln rel="type" href="https://schema.org/Thing" />\n`;
  sitemapXml += `  </url>\n`;

  // Profiles Registry & Profiles
  sitemapXml += `  <url>\n    <loc>${BASE_URL}/id/profiles</loc>\n`;
  sitemapXml += `    <rs:ln rel="type" href="http://www.w3.org/ns/dx/prof/Profile" />\n`;
  sitemapXml += `  </url>\n`;

  for (const prof of PROFILES) {
    sitemapXml += `  <url>\n    <loc>${BASE_URL}/id/profile/${prof.id}</loc>\n`;
    sitemapXml += `    <rs:ln rel="type" href="http://www.w3.org/ns/dx/prof/Profile" />\n`;
    sitemapXml += `    <rs:ln rel="linkset" href="${BASE_URL}/id/profile/${prof.id}.linkset.json" type="application/linkset+json" />\n`;
    sitemapXml += `  </url>\n`;
  }

  // Catalog URL
  sitemapXml += `  <url>\n    <loc>${BASE_URL}/catalog/</loc>\n`;
  sitemapXml += `    <rs:ln rel="type" href="https://www.w3.org/TR/vocab-dcat/" />\n`;
  sitemapXml += `    <rs:ln rel="alternate" href="${BASE_URL}/catalog/dcat.ttl" type="text/turtle" />\n`;
  sitemapXml += `    <rs:ln rel="alternate" href="${BASE_URL}/catalog/dcat.jsonld" type="application/ld+json" />\n`;
  sitemapXml += `  </url>\n`;

  // Each entity URL (Clean Base PID with linkset; optional rel=type and alternate variants demonstrated on arms-mbon)
  for (const res of RESOURCES) {
    const htmlPath = getEntityHtmlPath(res);
    const typeSlug = getEntityTypeSlug(res);
    const nameSlug = getEntityNameSlug(res);
    sitemapXml += `  <url>\n    <loc>${BASE_URL}/id/${typeSlug}/${nameSlug}</loc>\n`;
    if (res.profileId) {
      sitemapXml += `    <rs:ln rel="profile" href="${BASE_URL}/id/profile/${res.profileId}" />\n`;
    }
    sitemapXml += `    <rs:ln rel="linkset" href="${BASE_URL}/id/${typeSlug}/${nameSlug}.linkset.json" type="application/linkset+json" />\n`;
    
    // Optional showcase: Demonstrating that rel=type and alternate format variants can optionally be declared directly in the sitemap alongside the linkset
    if (res.id === "resource-arms-mbon") {
      sitemapXml += `    <rs:ln rel="type" href="https://schema.org/Dataset" />\n`;
      sitemapXml += `    <rs:ln rel="alternate" href="${BASE_URL}${htmlPath}" type="text/html" />\n`;
      sitemapXml += `    <rs:ln rel="alternate" href="${BASE_URL}/id/${typeSlug}/${nameSlug}.ttl" type="text/turtle" />\n`;
      sitemapXml += `    <rs:ln rel="alternate" href="${BASE_URL}/id/${typeSlug}/${nameSlug}.jsonld" type="application/ld+json" />\n`;
      sitemapXml += `    <rs:ln rel="alternate" href="${BASE_URL}/id/${typeSlug}/${nameSlug}.rdf" type="application/rdf+xml" />\n`;
    }
    sitemapXml += `  </url>\n`;
  }

  sitemapXml += `</urlset>\n`;
  fs.writeFileSync(path.join(DIST_DIR, "sitemap.xml"), sitemapXml);

  // RT-P07 Catalogue Assistance: Generate Sub-Sitemaps & Sitemap Index
  console.log(`Generating sitemap-index.xml and sub-sitemaps for RT-P07...`);
  
  // 1. sitemap-datasets.xml
  let sitemapDatasets = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n        xmlns:rs="http://www.openarchives.org/rs/terms/">\n`;
  for (const res of RESOURCES) {
    const typeSlug = getEntityTypeSlug(res);
    const nameSlug = getEntityNameSlug(res);
    sitemapDatasets += `  <url>\n    <loc>${BASE_URL}/id/${typeSlug}/${nameSlug}</loc>\n`;
    if (res.profileId) {
      sitemapDatasets += `    <rs:ln rel="profile" href="${BASE_URL}/id/profile/${res.profileId}" />\n`;
    }
    sitemapDatasets += `    <rs:ln rel="linkset" href="${BASE_URL}/id/${typeSlug}/${nameSlug}.linkset.json" type="application/linkset+json" />\n`;
    sitemapDatasets += `  </url>\n`;
  }
  sitemapDatasets += `</urlset>\n`;
  fs.writeFileSync(path.join(DIST_DIR, "sitemap-datasets.xml"), sitemapDatasets);

  // 2. sitemap-profiles.xml
  let sitemapProfiles = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n        xmlns:rs="http://www.openarchives.org/rs/terms/">\n`;
  sitemapProfiles += `  <url>\n    <loc>${BASE_URL}/id/profiles</loc>\n    <rs:ln rel="type" href="http://www.w3.org/ns/dx/prof/Profile" />\n  </url>\n`;
  for (const prof of PROFILES) {
    sitemapProfiles += `  <url>\n    <loc>${BASE_URL}/id/profile/${prof.id}</loc>\n`;
    sitemapProfiles += `    <rs:ln rel="type" href="http://www.w3.org/ns/dx/prof/Profile" />\n`;
    sitemapProfiles += `    <rs:ln rel="linkset" href="${BASE_URL}/id/profile/${prof.id}.linkset.json" type="application/linkset+json" />\n`;
    sitemapProfiles += `  </url>\n`;
  }
  sitemapProfiles += `</urlset>\n`;
  fs.writeFileSync(path.join(DIST_DIR, "sitemap-profiles.xml"), sitemapProfiles);

  // 3. sitemap-catalog.xml (RT-P07)
  let sitemapCatalog = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n        xmlns:rs="http://www.openarchives.org/rs/terms/">\n`;
  sitemapCatalog += `  <rs:ln rel="self" href="${BASE_URL}/.well-known/api-catalog" />\n`;
  sitemapCatalog += `  <url>\n    <loc>${BASE_URL}/catalog/</loc>\n    <rs:ln rel="type" href="https://www.w3.org/TR/vocab-dcat/" />\n    <rs:ln rel="alternate" href="${BASE_URL}/catalog/dcat.ttl" type="text/turtle" />\n  </url>\n`;
  sitemapCatalog += `  <url>\n    <loc>${BASE_URL}/.well-known/api-catalog</loc>\n    <rs:ln rel="profile" href="https://www.rfc-editor.org/info/rfc9727" />\n  </url>\n`;
  sitemapCatalog += `  <url>\n    <loc>${BASE_URL}/api/observations/v1</loc>\n    <rs:ln rel="cite-as" href="${BASE_URL}/id/dataset/arms-mbon" />\n    <rs:ln rel="alternate" href="${BASE_URL}/api/observations/v1/sitemap.xml" type="application/xml" />\n  </url>\n`;
  sitemapCatalog += `  <url>\n    <loc>${BASE_URL}/api/observations/v1/docs/</loc>\n    <rs:ln rel="service-desc" href="${BASE_URL}/api/observations/v1/openapi.json" />\n  </url>\n`;
  sitemapCatalog += `</urlset>\n`;
  fs.writeFileSync(path.join(DIST_DIR, "sitemap-catalog.xml"), sitemapCatalog);

  // 4. sitemap-index.xml (RT-P07)
  let sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  sitemapIndex += `  <sitemap>\n    <loc>${BASE_URL}/sitemap.xml</loc>\n  </sitemap>\n`;
  sitemapIndex += `  <sitemap>\n    <loc>${BASE_URL}/sitemap-datasets.xml</loc>\n  </sitemap>\n`;
  sitemapIndex += `  <sitemap>\n    <loc>${BASE_URL}/sitemap-profiles.xml</loc>\n  </sitemap>\n`;
  sitemapIndex += `  <sitemap>\n    <loc>${BASE_URL}/sitemap-catalog.xml</loc>\n  </sitemap>\n`;
  sitemapIndex += `  <sitemap>\n    <loc>${BASE_URL}/api/observations/v1/sitemap.xml</loc>\n  </sitemap>\n`;
  sitemapIndex += `</sitemapindex>\n`;
  fs.writeFileSync(path.join(DIST_DIR, "sitemap-index.xml"), sitemapIndex);

  const robotsTxt = `User-agent: *\nAllow: /\nSitemap: ${BASE_URL}/sitemap-index.xml\nSitemap: ${BASE_URL}/sitemap.xml\n`;
  fs.writeFileSync(path.join(DIST_DIR, "robots.txt"), robotsTxt);

  // 10. Generate Nginx Content-Negotiation Map & DOI-to-Payload Map (nginx-coneg.conf)
  console.log(`Generating nginx-coneg.conf...`);
  let conegConf = `# Dynamic Content-Negotiation Map\n`;
  conegConf += `map $http_accept $conneg_suffix {\n`;
  conegConf += `    default                          ttl;\n`;
  conegConf += `    "~text/html"                     html;\n`;
  conegConf += `    "~text/turtle"                   ttl;\n`;
  conegConf += `    "~application/ld\\+json"          jsonld;\n`;
  conegConf += `    "~application/rdf\\+xml"          rdf;\n`;
  conegConf += `    "~application/linkset\\+json"     linkset.json;\n`;
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

  // 11. Generate Nginx HTTP Headers (nginx-headers.conf)
  console.log(`Generating nginx-headers.conf with RFC 8288 Link headers...`);
  let headersConf = `# Dynamically generated RFC 8288 Link headers\n`;

  // Headers for root, catalog, and api-catalog
  headersConf += `location = / {\n`;
  headersConf += `    add_header Link '<${BASE_URL}/.well-known/api-catalog>; rel="api-catalog", <${BASE_URL}/catalog/dcat.ttl>; rel="describedby"; type="text/turtle"' always;\n`;
  headersConf += `}\n\n`;

  headersConf += `location = /sitemap-catalog.xml {\n`;
  headersConf += `    default_type application/xml;\n`;
  headersConf += `    add_header Access-Control-Allow-Origin * always;\n`;
  headersConf += `    add_header Link '<${BASE_URL}/.well-known/api-catalog>; rel="self"' always;\n`;
  headersConf += `}\n\n`;

  headersConf += `location = /api/observations/v1/sitemap.xml {\n`;
  headersConf += `    default_type application/xml;\n`;
  headersConf += `    add_header Access-Control-Allow-Origin * always;\n`;
  headersConf += `    add_header Link '<${BASE_URL}/api/observations/v1>; rel="self", <${BASE_URL}/.well-known/api-catalog>; rel="api-catalog"' always;\n`;
  headersConf += `}\n\n`;

  headersConf += `location = /.well-known/api-catalog {\n`;
  headersConf += `    default_type application/linkset+json;\n`;
  headersConf += `    add_header Access-Control-Allow-Origin * always;\n`;
  headersConf += `    add_header Link '<${BASE_URL}/sitemap-catalog.xml>; rel="alternate"; type="application/xml", <${BASE_URL}/api/observations/v1>; rel="item"' always;\n`;
  headersConf += `}\n\n`;

  headersConf += `location = /catalog/ {\n`;
  headersConf += `    add_header Link '<https://www.w3.org/TR/vocab-dcat/>; rel="type", <${BASE_URL}/catalog/dcat.ttl>; rel="alternate"; type="text/turtle", <${BASE_URL}/catalog/dcat.jsonld>; rel="alternate"; type="application/ld+json"' always;\n`;
  headersConf += `}\n\n`;

  // Headers for Subsetting API (RT-P05 & RT-P07)
  const apiLinks = [
    `<${BASE_URL}/id/dataset/arms-mbon>; rel="cite-as"`,
    `<${BASE_URL}/api/observations/v1/openapi.json>; rel="service-desc"; type="application/json"`,
    `<${BASE_URL}/api/observations/v1/docs/>; rel="service-doc"; type="text/html"`,
    `<${BASE_URL}/api/observations/v1/meta.ttl>; rel="service-meta"; type="text/turtle"`,
    `<${BASE_URL}/api/observations/v1/linkset.json>; rel="linkset"; type="application/linkset+json"`,
    `<${BASE_URL}/api/observations/v1/sitemap.xml>; rel="alternate"; type="application/xml"`,
    `<${BASE_URL}/.well-known/api-catalog>; rel="api-catalog"`,
    `<${BASE_URL}/api/observations/v1>; rel="collection"`
  ];

  headersConf += `location = /api/observations/v1 {\n`;
  headersConf += `    default_type application/json;\n`;
  headersConf += `    add_header Access-Control-Allow-Origin * always;\n`;
  headersConf += `    add_header Access-Control-Allow-Methods "GET, OPTIONS" always;\n`;
  headersConf += `    add_header Access-Control-Allow-Headers "Range, DNT, User-Agent, X-Requested-With, If-Modified-Since, Cache-Control, Content-Type, Accept, Link" always;\n`;
  headersConf += `    add_header Access-Control-Expose-Headers "Link, Content-Type, Location" always;\n`;
  headersConf += `    add_header Link '${apiLinks.join(", ")}' always;\n`;
  headersConf += `    if ($args = "") {\n`;
  headersConf += `        return 307 $scheme://$http_host/api/observations/v1?marker_gene=18S&limit=20;\n`;
  headersConf += `    }\n`;
  headersConf += `    try_files /api/observations/v1/data.json =404;\n`;
  headersConf += `}\n\n`;

  headersConf += `location = /api/observations/v1/linkset.json {\n`;
  headersConf += `    default_type application/linkset+json;\n`;
  headersConf += `    add_header Access-Control-Allow-Origin * always;\n`;
  headersConf += `    add_header Link '<${BASE_URL}/api/observations/v1>; rel="describes", <${BASE_URL}/.well-known/api-catalog>; rel="collection"' always;\n`;
  headersConf += `}\n\n`;

  headersConf += `location = /api/observations/v1/docs/ {\n`;
  headersConf += `    default_type text/html;\n`;
  headersConf += `    add_header Access-Control-Allow-Origin * always;\n`;
  headersConf += `    add_header Link '<${BASE_URL}/api/observations/v1/openapi.json>; rel="service-desc"; type="application/json", <${BASE_URL}/api/observations/v1>; rel="service"' always;\n`;
  headersConf += `}\n\n`;

  headersConf += `location = /api/observations/v1/openapi.json {\n`;
  headersConf += `    default_type application/json;\n`;
  headersConf += `    add_header Access-Control-Allow-Origin * always;\n`;
  headersConf += `    add_header Link '<${BASE_URL}/api/observations/v1>; rel="service", <https://www.openapis.org/#profile>; rel="profile"' always;\n`;
  headersConf += `}\n\n`;

  headersConf += `location = /api/observations/v1/meta.ttl {\n`;
  headersConf += `    default_type text/turtle;\n`;
  headersConf += `    add_header Access-Control-Allow-Origin * always;\n`;
  headersConf += `    add_header Link '<${BASE_URL}/api/observations/v1>; rel="describes"' always;\n`;
  headersConf += `}\n\n`;

  // Headers for Profiles Catalog
  headersConf += `location = /id/profiles {\n`;
  headersConf += `    default_type text/html;\n`;
  headersConf += `    add_header Link '<http://www.w3.org/ns/dx/prof/Profile>; rel="type"' always;\n`;
  headersConf += `    try_files /id/profiles/index.html =404;\n`;
  headersConf += `}\n\n`;

  headersConf += `location = /id/profiles/ {\n`;
  headersConf += `    default_type text/html;\n`;
  headersConf += `    add_header Link '<http://www.w3.org/ns/dx/prof/Profile>; rel="type"' always;\n`;
  headersConf += `    try_files /id/profiles/index.html =404;\n`;
  headersConf += `}\n\n`;

  // Headers for Profiles
  for (const prof of PROFILES) {
    const profileHtmlLinks = [
      `<https://www.rfc-editor.org/info/rfc6906>; rel="type"`,
      `<http://www.w3.org/ns/dx/prof/Profile>; rel="type"`,
      `<${BASE_URL}/id/profile/${prof.id}.ttl>; rel="describedby"; type="text/turtle"`,
      `<${BASE_URL}/id/profile/${prof.id}.linkset.json>; rel="linkset"; type="application/linkset+json"`,
      `<${BASE_URL}/id/profiles>; rel="collection"`
    ];

    if (prof.composedProfiles && prof.composedProfiles.length > 0) {
      for (const subId of prof.composedProfiles) {
        profileHtmlLinks.push(`<${BASE_URL}/id/profile/${subId}>; rel="http://schema.org/hasPart"`);
      }
    }

    headersConf += `location = /id/profile/${prof.id}.html {\n`;
    headersConf += `    add_header Link '${profileHtmlLinks.join(", ")}' always;\n`;
    headersConf += `}\n\n`;

    const profileRdfLinks = [
      `<${BASE_URL}/id/profile/${prof.id}>; rel="describes"`,
      `<https://www.rfc-editor.org/info/rfc6906>; rel="type"`,
      `<http://www.w3.org/ns/dx/prof/Profile>; rel="type"`,
      `<${BASE_URL}/id/profile/${prof.id}.linkset.json>; rel="linkset"; type="application/linkset+json"`
    ];

    headersConf += `location = /id/profile/${prof.id}.ttl {\n`;
    headersConf += `    add_header Link '${profileRdfLinks.join(", ")}' always;\n`;
    headersConf += `}\n\n`;

    headersConf += `location = /id/profile/${prof.id}.jsonld {\n`;
    headersConf += `    add_header Link '${profileRdfLinks.join(", ")}' always;\n`;
    headersConf += `}\n\n`;

    headersConf += `location = /id/profile/${prof.id}.linkset.json {\n`;
    headersConf += `    add_header Link '<${BASE_URL}/id/profile/${prof.id}>; rel="describes"' always;\n`;
    headersConf += `}\n\n`;
  }

  // Headers for each entity page and its format representations
  for (const res of RESOURCES) {
    const htmlPath = getEntityHtmlPath(res);
    const typeSlug = getEntityTypeSlug(res);
    const nameSlug = getEntityNameSlug(res);
    const idPath = getEntityIdPath(res);
    const entityPid = `${BASE_URL}${idPath}`;
    const localDoiUri = res.doi && res.doi.startsWith("https://doi.org/")
      ? `${BASE_URL}/doi/${res.doi.replace("https://doi.org/", "")}`
      : undefined;
    const profileUri = res.profileId ? `${BASE_URL}/id/profile/${res.profileId}` : undefined;
    const typeUri = res.type === "Dataset" ? "https://schema.org/Dataset" : `https://schema.org/${res.type}`;

    const profileHeaders = profileUri ? [`<${profileUri}>; rel="profile"`] : [];
    const typeHeader = `<${typeUri}>; rel="type"`;
    const doiCiteAsHeader = localDoiUri ? [`<${localDoiUri}>; rel="cite-as"`] : [];

    // RT-P09 Lifecycle headers
    const lifecycleHeaders: string[] = [];
    if (res.latestVersionId) {
      const latestRes = getResourceById(res.latestVersionId);
      const latestPid = latestRes ? `${BASE_URL}${getEntityIdPath(latestRes)}` : `${BASE_URL}/id/${typeSlug}/${getEntityNameSlug(res.latestVersionId)}`;
      lifecycleHeaders.push(`<${latestPid}>; rel="latest-version"`);
      lifecycleHeaders.push(`<${BASE_URL}${idPath}/history>; rel="version-history"`);
    }
    if (res.seriesId) {
      const seriesRes = getResourceById(res.seriesId);
      const seriesPid = seriesRes ? `${BASE_URL}${getEntityIdPath(seriesRes)}` : `${BASE_URL}/id/${typeSlug}/${getEntityNameSlug(res.seriesId)}`;
      lifecycleHeaders.push(`<${seriesPid}>; rel="collection"`);
      lifecycleHeaders.push(`<${seriesPid}/history>; rel="version-history"`);
      if (res.predecessorVersionId) {
        const predRes = getResourceById(res.predecessorVersionId);
        const predPid = predRes ? `${BASE_URL}${getEntityIdPath(predRes)}` : `${BASE_URL}/id/${typeSlug}/${getEntityNameSlug(res.predecessorVersionId)}`;
        lifecycleHeaders.push(`<${predPid}>; rel="predecessor-version"`);
      }
      if (res.successorVersionId) {
        const succRes = getResourceById(res.successorVersionId);
        const succPid = succRes ? `${BASE_URL}${getEntityIdPath(succRes)}` : `${BASE_URL}/id/${typeSlug}/${getEntityNameSlug(res.successorVersionId)}`;
        lifecycleHeaders.push(`<${succPid}>; rel="successor-version"`);
      }
    }

    // 1. Headers for .html landing page
    const htmlLinks: string[] = [
      `<${entityPid}>; rel="describes"`,
      ...doiCiteAsHeader,
      ...profileHeaders,
      typeHeader,
      ...lifecycleHeaders,
      `<${BASE_URL}${idPath}.ttl>; rel="describedby"; type="text/turtle"`,
      `<${BASE_URL}${idPath}.linkset.json>; rel="linkset"; type="application/linkset+json"`,
      `<${BASE_URL}/catalog/>; rel="collection"`
    ];

    headersConf += `location = ${htmlPath} {\n`;
    headersConf += `    add_header Link '${htmlLinks.join(", ")}' always;\n`;
    headersConf += `}\n\n`;

    if (`/id/${typeSlug}/${nameSlug}.html` !== htmlPath) {
      headersConf += `location = /id/${typeSlug}/${nameSlug}.html {\n`;
      headersConf += `    add_header Link '${htmlLinks.join(", ")}' always;\n`;
      headersConf += `}\n\n`;
    }

    // 2. Headers for RDF representations (.ttl, .jsonld, .rdf)
    const rdfLinks: string[] = [
      `<${entityPid}>; rel="describes"`,
      ...doiCiteAsHeader,
      ...profileHeaders,
      typeHeader,
      ...lifecycleHeaders,
      `<${BASE_URL}${idPath}.linkset.json>; rel="linkset"; type="application/linkset+json"`
    ];

    headersConf += `location = /id/${typeSlug}/${nameSlug}.ttl {\n`;
    headersConf += `    add_header Link '${rdfLinks.join(", ")}' always;\n`;
    headersConf += `}\n\n`;

    headersConf += `location = /id/${typeSlug}/${nameSlug}.jsonld {\n`;
    headersConf += `    add_header Link '${rdfLinks.join(", ")}' always;\n`;
    headersConf += `}\n\n`;

    headersConf += `location = /id/${typeSlug}/${nameSlug}.rdf {\n`;
    headersConf += `    add_header Link '${rdfLinks.join(", ")}' always;\n`;
    headersConf += `}\n\n`;

    if (res.seriesId && res.version) {
      const parentSlug = getEntityNameSlug(res.seriesId);
      const nestedPrefix = `/id/${typeSlug}/${parentSlug}/v${res.version}`;

      headersConf += `location = ${nestedPrefix}.ttl {\n`;
      headersConf += `    add_header Link '${rdfLinks.join(", ")}' always;\n`;
      headersConf += `}\n\n`;

      headersConf += `location = ${nestedPrefix}.jsonld {\n`;
      headersConf += `    add_header Link '${rdfLinks.join(", ")}' always;\n`;
      headersConf += `}\n\n`;

      headersConf += `location = ${nestedPrefix}.rdf {\n`;
      headersConf += `    add_header Link '${rdfLinks.join(", ")}' always;\n`;
      headersConf += `}\n\n`;

      headersConf += `location = ${nestedPrefix}.linkset.json {\n`;
      headersConf += `    add_header Link '<${entityPid}>; rel="describes"' always;\n`;
      headersConf += `}\n\n`;
    }

    // 3. Headers for Linkset (.linkset.json)
    const splitItemHeaders = (res.id === "resource-arms-mbon")
      ? [
          `<${BASE_URL}/id/${typeSlug}/${nameSlug}.conneg.linkset.json>; rel="item"`,
          `<${BASE_URL}/id/${typeSlug}/${nameSlug}.profiles.linkset.json>; rel="item"`,
          `<${BASE_URL}/id/${typeSlug}/${nameSlug}.provenance.linkset.json>; rel="item"`
        ]
      : [];

    const linksetHeaders = [
      `<${entityPid}>; rel="describes"`,
      ...doiCiteAsHeader,
      ...splitItemHeaders
    ];
    headersConf += `location = /id/${typeSlug}/${nameSlug}.linkset.json {\n`;
    headersConf += `    add_header Link '${linksetHeaders.join(", ")}' always;\n`;
    headersConf += `}\n\n`;

    // 4. Headers for RT-P08 Child Split Linksets (arms-mbon showcase)
    if (res.id === "resource-arms-mbon") {
      const masterLinksetUri = `${BASE_URL}/id/${typeSlug}/${nameSlug}.linkset.json`;
      for (const splitKind of ["conneg", "profiles", "provenance"]) {
        headersConf += `location = /id/${typeSlug}/${nameSlug}.${splitKind}.linkset.json {\n`;
        headersConf += `    add_header Link '<${entityPid}>; rel="describes", <${masterLinksetUri}>; rel="collection"' always;\n`;
        headersConf += `}\n\n`;
      }
    }
  }

  // Headers for History endpoints (RT-P09)
  headersConf += `location = /id/dataset/dataset-90/history.linkset.json {\n`;
  headersConf += `    default_type application/linkset+json;\n`;
  headersConf += `    add_header Access-Control-Allow-Origin * always;\n`;
  headersConf += `    add_header Link '<${BASE_URL}/id/dataset/dataset-90/history>; rel="describes", <${BASE_URL}/id/dataset/dataset-90>; rel="collection"' always;\n`;
  headersConf += `}\n\n`;

  headersConf += `location = /id/dataset/dataset-90/history.html {\n`;
  headersConf += `    add_header Link '<${BASE_URL}/id/dataset/dataset-90/history>; rel="describes", <${BASE_URL}/id/dataset/dataset-90/history.linkset.json>; rel="linkset"; type="application/linkset+json", <${BASE_URL}/id/dataset/dataset-90>; rel="collection"' always;\n`;
  headersConf += `}\n\n`;

  headersConf += `location = /id/profile/ro-crate-package-profile/history.linkset.json {\n`;
  headersConf += `    default_type application/linkset+json;\n`;
  headersConf += `    add_header Access-Control-Allow-Origin * always;\n`;
  headersConf += `    add_header Link '<${BASE_URL}/id/profile/ro-crate-package-profile/history>; rel="describes", <${BASE_URL}/id/profile/ro-crate-package-profile>; rel="collection"' always;\n`;
  headersConf += `}\n\n`;

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

  const sensorCsvLinks = [
    `<${BASE_URL}/id/dataset/north-sea-sensors>; rel="cite-as"`,
    `<${BASE_URL}/id/profile/sensor-telemetry-profile>; rel="profile"`,
    `<${BASE_URL}/id/dataset/north-sea-sensors.ttl>; rel="describedby"; type="text/turtle"`,
    `<${BASE_URL}/id/dataset/north-sea-sensors.html>; rel="describedby"; type="text/html"`,
    `<${BASE_URL}/id/dataset/north-sea-sensors.linkset.json>; rel="linkset"; type="application/linkset+json"`
  ];
  headersConf += `location = /data/north-sea-sensors-latest.csv {\n`;
  headersConf += `    add_header Link '${sensorCsvLinks.join(", ")}' always;\n`;
  headersConf += `}\n\n`;

  // Headers for Dataset 90 CSV Payloads (RT-P09 / Behavior A)
  const d90v1Links = [
    `<${BASE_URL}/doi/10.14284/90.v1.0>; rel="cite-as"`,
    `<${BASE_URL}/id/dataset/dataset-90/v1.0>; rel="cite-as"`,
    `<${BASE_URL}/id/dataset/dataset-90>; rel="collection"`,
    `<${BASE_URL}/id/dataset/dataset-90/v1.0.ttl>; rel="describedby"; type="text/turtle"`,
    `<${BASE_URL}/id/dataset/dataset-90/v1.0.html>; rel="describedby"; type="text/html"`,
    `<${BASE_URL}/id/dataset/dataset-90/v1.0.linkset.json>; rel="linkset"; type="application/linkset+json"`
  ];
  headersConf += `location = /data/dataset-90-v1.0.csv {\n`;
  headersConf += `    add_header Link '${d90v1Links.join(", ")}' always;\n`;
  headersConf += `}\n\n`;

  const d90v2Links = [
    `<${BASE_URL}/doi/10.14284/90.v2.0>; rel="cite-as"`,
    `<${BASE_URL}/id/dataset/dataset-90/v2.0>; rel="cite-as"`,
    `<${BASE_URL}/id/dataset/dataset-90>; rel="collection"`,
    `<${BASE_URL}/id/dataset/dataset-90/v2.0.ttl>; rel="describedby"; type="text/turtle"`,
    `<${BASE_URL}/id/dataset/dataset-90/v2.0.html>; rel="describedby"; type="text/html"`,
    `<${BASE_URL}/id/dataset/dataset-90/v2.0.linkset.json>; rel="linkset"; type="application/linkset+json"`
  ];
  headersConf += `location = /data/dataset-90-v2.0.csv {\n`;
  headersConf += `    add_header Link '${d90v2Links.join(", ")}' always;\n`;
  headersConf += `}\n\n`;

  // Behavior A: dataset-90-v2.1.csv is ALSO the authoritative target of Series DOI 10.14284/90
  const d90v21Links = [
    `<${BASE_URL}/doi/10.14284/90.v2.1>; rel="cite-as"`,
    `<${BASE_URL}/doi/10.14284/90>; rel="collection"`,
    `<${BASE_URL}/id/dataset/dataset-90/v2.1>; rel="cite-as"`,
    `<${BASE_URL}/id/dataset/dataset-90>; rel="collection"`,
    `<${BASE_URL}/id/dataset/dataset-90/v2.1.ttl>; rel="describedby"; type="text/turtle"`,
    `<${BASE_URL}/id/dataset/dataset-90/v2.1.html>; rel="describedby"; type="text/html"`,
    `<${BASE_URL}/id/dataset/dataset-90/v2.1.linkset.json>; rel="linkset"; type="application/linkset+json"`
  ];
  headersConf += `location = /data/dataset-90-v2.1.csv {\n`;
  headersConf += `    add_header Link '${d90v21Links.join(", ")}' always;\n`;
  headersConf += `}\n\n`;

  fs.writeFileSync(path.join(DIST_DIR, "nginx-headers.conf"), headersConf);

  // 12. Generate Radical Transparency Compliance & Gap Documentation
  console.log(`Generating Radical Transparency compliance audit documentation in docs/compliance/...`);
  generateComplianceDocs();

  // 13. Generate Interactive Audit Dashboard & Compliance JSON
  console.log(`Generating interactive audit dashboard and compliance JSON API in /audit.html and /compliance.json...`);
  fs.writeFileSync(path.join(DIST_DIR, "audit.html"), generateAuditHtml(BASE_URL, BASE_URL_GAPPED));
  fs.writeFileSync(path.join(DIST_DIR, "compliance.json"), JSON.stringify(generateComplianceJson(BASE_URL, BASE_URL_GAPPED), null, 2));

  // 14. Generate Gapped / Deficient Site (Port 8081) in dist-gapped/
  console.log(`Generating simulated gapped repository site in dist-gapped/...`);
  await generateGappedSite(DIST_GAPPED_DIR, BASE_URL_GAPPED);
  // Also place audit dashboard and JSON in dist-gapped
  fs.writeFileSync(path.join(DIST_GAPPED_DIR, "audit.html"), generateAuditHtml(BASE_URL, BASE_URL_GAPPED));
  fs.writeFileSync(path.join(DIST_GAPPED_DIR, "compliance.json"), JSON.stringify(generateComplianceJson(BASE_URL, BASE_URL_GAPPED), null, 2));

  console.log(`✅ Generation completed successfully! All assets written to /dist and /dist-gapped.`);
}

main().catch(err => {
  console.error("Build failed:", err);
  process.exit(1);
});
