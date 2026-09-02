import { describe, expect, it } from "bun:test";
import { RESOURCES, getResourceById } from "../generator/resources";
import { PROFILES, getProfileById } from "../generator/profiles";
import { getEntityIdPath } from "../generator/types";

describe("RT-P09 Resource & Profile Modeling", () => {
  it("defines Dataset 90 series and 3 releases with valid lifecycle pointers", () => {
    const series = getResourceById("resource-dataset-90");
    expect(series).toBeDefined();
    expect(series?.latestVersionId).toBe("resource-dataset-90-v2.1");
    expect(series?.doi).toBe("https://doi.org/10.14284/90");

    const v1 = getResourceById("resource-dataset-90-v1.0");
    expect(v1).toBeDefined();
    expect(v1?.version).toBe("1.0");
    expect(v1?.seriesId).toBe("resource-dataset-90");
    expect(v1?.successorVersionId).toBe("resource-dataset-90-v2.0");

    const v2 = getResourceById("resource-dataset-90-v2.0");
    expect(v2?.predecessorVersionId).toBe("resource-dataset-90-v1.0");
    expect(v2?.successorVersionId).toBe("resource-dataset-90-v2.1");

    const v21 = getResourceById("resource-dataset-90-v2.1");
    expect(v21?.predecessorVersionId).toBe("resource-dataset-90-v2.0");
  });

  it("formats nested entity paths correctly", () => {
    const v21 = getResourceById("resource-dataset-90-v2.1")!;
    expect(getEntityIdPath(v21)).toBe("/id/dataset/dataset-90/v2.1");
  });

  it("defines RO-Crate abstract profile and releases", () => {
    const absProf = getProfileById("ro-crate-package-profile");
    expect(absProf).toBeDefined();
    expect(absProf?.latestVersionId).toBe("ro-crate-package-profile-v1.1");

    const v11 = getProfileById("ro-crate-package-profile-v1.1");
    expect(v11?.predecessorVersionId).toBe("ro-crate-package-profile-v1.0");
    expect(v11?.abstractProfileId).toBe("ro-crate-package-profile");
  });
});
