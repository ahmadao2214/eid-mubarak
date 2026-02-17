import { AbsoluteFill, Img, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import type { CompositionProps } from "../types";
import { isPlaceholderSource, resolvePlaceholder } from "../utils/placeholders";

type Props = { background: CompositionProps["background"] };

export const BackgroundLayer: React.FC<Props> = ({ background }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  if (background.type === "solid") {
    return <AbsoluteFill style={{ backgroundColor: background.source }} />;
  }

  const src = isPlaceholderSource(background.source)
    ? resolvePlaceholder(background.source) ?? background.source
    : background.source;

  const animation = background.animation ?? "static";

  let transform = "none";
  if (animation === "slow-zoom") {
    const scale = interpolate(frame, [0, durationInFrames], [1, 1.15], {
      extrapolateRight: "clamp",
    });
    transform = `scale(${scale})`;
  } else if (animation === "pan-left") {
    const tx = interpolate(frame, [0, durationInFrames], [0, -10], {
      extrapolateRight: "clamp",
    });
    transform = `translateX(${tx}%)`;
  }

  return (
    <AbsoluteFill>
      <Img
        src={src}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform,
        }}
      />
    </AbsoluteFill>
  );
};
