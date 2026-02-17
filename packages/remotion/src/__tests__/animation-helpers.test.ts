import {
  getFontFamily,
  clampPosition,
  sinPulse,
  frameProgress,
} from "../utils/animation-helpers";

describe("getFontFamily", () => {
  test("maps psychedelic to Bungee Shade", () => {
    expect(getFontFamily("psychedelic")).toContain("Bungee Shade");
  });

  test("maps classic to Playfair Display", () => {
    expect(getFontFamily("classic")).toContain("Playfair Display");
  });

  test("maps bollywood to Tiro Devanagari Hindi", () => {
    expect(getFontFamily("bollywood")).toContain("Tiro Devanagari Hindi");
  });

  test("maps clean to Inter", () => {
    expect(getFontFamily("clean")).toContain("Inter");
  });

  test("maps trucker-art to Monoton", () => {
    expect(getFontFamily("trucker-art")).toContain("Monoton");
  });
});

describe("clampPosition", () => {
  test("leaves valid positions unchanged", () => {
    expect(clampPosition({ x: 50, y: 50 })).toEqual({ x: 50, y: 50 });
    expect(clampPosition({ x: 0, y: 100 })).toEqual({ x: 0, y: 100 });
  });

  test("clamps negative values to 0", () => {
    expect(clampPosition({ x: -10, y: -5 })).toEqual({ x: 0, y: 0 });
  });

  test("clamps values above 100 to 100", () => {
    expect(clampPosition({ x: 150, y: 200 })).toEqual({ x: 100, y: 100 });
  });
});

describe("sinPulse", () => {
  test("returns value between 0 and 1", () => {
    for (let frame = 0; frame < 60; frame++) {
      const val = sinPulse(frame, 30);
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThanOrEqual(1);
    }
  });

  test("starts at 0.5 at frame 0", () => {
    // sin(0) = 0, so (0 + 1) / 2 = 0.5
    expect(sinPulse(0, 30)).toBeCloseTo(0.5);
  });
});

describe("frameProgress", () => {
  test("returns 0 before startFrame", () => {
    expect(frameProgress(0, 10, 20)).toBe(0);
    expect(frameProgress(9, 10, 20)).toBe(0);
  });

  test("returns 1 after endFrame", () => {
    expect(frameProgress(20, 10, 20)).toBe(1);
    expect(frameProgress(100, 10, 20)).toBe(1);
  });

  test("returns 0.5 at midpoint", () => {
    expect(frameProgress(15, 10, 20)).toBe(0.5);
  });

  test("returns correct progress in range", () => {
    expect(frameProgress(12, 10, 20)).toBeCloseTo(0.2);
    expect(frameProgress(18, 10, 20)).toBeCloseTo(0.8);
  });
});
