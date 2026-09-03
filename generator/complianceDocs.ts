import fs from "fs";
import path from "path";

const COMPLIANCE_DIR = path.resolve(process.cwd(), "docs", "compliance");

interface ComplianceDoc {
  filename: string;
  title: string;
  resourceId: string;
  sourceUri: string;
  entityType: string;
  upstreamState: string;
  gaps: string[];
  rtEnhancements: {
    headers: string[];
    linkset: string;
    distributions: string[];
    rdf: string[];
    conneg: string;
  };
}

const AUDIT_DOCS: ComplianceDoc[] = [
  {
    filename: "arms-mbon-8617.md",
    title: "ARMS-MBON Metagenomic 18S Observations (Dataset 8617)",
    resourceId: "resource-arms-mbon",
    sourceUri: "https://marineinfo.org/id/dataset/8617",
    entityType: "schema:Dataset / dcat:Dataset",
    upstreamState: "MarineInfo standard dataset landing page. Provides HTML summary with schema.org Dataset JSON-LD embedded in `<script>`. Lacks RFC 8288 HTTP Link headers, external linksets, and multi-format content negotiation.",
    gaps: [
      "No RFC 8288 `Link:` headers on HTTP responses (missing `rel=\"profile\"`, `rel=\"describedby\"`, `rel=\"linkset\"`, `rel=\"item\"`).",
      "No RFC 9264 standalone JSON Linkset (`application/linkset+json`).",
      "No direct HTTP 303 Content Negotiation for Turtle, JSON-LD, or RDF/XML representations on persistent URI.",
      "Data files are linked as generic download URLs without machine-actionable `rel=\"item\"` or DCAT-3 distribution typing.",
      "Lack of RO-Crate package with full provenance graph."
    ],
    rtEnhancements: {
      headers: [
        "Link: <https://schema.org/Dataset>; rel=\"profile\"",
        "Link: <https://www.w3.org/TR/vocab-dcat/>; rel=\"profile\"",
        "Link: </id/profile/marine-genomic-dataset-profile.html>; rel=\"profile\"",
        "Link: </id/dataset/arms-mbon.ttl>; rel=\"describedby\"; type=\"text/turtle\"",
        "Link: </id/dataset/arms-mbon.jsonld>; rel=\"describedby\"; type=\"application/ld+json\"",
        "Link: </id/dataset/arms-mbon.rdf>; rel=\"describedby\"; type=\"application/rdf+xml\"",
        "Link: </id/dataset/arms-mbon.linkset.json>; rel=\"linkset\"; type=\"application/linkset+json\"",
        "Link: </data/arms-mbon-18s.csv>; rel=\"item\"; type=\"text/csv\"",
        "Link: </data/arms-mbon-stations.geojson>; rel=\"item\"; type=\"application/geo+json\"",
        "Link: </data/arms-mbon-rocrate.zip>; rel=\"item\"; type=\"application/zip\"; profile=\"https://w3id.org/ro/crate\""
      ],
      linkset: "/id/dataset/arms-mbon.linkset.json",
      distributions: [
        "CSV: /data/arms-mbon-18s.csv (Metabarcoding read counts)",
        "GeoJSON: /data/arms-mbon-stations.geojson (North Sea monitoring reef stations)",
        "RO-Crate: /data/arms-mbon-rocrate.zip (Complete RO-Crate metadata + data)"
      ],
      rdf: ["/id/dataset/arms-mbon.ttl", "/id/dataset/arms-mbon.jsonld", "/id/dataset/arms-mbon.rdf"],
      conneg: "GET /id/dataset/arms-mbon with Accept: text/turtle returns 303 to /id/dataset/arms-mbon.ttl; Accept: text/html returns 303 to /id/dataset/arms-mbon.html."
    }
  },
  {
    filename: "arms-2018-6405.md",
    title: "ARMS 2018 Ecological Baseline (Dataset 6405)",
    resourceId: "resource-arms-2018",
    sourceUri: "https://marineinfo.org/id/dataset/6405",
    entityType: "schema:Dataset / dcat:Dataset",
    upstreamState: "MarineInfo dataset record containing textual description and sampling event parameters. Does not expose RFC 8288 link headers, RFC 9264 linksets, or tabular download distributions.",
    gaps: [
      "No RFC 8288 Link headers declaring profiles or descriptions.",
      "Absence of RFC 9264 JSON Linkset.",
      "Lack of automated Conneg 303 redirects.",
      "Morphological biomass matrix not available in direct machine-readable format."
    ],
    rtEnhancements: {
      headers: [
        "Link: <https://schema.org/Dataset>; rel=\"profile\"",
        "Link: </id/dataset/arms-2018.ttl>; rel=\"describedby\"; type=\"text/turtle\"",
        "Link: </id/dataset/arms-2018.linkset.json>; rel=\"linkset\"; type=\"application/linkset+json\"",
        "Link: </data/arms-2018-samples.csv>; rel=\"item\"; type=\"text/csv\""
      ],
      linkset: "/id/dataset/arms-2018.linkset.json",
      distributions: [
        "CSV: /data/arms-2018-samples.csv (Community ecology sampling matrix)"
      ],
      rdf: ["/id/dataset/arms-2018.ttl", "/id/dataset/arms-2018.jsonld"],
      conneg: "GET /id/dataset/arms-2018 with Accept: text/turtle returns 303 to /id/dataset/arms-2018.ttl."
    }
  },
  {
    filename: "north-sea-sensors.md",
    title: "LifeWatch Belgian North Sea Sensor Time-Series",
    resourceId: "resource-north-sea-sensors",
    sourceUri: "https://lifewatch.be/data/north-sea-buoys",
    entityType: "schema:Dataset / dcat:Dataset",
    upstreamState: "LifeWatch portal telemetry viewer. Provides dashboard charts and streaming API without standardized LOD link headers or DCAT-3 metadata.",
    gaps: [
      "No HTTP Link headers for semantic profile or external linksets.",
      "Lack of DCAT-3 / DCAT-AP distribution typing for telemetry stream.",
      "No standalone RFC 9264 linkset file.",
      "No persistent URI with content negotiation."
    ],
    rtEnhancements: {
      headers: [
        "Link: <https://schema.org/Dataset>; rel=\"profile\"",
        "Link: </id/dataset/north-sea-sensors.ttl>; rel=\"describedby\"; type=\"text/turtle\"",
        "Link: </id/dataset/north-sea-sensors.linkset.json>; rel=\"linkset\"; type=\"application/linkset+json\"",
        "Link: </data/north-sea-sensors-latest.csv>; rel=\"item\"; type=\"text/csv\"",
        "Link: </data/north-sea-sensors-stream.json>; rel=\"item\"; type=\"application/json\""
      ],
      linkset: "/id/dataset/north-sea-sensors.linkset.json",
      distributions: [
        "CSV: /data/north-sea-sensors-latest.csv (Buoy temperature/salinity/turbidity)",
        "JSON Stream: /data/north-sea-sensors-stream.json (Telemetry feed)"
      ],
      rdf: ["/id/dataset/north-sea-sensors.ttl", "/id/dataset/north-sea-sensors.jsonld"],
      conneg: "GET /id/dataset/north-sea-sensors with Accept: text/turtle returns 303 to /id/dataset/north-sea-sensors.ttl."
    }
  },
  {
    filename: "eurobis-occurrences.md",
    title: "EurOBIS European Marine Species Taxon Occurrences",
    resourceId: "resource-eurobis-occurrences",
    sourceUri: "https://www.eurobis.org/dataset/sample",
    entityType: "schema:Dataset / dcat:Dataset",
    upstreamState: "EurOBIS database interface and IPT Darwin Core Archive provider. Lacks HTTP Link headers, RFC 9264 linksets, and GeoJSON distributions.",
    gaps: [
      "No RFC 8288 link headers declaring profiles or descriptions.",
      "No RFC 9264 linkset mapping species occurrences to spatial points.",
      "No direct GeoJSON distribution for lightweight web mapping."
    ],
    rtEnhancements: {
      headers: [
        "Link: <https://schema.org/Dataset>; rel=\"profile\"",
        "Link: </id/dataset/eurobis-occurrences.ttl>; rel=\"describedby\"; type=\"text/turtle\"",
        "Link: </id/dataset/eurobis-occurrences.linkset.json>; rel=\"linkset\"; type=\"application/linkset+json\"",
        "Link: </data/eurobis-occurrences.geojson>; rel=\"item\"; type=\"application/geo+json\"",
        "Link: </data/eurobis-dwca-sample.zip>; rel=\"item\"; type=\"application/zip\""
      ],
      linkset: "/id/dataset/eurobis-occurrences.linkset.json",
      distributions: [
        "GeoJSON: /data/eurobis-occurrences.geojson (Species coordinates)",
        "DwC-A ZIP: /data/eurobis-dwca-sample.zip (Standard Darwin Core Archive)"
      ],
      rdf: ["/id/dataset/eurobis-occurrences.ttl", "/id/dataset/eurobis-occurrences.jsonld"],
      conneg: "GET /id/dataset/eurobis-occurrences with Accept: text/turtle returns 303."
    }
  },
  {
    filename: "vliz-institute-36.md",
    title: "Flanders Marine Institute (Organization 36)",
    resourceId: "resource-vliz",
    sourceUri: "https://marineinfo.org/id/institute/36",
    entityType: "schema:Organization",
    upstreamState: "MarineInfo institute record with institutional address and staff list. Lacks RFC 8288 link headers, RFC 9264 linksets, and direct conneg to RDF.",
    gaps: [
      "No RFC 8288 link headers on HTTP responses.",
      "No external linkset linking institute to its published datasets and staff members.",
      "No 303 content negotiation on persistent URI."
    ],
    rtEnhancements: {
      headers: [
        "Link: <https://schema.org/Organization>; rel=\"profile\"",
        "Link: </id/institute/vliz.ttl>; rel=\"describedby\"; type=\"text/turtle\"",
        "Link: </id/institute/vliz.linkset.json>; rel=\"linkset\"; type=\"application/linkset+json\""
      ],
      linkset: "/id/institute/vliz.linkset.json",
      distributions: [],
      rdf: ["/id/institute/vliz.ttl", "/id/institute/vliz.jsonld", "/id/institute/vliz.rdf"],
      conneg: "GET /id/institute/vliz with Accept: text/turtle returns 303 to /id/institute/vliz.ttl."
    }
  },
  {
    filename: "ro-crate-paper.md",
    title: "RO-Crate Biodiversity Observation Publishing Paper",
    resourceId: "resource-ro-crate-paper",
    sourceUri: "https://doi.org/10.3897/biss.6.94630",
    entityType: "schema:ScholarlyArticle",
    upstreamState: "Pensoft BISS journal article page with DOI redirection and HTML abstract. Does not expose RFC 9264 linkset pointing back to the described dataset or authors.",
    gaps: [
      "No RFC 8288 link headers for profile or external linksets.",
      "No RFC 9264 linkset linking article to underlying dataset (ARMS-MBON) and author ORCIDs.",
      "No content negotiation on persistent resource URI."
    ],
    rtEnhancements: {
      headers: [
        "Link: <https://schema.org/ScholarlyArticle>; rel=\"profile\"",
        "Link: </doi/10.3897/biss.6.94630>; rel=\"cite-as\"",
        "Link: </id/publication/ro-crate-paper.ttl>; rel=\"describedby\"; type=\"text/turtle\"",
        "Link: </id/publication/ro-crate-paper.linkset.json>; rel=\"linkset\"; type=\"application/linkset+json\"",
        "Link: </data/ro-crate-paper.pdf>; rel=\"alternate\"; type=\"application/pdf\""
      ],
      linkset: "/id/publication/ro-crate-paper.linkset.json",
      distributions: [
        "PDF: /data/ro-crate-paper.pdf (Direct RT-P04 resolution from /doi/10.3897/biss.6.94630 with rel=\"cite-as\")"
      ],
      rdf: ["/id/publication/ro-crate-paper.ttl", "/id/publication/ro-crate-paper.jsonld"],
      conneg: "GET /doi/10.3897/biss.6.94630 returns 303 to PDF payload; GET /id/publication/ro-crate-paper returns 303 to negotiated RDF/HTML."
    }
  },
  {
    filename: "maregraph-project-5484.md",
    title: "MAREGRAPH Project (Project 5484)",
    resourceId: "resource-maregraph",
    sourceUri: "https://marineinfo.org/id/project/5484",
    entityType: "schema:Project",
    upstreamState: "MarineInfo project summary page with description and partner list. Lacks RFC 8288 link headers, RFC 9264 linksets, and RDF conneg.",
    gaps: [
      "No RFC 8288 link headers.",
      "No RFC 9264 linkset aggregating project datasets.",
      "No content negotiation."
    ],
    rtEnhancements: {
      headers: [
        "Link: <https://schema.org/Project>; rel=\"profile\"",
        "Link: </id/project/maregraph.ttl>; rel=\"describedby\"; type=\"text/turtle\"",
        "Link: </id/project/maregraph.linkset.json>; rel=\"linkset\"; type=\"application/linkset+json\""
      ],
      linkset: "/id/project/maregraph.linkset.json",
      distributions: [],
      rdf: ["/id/project/maregraph.ttl", "/id/project/maregraph.jsonld"],
      conneg: "GET /id/project/maregraph returns 303."
    }
  },
  {
    filename: "marineinfo-api.md",
    title: "MarineInfo Subsetting API",
    resourceId: "resource-marineinfo-api",
    sourceUri: "https://marineinfo.org/api",
    entityType: "dcat:DataService / schema:API",
    upstreamState: "MarineInfo web API without RFC 9727 API catalog discovery or RFC 9264 linksets.",
    gaps: [
      "No RFC 9727 `/.well-known/api-catalog` discovery file.",
      "No `Link: </.well-known/api-catalog>; rel=\"api-catalog\"` headers on responses.",
      "OpenAPI 3.0 specification not discoverable via DCAT-3 `dcat:endpointDescription`."
    ],
    rtEnhancements: {
      headers: [
        "Link: <https://www.rfc-editor.org/info/rfc9727>; rel=\"profile\"",
        "Link: </.well-known/api-catalog>; rel=\"api-catalog\""
      ],
      linkset: "/.well-known/api-catalog",
      distributions: [
        "OpenAPI: /api/observations/v1/openapi.json (OpenAPI 3.0 specification)",
        "Swagger UI: /api/observations/v1/docs/ (Interactive explorer)"
      ],
      rdf: ["/id/service/marineinfo-api.ttl", "/id/service/marineinfo-api.jsonld"],
      conneg: "Endpoint discoverable via RFC 9727 and DCAT-3."
    }
  },
  {
    filename: "orcid-researchers.md",
    title: "Research Staff & ORCID Entities",
    resourceId: "resource-marc / resource-katrina / resource-cedric / resource-laurian / resource-joanna",
    sourceUri: "https://orcid.org/0000-0002-9648-6484",
    entityType: "schema:Person / foaf:Person",
    upstreamState: "Standard ORCID researcher profile web pages. ORCID provides RDF conneg at orcid.org, but host institutions rarely link profiles via RFC 9264 linksets.",
    gaps: [
      "Lack of local institutional linksets mapping researcher identifiers to authored datasets and published papers.",
      "Missing `rel=\"profile\"` and `rel=\"describedby\"` headers on local researcher pages."
    ],
    rtEnhancements: {
      headers: [
        "Link: <https://schema.org/Person>; rel=\"profile\"",
        "Link: </id/person/:slug.ttl>; rel=\"describedby\"; type=\"text/turtle\"",
        "Link: </id/person/:slug.linkset.json>; rel=\"linkset\"; type=\"application/linkset+json\""
      ],
      linkset: "/id/person/marc.linkset.json (and for each researcher)",
      distributions: [],
      rdf: ["/id/person/marc.ttl", "/id/person/katrina.ttl", "/id/person/cedric.ttl", "/id/person/laurian.ttl", "/id/person/joanna.ttl"],
      conneg: "GET /id/person/marc with Accept: text/turtle returns 303 to /id/person/marc.ttl."
    }
  },
  {
    filename: "dataset-90.md",
    title: "Macrobenthos of the Belgian Part of the North Sea (Dataset 90)",
    resourceId: "resource-dataset-90",
    sourceUri: "https://marineinfo.org/id/dataset/90",
    entityType: "schema:Dataset / dcat:Dataset (Series & Releases)",
    upstreamState: "MarineInfo standard dataset landing page. Only displays current state without RFC 5829 lifecycle navigation, Release DOIs, or RFC 9264 version history linksets.",
    gaps: [
      "No RFC 5829 lifecycle links (`rel=\"latest-version\"`, `rel=\"predecessor-version\"`, `rel=\"successor-version\"`, `rel=\"version-history\"`).",
      "No distinction between evolving conceptual series PID (`10.14284/90`) and immutable snapshot release PIDs (`10.14284/90.v1.0`, `10.14284/90.v2.0`, `10.14284/90.v2.1`).",
      "No standalone version history linkset (`/id/dataset/dataset-90/history.linkset.json`).",
      "Direct DOI resolution on series PID does not signpost both Series DOI and Release DOI simultaneously."
    ],
    rtEnhancements: {
      headers: [
        "Link: </id/dataset/dataset-90/v2.1>; rel=\"latest-version\"",
        "Link: </id/dataset/dataset-90/history>; rel=\"version-history\"",
        "Link: </id/dataset/dataset-90/history.linkset.json>; rel=\"linkset\"; type=\"application/linkset+json\"",
        "Link: </doi/10.14284/90>; rel=\"collection\"",
        "Link: </doi/10.14284/90.v2.1>; rel=\"cite-as\""
      ],
      linkset: "/id/dataset/dataset-90.linkset.json + /id/dataset/dataset-90/history.linkset.json",
      distributions: [
        "CSV v1.0: /data/dataset-90-v1.0.csv (Baseline snapshot)",
        "CSV v2.0: /data/dataset-90-v2.0.csv (Harmonized snapshot)",
        "CSV v2.1: /data/dataset-90-v2.1.csv (Authoritative latest snapshot)"
      ],
      rdf: [
        "/id/dataset/dataset-90.ttl",
        "/id/dataset/dataset-90/v1.0.ttl",
        "/id/dataset/dataset-90/v2.0.ttl",
        "/id/dataset/dataset-90/v2.1.ttl"
      ],
      conneg: "GET /doi/10.14284/90 returns 303 to /data/dataset-90-v2.1.csv (Behavior A) with rel='cite-as' and rel='collection' signposts."
    }
  }
];

export function generateComplianceDocs(): void {
  if (!fs.existsSync(COMPLIANCE_DIR)) {
    fs.mkdirSync(COMPLIANCE_DIR, { recursive: true });
  }

  for (const doc of AUDIT_DOCS) {
    let md = `# Radical Transparency Audit & Gap Analysis: ${doc.title}\n\n`;
    md += `**Entity ID:** \`${doc.resourceId}\`  \n`;
    md += `**Semantic Type:** \`${doc.entityType}\`  \n`;
    md += `**Upstream Source URI:** [${doc.sourceUri}](${doc.sourceUri})  \n\n`;

    md += `## 1. Upstream Source State\n\n`;
    md += `${doc.upstreamState}\n\n`;

    md += `## 2. Identified Protocol Gaps (vs. Radical Transparency Standard)\n\n`;
    for (const gap of doc.gaps) {
      md += `- ❌ **${gap}**\n`;
    }
    md += `\n`;

    md += `## 3. Ideal Radical Transparency Enhancements Delivered in this Webserver\n\n`;
    md += `### HTTP Link Headers (RFC 8288 & FAIR Signposting)\n`;
    md += `\`\`\`http\n`;
    for (const h of doc.rtEnhancements.headers) {
      md += `${h}\n`;
    }
    md += `\`\`\`\n\n`;

    md += `### RFC 9264 Standalone JSON Linkset\n`;
    md += `- **Linkset Path:** \`${doc.rtEnhancements.linkset}\`\n\n`;

    if (doc.rtEnhancements.distributions.length > 0) {
      md += `### Data Distributions & Downloads\n`;
      for (const d of doc.rtEnhancements.distributions) {
        md += `- 📥 **${d}**\n`;
      }
      md += `\n`;
    }

    md += `### Machine-Readable RDF Representations\n`;
    for (const r of doc.rtEnhancements.rdf) {
      md += `- 🐢 \`${r}\`\n`;
    }
    md += `\n`;

    md += `### Content Negotiation (RFC 9110)\n`;
    md += `${doc.rtEnhancements.conneg}\n\n`;

    fs.writeFileSync(path.join(COMPLIANCE_DIR, doc.filename), md);
    console.log(`✓ Generated ${doc.filename}`);
  }
}

if (import.meta.main) {
  generateComplianceDocs();
}
