export interface ResourceDistribution {
  id: string;
  title: string;
  description: string;
  mediaType: string;
  format: string;
  downloadUrl: string;
  byteSize?: number;
  profile?: string;
}

export interface SampleData {
  columns: string[];
  rows: Record<string, string | number>[];
}

export type EntityCategory = "dataset" | "institute" | "publication" | "project" | "person" | "service" | "api" | "profile";

export interface Resource {
  id: string;
  type: string; // e.g. "Person", "Dataset", "Organization", "Software", "ScholarlyArticle", "Project", "DataService"
  title: string;
  description: string;
  properties: Record<string, string | string[]>;
  category?: EntityCategory;
  distributions?: ResourceDistribution[];
  sampleData?: SampleData;
  sourceUri?: string;
  doi?: string;
  license?: string;
  licenseUrl?: string;
  temporalCoverage?: string;
  spatialCoverage?: string;
  spatialBoundingBox?: {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
  };
  publisher?: string; // Resource ID
  creators?: string[]; // Resource IDs
  profileId?: string;
  alternateProfiles?: string[];
  relatedResources?: {
    id: string;
    relationship: string;
  }[];
  // RT-P09 Lifecycle & Release properties
  seriesId?: string;
  version?: string;
  releaseDate?: string;
  latestVersionId?: string;
  predecessorVersionId?: string;
  successorVersionId?: string;
  historyUri?: string;
}

export type MarineEntity = Resource;

export function getEntityTypeSlug(entity: { category?: string; type?: string; id?: string }): string {
  if (entity.category === "api" || entity.category === "service" || entity.type === "DataService") return "service";
  if (entity.category === "dataset" || entity.type === "Dataset") return "dataset";
  if (entity.category === "institute" || entity.type === "Organization") return "institute";
  if (entity.category === "person" || entity.type === "Person") return "person";
  if (entity.category === "publication" || entity.type === "ScholarlyArticle") return "publication";
  if (entity.category === "project" || entity.type === "Project") return "project";
  if (entity.category === "profile") return "profile";
  return "dataset";
}

export function getEntityNameSlug(entityOrId: { id: string } | string): string {
  const rawId = typeof entityOrId === "string" ? entityOrId : entityOrId.id;
  return rawId.replace(/^resource-/, "").replace(/^profile-/, "");
}

export function getEntityIdPath(entity: MarineEntity): string {
  const typeSlug = getEntityTypeSlug(entity);
  if (entity.seriesId && entity.version) {
    const parentNameSlug = entity.seriesId.replace(/^resource-/, "");
    return `/id/${typeSlug}/${parentNameSlug}/v${entity.version}`;
  }
  const nameSlug = getEntityNameSlug(entity);
  return `/id/${typeSlug}/${nameSlug}`;
}

export function getEntityHtmlPath(entity: MarineEntity): string {
  return `${getEntityIdPath(entity)}.html`;
}

export enum DiscoveryStrategy {
  HTML_LINKS = "HTML_LINKS",
  LINK_HEADERS = "LINK_HEADERS",
  JSON_LD_SCRIPT = "JSON_LD_SCRIPT",
  RDFA = "RDFA",
  MICRODATA = "MICRODATA",
  OPEN_GRAPH = "OPEN_GRAPH",
  DUBLIN_CORE = "DUBLIN_CORE",
  CANONICAL = "CANONICAL",
  ALTERNATE = "ALTERNATE",
  DESCRIBED_BY_LINK = "DESCRIBED_BY_LINK",
  FOAF = "FOAF",
  SAME_AS = "SAME_AS",
  SKOS = "SKOS",
  RDF_COLLECTIONS = "RDF_COLLECTIONS",
  RSS_FEED = "RSS_FEED",
  ATOM_FEED = "ATOM_FEED",
  SITEMAP = "SITEMAP",
  ROBOTS = "ROBOTS",
  MANIFEST = "MANIFEST",
  WELL_KNOWN = "WELL_KNOWN",
  API_DISCOVERY = "API_DISCOVERY",
  HTTP_LINK_RELATIONS = "HTTP_LINK_RELATIONS",
  PAGINATION = "PAGINATION",
  EMBEDDED_TURTLE = "EMBEDDED_TURTLE",
  EMBEDDED_JSON_LD_GRAPH = "EMBEDDED_JSON_LD_GRAPH",
  RESOURCE_MAP = "RESOURCE_MAP",
  PROVENANCE = "PROVENANCE",
  COLLECTION_MEMBERSHIP = "COLLECTION_MEMBERSHIP",
  REVERSE_LINKS = "REVERSE_LINKS",
  CIRCULAR_GRAPHS = "CIRCULAR_GRAPHS",
  CONTENT_NEGOTIATION = "CONTENT_NEGOTIATION"
}

export interface StrategyMeta {
  id: DiscoveryStrategy;
  name: string;
  category: "HTML Header" | "HTML Body" | "RDF Relation" | "HTTP Header" | "Syndication/Metadata" | "Graph Topology";
  description: string;
  codeSnippet: string;
  standard: string;
  provenance: string;
  location: "Resource" | "Domain" | "Both";
  extraction: "Direct" | "Uplifted" | "Reasoned" | "Both";
  specLink: string;
  extraInfo: string;
  proposedRdfRetrieval?: string;
}

export interface PageConfig {
  id: string; // e.g., "arms-mbon", "vliz"
  title: string;
  resourceId: string | null;
  strategies: DiscoveryStrategy[];
  linkedPages: string[];
  linkedResources: string[];
  isApiRoute?: boolean;
  isHidden?: boolean;
  customHeaders?: Record<string, string>;
}

export interface GraphNode {
  id: string;
  type: string;
  label: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: string;
}

export interface ExpectedGraph {
  physical: {
    nodes: GraphNode[];
    edges: GraphEdge[];
  };
  logical: {
    nodes: GraphNode[];
    edges: GraphEdge[];
  };
}
