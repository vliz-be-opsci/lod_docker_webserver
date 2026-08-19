import { Specification } from "./Specification";

export type NodeCategory =
  | "domain"
  | "dataset"
  | "profile"
  | "linkset"
  | "distribution"
  | "api"
  | "institute"
  | "publication"
  | "person";

export class MetroNode {
  public x: number = 0;
  public y: number = 0;
  public lane: number = 0;
  public sublane: number = 0;

  constructor(
    public readonly id: string,
    public readonly uri: string,
    public readonly label: string,
    public readonly sublabel: string,
    public readonly category: NodeCategory,
    public readonly specs: Specification[] = [],
    public readonly description: string = "",
    public readonly liveUrl?: string,
    public readonly isOrigin: boolean = false
  ) {}
}
