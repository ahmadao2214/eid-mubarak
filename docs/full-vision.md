# EidMemeMaker - Full Vision (Reference)

> This document describes the full vision for future development beyond MVP. See [init-plan.md](./init-plan.md) for the focused MVP scope.

---

## 1. Overview

### What is EidMemeMaker?

EidMemeMaker is a mobile-first app that lets users create hilarious, over-the-top Eid Mubarak video cards (10-20 seconds) featuring:

- **Zohran-style humor**: Popping faces, ironic transitions, festive overlays, cheesy politician-greeting-card energy
- **Aunty aesthetics**: Dramatic expressions, gold bling everywhere, Bollywood drama, cultural tropes ("Beta, eat more biryani!"), exaggerated makeup filters
- **AI-generated assets**: Custom stickers, backgrounds, and character cutouts from text prompts
- **Curated sound library**: Eid nasheeds, Bollywood clips, funny voiceovers

### Target Users

| Segment | Description |
|---------|-------------|
| **Primary** | Young desi folks (18-35) who love memes and sharing cultural content |
| **Secondary** | Aunties/Uncles who want to send "forward-worthy" Eid greetings |
| **Tertiary** | Non-desi friends who want to participate in Eid celebrations |

### Unique Value vs. Canva/InShot

| Feature | Canva/InShot | EidMemeMaker |
|---------|--------------|--------------|
| **Focus** | Generic design tools | Eid + Desi humor ONLY |
| **Complexity** | Full timeline, many options | 5-step wizard, dead simple |
| **Cultural filters** | None | "Add Aunty Filter", "Zohran Mode" |
| **AI generation** | Limited/paid | Built-in Eid-themed prompts |
| **Sounds** | Generic music | Curated desi/Eid sounds |
| **Vibe** | Professional | Intentionally cheesy & fun |

---

## 2. Full Tech Stack (Future)

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Expo / React Native (iOS + Android + Web)                │ │
│  │  TypeScript                                                │ │
│  │  Expo Router (navigation)                                  │ │
│  │  NativeWind (Tailwind for RN)                             │ │
│  │  Reanimated + Skia (animations & canvas)                  │ │
│  │  Expo AV (audio playback)                                 │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Convex (database + serverless functions + file storage)  │ │
│  │  - User projects & renders                                 │ │
│  │  - Asset library (sounds, stickers, templates)            │ │
│  │  - Render queue management                                 │ │
│  │  - AI generation job tracking                              │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    VIDEO RENDERING                              │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Remotion (React → Video)                                  │ │
│  │  - Compositions defined as React components                │ │
│  │  - Server-side rendering via Remotion Lambda or Cloud Run │ │
│  │  - Exports: MP4 (9:16 vertical), GIF, WebM                │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AI INTEGRATIONS                              │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Image Generation:                                         │ │
│  │  - Replicate API (Stable Diffusion XL, SDXL Turbo)        │ │
│  │  - Fal.ai (fast inference, good pricing)                  │ │
│  │  - Alternative: Together.ai, Fireworks.ai                  │ │
│  │                                                            │ │
│  │  Background Removal:                                       │ │
│  │  - Replicate (rembg model) or remove.bg API               │ │
│  │                                                            │ │
│  │  Face Detection (for filters):                            │ │
│  │  - Expo Face Detector or MediaPipe                        │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Why This Stack?

| Choice | Reasoning |
|--------|-----------|
| **Expo** | Cross-platform (iOS/Android/Web), great DX, OTA updates, EAS for builds |
| **Convex** | Real-time sync, serverless functions, file storage, easy to use |
| **Remotion** | Only serious option for programmatic video in React ecosystem |
| **Replicate/Fal** | Pay-per-use AI, no GPU management, fast |
| **TypeScript** | Type safety, better DX, fewer bugs |

---

## 3. Full User Flow - The 5-Step Wizard

### Philosophy: "TikTok-simple, WhatsApp-shareable"

No timelines. No layers panel. No complexity. Just vibes.

```
┌─────────────────────────────────────────────────────────────────┐
│                     STEP 1: PICK YOUR VIBE                      │
│                                                                 │
│   ┌─────────────────┐    ┌─────────────────┐                   │
│   │                 │    │                 │                   │
│   │  ZOHRAN         │    │  AUNTY          │                   │
│   │  MODE           │    │  AESTHETICS     │                   │
│   │                 │    │                 │                   │
│   │  Politician     │    │  Gold bling,    │                   │
│   │  greeting card  │    │  dramatic,      │                   │
│   │  energy, pop    │    │  Bollywood      │                   │
│   │  effects        │    │  drama          │                   │
│   │                 │    │                 │                   │
│   └─────────────────┘    └─────────────────┘                   │
│                                                                 │
│   ┌─────────────────┐    ┌─────────────────┐                   │
│   │  CLASSIC        │    │  CUSTOM         │                   │
│   │  EID            │    │  (blank canvas) │                   │
│   └─────────────────┘    └─────────────────┘                   │
│                                                                 │
│                    [ NEXT ]                                     │
└─────────────────────────────────────────────────────────────────┘

                              │
                              ▼

┌─────────────────────────────────────────────────────────────────┐
│                   STEP 2: ADD YOUR FACE/IMAGES                  │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │                                                         │  │
│   │              TAP TO ADD PHOTO                           │  │
│   │                                                         │  │
│   │         (We'll auto-remove the background!)             │  │
│   │                                                         │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│   -- OR GENERATE WITH AI --                                     │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │  "funny aunty with gold jewelry and crescent moon"      │  │
│   └─────────────────────────────────────────────────────────┘  │
│   [ GENERATE ]                                                  │
│                                                                 │
│   Quick prompts:                                                │
│   [Bling Aunty] [Goat with Hat] [Dramatic Uncle] [Moon Man]    │
│                                                                 │
│                    [ BACK ]  [ NEXT ]                           │
└─────────────────────────────────────────────────────────────────┘

                              │
                              ▼

┌─────────────────────────────────────────────────────────────────┐
│                   STEP 3: PICK A SOUND                          │
│                                                                 │
│   NASHEEDS                                                      │
│   [Tala al] [Maher Zain] [Sami Yusuf] [Takbir]                │
│                                                                 │
│   BOLLYWOOD                                                     │
│   [Chaiya Chaiya] [Jai Ho] [Tunak Tunak] [Desi Girl]          │
│                                                                 │
│   FUNNY VOICEOVERS                                              │
│   ["Eid Mubark beta!"] ["Beta khao!"] ["Kitna bada hogaya"]   │
│                                                                 │
│   [ UPLOAD YOUR OWN ]                                           │
│                                                                 │
│                    [ BACK ]  [ NEXT ]                           │
└─────────────────────────────────────────────────────────────────┘

                              │
                              ▼

┌─────────────────────────────────────────────────────────────────┐
│                 STEP 4: ADD TEXT & EFFECTS                      │
│                                                                 │
│   PREVIEW (9:16 video preview)                                  │
│                                                                 │
│   MESSAGE:                                                      │
│   [ Eid Mubarak from your favorite aunty! ]                    │
│                                                                 │
│   EFFECTS: (tap to add)                                         │
│   [Sparkles] [Pop-in] [Bling] [Confetti]                       │
│   [Flash] [Hearts] [Fire] [LOL]                                │
│                                                                 │
│   FILTERS:                                                      │
│   [Aunty Filter] [Gold Everything] [VHS Retro]                 │
│                                                                 │
│                    [ BACK ]  [ NEXT ]                           │
└─────────────────────────────────────────────────────────────────┘

                              │
                              ▼

┌─────────────────────────────────────────────────────────────────┐
│                   STEP 5: EXPORT & SHARE                        │
│                                                                 │
│   FINAL PREVIEW (playing loop)                                  │
│                                                                 │
│   DURATION: [ 10s ] (10s, 15s, 20s)                            │
│                                                                 │
│   [ SHARE TO WHATSAPP ]                                         │
│   [ SHARE TO INSTAGRAM ]                                        │
│   [ SAVE TO CAMERA ROLL ]                                       │
│   [ COPY LINK ]                                                 │
│                                                                 │
│   Rendering... ████████░░░░░░░░ 60%                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Future Features Breakdown

### 4.1 AI-Powered Image Generation

#### How It Works

```typescript
// User flow
1. User types prompt or taps quick-prompt button
2. App sends to Convex action
3. Convex calls Replicate/Fal API
4. Returns generated image URL
5. Auto background-removal applied
6. Image added to canvas as sticker

// Example prompts (pre-filled suggestions)
const quickPrompts = [
  "funny south asian aunty with gold jewelry celebrating eid, cartoon style",
  "cute goat wearing a party hat with crescent moon, kawaii style",
  "dramatic uncle with sunglasses and eid mubarak text, bollywood poster style",
  "beautiful crescent moon with lanterns and sparkles, festive",
  "biryani pot with steam and sparkles, delicious food illustration",
];
```

#### Technical Implementation

```typescript
// convex/ai.ts
import { action } from "./_generated/server";
import { v } from "convex/values";
import Replicate from "replicate";

export const generateImage = action({
  args: {
    prompt: v.string(),
    style: v.union(v.literal("cartoon"), v.literal("realistic"), v.literal("bollywood")),
  },
  handler: async (ctx, { prompt, style }) => {
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    const styledPrompt = `${prompt}, ${styleModifiers[style]}, eid mubarak theme, festive, high quality`;

    const output = await replicate.run(
      "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      {
        input: {
          prompt: styledPrompt,
          negative_prompt: "ugly, blurry, low quality, nsfw, offensive",
          width: 1024,
          height: 1024,
          num_outputs: 1,
        },
      }
    );

    const imageUrl = output[0];
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const storageId = await ctx.storage.store(blob);

    return { storageId, url: await ctx.storage.getUrl(storageId) };
  },
});
```

#### Content Moderation Strategy

```typescript
// Pre-generation: Block obvious bad prompts
const blockedTerms = ["nude", "violent", "weapon", ...];

// Post-generation: Use Replicate's NSFW classifier
const moderationResult = await replicate.run(
  "salesforce/blip-image-classification",
  { input: { image: generatedImageUrl } }
);

if (moderationResult.includes("nsfw")) {
  throw new Error("Generated image failed moderation");
}
```

### 4.2 Extended Sound Library (30-50 sounds)

```typescript
// convex/schema.ts
sounds: defineTable({
  name: v.string(),
  category: v.union(
    v.literal("nasheed"),
    v.literal("bollywood"),
    v.literal("voiceover"),
    v.literal("sfx"),
    v.literal("user_uploaded")
  ),
  duration: v.number(),
  storageId: v.string(),
  attribution: v.optional(v.string()),
  isPremium: v.boolean(),
  tags: v.array(v.string()),
})
```

Future consideration: Add ElevenLabs for custom voiceovers ("Type what aunty should say!")

### 4.3 Extended Template Presets

```typescript
// Zohran Mode: Politician greeting card energy
const zohranTemplate = {
  background: "gradient-gold-to-green",
  decorations: ["floating-crescents", "sparkle-burst", "usa-flag-subtle"],
  defaultAnimations: ["pop", "flash", "zoom-rotate"],
  textStyle: { font: "Impact", color: "gold", stroke: "black" },
  defaultEffects: ["lens-flare", "star-wipe"],
};

// Aunty Aesthetics: Over-the-top desi drama
const auntyTemplate = {
  background: "red-gold-damask-pattern",
  decorations: ["floating-roses", "gold-particles", "dramatic-lighting"],
  defaultAnimations: ["dramatic-zoom", "head-tilt", "sparkle"],
  textStyle: { font: "Playfair Display", color: "gold", shadow: true },
  defaultEffects: ["bling", "hearts", "dramatic-zoom"],
  filter: "warm-gold-tint",
};

// Classic Eid: Beautiful and tasteful
const classicTemplate = {
  background: "night-sky-with-moon",
  decorations: ["lanterns", "stars", "geometric-patterns"],
  defaultAnimations: ["gentle-fade", "float"],
  textStyle: { font: "Amiri", color: "white" },
  defaultEffects: ["soft-glow"],
};
```

---

## 5. Full Data Models (Future)

```typescript
// convex/schema.ts (full version with users, AI, premium)
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    isPremium: v.boolean(),
    createdAt: v.number(),
  }).index("by_clerk_id", ["clerkId"]),

  projects: defineTable({
    userId: v.id("users"),
    name: v.string(),
    template: v.union(
      v.literal("zohran"),
      v.literal("aunty"),
      v.literal("classic"),
      v.literal("custom")
    ),
    composition: v.object({
      images: v.array(v.object({
        storageId: v.string(),
        position: v.object({ x: v.number(), y: v.number() }),
        scale: v.number(),
        enterFrame: v.number(),
        animation: v.string(),
      })),
      text: v.object({
        content: v.string(),
        font: v.string(),
        color: v.string(),
        enterFrame: v.number(),
      }),
      soundId: v.optional(v.id("sounds")),
      effects: v.array(v.string()),
      filter: v.string(),
      durationInSeconds: v.number(),
    }),
    thumbnailStorageId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  renders: defineTable({
    projectId: v.id("projects"),
    status: v.union(
      v.literal("pending"),
      v.literal("rendering"),
      v.literal("completed"),
      v.literal("failed")
    ),
    format: v.union(v.literal("mp4"), v.literal("gif"), v.literal("webm")),
    outputUrl: v.optional(v.string()),
    outputStorageId: v.optional(v.string()),
    error: v.optional(v.string()),
    progress: v.optional(v.number()),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  }).index("by_project", ["projectId"]),

  sounds: defineTable({
    name: v.string(),
    category: v.union(
      v.literal("nasheed"),
      v.literal("bollywood"),
      v.literal("voiceover"),
      v.literal("sfx")
    ),
    duration: v.number(),
    storageId: v.string(),
    attribution: v.optional(v.string()),
    isPremium: v.boolean(),
    tags: v.array(v.string()),
  }).index("by_category", ["category"]),

  assets: defineTable({
    name: v.string(),
    type: v.union(
      v.literal("sticker"),
      v.literal("background"),
      v.literal("decoration"),
      v.literal("frame")
    ),
    category: v.string(),
    storageId: v.string(),
    thumbnailStorageId: v.string(),
    isPremium: v.boolean(),
    tags: v.array(v.string()),
  }).index("by_type", ["type"]),

  generations: defineTable({
    userId: v.id("users"),
    prompt: v.string(),
    style: v.string(),
    outputStorageId: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("moderated")
    ),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
});
```

---

## 6. Monetization Strategy (Post-MVP)

```
┌─────────────────────────────────────────────────────────────────┐
│                     FREE TIER                                   │
│                                                                 │
│  - 3 video exports/week                                         │
│  - 5 AI generations/day                                         │
│  - Watermark on exports                                         │
│  - Basic templates & sounds                                     │
│  - Standard rendering speed                                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   PREMIUM ($4.99/month or $29.99/year)          │
│                                                                 │
│  - Unlimited exports                                            │
│  - 50 AI generations/day                                        │
│  - No watermark                                                 │
│  - Premium templates, sounds, effects                           │
│  - Priority rendering                                           │
│  - Early access to new features                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   EID SEASON PASS ($2.99 one-time)              │
│                                                                 │
│  - Unlocks all features for Eid season (2 weeks)                │
│  - Great for casual users                                       │
│  - Lower commitment than subscription                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Cost Analysis (per 1000 users)

| Cost | Amount | Notes |
|------|--------|-------|
| Replicate (AI) | ~$50 | 5 gens/user x $0.01 |
| Remotion Lambda | ~$30 | 3 renders/user x $0.01 |
| Convex | $0 | Free tier covers MVP |
| Expo/EAS | $0 | Free tier |
| **Total** | ~$80/1000 users | $0.08/user |

---

## 7. Risks & Mitigations

### Technical Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Remotion Lambda cold starts | Medium | Pre-warm functions, show "preparing" state |
| AI generation slow (15s) | Medium | Show progress, allow browsing while waiting |
| Large video files | Medium | Compress aggressively, max 20s videos |
| Background removal quality | Low | Use multiple services, allow manual editing |

### Business/Legal Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Copyright (Bollywood clips) | High | Use only licensed/royalty-free, short clips (<10s) |
| Offensive AI generations | High | Strict prompt filtering + output moderation |
| Cultural insensitivity | Medium | Community review, diverse beta testers |
| Copying Zohran's style | Low | Inspired by, not copying. Parody/fair use. |

---

## 8. Full Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- Initialize Expo project with TypeScript
- Set up Convex backend with schema
- Create basic navigation (5-step wizard)
- Implement Clerk authentication
- Build template selection screen

### Phase 2: Core Features (Week 3-4)
- Image upload with expo-image-picker
- Background removal integration
- AI image generation with prompts
- Sound library UI and playback
- Basic Skia canvas for preview

### Phase 3: Video Rendering (Week 5-6)
- Set up Remotion project
- Create EidMemeVideo composition
- Implement animation presets
- Deploy Remotion Lambda
- Connect render pipeline to Convex

### Phase 4: Polish & Effects (Week 7-8)
- Add sparkle/bling/confetti effects
- Implement filters (Aunty, Gold, VHS)
- Text customization
- Improve preview quality
- Add progress indicators

### Phase 5: Launch Prep (Week 9-10)
- Social sharing (WhatsApp, Instagram)
- Implement freemium limits
- Add watermark for free tier
- Performance optimization
- Beta testing with friends
- App Store / Play Store submission

---

## 9. Remotion Research

### Remotion Capabilities

| Feature | Support | How |
|---------|---------|-----|
| Basic animations | Native | `spring()`, `interpolate()` |
| Text effects | Native | CSS animations, custom components |
| Image transitions | Native | Sequences, crossfades |
| Particle effects | Via libraries | react-particles, custom Canvas |
| 3D effects | Via Three.js | @remotion/three integration |
| Lottie animations | Native | @remotion/lottie (After Effects import) |
| WebGL shaders | Native | Custom shader components |
| **Psychedelic morphing** | Complex | Requires custom WebGL/shaders |
| **Face warping** | Complex | Need mesh distortion or AI |

### Effect Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                    EFFECT PIPELINE                              │
│                                                                 │
│   Simple Effects          Complex Effects         AI Effects    │
│   (Remotion native)       (Pre-made Lottie)       (Future v2)   │
│                                                                 │
│   - Text animations       - Psychedelic BGs       - Face morph  │
│   - Image pop/slide       - Flower explosions     - Style xfer  │
│   - Sparkle particles     - Face frame effects    - Deforum     │
│   - Color transitions     - Trippy transitions                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Psychedelic Effects Deep Dive

#### Flower Explosion Effect
```typescript
import { Lottie } from "@remotion/lottie";
import flowerExplosion from "./flower-explosion.json";

const FlowerBurst = () => (
  <Lottie
    animationData={flowerExplosion}
    style={{ position: "absolute", width: "100%", height: "100%" }}
  />
);
```

#### Face Pop-In Effect
```typescript
const FacePopIn = ({ imageUrl }) => {
  const frame = useCurrentFrame();

  const scale = spring({
    frame,
    fps: 30,
    config: { damping: 8, stiffness: 200, mass: 0.5 }
  });

  const rotation = Math.sin(frame * 0.3) * 3;
  const glow = interpolate(Math.sin(frame * 0.2), [-1, 1], [0, 20]);

  return (
    <Img
      src={imageUrl}
      style={{
        transform: `scale(${scale}) rotate(${rotation}deg)`,
        filter: `drop-shadow(0 0 ${glow}px gold)`,
      }}
    />
  );
};
```

#### Psychedelic Background (WebGL Shader)
```typescript
import { ThreeCanvas } from "@remotion/three";

const PsychedelicBG = () => {
  const frame = useCurrentFrame();

  return (
    <ThreeCanvas>
      <mesh>
        <planeGeometry args={[10, 10]} />
        <shaderMaterial
          uniforms={{ time: { value: frame * 0.01 } }}
          fragmentShader={psychedelicShader}
        />
      </mesh>
    </ThreeCanvas>
  );
};

const psychedelicShader = `
  uniform float time;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    float r = sin(uv.x * 10.0 + time) * 0.5 + 0.5;
    float g = sin(uv.y * 10.0 + time * 1.5) * 0.5 + 0.5;
    float b = sin((uv.x + uv.y) * 10.0 + time * 2.0) * 0.5 + 0.5;
    gl_FragColor = vec4(r, g, b, 1.0);
  }
`;
```

#### Pre-made Lottie Effects to License/Create

| Effect | Source | Use For |
|--------|--------|---------|
| Confetti burst | LottieFiles | Celebrations |
| Heart explosion | LottieFiles | Aunty aesthetic |
| Gold particles | LottieFiles | Bling effect |
| Flower bloom | Custom/Commission | Zohran style |
| Sparkle overlay | LottieFiles | General |
| VHS glitch | LottieFiles | Retro filter |

---

## Summary

EidMemeMaker differentiates from generic tools by:
1. **Niche focus** - Eid + desi humor only
2. **Simplicity** - 5-step wizard, no timeline
3. **Cultural authenticity** - Aunty filters, Bollywood sounds, cultural tropes
4. **AI-powered** - Generate custom assets with prompts (future)
5. **Fun first** - Intentionally cheesy, meme-friendly
6. **Meme-native** - Built on actual desi internet culture research

The tech stack (Expo + Convex + Remotion + Replicate) is modern, cost-effective, and capable of delivering the vision.

**Remotion Verdict**: YES, it handles our needs. Use native features for simple effects, Lottie for complex pre-made animations, and WebGL/Three.js for truly psychedelic stuff.
