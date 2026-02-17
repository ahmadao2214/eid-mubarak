import React from "react";
import { render } from "@testing-library/react";
import { HeadAnimation } from "../components/HeadAnimation";

jest.mock("remotion", () => ({
  Img: ({ src, style }: any) => <img data-testid="head-img" src={src} style={style} />,
  useCurrentFrame: () => 30,
  useVideoConfig: () => ({ fps: 30 }),
  interpolate: (value: number, input: number[], output: number[]) => {
    const t = (value - input[0]) / (input[1] - input[0]);
    return output[0] + Math.min(1, Math.max(0, t)) * (output[1] - output[0]);
  },
  spring: () => 1,
}));

jest.mock("../utils/placeholders", () => ({
  isPlaceholderSource: (s: string) => s.startsWith("placeholder:"),
  resolvePlaceholder: () => "data:image/svg+xml,<svg></svg>",
}));

const baseHead = {
  imageUrl: "https://example.com/face.png",
  position: { x: 50, y: 45 },
  scale: 0.4,
  enterAtFrame: 0,
  animation: "pop" as const,
};

describe("HeadAnimation", () => {
  test("returns null when imageUrl is empty", () => {
    const { container } = render(
      <HeadAnimation head={{ ...baseHead, imageUrl: "" }} />
    );
    expect(container.firstChild).toBeNull();
  });

  test("returns null before enterAtFrame", () => {
    // frame=30, enterAtFrame=60
    const { container } = render(
      <HeadAnimation head={{ ...baseHead, enterAtFrame: 60 }} />
    );
    expect(container.firstChild).toBeNull();
  });

  test("renders with pop animation", () => {
    const { getAllByTestId } = render(
      <HeadAnimation head={{ ...baseHead, animation: "pop" }} />
    );
    expect(getAllByTestId("head-img")).toHaveLength(1);
  });

  test("renders with zoom-pulse animation", () => {
    const { getAllByTestId } = render(
      <HeadAnimation head={{ ...baseHead, animation: "zoom-pulse" }} />
    );
    expect(getAllByTestId("head-img")).toHaveLength(1);
  });

  test("renders multiple heads with spiral-multiply", () => {
    const { getAllByTestId } = render(
      <HeadAnimation
        head={{
          ...baseHead,
          animation: "spiral-multiply",
          animationConfig: { spiralCount: 6 },
        }}
      />
    );
    expect(getAllByTestId("head-img")).toHaveLength(6);
  });

  test("renders with float animation", () => {
    const { getAllByTestId } = render(
      <HeadAnimation head={{ ...baseHead, animation: "float" }} />
    );
    expect(getAllByTestId("head-img")).toHaveLength(1);
  });

  test("resolves placeholder head image", () => {
    const { getByTestId } = render(
      <HeadAnimation
        head={{ ...baseHead, imageUrl: "placeholder:head" }}
      />
    );
    const img = getByTestId("head-img");
    expect(img.getAttribute("src")).toMatch(/^data:image\/svg\+xml,/);
  });
});
