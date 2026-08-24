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

    const armsPidNode = graph.nodes.find(n => n.id === "node-_id_dataset_arms-mbon");
    expect(armsPidNode).toBeDefined();

    // Verify 4 layers assignment
    expect(rootNode?.layer).toBe(1);
    expect(armsPidNode?.layer).toBe(2);
    const profileNode = graph.nodes.find(n => n.uri.includes("/id/profile/"));
    if (profileNode) expect(profileNode.layer).toBe(3);
    const payloadNode = graph.nodes.find(n => n.uri.includes("/data/"));
    if (payloadNode) expect(payloadNode.layer).toBe(4);

    // Verify track metadata
    const apiTrack = graph.tracks.find(t => t.relationLabel?.includes("rel="));
    expect(apiTrack).toBeDefined();
    expect(apiTrack?.curlCommand).toContain("curl -I");
    expect(apiTrack?.httpHeader).toContain("Link:");
  });

  it("builds focused subgraph when specific dataset PID is given as entrypoint", () => {
    const builder = new MetroGraphBuilder(RESOURCES, "http://localhost:8080");
    const graph = builder.buildGraph("/id/dataset/arms-mbon");

    expect(graph.originUri).toBe("/id/dataset/arms-mbon");
    const armsPidNode = graph.nodes.find(n => n.uri === "/id/dataset/arms-mbon");
    expect(armsPidNode).toBeDefined();
    expect(armsPidNode?.isOrigin).toBe(true);
    expect(armsPidNode?.layer).toBe(2);

    // Should include its distributions, formats, and linkset
    expect(graph.nodes.some(n => n.uri.includes("arms-mbon.linkset.json"))).toBe(true);
    expect(graph.nodes.some(n => n.uri.includes("arms-mbon-18s.csv"))).toBe(true);
  });
});
