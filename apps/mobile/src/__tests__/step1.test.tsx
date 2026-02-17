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

const mockCelebHeads = [
  {
    id: "drake",
    name: "Drake",
    imageUrl: "https://mock-s3.example.com/heads/drake.png",
    thumbnail: "https://mock-s3.example.com/heads/drake-thumb.png",
  },
  {
    id: "shah-rukh-khan",
    name: "Shah Rukh Khan",
    imageUrl: "https://mock-s3.example.com/heads/srk.png",
    thumbnail: "https://mock-s3.example.com/heads/srk-thumb.png",
  },
  {
    id: "aunty-stock",
    name: "Aunty Stock",
    imageUrl: "https://mock-s3.example.com/heads/aunty.png",
    thumbnail: "https://mock-s3.example.com/heads/aunty-thumb.png",
  },
];

const mockListCelebrityHeads = jest.fn();

jest.mock("@/lib/mock-api", () => ({
  get mockListCelebrityHeads() {
    return mockListCelebrityHeads;
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockListCelebrityHeads.mockResolvedValue(mockCelebHeads);
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

  it("renders My Photo option and celebrity heads in same row", async () => {
    renderWithComposition(<Step1Screen />);
    expect(screen.getByTestId("head-option-my-photo")).toBeTruthy();
    await waitFor(() => {
      expect(screen.getByTestId("celeb-head-drake")).toBeTruthy();
      expect(screen.getByTestId("celeb-head-shah-rukh-khan")).toBeTruthy();
      expect(screen.getByTestId("celeb-head-aunty-stock")).toBeTruthy();
    });
  });

  it("image picker is hidden until My Photo is selected", () => {
    renderWithComposition(<Step1Screen />);
    expect(screen.queryByTestId("my-photo-picker")).toBeNull();
    fireEvent.press(screen.getByTestId("head-option-my-photo"));
    expect(screen.getByTestId("my-photo-picker")).toBeTruthy();
    expect(screen.getByTestId("gallery-button")).toBeTruthy();
    expect(screen.getByTestId("camera-button")).toBeTruthy();
  });

  it("selecting celebrity head hides image picker", async () => {
    renderWithComposition(<Step1Screen />);
    // Open the picker first
    fireEvent.press(screen.getByTestId("head-option-my-photo"));
    expect(screen.getByTestId("my-photo-picker")).toBeTruthy();
    // Select a celebrity
    await waitFor(() => {
      expect(screen.getByTestId("celeb-head-drake")).toBeTruthy();
    });
    fireEvent.press(screen.getByTestId("celeb-head-drake"));
    expect(screen.queryByTestId("my-photo-picker")).toBeNull();
  });

  it("selecting celebrity head sets image and enables next with preset", async () => {
    renderWithComposition(<Step1Screen />);
    fireEvent.press(screen.getByTestId("preset-card-zohran-classic"));
    await waitFor(() => {
      expect(screen.getByTestId("celeb-head-drake")).toBeTruthy();
    });
    fireEvent.press(screen.getByTestId("celeb-head-drake"));
    const nextBtn = screen.getByTestId("next-button");
    expect(nextBtn.props.accessibilityState?.disabled).toBeFalsy();
  });

  it("My Photo flow: gallery pick enables next with preset", async () => {
    mockPickGallery.mockResolvedValueOnce({
      uri: "file://photo.jpg",
      width: 200,
      height: 200,
    });
    renderWithComposition(<Step1Screen />);
    fireEvent.press(screen.getByTestId("preset-card-trucker-art"));
    fireEvent.press(screen.getByTestId("head-option-my-photo"));
    fireEvent.press(screen.getByTestId("gallery-button"));
    await waitFor(() => {
      expect(screen.getByTestId("head-preview-image")).toBeTruthy();
    });
    const nextBtn = screen.getByTestId("next-button");
    expect(nextBtn.props.accessibilityState?.disabled).toBeFalsy();
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
    fireEvent.press(screen.getByTestId("head-option-my-photo"));
    fireEvent.press(screen.getByTestId("gallery-button"));
    await waitFor(() => {
      expect(screen.getByTestId("head-preview-image")).toBeTruthy();
    });
    fireEvent.press(screen.getByTestId("remove-bg-button"));
    await waitFor(() => {
      expect(screen.getByTestId("remove-bg-loading")).toBeTruthy();
    });
  });

  it("switching from celebrity to My Photo clears celebrity image", async () => {
    renderWithComposition(<Step1Screen />);
    await waitFor(() => {
      expect(screen.getByTestId("celeb-head-drake")).toBeTruthy();
    });
    fireEvent.press(screen.getByTestId("celeb-head-drake"));
    // Now switch to My Photo
    fireEvent.press(screen.getByTestId("head-option-my-photo"));
    expect(screen.getByTestId("my-photo-picker")).toBeTruthy();
    // Should show placeholder, not Drake's image
    expect(screen.getByTestId("head-preview-placeholder")).toBeTruthy();
  });
});
