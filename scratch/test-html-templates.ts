import { RESOURCES } from "../generator/resources";
import {
  getCssContent,
  renderCatalogHomeHtml,
  renderDatasetPageHtml,
  renderInstitutePageHtml,
  renderPublicationPageHtml,
  renderProjectPageHtml,
  renderPersonPageHtml,
  renderDcatHtml
} from "../generator/htmlTemplates";

const baseUrl = "http://localhost:8080";

async function runTest() {
  const css = getCssContent();
  if (!css.includes("--vliz-blue") && !css.includes("--marine-teal")) {
    throw new Error("CSS content missing primary design tokens");
  }
  console.log("✓ CSS design system verified");

  const homeHtml = renderCatalogHomeHtml(RESOURCES, baseUrl);
  if (!homeHtml.includes("ARMS-MBON") || !homeHtml.includes("Flanders Marine Institute")) {
    throw new Error("Home HTML missing key resource content");
  }
  console.log("✓ Home page HTML verified");

  const dataset = RESOURCES.find(r => r.id === "resource-arms-mbon")!;
  const dsHtml = renderDatasetPageHtml(dataset, baseUrl);
  if (!dsHtml.includes("Live Data Preview") || !dsHtml.includes("EVT-2018-01") || !dsHtml.includes("arms-mbon-18s.csv")) {
    throw new Error("Dataset HTML missing live preview table or download distributions");
  }
  console.log("✓ Dataset detail page HTML verified");

  const institute = RESOURCES.find(r => r.id === "resource-vliz")!;
  const instHtml = renderInstitutePageHtml(institute, baseUrl);
  if (!instHtml.includes("Flanders Marine Institute") || !instHtml.includes("Marc Portier")) {
    throw new Error("Institute HTML missing details");
  }
  console.log("✓ Institute detail page HTML verified");

  const pub = RESOURCES.find(r => r.id === "resource-ro-crate-paper")!;
  const pubHtml = renderPublicationPageHtml(pub, baseUrl);
  if (!pubHtml.includes("Contemporary data management") || !pubHtml.includes("ro-crate-paper.pdf")) {
    throw new Error("Publication HTML missing PDF link or title");
  }
  console.log("✓ Publication detail page HTML verified");

  const proj = RESOURCES.find(r => r.id === "resource-maregraph")!;
  const projHtml = renderProjectPageHtml(proj, baseUrl);
  if (!projHtml.includes("MAREGRAPH")) {
    throw new Error("Project HTML missing MAREGRAPH");
  }
  console.log("✓ Project detail page HTML verified");

  const person = RESOURCES.find(r => r.id === "resource-marc")!;
  const personHtml = renderPersonPageHtml(person, baseUrl);
  if (!personHtml.includes("Marc Portier") || !personHtml.includes("orcid.org")) {
    throw new Error("Person HTML missing researcher details or ORCID");
  }
  console.log("✓ Person detail page HTML verified");

  const dcatHtml = renderDcatHtml(RESOURCES, baseUrl);
  if (!dcatHtml.includes("DCAT") || !dcatHtml.includes("dcat.ttl")) {
    throw new Error("DCAT HTML missing catalog or TTL download");
  }
  console.log("✓ DCAT catalogue HTML verified");

  console.log("All HTML template tests passed!");
}

runTest().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
