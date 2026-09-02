import { describe, expect, it } from "bun:test";
import { getResourceById, RESOURCES } from "../generator/resources";
import { generateLinkset, generateHistoryLinkset } from "../generator/linksetGenerator";
import { getProfileById, PROFILES } from "../generator/profiles";
import { generateProfileLinkset, generateProfileHistoryLinkset } from "../generator/profileGenerator";

describe("RT-P09 Standalone Linksets", () => {
  const BASE_URL = "http://localhost:8080";

  it("generates Series linkset with latest-version and version-history", () => {
    const series = getResourceById("resource-dataset-90")!;
    const ls: any = generateLinkset(series, BASE_URL);
    const anchor = ls.linkset[0];
    expect(anchor.anchor).toBe(`${BASE_URL}/id/dataset/dataset-90`);
    expect(anchor["latest-version"][0].href).toBe(`${BASE_URL}/id/dataset/dataset-90/v2.1`);
    expect(anchor["version-history"][0].href).toBe(`${BASE_URL}/id/dataset/dataset-90/history`);
    expect(anchor["cite-as"][0].href).toBe(`${BASE_URL}/doi/10.14284/90`);
  });

  it("generates Release v2.1 linkset with predecessor-version and collection", () => {
    const v21 = getResourceById("resource-dataset-90-v2.1")!;
    const ls: any = generateLinkset(v21, BASE_URL);
    const anchor = ls.linkset[0];
    expect(anchor.anchor).toBe(`${BASE_URL}/id/dataset/dataset-90/v2.1`);
    expect(anchor["predecessor-version"][0].href).toBe(`${BASE_URL}/id/dataset/dataset-90/v2.0`);
    expect(anchor["version-history"][0].href).toBe(`${BASE_URL}/id/dataset/dataset-90/history`);
    expect(anchor.collection[0].href).toBe(`${BASE_URL}/id/dataset/dataset-90`);
    expect(anchor["cite-as"][0].href).toBe(`${BASE_URL}/doi/10.14284/90.v2.1`);
  });

  it("generates History linkset with item entries containing version, release-date, and title", () => {
    const series = getResourceById("resource-dataset-90")!;
    const releases = [
      getResourceById("resource-dataset-90-v1.0")!,
      getResourceById("resource-dataset-90-v2.0")!,
      getResourceById("resource-dataset-90-v2.1")!
    ];
    const ls: any = generateHistoryLinkset(series, releases, BASE_URL);
    expect(ls.linkset[0].anchor).toBe(`${BASE_URL}/id/dataset/dataset-90/history`);
    expect(ls.linkset[0].item).toHaveLength(3);
    expect(ls.linkset[0].item[0].version).toBe("1.0");
    expect(ls.linkset[0].item[0]["release-date"]).toBe("2023-06-02");
    expect(ls.linkset[0].item[2].version).toBe("2.1");
  });

  it("generates Profile release linkset with rel=http://schema.org/hasPart pointing to abstract profile", () => {
    const v11 = getProfileById("ro-crate-package-profile-v1.1")!;
    const ls: any = generateProfileLinkset(v11, BASE_URL);
    const anchor = ls.linkset[0];
    expect(anchor["http://schema.org/hasPart"][0].href).toBe(`${BASE_URL}/id/profile/ro-crate-package-profile`);
    expect(anchor["predecessor-version"][0].href).toBe(`${BASE_URL}/id/profile/ro-crate-package-profile/v1.0`);
    expect(anchor["version-history"][0].href).toBe(`${BASE_URL}/id/profile/ro-crate-package-profile/history`);
  });

  it("generates Profile history linkset with item list", () => {
    const absProf = getProfileById("ro-crate-package-profile")!;
    const versions = [
      getProfileById("ro-crate-package-profile-v1.0")!,
      getProfileById("ro-crate-package-profile-v1.1")!
    ];
    const ls: any = generateProfileHistoryLinkset(absProf, versions, BASE_URL);
    expect(ls.linkset[0].anchor).toBe(`${BASE_URL}/id/profile/ro-crate-package-profile/history`);
    expect(ls.linkset[0].item).toHaveLength(2);
    expect(ls.linkset[0].item[0].version).toBe("1.0");
  });
});
