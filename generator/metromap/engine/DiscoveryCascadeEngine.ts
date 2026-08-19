import { Resource } from "../../types";
import { NodeCategory } from "../models/MetroNode";

export interface DiscoveredSignal {
  sourceUri: string;
  targetUri: string;
  relation: string;
  category: NodeCategory;
  label: string;
  sublabel: string;
  specIds: string[];
}

export class DiscoveryCascadeEngine {
  constructor(private resources: Resource[], private baseUrl: string) {}

  public cascade(entrypointUri: string): DiscoveredSignal[] {
    const signals: DiscoveredSignal[] = [];

    // 1. Domain Discovery Corridor
    signals.push(
      { sourceUri: "/", targetUri: "/.well-known/api-catalog", relation: 'rel="api-catalog"', category: "domain", label: "Domain Root", sublabel: "RFC 8288 Link Headers", specIds: ["RFC_8288", "RFC_9727"] },
      { sourceUri: "/", targetUri: "/robots.txt", relation: "directive", category: "domain", label: "Domain Root", sublabel: "Robots Directive", specIds: ["RFC_8288"] },
      { sourceUri: "/robots.txt", targetUri: "/sitemap.xml", relation: "Sitemap:", category: "domain", label: "/robots.txt", sublabel: "Sitemap Bootstrap", specIds: ["RFC_8288"] },
      { sourceUri: "/sitemap.xml", targetUri: "/.well-known/api-catalog", relation: "rs:ln (api-catalog)", category: "domain", label: "/sitemap.xml", sublabel: "Signmap Index", specIds: ["RESOURCESYNC", "RFC_9727"] },
      { sourceUri: "/sitemap.xml", targetUri: "/catalog/dcat.ttl", relation: "rs:ln (dcat-catalog)", category: "domain", label: "/sitemap.xml", sublabel: "Signmap Index", specIds: ["RESOURCESYNC", "DCAT_3"] }
    );

    // 2. Primary Featured Entities Corridor (Clean, non-cluttered topology)
    const featuredResources = this.resources.filter(r => 
      r.id === "resource-arms-mbon" || 
      r.id === "resource-arms-2018" || 
      r.id === "resource-north-sea-sensors" || 
      r.id === "resource-vliz" || 
      r.id === "resource-ro-crate-paper" ||
      r.id === "resource-eurobis-occurrences" ||
      r.category === "api"
    );

    for (const res of featuredResources) {
      const pidUri = `/resource/${res.id}`;
      const slug = res.id.replace("resource-", "");
      let htmlPath = `/datasets/${slug}.html`;
      if (res.category === "institute") htmlPath = `/institutes/${slug}.html`;
      if (res.category === "publication") htmlPath = `/publications/${slug}.html`;
      if (res.category === "project") htmlPath = `/projects/${slug}.html`;
      if (res.category === "person") htmlPath = `/people/${slug}.html`;
      if (res.category === "api") htmlPath = `/api/docs/`;

      signals.push({
        sourceUri: "/sitemap.xml",
        targetUri: pidUri,
        relation: "rs:ln (item)",
        category: (res.category as NodeCategory) || "dataset",
        label: res.title,
        sublabel: `${res.type} PID (303 Hub)`,
        specIds: ["RESOURCESYNC", "RFC_6906", "RFC_9110"]
      });

      // Conneg 303 Hub to HTML Landing / RDF Variants
      signals.push({
        sourceUri: pidUri,
        targetUri: htmlPath,
        relation: "303 Conneg [HTML, TTL, JSON-LD]",
        category: (res.category as NodeCategory) || "dataset",
        label: htmlPath,
        sublabel: "Landing Page & Profiles",
        specIds: ["RFC_9110", "RFC_8288", "RFC_6906"]
      });

      // Decoupled Linkset
      signals.push({
        sourceUri: htmlPath,
        targetUri: `/linksets/${res.id}.linkset.json`,
        relation: 'rel="linkset"',
        category: "linkset",
        label: `/linksets/${res.id}.linkset.json`,
        sublabel: "RFC 9264 JSON Linkset",
        specIds: ["RFC_9264", "RFC_8288", "RFC_6573"]
      });

      // Physical Distributions & Payloads
      if (res.distributions) {
        for (const dist of res.distributions) {
          signals.push({
            sourceUri: htmlPath,
            targetUri: dist.downloadUrl,
            relation: `rel="item" (${dist.format})`,
            category: "distribution",
            label: dist.title,
            sublabel: `${dist.format} (${dist.mediaType})`,
            specIds: dist.format === "RO-Crate" ? ["RO_CRATE", "RFC_8574", "RFC_6906"] : ["RFC_8574", "RFC_6573"]
          });
        }
      }
    }

    return signals;
  }
}
