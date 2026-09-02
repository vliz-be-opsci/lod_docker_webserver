import { RTPattern } from "../models/RTPattern";
import { SPECS_REGISTRY } from "./specsRegistry";

const EOSC_BASE_URL = "https://github.com/eosc-semantic-interop/if-solutions-proposals/blob/main/proposals/radical-transparency/linkset-usage-patterns";

export const RT_PATTERNS_REGISTRY: RTPattern[] = [
  new RTPattern(
    "RT_P01",
    1,
    "Profile Conformity Declarations",
    "Explicit declaration of conformity-to-profile via rel=\"profile\" on resource headers and linkset statements to guarantee semantic interoperability.",
    [SPECS_REGISTRY.RFC_6906, SPECS_REGISTRY.RFC_8288, SPECS_REGISTRY.RFC_7284],
    "#0284c7",
    "#f0f9ff",
    node => node.category === "dataset" || node.category === "institute" || node.category === "publication" || node.specs.some(s => s.id === "RFC_6906"),
    `${EOSC_BASE_URL}/01-profile-declaration.md`
  ),
  new RTPattern(
    "RT_P02",
    2,
    "Profile Composition",
    "Recursive hierarchy of profile declarations using rel=\"item\" to infer compound profile conformance across composite digital assets.",
    [SPECS_REGISTRY.RFC_6906, SPECS_REGISTRY.RFC_6573, SPECS_REGISTRY.RFC_8288],
    "#0369a1",
    "#f0f9ff",
    node => node.category === "dataset" && node.specs.some(s => s.id === "RFC_6906"),
    `${EOSC_BASE_URL}/02-profile-composition.md`
  ),
  new RTPattern(
    "RT_P03",
    3,
    "Content Negotiation Menu",
    "Resolves the Broken Chain problem during HTTP 303 redirects by explicitly exposing all available variant formats (HTML, Turtle, JSON-LD, RDF/XML) via rel=\"alternate\" and linksets.",
    [SPECS_REGISTRY.RFC_9110, SPECS_REGISTRY.RFC_8288, SPECS_REGISTRY.RFC_9264, SPECS_REGISTRY.RFC_6906],
    "#ea580c",
    "#fff7ed",
    node => node.id.includes("pid") || node.id.includes("html") || node.id.includes("ttl") || node.id.includes("jsonld") || node.id.includes("rdf") || node.uri.includes("/id/") || node.uri.includes("/resource/"),
    `${EOSC_BASE_URL}/03-content-negotiation-menu.md`
  ),
  new RTPattern(
    "RT_P04",
    4,
    "No Landing Page Solution",
    "Enables direct machine-actionable consumption of physical data files (CSV, GeoJSON, RO-Crate) without requiring intermediate HTML landing pages, anchoring back via rel=\"cite-as\".",
    [SPECS_REGISTRY.RFC_8574, SPECS_REGISTRY.RFC_8288, SPECS_REGISTRY.RFC_9264],
    "#16a34a",
    "#f0fdf4",
    node => node.category === "distribution",
    `${EOSC_BASE_URL}/04-no-landing-page-solution.md`
  ),
  new RTPattern(
    "RT_P05",
    5,
    "Subsetting API",
    "Anchors dynamic API observation fragments back to parent dataset persistent identifiers (rel=\"cite-as\"), service roots (rel=\"collection\"), and OpenAPI schemas (rel=\"service-desc\").",
    [SPECS_REGISTRY.RFC_9727, SPECS_REGISTRY.RFC_8631, SPECS_REGISTRY.RFC_6573, SPECS_REGISTRY.RFC_8574, SPECS_REGISTRY.OPENAPI_3],
    "#0d9488",
    "#f0fdfa",
    node => node.category === "api" || node.uri.includes("/api/"),
    `${EOSC_BASE_URL}/05-subsetting-api.md`
  ),
  new RTPattern(
    "RT_P06",
    6,
    "Hostwide Resource Discovery",
    "Domain-level discovery cascade mixing ResourceSync rs:ln and xhtml:link signmaps into robots.txt and sitemap.xml for automated crawler onboarding.",
    [SPECS_REGISTRY.RESOURCESYNC, SPECS_REGISTRY.RFC_8288],
    "#0284c7",
    "#f0f9ff",
    node => node.category === "domain" && (node.id.includes("root") || node.id.includes("robots") || node.id.includes("sitemap")),
    `${EOSC_BASE_URL}/06-hostwide-discovery.md`
  ),
  new RTPattern(
    "RT_P07",
    7,
    "Catalogue Assisted Resource Exposure",
    "Delegates granular collection harvesting from sitemaps to dedicated registers, RFC 9727 API catalogs, and W3C DCAT-3 catalogues.",
    [SPECS_REGISTRY.RFC_9727, SPECS_REGISTRY.DCAT_3, SPECS_REGISTRY.RESOURCESYNC],
    "#0284c7",
    "#f0f9ff",
    node => node.id.includes("api-catalog") || node.id.includes("dcat") || node.id.includes("catalog"),
    `${EOSC_BASE_URL}/07-catalog-assistance.md`
  ),
  new RTPattern(
    "RT_P08",
    8,
    "Large Linkset Split-up",
    "Decomposes extensive web link graphs into manageable, cacheable JSON linkset files using rel=\"item\" and rel=\"collection\".",
    [SPECS_REGISTRY.RFC_6573, SPECS_REGISTRY.RFC_9264],
    "#ca8a04",
    "#fefce8",
    node => node.category === "linkset" || node.uri.includes(".linkset.json") || node.uri.includes("/linksets/"),
    `${EOSC_BASE_URL}/08-large-linksets.md`
  ),
  new RTPattern(
    "RT_P09",
    9,
    "Release Linking",
    "Links evolving conceptual dataset and profile series to immutable snapshot releases and version histories using RFC 5829 lifecycle relations (latest-version, predecessor-version, successor-version, version-history).",
    [SPECS_REGISTRY.RFC_5829, SPECS_REGISTRY.RFC_8288, SPECS_REGISTRY.RFC_9264, SPECS_REGISTRY.RFC_6573],
    "#8b5cf6",
    "#f5f3ff",
    node => node.id.includes("history") || node.id.includes("v1") || node.id.includes("v2") || node.uri.includes("/history") || node.uri.includes("/v1.") || node.uri.includes("/v2."),
    `${EOSC_BASE_URL}/09-release-links.md`
  )
];

export function getPatternById(id: string): RTPattern | undefined {
  return RT_PATTERNS_REGISTRY.find(p => p.id === id);
}
