import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import type { CompositionProps } from "../types";
import { getFontFamily } from "../utils/animation-helpers";

type TextSlot = CompositionProps["textSlots"][number];
type Props = { slot: TextSlot; hue?: CompositionProps["hue"] };

export const AnimatedText: React.FC<Props> = ({ slot, hue }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = frame - slot.enterAtFrame;
  if (localFrame < 0) return null;

  const entrance = spring({ frame: localFrame, fps, config: { damping: 15 } });

  let transform = "translate(-50%, -50%)";
  let opacity = 1;
  let visibleText = slot.text;

  switch (slot.animation) {
    case "rise-up": {
      const ty = interpolate(entrance, [0, 1], [60, 0]);
      transform += ` translateY(${ty}px)`;
      opacity = entrance;
      break;
    }
    case "fade-in": {
      opacity = entrance;
      break;
    }
    case "typewriter": {
      const charCount = Math.floor(
        interpolate(localFrame, [0, fps * 2], [0, slot.text.length], {
          extrapolateRight: "clamp",
        })
      );
      visibleText = slot.text.slice(0, charCount);
      break;
    }
    case "float": {
      const floatY = Math.sin((localFrame / fps) * Math.PI * 2 * 0.3) * 10;
      transform += ` translateY(${floatY}px)`;
      opacity = entrance;
      break;
    }
  }

  // Multi-layer glow when shadow + hue cycle are both active
  const useGlow = slot.shadow && hue?.animation === "cycle";
  const glowColor = slot.stroke ?? "#FFD700";
  const textShadow = slot.shadow
    ? useGlow
      ? `0 0 10px ${glowColor}, 0 0 20px ${glowColor}, 0 0 40px ${glowColor}, 0 2px 8px rgba(0,0,0,0.5)`
      : "0 2px 8px rgba(0,0,0,0.5)"
    : undefined;
  const filter = useGlow
    ? `hue-rotate(${Math.round((frame / fps) * 90)}deg)`
    : undefined;

  return (
    <div
      style={{
        position: "absolute",
        left: `${slot.position.x}%`,
        top: `${slot.position.y}%`,
        transform,
        opacity,
        fontFamily: getFontFamily(slot.fontFamily),
        fontSize: slot.fontSize,
        color: slot.color,
        textAlign: "center",
        whiteSpace: "nowrap",
        WebkitTextStroke: slot.stroke ? `2px ${slot.stroke}` : undefined,
        textShadow,
        filter,
      }}
    >
      {visibleText}
    </div>
  );
};
