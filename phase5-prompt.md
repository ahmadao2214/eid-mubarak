# Phase 5 — Visual Polish & Interaction Features

Consolidated future work: sticker editor, background picker, sunflower video reveal, rose-heart images, Arabic calligraphy, and template thumbnails.

---

## A. Sticker / Decoration Editor (Instagram-style)

**Goal:** Let users add, move, resize, and remove decorative stickers on the canvas.

- **Sticker library panel** — roses, lanterns, sparkles, crescent moons, etc.
- **Tap-to-add** — places sticker at default center position
- **Drag-to-reposition** — pan gesture via `react-native-gesture-handler`
- **Pinch-to-resize** — scale gesture
- **Tap-to-delete** — "x" button on selected sticker
- **New CompositionContext actions:**
  - `ADD_DECORATION` — appends to `decorativeElements[]`
  - `UPDATE_DECORATION` — updates position/scale by index or id
  - `REMOVE_DECORATION` — removes by index or id
- **Integration:** works with existing `decorativeElements[]` array in `CompositionProps`

---

## B. Background Picker (for "Blank Canvas" and all presets)

**Goal:** Let users change the background of any template.

- **Background source options:** solid color, image upload, preset images
- **Solid color picker** — reuse existing hue color swatches UI
- **Image upload from gallery** — reuse existing `useImagePicker` hook
- **Preset background images:** mountain road, desert highway, dark, trucker panel
- **New CompositionContext action:** `SET_BACKGROUND`

---

## C. Sunflower Reveal — Video Asset Adaptation

_From README "Flower Reveal — Deferred"_

- Source a sunflower-opening video clip (transparent/green-screen, ~3-5s)
- Add `"video"` type support to `FlowerReveal` component (currently only renders static images/SVGs)
- Wire video reveal into composition pipeline (preload, sync to `enterAtFrame`, fade exit)
- Test with real video asset in Remotion preview and on-device WebView

---

## D. Rose-Heart as Real Rose Images on Heart Path

_From video comparison — frame_001 shows ~40-50 rose photos arranged in heart outline_

- Update rose-heart animation in `DecorativeElement` to place N `rose.jpg` images along a heart bezier curve
- Parametrize: rose count, heart size, rotation speed
- Replace current placeholder with real rose images

---

## E. Arabic Calligraphy Text Layer

_From video comparison — Arabic عيد مبارك text visible in frames 010-020_

- Add optional third text slot with Arabic script
- Source/create Arabic calligraphy font or use image asset
- Position below English "MUBARAK" text

---

## F. Template Preview Thumbnails

_From README "Template Previews" + existing `scripts/generate-thumbnails.ts`_

- After all visual assets are in place, scrub Remotion Player to find ideal frame per preset
- Run `generate-thumbnails.ts` to render PNGs
- Upload to S3, update `thumbnailUrl` in `apps/mobile/src/lib/presets.ts`
- Wire thumbnails into `TemplateCard` component (currently shows placeholder)
