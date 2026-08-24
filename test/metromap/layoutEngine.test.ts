import { describe, it, expect } from "bun:test";
import { MetroGraphBuilder } from "../../generator/metromap/engine/MetroGraphBuilder";
import { OctilinearLayoutEngine } from "../../generator/metromap/engine/OctilinearLayoutEngine";
import { RESOURCES } from "../../generator/resources";

describe("OctilinearLayoutEngine", () => {
  it("calculates valid lane positions and non-NaN track path points", () => {
    const builder = new MetroGraphBuilder(RESOURCES, "http://localhost:8080");
    const graph = builder.buildGraph("/");
    const layout = new OctilinearLayoutEngine();
    layout.computeLayout(graph);

    for (const node of graph.nodes) {
      expect(node.x).toBeGreaterThan(0);
      expect(node.y).toBeGreaterThan(0);
      expect(Number.isNaN(node.x)).toBe(false);
      expect(Number.isNaN(node.y)).toBe(false);
    }

    for (const track of graph.tracks) {
      expect(track.pathPoints.length).toBeGreaterThanOrEqual(2);
      for (const pt of track.pathPoints) {
        expect(Number.isNaN(pt.x)).toBe(false);
        expect(Number.isNaN(pt.y)).toBe(false);
      }
    }
  });

  it("calculates dynamic bounding boxes for active RT patterns", () => {
    const builder = new MetroGraphBuilder(RESOURCES, "http://localhost:8080");
    const graph = builder.buildGraph("/");
    const layout = new OctilinearLayoutEngine();
    layout.computeLayout(graph);

    const boxes = layout.computePatternBounds(graph);
    expect(boxes.length).toBeGreaterThan(0);
    for (const box of boxes) {
      expect(box.width).toBeGreaterThan(50);
      expect(box.height).toBeGreaterThan(50);
      expect(box.pattern).toBeDefined();
    }
  });

  it("calculates 4 distinct horizontal corridor swimlane boundaries", () => {
    const layout = new OctilinearLayoutEngine();
    const corridors = layout.computeCorridorBounds(1680);

    expect(corridors.length).toBe(4);
    expect(corridors[0].layer).toBe(1);
    expect(corridors[1].layer).toBe(2);
    expect(corridors[2].layer).toBe(3);
    expect(corridors[3].layer).toBe(4);

    // Verify distinct vertical offsets (Y positions increase sequentially)
    expect(corridors[1].y).toBeGreaterThan(corridors[0].y + corridors[0].height);
    expect(corridors[2].y).toBeGreaterThan(corridors[1].y + corridors[1].height);
    expect(corridors[3].y).toBeGreaterThan(corridors[2].y + corridors[2].height);
  });
});
