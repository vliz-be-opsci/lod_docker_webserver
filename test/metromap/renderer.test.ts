import { describe, it, expect } from "bun:test";
import { MetroMapGenerator } from "../../generator/metromap";
import { RESOURCES } from "../../generator/resources";

describe("MetroMapGenerator & Renderers", () => {
  it("renders well-formed HTML containing SVG canvas, controls, and script", () => {
    const generator = new MetroMapGenerator(RESOURCES, "http://localhost:8080");
    const html = generator.generateHtml("/");

    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("<svg id=\"metroSvg\"");
    expect(html).toContain("LAYER 1: HOSTWIDE DISCOVERY");
    expect(html).toContain("LAYER 2: CONTENT NEGOTIATION");
    expect(html).toContain("LAYER 3: PROFILES CONFORMITY");
    expect(html).toContain("LAYER 4: DIRECT DATA PAYLOADS");
    expect(html).toContain("Crawler Simulator");
    expect(html).toContain("simTerminalHud");
    expect(html).toContain("stationModal");
    expect(html).toContain("trackDrawer");
  });
});
