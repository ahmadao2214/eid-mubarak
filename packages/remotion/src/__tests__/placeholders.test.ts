import {
  isPlaceholderSource,
  resolvePlaceholder,
  mountainRoadBackground,
  truckerPanelBackground,
  desertHighwayBackground,
  truckerArtBorder,
  truckerArtChain,
  truckerArtPeacock,
  crescentMoon,
  sparkleOverlay,
  roseHeart,
  kiteDiamond,
  goldParticlesDeterministic,
} from "../utils/placeholders";

describe("isPlaceholderSource", () => {
  test("returns true for placeholder: prefixed strings", () => {
    expect(isPlaceholderSource("placeholder:mountain-road")).toBe(true);
    expect(isPlaceholderSource("placeholder:anything")).toBe(true);
  });

  test("returns false for non-placeholder strings", () => {
    expect(isPlaceholderSource("https://example.com/image.png")).toBe(false);
    expect(isPlaceholderSource("")).toBe(false);
    expect(isPlaceholderSource("Placeholder:wrong-case")).toBe(false);
  });
});

describe("resolvePlaceholder", () => {
  test("resolves known placeholder keys to data URIs", () => {
    const keys = [
      "placeholder:mountain-road",
      "placeholder:trucker-panel",
      "placeholder:desert-highway",
      "placeholder:trucker-art-border",
      "placeholder:trucker-art-chain",
      "placeholder:trucker-art-peacock",
      "placeholder:crescent-moon",
      "placeholder:gold-particles",
      "placeholder:sparkle-overlay",
      "placeholder:rose-heart",
      "placeholder:kite-diamond",
    ];

    for (const key of keys) {
      const result = resolvePlaceholder(key);
      expect(result).not.toBeNull();
      expect(result).toMatch(/^data:image\/svg\+xml,/);
    }
  });

  test("returns null for unknown placeholder keys", () => {
    expect(resolvePlaceholder("placeholder:unknown")).toBeNull();
    expect(resolvePlaceholder("not-a-placeholder")).toBeNull();
  });
});

describe("SVG generators produce valid data URIs", () => {
  const generators = [
    { name: "mountainRoad", fn: mountainRoadBackground },
    { name: "truckerPanel", fn: truckerPanelBackground },
    { name: "desertHighway", fn: desertHighwayBackground },
    { name: "truckerArtBorder", fn: truckerArtBorder },
    { name: "truckerArtChain", fn: truckerArtChain },
    { name: "truckerArtPeacock", fn: truckerArtPeacock },
    { name: "crescentMoon", fn: crescentMoon },
    { name: "sparkleOverlay", fn: sparkleOverlay },
    { name: "roseHeart", fn: roseHeart },
    { name: "kiteDiamond", fn: kiteDiamond },
    { name: "goldParticles", fn: goldParticlesDeterministic },
  ];

  for (const { name, fn } of generators) {
    test(`${name} returns a data:image/svg+xml URI`, () => {
      const result = fn();
      expect(result).toMatch(/^data:image\/svg\+xml,/);
      // Decoded SVG should contain <svg
      const decoded = decodeURIComponent(result.replace("data:image/svg+xml,", ""));
      expect(decoded).toContain("<svg");
    });
  }
});
