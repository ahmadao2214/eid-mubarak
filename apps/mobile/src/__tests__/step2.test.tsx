import React from "react";
import { screen, fireEvent } from "@testing-library/react-native";
import Step2Screen from "../../app/create/step2";
import { renderWithComposition } from "@/test-utils/render-with-composition";

const mockPush = jest.fn();
const mockBack = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush, back: mockBack }),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Step2Screen", () => {
  const renderStep2 = () =>
    renderWithComposition(<Step2Screen />, {
      initialPresetId: "zohran-classic",
      initialHeadImage: "https://example.com/head.png",
    });

  it("renders text input for each text slot", () => {
    renderStep2();
    expect(screen.getByTestId("text-input-main")).toBeTruthy();
  });

  it("text input change updates composition", () => {
    renderStep2();
    const input = screen.getByTestId("text-input-main");
    fireEvent.changeText(input, "Happy Eid!");
    expect(input.props.value).toBe("Happy Eid!");
  });

  it("renders hue color swatches", () => {
    renderStep2();
    // Switch to Style tab
    fireEvent.press(screen.getByTestId("tab-style"));
    // #FFD700 is the default for zohran-classic, so it has -selected suffix
    expect(screen.getByTestId("hue-swatch-#FFD700-selected")).toBeTruthy();
    expect(screen.getByTestId("hue-swatch-#FF69B4")).toBeTruthy();
    expect(screen.getByTestId("hue-swatch-#00C853")).toBeTruthy();
    expect(screen.getByTestId("hue-swatch-#2196F3")).toBeTruthy();
    expect(screen.getByTestId("hue-swatch-#F5A623")).toBeTruthy();
    expect(screen.getByTestId("hue-swatch-none")).toBeTruthy();
  });

  it("hue color selection updates state", () => {
    renderStep2();
    fireEvent.press(screen.getByTestId("tab-style"));
    fireEvent.press(screen.getByTestId("hue-swatch-#FF69B4"));
    // The swatch should now be selected (has -selected suffix)
    expect(screen.getByTestId("hue-swatch-#FF69B4-selected")).toBeTruthy();
  });

  it("renders head animation options", () => {
    renderStep2();
    fireEvent.press(screen.getByTestId("tab-effects"));
    expect(screen.getByTestId("head-anim-pop")).toBeTruthy();
    expect(screen.getByTestId("head-anim-zoom-pulse")).toBeTruthy();
    expect(screen.getByTestId("head-anim-spiral-multiply")).toBeTruthy();
    expect(screen.getByTestId("head-anim-float")).toBeTruthy();
  });

  it("renders font style options", () => {
    renderStep2();
    expect(screen.getByTestId("font-psychedelic")).toBeTruthy();
    expect(screen.getByTestId("font-classic")).toBeTruthy();
    expect(screen.getByTestId("font-bollywood")).toBeTruthy();
    expect(screen.getByTestId("font-clean")).toBeTruthy();
    expect(screen.getByTestId("font-trucker-art")).toBeTruthy();
  });

  it("flower reveal toggle works", () => {
    renderStep2();
    fireEvent.press(screen.getByTestId("tab-effects"));
    const toggle = screen.getByTestId("flower-reveal-toggle");
    fireEvent.press(toggle);
    // After toggling, should still render (toggling off)
    expect(screen.getByTestId("flower-reveal-toggle")).toBeTruthy();
  });

  it("preview shows head image", () => {
    renderStep2();
    expect(screen.getByTestId("card-preview")).toBeTruthy();
    expect(screen.getByTestId("head-image")).toBeTruthy();
  });
});
