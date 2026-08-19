import { MetroNode } from "./MetroNode";
import { MetroTrack } from "./MetroTrack";
import { RTPattern } from "./RTPattern";

export class MetroGraph {
  private nodeMap: Map<string, MetroNode> = new Map();

  constructor(
    public readonly nodes: MetroNode[] = [],
    public readonly tracks: MetroTrack[] = [],
    public readonly patterns: RTPattern[] = [],
    public readonly originUri: string = "/"
  ) {
    for (const node of nodes) {
      this.nodeMap.set(node.id, node);
    }
  }

  public getNodeById(id: string): MetroNode | undefined {
    return this.nodeMap.get(id);
  }

  public getNodeByUri(uri: string): MetroNode | undefined {
    return this.nodes.find(n => n.uri === uri || n.label === uri);
  }

  public getTracksForNode(nodeId: string): MetroTrack[] {
    return this.tracks.filter(t => t.source.id === nodeId || t.target.id === nodeId);
  }
}
