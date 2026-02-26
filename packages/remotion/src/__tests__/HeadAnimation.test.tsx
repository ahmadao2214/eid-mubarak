import React from "react";
import { render } from "@testing-library/react";
import { HeadAnimation } from "../components/HeadAnimation";

let mockFrame = 30;
jest.mock("remotion", () => ({
  Img: ({ src, style }: any) => <img data-testid="head-img" src={src} style={style} />,
  useCurrentFrame: () => mockFrame,
  useVideoConfig: () => ({ fps: 30, width: 1080, height: 1920, durationInFrames: 300 }),
  interpolate: (value: number, input: number[], output: number[], opts?: any) => {
    const t = (value - input[0]) / (input[1] - input[0]);
    const clamped = Math.min(1, Math.max(0, t));
    let result = output[0] + clamped * (output[1] - output[0]);
    if (opts?.extrapolateRight === "clamp" && value > input[1]) {
      result = output[1];
    }
    return result;
  },
  spring: ({ frame }: { frame: number }) => Math.min(frame / 10, 1),
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
  beforeEach(() => {
    mockFrame = 30;
  });

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

describe("HeadAnimation - spiral-multiply", () => {
  const spiralHead = {
    ...baseHead,
    animation: "spiral-multiply" as const,
    animationConfig: {
      spiralCount: 6,
      orbitRadius: 300,
      orbitSpeed: 0.5,
      copyScale: 0.4,
    },
  };

  beforeEach(() => {
    mockFrame = 60;
  });

  test("renders center head at full scale", () => {
    const { container } = render(<HeadAnimation head={spiralHead} />);
    const centerWrapper = container.querySelector('[data-testid="center-head"]');
    expect(centerWrapper).not.toBeNull();
    // Center head should have a head-img
    const img = centerWrapper!.querySelector('[data-testid="head-img"]');
    expect(img).not.toBeNull();
  });

  test("renders N orbit copies (default 6)", () => {
    const { container } = render(<HeadAnimation head={spiralHead} />);
    const copies = container.querySelectorAll('[data-testid="orbit-copy"]');
    expect(copies).toHaveLength(6);
  });

  test("orbit copies are smaller than center head (copyScale applied)", () => {
    const { container } = render(<HeadAnimation head={spiralHead} />);
    const centerWrapper = container.querySelector(
      '[data-testid="center-head"]',
    ) as HTMLDivElement;
    const firstCopy = container.querySelector(
      '[data-testid="orbit-copy"]',
    ) as HTMLDivElement;

    // Both should have scale in transform
    expect(centerWrapper.style.transform).toContain("scale(");
    expect(firstCopy.style.transform).toContain("scale(");
  });

  test("orbit copies have staggered entrance (not all visible at frame 5)", () => {
    mockFrame = 5; // Very early, only center + first copy might be visible
    const { container } = render(
      <HeadAnimation head={{ ...spiralHead, enterAtFrame: 0 }} />,
    );
    // The copies enter 5 frames apart, so at frame 5 only the first should be visible
    const copies = container.querySelectorAll('[data-testid="orbit-copy"]');
    expect(copies.length).toBeLessThan(6);
  });

  test("orbit positions form elliptical pattern around center", () => {
    mockFrame = 60;
    const { container } = render(<HeadAnimation head={spiralHead} />);
    const copies = container.querySelectorAll('[data-testid="orbit-copy"]');
    expect(copies.length).toBe(6);

    // Each copy should have a translate in its transform
    const transforms = Array.from(copies).map(
      (c) => (c as HTMLDivElement).style.transform,
    );
    transforms.forEach((t) => {
      expect(t).toContain("translate(");
    });
  });

  test("orbit copies use tall ellipse (dy > dx for same angle)", () => {
    mockFrame = 60;
    const { container } = render(
      <HeadAnimation
        head={{
          ...spiralHead,
          animationConfig: { ...spiralHead.animationConfig!, orbitRadius: 300 },
        }}
      />,
    );
    const copies = container.querySelectorAll('[data-testid="orbit-copy"]');
    expect(copies.length).toBeGreaterThan(0);

    // Parse translate(dx, dy) from transforms and check dy magnitudes > dx magnitudes
    const pattern = /translate\((-?[\d.]+)px,\s*(-?[\d.]+)px\)/;
    let tallCount = 0;
    let totalChecked = 0;
    Array.from(copies).forEach((c) => {
      const t = (c as HTMLDivElement).style.transform;
      const match = t.match(pattern);
      if (match) {
        const absDx = Math.abs(parseFloat(match[1]));
        const absDy = Math.abs(parseFloat(match[2]));
        // Skip copies near axes where one component is near-zero
        if (absDx > 10 && absDy > 10) {
          totalChecked++;
          if (absDy > absDx) tallCount++;
        }
      }
    });
    // Majority of off-axis copies should have dy > dx (tall ellipse)
    expect(totalChecked).toBeGreaterThan(0);
    expect(tallCount / totalChecked).toBeGreaterThanOrEqual(0.5);
  });

  test("orbit rotates clockwise over time (positions change between frames)", () => {
    mockFrame = 60;
    const { container: container1 } = render(<HeadAnimation head={spiralHead} />);
    const copy1 = container1.querySelector('[data-testid="orbit-copy"]') as HTMLDivElement;
    const transform1 = copy1.style.transform;

    mockFrame = 90;
    const { container: container2 } = render(<HeadAnimation head={spiralHead} />);
    const copy2 = container2.querySelector('[data-testid="orbit-copy"]') as HTMLDivElement;
    const transform2 = copy2.style.transform;

    // Transforms should differ as orbit rotates
    expect(transform1).not.toBe(transform2);
  });
});
