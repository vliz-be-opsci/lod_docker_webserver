import { MarineEntity } from "./types";
import { expandUri } from "./rdfSerializer";

export function generateLinkset(resource: MarineEntity, baseUrl: string): object {
  const resourceUri = expandUri(resource.id, baseUrl);
  const profiles = resource.alternateProfiles || [
    resource.type === "Dataset" ? "https://schema.org/Dataset" :
    resource.type === "Organization" ? "https://schema.org/Organization" :
    resource.type === "ScholarlyArticle" ? "https://schema.org/ScholarlyArticle" :
    resource.type === "Person" ? "https://schema.org/Person" :
    resource.type === "Project" ? "https://schema.org/Project" :
    "https://schema.org/Thing"
  ];

  const htmlPath = 
    resource.category === "dataset" ? `/datasets/${resource.id.replace("resource-", "")}.html` :
    resource.category === "institute" ? `/institutes/${resource.id.replace("resource-", "")}.html` :
    resource.category === "publication" ? `/publications/${resource.id.replace("resource-", "")}.html` :
    resource.category === "project" ? `/projects/${resource.id.replace("resource-", "")}.html` :
    resource.category === "person" ? `/people/${resource.id.replace("resource-", "")}.html` :
    `/pages/${resource.id}.html`;

  const linkObj: any = {
    anchor: resourceUri,
    profile: profiles.map(p => ({ href: p })),
    describedby: [
      { href: `${baseUrl}/rdf/${resource.id}.ttl`, type: "text/turtle" },
      { href: `${baseUrl}/rdf/${resource.id}.jsonld`, type: "application/ld+json" },
      { href: `${baseUrl}/rdf/${resource.id}.rdf`, type: "application/rdf+xml" }
    ],
    alternate: [
      { href: `${baseUrl}${htmlPath}`, type: "text/html" }
    ],
    collection: [
      { href: `${baseUrl}/catalog/`, type: "text/html" }
    ]
  };

  if (resource.distributions && resource.distributions.length > 0) {
    linkObj.item = resource.distributions.map(dist => ({
      href: `${baseUrl}${dist.downloadUrl}`,
      type: dist.mediaType,
      ...(dist.profile ? { profile: dist.profile } : {})
    }));
  }

  if (resource.creators && resource.creators.length > 0) {
    linkObj.author = resource.creators.map(c => ({
      href: expandUri(c, baseUrl)
    }));
  }

  if (resource.publisher) {
    linkObj.publisher = [
      { href: expandUri(resource.publisher, baseUrl) }
    ];
  }

  if (resource.sourceUri) {
    linkObj["canonical"] = [
      { href: resource.sourceUri }
    ];
  }

  return {
    linkset: [linkObj]
  };
}

export function generateApiCatalog(baseUrl: string): object {
  return {
    linkset: [
      {
        anchor: `${baseUrl}/api/v1/observations`,
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
            href: `${baseUrl}/rdf/resource-marineinfo-api.ttl`,
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
