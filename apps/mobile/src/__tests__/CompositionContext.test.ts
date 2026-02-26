import {
  compositionReducer,
  createInitialState,
} from "@/context/CompositionContext";

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

describe("CompositionContext reducer - SELECT_PRESET head auto-select", () => {
  test("SELECT_PRESET with non-empty head uses preset's default head", () => {
    const state = createInitialState("custom");
    // custom has empty head, so state starts with ""
    expect(state.composition.head.imageUrl).toBe("");

    const newState = compositionReducer(state, {
      type: "SELECT_PRESET",
      presetId: "zohran-classic",
    });

    expect(newState.composition.head.imageUrl).toBe("/assets/heads/zohran.jpg");
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

    expect(newState.composition.head.imageUrl).toBe("/assets/heads/mufti.jpg");
  });
});
