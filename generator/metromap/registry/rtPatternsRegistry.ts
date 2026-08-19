import { RTPattern } from "../models/RTPattern";
import { SPECS_REGISTRY } from "./specsRegistry";

export const RT_PATTERNS_REGISTRY: RTPattern[] = [
  new RTPattern(
    "RT_P01",
    1,
    "Profile Conformity Declarations",
    "Explicit declaration of conformity-to-profile via rel=\"profile\" on resource headers and linkset statements to guarantee semantic interoperability.",
    [SPECS_REGISTRY.RFC_6906, SPECS_REGISTRY.RFC_8288, SPECS_REGISTRY.RFC_7284],
    "#0284c7",
    "#f0f9ff",
    node => node.category === "dataset" || node.category === "institute" || node.category === "publication"
  ),
  new RTPattern(
    "RT_P02",
    2,
    "Profile Composition",
    "Recursive hierarchy of profile declarations using rel=\"item\" to infer compound profile conformance across composite digital assets.",
    [SPECS_REGISTRY.RFC_6906, SPECS_REGISTRY.RFC_6573, SPECS_REGISTRY.RFC_8288],
    "#0369a1",
    "#f0f9ff",
    node => node.category === "dataset" && node.specs.some(s => s.id === "RFC_6906")
  ),
  new RTPattern(
    "RT_P03",
    3,
    "Content Negotiation Menu",
    "Resolves the Broken Chain problem during HTTP 303 redirects by explicitly exposing all available variant formats (HTML, Turtle, JSON-LD, RDF/XML) via rel=\"alternate\" and linksets.",
    [SPECS_REGISTRY.RFC_9110, SPECS_REGISTRY.RFC_8288, SPECS_REGISTRY.RFC_9264, SPECS_REGISTRY.RFC_6906],
    "#ea580c",
    "#fff7ed",
    node => node.id.includes("pid") || node.id.includes("html") || node.id.includes("ttl") || node.id.includes("jsonld") || node.id.includes("rdf")
  ),
  new RTPattern(
    "RT_P04",
    4,
    "No Landing Page Solution",
    "Enables direct machine-actionable consumption of physical data files (CSV, GeoJSON, RO-Crate) without requiring intermediate HTML landing pages, anchoring back via rel=\"cite-as\".",
    [SPECS_REGISTRY.RFC_8574, SPECS_REGISTRY.RFC_8288, SPECS_REGISTRY.RFC_9264],
    "#16a34a",
    "#f0fdf4",
    node => node.category === "distribution"
  ),
  new RTPattern(
    "RT_P05",
    5,
    "Subsetting API",
    "Anchors dynamic API observation fragments back to parent dataset persistent identifiers (rel=\"cite-as\"), service roots (rel=\"collection\"), and OpenAPI schemas (rel=\"service-desc\").",
    [SPECS_REGISTRY.RFC_9727, SPECS_REGISTRY.RFC_8631, SPECS_REGISTRY.RFC_6573, SPECS_REGISTRY.RFC_8574, SPECS_REGISTRY.OPENAPI_3],
    "#0d9488",
    "#f0fdfa",
    node => node.category === "api"
  ),
  new RTPattern(
    "RT_P06",
    6,
    "Hostwide Resource Discovery",
    "Domain-level discovery cascade mixing ResourceSync rs:ln and xhtml:link signmaps into robots.txt and sitemap.xml for automated crawler onboarding.",
    [SPECS_REGISTRY.RESOURCESYNC, SPECS_REGISTRY.RFC_8288],
    "#0284c7",
    "#f0f9ff",
    node => node.category === "domain" && (node.id.includes("root") || node.id.includes("robots") || node.id.includes("sitemap"))
  ),
  new RTPattern(
    "RT_P07",
    7,
    "Catalogue Assisted Resource Exposure",
    "Delegates granular collection harvesting from sitemaps to dedicated registers, RFC 9727 API catalogs, and W3C DCAT-3 catalogues.",
    [SPECS_REGISTRY.RFC_9727, SPECS_REGISTRY.DCAT_3, SPECS_REGISTRY.RESOURCESYNC],
    "#0284c7",
    "#f0f9ff",
    node => node.id.includes("api-catalog") || node.id.includes("dcat") || node.id.includes("catalog")
  ),
  new RTPattern(
    "RT_P08",
    8,
    "Large Linkset Split-up",
    "Decomposes extensive web link graphs into manageable, cacheable JSON linkset files using rel=\"item\" and rel=\"collection\".",
    [SPECS_REGISTRY.RFC_6573, SPECS_REGISTRY.RFC_9264],
    "#ca8a04",
    "#fefce8",
    node => node.category === "linkset"
  ),
  new RTPattern(
    "RT_P10",
    10,
    "Detached Local Storage Sidecars",
    "Maintains profile compliance and provenance on downloaded offline artifacts through deterministic RO-Crate packages and sidecar linksets.",
    [SPECS_REGISTRY.RFC_6906, SPECS_REGISTRY.RFC_9264, SPECS_REGISTRY.RO_CRATE],
    "#15803d",
    "#f0fdf4",
    node => node.category === "distribution" && (node.id.includes("rocrate") || node.id.includes("zip"))
  )
];

export function getPatternById(id: string): RTPattern | undefined {
  return RT_PATTERNS_REGISTRY.find(p => p.id === id);
}
