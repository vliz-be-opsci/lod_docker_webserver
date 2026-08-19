import { Writer, DataFactory } from "n3";
import { MarineEntity } from "./types";
import { PREFIXES, expandUri } from "./rdfSerializer";

const { namedNode, literal } = DataFactory;

export function generateDcatCatalog(resources: MarineEntity[], baseUrl: string): { ttl: string; jsonld: string } {
  const catalogUri = `${baseUrl}/catalog`;
  const datasets = resources.filter(r => r.category === "dataset");
  const apis = resources.filter(r => r.category === "service" || r.category === "api");
  const publisherUri = expandUri("resource-vliz", baseUrl);

  // 1. Generate DCAT Turtle
  const writer = new Writer({ prefixes: PREFIXES });

  // Catalog entity
  writer.addQuad(namedNode(catalogUri), namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), namedNode("http://www.w3.org/ns/dcat#Catalog"));
  writer.addQuad(namedNode(catalogUri), namedNode("http://purl.org/dc/terms/title"), literal("VLIZ Marine Linked Open Data & Research Catalogue"));
  writer.addQuad(namedNode(catalogUri), namedNode("https://schema.org/name"), literal("VLIZ Marine Linked Open Data & Research Catalogue"));
  writer.addQuad(namedNode(catalogUri), namedNode("http://purl.org/dc/terms/description"), literal("A comprehensive, Radical-Transparency-compliant marine data catalogue publishing genomics, biodiversity occurrences, oceanographic telemetry, and scholarly articles from the Flanders Marine Institute (VLIZ)."));
  writer.addQuad(namedNode(catalogUri), namedNode("http://purl.org/dc/terms/publisher"), namedNode(publisherUri));
  writer.addQuad(namedNode(catalogUri), namedNode("http://purl.org/dc/terms/license"), namedNode("https://creativecommons.org/licenses/by/4.0/"));
  writer.addQuad(namedNode(catalogUri), namedNode("http://xmlns.com/foaf/0.1/homepage"), namedNode(`${baseUrl}/`));

  // Datasets linked to catalog
  for (const ds of datasets) {
    const dsUri = expandUri(ds.id, baseUrl);
    writer.addQuad(namedNode(catalogUri), namedNode("http://www.w3.org/ns/dcat#dataset"), namedNode(dsUri));
    writer.addQuad(namedNode(dsUri), namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), namedNode("http://www.w3.org/ns/dcat#Dataset"));
    writer.addQuad(namedNode(dsUri), namedNode("http://purl.org/dc/terms/title"), literal(ds.title));
    writer.addQuad(namedNode(dsUri), namedNode("http://purl.org/dc/terms/description"), literal(ds.description));
    if (ds.doi) {
      writer.addQuad(namedNode(dsUri), namedNode("http://purl.org/dc/terms/identifier"), literal(ds.doi));
    }
    if (ds.distributions) {
      for (const dist of ds.distributions) {
        const distUri = `${baseUrl}${dist.downloadUrl}`;
        writer.addQuad(namedNode(dsUri), namedNode("http://www.w3.org/ns/dcat#distribution"), namedNode(distUri));
        writer.addQuad(namedNode(distUri), namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), namedNode("http://www.w3.org/ns/dcat#Distribution"));
        writer.addQuad(namedNode(distUri), namedNode("http://www.w3.org/ns/dcat#accessURL"), namedNode(distUri));
        writer.addQuad(namedNode(distUri), namedNode("http://www.w3.org/ns/dcat#mediaType"), literal(dist.mediaType));
        writer.addQuad(namedNode(distUri), namedNode("http://purl.org/dc/terms/format"), literal(dist.format));
        writer.addQuad(namedNode(distUri), namedNode("http://purl.org/dc/terms/title"), literal(dist.title));
      }
    }
  }

  // Data services (APIs) linked to catalog
  for (const api of apis) {
    const apiUri = expandUri(api.id, baseUrl);
    writer.addQuad(namedNode(catalogUri), namedNode("http://www.w3.org/ns/dcat#service"), namedNode(apiUri));
    writer.addQuad(namedNode(apiUri), namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), namedNode("http://www.w3.org/ns/dcat#DataService"));
    writer.addQuad(namedNode(apiUri), namedNode("http://purl.org/dc/terms/title"), literal(api.title));
    writer.addQuad(namedNode(apiUri), namedNode("http://www.w3.org/ns/dcat#endpointURL"), namedNode(`${baseUrl}/api/v1/observations`));
    writer.addQuad(namedNode(apiUri), namedNode("http://www.w3.org/ns/dcat#endpointDescription"), namedNode(`${baseUrl}/api/openapi.json`));
  }

  let ttl = "";
  writer.end((err, result) => {
    if (result) ttl = result;
  });

  // 2. Generate DCAT JSON-LD
  const jsonLdContext: Record<string, string> = { ...PREFIXES };
  delete jsonLdContext.rdf;

  const jsonLdObj = {
    "@context": jsonLdContext,
    "@id": catalogUri,
    "@type": "dcat:Catalog",
    "dcterms:title": "VLIZ Marine Linked Open Data & Research Catalogue",
    "dcterms:description": "A comprehensive, Radical-Transparency-compliant marine data catalogue publishing genomics, biodiversity occurrences, oceanographic telemetry, and scholarly articles from the Flanders Marine Institute (VLIZ).",
    "dcterms:publisher": { "@id": publisherUri },
    "dcterms:license": "https://creativecommons.org/licenses/by/4.0/",
    "foaf:homepage": `${baseUrl}/`,
    "dcat:dataset": datasets.map(ds => ({
      "@id": expandUri(ds.id, baseUrl),
      "@type": "dcat:Dataset",
      "dcterms:title": ds.title,
      "dcterms:description": ds.description,
      ...(ds.doi ? { "dcterms:identifier": ds.doi } : {}),
      "dcat:distribution": (ds.distributions || []).map(dist => ({
        "@id": `${baseUrl}${dist.downloadUrl}`,
        "@type": "dcat:Distribution",
        "dcat:accessURL": `${baseUrl}${dist.downloadUrl}`,
        "dcat:mediaType": dist.mediaType,
        "dcterms:format": dist.format,
        "dcterms:title": dist.title
      }))
    })),
    "dcat:service": apis.map(api => ({
      "@id": expandUri(api.id, baseUrl),
      "@type": "dcat:DataService",
      "dcterms:title": api.title,
      "dcat:endpointURL": `${baseUrl}/api/v1/observations`,
      "dcat:endpointDescription": `${baseUrl}/api/openapi.json`
    }))
  };

  return {
    ttl,
    jsonld: JSON.stringify(jsonLdObj, null, 2)
  };
}
