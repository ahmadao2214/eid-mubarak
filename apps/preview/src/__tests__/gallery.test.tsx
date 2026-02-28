import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockUseQuery = vi.fn();

vi.mock("convex/react", () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
}));

vi.mock("qrcode", () => ({
  default: { toString: vi.fn().mockResolvedValue("<svg>QR</svg>") },
}));

import Gallery from "../Gallery";

function makeRender(id: string, url: string, completedAt: number) {
  return { _id: id, outputS3Url: url, completedAt };
}

describe("Gallery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Stub video.load for jsdom
    HTMLMediaElement.prototype.load = vi.fn();
    // Reset URL search params
    Object.defineProperty(window, "location", {
      value: new URL(
        "http://localhost:5173/?mode=gallery&expo=exp://192.168.1.1:8081",
      ),
      writable: true,
    });
  });

  it("shows waiting screen when no completed renders", () => {
    mockUseQuery.mockReturnValue([]);
    render(<Gallery />);
    expect(screen.getByTestId("waiting-screen")).toBeInTheDocument();
    expect(screen.getByText("Waiting for vibes...")).toBeInTheDocument();
  });

  it("plays first video when renders arrive", () => {
    mockUseQuery.mockReturnValue([
      makeRender("1", "https://s3.example.com/video1.mp4", 1000),
    ]);
    render(<Gallery />);
    const video = screen.getByTestId("gallery-video") as HTMLVideoElement;
    expect(video).toBeInTheDocument();
    expect(video.src).toContain("video1.mp4");
    expect(video.autoplay).toBe(true);
  });

  it("shows video counter (1 / N)", () => {
    mockUseQuery.mockReturnValue([
      makeRender("1", "https://s3.example.com/video1.mp4", 1000),
      makeRender("2", "https://s3.example.com/video2.mp4", 2000),
    ]);
    render(<Gallery />);
    expect(screen.getByTestId("video-counter")).toHaveTextContent("1 / 2");
  });

  it("advances to next video on ended event", () => {
    vi.useFakeTimers();
    mockUseQuery.mockReturnValue([
      makeRender("1", "https://s3.example.com/video1.mp4", 1000),
      makeRender("2", "https://s3.example.com/video2.mp4", 2000),
    ]);
    render(<Gallery />);
    const video = screen.getByTestId("gallery-video") as HTMLVideoElement;
    fireEvent.ended(video);

    // Should show transition card
    expect(screen.getByTestId("transition-card")).toBeInTheDocument();

    // After 2 seconds, advances
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    const nextVideo = screen.getByTestId("gallery-video") as HTMLVideoElement;
    expect(nextVideo.src).toContain("video2.mp4");
    vi.useRealTimers();
  });

  it("loops back to first video after last one", () => {
    vi.useFakeTimers();
    mockUseQuery.mockReturnValue([
      makeRender("1", "https://s3.example.com/video1.mp4", 1000),
      makeRender("2", "https://s3.example.com/video2.mp4", 2000),
    ]);
    render(<Gallery />);

    // End first video
    fireEvent.ended(screen.getByTestId("gallery-video"));
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Now on video 2, end it
    fireEvent.ended(screen.getByTestId("gallery-video"));
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Should loop back to video 1
    const video = screen.getByTestId("gallery-video") as HTMLVideoElement;
    expect(video.src).toContain("video1.mp4");
    vi.useRealTimers();
  });

  it("shows transition card between videos", () => {
    vi.useFakeTimers();
    mockUseQuery.mockReturnValue([
      makeRender("1", "https://s3.example.com/video1.mp4", 1000),
      makeRender("2", "https://s3.example.com/video2.mp4", 2000),
    ]);
    render(<Gallery />);
    fireEvent.ended(screen.getByTestId("gallery-video"));

    expect(screen.getByTestId("transition-card")).toBeInTheDocument();
    expect(screen.getByText("Next video coming up...")).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("shows fullscreen button", () => {
    mockUseQuery.mockReturnValue([]);
    render(<Gallery />);
    expect(screen.getByTestId("fullscreen-btn")).toBeInTheDocument();
    expect(screen.getByText("Fullscreen")).toBeInTheDocument();
  });

  it("shows unmute button when muted", () => {
    mockUseQuery.mockReturnValue([
      makeRender("1", "https://s3.example.com/video1.mp4", 1000),
    ]);
    render(<Gallery />);
    expect(screen.getByTestId("unmute-btn")).toBeInTheDocument();
    expect(screen.getByText("Unmute")).toBeInTheDocument();
  });

  it("shows QR code sidebar with expo URL", () => {
    mockUseQuery.mockReturnValue([]);
    render(<Gallery />);
    expect(screen.getByTestId("qr-sidebar")).toBeInTheDocument();
    expect(screen.getByText("Scan to Join!")).toBeInTheDocument();
  });

  it("shows Expo Go instructions", () => {
    mockUseQuery.mockReturnValue([]);
    render(<Gallery />);
    expect(screen.getByText(/Expo Go/)).toBeInTheDocument();
  });
});
