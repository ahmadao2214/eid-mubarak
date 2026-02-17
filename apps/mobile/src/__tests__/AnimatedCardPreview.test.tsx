import React from "react";
import { render, screen } from "@testing-library/react-native";
import { AnimatedCardPreview } from "@/components/AnimatedCardPreview";
import { PRESETS } from "@/lib/presets";
import type { CompositionProps } from "@/types";

describe("AnimatedCardPreview", () => {
  it.each(PRESETS.map((p) => [p.name, p.defaultProps]))(
    "renders without crashing for preset: %s",
    (_name, defaultProps) => {
      render(
        <AnimatedCardPreview
          composition={defaultProps as CompositionProps}
          size="small"
        />,
      );
      expect(screen.getByTestId("card-preview")).toBeTruthy();
    },
  );

  it("shows hue overlay when enabled", () => {
    const composition: CompositionProps = {
      ...PRESETS[0].defaultProps,
      hue: { enabled: true, color: "#FFD700", opacity: 0.3, animation: "pulse" },
    };
    render(<AnimatedCardPreview composition={composition} size="small" />);
    expect(screen.getByTestId("hue-overlay")).toBeTruthy();
  });

  it("no hue overlay when hue.enabled is false", () => {
    const composition: CompositionProps = {
      ...PRESETS[0].defaultProps,
      hue: { enabled: false, color: "none", opacity: 0, animation: "static" },
    };
    render(<AnimatedCardPreview composition={composition} size="small" />);
    expect(screen.queryByTestId("hue-overlay")).toBeNull();
  });

  it("shows head image when imageUrl present", () => {
    const composition: CompositionProps = {
      ...PRESETS[0].defaultProps,
      head: {
        ...PRESETS[0].defaultProps.head,
        imageUrl: "https://example.com/head.png",
      },
    };
    render(<AnimatedCardPreview composition={composition} size="large" />);
    expect(screen.getByTestId("head-image")).toBeTruthy();
  });

  it("renders text slots", () => {
    const composition = PRESETS[0].defaultProps;
    render(<AnimatedCardPreview composition={composition} size="small" />);
    for (const slot of composition.textSlots) {
      expect(screen.getByTestId(`text-slot-${slot.id}`)).toBeTruthy();
    }
  });

  it("works at both small and large sizes", () => {
    const composition = PRESETS[0].defaultProps;
    const { unmount } = render(
      <AnimatedCardPreview composition={composition} size="small" />,
    );
    expect(screen.getByTestId("card-preview")).toBeTruthy();
    unmount();
    render(<AnimatedCardPreview composition={composition} size="large" />);
    expect(screen.getByTestId("card-preview")).toBeTruthy();
  });
});
