import { useCurrentFrame, useVideoConfig, spring } from "remotion";
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

/**
 * SVG fallback petal animation for when Lottie data is unavailable.
 * Renders petals around the head position with spring-based bloom.
 */
const PetalFallback: React.FC<{
  flowerType: string;
  position: { x: number; y: number };
  localFrame: number;
  fps: number;
}> = ({ flowerType, position, localFrame, fps }) => {
  const color = FLOWER_COLORS[flowerType] ?? EID_PINK;
  const petalCount = PETAL_COUNTS[flowerType] ?? 8;

  const bloomProgress = spring({
    frame: localFrame,
    fps,
    config: { damping: 10, stiffness: 80 },
  });

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
      <svg width="500" height="500" viewBox="0 0 500 500">
        {Array.from({ length: petalCount }, (_, i) => {
          const angle = (360 / petalCount) * i;
          const rad = (angle * Math.PI) / 180;
          const petalScale = bloomProgress;
          const cx = 250 + Math.cos(rad) * 120 * petalScale;
          const cy = 250 + Math.sin(rad) * 120 * petalScale;
          return (
            <ellipse
              key={i}
              cx={cx}
              cy={cy}
              rx={30 * petalScale}
              ry={50 * petalScale}
              fill={color}
              opacity={0.7 * bloomProgress}
              transform={`rotate(${angle}, ${cx}, ${cy})`}
            />
          );
        })}
      </svg>
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

  const localFrame = frame - head.enterAtFrame;
  if (localFrame < 0) return null;

  // Always use SVG fallback (Lottie assets not yet available)
  if (!lottieData) {
    return (
      <PetalFallback
        flowerType={head.flowerReveal.type}
        position={head.position}
        localFrame={localFrame}
        fps={fps}
      />
    );
  }

  // Lottie rendering would go here when assets are ready
  return null;
};
