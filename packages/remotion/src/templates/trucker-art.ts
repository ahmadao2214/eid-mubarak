import type { PresetConfig } from "./preset-schema";

export const truckerArt: PresetConfig = {
  id: "trucker-art",
  name: "Trucker Art",
  description: "Vibrant trucker panel backdrop with borders, chains, peacock decor, and bold font",
  defaultProps: {
    width: 1080,
    height: 1920,
    fps: 30,
    durationInFrames: 300,
    background: {
      type: "image",
      source: "placeholder:trucker-panel",
      animation: "static",
    },
    hue: {
      enabled: true,
      color: "#F5A623",
      opacity: 0.25,
      animation: "pulse",
    },
    head: {
      imageUrl: "",
      position: { x: 50, y: 42 },
      scale: 0.4,
      enterAtFrame: 10,
      animation: "pop",
      animationConfig: { popDamping: 10 },
      flowerReveal: { enabled: true, type: "lotus" },
    },
    decorativeElements: [
      {
        type: "image",
        source: "placeholder:trucker-art-border",
        position: { x: 50, y: 50 },
        scale: 1.2,
        enterAtFrame: 0,
      },
      {
        type: "image",
        source: "placeholder:trucker-art-chain",
        position: { x: 50, y: 15 },
        scale: 1,
        enterAtFrame: 5,
      },
      {
        type: "image",
        source: "placeholder:trucker-art-peacock",
        position: { x: 50, y: 90 },
        scale: 0.9,
        enterAtFrame: 10,
        animation: "fan-out",
      },
    ],
    textSlots: [
      {
        id: "main",
        text: "Eid Mubarak!",
        position: { x: 50, y: 75 },
        fontFamily: "trucker-art",
        fontSize: 64,
        color: "#FFFFFF",
        stroke: "#F5A623",
        animation: "rise-up",
        enterAtFrame: 40,
      },
    ],
    audio: { trackUrl: "", volume: 0.8 },
  },
};
