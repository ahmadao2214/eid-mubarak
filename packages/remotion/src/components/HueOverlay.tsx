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

  return (
    <AbsoluteFill
      style={{
        backgroundColor: hue.color,
        opacity,
        mixBlendMode: "overlay",
      }}
    />
  );
};
