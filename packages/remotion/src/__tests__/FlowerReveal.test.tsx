import React from "react";
import { render } from "@testing-library/react";
import { FlowerReveal } from "../components/FlowerReveal";

jest.mock("remotion", () => ({
  useCurrentFrame: () => 30,
  useVideoConfig: () => ({ fps: 30 }),
  spring: () => 0.8,
}));

jest.mock("../utils/lottie-loader", () => ({
  useLottieData: () => null, // Always return null (placeholder fallback)
}));

const baseHead = {
  imageUrl: "https://example.com/face.png",
  position: { x: 50, y: 45 },
  scale: 0.4,
  enterAtFrame: 0,
  animation: "pop" as const,
};

describe("FlowerReveal", () => {
  test("returns null when flowerReveal is not enabled", () => {
    const { container } = render(
      <FlowerReveal head={{ ...baseHead, flowerReveal: { enabled: false, type: "rose" } }} />
    );
    expect(container.firstChild).toBeNull();
  });

  test("returns null when flowerReveal is undefined", () => {
    const { container } = render(<FlowerReveal head={baseHead} />);
    expect(container.firstChild).toBeNull();
  });

  test("returns null before enterAtFrame", () => {
    const { container } = render(
      <FlowerReveal
        head={{
          ...baseHead,
          enterAtFrame: 60,
          flowerReveal: { enabled: true, type: "rose" },
        }}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  test("renders SVG petal fallback for rose", () => {
    const { container } = render(
      <FlowerReveal
        head={{
          ...baseHead,
          flowerReveal: { enabled: true, type: "rose" },
        }}
      />
    );
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    // Rose has 8 petals
    const ellipses = container.querySelectorAll("ellipse");
    expect(ellipses).toHaveLength(8);
  });

  test("renders SVG petal fallback for sunflower", () => {
    const { container } = render(
      <FlowerReveal
        head={{
          ...baseHead,
          flowerReveal: { enabled: true, type: "sunflower" },
        }}
      />
    );
    // Sunflower has 12 petals
    const ellipses = container.querySelectorAll("ellipse");
    expect(ellipses).toHaveLength(12);
  });

  test("renders SVG petal fallback for lotus", () => {
    const { container } = render(
      <FlowerReveal
        head={{
          ...baseHead,
          flowerReveal: { enabled: true, type: "lotus" },
        }}
      />
    );
    // Lotus has 10 petals
    const ellipses = container.querySelectorAll("ellipse");
    expect(ellipses).toHaveLength(10);
  });
});
