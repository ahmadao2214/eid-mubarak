import type { CompositionProps, PresetId } from "@/types";

export interface PresetConfig {
  id: PresetId;
  name: string;
  description: string;
  defaultProps: CompositionProps;
  /** Frame number to capture for the static thumbnail. Pick via Remotion preview scrubber. */
  thumbnailFrame: number;
  /** S3 URL of pre-rendered thumbnail PNG. Empty until generated. */
  thumbnailUrl: string;
}

const zohranClassic: PresetConfig = {
  id: "zohran-classic",
  name: "Zohran Classic",
  description:
    "Mountain road backdrop with gold hue, rose-heart decor, and psychedelic text",
  thumbnailFrame: 90,
  thumbnailUrl: "",
  defaultProps: {
    width: 1080,
    height: 1920,
    fps: 30,
    durationInFrames: 300,
    background: {
      type: "image",
      source: "/assets/ladakh-highway.jpg",
      animation: "slow-zoom",
    },
    hue: {
      enabled: true,
      color: "#FFD700",
      opacity: 0.55,
      animation: "cycle",
    },
    head: {
      imageUrl: "/assets/heads/zohran.png",
      position: { x: 50, y: 45 },
      scale: 0.85,
      enterAtFrame: 45,
      animation: "spiral-multiply",
      animationConfig: {
        spiralCount: 6,
        orbitRadius: 450,
        orbitSpeed: 0.5,
        copyScale: 0.5,
      },
      flowerReveal: { enabled: true, type: "sunflower", videoSource: "/assets/sunflower-bloom.mp4", enterAtFrame: 15 },
    },
    decorativeElements: [
      {
        type: "image",
        source: "/assets/rose.png",
        position: { x: 50, y: 45 },
        scale: 3.0,
        enterAtFrame: 0,
        exitAtFrame: 45,
        animation: "rose-heart",
      },
      { type: "image", source: "/assets/rose.png", position: { x: 15, y: 10 }, scale: 0.8, enterAtFrame: 50, animation: "pulse" },
      { type: "image", source: "/assets/rose.png", position: { x: 85, y: 15 }, scale: 0.8, enterAtFrame: 55, animation: "pulse" },
      { type: "image", source: "/assets/rose.png", position: { x: 10, y: 85 }, scale: 0.8, enterAtFrame: 60, animation: "pulse" },
      { type: "image", source: "/assets/rose.png", position: { x: 90, y: 80 }, scale: 0.8, enterAtFrame: 65, animation: "pulse" },
    ],
    textSlots: [
      {
        id: "word-0",
        text: "EID",
        position: { x: 50, y: 22 },
        fontFamily: "psychedelic",
        fontSize: 120,
        color: "#FFFFFF",
        stroke: "#FFD700",
        shadow: true,
        animation: "rise-up",
        enterAtFrame: 50,
        group: "greeting",
      },
      {
        id: "word-1",
        text: "MUBARAK",
        position: { x: 50, y: 68 },
        fontFamily: "psychedelic",
        fontSize: 100,
        color: "#FFFFFF",
        stroke: "#FFD700",
        shadow: true,
        animation: "rise-up",
        enterAtFrame: 55,
        group: "greeting",
      },
    ],
    audio: { trackUrl: "", volume: 0.8 },
  },
};

const truckerArt: PresetConfig = {
  id: "trucker-art",
  name: "Trucker Art",
  description:
    "Vibrant trucker panel backdrop with borders, chains, peacock decor, and bold font",
  thumbnailFrame: 90,
  thumbnailUrl: "",
  defaultProps: {
    width: 1080,
    height: 1920,
    fps: 30,
    durationInFrames: 300,
    background: {
      type: "image",
      source: "/assets/pakistan-truck-art.jpg",
      animation: "static",
    },
    hue: {
      enabled: true,
      color: "#F5A623",
      opacity: 0.25,
      animation: "pulse",
    },
    head: {
      imageUrl: "/assets/heads/mufti.png",
      position: { x: 50, y: 42 },
      scale: 1.2,
      enterAtFrame: 10,
      animation: "pop",
      animationConfig: { popDamping: 10 },
      flowerReveal: { enabled: true, type: "lotus" },
    },
    decorativeElements: [
      {
        type: "image",
        source: "/assets/pakistani-truck-art-fram.jpg",
        position: { x: 50, y: 50 },
        scale: 1.2,
        enterAtFrame: 0,
      },
      {
        type: "image",
        source: "/assets/pakistani-truck-art-chain.png",
        position: { x: 50, y: 15 },
        scale: 1,
        enterAtFrame: 5,
      },
      {
        type: "image",
        source: "/assets/pakistani-truck-art-peacock.png",
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

const celebrityGreeting: PresetConfig = {
  id: "celebrity-greeting",
  name: "Celebrity Greeting",
  description:
    "Elegant dark backdrop with gold particles, crescent moon, and clean typography",
  thumbnailFrame: 90,
  thumbnailUrl: "",
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
      imageUrl: "/assets/heads/srk.jpg",
      position: { x: 50, y: 38 },
      scale: 1.5,
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
        source: "/assets/moon-crescent-icon-moon.jpg",
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

const sixHeadSpiral: PresetConfig = {
  id: "six-head-spiral",
  name: "Six Head Spiral",
  description:
    "Desert highway backdrop with pink hue, sparkle overlay, and 6 spiraling heads",
  thumbnailFrame: 90,
  thumbnailUrl: "",
  defaultProps: {
    width: 1080,
    height: 1920,
    fps: 30,
    durationInFrames: 300,
    background: {
      type: "image",
      source: "/assets/zagros-mtns.jpg",
      animation: "static",
    },
    hue: {
      enabled: true,
      color: "#FF69B4",
      opacity: 0.2,
      animation: "pulse",
    },
    head: {
      imageUrl: "/assets/heads/drak-hijab.png",
      position: { x: 50, y: 45 },
      scale: 0.9,
      enterAtFrame: 15,
      animation: "spiral-multiply",
      animationConfig: { spiralCount: 6, orbitRadius: 400, orbitSpeed: 0.5, copyScale: 0.5 },
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

const customPreset: PresetConfig = {
  id: "custom",
  name: "Blank Canvas",
  description: "Empty canvas — pick your own head, background, and style",
  thumbnailFrame: 0,
  thumbnailUrl: "",
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
      scale: 1.2,
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

export const PRESETS: PresetConfig[] = [
  zohranClassic,
  truckerArt,
  celebrityGreeting,
  sixHeadSpiral,
  customPreset,
];

export function getPresetById(id: PresetId): PresetConfig | undefined {
  return PRESETS.find((p) => p.id === id);
}
