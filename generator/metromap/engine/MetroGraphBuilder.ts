import { Resource } from "../../types";
import { MetroGraph } from "../models/MetroGraph";
import { MetroNode, NodeCategory } from "../models/MetroNode";
import { MetroTrack } from "../models/MetroTrack";
import { Specification } from "../models/Specification";
import { SPECS_REGISTRY } from "../registry/specsRegistry";
import { RT_PATTERNS_REGISTRY } from "../registry/rtPatternsRegistry";
import { DiscoveryCascadeEngine } from "./DiscoveryCascadeEngine";

export function getNodeLayer(uri: string): 1 | 2 | 3 | 4 {
  if (
    uri === "/" ||
    uri === "/robots.txt" ||
    uri.includes("sitemap") ||
    uri === "/.well-known/api-catalog" ||
    uri === "/catalog/dcat.ttl" ||
    uri === "/catalog/" ||
    uri === "/id/profiles"
  ) {
    return 1;
  }
  if (uri.startsWith("/id/profile/")) {
    return 3;
  }
  if (
    uri.startsWith("/data/") ||
    uri.startsWith("/api/") ||
    uri.endsWith(".linkset.json") ||
    uri.includes("observations")
  ) {
    return 4;
  }
  if (uri.startsWith("/id/")) {
    return 2;
  }
  return 1;
}

export function getNodeStaticFile(uri: string): string {
  if (uri === "/") return "dist/index.html";
  if (uri === "/robots.txt") return "dist/robots.txt";
  if (uri === "/sitemap.xml") return "dist/sitemap.xml";
  if (uri === "/sitemap-index.xml") return "dist/sitemap-index.xml";
  if (uri === "/sitemap-datasets.xml") return "dist/sitemap-datasets.xml";
  if (uri === "/sitemap-profiles.xml") return "dist/sitemap-profiles.xml";
  if (uri === "/sitemap-catalog.xml") return "dist/sitemap-catalog.xml";
  if (uri === "/.well-known/api-catalog") return "dist/.well-known/api-catalog";
  if (uri === "/catalog/dcat.ttl") return "dist/catalog/dcat.ttl";
  if (uri === "/catalog/") return "dist/catalog/index.html";
  if (uri === "/id/profiles") return "dist/id/profiles/index.html";
  if (uri === "/api/observations/v1") return "dist/api/observations/v1/data.json";
  if (uri === "/api/observations/v1/sitemap.xml") return "dist/api/observations/v1/sitemap.xml";
  if (uri === "/api/observations/v1/openapi.json") return "dist/api/observations/v1/openapi.json";
  if (uri === "/api/observations/v1/docs/") return "dist/api/observations/v1/docs/index.html";
  if (uri.startsWith("/id/") && !uri.includes(".")) return `dist${uri}.html (Conneg 303 Hub)`;
  return `dist${uri}`;
}

export function getNodeSourceFile(uri: string): string {
  if (uri === "/") return "generator/htmlTemplates.ts";
  if (uri.includes("sitemap") || uri === "/robots.txt") return "generator/index.ts";
  if (uri === "/.well-known/api-catalog") return "generator/linksetGenerator.ts";
  if (uri.startsWith("/catalog/")) return "generator/dcatGenerator.ts";
  if (uri.includes("/profile/")) return "generator/profileGenerator.ts";
  if (uri.startsWith("/data/")) return "generator/dataPayloads.ts";
  if (uri.startsWith("/api/")) return "generator/openApiGenerator.ts";
  if (uri.includes(".linkset.json")) return "generator/linksetGenerator.ts";
  if (uri.startsWith("/id/")) return "generator/resources.ts + rdfSerializer.ts";
  return "generator/index.ts";
}

export function getNodeNginxLocation(uri: string): string {
  if (uri.startsWith("/id/") && !uri.includes(".")) {
    return "location ~ ^/id/(?<res_type>[^/]+)/(?<res_name>[^/.]+)$ (Conneg 303)";
  }
  return `location = ${uri}`;
}

export class MetroGraphBuilder {
  private cascadeEngine: DiscoveryCascadeEngine;

  constructor(private resources: Resource[], private baseUrl: string) {
    this.cascadeEngine = new DiscoveryCascadeEngine(resources, baseUrl);
  }

  public buildGraph(entrypointUri: string = "/"): MetroGraph {
    const signals = this.cascadeEngine.cascade(entrypointUri);
    const nodesMap: Map<string, MetroNode> = new Map();
    const tracks: MetroTrack[] = [];

    const getOrCreateNode = (
      id: string,
      uri: string,
      label: string,
      sublabel: string,
      category: NodeCategory,
      specIds: string[],
      desc: string = "",
      liveUrl?: string
    ): MetroNode => {
      if (!nodesMap.has(id)) {
        const specs = specIds.map(sid => (SPECS_REGISTRY as Record<string, Specification>)[sid]).filter(Boolean);
        const isOrigin = uri === entrypointUri || label === entrypointUri || id === `node-${entrypointUri}`;
        const layer = getNodeLayer(uri);
        const staticFile = getNodeStaticFile(uri);
        const sourceFile = getNodeSourceFile(uri);
        const nginxLoc = getNodeNginxLocation(uri);

        const node = new MetroNode(
          id,
          uri,
          label,
          sublabel,
          category,
          specs,
          desc,
          liveUrl || `${this.baseUrl}${uri}`,
          isOrigin,
          layer,
          staticFile,
          sourceFile,
          nginxLoc
        );
        nodesMap.set(id, node);
      }
      return nodesMap.get(id)!;
    };

    // Domain backbone stations
    getOrCreateNode("node-domain-root", "/", "/ (Domain Root)", "RFC 8288 Header Bootstrap", "domain", ["RFC_8288", "RFC_9727"], "Primary domain entrypoint.");
    getOrCreateNode("node-robots", "/robots.txt", "/robots.txt", "Robots Directives", "domain", ["RFC_8288"], "Directs harvesters to sitemap.xml.");
    getOrCreateNode("node-sitemap-index", "/sitemap-index.xml", "/sitemap-index.xml", "Sitemap Index (RT-P07)", "domain", ["RESOURCESYNC", "RFC_8288"], "Hierarchical sitemap index.");
    getOrCreateNode("node-sitemap", "/sitemap.xml", "/sitemap.xml", "rs:ln & xhtml:link Signmap", "domain", ["RESOURCESYNC", "RFC_8288"], "Enhanced Signmap index.");
    getOrCreateNode("node-sitemap-catalog", "/sitemap-catalog.xml", "/sitemap-catalog.xml", "Catalog Sub-Sitemap (RT-P07)", "domain", ["RESOURCESYNC", "DCAT_3"], "Catalog sitemap.");
    getOrCreateNode("node-api-catalog", "/.well-known/api-catalog", "/.well-known/api-catalog", "RFC 9727 Discovery", "api", ["RFC_9727"], "Host API discovery catalog.");
    getOrCreateNode("node-dcat-catalog", "/catalog/dcat.ttl", "/catalog/dcat.ttl", "DCAT-3 Catalogue", "domain", ["DCAT_3"], "W3C DCAT dataset catalogue.");
    getOrCreateNode("node-profiles-catalog", "/id/profiles", "/id/profiles", "DX-PROF Profiles Registry", "profile", ["RFC_6906"], "Semantic profiles registry.");

    // Instantiate entity stations and tracks from signals
    for (let i = 0; i < signals.length; i++) {
      const sig = signals[i];
      const sourceId = `node-${sig.sourceUri.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
      const targetId = `node-${sig.targetUri.replace(/[^a-zA-Z0-9_-]/g, "_")}`;

      const sourceNode = getOrCreateNode(sourceId, sig.sourceUri, sig.sourceUri, "", sig.category, sig.specIds);
      const targetNode = getOrCreateNode(targetId, sig.targetUri, sig.targetUri, sig.sublabel, sig.category, sig.specIds);

      const curlCmd = `curl -I -s ${this.baseUrl}${sig.sourceUri}`;
      const httpHeader = `Link: <${this.baseUrl}${sig.targetUri}>; ${sig.relation}`;

      tracks.push(
        new MetroTrack(
          `track-${i}`,
          sourceNode,
          targetNode,
          sig.category,
          sig.relation,
          undefined,
          sig.category === "linkset",
          sig.relation,
          curlCmd,
          httpHeader
        )
      );
    }

    return new MetroGraph(Array.from(nodesMap.values()), tracks, RT_PATTERNS_REGISTRY, entrypointUri);
  }
}
