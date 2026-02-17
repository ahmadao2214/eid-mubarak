import type { PresetConfig } from "./preset-schema";

export const custom: PresetConfig = {
  id: "custom",
  name: "Custom",
  description: "Blank slate with minimal defaults — customize everything",
  defaultProps: {
    width: 1080,
    height: 1920,
    fps: 30,
    durationInFrames: 300,
    background: {
      type: "solid",
      source: "#1a1a2e",
    },
    hue: {
      enabled: false,
      color: "none",
      opacity: 0,
      animation: "static",
    },
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
};
