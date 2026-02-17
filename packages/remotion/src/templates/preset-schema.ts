import type { CompositionProps, PresetId } from "../types";

export interface PresetConfig {
  id: PresetId;
  name: string;
  description: string;
  defaultProps: CompositionProps;
}

export interface ValidationError {
  field: string;
  message: string;
}

export function validatePresetConfig(config: PresetConfig): ValidationError[] {
  const errors: ValidationError[] = [];
  const { defaultProps: p } = config;

  // Dimensions
  if (p.width <= 0) errors.push({ field: "width", message: "width must be positive" });
  if (p.height <= 0) errors.push({ field: "height", message: "height must be positive" });
  if (p.fps <= 0) errors.push({ field: "fps", message: "fps must be positive" });
  if (p.durationInFrames <= 0)
    errors.push({ field: "durationInFrames", message: "durationInFrames must be positive" });

  // Hue opacity
  if (p.hue.opacity < 0 || p.hue.opacity > 1)
    errors.push({ field: "hue.opacity", message: "hue opacity must be 0-1" });

  // Head position
  if (p.head.position.x < 0 || p.head.position.x > 100)
    errors.push({ field: "head.position.x", message: "head x must be 0-100" });
  if (p.head.position.y < 0 || p.head.position.y > 100)
    errors.push({ field: "head.position.y", message: "head y must be 0-100" });

  // Head enterAtFrame
  if (p.head.enterAtFrame >= p.durationInFrames)
    errors.push({
      field: "head.enterAtFrame",
      message: "head enterAtFrame must be < durationInFrames",
    });

  // Decorative elements
  p.decorativeElements.forEach((el, i) => {
    if (el.position.x < 0 || el.position.x > 100)
      errors.push({ field: `decorativeElements[${i}].position.x`, message: "x must be 0-100" });
    if (el.position.y < 0 || el.position.y > 100)
      errors.push({ field: `decorativeElements[${i}].position.y`, message: "y must be 0-100" });
    if (el.enterAtFrame >= p.durationInFrames)
      errors.push({
        field: `decorativeElements[${i}].enterAtFrame`,
        message: "enterAtFrame must be < durationInFrames",
      });
  });

  // Text slots
  p.textSlots.forEach((slot, i) => {
    if (slot.position.x < 0 || slot.position.x > 100)
      errors.push({ field: `textSlots[${i}].position.x`, message: "x must be 0-100" });
    if (slot.position.y < 0 || slot.position.y > 100)
      errors.push({ field: `textSlots[${i}].position.y`, message: "y must be 0-100" });
    if (slot.enterAtFrame >= p.durationInFrames)
      errors.push({
        field: `textSlots[${i}].enterAtFrame`,
        message: "enterAtFrame must be < durationInFrames",
      });
  });

  // Audio volume
  if (p.audio.volume < 0 || p.audio.volume > 1)
    errors.push({ field: "audio.volume", message: "audio volume must be 0-1" });

  return errors;
}
