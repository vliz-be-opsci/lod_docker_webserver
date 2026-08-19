import { describe, it, expect } from "bun:test";
import { generateMetroMapHtml } from "../../generator/metroMapGenerator";

describe("E2E Metro Map Generator", () => {
  it("generates complete HTML for default root and dataset PIDs", () => {
    const rootHtml = generateMetroMapHtml("http://localhost:8080", "/");
    expect(rootHtml).toContain("<svg id=\"metroSvg\"");
    expect(rootHtml).toContain("RT-P01: PROFILE CONFORMITY DECLARATIONS");
    expect(rootHtml).toContain("RT-P03: CONTENT NEGOTIATION MENU");

    const pidHtml = generateMetroMapHtml("http://localhost:8080", "/resource/resource-arms-mbon");
    expect(pidHtml).toContain("/resource/resource-arms-mbon");
  });
});
