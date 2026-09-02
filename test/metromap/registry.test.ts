import { describe, it, expect } from "bun:test";
import { SPECS_REGISTRY, getSpecById } from "../../generator/metromap/registry/specsRegistry";
import { RT_PATTERNS_REGISTRY, getPatternById } from "../../generator/metromap/registry/rtPatternsRegistry";

describe("MetroMap Registries", () => {
  it("contains all core RFC and W3C specifications", () => {
    expect(SPECS_REGISTRY.RFC_8288).toBeDefined();
    expect(SPECS_REGISTRY.RFC_9264).toBeDefined();
    expect(SPECS_REGISTRY.RFC_9727).toBeDefined();
    expect(SPECS_REGISTRY.RFC_9110).toBeDefined();
    expect(SPECS_REGISTRY.RFC_6906).toBeDefined();
    expect(SPECS_REGISTRY.RFC_8574).toBeDefined();
    expect(SPECS_REGISTRY.RFC_6573).toBeDefined();
    expect(SPECS_REGISTRY.DCAT_3).toBeDefined();
    expect(SPECS_REGISTRY.RO_CRATE).toBeDefined();
    expect(SPECS_REGISTRY.RFC_5829).toBeDefined();

    expect(getSpecById("RFC_8288")?.code).toBe("RFC 8288");
    expect(getSpecById("RFC_5829")?.code).toBe("RFC 5829");
  });

  it("contains the 9 official EOSC Radical Transparency Patterns (RT-P01 through RT-P09)", () => {
    expect(RT_PATTERNS_REGISTRY.length).toBe(9);
    const p1 = getPatternById("RT_P01");
    expect(p1?.name).toBe("Profile Conformity Declarations");
    const p3 = getPatternById("RT_P03");
    expect(p3?.name).toBe("Content Negotiation Menu");
    const p5 = getPatternById("RT_P05");
    expect(p5?.name).toBe("Subsetting API");
    const p9 = getPatternById("RT_P09");
    expect(p9?.name).toBe("Release Linking");
  });
});
