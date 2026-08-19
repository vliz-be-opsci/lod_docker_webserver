import { describe, it, expect } from "bun:test";
import { Specification } from "../../generator/metromap/models/Specification";
import { RTPattern } from "../../generator/metromap/models/RTPattern";
import { MetroNode } from "../../generator/metromap/models/MetroNode";
import { MetroTrack } from "../../generator/metromap/models/MetroTrack";
import { MetroGraph } from "../../generator/metromap/models/MetroGraph";

describe("MetroMap Domain Models", () => {
  it("creates Specification correctly", () => {
    const spec = new Specification(
      "RFC_9264",
      "RFC 9264",
      "Linkset",
      "IETF",
      "https://datatracker.ietf.org/doc/html/rfc9264",
      "JSON Linksets"
    );
    expect(spec.code).toBe("RFC 9264");
    expect(spec.publisher).toBe("IETF");
  });

  it("creates MetroNode and MetroTrack and aggregates in MetroGraph", () => {
    const spec = new Specification("RFC_8288", "RFC 8288", "Web Linking", "IETF", "", "Web Linking");
    const nodeA = new MetroNode("n1", "http://localhost/a", "Node A", "Sub A", "dataset", [spec], "Desc A");
    const nodeB = new MetroNode("n2", "http://localhost/b", "Node B", "Sub B", "linkset", [spec], "Desc B");

    const track = new MetroTrack("t1", nodeA, nodeB, "linkset", 'rel="linkset"', "#eab308", true);
    const pattern = new RTPattern("P1", 1, "Pattern 1", "Desc", [spec], "#0284c7", "#f0f9ff", () => true);

    const graph = new MetroGraph([nodeA, nodeB], [track], [pattern], "http://localhost/a");

    expect(graph.nodes.length).toBe(2);
    expect(graph.tracks.length).toBe(1);
    expect(graph.getNodeById("n1")).toBe(nodeA);
    expect(graph.getTracksForNode("n1").length).toBe(1);
  });
});
