export interface Resource {
  id: string;
  type: string; // e.g. "Person", "Dataset", "Organization", "Software", etc.
  title: string;
  description: string;
  properties: Record<string, string | string[]>;
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
  CIRCULAR_GRAPHS = "CIRCULAR_GRAPHS"
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
  extraction: "Direct" | "Inferenced" | "Both";
  specLink: string;
  extraInfo: string;
  proposedRdfRetrieval?: string;
}

export interface PageConfig {
  id: string; // e.g., "page-a", "page-1"
  title: string;
  resourceId: string | null; // Associated semantic resource (if any)
  strategies: DiscoveryStrategy[]; // Strategies active on this page
  linkedPages: string[]; // List of page IDs this page links to
  linkedResources: string[]; // List of resource IDs this page links to
  isApiRoute?: boolean; // True if this is served as an API json response instead of HTML
  isHidden?: boolean; // True if it has no incoming HTML links and is only discoverable via special means (sitemap, robots, link headers, etc.)
  customHeaders?: Record<string, string>; // Extra headers beyond standard discovery
}

export interface GraphNode {
  id: string;
  type: string; // e.g. "page", "resource", "sitemap", "feed", "manifest"
  label: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: string; // relationship / predicate description
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
