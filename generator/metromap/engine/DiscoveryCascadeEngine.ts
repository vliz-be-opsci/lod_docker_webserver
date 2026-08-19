import { Resource, getEntityTypeSlug, getEntityNameSlug, getEntityIdPath, getEntityHtmlPath } from "../../types";
import { NodeCategory } from "../models/MetroNode";
import { PROFILES, getProfileById } from "../../profiles";

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
      { sourceUri: "/sitemap.xml", targetUri: "/catalog/dcat.ttl", relation: "rs:ln (dcat-catalog)", category: "domain", label: "/sitemap.xml", sublabel: "Signmap Index", specIds: ["RESOURCESYNC", "DCAT_3"] },
      { sourceUri: "/sitemap.xml", targetUri: "/id/profiles", relation: "rs:ln (profiles)", category: "profile", label: "/id/profiles", sublabel: "Semantic Profiles Registry", specIds: ["RESOURCESYNC", "RFC_6906"] }
    );

    // 2. Primary Featured Entities Corridor (Clean, non-cluttered topology)
    const featuredResources = this.resources.filter(r => 
      r.id === "resource-arms-mbon" || 
      r.id === "resource-arms-2018" || 
      r.id === "resource-north-sea-sensors" || 
      r.id === "resource-vliz" || 
      r.id === "resource-ro-crate-paper" ||
      r.id === "resource-eurobis-occurrences" ||
      r.category === "service" ||
      r.category === "api"
    );

    for (const res of featuredResources) {
      const typeSlug = getEntityTypeSlug(res);
      const nameSlug = getEntityNameSlug(res);
      const pidUri = getEntityIdPath(res);
      const htmlPath = getEntityHtmlPath(res);

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

      // Profile Declaration (RT-P01) & Composition (RT-P02)
      if (res.profileId) {
        const profileUri = `/id/profile/${res.profileId}.html`;
        const profileObj = getProfileById(res.profileId);
        signals.push({
          sourceUri: htmlPath,
          targetUri: profileUri,
          relation: 'rel="profile"',
          category: "profile",
          label: profileObj?.title || res.profileId,
          sublabel: "Composite Profile (RT-P01)",
          specIds: ["RFC_6906", "RFC_8288"]
        });

        if (profileObj && profileObj.composedProfiles) {
          for (const subId of profileObj.composedProfiles) {
            const subProfile = getProfileById(subId);
            signals.push({
              sourceUri: profileUri,
              targetUri: `/id/profile/${subId}.html`,
              relation: 'rel="item" (RT-P02)',
              category: "profile",
              label: subProfile?.title || subId,
              sublabel: "Composed Sub-Profile",
              specIds: ["RFC_6906", "RFC_6573"]
            });
          }
        }
      }

      // Decoupled Co-located Linkset
      signals.push({
        sourceUri: htmlPath,
        targetUri: `/id/${typeSlug}/${nameSlug}.linkset.json`,
        relation: 'rel="linkset"',
        category: "linkset",
        label: `/id/${typeSlug}/${nameSlug}.linkset.json`,
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
