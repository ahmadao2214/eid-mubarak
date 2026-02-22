import React from "react";
import { screen, fireEvent } from "@testing-library/react-native";
import EditorScreen from "../../app/create/editor";
import { renderWithComposition } from "@/test-utils/render-with-composition";

const mockPush = jest.fn();
const mockBack = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush, back: mockBack }),
  useLocalSearchParams: () => ({}),
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children, ...props }: any) => {
    const { View } = require("react-native");
    return <View {...props}>{children}</View>;
  },
}));

jest.mock("@/hooks/useImagePicker", () => ({
  pickImageFromGallery: jest.fn(),
  pickImageFromCamera: jest.fn(),
  cropToSquare: jest.fn((uri: string) => uri),
}));

jest.mock("@/hooks/useRemoveBg", () => ({
  removeBackground: jest.fn().mockResolvedValue({ success: false }),
}));

jest.mock("@/repositories/assets", () => ({
  listCelebrityHeads: jest.fn().mockResolvedValue([
    { id: "drake", name: "Drake", imageUrl: "https://example.com/drake.png", thumbnail: "https://example.com/drake-thumb.png" },
  ]),
}));

jest.mock("@/lib/haptics", () => ({
  lightTap: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("EditorScreen", () => {
  const renderEditor = (presetId?: string) =>
    renderWithComposition(<EditorScreen />, {
      initialPresetId: presetId ? (presetId as any) : "zohran-classic",
      initialHeadImage: "https://example.com/head.png",
    });

  it("renders all 5 tab labels", () => {
    renderEditor();
    expect(screen.getByText("Templates")).toBeTruthy();
    expect(screen.getByText("Head")).toBeTruthy();
    expect(screen.getByText("Text")).toBeTruthy();
    expect(screen.getByText("Style")).toBeTruthy();
    expect(screen.getByText("Effects")).toBeTruthy();
  });

  it("default tab is templates", () => {
    renderEditor();
    // Templates tab content should be visible — preset names should show
    expect(screen.getByTestId("tab-templates")).toBeTruthy();
  });

  it("switching tabs shows correct content", () => {
    renderEditor();

    // Switch to Text tab
    fireEvent.press(screen.getByTestId("tab-text"));
    expect(screen.getByText("Font Style")).toBeTruthy();

    // Switch to Style tab
    fireEvent.press(screen.getByTestId("tab-style"));
    expect(screen.getByText("Hue Color")).toBeTruthy();

    // Switch to Effects tab
    fireEvent.press(screen.getByTestId("tab-effects"));
    expect(screen.getByText("Head Animation")).toBeTruthy();
  });

  it("selecting a preset dispatches to context", () => {
    renderEditor();
    // Preset cards should be rendered
    const presetCard = screen.getByTestId("preset-card-trucker-art");
    fireEvent.press(presetCard);
    // After pressing, the trucker art card should become selected
    expect(screen.getByTestId("preset-card-trucker-art-selected")).toBeTruthy();
  });

  it("Send Vibes button exists and navigates to step3", () => {
    renderEditor();
    const sendBtn = screen.getByTestId("send-vibes-button");
    expect(sendBtn).toBeTruthy();
    fireEvent.press(sendBtn);
    expect(mockPush).toHaveBeenCalledWith("/create/step3");
  });

  it("back button navigates back", () => {
    renderEditor();
    fireEvent.press(screen.getByTestId("back-button"));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
