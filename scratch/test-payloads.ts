import fs from "fs";
import path from "path";
import { generateDataPayloads } from "../generator/dataPayloads";

const testDir = path.resolve(process.cwd(), "scratch", "test-dist");
if (fs.existsSync(testDir)) {
  fs.rmSync(testDir, { recursive: true, force: true });
}
fs.mkdirSync(testDir, { recursive: true });

async function runTest() {
  await generateDataPayloads(testDir);
  const dataDir = path.join(testDir, "data");
  
  const expectedFiles = [
    "arms-mbon-18s.csv",
    "arms-mbon-stations.geojson",
    "arms-mbon-rocrate.zip",
    "arms-2018-samples.csv",
    "north-sea-sensors-latest.csv",
    "north-sea-sensors-stream.json",
    "eurobis-occurrences.geojson",
    "eurobis-dwca-sample.zip",
    "ro-crate-paper.pdf"
  ];

  for (const file of expectedFiles) {
    const filePath = path.join(dataDir, file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Expected file not found: ${filePath}`);
    }
    const stat = fs.statSync(filePath);
    if (stat.size === 0) {
      throw new Error(`File is empty: ${filePath}`);
    }
    console.log(`✓ ${file} generated (${stat.size} bytes)`);
  }
  console.log("All data payloads generated successfully!");
}

runTest().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
