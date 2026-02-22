import React from "react";
import { screen, fireEvent, waitFor } from "@testing-library/react-native";
import Step3Screen from "../../app/create/step3";
import { renderWithComposition } from "@/test-utils/render-with-composition";

const mockPush = jest.fn();
const mockBack = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush, back: mockBack }),
}));

jest.mock("@/context/ToastContext", () => ({
  useToast: () => ({ showToast: jest.fn() }),
}));

const mockCreateProject = jest.fn();
const mockUpdateProject = jest.fn();

jest.mock("@/repositories/projects", () => ({
  get createProject() {
    return mockCreateProject;
  },
  get updateProject() {
    return mockUpdateProject;
  },
}));

const mockRequestRender = jest.fn();
const mockGetRenderStatus = jest.fn();

jest.mock("@/repositories/renders", () => ({
  get requestRender() {
    return mockRequestRender;
  },
  get getRenderStatus() {
    return mockGetRenderStatus;
  },
}));

jest.mock("@/hooks/useShare", () => ({
  downloadAndShare: jest.fn().mockResolvedValue({ success: true }),
  saveToGallery: jest.fn().mockResolvedValue({ success: true }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockCreateProject.mockResolvedValue("proj-123");
  mockRequestRender.mockResolvedValue("render-123");
  mockGetRenderStatus.mockResolvedValue({
    id: "render-123",
    projectId: "proj-123",
    status: "completed",
    progress: 100,
    outputUrl: "https://mock-s3.example.com/rendered/test-video.mp4",
  });
});

describe("Step3Screen", () => {
  const renderStep3 = () =>
    renderWithComposition(<Step3Screen />, {
      initialPresetId: "zohran-classic",
      initialHeadImage: "https://example.com/head.png",
    });

  it("renders Share Your Vibe title", () => {
    renderStep3();
    expect(screen.getByText("Share Your Vibe")).toBeTruthy();
  });

  it("renders preview with composition data", () => {
    renderStep3();
    expect(screen.getByTestId("card-preview")).toBeTruthy();
  });

  it("share button triggers save + render + ready flow", async () => {
    renderStep3();
    fireEvent.press(screen.getByTestId("share-button"));
    await waitFor(() => {
      expect(mockCreateProject).toHaveBeenCalledTimes(1);
      expect(mockRequestRender).toHaveBeenCalledTimes(1);
    });
  });

  it("shows progress during share flow", async () => {
    mockGetRenderStatus.mockResolvedValueOnce({
      id: "render-123",
      projectId: "proj-123",
      status: "rendering",
      progress: 50,
    });
    renderStep3();
    fireEvent.press(screen.getByTestId("share-button"));
    await waitFor(() => {
      expect(screen.getByTestId("share-progress")).toBeTruthy();
    });
  });

  it("shows ready state when render completes", async () => {
    renderStep3();
    fireEvent.press(screen.getByTestId("share-button"));
    await waitFor(() => {
      expect(screen.getByTestId("share-ready")).toBeTruthy();
    });
  });

  it("share button is disabled during processing", async () => {
    mockCreateProject.mockImplementation(() => new Promise(() => {})); // never resolves
    renderStep3();
    fireEvent.press(screen.getByTestId("share-button"));
    await waitFor(() => {
      const btn = screen.getByTestId("share-button");
      expect(btn.props.accessibilityState?.disabled).toBe(true);
    });
  });

  it("save draft button works independently", async () => {
    renderStep3();
    fireEvent.press(screen.getByTestId("save-draft-button"));
    await waitFor(() => {
      expect(mockCreateProject).toHaveBeenCalledTimes(1);
      expect(screen.getByText("Draft saved")).toBeTruthy();
    });
  });

  it("back button navigates back", () => {
    renderStep3();
    fireEvent.press(screen.getByTestId("back-button"));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
