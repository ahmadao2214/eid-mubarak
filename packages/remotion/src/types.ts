// Self-contained Remotion composition types
// Mirrors apps/mobile/src/types/composition.ts + template.ts
// Kept separate to avoid cross-workspace dependency

export type HueColor = string;
export type HeadAnimationType =
  | "zoom-pulse"
  | "spiral-in"
  | "pop-bounce"
  | "float";
export type FlowerType = "rose" | "jasmine" | "lotus" | "marigold";
export type TextAnimation =
  | "rise-up"
  | "typewriter"
  | "glow-pulse"
  | "bounce-in";
export type FontStyle =
  | "psychedelic"
  | "naskh-arabic"
  | "groovy-latin"
  | "trucker-art";
export type BackgroundAnimation = "parallax-scroll" | "static" | "slow-zoom";

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
  type: "lottie" | "image";
  source: string; // Lottie JSON URL or image URL
  position: Position;
  scale: number;
  enterAtFrame: number;
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
    animation: "pulse" | "static";
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
    animation: TextAnimation;
    enterAtFrame: number;
  }>;

  audio: {
    trackUrl: string;
    volume: number;
  };
}
