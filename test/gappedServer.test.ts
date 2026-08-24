import { describe, it, expect, beforeAll } from "bun:test";
import fs from "fs";
import path from "path";
import { generateGappedSite } from "../generator/gappedGenerator";
import { generateComplianceJson } from "../generator/auditPageRenderer";

describe("Gapped LOD Server & Gap Simulation Engine", () => {
  const distDir = path.resolve(process.cwd(), "dist");
  const distGappedDir = path.resolve(process.cwd(), "dist-gapped");

  beforeAll(async () => {
    // Ensure dist-gapped is freshly generated for the tests
    if (fs.existsSync(distDir)) {
      await generateGappedSite(distGappedDir, "http://localhost:8081");
    }
  });

  it("generates valid compliance JSON schema comparing 8080 vs 8081", () => {
    const compliance = generateComplianceJson("http://localhost:8080", "http://localhost:8081") as any;
    expect(compliance.instances.referenceServer.port).toBe(8080);
    expect(compliance.instances.gappedServer.port).toBe(8081);
    expect(compliance.resources.length).toBe(9);

    const armsMbon = compliance.resources.find((r: any) => r.slug === "arms-mbon");
    expect(armsMbon.gappedPort8081.missingPatterns.length).toBe(0);

    const arms2018 = compliance.resources.find((r: any) => r.slug === "arms-2018");
    expect(arms2018.gappedPort8081.missingPatterns).toContain("RT-P01");
    expect(arms2018.gappedPort8081.missingPatterns).toContain("RT-P03");
  });

  it("Scenario 1: arms-mbon is 100% compliant on both reference and gapped instance", () => {
    expect(fs.existsSync(path.join(distGappedDir, "id", "dataset", "arms-mbon.html"))).toBe(true);
    expect(fs.existsSync(path.join(distGappedDir, "id", "dataset", "arms-mbon.ttl"))).toBe(true);
    expect(fs.existsSync(path.join(distGappedDir, "id", "dataset", "arms-mbon.linkset.json"))).toBe(true);

    const headersConf = fs.readFileSync(path.join(distGappedDir, "nginx-headers.conf"), "utf-8");
    expect(headersConf).toContain("location = /id/dataset/arms-mbon.html");
    expect(headersConf).toContain('rel="profile"');
  });

  it("Scenario 2: arms-2018 is stripped of RDF and linkset in dist-gapped (Legacy Silo)", () => {
    expect(fs.existsSync(path.join(distGappedDir, "id", "dataset", "arms-2018.html"))).toBe(true);
    expect(fs.existsSync(path.join(distGappedDir, "id", "dataset", "arms-2018.ttl"))).toBe(false);
    expect(fs.existsSync(path.join(distGappedDir, "id", "dataset", "arms-2018.jsonld"))).toBe(false);
    expect(fs.existsSync(path.join(distGappedDir, "id", "dataset", "arms-2018.linkset.json"))).toBe(false);
  });

  it("Scenario 3: north-sea-sensors emits zero Link response headers in dist-gapped (Silent Server)", () => {
    expect(fs.existsSync(path.join(distGappedDir, "id", "dataset", "north-sea-sensors.ttl"))).toBe(true);
    expect(fs.existsSync(path.join(distGappedDir, "id", "dataset", "north-sea-sensors.linkset.json"))).toBe(true);

    const headersConf = fs.readFileSync(path.join(distGappedDir, "nginx-headers.conf"), "utf-8");
    expect(headersConf).not.toContain("location = /id/dataset/north-sea-sensors.html");
    expect(headersConf).not.toContain("location = /id/dataset/north-sea-sensors.ttl");
  });

  it("Scenario 4: eurobis-occurrences omits profile assertions in RDF and linkset in dist-gapped", () => {
    const ttlContent = fs.readFileSync(path.join(distGappedDir, "id", "dataset", "eurobis-occurrences.ttl"), "utf-8");
    expect(ttlContent).not.toContain("schema:conformsTo");
    expect(ttlContent).not.toContain("dcterms:conformsTo");

    const linksetContent = JSON.parse(fs.readFileSync(path.join(distGappedDir, "id", "dataset", "eurobis-occurrences.linkset.json"), "utf-8"));
    expect(linksetContent.linkset[0].profile).toBeUndefined();
  });

  it("Scenario 5: vliz institute linkset file is deleted in dist-gapped (404 Missing Linkset)", () => {
    const vlizLinkset = path.join(distGappedDir, "id", "institute", "vliz.linkset.json");
    expect(fs.existsSync(vlizLinkset)).toBe(false);
  });

  it("Scenario 6: ro-crate-paper omits rel='cite-as' on payload download in dist-gapped", () => {
    const headersConf = fs.readFileSync(path.join(distGappedDir, "nginx-headers.conf"), "utf-8");
    expect(headersConf).toContain("location = /data/ro-crate-paper.pdf");
    expect(headersConf).not.toContain('add_header Link \'<http://localhost:8081/id/publication/ro-crate-paper>; rel="cite-as"\'');
  });

  it("Scenario 7: marineinfo-api is omitted from api-catalog and omits cite-as in dist-gapped", () => {
    const apiCatalog = JSON.parse(fs.readFileSync(path.join(distGappedDir, ".well-known", "api-catalog"), "utf-8"));
    expect(JSON.stringify(apiCatalog)).not.toContain("/api/v1/observations");

    const headersConf = fs.readFileSync(path.join(distGappedDir, "nginx-headers.conf"), "utf-8");
    expect(headersConf).toContain("location = /api/v1/observations");
    const obsBlock = headersConf.substring(headersConf.indexOf("location = /api/v1/observations"), headersConf.indexOf("}", headersConf.indexOf("location = /api/v1/observations")));
    expect(obsBlock).not.toContain('rel="cite-as"');
  });

  it("Scenario 8: maregraph is rendered as plain loc without rs:ln in dist-gapped sitemap", () => {
    const sitemap = fs.readFileSync(path.join(distGappedDir, "sitemap.xml"), "utf-8");
    expect(sitemap).toContain("<loc>http://localhost:8081/id/project/maregraph</loc>");
    // Should not contain rs:ln for maregraph
    const maregraphBlock = sitemap.substring(sitemap.indexOf("/id/project/maregraph"), sitemap.indexOf("</url>", sitemap.indexOf("/id/project/maregraph")));
    expect(maregraphBlock).not.toContain("rs:ln");
  });

  it("Scenario 9: katrina linkset omits reverse format anchor entries in dist-gapped", () => {
    const linkset = JSON.parse(fs.readFileSync(path.join(distGappedDir, "id", "person", "katrina.linkset.json"), "utf-8"));
    expect(linkset.linkset.length).toBe(1);
    expect(linkset.linkset[0].anchor).toContain("/id/person/katrina");
  });
});
