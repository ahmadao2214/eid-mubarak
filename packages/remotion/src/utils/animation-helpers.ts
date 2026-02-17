// Shared animation math and helpers for Remotion composition components

import type { FontStyle, Position } from "../types";

// ── Font Family Mapping ──────────────────────────────────────────

const FONT_MAP: Record<FontStyle, string> = {
  psychedelic: "'Bungee Shade', 'Impact', cursive",
  classic: "'Playfair Display', 'Georgia', serif",
  bollywood: "'Tiro Devanagari Hindi', 'Times New Roman', serif",
  clean: "'Inter', 'Helvetica Neue', sans-serif",
  "trucker-art": "'Monoton', 'Impact', cursive",
};

export function getFontFamily(style: FontStyle): string {
  return FONT_MAP[style];
}

// ── Position Clamping ────────────────────────────────────────────

export function clampPosition(pos: Position): Position {
  return {
    x: Math.max(0, Math.min(100, pos.x)),
    y: Math.max(0, Math.min(100, pos.y)),
  };
}

// ── Easing / Math ────────────────────────────────────────────────

/** Sinusoidal oscillation normalized to [0, 1] */
export function sinPulse(frame: number, fps: number, frequencyHz = 0.5): number {
  return (Math.sin((frame / fps) * Math.PI * 2 * frequencyHz) + 1) / 2;
}

/** Convert frame to progress within a range [0, 1], clamped */
export function frameProgress(
  frame: number,
  startFrame: number,
  endFrame: number
): number {
  if (frame <= startFrame) return 0;
  if (frame >= endFrame) return 1;
  return (frame - startFrame) / (endFrame - startFrame);
}
