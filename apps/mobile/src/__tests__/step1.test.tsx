import React from "react";
import { screen, fireEvent, waitFor } from "@testing-library/react-native";
import Step1Screen from "../../app/create/step1";
import { renderWithComposition } from "@/test-utils/render-with-composition";

const mockPush = jest.fn();
const mockBack = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush, back: mockBack }),
}));

const mockPickGallery = jest.fn();
const mockPickCamera = jest.fn();
const mockCropToSquare = jest.fn().mockImplementation((uri: string) =>
  Promise.resolve(uri),
);

jest.mock("@/hooks/useImagePicker", () => ({
  get pickImageFromGallery() {
    return mockPickGallery;
  },
  get pickImageFromCamera() {
    return mockPickCamera;
  },
  get cropToSquare() {
    return mockCropToSquare;
  },
}));

const mockRemoveBackground = jest.fn();

jest.mock("@/hooks/useRemoveBg", () => ({
  get removeBackground() {
    return mockRemoveBackground;
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Step1Screen", () => {
  it("renders 5 preset cards", () => {
    renderWithComposition(<Step1Screen />);
    expect(screen.getByTestId("preset-card-zohran-classic")).toBeTruthy();
    expect(screen.getByTestId("preset-card-trucker-art")).toBeTruthy();
    expect(screen.getByTestId("preset-card-celebrity-greeting")).toBeTruthy();
    expect(screen.getByTestId("preset-card-six-head-spiral")).toBeTruthy();
    expect(screen.getByTestId("preset-card-custom")).toBeTruthy();
  });

  it("selecting preset highlights it", () => {
    renderWithComposition(<Step1Screen />);
    fireEvent.press(screen.getByTestId("preset-card-zohran-classic"));
    expect(
      screen.getByTestId("preset-card-zohran-classic-selected"),
    ).toBeTruthy();
  });

  it("next button disabled when no preset selected", () => {
    renderWithComposition(<Step1Screen />);
    const nextBtn = screen.getByTestId("next-button");
    expect(nextBtn.props.accessibilityState?.disabled ?? nextBtn.props.disabled).toBeTruthy();
  });

  it("next button disabled when no image uploaded", () => {
    renderWithComposition(<Step1Screen />);
    fireEvent.press(screen.getByTestId("preset-card-zohran-classic"));
    const nextBtn = screen.getByTestId("next-button");
    expect(nextBtn.props.accessibilityState?.disabled ?? nextBtn.props.disabled).toBeTruthy();
  });

  it("next button enabled when both preset and image present", async () => {
    mockPickGallery.mockResolvedValueOnce({
      uri: "file://photo.jpg",
      width: 200,
      height: 200,
    });
    renderWithComposition(<Step1Screen />);
    fireEvent.press(screen.getByTestId("preset-card-trucker-art"));
    fireEvent.press(screen.getByTestId("gallery-button"));
    await waitFor(() => {
      expect(screen.getByTestId("head-preview-image")).toBeTruthy();
    });
    const nextBtn = screen.getByTestId("next-button");
    expect(nextBtn.props.accessibilityState?.disabled).toBeFalsy();
  });

  it("shows image preview after gallery pick", async () => {
    mockPickGallery.mockResolvedValueOnce({
      uri: "file://photo.jpg",
      width: 200,
      height: 200,
    });
    renderWithComposition(<Step1Screen />);
    fireEvent.press(screen.getByTestId("gallery-button"));
    await waitFor(() => {
      expect(screen.getByTestId("head-preview-image")).toBeTruthy();
    });
  });

  it("shows loading state during bg removal", async () => {
    mockPickGallery.mockResolvedValueOnce({
      uri: "file://photo.jpg",
      width: 200,
      height: 200,
    });
    mockRemoveBackground.mockImplementation(
      () => new Promise(() => {}), // never resolves
    );
    renderWithComposition(<Step1Screen />);
    fireEvent.press(screen.getByTestId("gallery-button"));
    await waitFor(() => {
      expect(screen.getByTestId("head-preview-image")).toBeTruthy();
    });
    fireEvent.press(screen.getByTestId("remove-bg-button"));
    await waitFor(() => {
      expect(screen.getByTestId("remove-bg-loading")).toBeTruthy();
    });
  });
});
