import { RESOURCES } from "../generator/resources";
import { generateDcatCatalog } from "../generator/dcatGenerator";
import { generateLinkset, generateApiCatalog } from "../generator/linksetGenerator";

const baseUrl = "http://localhost:8080";

async function runTest() {
  // Test DCAT Catalog Generation
  const dcat = generateDcatCatalog(RESOURCES, baseUrl);
  if (!dcat.ttl || !dcat.ttl.includes("dcat:Catalog")) {
    throw new Error("DCAT Turtle generation failed or missing dcat:Catalog");
  }
  if (!dcat.jsonld || !dcat.jsonld.includes("dcat:Catalog")) {
    throw new Error("DCAT JSON-LD generation failed");
  }
  console.log("✓ DCAT Catalog generated successfully (TTL & JSON-LD)");

  // Test Linkset Generation for a dataset
  const dataset = RESOURCES.find(r => r.id === "resource-arms-mbon")!;
  const linkset: any = generateLinkset(dataset, baseUrl);
  if (!linkset.linkset || !Array.isArray(linkset.linkset) || linkset.linkset.length === 0) {
    throw new Error("Invalid Linkset structure");
  }
  const entry = linkset.linkset[0];
  if (!entry.anchor || !entry.profile || !entry.describedby || !entry.item) {
    throw new Error("Linkset missing required RFC 9264 relations (anchor, profile, describedby, item)");
  }
  console.log("✓ RFC 9264 Linkset generated successfully");

  // Test API Catalog Generation
  const apiCatalog: any = generateApiCatalog(baseUrl);
  if (!apiCatalog.linkset || !apiCatalog.linkset[0]["service-desc"]) {
    throw new Error("RFC 9727 API Catalog missing service-desc");
  }
  console.log("✓ RFC 9727 API Catalog generated successfully");

  console.log("All DCAT & Linkset tests passed!");
}

runTest().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
