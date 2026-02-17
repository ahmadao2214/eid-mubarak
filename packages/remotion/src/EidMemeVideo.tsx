import { AbsoluteFill, Audio, Sequence, useVideoConfig } from "remotion";
import type { CompositionProps } from "./types";
import {
  BackgroundLayer,
  HueOverlay,
  DecorativeElement,
  FlowerReveal,
  HeadAnimation,
  AnimatedText,
} from "./components";

export const EidMemeVideo: React.FC<CompositionProps> = (props) => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      {/* Layer 1: Background */}
      <BackgroundLayer background={props.background} />

      {/* Layer 2: Hue overlay */}
      <HueOverlay hue={props.hue} />

      {/* Layer 3: Decorative elements */}
      {props.decorativeElements.map((el, i) => (
        <Sequence key={i} from={el.enterAtFrame}>
          <DecorativeElement element={el} />
        </Sequence>
      ))}

      {/* Layer 4: Flower reveal (renders under head) */}
      <FlowerReveal head={props.head} />

      {/* Layer 5: Head slot */}
      <HeadAnimation head={props.head} />

      {/* Layer 6: Text slots */}
      {props.textSlots.map((slot) => (
        <Sequence key={slot.id} from={slot.enterAtFrame}>
          <AnimatedText slot={slot} />
        </Sequence>
      ))}

      {/* Layer 7: Audio */}
      {props.audio.trackUrl && (
        <Audio src={props.audio.trackUrl} volume={props.audio.volume} />
      )}
    </AbsoluteFill>
  );
};
