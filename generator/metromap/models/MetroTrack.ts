import { MetroNode, NodeCategory } from "./MetroNode";

export class MetroTrack {
  public pathPoints: { x: number; y: number }[] = [];

  constructor(
    public readonly id: string,
    public readonly source: MetroNode,
    public readonly target: MetroNode,
    public readonly lineType: NodeCategory,
    public readonly relationLabel?: string,
    public readonly strokeColor?: string,
    public readonly isDashed: boolean = false,
    public readonly rfcRelation?: string,
    public readonly curlCommand?: string,
    public readonly httpHeader?: string
  ) {}
}
