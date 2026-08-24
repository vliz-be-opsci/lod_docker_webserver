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
      "/api/v1/observations": {
        get: {
          summary: "Subset ARMS-MBON Observations",
          description: "Retrieve subsetted marine genomic observation records from the ARMS-MBON dataset. Response headers include rel=\"collection\" (pointing to /api/v1/observations), rel=\"cite-as\" (pointing to /id/dataset/arms-mbon), and rel=\"linkset\" per RT-P05.",
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
                    "example": "<http://localhost:8080/id/dataset/arms-mbon>; rel=\"cite-as\", <http://localhost:8080/api/openapi.json>; rel=\"service-desc\"; type=\"application/json\", <http://localhost:8080/.well-known/api-catalog>; rel=\"linkset\""
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

export function generateApiDocsHtml(baseUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>MarineInfo Subsetting API Explorer - Swagger UI</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css">
  <link rel="stylesheet" href="/style.css">
  <style>
    body {
      background-color: #f8fafc;
      margin: 0;
      padding: 0;
    }
    .topbar-wrapper {
      display: none !important;
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
  <header>
    <div class="logo-container">
      <span class="logo-badge">LOD</span>
      <h1 class="site-title"><a href="/" style="color: #ffffff; text-decoration: none;">VLIZ Marine Data Portal</a></h1>
    </div>
    <nav class="nav-links">
      <a href="/">Datasets</a>
      <a href="/catalog/">DCAT Catalog</a>
      <a href="/id/profiles">Semantic Profiles</a>
      <a href="/api/docs/" class="active">Subsetting API</a>
      <a href="/id/publication/ro-crate-paper.html">Publications</a>
      <a href="/id/institute/vliz.html">Institute</a>
    </nav>
  </header>

  <main class="main-content">
    <div class="swagger-container">
      <div id="swagger-ui"></div>
    </div>
  </main>

  <footer>
    <div class="footer-container">
      <div>
        <strong>VLIZ Marine Linked Data Portal</strong> — Live Reference Implementation implementing the <a href="https://github.com/eosc-semantic-interop/if-solutions-proposals/tree/main/proposals/radical-transparency" target="_blank" style="color: #ffffff; text-decoration: underline;">EOSC Radical Transparency Proposals</a> & Linkset Usage Patterns (RFC 8288, RFC 9264, RFC 9727, RFC 8631, OpenAPI 3.0).
      </div>
      <div class="footer-links">
        <a href="https://github.com/eosc-semantic-interop/if-solutions-proposals/tree/main/proposals/radical-transparency" target="_blank" title="EOSC Radical Transparency Proposals on GitHub">🐙 EOSC RT Proposals (GitHub)</a>
        <a href="https://github.com/eosc-semantic-interop/if-solutions-proposals/tree/main/proposals/radical-transparency/linkset-usage-patterns" target="_blank" title="EOSC Linkset Usage Patterns (RT-P01 to RT-P08)">📋 RT Patterns</a>
        <a href="/map.html">🗺️ Metro Map</a>
        <a href="/id/profiles">📑 Profiles</a>
        <a href="https://open-science.vliz.be/papers/2026-radical-transparency-position/2026-radical-transparency-position.pdf" target="_blank" title="Radical Transparency Position Paper">📄 Position Paper</a>
        <a href="https://docs.google.com/presentation/d/1-dJbI4bJfCL5JKKE9QHYsqayXkZkOjy1rxcYCuu2ou8/edit" target="_blank" title="Presentation Slides">📊 Slides</a>
        <a href="https://www.iana.org/assignments/link-relations" target="_blank" title="IANA Link Relations Registry">🌐 IANA Link Relations</a>
        <a href="/catalog/dcat.ttl">DCAT Turtle</a>
        <a href="/.well-known/api-catalog">API Catalog</a>
        <a href="/sitemap.xml">Sitemap (rs:ln)</a>
        <a href="https://github.com/vliz-be-opsci/lod_docker_webserver">GitHub Repo</a>
      </div>
    </div>
  </footer>

  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
  <script>
    window.onload = () => {
      window.ui = SwaggerUIBundle({
        url: '/api/openapi.json',
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

export function generateApiSampleResponses(distDir: string): void {
  const apiV1Dir = path.join(distDir, "api", "v1");
  if (!fs.existsSync(apiV1Dir)) {
    fs.mkdirSync(apiV1Dir, { recursive: true });
  }

  // 1. /api/v1/observations default response (and as observations.json)
  const observationsResponse = {
    dataset: "http://localhost:8080/id/dataset/arms-mbon",
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

  fs.writeFileSync(path.join(apiV1Dir, "observations"), JSON.stringify(observationsResponse, null, 2));
  fs.writeFileSync(path.join(apiV1Dir, "observations.json"), JSON.stringify(observationsResponse, null, 2));
}
