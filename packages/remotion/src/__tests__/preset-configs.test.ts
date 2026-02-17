import { PRESET_REGISTRY, getPreset, validatePresetConfig } from "../templates";
import type { PresetId } from "../types";

const ALL_PRESET_IDS: PresetId[] = [
  "zohran-classic",
  "trucker-art",
  "celebrity-greeting",
  "six-head-spiral",
  "custom",
];

describe("Preset Registry", () => {
  test("contains all 5 presets", () => {
    expect(Object.keys(PRESET_REGISTRY)).toHaveLength(5);
    for (const id of ALL_PRESET_IDS) {
      expect(PRESET_REGISTRY[id]).toBeDefined();
    }
  });

  test("getPreset returns correct preset for each id", () => {
    for (const id of ALL_PRESET_IDS) {
      const preset = getPreset(id);
      expect(preset.id).toBe(id);
    }
  });
});

describe("Preset validation", () => {
  for (const id of ALL_PRESET_IDS) {
    test(`${id} passes schema validation`, () => {
      const preset = getPreset(id);
      const errors = validatePresetConfig(preset);
      expect(errors).toEqual([]);
    });
  }
});

describe("Preset structure", () => {
  for (const id of ALL_PRESET_IDS) {
    test(`${id} has standard video dimensions`, () => {
      const { defaultProps } = getPreset(id);
      expect(defaultProps.width).toBe(1080);
      expect(defaultProps.height).toBe(1920);
      expect(defaultProps.fps).toBe(30);
      expect(defaultProps.durationInFrames).toBe(300);
    });

    test(`${id} has at least one text slot`, () => {
      const { defaultProps } = getPreset(id);
      expect(defaultProps.textSlots.length).toBeGreaterThanOrEqual(1);
    });

    test(`${id} has valid audio volume`, () => {
      const { defaultProps } = getPreset(id);
      expect(defaultProps.audio.volume).toBeGreaterThanOrEqual(0);
      expect(defaultProps.audio.volume).toBeLessThanOrEqual(1);
    });
  }
});

describe("Preset-specific values", () => {
  test("zohran-classic uses psychedelic font and zoom-pulse head", () => {
    const p = getPreset("zohran-classic").defaultProps;
    expect(p.head.animation).toBe("zoom-pulse");
    expect(p.textSlots[0].fontFamily).toBe("psychedelic");
    expect(p.head.flowerReveal?.enabled).toBe(true);
    expect(p.head.flowerReveal?.type).toBe("rose");
  });

  test("trucker-art uses trucker-art font and pop head", () => {
    const p = getPreset("trucker-art").defaultProps;
    expect(p.head.animation).toBe("pop");
    expect(p.textSlots[0].fontFamily).toBe("trucker-art");
    expect(p.head.flowerReveal?.enabled).toBe(true);
    expect(p.head.flowerReveal?.type).toBe("lotus");
    expect(p.decorativeElements.length).toBeGreaterThanOrEqual(3);
  });

  test("celebrity-greeting uses clean font and 2 text slots", () => {
    const p = getPreset("celebrity-greeting").defaultProps;
    expect(p.head.animation).toBe("pop");
    expect(p.textSlots[0].fontFamily).toBe("clean");
    expect(p.textSlots).toHaveLength(2);
    expect(p.head.flowerReveal).toBeUndefined();
  });

  test("six-head-spiral uses spiral-multiply with 6 copies", () => {
    const p = getPreset("six-head-spiral").defaultProps;
    expect(p.head.animation).toBe("spiral-multiply");
    expect(p.head.animationConfig?.spiralCount).toBe(6);
    expect(p.textSlots[0].fontFamily).toBe("bollywood");
  });

  test("custom has hue disabled and no decorations", () => {
    const p = getPreset("custom").defaultProps;
    expect(p.hue.enabled).toBe(false);
    expect(p.decorativeElements).toHaveLength(0);
    expect(p.textSlots[0].fontFamily).toBe("clean");
  });
});
