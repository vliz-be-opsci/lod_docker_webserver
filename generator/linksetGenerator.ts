import { MarineEntity, getEntityTypeSlug, getEntityNameSlug, getEntityHtmlPath } from "./types";
import { expandUri } from "./rdfSerializer";

export function generateLinkset(resource: MarineEntity, baseUrl: string): object {
  const resourceUri = expandUri(resource.id, baseUrl);
  const typeSlug = getEntityTypeSlug(resource);
  const nameSlug = getEntityNameSlug(resource);
  const htmlPath = getEntityHtmlPath(resource);

  const typeEntries: { href: string }[] = [];
  if (resource.profileId) {
    typeEntries.push({ href: `${baseUrl}/id/profile/${resource.profileId}` });
  }
  if (resource.type === "Dataset") {
    typeEntries.push({ href: "https://schema.org/Dataset" });
  } else {
    typeEntries.push({ href: `https://schema.org/${resource.type}` });
  }

  const linkObj: any = {
    anchor: resourceUri,
    self: [
      { href: resource.sourceUri || resourceUri }
    ],
    type: typeEntries,
    describedby: [
      { href: `${baseUrl}/id/${typeSlug}/${nameSlug}.ttl`, type: "text/turtle" }
    ],
    alternate: [
      { href: `${baseUrl}${htmlPath}`, type: "text/html" },
      { href: `${baseUrl}/id/${typeSlug}/${nameSlug}.jsonld`, type: "application/ld+json" },
      { href: `${baseUrl}/id/${typeSlug}/${nameSlug}.rdf`, type: "application/rdf+xml" }
    ]
  };

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
