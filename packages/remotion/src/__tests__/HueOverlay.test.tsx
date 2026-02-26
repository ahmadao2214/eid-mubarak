import React from "react";
import { render } from "@testing-library/react";
import { HueOverlay } from "../components/HueOverlay";

let mockFrame = 15;
jest.mock("remotion", () => ({
  AbsoluteFill: ({ children, style }: any) => (
    <div data-testid="hue-fill" style={style}>
      {children}
    </div>
  ),
  useCurrentFrame: () => mockFrame,
  useVideoConfig: () => ({ fps: 30 }),
}));

describe("HueOverlay", () => {
  beforeEach(() => {
    mockFrame = 15;
  });

  test("returns null when disabled", () => {
    const { container } = render(
      <HueOverlay
        hue={{ enabled: false, color: "#FFD700", opacity: 0.3, animation: "static" }}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  test("returns null when color is 'none'", () => {
    const { container } = render(
      <HueOverlay
        hue={{ enabled: true, color: "none", opacity: 0.3, animation: "static" }}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  test("renders overlay with static opacity", () => {
    const { getByTestId } = render(
      <HueOverlay
        hue={{ enabled: true, color: "#FFD700", opacity: 0.3, animation: "static" }}
      />
    );
    const fill = getByTestId("hue-fill");
    // jsdom normalizes hex to rgb
    expect(fill.style.backgroundColor).toBe("rgb(255, 215, 0)");
    expect(fill.style.mixBlendMode).toBe("overlay");
    expect(parseFloat(fill.style.opacity)).toBeCloseTo(0.3);
  });

  test("renders overlay with pulse animation (opacity varies)", () => {
    const { getByTestId } = render(
      <HueOverlay
        hue={{ enabled: true, color: "#FF69B4", opacity: 0.4, animation: "pulse" }}
      />
    );
    const fill = getByTestId("hue-fill");
    const opacity = parseFloat(fill.style.opacity);
    // Pulse oscillates between opacity*0.5 and opacity
    expect(opacity).toBeGreaterThanOrEqual(0.2 - 0.01);
    expect(opacity).toBeLessThanOrEqual(0.4 + 0.01);
  });

  test("cycle mode applies hue-rotate filter that changes over frames", () => {
    mockFrame = 0;
    const { getByTestId } = render(
      <HueOverlay
        hue={{ enabled: true, color: "#FFD700", opacity: 0.35, animation: "cycle" }}
      />
    );
    const fill = getByTestId("hue-fill");
    expect(fill.style.filter).toContain("hue-rotate(");
    // At frame 0, hue-rotate should be 0deg
    expect(fill.style.filter).toBe("hue-rotate(0deg)");
  });

  test("cycle mode completes 360deg rotation over ~4 seconds (120 frames)", () => {
    // At frame 60 (2 seconds at 30fps) = half cycle = 180deg
    mockFrame = 60;
    const { getByTestId } = render(
      <HueOverlay
        hue={{ enabled: true, color: "#FFD700", opacity: 0.35, animation: "cycle" }}
      />
    );
    const fill = getByTestId("hue-fill");
    expect(fill.style.filter).toBe("hue-rotate(180deg)");
  });

  test("pulse mode does not apply hue-rotate filter (regression)", () => {
    mockFrame = 15;
    const { getByTestId } = render(
      <HueOverlay
        hue={{ enabled: true, color: "#FFD700", opacity: 0.3, animation: "pulse" }}
      />
    );
    const fill = getByTestId("hue-fill");
    expect(fill.style.filter).toBeFalsy();
  });

  test("static mode does not apply hue-rotate filter (regression)", () => {
    mockFrame = 0;
    const { getByTestId } = render(
      <HueOverlay
        hue={{ enabled: true, color: "#FFD700", opacity: 0.3, animation: "static" }}
      />
    );
    const fill = getByTestId("hue-fill");
    expect(fill.style.filter).toBeFalsy();
  });
});
