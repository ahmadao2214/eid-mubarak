import React, { createContext, useContext, useReducer } from "react";
import type {
  CompositionProps,
  PresetId,
  HueColor,
  HeadAnimationType,
  FlowerType,
  FontStyle,
  TextAnimation,
} from "@/types";
import { getPresetById, PRESETS } from "@/lib/presets";

// ── State ────────────────────────────────────────────────

export interface CompositionState {
  selectedPresetId: PresetId | null;
  composition: CompositionProps;
}

// ── Actions ──────────────────────────────────────────────

export type CompositionAction =
  | { type: "SELECT_PRESET"; presetId: PresetId }
  | { type: "SET_HEAD_IMAGE"; imageUrl: string }
  | { type: "UPDATE_TEXT_SLOT"; slotId: string; text: string }
  | { type: "SET_HUE_COLOR"; color: HueColor }
  | { type: "SET_HUE_ANIMATION"; animation: "pulse" | "static" }
  | { type: "SET_HEAD_ANIMATION"; animation: HeadAnimationType }
  | {
      type: "TOGGLE_FLOWER_REVEAL";
      enabled: boolean;
      flowerType: FlowerType;
    }
  | { type: "SET_TEXT_FONT"; slotId: string; fontFamily: FontStyle }
  | { type: "SET_TEXT_ANIMATION"; slotId: string; animation: TextAnimation };

// ── Initial state factory ────────────────────────────────

export function createInitialState(
  presetId?: PresetId,
  initialHeadImage?: string,
): CompositionState {
  const preset = presetId ? getPresetById(presetId) : PRESETS[PRESETS.length - 1]; // custom
  const defaultProps = preset
    ? JSON.parse(JSON.stringify(preset.defaultProps))
    : JSON.parse(JSON.stringify(PRESETS[PRESETS.length - 1].defaultProps));

  if (initialHeadImage) {
    defaultProps.head.imageUrl = initialHeadImage;
  }

  return {
    selectedPresetId: presetId ?? null,
    composition: defaultProps,
  };
}

// ── Reducer (pure, exported for testing) ─────────────────

export function compositionReducer(
  state: CompositionState,
  action: CompositionAction,
): CompositionState {
  switch (action.type) {
    case "SELECT_PRESET": {
      const preset = getPresetById(action.presetId);
      if (!preset) return state;
      const newProps = JSON.parse(JSON.stringify(preset.defaultProps));
      // Preserve existing head image
      newProps.head.imageUrl = state.composition.head.imageUrl;
      return {
        selectedPresetId: action.presetId,
        composition: newProps,
      };
    }

    case "SET_HEAD_IMAGE":
      return {
        ...state,
        composition: {
          ...state.composition,
          head: { ...state.composition.head, imageUrl: action.imageUrl },
        },
      };

    case "UPDATE_TEXT_SLOT":
      return {
        ...state,
        composition: {
          ...state.composition,
          textSlots: state.composition.textSlots.map((slot) =>
            slot.id === action.slotId ? { ...slot, text: action.text } : slot,
          ),
        },
      };

    case "SET_HUE_COLOR":
      return {
        ...state,
        composition: {
          ...state.composition,
          hue: {
            ...state.composition.hue,
            color: action.color,
            enabled: action.color !== "none",
          },
        },
      };

    case "SET_HUE_ANIMATION":
      return {
        ...state,
        composition: {
          ...state.composition,
          hue: { ...state.composition.hue, animation: action.animation },
        },
      };

    case "SET_HEAD_ANIMATION":
      return {
        ...state,
        composition: {
          ...state.composition,
          head: { ...state.composition.head, animation: action.animation },
        },
      };

    case "TOGGLE_FLOWER_REVEAL":
      return {
        ...state,
        composition: {
          ...state.composition,
          head: {
            ...state.composition.head,
            flowerReveal: {
              enabled: action.enabled,
              type: action.flowerType,
            },
          },
        },
      };

    case "SET_TEXT_FONT":
      return {
        ...state,
        composition: {
          ...state.composition,
          textSlots: state.composition.textSlots.map((slot) =>
            slot.id === action.slotId
              ? { ...slot, fontFamily: action.fontFamily }
              : slot,
          ),
        },
      };

    case "SET_TEXT_ANIMATION":
      return {
        ...state,
        composition: {
          ...state.composition,
          textSlots: state.composition.textSlots.map((slot) =>
            slot.id === action.slotId
              ? { ...slot, animation: action.animation }
              : slot,
          ),
        },
      };

    default:
      return state;
  }
}

// ── Context ──────────────────────────────────────────────

interface CompositionContextValue {
  state: CompositionState;
  dispatch: React.Dispatch<CompositionAction>;
  selectPreset: (presetId: PresetId) => void;
  setHeadImage: (imageUrl: string) => void;
  updateTextSlot: (slotId: string, text: string) => void;
  setHueColor: (color: HueColor) => void;
  setHueAnimation: (animation: "pulse" | "static") => void;
  setHeadAnimation: (animation: HeadAnimationType) => void;
  toggleFlowerReveal: (enabled: boolean, flowerType: FlowerType) => void;
  setTextFont: (slotId: string, fontFamily: FontStyle) => void;
  setTextAnimation: (slotId: string, animation: TextAnimation) => void;
}

const CompositionContext = createContext<CompositionContextValue | null>(null);

// ── Provider ─────────────────────────────────────────────

interface CompositionProviderProps {
  children: React.ReactNode;
  initialPresetId?: PresetId;
  initialHeadImage?: string;
}

export function CompositionProvider({
  children,
  initialPresetId,
  initialHeadImage,
}: CompositionProviderProps) {
  const [state, dispatch] = useReducer(
    compositionReducer,
    { presetId: initialPresetId, headImage: initialHeadImage },
    (init) => createInitialState(init.presetId, init.headImage),
  );

  const value: CompositionContextValue = {
    state,
    dispatch,
    selectPreset: (presetId) => dispatch({ type: "SELECT_PRESET", presetId }),
    setHeadImage: (imageUrl) => dispatch({ type: "SET_HEAD_IMAGE", imageUrl }),
    updateTextSlot: (slotId, text) =>
      dispatch({ type: "UPDATE_TEXT_SLOT", slotId, text }),
    setHueColor: (color) => dispatch({ type: "SET_HUE_COLOR", color }),
    setHueAnimation: (animation) =>
      dispatch({ type: "SET_HUE_ANIMATION", animation }),
    setHeadAnimation: (animation) =>
      dispatch({ type: "SET_HEAD_ANIMATION", animation }),
    toggleFlowerReveal: (enabled, flowerType) =>
      dispatch({ type: "TOGGLE_FLOWER_REVEAL", enabled, flowerType }),
    setTextFont: (slotId, fontFamily) =>
      dispatch({ type: "SET_TEXT_FONT", slotId, fontFamily }),
    setTextAnimation: (slotId, animation) =>
      dispatch({ type: "SET_TEXT_ANIMATION", slotId, animation }),
  };

  return (
    <CompositionContext.Provider value={value}>
      {children}
    </CompositionContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────

export function useComposition(): CompositionContextValue {
  const ctx = useContext(CompositionContext);
  if (!ctx) {
    throw new Error("useComposition must be used within CompositionProvider");
  }
  return ctx;
}
