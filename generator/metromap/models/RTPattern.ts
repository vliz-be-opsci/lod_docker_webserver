import { Specification } from "./Specification";
import { MetroNode } from "./MetroNode";

export class RTPattern {
  constructor(
    public readonly id: string,
    public readonly number: number,
    public readonly name: string,
    public readonly description: string,
    public readonly specs: Specification[],
    public readonly themeColor: string,
    public readonly bgTint: string,
    public readonly matchesNode: (node: MetroNode) => boolean
  ) {}
}
