import { describe, it, expect } from "bun:test";
import { MetroGraphBuilder } from "../../generator/metromap/engine/MetroGraphBuilder";
import { RESOURCES } from "../../generator/resources";

describe("MetroGraphBuilder & Discovery Cascade", () => {
  it("builds domain-wide graph for root '/' entrypoint", () => {
    const builder = new MetroGraphBuilder(RESOURCES, "http://localhost:8080");
    const graph = builder.buildGraph("/");

    expect(graph.originUri).toBe("/");
    expect(graph.nodes.length).toBeGreaterThan(15);
    expect(graph.tracks.length).toBeGreaterThan(15);

    // Verify root domain nodes exist
    const rootNode = graph.nodes.find(n => n.id === "node-domain-root");
    expect(rootNode).toBeDefined();
    expect(rootNode?.isOrigin).toBe(true);

    const sitemapNode = graph.nodes.find(n => n.id === "node-sitemap");
    expect(sitemapNode).toBeDefined();

    const armsPidNode = graph.nodes.find(n => n.id === "node-_resource_resource-arms-mbon");
    expect(armsPidNode).toBeDefined();
  });

  it("builds focused subgraph when specific dataset PID is given as entrypoint", () => {
    const builder = new MetroGraphBuilder(RESOURCES, "http://localhost:8080");
    const graph = builder.buildGraph("/resource/resource-arms-mbon");

    expect(graph.originUri).toBe("/resource/resource-arms-mbon");
    const armsPidNode = graph.nodes.find(n => n.uri === "/resource/resource-arms-mbon");
    expect(armsPidNode).toBeDefined();
    expect(armsPidNode?.isOrigin).toBe(true);

    // Should include its distributions, formats, and linkset
    expect(graph.nodes.some(n => n.uri.includes("resource-arms-mbon.linkset.json"))).toBe(true);
    expect(graph.nodes.some(n => n.uri.includes("arms-mbon-18s.csv"))).toBe(true);
  });
});
