import { Img, OffthreadVideo, useCurrentFrame, useVideoConfig, spring } from "remotion";
import type { CompositionProps } from "../types";
import { useLottieData } from "../utils/lottie-loader";
import { EID_PINK, EID_GOLD, EID_GREEN } from "../utils/colors";

type Props = {
  head: CompositionProps["head"];
};

const FLOWER_COLORS: Record<string, string> = {
  rose: EID_PINK,
  sunflower: EID_GOLD,
  lotus: EID_GREEN,
};

const PETAL_COUNTS: Record<string, number> = {
  rose: 8,
  sunflower: 12,
  lotus: 10,
};

/** Real rose image for rose type, SVG ellipses for others */
const ROSE_IMAGE_SRC = "/assets/rose.png";

/**
 * Renders petals as a wreath AROUND the head.
 * For rose type: uses the real rose.png with screen blend.
 * For other types: SVG ellipse fallback.
 */
const PetalFallback: React.FC<{
  flowerType: string;
  position: { x: number; y: number };
  headScale: number;
  localFrame: number;
  fps: number;
}> = ({ flowerType, position, headScale, localFrame, fps }) => {
  const color = FLOWER_COLORS[flowerType] ?? EID_PINK;
  const petalCount = PETAL_COUNTS[flowerType] ?? 8;
  const useRoseImage = flowerType === "rose";

  const bloomProgress = spring({
    frame: localFrame,
    fps,
    config: { damping: 10, stiffness: 80 },
  });

  // Head is 400px at scale 1.0, so radius = 200 * headScale.
  // Place petals just outside the head edge with some padding.
  const headRadius = 200 * headScale;
  const petalRadius = headRadius + 40;
  const containerSize = (petalRadius + 100) * 2;

  if (useRoseImage) {
    const roseSize = 100 * headScale;
    return (
      <div
        style={{
          position: "absolute",
          left: `${position.x}%`,
          top: `${position.y}%`,
          width: containerSize,
          height: containerSize,
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }}
      >
        {Array.from({ length: petalCount }, (_, i) => {
          const angle = (360 / petalCount) * i;
          const rad = (angle * Math.PI) / 180;

          // Stagger each petal
          const staggerFrame = localFrame - i * 3;
          if (staggerFrame < 0) return null;

          const petalEntrance = spring({
            frame: staggerFrame,
            fps,
            config: { damping: 12, stiffness: 100 },
          });

          const cx =
            containerSize / 2 + Math.cos(rad) * petalRadius * petalEntrance;
          const cy =
            containerSize / 2 + Math.sin(rad) * petalRadius * petalEntrance;

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: cx,
                top: cy,
                transform: `translate(-50%, -50%) rotate(${angle}deg) scale(${petalEntrance})`,
                opacity: petalEntrance,
              }}
            >
              <Img
                src={ROSE_IMAGE_SRC}
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
  }

  // SVG ellipse fallback for sunflower / lotus
  const svgSize = containerSize;
  const center = svgSize / 2;

  return (
    <div
      style={{
        position: "absolute",
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
      }}
    >
      <svg
        width={svgSize}
        height={svgSize}
        viewBox={`0 0 ${svgSize} ${svgSize}`}
      >
        {Array.from({ length: petalCount }, (_, i) => {
          const angle = (360 / petalCount) * i;
          const rad = (angle * Math.PI) / 180;
          const petalScale = bloomProgress;
          const cx = center + Math.cos(rad) * petalRadius * petalScale;
          const cy = center + Math.sin(rad) * petalRadius * petalScale;
          return (
            <ellipse
              key={i}
              cx={cx}
              cy={cy}
              rx={35 * petalScale}
              ry={55 * petalScale}
              fill={color}
              opacity={0.8 * bloomProgress}
              transform={`rotate(${angle}, ${cx}, ${cy})`}
            />
          );
        })}
      </svg>
    </div>
  );
};

const VideoReveal: React.FC<{
  videoSource: string;
  position: { x: number; y: number };
  headScale: number;
}> = ({ videoSource, position, headScale }) => {
  // No spring animation — the video's own bloom (bud → flower) IS the reveal.
  // mixBlendMode "screen" on the container burns away the black background.
  const videoSize = 1100 * headScale;

  return (
    <div style={{
      position: "absolute",
      left: `${position.x}%`,
      top: `${position.y}%`,
      width: videoSize,
      height: videoSize,
      transform: "translate(-50%, -50%)",
      borderRadius: "50%",
      overflow: "hidden",
      mixBlendMode: "screen",
      pointerEvents: "none",
      willChange: "transform",
    }}>
      <OffthreadVideo
        src={videoSource}
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
        startFrom={0}
      />
    </div>
  );
};

export const FlowerReveal: React.FC<Props> = ({ head }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // All hooks must be called before any conditional returns
  const lottieSource = head.flowerReveal?.enabled
    ? `placeholder:flower-${head.flowerReveal.type}`
    : "";
  const lottieData = useLottieData(lottieSource);

  if (!head.flowerReveal?.enabled) return null;

  const flowerEnterAt = head.flowerReveal?.enterAtFrame ?? head.enterAtFrame;
  const localFrame = frame - flowerEnterAt;
  if (localFrame < 0) return null;

  // Video path: transparent video when videoSource is provided
  if (head.flowerReveal.videoSource) {
    return (
      <VideoReveal
        videoSource={head.flowerReveal.videoSource}
        position={head.position}
        headScale={head.scale}
      />
    );
  }

  // Always use SVG fallback (Lottie assets not yet available)
  if (!lottieData) {
    return (
      <PetalFallback
        flowerType={head.flowerReveal.type}
        position={head.position}
        headScale={head.scale}
        localFrame={localFrame}
        fps={fps}
      />
    );
  }

  // Lottie rendering would go here when assets are ready
  return null;
};
