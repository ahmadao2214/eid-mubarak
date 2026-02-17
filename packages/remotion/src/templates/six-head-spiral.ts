import type { PresetConfig } from "./preset-schema";

export const sixHeadSpiral: PresetConfig = {
  id: "six-head-spiral",
  name: "Six Head Spiral",
  description: "Desert highway backdrop with pink hue, sparkle overlay, and 6 spiraling heads",
  defaultProps: {
    width: 1080,
    height: 1920,
    fps: 30,
    durationInFrames: 300,
    background: {
      type: "image",
      source: "placeholder:desert-highway",
      animation: "pan-left",
    },
    hue: {
      enabled: true,
      color: "#FF69B4",
      opacity: 0.2,
      animation: "pulse",
    },
    head: {
      imageUrl: "",
      position: { x: 50, y: 45 },
      scale: 0.3,
      enterAtFrame: 15,
      animation: "spiral-multiply",
      animationConfig: { spiralCount: 6 },
    },
    decorativeElements: [
      {
        type: "image",
        source: "placeholder:sparkle-overlay",
        position: { x: 50, y: 50 },
        scale: 2,
        enterAtFrame: 0,
        animation: "pulse",
      },
    ],
    textSlots: [
      {
        id: "main",
        text: "Eid Mubarak!",
        position: { x: 50, y: 82 },
        fontFamily: "bollywood",
        fontSize: 68,
        color: "#FFFFFF",
        stroke: "#FF69B4",
        animation: "rise-up",
        enterAtFrame: 50,
      },
    ],
    audio: { trackUrl: "", volume: 0.8 },
  },
};
