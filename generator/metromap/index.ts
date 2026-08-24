import { Resource } from "../types";
import { MetroGraphBuilder } from "./engine/MetroGraphBuilder";
import { OctilinearLayoutEngine } from "./engine/OctilinearLayoutEngine";
import { HtmlPageRenderer } from "./renderers/HtmlPageRenderer";

export class MetroMapGenerator {
  private graphBuilder: MetroGraphBuilder;
  private layoutEngine: OctilinearLayoutEngine;
  private htmlRenderer: HtmlPageRenderer;

  constructor(private resources: Resource[], private baseUrl: string) {
    this.graphBuilder = new MetroGraphBuilder(resources, baseUrl);
    this.layoutEngine = new OctilinearLayoutEngine();
    this.htmlRenderer = new HtmlPageRenderer();
  }

  public generateHtml(entrypointUri: string = "/"): string {
    const graph = this.graphBuilder.buildGraph(entrypointUri);
    this.layoutEngine.computeLayout(graph, 1680);
    const bounds = this.layoutEngine.computePatternBounds(graph);
    const corridors = this.layoutEngine.computeCorridorBounds(1680);
    return this.htmlRenderer.renderPage(graph, bounds, corridors, this.baseUrl);
  }
}
