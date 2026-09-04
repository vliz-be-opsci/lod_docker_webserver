import { describe, it, expect } from "bun:test";
import { PROFILES, getProfileById } from "../generator/profiles";
import {
  generateProfileHtml,
  generateProfileCatalogHtml,
  generateProfileTurtle,
  generateProfileJsonLd,
  generateProfileLinkset
} from "../generator/profileGenerator";

describe("Profiles System & RT-P02 Composition", () => {
  it("contains defined atomic and composite profiles", () => {
    expect(PROFILES.length).toBeGreaterThanOrEqual(6);
    const genomicProfile = getProfileById("marine-genomic-dataset-profile");
    expect(genomicProfile).toBeDefined();
    expect(genomicProfile?.isAtomic).toBe(false);
    expect(genomicProfile?.composedProfiles?.length).toBe(4);
  });

  it("generates valid W3C dx-prof Turtle RDF with SHACL shapes under /id/profile/", () => {
    const genomicProfile = getProfileById("marine-genomic-dataset-profile")!;
    const ttl = generateProfileTurtle(genomicProfile, "http://localhost:8080");

    expect(ttl).toContain("http://localhost:8080/id/profile/marine-genomic-dataset-profile");
    expect(ttl).toContain("a prof:Profile ;");
    expect(ttl).toContain("prof:isProfileOf");
    expect(ttl).toContain("vliz:MarineGenomicShape");
  });

  it("generates RFC 9264 JSON Linkset encoding http://schema.org/hasPart sub-profile hierarchy under /id/profile/", () => {
    const genomicProfile = getProfileById("marine-genomic-dataset-profile")!;
    const linkset = generateProfileLinkset(genomicProfile, "http://localhost:8080");

    expect(linkset.linkset).toBeDefined();
    expect(linkset.linkset[0].anchor).toBe("http://localhost:8080/id/profile/marine-genomic-dataset-profile");
    expect(linkset.linkset[0].type).toEqual([
      { href: "https://www.rfc-editor.org/info/rfc6906", title: "RFC 6906 Profile Link Relation" },
      { href: "http://www.w3.org/ns/dx/prof/Profile", title: "W3C Profiles Vocabulary" }
    ]);
    expect(linkset.linkset[0].describedby).toBeDefined();
    expect(linkset.linkset[0].describedby[0].href).toBe("http://localhost:8080/id/profile/marine-genomic-dataset-profile.ttl");
    const ttlAnchor = linkset.linkset.find((e: any) => e.anchor === "http://localhost:8080/id/profile/marine-genomic-dataset-profile.ttl");
    expect(ttlAnchor).toBeDefined();
    expect(ttlAnchor.self[0].href).toBe("http://localhost:8080/id/profile/marine-genomic-dataset-profile");
    expect(ttlAnchor.profile[0].href).toBe("http://www.w3.org/ns/dx/prof/Profile");
    expect(linkset.linkset[0]["http://schema.org/hasPart"]).toBeDefined();
    expect(linkset.linkset[0]["http://schema.org/hasPart"][0].href).toBe("http://localhost:8080/id/profile/schema-dataset-profile");
  });

  it("generates profile Turtle with canonical URI for versioned profiles", () => {
    const dcat3 = getProfileById("dcat-dataset-profile-3.0.0")!;
    const ttl = generateProfileTurtle(dcat3, "http://localhost:8080");
    expect(ttl).toContain("<http://localhost:8080/id/profile/dcat-dataset-profile/3.0.0> a prof:Profile ;");
    expect(ttl).toContain("prof:hasArtifact <http://localhost:8080/id/profile/dcat-dataset-profile/3.0.0.ttl> ;");
  });

  it("renders profile catalog at /id/profiles and individual profile HTML", () => {
    const catalogHtml = generateProfileCatalogHtml(PROFILES, "http://localhost:8080");
    expect(catalogHtml).toContain("Semantic Profiles & Composition Registry");
    expect(catalogHtml).toContain("/id/profile/marine-genomic-dataset-profile.html");

    const genomicProfile = getProfileById("marine-genomic-dataset-profile")!;
    const profileHtml = generateProfileHtml(genomicProfile, "http://localhost:8080");
    expect(profileHtml).toContain("Marine Genomic & Metabarcoding Dataset Composite Profile");
    expect(profileHtml).toContain("/id/profile/marine-genomic-dataset-profile.ttl");
  });
});
