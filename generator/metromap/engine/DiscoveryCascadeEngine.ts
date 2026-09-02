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

    // 1. Domain Discovery Corridor & RT-P07 Catalogue Assistance
    signals.push(
      { sourceUri: "/", targetUri: "/.well-known/api-catalog", relation: 'rel="api-catalog"', category: "domain", label: "Domain Root", sublabel: "RFC 8288 Link Headers", specIds: ["RFC_8288", "RFC_9727"] },
      { sourceUri: "/", targetUri: "/robots.txt", relation: "directive", category: "domain", label: "Domain Root", sublabel: "Robots Directive", specIds: ["RFC_8288"] },
      { sourceUri: "/robots.txt", targetUri: "/sitemap-index.xml", relation: "Sitemap:", category: "domain", label: "/robots.txt", sublabel: "Sitemap Index Bootstrap (RT-P07)", specIds: ["RESOURCESYNC", "RFC_8288"] },
      { sourceUri: "/sitemap-index.xml", targetUri: "/sitemap.xml", relation: "sitemap", category: "domain", label: "/sitemap-index.xml", sublabel: "Main Signmap (RT-P06)", specIds: ["RESOURCESYNC"] },
      { sourceUri: "/sitemap-index.xml", targetUri: "/sitemap-catalog.xml", relation: "sitemap", category: "domain", label: "/sitemap-index.xml", sublabel: "Catalog Sub-Sitemap (RT-P07)", specIds: ["RESOURCESYNC", "DCAT_3"] },
      { sourceUri: "/sitemap-catalog.xml", targetUri: "/.well-known/api-catalog", relation: "rs:ln (profile)", category: "domain", label: "/sitemap-catalog.xml", sublabel: "API Catalog Hub", specIds: ["RESOURCESYNC", "RFC_9727"] },
      { sourceUri: "/sitemap-catalog.xml", targetUri: "/catalog/dcat.ttl", relation: "rs:ln (alternate)", category: "domain", label: "/sitemap-catalog.xml", sublabel: "DCAT-3 Catalogue", specIds: ["RESOURCESYNC", "DCAT_3"] },
      { sourceUri: "/sitemap.xml", targetUri: "/id/profiles", relation: "rs:ln (type)", category: "profile", label: "/id/profiles", sublabel: "Semantic Profiles Registry", specIds: ["RESOURCESYNC", "RFC_6906"] }
    );

    // 2. Primary Featured Entities Corridor (Clean, non-cluttered topology)
    const featuredResources = this.resources.filter(r => 
      r.id === "resource-arms-mbon" || 
      r.id === "resource-arms-2018" || 
      r.id === "resource-north-sea-sensors" || 
      r.id === "resource-vliz" || 
      r.id === "resource-ro-crate-paper" || 
      r.id === "resource-eurobis-occurrences" ||
      r.id === "resource-dataset-90" ||
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
        relation: "rs:ln (linkset)",
        category: (res.category as NodeCategory) || "dataset",
        label: res.title,
        sublabel: `${res.type} PID (303 Hub)`,
        specIds: ["RESOURCESYNC", "RFC_6906", "RFC_9110"]
      });

      // Conneg 303 Hub to HTML Landing / RDF Variants
      signals.push({
        sourceUri: pidUri,
        targetUri: htmlPath,
        relation: "303 Conneg [HTML, TTL, JSON-LD, RDF]",
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
              relation: 'rel="http://schema.org/hasPart" (RT-P02)',
              category: "profile",
              label: subProfile?.title || subId,
              sublabel: "Composed Sub-Profile",
              specIds: ["RFC_6906", "RFC_6573"]
            });
          }
        }
      }

      // Decoupled Co-located Master Linkset
      signals.push({
        sourceUri: htmlPath,
        targetUri: `/id/${typeSlug}/${nameSlug}.linkset.json`,
        relation: 'rel="linkset"',
        category: "linkset",
        label: `/id/${typeSlug}/${nameSlug}.linkset.json`,
        sublabel: "RFC 9264 JSON Linkset",
        specIds: ["RFC_9264", "RFC_8288", "RFC_6573"]
      });

      // RT-P08 Large Linkset Split-Up (Showcase on arms-mbon)
      if (res.id === "resource-arms-mbon") {
        signals.push(
          { sourceUri: `/id/${typeSlug}/${nameSlug}.linkset.json`, targetUri: `/id/${typeSlug}/${nameSlug}.conneg.linkset.json`, relation: 'rel="item"', category: "linkset", label: "Conneg Linkset Fragment", sublabel: "RT-P08 Split", specIds: ["RFC_9264", "RFC_6573"] },
          { sourceUri: `/id/${typeSlug}/${nameSlug}.linkset.json`, targetUri: `/id/${typeSlug}/${nameSlug}.profiles.linkset.json`, relation: 'rel="item"', category: "linkset", label: "Profiles Linkset Fragment", sublabel: "RT-P08 Split", specIds: ["RFC_9264", "RFC_6573"] },
          { sourceUri: `/id/${typeSlug}/${nameSlug}.linkset.json`, targetUri: `/id/${typeSlug}/${nameSlug}.provenance.linkset.json`, relation: 'rel="item"', category: "linkset", label: "Provenance Linkset Fragment", sublabel: "RT-P08 Split", specIds: ["RFC_9264", "RFC_6573"] }
        );
      }

      // RT-P09 Release Linking & Lifecycle Signals (Showcase on Dataset 90)
      if (res.id === "resource-dataset-90") {
        signals.push(
          { sourceUri: pidUri, targetUri: "/id/dataset/dataset-90/v2.1", relation: 'rel="latest-version"', category: "dataset", label: "Dataset 90 Latest Release", sublabel: "Snapshot v2.1", specIds: ["RFC_5829", "RFC_8288"] },
          { sourceUri: pidUri, targetUri: "/id/dataset/dataset-90/history", relation: 'rel="version-history"', category: "dataset", label: "Dataset 90 History", sublabel: "Release Archive", specIds: ["RFC_5829", "RFC_8288"] },
          { sourceUri: "/id/dataset/dataset-90/history", targetUri: "/id/dataset/dataset-90/history.linkset.json", relation: 'rel="linkset"', category: "linkset", label: "History Linkset", sublabel: "RFC 9264 History", specIds: ["RFC_9264", "RFC_5829"] },
          { sourceUri: "/id/dataset/dataset-90/v2.1", targetUri: "/id/dataset/dataset-90/v2.0", relation: 'rel="predecessor-version"', category: "dataset", label: "Snapshot v2.0", sublabel: "Predecessor", specIds: ["RFC_5829"] },
          { sourceUri: "/id/dataset/dataset-90/v2.0", targetUri: "/id/dataset/dataset-90/v1.0", relation: 'rel="predecessor-version"', category: "dataset", label: "Snapshot v1.0", sublabel: "Baseline", specIds: ["RFC_5829"] }
        );
      }

      // Physical Distributions & Payloads (RT-P04)
      if (res.distributions) {
        for (const dist of res.distributions) {
          signals.push({
            sourceUri: htmlPath,
            targetUri: dist.downloadUrl,
            relation: `rel="item" (RT-P04 ${dist.format})`,
            category: "distribution",
            label: dist.title,
            sublabel: `${dist.format} (${dist.mediaType})`,
            specIds: ["RFC_8574", "RFC_8288"]
          });
        }
      }
    }

    // 3. Subsetting API Signals (RT-P05)
    signals.push(
      { sourceUri: "/.well-known/api-catalog", targetUri: "/api/observations/v1", relation: 'rel="service"', category: "api", label: "ARMS Observations API", sublabel: "Subsetting Endpoint (RT-P05)", specIds: ["RFC_9727", "OPENAPI_3"] },
      { sourceUri: "/api/observations/v1", targetUri: "/api/openapi.json", relation: 'rel="service-desc"', category: "api", label: "OpenAPI Specification", sublabel: "Schema Definition", specIds: ["OPENAPI_3"] },
      { sourceUri: "/api/observations/v1", targetUri: "/api/docs/", relation: 'rel="service-doc"', category: "api", label: "Swagger UI Docs", sublabel: "Interactive API Docs", specIds: ["OPENAPI_3"] },
      { sourceUri: "/api/observations/v1", targetUri: "/id/dataset/arms-mbon", relation: 'rel="cite-as"', category: "api", label: "Parent Dataset Anchor", sublabel: "RT-P05 Cite-As Anchor", specIds: ["RFC_8574", "RFC_8288"] }
    );

    return signals;
  }
}
