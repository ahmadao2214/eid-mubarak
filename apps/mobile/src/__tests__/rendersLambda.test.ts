import { describe, expect, it } from "vitest";
import { RENDER_CONFIG } from "../../convex/rendersLambda";

describe("RENDER_CONFIG", () => {
  it("uses parallelized framesPerLambda (not 300)", () => {
    expect(RENDER_CONFIG.framesPerLambda).toBe(20);
  });

  it("polls at 2000ms for responsive status updates", () => {
    expect(RENDER_CONFIG.pollIntervalMs).toBe(2000);
  });

  it("uses h264 codec", () => {
    expect(RENDER_CONFIG.codec).toBe("h264");
  });
});
