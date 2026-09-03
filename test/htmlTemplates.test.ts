import { describe, it, expect } from "bun:test";
import { RESOURCES, getResourceById } from "../generator/resources";
import { renderDatasetPageHtml, renderInstitutePageHtml, renderCatalogHomeHtml, renderHeader, renderFooter } from "../generator/htmlTemplates";
import { generateAuditHtml } from "../generator/auditPageRenderer";

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
    expect(html).toContain('rel="profile" href="/id/profile/marine-genomic-dataset-profile"');
  });

  it("renders institute HTML with /id/ links", () => {
    const html = renderInstitutePageHtml(institute, "http://localhost:8080");
    expect(html).toContain('href="/id/institute/vliz.ttl"');
    expect(html).toContain('href="/id/institute/vliz.linkset.json"');
  });

  it("renders home page cards pointing to /id/{type}/{name}.html", () => {
    const html = renderCatalogHomeHtml(RESOURCES, "http://localhost:8080");
    expect(html).toContain('href="/id/dataset/arms-mbon.html"');
    expect(html).toContain('href="/id/dataset/dataset-90.html"');
    expect(html).toContain('href="/id/dataset/dataset-90/v2.1.html"');
    expect(html).toContain('Macrobenthos of the Belgian Part of the North Sea (Dataset 90)');
    expect(html).toContain('RT-P09 Series');
    expect(html).toContain('href="/id/institute/vliz.html"');
    expect(html).toContain('href="/id/profiles"');
  });

  it("renders shared header with audit nav item active when specified", () => {
    const headerHtml = renderHeader("audit");
    expect(headerHtml).toContain('href="/audit.html" class="active"');
    expect(headerHtml).toContain('VLIZ Marine Data Portal');
  });

  it("renders header with link to versioned subsetting API docs", () => {
    const headerHtml = renderHeader("api");
    expect(headerHtml).toContain('href="/api/observations/v1/docs/"');
    expect(headerHtml).not.toContain('href="/api/docs/"');
  });

  it("renders audit page with homepage css styles, shared header, hero, and footer", () => {
    const auditHtml = generateAuditHtml("http://localhost:8080", "http://localhost:8081");
    // Link to shared stylesheet
    expect(auditHtml).toContain('<link rel="stylesheet" href="/style.css">');
    // Uses shared header with active audit nav
    expect(auditHtml).toContain('VLIZ Marine Data Portal');
    expect(auditHtml).toContain('href="/audit.html" class="active"');
    // Uses homepage hero section styling
    expect(auditHtml).toContain('class="hero"');
    expect(auditHtml).toContain('class="hero-tag"');
    expect(auditHtml).toContain('class="main-container"');
    // Uses shared footer
    expect(auditHtml).toContain('<footer>');
    expect(auditHtml).toContain('footer-container');
    // Must NOT contain old hardcoded dark header or old inline styles
    expect(auditHtml).not.toContain('<header style="background: #090d16;');
    expect(auditHtml).not.toContain('--bg-dark: #0f172a');
  });
});
