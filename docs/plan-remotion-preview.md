# Plan: Remotion Live Preview + Render Pipeline

> Replace the approximate Reanimated-based `AnimatedCardPreview` with an exact Remotion Player preview via WebView, and build the full Remotion Lambda render pipeline for video export.
>
> **Maps to**: [init-plan.md](./init-plan.md) Phases 3 (Live Preview) and 4 (Rendering & Export)
>
> **Depends on**: Backend Integration plan (Convex functions + S3 must be working)
>
> **Related docs**: [init-plan.md](./init-plan.md) | [Remotion docs](https://www.remotion.dev/docs/)

---

## Skills Used

- **`react-native-testing`** — RNTL v13/v14 patterns for WebView integration tests
- **`expo-app-design`** — Expo Router, WebView embedding, cross-platform considerations
- **`reanimated-skia-performance`** — Ensuring WebView + native UI coexist without jank
- **`vercel-react-native-skills`** — React Native WebView best practices, postMessage patterns
- **`frontend-design`** — Seamless loading states, fallback preview, responsive WebView sizing

## Test Runner

```bash
cd apps/mobile && bun test                    # mobile tests
cd packages/remotion && bun test              # remotion component tests
cd apps/preview && bun test                   # preview app tests (new)
```

## TDD Approach — Tests First

Each phase writes tests **before** implementation.

---

## Problem Statement

The current `AnimatedCardPreview` (Reanimated-based) is an approximation:
- Text animations are hardcoded to fade-in+translateY regardless of `slot.animation` value
- Head animations don't match the Remotion spring/interpolate behavior
- Decorative elements (Lottie roses, particles, etc.) are not rendered at all
- Background videos/images don't load (placeholder strings)

The Remotion `packages/remotion/` package has the **exact** implementation with all 6 layers, proper text animations (typewriter, float, rise-up), head animations (spiral-multiply with 6 heads), and Lottie decorative elements. We need to bring that exact rendering into the mobile preview.

## Architecture: WebView + Remotion Player

```
┌─────────────────────────────────────────┐
│  React Native (editor.tsx)              │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  WebView                        │    │
│  │  ┌─────────────────────────┐    │    │
│  │  │  Remotion <Player>      │    │    │
│  │  │  (renders EidMemeVideo  │    │    │
│  │  │   with exact animations)│    │    │
│  │  └─────────────────────────┘    │    │
│  └─────────────────────────────────┘    │
│                                         │
│  On every state change:                 │
│  webViewRef.postMessage(composition)    │
│                                         │
│  Preview page listens:                  │
│  window.onmessage → update Player props │
└─────────────────────────────────────────┘
```

### Why this scales at the party

- **Preview rendering is 100% client-side** — the Remotion `<Player>` runs in the WebView on each user's phone. No server compute for previews.
- **The preview page is a static bundle** — deploy to Vercel/Netlify/Convex site URL as a CDN-served static page. Handles unlimited concurrent users.
- **Server load is only for final video rendering** (Remotion Lambda) — and that happens only when a user taps "Share," not during editing.
- **Lambda concurrency** — AWS Lambda auto-scales. At a party of ~50-100 people, even if everyone renders simultaneously, Lambda handles it. Each render takes ~30-60s and costs ~$0.01.

---

## Current State

### What exists:
- **`packages/remotion/`** — Complete Remotion composition:
  - `EidMemeVideo.tsx` — Main composition with all 6 layers
  - `components/BackgroundLayer.tsx` — Video/image/solid backgrounds
  - `components/HueOverlay.tsx` — Color overlay with pulse/static
  - `components/HeadAnimation.tsx` — pop/zoom-pulse/spiral-multiply/float
  - `components/FlowerReveal.tsx` — Lottie flower opening
  - `components/AnimatedText.tsx` — fade-in/rise-up/typewriter/float
  - `components/DecorativeElement.tsx` — Lottie/image decorative overlays
  - `Root.tsx` — Registers compositions for all presets + generic
  - Full test suite (100+ tests passing)
- **`apps/mobile/src/components/AnimatedCardPreview.tsx`** — Current approximate preview (Reanimated)
- **Convex schema** — `renders` table with status/progress/outputS3Url

### What does NOT exist yet:
- No preview web app (the page the WebView loads)
- No `react-native-webview` in the mobile app
- No Remotion Lambda deployment
- No Convex render action (the function that calls Lambda)

---

## Implementation Phases

### Phase 1: Preview Web App (TDD)

Create a minimal web app that hosts the Remotion Player and accepts composition props via postMessage.

#### Test Phase 1a: Preview app tests
- **Write** `apps/preview/src/__tests__/preview-page.test.tsx`
  - Renders Remotion Player component
  - Accepts composition props and passes to Player
  - Handles postMessage events to update props
  - Shows loading state before first message received
  - Handles malformed messages gracefully

#### Implementation 1a: Create preview app
- **Create** `apps/preview/` workspace:
  ```
  apps/preview/
  ├── package.json          # react, react-dom, remotion, @remotion/player
  ├── src/
  │   ├── index.html        # Minimal HTML shell
  │   ├── App.tsx           # Player + postMessage listener
  │   └── __tests__/
  ├── vite.config.ts        # Vite for fast builds
  └── tsconfig.json
  ```
- **`App.tsx`** core logic:
  ```typescript
  const [composition, setComposition] = useState(DEFAULT_PROPS);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === "UPDATE_COMPOSITION") {
          setComposition(data.composition);
        }
      } catch {} // ignore malformed
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  return (
    <Player
      component={EidMemeVideo}
      compositionWidth={1080}
      compositionHeight={1920}
      fps={30}
      durationInFrames={300}
      inputProps={composition}
      style={{ width: "100%", height: "100%" }}
      autoPlay
      loop
    />
  );
  ```
- **Import** `EidMemeVideo` from `@eid-meme-maker/remotion` (monorepo workspace dependency)
- **Deploy** to Vercel or Convex site URL

### Phase 2: WebView Integration (TDD)

#### Test Phase 2a: WebView component tests
- **Write** `apps/mobile/src/__tests__/RemotionPreview.test.tsx`
  - Renders WebView with correct source URL
  - Sends composition via postMessage when props change
  - Shows fallback AnimatedCardPreview while WebView loads
  - Handles WebView load errors gracefully
  - Renders at correct aspect ratio (9:16)

#### Implementation 2a: RemotionPreview component
- **Install** `react-native-webview` in `apps/mobile/`
- **Create** `apps/mobile/src/components/RemotionPreview.tsx`:
  ```typescript
  interface RemotionPreviewProps {
    composition: CompositionProps;
    width: number;
    height: number;
  }

  export function RemotionPreview({ composition, width, height }: RemotionPreviewProps) {
    const webViewRef = useRef<WebView>(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
      if (loaded && webViewRef.current) {
        webViewRef.current.postMessage(JSON.stringify({
          type: "UPDATE_COMPOSITION",
          composition,
        }));
      }
    }, [composition, loaded]);

    return (
      <View style={{ width, height, borderRadius: 12, overflow: "hidden" }}>
        {!loaded && (
          <AnimatedCardPreview composition={composition} size={{ width, height }} />
        )}
        <WebView
          ref={webViewRef}
          source={{ uri: PREVIEW_URL }}
          onLoad={() => setLoaded(true)}
          style={{ width, height, opacity: loaded ? 1 : 0, position: "absolute" }}
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
        />
      </View>
    );
  }
  ```
- **Edit** `apps/mobile/app/create/editor.tsx` — Replace `AnimatedCardPreview` with `RemotionPreview`
- **Add** `EXPO_PUBLIC_PREVIEW_URL` to `.env.example` and `.env`

### Phase 3: Remotion Lambda Render Pipeline (TDD)

#### Test Phase 3a: Render pipeline tests
- **Write** `convex/__tests__/renders.test.ts`
  - `requestRender` creates a render job with status="pending"
  - `executeRender` action calls Lambda and updates progress
  - `getStatus` returns current progress and output URL
  - Handles Lambda failures gracefully
- **Write** `apps/mobile/src/__tests__/render-flow.test.tsx`
  - Share button triggers render request
  - Progress bar updates during rendering
  - Ready state shows share actions when complete
  - Error state shows retry on Lambda failure

#### Implementation 3a: Lambda deployment
- **Deploy** Remotion Lambda:
  ```bash
  cd packages/remotion
  npx remotion lambda policies role     # Create IAM role
  npx remotion lambda sites create      # Upload site bundle to S3
  npx remotion lambda functions deploy  # Deploy Lambda function
  ```
- **Store** in Convex env vars:
  - `REMOTION_FUNCTION_NAME` — Lambda function name
  - `REMOTION_SERVE_URL` — Site bundle URL
  - `REMOTION_REGION` — AWS region

#### Implementation 3b: Convex render action
- **Edit** `convex/renders.ts` — Add `executeRender` action:
  ```typescript
  export const executeRender = action({
    args: { renderId: v.id("renders"), projectId: v.id("projects") },
    handler: async (ctx, { renderId, projectId }) => {
      // 1. Get project composition from DB
      const project = await ctx.runQuery(api.projects.get, { id: projectId });

      // 2. Call Remotion Lambda renderMediaOnLambda()
      const { renderId: lambdaRenderId } = await renderMediaOnLambda({
        region: REMOTION_REGION,
        functionName: REMOTION_FUNCTION_NAME,
        serveUrl: REMOTION_SERVE_URL,
        composition: "EidMemeVideo",
        inputProps: project.composition,
        codec: "h264",
        outName: `renders/${renderId}.mp4`,
      });

      // 3. Poll Lambda progress, update Convex renders table
      // 4. When done, update status="completed" + outputS3Url
    },
  });
  ```

#### Implementation 3c: Wire render flow in app
- **Edit** `apps/mobile/src/repositories/renders.ts`:
  - `requestRender` → calls Convex mutation to create render job, then triggers `executeRender` action
  - `getRenderStatus` → calls Convex query for render status
- Step3 screen already handles the polling UI — no screen changes needed

---

## Verification Checklist

1. **After Phase 1**: `apps/preview/` builds and deploys. Visit URL in browser, see Remotion Player rendering default composition. Open browser console, run `window.postMessage(JSON.stringify({type:"UPDATE_COMPOSITION", composition:{...}}))` — Player updates.
2. **After Phase 2**: Editor screen shows Remotion preview in WebView. Changing tabs/options updates the preview in real-time. Fallback AnimatedCardPreview shows during load.
3. **After Phase 3**: Tapping "Share" → creates render job → Lambda renders video → progress updates → "Your video is ready!" → can download/share MP4.
4. **Party test**: 10+ concurrent users editing and rendering. Preview loads < 2s. Render completes < 60s.

## Scaling Considerations

| Component | Load Model | Scaling |
|-----------|-----------|---------|
| Preview page | Static CDN | Unlimited — Vercel/Netlify auto-scales |
| WebView rendering | Client-side per device | Zero server cost — runs on user's phone |
| Remotion Lambda | One invocation per "Share" | Auto-scales, ~$0.01/render, 1000 concurrent default |
| Convex DB | Mutations + queries | Convex free tier handles 100+ concurrent easily |
| S3 storage | Read/write per render | Unlimited at our scale |

**Estimated cost for 100-person party**: ~$1-5 total (mostly Lambda renders)

## Files Unchanged

- `apps/mobile/src/context/CompositionContext.tsx` — state management unchanged
- `apps/mobile/src/lib/presets.ts` — preset configs unchanged
- `apps/mobile/app/create/step3.tsx` — already handles render polling UI
- `packages/remotion/src/` — composition code unchanged, just consumed by preview app
