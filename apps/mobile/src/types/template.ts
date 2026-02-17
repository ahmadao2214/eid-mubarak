// Template system types — defines the structure of meme video cards
// These types are the contract between frontend and Remotion compositions

export type HueColor = "#FFD700" | "#FF69B4" | "#00C853" | "#2196F3" | "#F5A623" | "none";

export type BackgroundAnimation = "slow-zoom" | "pan-left" | "static";
export type HueAnimation = "pulse" | "static";
export type HeadAnimationType = "pop" | "zoom-pulse" | "spiral-multiply" | "float";
export type FlowerType = "rose" | "sunflower" | "lotus";
export type TextAnimation = "fade-in" | "rise-up" | "typewriter" | "float";
export type FontStyle = "psychedelic" | "classic" | "bollywood" | "clean" | "trucker-art";
export type DecorativeType = "lottie" | "image";

export interface Position {
  x: number; // percentage of canvas (0-100)
  y: number;
}

export interface BackgroundLayer {
  type: "video" | "image" | "solid";
  source: string; // URL or color hex
  animation?: BackgroundAnimation;
}

export interface HueOverlayLayer {
  enabled: boolean;
  defaultColor: HueColor;
  allowedColors: HueColor[];
  opacity: number; // 0-1
  animation?: HueAnimation;
}

export interface DecorativeElement {
  type: DecorativeType;
  source: string;
  position: Position;
  scale: number;
  enterAtFrame: number;
  animation?: string;
}

export interface HeadSlotLayer {
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
}

export interface TextSlot {
  id: string;
  defaultText: string;
  editable: boolean;
  position: Position;
  style: {
    fontFamily: FontStyle;
    fontSize: number;
    color: string;
    stroke?: string;
    shadow?: boolean;
  };
  animation: TextAnimation;
  enterAtFrame: number;
}

export interface TemplateLayers {
  background: BackgroundLayer;
  hueOverlay: HueOverlayLayer;
  decorativeElements: DecorativeElement[];
  headSlot: HeadSlotLayer;
  textSlots: TextSlot[];
}

export interface AudioConfig {
  defaultTrack: string;
  volume: number;
}

export type ConfigurableSlot =
  | "hueColor"
  | "decorativeElement"
  | "headImage"
  | "headAnimation"
  | "textContent"
  | "fontStyle"
  | "sound"
  | "flowerType";

export interface MemeTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;

  // Video settings
  duration: number;  // seconds (10, 15, 20)
  fps: number;       // 30
  width: number;     // 1080
  height: number;    // 1920 (9:16)

  layers: TemplateLayers;
  audio: AudioConfig;
  configurableSlots: ConfigurableSlot[];
}

// Preset IDs
export type PresetId =
  | "zohran-classic"
  | "trucker-art"
  | "celebrity-greeting"
  | "six-head-spiral"
  | "custom";
