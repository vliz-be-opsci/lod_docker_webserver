import fs from "fs";
import path from "path";
import zlib from "zlib";
import crypto from "crypto";

// Simple CRC32 implementation for pure-JS zip creation
function crc32(buf: Buffer): number {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    let byte = buf[i];
    for (let j = 0; j < 8; j++) {
      const bit = (byte ^ crc) & 1;
      crc = (crc >>> 1) ^ (bit ? 0xedb88320 : 0);
      byte >>>= 1;
    }
  }
  return (crc ^ -1) >>> 0;
}

// Pure JS ZIP file creator (Store method = 0, no external deps required)
export function createSimpleZip(files: { name: string; content: string | Buffer }[]): Buffer {
  const localHeaders: Buffer[] = [];
  const centralHeaders: Buffer[] = [];
  let offset = 0;

  for (const file of files) {
    const fileBuf = typeof file.content === "string" ? Buffer.from(file.content, "utf-8") : file.content;
    const nameBuf = Buffer.from(file.name, "utf-8");
    const checksum = crc32(fileBuf);
    const size = fileBuf.length;

    // Local Header (30 bytes + filename length)
    const local = Buffer.alloc(30 + nameBuf.length);
    local.write("PK\x03\x04", 0); // Signature
    local.writeUInt16LE(20, 4); // Version needed (2.0)
    local.writeUInt16LE(0, 6); // General purpose bit flag
    local.writeUInt16LE(0, 8); // Compression method (0 = Store)
    local.writeUInt16LE(0x4000, 10); // Time (12:00:00)
    local.writeUInt16LE(0x5c40, 12); // Date (2026-08-18)
    local.writeUInt32LE(checksum, 14); // CRC-32
    local.writeUInt32LE(size, 18); // Compressed size
    local.writeUInt32LE(size, 22); // Uncompressed size
    local.writeUInt16LE(nameBuf.length, 26); // Filename length
    local.writeUInt16LE(0, 28); // Extra field length
    nameBuf.copy(local, 30);

    localHeaders.push(local, fileBuf);

    // Central Directory Header (46 bytes + filename length)
    const central = Buffer.alloc(46 + nameBuf.length);
    central.write("PK\x01\x02", 0); // Signature
    central.writeUInt16LE(20, 4); // Version made by
    central.writeUInt16LE(20, 6); // Version needed
    central.writeUInt16LE(0, 8); // Flags
    central.writeUInt16LE(0, 10); // Compression method
    central.writeUInt16LE(0x4000, 12); // Time
    central.writeUInt16LE(0x5c40, 14); // Date
    central.writeUInt32LE(checksum, 16); // CRC-32
    central.writeUInt32LE(size, 20); // Compressed size
    central.writeUInt32LE(size, 24); // Uncompressed size
    central.writeUInt16LE(nameBuf.length, 28); // Filename length
    central.writeUInt16LE(0, 30); // Extra field length
    central.writeUInt16LE(0, 32); // File comment length
    central.writeUInt16LE(0, 34); // Disk number start
    central.writeUInt16LE(0, 36); // Internal file attributes
    central.writeUInt32LE(0, 38); // External file attributes
    central.writeUInt32LE(offset, 42); // Relative offset of local header
    nameBuf.copy(central, 46);

    centralHeaders.push(central);
    offset += local.length + fileBuf.length;
  }

  const centralDirOffset = offset;
  const centralDirSize = centralHeaders.reduce((sum, b) => sum + b.length, 0);

  // End of Central Directory Record (22 bytes)
  const eocd = Buffer.alloc(22);
  eocd.write("PK\x05\x06", 0); // Signature
  eocd.writeUInt16LE(0, 4); // Number of this disk
  eocd.writeUInt16LE(0, 6); // Disk where central directory starts
  eocd.writeUInt16LE(files.length, 8); // Number of central directory records on this disk
  eocd.writeUInt16LE(files.length, 10); // Total number of central directory records
  eocd.writeUInt32LE(centralDirSize, 12); // Size of central directory
  eocd.writeUInt32LE(centralDirOffset, 16); // Offset of start of central directory
  eocd.writeUInt16LE(0, 20); // Comment length

  return Buffer.concat([...localHeaders, ...centralHeaders, eocd]);
}

export async function generateDataPayloads(distDir: string, baseUrl: string = "http://localhost:8080"): Promise<void> {
  const dataDir = path.join(distDir, "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // 1. ARMS-MBON 18S CSV
  const armsCsvRows = [
    "event_id,event_date,station,latitude,longitude,depth_m,phylum,class,order,family,genus,species,read_count,sequence_run",
    "EVT-2018-01,2018-06-14,BE-NRT-01,51.235,2.921,6.5,Mollusca,Bivalvia,Mytilida,Mytilidae,Mytilus,Mytilus edulis,1420,RUN-2018-ILLUMINA-01",
    "EVT-2018-02,2018-06-14,BE-NRT-01,51.235,2.921,6.5,Arthropoda,Malacostraca,Sessilia,Balanidae,Balanus,Balanus crenatus,3840,RUN-2018-ILLUMINA-01",
    "EVT-2018-03,2018-09-22,BE-NRT-02,51.355,3.190,9.0,Bryozoa,Gymnolaemata,Cheilostomatida,Electridae,Electra,Electra pilosa,980,RUN-2018-ILLUMINA-02",
    "EVT-2018-04,2018-09-22,BE-NRT-02,51.355,3.190,9.0,Annelida,Polychaeta,Sabellida,Serpulidae,Spirobranchus,Spirobranchus triqueter,1890,RUN-2018-ILLUMINA-02",
    "EVT-2019-01,2019-05-18,BE-NRT-03,51.542,2.954,18.2,Cnidaria,Hydrozoa,Anthoathecata,Tubulariidae,Tubularia,Tubularia indivisa,2450,RUN-2019-ILLUMINA-01",
    "EVT-2019-02,2019-05-18,BE-NRT-03,51.542,2.954,18.2,Chordata,Ascidiacea,Stolidobranchia,Styelidae,Botryllus,Botryllus schlosseri,3120,RUN-2019-ILLUMINA-01",
    "EVT-2019-03,2019-08-30,BE-NRT-03,51.542,2.954,18.2,Echinodermata,Asteroidea,Forcipulatida,Asteriidae,Asterias,Asterias rubens,760,RUN-2019-ILLUMINA-02",
    "EVT-2020-01,2020-10-05,BE-NRT-04,51.383,2.438,21.0,Annelida,Polychaeta,Sabellida,Sabellariidae,Sabellaria,Sabellaria spinulosa,1610,RUN-2020-ILLUMINA-01",
    "EVT-2020-02,2020-10-05,BE-NRT-04,51.383,2.438,21.0,Porifera,Demospongiae,Suberitida,Suberitidae,Suberites,Suberites ficus,1150,RUN-2020-ILLUMINA-01",
    "EVT-2020-03,2020-10-05,BE-NRT-04,51.383,2.438,21.0,Arthropoda,Malacostraca,Decapoda,Portunidae,Necora,Necora puber,840,RUN-2020-ILLUMINA-01",
    "EVT-2020-04,2020-10-12,BE-NRT-05,51.583,2.783,24.5,Cnidaria,Anthozoa,Actiniaria,Actiniidae,Actinia,Actinia equina,1980,RUN-2020-ILLUMINA-02"
  ];
  fs.writeFileSync(path.join(dataDir, "arms-mbon-18s.csv"), armsCsvRows.join("\n"));

  // 2. ARMS-MBON Stations GeoJSON
  const stationsGeoJson = {
    type: "FeatureCollection",
    name: "ARMS-MBON Belgian North Sea Stations",
    crs: { type: "name", properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" } },
    features: [
      {
        type: "Feature",
        properties: { station_id: "BE-NRT-01", name: "Ostend Port Wall", depth_m: 6.5, substrate: "Artificial Granite", active_since: "2018-05-01" },
        geometry: { type: "Point", coordinates: [2.9210, 51.2350] }
      },
      {
        type: "Feature",
        properties: { station_id: "BE-NRT-02", name: "Zeebrugge Breakwater", depth_m: 9.0, substrate: "Concrete Blocks", active_since: "2018-05-01" },
        geometry: { type: "Point", coordinates: [3.1900, 51.3550] }
      },
      {
        type: "Feature",
        properties: { station_id: "BE-NRT-03", name: "Thorntonbank Offshore Wind Farm", depth_m: 18.2, substrate: "Turbine Steel Jacket", active_since: "2019-04-15" },
        geometry: { type: "Point", coordinates: [2.9540, 51.5420] }
      },
      {
        type: "Feature",
        properties: { station_id: "BE-NRT-04", name: "Westhinder Sandbank Station", depth_m: 21.0, substrate: "Autonomous Reef Unit", active_since: "2020-09-01" },
        geometry: { type: "Point", coordinates: [2.4380, 51.3830] }
      },
      {
        type: "Feature",
        properties: { station_id: "BE-NRT-05", name: "C-Power Offshore Wind Station", depth_m: 24.5, substrate: "Gravity Base Foundation", active_since: "2020-09-01" },
        geometry: { type: "Point", coordinates: [2.7830, 51.5830] }
      }
    ]
  };
  fs.writeFileSync(path.join(dataDir, "arms-mbon-stations.geojson"), JSON.stringify(stationsGeoJson, null, 2));

  // 3. ARMS-MBON RO-Crate ZIP package
  const roCrateMetadata = {
    "@context": "https://w3id.org/ro/crate/1.1/context",
    "@graph": [
      {
        "@id": "ro-crate-metadata.json",
        "@type": "CreativeWork",
        "conformsTo": { "@id": "https://w3id.org/ro/crate/1.1" },
        "about": { "@id": "./" }
      },
      {
        "@id": "./",
        "@type": "Dataset",
        "name": "ARMS-MBON Metagenomic 18S Observations Research Object Crate",
        "description": "Comprehensive RO-Crate package detailing autonomous reef monitoring structures, 18S rRNA metabarcoding observations, spatial coordinates, and pipeline provenance.",
        "datePublished": "2022-10-12",
        "license": { "@id": "https://creativecommons.org/licenses/by/4.0/" },
        "hasPart": [
          { "@id": "data/arms-mbon-18s.csv" },
          { "@id": "data/stations.geojson" }
        ],
        "author": [
          { "@id": "https://orcid.org/0000-0002-5911-1536", "name": "Katrina Exter" },
          { "@id": "https://orcid.org/0000-0002-9648-6484", "name": "Marc Portier" },
          { "@id": "https://orcid.org/0000-0001-6387-5988", "name": "Cedric Decruw" },
          { "@id": "https://orcid.org/0000-0003-0663-5907", "name": "Laurian Van Maldeghem" }
        ],
        "publisher": {
          "@id": "https://ror.org/0496xx721",
          "name": "Flanders Marine Institute (VLIZ)"
        }
      },
      {
        "@id": "data/arms-mbon-18s.csv",
        "@type": "File",
        "name": "ARMS 18S Observation Reads",
        "encodingFormat": "text/csv"
      },
      {
        "@id": "data/stations.geojson",
        "@type": "File",
        "name": "ARMS North Sea Station Coordinates",
        "encodingFormat": "application/geo+json"
      }
    ]
  };

  const roCrateZipBuf = createSimpleZip([
    { name: "ro-crate-metadata.json", content: JSON.stringify(roCrateMetadata, null, 2) },
    { name: "data/arms-mbon-18s.csv", content: armsCsvRows.join("\n") },
    { name: "data/stations.geojson", content: JSON.stringify(stationsGeoJson, null, 2) },
    { name: "LICENSE.txt", content: "Creative Commons Attribution 4.0 International (CC-BY-4.0)\nhttps://creativecommons.org/licenses/by/4.0/" },
    { name: "README.md", content: "# ARMS-MBON Metagenomic Observation Crate\n\nPublished by Flanders Marine Institute (VLIZ) under the MAREGRAPH initiative." }
  ]);
  fs.writeFileSync(path.join(dataDir, "arms-mbon-rocrate.zip"), roCrateZipBuf);

  // 4. ARMS 2018 Community Ecology Samples CSV
  const arms2018Rows = [
    "sample_id,date,station,plate_layer,fraction_size,biomass_dry_weight_g,motile_sessile,dominant_taxon",
    "ARMS-18-001,2018-05-15,BE-NRT-01,Plate 1 (Top),>2mm (Motile),4.82,Motile,Carcinus maenas",
    "ARMS-18-002,2018-05-15,BE-NRT-01,Plate 2 (Mid),Sessile Scrape,14.15,Sessile,Semibalanus balanoides",
    "ARMS-18-003,2018-05-15,BE-NRT-01,Plate 3 (Mid),500um-2mm,2.94,Motile,Gammarus oceanicus",
    "ARMS-18-004,2018-05-15,BE-NRT-01,Plate 4 (Bot),>100um (Micro),1.85,Motile,Nematoda sp.",
    "ARMS-18-005,2018-08-20,BE-NRT-02,Plate 1 (Top),>2mm (Motile),6.20,Motile,Palaemon serratus",
    "ARMS-18-006,2018-08-20,BE-NRT-02,Plate 2 (Mid),Sessile Scrape,19.80,Sessile,Mytilus edulis",
    "ARMS-18-007,2018-08-20,BE-NRT-02,Plate 4 (Bot),>100um (Micro),2.10,Motile,Nematoda sp.",
    "ARMS-18-008,2018-11-12,BE-NRT-03,Plate 1 (Top),>2mm (Motile),8.90,Motile,Asterias rubens",
    "ARMS-18-009,2018-11-12,BE-NRT-03,Plate 2 (Mid),Sessile Scrape,22.40,Sessile,Tubularia indivisa"
  ];
  fs.writeFileSync(path.join(dataDir, "arms-2018-samples.csv"), arms2018Rows.join("\n"));

  // 5. North Sea Buoy Time-Series CSV
  const sensorRows = [
    "timestamp,buoy_id,station,sea_surface_temp_c,salinity_psu,turbidity_fnu,dissolved_oxygen_mgl,chlorophyll_a_ugl",
    "2026-08-15T00:00:00Z,BUOY-THORNTON,Thorntonbank,18.4,34.2,3.8,7.9,2.1",
    "2026-08-15T03:00:00Z,BUOY-THORNTON,Thorntonbank,18.3,34.2,4.0,8.0,2.2",
    "2026-08-15T06:00:00Z,BUOY-THORNTON,Thorntonbank,18.6,34.1,4.1,8.2,2.4",
    "2026-08-15T09:00:00Z,BUOY-THORNTON,Thorntonbank,18.9,34.2,3.4,8.4,2.6",
    "2026-08-15T12:00:00Z,BUOY-THORNTON,Thorntonbank,19.1,34.3,2.9,8.5,2.8",
    "2026-08-15T15:00:00Z,BUOY-THORNTON,Thorntonbank,19.0,34.3,3.1,8.3,2.5",
    "2026-08-15T18:00:00Z,BUOY-WESTHINDER,Westhinder,18.2,34.6,2.2,8.0,1.8",
    "2026-08-15T21:00:00Z,BUOY-WESTHINDER,Westhinder,18.1,34.6,2.4,7.9,1.7",
    "2026-08-16T00:00:00Z,BUOY-WESTHINDER,Westhinder,18.0,34.7,2.1,8.1,1.9",
    "2026-08-16T06:00:00Z,BUOY-WESTHINDER,Westhinder,18.3,34.5,2.5,8.3,2.0"
  ];
  fs.writeFileSync(path.join(dataDir, "north-sea-sensors-latest.csv"), sensorRows.join("\n"));

  // 6. North Sea Buoy Stream JSON
  const sensorStream = [
    { timestamp: "2026-08-15T00:00:00Z", buoy_id: "BUOY-THORNTON", station: "Thorntonbank", sea_surface_temp_c: 18.4, salinity_psu: 34.2, turbidity_fnu: 3.8, dissolved_oxygen_mgl: 7.9, chlorophyll_a_ugl: 2.1 },
    { timestamp: "2026-08-15T06:00:00Z", buoy_id: "BUOY-THORNTON", station: "Thorntonbank", sea_surface_temp_c: 18.6, salinity_psu: 34.1, turbidity_fnu: 4.1, dissolved_oxygen_mgl: 8.2, chlorophyll_a_ugl: 2.4 },
    { timestamp: "2026-08-15T12:00:00Z", buoy_id: "BUOY-THORNTON", station: "Thorntonbank", sea_surface_temp_c: 19.1, salinity_psu: 34.3, turbidity_fnu: 2.9, dissolved_oxygen_mgl: 8.5, chlorophyll_a_ugl: 2.8 },
    { timestamp: "2026-08-15T18:00:00Z", buoy_id: "BUOY-WESTHINDER", station: "Westhinder", sea_surface_temp_c: 18.2, salinity_psu: 34.6, turbidity_fnu: 2.2, dissolved_oxygen_mgl: 8.0, chlorophyll_a_ugl: 1.8 }
  ];
  fs.writeFileSync(path.join(dataDir, "north-sea-sensors-stream.json"), JSON.stringify(sensorStream, null, 2));

  // 7. EurOBIS Species Occurrences GeoJSON
  const eurobisGeoJson = {
    type: "FeatureCollection",
    name: "EurOBIS European Marine Species Occurrences Sample",
    features: [
      {
        type: "Feature",
        properties: { occurrence_id: "OBIS:BE:09211", scientific_name: "Crangon crangon", vernacular_name: "Brown Shrimp", aphia_id: 107575, event_date: "2024-04-12", individual_count: 85, basis_of_record: "HumanObservation" },
        geometry: { type: "Point", coordinates: [2.8900, 51.2400] }
      },
      {
        type: "Feature",
        properties: { occurrence_id: "OBIS:BE:09212", scientific_name: "Gadus morhua", vernacular_name: "Atlantic Cod", aphia_id: 126436, event_date: "2024-04-12", individual_count: 12, basis_of_record: "TrawlSample" },
        geometry: { type: "Point", coordinates: [2.7800, 51.4500] }
      },
      {
        type: "Feature",
        properties: { occurrence_id: "OBIS:BE:09213", scientific_name: "Phocoena phocoena", vernacular_name: "Harbour Porpoise", aphia_id: 137117, event_date: "2024-06-03", individual_count: 3, basis_of_record: "VisualSighting" },
        geometry: { type: "Point", coordinates: [3.0500, 51.3100] }
      },
      {
        type: "Feature",
        properties: { occurrence_id: "OBIS:BE:09214", scientific_name: "Ensis directus", vernacular_name: "American Jackknife Clam", aphia_id: 140733, event_date: "2024-07-19", individual_count: 24, basis_of_record: "BenthicCore" },
        geometry: { type: "Point", coordinates: [2.7200, 51.1900] }
      },
      {
        type: "Feature",
        properties: { occurrence_id: "OBIS:BE:09215", scientific_name: "Asterias rubens", vernacular_name: "Common Starfish", aphia_id: 123775, event_date: "2024-08-01", individual_count: 50, basis_of_record: "DredgeSample" },
        geometry: { type: "Point", coordinates: [2.9500, 51.5200] }
      }
    ]
  };
  fs.writeFileSync(path.join(dataDir, "eurobis-occurrences.geojson"), JSON.stringify(eurobisGeoJson, null, 2));

  // 8. EurOBIS Darwin Core Archive Sample ZIP
  const emlXml = `<?xml version="1.0" encoding="UTF-8"?>
<eml:eml xmlns:eml="eml://ecoinformatics.org/eml-2.1.1" packageId="eurobis-sample-dwca">
  <dataset>
    <title>EurOBIS European Marine Species Occurrences Sample</title>
    <creator><organizationName>Flanders Marine Institute (VLIZ)</organizationName></creator>
    <pubDate>2024-08-18</pubDate>
    <intellectualRights><para>Creative Commons Attribution 4.0 International (CC-BY 4.0)</para></intellectualRights>
  </dataset>
</eml:eml>`;

  const metaXml = `<?xml version="1.0" encoding="UTF-8"?>
<archive xmlns="http://rs.tdwg.org/dwc/text/" metadata="eml.xml">
  <core encoding="UTF-8" fieldsTerminatedBy="\\t" linesTerminatedBy="\\n" rowType="http://rs.tdwg.org/dwc/terms/Occurrence">
    <files><location>occurrence.txt</location></files>
    <id index="0" />
    <field index="1" term="http://rs.tdwg.org/dwc/terms/scientificName" />
    <field index="2" term="http://rs.tdwg.org/dwc/terms/decimalLatitude" />
    <field index="3" term="http://rs.tdwg.org/dwc/terms/decimalLongitude" />
    <field index="4" term="http://rs.tdwg.org/dwc/terms/eventDate" />
  </core>
</archive>`;

  const occTxt = `occurrenceID\tscientificName\tdecimalLatitude\tdecimalLongitude\teventDate
OBIS:BE:09211\tCrangon crangon\t51.2400\t2.8900\t2024-04-12
OBIS:BE:09212\tGadus morhua\t51.4500\t2.7800\t2024-04-12
OBIS:BE:09213\tPhocoena phocoena\t51.3100\t3.0500\t2024-06-03
OBIS:BE:09214\tEnsis directus\t51.1900\t2.7200\t2024-07-19
OBIS:BE:09215\tAsterias rubens\t51.5200\t2.9500\t2024-08-01`;

  const dwcaZip = createSimpleZip([
    { name: "eml.xml", content: emlXml },
    { name: "meta.xml", content: metaXml },
    { name: "occurrence.txt", content: occTxt }
  ]);
  fs.writeFileSync(path.join(dataDir, "eurobis-dwca-sample.zip"), dwcaZip);

  // 9. Publication PDF
  const rootPdfPath = path.resolve(process.cwd(), "wrx.pdf");
  const targetPdfPath = path.join(dataDir, "ro-crate-paper.pdf");
  if (fs.existsSync(rootPdfPath)) {
    fs.copyFileSync(rootPdfPath, targetPdfPath);
  } else {
    // Generate minimal valid PDF document if wrx.pdf is not present
    const minimalPdf = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << >> >> endobj
4 0 obj << /Length 77 >> stream
BT /F1 18 Tf 50 700 Td (Contemporary Data Management Applying RO-Crate and GitHub Actions) Tj ET
endstream endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000216 00000 n 
trailer << /Size 5 /Root 1 0 R >>
startxref
345
%%EOF`;
    fs.writeFileSync(targetPdfPath, minimalPdf);
  }
}

