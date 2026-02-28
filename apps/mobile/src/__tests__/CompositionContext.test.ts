import {
  compositionReducer,
  createInitialState,
} from "@/context/CompositionContext";
import type { CompositionProps } from "@/types";

describe("CompositionContext reducer - UPDATE_GROUPED_TEXT", () => {
  test("updates all slots matching the group", () => {
    const state = createInitialState("zohran-classic");
    // zohran-classic has word-0 ("EID") and word-1 ("MUBARAK") both in group "greeting"
    expect(state.composition.textSlots[0].group).toBe("greeting");
    expect(state.composition.textSlots[1].group).toBe("greeting");

    const newState = compositionReducer(state, {
      type: "UPDATE_GROUPED_TEXT",
      group: "greeting",
      texts: ["HAPPY", "EID"],
    });

    expect(newState.composition.textSlots[0].text).toBe("HAPPY");
    expect(newState.composition.textSlots[1].text).toBe("EID");
  });

  test("does not affect slots without matching group (no group field)", () => {
    const state = createInitialState("celebrity-greeting");
    // celebrity-greeting has no grouped slots
    const originalTexts = state.composition.textSlots.map((s) => s.text);

    const newState = compositionReducer(state, {
      type: "UPDATE_GROUPED_TEXT",
      group: "greeting",
      texts: ["HELLO", "WORLD"],
    });

    const newTexts = newState.composition.textSlots.map((s) => s.text);
    expect(newTexts).toEqual(originalTexts);
  });
});

describe("CompositionContext reducer - SET_BACKGROUND", () => {
  test("replaces background while preserving other fields", () => {
    const state = createInitialState("zohran-classic");
    const originalHead: CompositionProps["head"] = state.composition.head;

    const newBackground: CompositionProps["background"] = {
      type: "image",
      source: "https://example.com/new-background.jpg",
      animation: "slow-zoom",
    };

    const next = compositionReducer(state, {
      type: "SET_BACKGROUND",
      background: newBackground,
    });

    expect(next.composition.background).toEqual(newBackground);
    expect(next.composition.head).toEqual(originalHead);
  });
});

describe("CompositionContext reducer - SELECT_PRESET head auto-select", () => {
  test("SELECT_PRESET with non-empty head uses preset's default head", () => {
    const state = createInitialState("custom");
    // custom has empty head, so state starts with ""
    expect(state.composition.head.imageUrl).toBe("");

    const newState = compositionReducer(state, {
      type: "SELECT_PRESET",
      presetId: "zohran-classic",
    });

    expect(newState.composition.head.imageUrl).toBe("/assets/heads/zohran.png");
  });

  test("SELECT_PRESET with empty head preserves previous head", () => {
    const state = createInitialState("zohran-classic");
    // Override head to a custom user image
    state.composition.head.imageUrl = "https://example.com/my-face.png";

    const newState = compositionReducer(state, {
      type: "SELECT_PRESET",
      presetId: "custom",
    });

    // custom preset has empty head, so previous head should be preserved
    expect(newState.composition.head.imageUrl).toBe("https://example.com/my-face.png");
  });

  test("SELECT_PRESET for trucker-art loads mufti head", () => {
    const state = createInitialState("custom");

    const newState = compositionReducer(state, {
      type: "SELECT_PRESET",
      presetId: "trucker-art",
    });

    expect(newState.composition.head.imageUrl).toBe("/assets/heads/mufti.png");
  });
});

describe("CompositionContext reducer - SET_AUDIO", () => {
  test("SET_AUDIO sets trackUrl and volume", () => {
    const state = createInitialState("zohran-classic");
    expect(state.composition.audio.trackUrl).toBe("");

    const newState = compositionReducer(state, {
      type: "SET_AUDIO",
      trackUrl: "https://cdn.example.com/takbeer.mp3",
      volume: 0.8,
    });

    expect(newState.composition.audio.trackUrl).toBe(
      "https://cdn.example.com/takbeer.mp3",
    );
    expect(newState.composition.audio.volume).toBe(0.8);
  });

  test("SET_AUDIO with empty trackUrl clears audio", () => {
    const state = createInitialState("zohran-classic");
    // First set audio
    const withAudio = compositionReducer(state, {
      type: "SET_AUDIO",
      trackUrl: "https://cdn.example.com/takbeer.mp3",
      volume: 0.8,
    });

    // Then clear it (selecting "No Sound")
    const cleared = compositionReducer(withAudio, {
      type: "SET_AUDIO",
      trackUrl: "",
      volume: 0,
    });

    expect(cleared.composition.audio.trackUrl).toBe("");
    expect(cleared.composition.audio.volume).toBe(0);
  });
});

describe("CompositionContext reducer - SET_HEAD_CROP", () => {
  test("SET_HEAD_CROP sets cropOffset on head", () => {
    const state = createInitialState("zohran-classic");
    expect(state.composition.head.cropOffset).toBeUndefined();

    const newState = compositionReducer(state, {
      type: "SET_HEAD_CROP",
      x: 30,
      y: 70,
    });

    expect(newState.composition.head.cropOffset).toEqual({ x: 30, y: 70 });
  });

  test("SET_HEAD_CROP clamps values to 0-100", () => {
    const state = createInitialState("zohran-classic");

    const clamped = compositionReducer(state, {
      type: "SET_HEAD_CROP",
      x: -20,
      y: 150,
    });

    expect(clamped.composition.head.cropOffset).toEqual({ x: 0, y: 100 });
  });

  test("SET_HEAD_CROP preserves other head properties", () => {
    const state = createInitialState("zohran-classic");
    const originalHead = { ...state.composition.head };

    const newState = compositionReducer(state, {
      type: "SET_HEAD_CROP",
      x: 40,
      y: 60,
    });

    expect(newState.composition.head.imageUrl).toBe(originalHead.imageUrl);
    expect(newState.composition.head.position).toEqual(originalHead.position);
    expect(newState.composition.head.scale).toBe(originalHead.scale);
    expect(newState.composition.head.animation).toBe(originalHead.animation);
    expect(newState.composition.head.cropOffset).toEqual({ x: 40, y: 60 });
  });
});
