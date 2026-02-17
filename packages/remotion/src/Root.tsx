import { Composition } from "remotion";
import { EidMemeVideo } from "./EidMemeVideo";
import type { CompositionProps } from "./types";

const defaultProps: CompositionProps = {
  width: 1080,
  height: 1920,
  fps: 30,
  durationInFrames: 300, // 10 seconds at 30fps
  background: {
    type: "solid",
    source: "#1a1a2e",
  },
  hue: {
    enabled: true,
    color: "#FFD700",
    opacity: 0.3,
    animation: "pulse",
  },
  head: {
    imageUrl: "",
    position: { x: 50, y: 45 },
    scale: 0.4,
    enterAtFrame: 15,
    animation: "zoom-pulse",
  },
  decorativeElements: [],
  textSlots: [
    {
      id: "main",
      text: "Eid Mubarak!",
      position: { x: 50, y: 75 },
      fontFamily: "psychedelic",
      fontSize: 64,
      color: "#FFFFFF",
      animation: "rise-up",
      enterAtFrame: 45,
    },
  ],
  audio: {
    trackUrl: "",
    volume: 0.8,
  },
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="EidMemeVideo"
        component={EidMemeVideo as React.FC}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={defaultProps}
      />
    </>
  );
};
