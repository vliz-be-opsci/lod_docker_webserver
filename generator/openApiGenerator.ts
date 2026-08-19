import fs from "fs";
import path from "path";

export function generateOpenApiSpec(baseUrl: string): any {
  return {
    openapi: "3.0.3",
    info: {
      title: "MarineInfo Subsetting & Observation API",
      description: "An OpenAPI 3.0-compliant data service supporting parameterized subsetting queries for marine biodiversity, ARMS genomic monitoring, and buoy telemetry observations from the Flanders Marine Institute (VLIZ). Conforms to Radical Transparency LSUP #05.",
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
          summary: "Query Marine Observations",
          description: "Retrieve subsetted marine observation records across ARMS metagenomics, baseline ecology, buoy sensors, and species occurrences.",
          operationId: "getObservations",
          parameters: [
            {
              name: "dataset",
              in: "query",
              required: false,
              description: "Filter by dataset identifier (`arms-mbon`, `arms-2018`, `north-sea-sensors`, `eurobis`)",
              schema: {
                type: "string",
                enum: ["arms-mbon", "arms-2018", "north-sea-sensors", "eurobis"],
                default: "arms-mbon"
              }
            },
            {
              name: "station",
              in: "query",
              required: false,
              description: "Filter by station ID (e.g. `BE-NRT-01`, `Thorntonbank`)",
              schema: { type: "string" }
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
              description: "Observation query results",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      total: { type: "integer", example: 42 },
                      limit: { type: "integer", example: 20 },
                      dataset: { type: "string", example: "arms-mbon" },
                      data: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            id: { type: "string" },
                            station: { type: "string" },
                            date: { type: "string" },
                            taxon: { type: "string" },
                            value: { type: "number" },
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
      },
      "/api/v1/datasets": {
        get: {
          summary: "List Datasets",
          description: "Get metadata for all datasets hosted on this webserver.",
          operationId: "listDatasets",
          responses: {
            "200": {
              description: "List of available datasets",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      count: { type: "integer" },
                      datasets: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            id: { type: "string" },
                            title: { type: "string" },
                            category: { type: "string" },
                            distributions: { type: "array", items: { type: "string" } }
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
      <a href="/api/docs/" class="active">Subsetting API</a>
      <a href="/publications/ro-crate-paper.html">Publications</a>
      <a href="/institutes/vliz.html">Institute</a>
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
        <a href="https://github.com/eosc-semantic-interop/if-solutions-proposals/tree/main/proposals/radical-transparency/linkset-usage-patterns" target="_blank" title="EOSC Linkset Usage Patterns (RT-P01 to RT-P10)">📋 RT Patterns</a>
        <a href="/map.html">🗺️ Metro Map</a>
        <a href="/profiles/">📑 Profiles</a>
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
    total: 24,
    limit: 20,
    dataset: "arms-mbon",
    data: [
      { id: "EVT-2018-01", station: "BE-NRT-01", date: "2018-06-14", taxon: "Mytilus edulis", value: 1420, unit: "reads" },
      { id: "EVT-2018-02", station: "BE-NRT-01", date: "2018-06-14", taxon: "Balanus crenatus", value: 3840, unit: "reads" },
      { id: "EVT-2018-03", station: "BE-NRT-02", date: "2018-09-22", taxon: "Electra pilosa", value: 980, unit: "reads" },
      { id: "EVT-2018-04", station: "BE-NRT-02", date: "2018-09-22", taxon: "Spirobranchus triqueter", value: 1890, unit: "reads" },
      { id: "EVT-2019-01", station: "BE-NRT-03", date: "2019-05-18", taxon: "Tubularia indivisa", value: 2450, unit: "reads" },
      { id: "EVT-2019-02", station: "BE-NRT-03", date: "2019-05-18", taxon: "Botryllus schlosseri", value: 3120, unit: "reads" },
      { id: "EVT-2019-03", station: "BE-NRT-03", date: "2019-08-30", taxon: "Asterias rubens", value: 760, unit: "reads" },
      { id: "EVT-2020-01", station: "BE-NRT-04", date: "2020-10-05", taxon: "Sabellaria spinulosa", value: 1610, unit: "reads" },
      { id: "EVT-2020-02", station: "BE-NRT-04", date: "2020-10-05", taxon: "Suberites ficus", value: 1150, unit: "reads" },
      { id: "EVT-2020-03", station: "BE-NRT-04", date: "2020-10-05", taxon: "Necora puber", value: 840, unit: "reads" }
    ]
  };

  fs.writeFileSync(path.join(apiV1Dir, "observations"), JSON.stringify(observationsResponse, null, 2));
  fs.writeFileSync(path.join(apiV1Dir, "observations.json"), JSON.stringify(observationsResponse, null, 2));

  // 2. /api/v1/datasets
  const datasetsResponse = {
    count: 4,
    datasets: [
      {
        id: "resource-arms-mbon",
        title: "ARMS-MBON data on long-term monitoring of hard-bottom communities: 18S results from 2018-2020",
        category: "dataset",
        distributions: ["/data/arms-mbon-18s.csv", "/data/arms-mbon-stations.geojson", "/data/arms-mbon-rocrate.zip"]
      },
      {
        id: "resource-arms-2018",
        title: "ARMS 2018 dataset on long-term monitoring and biodiversity assessment of invasive and indigenous hard-bottom communities",
        category: "dataset",
        distributions: ["/data/arms-2018-samples.csv"]
      },
      {
        id: "resource-north-sea-sensors",
        title: "Belgian North Sea Sensor & Buoy Time-Series (LifeWatch/VLIZ)",
        category: "dataset",
        distributions: ["/data/north-sea-sensors-latest.csv", "/data/north-sea-sensors-stream.json"]
      },
      {
        id: "resource-eurobis-occurrences",
        title: "EurOBIS European Marine Species Taxon Occurrences Sample",
        category: "dataset",
        distributions: ["/data/eurobis-occurrences.geojson", "/data/eurobis-dwca-sample.zip"]
      }
    ]
  };

  fs.writeFileSync(path.join(apiV1Dir, "datasets"), JSON.stringify(datasetsResponse, null, 2));
  fs.writeFileSync(path.join(apiV1Dir, "datasets.json"), JSON.stringify(datasetsResponse, null, 2));
}
