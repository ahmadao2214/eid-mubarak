# EidMemeMaker - App Plan

> A fun, meme-centric app for creating cheesy Eid Mubarak video cards with "Aunty aesthetics" and Zohran Mamdani-style humor.

---

# PART 1: MVP PROTOTYPE (FOCUSED SCOPE)

## MVP-1. Zohran Video Breakdown

### Frame-by-Frame Analysis

The viral Zohran Eid video contains these distinct elements:

```
┌─────────────────────────────────────────────────────────────────┐
│                 ZOHRAN VIDEO ANATOMY                            │
│                                                                 │
│  LAYER 1: BACKGROUND                                            │
│  └── Psychedelic scenic road (mountain/desert highway)          │
│      └── Subtle motion (slow zoom or pan)                       │
│                                                                 │
│  LAYER 2: HUE OVERLAY                                           │
│  └── Color wash over entire video                               │
│      └── Options: Gold, Pink/Magenta, Green, Blue               │
│      └── Slightly animated (pulsing or shifting)                │
│                                                                 │
│  LAYER 3: DECORATIVE ELEMENTS                                   │
│  ├── Heart made of roses (pumping animation)                    │
│  ├── Flower that opens (reveals head)                           │
│  └── Floating rose petals / sparkles                            │
│                                                                 │
│  LAYER 4: HEAD/FACE CUTOUT                                      │
│  ├── Main head (zooms in/out from flower center)                │
│  ├── Multiple heads (6 heads spiral around)                     │
│  └── Head with accessories (hijab on Drake, etc.)               │
│                                                                 │
│  LAYER 5: TEXT OVERLAYS                                         │
│  ├── "Eid Mubarak" (funky/psychedelic font)                     │
│  ├── "Register to Vote" (call to action)                        │
│  ├── Links/handles                                              │
│  └── Floating text animation (rises from head)                  │
│                                                                 │
│  LAYER 6: AUDIO                                                 │
│  └── Nasheed or Bollywood background music                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Simplified Template Structure

For MVP, we break this into **customizable slots**:

| Slot | User Choice | Default |
|------|-------------|---------|
| **Background** | Mountain road, Desert highway, Scenic valley, Solid color | Mountain road |
| **Hue Overlay** | Gold, Pink, Green, Blue, Purple, None | Gold |
| **Decorative Element** | Rose heart, Sunflower, Lotus, Crescent moon, None | Rose heart |
| **Flower for Head** | Rose bloom, Sunflower open, Lotus open, None | Rose bloom |
| **Head Image** | User's photo (auto-cropped) | Required |
| **Head Animation** | Single pop, 6-head spiral, Zoom pulse, Float | Single pop |
| **Text Line 1** | Custom text | "Eid Mubarak!" |
| **Text Line 2** | Custom text (optional) | "" |
| **Font Style** | Psychedelic, Classic, Bollywood, Clean | Psychedelic |
| **Sound** | Pick from library | Default nasheed |

---

## MVP-2. Face/Head Cropping Feature

### The Core Problem

Users want to:
1. Take a selfie or pick a photo
2. Have JUST THE HEAD extracted (no background)
3. Place that head into meme templates
4. Optionally add accessories (hijab, crown, sunglasses)

### Solution: remove.bg API

We're using **remove.bg** as our sole background removal solution for MVP. It's the industry standard, handles hair and complex edges beautifully, and is dead simple to integrate.

```
┌─────────────────────────────────────────────────────────────────┐
│                    HEAD EXTRACTION FLOW                         │
│                                                                 │
│   ┌──────────┐      ┌──────────────┐      ┌──────────────┐     │
│   │  User    │      │  remove.bg   │      │  PNG with    │     │
│   │  Photo   │  ──▶ │  API         │  ──▶ │  transparent │     │
│   │  (JPG)   │      │              │      │  background  │     │
│   └──────────┘      └──────────────┘      └──────────────┘     │
│                                                                 │
│   Cost: ~$0.05 per image (preview) / ~$0.20 (full HD)          │
│   Speed: 1-3 seconds                                            │
│   Quality: Excellent (handles hair, edges, complex backgrounds) │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Why remove.bg?

| Aspect | Details |
|--------|---------|
| **Quality** | Best-in-class edge detection, especially for hair |
| **Speed** | 1-3 seconds per image |
| **Simplicity** | Single API call, no ML setup required |
| **Reliability** | Production-ready, used by millions |
| **Pricing** | Free tier (50 images/month), then ~$0.05-0.20/image |

### How It Works

1. **User picks photo** via expo-image-picker (with optional crop)
2. **Send to remove.bg** API endpoint
3. **Receive PNG** with transparent background
4. **Store in Convex** file storage
5. **Use in template** as head layer

### Head Accessories (Drake with Hijab)

For accessories, we use pre-made PNG overlays positioned relative to the head image:

| Accessory | Position | Notes |
|-----------|----------|-------|
| Hijab | Wraps around head | Sized ~140% of head |
| Crown | Above head | Centered, ~80% width |
| Sunglasses | Over eyes | Centered, ~60% width |
| Party Hat | Top of head | Angled slightly |
| Halo | Above head | Glowing effect |

The user can select an accessory in Step 2 (Customize), and it gets composited with their head in the Remotion template.

---

## MVP-3. Refined Tech Stack for Prototype

### Remotion vs FFmpeg Decision

| Requirement | FFmpeg | Remotion | Winner |
|-------------|--------|----------|--------|
| Compose layers (bg + head + text) | ✅ Complex filters | ✅ React components | Remotion |
| Animate head (zoom, spiral) | ⚠️ Very complex | ✅ spring(), interpolate() | Remotion |
| Add Lottie effects | ❌ No | ✅ @remotion/lottie | Remotion |
| Text animations | ⚠️ Limited | ✅ Full CSS/JS | Remotion |
| Hue overlay | ✅ colorchannelmixer | ✅ CSS filter | Tie |
| Export MP4 | ✅ Native | ✅ Uses FFmpeg internally | Tie |
| Learning curve | Steep | Medium (React) | Remotion |
| Dev speed | Slow | Fast | Remotion |

**Verdict: Remotion** - It uses FFmpeg under the hood anyway, but gives us React's composability.

### Simplified MVP Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                    MVP TECH STACK                               │
│                                                                 │
│  FRONTEND (Expo)                                                │
│  ├── expo-image-picker     → Photo selection                    │
│  ├── expo-av               → Audio preview                      │
│  └── react-native-skia     → Canvas preview (optional)          │
│                                                                 │
│  BACKEND (Convex)                                               │
│  ├── File storage          → Store user photos, outputs         │
│  ├── Template configs      → Store template definitions         │
│  └── Render queue          → Track render jobs                  │
│                                                                 │
│  HEAD EXTRACTION                                                │
│  └── remove.bg API         → Background removal                 │
│                                                                 │
│  VIDEO RENDERING                                                │
│  └── Remotion Lambda       → React → MP4                        │
│      └── @remotion/lottie  → Flower animations, effects         │
│                                                                 │
│  NO AI GENERATION FOR MVP                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### What is a Render Queue?

A **Render Queue** is a system that manages video rendering jobs. Since video rendering is CPU/GPU intensive and takes time (10-60 seconds per video), we can't do it synchronously while the user waits.

```
┌─────────────────────────────────────────────────────────────────┐
│                    RENDER QUEUE FLOW                            │
│                                                                 │
│   1. USER REQUESTS VIDEO                                        │
│      └── "I want to export my meme!"                           │
│                                                                 │
│   2. JOB ADDED TO QUEUE                                         │
│      └── Create record in Convex: { status: "pending" }        │
│      └── User sees: "Your video is being prepared..."          │
│                                                                 │
│   3. WORKER PICKS UP JOB                                        │
│      └── Remotion Lambda starts rendering                       │
│      └── Update status: { status: "rendering", progress: 45% } │
│      └── User sees: "Rendering... 45%"                         │
│                                                                 │
│   4. RENDER COMPLETES                                           │
│      └── MP4 uploaded to storage                                │
│      └── Update status: { status: "completed", url: "..." }    │
│      └── User sees: "Done! Download or Share"                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Why do we need it?**
- Video rendering takes 10-60 seconds (can't block the UI)
- Multiple users might request renders simultaneously
- We need to track progress and handle failures
- Convex gives us real-time updates so users see progress live

**In Convex, it looks like:**
```
renders table:
┌────────────┬─────────────┬──────────┬─────────┬─────────────┐
│ id         │ projectId   │ status   │ progress│ outputUrl   │
├────────────┼─────────────┼──────────┼─────────┼─────────────┤
│ render_123 │ project_456 │ pending  │ 0       │ null        │
│ render_124 │ project_789 │ rendering│ 67      │ null        │
│ render_125 │ project_012 │ completed│ 100     │ https://... │
└────────────┴─────────────┴──────────┴─────────┴─────────────┘
```

---

### What is Remotion Lambda?

**Remotion Lambda** is Remotion's serverless video rendering service that runs on AWS Lambda. Instead of running video rendering on your own servers, you deploy a Lambda function that does the heavy lifting.

```
┌─────────────────────────────────────────────────────────────────┐
│                    REMOTION LAMBDA EXPLAINED                    │
│                                                                 │
│   WITHOUT REMOTION LAMBDA (Self-hosted):                        │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │  You need:                                               │  │
│   │  • A server with FFmpeg installed                        │  │
│   │  • Chromium/Puppeteer for rendering React                │  │
│   │  • Always-on server ($50-100/month minimum)              │  │
│   │  • Handle scaling yourself                               │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│   WITH REMOTION LAMBDA (Serverless):                            │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │  You get:                                                │  │
│   │  • Pre-configured AWS Lambda function                    │  │
│   │  • Pay only when rendering (~$0.01-0.05 per video)       │  │
│   │  • Auto-scales to handle many concurrent renders         │  │
│   │  • No server maintenance                                 │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**How it works:**

1. **You deploy once**: Run `npx remotion lambda deploy` to set up the Lambda function on AWS
2. **Your app calls the API**: When user wants a video, call `renderMediaOnLambda()`
3. **Lambda renders**: The function spins up, renders your React composition to MP4
4. **You get a URL**: The finished video is stored in S3, you get a download URL

**Cost breakdown:**
| Video Length | Approximate Cost |
|--------------|------------------|
| 10 seconds   | ~$0.01           |
| 20 seconds   | ~$0.02           |
| 60 seconds   | ~$0.05           |

**Why Lambda vs. self-hosted?**
- **No idle costs**: Only pay when actually rendering
- **Auto-scaling**: Can handle 100 users rendering simultaneously
- **No DevOps**: AWS manages the infrastructure
- **Fast**: Lambda functions are optimized for this workload

**Trade-off**: Requires AWS account setup, but Remotion has excellent docs for this.

---

## MVP-4. Template System Design

### Template Definition Schema

```typescript
interface MemeTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;

  // Video settings
  duration: number;        // seconds (10, 15, 20)
  fps: number;             // 30
  width: number;           // 1080
  height: number;          // 1920 (9:16)

  // Layers (back to front)
  layers: {
    background: {
      type: 'video' | 'image' | 'solid';
      source: string;      // URL or color
      animation?: 'slow-zoom' | 'pan-left' | 'static';
    };

    hueOverlay: {
      enabled: boolean;
      color: string;       // hex color
      opacity: number;     // 0-1
      animation?: 'pulse' | 'static';
    };

    decorativeElements: Array<{
      type: 'lottie' | 'image';
      source: string;
      position: { x: number; y: number };  // percentage
      scale: number;
      animation?: string;
    }>;

    headSlot: {
      position: { x: number; y: number };
      scale: number;
      animation: 'pop' | 'zoom-pulse' | 'spiral-multiply' | 'float';
      animationConfig?: {
        spiralCount?: number;    // for spiral-multiply
        pulseSpeed?: number;     // for zoom-pulse
      };
      flowerReveal?: {
        enabled: boolean;
        type: 'rose' | 'sunflower' | 'lotus';
      };
      accessory?: {
        type: string;
        position: 'above' | 'on' | 'below';
      };
    };

    textSlots: Array<{
      id: string;
      defaultText: string;
      position: { x: number; y: number };
      style: {
        fontFamily: string;
        fontSize: number;
        color: string;
        stroke?: string;
      };
      animation: 'fade-in' | 'rise-up' | 'typewriter' | 'float';
      enterAtSecond: number;
    }>;
  };

  audio: {
    defaultTrack: string;  // ID from sound library
    volume: number;
  };
}
```

### Pre-built Templates for MVP

```typescript
const templates: MemeTemplate[] = [
  {
    id: 'zohran-classic',
    name: 'Zohran Classic',
    description: 'The OG politician greeting card energy',
    layers: {
      background: {
        type: 'video',
        source: 'mountain-road-psychedelic.mp4',
        animation: 'slow-zoom',
      },
      hueOverlay: {
        enabled: true,
        color: '#FFD700',  // Gold
        opacity: 0.3,
        animation: 'pulse',
      },
      decorativeElements: [
        {
          type: 'lottie',
          source: 'rose-heart-pumping.json',
          position: { x: 50, y: 50 },
          scale: 1.2,
        },
      ],
      headSlot: {
        position: { x: 50, y: 45 },
        scale: 0.4,
        animation: 'zoom-pulse',
        flowerReveal: {
          enabled: true,
          type: 'rose',
        },
      },
      textSlots: [
        {
          id: 'main',
          defaultText: 'Eid Mubarak!',
          position: { x: 50, y: 75 },
          style: {
            fontFamily: 'Psychedelic',
            fontSize: 64,
            color: '#FFFFFF',
            stroke: '#000000',
          },
          animation: 'rise-up',
          enterAtSecond: 1,
        },
        {
          id: 'secondary',
          defaultText: '',
          position: { x: 50, y: 85 },
          style: {
            fontFamily: 'Clean',
            fontSize: 32,
            color: '#FFFFFF',
          },
          animation: 'fade-in',
          enterAtSecond: 2,
        },
      ],
    },
    audio: {
      defaultTrack: 'nasheed-1',
      volume: 0.8,
    },
  },

  {
    id: 'six-head-spiral',
    name: 'Head Spiral',
    description: '6 heads spiraling around - maximum chaos',
    layers: {
      // ... similar structure with spiral animation
      headSlot: {
        position: { x: 50, y: 50 },
        scale: 0.25,
        animation: 'spiral-multiply',
        animationConfig: {
          spiralCount: 6,
        },
      },
    },
  },

  {
    id: 'drake-hijab',
    name: 'Hijab Mode',
    description: 'Any head + hijab = instant meme',
    layers: {
      background: {
        type: 'solid',
        source: '#1a1a2e',
      },
      headSlot: {
        position: { x: 50, y: 50 },
        scale: 0.5,
        animation: 'pop',
        accessory: {
          type: 'hijab-white',
          position: 'on',
        },
      },
      // ...
    },
  },
];
```

---

## MVP-5. Simplified User Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     MVP USER FLOW                               │
│                     (3 Steps, Not 5)                            │
└─────────────────────────────────────────────────────────────────┘

STEP 1: PICK TEMPLATE + ADD HEAD
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   Pick a vibe:                                                  │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│   │ Zohran   │ │ 6-Head   │ │ Hijab    │ │ Aunty    │         │
│   │ Classic  │ │ Spiral   │ │ Mode     │ │ Forward  │         │
│   └──────────┘ └──────────┘ └──────────┘ └──────────┘         │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │                                                         │  │
│   │              📸 TAP TO ADD YOUR HEAD                    │  │
│   │                                                         │  │
│   │         (We'll magically remove the background)         │  │
│   │                                                         │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│   [Use Celebrity Instead ▼]  (Drake, SRK, Aunty stock)         │
│                                                                 │
│                              [ NEXT → ]                         │
└─────────────────────────────────────────────────────────────────┘

STEP 2: CUSTOMIZE
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   ┌─────────────────────────────────────────┐                  │
│   │                                         │                  │
│   │           LIVE PREVIEW                  │                  │
│   │           (animated)                    │                  │
│   │                                         │                  │
│   └─────────────────────────────────────────┘                  │
│                                                                 │
│   TEXT LINE 1:                                                  │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │  Eid Mubarak!                                           │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│   TEXT LINE 2 (optional):                                       │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │  From your favorite aunty                               │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│   CUSTOMIZE:                                                    │
│   [🎨 Hue: Gold ▼] [🌸 Flower: Rose ▼] [🔊 Sound ▼]           │
│                                                                 │
│   ACCESSORY (optional):                                         │
│   [None] [🧕 Hijab] [👑 Crown] [🕶️ Shades] [🎉 Hat]           │
│                                                                 │
│                    [ ← BACK ]  [ NEXT → ]                       │
└─────────────────────────────────────────────────────────────────┘

STEP 3: EXPORT & SHARE
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   ┌─────────────────────────────────────────┐                  │
│   │                                         │                  │
│   │           FINAL PREVIEW                 │                  │
│   │           (full quality)                │                  │
│   │                                         │                  │
│   └─────────────────────────────────────────┘                  │
│                                                                 │
│   FORMAT:  [📹 Video]  [🖼️ GIF]  [📸 Image]                    │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │  [ 📱 Share to WhatsApp ]                               │  │
│   │  [ 📸 Share to Instagram ]                              │  │
│   │  [ 💾 Save to Camera Roll ]                             │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│   Rendering... ████████████░░░░ 75%                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## MVP-6. What's IN vs OUT of MVP

### IN (Must Have)

| Feature | Why |
|---------|-----|
| 4 pre-built templates | Core product |
| Head extraction (background removal) | Core feature |
| Head accessories (hijab, crown, etc.) | Drake meme capability |
| 2 text slots with animation | Customization |
| 3 hue overlay options | Quick customization |
| 3 flower/element options | Template variety |
| 5 curated sounds | Audio is essential |
| Export to MP4 | Primary output |
| Share to WhatsApp/Instagram | Distribution |

### OUT (Later)

| Feature | Why Defer |
|---------|-----------|
| AI image generation | Cost, complexity |
| Custom template builder | Scope creep |
| User accounts | Can be anonymous MVP |
| GIF export | MP4 first |
| Sound upload | Moderation concerns |
| Web version | Mobile first |
| More than 4 templates | Validate first |

---

## MVP-7. Asset Checklist

### Backgrounds Needed (4)
- [ ] Mountain road (psychedelic color graded)
- [ ] Desert highway (golden hour)
- [ ] Scenic valley (green, lush)
- [ ] Solid gradient (fallback)

### Lottie Animations Needed (6)
- [ ] Rose heart pumping
- [ ] Rose bloom (reveals head)
- [ ] Sunflower bloom (reveals head)
- [ ] Lotus bloom (reveals head)
- [ ] Sparkle overlay
- [ ] Floating petals

### Head Accessories Needed (5)
- [ ] White hijab
- [ ] Black hijab
- [ ] Gold crown
- [ ] Sunglasses
- [ ] Party hat

### Sounds Needed (5)
- [ ] Nasheed 1 (upbeat)
- [ ] Nasheed 2 (peaceful)
- [ ] Bollywood clip 1
- [ ] Funny voiceover ("Eid Mubarak beta!")
- [ ] Dramatic Bollywood sting

### Fonts Needed (4)
- [ ] Psychedelic/groovy font
- [ ] Classic Arabic-friendly font
- [ ] Bollywood style font
- [ ] Clean sans-serif

---

## MVP-8. Development Phases

### Phase 1: Foundation (3-4 days)
- [ ] Set up Expo project with TypeScript
- [ ] Set up Convex backend
- [ ] Implement image picker
- [ ] Integrate remove.bg API for background removal
- [ ] Basic face detection for cropping

### Phase 2: Template Engine (4-5 days)
- [ ] Set up Remotion project
- [ ] Create base composition component
- [ ] Implement layer system (bg, hue, decorative, head, text)
- [ ] Create 1 working template (Zohran Classic)
- [ ] Test head placement and animation

### Phase 3: Customization UI (3-4 days)
- [ ] Build 3-step wizard navigation
- [ ] Template selection screen
- [ ] Customization screen (text, hue, flower, sound)
- [ ] Live preview component
- [ ] Accessory overlay system

### Phase 4: Rendering & Export (3-4 days)
- [ ] Set up Remotion Lambda (or local for testing)
- [ ] Build render queue in Convex
- [ ] Implement MP4 export
- [ ] Add share functionality (WhatsApp, Instagram, save)
- [ ] Progress indicators

### Phase 5: Polish (2-3 days)
- [ ] Add remaining 3 templates
- [ ] Curate and add sounds
- [ ] Error handling
- [ ] Loading states
- [ ] Beta testing with friends

**Total: ~15-20 days for working prototype**

---

# PART 2: FULL VISION (Reference)

The sections below describe the full vision for future development...

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

## 12. Research: Is Remotion The Right Choice?

### The Zohran Video Style

Based on research, Zohran Mamdani's viral Eid videos feature:
- Bright flowers and rose heart wreaths
- Face cutouts flashing with ironic/cringey transitions
- Psychedelic, trippy morphing effects
- Bollywood music backgrounds

**Can Remotion handle this?** Yes, BUT with caveats:

### Remotion Capabilities

| Feature | Support | How |
|---------|---------|-----|
| Basic animations | ✅ Native | `spring()`, `interpolate()` |
| Text effects | ✅ Native | CSS animations, custom components |
| Image transitions | ✅ Native | Sequences, crossfades |
| Particle effects | ✅ Via libraries | react-particles, custom Canvas |
| 3D effects | ✅ Via Three.js | @remotion/three integration |
| Lottie animations | ✅ Native | @remotion/lottie (After Effects import) |
| WebGL shaders | ✅ Native | Custom shader components |
| **Psychedelic morphing** | ⚠️ Complex | Requires custom WebGL/shaders |
| **Face warping** | ⚠️ Complex | Need mesh distortion or AI |

### For Trippy/Psychedelic Effects

The Zohran-style effects require more advanced techniques:

1. **Mesh Warp Distortion** - After Effects technique that can be replicated with WebGL
2. **AI Morphing** - Tools like Deforum/Stable Diffusion for face morphs
3. **Pre-rendered Lottie** - Create in After Effects, export as Lottie

**Recommendation**: For MVP, use **pre-made Lottie animations** and **CSS-based effects**. Save complex shader effects for v2.

### Alternative Tools Considered

| Tool | Pros | Cons | Verdict |
|------|------|------|---------|
| **Remotion** | React-native, programmatic, great for templates | Complex effects need custom work | ✅ Best for our use case |
| **FFmpeg directly** | Maximum control, free | Steep learning curve, no React | ❌ Too low-level |
| **After Effects + Templater** | Pro-quality effects | Expensive, not programmatic | ❌ Wrong paradigm |
| **Creatomate API** | Easy API, hosted | Less control, ongoing costs | 🤔 Consider for v2 rendering |
| **Neural Frames** | AI psychedelic videos | Music-focused, less customizable | ❌ Wrong use case |

### Verdict: Remotion + Lottie Hybrid

```
┌─────────────────────────────────────────────────────────────────┐
│                    EFFECT PIPELINE                              │
│                                                                 │
│   Simple Effects          Complex Effects         AI Effects    │
│   (Remotion native)       (Pre-made Lottie)       (Future v2)   │
│                                                                 │
│   • Text animations       • Psychedelic BGs       • Face morph  │
│   • Image pop/slide       • Flower explosions     • Style xfer  │
│   • Sparkle particles     • Face frame effects    • Deforum     │
│   • Color transitions     • Trippy transitions                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 13. Meme Culture Research & Theme Expansion

### Research Sources for Desi Meme Culture

#### Publications & Media
| Source | What to Learn | Link |
|--------|---------------|------|
| **The Juggernaut** | South Asian diaspora stories, cultural trends | thejuggernaut.com |
| **Vice Desi Content** | Gen Z desi meme analysis | vice.com |
| **MEL Magazine** | "Why South Asian Men Are Obsessed With Drake" | melmagazine.com |
| **Brown Pundits** | Cultural commentary | brownpundits.com |

#### Instagram Meme Pages to Study
| Account | Followers | Vibe |
|---------|-----------|------|
| **@rajnikant_vs_cidjokes** | 13M | OG desi memes, Bollywood |
| **@theindianmemes** | 412K | "Masala for your feed" |
| **@trolls_official** | 6.2M | Puns + pictures |
| **@desi.humor** | 21K | "Brown people be like" |
| **@shitindianssay** | - | Cultural quirks, phrases |
| **@thedesistuff** | - | Nostalgic, wholesome desi |
| **@ghantaa** | - | Street-smart humor |
| **@aksharpathak** | 389K | Design-forward memes |

#### TikTok Trends to Watch
- **Asoka Makeup Trend** - Shah Rukh Khan film inspired
- **Desi Dad Reactions** - Relatable family humor
- **Bollywood Lip Syncs** - Classic dialogues
- **Brown Kid Struggles** - Diaspora experiences

### Why Drake Matters

Drake resonates with desi youth because:
- Says "mashAllah" and "wallahi" in songs
- Light-skinned, bearded aesthetic
- Emotional/soft masculinity
- Toronto connection (large South Asian population)
- "Islamic remixes" of his songs went viral in 2010s

**Template Idea**: "Drake Mode" - emotional captions, OVO aesthetic, Toronto vibes

### Expanded Theme Ideas

Based on research, here are MORE themes beyond Zohran/Aunty/Classic:

```
┌─────────────────────────────────────────────────────────────────┐
│                    EXPANDED THEME LIBRARY                       │
│                                                                 │
│   CORE THEMES (MVP)                                             │
│   ├── 🎭 Zohran Mode      (politician greeting card energy)     │
│   ├── 💅 Aunty Aesthetics (gold bling, dramatic, Bollywood)     │
│   └── 🌙 Classic Eid      (elegant, lanterns, calligraphy)      │
│                                                                 │
│   MEME THEMES (v1.1)                                            │
│   ├── 🦉 Drake Mode       (OVO vibes, emotional captions)       │
│   ├── 🎬 Bollywood Drama  (SRK poses, filmi dialogues)          │
│   ├── 👨‍👩‍👧 Desi Family     (WhatsApp forward energy)             │
│   └── 🐐 Qurbani Vibes    (Eid al-Adha specific, goat memes)    │
│                                                                 │
│   NICHE THEMES (v2)                                             │
│   ├── 🏏 Cricket Eid      (IPL/World Cup crossover)             │
│   ├── 🎵 Coke Studio      (Pakistani music aesthetic)           │
│   ├── 🌶️ Biryani Wars     (Hyderabadi vs Lucknowi)              │
│   └── 📱 NRI Struggles    (Diaspora-specific humor)             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 14. Sound & Asset Sources

### Nasheeds (Islamic Vocals)

| Source | Type | License | Notes |
|--------|------|---------|-------|
| **NoCopyrightNasheeds** | Free | Credit required | Best free option, stream-safe |
| **Internet Archive** | Free | Varies | Large collection, check each |
| **Pixabay Music** | Free | No attribution | Limited selection |
| **Envato Elements** | Paid | Royalty-free | High quality, $16.50/mo |

**Recommended**: Start with NoCopyrightNasheeds, supplement with Envato

### Bollywood & Desi Sounds

| Source | Type | License | Notes |
|--------|------|---------|-------|
| **Pixabay** | Free | No attribution | SFX and short clips |
| **Soundsnap** | Paid | Royalty-free | 500K+ SFX library |
| **Storyblocks** | Subscription | Unlimited | Good Bollywood selection |
| **AudioJungle** | Per-track | Royalty-free | 1,123 Bollywood tracks |

**Legal Note**: For actual Bollywood song clips, you need sync licenses OR:
- Use <10 second clips (fair use gray area)
- Use royalty-free "Bollywood-style" music
- Create original covers

### Funny Voiceovers

**DIY Approach** (Recommended for authenticity):
1. Record friends/family saying classic phrases
2. Use ElevenLabs to clone and generate variations
3. Commission from Fiverr voice actors

**Classic Phrases to Record**:
- "Eid Mubarak beta!"
- "Khana khao, bahut kamzor lag rahe ho"
- "MashAllah, kitna bada ho gaya!"
- "Beta, shaadi kab kar rahe ho?"
- "Ammi ki kasam"
- "Arey waah!"

### Visual Assets

| Source | Type | Best For |
|--------|------|----------|
| **LottieFiles** | Lottie JSON | Animated stickers, effects |
| **Freepik** | SVG/PNG | Eid elements, Islamic patterns |
| **Flaticon** | Icons | UI elements |
| **Unsplash** | Photos | Backgrounds |
| **Pexels Videos** | Stock video | BG loops |
| **Pixabay** | Everything | General assets |

### Where to Find Reference Videos

| Platform | Search Terms | What to Study |
|----------|--------------|---------------|
| **TikTok** | #EidMubarak, #DesiMemes, @zohran_k_mamdani | Transitions, humor style |
| **Instagram Reels** | #EidMubarak, #BrownMemes | Visual style, popular formats |
| **YouTube** | "Eid Mubarak video template", "desi meme compilation" | Longer format examples |
| **Pinterest** | "Eid card design", "Islamic art modern" | Static design inspiration |

### Specific Videos to Study

1. **Zohran Mamdani's Eid videos** - instagram.com/reel/DH0gm4euANO/
2. **Drake desi edits** - Search TikTok "Drake desi"
3. **Aunty WhatsApp forwards** - Search "Indian aunty WhatsApp video"
4. **Pakistani Eid shows** - ARY/Geo TV Eid transmissions for OTT aesthetic

---

## 15. Technical Deep Dive: Psychedelic Effects

### How to Achieve Zohran-Style Effects in Remotion

#### 1. Flower Explosion Effect
```typescript
// Use Lottie for pre-made flower animations
import { Lottie } from "@remotion/lottie";
import flowerExplosion from "./flower-explosion.json";

const FlowerBurst = () => (
  <Lottie
    animationData={flowerExplosion}
    style={{ position: "absolute", width: "100%", height: "100%" }}
  />
);
```

#### 2. Face Pop-In Effect
```typescript
const FacePopIn = ({ imageUrl }) => {
  const frame = useCurrentFrame();

  // Elastic pop effect
  const scale = spring({
    frame,
    fps: 30,
    config: { damping: 8, stiffness: 200, mass: 0.5 }
  });

  // Slight rotation wiggle
  const rotation = Math.sin(frame * 0.3) * 3;

  // Glow pulse
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

#### 3. Psychedelic Background (WebGL Shader)
```typescript
// For truly trippy effects, use a shader
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

#### 4. Pre-made Lottie Effects to License/Create

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
4. **AI-powered** - Generate custom assets with prompts
5. **Fun first** - Intentionally cheesy, meme-friendly
6. **Meme-native** - Built on actual desi internet culture research

The tech stack (Expo + Convex + Remotion + Replicate) is modern, cost-effective, and capable of delivering the vision. MVP can be built by a solo dev or small team.

**Remotion Verdict**: YES, it handles our needs. Use native features for simple effects, Lottie for complex pre-made animations, and WebGL/Three.js for truly psychedelic stuff.

Ready to start building? Let's go! 🌙✨
