# Phase 3: Builder UI (Mobile App) — Implementation Prompt

## Instructions

Enter plan mode first. Explore the codebase thoroughly, then produce a step-by-step implementation plan. Use test-driven development: define test cases for each step BEFORE writing implementation code. After the plan is approved and implemented, create a PR and run `/greploop` to iterate until the review is clean.

## Context

### What's merged

**Phase 1 (PR #5):** Expo Router scaffold with file-based routing (`/`, `/create/step1`, `/create/step2`, `/create/step3`), custom hooks (`useImagePicker`, `useRemoveBg`, `useUpload`), mock API layer (`src/lib/mock-api.ts`), type contracts (`src/types/template.ts`, `composition.ts`, `api.ts`), and Jest test infrastructure.

**Phase 2 (PR #7):** Remotion builder engine with 6 layer components (`BackgroundLayer`, `HueOverlay`, `AnimatedText`, `HeadAnimation`, `FlowerReveal`, `DecorativeElement`), 5 preset configs in `PRESET_REGISTRY` (`zohran-classic`, `trucker-art`, `celebrity-greeting`, `six-head-spiral`, `custom`), `PresetConfig` type with `validatePresetConfig()`, programmatic SVG placeholder system, shared color constants matching Tailwind palette, and 100 passing tests.

**Gluestack UI (PR #6):** Gluestack UI v2 with NativeWind integration — `Button` (primary/secondary/negative × solid/outline/link), `Input` (outline/rounded), `Modal` (sm/md/lg/full), and `GluestackUIProvider`. All styled via Tailwind with `eid-*` color palette (`eid-dark: #1a1a2e`, `eid-gold: #FFD700`, `eid-pink: #FF69B4`, `eid-green: #00C853`, `eid-blue: #2196F3`, `eid-trucker-yellow: #F5A623`).

### Current mobile app state

- **Home screen** (`app/index.tsx`): "Eid Mubarak!" title + "Create a Card" button → navigates to `/create/step1`
- **Create flow** (`app/create/step1.tsx`, `step2.tsx`, `step3.tsx`): All placeholder screens with descriptive text, no functional UI yet
- **Hooks**: `useImagePicker` (gallery/camera + crop), `useRemoveBg` (mock bg removal), `useUpload` (mock S3 upload) — all implemented with mock backends
- **Mock API**: Full mock layer in `src/lib/mock-api.ts` with realistic delays — covers upload, bg removal, project CRUD, render status, asset listing, celebrity heads, sounds
- **Types**: `MemeTemplate`, `CompositionProps`, `PresetId`, all animation/font/color unions, `ConfigurableSlot`, API contract types (`Project`, `RenderJob`, `Asset`, `Sound`, `CelebrityHead`)
- **UI components**: Gluestack `Button`, `Input`, `Modal` with variant system

### Remotion preset structure (the data contract)

Each preset in `PRESET_REGISTRY` has shape `{ id: PresetId, name: string, description: string, defaultProps: CompositionProps }`. The `CompositionProps` contains: `background`, `hue` (color from constrained union, opacity, animation), `head` (imageUrl, position, scale, animation type, flowerReveal), `decorativeElements[]`, `textSlots[]` (text, fontFamily, fontSize, color, stroke, shadow, animation), and `audio`.

The mobile builder UI must produce a `CompositionProps` object that can be serialized as JSON and passed to Remotion for rendering. The preset `defaultProps` serve as the starting state — the user customizes from there.

## Goal

Build the 3-step card builder flow in the mobile app:

### Step 1: Pick Preset & Upload Head (`app/create/step1.tsx`)
- **Preset picker**: Horizontal scrollable list of 5 preset cards showing name, description, and a colored preview swatch (use the preset's hue color). Selected preset gets a gold border.
- **Head image section**: "Upload Your Photo" area with two buttons — "Gallery" and "Camera" (using existing `useImagePicker` hook). Show circular preview of selected image. "Remove Background" button that calls `useRemoveBg`. Show loading states.
- **State**: Initialize a `CompositionProps` from the selected preset's `defaultProps`, set `head.imageUrl` to the uploaded/processed image URI.
- **Navigation**: "Next" button (disabled until preset selected + image uploaded) → step2. Pass composition state forward.

### Step 2: Customize Card (`app/create/step2.tsx`)
- **Tabbed customization panel** with sections:
  - **Text**: Edit text content for each `textSlot` (Input fields). Font picker (horizontal scroll of FontStyle options with preview). Color picker for text (preset hue colors as swatches).
  - **Style**: Hue color picker (6 color swatches from `HueColor` union + "none"). Hue animation toggle (pulse/static). Background animation picker (if applicable).
  - **Effects**: Head animation picker (pop/zoom-pulse/spiral-multiply/float — show name labels). Flower reveal toggle + type picker (rose/sunflower/lotus). Text animation picker per slot.
- **Live preview area** at top: Simplified static preview showing background color, hue overlay tint, head position circle, and text — NOT a full Remotion render, just a visual approximation using React Native views.
- **State**: Mutate the `CompositionProps` object as user makes changes.
- **Navigation**: "Back" to step1, "Next" to step3.

### Step 3: Preview & Export (`app/create/step3.tsx`)
- **Final preview**: Same simplified preview as step2 but larger.
- **Project actions**: "Save Project" button (calls `mockCreateProject`), "Render Video" button (calls `mockRequestRender`, shows progress with `mockGetRenderStatus` polling). "Share" button (disabled until render complete).
- **Render status display**: Progress bar or percentage, status text (queued → rendering → completed/failed).
- **State**: Read the final `CompositionProps`, display summary.

### Shared state management
- Use React Context or `useState` + prop drilling via Expo Router params (your choice — pick whichever is simpler for 3 screens).
- The composition state must persist across step1 → step2 → step3 navigation.

## Test-Driven Development Approach

**Write tests FIRST for each step, then implement to make them pass.** Organize tests by screen/module:

### Test Suite 1: Composition State (`src/__tests__/useComposition.test.ts`)
- Initializing state from a preset returns correct `CompositionProps` shape
- Switching presets resets state to new preset's `defaultProps` (preserving user's head image)
- Setting head imageUrl updates composition correctly
- Updating text slot content by id works
- Updating hue color/animation works
- Updating head animation type works
- Toggling flower reveal works
- Updating font family for a text slot works
- Full round-trip: init → customize → serialize to JSON → deserialize matches

### Test Suite 2: Step 1 Screen (`src/__tests__/step1.test.tsx`)
- Renders 5 preset cards
- Selecting a preset highlights it (gold border / selected state)
- "Next" button is disabled when no preset selected
- "Next" button is disabled when no image uploaded
- "Next" button is enabled when both preset selected and image uploaded
- Shows image preview after picking from gallery
- Shows loading state during background removal

### Test Suite 3: Step 2 Screen (`src/__tests__/step2.test.tsx`)
- Renders text input fields for each text slot in the preset
- Changing text input updates composition state
- Renders hue color swatches, selecting one updates state
- Renders head animation options
- Renders font style options
- Toggling flower reveal updates state
- Preview area reflects current hue color
- Preview area shows head image circle

### Test Suite 4: Step 3 Screen (`src/__tests__/step3.test.tsx`)
- Renders final preview with composition data
- "Save Project" button calls mock API
- "Render Video" button triggers render flow
- Shows progress during rendering
- Shows completion state after render
- "Share" button disabled until render complete

### Test Suite 5: Integration (`src/__tests__/create-flow.test.ts`)
- Preset selection → image upload → customize → export produces valid `CompositionProps`
- `CompositionProps` output passes `validatePresetConfig` (import from remotion package or duplicate validation)

## Constraints

- Use existing Gluestack UI components (`Button`, `Input`, `Modal`) wherever possible
- Use existing hooks (`useImagePicker`, `useRemoveBg`, `useUpload`) — don't rewrite them
- Use existing mock API functions — don't add a real backend
- Use Tailwind classes via NativeWind for all styling (match `eid-*` palette)
- The preset data lives in `packages/remotion` — import the types but duplicate the preset default values in the mobile app rather than creating a cross-workspace dependency (follow the same pattern as `types.ts` which mirrors the Remotion types)
- Keep the simplified preview lightweight — no WebView, no Remotion rendering on mobile. Just approximate the visual layout with React Native views.
- Target branch: `phase3-builder-ui` from `main`

## Deliverables

1. All test suites written and passing
2. `step1.tsx`, `step2.tsx`, `step3.tsx` fully implemented
3. Composition state hook/context
4. Simplified preview component
5. TypeScript compiles with zero errors
6. PR created and `/greploop` run until clean
