import { Img, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import type { DecorativeElement as DecorativeElementType } from "../types";
import { isPlaceholderSource, resolvePlaceholder } from "../utils/placeholders";
import { useLottieData } from "../utils/lottie-loader";

type Props = { element: DecorativeElementType };

// Heart parametric curve: t in [0, 2π] → (x, y) normalized to ~[-1, 1]
function heartPoint(t: number): { x: number; y: number } {
  const x = 16 * Math.sin(t) ** 3;
  const y = -(
    13 * Math.cos(t) -
    5 * Math.cos(2 * t) -
    2 * Math.cos(3 * t) -
    Math.cos(4 * t)
  );
  // Normalize to roughly [-1, 1] range
  return { x: x / 17, y: y / 17 };
}

const ROSE_HEART_COUNT = 24;

const RoseHeartFormation: React.FC<{
  element: DecorativeElementType;
  src: string;
}> = ({ element, src }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - element.enterAtFrame;
  if (localFrame < 0) return null;

  // Heart formation radius in px
  const heartSize = 260 * element.scale;
  const roseSize = 90 * element.scale;

  // Gentle pulse on the whole heart
  const pulse =
    0.95 + Math.sin((localFrame / fps) * Math.PI * 2 * 0.4) * 0.05;

  const exitOpacity = getExitOpacity(frame, element.exitAtFrame);

  return (
    <div
      style={{
        position: "absolute",
        left: `${element.position.x}%`,
        top: `${element.position.y}%`,
        transform: `translate(-50%, -50%) scale(${pulse})`,
        opacity: exitOpacity,
      }}
    >
      {Array.from({ length: ROSE_HEART_COUNT }, (_, i) => {
        const t = (i / ROSE_HEART_COUNT) * Math.PI * 2;
        const { x, y } = heartPoint(t);

        // Stagger each rose's entrance
        const staggerFrame = localFrame - i * 2;
        if (staggerFrame < 0) return null;

        const entrance = spring({
          frame: staggerFrame,
          fps,
          config: { damping: 14, stiffness: 120 },
        });

        // Each rose rotates slightly to follow the heart curve
        const nextT = ((i + 1) / ROSE_HEART_COUNT) * Math.PI * 2;
        const next = heartPoint(nextT);
        const angle =
          Math.atan2(next.y - y, next.x - x) * (180 / Math.PI) + 90;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x * heartSize,
              top: y * heartSize,
              transform: `translate(-50%, -50%) scale(${entrance}) rotate(${angle}deg)`,
              opacity: entrance,
            }}
          >
            <Img
              src={src}
              style={{
                width: roseSize,
                height: roseSize,
                objectFit: "cover",
                borderRadius: "50%",
                mixBlendMode: "screen",
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

function getAnimTransform(
  anim: string,
  localFrame: number,
  fps: number,
  entrance: number
): string {
  if (anim === "float") {
    const floatY = Math.sin((localFrame / fps) * Math.PI * 2 * 0.3) * 8;
    return `translateY(${floatY}px)`;
  }
  if (anim === "fan-out") {
    return `scale(${entrance})`;
  }
  if (anim === "pulse") {
    const pulse =
      0.9 + Math.sin((localFrame / fps) * Math.PI * 2 * 0.5) * 0.1;
    return `scale(${pulse})`;
  }
  return "";
}

/** Whether the source is a JPG on a dark background that needs screen blending */
function needsScreenBlend(source: string): boolean {
  return /\.(jpg|jpeg)$/i.test(source);
}

/** Compute exit fade multiplier: 1 before exitAtFrame, fades to 0 over 15 frames */
function getExitOpacity(frame: number, exitAtFrame?: number): number {
  if (exitAtFrame == null) return 1;
  if (frame <= exitAtFrame) return 1;
  return interpolate(frame, [exitAtFrame, exitAtFrame + 15], [1, 0], {
    extrapolateRight: "clamp",
  });
}

const SingleDecor: React.FC<{
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

  const anim = element.animation ?? "";
  const animTransform = getAnimTransform(anim, localFrame, fps, entrance);
  const useBlend = needsScreenBlend(element.source);
  const exitOpacity = getExitOpacity(frame, element.exitAtFrame);

  return (
    <div
      style={{
        position: "absolute",
        left: `${element.position.x}%`,
        top: `${element.position.y}%`,
        transform: `translate(-50%, -50%) scale(${element.scale * entrance}) ${animTransform}`,
        opacity: entrance * exitOpacity,
      }}
    >
      <Img
        src={src}
        style={{
          width: 200,
          height: 200,
          objectFit: "contain",
          ...(useBlend ? { mixBlendMode: "screen" as const } : {}),
        }}
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

  // Resolve source: placeholder SVG or direct URL
  const isPlaceholder = isPlaceholderSource(element.source);
  const src = isPlaceholder
    ? resolvePlaceholder(element.source) ?? element.source
    : element.source;

  // Rose-heart formation: multiple roses arranged in a heart shape
  if (element.animation === "rose-heart") {
    return <RoseHeartFormation element={element} src={src} />;
  }

  // Lottie rendering (when data is available)
  if (element.type === "lottie" && lottieData) {
    return null;
  }

  // Single image (placeholder or regular)
  return <SingleDecor element={element} src={src} />;
};
