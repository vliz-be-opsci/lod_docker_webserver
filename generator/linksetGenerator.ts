import { MarineEntity, getEntityTypeSlug, getEntityNameSlug, getEntityHtmlPath } from "./types";
import { expandUri } from "./rdfSerializer";

export function generateLinkset(resource: MarineEntity, baseUrl: string): object {
  const resourceUri = expandUri(resource.id, baseUrl);
  const typeSlug = getEntityTypeSlug(resource);
  const nameSlug = getEntityNameSlug(resource);
  const htmlPath = getEntityHtmlPath(resource);

  const typeUri = resource.type === "Dataset" ? "https://schema.org/Dataset" : `https://schema.org/${resource.type}`;

  const linkObj: any = {
    anchor: resourceUri,
    self: [
      { href: resource.sourceUri || resourceUri }
    ],
    type: [
      { href: typeUri }
    ],
    describedby: [
      { href: `${baseUrl}/id/${typeSlug}/${nameSlug}.ttl`, type: "text/turtle" }
    ],
    alternate: [
      { href: `${baseUrl}${htmlPath}`, type: "text/html" },
      { href: `${baseUrl}/id/${typeSlug}/${nameSlug}.jsonld`, type: "application/ld+json" },
      { href: `${baseUrl}/id/${typeSlug}/${nameSlug}.rdf`, type: "application/rdf+xml" }
    ]
  };

  if (resource.profileId) {
    linkObj.profile = [
      { href: `${baseUrl}/id/profile/${resource.profileId}` }
    ];
  }

  // Showcase RT-P08 (Large Linkset Split-Up) on arms-mbon
  if (nameSlug === "arms-mbon") {
    linkObj.item = [
      { href: `${baseUrl}/id/${typeSlug}/${nameSlug}.conneg.linkset.json`, title: "Content Negotiation Variants Linkset" },
      { href: `${baseUrl}/id/${typeSlug}/${nameSlug}.profiles.linkset.json`, title: "Profiles & Conformance Linkset" },
      { href: `${baseUrl}/id/${typeSlug}/${nameSlug}.provenance.linkset.json`, title: "Provenance & Attribution Linkset" }
    ];
  }

  return {
    linkset: [linkObj]
  };
}

export function generateSplitLinksets(resource: MarineEntity, baseUrl: string): Record<string, object> {
  const resourceUri = expandUri(resource.id, baseUrl);
  const typeSlug = getEntityTypeSlug(resource);
  const nameSlug = getEntityNameSlug(resource);
  const htmlPath = getEntityHtmlPath(resource);
  const masterLinksetUri = `${baseUrl}/id/${typeSlug}/${nameSlug}.linkset.json`;

  return {
    conneg: {
      linkset: [
        {
          anchor: resourceUri,
          self: [{ href: `${baseUrl}/id/${typeSlug}/${nameSlug}.conneg.linkset.json` }],
          collection: [{ href: masterLinksetUri }],
          describedby: [{ href: `${baseUrl}/id/${typeSlug}/${nameSlug}.ttl`, type: "text/turtle" }],
          alternate: [
            { href: `${baseUrl}${htmlPath}`, type: "text/html" },
            { href: `${baseUrl}/id/${typeSlug}/${nameSlug}.jsonld`, type: "application/ld+json" },
            { href: `${baseUrl}/id/${typeSlug}/${nameSlug}.rdf`, type: "application/rdf+xml" }
          ]
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
        anchor: `${baseUrl}/api/v1/observations`,
        "cite-as": [
          { href: `${baseUrl}/id/dataset/arms-mbon` }
        ],
        "api-catalog": [
          { href: `${baseUrl}/.well-known/api-catalog` }
        ],
        profile: [
          { href: "https://www.rfc-editor.org/info/rfc9727" }
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
        ],
        collection: [
          {
            href: `${baseUrl}/catalog/`,
            type: "text/html"
          }
        ]
      }
    ]
  };
}
