import { Colors } from "@/lib/colors";

describe("Color tokens", () => {
  const expectedTokens: Record<string, string> = {
    bgPrimary: "#0D4A3F",
    bgSurface: "#135C4D",
    bgSurfaceLight: "#1A6B5A",
    bgOverlay: "rgba(13,74,63,0.95)",
    gold: "#FFD700",
    goldMuted: "rgba(255,215,0,0.15)",
    textPrimary: "#FFFFFF",
    textSecondary: "#C8E6C9",
    textMuted: "#81B29A",
    textDisabled: "#5A8A78",
    borderSubtle: "rgba(255,255,255,0.1)",
    success: "#00C853",
    error: "#FF5252",
    pink: "#FF69B4",
  };

  it("exports all expected token keys", () => {
    for (const key of Object.keys(expectedTokens)) {
      expect(Colors).toHaveProperty(key);
    }
  });

  it("all token values are strings", () => {
    for (const value of Object.values(Colors)) {
      expect(typeof value).toBe("string");
    }
  });

  it.each(Object.entries(expectedTokens))(
    "%s equals %s",
    (key, expected) => {
      expect(Colors[key as keyof typeof Colors]).toBe(expected);
    },
  );

  it("does not contain old navy color #1a1a2e in any token", () => {
    for (const [key, value] of Object.entries(Colors)) {
      expect(value.toLowerCase()).not.toContain("#1a1a2e");
    }
  });
});
