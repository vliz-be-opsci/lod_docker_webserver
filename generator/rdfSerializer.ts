import { Writer, DataFactory } from "n3";
import { Resource } from "./types";

const { namedNode, literal } = DataFactory;

export const PREFIXES: Record<string, string> = {
  rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
  schema: "https://schema.org/",
  foaf: "http://xmlns.com/foaf/0.1/",
  skos: "http://www.w3.org/2004/02/skos/core#",
  owl: "http://www.w3.org/2002/07/owl#",
  prov: "http://www.w3.org/ns/prov#"
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
  "schema:hasPart"
]);

export function isRelationProperty(prop: string): boolean {
  return RELATION_PROPERTIES.has(prop);
}

export function expandUri(uriOrId: string, baseUri: string): string {
  if (uriOrId.startsWith("resource-")) {
    return `${baseUri}/resource/${uriOrId}`;
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
  delete context.rdf; // RDF namespaces are implicit or less relevant in JSON-LD contexts

  const expandedProperties: any = {
    "@context": context,
    "@id": resId,
    "@type": typeUri
  };

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

  // Include title & description in JSON-LD
  expandedProperties["schema:name"] = resource.title;
  expandedProperties["schema:description"] = resource.description;

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

  // Add title and description triples
  writer.addQuad(
    namedNode(resUri),
    namedNode("https://schema.org/name"),
    literal(resource.title)
  );
  writer.addQuad(
    namedNode(resUri),
    namedNode("https://schema.org/description"),
    literal(resource.description)
  );

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
  xml += `         xmlns:schema="https://schema.org/"\n`;
  xml += `         xmlns:foaf="http://xmlns.com/foaf/0.1/"\n`;
  xml += `         xmlns:skos="http://www.w3.org/2004/02/skos/core#"\n`;
  xml += `         xmlns:owl="http://www.w3.org/2002/07/owl#"\n`;
  xml += `         xmlns:prov="http://www.w3.org/ns/prov#">\n`;
  xml += `  <rdf:Description rdf:about="${resUri}">\n`;
  xml += `    <rdf:type rdf:resource="${typeUri}"/>\n`;
  xml += `    <schema:name>${escapeXml(resource.title)}</schema:name>\n`;
  xml += `    <schema:description>${escapeXml(resource.description)}</schema:description>\n`;

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

  xml += `  </rdf:Description>\n`;
  xml += `</rdf:RDF>\n`;
  return xml;
}
