import { Img, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import type { CompositionProps } from "../types";
import { isPlaceholderSource, resolvePlaceholder } from "../utils/placeholders";

type Props = { head: CompositionProps["head"] };

export const HeadAnimation: React.FC<Props> = ({ head }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!head.imageUrl) return null;

  const localFrame = frame - head.enterAtFrame;
  if (localFrame < 0) return null;

  const src = isPlaceholderSource(head.imageUrl)
    ? resolvePlaceholder(head.imageUrl) ?? head.imageUrl
    : head.imageUrl;

  const entranceProgress = spring({
    frame: localFrame,
    fps,
    config: { damping: head.animationConfig?.popDamping ?? 12 },
  });

  const renderHead = (
    style: React.CSSProperties,
    key?: string | number
  ) => (
    <div key={key} style={style}>
      <Img
        src={src}
        style={{ width: 400, height: 400, borderRadius: "50%" }}
      />
    </div>
  );

  switch (head.animation) {
    case "pop": {
      const scale = head.scale * entranceProgress;
      return renderHead({
        position: "absolute",
        left: `${head.position.x}%`,
        top: `${head.position.y}%`,
        transform: `translate(-50%, -50%) scale(${scale})`,
      });
    }

    case "zoom-pulse": {
      const pulse = Math.sin((localFrame / fps) * Math.PI * 2) * 0.05;
      const scale = head.scale * entranceProgress + pulse;
      return renderHead({
        position: "absolute",
        left: `${head.position.x}%`,
        top: `${head.position.y}%`,
        transform: `translate(-50%, -50%) scale(${scale})`,
      });
    }

    case "spiral-multiply": {
      const count = head.animationConfig?.spiralCount ?? 6;
      return (
        <>
          {Array.from({ length: count }, (_, i) => {
            const angleOffset = (360 / count) * i;
            const radius = interpolate(entranceProgress, [0, 1], [200, 0]);
            const rad = (angleOffset * Math.PI) / 180;
            const dx = Math.cos(rad) * radius;
            const dy = Math.sin(rad) * radius;
            const rotation = interpolate(
              entranceProgress,
              [0, 1],
              [angleOffset, 0]
            );
            return renderHead(
              {
                position: "absolute",
                left: `${head.position.x}%`,
                top: `${head.position.y}%`,
                transform: `translate(-50%, -50%) translate(${dx}px, ${dy}px) rotate(${rotation}deg) scale(${head.scale * entranceProgress})`,
              },
              i
            );
          })}
        </>
      );
    }

    case "float": {
      const floatY =
        Math.sin((localFrame / fps) * Math.PI * 2 * 0.3) * 10;
      return renderHead({
        position: "absolute",
        left: `${head.position.x}%`,
        top: `${head.position.y}%`,
        transform: `translate(-50%, -50%) translateY(${floatY}px) scale(${head.scale})`,
      });
    }
  }
};
