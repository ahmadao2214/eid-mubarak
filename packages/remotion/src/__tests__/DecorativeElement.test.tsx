import React from "react";
import { render } from "@testing-library/react";
import { DecorativeElement } from "../components/DecorativeElement";

let mockFrame = 30;
jest.mock("remotion", () => ({
  Img: ({ src, style }: any) => <img data-testid="decor-img" src={src} style={style} />,
  useCurrentFrame: () => mockFrame,
  useVideoConfig: () => ({ fps: 30 }),
  spring: () => 1,
  interpolate: (input: number, inputRange: number[], outputRange: number[]) => {
    const t = Math.max(0, Math.min(1, (input - inputRange[0]) / (inputRange[1] - inputRange[0])));
    return outputRange[0] + t * (outputRange[1] - outputRange[0]);
  },
}));

jest.mock("../utils/lottie-loader", () => ({
  useLottieData: () => null,
}));

describe("DecorativeElement", () => {
  beforeEach(() => {
    mockFrame = 30;
  });

  test("returns null before enterAtFrame", () => {
    const { container } = render(
      <DecorativeElement
        element={{
          type: "image",
          source: "https://example.com/star.png",
          position: { x: 50, y: 50 },
          scale: 1,
          enterAtFrame: 60,
        }}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  test("renders placeholder SVG for placeholder source", () => {
    const { container } = render(
      <DecorativeElement
        element={{
          type: "image",
          source: "placeholder:crescent-moon",
          position: { x: 80, y: 20 },
          scale: 0.8,
          enterAtFrame: 0,
        }}
      />
    );
    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img?.getAttribute("src")).toMatch(/^data:image\/svg\+xml,/);
  });

  test("renders regular image element", () => {
    const { getByTestId } = render(
      <DecorativeElement
        element={{
          type: "image",
          source: "https://example.com/star.png",
          position: { x: 50, y: 50 },
          scale: 1,
          enterAtFrame: 0,
        }}
      />
    );
    const img = getByTestId("decor-img");
    expect(img.getAttribute("src")).toBe("https://example.com/star.png");
  });

  test("applies float animation to placeholder element", () => {
    const { container } = render(
      <DecorativeElement
        element={{
          type: "image",
          source: "placeholder:rose-heart",
          position: { x: 50, y: 50 },
          scale: 1,
          enterAtFrame: 0,
          animation: "float",
        }}
      />
    );
    const wrapper = container.firstChild as HTMLDivElement;
    expect(wrapper).not.toBeNull();
    expect(wrapper.style.transform).toContain("translateY(");
  });

  test("applies fan-out animation to placeholder element", () => {
    const { container } = render(
      <DecorativeElement
        element={{
          type: "image",
          source: "placeholder:trucker-art-peacock",
          position: { x: 50, y: 50 },
          scale: 1,
          enterAtFrame: 0,
          animation: "fan-out",
        }}
      />
    );
    const wrapper = container.firstChild as HTMLDivElement;
    expect(wrapper).not.toBeNull();
  });

  test("element without exitAtFrame renders normally (no fade)", () => {
    mockFrame = 100;
    const { container } = render(
      <DecorativeElement
        element={{
          type: "image",
          source: "https://example.com/star.png",
          position: { x: 50, y: 50 },
          scale: 1,
          enterAtFrame: 0,
        }}
      />
    );
    const wrapper = container.firstChild as HTMLDivElement;
    expect(wrapper).not.toBeNull();
    // No exit fade — opacity should be entrance spring value (1)
    expect(parseFloat(wrapper.style.opacity)).toBe(1);
  });

  test("element with exitAtFrame is fully visible before exitAtFrame", () => {
    mockFrame = 20;
    const { container } = render(
      <DecorativeElement
        element={{
          type: "image",
          source: "https://example.com/star.png",
          position: { x: 50, y: 50 },
          scale: 1,
          enterAtFrame: 0,
          exitAtFrame: 45,
        }}
      />
    );
    const wrapper = container.firstChild as HTMLDivElement;
    expect(wrapper).not.toBeNull();
    expect(parseFloat(wrapper.style.opacity)).toBe(1);
  });

  test("element with exitAtFrame fades to opacity 0 after exitAtFrame", () => {
    mockFrame = 75; // well past exitAtFrame 45 + 15 frame fade
    const { container } = render(
      <DecorativeElement
        element={{
          type: "image",
          source: "https://example.com/star.png",
          position: { x: 50, y: 50 },
          scale: 1,
          enterAtFrame: 0,
          exitAtFrame: 45,
        }}
      />
    );
    const wrapper = container.firstChild as HTMLDivElement;
    expect(wrapper).not.toBeNull();
    expect(parseFloat(wrapper.style.opacity)).toBe(0);
  });
});
