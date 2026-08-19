import { Writer, DataFactory } from "n3";
import { Resource, getEntityTypeSlug, getEntityNameSlug } from "./types";
import { RESOURCES, getResourceById } from "./resources";
import { getProfileById } from "./profiles";

const { namedNode, literal } = DataFactory;

export const PREFIXES: Record<string, string> = {
  rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
  rdfs: "http://www.w3.org/2000/01/rdf-schema#",
  schema: "https://schema.org/",
  foaf: "http://xmlns.com/foaf/0.1/",
  skos: "http://www.w3.org/2004/02/skos/core#",
  owl: "http://www.w3.org/2002/07/owl#",
  prov: "http://www.w3.org/ns/prov#",
  dcat: "http://www.w3.org/ns/dcat#",
  dcterms: "http://purl.org/dc/terms/",
  xsd: "http://www.w3.org/2001/XMLSchema#"
};

// Predicates that represent relations (links to other resources) in the testbed
const RELATION_PROPERTIES = new Set([
  "foaf:knows",
  "schema:worksFor",
  "schema:member",
  "schema:creator",
  "schema:publisher",
  "prov:wasDerivedFrom",
  "prov:wasGeneratedBy",
  "owl:sameAs",
  "schema:about",
  "schema:sponsor",
  "skos:narrower",
  "skos:broader",
  "schema:hasPart",
  "dcat:dataset",
  "dcat:distribution",
  "dcat:service",
  "dcat:endpointDescription",
  "dcterms:publisher",
  "dcterms:creator",
  "dcterms:license"
]);

export function isRelationProperty(prop: string): boolean {
  return RELATION_PROPERTIES.has(prop);
}

export function expandUri(uriOrId: string, baseUri: string): string {
  if (uriOrId.startsWith("http://") || uriOrId.startsWith("https://") || uriOrId.startsWith("mailto:")) {
    return uriOrId;
  }
  if (uriOrId.startsWith("resource-")) {
    const res = getResourceById(uriOrId);
    if (res) {
      const typeSlug = getEntityTypeSlug(res);
      const nameSlug = getEntityNameSlug(res);
      return `${baseUri}/id/${typeSlug}/${nameSlug}`;
    }
    const slug = uriOrId.replace(/^resource-/, "");
    return `${baseUri}/id/dataset/${slug}`;
  }
  if (uriOrId.startsWith("profile-") || getProfileById(uriOrId)) {
    const slug = uriOrId.replace(/^profile-/, "");
    return `${baseUri}/id/profile/${slug}`;
  }
  return uriOrId;
}

export function expandPredicate(predicate: string): string {
  const parts = predicate.split(":");
  if (parts.length === 2 && PREFIXES[parts[0]]) {
    return PREFIXES[parts[0]] + parts[1];
  }
  return predicate;
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

/**
 * Serializes a resource into standard JSON-LD
 */
export function serializeJsonLd(resource: Resource, baseUri: string): string {
  const resId = expandUri(resource.id, baseUri);
  const typeUri = resource.type.includes(":") ? resource.type : `schema:${resource.type}`;

  const context: Record<string, string> = { ...PREFIXES };
  delete context.rdf;

  const expandedProperties: any = {
    "@context": context,
    "@id": resId,
    "@type": typeUri,
    "schema:name": resource.title,
    "schema:description": resource.description
  };

  if (resource.doi) {
    expandedProperties["schema:identifier"] = resource.doi;
  }
  if (resource.licenseUrl) {
    expandedProperties["schema:license"] = resource.licenseUrl;
  }

  for (const [key, value] of Object.entries(resource.properties)) {
    const isRel = isRelationProperty(key);
    if (key === "schema:hasPart" && Array.isArray(value)) {
      expandedProperties[key] = {
        "@list": value.map(v => ({ "@id": expandUri(v, baseUri) }))
      };
    } else if (Array.isArray(value)) {
      expandedProperties[key] = value.map(v => isRel ? { "@id": expandUri(v, baseUri) } : v);
    } else {
      expandedProperties[key] = isRel ? { "@id": expandUri(value, baseUri) } : value;
    }
  }

  // Include distribution nodes if available
  if (resource.distributions && resource.distributions.length > 0) {
    expandedProperties["dcat:distribution"] = resource.distributions.map(dist => ({
      "@type": "dcat:Distribution",
      "@id": `${baseUri}${dist.downloadUrl}`,
      "dcat:accessURL": `${baseUri}${dist.downloadUrl}`,
      "dcat:mediaType": dist.mediaType,
      "dcterms:format": dist.format,
      "dcterms:title": dist.title,
      "dcterms:description": dist.description,
      ...(dist.byteSize ? { "dcat:byteSize": dist.byteSize } : {})
    }));
  }

  return JSON.stringify(expandedProperties, null, 2);
}

/**
 * Serializes a resource into Turtle format using the n3 library
 */
export function serializeTurtle(resource: Resource, baseUri: string): string {
  const writer = new Writer({ prefixes: PREFIXES });
  const resUri = expandUri(resource.id, baseUri);
  const typeUri = resource.type.includes(":") ? resource.type : `https://schema.org/${resource.type}`;

  // Add type triple
  writer.addQuad(
    namedNode(resUri),
    namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
    namedNode(typeUri)
  );

  // If dataset, add dcat:Dataset type
  if (resource.type === "Dataset") {
    writer.addQuad(
      namedNode(resUri),
      namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
      namedNode("http://www.w3.org/ns/dcat#Dataset")
    );
  }

  // Add title and description triples
  writer.addQuad(
    namedNode(resUri),
    namedNode("https://schema.org/name"),
    literal(resource.title)
  );
  writer.addQuad(
    namedNode(resUri),
    namedNode("http://purl.org/dc/terms/title"),
    literal(resource.title)
  );
  writer.addQuad(
    namedNode(resUri),
    namedNode("https://schema.org/description"),
    literal(resource.description)
  );
  writer.addQuad(
    namedNode(resUri),
    namedNode("http://purl.org/dc/terms/description"),
    literal(resource.description)
  );

  if (resource.doi) {
    writer.addQuad(
      namedNode(resUri),
      namedNode("http://purl.org/dc/terms/identifier"),
      literal(resource.doi)
    );
  }

  if (resource.licenseUrl) {
    writer.addQuad(
      namedNode(resUri),
      namedNode("http://purl.org/dc/terms/license"),
      namedNode(resource.licenseUrl)
    );
  }

  // Add properties
  for (const [key, value] of Object.entries(resource.properties)) {
    const predUri = expandPredicate(key);
    const isRel = isRelationProperty(key);

    if (key === "schema:hasPart" && Array.isArray(value)) {
      const listElements = value.map(val => namedNode(expandUri(val, baseUri)));
      writer.addQuad(
        namedNode(resUri),
        namedNode(predUri),
        writer.list(listElements)
      );
    } else {
      const values = Array.isArray(value) ? value : [value];
      for (const val of values) {
        if (isRel) {
          writer.addQuad(
            namedNode(resUri),
            namedNode(predUri),
            namedNode(expandUri(val, baseUri))
          );
        } else {
          writer.addQuad(
            namedNode(resUri),
            namedNode(predUri),
            literal(val)
          );
        }
      }
    }
  }

  // Add distributions as DCAT triples
  if (resource.distributions) {
    for (const dist of resource.distributions) {
      const distUri = `${baseUri}${dist.downloadUrl}`;
      writer.addQuad(namedNode(resUri), namedNode("http://www.w3.org/ns/dcat#distribution"), namedNode(distUri));
      writer.addQuad(namedNode(distUri), namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), namedNode("http://www.w3.org/ns/dcat#Distribution"));
      writer.addQuad(namedNode(distUri), namedNode("http://www.w3.org/ns/dcat#accessURL"), namedNode(distUri));
      writer.addQuad(namedNode(distUri), namedNode("http://www.w3.org/ns/dcat#mediaType"), literal(dist.mediaType));
      writer.addQuad(namedNode(distUri), namedNode("http://purl.org/dc/terms/format"), literal(dist.format));
      writer.addQuad(namedNode(distUri), namedNode("http://purl.org/dc/terms/title"), literal(dist.title));
      if (dist.byteSize) {
        writer.addQuad(namedNode(distUri), namedNode("http://www.w3.org/ns/dcat#byteSize"), literal(dist.byteSize.toString(), namedNode("http://www.w3.org/2001/XMLSchema#integer")));
      }
    }
  }

  let result = "";
  writer.end((error, r) => {
    if (r) result = r;
  });
  return result;
}

/**
 * Serializes a resource into RDF/XML format using custom template-based serialization
 */
export function serializeRDFXML(resource: Resource, baseUri: string): string {
  const resUri = expandUri(resource.id, baseUri);
  const typeUri = resource.type.includes(":") ? resource.type : `https://schema.org/${resource.type}`;

  let xml = `<?xml version="1.0" encoding="utf-8"?>\n`;
  xml += `<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"\n`;
  xml += `         xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"\n`;
  xml += `         xmlns:schema="https://schema.org/"\n`;
  xml += `         xmlns:foaf="http://xmlns.com/foaf/0.1/"\n`;
  xml += `         xmlns:skos="http://www.w3.org/2004/02/skos/core#"\n`;
  xml += `         xmlns:owl="http://www.w3.org/2002/07/owl#"\n`;
  xml += `         xmlns:prov="http://www.w3.org/ns/prov#"\n`;
  xml += `         xmlns:dcat="http://www.w3.org/ns/dcat#"\n`;
  xml += `         xmlns:dcterms="http://purl.org/dc/terms/">\n`;
  xml += `  <rdf:Description rdf:about="${resUri}">\n`;
  xml += `    <rdf:type rdf:resource="${typeUri}"/>\n`;
  if (resource.type === "Dataset") {
    xml += `    <rdf:type rdf:resource="http://www.w3.org/ns/dcat#Dataset"/>\n`;
  }
  xml += `    <schema:name>${escapeXml(resource.title)}</schema:name>\n`;
  xml += `    <dcterms:title>${escapeXml(resource.title)}</dcterms:title>\n`;
  xml += `    <schema:description>${escapeXml(resource.description)}</schema:description>\n`;
  xml += `    <dcterms:description>${escapeXml(resource.description)}</dcterms:description>\n`;

  for (const [key, value] of Object.entries(resource.properties)) {
    const isRel = isRelationProperty(key);
    const [prefix, localName] = key.split(":");
    const tag = `${prefix}:${localName}`;

    if (key === "schema:hasPart" && Array.isArray(value)) {
      xml += `    <${tag} rdf:parseType="Collection">\n`;
      for (const val of value) {
        const valUri = escapeXml(expandUri(val, baseUri));
        xml += `      <rdf:Description rdf:about="${valUri}"/>\n`;
      }
      xml += `    </${tag}>\n`;
    } else {
      const values = Array.isArray(value) ? value : [value];
      for (const val of values) {
        if (isRel) {
          const valUri = escapeXml(expandUri(val, baseUri));
          xml += `    <${tag} rdf:resource="${valUri}"/>\n`;
        } else {
          const valEscaped = escapeXml(val);
          xml += `    <${tag}>${valEscaped}</${tag}>\n`;
        }
      }
    }
  }

  if (resource.distributions) {
    for (const dist of resource.distributions) {
      const distUri = escapeXml(`${baseUri}${dist.downloadUrl}`);
      xml += `    <dcat:distribution>\n`;
      xml += `      <dcat:Distribution rdf:about="${distUri}">\n`;
      xml += `        <dcat:accessURL rdf:resource="${distUri}"/>\n`;
      xml += `        <dcat:mediaType>${escapeXml(dist.mediaType)}</dcat:mediaType>\n`;
      xml += `        <dcterms:format>${escapeXml(dist.format)}</dcterms:format>\n`;
      xml += `        <dcterms:title>${escapeXml(dist.title)}</dcterms:title>\n`;
      xml += `      </dcat:Distribution>\n`;
      xml += `    </dcat:distribution>\n`;
    }
  }

  xml += `  </rdf:Description>\n`;
  xml += `</rdf:RDF>\n`;
  return xml;
}
