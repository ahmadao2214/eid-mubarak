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
  test("zohran-classic uses psychedelic font, spiral-multiply head, cycle hue", () => {
    const p = getPreset("zohran-classic").defaultProps;
    expect(p.head.animation).toBe("spiral-multiply");
    expect(p.hue.animation).toBe("cycle");
    expect(p.textSlots[0].fontFamily).toBe("psychedelic");
    expect(p.textSlots).toHaveLength(2);
    expect(p.textSlots[0].text).toBe("EID");
    expect(p.textSlots[1].text).toBe("MUBARAK");
    expect(p.textSlots[0].group).toBe("greeting");
    expect(p.head.flowerReveal?.enabled).toBe(true);
    expect(p.head.flowerReveal?.type).toBe("sunflower");
    expect(p.head.flowerReveal?.videoSource).toBe("/assets/sunflower-bloom.mp4");
    expect(p.head.flowerReveal?.enterAtFrame).toBe(15);
    expect(p.head.enterAtFrame).toBe(45);
    expect(p.head.imageUrl).toBe("/assets/heads/zohran.jpg");
    // Rose-heart decorative element with exitAtFrame
    const roseHeart = p.decorativeElements.find((d) => d.animation === "rose-heart");
    expect(roseHeart).toBeDefined();
    expect(roseHeart!.exitAtFrame).toBe(45);
    // Visual refinement: larger head, orbit, text positions, roses
    expect(p.head.scale).toBe(0.85);
    expect(p.head.position).toEqual({ x: 50, y: 45 });
    expect(p.head.animationConfig?.orbitRadius).toBe(450);
    expect(p.head.animationConfig?.copyScale).toBe(0.5);
    expect(roseHeart!.scale).toBe(3.0);
    const cornerRoses = p.decorativeElements.filter((d) => d.animation !== "rose-heart");
    cornerRoses.forEach((r) => expect(r.scale).toBe(0.8));
    expect(p.textSlots[0].position.y).toBe(22);
    expect(p.textSlots[1].position.y).toBe(68);
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

  test("six-head-spiral uses spiral-multiply with 6 copies and orbit config", () => {
    const p = getPreset("six-head-spiral").defaultProps;
    expect(p.head.animation).toBe("spiral-multiply");
    expect(p.head.animationConfig?.spiralCount).toBe(6);
    expect(p.head.animationConfig?.orbitRadius).toBe(400);
    expect(p.head.animationConfig?.orbitSpeed).toBe(0.5);
    expect(p.head.animationConfig?.copyScale).toBe(0.5);
    expect(p.textSlots[0].fontFamily).toBe("bollywood");
  });

  test("custom has hue disabled and no decorations", () => {
    const p = getPreset("custom").defaultProps;
    expect(p.hue.enabled).toBe(false);
    expect(p.decorativeElements).toHaveLength(0);
    expect(p.textSlots[0].fontFamily).toBe("clean");
  });
});

describe("Default heads", () => {
  test("trucker-art has default head /assets/heads/mufti.jpg", () => {
    const p = getPreset("trucker-art").defaultProps;
    expect(p.head.imageUrl).toBe("/assets/heads/mufti.jpg");
  });

  test("celebrity-greeting has default head /assets/heads/srk.jpg", () => {
    const p = getPreset("celebrity-greeting").defaultProps;
    expect(p.head.imageUrl).toBe("/assets/heads/srk.jpg");
  });

  test("six-head-spiral has default head /assets/heads/drak-hijab.jpg", () => {
    const p = getPreset("six-head-spiral").defaultProps;
    expect(p.head.imageUrl).toBe("/assets/heads/drak-hijab.jpg");
  });
});
