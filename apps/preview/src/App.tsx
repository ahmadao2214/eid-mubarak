import { useState, useEffect, useCallback } from "react";
import { Player } from "@remotion/player";
import { EidMemeVideo } from "@eid-meme-maker/remotion/src/EidMemeVideo";
import { getPreset } from "@eid-meme-maker/remotion/src/templates";
import type { CompositionProps } from "@eid-meme-maker/remotion/src/types";

const DEFAULT_COMPOSITION = getPreset("custom").defaultProps;

interface UpdateMessage {
  type: "UPDATE_COMPOSITION";
  composition: CompositionProps;
}

function isUpdateMessage(data: unknown): data is UpdateMessage {
  return (
    typeof data === "object" &&
    data !== null &&
    "type" in data &&
    (data as Record<string, unknown>).type === "UPDATE_COMPOSITION" &&
    "composition" in data
  );
}

export default function App() {
  const [composition, setComposition] =
    useState<CompositionProps>(DEFAULT_COMPOSITION);
  const [ready, setReady] = useState(false);

  const handleMessage = useCallback((e: MessageEvent) => {
    let parsed: unknown;
    try {
      parsed = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
    } catch {
      return;
    }

    if (isUpdateMessage(parsed)) {
      setComposition(parsed.composition);
      if (!ready) setReady(true);
      // Acknowledge receipt so React Native knows we're listening
      const rn = (window as unknown as Record<string, unknown>).ReactNativeWebView as
        | { postMessage: (msg: string) => void }
        | undefined;
      if (rn) {
        rn.postMessage(JSON.stringify({ type: "ACK" }));
      }
    }
  }, [ready]);

  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handleMessage]);

  // Notify React Native WebView that we're ready to receive messages
  useEffect(() => {
    const rn = (window as unknown as Record<string, unknown>).ReactNativeWebView as
      | { postMessage: (msg: string) => void }
      | undefined;
    if (rn) {
      rn.postMessage(JSON.stringify({ type: "READY" }));
    }
  }, []);

  return (
    <div data-testid="preview-root" style={{ width: "100%", height: "100%" }}>
      {!ready && (
        <div
          data-testid="loading-state"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#FFD700",
            fontSize: 16,
            fontFamily: "sans-serif",
            background: "#000",
            zIndex: 10,
          }}
        >
          Waiting for composition...
        </div>
      )}
      <Player
        component={EidMemeVideo as React.FC}
        compositionWidth={composition.width}
        compositionHeight={composition.height}
        fps={composition.fps}
        durationInFrames={composition.durationInFrames}
        inputProps={{ ...composition }}
        style={{ width: "100%", height: "100%" }}
        autoPlay
        loop
      />
    </div>
  );
}
