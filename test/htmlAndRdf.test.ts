import { describe, expect, it } from "bun:test";
import { getResourceById } from "../generator/resources";
import { renderDatasetPageHtml, renderHistoryPageHtml } from "../generator/htmlTemplates";
import { serializeTurtle } from "../generator/rdfSerializer";

describe("RT-P09 HTML & RDF Serialization", () => {
  const BASE_URL = "http://localhost:8080";

  it("renders series page with latest version callout and history button", () => {
    const series = getResourceById("resource-dataset-90")!;
    const html = renderDatasetPageHtml(series, BASE_URL);
    expect(html).toContain("Latest Authoritative Release");
    expect(html).toContain("/id/dataset/dataset-90/v2.1");
    expect(html).toContain("/id/dataset/dataset-90/history");
  });

  it("renders release page with predecessor navigation and immutable DOI banner", () => {
    const v21 = getResourceById("resource-dataset-90-v2.1")!;
    const html = renderDatasetPageHtml(v21, BASE_URL);
    expect(html).toContain("Predecessor Version");
    expect(html).toContain("/id/dataset/dataset-90/v2.0");
    expect(html).toContain("10.14284/90.v2.1");
  });

  it("renders history archive page listing all version entries", () => {
    const series = getResourceById("resource-dataset-90")!;
    const releases = [
      getResourceById("resource-dataset-90-v1.0")!,
      getResourceById("resource-dataset-90-v2.0")!,
      getResourceById("resource-dataset-90-v2.1")!
    ];
    const html = renderHistoryPageHtml(series, releases, BASE_URL);
    expect(html).toContain("Version History Archive");
    expect(html).toContain("v1.0 (2023-06-02)");
    expect(html).toContain("v2.0 (2025-02-06)");
    expect(html).toContain("v2.1 (2026-08-26)");
  });

  it("serializes RDF with versioning relations", () => {
    const v21 = getResourceById("resource-dataset-90-v2.1")!;
    const ttl = serializeTurtle(v21, BASE_URL);
    expect(ttl).toContain("dcterms:isVersionOf");
    expect(ttl).toContain("prov:wasRevisionOf");
  });
});
