import { Resource } from "./types";

export const RESOURCES: Resource[] = [
  {
    id: "resource-marc",
    type: "Person",
    title: "Marc Portier",
    description: "Project Manager Data Centre at Flanders Marine Institute (VLIZ).",
    properties: {
      "foaf:name": "Marc Portier",
      "foaf:mbox": "mailto:marc.portier@vliz.be",
      "schema:jobTitle": "Project Manager Data Centre",
      "foaf:knows": ["resource-cedric", "resource-laurian", "resource-katrina", "resource-joanna"],
      "schema:worksFor": "resource-vliz",
      "owl:sameAs": "https://orcid.org/0000-0002-9648-6484"
    }
  },
  {
    id: "resource-laurian",
    type: "Person",
    title: "Laurian Van Maldeghem",
    description: "Science Officer Data Centre at Flanders Marine Institute (VLIZ).",
    properties: {
      "foaf:name": "Laurian Van Maldeghem",
      "foaf:mbox": "mailto:laurian.vanmaldeghem@vliz.be",
      "schema:jobTitle": "Science Officer Data Centre",
      "foaf:knows": ["resource-marc", "resource-cedric", "resource-katrina", "resource-joanna"],
      "schema:worksFor": "resource-vliz",
      "owl:sameAs": "https://orcid.org/0000-0003-0663-5907"
    }
  },
  {
    id: "resource-cedric",
    type: "Person",
    title: "Cedric Decruw",
    description: "Data Software Engineer at Flanders Marine Institute (VLIZ).",
    properties: {
      "foaf:name": "Cedric Decruw",
      "foaf:mbox": "mailto:cedric.decruw@vliz.be",
      "schema:jobTitle": "Data Software Engineer",
      "foaf:knows": ["resource-marc", "resource-laurian", "resource-katrina", "resource-joanna"],
      "schema:worksFor": "resource-vliz",
      "owl:sameAs": "https://orcid.org/0000-0001-6387-5988"
    }
  },
  {
    id: "resource-katrina",
    type: "Person",
    title: "Katrina Exter",
    description: "Science Officer Data Centre at Flanders Marine Institute (VLIZ).",
    properties: {
      "foaf:name": "Katrina Exter",
      "foaf:mbox": "mailto:katrina.exter@vliz.be",
      "schema:jobTitle": "Science Officer Data Centre",
      "foaf:knows": ["resource-marc", "resource-laurian", "resource-cedric", "resource-joanna"],
      "schema:worksFor": "resource-vliz",
      "owl:sameAs": "https://orcid.org/0000-0002-5911-1536"
    }
  },
  {
    id: "resource-joanna",
    type: "Person",
    title: "Joanna Goley",
    description: "Science Officer Data Centre at Flanders Marine Institute (VLIZ).",
    properties: {
      "foaf:name": "Joanna Goley",
      "foaf:mbox": "mailto:joanna.goley@vliz.be",
      "schema:jobTitle": "Science Officer Data Centre",
      "foaf:knows": ["resource-marc", "resource-laurian", "resource-cedric", "resource-katrina"],
      "schema:worksFor": "resource-vliz",
      "owl:sameAs": "https://orcid.org/0000-0002-4242-8553"
    }
  },
  {
    id: "resource-vliz",
    type: "Organization",
    title: "Flanders Marine Institute (VLIZ)",
    description: "A research institute focused on marine data, hosting scientific databases and semantic technologies.",
    properties: {
      "schema:name": "Flanders Marine Institute (VLIZ)",
      "schema:url": "https://www.vliz.be",
      "schema:location": "Jacobsenstraat 1, 8400 Oostende, Belgium",
      "schema:member": ["resource-marc", "resource-laurian", "resource-cedric", "resource-katrina", "resource-joanna"],
      "owl:sameAs": "https://marineinfo.org/id/institute/36"
    }
  },
  {
    id: "resource-arms-mbon",
    type: "Dataset",
    title: "ARMS-MBON data on long-term monitoring of hard-bottom communities: 18S results from 2018-2020",
    description: "A genomic monitoring dataset documenting marine biodiversity in hard-bottom communities using genetic markers.",
    properties: {
      "schema:name": "ARMS-MBON Metagenomic Dataset",
      "schema:license": "https://creativecommons.org/licenses/by/4.0/",
      "schema:creator": ["resource-katrina", "resource-marc", "resource-cedric", "resource-laurian"],
      "schema:publisher": "resource-vliz",
      "prov:wasDerivedFrom": "resource-arms-2018",
      "schema:distribution": "http://localhost:8080/api/resource-arms-mbon",
      "owl:sameAs": "https://marineinfo.org/id/dataset/8617"
    }
  },
  {
    id: "resource-arms-2018",
    type: "Dataset",
    title: "ARMS 2018 dataset on long-term monitoring and biodiversity assessment of invasive and indigenous hard-bottom communities",
    description: "Initial raw community monitoring dataset from autonomous reef monitoring structures.",
    properties: {
      "schema:name": "Raw ARMS 2018 Dataset",
      "schema:creator": ["resource-katrina", "resource-marc"],
      "prov:wasGeneratedBy": "resource-maregraph",
      "owl:sameAs": "https://marineinfo.org/id/dataset/6405"
    }
  },
  {
    id: "resource-lod-harvester",
    type: "Software",
    title: "LOD Harvester Bot",
    description: "An open-source, high-efficiency crawler for discovering linked metadata.",
    properties: {
      "schema:name": "LOD Harvester Bot",
      "schema:softwareVersion": "v2.0.0",
      "schema:programmingLanguage": "TypeScript",
      "schema:codeRepository": "https://github.com/vliz-be-opsci/lod-harvester",
      "owl:sameAs": "resource-lod-harvester-mirror"
    }
  },
  {
    id: "resource-lod-harvester-mirror",
    type: "Software",
    title: "LOD Harvester (Mirror URI)",
    description: "Alternate URI identifier for the LOD Harvester software.",
    properties: {
      "schema:name": "LOD Harvester (Mirror)",
      "owl:sameAs": "resource-lod-harvester"
    }
  },
  {
    id: "resource-ro-crate-paper",
    type: "ResearchPaper",
    title: "Contemporary data management for biodiversity observation networks leading to linked open data publishing through distributed techniques applying RO-Crate and GitHub actions",
    description: "A paper detailing contemporary Linked Open Data publishing workflows using RO-Crates.",
    properties: {
      "schema:headline": "Contemporary data management for biodiversity observation networks",
      "schema:author": ["resource-marc", "resource-cedric", "resource-katrina", "resource-laurian"],
      "schema:datePublished": "2022-10-12",
      "schema:about": "resource-arms-mbon",
      "schema:citation": "https://doi.org/10.3897/biss.6.94630"
    }
  },
  {
    id: "resource-api",
    type: "API",
    title: "MarineInfo API",
    description: "REST and hypermedia API for querying marine information and metadata catalogs.",
    properties: {
      "schema:name": "MarineInfo API",
      "schema:endpointUrl": "https://marineinfo.org/api",
      "schema:potentialAction": "QueryMetadata"
    }
  },
  {
    id: "resource-maregraph",
    type: "Project",
    title: "MAREGRAPH: towards an interoperable MARinE knowledge GRAPH",
    description: "A project aiming to construct an interoperable semantic knowledge graph for marine data and metadata.",
    properties: {
      "schema:name": "MAREGRAPH Initiative",
      "schema:sponsor": "resource-vliz",
      "skos:prefLabel": "MAREGRAPH Project",
      "skos:narrower": "resource-lod-harvester",
      "owl:sameAs": "https://marineinfo.org/id/project/5484"
    }
  },
  {
    id: "resource-collection",
    type: "Collection",
    title: "MAREGRAPH Marine Datasets Collection",
    description: "A collection of research datasets and semantic artifacts aggregated under the MAREGRAPH project.",
    properties: {
      "schema:name": "MAREGRAPH Marine Datasets Collection",
      "schema:hasPart": ["resource-arms-mbon", "resource-arms-2018"],
      "skos:broader": "resource-maregraph"
    }
  }
];

export function getResourceById(id: string): Resource | undefined {
  return RESOURCES.find(r => r.id === id);
}
