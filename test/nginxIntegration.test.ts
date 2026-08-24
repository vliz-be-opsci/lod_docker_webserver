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

  it("generates valid nginx-coneg.conf with conneg suffixes", () => {
    const conegPath = path.join(distDir, "nginx-coneg.conf");
    expect(fs.existsSync(conegPath)).toBe(true);

    const conegContent = fs.readFileSync(conegPath, "utf-8");
    expect(conegContent).toContain("map $http_accept $conneg_suffix");
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
    expect(headersContent).toContain('rel="describes"');
    expect(headersContent).toContain('rel="type"');
    expect(headersContent).toContain('rel="describedby"; type="text/turtle"');
    expect(headersContent).toContain('rel="linkset"');
    expect(headersContent).toContain("location = /id/profiles");
  });

  it("generates clean sitemap.xml with ResourceSync rs:ln referencing base /id/ paths and rel=type", () => {
    const sitemapPath = path.join(distDir, "sitemap.xml");
    expect(fs.existsSync(sitemapPath)).toBe(true);

    const sitemapContent = fs.readFileSync(sitemapPath, "utf-8");
    // Clean base PID in <loc>
    expect(sitemapContent).toContain("<loc>http://localhost:8080/id/dataset/arms-mbon</loc>");
    expect(sitemapContent).toContain('rel="alternate" href="http://localhost:8080/id/dataset/arms-mbon.html" type="text/html"');
    expect(sitemapContent).toContain('rel="type"');
    expect(sitemapContent).toContain('href="http://localhost:8080/id/dataset/arms-mbon.linkset.json"');
    expect(sitemapContent).toContain('href="http://localhost:8080/id/dataset/arms-mbon.ttl"');
    expect(sitemapContent).toContain("<loc>http://localhost:8080/id/profiles</loc>");

    // No xhtml namespace or elements, no invalid dcat-catalog rel
    expect(sitemapContent).not.toContain("xmlns:xhtml");
    expect(sitemapContent).not.toContain("xhtml:link");
    expect(sitemapContent).not.toContain('rel="dcat-catalog"');
    expect(sitemapContent).not.toContain('rel="profile"');
  });
});
