import { describe, it, expect } from "bun:test";
import { MetroMapGenerator } from "../../generator/metromap";
import { RESOURCES } from "../../generator/resources";

describe("MetroMapGenerator & Renderers", () => {
  it("renders well-formed HTML containing SVG canvas, controls, and script", () => {
    const generator = new MetroMapGenerator(RESOURCES, "http://localhost:8080");
    const html = generator.generateHtml("/");

    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("<svg id=\"metroSvg\"");
    expect(html).toContain("Origin URI:");
    expect(html).toContain("RT-P01: PROFILE CONFORMITY DECLARATIONS");
    expect(html).toContain("stationModal");
  });
});
