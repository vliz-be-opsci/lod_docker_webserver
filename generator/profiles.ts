export interface Profile {
  id: string;
  title: string;
  description: string;
  publisher: string;
  isAtomic: boolean;
  conformsToStandard: string;
  specUrl: string;
  composedProfiles?: string[]; // IDs of sub-profiles if composite (for RT-P02)
  shaclShape: string;
  // RT-P09 Profile Evolution & Lifecycle
  version?: string;
  releaseDate?: string;
  latestVersionId?: string;
  predecessorVersionId?: string;
  successorVersionId?: string;
  abstractProfileId?: string;
}

export const PROFILES: Profile[] = [
  // -------------------------------------------------------------
  // 1. ATOMIC BASE PROFILES
  // -------------------------------------------------------------
  {
    id: "schema-dataset-profile",
    title: "Schema.org Dataset Profile",
    description: "Baseline schema.org structured data constraints for dataset discovery by global search engine crawlers.",
    publisher: "Schema.org Community Group",
    isAtomic: true,
    conformsToStandard: "https://schema.org/Dataset",
    specUrl: "https://schema.org/Dataset",
    shaclShape: `@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix schema: <https://schema.org/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

schema:DatasetShape
    a sh:NodeShape ;
    sh:targetClass schema:Dataset ;
    sh:property [
        sh:path schema:name ;
        sh:minCount 1 ;
        sh:datatype xsd:string ;
    ] ;
    sh:property [
        sh:path schema:description ;
        sh:minCount 1 ;
        sh:datatype xsd:string ;
    ] .`
  },
  {
    id: "dcat-dataset-profile",
    title: "W3C DCAT Dataset Application Profile (Abstract)",
    description: "Standard W3C Data Catalog Vocabulary application profile for open science repositories.",
    publisher: "W3C Dataset Exchange Working Group",
    isAtomic: true,
    conformsToStandard: "https://www.w3.org/TR/vocab-dcat-3/",
    specUrl: "https://www.w3.org/TR/vocab-dcat-3/",
    latestVersionId: "dcat-dataset-profile-3.0.0",
    shaclShape: `@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix dcat: <http://www.w3.org/ns/dcat#> .
@prefix dcterms: <http://purl.org/dc/terms/> .

dcat:DatasetShape
    a sh:NodeShape ;
    sh:targetClass dcat:Dataset ;
    sh:property [
        sh:path dcterms:title ;
        sh:minCount 1 ;
    ] ;
    sh:property [
        sh:path dcat:distribution ;
        sh:minCount 1 ;
    ] .`
  },
  {
    id: "dcat-dataset-profile-1.0.0",
    title: "W3C DCAT-1 AP Dataset Profile",
    description: "Initial baseline release of the DCAT application profile.",
    publisher: "W3C Dataset Exchange Working Group",
    isAtomic: true,
    version: "1.0.0",
    releaseDate: "2020-02-04",
    abstractProfileId: "dcat-dataset-profile",
    successorVersionId: "dcat-dataset-profile-2.0.0",
    conformsToStandard: "https://www.w3.org/TR/vocab-dcat-1/",
    specUrl: "https://www.w3.org/TR/vocab-dcat-1/",
    shaclShape: `@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix dcat: <http://www.w3.org/ns/dcat#> .
@prefix dcterms: <http://purl.org/dc/terms/> .

dcat:DatasetShape
    a sh:NodeShape ;
    sh:targetClass dcat:Dataset ;
    sh:property [
        sh:path dcterms:title ;
        sh:minCount 1 ;
    ] .`
  },
  {
    id: "dcat-dataset-profile-2.0.0",
    title: "W3C DCAT-2 AP Dataset Profile",
    description: "Harmonized DCAT-2 profile with dataset distributions and service linkages.",
    publisher: "W3C Dataset Exchange Working Group",
    isAtomic: true,
    version: "2.0.0",
    releaseDate: "2023-01-18",
    abstractProfileId: "dcat-dataset-profile",
    predecessorVersionId: "dcat-dataset-profile-1.0.0",
    successorVersionId: "dcat-dataset-profile-3.0.0",
    conformsToStandard: "https://www.w3.org/TR/vocab-dcat-2/",
    specUrl: "https://www.w3.org/TR/vocab-dcat-2/",
    shaclShape: `@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix dcat: <http://www.w3.org/ns/dcat#> .
@prefix dcterms: <http://purl.org/dc/terms/> .

dcat:DatasetShape
    a sh:NodeShape ;
    sh:targetClass dcat:Dataset ;
    sh:property [
        sh:path dcterms:title ;
        sh:minCount 1 ;
    ] ;
    sh:property [
        sh:path dcat:distribution ;
        sh:minCount 1 ;
    ] .`
  },
  {
    id: "dcat-dataset-profile-3.0.0",
    title: "W3C DCAT-3 AP Dataset Profile",
    description: "Standard W3C Data Catalog Vocabulary version 3 application profile for open science repositories.",
    publisher: "W3C Dataset Exchange Working Group",
    isAtomic: true,
    version: "3.0.0",
    releaseDate: "2024-08-20",
    abstractProfileId: "dcat-dataset-profile",
    predecessorVersionId: "dcat-dataset-profile-2.0.0",
    conformsToStandard: "https://www.w3.org/TR/vocab-dcat-3/",
    specUrl: "https://www.w3.org/TR/vocab-dcat-3/",
    shaclShape: `@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix dcat: <http://www.w3.org/ns/dcat#> .
@prefix dcterms: <http://purl.org/dc/terms/> .

dcat:DatasetShape
    a sh:NodeShape ;
    sh:targetClass dcat:Dataset ;
    sh:property [
        sh:path dcterms:title ;
        sh:minCount 1 ;
    ] ;
    sh:property [
        sh:path dcat:distribution ;
        sh:minCount 1 ;
    ] .`
  },
  {
    id: "dcat3-dataset-profile",
    title: "W3C DCAT-3 AP Dataset Profile",
    description: "Standard W3C Data Catalog Vocabulary version 3 application profile for open science repositories.",
    publisher: "W3C Dataset Exchange Working Group",
    isAtomic: true,
    conformsToStandard: "https://www.w3.org/TR/vocab-dcat-3/",
    specUrl: "https://www.w3.org/TR/vocab-dcat-3/",
    shaclShape: `@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix dcat: <http://www.w3.org/ns/dcat#> .
@prefix dcterms: <http://purl.org/dc/terms/> .

dcat:DatasetShape
    a sh:NodeShape ;
    sh:targetClass dcat:Dataset ;
    sh:property [
        sh:path dcterms:title ;
        sh:minCount 1 ;
    ] ;
    sh:property [
        sh:path dcat:distribution ;
        sh:minCount 1 ;
    ] .`
  },
  {
    id: "ro-crate-package-profile",
    title: "RO-Crate Research Object Archival Profile (Abstract)",
    description: "Abstract FAIR digital object package format combining contextual JSON-LD metadata with zipped data files.",
    publisher: "RO-Crate Community / BioCompute",
    isAtomic: true,
    conformsToStandard: "https://w3id.org/ro/crate",
    specUrl: "https://w3id.org/ro/crate",
    latestVersionId: "ro-crate-package-profile-1.1.0",
    shaclShape: `@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix ro: <https://w3id.org/ro/crate/> .

ro:CrateShape
    a sh:NodeShape ;
    sh:targetClass ro:RootDataset ;
    sh:property [
        sh:path ro:metadataFile ;
        sh:hasValue "ro-crate-metadata.json" ;
    ] .`
  },
  {
    id: "ro-crate-package-profile-1.0.0",
    title: "RO-Crate 1.0 Archival Profile",
    description: "Initial release of the RO-Crate archival packaging profile.",
    publisher: "RO-Crate Community / BioCompute",
    isAtomic: true,
    version: "1.0.0",
    releaseDate: "2021-04-12",
    abstractProfileId: "ro-crate-package-profile",
    successorVersionId: "ro-crate-package-profile-1.1.0",
    conformsToStandard: "https://w3id.org/ro/crate/1.0",
    specUrl: "https://w3id.org/ro/crate/1.0",
    shaclShape: `@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix ro: <https://w3id.org/ro/crate/> .

ro:CrateShape
    a sh:NodeShape ;
    sh:targetClass ro:RootDataset ;
    sh:property [
        sh:path ro:metadataFile ;
        sh:hasValue "ro-crate-metadata.json" ;
    ] .`
  },
  {
    id: "ro-crate-package-profile-1.1.0",
    title: "RO-Crate 1.1 Research Object Archival Profile",
    description: "Standardized RO-Crate 1.1 profile with strict entity typing and computational workflow metadata support.",
    publisher: "RO-Crate Community / BioCompute",
    isAtomic: true,
    version: "1.1.0",
    releaseDate: "2023-10-25",
    abstractProfileId: "ro-crate-package-profile",
    predecessorVersionId: "ro-crate-package-profile-1.0.0",
    conformsToStandard: "https://w3id.org/ro/crate/1.1",
    specUrl: "https://w3id.org/ro/crate/1.1",
    shaclShape: `@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix ro: <https://w3id.org/ro/crate/> .

ro:CrateShape
    a sh:NodeShape ;
    sh:targetClass ro:RootDataset ;
    sh:property [
        sh:path ro:metadataFile ;
        sh:hasValue "ro-crate-metadata.json" ;
    ] .`
  },
  {
    id: "darwin-core-occurrence-profile",
    title: "Darwin Core Marine Biodiversity Occurrence Profile",
    description: "Biodiversity Information Standards (TDWG) schema for taxon occurrences and metabarcoding read matrices.",
    publisher: "Biodiversity Information Standards (TDWG) / OBIS",
    isAtomic: true,
    conformsToStandard: "http://rs.tdwg.org/dwc/terms/",
    specUrl: "https://dwc.tdwg.org/",
    shaclShape: `@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix dwc: <http://rs.tdwg.org/dwc/terms/> .

dwc:OccurrenceShape
    a sh:NodeShape ;
    sh:targetClass dwc:Occurrence ;
    sh:property [
        sh:path dwc:scientificName ;
        sh:minCount 1 ;
    ] ;
    sh:property [
        sh:path dwc:decimalLatitude ;
        sh:minCount 1 ;
    ] .`
  },
  {
    id: "sensor-telemetry-timeseries-profile",
    title: "Ocean Buoy Sensor Telemetry Time-Series Profile",
    description: "High-frequency oceanographic observations including temperature, salinity, and wave height time-series.",
    publisher: "LifeWatch / VLIZ Sensor Observatory",
    isAtomic: true,
    conformsToStandard: "https://www.ogc.org/standard/om/",
    specUrl: "https://lifewatch.be/data/north-sea-buoys",
    shaclShape: `@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix sosa: <http://www.w3.org/ns/sosa/> .

sosa:ObservationShape
    a sh:NodeShape ;
    sh:targetClass sosa:Observation ;
    sh:property [
        sh:path sosa:hasSimpleResult ;
        sh:minCount 1 ;
    ] .`
  },

  // -------------------------------------------------------------
  // 2. COMPOSITE PROFILES (Implementing RT-P02 via rel="item")
  // -------------------------------------------------------------
  {
    id: "marine-genomic-dataset-profile",
    title: "Marine Genomic & Metabarcoding Dataset Composite Profile",
    description: "Composite profile for marine eDNA/metagenomic datasets (such as ARMS-MBON). Composes Schema.org, DCAT-3, RO-Crate 1.1, and Darwin Core Occurrence profiles.",
    publisher: "Flanders Marine Institute (VLIZ) Open Science",
    isAtomic: false,
    conformsToStandard: "https://www.w3.org/TR/dx-prof/",
    specUrl: "https://github.com/eosc-semantic-interop/if-solutions-proposals/blob/main/proposals/radical-transparency/linkset-usage-patterns/02-profile-composition.md",
    composedProfiles: [
      "schema-dataset-profile",
      "dcat3-dataset-profile",
      "ro-crate-package-profile",
      "darwin-core-occurrence-profile"
    ],
    shaclShape: `@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix vliz: <https://marineinfo.org/profiles/> .

vliz:MarineGenomicShape
    a sh:NodeShape ;
    sh:and (
        <https://schema.org/DatasetShape>
        <http://www.w3.org/ns/dcat#DatasetShape>
        <https://w3id.org/ro/crate/CrateShape>
        <http://rs.tdwg.org/dwc/terms/OccurrenceShape>
    ) .`
  },
  {
    id: "marine-ecological-baseline-profile",
    title: "Marine Ecological Baseline Composite Profile",
    description: "Composite profile for long-term marine community monitoring datasets (such as ARMS-2018). Composes Schema.org, DCAT-3, and Darwin Core profiles.",
    publisher: "Flanders Marine Institute (VLIZ) Open Science",
    isAtomic: false,
    conformsToStandard: "https://www.w3.org/TR/dx-prof/",
    specUrl: "https://github.com/eosc-semantic-interop/if-solutions-proposals/blob/main/proposals/radical-transparency/linkset-usage-patterns/02-profile-composition.md",
    composedProfiles: [
      "schema-dataset-profile",
      "dcat3-dataset-profile",
      "darwin-core-occurrence-profile"
    ],
    shaclShape: `@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix vliz: <https://marineinfo.org/profiles/> .

vliz:MarineEcologicalShape
    a sh:NodeShape ;
    sh:and (
        <https://schema.org/DatasetShape>
        <http://www.w3.org/ns/dcat#DatasetShape>
        <http://rs.tdwg.org/dwc/terms/OccurrenceShape>
    ) .`
  },
  {
    id: "marine-buoy-telemetry-profile",
    title: "Marine Buoy & Sensor Telemetry Composite Profile",
    description: "Composite profile for live and archival buoy telemetry streams. Composes Schema.org, DCAT-3, and Sensor Telemetry profiles.",
    publisher: "LifeWatch / VLIZ Sensor Network",
    isAtomic: false,
    conformsToStandard: "https://www.w3.org/TR/dx-prof/",
    specUrl: "https://github.com/eosc-semantic-interop/if-solutions-proposals/blob/main/proposals/radical-transparency/linkset-usage-patterns/02-profile-composition.md",
    composedProfiles: [
      "schema-dataset-profile",
      "dcat3-dataset-profile",
      "sensor-telemetry-timeseries-profile"
    ],
    shaclShape: `@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix vliz: <https://marineinfo.org/profiles/> .

vliz:MarineTelemetryShape
    a sh:NodeShape ;
    sh:and (
        <https://schema.org/DatasetShape>
        <http://www.w3.org/ns/dcat#DatasetShape>
        <http://www.w3.org/ns/sosa/ObservationShape>
    ) .`
  }
];

export function getProfileById(id: string): Profile | undefined {
  return PROFILES.find(p => p.id === id);
}
