import { Composition } from "remotion";
import { EidMemeVideo } from "./EidMemeVideo";
import { PRESET_REGISTRY } from "./templates";
import { getPreset } from "./templates";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Per-preset compositions */}
      {(Object.keys(PRESET_REGISTRY) as Array<keyof typeof PRESET_REGISTRY>).map(
        (id) => {
          const preset = getPreset(id);
          const { defaultProps } = preset;
          return (
            <Composition
              key={id}
              id={`EidMemeVideo-${id}`}
              component={EidMemeVideo as React.FC}
              durationInFrames={defaultProps.durationInFrames}
              fps={defaultProps.fps}
              width={defaultProps.width}
              height={defaultProps.height}
              defaultProps={defaultProps}
            />
          );
        }
      )}

      {/* Generic composition with custom preset defaults */}
      <Composition
        id="EidMemeVideo"
        component={EidMemeVideo as React.FC}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={getPreset("custom").defaultProps}
      />
    </>
  );
};
