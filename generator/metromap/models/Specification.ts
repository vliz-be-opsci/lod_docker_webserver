export class Specification {
  constructor(
    public readonly id: string,
    public readonly code: string,
    public readonly name: string,
    public readonly publisher: "IETF" | "W3C" | "OGC" | "Schema.org" | "Community",
    public readonly specUrl: string,
    public readonly description: string
  ) {}
}
