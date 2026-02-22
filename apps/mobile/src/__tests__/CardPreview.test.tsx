import React from "react";
import { render, screen } from "@testing-library/react-native";
import { CardPreview } from "@/components/CardPreview";
import { PRESETS } from "@/lib/presets";
import type { CompositionProps } from "@/types";

describe("CardPreview", () => {
  it("renders without crashing", () => {
    render(
      <CardPreview composition={PRESETS[0].defaultProps} size="small" />,
    );
    expect(screen.getByTestId("card-preview")).toBeTruthy();
  });

  it("applies monospace font for psychedelic fontFamily", () => {
    const composition: CompositionProps = {
      ...PRESETS[0].defaultProps,
      textSlots: [
        {
          ...PRESETS[0].defaultProps.textSlots[0],
          fontFamily: "psychedelic",
        },
      ],
    };
    render(<CardPreview composition={composition} size="small" />);
    const slot = screen.getByTestId("text-slot-main");
    expect(slot).toHaveStyle({ fontFamily: "monospace" });
  });

  it("applies serif italic for bollywood fontFamily", () => {
    const composition: CompositionProps = {
      ...PRESETS[0].defaultProps,
      textSlots: [
        {
          ...PRESETS[0].defaultProps.textSlots[0],
          fontFamily: "bollywood",
        },
      ],
    };
    render(<CardPreview composition={composition} size="small" />);
    const slot = screen.getByTestId("text-slot-main");
    expect(slot).toHaveStyle({ fontFamily: "serif", fontStyle: "italic" });
  });

  it("accepts custom dimensions object for size", () => {
    const composition = PRESETS[0].defaultProps;
    render(
      <CardPreview
        composition={composition}
        size={{ width: 200, height: 356 }}
      />,
    );
    const preview = screen.getByTestId("card-preview");
    expect(preview).toHaveStyle({ width: 200, height: 356 });
  });
});
