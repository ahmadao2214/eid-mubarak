import React from "react";
import { render } from "@testing-library/react";
import { DecorativeElement } from "../components/DecorativeElement";

jest.mock("remotion", () => ({
  Img: ({ src, style }: any) => <img data-testid="decor-img" src={src} style={style} />,
  useCurrentFrame: () => 30,
  useVideoConfig: () => ({ fps: 30 }),
  spring: () => 1,
}));

jest.mock("../utils/lottie-loader", () => ({
  useLottieData: () => null,
}));

describe("DecorativeElement", () => {
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
});
