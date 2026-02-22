# Plan: Backend Integration (Convex + S3 + Real Assets)

> Replace all mock-api calls with real Convex backend, wire up S3 uploads, integrate remove.bg, and seed real assets.
>
> **Maps to**: [init-plan.md](./init-plan.md) Phases 1 (Foundation), 4 (Rendering & Export), 5 (Content & Polish)
>
> **Depends on**: Phase 2 backend work (Convex schema deployed, S3 bucket created, IAM configured) — already merged to main.
>
> **Related docs**: [backend-setup.md](./backend-setup.md) | [init-plan.md](./init-plan.md) | [general-assets.md](./general-assets.md)

---

## Skills Used

- **`react-native-testing`** — RNTL v13/v14 patterns for TDD tests (render, screen, queries, userEvent, fireEvent, waitFor)
- **`expo-app-design`** — Expo Router patterns, environment config, Convex provider integration
- **`vercel-react-native-skills`** — React Native best practices for async data, error handling, loading states
- **`frontend-design`** — Error states, skeleton loading, empty states that feel polished

## Test Runner

All tests run with **`bun`** via jest:
```bash
cd apps/mobile && bun test                    # run all tests
cd apps/mobile && bun test --no-cache         # clear cache + run
cd apps/mobile && bun test <file>             # run specific test file
```

## TDD Approach — Tests First

Each phase writes tests **before** implementation. Tests initially fail (red), then we implement to make them pass (green).

---

## Current State

### What exists on main:

- **Convex schema** (`convex/schema.ts`) — 5 tables: `projects`, `renders`, `sounds`, `assets`, `uploads`
- **AWS setup script** (`scripts/aws-phase1-setup.sh`) — Creates S3 bucket `eid-meme-maker-assets` + IAM user
- **Repository layer** (`apps/mobile/src/repositories/`) — Thin wrappers around `mock-api.ts`:
  - `projects.ts` — createProject, getProject, updateProject, listAllProjects, removeProject
  - `assets.ts` — listCelebrityHeads, listAssets, listSounds
  - `renders.ts` — requestRender, getRenderStatus
  - `uploads.ts` — getUploadUrl, uploadToS3, removeBackground
- **Mock API** (`apps/mobile/src/lib/mock-api.ts`) — In-memory implementations with simulated delays
- **Storage** (`apps/mobile/src/lib/storage.ts`) — In-memory Map-based persistence
- **Convex client stub** (`apps/mobile/src/lib/convex.ts`) — ConvexReactClient setup (needs real URL)
- **Types** (`apps/mobile/src/types/api.ts`) — Full API contracts (UploadUrlResponse, RemoveBgResponse, Project, RenderJob, Asset, Sound, CelebrityHead)
- **`.env.example`** — Template with `EXPO_PUBLIC_CONVEX_URL`

### What does NOT exist yet:

- No Convex functions (queries, mutations, actions) — just the schema
- No real S3 presigned URL generation
- No real remove.bg integration
- No real assets uploaded to S3
- No Convex provider wired into the app (removed during phase3 simplification)

---

## Architecture: Repository Swap Pattern

The key design decision: **screens never import mock-api directly**. They call repositories. Swapping to Convex means changing only the repository files:

```
Screen (editor.tsx, saved.tsx, step3.tsx)
  └── calls repository (repositories/projects.ts)
        └── currently: calls mock-api.ts
        └── after:     calls Convex client (useQuery/useMutation)
```

This means: **zero screen changes** for the backend migration. Only repository internals change.

---

## Implementation Phases

### Phase 1: Convex Functions (Backend)

Write the actual Convex functions that the repositories will call.

#### Test Phase 1a: Convex function unit tests
- **Write** `convex/__tests__/projects.test.ts`
  - `createProject` returns a valid ID
  - `getProject` retrieves saved project
  - `updateProject` modifies composition
  - `listProjects` returns all projects sorted by updatedAt desc
  - `deleteProject` removes from DB
- **Write** `convex/__tests__/assets.test.ts`
  - `listByType("celebrity_head")` returns seeded heads
  - `listByType("background")` returns backgrounds
- **Write** `convex/__tests__/uploads.test.ts`
  - `getPresignedUrl` returns a valid S3 URL structure
  - `removeBackground` returns transparentUrl on success

#### Implementation 1a: Convex functions
- **Create** `convex/projects.ts`:
  ```
  query  list()                      → all projects, sorted by updatedAt desc
  query  get({ id })                 → single project by ID
  mutation create({ name, templateId, composition }) → project ID
  mutation update({ id, composition })
  mutation remove({ id })
  ```
- **Create** `convex/assets.ts`:
  ```
  query  listByType({ type })        → assets filtered by type
  query  listCelebrityHeads()        → assets where type="celebrity_head"
  ```
- **Create** `convex/sounds.ts`:
  ```
  query  listByCategory({ category }) → sounds filtered by category
  ```
- **Create** `convex/uploads.ts`:
  ```
  action getPresignedUrl({ type, contentType }) → { uploadUrl, s3Key }
  action removeBackground({ s3Key })            → { success, transparentUrl }
  ```
- **Create** `convex/renders.ts`:
  ```
  mutation request({ projectId })     → render ID, sets status="pending"
  query   getStatus({ renderId })     → { status, progress, outputS3Url }
  mutation updateProgress({ renderId, progress, status, outputS3Url? })
  ```

### Phase 2: Wire Convex Provider

#### Test Phase 2a: Provider integration
- **Update** `apps/mobile/src/__tests__/home-screen.test.tsx`
  - Mock `ConvexProvider` in test setup
  - Verify app renders without crash when Convex is available
- **Write** `apps/mobile/src/__tests__/convex-provider.test.tsx`
  - Provider renders children
  - Provider handles missing URL gracefully

#### Implementation 2a: Provider setup
- **Edit** `apps/mobile/app/_layout.tsx` — Re-enable `ConvexProvider` wrapping the Stack
- **Edit** `apps/mobile/src/lib/convex.ts` — Verify client reads from `EXPO_PUBLIC_CONVEX_URL`
- **Create** `apps/mobile/.env` from `.env.example` with real Convex URL
- **Run** `npx convex dev` from repo root to deploy functions

### Phase 3: Swap Repositories

#### Test Phase 3a: Repository integration tests
- **Update** `apps/mobile/src/__tests__/repositories/projects.test.ts`
  - Tests call real Convex (or Convex test helpers) instead of mock
  - CRUD operations work end-to-end
- **Update** `apps/mobile/src/__tests__/repositories/uploads.test.ts`
  - `getUploadUrl` returns real presigned URL
  - `uploadToS3` uploads a test file
  - `removeBackground` processes an image

#### Implementation 3a: Swap internals
- **Edit** `apps/mobile/src/repositories/projects.ts`:
  - Replace `mockCreateProject` → `convexMutation(api.projects.create, ...)`
  - Replace `mockGetProject` → `convexQuery(api.projects.get, ...)`
  - Replace storage list/delete → `convexQuery(api.projects.list)` / `convexMutation(api.projects.remove)`
- **Edit** `apps/mobile/src/repositories/assets.ts`:
  - Replace `mockListCelebrityHeads` → `convexQuery(api.assets.listCelebrityHeads)`
- **Edit** `apps/mobile/src/repositories/renders.ts`:
  - Replace mock → `convexMutation(api.renders.request)` / `convexQuery(api.renders.getStatus)`
- **Edit** `apps/mobile/src/repositories/uploads.ts`:
  - Replace mock → `convexAction(api.uploads.getPresignedUrl)` / `convexAction(api.uploads.removeBackground)`

### Phase 4: Seed Real Assets

#### Implementation 4a: Upload assets to S3
- Upload to S3 bucket `eid-meme-maker-assets`:
  - `heads/drake.png`, `heads/shah-rukh-khan.png`, `heads/aunty-stock.png`, `heads/onija-robinson.png`, `heads/wow-grape-teacher.png`, `heads/central-cee.png`, `heads/zohran.png`
  - `backgrounds/mountain-road.jpg`, `backgrounds/desert-highway.jpg`, `backgrounds/trucker-panel.jpg`
  - `lottie/rose-bloom.json`, `lottie/sunflower-open.json`, `lottie/lotus-open.json`
  - `lottie/rose-heart.json`, `lottie/sparkle-overlay.json`, `lottie/gold-particles.json`
  - `fonts/psychedelic.ttf`, `fonts/bollywood.ttf`, `fonts/trucker-art.ttf`

#### Implementation 4b: Seed Convex tables
- **Create** `scripts/seed-assets.ts` — Script that inserts asset records into Convex `assets` table with S3 URLs
- **Create** `scripts/seed-sounds.ts` — Script for default nasheed track
- Run seed scripts after Convex deploy

### Phase 5: Remove.bg Integration

#### Test Phase 5a: Remove.bg tests
- **Write** `convex/__tests__/removebg.test.ts`
  - Calls remove.bg API with test image
  - Returns transparent PNG URL
  - Handles API errors gracefully

#### Implementation 5a: remove.bg action
- **Edit** `convex/uploads.ts` `removeBackground` action:
  - Download image from S3 using s3Key
  - POST to `https://api.remove.bg/v1.0/removebg` with API key
  - Upload result to S3 as `transparent/{s3Key}`
  - Return new S3 URL
- Add `REMOVE_BG_API_KEY` to Convex environment variables

---

## Verification Checklist

1. **After Phase 1**: `npx convex dev` deploys without errors. Functions appear in Convex dashboard.
2. **After Phase 2**: App boots with Convex provider. No crashes. Mock data still works.
3. **After Phase 3**: `bun test` full suite green. App uses real Convex for all CRUD. Projects persist across app restarts.
4. **After Phase 4**: Celebrity heads show real photos (not broken URLs). Background images load in preview.
5. **After Phase 5**: "Remove Background" button actually removes backgrounds. Transparent PNGs stored in S3.
6. **End-to-end**: Create card → upload photo → remove bg → customize → save → reopen from "My Vibes" → all data persists.

## Files Unchanged

- All screen files (`app/index.tsx`, `app/saved.tsx`, `app/create/editor.tsx`, `app/create/step3.tsx`) — repository pattern means zero screen changes
- `src/context/CompositionContext.tsx` — state management is frontend-only
- `src/lib/presets.ts` — preset configs are static
- `packages/remotion/` — rendering engine is separate concern
