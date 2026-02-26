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
    it("has gold hue, spiral-multiply head, cycle hue, psychedelic font, sunflower reveal, 2 text slots", () => {
      const preset = getPresetById("zohran-classic");
      expect(preset).toBeDefined();
      expect(preset!.defaultProps.hue.color).toBe("#FFD700");
      expect(preset!.defaultProps.hue.animation).toBe("cycle");
      expect(preset!.defaultProps.head.animation).toBe("spiral-multiply");
      expect(preset!.defaultProps.head.animationConfig?.spiralCount).toBe(6);
      expect(preset!.defaultProps.head.animationConfig?.orbitRadius).toBe(450);
      expect(preset!.defaultProps.textSlots[0].fontFamily).toBe("psychedelic");
      expect(preset!.defaultProps.textSlots).toHaveLength(2);
      expect(preset!.defaultProps.textSlots[0].text).toBe("EID");
      expect(preset!.defaultProps.textSlots[1].text).toBe("MUBARAK");
      expect(preset!.defaultProps.textSlots[0].group).toBe("greeting");
      expect(preset!.defaultProps.head.flowerReveal).toEqual({
        enabled: true,
        type: "sunflower",
      });
      expect(preset!.defaultProps.head.imageUrl).toBe("/assets/heads/zohran.jpg");
      const roseHeart = preset!.defaultProps.decorativeElements.find((d) => d.animation === "rose-heart");
      expect(roseHeart).toBeDefined();
      expect(roseHeart!.exitAtFrame).toBe(45);
      // Visual refinement: larger head, orbit, text positions, roses
      expect(preset!.defaultProps.head.scale).toBe(0.85);
      expect(preset!.defaultProps.textSlots[0].position.y).toBe(8);
      expect(preset!.defaultProps.textSlots[1].position.y).toBe(68);
      expect(roseHeart!.scale).toBe(3.0);
      const cornerRoses = preset!.defaultProps.decorativeElements.filter((d) => d.animation !== "rose-heart");
      cornerRoses.forEach((r) => expect(r.scale).toBe(0.8));
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
      expect(preset!.defaultProps.head.animationConfig?.orbitRadius).toBe(400);
      expect(preset!.defaultProps.head.animationConfig?.copyScale).toBe(0.5);
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

    it('is named "Blank Canvas"', () => {
      const preset = getPresetById("custom");
      expect(preset!.name).toBe("Blank Canvas");
    });

    it("has empty default head", () => {
      const preset = getPresetById("custom");
      expect(preset!.defaultProps.head.imageUrl).toBe("");
    });
  });

  describe("default heads", () => {
    it("trucker-art has default head /assets/heads/mufti.jpg", () => {
      const preset = getPresetById("trucker-art");
      expect(preset!.defaultProps.head.imageUrl).toBe("/assets/heads/mufti.jpg");
    });

    it("celebrity-greeting has default head /assets/heads/srk.jpg", () => {
      const preset = getPresetById("celebrity-greeting");
      expect(preset!.defaultProps.head.imageUrl).toBe("/assets/heads/srk.jpg");
    });

    it("six-head-spiral has default head /assets/heads/drak-hijab.jpg", () => {
      const preset = getPresetById("six-head-spiral");
      expect(preset!.defaultProps.head.imageUrl).toBe("/assets/heads/drak-hijab.jpg");
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
