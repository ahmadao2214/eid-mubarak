import {
  compositionReducer,
  createInitialState,
  type CompositionState,
  type CompositionAction,
} from "@/context/CompositionContext";

describe("createInitialState", () => {
  it("returns state with null preset when no presetId given", () => {
    const state = createInitialState();
    expect(state.selectedPresetId).toBeNull();
    // Should use custom preset defaults when no preset given
    expect(state.composition.width).toBe(1080);
    expect(state.composition.height).toBe(1920);
  });

  it("returns state with correct preset when presetId given", () => {
    const state = createInitialState("zohran-classic");
    expect(state.selectedPresetId).toBe("zohran-classic");
    expect(state.composition.hue.color).toBe("#FFD700");
    expect(state.composition.head.animation).toBe("zoom-pulse");
  });

  it("preserves initial head image when provided", () => {
    const state = createInitialState("zohran-classic", "https://example.com/head.png");
    expect(state.composition.head.imageUrl).toBe("https://example.com/head.png");
  });
});

describe("compositionReducer", () => {
  let baseState: CompositionState;

  beforeEach(() => {
    baseState = createInitialState("zohran-classic");
  });

  describe("SELECT_PRESET", () => {
    it("switches to new preset defaultProps", () => {
      const next = compositionReducer(baseState, {
        type: "SELECT_PRESET",
        presetId: "trucker-art",
      });
      expect(next.selectedPresetId).toBe("trucker-art");
      expect(next.composition.hue.color).toBe("#F5A623");
      expect(next.composition.head.animation).toBe("pop");
    });

    it("preserves existing head imageUrl when switching presets", () => {
      const withImage = compositionReducer(baseState, {
        type: "SET_HEAD_IMAGE",
        imageUrl: "https://example.com/my-head.png",
      });
      const next = compositionReducer(withImage, {
        type: "SELECT_PRESET",
        presetId: "celebrity-greeting",
      });
      expect(next.composition.head.imageUrl).toBe("https://example.com/my-head.png");
    });
  });

  describe("SET_HEAD_IMAGE", () => {
    it("updates head imageUrl", () => {
      const next = compositionReducer(baseState, {
        type: "SET_HEAD_IMAGE",
        imageUrl: "https://example.com/face.png",
      });
      expect(next.composition.head.imageUrl).toBe("https://example.com/face.png");
    });
  });

  describe("UPDATE_TEXT_SLOT", () => {
    it("updates correct slot by id", () => {
      const next = compositionReducer(baseState, {
        type: "UPDATE_TEXT_SLOT",
        slotId: "main",
        text: "Happy Eid!",
      });
      const slot = next.composition.textSlots.find((s) => s.id === "main");
      expect(slot?.text).toBe("Happy Eid!");
    });

    it("does not modify other slots", () => {
      // Switch to celebrity-greeting which has 2 slots
      const celeb = createInitialState("celebrity-greeting");
      const next = compositionReducer(celeb, {
        type: "UPDATE_TEXT_SLOT",
        slotId: "greeting",
        text: "Changed!",
      });
      const subtitle = next.composition.textSlots.find(
        (s) => s.id === "subtitle"
      );
      expect(subtitle?.text).toBe("Wishing you joy and blessings");
    });
  });

  describe("SET_HUE_COLOR", () => {
    it("updates hue color and enables when not 'none'", () => {
      const next = compositionReducer(baseState, {
        type: "SET_HUE_COLOR",
        color: "#FF69B4",
      });
      expect(next.composition.hue.color).toBe("#FF69B4");
      expect(next.composition.hue.enabled).toBe(true);
    });

    it("disables hue when color is 'none'", () => {
      const next = compositionReducer(baseState, {
        type: "SET_HUE_COLOR",
        color: "none",
      });
      expect(next.composition.hue.color).toBe("none");
      expect(next.composition.hue.enabled).toBe(false);
    });
  });

  describe("SET_HUE_ANIMATION", () => {
    it("updates hue animation", () => {
      const next = compositionReducer(baseState, {
        type: "SET_HUE_ANIMATION",
        animation: "static",
      });
      expect(next.composition.hue.animation).toBe("static");
    });
  });

  describe("SET_HEAD_ANIMATION", () => {
    it("updates head animation type", () => {
      const next = compositionReducer(baseState, {
        type: "SET_HEAD_ANIMATION",
        animation: "spiral-multiply",
      });
      expect(next.composition.head.animation).toBe("spiral-multiply");
    });
  });

  describe("TOGGLE_FLOWER_REVEAL", () => {
    it("toggles enabled and sets type", () => {
      // Start with flower reveal enabled (zohran-classic has it)
      const next = compositionReducer(baseState, {
        type: "TOGGLE_FLOWER_REVEAL",
        enabled: false,
        flowerType: "rose",
      });
      expect(next.composition.head.flowerReveal?.enabled).toBe(false);
    });

    it("enables and sets flower type", () => {
      const customState = createInitialState("custom");
      const next = compositionReducer(customState, {
        type: "TOGGLE_FLOWER_REVEAL",
        enabled: true,
        flowerType: "sunflower",
      });
      expect(next.composition.head.flowerReveal?.enabled).toBe(true);
      expect(next.composition.head.flowerReveal?.type).toBe("sunflower");
    });
  });

  describe("SET_TEXT_FONT", () => {
    it("updates fontFamily for a slot", () => {
      const next = compositionReducer(baseState, {
        type: "SET_TEXT_FONT",
        slotId: "main",
        fontFamily: "bollywood",
      });
      const slot = next.composition.textSlots.find((s) => s.id === "main");
      expect(slot?.fontFamily).toBe("bollywood");
    });
  });

  describe("SET_TEXT_ANIMATION", () => {
    it("updates animation for a slot", () => {
      const next = compositionReducer(baseState, {
        type: "SET_TEXT_ANIMATION",
        slotId: "main",
        animation: "typewriter",
      });
      const slot = next.composition.textSlots.find((s) => s.id === "main");
      expect(slot?.animation).toBe("typewriter");
    });
  });

  describe("JSON round-trip", () => {
    it("serialize/deserialize matches", () => {
      const state = createInitialState("celebrity-greeting");
      const json = JSON.stringify(state.composition);
      const parsed = JSON.parse(json);
      expect(parsed).toEqual(state.composition);
    });
  });
});
