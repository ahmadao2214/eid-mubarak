import React from "react";
import { render } from "@testing-library/react-native";
import {
  CompositionProvider,
} from "@/context/CompositionContext";
import type { PresetId } from "@/types";

interface RenderOptions {
  initialPresetId?: PresetId;
  initialHeadImage?: string;
}

export function renderWithComposition(
  ui: React.ReactElement,
  options: RenderOptions = {},
) {
  const { initialPresetId, initialHeadImage } = options;
  return render(
    <CompositionProvider
      initialPresetId={initialPresetId}
      initialHeadImage={initialHeadImage}
    >
      {ui}
    </CompositionProvider>,
  );
}
