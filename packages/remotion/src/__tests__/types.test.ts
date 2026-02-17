import type {
  PresetId,
  HueColor,
  HueAnimation,
  HeadAnimationType,
  FlowerType,
  TextAnimation,
  FontStyle,
  BackgroundAnimation,
  DecorativeType,
} from "../types";

// Exhaustive switch helper — TypeScript will error if a case is missing
function assertNever(x: never): never {
  throw new Error(`Unexpected value: ${x}`);
}

describe("Union type exhaustiveness", () => {
  test("PresetId covers all variants", () => {
    const values: PresetId[] = [
      "zohran-classic",
      "trucker-art",
      "celebrity-greeting",
      "six-head-spiral",
      "custom",
    ];
    for (const v of values) {
      switch (v) {
        case "zohran-classic":
        case "trucker-art":
        case "celebrity-greeting":
        case "six-head-spiral":
        case "custom":
          break;
        default:
          assertNever(v);
      }
    }
    expect(values).toHaveLength(5);
  });

  test("HueColor covers all variants", () => {
    const values: HueColor[] = [
      "#FFD700",
      "#FF69B4",
      "#00C853",
      "#2196F3",
      "#F5A623",
      "none",
    ];
    for (const v of values) {
      switch (v) {
        case "#FFD700":
        case "#FF69B4":
        case "#00C853":
        case "#2196F3":
        case "#F5A623":
        case "none":
          break;
        default:
          assertNever(v);
      }
    }
    expect(values).toHaveLength(6);
  });

  test("HueAnimation covers all variants", () => {
    const values: HueAnimation[] = ["pulse", "static"];
    for (const v of values) {
      switch (v) {
        case "pulse":
        case "static":
          break;
        default:
          assertNever(v);
      }
    }
    expect(values).toHaveLength(2);
  });

  test("HeadAnimationType covers all variants", () => {
    const values: HeadAnimationType[] = [
      "pop",
      "zoom-pulse",
      "spiral-multiply",
      "float",
    ];
    for (const v of values) {
      switch (v) {
        case "pop":
        case "zoom-pulse":
        case "spiral-multiply":
        case "float":
          break;
        default:
          assertNever(v);
      }
    }
    expect(values).toHaveLength(4);
  });

  test("FlowerType covers all variants", () => {
    const values: FlowerType[] = ["rose", "sunflower", "lotus"];
    for (const v of values) {
      switch (v) {
        case "rose":
        case "sunflower":
        case "lotus":
          break;
        default:
          assertNever(v);
      }
    }
    expect(values).toHaveLength(3);
  });

  test("TextAnimation covers all variants", () => {
    const values: TextAnimation[] = ["fade-in", "rise-up", "typewriter", "float"];
    for (const v of values) {
      switch (v) {
        case "fade-in":
        case "rise-up":
        case "typewriter":
        case "float":
          break;
        default:
          assertNever(v);
      }
    }
    expect(values).toHaveLength(4);
  });

  test("FontStyle covers all variants", () => {
    const values: FontStyle[] = [
      "psychedelic",
      "classic",
      "bollywood",
      "clean",
      "trucker-art",
    ];
    for (const v of values) {
      switch (v) {
        case "psychedelic":
        case "classic":
        case "bollywood":
        case "clean":
        case "trucker-art":
          break;
        default:
          assertNever(v);
      }
    }
    expect(values).toHaveLength(5);
  });

  test("BackgroundAnimation covers all variants", () => {
    const values: BackgroundAnimation[] = ["slow-zoom", "pan-left", "static"];
    for (const v of values) {
      switch (v) {
        case "slow-zoom":
        case "pan-left":
        case "static":
          break;
        default:
          assertNever(v);
      }
    }
    expect(values).toHaveLength(3);
  });

  test("DecorativeType covers all variants", () => {
    const values: DecorativeType[] = ["lottie", "image"];
    for (const v of values) {
      switch (v) {
        case "lottie":
        case "image":
          break;
        default:
          assertNever(v);
      }
    }
    expect(values).toHaveLength(2);
  });
});
