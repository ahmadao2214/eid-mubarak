import type { PresetConfig } from "./preset-schema";

export const celebrityGreeting: PresetConfig = {
  id: "celebrity-greeting",
  name: "Celebrity Greeting",
  description: "Elegant dark backdrop with gold particles, crescent moon, and clean typography",
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
      enabled: true,
      color: "#FFD700",
      opacity: 0.15,
      animation: "static",
    },
    head: {
      imageUrl: "",
      position: { x: 50, y: 38 },
      scale: 0.5,
      enterAtFrame: 10,
      animation: "pop",
      animationConfig: { popDamping: 14 },
    },
    decorativeElements: [
      {
        type: "image",
        source: "placeholder:gold-particles",
        position: { x: 50, y: 50 },
        scale: 2,
        enterAtFrame: 0,
        animation: "pulse",
      },
      {
        type: "image",
        source: "placeholder:crescent-moon",
        position: { x: 85, y: 10 },
        scale: 0.5,
        enterAtFrame: 0,
        animation: "float",
      },
    ],
    textSlots: [
      {
        id: "greeting",
        text: "Eid Mubarak!",
        position: { x: 50, y: 68 },
        fontFamily: "clean",
        fontSize: 72,
        color: "#FFFFFF",
        shadow: true,
        animation: "fade-in",
        enterAtFrame: 30,
      },
      {
        id: "subtitle",
        text: "Wishing you joy and blessings",
        position: { x: 50, y: 78 },
        fontFamily: "clean",
        fontSize: 36,
        color: "#FFD700",
        animation: "fade-in",
        enterAtFrame: 60,
      },
    ],
    audio: { trackUrl: "", volume: 0.8 },
  },
};
