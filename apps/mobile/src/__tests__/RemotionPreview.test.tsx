import React from "react";
import { render, screen } from "@testing-library/react-native";
import { RemotionPreview } from "../components/RemotionPreview";

const mockPostMessage = jest.fn();

jest.mock("react-native-webview", () => {
  const React = require("react");
  const RN = require("react-native");
  return {
    __esModule: true,
    WebView: React.forwardRef(function MockWebView(
      props: Record<string, unknown>,
      ref: React.Ref<{ postMessage: typeof mockPostMessage }>,
    ) {
      React.useImperativeHandle(ref, () => ({ postMessage: mockPostMessage }));
      React.useEffect(() => {
        if (typeof props.onLoad === "function") {
          (props.onLoad as () => void)();
        }
      }, [props.onLoad]);
      return <RN.View testID={props.testID as string} />;
    }),
  };
});

jest.mock("react-native-reanimated", () =>
  require("react-native-reanimated/mock"),
);

const MOCK_COMPOSITION = {
  width: 1080,
  height: 1920,
  fps: 30,
  durationInFrames: 300,
  background: { type: "solid" as const, source: "#1a1a2e" },
  hue: {
    enabled: false,
    color: "none" as const,
    opacity: 0,
    animation: "static" as const,
  },
  head: {
    imageUrl: "",
    position: { x: 50, y: 45 },
    scale: 0.4,
    enterAtFrame: 15,
    animation: "pop" as const,
    animationConfig: { popDamping: 12 },
  },
  decorativeElements: [],
  textSlots: [
    {
      id: "main",
      text: "Eid Mubarak!",
      position: { x: 50, y: 75 },
      fontFamily: "clean" as const,
      fontSize: 64,
      color: "#FFFFFF",
      animation: "fade-in" as const,
      enterAtFrame: 45,
    },
  ],
  audio: { trackUrl: "", volume: 0.8 },
};

describe("RemotionPreview", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders WebView when PREVIEW_URL is set", () => {
    render(
      <RemotionPreview
        composition={MOCK_COMPOSITION}
        width={300}
        height={534}
      />,
    );
    expect(screen.getByTestId("remotion-webview")).toBeTruthy();
  });

  it("sends composition via postMessage after WebView loads", () => {
    render(
      <RemotionPreview
        composition={MOCK_COMPOSITION}
        width={300}
        height={534}
      />,
    );
    expect(mockPostMessage).toHaveBeenCalled();
    const message = JSON.parse(mockPostMessage.mock.calls[0][0]);
    expect(message.type).toBe("UPDATE_COMPOSITION");
    expect(message.composition.width).toBe(1080);
  });

  it("sends updated composition when props change", () => {
    const { rerender } = render(
      <RemotionPreview
        composition={MOCK_COMPOSITION}
        width={300}
        height={534}
      />,
    );
    mockPostMessage.mockClear();
    const updated = {
      ...MOCK_COMPOSITION,
      textSlots: [{ ...MOCK_COMPOSITION.textSlots[0], text: "Updated!" }],
    };
    rerender(
      <RemotionPreview composition={updated} width={300} height={534} />,
    );
    expect(mockPostMessage).toHaveBeenCalled();
    const message = JSON.parse(
      mockPostMessage.mock.calls[mockPostMessage.mock.calls.length - 1][0],
    );
    expect(message.composition.textSlots[0].text).toBe("Updated!");
  });
});
