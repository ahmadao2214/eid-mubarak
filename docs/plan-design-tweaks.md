# Plan: Design Tweaks & Polish

> Visual refinements, UX improvements, layout overhaul, and design system cleanup.
>
> **Maps to**: [init-plan.md](./init-plan.md) Phase 5 (Content & Polish)
>
> **Related docs**: [init-plan.md](./init-plan.md) | [plan-backend-integration.md](./plan-backend-integration.md) | [plan-remotion-preview.md](./plan-remotion-preview.md)

---

## Status: In Progress

**Last updated**: 2026-02-25

---

## P0 — Must-fix (broken/ugly, blocks party readiness)

- [x] **Fix black sliver on preview edge** — Added `backgroundColor: "transparent"` to RemotionPreview container. (`RemotionPreview.tsx`)
- [x] **Make preview height-constrained** — Preview now uses 45% of screen height (not width-based). Prevents preview from pushing controls off screen. Matches Instagram/CapCut pattern. (`editor.tsx`)
- [x] **Design system refresh: colors** — Refined palette: muted gold `#D4A843`, deep emerald `#0B2B26`, warm cream text `#FAF3E0`. (`colors.ts`)
- [x] **Remove subtitle from home screen** — Removed "Create cheesy Eid video cards..." line. (`index.tsx`)

## P1 — High-impact layout changes

- [x] **Home: Templates as full-width grid** — Replaced horizontal scroll with 2-column grid. (`index.tsx`)
- [x] **Editor Templates tab: grid layout** — Replaced horizontal scroll with 2-column grid using `TemplateCard`. Shows title + static preview, no description. (`editor.tsx`)
- [x] **Template cards: static previews** — Created `StaticCardPreview` (no Reanimated overhead) for template grid. Renders hue overlay, head circle, text — zero animation loops. (`StaticCardPreview.tsx`, `TemplateCard.tsx`)
- [x] **Head picker: vertical grid (rows of 4)** — Replaced horizontal scroll with 4-column vertical grid. Head circles size dynamically. (`editor.tsx`)
- [x] **My Photo persists in grid** — Uploaded photo stays as a selectable grid item. Can switch between celebs and your photo freely. (`editor.tsx`)
- [x] **Share screen: height-constrained preview** — Preview capped at 40% screen height. Back button moved to header. All actions visible without scrolling. (`step3.tsx`)
- [x] **Drafts/My Vibes consolidation** — "My Vibes" is the single saved vibes screen. Updated empty state text ("No vibes yet"), share screen button ("Save to My Vibes"). Home stays clean with top-right "My Vibes" link. (`saved.tsx`, `step3.tsx`)

## P2 — Features visible in editor

- [x] **Text color picker** — Added 8 color swatches (White, Cream, Gold, Pink, Green, Blue, Red, Black) to Text tab. New `SET_TEXT_COLOR` action in CompositionContext. (`editor.tsx`, `CompositionContext.tsx`)
- [x] **Flower reveal radius fix** — Petals now render OUTSIDE the head circle (wreath), not hidden behind it. Radius scales with `head.scale`. (`FlowerReveal.tsx`)
- [ ] **Flower reveal needs real assets** — SVG ellipse petals are placeholder. Need actual flower images (see Asset Tracker below). The Zohran video uses a full sunflower image as a head frame + rose petals in a heart shape.
- [ ] **Six-head spiral animation polish** — Current spiral-multiply works but needs to be more dramatic to match Zohran video (6-8 heads spiral inward, merge into one).
- [ ] **Background images for presets** — Presets use `placeholder:mountain-road` etc. but no actual background images exist. Need real photos uploaded to S3.

## P3 — Polish & nice-to-haves

- [ ] **Sound picker** — Pick background audio track (nasheeds, bollywood clips, etc.). New tab or section in Effects.
- [ ] **Stickers** — Drag-and-drop placement like Instagram stories. Crescent moons, stars, lanterns, etc.
- [ ] **App icon + splash screen** — Branding first impression.
- [ ] **Image loading states** — Blur hash or skeleton shimmer while S3 images load.
- [ ] **Font sizes and weights** — Audit consistency across all screens.
- [ ] **Consistent padding/margins** — Spacing audit.
- [ ] **Screen transition animations** — Smooth Expo Router transitions.
- [ ] **Tab switching animations** — Editor tab transitions.
- [ ] **Micro-interactions** — Button presses, selection feedback.
- [ ] **Card shadows and elevation** — Consistent depth across components.
- [ ] **Share card watermark/branding** — Small "Made with Eid Vibes" on rendered videos.
- [ ] **Arabic/Urdu text support** — Zohran video has Arabic script. Consider RTL text rendering in Remotion.

---

## Zohran Video Reference Analysis

Extracted from screen recording (`Screen Recording 2026-02-25 at 6.52.38 AM.mov`). Frames saved at `/tmp/zohran-frames/`.

### Animation sequence (~13 seconds):

1. **Background**: Real mountain road photo with slow zoom animation
2. **Rose heart**: Red rose petals arranged in a heart shape (decorative frame)
3. **Sunflower reveal**: Full sunflower image blooms — head appears INSIDE the sunflower center
4. **Head spiral**: 6-8 copies of the head spiral inward, merge into one central head
5. **Text layers**: "EID MUBARAK" (psychedelic bold font) + Arabic "عيد مبارک" + "REGISTER TO VOTE" + URL
6. **Psychedelic hue**: Very saturated gold/rainbow color overlay — much more intense than current

### Key gaps vs. our implementation:

| Feature | Zohran Video | Our App (current) |
|---------|-------------|-------------------|
| Background | Real mountain road photo | Solid color / placeholder string |
| Flower frame | Sunflower IMAGE (head sits inside) | SVG ellipse petals (placeholder) |
| Rose decoration | Rose petals in heart shape | Not implemented |
| Head spiral | 6-8 heads spiral inward dramatically | Basic spiral-multiply (less dramatic) |
| Text style | Psychedelic font + Arabic/Urdu script | Basic fonts, English only |
| Hue intensity | Very saturated, psychedelic rainbow | Subtle overlay |

---

## Asset Tracker

Assets needed for the app. Upload to S3 via `scripts/upload-and-seed-assets.js`, seed in Convex.

### Uploaded (in S3 + Convex)

| Asset | Type | S3 Key | Status |
|-------|------|--------|--------|
| Zohran head | celebrity-head | `heads/zohran.jpg` | Uploaded |
| Drake head | celebrity-head | `heads/drake.jpg` | Uploaded |
| SRK head | celebrity-head | `heads/srk.jpg` | Uploaded |
| Beyonce head | celebrity-head | `heads/beyonce.jpg` | Uploaded |
| Imran Khan head | celebrity-head | `heads/imran-khan.jpg` | Uploaded |
| Hasan Minhaj head | celebrity-head | `heads/hasan-minhaj.jpg` | Uploaded |

### Needed — Backgrounds

| Asset | Description | Use | Priority |
|-------|-------------|-----|----------|
| Mountain road | Scenic mountain road (like Zohran video) | Zohran Classic preset background | P2 |
| Desert highway | Desert/highway landscape | Six Head Spiral preset background | P2 |
| Trucker panel | Pakistani truck art painted panel | Trucker Art preset background | P2 |
| Dark elegant | Dark textured/gradient background | Celebrity Greeting preset | P3 |

### Needed — Decorative Elements

| Asset | Description | Use | Priority |
|-------|-------------|-----|----------|
| Sunflower | Full sunflower PNG (transparent center for head) | Flower reveal frame | P2 |
| Rose petals | Individual rose petal PNGs (for heart shape & scatter) | Rose heart decoration | P2 |
| Lotus flower | Lotus PNG | Flower reveal variant | P3 |
| Gold particles | Gold sparkle/particle overlay PNG or Lottie | Celebrity Greeting decoration | P3 |
| Crescent moon | Crescent moon icon/PNG | Decorative element | P3 |
| Trucker art border | Ornate border frame (truck art style) | Trucker Art decoration | P2 |
| Trucker art chain | Chain garland decoration | Trucker Art decoration | P3 |
| Trucker art peacock | Peacock decoration (truck art style) | Trucker Art decoration | P3 |
| Sparkle overlay | Sparkle/glitter overlay | Six Head Spiral decoration | P3 |
| Rose heart | Rose petals arranged in heart shape (Lottie or PNG sequence) | Zohran Classic decoration | P2 |

### Needed — Audio

| Asset | Description | Use | Priority |
|-------|-------------|-----|----------|
| Nasheed track | Festive Eid nasheed (royalty-free) | Sound picker option | P3 |
| Bollywood clip | Bollywood instrumental (royalty-free) | Sound picker option | P3 |
| Celebration sound | Celebration/party sound effect | Sound picker option | P3 |

### Where to source assets:

- **Backgrounds**: Unsplash/Pexels (free, commercial use) — search "mountain road Pakistan", "desert highway", "truck art panel"
- **Flowers**: PNG cutouts from Unsplash or AI-generated (Midjourney/DALL-E) — transparent backgrounds
- **Lottie animations**: LottieFiles.com (search "sunflower", "rose petals", "sparkle")
- **Audio**: Pixabay audio, Free Music Archive — search "nasheed instrumental", "celebration"

---

## Design Decisions

### Preview sizing
**Decision**: Constrain preview by screen HEIGHT (45% editor, 40% share), not width. At 9:16 aspect ratio, width-based sizing makes the preview absurdly tall on phones. Height-based matches Instagram/CapCut pattern — preview always visible with controls below.

### Static vs. animated template thumbnails
**Decision**: Use `StaticCardPreview` (no Reanimated) for all template grids. Running 5+ animation loops on the home screen is wasteful. Static thumbnails are what Canva/CapCut do.

### My Photo persistence
**Decision**: Once a user uploads their photo, it stays as a selectable option in the head grid (like a celebrity head). They can freely switch between their photo and celebs without re-uploading.

### Drafts vs My Vibes
**Decision**: Keep it simple. "My Vibes" is the single place for all saved/drafted cards. The home screen's job is template selection (primary action). No drafts section on home, no accordion, no duplicate UI.

### Color Palette
**Decision**: Refined palette applied. Warmer gold `#D4A843`, deep emerald `#0B2B26`, cream text `#FAF3E0`. Feels premium without being garish.

---

## Verification

1. All composition context tests pass (17/17 green)
2. Visual review on Android emulator (confirmed)
3. Pre-existing test failures are bun/RN DOM issues, not related to changes
4. Performance: static template cards eliminate animation overhead on grids
