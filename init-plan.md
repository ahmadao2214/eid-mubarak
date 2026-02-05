# EidMemeMaker - MVP Init Plan

> A fun, meme-centric app for creating cheesy Eid Mubarak video cards with "Aunty aesthetics" and Zohran Mamdani-style humor.
>
> **Scope**: Ramadan & Eid al-Fitr only. Focused on getting a working prototype to test at our iftar party.
>
> **Related docs**: [Full Vision](./full-vision.md) | [Meme Culture Research](./meme-culture-research.md) | [General Assets](./general-assets.md)

---

## PR Comment Resolutions

Decisions made from PR #1 review (iismail19):

| # | Comment | Resolution |
|---|---------|------------|
| 1 | "Confused on the approach - are we allowing user to customize a template or start from scratch?" | **Predefined templates only.** Each template has fixed layers with configurable element options (hue, flower, head animation, text). No custom builder for MVP. Users pick a template, then swap elements within it. |
| 2 | "Not bad at all! - approve" (remove.bg) | **Approved.** Keeping remove.bg as sole background removal solution. |
| 3 | "Add custom text if user wants too?" | **Yes.** Custom text is now an explicit step in the flow. Two text slots: main greeting + optional secondary line. |
| 4 | "This is a better approach - pay only what we use" (Remotion Lambda) | **Confirmed.** Using Remotion Lambda serverless rendering. We need to set up the Lambda service ourselves via `npx remotion lambda deploy`. |
| 5 | "AWS account - S3 bucket for storing media, blobs should not be stored on DB" | **Confirmed.** AWS S3 for all blob storage (user photos, rendered videos, assets). Convex DB stores only metadata + S3 URLs/keys. |
| 6 | "Between the two of us - we can probably cut this in half" | **Agreed.** Phases structured for parallel work. Will discuss task splits. |

**Additional decisions from review discussion:**
- No monetization for MVP — focus on working copy first
- No community/social features — testing at iftar party
- No Eid al-Adha, no RTL support for now
- No AI generation for MVP
- Mobile first (React Native), web can come later
- Single default sound for initial working copy, expand to curated library after
- Head accessories need testing — CSS overlay may not work well for all cases (see deep dive below)

---

# MVP PROTOTYPE

## 1. Zohran Video Breakdown

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
│  ├── Custom user message                                        │
│  └── Floating text animation (rises from head)                  │
│                                                                 │
│  LAYER 6: AUDIO                                                 │
│  └── Nasheed or Bollywood background music                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Template Approach (How It Works)

### The Core Concept: "Slot Machine" Templates

Users do NOT build from scratch. They pick a **predefined template** that has a fixed visual structure (layer arrangement, timing, transitions). Within that template, certain **element slots** are swappable.

Think of it like CapCut templates — the template defines the choreography (when things appear, how they move, the overall vibe), and the user just swaps in their own head photo, picks a color, and types their message.

```
┌─────────────────────────────────────────────────────────────────┐
│              HOW TEMPLATES WORK                                  │
│                                                                 │
│   TEMPLATE = Fixed choreography + Swappable element slots       │
│                                                                 │
│   What the TEMPLATE controls (not user-changeable):             │
│   ├── Layer order and z-index                                   │
│   ├── Animation timing (when things enter/exit)                 │
│   ├── Element positions (x, y coordinates)                      │
│   ├── Transition types between scenes                           │
│   └── Overall duration and pacing                               │
│                                                                 │
│   What the USER can swap (element slots):                       │
│   ├── Head image (their photo or a celebrity)                   │
│   ├── Hue overlay color (gold, pink, green, blue)               │
│   ├── Decorative element style (rose heart, sunflower, etc.)    │
│   ├── Text content (2 lines)                                    │
│   ├── Font style                                                │
│   └── Sound track                                               │
│                                                                 │
│   EXAMPLE: "Zohran Classic" template                            │
│   ┌───────────────────────────────────────────────┐             │
│   │ Frame 0-15: BG slow zoom + hue pulse          │             │
│   │ Frame 15-30: Flower bloom reveals head         │             │
│   │ Frame 30-60: Head zoom-pulse with sparkles     │             │
│   │ Frame 45-75: Text rises up from bottom         │             │
│   │ Frame 60-90: Everything pulses together        │             │
│   │                                                │             │
│   │ User swaps: head photo, hue=pink, text="Hi!"  │             │
│   │ Everything else stays choreographed.           │             │
│   └───────────────────────────────────────────────┘             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Element Slot Options

Each slot has a fixed set of options the user can pick from:

| Slot | Options Available | Default | Notes |
|------|-------------------|---------|-------|
| **Head Image** | User's photo (auto-cropped) OR celebrity | Required | remove.bg extracts head |
| **Celebrity Heads** | Drake, Shah Rukh Khan, Aunty Stock | N/A | Pre-cropped PNG heads bundled in app |
| **Hue Overlay** | Gold, Pink/Magenta, Green, Blue, None | Gold | CSS filter overlay with animation |
| **Decorative Element** | Rose heart, Sunflower, Lotus, Crescent moon, None | Per template | Lottie animations |
| **Flower for Head Reveal** | Rose bloom, Sunflower open, Lotus open, None | Per template | Lottie that "opens" to show head |
| **Head Animation** | Single pop, 6-head spiral, Zoom pulse, Float | Per template | Remotion spring/interpolate |
| **Text Line 1** | Any custom text | "Eid Mubarak!" | User types whatever they want |
| **Text Line 2** | Any custom text (optional) | "" | Secondary message |
| **Font Style** | Psychedelic, Classic, Bollywood, Clean | Per template | Bundled font files |
| **Sound** | Default nasheed (single track for initial MVP) | Default nasheed | Expand to library after first working copy |

### How Elements Map to the Remotion Composition

```
┌─────────────────────────────────────────────────────────────────┐
│           ELEMENT → REMOTION LAYER MAPPING                      │
│                                                                 │
│  User picks "Zohran Classic" + swaps elements:                  │
│                                                                 │
│  ┌─────────────────┐     ┌──────────────────────────────┐       │
│  │ ELEMENT SLOT    │     │ REMOTION COMPONENT           │       │
│  ├─────────────────┤     ├──────────────────────────────┤       │
│  │ Background      │ ──▶ │ <BackgroundLayer              │       │
│  │ (mountain road) │     │   src="mountain-road.mp4"     │       │
│  │                 │     │   animation="slow-zoom" />    │       │
│  ├─────────────────┤     ├──────────────────────────────┤       │
│  │ Hue: Pink       │ ──▶ │ <HueOverlay                   │       │
│  │                 │     │   color="#FF69B4"              │       │
│  │                 │     │   opacity={0.3}                │       │
│  │                 │     │   animation="pulse" />         │       │
│  ├─────────────────┤     ├──────────────────────────────┤       │
│  │ Decorative:     │ ──▶ │ <Lottie                        │       │
│  │ Rose Heart      │     │   animationData={roseHeart}    │       │
│  │                 │     │   position={{x:50,y:50}} />    │       │
│  ├─────────────────┤     ├──────────────────────────────┤       │
│  │ Head: user.png  │ ──▶ │ <HeadSlot                      │       │
│  │ Animation: pop  │     │   src={userHead}               │       │
│  │                 │     │   animation="zoom-pulse"       │       │
│  │                 │     │   flowerReveal="rose" />       │       │
│  ├─────────────────┤     ├──────────────────────────────┤       │
│  │ Text: "Eid      │ ──▶ │ <TextSlot                      │       │
│  │  Mubarak!"      │     │   text="Eid Mubarak!"         │       │
│  │ Font: Psychedlc │     │   font="Psychedelic"           │       │
│  │                 │     │   animation="rise-up"          │       │
│  │                 │     │   enterAtSecond={1} />         │       │
│  ├─────────────────┤     ├──────────────────────────────┤       │
│  │ Sound: nasheed  │ ──▶ │ <Audio                         │       │
│  │                 │     │   src={nasheed1}               │       │
│  │                 │     │   volume={0.8} />              │       │
│  └─────────────────┘     └──────────────────────────────┘       │
│                                                                 │
│  The template's choreography (timing, positions, transitions)   │
│  is FIXED. Only the content within each slot changes.           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Template System Design (Detailed)

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

  // Layers (back to front) — this is the "choreography"
  layers: {
    background: {
      type: 'video' | 'image' | 'solid';
      source: string;      // URL or color
      animation?: 'slow-zoom' | 'pan-left' | 'static';
    };

    hueOverlay: {
      enabled: boolean;
      defaultColor: string;       // hex color — user can change
      allowedColors: string[];    // options the user picks from
      opacity: number;            // 0-1
      animation?: 'pulse' | 'static';
    };

    decorativeElements: Array<{
      type: 'lottie' | 'image';
      source: string;
      position: { x: number; y: number };  // percentage of canvas
      scale: number;
      enterAtFrame: number;
      animation?: string;
    }>;

    headSlot: {
      position: { x: number; y: number };  // percentage of canvas
      scale: number;
      enterAtFrame: number;
      animation: 'pop' | 'zoom-pulse' | 'spiral-multiply' | 'float';
      animationConfig?: {
        spiralCount?: number;    // for spiral-multiply
        pulseSpeed?: number;     // for zoom-pulse
        popDamping?: number;     // for pop spring config
      };
      flowerReveal?: {
        enabled: boolean;
        type: 'rose' | 'sunflower' | 'lotus';
        // The Lottie plays, and at peak bloom the head appears inside
      };
    };

    textSlots: Array<{
      id: string;
      defaultText: string;
      editable: boolean;          // user can change this text
      position: { x: number; y: number };
      style: {
        fontFamily: string;
        fontSize: number;
        color: string;
        stroke?: string;
        shadow?: boolean;
      };
      animation: 'fade-in' | 'rise-up' | 'typewriter' | 'float';
      enterAtFrame: number;
    }>;
  };

  audio: {
    defaultTrack: string;  // ID from sound library
    volume: number;
  };

  // What the user is allowed to customize in this template
  configurableSlots: Array<
    'hueColor' | 'decorativeElement' | 'headImage' | 'headAnimation' |
    'textContent' | 'fontStyle' | 'sound' | 'flowerType'
  >;
}
```

### Pre-built Templates for MVP

#### Template 1: Zohran Classic

```typescript
const zohranClassic: MemeTemplate = {
  id: 'zohran-classic',
  name: 'Zohran Classic',
  description: 'The OG politician greeting card energy',
  thumbnail: 'zohran-thumb.jpg',
  duration: 10,
  fps: 30,
  width: 1080,
  height: 1920,

  layers: {
    background: {
      type: 'video',
      source: 'mountain-road-psychedelic.mp4',
      animation: 'slow-zoom',
    },
    hueOverlay: {
      enabled: true,
      defaultColor: '#FFD700',  // Gold
      allowedColors: ['#FFD700', '#FF69B4', '#00C853', '#2196F3'],
      opacity: 0.3,
      animation: 'pulse',
    },
    decorativeElements: [
      {
        type: 'lottie',
        source: 'rose-heart-pumping.json',
        position: { x: 50, y: 30 },
        scale: 1.2,
        enterAtFrame: 0,
        animation: 'loop',
      },
      {
        type: 'lottie',
        source: 'floating-petals.json',
        position: { x: 50, y: 50 },
        scale: 1.0,
        enterAtFrame: 0,
        animation: 'loop',
      },
    ],
    headSlot: {
      position: { x: 50, y: 45 },
      scale: 0.4,
      enterAtFrame: 15,
      animation: 'zoom-pulse',
      animationConfig: { pulseSpeed: 0.8 },
      flowerReveal: {
        enabled: true,
        type: 'rose',
      },
    },
    textSlots: [
      {
        id: 'main',
        defaultText: 'Eid Mubarak!',
        editable: true,
        position: { x: 50, y: 75 },
        style: {
          fontFamily: 'Psychedelic',
          fontSize: 64,
          color: '#FFFFFF',
          stroke: '#000000',
        },
        animation: 'rise-up',
        enterAtFrame: 45,
      },
      {
        id: 'secondary',
        defaultText: '',
        editable: true,
        position: { x: 50, y: 85 },
        style: {
          fontFamily: 'Clean',
          fontSize: 32,
          color: '#FFFFFF',
        },
        animation: 'fade-in',
        enterAtFrame: 60,
      },
    ],
  },

  audio: {
    defaultTrack: 'nasheed-1',
    volume: 0.8,
  },

  configurableSlots: [
    'hueColor', 'headImage', 'textContent', 'fontStyle', 'sound', 'flowerType',
  ],
};
```

#### Template 2: 6-Head Spiral

```typescript
const sixHeadSpiral: MemeTemplate = {
  id: 'six-head-spiral',
  name: 'Head Spiral',
  description: '6 heads spiraling around - maximum chaos energy',
  thumbnail: 'spiral-thumb.jpg',
  duration: 10,
  fps: 30,
  width: 1080,
  height: 1920,

  layers: {
    background: {
      type: 'video',
      source: 'desert-highway-golden.mp4',
      animation: 'pan-left',
    },
    hueOverlay: {
      enabled: true,
      defaultColor: '#FF69B4',  // Pink
      allowedColors: ['#FFD700', '#FF69B4', '#00C853', '#9C27B0'],
      opacity: 0.25,
      animation: 'pulse',
    },
    decorativeElements: [
      {
        type: 'lottie',
        source: 'sparkle-overlay.json',
        position: { x: 50, y: 50 },
        scale: 1.5,
        enterAtFrame: 0,
        animation: 'loop',
      },
    ],
    headSlot: {
      position: { x: 50, y: 50 },
      scale: 0.25,
      enterAtFrame: 10,
      animation: 'spiral-multiply',
      animationConfig: {
        spiralCount: 6,
        // 6 copies of the head arranged in a circle, rotating
      },
    },
    textSlots: [
      {
        id: 'main',
        defaultText: 'Eid Mubarak!',
        editable: true,
        position: { x: 50, y: 80 },
        style: {
          fontFamily: 'Bollywood',
          fontSize: 56,
          color: '#FFD700',
          stroke: '#000000',
          shadow: true,
        },
        animation: 'typewriter',
        enterAtFrame: 30,
      },
    ],
  },

  audio: {
    defaultTrack: 'nasheed-1',
    volume: 0.8,
  },

  configurableSlots: [
    'hueColor', 'headImage', 'textContent', 'fontStyle', 'sound',
  ],
};
```

#### Template 3: Drake Celebrity

```typescript
const drakeCelebrity: MemeTemplate = {
  id: 'drake-celebrity',
  name: 'Celebrity Greeting',
  description: 'Use Drake, SRK, or Aunty Stock as your meme face',
  thumbnail: 'drake-thumb.jpg',
  duration: 10,
  fps: 30,
  width: 1080,
  height: 1920,

  layers: {
    background: {
      type: 'solid',
      source: '#1a1a2e',
      animation: 'static',
    },
    hueOverlay: {
      enabled: true,
      defaultColor: '#FFD700',
      allowedColors: ['#FFD700', '#FF69B4', '#00C853', '#2196F3'],
      opacity: 0.15,
      animation: 'pulse',
    },
    decorativeElements: [
      {
        type: 'lottie',
        source: 'gold-particles.json',
        position: { x: 50, y: 50 },
        scale: 1.0,
        enterAtFrame: 0,
        animation: 'loop',
      },
      {
        type: 'lottie',
        source: 'crescent-moon.json',
        position: { x: 75, y: 15 },
        scale: 0.5,
        enterAtFrame: 0,
        animation: 'float',
      },
    ],
    headSlot: {
      position: { x: 50, y: 45 },
      scale: 0.5,
      enterAtFrame: 5,
      animation: 'pop',
      animationConfig: { popDamping: 8 },
      // NOTE: This template defaults to celebrity heads (Drake, SRK, Aunty Stock)
      // but user can still upload their own photo
    },
    textSlots: [
      {
        id: 'main',
        defaultText: 'Eid Mubarak!',
        editable: true,
        position: { x: 50, y: 75 },
        style: {
          fontFamily: 'Clean',
          fontSize: 64,
          color: '#FFFFFF',
          shadow: true,
        },
        animation: 'fade-in',
        enterAtFrame: 30,
      },
      {
        id: 'secondary',
        defaultText: '',
        editable: true,
        position: { x: 50, y: 85 },
        style: {
          fontFamily: 'Clean',
          fontSize: 28,
          color: '#CCCCCC',
        },
        animation: 'fade-in',
        enterAtFrame: 45,
      },
    ],
  },

  audio: {
    defaultTrack: 'nasheed-1',
    volume: 0.8,
  },

  configurableSlots: [
    'hueColor', 'headImage', 'textContent', 'fontStyle', 'sound',
  ],
};
```

### Celebrity Head Images

Pre-cropped transparent PNG heads bundled with the app:

| Celebrity | File | Why |
|-----------|------|-----|
| **Drake** | `drake-head.png` | Desi meme icon — "mashAllah" energy, Toronto connection |
| **Shah Rukh Khan** | `srk-head.png` | Bollywood king, Asoka trend, universal desi appeal |
| **Aunty Stock** | `aunty-stock-head.png` | Stock photo aunty — WhatsApp forward energy |

These are pre-extracted heads (transparent PNGs) that skip the remove.bg step entirely.

---

## 4. Face/Head Cropping Feature

### The Core Problem

Users want to:
1. Take a selfie or pick a photo
2. Have JUST THE HEAD extracted (no background)
3. Place that head into a template
4. (Optional) Add custom text

### Solution: remove.bg API

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
4. **Upload to AWS S3** and store S3 URL in Convex
5. **Use in template** as head layer

### Head Accessories — Deep Dive & Honest Assessment

The original plan proposed CSS-positioned PNG overlays for accessories (hijab, crown, sunglasses). After discussion, here are the real challenges:

```
┌─────────────────────────────────────────────────────────────────┐
│            HEAD ACCESSORIES: APPROACH OPTIONS                    │
│                                                                 │
│  OPTION A: CSS Overlay (Original Plan)                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  How: Position PNG accessory relative to head bounding   │   │
│  │       box using CSS transforms in Remotion               │   │
│  │                                                          │   │
│  │  Pros:                                                   │   │
│  │  • Simple to implement                                   │   │
│  │  • Works for items ABOVE head (crown, hat, halo)         │   │
│  │  • No AI needed                                          │   │
│  │                                                          │   │
│  │  Cons:                                                   │   │
│  │  • Hijab WRAPS AROUND the head — can't just overlay      │   │
│  │  • Different head shapes/sizes = different fit            │   │
│  │  • Looks obviously fake/pasted on                        │   │
│  │  • No depth — accessory always on top                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  OPTION B: Pre-Composed Celebrity Images (Recommended for MVP) │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  How: Use existing meme images where the celebrity       │   │
│  │       already has the accessory (e.g., Drake-in-hijab    │   │
│  │       meme that already exists as a single image)        │   │
│  │                                                          │   │
│  │  Pros:                                                   │   │
│  │  • Looks natural — it's a real/edited photo              │   │
│  │  • No positioning logic needed                           │   │
│  │  • The Drake hijab meme already exists as one image      │   │
│  │                                                          │   │
│  │  Cons:                                                   │   │
│  │  • Only works for celebrity pre-made options              │   │
│  │  • Can't add hijab to USER'S photo without AI            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  OPTION C: AI Generation (Out of scope for MVP)                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  How: Use AI inpainting to add accessories to any photo  │   │
│  │  Status: DEFERRED — too complex, too expensive for MVP   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**MVP Decision:**
- **Celebrity heads**: Use pre-composed images (Drake-in-hijab, SRK, Aunty Stock as single PNGs)
- **User photos**: NO accessories for now on user-uploaded photos. Just the clean head cutout.
- **Simple overlays**: Crown and sunglasses CAN work as CSS overlays (they sit on top, don't wrap). Keep these as stretch goals.
- **Hijab on user photos**: Deferred to post-MVP. Needs AI or manual editing to look good.

**Testing needed**: Try CSS overlay for crown/sunglasses on a few test photos. If it looks decent at 1080p in Remotion output, we can include those. Hijab is definitely out for user photos.

---

## 5. Tech Stack

### MVP Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                    MVP TECH STACK                               │
│                                                                 │
│  FRONTEND (Expo / React Native)                                 │
│  ├── expo-image-picker     → Photo selection                    │
│  ├── expo-av               → Audio preview                      │
│  ├── expo-router           → Navigation                         │
│  ├── nativewind            → Tailwind styling                   │
│  └── react-native-skia     → Canvas preview (optional)          │
│                                                                 │
│  BACKEND (Convex + AWS)                                         │
│  ├── Convex DB             → Metadata, template configs,        │
│  │                            render queue, project state        │
│  ├── AWS S3                → Blob storage (photos, videos,      │
│  │                            assets, rendered outputs)          │
│  └── Convex actions        → Orchestrate remove.bg + Lambda     │
│                                                                 │
│  HEAD EXTRACTION                                                │
│  └── remove.bg API         → Background removal                 │
│                                                                 │
│  VIDEO RENDERING                                                │
│  └── Remotion Lambda (AWS) → React compositions → MP4           │
│      ├── @remotion/lambda   → Serverless render                 │
│      └── @remotion/lottie   → Flower animations, effects        │
│                                                                 │
│  STORAGE ARCHITECTURE                                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  AWS S3 Bucket: eid-meme-maker-assets                   │   │
│  │  ├── /user-photos/{userId}/{photoId}.png                │   │
│  │  ├── /rendered-videos/{renderId}.mp4                    │   │
│  │  ├── /templates/backgrounds/                            │   │
│  │  ├── /templates/lottie/                                 │   │
│  │  └── /templates/celebrity-heads/                        │   │
│  │                                                         │   │
│  │  Convex DB stores:                                      │   │
│  │  ├── S3 URLs for each asset                             │   │
│  │  ├── Project metadata + composition config              │   │
│  │  ├── Render job status + progress                       │   │
│  │  └── Template definitions                               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  NO AI GENERATION FOR MVP                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Why This Stack?

| Choice | Reasoning |
|--------|-----------|
| **Expo / React Native** | Mobile-first, cross-platform, web later |
| **Convex** | Real-time sync, serverless functions, easy DX |
| **AWS S3** | Blob storage — never store blobs in DB. S3 URLs in Convex. |
| **Remotion Lambda** | Pay-per-render serverless video — no idle server costs |
| **remove.bg** | Best quality background removal, simple API |
| **TypeScript** | Type safety across frontend + backend |

---

## 6. Infrastructure: AWS S3 + Remotion Lambda

### AWS S3 Blob Storage

All binary files (images, videos, Lottie JSON, audio) live in S3. Convex only stores the S3 URL/key.

```
┌─────────────────────────────────────────────────────────────────┐
│                  STORAGE FLOW                                    │
│                                                                 │
│  User uploads photo:                                             │
│  1. App → Convex action (presigned S3 upload URL)               │
│  2. App uploads directly to S3                                   │
│  3. Convex stores: { photoS3Key: "user-photos/abc/123.png",    │
│                       photoUrl: "https://s3...amazonaws..." }   │
│                                                                 │
│  Rendered video:                                                 │
│  1. Remotion Lambda renders MP4 → stores in S3 bucket           │
│  2. Lambda returns S3 URL                                        │
│  3. Convex stores: { outputUrl: "https://s3.../render-456.mp4",│
│                       status: "completed" }                     │
│                                                                 │
│  DB never touches the actual bytes — only URLs/keys.            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Remotion Lambda Setup

We need to deploy the Remotion Lambda service ourselves. This is a one-time setup:

```bash
# 1. Install Remotion Lambda CLI
npm install @remotion/lambda

# 2. Configure AWS credentials
# Need: IAM user with Lambda + S3 + CloudWatch permissions
# Remotion docs provide the exact IAM policy

# 3. Deploy the Lambda function
npx remotion lambda functions deploy

# 4. Deploy your Remotion compositions (site bundle)
npx remotion lambda sites create packages/remotion/src/index.ts \
  --site-name eid-meme-maker

# 5. Test a render
npx remotion lambda render \
  --function-name remotion-render-xxxxx \
  --serve-url https://eid-meme-maker.s3.amazonaws.com/sites/... \
  EidMemeVideo \
  --props='{"template":"zohran-classic"}'
```

**Cost**: ~$0.01-0.05 per 10-20 second video render. Pay only when rendering.

### Render Queue

```
┌─────────────────────────────────────────────────────────────────┐
│                    RENDER QUEUE FLOW                            │
│                                                                 │
│   1. USER REQUESTS VIDEO                                        │
│      └── "I want to export my meme!"                           │
│                                                                 │
│   2. JOB ADDED TO QUEUE (Convex mutation)                       │
│      └── Create record: { status: "pending" }                  │
│      └── User sees: "Your video is being prepared..."          │
│                                                                 │
│   3. CONVEX ACTION TRIGGERS LAMBDA                              │
│      └── renderMediaOnLambda() called                           │
│      └── Update status: { status: "rendering", progress: 45% } │
│      └── User sees: "Rendering... 45%"                         │
│                                                                 │
│   4. RENDER COMPLETES                                           │
│      └── MP4 stored in S3 by Lambda                            │
│      └── S3 URL saved to Convex                                │
│      └── Update status: { status: "completed", url: "..." }   │
│      └── User sees: "Done! Download or Share"                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Why a queue?**
- Video rendering takes 10-60 seconds (can't block the UI)
- Multiple users might request renders simultaneously
- We need to track progress and handle failures
- Convex gives us real-time updates so users see progress live

---

## 7. Curated Sound Categories

For initial working copy: **one default nasheed track** bundled in the app.

After first working copy, expand to a curated library:

| Category | Examples | Source |
|----------|----------|--------|
| **Nasheeds** | Tala'al Badru, Maher Zain clips, Sami Yusuf | Royalty-free/licensed |
| **Bollywood** | Chaiyya Chaiyya (snippet), Jai Ho, Tunak Tunak | Licensed clips or covers |
| **Voiceovers** | "Eid Mubarak beta!", "Khana khao!", "MashAllah!" | Record ourselves / community |
| **SFX** | Sparkle sounds, pop, whoosh, bling | Free sound libraries |

Sound data model:

```typescript
// convex/schema.ts (sounds table)
sounds: defineTable({
  name: v.string(),
  category: v.union(
    v.literal("nasheed"),
    v.literal("bollywood"),
    v.literal("voiceover"),
    v.literal("sfx"),
  ),
  duration: v.number(),       // seconds
  s3Key: v.string(),          // S3 object key
  s3Url: v.string(),          // full S3 URL
  attribution: v.optional(v.string()),
  tags: v.array(v.string()),
}).index("by_category", ["category"])
```

See [general-assets.md](./general-assets.md) for full sourcing details.

---

## 8. Video Assembly (Remotion)

### Composition Structure

```typescript
// packages/remotion/src/EidMemeVideo.tsx
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
import { Lottie } from "@remotion/lottie";

interface EidMemeProps {
  templateId: string;
  headImageUrl: string;           // S3 URL of user's cropped head
  hueColor: string;               // hex color picked by user
  textLine1: string;
  textLine2?: string;
  fontStyle: 'psychedelic' | 'classic' | 'bollywood' | 'clean';
  soundUrl: string;               // S3 URL of audio track
  // All other config comes from the template definition
}

export const EidMemeVideo: React.FC<EidMemeProps> = (props) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Load template definition
  const template = getTemplate(props.templateId);

  return (
    <AbsoluteFill style={{ backgroundColor: "#1a1a2e" }}>
      {/* Layer 1: Background */}
      <BackgroundLayer
        source={template.layers.background.source}
        animation={template.layers.background.animation}
        frame={frame}
        fps={fps}
      />

      {/* Layer 2: Hue Overlay */}
      {template.layers.hueOverlay.enabled && (
        <HueOverlay
          color={props.hueColor}
          opacity={template.layers.hueOverlay.opacity}
          animation={template.layers.hueOverlay.animation}
          frame={frame}
        />
      )}

      {/* Layer 3: Decorative Elements */}
      {template.layers.decorativeElements.map((element, i) => (
        <Sequence from={element.enterAtFrame} key={i}>
          {element.type === 'lottie' ? (
            <Lottie
              animationData={loadLottie(element.source)}
              style={{
                position: "absolute",
                left: `${element.position.x}%`,
                top: `${element.position.y}%`,
                transform: `translate(-50%, -50%) scale(${element.scale})`,
              }}
            />
          ) : (
            <Img src={element.source} />
          )}
        </Sequence>
      ))}

      {/* Layer 4: Head Slot */}
      <Sequence from={template.layers.headSlot.enterAtFrame}>
        {template.layers.headSlot.flowerReveal?.enabled && (
          <FlowerReveal
            type={template.layers.headSlot.flowerReveal.type}
            frame={frame}
          />
        )}
        <HeadAnimation
          src={props.headImageUrl}
          animation={template.layers.headSlot.animation}
          config={template.layers.headSlot.animationConfig}
          position={template.layers.headSlot.position}
          scale={template.layers.headSlot.scale}
          frame={frame}
          fps={fps}
        />
      </Sequence>

      {/* Layer 5: Text Overlays */}
      {template.layers.textSlots.map((slot) => (
        <Sequence from={slot.enterAtFrame} key={slot.id}>
          <AnimatedText
            text={slot.id === 'main' ? props.textLine1 : (props.textLine2 || slot.defaultText)}
            style={{
              ...slot.style,
              fontFamily: props.fontStyle === 'psychedelic' ? 'Groovy' :
                          props.fontStyle === 'bollywood' ? 'Bollywood' :
                          props.fontStyle === 'classic' ? 'Amiri' : 'Inter',
            }}
            position={slot.position}
            animation={slot.animation}
            frame={frame}
            fps={fps}
          />
        </Sequence>
      ))}

      {/* Layer 6: Audio */}
      <Audio src={props.soundUrl} volume={template.audio.volume} />
    </AbsoluteFill>
  );
};
```

### Animation Implementations

```typescript
// HeadAnimation component — handles all head animation types

const HeadAnimation: React.FC<{
  src: string;
  animation: string;
  config: any;
  position: { x: number; y: number };
  scale: number;
  frame: number;
  fps: number;
}> = ({ src, animation, config, position, scale, frame, fps }) => {

  if (animation === 'pop') {
    const popScale = spring({
      frame,
      fps,
      config: { damping: config?.popDamping || 10, stiffness: 200, mass: 0.5 },
    });
    return (
      <Img
        src={src}
        style={{
          position: 'absolute',
          left: `${position.x}%`,
          top: `${position.y}%`,
          transform: `translate(-50%, -50%) scale(${popScale * scale})`,
        }}
      />
    );
  }

  if (animation === 'zoom-pulse') {
    const baseScale = spring({ frame, fps, config: { damping: 12, stiffness: 100 } });
    const pulse = Math.sin(frame * (config?.pulseSpeed || 0.1)) * 0.05;
    const glow = interpolate(Math.sin(frame * 0.15), [-1, 1], [0, 15]);
    return (
      <Img
        src={src}
        style={{
          position: 'absolute',
          left: `${position.x}%`,
          top: `${position.y}%`,
          transform: `translate(-50%, -50%) scale(${(baseScale + pulse) * scale})`,
          filter: `drop-shadow(0 0 ${glow}px gold)`,
        }}
      />
    );
  }

  if (animation === 'spiral-multiply') {
    const count = config?.spiralCount || 6;
    const angleStep = (2 * Math.PI) / count;
    const radius = 200;
    const rotation = frame * 2; // degrees per frame

    return (
      <>
        {Array.from({ length: count }).map((_, i) => {
          const angle = angleStep * i + (rotation * Math.PI) / 180;
          const x = position.x + Math.cos(angle) * (radius / 10);
          const y = position.y + Math.sin(angle) * (radius / 10);
          const entryScale = spring({
            frame: frame - i * 3,
            fps,
            config: { damping: 10, stiffness: 150 },
          });
          return (
            <Img
              key={i}
              src={src}
              style={{
                position: 'absolute',
                left: `${x}%`,
                top: `${y}%`,
                transform: `translate(-50%, -50%) scale(${Math.max(0, entryScale) * scale})`,
              }}
            />
          );
        })}
      </>
    );
  }

  if (animation === 'float') {
    const floatY = Math.sin(frame * 0.08) * 15;
    const floatRotation = Math.sin(frame * 0.05) * 3;
    return (
      <Img
        src={src}
        style={{
          position: 'absolute',
          left: `${position.x}%`,
          top: `${position.y}%`,
          transform: `translate(-50%, -50%) scale(${scale}) translateY(${floatY}px) rotate(${floatRotation}deg)`,
        }}
      />
    );
  }

  return null;
};
```

### Rendering Pipeline (Convex → Lambda)

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
      progress: 0,
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

// convex/render.ts (action — calls Remotion Lambda)
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

    // Call Remotion Lambda
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

      if (progress.overallProgress) {
        await ctx.runMutation(internal.render.updateProgress, {
          renderId,
          progress: Math.round(progress.overallProgress * 100),
        });
      }

      if (progress.done) {
        // Video is now in S3 (Remotion Lambda puts it there)
        await ctx.runMutation(internal.render.complete, {
          renderId,
          outputUrl: progress.outputFile, // S3 URL
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

## 9. Data Models (Convex Schema)

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Projects (user's video cards — no auth for MVP, anonymous)
  projects: defineTable({
    name: v.string(),
    templateId: v.string(),
    composition: v.object({
      headImageS3Url: v.string(),        // S3 URL of cropped head
      headSource: v.union(
        v.literal("user_photo"),
        v.literal("celebrity_drake"),
        v.literal("celebrity_srk"),
        v.literal("celebrity_aunty"),
      ),
      hueColor: v.string(),              // hex color
      textLine1: v.string(),
      textLine2: v.optional(v.string()),
      fontStyle: v.string(),
      soundId: v.optional(v.string()),    // reference to sounds table
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  // Render jobs
  renders: defineTable({
    projectId: v.id("projects"),
    status: v.union(
      v.literal("pending"),
      v.literal("rendering"),
      v.literal("completed"),
      v.literal("failed"),
    ),
    outputS3Url: v.optional(v.string()),  // S3 URL of rendered MP4
    error: v.optional(v.string()),
    progress: v.number(),                  // 0-100
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
      v.literal("sfx"),
    ),
    duration: v.number(),
    s3Key: v.string(),
    s3Url: v.string(),
    attribution: v.optional(v.string()),
    tags: v.array(v.string()),
  }).index("by_category", ["category"]),

  // Asset library (backgrounds, lottie files, celebrity heads)
  assets: defineTable({
    name: v.string(),
    type: v.union(
      v.literal("background"),
      v.literal("lottie"),
      v.literal("celebrity_head"),
      v.literal("font"),
    ),
    s3Key: v.string(),
    s3Url: v.string(),
    tags: v.array(v.string()),
  }).index("by_type", ["type"]),
});
```

**Key design choice**: No `users` table for MVP. Anonymous usage — no accounts needed. We can add auth later.

---

## 10. User Flow (3 Steps)

```
┌─────────────────────────────────────────────────────────────────┐
│                     MVP USER FLOW                               │
│                     (3 Steps)                                   │
└─────────────────────────────────────────────────────────────────┘

STEP 1: PICK TEMPLATE + ADD HEAD
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   Pick a vibe:                                                  │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐                       │
│   │ Zohran   │ │ 6-Head   │ │ Celebrity│                       │
│   │ Classic  │ │ Spiral   │ │ Greeting │                       │
│   └──────────┘ └──────────┘ └──────────┘                       │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │                                                         │  │
│   │              TAP TO ADD YOUR HEAD                       │  │
│   │                                                         │  │
│   │         (We'll magically remove the background)         │  │
│   │                                                         │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│   [Use Celebrity Instead]  (Drake, SRK, Aunty Stock)           │
│                                                                 │
│                              [ NEXT ]                           │
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
│   [Hue: Gold] [Flower: Rose] [Font: Psychedelic]               │
│                                                                 │
│                    [ BACK ]  [ NEXT ]                           │
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
│   ┌─────────────────────────────────────────────────────────┐  │
│   │  [ Share to WhatsApp ]                                  │  │
│   │  [ Share to Instagram ]                                 │  │
│   │  [ Save to Camera Roll ]                                │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│   Rendering... ████████████░░░░ 75%                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 11. What's IN vs OUT of MVP

### IN (Must Have)

| Feature | Why |
|---------|-----|
| 3 pre-built templates (Zohran Classic, 6-Head Spiral, Celebrity Greeting) | Core product |
| Head extraction via remove.bg | Core feature |
| Celebrity head options (Drake, SRK, Aunty Stock) | Meme appeal |
| 2 editable text slots per template | Custom text (PR comment #3) |
| 4 hue overlay color options | Quick customization |
| 3 decorative element options | Template variety |
| 1 default sound (expand after working copy) | Audio essential |
| 4 font styles | Text personalization |
| Export to MP4 | Primary output |
| Share to WhatsApp/Instagram/Save | Distribution |
| AWS S3 blob storage | Proper architecture (PR comment #5) |
| Remotion Lambda rendering | Serverless, pay-per-use (PR comment #4) |
| Render queue with progress | UX requirement |

### OUT (Later)

| Feature | Why Defer |
|---------|-----------|
| AI image generation | Cost, complexity, not needed for MVP |
| Custom template builder | Predefined only for MVP |
| Head accessories on user photos | Hijab wrapping doesn't work with CSS overlay |
| User accounts / auth | Anonymous for MVP, test at iftar |
| GIF export | MP4 first |
| Sound upload | Moderation concerns |
| Web version | Mobile first, web later |
| Monetization / premium tiers | Get working copy first |
| Community / social features | Testing at party, not needed |
| RTL / Arabic text | Not in initial scope |
| Eid al-Adha support | Ramadan / Eid al-Fitr only |
| Multiple sound options | Single default first, expand after |

---

## 12. Asset Checklist

### Backgrounds Needed (3)
- [ ] Mountain road (psychedelic color graded) — for Zohran Classic
- [ ] Desert highway (golden hour) — for 6-Head Spiral
- [ ] Solid dark gradient — for Celebrity Greeting

### Lottie Animations Needed (6)
- [ ] Rose heart pumping
- [ ] Rose bloom (reveals head)
- [ ] Sunflower bloom (reveals head)
- [ ] Sparkle overlay
- [ ] Floating petals
- [ ] Gold particles + crescent moon

### Celebrity Head PNGs Needed (3)
- [ ] Drake head (transparent PNG, pre-cropped)
- [ ] Shah Rukh Khan head (transparent PNG, pre-cropped)
- [ ] Aunty Stock head (transparent PNG, pre-cropped)

### Sounds Needed (1 for initial, 5 target)
- [ ] Default nasheed (upbeat, 15-20 seconds)
- [ ] (After working copy) Nasheed 2 (peaceful)
- [ ] (After working copy) Bollywood clip
- [ ] (After working copy) Funny voiceover
- [ ] (After working copy) Dramatic sting

### Fonts Needed (4)
- [ ] Psychedelic/groovy font (free/open source)
- [ ] Classic Arabic-friendly font (e.g., Amiri)
- [ ] Bollywood style font
- [ ] Clean sans-serif (e.g., Inter)

---

## 13. Project Structure

```
eid-meme-maker/
├── apps/
│   └── mobile/                    # Expo app
│       ├── app/                   # Expo Router screens
│       │   ├── (tabs)/
│       │   │   └── index.tsx      # Home / template picker
│       │   ├── create/
│       │   │   ├── step1.tsx      # Pick template + add head
│       │   │   ├── step2.tsx      # Customize (text, hue, font)
│       │   │   └── step3.tsx      # Export & share
│       │   └── _layout.tsx
│       ├── components/
│       │   ├── ui/                # Buttons, cards, etc.
│       │   ├── templates/         # Template preview cards
│       │   ├── head-picker/       # Photo upload + celebrity select
│       │   └── customize/         # Hue, font, text controls
│       ├── hooks/
│       │   ├── useProject.ts      # Project state management
│       │   ├── useRemoveBg.ts     # Background removal
│       │   └── useRender.ts       # Render queue polling
│       ├── lib/
│       │   ├── convex.ts          # Convex client
│       │   ├── s3.ts              # S3 upload helpers
│       │   └── templates.ts       # Template definitions
│       └── assets/
│           ├── sounds/            # Bundled default sound
│           ├── fonts/             # Bundled font files
│           └── images/            # Celebrity heads, thumbnails
│
├── packages/
│   └── remotion/                  # Remotion compositions
│       ├── src/
│       │   ├── EidMemeVideo.tsx   # Main composition
│       │   ├── components/
│       │   │   ├── BackgroundLayer.tsx
│       │   │   ├── HueOverlay.tsx
│       │   │   ├── HeadAnimation.tsx
│       │   │   ├── FlowerReveal.tsx
│       │   │   ├── AnimatedText.tsx
│       │   │   └── DecorativeElement.tsx
│       │   ├── templates/
│       │   │   ├── zohran-classic.ts
│       │   │   ├── six-head-spiral.ts
│       │   │   └── drake-celebrity.ts
│       │   └── Root.tsx
│       └── remotion.config.ts
│
├── convex/                        # Convex backend
│   ├── schema.ts                  # Data models
│   ├── projects.ts                # Project CRUD
│   ├── renders.ts                 # Render queue + Lambda trigger
│   ├── sounds.ts                  # Sound library queries
│   ├── assets.ts                  # Asset queries
│   └── _generated/
│
├── package.json
├── turbo.json                     # Monorepo config
└── docs/
    ├── init-plan.md               # This file
    ├── full-vision.md             # Future features reference
    ├── meme-culture-research.md   # Desi meme culture research
    └── general-assets.md          # Sound & asset sourcing
```

---

## 14. Development Phases

### Phase 1: Foundation (3-4 days)
- [ ] Set up Expo project with TypeScript + Expo Router
- [ ] Set up Convex backend with schema
- [ ] Set up AWS S3 bucket
- [ ] Implement image picker (expo-image-picker)
- [ ] Integrate remove.bg API for background removal
- [ ] S3 upload flow for user photos

### Phase 2: Template Engine (4-5 days)
- [ ] Set up Remotion project in packages/remotion
- [ ] Create base EidMemeVideo composition
- [ ] Implement layer system (Background, HueOverlay, HeadAnimation, AnimatedText)
- [ ] Build Zohran Classic template with all animations
- [ ] Test head placement and animation with sample images

### Phase 3: Customization UI (3-4 days)
- [ ] Build 3-step wizard navigation
- [ ] Template selection screen with previews
- [ ] Customization screen (text input, hue picker, font picker)
- [ ] Celebrity head selection (Drake, SRK, Aunty Stock)
- [ ] Live preview component

### Phase 4: Rendering & Export (3-4 days)
- [ ] Deploy Remotion Lambda to AWS
- [ ] Build render queue in Convex
- [ ] Implement MP4 export flow
- [ ] Add share functionality (WhatsApp, Instagram, save to camera roll)
- [ ] Progress indicators during rendering

### Phase 5: Polish (2-3 days)
- [ ] Add remaining 2 templates (6-Head Spiral, Celebrity Greeting)
- [ ] Add default sound track
- [ ] Error handling + loading states
- [ ] Test on real devices
- [ ] Beta testing with friends at iftar

**Total: ~15-20 days for working prototype**

**Note (PR comment #6):** Between two developers, we can parallelize — one on frontend (Phases 1+3), one on Remotion + Lambda (Phases 2+4). Discuss task split.

---

## 15. Decisions Log

Previously open questions, now resolved:

| Question | Decision |
|----------|----------|
| Support Eid al-Adha? | **No.** Ramadan & Eid al-Fitr only for MVP. |
| Arabic text / RTL? | **No.** English only for MVP. |
| Community section? | **No.** Testing at iftar party — no social features needed. |
| Web version priority? | **Mobile first.** React Native via Expo. Web can come later for free via Expo Web. |
| Monetization? | **Not for MVP.** Focus on working copy. Consider after iftar test. |
| Head accessories on user photos? | **Deferred.** CSS overlay doesn't work for hijab. Celebrity pre-composed images only. Test crown/sunglasses as stretch goal. |
| Custom template builder? | **No.** Predefined templates with swappable element slots only. |
| Multiple sounds? | **Single default for first working copy.** Expand to curated library after. |
| CapCut-style templates? | **Yes, similar concept.** Fixed choreography, user swaps elements. We're building our own Remotion-based version, not reusing CapCut directly. |
