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

  it("generates RFC 9264 JSON Linkset encoding rel=\"item\" sub-profile hierarchy under /id/profile/", () => {
    const genomicProfile = getProfileById("marine-genomic-dataset-profile")!;
    const linkset = generateProfileLinkset(genomicProfile, "http://localhost:8080");

    expect(linkset.linkset).toBeDefined();
    expect(linkset.linkset[0].anchor).toBe("http://localhost:8080/id/profile/marine-genomic-dataset-profile");
    expect(linkset.linkset[0]["http://www.w3.org/1999/xhtml/vocab#item"]).toBeDefined();
    expect(linkset.linkset[0]["http://www.w3.org/1999/xhtml/vocab#item"][0].href).toContain("/id/profile/schema-dataset-profile.html");
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
