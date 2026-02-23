Backend Integration Plan: Mock-API → Convex

 Replace all mock-api calls with real Convex backend, wire up Convex provider, swap
 repositories from mock to real, seed assets, and integrate remove.bg.

 Maps to: init-plan.md Phases 1 (Foundation), 3 (Customization backend), 4 (Rendering), 5
 (Content & Polish)

 Depends on: Phase 2 frontend work (Remotion engine) and Phase 3 frontend work (editor UI)
  — both already merged to main.

 ---
 Skills to Invoke

 - convex — Convex development patterns (schema, functions, queries, mutations, actions)
 - react-native-testing — RNTL v13/v14 patterns for TDD tests (render, screen, queries,
 userEvent, fireEvent, waitFor)
 - vercel-react-native-skills — React Native best practices for async data, error
 handling, loading states

 Package Manager

 All commands use bun:
 cd apps/mobile && bun test                    # run all jest tests
 cd apps/mobile && bun test --no-cache         # clear cache + run
 cd apps/mobile && bun test <file>             # run specific test file
 cd apps/mobile && bun run test:convex         # run vitest convex-test tests

 TDD Approach — Tests First

 Each phase writes tests before implementation. Tests initially fail (red), then we
 implement to make them pass (green).

 ---
 Current State

 What exists on main:

 - Convex schema (convex/schema.ts) — 5 tables: projects, renders, sounds, assets, uploads
 - AWS setup script (scripts/aws-phase1-setup.sh) — S3 bucket eid-meme-maker-assets + IAM
 user
 - Repository layer (apps/mobile/src/repositories/) — Thin wrappers around mock-api.ts
 - Mock API (apps/mobile/src/lib/mock-api.ts) — In-memory implementations with simulated
 delays
 - Storage (apps/mobile/src/lib/storage.ts) — In-memory Map-based persistence
 - Convex client stub (apps/mobile/src/lib/convex.ts) — ConvexReactClient setup
 - Types (apps/mobile/src/types/api.ts) — Full API contracts
 - Root layout (apps/mobile/app/_layout.tsx) — Already wraps app with ConvexProvider

 Structural issue: Two Convex directories

 ┌──────────────────────┬────────────┬─────────────────┬───────────────────────────────┐
 │      Directory       │ Has Schema │ Has _generated/ │          Deployment           │
 ├──────────────────────┼────────────┼─────────────────┼───────────────────────────────┤
 │ /convex/ (root)      │ Yes        │ No              │ moonlit-meadowlark-37 (stale) │
 ├──────────────────────┼────────────┼─────────────────┼───────────────────────────────┤
 │ /apps/mobile/convex/ │ No         │ Yes             │ brave-meadowlark-321 (active) │
 └──────────────────────┴────────────┴─────────────────┴───────────────────────────────┘

 Resolution: Copy schema.ts into apps/mobile/convex/, write all functions there, run npx
 convex dev from apps/mobile/. Delete root /convex/ directory.

 What does NOT exist yet:

 - No Convex functions (queries, mutations, actions) — just the schema
 - No real S3 presigned URL generation
 - No real remove.bg integration
 - No real assets uploaded to S3
 - No type mapping between Convex schema and frontend types

 ---
 Architecture: Repository Swap Pattern

 Screens never import mock-api directly. They call repositories. Swapping to Convex means
 changing only the repository files:

 Screen (editor.tsx, saved.tsx, step3.tsx)
   └── calls repository (repositories/projects.ts)
         └── currently: calls mock-api.ts
         └── after:     calls ConvexHttpClient (query/mutation/action)
                          └── uses convex-mappers.ts for type translation

 Zero screen changes for the backend migration. Only repository internals change.

 ---
 Key Design Decisions

 1. Testing: convex-test + vitest for Convex functions

 Install convex-test + vitest as devDeps in apps/mobile/. Separate vitest.config.ts scoped
  to convex/__tests__/. Existing jest setup untouched for repository and component tests.

 2. Repository bridge: ConvexHttpClient singleton

 Imperative async client.query() / client.mutation() / client.action() calls from
 repository functions. Preserves async function signatures, zero screen changes. Created
 in src/lib/convex.ts.

 3. Import centralization: re-export from src/lib/convex.ts

 All repos import { api, convexClient } from @/lib/convex — one file handles the path to
 convex/_generated/api.

 4. Type mapping layer: src/lib/convex-mappers.ts

 Resolves mismatches between Convex schema types and frontend types:
 - celebrity_head → celebrity-head, background → background-video/background-image
 - pending → queued (render status)
 - _id → id, s3Url → url, duration → durationSeconds

 Phase 0: Setup & Cleanup

 Goal: Consolidate Convex directory, install deps, configure test runners.

 Files

 ┌────────┬───────────────────────────────────────────────────────────────────────┐
 │ Action │                                 File                                  │
 ├────────┼───────────────────────────────────────────────────────────────────────┤
 │ Copy   │ /convex/schema.ts → /apps/mobile/convex/schema.ts                     │
 ├────────┼───────────────────────────────────────────────────────────────────────┤
 │ Delete │ /convex/schema.ts, /convex/tsconfig.json (entire root convex dir)     │
 ├────────┼───────────────────────────────────────────────────────────────────────┤
 │ Create │ /apps/mobile/vitest.config.ts (scoped to convex/__tests__/)           │
 ├────────┼───────────────────────────────────────────────────────────────────────┤
 │ Modify │ /apps/mobile/package.json — add devDeps: convex-test, vitest          │
 ├────────┼───────────────────────────────────────────────────────────────────────┤
 │ Modify │ /apps/mobile/package.json — add script: "test:convex": "vitest --run" │
 └────────┴───────────────────────────────────────────────────────────────────────┘

 Verification

 cd apps/mobile && npx convex dev        # Deploy schema, regenerate _generated/
 cd apps/mobile && bun run test:convex   # 0 tests found, clean exit
 cd apps/mobile && bun test              # Existing 173 jest tests still pass

 Commit: chore: consolidate convex directory, add convex-test + vitest

 ---
 Phase 1: Convex Functions (TDD)

 Goal: Write all queries, mutations, actions. Tests first with convex-test.

 Test Files (write first — RED)

 File: apps/mobile/convex/__tests__/projects.test.ts
 Tests: create returns ID, get retrieves project, list sorted desc, update modifies
   composition, remove deletes
 ────────────────────────────────────────
 File: apps/mobile/convex/__tests__/assets.test.ts
 Tests: listByType filters correctly, listCelebrityHeads returns only celebrity_head type
 ────────────────────────────────────────
 File: apps/mobile/convex/__tests__/sounds.test.ts
 Tests: listByCategory filters correctly
 ────────────────────────────────────────
 File: apps/mobile/convex/__tests__/renders.test.ts
 Tests: request creates pending render, getStatus retrieves it, updateProgress changes
   status/progress

 Implementation Files (make tests GREEN)

 File: apps/mobile/convex/projects.ts
 Functions: query list(), query get({id}), mutation create({name, templateId,
   composition}), mutation update({id, composition}), mutation remove({id})
 ────────────────────────────────────────
 File: apps/mobile/convex/assets.ts
 Functions: query listByType({type}), query listCelebrityHeads()
 ────────────────────────────────────────
 File: apps/mobile/convex/sounds.ts
 Functions: query listByCategory({category}), query listAll()
 ────────────────────────────────────────
 File: apps/mobile/convex/renders.ts
 Functions: mutation request({projectId}), query getStatus({renderId}), mutation
   updateProgress({renderId, progress, status, outputS3Url?, error?})
 ────────────────────────────────────────
 File: apps/mobile/convex/uploads.ts
 Functions: action getPresignedUrl({type, contentType}) (stub — returns mock URLs), action

   removeBackground({s3Key}) (stub — passthrough)

 Note: Both upload actions are stubs returning mock URLs until AWS credentials are
 configured in Convex env vars. No "use node" or AWS SDK needed yet. Real S3 + remove.bg
 wired in Phase 5 when creds are ready.

 Verification

 cd apps/mobile && bun run test:convex   # All convex-test tests pass
 cd apps/mobile && npx convex dev        # Functions deploy successfully

 Commit: feat: add Convex functions (projects, assets, sounds, renders, uploads) with TDD

 ---
 Phase 2: Wire Convex Client

 Goal: Set up ConvexHttpClient singleton, re-export generated API.

 Files

 Action: Modify
 File: apps/mobile/src/lib/convex.ts
 Changes: Add ConvexHttpClient singleton, re-export api from ../../convex/_generated/api
 ────────────────────────────────────────
 Action: Create
 File: apps/mobile/src/__tests__/convex-provider.test.tsx
 Changes: Smoke test: ConvexProvider renders children

 The _layout.tsx already wraps with ConvexProvider — no changes needed there.

 Verification

 cd apps/mobile && bun test src/__tests__/convex-provider.test.tsx
 cd apps/mobile && bun test   # Full suite still passes

 Commit: feat: add ConvexHttpClient singleton and re-export generated API

 ---
 Phase 3: Swap Repositories (TDD)

 Goal: Replace mock-api with Convex client calls + type mappers. Tests first.

 Step 3a: Type Mapping Layer

 Action: Create
 File: apps/mobile/src/lib/convex-mappers.ts — mapProject, mapAsset, mapCelebrityHead,
   mapSound, mapRender, mapAssetType
 ────────────────────────────────────────
 Action: Create
 File: apps/mobile/src/__tests__/lib/convex-mappers.test.ts — unit tests for all mappers

 Type mapping specifications:
 Schema asset.type          Frontend AssetType
 ─────────────────────────────────────────────
 "background"           →   "background-video" or "background-image" (by s3Url extension)
 "lottie"               →   "lottie"
 "celebrity_head"       →   "celebrity-head"
 "font"                 →   "font"

 Schema render.status       Frontend RenderStatus
 ─────────────────────────────────────────────────
 "pending"              →   "queued"
 "rendering"            →   "rendering"
 "completed"            →   "completed"
 "failed"               →   "failed"

 Schema field               Frontend field
 ─────────────────────────────────────────
 asset._id                  →  Asset.id (string)
 asset.s3Url                →  Asset.url
 sound._id                  →  Sound.id (string)
 sound.s3Url                →  Sound.url
 sound.duration             →  Sound.durationSeconds
 render.outputS3Url         →  RenderJob.outputUrl
 project._id                →  Project.id (string)

 Step 3b: Update Repository Tests (RED)

 Rewrite all 4 repository test files to mock @/lib/convex instead of @/lib/mock-api:

 File: src/__tests__/repositories/projects.test.ts
 Mock Target: convexClient.mutation, convexClient.query
 ────────────────────────────────────────
 File: src/__tests__/repositories/assets.test.ts
 Mock Target: convexClient.query
 ────────────────────────────────────────
 File: src/__tests__/repositories/renders.test.ts
 Mock Target: convexClient.mutation, convexClient.query
 ────────────────────────────────────────
 File: src/__tests__/repositories/uploads.test.ts
 Mock Target: convexClient.action

 Step 3c: Swap Repository Internals (GREEN)

 File: src/repositories/projects.ts
 Changes: Import {convexClient, api} from @/lib/convex, use mapProject
 ────────────────────────────────────────
 File: src/repositories/assets.ts
 Changes: Same pattern, use mapAsset, mapCelebrityHead, mapSound
 ────────────────────────────────────────
 File: src/repositories/renders.ts
 Changes: Same pattern, use mapRender
 ────────────────────────────────────────
 File: src/repositories/uploads.ts
 Changes: Use convexClient.action, direct fetch PUT for uploadToS3

 Verification

 cd apps/mobile && bun test src/__tests__/lib/convex-mappers.test.ts  # Mapper tests pass
 cd apps/mobile && bun test src/__tests__/repositories/               # All repo tests
 pass
 cd apps/mobile && bun test                                           # Full suite green

 Commit: feat: swap repositories from mock-api to Convex with type mappers

 ---
 Phase 4: Seed Real Assets

 Goal: Upload assets to S3, seed Convex tables.

 Files

 Action: Add to
 File: apps/mobile/convex/assets.ts — mutation seed({...}) (idempotent, checks for
   duplicate s3Key)
 ────────────────────────────────────────
 Action: Add to
 File: apps/mobile/convex/sounds.ts — mutation seed({...}) (idempotent)
 ────────────────────────────────────────
 Action: Create
 File: scripts/seed-assets.ts — Script using ConvexHttpClient to insert all asset/sound
   records
 ────────────────────────────────────────
 Action: Create
 File: scripts/upload-assets-to-s3.sh — aws s3 cp script for uploading local files to S3
   bucket

 Assets to seed

 - Celebrity heads (7): Zohran, Drake, Shah Rukh Khan, Aunty Stock, Onija Robinson, Wow
 Grape Teacher, Central Cee
 - Backgrounds (3): Mountain Road, Desert Highway, Trucker Panel
 - Lottie (6): Rose Bloom, Sunflower Open, Lotus Open, Rose Heart, Sparkle Overlay, Gold
 Particles
 - Fonts (3): Psychedelic, Bollywood, Trucker Art
 - Sounds (1): Default Nasheed

 Prerequisite

 Actual asset files need to exist locally (or be sourced) before S3 upload. This may be a
 manual step.

 Verification

 ./scripts/upload-assets-to-s3.sh           # Upload to S3
 cd apps/mobile && npx convex dev           # Deploy seed mutations
 bun run scripts/seed-assets.ts             # Seed database
 # Verify: Open app → celebrity heads show real photos, backgrounds load

 Commit: feat: add asset seed scripts and seed Convex database

 ---
 Phase 5: Real S3 + Remove.bg Integration (deferred until AWS creds configured)

 Goal: Replace stub uploads with real S3 presigned URLs and remove.bg API.

 Files

 Action: Modify
 File: apps/mobile/package.json — add deps: @aws-sdk/client-s3,
   @aws-sdk/s3-request-presigner
 ────────────────────────────────────────
 Action: Modify
 File: apps/mobile/convex/uploads.ts — add "use node", real S3 presigned URL generation in

   getPresignedUrl, real remove.bg call in removeBackground
 ────────────────────────────────────────
 Action: Create
 File: apps/mobile/src/__tests__/repositories/uploads-removebg.test.ts — mock Convex
   action, test success/failure

 Prerequisites

 - AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, S3_BUCKET set in Convex env vars
 (dashboard)
 - REMOVE_BG_API_KEY set in Convex environment variables (dashboard)

 Verification

 cd apps/mobile && bun test src/__tests__/repositories/uploads-removebg.test.ts
 # Manual: upload photo → tap "Remove Background" → verify transparent result

 Commit: feat: integrate real S3 presigned URLs and remove.bg API

 ---
 Verification Checklist

 1. After Phase 0: npx convex dev deploys schema. Vitest runs clean. Jest tests pass.
 2. After Phase 1: bun run test:convex all green. Functions appear in Convex dashboard.
 3. After Phase 2: bun test full suite green. App boots with Convex provider. No crashes.
 4. After Phase 3: bun test full suite green. App uses real Convex for all CRUD. Projects
 persist across app restarts.
 5. After Phase 4: Celebrity heads show real photos. Background images load in preview.
 6. After Phase 5: "Remove Background" button actually removes backgrounds. Transparent
 PNGs stored in S3.
 7. End-to-end: Create card → upload photo → remove bg → customize → save → reopen from
 "My Vibes" → all data persists.

 ---
 Critical Files Summary

 File: apps/mobile/convex/schema.ts
 Role: Database schema (moved from root)
 ────────────────────────────────────────
 File: apps/mobile/convex/projects.ts
 Role: Project CRUD functions
 ────────────────────────────────────────
 File: apps/mobile/convex/assets.ts
 Role: Asset query functions
 ────────────────────────────────────────
 File: apps/mobile/convex/sounds.ts
 Role: Sound query functions
 ────────────────────────────────────────
 File: apps/mobile/convex/renders.ts
 Role: Render job functions
 ────────────────────────────────────────
 File: apps/mobile/convex/uploads.ts
 Role: S3 + remove.bg actions (stub → real)
 ────────────────────────────────────────
 File: apps/mobile/src/lib/convex.ts
 Role: ConvexHttpClient singleton + API re-export hub
 ────────────────────────────────────────
 File: apps/mobile/src/lib/convex-mappers.ts
 Role: Schema↔frontend type translation
 ────────────────────────────────────────
 File: apps/mobile/src/repositories/*.ts
 Role: Swap targets (mock→Convex)

 Files Unchanged

 - All screen files (app/index.tsx, app/saved.tsx, app/create/editor.tsx,
 app/create/step3.tsx) — repository pattern means zero screen changes
 - src/context/CompositionContext.tsx — state management is frontend-only
 - src/lib/presets.ts — preset configs are static
 - packages/remotion/ — rendering engine is separate concern