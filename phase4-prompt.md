# Phase 4: Frontend Polish & Backend-Ready Architecture — Implementation Prompt

## Instructions

Enter plan mode first. Explore the codebase thoroughly, then produce a step-by-step implementation plan. Use test-driven development: define test cases for each step BEFORE writing implementation code. After the plan is approved and implemented, create a PR and run `/greploop` to iterate until the review is clean.

### Recommended skills

When writing or reviewing React Native components, animations, or tests, invoke the following skills as needed during implementation:

- `/vercel-react-native-skills` — React Native and Expo best practices for performant mobile apps
- `/react-native-architecture` — production patterns for Expo, navigation, native modules, offline sync
- `/react-native-testing` — writing tests with React Native Testing Library v13/v14
- `/styling-nativewind-v4-expo` — NativeWind v4 setup, theming, dark mode, troubleshooting
- `/expo-app-design` — beautiful cross-platform apps with Expo Router, NativeWind, React Native
- `/reanimated-skia-performance` — high-performance animations with react-native-reanimated and Skia
- `/remotion` — Remotion best practices for programmatic video creation

## Context

### What's merged

**Phase 1 (PR #5):** Expo Router scaffold, hooks (`useImagePicker`, `useRemoveBg`, `useUpload`), mock API layer, type contracts, Jest test infrastructure.

**Phase 2 (PR #7):** Remotion builder engine — 6 layer components (`BackgroundLayer`, `HueOverlay`, `AnimatedText`, `HeadAnimation`, `FlowerReveal`, `DecorativeElement`), 5 preset configs, programmatic SVG placeholders, 100 passing tests.

**Gluestack UI (PR #6):** Gluestack UI v2 with NativeWind — `Button`, `Input`, `Modal` components with `eid-*` Tailwind palette.

**Phase 3 (PR #8):** Full 3-step builder UI:
- **CompositionContext** — React Context + `useReducer` managing 9 action types (`SELECT_PRESET`, `SET_HEAD_IMAGE`, `UPDATE_TEXT_SLOT`, `SET_HUE_COLOR`, `SET_HUE_ANIMATION`, `SET_HEAD_ANIMATION`, `TOGGLE_FLOWER_REVEAL`, `SET_TEXT_FONT`, `SET_TEXT_ANIMATION`)
- **Step 1** — Unified head picker (celebrity heads + "My Photo" in same row), preset horizontal scroll, gallery/camera upload with bg removal
- **Step 2** — Tabbed customization (Text/Style/Effects) with greeting picker (preset options + "Type your own"), hue swatches, font/animation pickers, live `CardPreview`
- **Step 3** — Share flow (save → render → poll → ready), draft save, progress bar
- **Presets module** — 5 configs duplicated from Remotion package with `getPresetById()`
- **CardPreview** — Static RN View/Image approximation (no animation, no Remotion)
- **In-memory storage** — `Map`-based project CRUD as Convex placeholder
- **89 tests passing**, TypeScript clean

### Current app state

```
app/
  _layout.tsx          — SafeAreaProvider + GluestackUIProvider + Stack
  index.tsx            — "Eid Mubarak!" title + "Create a Card" CTA (minimal)
  create/
    _layout.tsx        — CompositionProvider wrapping 3-step Stack
    step1.tsx          — Preset picker + head picker + image upload
    step2.tsx          — Tabbed customization + CardPreview
    step3.tsx          — Share/render flow + draft save

src/
  context/CompositionContext.tsx   — State management (reducer + provider)
  components/CardPreview.tsx       — Static preview (View/Image, no animation)
  lib/presets.ts                   — 5 preset configs
  lib/storage.ts                   — In-memory Map CRUD (Convex placeholder)
  lib/mock-api.ts                  — Full mock layer (upload, bg removal, projects, renders, assets, celebrity heads, sounds)
  lib/convex.ts                    — Stub: CONVEX_URL + ConvexProvider re-export
  hooks/useImagePicker.ts          — Gallery/camera/crop
  hooks/useRemoveBg.ts             — Background removal (wraps mock)
  hooks/useUpload.ts               — S3 upload (wraps mock)
  types/                           — Full type contracts (CompositionProps, PresetId, all unions, API types)
```

### Key architectural gaps (what Phase 4 addresses)

1. **No data access layer** — Screens import `mockCreateProject`, `mockListCelebrityHeads` etc. directly. When Convex arrives, every import site changes. Need a repository/service pattern so swapping backends is a single-file change.
2. **Home screen is empty** — No saved projects, no recent cards, no way to resume editing. Just a CTA button.
3. **No animated preview** — `CardPreview` is static Views. Users can't see what their card will actually look like in motion.
4. **No share sheet** — Step 3 has a "Share" button but no actual `expo-sharing` or `Share` API integration.
5. **No project management** — Can't browse, rename, duplicate, or delete saved projects.
6. **No error boundaries** — No fallback UI for crashes in the create flow.
7. **No loading skeletons** — Celebrity heads, presets, and other async data show nothing while loading.

### What the backend dev will provide (NOT in scope for Phase 4)

The backend dev is setting up Convex separately. They will deliver:
- Convex schema (projects, renders, assets, sounds tables)
- Convex functions (queries, mutations, actions)
- File storage (S3 via Convex storage)
- Real render pipeline (Remotion Lambda trigger)
- Real background removal (Convex action → remove.bg / Replicate)

Phase 4 prepares the frontend so that plugging in Convex is a **single-file swap** per domain (projects, assets, renders) — not a rewrite of every screen.

## Goal

Build the data access layer, home screen, project management, animated preview, share integration, and UI polish — all while keeping the mock backend. Structure everything so Convex integration (Phase 5) is trivial.

### Part A: Data Access Layer (Repository Pattern)

Create a clean abstraction between screens and data sources. Each domain gets a repository module that screens import. The repository delegates to the mock implementation now, and will delegate to Convex later.

**`src/repositories/projects.ts`**
```typescript
// Screens import from here — never from mock-api directly
export function createProject(name: string, composition: CompositionProps): Promise<string>;
export function getProject(id: string): Promise<Project | null>;
export function updateProject(id: string, composition: CompositionProps): Promise<void>;
export function listProjects(): Promise<Project[]>;
export function deleteProject(id: string): Promise<void>;
```

**`src/repositories/assets.ts`**
```typescript
export function listCelebrityHeads(): Promise<CelebrityHead[]>;
export function listSounds(category?: string): Promise<Sound[]>;
export function listAssets(type?: string): Promise<Asset[]>;
```

**`src/repositories/renders.ts`**
```typescript
export function requestRender(projectId: string): Promise<string>;
export function getRenderStatus(renderId: string): Promise<RenderJob>;
```

**`src/repositories/uploads.ts`**
```typescript
export function uploadImage(localUri: string): Promise<{ url: string; key: string }>;
export function removeBackground(imageUri: string): Promise<{ transparentUrl: string }>;
```

Each repository module imports from `../lib/mock-api` internally. Screens and hooks are refactored to import from repositories only. When Convex arrives, swap the internal import — zero screen changes.

### Part B: Home Screen + Project Management

Transform `app/index.tsx` from a single CTA into a proper home screen:

- **Header**: "Eid Mubarak!" title (smaller than current), app subtitle
- **"Create New Card" button**: Prominent CTA at top
- **Saved projects section**: List of previously saved/drafted cards
  - Each card shows: name, preset name, thumbnail (CardPreview small), last modified date
  - Tap to resume editing (navigate to step2 with loaded composition)
  - Swipe to delete (or long-press → delete confirmation modal)
- **Empty state**: When no saved projects, show friendly illustration/message + "Create your first card" prompt
- **Pull-to-refresh**: Reload project list (preparation for Convex real-time)

Add a new route for project detail/resume:
- `app/create/_layout.tsx` — Accept optional `projectId` param to load existing project into `CompositionProvider`

### Part C: Animated Preview (WebView + Remotion Player)

Replace the static `CardPreview` with an animated preview using a WebView that loads the Remotion Player:

**Option A (Recommended): Lightweight animation with react-native-reanimated**
- Animate the existing `CardPreview` component using Reanimated
- Pulse the hue overlay opacity, bob the head image, fade in text slots
- Doesn't require WebView or Remotion on mobile — keeps it lightweight
- Good enough for a "feel" of the card, even if not pixel-perfect to final render

**Option B: WebView + Remotion Player (heavier, more accurate)**
- Serve the Remotion Player from a local or hosted URL
- Pass `CompositionProps` as URL params or `postMessage`
- Shows exact render output but adds WebView complexity

Pick whichever approach is more practical for the current Expo Go setup (Option A avoids native module issues). If you choose Option A, add subtle animations to `CardPreview`:
- Hue overlay: pulsing opacity (when animation is "pulse")
- Head image: gentle scale bounce on enter
- Text slots: fade-in with slight rise
- Use `react-native-reanimated` `useSharedValue`, `withRepeat`, `withTiming`

### Part D: Share Sheet Integration

Wire up real sharing in Step 3:

- Install `expo-sharing` (works in Expo Go)
- When render is "ready" and user taps Share:
  1. Download the rendered video URL to a temp file (`expo-file-system`)
  2. Open the native share sheet (`expo-sharing`)
  3. User picks WhatsApp, Instagram, Messages, etc.
- "Save to Camera Roll" button: Use `expo-media-library` to save the video
- Handle permissions gracefully (media library write permission)
- Since renders are mocked, the share will use the mock `outputUrl` — when Convex provides a real URL, it just works

### Part E: UI Polish & Loading States

- **Loading skeletons**: Shimmer placeholders while celebrity heads load, while presets render, while projects load on home screen
- **Error boundaries**: Wrap the create flow in an error boundary with "Something went wrong" + "Try again" fallback
- **Haptic feedback**: Light haptics on preset selection, head selection, tab switches (`expo-haptics`)
- **Transitions**: Smooth screen transitions (already have `slide_from_right`; add shared element transitions for preview if feasible)
- **Empty states**: Friendly messages when no projects, no celebrity heads loaded, render failed
- **Toast/snackbar**: Brief feedback messages for "Draft saved", "Project deleted", etc.

### Part F: Refactor existing screens to use repositories

Update all screens and hooks to import from `src/repositories/` instead of `src/lib/mock-api.ts`:
- `app/create/step1.tsx` — celebrity heads from `repositories/assets`, upload from `repositories/uploads`
- `app/create/step3.tsx` — project creation from `repositories/projects`, render from `repositories/renders`
- `src/hooks/useRemoveBg.ts` — from `repositories/uploads`
- `src/hooks/useUpload.ts` — from `repositories/uploads`

After refactoring, **no screen or hook should import from `mock-api.ts` directly**.

## Test-Driven Development Approach

Write tests FIRST for each part, then implement to make them pass.

### Test Suite 1: Repository Layer (`src/__tests__/repositories.test.ts`)
- `projects.createProject()` returns a project ID
- `projects.listProjects()` returns sorted array
- `projects.deleteProject()` removes the project
- `assets.listCelebrityHeads()` returns array of CelebrityHead
- `renders.requestRender()` returns render ID
- `renders.getRenderStatus()` returns RenderJob with status
- `uploads.uploadImage()` returns url and key
- `uploads.removeBackground()` returns transparentUrl

### Test Suite 2: Home Screen (`src/__tests__/home.test.tsx`)
- Renders "Create New Card" button that navigates to step1
- Shows empty state when no saved projects
- Shows project cards when projects exist (mock repository)
- Tapping a project card navigates to create flow with projectId
- Delete confirmation modal appears on delete action
- Confirming delete removes the project from the list

### Test Suite 3: Animated CardPreview (`src/__tests__/card-preview-animated.test.tsx`)
- Renders without crashing for all 5 presets
- Shows head image when imageUrl provided
- Shows hue overlay with correct color
- Renders text slots with correct content
- Pulsing animation activates when hue animation is "pulse"

### Test Suite 4: Share Flow (`src/__tests__/share.test.tsx`)
- Share button calls expo-sharing with correct file
- Save to Camera Roll requests permissions
- Handles sharing failure gracefully (shows error toast)
- Share is disabled during render processing

### Test Suite 5: Error Boundary (`src/__tests__/error-boundary.test.tsx`)
- Catches errors from child components
- Renders fallback UI with "Try again" button
- "Try again" resets the error state

### Test Suite 6: Integration — Screen→Repository Flow (`src/__tests__/screen-repository.test.ts`)
- Step 1 fetches celebrity heads from repository (not mock-api)
- Step 3 creates project via repository
- Step 3 requests render via repository
- Home screen loads projects via repository
- No imports from `mock-api` in any screen file (static analysis or grep check)

## Constraints

- **No real backend** — continue using mock API underneath the repository layer
- **Expo Go compatible** — no native modules that require a dev build (no `react-native-mmkv`, no custom native code). `expo-sharing`, `expo-haptics`, `expo-file-system`, `expo-media-library` all work in Expo Go.
- **Use existing Gluestack UI components** where appropriate
- **Use existing NativeWind/Tailwind styling** with `eid-*` palette
- **Keep tests fast** — mock repositories in screen tests, test repositories separately
- **Target branch**: `phase4-frontend-polish` from `main`

## Deliverables

1. Repository layer (`src/repositories/`) with full test coverage
2. Home screen with saved projects, empty state, delete flow
3. Animated `CardPreview` using Reanimated (or WebView fallback)
4. Share sheet integration with `expo-sharing`
5. Error boundaries, loading skeletons, haptic feedback
6. All screens refactored to use repositories (zero direct `mock-api` imports in screens/hooks)
7. All test suites passing, TypeScript clean
8. PR created and `/greploop` run until clean

## Priority Order

If time is constrained, implement in this order:
1. **Repository layer + screen refactor** (Part A + F) — highest value, unblocks Convex integration
2. **Home screen + project management** (Part B) — makes the app feel real
3. **Animated preview** (Part C) — biggest UX improvement
4. **Share integration** (Part D) — completes the core user flow
5. **UI polish** (Part E) — nice-to-have, can be incremental
