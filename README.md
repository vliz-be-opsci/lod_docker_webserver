# LOD Discovery & Compliance Testbed

An interactive, high-fidelity Linked Open Data (LOD) Discovery and Compliance Testbed. This server provides a multi-quadrant static testbed matrix containing 150 generated pages to demonstrate, document, and test 30 different web resource discovery methods.

The testbed categorizes these methods using a 2x2 taxonomy (Resource vs. Domain level, Direct RDF vs. Inferenced RDF) and provides technical specifications, documentation, and proposed RDF extraction designs for each.

---

## 🚀 Quick Start

### Prerequisites
* [Node.js](https://nodejs.org/) (v18+) or [Bun](https://bun.sh/) (v1.1+)
* [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)

### 1. Build and Generate Assets
The HTML pages, RSS/Atom feeds, site map, and well-known catalog files are dynamically generated from TypeScript configurations.
```bash
# Install dependencies
npm install

# Generate the static testbed assets (creates /dist directory)
npm run generate
```

### 2. Run the Server
Spin up the Dockerized Nginx container to serve the generated assets locally:
```bash
docker compose up --build -d
```
The testbed web UI will be accessible at:
👉 **[http://localhost:8080](http://localhost:8080)**

To stop the server:
```bash
docker compose down
```

---

## 📂 Project Architecture & Contents

The project is structured to generate a realistic site topology demonstrating various metadata delivery methods:

```
├── dist/                          # Generated static assets served by Nginx
│   ├── .well-known/
│   │   ├── lod-catalog            # The root LOD crawler landing endpoint (JSON)
│   │   └── resource-map.json      # OAI-ORE resource map detailing all page formats
│   ├── pages/                     # 150 simulated resource pages (HTML, alternate TTL, etc.)
│   ├── index.html                 # Main Dashboard Web UI
│   ├── feed.rss / feed.atom       # Syndication feeds containing discovery links
│   └── sitemap.xml / robots.txt   # Search engine crawler instructions
├── generator/                     # Node/Bun source generator
│   ├── htmlTemplates.ts           # Premium UI templates and design system styles
│   ├── index.ts                   # Main build pipeline orchestrating page generation
│   ├── resources.ts               # Core vocabulary, agency, and tool definitions (e.g. VLIZ/MAREGRAPH)
│   ├── strategies.ts              # Data definition for the 30 discovery strategies
│   └── wrx_discovery_classification.md # Taxonomy documentation and RDF extraction specifications
├── docker-compose.yml             # Docker service definitions
├── Nginx.conf                      # Nginx configurations (routing, caching, content negotiation headers)
└── package.json                   # Build scripts & dependencies
```

---

## 📊 The 2x2 Taxonomy

Discovery methods are classified along two primary dimensions:
1. **Location of Discovery**:
   * **Resource Level**: Signals found directly on or within the response from the initial resource URI.
   * **Domain Level**: Signals found on host-wide, domain-wide, or catalog-wide endpoints separate from the resource.
2. **Extraction Type**:
   * **Direct RDF**: Native RDF serialization (e.g., Turtle, JSON-LD) requiring no custom property translation.
   * **Inferenced RDF**: Non-RDF payloads (e.g., HTML, XML, JSON) containing metadata that must be translated into RDF graphs.

---

## ⚠️ Implementation Status Note

> [!IMPORTANT]
> While this testbed generates valid static payloads demonstrating all 30 discovery channels (including RDF representations, sitemaps, headers, and metadata), **many of the listed discovery methods are not yet fully implemented in the automated harvester/crawler logic itself**. 
>
> The detailed technical specifications, links to official standards, taxonomy mappings, and proposed RDF retrieval designs are **fully present** and documented in the strategy configurations and [wrx_discovery_classification.md](file:///c:/Users/cedricd/Documents/Github/lod_docker_webserver/generator/wrx_discovery_classification.md). They serve as the implementation blueprint for the crawler ecosystem.

---

## 🤝 Contributing

Contributions to expand the LOD Discovery Testbed are welcome!

### How to Add or Modify Discovery Strategies
1. Open [strategies.ts](file:///c:/Users/cedricd/Documents/Github/lod_docker_webserver/generator/strategies.ts).
2. Locate the strategy definition array. Add or edit a strategy object following this structure:
   ```typescript
   {
     id: "YOUR_STRATEGY_ID",
     name: "Human Readable Name",
     // recommended classification:
     location: "Resource", // "Resource" | "Domain" | "Both"
     extraction: "Inferenced", // "Direct" | "Inferenced" | "Both"
     specLink: "https://url.to/specification",
     standard: "W3C / RFC XXXX",
     provenance: "Organization name",
     extraInfo: "Extra technical context regarding usage."
   }
   ```
3. Run `npm run generate` to rebuild the testbed site.
4. Verify changes in your browser at `http://localhost:8080`.

### Improving the Dashboard Web UI
Styles and templates are managed centrally in `generator/htmlTemplates.ts`. The UI uses a modern, responsive CSS design system with custom HSL color tokens and micro-interactions.
