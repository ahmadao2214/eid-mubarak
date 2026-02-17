import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import type { CompositionProps } from "./types";

// ── Layer Components ────────────────────────────────────────────

const BackgroundLayer: React.FC<{ background: CompositionProps["background"] }> = ({
  background,
}) => {
  if (background.type === "solid") {
    return (
      <AbsoluteFill style={{ backgroundColor: background.source }} />
    );
  }
  // Image/video backgrounds will be implemented when assets are ready
  return (
    <AbsoluteFill>
      <Img
        src={background.source}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </AbsoluteFill>
  );
};

const HueOverlay: React.FC<{ hue: CompositionProps["hue"] }> = ({ hue }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!hue.enabled) return null;

  const opacity =
    hue.animation === "pulse"
      ? interpolate(
          Math.sin((frame / fps) * Math.PI * 2 * 0.5),
          [-1, 1],
          [hue.opacity * 0.5, hue.opacity]
        )
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

const HeadSlot: React.FC<{ head: CompositionProps["head"]; fps: number }> = ({
  head,
  fps,
}) => {
  const frame = useCurrentFrame();

  if (!head.imageUrl) return null;

  const localFrame = frame - head.enterAtFrame;
  if (localFrame < 0) return null;

  // Base scale with spring entrance
  const entranceProgress = spring({
    frame: localFrame,
    fps,
    config: { damping: head.animationConfig?.popDamping ?? 12 },
  });

  let scale = head.scale * entranceProgress;
  let rotation = 0;

  // Animation variations
  switch (head.animation) {
    case "zoom-pulse": {
      const pulse = Math.sin((localFrame / fps) * Math.PI * 2) * 0.05;
      scale += pulse;
      break;
    }
    case "spiral-in": {
      const spirals = head.animationConfig?.spiralCount ?? 3;
      rotation = interpolate(
        entranceProgress,
        [0, 1],
        [360 * spirals, 0]
      );
      break;
    }
    case "pop-bounce": {
      // Spring handles the bounce naturally
      break;
    }
    case "float": {
      const floatY = Math.sin((localFrame / fps) * Math.PI * 2 * 0.3) * 10;
      scale = head.scale; // No spring scaling for float
      return (
        <div
          style={{
            position: "absolute",
            left: `${head.position.x}%`,
            top: `${head.position.y}%`,
            transform: `translate(-50%, -50%) translateY(${floatY}px) scale(${scale})`,
          }}
        >
          <Img
            src={head.imageUrl}
            style={{ width: 400, height: 400, borderRadius: "50%" }}
          />
        </div>
      );
    }
  }

  return (
    <div
      style={{
        position: "absolute",
        left: `${head.position.x}%`,
        top: `${head.position.y}%`,
        transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg)`,
      }}
    >
      <Img
        src={head.imageUrl}
        style={{ width: 400, height: 400, borderRadius: "50%" }}
      />
    </div>
  );
};

const TextSlot: React.FC<{
  slot: CompositionProps["textSlots"][number];
  fps: number;
}> = ({ slot, fps }) => {
  const frame = useCurrentFrame();
  const localFrame = frame - slot.enterAtFrame;
  if (localFrame < 0) return null;

  const entrance = spring({ frame: localFrame, fps, config: { damping: 15 } });

  let transform = "translate(-50%, -50%)";
  let opacity = entrance;

  switch (slot.animation) {
    case "rise-up":
      transform += ` translateY(${interpolate(entrance, [0, 1], [60, 0])}px)`;
      break;
    case "bounce-in":
      transform += ` scale(${entrance})`;
      break;
    case "typewriter":
      // Show characters progressively
      opacity = 1;
      break;
    case "glow-pulse":
      // Glow handled via text-shadow in style
      break;
  }

  const visibleText =
    slot.animation === "typewriter"
      ? slot.text.slice(
          0,
          Math.floor(interpolate(localFrame, [0, fps * 2], [0, slot.text.length], {
            extrapolateRight: "clamp",
          }))
        )
      : slot.text;

  const glowShadow =
    slot.animation === "glow-pulse"
      ? `0 0 ${20 + Math.sin((localFrame / fps) * Math.PI * 2) * 15}px ${slot.color}`
      : undefined;

  return (
    <div
      style={{
        position: "absolute",
        left: `${slot.position.x}%`,
        top: `${slot.position.y}%`,
        transform,
        opacity,
        fontFamily: slot.fontFamily,
        fontSize: slot.fontSize,
        color: slot.color,
        textAlign: "center",
        whiteSpace: "nowrap",
        textShadow: glowShadow,
        WebkitTextStroke: slot.stroke ? `2px ${slot.stroke}` : undefined,
      }}
    >
      {visibleText}
    </div>
  );
};

// ── Main Composition ────────────────────────────────────────────

export const EidMemeVideo: React.FC<CompositionProps> = (props) => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      {/* Layer 1: Background */}
      <BackgroundLayer background={props.background} />

      {/* Layer 2: Hue overlay */}
      <HueOverlay hue={props.hue} />

      {/* Layer 3: Decorative elements (Lottie / images) */}
      {props.decorativeElements.map((el, i) => (
        <Sequence key={i} from={el.enterAtFrame}>
          <div
            style={{
              position: "absolute",
              left: `${el.position.x}%`,
              top: `${el.position.y}%`,
              transform: `translate(-50%, -50%) scale(${el.scale})`,
            }}
          >
            {el.type === "image" && (
              <Img src={el.source} style={{ width: 200, height: 200 }} />
            )}
            {/* Lottie elements will use @remotion/lottie when assets are ready */}
          </div>
        </Sequence>
      ))}

      {/* Layer 4: Head slot */}
      <HeadSlot head={props.head} fps={fps} />

      {/* Layer 5: Text slots */}
      {props.textSlots.map((slot) => (
        <Sequence key={slot.id} from={slot.enterAtFrame}>
          <TextSlot slot={slot} fps={fps} />
        </Sequence>
      ))}

      {/* Layer 6: Audio */}
      {props.audio.trackUrl && (
        <Audio src={props.audio.trackUrl} volume={props.audio.volume} />
      )}
    </AbsoluteFill>
  );
};
