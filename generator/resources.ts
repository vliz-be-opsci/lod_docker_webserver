import { MarineEntity } from "./types";

export const RESOURCES: MarineEntity[] = [
  // ==========================================
  // 1. DATASETS
  // ==========================================
  {
    id: "resource-arms-mbon",
    type: "Dataset",
    category: "dataset",
    title: "ARMS-MBON data on long-term monitoring of hard-bottom communities: 18S results from 2018-2020",
    description: "A genomic monitoring dataset documenting marine biodiversity in hard-bottom communities using genetic markers (18S eukaryotic metabarcoding) from autonomous reef monitoring structures across the Belgian North Sea.",
    sourceUri: "https://marineinfo.org/id/dataset/8617",
    doi: "https://doi.org/10.14284/578",
    license: "Creative Commons Attribution 4.0 International",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
    temporalCoverage: "2018-05-01/2020-10-31",
    spatialCoverage: "Belgian Part of the North Sea (BPNS)",
    spatialBoundingBox: {
      minLat: 51.20,
      maxLat: 51.55,
      minLon: 2.70,
      maxLon: 3.30
    },
    publisher: "resource-vliz",
    creators: ["resource-katrina", "resource-marc", "resource-cedric", "resource-laurian"],
    alternateProfiles: ["https://schema.org/Dataset", "https://www.w3.org/TR/vocab-dcat/"],
    properties: {
      "schema:name": "ARMS-MBON Metagenomic 18S Dataset",
      "schema:license": "https://creativecommons.org/licenses/by/4.0/",
      "schema:creator": ["resource-katrina", "resource-marc", "resource-cedric", "resource-laurian"],
      "schema:publisher": "resource-vliz",
      "prov:wasDerivedFrom": "resource-arms-2018",
      "schema:citation": "resource-ro-crate-paper",
      "owl:sameAs": "https://marineinfo.org/id/dataset/8617"
    },
    distributions: [
      {
        id: "dist-arms-mbon-csv",
        title: "18S Metabarcode Observation Table (CSV)",
        description: "Tabular observation reads by sampling event, station ID, and eukaryotic taxon.",
        mediaType: "text/csv",
        format: "CSV",
        downloadUrl: "/data/arms-mbon-18s.csv",
        byteSize: 24576
      },
      {
        id: "dist-arms-mbon-geojson",
        title: "Reef Monitoring Stations (GeoJSON)",
        description: "Geospatial coordinates and station metadata for North Sea deployment locations.",
        mediaType: "application/geo+json",
        format: "GeoJSON",
        downloadUrl: "/data/arms-mbon-stations.geojson",
        byteSize: 12288
      },
      {
        id: "dist-arms-mbon-rocrate",
        title: "Complete Research Object Crate (RO-Crate ZIP)",
        description: "Standardized RO-Crate package containing data files, provenance graph, and ro-crate-metadata.json.",
        mediaType: "application/zip",
        format: "RO-Crate",
        downloadUrl: "/data/arms-mbon-rocrate.zip",
        byteSize: 65536,
        profile: "https://w3id.org/ro/crate"
      }
    ],
    sampleData: {
      columns: ["event_id", "event_date", "station", "latitude", "longitude", "depth_m", "phylum", "class", "species", "read_count"],
      rows: [
        { event_id: "EVT-2018-01", event_date: "2018-06-14", station: "BE-NRT-01 (Ostend Port)", latitude: 51.235, longitude: 2.921, depth_m: 6.5, phylum: "Mollusca", class: "Bivalvia", species: "Mytilus edulis", read_count: 1420 },
        { event_id: "EVT-2018-02", event_date: "2018-06-14", station: "BE-NRT-01 (Ostend Port)", latitude: 51.235, longitude: 2.921, depth_m: 6.5, phylum: "Arthropoda", class: "Malacostraca", species: "Balanus crenatus", read_count: 3840 },
        { event_id: "EVT-2018-03", event_date: "2018-09-22", station: "BE-NRT-02 (Zeebrugge)", latitude: 51.355, longitude: 3.190, depth_m: 9.0, phylum: "Bryozoa", class: "Gymnolaemata", species: "Electra pilosa", read_count: 980 },
        { event_id: "EVT-2019-01", event_date: "2019-05-18", station: "BE-NRT-03 (Thorntonbank)", latitude: 51.542, longitude: 2.954, depth_m: 18.2, phylum: "Cnidaria", class: "Hydrozoa", species: "Tubularia indivisa", read_count: 2450 },
        { event_id: "EVT-2020-01", event_date: "2020-10-05", station: "BE-NRT-04 (Westhinder)", latitude: 51.383, longitude: 2.438, depth_m: 21.0, phylum: "Annelida", class: "Polychaeta", species: "Sabellaria spinulosa", read_count: 1610 }
      ]
    }
  },
  {
    id: "resource-arms-2018",
    type: "Dataset",
    category: "dataset",
    title: "ARMS 2018 dataset on long-term monitoring and biodiversity assessment of invasive and indigenous hard-bottom communities",
    description: "Initial raw community monitoring dataset from autonomous reef monitoring structures deployed on artificial hard substrates along the Belgian coastline in 2018.",
    sourceUri: "https://marineinfo.org/id/dataset/6405",
    doi: "https://doi.org/10.14284/412",
    license: "Creative Commons Attribution 4.0 International",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
    temporalCoverage: "2018-04-01/2018-11-30",
    spatialCoverage: "Belgian Coastal Waters",
    publisher: "resource-vliz",
    creators: ["resource-katrina", "resource-marc"],
    alternateProfiles: ["https://schema.org/Dataset", "https://www.w3.org/TR/vocab-dcat/"],
    properties: {
      "schema:name": "Raw ARMS 2018 Ecological Baseline",
      "schema:creator": ["resource-katrina", "resource-marc"],
      "schema:publisher": "resource-vliz",
      "prov:wasGeneratedBy": "resource-maregraph",
      "owl:sameAs": "https://marineinfo.org/id/dataset/6405"
    },
    distributions: [
      {
        id: "dist-arms-2018-csv",
        title: "Community Ecology Sampling Matrix (CSV)",
        description: "Morphological biomass, dry weight, and dominant taxon records per plate layer.",
        mediaType: "text/csv",
        format: "CSV",
        downloadUrl: "/data/arms-2018-samples.csv",
        byteSize: 18432
      }
    ],
    sampleData: {
      columns: ["sample_id", "date", "station", "plate_layer", "fraction_size", "biomass_dry_weight_g", "dominant_taxon"],
      rows: [
        { sample_id: "ARMS-18-001", date: "2018-05-15", station: "BE-NRT-01", plate_layer: "Plate 1 (Top)", fraction_size: ">2mm (Motile)", biomass_dry_weight_g: 4.82, dominant_taxon: "Carcinus maenas" },
        { sample_id: "ARMS-18-002", date: "2018-05-15", station: "BE-NRT-01", plate_layer: "Plate 2 (Mid)", fraction_size: "Sessile Scrape", biomass_dry_weight_g: 14.15, dominant_taxon: "Semibalanus balanoides" },
        { sample_id: "ARMS-18-003", date: "2018-08-20", station: "BE-NRT-02", plate_layer: "Plate 4 (Bot)", fraction_size: ">100um (Micro)", biomass_dry_weight_g: 2.10, dominant_taxon: "Nematoda sp." },
        { sample_id: "ARMS-18-004", date: "2018-11-12", station: "BE-NRT-03", plate_layer: "Plate 1 (Top)", fraction_size: ">2mm (Motile)", biomass_dry_weight_g: 8.90, dominant_taxon: "Asterias rubens" }
      ]
    }
  },
  {
    id: "resource-north-sea-sensors",
    type: "Dataset",
    category: "dataset",
    title: "Belgian North Sea Sensor & Buoy Time-Series (LifeWatch/VLIZ)",
    description: "High-frequency in-situ physical and biogeochemical water column telemetry continuously recorded by automated oceanographic buoys and acoustic stations across the Belgian Continental Shelf.",
    sourceUri: "https://lifewatch.be/data/north-sea-buoys",
    license: "Creative Commons Attribution 4.0 International",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
    temporalCoverage: "2023-01-01/present",
    spatialCoverage: "Belgian Continental Shelf (Thorntonbank, Westhinder)",
    publisher: "resource-vliz",
    creators: ["resource-cedric", "resource-marc"],
    alternateProfiles: ["https://schema.org/Dataset", "https://www.w3.org/TR/vocab-dcat/"],
    properties: {
      "schema:name": "LifeWatch North Sea In-Situ Oceanographic Telemetry",
      "schema:creator": ["resource-cedric", "resource-marc"],
      "schema:publisher": "resource-vliz",
      "owl:sameAs": "https://marineinfo.org/id/dataset/sensors-northsea"
    },
    distributions: [
      {
        id: "dist-sensors-csv",
        title: "Latest Buoy Observations (CSV)",
        description: "Aggregated time-series of sea surface temperature, salinity, oxygen, and turbidity.",
        mediaType: "text/csv",
        format: "CSV",
        downloadUrl: "/data/north-sea-sensors-latest.csv",
        byteSize: 32768
      },
      {
        id: "dist-sensors-stream",
        title: "Real-time Telemetry Feed (JSON)",
        description: "Streaming JSON telemetry array for IoT crawlers and ocean models.",
        mediaType: "application/json",
        format: "JSON",
        downloadUrl: "/data/north-sea-sensors-stream.json",
        byteSize: 20480
      }
    ],
    sampleData: {
      columns: ["timestamp", "buoy_id", "station", "sea_surface_temp_c", "salinity_psu", "turbidity_fnu", "dissolved_oxygen_mgl", "chlorophyll_a_ugl"],
      rows: [
        { timestamp: "2026-08-15T00:00:00Z", buoy_id: "BUOY-THORNTON", station: "Thorntonbank", sea_surface_temp_c: 18.4, salinity_psu: 34.2, turbidity_fnu: 3.8, dissolved_oxygen_mgl: 7.9, chlorophyll_a_ugl: 2.1 },
        { timestamp: "2026-08-15T06:00:00Z", buoy_id: "BUOY-THORNTON", station: "Thorntonbank", sea_surface_temp_c: 18.6, salinity_psu: 34.1, turbidity_fnu: 4.1, dissolved_oxygen_mgl: 8.2, chlorophyll_a_ugl: 2.4 },
        { timestamp: "2026-08-15T12:00:00Z", buoy_id: "BUOY-THORNTON", station: "Thorntonbank", sea_surface_temp_c: 19.1, salinity_psu: 34.3, turbidity_fnu: 2.9, dissolved_oxygen_mgl: 8.5, chlorophyll_a_ugl: 2.8 },
        { timestamp: "2026-08-15T18:00:00Z", buoy_id: "BUOY-WESTHINDER", station: "Westhinder", sea_surface_temp_c: 18.2, salinity_psu: 34.6, turbidity_fnu: 2.2, dissolved_oxygen_mgl: 8.0, chlorophyll_a_ugl: 1.8 }
      ]
    }
  },
  {
    id: "resource-eurobis-occurrences",
    type: "Dataset",
    category: "dataset",
    title: "EurOBIS European Marine Species Taxon Occurrences Sample",
    description: "Georeferenced occurrence records of marine species across European regional seas, validated and standardized according to the Darwin Core biodiversity data standard.",
    sourceUri: "https://www.eurobis.org/dataset/sample",
    license: "Creative Commons Attribution 4.0 International",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
    temporalCoverage: "2015-01-01/2025-12-31",
    spatialCoverage: "Southern North Sea and English Channel",
    publisher: "resource-vliz",
    creators: ["resource-laurian", "resource-joanna"],
    alternateProfiles: ["https://schema.org/Dataset", "https://www.w3.org/TR/vocab-dcat/"],
    properties: {
      "schema:name": "EurOBIS Marine Species Occurrence Dataset",
      "schema:creator": ["resource-laurian", "resource-joanna"],
      "schema:publisher": "resource-vliz",
      "owl:sameAs": "https://marineinfo.org/id/dataset/eurobis-sample"
    },
    distributions: [
      {
        id: "dist-eurobis-geojson",
        title: "Species Taxon Coordinates (GeoJSON)",
        description: "Geographic points with scientific taxon names and occurrence status.",
        mediaType: "application/geo+json",
        format: "GeoJSON",
        downloadUrl: "/data/eurobis-occurrences.geojson",
        byteSize: 28672
      },
      {
        id: "dist-eurobis-dwca",
        title: "Darwin Core Archive Package (DwC-A ZIP)",
        description: "Standard biodiversity archive containing occurrence.txt and EML metadata.",
        mediaType: "application/zip",
        format: "DwC-A",
        downloadUrl: "/data/eurobis-dwca-sample.zip",
        byteSize: 45056
      }
    ],
    sampleData: {
      columns: ["occurrence_id", "scientific_name", "aphia_id", "event_date", "latitude", "longitude", "basis_of_record", "individual_count"],
      rows: [
        { occurrence_id: "OBIS:BE:09211", scientific_name: "Crangon crangon", aphia_id: 107575, event_date: "2024-04-12", latitude: 51.240, longitude: 2.890, basis_of_record: "HumanObservation", individual_count: 85 },
        { occurrence_id: "OBIS:BE:09212", scientific_name: "Gadus morhua", aphia_id: 126436, event_date: "2024-04-12", latitude: 51.450, longitude: 2.780, basis_of_record: "TrawlSample", individual_count: 12 },
        { occurrence_id: "OBIS:BE:09213", scientific_name: "Phocoena phocoena", aphia_id: 137117, event_date: "2024-06-03", latitude: 51.310, longitude: 3.050, basis_of_record: "VisualSighting", individual_count: 3 },
        { occurrence_id: "OBIS:BE:09214", scientific_name: "Ensis directus", aphia_id: 140733, event_date: "2024-07-19", latitude: 51.190, longitude: 2.720, basis_of_record: "BenthicCore", individual_count: 24 }
      ]
    }
  },

  // ==========================================
  // 2. INSTITUTES / ORGANIZATIONS
  // ==========================================
  {
    id: "resource-vliz",
    type: "Organization",
    category: "institute",
    title: "Flanders Marine Institute (VLIZ)",
    description: "A center of excellence for marine research, data management, and ocean observation in Flanders, Belgium. VLIZ hosts world-class marine databases (EurOBIS, WoRMS, MarineInfo) and develops Linked Open Data infrastructure for open science.",
    sourceUri: "https://marineinfo.org/id/institute/36",
    doi: "https://ror.org/0496xx721",
    properties: {
      "schema:name": "Flanders Marine Institute (VLIZ)",
      "schema:url": "https://www.vliz.be",
      "schema:location": "Jacobsenstraat 1, 8400 Oostende, Belgium",
      "schema:member": ["resource-marc", "resource-laurian", "resource-cedric", "resource-katrina", "resource-joanna"],
      "owl:sameAs": "https://marineinfo.org/id/institute/36"
    }
  },

  // ==========================================
  // 3. PUBLICATIONS
  // ==========================================
  {
    id: "resource-rt-position-paper",
    type: "ScholarlyArticle",
    category: "publication",
    title: "Radical Transparency: Practical Interoperability in a Diverse World",
    description: "The foundational position paper by Marc Portier (VLIZ) defining the Radical Transparency web architecture, bootstrap-interoperability principles, and the 10 Linkset Usage Patterns (LSUP) for FAIR data and services.",
    sourceUri: "https://open-science.vliz.be/papers/2026-radical-transparency-position/2026-radical-transparency-position.pdf",
    doi: "https://open-science.vliz.be/papers/2026-radical-transparency-position/",
    properties: {
      "schema:headline": "Radical Transparency: Practical Interoperability in a Diverse World",
      "schema:author": ["resource-marc"],
      "schema:datePublished": "2026-08-12",
      "schema:publisher": "resource-vliz",
      "schema:citation": "https://open-science.vliz.be/papers/2026-radical-transparency-position/2026-radical-transparency-position.pdf",
      "owl:sameAs": "https://open-science.vliz.be/papers/2026-radical-transparency-position/2026-radical-transparency-position.pdf"
    },
    distributions: [
      {
        id: "dist-rt-paper-pdf",
        title: "Official Position Paper (PDF)",
        description: "Official PDF publication defining Radical Transparency and Linkset Usage Patterns.",
        mediaType: "application/pdf",
        format: "PDF",
        downloadUrl: "https://open-science.vliz.be/papers/2026-radical-transparency-position/2026-radical-transparency-position.pdf",
        byteSize: 350000
      }
    ]
  },
  {
    id: "resource-ro-crate-paper",
    type: "ScholarlyArticle",
    category: "publication",
    title: "Contemporary data management for biodiversity observation networks leading to linked open data publishing through distributed techniques applying RO-Crate and GitHub actions",
    description: "A peer-reviewed scientific paper documenting modern Linked Open Data publishing workflows for marine observation networks using RO-Crates, schema.org profiles, and automated GitHub Actions pipelines.",
    sourceUri: "https://doi.org/10.3897/biss.6.94630",
    doi: "https://doi.org/10.3897/biss.6.94630",
    properties: {
      "schema:headline": "Contemporary data management for biodiversity observation networks",
      "schema:author": ["resource-marc", "resource-cedric", "resource-katrina", "resource-laurian"],
      "schema:datePublished": "2022-10-12",
      "schema:publisher": "Pensoft Publishers",
      "schema:about": "resource-arms-mbon",
      "schema:citation": "https://doi.org/10.3897/biss.6.94630",
      "owl:sameAs": "https://doi.org/10.3897/biss.6.94630"
    },
    distributions: [
      {
        id: "dist-paper-pdf",
        title: "Full Publication Document (PDF)",
        description: "Official published open-access scientific article.",
        mediaType: "application/pdf",
        format: "PDF",
        downloadUrl: "/data/ro-crate-paper.pdf",
        byteSize: 210597
      }
    ]
  },

  // ==========================================
  // 4. PROJECTS
  // ==========================================
  {
    id: "resource-maregraph",
    type: "Project",
    category: "project",
    title: "MAREGRAPH: towards an interoperable MARinE knowledge GRAPH",
    description: "A strategic marine research initiative to build an interconnected semantic knowledge graph for marine observations, biodiversity, and sensor streams adhering to FAIR and Radical Transparency protocols.",
    sourceUri: "https://marineinfo.org/id/project/5484",
    properties: {
      "schema:name": "MAREGRAPH Initiative",
      "schema:sponsor": "resource-vliz",
      "skos:prefLabel": "MAREGRAPH Project",
      "schema:hasPart": ["resource-arms-mbon", "resource-arms-2018", "resource-north-sea-sensors"],
      "owl:sameAs": "https://marineinfo.org/id/project/5484"
    }
  },

  // ==========================================
  // 5. APIS / DATA SERVICES
  // ==========================================
  {
    id: "resource-marineinfo-api",
    type: "DataService",
    category: "api",
    title: "MarineInfo Subsetting & Observation API",
    description: "An OpenAPI 3.0-compliant data service supporting parameterized subsetting queries for marine biodiversity, ARMS genomic monitoring, and buoy telemetry observations.",
    sourceUri: "https://marineinfo.org/api",
    properties: {
      "schema:name": "MarineInfo API",
      "schema:endpointUrl": "http://localhost:8080/api/v1/observations",
      "schema:potentialAction": "QueryObservations",
      "dcat:endpointDescription": "http://localhost:8080/api/openapi.json",
      "owl:sameAs": "https://marineinfo.org/api"
    }
  },

  // ==========================================
  // 6. PEOPLE / RESEARCHERS
  // ==========================================
  {
    id: "resource-marc",
    type: "Person",
    category: "person",
    title: "Marc Portier",
    description: "Project Manager Data Centre at Flanders Marine Institute (VLIZ), leading semantic interoperability, Radical Transparency, and Open Science architectures.",
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
    id: "resource-katrina",
    type: "Person",
    category: "person",
    title: "Katrina Exter",
    description: "Science Officer Data Centre at Flanders Marine Institute (VLIZ), specializing in marine genomic data, metabarcoding, and ARMS-MBON biodiversity networks.",
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
    id: "resource-cedric",
    type: "Person",
    category: "person",
    title: "Cedric Decruw",
    description: "Data Software Engineer at Flanders Marine Institute (VLIZ), developing Linked Open Data engines, web crawlers, and semantic pipelines.",
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
    id: "resource-laurian",
    type: "Person",
    category: "person",
    title: "Laurian Van Maldeghem",
    description: "Science Officer Data Centre at Flanders Marine Institute (VLIZ), working on EurOBIS marine biodiversity data standardization and taxonomy.",
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
    id: "resource-joanna",
    type: "Person",
    category: "person",
    title: "Joanna Goley",
    description: "Science Officer Data Centre at Flanders Marine Institute (VLIZ), coordinating marine data curation, FAIR stewardship, and UNESCO training.",
    properties: {
      "foaf:name": "Joanna Goley",
      "foaf:mbox": "mailto:joanna.goley@vliz.be",
      "schema:jobTitle": "Science Officer Data Centre",
      "foaf:knows": ["resource-marc", "resource-laurian", "resource-cedric", "resource-katrina"],
      "schema:worksFor": "resource-vliz",
      "owl:sameAs": "https://orcid.org/0000-0002-4242-8553"
    }
  }
];

export function getResourceById(id: string): MarineEntity | undefined {
  return RESOURCES.find(r => r.id === id);
}

export function getResourcesByCategory(category: string): MarineEntity[] {
  return RESOURCES.filter(r => r.category === category);
}
