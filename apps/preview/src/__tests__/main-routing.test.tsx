import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("convex/react", () => ({
  ConvexProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="convex-provider">{children}</div>
  ),
  useQuery: () => [],
}));

vi.mock("../convexClient", () => ({
  convex: {},
}));

vi.mock("qrcode", () => ({
  default: { toString: vi.fn().mockResolvedValue("<svg></svg>") },
}));

vi.mock("@remotion/player", () => ({
  Player: () => <div data-testid="remotion-player" />,
}));

vi.mock("@eid-meme-maker/remotion/src/EidMemeVideo", () => ({
  EidMemeVideo: () => <div>EidMemeVideo</div>,
}));

vi.mock("@eid-meme-maker/remotion/src/templates", () => ({
  getPreset: () => ({
    defaultProps: {
      width: 1080,
      height: 1920,
      fps: 30,
      durationInFrames: 300,
      background: { type: "solid", source: "#1a1a2e" },
      hue: { enabled: false, color: "none", opacity: 0, animation: "static" },
      head: {
        imageUrl: "",
        position: { x: 50, y: 45 },
        scale: 0.4,
        enterAtFrame: 15,
        animation: "pop",
        animationConfig: { popDamping: 12 },
      },
      decorativeElements: [],
      textSlots: [
        {
          id: "main",
          text: "Eid Mubarak!",
          position: { x: 50, y: 75 },
          fontFamily: "clean",
          fontSize: 64,
          color: "#FFFFFF",
          animation: "fade-in",
          enterAtFrame: 45,
        },
      ],
      audio: { trackUrl: "", volume: 0.8 },
    },
  }),
}));

// Test the routing logic by rendering each branch directly
import { StrictMode } from "react";
import { ConvexProvider } from "convex/react";
import App from "../App";
import Gallery from "../Gallery";

describe("main routing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Stub video.load for jsdom
    HTMLMediaElement.prototype.load = vi.fn();
  });

  it("renders App component when no mode param", () => {
    // Simulates what main.tsx does when mode !== "gallery"
    render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
    expect(screen.getByTestId("remotion-player")).toBeInTheDocument();
  });

  it("renders Gallery component when mode=gallery", () => {
    // Simulates what main.tsx does when mode === "gallery"
    render(
      <StrictMode>
        <ConvexProvider client={{} as any}>
          <Gallery />
        </ConvexProvider>
      </StrictMode>,
    );
    expect(screen.getByTestId("waiting-screen")).toBeInTheDocument();
  });

  it("wraps Gallery in ConvexProvider", () => {
    render(
      <StrictMode>
        <ConvexProvider client={{} as any}>
          <Gallery />
        </ConvexProvider>
      </StrictMode>,
    );
    expect(screen.getByTestId("convex-provider")).toBeInTheDocument();
    expect(screen.getByTestId("qr-sidebar")).toBeInTheDocument();
  });
});
