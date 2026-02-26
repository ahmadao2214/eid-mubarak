# Eid Meme Maker

A React Native app for creating and sharing short Eid video cards — think Zohran Mamdani viral vibes meets aunty aesthetics meets trucker art. Built for an iftar party of 14 people.

## Architecture

```
eid-meme-maker/
├── apps/
│   ├── mobile/          # Expo React Native app (iOS/Android)
│   └── preview/         # Vite + React app hosting Remotion Player (loaded in WebView)
├── packages/
│   └── remotion/        # Remotion video compositions (6-layer architecture)
├── docs/                # Vision, plans, research
└── scripts/             # Utility scripts
```

**Monorepo** managed by Turborepo. Package manager: **bun**.

## Tech Stack

| Layer | Tech |
|-------|------|
| Mobile app | Expo 54, React Native 0.81, Expo Router 6 |
| Styling | NativeWind (Tailwind CSS), Gluestack UI |
| State | React Context + useReducer |
| Backend | Convex (DB, serverless functions, real-time subscriptions) |
| Video engine | Remotion (compositions) + Remotion Lambda (server-side rendering) |
| Preview | WebView embedding Remotion Player via `injectJavaScript` |
| Storage | AWS S3 (assets, rendered videos) |
| BG removal | remove.bg API |

## How It Works

1. **Edit** — Pick a template or start custom. Add a head (selfie or celebrity), edit text, choose animations and effects.
2. **Preview** — Real-time Remotion Player preview via WebView shows the exact video output.
3. **Render** — Tap "Send Vibes" to render the video on Remotion Lambda (~30-60s). Progress updates reactively via Convex.
4. **Share** — Download the MP4 and share to WhatsApp, Instagram, or save to camera roll.

## Video Composition (6 Layers)

```
┌─────────────────────────┐
│  6. Decorative Elements │  Lottie overlays, image decorations
│  5. Animated Text       │  fade-in, rise-up, typewriter, float
│  4. Flower Reveal       │  Lottie flowers (rose, sunflower, lotus)
│  3. Head Animation      │  pop, zoom-pulse, spiral-multiply, float
│  2. Hue Overlay         │  Color wash with optional pulse
│  1. Background          │  Video loop, image, or solid color
└─────────────────────────┘
1080×1920 @ 30fps, 10 seconds (300 frames)
```

## Presets

| Preset | Vibe |
|--------|------|
| Zohran Classic | Mountain road backdrop, gold hue, spiral-multiply heads |
| Trucker Art | Vibrant trucker panel, green hue, pop animation |
| Celebrity Greeting | Dark backdrop, gold hue, zoom-pulse |
| 6-Head Spiral | Spiral-multiply with 6 rotating heads |
| Custom | Blank canvas, full control |

## Getting Started

### Prerequisites

- Node.js 22+
- [Bun](https://bun.sh)
- Expo Go app on your phone (or Android emulator / iOS simulator)
- Convex account (free tier)

### Setup

```bash
# Install dependencies
bun install

# Start Convex dev server (in a separate terminal)
cd apps/mobile
npx convex dev

# Start the preview app (in a separate terminal)
cd apps/preview
bun run dev -- --host

# Start the Expo dev server
cd apps/mobile
bun run start
```

### Environment Variables

**`apps/mobile/.env.local`**:
```
CONVEX_DEPLOYMENT=dev:your-deployment-name
EXPO_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
EXPO_PUBLIC_CONVEX_SITE_URL=https://your-deployment.convex.site
EXPO_PUBLIC_PREVIEW_URL=http://<your-local-ip>:5173/
```

**Convex dashboard env vars** (for render pipeline):
```
REMOTION_FUNCTION_NAME=    # Lambda function name
REMOTION_SERVE_URL=        # Remotion site bundle URL
REMOTION_REGION=           # AWS region (e.g. us-east-1)
AWS_ACCESS_KEY_ID=         # For S3 + Lambda
AWS_SECRET_ACCESS_KEY=
S3_BUCKET=
REMOVE_BG_API_KEY=         # remove.bg API key
```

## Testing

```bash
# Mobile app tests (194 tests)
cd apps/mobile && bun test

# Preview app tests (6 tests)
cd apps/preview && npx vitest run

# Remotion composition tests (100+ tests)
cd packages/remotion && npx vitest run
```

## Project Status

### Done
- [x] Full editor UI (5-tab interface: Templates, Head, Text, Style, Effects)
- [x] Composition state management (React Context + reducer)
- [x] Remotion compositions (all 6 layers, 5 presets, animations)
- [x] Remotion preview via WebView with `injectJavaScript`
- [x] Convex backend (schema, project CRUD, render pipeline)
- [x] Render pipeline with recursive scheduled polling (no action timeouts)
- [x] Home screen, saved projects, share flow UI
- [x] 200+ tests

### Remaining

**Animation & Composition**
- [ ] Rainbow hue cycle animation (`"cycle"` mode on HueOverlay)
- [ ] Head spiral-multiply rework (6 heads orbiting center, elliptical orbit, slow clockwise rotation)
- [ ] Multi-text layout (auto-split "Eid Mubarak" → "EID" top + "MUBARAK" bottom)
- [ ] DecorativeElement exit animation support (`exitAtFrame` for rose heart intro dissolving)
- [ ] Zohran Classic preset overhaul (match the Zohran video phases)

**Flower Reveal — Deferred (needs video asset)**
- [ ] Source a sunflower-opening video clip (transparent/green-screen, ~3-5s)
- [ ] Add `"video"` type support to FlowerReveal component (currently only renders static images/SVGs)
- [ ] Wire video reveal into composition pipeline (preload, sync to enterAtFrame, fade exit)
- [ ] Test with real video asset in Remotion preview and on-device WebView

**Template Previews**
- [ ] After all assets and animations are in place, scrub through Remotion Player to find ideal frames
- [ ] Capture template preview screenshots for each preset (used in template picker cards)
- [ ] Generate thumbnail variants (small for list, large for detail)

**Infrastructure**
- [ ] Source and upload assets to S3 (celebrity heads, backgrounds, Lottie files, fonts, sounds)
- [ ] Seed Convex DB with asset metadata
- [ ] Deploy Remotion Lambda (IAM role, site bundle, function)
- [ ] Deploy preview app to Vercel/Netlify
- [ ] Set production env vars
- [ ] remove.bg integration (currently passthrough)
- [ ] End-to-end testing with real assets
- [ ] Big screen gallery + voting system (party feature)
- [ ] Design polish (app icon, splash screen, typography)

## Party Setup (Iftar, 14 people)

1. **App distribution**: Display Expo Go QR code on the big screen. Everyone scans to open the app.
2. **Creating**: Each person makes their own Eid card with their face.
3. **Big screen**: A reactive web gallery shows completed videos as they render — powered by Convex real-time queries.
4. **Voting** (optional): Tap to vote on favorites, live leaderboard on the big screen.

## Docs

| Doc | Description |
|-----|-------------|
| [Full Vision](docs/full-vision.md) | Complete project vision and scope |
| [Init Plan](docs/init-plan.md) | Original implementation plan |
| [Backend Integration](docs/plan-backend-integration.md) | Convex + S3 integration details |
| [Remotion Preview](docs/plan-remotion-preview.md) | WebView preview + Lambda pipeline |
| [Design Tweaks](docs/plan-design-tweaks.md) | UI polish candidates |
| [Meme Culture Research](docs/meme-culture-research.md) | Cultural context and references |
