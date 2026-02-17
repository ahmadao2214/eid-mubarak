import { Img, useCurrentFrame, useVideoConfig, spring } from "remotion";
import type { DecorativeElement as DecorativeElementType } from "../types";
import { isPlaceholderSource, resolvePlaceholder } from "../utils/placeholders";
import { useLottieData } from "../utils/lottie-loader";

type Props = { element: DecorativeElementType };

const PlaceholderDecor: React.FC<{
  element: DecorativeElementType;
  src: string;
}> = ({ element, src }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - element.enterAtFrame;
  if (localFrame < 0) return null;

  const entrance = spring({
    frame: localFrame,
    fps,
    config: { damping: 12 },
  });

  let animTransform = "";
  const anim = element.animation ?? "";

  if (anim === "float") {
    const floatY = Math.sin((localFrame / fps) * Math.PI * 2 * 0.3) * 8;
    animTransform = `translateY(${floatY}px)`;
  } else if (anim === "fan-out") {
    // Used for peacock — scale up from center
    animTransform = `scale(${entrance})`;
  } else if (anim === "pulse") {
    const pulse = 0.9 + Math.sin((localFrame / fps) * Math.PI * 2 * 0.5) * 0.1;
    animTransform = `scale(${pulse})`;
  }

  return (
    <div
      style={{
        position: "absolute",
        left: `${element.position.x}%`,
        top: `${element.position.y}%`,
        transform: `translate(-50%, -50%) scale(${element.scale * entrance}) ${animTransform}`,
        opacity: entrance,
      }}
    >
      <img
        src={src}
        style={{ width: 200, height: 200, objectFit: "contain" }}
      />
    </div>
  );
};

export const DecorativeElement: React.FC<Props> = ({ element }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lottieData = useLottieData(
    element.type === "lottie" ? element.source : ""
  );

  const localFrame = frame - element.enterAtFrame;
  if (localFrame < 0) return null;

  // Placeholder SVG path
  if (isPlaceholderSource(element.source)) {
    const src = resolvePlaceholder(element.source) ?? element.source;
    return <PlaceholderDecor element={element} src={src} />;
  }

  // Lottie rendering (when data is available)
  if (element.type === "lottie" && lottieData) {
    // @remotion/lottie Lottie component would be used here
    return null;
  }

  // Regular image
  const entrance = spring({
    frame: localFrame,
    fps,
    config: { damping: 12 },
  });

  return (
    <div
      style={{
        position: "absolute",
        left: `${element.position.x}%`,
        top: `${element.position.y}%`,
        transform: `translate(-50%, -50%) scale(${element.scale * entrance})`,
        opacity: entrance,
      }}
    >
      <Img
        src={element.source}
        style={{ width: 200, height: 200, objectFit: "contain" }}
      />
    </div>
  );
};
