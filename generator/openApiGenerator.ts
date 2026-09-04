import fs from "fs";
import path from "path";

export function generateOpenApiSpec(baseUrl: string): any {
  return {
    openapi: "3.0.3",
    info: {
      title: "ARMS-MBON Subsetting & Observation API",
      description: "An OpenAPI 3.0-compliant data service supporting parameterized subsetting queries for the ARMS-MBON Metagenomic 18S Observations dataset (PID: /id/dataset/arms-mbon). Conforms to Radical Transparency LSUP #05 (Subsetting API).",
      version: "1.0.0",
      contact: {
        name: "VLIZ Data Centre",
        url: "https://www.vliz.be",
        email: "data@vliz.be"
      },
      license: {
        name: "CC-BY 4.0",
        url: "https://creativecommons.org/licenses/by/4.0/"
      }
    },
    servers: [
      {
        url: baseUrl,
        description: "LOD Webserver Local Host"
      }
    ],
    paths: {
      "/api/observations/v1": {
        get: {
          summary: "Subset ARMS-MBON Observations",
          description: "Retrieve subsetted marine genomic observation records from the ARMS-MBON dataset. Response headers include rel=\"collection\" (pointing to /api/observations/v1), rel=\"cite-as\" (pointing to /id/dataset/arms-mbon), and rel=\"linkset\" per RT-P05.",
          operationId: "getObservations",
          parameters: [
            {
              name: "station",
              in: "query",
              required: false,
              description: "Filter by station ID (e.g. `BE-NRT-01`, `BE-NRT-02`, `BE-NRT-03`)",
              schema: { type: "string", example: "BE-NRT-01" }
            },
            {
              name: "taxon",
              in: "query",
              required: false,
              description: "Filter by taxon scientific name (e.g. `Mytilus edulis`, `Balanus crenatus`)",
              schema: { type: "string", example: "Mytilus edulis" }
            },
            {
              name: "marker_gene",
              in: "query",
              required: false,
              description: "Filter by genetic marker (e.g. `18S`)",
              schema: { type: "string", default: "18S" }
            },
            {
              name: "limit",
              in: "query",
              required: false,
              description: "Number of records to return (1-100)",
              schema: { type: "integer", default: 20 }
            }
          ],
          responses: {
            "200": {
              description: "Subsetted observation records with RT-P05 Link headers",
              headers: {
                "Link": {
                  "description": "RFC 8288 Link headers linking to dataset PID (cite-as), base service (collection), and linkset",
                  "schema": {
                    "type": "string",
                    "example": "<http://localhost:8080/id/dataset/arms-mbon>; rel=\"cite-as\", <http://localhost:8080/api/observations/v1/openapi.json>; rel=\"service-desc\"; type=\"application/json\", <http://localhost:8080/api/observations/v1/docs/>; rel=\"service-doc\"; type=\"text/html\", <http://localhost:8080/api/observations/v1/meta.ttl>; rel=\"service-meta\"; type=\"text/turtle\", <http://localhost:8080/api/observations/v1/linkset.json>; rel=\"linkset\"; type=\"application/linkset+json\", <http://localhost:8080/.well-known/api-catalog>; rel=\"api-catalog\""
                  }
                }
              },
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      dataset: { type: "string", example: "http://localhost:8080/id/dataset/arms-mbon" },
                      title: { type: "string", example: "ARMS-MBON data on long-term monitoring of hard-bottom communities: 18S results from 2018-2020" },
                      cite_as: { type: "string", example: "https://doi.org/10.14284/578" },
                      license: { type: "string", example: "https://creativecommons.org/licenses/by/4.0/" },
                      total: { type: "integer", example: 24 },
                      limit: { type: "integer", example: 20 },
                      data: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            id: { type: "string" },
                            station: { type: "string" },
                            date: { type: "string" },
                            taxon: { type: "string" },
                            marker_gene: { type: "string" },
                            reads: { type: "number" },
                            unit: { type: "string" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  };
}

import { renderHeader, renderFooter } from "./htmlTemplates";

export function generateApiDocsHtml(baseUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Subsetting API & OpenAPI Documentation - VLIZ Marine Data Portal</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="/style.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.min.css">
  <link rel="describedby" type="application/vnd.oai.openapi+json" href="/api/observations/v1/openapi.json">
  <link rel="describedby" type="application/vnd.oai.openapi+yaml" href="/api/observations/v1/openapi.yaml">
  <link rel="service-desc" type="application/vnd.oai.openapi+json" href="/api/observations/v1/openapi.json">
  <style>
    .swagger-ui .topbar { display: none; }
    .main-content {
      flex: 1;
      padding: 2rem 1rem;
      background: var(--bg-primary);
    }
    .swagger-container {
      max-width: 1200px;
      margin: 2rem auto;
      padding: 1.5rem;
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(15, 23, 42, 0.06);
    }
  </style>
</head>
<body>
  ${renderHeader('api')}

  <main class="main-content">
    <div class="swagger-container">
      <div id="swagger-ui"></div>
    </div>
  </main>

  ${renderFooter()}

  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
  <script>
    window.onload = () => {
      window.ui = SwaggerUIBundle({
        url: '/api/observations/v1/openapi.json',
        dom_id: '#swagger-ui',
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIBundle.SwaggerUIStandalonePreset
        ],
        layout: "BaseLayout",
        deepLinking: true,
        showExtensions: true,
        showCommonExtensions: true
      });
    };
  </script>
</body>
</html>`;
}

export const generateSwaggerHtml = generateApiDocsHtml;

export function generateApiMetaTtl(baseUrl: string): string {
  return `@prefix dcat: <http://www.w3.org/ns/dcat#> .
@prefix dcterms: <http://purl.org/dc/terms/> .

<${baseUrl}/id/service/marineinfo-api> a dcat:DataService ;
    dcterms:title "ARMS-MBON Subsetting & Observation API (v1)" ;
    dcterms:description "Parameterized observation querying service for marine genomics." ;
    dcat:endpointURL <${baseUrl}/api/observations/v1> ;
    dcat:endpointDescription <${baseUrl}/api/observations/v1/openapi.json> ;
    dcat:servesDataset <${baseUrl}/id/dataset/arms-mbon> .
`;
}

export function generateApiSampleResponses(distDir: string, baseUrl: string = "http://localhost:8080"): void {
  const v1Dir = path.join(distDir, "api", "observations", "v1");
  const v1DocsDir = path.join(v1Dir, "docs");

  if (!fs.existsSync(v1DocsDir)) {
    fs.mkdirSync(v1DocsDir, { recursive: true });
  }

  // 1. Observation data payload
  const observationsResponse = {
    dataset: `${baseUrl}/id/dataset/arms-mbon`,
    title: "ARMS-MBON data on long-term monitoring of hard-bottom communities: 18S results from 2018-2020",
    cite_as: "https://doi.org/10.14284/578",
    license: "https://creativecommons.org/licenses/by/4.0/",
    query: {
      marker_gene: "18S",
      limit: 20
    },
    total: 24,
    limit: 20,
    data: [
      { id: "OBS-2018-01", station: "BE-NRT-01", date: "2018-06-14", taxon: "Mytilus edulis", marker_gene: "18S", reads: 1420, unit: "sequence_reads" },
      { id: "OBS-2018-02", station: "BE-NRT-01", date: "2018-06-14", taxon: "Balanus crenatus", marker_gene: "18S", reads: 3840, unit: "sequence_reads" },
      { id: "OBS-2018-03", station: "BE-NRT-02", date: "2018-09-22", taxon: "Electra pilosa", marker_gene: "18S", reads: 980, unit: "sequence_reads" },
      { id: "OBS-2018-04", station: "BE-NRT-02", date: "2018-09-22", taxon: "Spirobranchus triqueter", marker_gene: "18S", reads: 1890, unit: "sequence_reads" },
      { id: "OBS-2019-01", station: "BE-NRT-03", date: "2019-05-18", taxon: "Tubularia indivisa", marker_gene: "18S", reads: 2450, unit: "sequence_reads" },
      { id: "OBS-2019-02", station: "BE-NRT-03", date: "2019-05-18", taxon: "Botryllus schlosseri", marker_gene: "18S", reads: 3120, unit: "sequence_reads" },
      { id: "OBS-2019-03", station: "BE-NRT-03", date: "2019-08-30", taxon: "Asterias rubens", marker_gene: "18S", reads: 760, unit: "sequence_reads" },
      { id: "OBS-2020-01", station: "BE-NRT-04", date: "2020-10-05", taxon: "Sabellaria spinulosa", marker_gene: "18S", reads: 1610, unit: "sequence_reads" },
      { id: "OBS-2020-02", station: "BE-NRT-04", date: "2020-10-05", taxon: "Suberites ficus", marker_gene: "18S", reads: 1150, unit: "sequence_reads" },
      { id: "OBS-2020-03", station: "BE-NRT-04", date: "2020-10-05", taxon: "Necora puber", marker_gene: "18S", reads: 840, unit: "sequence_reads" }
    ]
  };

  fs.writeFileSync(path.join(v1Dir, "data.json"), JSON.stringify(observationsResponse, null, 2));

  // 2. Co-located OpenAPI Spec
  const openApiSpec = generateOpenApiSpec(baseUrl);
  fs.writeFileSync(path.join(v1Dir, "openapi.json"), JSON.stringify(openApiSpec, null, 2));

  // 3. Co-located DCAT-3 metadata
  fs.writeFileSync(path.join(v1Dir, "meta.ttl"), generateApiMetaTtl(baseUrl));

  // 4. Co-located Swagger UI docs
  fs.writeFileSync(path.join(v1DocsDir, "index.html"), generateApiDocsHtml(baseUrl));

  // 5. Co-located dedicated API sitemap (RT-P07)
  fs.writeFileSync(path.join(v1Dir, "sitemap.xml"), generateApiSitemapXml(baseUrl));
}

export function generateApiSitemapXml(baseUrl: string = "http://localhost:8080"): string {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
  xml += `        xmlns:rs="http://www.openarchives.org/rs/terms/">\n`;
  xml += `  <rs:ln rel="self" href="${baseUrl}/api/observations/v1" />\n`;
  xml += `  <url>\n`;
  xml += `    <loc>${baseUrl}/api/observations/v1?marker_gene=18S&amp;limit=20</loc>\n`;
  xml += `    <rs:ln rel="collection" href="${baseUrl}/api/observations/v1" />\n`;
  xml += `    <rs:ln rel="cite-as" href="${baseUrl}/id/dataset/arms-mbon" />\n`;
  xml += `  </url>\n`;
  xml += `  <url>\n`;
  xml += `    <loc>${baseUrl}/api/observations/v1?marker_gene=COI&amp;limit=20</loc>\n`;
  xml += `    <rs:ln rel="collection" href="${baseUrl}/api/observations/v1" />\n`;
  xml += `    <rs:ln rel="cite-as" href="${baseUrl}/id/dataset/arms-mbon" />\n`;
  xml += `  </url>\n`;
  xml += `  <url>\n`;
  xml += `    <loc>${baseUrl}/api/observations/v1?marker_gene=ITS&amp;limit=20</loc>\n`;
  xml += `    <rs:ln rel="collection" href="${baseUrl}/api/observations/v1" />\n`;
  xml += `    <rs:ln rel="cite-as" href="${baseUrl}/id/dataset/arms-mbon" />\n`;
  xml += `  </url>\n`;
  xml += `</urlset>\n`;
  return xml;
}

