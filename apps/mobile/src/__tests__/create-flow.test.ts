import {
  compositionReducer,
  createInitialState,
} from "@/context/CompositionContext";
import { PRESETS } from "@/lib/presets";
import type { PresetId } from "@/types";

describe("Create flow integration", () => {
  it("full flow: select preset → set image → customize → produces valid CompositionProps", () => {
    // Step 1: Start with no preset
    let state = createInitialState();
    expect(state.selectedPresetId).toBeNull();

    // Select a preset
    state = compositionReducer(state, {
      type: "SELECT_PRESET",
      presetId: "zohran-classic",
    });
    expect(state.selectedPresetId).toBe("zohran-classic");

    // Set head image
    state = compositionReducer(state, {
      type: "SET_HEAD_IMAGE",
      imageUrl: "https://example.com/my-head.png",
    });
    expect(state.composition.head.imageUrl).toBe(
      "https://example.com/my-head.png",
    );

    // Step 2: Customize text
    state = compositionReducer(state, {
      type: "UPDATE_TEXT_SLOT",
      slotId: "main",
      text: "Eid Mubarak, Bhai!",
    });
    expect(
      state.composition.textSlots.find((s) => s.id === "main")?.text,
    ).toBe("Eid Mubarak, Bhai!");

    // Change hue
    state = compositionReducer(state, {
      type: "SET_HUE_COLOR",
      color: "#FF69B4",
    });
    expect(state.composition.hue.color).toBe("#FF69B4");
    expect(state.composition.hue.enabled).toBe(true);

    // Change head animation
    state = compositionReducer(state, {
      type: "SET_HEAD_ANIMATION",
      animation: "spiral-multiply",
    });
    expect(state.composition.head.animation).toBe("spiral-multiply");

    // Toggle flower reveal
    state = compositionReducer(state, {
      type: "TOGGLE_FLOWER_REVEAL",
      enabled: true,
      flowerType: "sunflower",
    });
    expect(state.composition.head.flowerReveal?.enabled).toBe(true);
    expect(state.composition.head.flowerReveal?.type).toBe("sunflower");

    // Change font
    state = compositionReducer(state, {
      type: "SET_TEXT_FONT",
      slotId: "main",
      fontFamily: "bollywood",
    });
    expect(
      state.composition.textSlots.find((s) => s.id === "main")?.fontFamily,
    ).toBe("bollywood");

    // Step 3: Validate final composition
    const c = state.composition;
    expect(c.width).toBe(1080);
    expect(c.height).toBe(1920);
    expect(c.fps).toBe(30);
    expect(c.durationInFrames).toBe(300);
    expect(c.head.imageUrl).toBeTruthy();
  });

  it("validates all fields in range", () => {
    for (const preset of PRESETS) {
      const state = createInitialState(preset.id as PresetId);
      const c = state.composition;

      // Dimensions positive
      expect(c.width).toBeGreaterThan(0);
      expect(c.height).toBeGreaterThan(0);
      expect(c.fps).toBeGreaterThan(0);
      expect(c.durationInFrames).toBeGreaterThan(0);

      // Opacity in range
      expect(c.hue.opacity).toBeGreaterThanOrEqual(0);
      expect(c.hue.opacity).toBeLessThanOrEqual(1);

      // Head position in range
      expect(c.head.position.x).toBeGreaterThanOrEqual(0);
      expect(c.head.position.x).toBeLessThanOrEqual(100);
      expect(c.head.position.y).toBeGreaterThanOrEqual(0);
      expect(c.head.position.y).toBeLessThanOrEqual(100);

      // Text slot positions in range
      for (const slot of c.textSlots) {
        expect(slot.position.x).toBeGreaterThanOrEqual(0);
        expect(slot.position.x).toBeLessThanOrEqual(100);
        expect(slot.position.y).toBeGreaterThanOrEqual(0);
        expect(slot.position.y).toBeLessThanOrEqual(100);
      }

      // Decorative element positions in range
      for (const el of c.decorativeElements) {
        expect(el.position.x).toBeGreaterThanOrEqual(0);
        expect(el.position.x).toBeLessThanOrEqual(100);
        expect(el.position.y).toBeGreaterThanOrEqual(0);
        expect(el.position.y).toBeLessThanOrEqual(100);
      }

      // Audio volume in range
      expect(c.audio.volume).toBeGreaterThanOrEqual(0);
      expect(c.audio.volume).toBeLessThanOrEqual(1);
    }
  });

  it("JSON round-trip matches for all presets", () => {
    for (const preset of PRESETS) {
      const state = createInitialState(preset.id as PresetId);
      const json = JSON.stringify(state.composition);
      const parsed = JSON.parse(json);
      expect(parsed).toEqual(state.composition);
    }
  });

  it("switching preset preserves head image", () => {
    let state = createInitialState("zohran-classic");
    state = compositionReducer(state, {
      type: "SET_HEAD_IMAGE",
      imageUrl: "https://example.com/face.png",
    });

    // Switch through all presets
    const presetIds: PresetId[] = [
      "trucker-art",
      "celebrity-greeting",
      "six-head-spiral",
      "custom",
    ];

    for (const id of presetIds) {
      state = compositionReducer(state, {
        type: "SELECT_PRESET",
        presetId: id,
      });
      expect(state.composition.head.imageUrl).toBe(
        "https://example.com/face.png",
      );
      expect(state.selectedPresetId).toBe(id);
    }
  });
});
