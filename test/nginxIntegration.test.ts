import { describe, it, expect } from "bun:test";
import fs from "fs";
import path from "path";
import { RESOURCES } from "../generator/resources";
import { PROFILES } from "../generator/profiles";
import { getEntityTypeSlug, getEntityNameSlug } from "../generator/types";

describe("Static Generator Output & Nginx Conneg Configuration", () => {
  const distDir = path.resolve(process.cwd(), "dist");

  it("co-locates all format variants (.html, .ttl, .jsonld, .rdf, .linkset.json) in dist/id/{type}/", () => {
    for (const res of RESOURCES) {
      const typeSlug = getEntityTypeSlug(res);
      const nameSlug = getEntityNameSlug(res);
      const baseDir = path.join(distDir, "id", typeSlug);

      expect(fs.existsSync(path.join(baseDir, `${nameSlug}.html`))).toBe(true);
      expect(fs.existsSync(path.join(baseDir, `${nameSlug}.ttl`))).toBe(true);
      expect(fs.existsSync(path.join(baseDir, `${nameSlug}.jsonld`))).toBe(true);
      expect(fs.existsSync(path.join(baseDir, `${nameSlug}.rdf`))).toBe(true);
      expect(fs.existsSync(path.join(baseDir, `${nameSlug}.linkset.json`))).toBe(true);
    }
  });

  it("co-locates profiles under dist/id/profile/ and registry at dist/id/profiles/index.html", () => {
    expect(fs.existsSync(path.join(distDir, "id", "profiles", "index.html"))).toBe(true);

    for (const prof of PROFILES) {
      const baseDir = path.join(distDir, "id", "profile");
      expect(fs.existsSync(path.join(baseDir, `${prof.id}.html`))).toBe(true);
      expect(fs.existsSync(path.join(baseDir, `${prof.id}.ttl`))).toBe(true);
      expect(fs.existsSync(path.join(baseDir, `${prof.id}.jsonld`))).toBe(true);
      expect(fs.existsSync(path.join(baseDir, `${prof.id}.linkset.json`))).toBe(true);
    }
  });

  it("generates valid nginx-coneg.conf with conneg suffixes and default ttl", () => {
    const conegPath = path.join(distDir, "nginx-coneg.conf");
    expect(fs.existsSync(conegPath)).toBe(true);

    const conegContent = fs.readFileSync(conegPath, "utf-8");
    expect(conegContent).toContain("map $http_accept $conneg_suffix");
    expect(conegContent).toContain("default                          ttl;");
    expect(conegContent).toContain('"~text/html"                     html;');
    expect(conegContent).toContain('"~text/turtle"                   ttl;');
    expect(conegContent).toContain('"~application/ld\\+json"          jsonld;');
    expect(conegContent).toContain('"~application/rdf\\+xml"          rdf;');
    expect(conegContent).toContain('"~application/linkset\\+json"     linkset.json;');
  });

  it("generates valid nginx-headers.conf with RFC 8288 Link headers for /id/ paths", () => {
    const headersPath = path.join(distDir, "nginx-headers.conf");
    expect(fs.existsSync(headersPath)).toBe(true);

    const headersContent = fs.readFileSync(headersPath, "utf-8");
    expect(headersContent).toContain("location = /id/dataset/arms-mbon.html");
    expect(headersContent).toContain("location = /id/dataset/arms-mbon.ttl");
    expect(headersContent).toContain("location = /id/dataset/arms-mbon.jsonld");
    expect(headersContent).toContain("location = /id/dataset/arms-mbon.rdf");
    expect(headersContent).toContain("location = /id/dataset/arms-mbon.linkset.json");
    expect(headersContent).toContain("location = /api/observations/v1");
    expect(headersContent).toContain("location = /.well-known/api-catalog");
    expect(headersContent).toContain("return 307 $scheme://$http_host/api/observations/v1?marker_gene=18S&limit=20;");
    expect(headersContent).toContain('rel="cite-as"');
    expect(headersContent).toContain('rel="api-catalog"');
    expect(headersContent).toContain('rel="describes"');
    expect(headersContent).toContain('rel="collection"');
    expect(headersContent).toContain('rel="profile"');
    expect(headersContent).toContain('rel="describedby"; type="text/turtle"');
    expect(headersContent).toContain('rel="linkset"');
    expect(headersContent).toContain("location = /id/profiles");

    // Must NOT contain rfc9264 rel="type" on linkset headers
    expect(headersContent).not.toContain('https://www.rfc-editor.org/info/rfc9264');

    // /.well-known/api-catalog must NOT contain rel="api-catalog" to itself
    const apiCatalogBlock = headersContent.substring(
      headersContent.indexOf("location = /.well-known/api-catalog"),
      headersContent.indexOf("}", headersContent.indexOf("location = /.well-known/api-catalog"))
    );
    expect(apiCatalogBlock).not.toContain('rel="api-catalog"');
  });

  it("generates valid RFC 9727 API Catalog pointing to individual APIs via rel=item", () => {
    const catalogPath = path.join(distDir, ".well-known", "api-catalog");
    expect(fs.existsSync(catalogPath)).toBe(true);

    const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf-8"));
    expect(catalog.linkset).toBeDefined();
    expect(catalog.linkset[0].anchor).toBe("http://localhost:8080/.well-known/api-catalog");
    expect(catalog.linkset[0].item).toBeDefined();
    expect(catalog.linkset[0].item[0].href).toBe("http://localhost:8080/api/observations/v1");
  });

  it("generates valid RT-P05 API Linkset for marineinfo-api at /api/observations/v1.linkset.json", () => {
    const apiLinksetPath = path.join(distDir, "api", "observations", "v1.linkset.json");
    expect(fs.existsSync(apiLinksetPath)).toBe(true);

    const apiLinkset = JSON.parse(fs.readFileSync(apiLinksetPath, "utf-8"));
    expect(apiLinkset.linkset).toBeDefined();
    expect(apiLinkset.linkset[0].anchor).toBe("http://localhost:8080/api/observations/v1");
    expect(apiLinkset.linkset[0]["cite-as"][0].href).toBe("http://localhost:8080/id/dataset/arms-mbon");
    expect(apiLinkset.linkset[0]["api-catalog"][0].href).toBe("http://localhost:8080/.well-known/api-catalog");
    expect(apiLinkset.linkset[0]["service-desc"][0].href).toBe("http://localhost:8080/api/openapi.json");
    expect(apiLinkset.linkset[0]["service-doc"][0].href).toBe("http://localhost:8080/api/docs/");
    expect(apiLinkset.linkset[0]["service-meta"][0].href).toBe("http://localhost:8080/id/service/marineinfo-api.ttl");
  });

  it("generates clean sitemap.xml with ResourceSync rs:ln referencing base /id/ paths, rel=type, and rel=profile", () => {
    const sitemapPath = path.join(distDir, "sitemap.xml");
    expect(fs.existsSync(sitemapPath)).toBe(true);

    const sitemapContent = fs.readFileSync(sitemapPath, "utf-8");
    // Clean base PID in <loc>
    expect(sitemapContent).toContain("<loc>http://localhost:8080/id/dataset/arms-mbon</loc>");
    // arms-mbon showcases optional rel=type and alternate format links in the sitemap
    expect(sitemapContent).toContain('rel="type" href="https://schema.org/Dataset"');
    expect(sitemapContent).toContain('rel="alternate" href="http://localhost:8080/id/dataset/arms-mbon.html" type="text/html"');
    expect(sitemapContent).toContain('href="http://localhost:8080/id/dataset/arms-mbon.ttl"');

    // Other resources rely solely on their linkset and do not repeat rel=type or alternate format links
    expect(sitemapContent).toContain("<loc>http://localhost:8080/id/dataset/arms-2018</loc>");
    expect(sitemapContent).not.toContain('rel="alternate" href="http://localhost:8080/id/dataset/arms-2018.html"');
    expect(sitemapContent).toContain('rel="profile" href="http://localhost:8080/id/profile/marine-ecological-baseline-profile"');

    expect(sitemapContent).toContain("<loc>http://localhost:8080/id/profiles</loc>");

    // No xhtml namespace or elements, no invalid dcat-catalog rel
    expect(sitemapContent).not.toContain("xmlns:xhtml");
    expect(sitemapContent).not.toContain("xhtml:link");
    expect(sitemapContent).not.toContain('rel="dcat-catalog"');
  });

  it("generates RT-P07 sitemap-index.xml delegating to modular sub-sitemaps", () => {
    const sitemapIndexPath = path.join(distDir, "sitemap-index.xml");
    const sitemapDatasetsPath = path.join(distDir, "sitemap-datasets.xml");
    const sitemapProfilesPath = path.join(distDir, "sitemap-profiles.xml");
    const sitemapCatalogPath = path.join(distDir, "sitemap-catalog.xml");
    const robotsPath = path.join(distDir, "robots.txt");

    expect(fs.existsSync(sitemapIndexPath)).toBe(true);
    expect(fs.existsSync(sitemapDatasetsPath)).toBe(true);
    expect(fs.existsSync(sitemapProfilesPath)).toBe(true);
    expect(fs.existsSync(sitemapCatalogPath)).toBe(true);
    expect(fs.existsSync(robotsPath)).toBe(true);

    const indexXml = fs.readFileSync(sitemapIndexPath, "utf-8");
    expect(indexXml).toContain("<sitemapindex");
    expect(indexXml).toContain("<loc>http://localhost:8080/sitemap-datasets.xml</loc>");
    expect(indexXml).toContain("<loc>http://localhost:8080/sitemap-profiles.xml</loc>");
    expect(indexXml).toContain("<loc>http://localhost:8080/sitemap-catalog.xml</loc>");

    const robotsTxt = fs.readFileSync(robotsPath, "utf-8");
    expect(robotsTxt).toContain("Sitemap: http://localhost:8080/sitemap-index.xml");
    expect(robotsTxt).toContain("Sitemap: http://localhost:8080/sitemap.xml");
  });

  it("generates RT-P08 split linksets with rel=linkset in JSON master and rel=item in master HTTP headers", () => {
    const masterLinksetPath = path.join(distDir, "id", "dataset", "arms-mbon.linkset.json");
    const connegLinksetPath = path.join(distDir, "id", "dataset", "arms-mbon.conneg.linkset.json");
    const profilesLinksetPath = path.join(distDir, "id", "dataset", "arms-mbon.profiles.linkset.json");
    const provLinksetPath = path.join(distDir, "id", "dataset", "arms-mbon.provenance.linkset.json");

    expect(fs.existsSync(masterLinksetPath)).toBe(true);
    expect(fs.existsSync(connegLinksetPath)).toBe(true);
    expect(fs.existsSync(profilesLinksetPath)).toBe(true);
    expect(fs.existsSync(provLinksetPath)).toBe(true);

    const master = JSON.parse(fs.readFileSync(masterLinksetPath, "utf-8"));
    const masterLinksets = master.linkset[0].linkset;
    expect(masterLinksets.length).toBe(3);
    expect(masterLinksets[0].href).toContain("arms-mbon.conneg.linkset.json");
    expect(masterLinksets[1].href).toContain("arms-mbon.profiles.linkset.json");
    expect(masterLinksets[2].href).toContain("arms-mbon.provenance.linkset.json");

    // Master linkset anchor has cite-as pointing to DOI
    expect(master.linkset[0]["cite-as"][0].href).toBe("http://localhost:8080/doi/10.14284/578");

    // Master linkset HTTP headers contain child fragments as rel="item" and DOI as rel="cite-as"
    const headersConf = fs.readFileSync(path.join(distDir, "nginx-headers.conf"), "utf-8");
    const masterBlock = headersConf.substring(
      headersConf.indexOf("location = /id/dataset/arms-mbon.linkset.json"),
      headersConf.indexOf("}", headersConf.indexOf("location = /id/dataset/arms-mbon.linkset.json"))
    );
    expect(masterBlock).toContain('<http://localhost:8080/id/dataset/arms-mbon.conneg.linkset.json>; rel="item"');
    expect(masterBlock).toContain('<http://localhost:8080/id/dataset/arms-mbon.profiles.linkset.json>; rel="item"');
    expect(masterBlock).toContain('<http://localhost:8080/id/dataset/arms-mbon.provenance.linkset.json>; rel="item"');
    expect(masterBlock).toContain('<http://localhost:8080/doi/10.14284/578>; rel="cite-as"');
    expect(masterBlock).toContain('<http://localhost:8080/id/dataset/arms-mbon>; rel="describes"');

    const conneg = JSON.parse(fs.readFileSync(connegLinksetPath, "utf-8"));
    expect(conneg.linkset[0].collection[0].href).toBe("http://localhost:8080/id/dataset/arms-mbon.linkset.json");
    expect(conneg.linkset[0].alternate.length).toBeGreaterThan(0);

    const prov = JSON.parse(fs.readFileSync(provLinksetPath, "utf-8"));
    expect(prov.linkset[0].collection[0].href).toBe("http://localhost:8080/id/dataset/arms-mbon.linkset.json");
    expect(prov.linkset[0].author[0].href).toContain("/id/person/katrina");
  });

  it("generates RT-P04 physical data download payload files in dist/data/", () => {
    const zipPayload = path.join(distDir, "data", "arms-mbon-rocrate.zip");
    const csvPayload = path.join(distDir, "data", "arms-mbon-18s.csv");
    const geoJsonPayload = path.join(distDir, "data", "arms-mbon-stations.geojson");

    expect(fs.existsSync(zipPayload)).toBe(true);
    expect(fs.existsSync(csvPayload)).toBe(true);
    expect(fs.existsSync(geoJsonPayload)).toBe(true);

    const headersConf = fs.readFileSync(path.join(distDir, "nginx-headers.conf"), "utf-8");
    expect(headersConf).toContain('location = /data/arms-mbon-rocrate.zip');
    expect(headersConf).toContain('rel="cite-as"');
  });

  it("generates DOI-to-payload redirect map in nginx-coneg.conf", () => {
    const conegConf = fs.readFileSync(path.join(distDir, "nginx-coneg.conf"), "utf-8");
    expect(conegConf).toContain("map $uri $doi_payload_uri {");
    expect(conegConf).toContain('"/doi/10.3897/biss.6.94630" "/data/ro-crate-paper.pdf";');
    expect(conegConf).toContain('"/doi/10.14284/578" "/data/arms-mbon-18s.csv";');
    expect(conegConf).toContain('"/doi/10.14284/412" "/data/arms-2018-samples.csv";');
  });

  it("configures /doi/ routing block in nginx.conf", () => {
    const nginxConf = fs.readFileSync(path.resolve(process.cwd(), "nginx.conf"), "utf-8");
    expect(nginxConf).toContain("location ~ ^/doi/");
    expect(nginxConf).toContain("return 303 $scheme://$http_host$doi_payload_uri;");
  });

  it("generates RT-P04 signposting headers for ro-crate-paper.pdf in nginx-headers.conf", () => {
    const headersConf = fs.readFileSync(path.join(distDir, "nginx-headers.conf"), "utf-8");
    expect(headersConf).toContain("location = /data/ro-crate-paper.pdf");
    expect(headersConf).toContain('<http://localhost:8080/doi/10.3897/biss.6.94630>; rel="cite-as"');
    expect(headersConf).toContain('<http://localhost:8080/id/publication/ro-crate-paper.ttl>; rel="describedby"; type="text/turtle"');
    expect(headersConf).toContain('<http://localhost:8080/id/publication/ro-crate-paper.html>; rel="describedby"; type="text/html"');
    expect(headersConf).toContain('<http://localhost:8080/id/publication/ro-crate-paper.linkset.json>; rel="linkset"; type="application/linkset+json"');
  });

  it("anchors dataset payloads back to local DOI in cite-as header", () => {
    const headersConf = fs.readFileSync(path.join(distDir, "nginx-headers.conf"), "utf-8");
    expect(headersConf).toContain('<http://localhost:8080/doi/10.14284/578>; rel="cite-as"');
    expect(headersConf).toContain('<http://localhost:8080/doi/10.14284/412>; rel="cite-as"');
  });

  // RT-P09 Integration Tests
  it("generates Behavior A DOI mapping in nginx-coneg.conf for Dataset 90 series and releases", () => {
    const conegConf = fs.readFileSync(path.join(distDir, "nginx-coneg.conf"), "utf-8");
    expect(conegConf).toContain('"/doi/10.14284/90" "/data/dataset-90-v2.1.csv";');
    expect(conegConf).toContain('"/doi/10.14284/90.v1.0" "/data/dataset-90-v1.0.csv";');
    expect(conegConf).toContain('"/doi/10.14284/90.v2.0" "/data/dataset-90-v2.0.csv";');
    expect(conegConf).toContain('"/doi/10.14284/90.v2.1" "/data/dataset-90-v2.1.csv";');
  });

  it("generates RFC 8288 Link headers for Dataset 90 Series and Releases in nginx-headers.conf", () => {
    const headersConf = fs.readFileSync(path.join(distDir, "nginx-headers.conf"), "utf-8");
    // Series headers
    expect(headersConf).toContain('<http://localhost:8080/id/dataset/dataset-90/v2.1>; rel="latest-version"');
    expect(headersConf).toContain('<http://localhost:8080/id/dataset/dataset-90/history>; rel="version-history"');
    // Release headers
    expect(headersConf).toContain('<http://localhost:8080/id/dataset/dataset-90/v2.0>; rel="predecessor-version"');
    expect(headersConf).toContain('<http://localhost:8080/id/dataset/dataset-90>; rel="collection"');
    // History headers
    expect(headersConf).toContain('location = /id/dataset/dataset-90/history.linkset.json');
  });

  it("supports nested sub-resource routing in nginx.conf", () => {
    const nginxConf = fs.readFileSync(path.resolve(process.cwd(), "nginx.conf"), "utf-8");
    expect(nginxConf).toContain("location ~ ^/id/(?<res_type>[^/]+)/(?<res_name>[^/]+)/(?<res_sub>[^/.]+)$");
  });
});
