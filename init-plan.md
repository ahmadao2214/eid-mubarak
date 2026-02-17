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

### The Core Concept: Custom Builder with Presets

Users build their own video card by selecting options across every layer. They have full control over what goes into their card. **Presets** (like "Zohran Classic" or "Celebrity Greeting") exist as one-tap starting points that pre-fill all the options — but users can change anything after loading a preset.

Think of it like a character creator in a video game: you can pick a preset face and then tweak everything, or start from defaults and build your own.

```
┌─────────────────────────────────────────────────────────────────┐
│              HOW THE BUILDER WORKS                               │
│                                                                 │
│   BUILDER = Full customization of every layer                   │
│   PRESETS = Pre-filled starting points (optional shortcut)      │
│                                                                 │
│   What the USER controls (everything):                          │
│   ├── Background (video loop, trucker art, solid color)         │
│   ├── Head image (their photo or a celebrity/meme face)         │
│   ├── Head animation style (pop, zoom-pulse, spiral, float)    │
│   ├── Hue overlay color (gold, pink, green, blue, none)        │
│   ├── Decorative elements (roses, kites, trucker art, etc.)    │
│   ├── Text content (2 lines — custom or pick from sayings)     │
│   ├── Font style (psychedelic, classic, bollywood, clean,      │
│   │               trucker art)                                  │
│   └── Sound track (deferred — default only for MVP)            │
│                                                                 │
│   PRESETS just pre-fill these options as a starting point:      │
│   ┌───────────────────────────────────────────────┐             │
│   │ "Zohran Classic" preset pre-fills:            │             │
│   │  BG=mountain road, Hue=gold, Head=zoom-pulse, │             │
│   │  Decor=rose heart, Font=psychedelic,           │             │
│   │  Text="Eid Mubarak!"                          │             │
│   │                                                │             │
│   │ User can then change ANY of these.            │             │
│   │ Or start from scratch with no preset.         │             │
│   └───────────────────────────────────────────────┘             │
│                                                                 │
│   PRESETS AVAILABLE:                                             │
│   ├── Zohran Classic (politician greeting card energy)          │
│   ├── Trucker Art (jingle truck + truck sayings energy)         │
│   ├── Celebrity Greeting (Drake, SRK, Onija, etc.)             │
│   ├── 6-Head Spiral (maximum chaos energy)                      │
│   └── Custom (blank — user picks everything)                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Element Options

Every option is available to every user regardless of preset. Presets just pre-select a combination.

| Slot | Options Available | Default | Notes |
|------|-------------------|---------|-------|
| **Head Image** | User's photo (auto-cropped) OR celebrity/meme face | Required | remove.bg extracts head |
| **Celebrity/Meme Heads** | Drake, Shah Rukh Khan, Aunty Stock, Onija Robinson, Wow Grape Teacher (Sehar Kamran) | N/A | Pre-cropped transparent PNG heads bundled in app |
| **Hue Overlay** | Gold, Pink/Magenta, Green, Blue, Trucker Art Yellow, None | Gold | CSS filter overlay with animation |
| **Background** | Mountain road psychedelic, Desert highway, Solid dark gradient, Trucker art panel, Basant sky (kites) | Per preset | Video loops or stylized images |
| **Decorative Element** | Rose heart, Sunflower, Lotus, Crescent moon, Kites (Basant), Trucker art borders/chains, None | Per preset | Lottie animations or styled overlays |
| **Flower for Head Reveal** | Rose bloom, Sunflower open, Lotus open, None | Per preset | Lottie that "opens" to show head |
| **Head Animation** | Single pop, 6-head spiral, Zoom pulse, Float | Per preset | Remotion spring/interpolate |
| **Text Line 1** | Any custom text OR pick from preset sayings | "Eid Mubarak!" | User types or selects a trucker saying / quote |
| **Text Line 2** | Any custom text (optional) OR pick from preset sayings | "" | Secondary message |
| **Text Presets** | Trucker sayings, Onija Robinson quotes, Wow Grape quotes, Central Cee lyrics, Classic greetings | N/A | See "Text Preset Library" section below |
| **Font Style** | Psychedelic, Classic, Bollywood, Clean, Trucker Art (Nastaliq-style) | Per preset | Bundled font files |
| **Sound** | Default nasheed (single track for initial MVP) | Default nasheed | Sound is last priority — expand after MVP |

### How Elements Map to the Remotion Composition

```
┌─────────────────────────────────────────────────────────────────┐
│           ELEMENT → REMOTION LAYER MAPPING                      │
│                                                                 │
│  User builds their card (or starts from "Zohran Classic"        │
│  preset and customizes):                                        │
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
│  The choreography (timing, positions, transitions) is           │
│  determined by the combination of options the user picks.       │
│  Presets pre-fill these options but everything is changeable.   │
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

### Celebrity / Meme Head Images

Pre-cropped transparent PNG heads bundled with the app:

| Celebrity | File | Why |
|-----------|------|-----|
| **Drake** | `drake-head.png` | Desi meme icon — "mashAllah" energy, Toronto connection |
| **Shah Rukh Khan** | `srk-head.png` | Bollywood king, Asoka trend, universal desi appeal |
| **Aunty Stock** | `aunty-stock-head.png` | Stock photo aunty — WhatsApp forward energy |
| **Onija Robinson** | `onija-head.png` | Viral "Queen of Pakistan" — lime green hijab + red lipstick signature look. Went viral in early 2025 after traveling to Karachi. Known for dramatic demands and quotable one-liners. |
| **Wow Grape Teacher (Sehar Kamran)** | `wow-grape-head.png` | The iconic PISJ school principal from the viral "I sacrifice my life for Pakistan" video. Her "Wow, grape!" pronunciation of "great" became one of Pakistan's most beloved memes (63M+ views on TikTok). She later became a Pakistani senator. |
| **Central Cee** | `central-cee-head.png` | British rapper who took his Shahada in Feb 2026. Known for Islamic references in music ("Doja", "Daily Duppy"). Changed his name to Akil. Resonates with Muslim youth globally. |

These are pre-extracted heads (transparent PNGs) that skip the remove.bg step entirely.

---

### Text Preset Library

Users can type custom text OR pick from these preset sayings/quotes organized by category. These appear as tappable options in the text input area.

#### Pakistani Trucker Sayings (Truck Poetry)

Classic sayings painted on Pakistani trucks — witty, philosophical, and deeply cultural:

| Saying (Urdu Transliteration) | English Translation | Vibe |
|-------------------------------|---------------------|------|
| "Dekh magar pyaar se" | "Look, but with love" | Flirty classic |
| "Fasla rakhen warna pyar ho jaega" | "Keep your distance, or you'll fall in love" | Warning/flirty |
| "Buri nazar wale, tera moonh kala" | "Evil-eyed one, may your face be blackened" | Protective / evil eye |
| "Maa ki dua, jannat ki hawa" | "A mother's prayer is the breeze of paradise" | Wholesome |
| "Chalti hai gaari, urhti hai dhool / Jalte hain dushman, khelte hain phool" | "The truck moves, dust flies / Enemies burn, flowers play" | Swagger |
| "Jalne wale jalte raho" | "Let the jealous keep burning" | Savage |
| "Horn aahista bajaen, qoum sou rahi hai" | "Honk softly, the nation is sleeping" | Political satire |
| "Jiyo aur jeenay do" | "Live and let live" | Philosophical |
| "Maalik ki gaadi, driver ka paseena / Chalti hai road par ban kar haseena" | "Owner's vehicle, driver's sweat / She rides the road like a beauty queen" | Trucker humor |
| "Overtake mat karo, ghar mein maa intezaar karti hai" | "Don't overtake, your mother waits at home" | Road safety/wholesome |
| "Namaz parho is se pehlay tumhari namaz parhi jaye" | "Pray before prayers are said for you" | Deep/mortality |

#### Onija Robinson Quotes

Viral sound bites from the "Queen of Pakistan" (2025):

| Quote | Context |
|-------|---------|
| "Listen, you talk too much" | Said to Ramzan Chhipa who was trying to help her — instant meme |
| "I need my check" | One of her most viral one-liners |
| "My plan is to rebuild this entire country" | Her grand vision for Pakistan |
| "What's my plan? It's private." | Mysterious response to reporters |
| "I'm not talkin' unless y'all giving me land" | Classic demand |
| "Pakistan needs new buses!" | Infrastructure critique |
| "It's against my religion" | Catchall deflection |

#### Wow Grape / "I Sacrifice My Life for Pakistan" Quotes

From the viral PISJ school independence day celebration video:

| Quote | Who Said It |
|-------|------------|
| "I will sacrifice my own life for Pakistan" | Student (the most quoted line) |
| "Wow, grape!" | Sehar Kamran (meant to say "great") |
| "That's the spirit, grape!" | Sehar Kamran |
| "Strong army! Wow! Grape!" | Sehar Kamran (responding to army kid) |
| "When I grow up I will be a army and save Pakistan and destroy India" | Student |
| "I proud to be a Pakistani" | Student |

#### Central Cee Islamic Lyrics

References from the British rapper who took his Shahada in 2026:

| Lyric | Song | Notes |
|-------|------|-------|
| "The mandem celebrate Eid, the trap still runnin' on Christmas Day" | Doja (2022) | His breakout hit |
| "Why you saying wallahi for, you ain't been on your deen" | On the Radar Freestyle (2023) | With Drake — calling out fake faith |
| "We don't eat pork, it's haram" | Daily Duppy (2021) | Islamic dietary reference |
| "Inshallah" | Band4Band ft. Lil Baby (2024) | God willing |

#### Classic Eid Greetings (Default)

| Greeting | Vibe |
|----------|------|
| "Eid Mubarak!" | Standard |
| "Khair Mubarak!" | Response greeting |
| "Chand Raat Mubarak!" | Moon night |
| "Eid ka chand mera yaar" | "My friend is the Eid moon" |
| "MashAllah, kitna bada ho gaya!" | Aunty classic |
| "Beta, Eidi dena mat bhoolna" | "Don't forget to give Eidi money" |

---

---

### Pakistani Trucker Art Visual Theme

Pakistani truck art ("Phool Patti" / jingle trucks) is one of the most visually striking folk art traditions — perfect for a bold, colorful Eid card aesthetic.

**Visual elements we can extract for templates:**

```
┌─────────────────────────────────────────────────────────────────┐
│              TRUCKER ART ELEMENTS FOR TEMPLATES                  │
│                                                                 │
│  BORDERS & FRAMES:                                              │
│  ├── Floral garland borders (roses, marigolds)                 │
│  ├── Geometric tessellation frames                              │
│  ├── Chain-with-bell bottom borders (iconic jingle skirt)      │
│  └── Arch-topped panel frames (like truck side panels)         │
│                                                                 │
│  DECORATIVE MOTIFS:                                             │
│  ├── Peacock (most iconic bird motif)                          │
│  ├── Rose clusters and lotus flowers                           │
│  ├── Islamic calligraphy flourishes                            │
│  ├── Mirror mosaic patterns (Rawalpindi "disco" style)         │
│  └── Hearts and peepal leaf shapes                             │
│                                                                 │
│  BACKGROUNDS:                                                   │
│  ├── Mountain/landscape scene panels (driver nostalgia art)    │
│  ├── Embossed metal plate texture                              │
│  └── Mirror mosaic pattern (reflective, glittery)              │
│                                                                 │
│  COLOR PALETTE:                                                 │
│  ├── Vibrant red (#CC0000)                                     │
│  ├── Royal blue (#0033CC)                                      │
│  ├── Emerald green (#009933)                                   │
│  ├── Golden yellow (#FFD700)                                   │
│  ├── Orange (#FF6600)                                          │
│  └── Deep maroon (#660033) backgrounds                         │
│                                                                 │
│  TYPOGRAPHY:                                                    │
│  └── Urdu nastaliq calligraphy style with decorative           │
│      flourishes — great for trucker saying text overlays        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**How it maps to the builder:**
- **Background option**: Trucker art panel (stylized, colorful painted truck panel scene)
- **Decorative elements**: Trucker art borders, chain borders, peacock motif, floral garlands
- **Hue overlay color**: Trucker art palette options (deep red, royal blue, emerald green)
- **Font**: Nastaliq-style decorative font for text
- **Text presets**: Trucker sayings (see Text Preset Library above)

**Preset**: "Trucker Art" preset pre-fills these as a cohesive theme.

---

### Kite / Basant Decorative Elements

Basant (the Lahore kite flying festival) provides beautiful, vibrant decorative elements — recently revived in Pakistan in Feb 2026.

**Visual elements for templates:**

```
┌─────────────────────────────────────────────────────────────────┐
│              BASANT / KITE ELEMENTS FOR TEMPLATES                │
│                                                                 │
│  DECORATIVE ELEMENTS:                                           │
│  ├── Diamond-shaped kites (patang) scattered in frame          │
│  ├── Kite string (dor) lines as dividers or connecting         │
│  │   elements across the composition                            │
│  ├── Rooftop silhouette as a scene framing element             │
│  └── Marigold/flower garlands (Basant tradition)               │
│                                                                 │
│  BACKGROUNDS:                                                   │
│  ├── Bright blue sky filled with colorful kites                │
│  └── Mustard field gradient as bottom border                   │
│                                                                 │
│  COLOR PALETTE:                                                 │
│  ├── Mustard yellow (#DAA520) — signature Basant color         │
│  ├── Scarlet (#FF2400)                                         │
│  ├── Emerald (#50C878)                                         │
│  ├── Indigo (#4B0082)                                          │
│  └── Amber (#FFBF00)                                           │
│                                                                 │
│  ANIMATIONS:                                                    │
│  ├── Kites swaying/floating in wind (Lottie)                   │
│  ├── Kite string cutting effect (dramatic moment)              │
│  └── Kites rising into sky (reveals head in center)            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**How it maps to the builder:**
- **Background option**: Basant sky (bright blue with scattered kites)
- **Decorative elements**: Floating kites, kite string lines, marigold garlands
- **Hue overlay**: Mustard yellow, amber
- **Head reveal animation**: Kites part to reveal head in center (stretch goal)

These are decorative elements available in the builder — users can mix kite elements with any background or head option.

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
│                                                                 │
│   Key change: No rigid "pick a template" gate. Users get a     │
│   full custom builder. Presets are optional one-tap shortcuts   │
│   that pre-fill options — user can change anything after.       │
└─────────────────────────────────────────────────────────────────┘

STEP 1: START BUILDING + ADD HEAD
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   Quick start from a vibe (optional):                          │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│   │ Zohran   │ │ Trucker  │ │ Celebrity│ │ 6-Head   │         │
│   │ Classic  │ │ Art      │ │ Greeting │ │ Spiral   │         │
│   └──────────┘ └──────────┘ └──────────┘ └──────────┘         │
│   ┌──────────┐                                                  │
│   │ Custom   │  ← start blank, pick everything yourself        │
│   │ (blank)  │                                                  │
│   └──────────┘                                                  │
│                                                                 │
│   Tapping a preset pre-fills all options below.                │
│   Tapping "Custom" starts with defaults. Either way,           │
│   you can change everything in Step 2.                         │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │                                                         │  │
│   │              TAP TO ADD YOUR HEAD                       │  │
│   │                                                         │  │
│   │         (We'll magically remove the background)         │  │
│   │                                                         │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│   [Use a Meme Face Instead]                                    │
│   Drake | SRK | Aunty Stock | Onija Robinson |                 │
│   Wow Grape Teacher | Central Cee                              │
│                                                                 │
│                              [ NEXT ]                           │
└─────────────────────────────────────────────────────────────────┘

STEP 2: CUSTOMIZE (with LIVE PREVIEW)
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   ┌─────────────────────────────────────────┐                  │
│   │                                         │                  │
│   │         LIVE ANIMATED PREVIEW           │                  │
│   │    (lightweight — shows your card       │                  │
│   │     playing in real time as you         │                  │
│   │     change options below)               │                  │
│   │                                         │                  │
│   │    ⚡ This is NOT the final render.     │                  │
│   │    It's a fast in-app preview using     │                  │
│   │    Remotion Player so you can see       │                  │
│   │    exactly what your card will look     │                  │
│   │    like before committing to export.    │                  │
│   │                                         │                  │
│   └─────────────────────────────────────────┘                  │
│                                                                 │
│   TEXT LINE 1: [type or pick a preset ▼]                       │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │  Eid Mubarak!                                           │  │
│   └─────────────────────────────────────────────────────────┘  │
│   Preset sayings: Trucker | Onija | Wow Grape | Central Cee   │
│                                                                 │
│   TEXT LINE 2 (optional): [type or pick a preset ▼]            │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │  Dekh magar pyaar se                                    │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│   CUSTOMIZE:                                                    │
│   Background:  [Mountain Road ▼]                               │
│   Hue Color:   🟡 🩷 🟢 🔵 🟠                                   │
│   Decorative:  [Rose Heart ▼] [Kites ▼] [Trucker Border ▼]   │
│   Head Anim:   [Zoom Pulse ▼]                                 │
│   Font:        [Psychedelic ▼]                                 │
│                                                                 │
│                    [ BACK ]  [ EXPORT → ]                      │
└─────────────────────────────────────────────────────────────────┘

STEP 3: RENDER & SHARE
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   Your video is being rendered!                                │
│   ┌─────────────────────────────────────────┐                  │
│   │                                         │                  │
│   │      Rendering... ████████████░░░░ 75% │                  │
│   │                                         │                  │
│   │   (Remotion Lambda is creating your     │                  │
│   │    full quality MP4 video)              │                  │
│   │                                         │                  │
│   └─────────────────────────────────────────┘                  │
│                                                                 │
│   Once complete:                                                │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │  ▶ [Play Final Video]                                   │  │
│   │  [ Share to WhatsApp ]                                  │  │
│   │  [ Share to Instagram ]                                 │  │
│   │  [ Save to Camera Roll ]                                │  │
│   │  [ ← Go Back & Edit ]                                  │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Preview vs Render — How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│           PREVIEW vs RENDER PIPELINE                            │
│                                                                 │
│  STEP 2 - LIVE PREVIEW (instant, free, in-app):                │
│  ├── Uses Remotion Player component running locally             │
│  ├── Renders in real-time in the app as user customizes        │
│  ├── Lower resolution but shows exact timing, animations,      │
│  │   text placement, colors — what you see is what you get     │
│  ├── No server cost — runs on device                           │
│  ├── User can tweak options and see changes immediately        │
│  └── This IS the preview — no need to render first             │
│                                                                 │
│  STEP 3 - FULL RENDER (server-side, costs ~$0.01-0.05):       │
│  ├── Triggered only when user clicks "Export"                  │
│  ├── Remotion Lambda renders full 1080x1920 MP4                │
│  ├── Takes 10-60 seconds (progress bar shown)                  │
│  ├── Output is the final shareable video file                  │
│  └── User can go back to Step 2 and re-edit if needed         │
│                                                                 │
│  So YES — users see a full video preview BEFORE rendering.     │
│  The live preview in Step 2 shows them exactly what their      │
│  card will look like. They only trigger the expensive render   │
│  when they're happy with what they see.                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 11. What's IN vs OUT of MVP

### IN (Must Have)

| Feature | Why |
|---------|-----|
| Custom builder with preset starting points (Zohran, Trucker Art, Celebrity, 6-Head, Custom) | Core product — user controls everything, presets are shortcuts |
| Head extraction via remove.bg | Core feature |
| Celebrity/meme head options (Drake, SRK, Aunty Stock, Onija Robinson, Wow Grape Teacher, Central Cee) | Meme appeal — expanded roster |
| 2 editable text slots with preset saying library | Custom text + trucker sayings, Onija quotes, Wow Grape quotes, Central Cee lyrics |
| Pakistani trucker art visual elements (borders, panels, color palette) | Cultural authenticity — iconic South Asian folk art |
| Kite/Basant decorative elements (floating kites, string lines) | Festive decorative option |
| Multiple background options (mountain road, desert, solid, trucker art, Basant sky) | Builder variety |
| Hue overlay color options (6+ colors including trucker palette) | Quick customization |
| Decorative element options (roses, kites, trucker borders, crescent, etc.) | Builder variety |
| Live animated preview in Step 2 (Remotion Player) | Users see exactly what they'll get BEFORE rendering |
| 5 font styles (incl. trucker art Nastaliq-style) | Text personalization |
| Export to MP4 via Remotion Lambda | Primary output |
| Share to WhatsApp/Instagram/Save | Distribution |
| AWS S3 blob storage | Proper architecture (PR comment #5) |
| Remotion Lambda rendering | Serverless, pay-per-use (PR comment #4) |
| Render queue with progress | UX requirement |
| 1 default sound (LAST priority — simplest add) | Audio essential but lowest effort to add |

### OUT (Later)

| Feature | Why Defer |
|---------|-----------|
| AI image generation | Cost, complexity, not needed for MVP |
| Head accessories on user photos | Hijab wrapping doesn't work with CSS overlay |
| User accounts / auth | Anonymous for MVP, test at iftar |
| GIF export | MP4 first |
| Sound upload | Moderation concerns |
| Sound library (multiple tracks) | Single default first — sound is last priority |
| Web version | Mobile first, web later |
| Monetization / premium tiers | Get working copy first |
| Community / social features | Testing at party, not needed |
| RTL / Arabic text | Not in initial scope |
| Eid al-Adha support | Ramadan / Eid al-Fitr only |
| Onija Robinson sound bites (audio clips) | Need to source/license — add after MVP with sound library |

---

## 12. Asset Checklist

### Backgrounds Needed (5)
- [ ] Mountain road (psychedelic color graded) — Zohran preset
- [ ] Desert highway (golden hour) — 6-Head Spiral preset
- [ ] Solid dark gradient — Celebrity Greeting preset
- [ ] **Pakistani trucker art panel** (stylized painted truck panel scene) — Trucker Art preset
- [ ] **Basant sky** (bright blue sky with scattered colorful kites) — Kite decorative option

### Lottie Animations Needed (10)
- [ ] Rose heart pumping
- [ ] Rose bloom (reveals head)
- [ ] Sunflower bloom (reveals head)
- [ ] Sparkle overlay
- [ ] Floating petals
- [ ] Gold particles + crescent moon
- [ ] **Floating kites** (diamond-shaped patang kites swaying in wind)
- [ ] **Trucker art floral border** (animated garland/border frame)
- [ ] **Trucker art chain border** (jingling chain skirt animation)
- [ ] **Peacock motif** (trucker art style decorative peacock)

### Celebrity / Meme Head PNGs Needed (6)
- [ ] Drake head (transparent PNG, pre-cropped)
- [ ] Shah Rukh Khan head (transparent PNG, pre-cropped)
- [ ] Aunty Stock head (transparent PNG, pre-cropped)
- [ ] **Onija Robinson head** (transparent PNG — signature lime green hijab + red lipstick look)
- [ ] **Wow Grape Teacher / Sehar Kamran head** (transparent PNG — from the viral PISJ video)
- [ ] **Central Cee head** (transparent PNG — post-Shahada era)

### Sounds Needed (LAST PRIORITY — 1 for initial, expand later)
- [ ] Default nasheed (upbeat, 15-20 seconds)
- [ ] (Post-MVP) Nasheed 2 (peaceful)
- [ ] (Post-MVP) Bollywood clip
- [ ] (Post-MVP) Funny voiceover
- [ ] (Post-MVP) Dramatic sting
- [ ] (Post-MVP) Onija Robinson sound bites (need licensing)
- [ ] (Post-MVP) Wow Grape teacher sound bites (need licensing)

### Fonts Needed (5)
- [ ] Psychedelic/groovy font (free/open source)
- [ ] Classic Arabic-friendly font (e.g., Amiri)
- [ ] Bollywood style font
- [ ] Clean sans-serif (e.g., Inter)
- [ ] **Trucker art / Nastaliq-style** decorative font (for truck poetry text overlays)

### Trucker Art Static Assets Needed
- [ ] Floral garland border PNG/SVG (for frame overlays)
- [ ] Geometric tessellation pattern (tileable background texture)
- [ ] Mirror mosaic texture (Rawalpindi "disco" style)
- [ ] Peacock motif PNG/SVG
- [ ] Chain-with-bell border PNG/SVG (truck jingle skirt)
- [ ] Arch-topped panel frame (truck side panel shape)

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

## 14. Development Phases & Developer Task Split

### Team Roles

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEVELOPER SPLIT                               │
│                                                                 │
│  DEV A (Frontend) — @iismail19                                  │
│  ├── Expo / React Native app (screens, navigation, UI)         │
│  ├── Remotion compositions (EidMemeVideo, all layer components) │
│  ├── Remotion Player (live preview in Step 2)                  │
│  ├── NativeWind / CSS / styling                                │
│  ├── Convex client-side (hooks, queries, mutations from app)   │
│  ├── remove.bg API integration (call from app)                 │
│  ├── EAS build & deploy                                        │
│  ├── Asset integration (fonts, Lottie, head PNGs into app)     │
│  └── Share functionality (WhatsApp, Instagram, camera roll)    │
│                                                                 │
│  DEV B (Backend / Infra) — cofounder                           │
│  ├── AWS S3 bucket setup + IAM policies + CORS                 │
│  ├── S3 presigned URL generation (upload + download)           │
│  ├── Remotion Lambda deployment (function + site bundle)       │
│  ├── Convex schema + server-side functions                     │
│  │   ├── schema.ts (data models)                               │
│  │   ├── projects.ts (CRUD mutations/queries)                  │
│  │   ├── renders.ts (render queue + Lambda trigger)            │
│  │   ├── sounds.ts (sound library queries)                     │
│  │   └── assets.ts (asset queries + S3 URL helpers)            │
│  ├── Render pipeline (Convex action → Lambda → S3 → status)   │
│  ├── remove.bg API key management / server proxy (if needed)   │
│  └── Monitoring / error handling on infra side                 │
│                                                                 │
│  SHARED / HANDOFF POINTS:                                       │
│  ├── Convex schema (Dev B defines, Dev A consumes via hooks)   │
│  ├── S3 upload flow (Dev B provides presigned URLs,            │
│  │   Dev A calls them from the app)                            │
│  ├── Render trigger (Dev A calls Convex mutation,              │
│  │   Dev B handles the Lambda orchestration behind it)         │
│  ├── Remotion compositions (Dev A builds them,                 │
│  │   Dev B deploys them to Lambda as site bundle)              │
│  └── Asset URLs (Dev B uploads assets to S3,                   │
│      Dev A references them in Remotion compositions)           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Integration Contract (How the Two Sides Talk)

The key boundary is: **Dev A builds everything the user sees and touches. Dev B builds everything that runs on AWS/Convex servers.** They connect through Convex functions and S3 URLs.

```
┌─────────────────────────────────────────────────────────────────┐
│                INTEGRATION POINTS                                │
│                                                                 │
│  1. PHOTO UPLOAD FLOW                                           │
│     Dev A: User picks photo → calls Convex action              │
│     Dev B: Convex action → generates presigned S3 URL          │
│     Dev A: Uploads directly to S3 using presigned URL          │
│     Dev B: Convex stores S3 key/URL in DB                      │
│                                                                 │
│  2. REMOVE.BG FLOW                                              │
│     Dev A: Sends photo to remove.bg API (or Convex action)     │
│     Dev B: (If proxied) Convex action calls remove.bg,         │
│            uploads result to S3, returns S3 URL                 │
│     Dev A: Receives transparent PNG URL, shows in preview      │
│                                                                 │
│  3. RENDER FLOW                                                 │
│     Dev A: User clicks "Export" → calls requestRender mutation │
│     Dev B: Convex mutation creates job → action calls Lambda   │
│     Dev B: Lambda renders MP4 → stores in S3                   │
│     Dev B: Convex updates render status + progress (real-time) │
│     Dev A: Polls render status via Convex query, shows progress│
│     Dev A: Gets S3 URL of MP4 → shows share/download options  │
│                                                                 │
│  4. REMOTION DEPLOY FLOW                                        │
│     Dev A: Builds Remotion compositions in packages/remotion/  │
│     Dev B: Deploys site bundle to Lambda:                      │
│            npx remotion lambda sites create ...                 │
│     Dev B: Provides serve URL that Convex action uses          │
│                                                                 │
│  5. ASSET MANAGEMENT                                            │
│     Dev B: Uploads static assets (backgrounds, Lottie, heads)  │
│            to S3, seeds Convex `assets` table with URLs         │
│     Dev A: Queries assets from Convex, uses URLs in Remotion   │
│            compositions and in the app UI                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Agreed Interfaces (Define These Early)

Dev B should expose these Convex functions for Dev A to consume:

```typescript
// ── WHAT DEV A CALLS (client-side) ──────────────────────────

// Photo upload
api.storage.getUploadUrl()         // → presigned S3 URL
api.storage.confirmUpload({ s3Key, type })  // → stores metadata

// Remove.bg (if server-proxied)
api.photos.removeBackground({ s3Key })  // → { resultS3Url }

// Projects
api.projects.create({ name, composition })      // → projectId
api.projects.get({ projectId })                  // → project
api.projects.update({ projectId, composition })  // → void

// Render
api.renders.request({ projectId })       // → renderId
api.renders.getStatus({ renderId })      // → { status, progress, outputUrl }

// Assets
api.assets.listByType({ type })          // → Asset[]
api.sounds.listByCategory({ category })  // → Sound[]
```

Dev A doesn't need to know about Lambda, S3 internals, or IAM policies. Dev A just calls Convex mutations/queries and gets back URLs.

---

### Phase-by-Phase Breakdown (Who Does What)

#### Phase 1: Foundation

| Task | Dev A (Frontend) | Dev B (Backend) |
|------|-----------------|-----------------|
| **Expo project init** | Set up Expo + TypeScript + Expo Router + NativeWind | — |
| **Convex project init** | — | Set up Convex project, define schema.ts, deploy |
| **AWS S3** | — | Create S3 bucket, configure CORS, set up IAM user/policies |
| **Image picker** | Implement expo-image-picker with crop | — |
| **S3 upload flow** | Call presigned URL from app, upload photo | Build Convex action that generates presigned S3 upload URLs |
| **remove.bg integration** | Call remove.bg API from app (or call Convex action) | (If proxied) Build Convex action that calls remove.bg + stores result in S3 |
| **Convex client setup** | Install convex, set up provider, connect to backend | Provide deployment URL + project config |

**Handoff**: Dev B provides the Convex deployment URL and the presigned upload function. Dev A connects the app to it.

**Can start in parallel**: Dev A starts Expo scaffolding and UI while Dev B sets up S3 + Convex infra. They connect when both are ready.

#### Phase 2: Builder Engine (Remotion)

| Task | Dev A (Frontend) | Dev B (Backend) |
|------|-----------------|-----------------|
| **Remotion project setup** | Create packages/remotion, set up composition, Root.tsx | — |
| **EidMemeVideo composition** | Build main composition + all 6 layer components (Background, HueOverlay, HeadAnimation, AnimatedText, FlowerReveal, DecorativeElement) | — |
| **Zohran Classic preset** | Define preset config + build all animations (spring, interpolate, Lottie) | — |
| **Trucker art elements** | Build DecorativeElement variants for trucker borders, chains, peacock | — |
| **Kite/Basant elements** | Build DecorativeElement variants for floating kites, string lines | — |
| **Preset definitions** | Define all preset JSON configs (zohran, trucker, celebrity, spiral, blank) | — |
| **Asset upload to S3** | — | Upload background videos, Lottie JSON, head PNGs, fonts to S3 |
| **Asset seeding** | — | Seed Convex `assets` table with S3 URLs |
| **Test renders** | Provide compositions to Dev B for test | Test Remotion compositions via `npx remotion render` locally |

**Handoff**: Dev A builds compositions, Dev B provides asset S3 URLs. Dev A uses those URLs in the compositions. Dev B can test-render locally.

**Can start in parallel**: Dev A builds Remotion compositions using placeholder/local assets. Dev B uploads real assets to S3. They swap in real URLs when ready.

#### Phase 3: Customization UI + Live Preview

| Task | Dev A (Frontend) | Dev B (Backend) |
|------|-----------------|-----------------|
| **3-step wizard navigation** | Build step1.tsx, step2.tsx, step3.tsx with Expo Router | — |
| **Step 1: Preset picker + head upload** | Build preset card grid, photo upload flow, celebrity head picker | — |
| **Step 2: Full customization screen** | Build all customization controls (background, hue, decorative, head anim, text, font) | — |
| **Text preset picker** | Build category-tabbed text picker (trucker, Onija, Wow Grape, Central Cee, classic) | — |
| **Celebrity/meme head selection** | Build head grid with 6 options + user photo | — |
| **Live preview (Remotion Player)** | Integrate Remotion Player component, wire up to composition props, ensure real-time updates | — |
| **Project state management** | Build useProject hook, call Convex mutations to save/load | — |
| **Convex project CRUD** | — | Build projects.ts mutations/queries (create, get, update) |
| **Convex asset queries** | — | Build assets.ts + sounds.ts queries (listByType, listByCategory) |

**Handoff**: Dev B provides working Convex functions. Dev A calls them from hooks.

**Can start in parallel**: Dev A builds all UI with local state first. Dev B builds Convex functions. Dev A swaps in Convex calls when functions are ready.

#### Phase 4: Rendering & Export

| Task | Dev A (Frontend) | Dev B (Backend) |
|------|-----------------|-----------------|
| **Remotion Lambda deployment** | — | Deploy Lambda function + site bundle to AWS |
| **Render queue (Convex)** | — | Build renders.ts: requestRender mutation, executeRender action (calls Lambda), updateProgress, polling logic |
| **Render trigger from app** | Call api.renders.request, poll status via api.renders.getStatus | — |
| **Progress UI** | Build progress bar, status text, loading states in step3.tsx | — |
| **MP4 playback** | Play rendered MP4 from S3 URL in the app | — |
| **Share functionality** | Implement WhatsApp/Instagram/camera roll share using expo-sharing | — |
| **"Go back & edit" flow** | Navigate from Step 3 back to Step 2, preserve state | — |
| **Error handling (infra)** | — | Handle Lambda failures, timeouts, retry logic in Convex action |
| **Error handling (UI)** | Show user-friendly error messages, retry button | — |

**Handoff**: Dev B deploys Lambda and provides the render Convex functions. Dev A calls them and displays the results.

**Critical dependency**: Dev A needs Dev B's render pipeline working before this phase is fully testable. Dev A can stub with a fake delay + test MP4 URL while Dev B builds the real pipeline.

#### Phase 5: Content & Polish

| Task | Dev A (Frontend) | Dev B (Backend) |
|------|-----------------|-----------------|
| **All preset configs** | Finalize JSON configs for all 5 presets | — |
| **Head PNG sourcing** | Source/crop the 6 celebrity head PNGs | Upload to S3, seed assets table |
| **Trucker art assets** | Source/create border SVGs, panel frames, textures | Upload to S3, seed assets table |
| **Kite/Basant assets** | Source kite Lottie, kite SVGs | Upload to S3, seed assets table |
| **Error handling + loading** | Polish all loading states, skeleton screens, error messages | Add monitoring/alerting on Lambda failures |
| **Device testing** | Test on real iOS + Android devices | — |
| **EAS build** | Set up EAS Build for distribution | — |
| **Iftar beta test** | Run the iftar party test | — |

**Can work in parallel**: Dev A polishes UI while Dev B handles asset uploads + infra monitoring.

#### Phase 6: Sound (LAST — simplest add)

| Task | Dev A (Frontend) | Dev B (Backend) |
|------|-----------------|-----------------|
| **Default nasheed** | Source the track | Upload to S3, seed sounds table |
| **Audio in Remotion** | Wire `<Audio>` component into EidMemeVideo composition | — |
| **Sound toggle UI** | Add on/off toggle in Step 2 customization | — |
| **(Post-MVP) Sound library** | Build sound picker UI with categories | Build sounds.ts queries, upload more tracks to S3 |

---

### Suggested Start Order

```
┌─────────────────────────────────────────────────────────────────┐
│                 PARALLEL DEVELOPMENT TIMELINE                    │
│                                                                 │
│  WEEK 1:                                                        │
│  Dev A: Expo scaffolding + image picker + Remotion setup       │
│  Dev B: AWS S3 bucket + Convex schema + presigned URLs         │
│  End of week: Connect — app can upload photos to S3            │
│                                                                 │
│  WEEK 2:                                                        │
│  Dev A: EidMemeVideo composition + all layer components        │
│  Dev B: Upload assets to S3 + seed Convex + remove.bg proxy   │
│  End of week: Connect — compositions use real S3 asset URLs    │
│                                                                 │
│  WEEK 3:                                                        │
│  Dev A: 3-step wizard UI + customization + live preview        │
│  Dev B: Convex project CRUD + asset queries + Lambda deploy    │
│  End of week: Connect — full builder flow works with live      │
│  preview, projects save to Convex                              │
│                                                                 │
│  WEEK 4:                                                        │
│  Dev A: Step 3 render UI + share + progress bar                │
│  Dev B: Render pipeline (Convex → Lambda → S3 → status)       │
│  End of week: Connect — full export pipeline works end-to-end  │
│                                                                 │
│  WEEK 5:                                                        │
│  Both: Polish, content, device testing, sound, iftar beta      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Key Rules for Clean Separation

1. **Dev A never touches AWS console.** All S3/Lambda infra is Dev B's domain.
2. **Dev B never touches UI code.** All screens, components, styling is Dev A's domain.
3. **Convex is the boundary.** Dev B owns the `convex/` directory (schema, mutations, actions). Dev A consumes via hooks in the app. If Dev A needs a new query/mutation, they ask Dev B to add it.
4. **Remotion compositions are Dev A's domain** but Dev B deploys them. Dev A pushes composition code, Dev B runs `npx remotion lambda sites create` to deploy.
5. **Assets go through S3.** Dev B manages the S3 bucket. Dev A never uploads assets manually — Dev B does it and provides URLs via Convex.
6. **When in doubt, define the interface first.** Before building, agree on the Convex function signature (args + return type). Both devs can then build against that contract independently.

**Sound is intentionally last** — it's the simplest layer to add (single audio file piped through Remotion's `<Audio>` component) and doesn't block any other functionality.

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
| ~~Custom template builder?~~ | ~~**No.** Predefined templates with swappable element slots only.~~ **UPDATED — see below.** |
| Multiple sounds? | **Single default for first working copy.** Sound is LAST priority. Expand to curated library after. |
| CapCut-style templates? | **Yes, similar concept** but evolved — see below. |

### New Decisions (Latest Round)

| Question | Decision |
|----------|----------|
| Rigid templates vs custom builder? | **Custom builder with presets.** Users can customize everything (background, head anim, hue, decorative elements, text, font). Presets (Zohran Classic, Trucker Art, Celebrity Greeting, 6-Head Spiral) are one-tap shortcuts that pre-fill all options — but nothing is locked. Users can load a Drake preset and then change the background to trucker art and the text to a truck saying. Maximum flexibility. |
| Preview before rendering? | **Yes — live animated preview in Step 2.** Uses Remotion Player component running locally on device. Shows the card playing in real-time as user customizes. No server cost. The expensive Lambda render only happens when user clicks "Export" in Step 3. Users see exactly what they'll get before committing. |
| Pakistani trucker art? | **IN for MVP.** Added as background option, decorative element set, color palette, font style, and text presets (truck poetry/sayings). Trucker Art is also a preset. |
| Kite/Basant elements? | **IN for MVP** as decorative elements. Floating kites, kite string lines, Basant sky background option. |
| Onija Robinson? | **IN for MVP.** Head cutout (lime green hijab + red lipstick look), quotes as text presets. Sound bites deferred to post-MVP (need licensing). |
| Wow Grape Teacher (Sehar Kamran)? | **IN for MVP.** Head cutout, quotes as text presets ("Wow, grape!", "I will sacrifice my own life for Pakistan", etc.). Sound bites deferred to post-MVP. |
| Central Cee? | **IN for MVP.** Head cutout, Islamic lyrics as text presets ("The mandem celebrate Eid", wallahi line, etc.). |
| Trucker sign sayings? | **IN for MVP.** 11+ authentic Pakistani truck sayings as text presets. Includes classics like "Dekh magar pyaar se", "Maa ki dua jannat ki hawa", "Buri nazar wale tera moonh kala", etc. |
| Sound priority? | **LAST.** Sound is Phase 6. It's the simplest add — one audio file through Remotion's `<Audio>` component. Everything else is built and tested before sound is wired up. |
| Developer task split? | **Frontend (Dev A / @iismail19):** Expo, React Native, Remotion compositions, Remotion Player, NativeWind/CSS, EAS, remove.bg API, share functionality, Convex client-side hooks. **Backend (Dev B / cofounder):** AWS S3, Remotion Lambda deployment, Convex server-side functions (schema, mutations, actions), render pipeline, asset management, IAM policies. **Boundary:** Convex functions are the API contract. Dev A calls them, Dev B builds them. |
