import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import App from "../App";

vi.mock("@remotion/player", () => ({
  Player: (props: Record<string, unknown>) => (
    <div data-testid="remotion-player" data-props={JSON.stringify(props.inputProps)} />
  ),
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

function postComposition(composition: Record<string, unknown>) {
  window.dispatchEvent(
    new MessageEvent("message", {
      data: JSON.stringify({ type: "UPDATE_COMPOSITION", composition }),
    }),
  );
}

describe("Preview App", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the Remotion Player", () => {
    render(<App />);
    expect(screen.getByTestId("remotion-player")).toBeInTheDocument();
  });

  it("shows loading state before first message", () => {
    render(<App />);
    expect(screen.getByTestId("loading-state")).toBeInTheDocument();
    expect(screen.getByText("Waiting for composition...")).toBeInTheDocument();
  });

  it("hides loading state after receiving a valid message", () => {
    render(<App />);
    act(() => {
      postComposition({ width: 1080, height: 1920, fps: 30, durationInFrames: 300 });
    });
    expect(screen.queryByTestId("loading-state")).not.toBeInTheDocument();
  });

  it("updates Player inputProps on postMessage", () => {
    render(<App />);
    const updatedComposition = {
      width: 1080,
      height: 1920,
      fps: 30,
      durationInFrames: 300,
      textSlots: [{ id: "main", text: "Updated!" }],
    };
    act(() => {
      postComposition(updatedComposition);
    });
    const player = screen.getByTestId("remotion-player");
    const props = JSON.parse(player.getAttribute("data-props") ?? "{}");
    expect(props.textSlots[0].text).toBe("Updated!");
  });

  it("ignores malformed JSON messages", () => {
    render(<App />);
    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", { data: "not-json{{{" }),
      );
    });
    expect(screen.getByTestId("loading-state")).toBeInTheDocument();
  });

  it("ignores messages without UPDATE_COMPOSITION type", () => {
    render(<App />);
    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          data: JSON.stringify({ type: "SOMETHING_ELSE", value: 123 }),
        }),
      );
    });
    expect(screen.getByTestId("loading-state")).toBeInTheDocument();
  });
});
