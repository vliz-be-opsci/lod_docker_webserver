import { describe, it, expect } from "bun:test";
import { RESOURCES, getResourceById } from "../generator/resources";
import { renderDatasetPageHtml, renderInstitutePageHtml, renderCatalogHomeHtml } from "../generator/htmlTemplates";

describe("HTML Template Rendering", () => {
  const dataset = getResourceById("resource-arms-mbon")!;
  const institute = getResourceById("resource-vliz")!;

  it("renders dataset HTML with /id/ links and signposts", () => {
    const html = renderDatasetPageHtml(dataset, "http://localhost:8080");
    expect(html).toContain('href="/id/dataset/arms-mbon.ttl"');
    expect(html).toContain('href="/id/dataset/arms-mbon.jsonld"');
    expect(html).toContain('href="/id/dataset/arms-mbon.linkset.json"');
    expect(html).toContain('href="/id/institute/vliz.html"');
    expect(html).toContain('href="/id/person/katrina.html"');
    expect(html).toContain('href="/id/profiles"');
    expect(html).toContain('rel="type" href="https://schema.org/Dataset"');
    expect(html).not.toContain('rel="profile"');
  });

  it("renders institute HTML with /id/ links", () => {
    const html = renderInstitutePageHtml(institute, "http://localhost:8080");
    expect(html).toContain('href="/id/institute/vliz.ttl"');
    expect(html).toContain('href="/id/institute/vliz.linkset.json"');
  });

  it("renders home page cards pointing to /id/{type}/{name}.html", () => {
    const html = renderCatalogHomeHtml(RESOURCES, "http://localhost:8080");
    expect(html).toContain('href="/id/dataset/arms-mbon.html"');
    expect(html).toContain('href="/id/institute/vliz.html"');
    expect(html).toContain('href="/id/profiles"');
  });
});
