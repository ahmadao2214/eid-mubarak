import { PRESETS, getPresetById } from "@/lib/presets";
import type { PresetId } from "@/types";

describe("Presets", () => {
  it("exports exactly 5 presets", () => {
    expect(PRESETS).toHaveLength(5);
  });

  it("each preset has required fields", () => {
    for (const preset of PRESETS) {
      expect(preset.id).toBeDefined();
      expect(preset.name).toBeDefined();
      expect(preset.description).toBeDefined();
      expect(preset.defaultProps).toBeDefined();
    }
  });

  it("each preset has standard dimensions", () => {
    for (const preset of PRESETS) {
      const { defaultProps } = preset;
      expect(defaultProps.width).toBe(1080);
      expect(defaultProps.height).toBe(1920);
      expect(defaultProps.fps).toBe(30);
      expect(defaultProps.durationInFrames).toBe(300);
    }
  });

  it("each preset has valid hue opacity (0-1)", () => {
    for (const preset of PRESETS) {
      expect(preset.defaultProps.hue.opacity).toBeGreaterThanOrEqual(0);
      expect(preset.defaultProps.hue.opacity).toBeLessThanOrEqual(1);
    }
  });

  it("each preset has valid head position (0-100)", () => {
    for (const preset of PRESETS) {
      const { position } = preset.defaultProps.head;
      expect(position.x).toBeGreaterThanOrEqual(0);
      expect(position.x).toBeLessThanOrEqual(100);
      expect(position.y).toBeGreaterThanOrEqual(0);
      expect(position.y).toBeLessThanOrEqual(100);
    }
  });

  describe("zohran-classic", () => {
    it("has gold hue, zoom-pulse head, psychedelic font, rose flower reveal", () => {
      const preset = getPresetById("zohran-classic");
      expect(preset).toBeDefined();
      expect(preset!.defaultProps.hue.color).toBe("#FFD700");
      expect(preset!.defaultProps.head.animation).toBe("zoom-pulse");
      expect(preset!.defaultProps.textSlots[0].fontFamily).toBe("psychedelic");
      expect(preset!.defaultProps.head.flowerReveal).toEqual({
        enabled: true,
        type: "rose",
      });
    });
  });

  describe("trucker-art", () => {
    it("has trucker-yellow hue, pop head, trucker-art font, lotus flower", () => {
      const preset = getPresetById("trucker-art");
      expect(preset).toBeDefined();
      expect(preset!.defaultProps.hue.color).toBe("#F5A623");
      expect(preset!.defaultProps.head.animation).toBe("pop");
      expect(preset!.defaultProps.textSlots[0].fontFamily).toBe("trucker-art");
      expect(preset!.defaultProps.head.flowerReveal).toEqual({
        enabled: true,
        type: "lotus",
      });
    });
  });

  describe("celebrity-greeting", () => {
    it("has gold hue, pop head, clean font, shadow text, two text slots", () => {
      const preset = getPresetById("celebrity-greeting");
      expect(preset).toBeDefined();
      expect(preset!.defaultProps.hue.color).toBe("#FFD700");
      expect(preset!.defaultProps.head.animation).toBe("pop");
      expect(preset!.defaultProps.textSlots[0].fontFamily).toBe("clean");
      expect(preset!.defaultProps.textSlots[0].shadow).toBe(true);
      expect(preset!.defaultProps.textSlots).toHaveLength(2);
    });
  });

  describe("six-head-spiral", () => {
    it("has pink hue, spiral-multiply head, bollywood font", () => {
      const preset = getPresetById("six-head-spiral");
      expect(preset).toBeDefined();
      expect(preset!.defaultProps.hue.color).toBe("#FF69B4");
      expect(preset!.defaultProps.head.animation).toBe("spiral-multiply");
      expect(preset!.defaultProps.head.animationConfig?.spiralCount).toBe(6);
      expect(preset!.defaultProps.textSlots[0].fontFamily).toBe("bollywood");
    });
  });

  describe("custom", () => {
    it("has hue disabled, pop head, clean font, no decorative elements", () => {
      const preset = getPresetById("custom");
      expect(preset).toBeDefined();
      expect(preset!.defaultProps.hue.enabled).toBe(false);
      expect(preset!.defaultProps.hue.color).toBe("none");
      expect(preset!.defaultProps.head.animation).toBe("pop");
      expect(preset!.defaultProps.textSlots[0].fontFamily).toBe("clean");
      expect(preset!.defaultProps.decorativeElements).toHaveLength(0);
    });
  });

  describe("getPresetById", () => {
    it("returns correct preset for valid id", () => {
      const ids: PresetId[] = [
        "zohran-classic",
        "trucker-art",
        "celebrity-greeting",
        "six-head-spiral",
        "custom",
      ];
      for (const id of ids) {
        const preset = getPresetById(id);
        expect(preset).toBeDefined();
        expect(preset!.id).toBe(id);
      }
    });

    it("returns undefined for invalid id", () => {
      const result = getPresetById("nonexistent" as PresetId);
      expect(result).toBeUndefined();
    });
  });
});
