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
    key?: string | number,
    testId?: string
  ) => (
    <div key={key} style={style} data-testid={testId}>
      <Img
        src={src}
        style={{ width: 400, height: 400 }}
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
      const orbitRadius = head.animationConfig?.orbitRadius ?? 300;
      const orbitSpeed = head.animationConfig?.orbitSpeed ?? 0.5;
      const copyScale = head.animationConfig?.copyScale ?? 0.4;
      const staggerFrames = 5;

      // Continuous rotation angle in degrees
      const rotationAngle = (localFrame / fps) * 360 * (orbitSpeed / 10);

      return (
        <>
          {/* Center head at full scale */}
          {renderHead(
            {
              position: "absolute",
              left: `${head.position.x}%`,
              top: `${head.position.y}%`,
              transform: `translate(-50%, -50%) scale(${head.scale * entranceProgress})`,
            },
            "center",
            "center-head"
          )}
          {/* Orbit copies */}
          {Array.from({ length: count }, (_, i) => {
            const copyLocalFrame = localFrame - (i + 1) * staggerFrames;
            if (copyLocalFrame < 0) return null;

            const copyEntrance = spring({
              frame: copyLocalFrame,
              fps,
              config: { damping: 12 },
            });

            const baseAngle = (360 / count) * i;
            const angle = ((baseAngle + rotationAngle) * Math.PI) / 180;
            const dx = Math.cos(angle) * orbitRadius;
            const dy = Math.sin(angle) * orbitRadius * 1.5; // tall ellipse for 9:16 portrait

            return renderHead(
              {
                position: "absolute",
                left: `${head.position.x}%`,
                top: `${head.position.y}%`,
                transform: `translate(-50%, -50%) translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) scale(${head.scale * copyScale * copyEntrance})`,
                opacity: copyEntrance,
              },
              i,
              "orbit-copy"
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
