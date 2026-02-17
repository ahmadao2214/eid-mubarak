import type { PresetConfig } from "./preset-schema";

export const zohranClassic: PresetConfig = {
  id: "zohran-classic",
  name: "Zohran Classic",
  description: "Mountain road backdrop with gold hue, rose-heart decor, and psychedelic text",
  defaultProps: {
    width: 1080,
    height: 1920,
    fps: 30,
    durationInFrames: 300,
    background: {
      type: "image",
      source: "placeholder:mountain-road",
      animation: "slow-zoom",
    },
    hue: {
      enabled: true,
      color: "#FFD700",
      opacity: 0.3,
      animation: "pulse",
    },
    head: {
      imageUrl: "",
      position: { x: 50, y: 40 },
      scale: 0.45,
      enterAtFrame: 15,
      animation: "zoom-pulse",
      animationConfig: { pulseSpeed: 1 },
      flowerReveal: { enabled: true, type: "rose" },
    },
    decorativeElements: [
      {
        type: "image",
        source: "placeholder:rose-heart",
        position: { x: 50, y: 70 },
        scale: 0.8,
        enterAtFrame: 5,
        animation: "pulse",
      },
    ],
    textSlots: [
      {
        id: "main",
        text: "Eid Mubarak!",
        position: { x: 50, y: 80 },
        fontFamily: "psychedelic",
        fontSize: 72,
        color: "#FFFFFF",
        stroke: "#FFD700",
        animation: "rise-up",
        enterAtFrame: 45,
      },
    ],
    audio: { trackUrl: "", volume: 0.8 },
  },
};
