import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import type { CompositionProps } from "../types";

type Props = { hue: CompositionProps["hue"] };

export const HueOverlay: React.FC<Props> = ({ hue }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!hue.enabled || hue.color === "none") return null;

  const opacity =
    hue.animation === "pulse"
      ? hue.opacity * 0.5 +
        hue.opacity *
          0.5 *
          ((Math.sin((frame / fps) * Math.PI * 2 * 0.5) + 1) / 2)
      : hue.opacity;

  // Cycle mode: 360deg hue-rotate over ~4 seconds (120 frames at 30fps)
  const filter =
    hue.animation === "cycle"
      ? `hue-rotate(${Math.round((frame / fps) * 90)}deg)`
      : undefined;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: hue.color,
        opacity,
        mixBlendMode: "overlay",
        filter,
      }}
    />
  );
};
