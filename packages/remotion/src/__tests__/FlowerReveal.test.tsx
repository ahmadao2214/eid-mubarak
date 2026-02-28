import React from "react";
import { render } from "@testing-library/react";
import { FlowerReveal } from "../components/FlowerReveal";

jest.mock("remotion", () => ({
  Img: ({ src, style }: any) => <img data-testid="rose-petal-img" src={src} style={style} />,
  OffthreadVideo: (props: any) => <video data-testid="flower-video" {...props} />,
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

  test("renders rose image petals for rose type", () => {
    const { container, getAllByTestId } = render(
      <FlowerReveal
        head={{
          ...baseHead,
          flowerReveal: { enabled: true, type: "rose" },
        }}
      />
    );
    // Rose type uses real images, not SVG ellipses
    const svg = container.querySelector("svg");
    expect(svg).toBeNull();
    // Rose has 8 petals rendered as <img> tags
    const imgs = getAllByTestId("rose-petal-img");
    expect(imgs).toHaveLength(8);
    expect(imgs[0].getAttribute("src")).toBe("/assets/rose.png");
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

  test("renders video when videoSource is provided", () => {
    const { container } = render(
      <FlowerReveal
        head={{
          ...baseHead,
          flowerReveal: { enabled: true, type: "sunflower", videoSource: "/assets/sunflower-bloom.mp4" },
        }}
      />
    );
    const video = container.querySelector('[data-testid="flower-video"]');
    expect(video).not.toBeNull();
    expect(video!.getAttribute("src")).toBe("/assets/sunflower-bloom.mp4");
  });

  test("video is not rendered before flowerReveal.enterAtFrame", () => {
    const { container } = render(
      <FlowerReveal
        head={{
          ...baseHead,
          enterAtFrame: 0,
          flowerReveal: { enabled: true, type: "sunflower", videoSource: "/assets/sunflower-bloom.mp4", enterAtFrame: 60 },
        }}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  test("falls back to SVG petals when videoSource is empty string", () => {
    const { container } = render(
      <FlowerReveal
        head={{
          ...baseHead,
          flowerReveal: { enabled: true, type: "sunflower", videoSource: "" },
        }}
      />
    );
    const ellipses = container.querySelectorAll("ellipse");
    expect(ellipses).toHaveLength(12);
  });

  test("falls back to SVG petals when videoSource is undefined", () => {
    const { container } = render(
      <FlowerReveal
        head={{
          ...baseHead,
          flowerReveal: { enabled: true, type: "sunflower" },
        }}
      />
    );
    const ellipses = container.querySelectorAll("ellipse");
    expect(ellipses).toHaveLength(12);
  });
});
