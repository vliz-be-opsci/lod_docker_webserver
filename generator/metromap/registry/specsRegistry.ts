import { Specification } from "../models/Specification";

export const SPECS_REGISTRY = {
  RFC_8288: new Specification(
    "RFC_8288",
    "RFC 8288",
    "Web Linking",
    "IETF",
    "https://datatracker.ietf.org/doc/html/rfc8288",
    "Defines HTTP Link headers, link relations, anchor, and target parameters."
  ),
  RFC_6906: new Specification(
    "RFC_6906",
    "RFC 6906",
    "The 'profile' Link Relation Type",
    "IETF",
    "https://datatracker.ietf.org/doc/html/rfc6906",
    "Signals that a resource representation conforms to a specific semantic profile."
  ),
  RFC_9264: new Specification(
    "RFC_9264",
    "RFC 9264",
    "Linkset: Media Types and a Link Relation Type",
    "IETF",
    "https://datatracker.ietf.org/doc/html/rfc9264",
    "Decoupled JSON/JSON-LD serialization (application/linkset+json) for web linking graphs."
  ),
  RFC_9110: new Specification(
    "RFC_9110",
    "RFC 9110",
    "HTTP Semantics (303 See Other & Conneg)",
    "IETF",
    "https://datatracker.ietf.org/doc/html/rfc9110",
    "Content Negotiation and 303 See Other redirects from persistent PIDs to representations."
  ),
  RFC_8574: new Specification(
    "RFC_8574",
    "RFC 8574",
    "The 'cite-as' Link Relation",
    "IETF",
    "https://datatracker.ietf.org/doc/html/rfc8574",
    "Provides a direct link from physical content payloads back to their persistent identifier."
  ),
  RFC_6573: new Specification(
    "RFC_6573",
    "RFC 6573",
    "Item and Collection Link Relations",
    "IETF",
    "https://datatracker.ietf.org/doc/html/rfc6573",
    "Expresses containment and membership between collections, catalogs, and item links."
  ),
  RFC_5829: new Specification(
    "RFC_5829",
    "RFC 5829",
    "Link Relations for Versioning",
    "IETF",
    "https://datatracker.ietf.org/doc/html/rfc5829",
    "Defines latest-version, predecessor-version, successor-version, and version-history link relations."
  ),
  RFC_8631: new Specification(
    "RFC_8631",
    "RFC 8631",
    "Link Relations for Web Services",
    "IETF",
    "https://datatracker.ietf.org/doc/html/rfc8631",
    "Provides service-desc and service-doc relations linking resources to OpenAPI and documentation."
  ),
  RFC_9727: new Specification(
    "RFC_9727",
    "RFC 9727",
    "The API Catalog Link Relation (/.well-known/api-catalog)",
    "IETF",
    "https://datatracker.ietf.org/doc/html/rfc9727",
    "Defines standardized machine discovery for all host APIs via /.well-known/api-catalog."
  ),
  RFC_7284: new Specification(
    "RFC_7284",
    "RFC 7284",
    "The Profile URI Registry",
    "IETF",
    "https://datatracker.ietf.org/doc/html/rfc7284",
    "Registry for standardized profile identifiers."
  ),
  RESOURCESYNC: new Specification(
    "RESOURCESYNC",
    "ANSI/NISO Z39.99",
    "ResourceSync Framework (Signmap)",
    "Community",
    "https://www.openarchives.org/rs/toc",
    "Extends Sitemap protocol with rs:ln and xhtml:link annotations for synchronization and discovery."
  ),
  DCAT_3: new Specification(
    "DCAT_3",
    "W3C DCAT-3",
    "Data Catalog Vocabulary Version 3",
    "W3C",
    "https://www.w3.org/TR/vocab-dcat-3/",
    "Standard W3C vocabulary for catalogs, datasets, distributions, and data services."
  ),
  SCHEMA_ORG: new Specification(
    "SCHEMA_ORG",
    "Schema.org",
    "Schema.org Vocabulary (Dataset, Organization)",
    "Schema.org",
    "https://schema.org/",
    "Structured data markup for search engine discovery and entity indexing."
  ),
  RO_CRATE: new Specification(
    "RO_CRATE",
    "RO-Crate 1.1",
    "Research Object Crate Specification",
    "Community",
    "https://w3id.org/ro/crate/1.1",
    "Package format for FAIR data artifacts, schema metadata, and computational provenance."
  ),
  OPENAPI_3: new Specification(
    "OPENAPI_3",
    "OpenAPI 3.0",
    "OpenAPI Specification",
    "Community",
    "https://spec.openapis.org/oas/v3.0.3",
    "Machine-readable API contract and interactive documentation standard."
  )
};

export function getSpecById(id: string): Specification | undefined {
  return (SPECS_REGISTRY as Record<string, Specification>)[id];
}
