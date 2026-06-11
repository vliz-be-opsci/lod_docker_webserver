import { DiscoveryStrategy, PageConfig, Resource, StrategyMeta } from "./types";
import { RESOURCES } from "./resources";
import { expandUri } from "./rdfSerializer";

export const STRATEGIES_META: StrategyMeta[] = [
  {
    id: DiscoveryStrategy.HTML_LINKS,
    name: "HTML Hyperlinks",
    category: "HTML Body",
    description: "Standard href links between pages for traditional crawling.",
    codeSnippet: '<a href="/pages/page-x.html">Next Page</a>',
    standard: "HTML5 Hyperlink Specification",
    provenance: "W3C / WHATWG HTML Living Standard",
    location: "Resource",
    extraction: "Uplifted",
    specLink: "https://html.spec.whatwg.org/multipage/links.html",
    extraInfo: "Traditional hyperlinks are parsed by crawlers to build a physical site graph. In LOD discovery, they are followed as fallback links when explicit discovery headers are missing, allowing standard web discovery.",
    proposedRdfRetrieval: "1. Parse DOM: Identify <a href=\"URL\"> tags in the page body.\n2. Filter: Skip mailto:, tel:, and local hash anchors.\n3. Map: Relate the current page URI to the target URL.\n\nTriples:\n<> schema:relatedLink <URL> ;\n   rdfs:seeAlso <URL> ."
  },
  {
    id: DiscoveryStrategy.LINK_HEADERS,
    name: "HTTP Link Headers (DescribedBy)",
    category: "HTTP Header",
    description: "Link relations in the HTTP headers pointing to RDF representations.",
    codeSnippet: 'Link: </rdf/resource-x.ttl>; rel="describedby"',
    standard: "RFC 8288 (Web Linking)",
    provenance: "Internet Engineering Task Force (IETF)",
    location: "Resource",
    extraction: "Uplifted",
    specLink: "https://datatracker.ietf.org/doc/html/rfc8288",
    extraInfo: "Served directly in HTTP headers, avoiding payload parsing. Highly recommended for machine discovery because clients can verify metadata availability before downloading HTML bodies."
  },
  {
    id: DiscoveryStrategy.JSON_LD_SCRIPT,
    name: "Embedded JSON-LD Script",
    category: "HTML Body",
    description: "JSON-LD graph object embedded in a script element inside the HTML body.",
    codeSnippet: '<script type="application/ld+json">{ ... }</script>',
    standard: "JSON-LD 1.1 W3C Recommendation",
    provenance: "W3C Semantic Web Working Group",
    location: "Resource",
    extraction: "Uplifted",
    specLink: "https://www.w3.org/TR/json-ld11/",
    extraInfo: "Valid RDF serialized inside an HTML script tag. Popularized by search engines like Google for structured data extraction. Easy to parse using native JSON utilities."
  },
  {
    id: DiscoveryStrategy.RDFA,
    name: "RDFa Markup",
    category: "HTML Body",
    description: "RDF attributes (about, typeof, property) embedded in standard HTML tags.",
    codeSnippet: '<div typeof="schema:Person" about="http://localhost:8080/resource/alice">',
    standard: "RDFa Core 1.1 W3C Recommendation",
    provenance: "W3C Semantic Web Working Group",
    location: "Resource",
    extraction: "Uplifted",
    specLink: "https://www.w3.org/TR/rdfa-core/",
    extraInfo: "Embeds RDF attributes directly inside existing HTML tags. Avoids double-templating, but parsing requires a full DOM parser and namespace resolution.",
    proposedRdfRetrieval: "1. Parse DOM: Traverse HTML tags looking for about, typeof, property, resource, and vocab attributes.\n2. Resolve Namespaces: Map prefixes (e.g. schema:) using prefix/vocab definitions.\n3. Map: Extract triples based on W3C RDFa Core 1.1 rules.\n\nTriples:\n<subject> <predicate> <object> ."
  },
  {
    id: DiscoveryStrategy.MICRODATA,
    name: "Microdata Markup",
    category: "HTML Body",
    description: "HTML Microdata attributes (itemscope, itemtype, itemprop) describing resources.",
    codeSnippet: '<div itemscope itemtype="https://schema.org/Person">',
    standard: "HTML Microdata W3C Working Group Note",
    provenance: "W3C Semantic Web Working Group",
    location: "Resource",
    extraction: "Uplifted",
    specLink: "https://www.w3.org/TR/microdata/",
    extraInfo: "HTML5-native metadata nesting standard. Mostly used with schema.org. In LOD discovery, Microdata statements are translated into RDF triples using standard vocabulary mapping.",
    proposedRdfRetrieval: "1. Parse DOM: Traverse HTML tags looking for itemscope, itemtype, itemprop, and itemid attributes.\n2. Map Types: Map itemtype to rdf:type. Map itemid to subject URI.\n3. Map Properties: Map itemprop keys to predicates using the itemtype vocabulary prefix.\n\nTriples:\n<itemid> a <itemtype> ;\n         <itemprop> <value> ."
  },
  {
    id: DiscoveryStrategy.OPEN_GRAPH,
    name: "Open Graph Protocol",
    category: "HTML Header",
    description: "Open Graph meta tags indicating canonical URLs and resource names.",
    codeSnippet: '<meta property="og:url" content="http://localhost:8080/pages/page-a.html">',
    standard: "Open Graph Protocol Specification",
    provenance: "Facebook (Meta) Open Graph Initiative",
    location: "Resource",
    extraction: "Uplifted",
    specLink: "https://ogp.me/",
    extraInfo: "Originally created by Facebook to facilitate preview generation. Provides basic metadata (title, type, url, image) which the testbed maps to schema.org equivalents.",
    proposedRdfRetrieval: "1. Parse DOM: Extract <meta property=\"og:key\" content=\"value\"> elements from HTML head.\n2. Map Keys: Translate og:title -> schema:name, og:description -> schema:description, og:image -> schema:image, og:url -> schema:url, og:type -> rdf:type.\n\nTriples:\n<canonicalUrl> a schema:WebPage ;\n               schema:name \"value\" ;\n               schema:description \"value\" ."
  },
  {
    id: DiscoveryStrategy.DUBLIN_CORE,
    name: "Dublin Core Meta",
    category: "HTML Header",
    description: "Dublin Core meta tags defining identifier and creator properties.",
    codeSnippet: '<meta name="DC.identifier" content="http://localhost:8080/pages/page-a.html">',
    standard: "Dublin Core Metadata Element Set (ISO 15836)",
    provenance: "Dublin Core Metadata Initiative (DCMI)",
    location: "Resource",
    extraction: "Uplifted",
    specLink: "https://www.dublincore.org/specifications/dublin-core/dcmi-terms/",
    extraInfo: "A classic metadata standard for describing resources. Expressed via meta tags in HTML headers and mapped directly to Dublin Core metadata terms.",
    proposedRdfRetrieval: "1. Parse DOM: Extract <meta name=\"DC.key\" content=\"value\"> elements from HTML head.\n2. Map Keys: Map directly to Dublin Core metadata namespace terms (http://purl.org/dc/terms/key).\n\nTriples:\n<currentUri> dcterms:title \"value\" ;\n             dcterms:creator \"value\" ;\n             dcterms:identifier \"value\" ."
  },
  {
    id: DiscoveryStrategy.CANONICAL,
    name: "Canonical URLs",
    category: "HTML Header",
    description: "Link elements specifying the preferred URL for a resource.",
    codeSnippet: '<link rel="canonical" href="http://localhost:8080/pages/page-a.html">',
    standard: "RFC 6596 (Canonical Link Relation)",
    provenance: "Internet Engineering Task Force (IETF)",
    location: "Resource",
    extraction: "Uplifted",
    specLink: "https://datatracker.ietf.org/doc/html/rfc6596",
    extraInfo: "Guides search engines to the preferred URL for a resource. Used in LOD node normalization to resolve graph identity and avoid duplicate resource nodes.",
    proposedRdfRetrieval: "1. Parse DOM: Extract <link rel=\"canonical\" href=\"URL\"> from HTML head.\n2. Map Identity: Map the current resource URL to the canonical URL as equivalent.\n\nTriples:\n<currentUri> owl:sameAs <canonicalUrl> ;\n             schema:url <canonicalUrl> ."
  },
  {
    id: DiscoveryStrategy.ALTERNATE,
    name: "Alternate Format Links",
    category: "HTML Header",
    description: "Link tags pointing to semantic equivalents (Turtle, JSON-LD) of the current page.",
    codeSnippet: '<link rel="alternate" type="text/turtle" href="/rdf/a.ttl">',
    standard: "HTML5 Alternate Link Relations / RFC 5988",
    provenance: "W3C / IETF",
    location: "Resource",
    extraction: "Uplifted",
    specLink: "https://html.spec.whatwg.org/multipage/links.html#link-type-alternate",
    extraInfo: "Points to alternate representations of the current resource. Commonly used in LOD discovery to locate alternate formats like Turtle, JSON-LD, or RDF/XML.",
  },
  {
    id: DiscoveryStrategy.DESCRIBED_BY_LINK,
    name: "HTML DescribedBy Link",
    category: "HTML Header",
    description: "A head link tag with rel='describedby' pointing to the resource's metadata.",
    codeSnippet: '<link rel="describedby" type="text/turtle" href="/rdf/a.ttl">',
    standard: "RFC 5988 (Web Linking) / Linked Data",
    provenance: "IETF / W3C",
    location: "Resource",
    extraction: "Uplifted",
    specLink: "https://datatracker.ietf.org/doc/html/rfc8288#section-3",
    extraInfo: "A standard link relation indicating that the linked resource describes the current resource. Used in FAIR Signposting to connect landing pages directly to RDF metadata."
  },
  {
    id: DiscoveryStrategy.FOAF,
    name: "FOAF Relations",
    category: "RDF Relation",
    description: "Friend of a Friend (FOAF) properties in RDF files linking to other people.",
    codeSnippet: ':alice foaf:knows :bob',
    standard: "FOAF (Friend of a Friend) Vocabulary Specification",
    provenance: "FOAF Project / W3C Semantic Web",
    location: "Resource",
    extraction: "Reasoned",
    specLink: "http://xmlns.com/foaf/spec/",
    extraInfo: "A native RDF vocabulary for describing people and social relationships. Resolves connections between individual resource graphs dynamically.",
    proposedRdfRetrieval: "1. Traverse Graph: Find triples with foaf:knows predicate.\n2. Fetch: De-reference the target URI of the knows relation.\n3. Merge & Reason: Add the new graph context to the current model, linking resources dynamically to build a unified profile graph."
  },
  {
    id: DiscoveryStrategy.SAME_AS,
    name: "OWL SameAs equivalence",
    category: "RDF Relation",
    description: "owl:sameAs predicate mapping equivalent resource URIs to each other.",
    codeSnippet: ':res-a owl:sameAs :res-b',
    standard: "OWL 2 Web Ontology Language W3C Recommendation",
    provenance: "W3C Semantic Web Working Group",
    location: "Resource",
    extraction: "Reasoned",
    specLink: "https://www.w3.org/TR/owl2-syntax/#Individual_Equality.2FInequality",
    extraInfo: "Declares that two URIs represent the exact same concept/entity. Crucial for web-scale Linked Data federation and identity reconciliation.",
    proposedRdfRetrieval: "1. Match equivalence: Find owl:sameAs relations in the active triples.\n2. Consolidated mapping: Group all URIs in the same owl:sameAs equivalence class.\n3. Entailment: Reason that properties asserted on URI A also hold for URI B."
  },
  {
    id: DiscoveryStrategy.SKOS,
    name: "SKOS Relations",
    category: "RDF Relation",
    description: "Simple Knowledge Organization System (SKOS) hierarchy (broader/narrower/related).",
    codeSnippet: ':project skos:narrower :software',
    standard: "SKOS Simple Knowledge Organization System W3C Recommendation",
    provenance: "W3C Semantic Web Working Group",
    location: "Resource",
    extraction: "Reasoned",
    specLink: "https://www.w3.org/TR/skos-reference/",
    extraInfo: "W3C standard for sharing taxonomy and hierarchy relationships (broader, narrower, related). Allows structured vocabulary discovery.",
    proposedRdfRetrieval: "1. Parse hierarchy: Extract SKOS relations (skos:broader, skos:narrower, skos:related).\n2. Transitive inference: If concept A is narrower than B, and B is narrower than C, reason that A is narrower than C.\n3. Symmetric mapping: If A is skos:related to B, assert that B is skos:related to A."
  },
  {
    id: DiscoveryStrategy.RDF_COLLECTIONS,
    name: "RDF Collections & Containers",
    category: "RDF Relation",
    description: "Triples using RDF lists (first/rest) or container membership (Seq/Bag/Alt).",
    codeSnippet: ':collection schema:hasPart ( :res1 :res2 )',
    standard: "RDF 1.1 Schema and Semantics W3C Recommendation",
    provenance: "W3C Semantic Web Working Group",
    location: "Resource",
    extraction: "Reasoned",
    specLink: "https://www.w3.org/TR/rdf11-mt/",
    extraInfo: "Models ordered lists (first/rest) or container groups inside RDF. Useful for crawling page sequences in collections.",
    proposedRdfRetrieval: "1. Walk list nodes: Traverse rdf:first and rdf:rest chains to resolve rdf:List members.\n2. Container reasoning: Traverse rdf:_1, rdf:_2 properties of Bag, Seq, or Alt structures.\n3. Sequence: Order resources based on container/list position for processing."
  },
  {
    id: DiscoveryStrategy.RSS_FEED,
    name: "RSS Feed Listing",
    category: "Syndication/Metadata",
    description: "Listing pages and resources inside a standard RSS syndication feed.",
    codeSnippet: '<rss><channel><item><link>/pages/page.html</link></item></channel></rss>',
    standard: "RSS 2.0 Specification",
    provenance: "RSS Advisory Board",
    location: "Domain",
    extraction: "Uplifted",
    specLink: "https://www.rssboard.org/rss-specification",
    extraInfo: "A standard syndication format. Parsed by crawlers at the domain level to identify newly updated resource pages and extract basic title/description properties.",
    proposedRdfRetrieval: "1. Parse XML: Retrieve the RSS feed payload and parse channel and item elements.\n2. Map Channel: Map channel/title -> schema:name. Map channel to schema:DataCatalog.\n3. Map Items: For each item, map item/link -> subject. Map title -> schema:name, pubDate -> schema:datePublished.\n\nTriples:\n<feedUrl> a schema:DataCatalog ; schema:name \"Feed\" .\n<itemLink> a schema:Dataset ; schema:name \"Item Name\" ; schema:datePublished \"pubDate\" ; schema:isPartOf <feedUrl> ."
  },
  {
    id: DiscoveryStrategy.ATOM_FEED,
    name: "Atom Feed Listing",
    category: "Syndication/Metadata",
    description: "Listing pages inside an XML Atom feed to facilitate metadata harvesting.",
    codeSnippet: '<feed><entry><link href="/pages/page.html"/></entry></feed>',
    standard: "RFC 4287 (Atom Syndication Format)",
    provenance: "Internet Engineering Task Force (IETF)",
    location: "Domain",
    extraction: "Uplifted",
    specLink: "https://datatracker.ietf.org/doc/html/rfc4287",
    extraInfo: "A robust syndication protocol. Unlike RSS, it supports well-defined author, link, and entry elements, facilitating more structured metadata harvesting.",
    proposedRdfRetrieval: "1. Parse XML: Retrieve the Atom feed and parse feed and entry elements.\n2. Map Feed: Map feed/title -> schema:name. Map feed to schema:DataCatalog.\n3. Map Entries: For each entry, map entry/link[rel=alternate] -> subject. Map title -> schema:name, updated -> schema:dateModified.\n\nTriples:\n<feedUrl> a schema:DataCatalog ; schema:name \"Feed\" .\n<entryLink> a schema:Dataset ; schema:name \"Entry Name\" ; schema:dateModified \"updated\" ; schema:isPartOf <feedUrl> ."
  },
  {
    id: DiscoveryStrategy.SITEMAP,
    name: "XML Sitemap",
    category: "Syndication/Metadata",
    description: "Exposing page existence through sitemap.xml for indexing.",
    codeSnippet: '<urlset><url><loc>http://localhost:8080/pages/page-a.html</loc></url></urlset>',
    standard: "XML Sitemap Schema Protocol v0.9",
    provenance: "Sitemaps.org Consortium (Google, Yahoo, Bing)",
    location: "Domain",
    extraction: "Uplifted",
    specLink: "https://www.sitemaps.org/protocol.html",
    extraInfo: "An XML file mapping all URLs available for crawling. Sitemaps are parsed in LOD discovery to bootstrap discovery and crawl domain-wide resources.",
    proposedRdfRetrieval: "1. Parse XML: Parse the XML sitemap schema looking for url/loc, lastmod, changefreq, and priority.\n2. Map Sitemap: Map sitemap URL to dcat:Catalog.\n3. Map Entries: Map each loc URL to dcat:CatalogRecord. Map lastmod -> dcat:listingDate and schema:dateModified.\n\nTriples:\n<sitemapUrl> a dcat:Catalog .\n<locUrl> a dcat:CatalogRecord ; dcat:listingDate \"lastmod\" ; schema:isPartOf <sitemapUrl> ."
  },
  {
    id: DiscoveryStrategy.ROBOTS,
    name: "Robots.txt references",
    category: "Syndication/Metadata",
    description: "Pointing crawlers directly to Sitemaps inside the robots.txt file.",
    codeSnippet: 'Sitemap: http://localhost:8080/sitemap.xml',
    standard: "Robots Exclusion Protocol (RFC 9309)",
    provenance: "Internet Engineering Task Force (IETF)",
    location: "Domain",
    extraction: "Uplifted",
    specLink: "https://datatracker.ietf.org/doc/html/rfc9309",
    extraInfo: "Contains crawling policies and lists Sitemap locations. The testbed checks this file at the host root to discover entry points without site-wide crawling.",
    proposedRdfRetrieval: "1. Parse Text: Fetch robots.txt at host root. Extract Sitemap: URL lines.\n2. Map: Assert relationship between host domain Website and the sitemaps.\n\nTriples:\n<domainUri> a schema:WebSite ;\n            schema:hasPart <sitemapUrl> ."
  },
  {
    id: DiscoveryStrategy.MANIFEST,
    name: "Web Manifest",
    category: "Syndication/Metadata",
    description: "HTML linking to a webmanifest file which documents application metadata.",
    codeSnippet: '<link rel="manifest" href="/manifests/site.webmanifest">',
    standard: "Web App Manifest W3C Recommendation",
    provenance: "W3C Web Application Working Group",
    location: "Domain",
    extraction: "Uplifted",
    specLink: "https://www.w3.org/TR/appmanifest/",
    extraInfo: "A JSON file describing a web application's identity. Parsed to capture host-wide application metadata and branding terms.",
    proposedRdfRetrieval: "1. Parse JSON: Retrieve manifest.json. Parse standard keys (name, short_name, description, start_url).\n2. Map Manifest: Map to schema:WebApplication vocabulary terms.\n\nTriples:\n<domainUri> a schema:WebApplication ;\n            schema:name \"Name\" ;\n            schema:description \"Description\" ;\n            schema:targetUrl <start_url> ."
  },
  {
    id: DiscoveryStrategy.WELL_KNOWN,
    name: "Well-Known RFC 8615 Endpoints",
    category: "Syndication/Metadata",
    description: "A standard /.well-known/lod-catalog endpoint to initiate discovery.",
    codeSnippet: 'GET /.well-known/lod-catalog',
    standard: "RFC 8615 (Well-Known URIs)",
    provenance: "Internet Engineering Task Force (IETF)",
    location: "Both",
    extraction: "Uplifted",
    specLink: "https://datatracker.ietf.org/doc/html/rfc8615",
    extraInfo: "Provides standard host-level endpoint discovery (e.g. `/.well-known/api-catalog`). In LOD discovery, it serves as the entry-point fallback for bootstrapping.",
    proposedRdfRetrieval: "1. Probe: Check Well-Known URL (e.g. /.well-known/api-catalog or /.well-known/lod-catalog).\n2. Map JSON: Parse JSON keys (sitemap, resource_map) and map to EntryPoints.\n3. Map Linksets: Parse Linkset mappings directly to assertions.\n\nTriples:\n<domainUri> a schema:WebAPI ;\n            schema:entryPoint [ a schema:EntryPoint ; schema:urlTemplate \"/.well-known/api-catalog\" ] ."
  },
  {
    id: DiscoveryStrategy.API_DISCOVERY,
    name: "JSON API Link Headers / Fields",
    category: "Syndication/Metadata",
    description: "Resource endpoints served as application/json listing related properties.",
    codeSnippet: 'GET /api/resource-x -> { "related": [...] }',
    standard: "RESTful API Hypermedia Design Pattern",
    provenance: "W3C / IETF HTTP & REST Guidelines",
    location: "Domain",
    extraction: "Uplifted",
    specLink: "https://www.w3.org/TR/dwbp/",
    extraInfo: "Uses standard hypermedia links in JSON API responses to guide client crawlers from endpoint catalogs to specific resource records.",
    proposedRdfRetrieval: "1. Parse Headers/Payload: Extract hypermedia links in JSON API fields or headers.\n2. Map: Translate IANA relation types to RDF properties (e.g. rel=collection -> iana:collection).\n\nTriples:\n<apiEndpoint> a dcat:DataService ;\n              dcat:endpointURL <apiEndpoint> ;\n              dcat:servesDataset <datasetUri> ."
  },
  {
    id: DiscoveryStrategy.HTTP_LINK_RELATIONS,
    name: "HTTP Link Relations (Collection/Item)",
    category: "HTTP Header",
    description: "Using HTTP Link headers with rel='collection', 'item', 'up', 'prev', 'next'.",
    codeSnippet: 'Link: </pages/collection.html>; rel="collection"',
    standard: "RFC 8288 (Web Linking)",
    provenance: "Internet Engineering Task Force (IETF)",
    location: "Resource",
    extraction: "Uplifted",
    specLink: "https://datatracker.ietf.org/doc/html/rfc8288",
    extraInfo: "Advertises collection structures, parent links, and navigation relations (prev, next, up, first) directly in HTTP response headers.",
    proposedRdfRetrieval: "1. Parse Headers: Extract HTTP Link headers with relations (collection, item, up, prev, next).\n2. Map: Map relation strings directly to IANA link relation predicates (http://www.iana.org/assignments/relation/rel).\n\nTriples:\n<currentUri> <http://www.iana.org/assignments/relation/collection> <collectionUri> ;\n             <http://www.iana.org/assignments/relation/up> <parentUri> ."
  },
  {
    id: DiscoveryStrategy.PAGINATION,
    name: "Pagination Links (Prev/Next)",
    category: "HTML Header",
    description: "HTML rel='prev' and rel='next' tags pointing to chronological neighbors.",
    codeSnippet: '<link rel="next" href="/pages/page-next.html">',
    standard: "HTML5 Standard Link Relations (Prev/Next)",
    provenance: "W3C / WHATWG",
    location: "Resource",
    extraction: "Uplifted",
    specLink: "https://html.spec.whatwg.org/multipage/links.html#link-type-next",
    extraInfo: "Navigational pagination links in HTML head (prev/next) that let crawlers step through dataset pages sequentially without discovering a master catalog.",
    proposedRdfRetrieval: "1. Parse DOM: Extract <link rel=\"next\" href=\"URL\"> or rel=\"prev\" from HTML head.\n2. Map: Map directly to IANA next/prev relation predicates or schema:nextItem/prevItem.\n\nTriples:\n<currentUri> <http://www.iana.org/assignments/relation/next> <nextUrl> ;\n             <http://www.iana.org/assignments/relation/prev> <prevUrl> ."
  },
  {
    id: DiscoveryStrategy.EMBEDDED_TURTLE,
    name: "Embedded Turtle Script",
    category: "HTML Body",
    description: "Turtle RDF graph embedded inside a script tag with type='text/turtle'.",
    codeSnippet: '<script type="text/turtle">@prefix foaf: ...</script>',
    standard: "RDF 1.1 Turtle W3C Recommendation",
    provenance: "W3C Semantic Web Working Group",
    location: "Resource",
    extraction: "Uplifted",
    specLink: "https://www.w3.org/TR/turtle/",
    extraInfo: "Turtle RDF graph embedded inside HTML using `<script type='text/turtle'>`. Avoids JSON overhead, though it requires specific client turtle parsing libraries."
  },
  {
    id: DiscoveryStrategy.EMBEDDED_JSON_LD_GRAPH,
    name: "JSON-LD Graph Array (@graph)",
    category: "HTML Body",
    description: "Bundling multiple resources together in an @graph node in JSON-LD.",
    codeSnippet: '<script type="application/ld+json">{ "@graph": [...] }</script>',
    standard: "JSON-LD 1.1 W3C Recommendation (Graph Structures)",
    provenance: "W3C Semantic Web Working Group",
    location: "Resource",
    extraction: "Uplifted",
    specLink: "https://www.w3.org/TR/json-ld11/#syntax-rules-for-the-graph-object",
    extraInfo: "Wraps multiple resource nodes in an `@graph` array inside a single JSON-LD script, permitting bulk semantic metadata delivery."
  },
  {
    id: DiscoveryStrategy.RESOURCE_MAP,
    name: "Resource Map",
    category: "Syndication/Metadata",
    description: "A central registry (/.well-known/resource-map.json) detailing URIs and locations.",
    codeSnippet: 'GET /.well-known/resource-map.json',
    standard: "OAI Object Reuse and Exchange (OAI-ORE) Specification",
    provenance: "Open Archives Initiative",
    location: "Both",
    extraction: "Uplifted",
    specLink: "https://www.openarchives.org/ore/1.0/toc.html",
    extraInfo: "Host-level index mapping semantic resources to their multiple formats and metadata locations, avoiding page-by-page link guessing.",
    proposedRdfRetrieval: "1. Parse JSON: Parse the resource map document detailing resource URIs and representations.\n2. Map: Map according to OAI Object Reuse and Exchange (OAI-ORE) ontology. Map map -> ore:ResourceMap, aggregation -> ore:Aggregation.\n\nTriples:\n<resourceMapUrl> a ore:ResourceMap ; ore:describes <aggregationUri> .\n<aggregationUri> a ore:Aggregation ; ore:aggregates <resourceUri> ."
  },
  {
    id: DiscoveryStrategy.PROVENANCE,
    name: "PROV-O Provenance Graph",
    category: "RDF Relation",
    description: "Using PROV-O predicates (prov:wasDerivedFrom, prov:wasGeneratedBy) to link sources.",
    codeSnippet: ':dataset prov:wasDerivedFrom :raw-data',
    standard: "PROV-O: The PROV Ontology W3C Recommendation",
    provenance: "W3C Semantic Web Working Group",
    location: "Resource",
    extraction: "Reasoned",
    specLink: "https://www.w3.org/TR/prov-o/",
    extraInfo: "W3C vocabulary for describing data origin, attribution, derivation, and processing history, critical for tracking metadata trust.",
    proposedRdfRetrieval: "1. Match lineage: Extract prov:wasDerivedFrom and prov:wasGeneratedBy properties.\n2. Path analysis: Trace parent nodes to verify data provenance origin.\n3. Trust reasoning: Validate signature references and source reliability through historical path lengths."
  },
  {
    id: DiscoveryStrategy.COLLECTION_MEMBERSHIP,
    name: "Collection Membership (hasPart)",
    category: "RDF Relation",
    description: "Linked data membership triples showing container-to-member relationships.",
    codeSnippet: ':collection schema:hasPart :item',
    standard: "schema.org Vocabulary / OAI-ORE",
    provenance: "Schema.org / W3C Semantic Web",
    location: "Resource",
    extraction: "Reasoned",
    specLink: "https://schema.org/hasPart",
    extraInfo: "Uses schema.org and ORE structural relations (hasPart, contains) in RDF datasets to represent logical hierarchies and membership.",
    proposedRdfRetrieval: "1. Hierarchy parsing: Locate structural links (schema:hasPart, schema:isPartOf, ore:aggregates).\n2. Transitivity: Infer container inclusion of all sub-members (if A isPartOf B, and B isPartOf C, then A isPartOf C).\n3. Indexing: Build collection nodes from the membership assertions."
  },
  {
    id: DiscoveryStrategy.REVERSE_LINKS,
    name: "Bidirectional Graph Links",
    category: "Graph Topology",
    description: "Strict cyclic back-references to verify crawler ability to trace backlink graphs.",
    codeSnippet: 'Page A <--> Page B',
    standard: "Graph Structure / Linked Data Web Design Pattern",
    provenance: "Tim Berners-Lee Linked Data Principles",
    location: "Resource",
    extraction: "Reasoned",
    specLink: "https://www.w3.org/DesignIssues/LinkedData.html",
    extraInfo: "Verifies the presence of reciprocal backlinks to confirm cyclic integrity and crawler navigation robustness across page references.",
    proposedRdfRetrieval: "1. Verify Crawl: Detect bidirectional links between nodes (A -> B and B -> A).\n2. Map: Assert reciprocal link relationship in crawl metrics.\n\nTriples:\n<a> schema:relatedLink <b> .\n<b> schema:relatedLink <a> .\n<a> lod:hasBacklinkVerified <b> ."
  },
  {
    id: DiscoveryStrategy.CIRCULAR_GRAPHS,
    name: "Cyclic Loop Topologies",
    category: "Graph Topology",
    description: "Multi-node cycles (A -> B -> C -> A) to stress-test crawler cycle detection.",
    codeSnippet: 'Page A -> Page B -> Page C -> Page A',
    standard: "Graph Structure / Linked Data Web Design Pattern",
    provenance: "Tim Berners-Lee Linked Data Principles",
    location: "Resource",
    extraction: "Reasoned",
    specLink: "https://www.w3.org/DesignIssues/LinkedData.html",
    extraInfo: "Validates cycle-detection algorithms in the crawler, ensuring it doesn't enter infinite loops when crawling mutually referenced resource pages.",
    proposedRdfRetrieval: "1. Verify Crawl: Identify topological cycles in hyperlink paths (A -> B -> C -> A).\n2. Map: Assert cycle membership properties to verify navigation capability.\n\nTriples:\n<nodeA> lod:inCycleWith <nodeB>, <nodeC> ."
  },
  {
    id: DiscoveryStrategy.CONTENT_NEGOTIATION,
    name: "Content Negotiation",
    category: "HTTP Header",
    description: "Resolving resource URIs with Accept headers to return specific RDF representations (Turtle, JSON-LD, RDF/XML) or HTML.",
    codeSnippet: 'GET /resource/resource-x with Accept: text/turtle -> 303 Redirect to /rdf/resource-x.ttl',
    standard: "HTTP/1.1 Content Negotiation (RFC 9110) / W3C Linked Data Principles",
    provenance: "W3C / IETF",
    location: "Resource",
    extraction: "Direct",
    specLink: "https://www.rfc-editor.org/rfc/rfc9110.html#section-12",
    extraInfo: "Content negotiation allows a single URI to serve multiple formats of a resource. Clients requesting RDF formats receive redirects (303 See Other) to the serialized files, while web browsers receive the human-readable HTML representation.",
    proposedRdfRetrieval: "1. Request resource URI (e.g. /resource/resource-x) with Accept header (e.g. text/turtle).\n2. Follow 303 Redirect to the corresponding RDF representation.\n3. Parse the returned RDF payload directly.\n\nTriples:\nDirectly parsed from the retrieved representation."
  }
];

export function getStrategyMetadataTags(strategy: DiscoveryStrategy, page: PageConfig, baseUri: string, pages?: PageConfig[]): string {
  const resourceId = page.resourceId;
  const pageUrl = `${baseUri}/pages/${page.id}.html`;
  
  switch (strategy) {
    case DiscoveryStrategy.CANONICAL: {
      if (resourceId && pages) {
        const resIndex = RESOURCES.findIndex(r => r.id === resourceId);
        if (resIndex !== -1 && pages[resIndex]) {
          return `<link rel="canonical" href="${baseUri}/pages/${pages[resIndex].id}.html">`;
        }
      }
      return `<link rel="canonical" href="${pageUrl}">`;
    }
      
    case DiscoveryStrategy.OPEN_GRAPH: {
      const resource = resourceId ? RESOURCES.find(r => r.id === resourceId) : undefined;
      const title = resource ? resource.title : page.title;
      const description = resource ? resource.description : "LOD discovery testbed page.";
      
      // Determine Open Graph type
      let ogType = "website";
      if (resource) {
        if (resource.type === "Person") {
          ogType = "profile";
        } else if (resource.type === "ResearchPaper") {
          ogType = "article";
        }
      }
      
      const imageUrl = `${baseUri}/images/LOD_discovery_overview_horizontal.png`;
      
      let tags = `  <meta property="og:title" content="${title}">\n`;
      tags += `  <meta property="og:type" content="${ogType}">\n`;
      tags += `  <meta property="og:url" content="${pageUrl}">\n`;
      tags += `  <meta property="og:image" content="${imageUrl}">\n`;
      tags += `  <meta property="og:description" content="${description}">\n`;
      tags += `  <meta property="og:site_name" content="LOD Compliance Discovery Testbed">`;
      return tags;
    }
      
    case DiscoveryStrategy.DUBLIN_CORE: {
      const resource = resourceId ? RESOURCES.find(r => r.id === resourceId) : undefined;
      const title = resource ? resource.title : page.title;
      const identifier = resource ? expandUri(resource.id, baseUri) : pageUrl;
      const description = resource ? resource.description : "LOD discovery testbed page.";
      
      let tags = `  <link rel="schema.DC" href="http://purl.org/DC/elements/1.1/" />\n`;
      tags += `  <meta name="DC.title" content="${title}">\n`;
      tags += `  <meta name="DC.identifier" content="${identifier}">\n`;
      tags += `  <meta name="DC.description" content="${description}">\n`;
      tags += `  <meta name="DC.format" content="text/html">`;

      if (resource) {
        tags += `\n  <meta name="DC.type" content="${resource.type}">`;

        // Helper to resolve resource reference or return the original value
        const resolveVal = (v: string) => {
          if (v.startsWith("resource-")) {
            const r = RESOURCES.find(res => res.id === v);
            return r ? r.title : v;
          }
          return v;
        };

        // Check for creator / author
        const creator = resource.properties["schema:creator"] || resource.properties["schema:author"] || resource.properties["foaf:name"];
        if (creator) {
          const creators = Array.isArray(creator) ? creator : [creator];
          for (const c of creators) {
            tags += `\n  <meta name="DC.creator" content="${resolveVal(c)}">`;
          }
        }

        // Check for publisher
        const publisher = resource.properties["schema:publisher"];
        if (publisher) {
          const publishers = Array.isArray(publisher) ? publisher : [publisher];
          for (const p of publishers) {
            tags += `\n  <meta name="DC.publisher" content="${resolveVal(p)}">`;
          }
        }

        // Check for date
        const date = resource.properties["schema:datePublished"];
        if (date) {
          tags += `\n  <meta name="DC.date" content="${date}">`;
        }
      }
      return tags;
    }
      
    case DiscoveryStrategy.ALTERNATE:
      if (resourceId) {
        return `  <link rel="alternate" type="text/turtle" href="/rdf/${resourceId}.ttl">\n  <link rel="alternate" type="application/ld+json" href="/rdf/${resourceId}.jsonld">\n  <link rel="alternate" type="application/rdf+xml" href="/rdf/${resourceId}.rdf">`;
      }
      return "";
      
    case DiscoveryStrategy.DESCRIBED_BY_LINK:
      if (resourceId) {
        return `  <link rel="describedby" type="text/turtle" href="/rdf/${resourceId}.ttl">`;
      }
      return "";
      
    case DiscoveryStrategy.MANIFEST:
      return `  <link rel="manifest" href="/manifests/site.webmanifest">`;
      
    case DiscoveryStrategy.PAGINATION:
      // We will define page neighbors dynamically in orchestrator
      return ""; // Handled dynamically in getActiveMetadataTags helper
      
    default:
      return "";
  }
}

export function getStrategyBodyMarkup(
  strategy: DiscoveryStrategy,
  page: PageConfig,
  baseUri: string,
  resourceJsonLd: string,
  resourceTurtle: string,
  resource: Resource | undefined
): string {
  if (!resource) return "";
  const resUri = expandUri(resource.id, baseUri);

  switch (strategy) {
    case DiscoveryStrategy.JSON_LD_SCRIPT:
      return `  <!-- Strategy 3: JSON-LD Script -->\n  <script type="application/ld+json">\n${resourceJsonLd}\n  </script>`;
      
    case DiscoveryStrategy.EMBEDDED_TURTLE:
      return `  <!-- Strategy 24: Embedded Turtle Script -->\n  <script type="text/turtle">\n${resourceTurtle}\n  </script>`;
      
    case DiscoveryStrategy.EMBEDDED_JSON_LD_GRAPH: {
      const graphObj = {
        "@context": {
          "schema": "https://schema.org/",
          "foaf": "http://xmlns.com/foaf/0.1/"
        },
        "@graph": [
          {
            "@id": resUri,
            "@type": `schema:${resource.type}`,
            "schema:name": resource.title,
            "schema:description": resource.description
          },
          {
            "@id": `${resUri}#graph-meta`,
            "@type": "schema:CreativeWork",
            "schema:name": `Graph Metadata for ${resource.title}`,
            "schema:about": { "@id": resUri }
          }
        ]
      };
      return `  <!-- Strategy 25: JSON-LD Graph Array -->\n  <script type="application/ld+json">\n${JSON.stringify(graphObj, null, 2)}\n  </script>`;
    }
    
    default:
      return "";
  }
}

export function getStrategyHeaders(strategy: DiscoveryStrategy, page: PageConfig, baseUri: string, pages?: PageConfig[]): Record<string, string> {
  const resourceId = page.resourceId;
  const headers: Record<string, string> = {};

  switch (strategy) {
    case DiscoveryStrategy.LINK_HEADERS:
      if (resourceId) {
        headers["Link"] = `</rdf/${resourceId}.ttl>; rel="describedby"`;
      }
      break;
      
    case DiscoveryStrategy.HTTP_LINK_RELATIONS:
      // Expose collection, up, etc relations
      const collectionPageId = pages && pages[0] ? pages[0].id : "page-0";
      headers["Link"] = `</pages/${collectionPageId}.html>; rel="collection", </>; rel="up"`;
      break;
  }

  return headers;
}

function generatePageId(
  resourceId: string | null,
  strategies: DiscoveryStrategy[],
  existingIds: Set<string>
): string {
  if (!resourceId) {
    return "page";
  }
  const resourceName = resourceId.replace(/^resource-/, "");

  const abbrevMap: Record<DiscoveryStrategy, string> = {
    [DiscoveryStrategy.HTML_LINKS]: "html",
    [DiscoveryStrategy.LINK_HEADERS]: "hdr",
    [DiscoveryStrategy.JSON_LD_SCRIPT]: "jsonld",
    [DiscoveryStrategy.RDFA]: "rdfa",
    [DiscoveryStrategy.MICRODATA]: "microdata",
    [DiscoveryStrategy.OPEN_GRAPH]: "og",
    [DiscoveryStrategy.DUBLIN_CORE]: "dc",
    [DiscoveryStrategy.CANONICAL]: "canonical",
    [DiscoveryStrategy.ALTERNATE]: "alternate",
    [DiscoveryStrategy.DESCRIBED_BY_LINK]: "desc_lnk",
    [DiscoveryStrategy.FOAF]: "foaf",
    [DiscoveryStrategy.SAME_AS]: "sameas",
    [DiscoveryStrategy.SKOS]: "skos",
    [DiscoveryStrategy.RDF_COLLECTIONS]: "coll",
    [DiscoveryStrategy.RSS_FEED]: "rss",
    [DiscoveryStrategy.ATOM_FEED]: "atom",
    [DiscoveryStrategy.SITEMAP]: "sitemap",
    [DiscoveryStrategy.ROBOTS]: "robots",
    [DiscoveryStrategy.MANIFEST]: "manifest",
    [DiscoveryStrategy.WELL_KNOWN]: "wellknown",
    [DiscoveryStrategy.API_DISCOVERY]: "api_disc",
    [DiscoveryStrategy.HTTP_LINK_RELATIONS]: "link_rel",
    [DiscoveryStrategy.PAGINATION]: "pagination",
    [DiscoveryStrategy.EMBEDDED_TURTLE]: "turtle",
    [DiscoveryStrategy.EMBEDDED_JSON_LD_GRAPH]: "jsonld_graph",
    [DiscoveryStrategy.RESOURCE_MAP]: "resmap",
    [DiscoveryStrategy.PROVENANCE]: "prov",
    [DiscoveryStrategy.COLLECTION_MEMBERSHIP]: "membership",
    [DiscoveryStrategy.REVERSE_LINKS]: "rev_links",
    [DiscoveryStrategy.CIRCULAR_GRAPHS]: "circular",
    [DiscoveryStrategy.CONTENT_NEGOTIATION]: "coneg"
  };

  const activeAbbrevs = strategies
    .map(s => abbrevMap[s] || s.toLowerCase())
    .sort();

  let baseId = resourceName;
  if (activeAbbrevs.length > 0) {
    baseId += "-" + activeAbbrevs.join("-");
  } else {
    baseId += "-none";
  }

  let finalId = baseId;
  let counter = 2;
  while (existingIds.has(finalId)) {
    finalId = `${baseId}-${counter}`;
    counter++;
  }
  return finalId;
}

/**
 * Generates the matrix of pages with specific combinations of discovery strategies
 */
export function generateMatrix(limit: number): PageConfig[] {
  const matrix: PageConfig[] = [];
  const totalResources = RESOURCES.length;
  const existingIds = new Set<string>();

  // 1. Single strategy pages (page-0 to page-30)
  const singleStrategies = STRATEGIES_META.map(s => s.id);
  for (let i = 0; i < 31; i++) {
    const strat = singleStrategies[i];
    let resource = RESOURCES[i % totalResources];
    
    // Ensure strategies are bound to resources containing the appropriate properties
    if (strat === DiscoveryStrategy.FOAF || strat === DiscoveryStrategy.SAME_AS) {
      resource = RESOURCES.find(r => r.id === "resource-marc") || resource;
    } else if (strat === DiscoveryStrategy.PROVENANCE) {
      resource = RESOURCES.find(r => r.id === "resource-arms-mbon") || resource;
    }
    
    const pageId = generatePageId(resource.id, [strat], existingIds);
    existingIds.add(pageId);
    
    matrix.push({
      id: pageId,
      title: `Single Strategy: ${STRATEGIES_META[i].name}`,
      resourceId: resource.id,
      strategies: [strat],
      linkedPages: [],
      linkedResources: []
    });
  }

  // 2. Pairwise combinations (page-31 to page-60)
  // Let's pair HTML_LINKS with others, and some semantic pairings
  for (let i = 0; i < 30; i++) {
    const stratA = DiscoveryStrategy.HTML_LINKS;
    const stratB = singleStrategies[(i + 1) % singleStrategies.length];
    const resource = RESOURCES[(i + 5) % totalResources];

    const strats = [stratA, stratB];
    const pageId = generatePageId(resource.id, strats, existingIds);
    existingIds.add(pageId);

    matrix.push({
      id: pageId,
      title: `Pairwise: HTML Links + ${STRATEGIES_META[(i + 1) % STRATEGIES_META.length].name}`,
      resourceId: resource.id,
      strategies: strats,
      linkedPages: [],
      linkedResources: []
    });
  }

  // 3. Triple combinations (page-61 to page-90)
  for (let i = 0; i < 30; i++) {
    const stratA = DiscoveryStrategy.HTML_LINKS;
    const stratB = DiscoveryStrategy.JSON_LD_SCRIPT;
    const stratC = singleStrategies[(i + 2) % singleStrategies.length];
    const resource = RESOURCES[(i + 8) % totalResources];

    const strats = [stratA, stratB, stratC];
    const pageId = generatePageId(resource.id, strats, existingIds);
    existingIds.add(pageId);

    matrix.push({
      id: pageId,
      title: `Triple Combo: HTML + JSON-LD + ${STRATEGIES_META[(i + 2) % STRATEGIES_META.length].name}`,
      resourceId: resource.id,
      strategies: strats,
      linkedPages: [],
      linkedResources: []
    });
  }

  // 4. Full-stack compliance pages (page-91 to page-109)
  // These exercise a large bunch of tags simultaneously
  for (let i = 0; i < 19; i++) {
    const resource = RESOURCES[i % totalResources];
    const strats = [
      DiscoveryStrategy.HTML_LINKS,
      DiscoveryStrategy.LINK_HEADERS,
      DiscoveryStrategy.JSON_LD_SCRIPT,
      DiscoveryStrategy.RDFA,
      DiscoveryStrategy.MICRODATA,
      DiscoveryStrategy.OPEN_GRAPH,
      DiscoveryStrategy.DUBLIN_CORE,
      DiscoveryStrategy.CANONICAL,
      DiscoveryStrategy.ALTERNATE,
      DiscoveryStrategy.DESCRIBED_BY_LINK
    ];
    const pageId = generatePageId(resource.id, strats, existingIds);
    existingIds.add(pageId);

    matrix.push({
      id: pageId,
      title: `Full Stack Compliance Suite Node ${i}`,
      resourceId: resource.id,
      strategies: strats,
      linkedPages: [],
      linkedResources: []
    });
  }

  // 5. Hidden Discovery Scenarios (page-110 to page-129)
  // These represent nodes not linked directly from normal HTML index
  
  // Page 110: Only in robots.txt
  const page110Id = generatePageId(RESOURCES[0].id, [DiscoveryStrategy.ROBOTS], existingIds);
  existingIds.add(page110Id);
  matrix.push({
    id: page110Id,
    title: `Hidden: Robots.txt Reference Only`,
    resourceId: RESOURCES[0].id,
    strategies: [DiscoveryStrategy.ROBOTS],
    linkedPages: [],
    linkedResources: [],
    isHidden: true
  });

  // Page 111: Only in sitemap.xml
  const page111Id = generatePageId(RESOURCES[1].id, [DiscoveryStrategy.SITEMAP], existingIds);
  existingIds.add(page111Id);
  matrix.push({
    id: page111Id,
    title: `Hidden: Sitemap.xml Reference Only`,
    resourceId: RESOURCES[1].id,
    strategies: [DiscoveryStrategy.SITEMAP],
    linkedPages: [],
    linkedResources: [],
    isHidden: true
  });

  // Page 112: Only via Link HTTP Header from another page
  const page112Id = generatePageId(RESOURCES[2].id, [], existingIds);
  existingIds.add(page112Id);
  matrix.push({
    id: page112Id,
    title: `Hidden: Link Redirect Only`,
    resourceId: RESOURCES[2].id,
    strategies: [],
    linkedPages: [],
    linkedResources: [],
    isHidden: true
  });

  // Page 113: Only in JSON-LD RDF @id linkage
  const page113Id = generatePageId(RESOURCES[3].id, [], existingIds);
  existingIds.add(page113Id);
  matrix.push({
    id: page113Id,
    title: `Hidden: JSON-LD Graph Reference Only`,
    resourceId: RESOURCES[3].id,
    strategies: [],
    linkedPages: [],
    linkedResources: [],
    isHidden: true
  });

  // Page 114: Only in resource map
  const page114Id = generatePageId(RESOURCES[4].id, [DiscoveryStrategy.RESOURCE_MAP], existingIds);
  existingIds.add(page114Id);
  matrix.push({
    id: page114Id,
    title: `Hidden: Resource Map Listing Only`,
    resourceId: RESOURCES[4].id,
    strategies: [DiscoveryStrategy.RESOURCE_MAP],
    linkedPages: [],
    linkedResources: [],
    isHidden: true
  });

  // Rest of hidden pages (page-115 to page-129)
  for (let i = 5; i < 20; i++) {
    const resource = RESOURCES[i % totalResources];
    const strats = [DiscoveryStrategy.CANONICAL];
    const pageId = generatePageId(resource.id, strats, existingIds);
    existingIds.add(pageId);
    matrix.push({
      id: pageId,
      title: `Hidden Page Instance ${i}`,
      resourceId: resource.id,
      strategies: strats,
      linkedPages: [],
      linkedResources: [],
      isHidden: true
    });
  }

  // 6. Stress Testing Section (page-130 to page-149, or more up to limit)
  const stressCount = Math.max(20, limit - 130);
  for (let i = 0; i < stressCount; i++) {
    const resource = RESOURCES[i % totalResources];
    
    // Assign topology features
    let strats = [DiscoveryStrategy.HTML_LINKS];
    if (i % 5 === 0) strats.push(DiscoveryStrategy.CIRCULAR_GRAPHS);
    if (i % 5 === 1) strats.push(DiscoveryStrategy.REVERSE_LINKS);

    const pageId = generatePageId(resource.id, strats, existingIds);
    existingIds.add(pageId);

    matrix.push({
      id: pageId,
      title: `Stress Node ${i} (${130 + i})`,
      resourceId: resource.id,
      strategies: strats,
      linkedPages: [],
      linkedResources: []
    });
  }

  // Setup Graph Connections (HTML hyperlinks and logical linkages)
  // Let's link them sequentially by default for HTML traversal: page-x -> page-(x+1)
  for (let i = 0; i < matrix.length - 1; i++) {
    const currentPage = matrix[i];
    const nextPage = matrix[i + 1];
    
    // Skip adding forward links to hidden pages from non-hidden pages, except for testing
    if (nextPage.isHidden) continue;
    
    currentPage.linkedPages.push(nextPage.id);
  }

  // Setup Specific Topologies
  
  // Circular Graph: 130 -> 131 -> 132 -> 130
  if (matrix.length > 132) {
    matrix[130].linkedPages = [matrix[131].id];
    matrix[131].linkedPages = [matrix[132].id];
    matrix[132].linkedPages = [matrix[130].id];
  }

  // Reverse Links: 133 <-> 134
  if (matrix.length > 134) {
    matrix[133].linkedPages = [matrix[134].id];
    matrix[134].linkedPages = [matrix[133].id];
  }

  // Link page-1 to page-112 via HTTP Link header mapping
  if (matrix.length > 112) {
    // Add custom header to page-1 pointing to page-112
    matrix[1].customHeaders = {
      "Link": `</pages/${matrix[112].id}.html>; rel="next", </rdf/${RESOURCES[1].id}.ttl>; rel="describedby"`
    };
  }

  return matrix;
}
