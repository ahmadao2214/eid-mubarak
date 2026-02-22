import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { TemplateCard } from "@/components/TemplateCard";
import { PRESETS } from "@/lib/presets";

jest.mock("react-native-reanimated", () =>
  require("react-native-reanimated/mock"),
);

describe("TemplateCard", () => {
  const preset = PRESETS[0]; // Zohran Classic
  const onPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders preset name text", () => {
    render(
      <TemplateCard preset={preset} onPress={onPress} selected={false} />,
    );
    expect(screen.getByText(preset.name)).toBeTruthy();
  });

  it("calls onPress when tapped", () => {
    render(
      <TemplateCard
        preset={preset}
        onPress={onPress}
        selected={false}
        testID="template-card"
      />,
    );
    fireEvent.press(screen.getByTestId("template-card"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("renders AnimatedCardPreview inside", () => {
    render(
      <TemplateCard preset={preset} onPress={onPress} selected={false} />,
    );
    expect(screen.getByTestId("card-preview")).toBeTruthy();
  });
});
