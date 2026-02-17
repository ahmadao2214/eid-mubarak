import React from "react";
import { render } from "@testing-library/react";
import { BackgroundLayer } from "../components/BackgroundLayer";

// Mock remotion hooks
jest.mock("remotion", () => ({
  AbsoluteFill: ({ children, style }: any) => (
    <div data-testid="absolute-fill" style={style}>
      {children}
    </div>
  ),
  Img: ({ src, style }: any) => <img data-testid="bg-img" src={src} style={style} />,
  useCurrentFrame: () => 30,
  useVideoConfig: () => ({ durationInFrames: 300, fps: 30, width: 1080, height: 1920 }),
  interpolate: jest.fn((value: number, input: number[], output: number[], options?: any) => {
    const t = (value - input[0]) / (input[1] - input[0]);
    const clamped = options?.extrapolateRight === "clamp" ? Math.min(1, Math.max(0, t)) : t;
    return output[0] + clamped * (output[1] - output[0]);
  }),
}));

describe("BackgroundLayer", () => {
  test("renders solid color background", () => {
    const { getByTestId } = render(
      <BackgroundLayer background={{ type: "solid", source: "#1a1a2e" }} />
    );
    const fill = getByTestId("absolute-fill");
    // jsdom normalizes hex to rgb
    expect(fill.style.backgroundColor).toBe("rgb(26, 26, 46)");
  });

  test("renders image background", () => {
    const { getByTestId } = render(
      <BackgroundLayer
        background={{ type: "image", source: "https://example.com/bg.jpg" }}
      />
    );
    const img = getByTestId("bg-img");
    expect(img.getAttribute("src")).toBe("https://example.com/bg.jpg");
  });

  test("renders placeholder background with resolved SVG", () => {
    const { getByTestId } = render(
      <BackgroundLayer
        background={{
          type: "image",
          source: "placeholder:mountain-road",
          animation: "static",
        }}
      />
    );
    const img = getByTestId("bg-img");
    expect(img.getAttribute("src")).toMatch(/^data:image\/svg\+xml,/);
  });

  test("applies slow-zoom transform on image", () => {
    const { getByTestId } = render(
      <BackgroundLayer
        background={{
          type: "image",
          source: "https://example.com/bg.jpg",
          animation: "slow-zoom",
        }}
      />
    );
    const img = getByTestId("bg-img");
    expect(img.style.transform).toContain("scale(");
  });

  test("applies pan-left transform on image", () => {
    const { getByTestId } = render(
      <BackgroundLayer
        background={{
          type: "image",
          source: "https://example.com/bg.jpg",
          animation: "pan-left",
        }}
      />
    );
    const img = getByTestId("bg-img");
    expect(img.style.transform).toContain("translateX(");
  });
});
