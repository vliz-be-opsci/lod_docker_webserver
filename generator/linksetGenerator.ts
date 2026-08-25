import { MarineEntity, getEntityTypeSlug, getEntityNameSlug, getEntityHtmlPath } from "./types";
import { expandUri } from "./rdfSerializer";

export function generateApiServiceLinkset(resource: MarineEntity, baseUrl: string): object {
  const datasetPid = resource.properties?.["dcat:servesDataset"]
    ? expandUri(resource.properties["dcat:servesDataset"], baseUrl)
    : `${baseUrl}/id/dataset/arms-mbon`;

  return {
    linkset: [
      {
        anchor: `${baseUrl}/api/v1/observations`,
        "cite-as": [
          { href: datasetPid }
        ],
        "api-catalog": [
          { href: `${baseUrl}/.well-known/api-catalog` }
        ],
        "service-desc": [
          {
            href: `${baseUrl}/api/openapi.json`,
            type: "application/json",
            profile: "https://www.openapis.org/#profile"
          }
        ],
        "service-doc": [
          {
            href: `${baseUrl}/api/docs/`,
            type: "text/html"
          }
        ],
        "service-meta": [
          {
            href: `${baseUrl}/id/service/marineinfo-api.ttl`,
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

  const typeUri = resource.type === "Dataset" ? "https://schema.org/Dataset" : `https://schema.org/${resource.type}`;

  const primaryObj: any = {
    anchor: resourceUri,
    alternate: [
      { href: `${baseUrl}/id/${typeSlug}/${nameSlug}.ttl`, type: "text/turtle; charset=utf-8" },
      { href: `${baseUrl}/id/${typeSlug}/${nameSlug}.jsonld`, type: "application/ld+json" },
      { href: `${baseUrl}/id/${typeSlug}/${nameSlug}.html`, type: "text/html; charset=utf-8" },
      { href: `${baseUrl}/id/${typeSlug}/${nameSlug}.rdf`, type: "application/rdf+xml" }
    ]
  };

  if (resource.type) {
    primaryObj.type = [{ href: typeUri }];
  }

  if (resource.profileId) {
    primaryObj.profile = [
      { href: `${baseUrl}/id/profile/${resource.profileId}` }
    ];
  }

  // Showcase RT-P08 (Large Linkset Split-Up) on arms-mbon
  if (nameSlug === "arms-mbon") {
    primaryObj.item = [
      { href: `${baseUrl}/id/${typeSlug}/${nameSlug}.conneg.linkset.json`, title: "Content Negotiation Variants Linkset" },
      { href: `${baseUrl}/id/${typeSlug}/${nameSlug}.profiles.linkset.json`, title: "Profiles & Conformance Linkset" },
      { href: `${baseUrl}/id/${typeSlug}/${nameSlug}.provenance.linkset.json`, title: "Provenance & Attribution Linkset" }
    ];
  }

  return {
    linkset: [
      primaryObj,
      {
        anchor: `${baseUrl}/id/${typeSlug}/${nameSlug}.ttl`,
        self: [{ href: resourceUri }]
      },
      {
        anchor: `${baseUrl}/id/${typeSlug}/${nameSlug}.jsonld`,
        self: [{ href: resourceUri }]
      },
      {
        anchor: `${baseUrl}/id/${typeSlug}/${nameSlug}.html`,
        self: [{ href: resourceUri }]
      },
      {
        anchor: `${baseUrl}/id/${typeSlug}/${nameSlug}.rdf`,
        self: [{ href: resourceUri }]
      }
    ]
  };
}

export function generateSplitLinksets(resource: MarineEntity, baseUrl: string): Record<string, object> {
  const resourceUri = expandUri(resource.id, baseUrl);
  const typeSlug = getEntityTypeSlug(resource);
  const nameSlug = getEntityNameSlug(resource);
  const masterLinksetUri = `${baseUrl}/id/${typeSlug}/${nameSlug}.linkset.json`;

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
          ]
        },
        {
          anchor: `${baseUrl}/id/${typeSlug}/${nameSlug}.ttl`,
          self: [{ href: resourceUri }]
        },
        {
          anchor: `${baseUrl}/id/${typeSlug}/${nameSlug}.jsonld`,
          self: [{ href: resourceUri }]
        },
        {
          anchor: `${baseUrl}/id/${typeSlug}/${nameSlug}.html`,
          self: [{ href: resourceUri }]
        },
        {
          anchor: `${baseUrl}/id/${typeSlug}/${nameSlug}.rdf`,
          self: [{ href: resourceUri }]
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
            href: `${baseUrl}/api/v1/observations`
          }
        ]
      }
    ]
  };
}
