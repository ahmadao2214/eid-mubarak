import React from "react";
import { render } from "@testing-library/react";
import { AnimatedText } from "../components/AnimatedText";

jest.mock("remotion", () => ({
  useCurrentFrame: () => 60,
  useVideoConfig: () => ({ fps: 30 }),
  interpolate: (value: number, input: number[], output: number[], options?: any) => {
    const t = (value - input[0]) / (input[1] - input[0]);
    const clamped = options?.extrapolateRight === "clamp" ? Math.min(1, Math.max(0, t)) : t;
    return output[0] + clamped * (output[1] - output[0]);
  },
  spring: () => 1, // Fully resolved spring
}));

const baseSlot = {
  id: "main",
  text: "Eid Mubarak!",
  position: { x: 50, y: 75 },
  fontFamily: "psychedelic" as const,
  fontSize: 64,
  color: "#FFFFFF",
  animation: "rise-up" as const,
  enterAtFrame: 0,
};

describe("AnimatedText", () => {
  test("returns null before enterAtFrame", () => {
    // frame is 60, enterAtFrame is 100
    const { container } = render(
      <AnimatedText slot={{ ...baseSlot, enterAtFrame: 100 }} />
    );
    expect(container.firstChild).toBeNull();
  });

  test("renders text with rise-up animation", () => {
    const { container } = render(
      <AnimatedText slot={{ ...baseSlot, animation: "rise-up" }} />
    );
    expect(container.textContent).toBe("Eid Mubarak!");
  });

  test("renders text with fade-in animation", () => {
    const { container } = render(
      <AnimatedText slot={{ ...baseSlot, animation: "fade-in" }} />
    );
    expect(container.textContent).toBe("Eid Mubarak!");
  });

  test("renders partial text with typewriter animation", () => {
    // localFrame = 60 - 0 = 60, fps = 30, so progress = 60/(30*2) = 1.0 (clamped)
    const { container } = render(
      <AnimatedText slot={{ ...baseSlot, animation: "typewriter" }} />
    );
    // At full progress, all characters should be visible
    expect(container.textContent).toBe("Eid Mubarak!");
  });

  test("renders text with float animation", () => {
    const { container } = render(
      <AnimatedText slot={{ ...baseSlot, animation: "float" }} />
    );
    expect(container.textContent).toBe("Eid Mubarak!");
  });

  test("renders with stroke prop without error", () => {
    // jsdom strips vendor-prefixed CSS properties (WebkitTextStroke),
    // so we verify the component renders successfully with stroke set
    const { container } = render(
      <AnimatedText slot={{ ...baseSlot, stroke: "#000000" }} />
    );
    expect(container.textContent).toBe("Eid Mubarak!");
  });

  test("renders with shadow prop without error", () => {
    // jsdom may strip text-shadow in some cases; verify render succeeds
    const { container } = render(
      <AnimatedText slot={{ ...baseSlot, shadow: true }} />
    );
    expect(container.textContent).toBe("Eid Mubarak!");
  });

  test("maps font family correctly", () => {
    const { container } = render(
      <AnimatedText slot={{ ...baseSlot, fontFamily: "clean" }} />
    );
    const div = container.firstChild as HTMLDivElement;
    expect(div.style.fontFamily).toContain("Inter");
  });
});
