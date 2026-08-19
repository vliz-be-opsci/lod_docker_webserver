import { Resource } from "../../types";
import { MetroGraph } from "../models/MetroGraph";
import { MetroNode, NodeCategory } from "../models/MetroNode";
import { MetroTrack } from "../models/MetroTrack";
import { Specification } from "../models/Specification";
import { SPECS_REGISTRY } from "../registry/specsRegistry";
import { RT_PATTERNS_REGISTRY } from "../registry/rtPatternsRegistry";
import { DiscoveryCascadeEngine } from "./DiscoveryCascadeEngine";

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
        const node = new MetroNode(id, uri, label, sublabel, category, specs, desc, liveUrl || `${this.baseUrl}${uri}`, isOrigin);
        nodesMap.set(id, node);
      }
      return nodesMap.get(id)!;
    };

    // Domain backbone stations
    getOrCreateNode("node-domain-root", "/", "/ (Domain Root)", "RFC 8288 Header Bootstrap", "domain", ["RFC_8288", "RFC_9727"], "Primary domain entrypoint.");
    getOrCreateNode("node-robots", "/robots.txt", "/robots.txt", "Robots Directives", "domain", ["RFC_8288"], "Directs harvesters to sitemap.xml.");
    getOrCreateNode("node-sitemap", "/sitemap.xml", "/sitemap.xml", "rs:ln & xhtml:link Signmap", "domain", ["RESOURCESYNC", "RFC_8288"], "Enhanced Signmap index.");
    getOrCreateNode("node-api-catalog", "/.well-known/api-catalog", "/.well-known/api-catalog", "RFC 9727 Discovery", "api", ["RFC_9727"], "Host API discovery catalog.");
    getOrCreateNode("node-dcat-catalog", "/catalog/dcat.ttl", "/catalog/dcat.ttl", "DCAT-3 Catalogue", "domain", ["DCAT_3"], "W3C DCAT dataset catalogue.");

    // Instantiate entity stations and tracks from signals
    for (let i = 0; i < signals.length; i++) {
      const sig = signals[i];
      const sourceId = `node-${sig.sourceUri.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
      const targetId = `node-${sig.targetUri.replace(/[^a-zA-Z0-9_-]/g, "_")}`;

      const sourceNode = getOrCreateNode(sourceId, sig.sourceUri, sig.sourceUri, "", sig.category, sig.specIds);
      const targetNode = getOrCreateNode(targetId, sig.targetUri, sig.targetUri, sig.sublabel, sig.category, sig.specIds);

      tracks.push(new MetroTrack(`track-${i}`, sourceNode, targetNode, sig.category, sig.relation, undefined, sig.category === "linkset"));
    }

    return new MetroGraph(Array.from(nodesMap.values()), tracks, RT_PATTERNS_REGISTRY, entrypointUri);
  }
}
