import type { PresetId } from "../types";
import type { PresetConfig } from "./preset-schema";
import { zohranClassic } from "./zohran-classic";
import { truckerArt } from "./trucker-art";
import { celebrityGreeting } from "./celebrity-greeting";
import { sixHeadSpiral } from "./six-head-spiral";
import { custom } from "./custom";

export const PRESET_REGISTRY: Record<PresetId, PresetConfig> = {
  "zohran-classic": zohranClassic,
  "trucker-art": truckerArt,
  "celebrity-greeting": celebrityGreeting,
  "six-head-spiral": sixHeadSpiral,
  custom,
};

export function getPreset(id: PresetId): PresetConfig {
  return PRESET_REGISTRY[id];
}

export type { PresetConfig } from "./preset-schema";
export { validatePresetConfig } from "./preset-schema";
