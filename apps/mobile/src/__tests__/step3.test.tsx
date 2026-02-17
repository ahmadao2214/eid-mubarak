import React from "react";
import { screen, fireEvent, waitFor } from "@testing-library/react-native";
import Step3Screen from "../../app/create/step3";
import { renderWithComposition } from "@/test-utils/render-with-composition";

const mockPush = jest.fn();
const mockBack = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush, back: mockBack }),
}));

const mockCreateProject = jest.fn().mockResolvedValue("proj-123");
const mockRequestRender = jest.fn().mockResolvedValue("render-123");
const mockGetRenderStatus = jest.fn().mockResolvedValue({
  id: "render-123",
  projectId: "proj-123",
  status: "completed",
  progress: 100,
  outputUrl: "https://mock-s3.example.com/rendered/test-video.mp4",
});

jest.mock("@/lib/mock-api", () => ({
  get mockCreateProject() {
    return mockCreateProject;
  },
  get mockRequestRender() {
    return mockRequestRender;
  },
  get mockGetRenderStatus() {
    return mockGetRenderStatus;
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Step3Screen", () => {
  const renderStep3 = () =>
    renderWithComposition(<Step3Screen />, {
      initialPresetId: "zohran-classic",
      initialHeadImage: "https://example.com/head.png",
    });

  it("renders preview with composition data", () => {
    renderStep3();
    expect(screen.getByTestId("card-preview")).toBeTruthy();
  });

  it("save button calls mockCreateProject", async () => {
    renderStep3();
    fireEvent.press(screen.getByTestId("save-button"));
    await waitFor(() => {
      expect(mockCreateProject).toHaveBeenCalledTimes(1);
    });
  });

  it("render button triggers render flow", async () => {
    renderStep3();
    fireEvent.press(screen.getByTestId("render-button"));
    await waitFor(() => {
      expect(mockRequestRender).toHaveBeenCalledTimes(1);
    });
  });

  it("shows progress during rendering", async () => {
    mockRequestRender.mockResolvedValueOnce("render-123");
    mockGetRenderStatus.mockResolvedValueOnce({
      id: "render-123",
      projectId: "proj-123",
      status: "rendering",
      progress: 50,
    });
    renderStep3();
    fireEvent.press(screen.getByTestId("render-button"));
    await waitFor(() => {
      expect(screen.getByTestId("render-progress")).toBeTruthy();
    });
  });

  it("shows completion state after render", async () => {
    renderStep3();
    fireEvent.press(screen.getByTestId("render-button"));
    await waitFor(() => {
      expect(screen.getByTestId("render-complete")).toBeTruthy();
    });
  });

  it("share button disabled until complete", () => {
    renderStep3();
    const shareBtn = screen.getByTestId("share-button");
    expect(
      shareBtn.props.accessibilityState?.disabled ?? shareBtn.props.disabled,
    ).toBeTruthy();
  });
});
