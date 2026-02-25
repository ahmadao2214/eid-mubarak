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
 * Renders petals as a wreath AROUND the head (not behind it).
 * The radius is based on head scale so petals are always visible
 * outside the head circle.
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

  const bloomProgress = spring({
    frame: localFrame,
    fps,
    config: { damping: 10, stiffness: 80 },
  });

  // Head is 400px at scale 1.0, so radius = 200 * headScale.
  // Place petals just outside the head edge with some padding.
  const headRadius = 200 * headScale;
  const petalRadius = headRadius + 40; // 40px outside head edge
  const svgSize = (petalRadius + 80) * 2; // enough room for petals
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
      <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}>
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
        headScale={head.scale}
        localFrame={localFrame}
        fps={fps}
      />
    );
  }

  // Lottie rendering would go here when assets are ready
  return null;
};
