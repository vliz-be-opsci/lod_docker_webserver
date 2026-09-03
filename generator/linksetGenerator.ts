import { MarineEntity, getEntityTypeSlug, getEntityNameSlug, getEntityHtmlPath, getEntityIdPath } from "./types";
import { expandUri } from "./rdfSerializer";
import { getResourceById } from "./resources";

export function generateApiServiceLinkset(resource: MarineEntity, baseUrl: string): object {
  const datasetPid = resource.properties?.["dcat:servesDataset"]
    ? expandUri(resource.properties["dcat:servesDataset"], baseUrl)
    : `${baseUrl}/id/dataset/arms-mbon`;

  return {
    linkset: [
      {
        anchor: `${baseUrl}/api/observations/v1`,
        "cite-as": [
          { href: datasetPid }
        ],
        "api-catalog": [
          { href: `${baseUrl}/.well-known/api-catalog` }
        ],
        "service-desc": [
          {
            href: `${baseUrl}/api/observations/v1/openapi.json`,
            type: "application/json",
            profile: "https://www.openapis.org/#profile"
          }
        ],
        "service-doc": [
          {
            href: `${baseUrl}/api/observations/v1/docs/`,
            type: "text/html"
          }
        ],
        "service-meta": [
          {
            href: `${baseUrl}/api/observations/v1/meta.ttl`,
            type: "text/turtle"
          }
        ]
      }
    ]
  };
}

export function generateLinkset(resource: MarineEntity, baseUrl: string): object {
  if (resource.category === "service" || resource.category === "api") {
    return generateApiServiceLinkset(resource, baseUrl);
  }

  const resourceUri = expandUri(resource.id, baseUrl);
  const typeSlug = getEntityTypeSlug(resource);
  const nameSlug = getEntityNameSlug(resource);
  const idPath = getEntityIdPath(resource);

  const typeUri = resource.type === "Dataset" ? "https://schema.org/Dataset" : `https://schema.org/${resource.type}`;

  const localDoiUri = resource.doi && resource.doi.startsWith("https://doi.org/")
    ? `${baseUrl}/doi/${resource.doi.replace("https://doi.org/", "")}`
    : undefined;

  const primaryObj: any = {
    anchor: resourceUri,
    alternate: [
      { href: `${baseUrl}${idPath}.ttl`, type: "text/turtle; charset=utf-8" },
      { href: `${baseUrl}${idPath}.jsonld`, type: "application/ld+json" },
      { href: `${baseUrl}${idPath}.html`, type: "text/html; charset=utf-8" },
      { href: `${baseUrl}${idPath}.rdf`, type: "application/rdf+xml" }
    ],
    ...(localDoiUri ? { "cite-as": [{ href: localDoiUri }] } : {})
  };

  if (resource.type) {
    primaryObj.type = [{ href: typeUri }];
  }

  if (resource.profileId) {
    primaryObj.profile = [
      { href: `${baseUrl}/id/profile/${resource.profileId}` }
    ];
  }

  // RT-P09 Lifecycle & Release Links
  if (resource.latestVersionId) {
    primaryObj["latest-version"] = [{ href: expandUri(resource.latestVersionId, baseUrl) }];
    primaryObj["version-history"] = [{ href: `${baseUrl}${idPath}/history` }];
  }
  if (resource.seriesId) {
    const seriesRes = getResourceById(resource.seriesId);
    const seriesUri = seriesRes ? expandUri(seriesRes.id, baseUrl) : `${baseUrl}/id/${typeSlug}/${getEntityNameSlug(resource.seriesId)}`;
    primaryObj.collection = [{ href: seriesUri }];
    primaryObj["version-history"] = [{ href: `${seriesUri}/history` }];
    if (resource.predecessorVersionId) {
      primaryObj["predecessor-version"] = [{ href: expandUri(resource.predecessorVersionId, baseUrl) }];
    }
    if (resource.successorVersionId) {
      primaryObj["successor-version"] = [{ href: expandUri(resource.successorVersionId, baseUrl) }];
    }
  }

  // Showcase RT-P08 (Large Linkset Split-Up) on arms-mbon
  if (nameSlug === "arms-mbon") {
    primaryObj.linkset = [
      { href: `${baseUrl}/id/${typeSlug}/${nameSlug}.conneg.linkset.json`, title: "Content Negotiation Variants Linkset" },
      { href: `${baseUrl}/id/${typeSlug}/${nameSlug}.profiles.linkset.json`, title: "Profiles & Conformance Linkset" },
      { href: `${baseUrl}/id/${typeSlug}/${nameSlug}.provenance.linkset.json`, title: "Provenance & Attribution Linkset" }
    ];
  } else if (resource.distributions && resource.distributions.length > 0) {
    primaryObj.item = resource.distributions.map(d => ({
      href: d.downloadUrl.startsWith("http") ? d.downloadUrl : `${baseUrl}${d.downloadUrl}`,
      type: d.mediaType,
      title: d.title
    }));
  }

  return {
    linkset: [
      primaryObj,
      {
        anchor: `${baseUrl}${idPath}.ttl`,
        self: [{ href: resourceUri }],
        ...(localDoiUri ? { "cite-as": [{ href: localDoiUri }] } : {})
      },
      {
        anchor: `${baseUrl}${idPath}.jsonld`,
        self: [{ href: resourceUri }],
        ...(localDoiUri ? { "cite-as": [{ href: localDoiUri }] } : {})
      },
      {
        anchor: `${baseUrl}${idPath}.html`,
        self: [{ href: resourceUri }],
        ...(localDoiUri ? { "cite-as": [{ href: localDoiUri }] } : {})
      },
      {
        anchor: `${baseUrl}${idPath}.rdf`,
        self: [{ href: resourceUri }],
        ...(localDoiUri ? { "cite-as": [{ href: localDoiUri }] } : {})
      }
    ]
  };
}

export function generateHistoryLinkset(series: MarineEntity, releases: MarineEntity[], baseUrl: string): object {
  const seriesUri = expandUri(series.id, baseUrl);
  const idPath = getEntityIdPath(series);
  const historyUri = `${baseUrl}${idPath}/history`;

  return {
    linkset: [
      {
        anchor: historyUri,
        collection: [{ href: seriesUri }],
        item: releases.map(rel => ({
          href: expandUri(rel.id, baseUrl),
          version: rel.version,
          "release-date": rel.releaseDate,
          title: rel.title
        }))
      }
    ]
  };
}

export function generateSplitLinksets(resource: MarineEntity, baseUrl: string): Record<string, object> {
  const resourceUri = expandUri(resource.id, baseUrl);
  const typeSlug = getEntityTypeSlug(resource);
  const nameSlug = getEntityNameSlug(resource);
  const masterLinksetUri = `${baseUrl}/id/${typeSlug}/${nameSlug}.linkset.json`;
  const localDoiUri = resource.doi && resource.doi.startsWith("https://doi.org/")
    ? `${baseUrl}/doi/${resource.doi.replace("https://doi.org/", "")}`
    : undefined;

  return {
    conneg: {
      linkset: [
        {
          anchor: resourceUri,
          self: [{ href: `${baseUrl}/id/${typeSlug}/${nameSlug}.conneg.linkset.json` }],
          collection: [{ href: masterLinksetUri }],
          alternate: [
            { href: `${baseUrl}/id/${typeSlug}/${nameSlug}.ttl`, type: "text/turtle; charset=utf-8" },
            { href: `${baseUrl}/id/${typeSlug}/${nameSlug}.jsonld`, type: "application/ld+json" },
            { href: `${baseUrl}/id/${typeSlug}/${nameSlug}.html`, type: "text/html; charset=utf-8" },
            { href: `${baseUrl}/id/${typeSlug}/${nameSlug}.rdf`, type: "application/rdf+xml" }
          ],
          ...(localDoiUri ? { "cite-as": [{ href: localDoiUri }] } : {})
        },
        {
          anchor: `${baseUrl}/id/${typeSlug}/${nameSlug}.ttl`,
          self: [{ href: resourceUri }],
          ...(localDoiUri ? { "cite-as": [{ href: localDoiUri }] } : {})
        },
        {
          anchor: `${baseUrl}/id/${typeSlug}/${nameSlug}.jsonld`,
          self: [{ href: resourceUri }],
          ...(localDoiUri ? { "cite-as": [{ href: localDoiUri }] } : {})
        },
        {
          anchor: `${baseUrl}/id/${typeSlug}/${nameSlug}.html`,
          self: [{ href: resourceUri }],
          ...(localDoiUri ? { "cite-as": [{ href: localDoiUri }] } : {})
        },
        {
          anchor: `${baseUrl}/id/${typeSlug}/${nameSlug}.rdf`,
          self: [{ href: resourceUri }],
          ...(localDoiUri ? { "cite-as": [{ href: localDoiUri }] } : {})
        }
      ]
    },
    profiles: {
      linkset: [
        {
          anchor: resourceUri,
          self: [{ href: `${baseUrl}/id/${typeSlug}/${nameSlug}.profiles.linkset.json` }],
          collection: [{ href: masterLinksetUri }],
          profile: resource.profileId ? [{ href: `${baseUrl}/id/profile/${resource.profileId}` }] : []
        }
      ]
    },
    provenance: {
      linkset: [
        {
          anchor: resourceUri,
          self: [{ href: `${baseUrl}/id/${typeSlug}/${nameSlug}.provenance.linkset.json` }],
          collection: [{ href: masterLinksetUri }],
          author: [{ href: `${baseUrl}/id/person/katrina` }],
          publisher: [{ href: `${baseUrl}/id/institute/vliz` }],
          "http://schema.org/isPartOf": [{ href: `${baseUrl}/id/project/maregraph` }]
        }
      ]
    }
  };
}

export function generateApiCatalog(baseUrl: string): object {
  return {
    linkset: [
      {
        anchor: `${baseUrl}/.well-known/api-catalog`,
        item: [
          {
            href: `${baseUrl}/api/observations/v1`
          }
        ],
        alternate: [
          {
            href: `${baseUrl}/sitemap-catalog.xml`,
            type: "application/xml"
          }
        ]
      }
    ]
  };
}
