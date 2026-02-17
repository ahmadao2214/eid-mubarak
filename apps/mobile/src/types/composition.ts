// Remotion composition props — what gets passed to the video renderer
import type {
  BackgroundLayer,
  HueColor,
  DecorativeElement,
  HeadAnimationType,
  FlowerType,
  FontStyle,
  TextAnimation,
  Position,
} from "./template";

export interface CompositionProps {
  // Video dimensions
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;

  // Layer data
  background: BackgroundLayer;

  hue: {
    enabled: boolean;
    color: HueColor;
    opacity: number;
    animation: "pulse" | "static";
  };

  head: {
    imageUrl: string; // S3 URL or local asset
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
