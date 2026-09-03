import { describe, it, expect } from "bun:test";
import { generateOpenApiSpec, generateSwaggerHtml, generateApiSampleResponses } from "../generator/openApiGenerator";
import { generateApiServiceLinkset } from "../generator/linksetGenerator";
import { getResourceById } from "../generator/resources";
import fs from "fs";
import path from "path";

describe("API Versioned Directory Co-location", () => {
  const baseUrl = "http://localhost:8080";
  const apiResource = getResourceById("resource-marineinfo-api")!;

  it("generates API linkset pointing to co-located v1 paths", () => {
    const linkset = generateApiServiceLinkset(apiResource, baseUrl) as any;
    const entry = linkset.linkset[0];

    expect(entry.anchor).toBe("http://localhost:8080/api/observations/v1");
    expect(entry["service-desc"][0].href).toBe("http://localhost:8080/api/observations/v1/openapi.json");
    expect(entry["service-doc"][0].href).toBe("http://localhost:8080/api/observations/v1/docs/");
    expect(entry["service-meta"][0].href).toBe("http://localhost:8080/api/observations/v1/meta.ttl");
  });

  it("generates Swagger UI pointing to co-located openapi.json", () => {
    const html = generateSwaggerHtml(baseUrl);
    expect(html).toContain("url: '/api/observations/v1/openapi.json'");
    expect(html).toContain('href="/api/observations/v1/openapi.json"');
  });

  it("writes data.json, openapi.json, meta.ttl, and docs in dist/api/observations/v1/", () => {
    const testDist = path.resolve(process.cwd(), "test-dist-api");
    if (fs.existsSync(testDist)) fs.rmSync(testDist, { recursive: true });

    generateApiSampleResponses(testDist, baseUrl);

    expect(fs.existsSync(path.join(testDist, "api", "observations", "v1", "data.json"))).toBe(true);
    expect(fs.existsSync(path.join(testDist, "api", "observations", "v1", "openapi.json"))).toBe(true);
    expect(fs.existsSync(path.join(testDist, "api", "observations", "v1", "meta.ttl"))).toBe(true);
    expect(fs.existsSync(path.join(testDist, "api", "observations", "v1", "docs", "index.html"))).toBe(true);

    const metaTtl = fs.readFileSync(path.join(testDist, "api", "observations", "v1", "meta.ttl"), "utf-8");
    expect(metaTtl).toContain("dcat:DataService");
    expect(metaTtl).toContain("http://localhost:8080/api/observations/v1/openapi.json");

    fs.rmSync(testDist, { recursive: true });
  });
});
