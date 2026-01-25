# EidMemeMaker - App Plan

> A fun, meme-centric app for creating cheesy Eid Mubarak video cards with "Aunty aesthetics" and Zohran Mamdani-style humor.

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

## 2. Tech Stack

### Your Preferred Stack (Optimized)

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

## 3. User Flow - The 5-Step Wizard

### Philosophy: "TikTok-simple, WhatsApp-shareable"

No timelines. No layers panel. No complexity. Just vibes.

```
┌─────────────────────────────────────────────────────────────────┐
│                     STEP 1: PICK YOUR VIBE                      │
│                                                                 │
│   ┌─────────────────┐    ┌─────────────────┐                   │
│   │                 │    │                 │                   │
│   │  🎭 ZOHRAN      │    │  💅 AUNTY       │                   │
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
│   │  🌙 CLASSIC     │    │  🎨 CUSTOM      │                   │
│   │  EID            │    │  (blank canvas) │                   │
│   └─────────────────┘    └─────────────────┘                   │
│                                                                 │
│                    [ NEXT → ]                                   │
└─────────────────────────────────────────────────────────────────┘

                              │
                              ▼

┌─────────────────────────────────────────────────────────────────┐
│                   STEP 2: ADD YOUR FACE/IMAGES                  │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │                                                         │  │
│   │              📸 TAP TO ADD PHOTO                        │  │
│   │                                                         │  │
│   │         (We'll auto-remove the background!)             │  │
│   │                                                         │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│   ── OR GENERATE WITH AI ──────────────────────────────────    │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │  "funny aunty with gold jewelry and crescent moon"      │  │
│   └─────────────────────────────────────────────────────────┘  │
│   [ ✨ GENERATE ]                                               │
│                                                                 │
│   Quick prompts:                                                │
│   [Bling Aunty] [Goat with Hat] [Dramatic Uncle] [Moon Man]    │
│                                                                 │
│                    [ ← BACK ]  [ NEXT → ]                       │
└─────────────────────────────────────────────────────────────────┘

                              │
                              ▼

┌─────────────────────────────────────────────────────────────────┐
│                   STEP 3: PICK A SOUND                          │
│                                                                 │
│   🔊 NASHEEDS                                                   │
│   ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                         │
│   │ ▶️   │ │ ▶️   │ │ ▶️   │ │ ▶️   │                         │
│   │Tala  │ │Maher │ │Sami  │ │Takbir│                         │
│   │al    │ │Zain  │ │Yusuf │ │      │                         │
│   └──────┘ └──────┘ └──────┘ └──────┘                         │
│                                                                 │
│   🎬 BOLLYWOOD                                                  │
│   ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                         │
│   │ ▶️   │ │ ▶️   │ │ ▶️   │ │ ▶️   │                         │
│   │Chaiya│ │Jai Ho│ │Tunak │ │Desi  │                         │
│   │Chaiya│ │      │ │Tunak │ │Girl  │                         │
│   └──────┘ └──────┘ └──────┘ └──────┘                         │
│                                                                 │
│   😂 FUNNY VOICEOVERS                                           │
│   ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                         │
│   │ ▶️   │ │ ▶️   │ │ ▶️   │ │ ▶️   │                         │
│   │"Eid  │ │"Beta │ │"Kitna│ │"Masha│                         │
│   │Mubark│ │khao!"│ │bada  │ │Allah"│                         │
│   │beta!"│ │      │ │hogaya│ │      │                         │
│   └──────┘ └──────┘ └──────┘ └──────┘                         │
│                                                                 │
│   [ 📤 UPLOAD YOUR OWN ]                                        │
│                                                                 │
│                    [ ← BACK ]  [ NEXT → ]                       │
└─────────────────────────────────────────────────────────────────┘

                              │
                              ▼

┌─────────────────────────────────────────────────────────────────┐
│                 STEP 4: ADD TEXT & EFFECTS                      │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │                                                         │  │
│   │                    PREVIEW                              │  │
│   │              ┌─────────────────┐                        │  │
│   │              │                 │                        │  │
│   │              │   [Your video   │                        │  │
│   │              │    preview]     │                        │  │
│   │              │                 │                        │  │
│   │              │    9:16         │                        │  │
│   │              │                 │                        │  │
│   │              └─────────────────┘                        │  │
│   │                                                         │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│   MESSAGE:                                                      │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │  Eid Mubarak from your favorite aunty! 🌙              │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│   EFFECTS: (tap to add)                                         │
│   [✨ Sparkles] [💫 Pop-in] [🌟 Bling] [🎉 Confetti]           │
│   [📸 Flash] [💖 Hearts] [🔥 Fire] [😂 LOL]                    │
│                                                                 │
│   FILTERS:                                                      │
│   [👵 Aunty Filter] [🥇 Gold Everything] [📺 VHS Retro]        │
│                                                                 │
│                    [ ← BACK ]  [ NEXT → ]                       │
└─────────────────────────────────────────────────────────────────┘

                              │
                              ▼

┌─────────────────────────────────────────────────────────────────┐
│                   STEP 5: EXPORT & SHARE                        │
│                                                                 │
│              ┌─────────────────────────────┐                    │
│              │                             │                    │
│              │      FINAL PREVIEW          │                    │
│              │      (playing loop)         │                    │
│              │                             │                    │
│              │         ▶️                  │                    │
│              │                             │                    │
│              └─────────────────────────────┘                    │
│                                                                 │
│   DURATION: [ 10s ▼ ]  (10s, 15s, 20s)                         │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │                                                         │  │
│   │  [ 📱 SHARE TO WHATSAPP ]                               │  │
│   │                                                         │  │
│   │  [ 📸 SHARE TO INSTAGRAM ]                              │  │
│   │                                                         │  │
│   │  [ 💾 SAVE TO CAMERA ROLL ]                             │  │
│   │                                                         │  │
│   │  [ 🔗 COPY LINK ]                                       │  │
│   │                                                         │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│   Rendering... ████████░░░░░░░░ 60%                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Features Breakdown

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

    // Add style modifiers to prompt
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

    // Store in Convex file storage
    const imageUrl = output[0];
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const storageId = await ctx.storage.store(blob);

    return { storageId, url: await ctx.storage.getUrl(storageId) };
  },
});
```

#### Feasibility & Challenges

| Aspect | Status | Notes |
|--------|--------|-------|
| **API Availability** | ✅ Good | Replicate, Fal.ai, Together all stable |
| **Cost** | ⚠️ Medium | ~$0.01-0.05 per image, need rate limits |
| **Speed** | ⚠️ Medium | 5-15 seconds per generation |
| **Quality** | ✅ Good | SDXL produces great results |
| **Moderation** | ⚠️ Important | Need content filtering |

#### Content Moderation Strategy

```typescript
// Pre-generation: Block obvious bad prompts
const blockedTerms = ["nude", "violent", "weapon", ...];

// Post-generation: Use Replicate's NSFW classifier
const moderationResult = await replicate.run(
  "salesforce/blip-image-classification",
  { input: { image: generatedImageUrl } }
);

// If flagged, don't show to user
if (moderationResult.includes("nsfw")) {
  throw new Error("Generated image failed moderation");
}
```

### 4.2 Sound Selection

#### Library Structure (MVP: 30-50 sounds)

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
  duration: v.number(), // seconds
  storageId: v.string(),
  attribution: v.optional(v.string()), // for licensed content
  isPremium: v.boolean(),
  tags: v.array(v.string()),
})
```

#### Curated Sound Categories

| Category | Examples | Source |
|----------|----------|--------|
| **Nasheeds** | Tala'al Badru, Maher Zain clips, Sami Yusuf | Royalty-free/licensed |
| **Bollywood** | Chaiyya Chaiyya (snippet), Jai Ho, Tunak Tunak | Licensed clips or covers |
| **Voiceovers** | "Eid Mubarak beta!", "Khana khao!", "MashAllah!" | Record ourselves / community |
| **SFX** | Sparkle sounds, pop, whoosh, bling | Free sound libraries |

#### Why No AI Sound Generation (Yet)

| Reason | Explanation |
|--------|-------------|
| **Complexity** | Audio AI is harder than image AI |
| **Licensing** | Music generation has copyright issues |
| **Not Needed** | Curated library is funnier/more cultural |
| **Cost** | Audio models are expensive |
| **MVP Focus** | Keep scope small |

**Future consideration**: Add ElevenLabs for custom voiceovers ("Type what aunty should say!")

### 4.3 Video Assembly (Remotion)

#### Composition Structure

```typescript
// src/remotion/EidMemeVideo.tsx
import {
  AbsoluteFill,
  Audio,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Img,
} from "remotion";

interface EidMemeProps {
  template: "zohran" | "aunty" | "classic" | "custom";
  images: Array<{
    url: string;
    position: { x: number; y: number };
    scale: number;
    enterFrame: number;
    animation: "pop" | "slide" | "fade" | "bounce";
  }>;
  text: {
    content: string;
    font: string;
    color: string;
    enterFrame: number;
  };
  effects: Array<"sparkles" | "bling" | "confetti" | "hearts">;
  filter: "none" | "aunty" | "gold" | "vhs";
  sound: {
    url: string;
    startFrom: number;
  };
  durationInSeconds: 10 | 15 | 20;
}

export const EidMemeVideo: React.FC<EidMemeProps> = (props) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: "#1a1a2e" }}>
      {/* Background layer */}
      <BackgroundLayer template={props.template} frame={frame} />

      {/* Decorative elements (moons, lanterns, etc.) */}
      <DecorativeElements template={props.template} frame={frame} />

      {/* User images with animations */}
      {props.images.map((img, i) => (
        <Sequence from={img.enterFrame} key={i}>
          <AnimatedImage
            src={img.url}
            animation={img.animation}
            position={img.position}
            scale={img.scale}
          />
        </Sequence>
      ))}

      {/* Text overlay */}
      <Sequence from={props.text.enterFrame}>
        <AnimatedText {...props.text} />
      </Sequence>

      {/* Effects layer */}
      <EffectsLayer effects={props.effects} frame={frame} />

      {/* Filter overlay */}
      <FilterOverlay filter={props.filter} />

      {/* Audio */}
      <Audio src={props.sound.url} startFrom={props.sound.startFrom} />
    </AbsoluteFill>
  );
};

// Animation presets
const AnimatedImage: React.FC<{...}> = ({ src, animation, position, scale }) => {
  const frame = useCurrentFrame();

  const animations = {
    pop: {
      scale: spring({ frame, fps: 30, config: { damping: 10, stiffness: 100 } }),
      opacity: interpolate(frame, [0, 5], [0, 1]),
    },
    slide: {
      translateX: interpolate(frame, [0, 15], [-100, position.x]),
      opacity: interpolate(frame, [0, 10], [0, 1]),
    },
    bounce: {
      translateY: Math.sin(frame * 0.2) * 10,
      scale: 1 + Math.sin(frame * 0.1) * 0.05,
    },
    fade: {
      opacity: interpolate(frame, [0, 20], [0, 1]),
    },
  };

  const anim = animations[animation];

  return (
    <Img
      src={src}
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        transform: `scale(${anim.scale ?? scale}) translateY(${anim.translateY ?? 0}px)`,
        opacity: anim.opacity ?? 1,
      }}
    />
  );
};
```

#### Template Presets

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

#### Rendering Pipeline

```typescript
// convex/render.ts
export const requestRender = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const project = await ctx.db.get(projectId);

    // Create render job
    const renderId = await ctx.db.insert("renders", {
      projectId,
      status: "pending",
      format: "mp4",
      createdAt: Date.now(),
    });

    // Trigger render action
    await ctx.scheduler.runAfter(0, internal.render.executeRender, {
      renderId,
      composition: project.composition,
    });

    return renderId;
  },
});

// convex/render.ts (action)
export const executeRender = internalAction({
  args: {
    renderId: v.id("renders"),
    composition: v.any(),
  },
  handler: async (ctx, { renderId, composition }) => {
    // Update status
    await ctx.runMutation(internal.render.updateStatus, {
      renderId,
      status: "rendering",
    });

    // Call Remotion Lambda or Cloud Run
    const { bucketName, renderId: remotionRenderId } = await renderMediaOnLambda({
      region: "us-east-1",
      functionName: "remotion-render-function",
      composition: "EidMemeVideo",
      inputProps: composition,
      codec: "h264",
      imageFormat: "jpeg",
      maxRetries: 1,
      framesPerLambda: 20,
      privacy: "public",
    });

    // Poll for completion
    while (true) {
      const progress = await getRenderProgress({
        renderId: remotionRenderId,
        bucketName,
        region: "us-east-1",
      });

      if (progress.done) {
        await ctx.runMutation(internal.render.complete, {
          renderId,
          outputUrl: progress.outputFile,
        });
        break;
      }

      if (progress.fatalErrorEncountered) {
        await ctx.runMutation(internal.render.fail, {
          renderId,
          error: progress.errors[0]?.message,
        });
        break;
      }

      await new Promise((r) => setTimeout(r, 1000));
    }
  },
});
```

---

## 5. Data Models (Convex Schema)

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    isPremium: v.boolean(),
    createdAt: v.number(),
  }).index("by_clerk_id", ["clerkId"]),

  // Projects (user's video cards)
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

  // Render jobs
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
    progress: v.optional(v.number()), // 0-100
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  }).index("by_project", ["projectId"]),

  // Sound library
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

  // Asset library (stickers, backgrounds)
  assets: defineTable({
    name: v.string(),
    type: v.union(
      v.literal("sticker"),
      v.literal("background"),
      v.literal("decoration"),
      v.literal("frame")
    ),
    category: v.string(), // "aunty", "eid", "bollywood", etc.
    storageId: v.string(),
    thumbnailStorageId: v.string(),
    isPremium: v.boolean(),
    tags: v.array(v.string()),
  }).index("by_type", ["type"]),

  // AI generation history
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

## 6. MVP Scope & Monetization

### MVP Feature Set (v1.0)

| Feature | Included | Notes |
|---------|----------|-------|
| 3 templates (Zohran, Aunty, Classic) | ✅ | Core differentiator |
| Photo upload + background removal | ✅ | Essential |
| AI image generation (limited) | ✅ | 5 free/day |
| 30 curated sounds | ✅ | Nasheeds, Bollywood, voiceovers |
| 5 effect presets | ✅ | Sparkles, bling, pop, etc. |
| 3 filters | ✅ | Aunty, Gold, VHS |
| Export to MP4 | ✅ | Core feature |
| Share to WhatsApp/Instagram | ✅ | Critical for virality |
| User accounts | ✅ | Via Clerk |
| Save drafts | ✅ | Quality of life |

### NOT in MVP

| Feature | Why Not |
|---------|---------|
| Custom templates | Complexity |
| Sound upload | Moderation concerns |
| AI voiceover | Cost + complexity |
| Web version | Mobile-first |
| Social feed | Different product |

### Monetization Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                     FREE TIER                                   │
│                                                                 │
│  • 3 video exports/week                                         │
│  • 5 AI generations/day                                         │
│  • Watermark on exports                                         │
│  • Basic templates & sounds                                     │
│  • Standard rendering speed                                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   PREMIUM ($4.99/month or $29.99/year)          │
│                                                                 │
│  • Unlimited exports                                            │
│  • 50 AI generations/day                                        │
│  • No watermark                                                 │
│  • Premium templates, sounds, effects                           │
│  • Priority rendering                                           │
│  • Early access to new features                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   EID SEASON PASS ($2.99 one-time)              │
│                                                                 │
│  • Unlocks all features for Eid season (2 weeks)                │
│  • Great for casual users                                       │
│  • Lower commitment than subscription                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Cost Analysis (per 1000 users)

| Cost | Amount | Notes |
|------|--------|-------|
| Replicate (AI) | ~$50 | 5 gens/user × $0.01 |
| Remotion Lambda | ~$30 | 3 renders/user × $0.01 |
| Convex | $0 | Free tier covers MVP |
| Expo/EAS | $0 | Free tier |
| **Total** | ~$80/1000 users | $0.08/user |

With 5% conversion to $4.99 premium = $249.50 revenue per 1000 users. Healthy margin!

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

### Mitigation Strategies

```typescript
// Content moderation pipeline
async function moderateContent(imageUrl: string, prompt: string): Promise<boolean> {
  // 1. Check prompt against blocklist
  if (containsBlockedTerms(prompt)) {
    return false;
  }

  // 2. Run image through NSFW classifier
  const nsfwScore = await classifyImage(imageUrl);
  if (nsfwScore > 0.7) {
    return false;
  }

  // 3. Check for known problematic imagery
  const safetyScore = await googleVisionSafeSearch(imageUrl);
  if (!safetyScore.safe) {
    return false;
  }

  return true;
}
```

---

## 8. Project Structure

```
eid-meme-maker/
├── apps/
│   └── mobile/                    # Expo app
│       ├── app/                   # Expo Router screens
│       │   ├── (tabs)/
│       │   │   ├── index.tsx      # Home
│       │   │   ├── create.tsx     # Create wizard
│       │   │   └── profile.tsx    # User profile
│       │   ├── create/
│       │   │   ├── step1.tsx      # Pick template
│       │   │   ├── step2.tsx      # Add images
│       │   │   ├── step3.tsx      # Pick sound
│       │   │   ├── step4.tsx      # Effects & text
│       │   │   └── step5.tsx      # Export
│       │   └── _layout.tsx
│       ├── components/
│       │   ├── ui/                # Buttons, cards, etc.
│       │   ├── canvas/            # Skia canvas components
│       │   ├── audio/             # Sound picker, player
│       │   └── effects/           # Sparkles, bling, etc.
│       ├── hooks/
│       │   ├── useConvex.ts
│       │   ├── useAIGeneration.ts
│       │   └── useVideoExport.ts
│       ├── lib/
│       │   ├── convex.ts          # Convex client
│       │   └── animations.ts      # Reanimated presets
│       └── assets/
│           ├── sounds/            # Bundled sounds
│           └── images/            # Bundled stickers
│
├── packages/
│   └── remotion/                  # Remotion compositions
│       ├── src/
│       │   ├── EidMemeVideo.tsx   # Main composition
│       │   ├── components/
│       │   │   ├── AnimatedImage.tsx
│       │   │   ├── AnimatedText.tsx
│       │   │   ├── EffectsLayer.tsx
│       │   │   └── templates/
│       │   │       ├── ZohranTemplate.tsx
│       │   │       ├── AuntyTemplate.tsx
│       │   │       └── ClassicTemplate.tsx
│       │   └── Root.tsx
│       └── remotion.config.ts
│
├── convex/                        # Convex backend
│   ├── schema.ts
│   ├── users.ts
│   ├── projects.ts
│   ├── renders.ts
│   ├── sounds.ts
│   ├── assets.ts
│   ├── ai.ts                      # AI generation actions
│   └── _generated/
│
├── package.json
├── turbo.json                     # Monorepo config
└── README.md
```

---

## 9. Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Initialize Expo project with TypeScript
- [ ] Set up Convex backend with schema
- [ ] Create basic navigation (5-step wizard)
- [ ] Implement Clerk authentication
- [ ] Build template selection screen

### Phase 2: Core Features (Week 3-4)
- [ ] Image upload with expo-image-picker
- [ ] Background removal integration (Replicate)
- [ ] AI image generation with prompts
- [ ] Sound library UI and playback
- [ ] Basic Skia canvas for preview

### Phase 3: Video Rendering (Week 5-6)
- [ ] Set up Remotion project
- [ ] Create EidMemeVideo composition
- [ ] Implement animation presets
- [ ] Deploy Remotion Lambda
- [ ] Connect render pipeline to Convex

### Phase 4: Polish & Effects (Week 7-8)
- [ ] Add sparkle/bling/confetti effects
- [ ] Implement filters (Aunty, Gold, VHS)
- [ ] Text customization
- [ ] Improve preview quality
- [ ] Add progress indicators

### Phase 5: Launch Prep (Week 9-10)
- [ ] Social sharing (WhatsApp, Instagram)
- [ ] Implement freemium limits
- [ ] Add watermark for free tier
- [ ] Performance optimization
- [ ] Beta testing with friends
- [ ] App Store / Play Store submission

---

## 10. Quick Start

```bash
# Create monorepo
npx create-turbo@latest eid-meme-maker

# Initialize Expo app
cd apps && npx create-expo-app mobile -t expo-template-blank-typescript

# Add dependencies
cd mobile
npx expo install expo-router expo-av expo-image-picker
npm install nativewind tailwindcss react-native-reanimated @shopify/react-native-skia
npm install convex @clerk/clerk-expo

# Initialize Convex
cd ../..
npm install convex
npx convex dev

# Set up Remotion
cd packages && npx create-video@latest remotion
cd remotion && npm install @remotion/lambda

# Add Remotion skill for Claude assistance
npx skills add remotion-dev/skills
```

---

## 11. Open Questions

1. **Should we support Eid al-Adha specifically?**
   - Different imagery (goats, sacrifice themes)
   - Separate template category?

2. **How to handle Arabic text rendering?**
   - RTL support in Remotion
   - Arabic font licensing

3. **Should there be a "community" section?**
   - Browse others' creations
   - Increases engagement but adds moderation burden

4. **Web version priority?**
   - Expo Web works but suboptimal
   - Focus mobile first, web later?

---

## Summary

EidMemeMaker differentiates from generic tools by:
1. **Niche focus** - Eid + desi humor only
2. **Simplicity** - 5-step wizard, no timeline
3. **Cultural authenticity** - Aunty filters, Bollywood sounds, cultural tropes
4. **AI-powered** - Generate custom assets with prompts
5. **Fun first** - Intentionally cheesy, meme-friendly

The tech stack (Expo + Convex + Remotion + Replicate) is modern, cost-effective, and capable of delivering the vision. MVP can be built by a solo dev or small team.

Ready to start building? Let's go! 🌙✨
