// Self-contained Remotion composition types
// Mirrors apps/mobile/src/types/template.ts
// Kept separate to avoid cross-workspace dependency

export type PresetId =
  | "zohran-classic"
  | "trucker-art"
  | "celebrity-greeting"
  | "six-head-spiral"
  | "custom";

export type HueColor =
  | "#FFD700"
  | "#FF69B4"
  | "#00C853"
  | "#2196F3"
  | "#F5A623"
  | "none";

export type HueAnimation = "pulse" | "static";

export type HeadAnimationType =
  | "pop"
  | "zoom-pulse"
  | "spiral-multiply"
  | "float";

export type FlowerType = "rose" | "sunflower" | "lotus";

export type TextAnimation = "fade-in" | "rise-up" | "typewriter" | "float";

export type FontStyle =
  | "psychedelic"
  | "classic"
  | "bollywood"
  | "clean"
  | "trucker-art";

export type BackgroundAnimation = "slow-zoom" | "pan-left" | "static";

export type DecorativeType = "lottie" | "image";

export interface Position {
  x: number; // 0-100 percentage
  y: number; // 0-100 percentage
}

export interface BackgroundLayer {
  type: "image" | "video" | "solid";
  source: string;
  animation?: BackgroundAnimation;
}

export interface DecorativeElement {
  type: DecorativeType;
  source: string;
  position: Position;
  scale: number;
  enterAtFrame: number;
  animation?: string;
}

export interface CompositionProps {
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;

  background: BackgroundLayer;

  hue: {
    enabled: boolean;
    color: HueColor;
    opacity: number;
    animation: HueAnimation;
  };

  head: {
    imageUrl: string;
    position: Position;
    scale: number;
    enterAtFrame: number;
    animation: HeadAnimationType;
    animationConfig?: {
      spiralCount?: number;
      pulseSpeed?: number;
      popDamping?: number;
    };
    flowerReveal?: {
      enabled: boolean;
      type: FlowerType;
    };
  };

  decorativeElements: DecorativeElement[];

  textSlots: Array<{
    id: string;
    text: string;
    position: Position;
    fontFamily: FontStyle;
    fontSize: number;
    color: string;
    stroke?: string;
    shadow?: boolean;
    animation: TextAnimation;
    enterAtFrame: number;
  }>;

  audio: {
    trackUrl: string;
    volume: number;
  };
}
