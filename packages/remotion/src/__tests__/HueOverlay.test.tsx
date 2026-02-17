import React from "react";
import { render } from "@testing-library/react";
import { HueOverlay } from "../components/HueOverlay";

jest.mock("remotion", () => ({
  AbsoluteFill: ({ children, style }: any) => (
    <div data-testid="hue-fill" style={style}>
      {children}
    </div>
  ),
  useCurrentFrame: () => 15,
  useVideoConfig: () => ({ fps: 30 }),
}));

describe("HueOverlay", () => {
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
});
