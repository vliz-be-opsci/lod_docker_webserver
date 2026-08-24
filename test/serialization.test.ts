import { describe, it, expect } from "bun:test";
import { RESOURCES, getResourceById } from "../generator/resources";
import { serializeTurtle, serializeJsonLd, expandUri } from "../generator/rdfSerializer";
import { generateLinkset } from "../generator/linksetGenerator";

describe("RDF Serialization & Linkset Generation", () => {
  const dataset = getResourceById("resource-arms-mbon")!;

  it("expands resource IDs to /id/{type}/{name}", () => {
    const uri = expandUri("resource-arms-mbon", "http://localhost:8080");
    expect(uri).toBe("http://localhost:8080/id/dataset/arms-mbon");

    const personUri = expandUri("resource-katrina", "http://localhost:8080");
    expect(personUri).toBe("http://localhost:8080/id/person/katrina");

    const instituteUri = expandUri("resource-vliz", "http://localhost:8080");
    expect(instituteUri).toBe("http://localhost:8080/id/institute/vliz");
  });

  it("serializes Turtle with canonical /id/ subject and object URIs and schema:conformsTo", () => {
    const ttl = serializeTurtle(dataset, "http://localhost:8080");
    expect(ttl).toContain("<http://localhost:8080/id/dataset/arms-mbon>");
    expect(ttl).toContain("schema:publisher <http://localhost:8080/id/institute/vliz>");
    expect(ttl).toContain("schema:conformsTo <http://localhost:8080/id/profile/marine-genomic-dataset-profile>");
    expect(ttl).toContain("dcterms:conformsTo <http://localhost:8080/id/profile/marine-genomic-dataset-profile>");
  });

  it("serializes JSON-LD with @id and schema:conformsTo under /id/{type}/{name}", () => {
    const jsonldStr = serializeJsonLd(dataset, "http://localhost:8080");
    const jsonld = JSON.parse(jsonldStr);
    expect(jsonld["@id"]).toBe("http://localhost:8080/id/dataset/arms-mbon");
    expect(jsonld["schema:conformsTo"]["@id"]).toBe("http://localhost:8080/id/profile/marine-genomic-dataset-profile");
    expect(jsonld["dcterms:conformsTo"]["@id"]).toBe("http://localhost:8080/id/profile/marine-genomic-dataset-profile");
  });

  it("generates RFC 9264 Linkset with RT-P03 conneg menu and reverse self bindings", () => {
    const linkset = generateLinkset(dataset, "http://localhost:8080") as any;
    expect(linkset.linkset[0].anchor).toBe("http://localhost:8080/id/dataset/arms-mbon");
    expect(linkset.linkset[0].type[0].href).toBe("https://schema.org/Dataset");
    expect(linkset.linkset[0].profile[0].href).toBe("http://localhost:8080/id/profile/marine-genomic-dataset-profile");
    expect(linkset.linkset[0].alternate.some((a: any) => a.href === "http://localhost:8080/id/dataset/arms-mbon.ttl" && a.type.includes("text/turtle"))).toBe(true);
    expect(linkset.linkset[0].alternate.some((a: any) => a.href === "http://localhost:8080/id/dataset/arms-mbon.html")).toBe(true);
    expect(linkset.linkset.some((entry: any) => entry.anchor === "http://localhost:8080/id/dataset/arms-mbon.ttl" && entry.self[0].href === "http://localhost:8080/id/dataset/arms-mbon")).toBe(true);
    expect(linkset.linkset.some((entry: any) => entry.anchor === "http://localhost:8080/id/dataset/arms-mbon.jsonld" && entry.self[0].href === "http://localhost:8080/id/dataset/arms-mbon")).toBe(true);
    expect(linkset.linkset.some((entry: any) => entry.anchor === "http://localhost:8080/id/dataset/arms-mbon.html" && entry.self[0].href === "http://localhost:8080/id/dataset/arms-mbon")).toBe(true);
  });
});
