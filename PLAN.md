# Eid Mubarak Card Generator - Project Plan

## Overview

A fun, intuitive app for creating beautiful Eid Mubarak greeting cards, animations, and videos. Users can pick from decorative elements (moons, lanterns, stars, Arabic calligraphy), customize messages, and export as images, GIFs, or videos.

---

## Key Questions Answered

### How are those videos actually created?

There are several approaches:

1. **Canvas-based rendering** - HTML5 Canvas or WebGL for real-time preview and image export
2. **Video from frames** - Render each animation frame, stitch into video
3. **Remotion** - React components rendered server-side into actual MP4 videos
4. **Lottie animations** - JSON-based animations that can be exported to GIF/video

### Is there a "Canvas for videos"?

Yes! **Remotion** is essentially "React for videos" - you write React components with animations, and it renders them frame-by-frame into real video files. This is perfect for your use case.

### Why Remotion is ideal:

- Write animations in React (you already know this!)
- Programmatic video generation
- Can export to MP4, GIF, or sequences of images
- Server-side rendering for consistent quality
- Great for template-based content like greeting cards

---

## Architecture Decision

### Recommended: Hybrid Web App with Remotion

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Web)                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │  Card Editor    │  │  Preview Player │  │  Asset      │ │
│  │  (Konva/Fabric) │  │  (Remotion      │  │  Library    │ │
│  │                 │  │   Player)       │  │             │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Convex)                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │  User Projects  │  │  Asset Storage  │  │  Render     │ │
│  │  & Templates    │  │  (Images, SVGs) │  │  Queue      │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Render Service (Remotion Lambda/Server)        │
│  - Receives composition config                              │
│  - Renders video frames                                     │
│  - Outputs MP4/GIF/WebM                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Stack Recommendation

### Frontend
- **Framework**: Next.js (React) or Expo Web
- **Canvas Editor**: Konva.js or Fabric.js (drag-and-drop element placement)
- **Animation Preview**: Remotion Player (real-time preview in browser)
- **Styling**: Tailwind CSS
- **State Management**: Zustand or Jotai

### Backend
- **Database & Functions**: Convex
- **File Storage**: Convex file storage or Cloudflare R2
- **Auth**: Convex Auth or Clerk

### Video Rendering
- **Remotion**: Core video generation
- **Remotion Lambda**: Serverless video rendering (AWS)
- **Alternative**: Self-hosted Remotion renderer

### Mobile (Optional Phase 2)
- **Expo/React Native**: Share components with web
- **expo-av**: Video playback
- **react-native-skia**: High-performance canvas

---

## Core Features

### Phase 1: MVP (Image Generator)

1. **Template Selection**
   - Pre-designed Eid card templates
   - Eid al-Fitr vs Eid al-Adha themes
   - Color scheme options (gold/green, purple/gold, etc.)

2. **Element Library**
   - Crescent moons (various styles)
   - Lanterns (animated glow)
   - Stars and sparkles
   - Arabic calligraphy ("Eid Mubarak", "عيد مبارك")
   - Decorative borders
   - Mosque silhouettes
   - Animals (for Eid al-Adha: goat, camel, cow)

3. **Text Customization**
   - Custom messages
   - Multiple fonts (including Arabic-friendly)
   - Color and size options

4. **Export**
   - PNG/JPG image download
   - Copy to clipboard
   - Share to social media

### Phase 2: Animation & Video

1. **Animation Presets**
   - Floating lanterns
   - Twinkling stars
   - Glowing moon
   - Text fade-in/scale effects
   - Particle effects (sparkles)

2. **Timeline Editor** (simplified)
   - Duration control (3s, 5s, 10s)
   - Element entrance/exit timing
   - Looping options

3. **Export Formats**
   - GIF (for easy sharing)
   - MP4 (high quality)
   - WebM (web optimized)

### Phase 3: Social & Sharing

1. **User Accounts**
   - Save projects
   - Template gallery
   - Favorites

2. **Community Features**
   - Share templates
   - Discover popular designs
   - Collaborative editing

---

## Data Models (Convex)

```typescript
// cards.ts
export const cards = defineTable({
  userId: v.string(),
  name: v.string(),
  template: v.string(),
  elements: v.array(v.object({
    id: v.string(),
    type: v.union(
      v.literal("moon"),
      v.literal("lantern"),
      v.literal("star"),
      v.literal("text"),
      v.literal("calligraphy"),
      v.literal("image")
    ),
    position: v.object({ x: v.number(), y: v.number() }),
    scale: v.number(),
    rotation: v.number(),
    animation: v.optional(v.object({
      type: v.string(),
      duration: v.number(),
      delay: v.number(),
    })),
    props: v.any(), // type-specific properties
  })),
  backgroundColor: v.string(),
  backgroundImage: v.optional(v.string()),
  duration: v.number(), // in seconds
  createdAt: v.number(),
  updatedAt: v.number(),
});

// renders.ts
export const renders = defineTable({
  cardId: v.id("cards"),
  userId: v.string(),
  status: v.union(
    v.literal("pending"),
    v.literal("rendering"),
    v.literal("completed"),
    v.literal("failed")
  ),
  format: v.union(v.literal("gif"), v.literal("mp4"), v.literal("png")),
  outputUrl: v.optional(v.string()),
  error: v.optional(v.string()),
  createdAt: v.number(),
});

// assets.ts
export const assets = defineTable({
  name: v.string(),
  category: v.string(), // "moon", "lantern", "calligraphy", etc.
  type: v.union(v.literal("svg"), v.literal("png"), v.literal("lottie")),
  url: v.string(),
  thumbnail: v.string(),
  tags: v.array(v.string()),
  eidType: v.union(v.literal("fitr"), v.literal("adha"), v.literal("both")),
});
```

---

## Remotion Composition Structure

```typescript
// src/remotion/EidCard.tsx
import { AbsoluteFill, useCurrentFrame, interpolate, spring } from 'remotion';

export const EidCard: React.FC<{
  elements: CardElement[];
  backgroundColor: string;
  duration: number;
}> = ({ elements, backgroundColor, duration }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      {elements.map((element) => (
        <AnimatedElement key={element.id} element={element} frame={frame} />
      ))}
    </AbsoluteFill>
  );
};

// Animation examples
const AnimatedLantern = ({ element, frame }) => {
  const swing = Math.sin(frame * 0.05) * 5; // Gentle swinging
  const glow = interpolate(
    Math.sin(frame * 0.1),
    [-1, 1],
    [0.7, 1]
  );

  return (
    <div style={{
      transform: `rotate(${swing}deg)`,
      opacity: glow,
    }}>
      <LanternSVG />
    </div>
  );
};

const AnimatedStars = ({ frame }) => {
  const twinkle = spring({
    frame,
    fps: 30,
    config: { damping: 10 },
  });

  return <StarField opacity={twinkle} />;
};
```

---

## UI/UX Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     HOME SCREEN                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Create New │  │  Templates  │  │  My Cards   │        │
│  │     Card    │  │             │  │             │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    EDITOR SCREEN                            │
│  ┌─────────┐ ┌─────────────────────────┐ ┌───────────────┐ │
│  │ Assets  │ │                         │ │  Properties   │ │
│  │ Panel   │ │      Canvas Preview     │ │  Panel        │ │
│  │         │ │                         │ │               │ │
│  │ 🌙 Moon │ │    [Your Card Here]     │ │ Position: X,Y │ │
│  │ 🏮 Lamp │ │                         │ │ Scale: 100%   │ │
│  │ ⭐ Star │ │                         │ │ Animation:    │ │
│  │ 📝 Text │ │                         │ │ [dropdown]    │ │
│  │         │ │                         │ │               │ │
│  └─────────┘ └─────────────────────────┘ └───────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Timeline (for video): [====●=============] 0:03 / 0:05 ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌────────────┐ ┌────────────┐ ┌────────────┐              │
│  │  Preview   │ │ Export PNG │ │ Export GIF │              │
│  └────────────┘ └────────────┘ └────────────┘              │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Phases

### Week 1-2: Foundation
- [ ] Set up Next.js project with TypeScript
- [ ] Configure Convex backend
- [ ] Set up Remotion with basic composition
- [ ] Create asset library (SVGs, PNGs for Eid elements)
- [ ] Build basic canvas editor with Konva.js

### Week 3-4: Core Editor
- [ ] Implement drag-and-drop element placement
- [ ] Add text editing with custom fonts
- [ ] Build properties panel (position, scale, rotation)
- [ ] Create template system
- [ ] Implement PNG export

### Week 5-6: Animation System
- [ ] Define animation presets (float, glow, twinkle, etc.)
- [ ] Build animation preview with Remotion Player
- [ ] Create simple timeline controls
- [ ] Implement GIF export (client-side)

### Week 7-8: Video Rendering
- [ ] Set up Remotion Lambda or server rendering
- [ ] Build render queue system in Convex
- [ ] Implement MP4/WebM export
- [ ] Add progress tracking and notifications

### Week 9-10: Polish & Launch
- [ ] User authentication
- [ ] Save/load projects
- [ ] Social sharing features
- [ ] Performance optimization
- [ ] Mobile responsive design

---

## Alternative Approaches Considered

### 1. Pure Canvas + FFmpeg (Not Recommended)
- **Pros**: Full control, no dependencies
- **Cons**: Complex, reinventing the wheel, server-side FFmpeg needed

### 2. Lottie-only (Limited)
- **Pros**: Small file sizes, smooth animations
- **Cons**: Requires After Effects for asset creation, less flexible

### 3. WebGL/Three.js (Overkill)
- **Pros**: Powerful 3D effects
- **Cons**: Steep learning curve, unnecessary complexity

### 4. Canva-like SaaS (Already exists)
- Just use Canva? But where's the fun in that! 😄

---

## Asset Resources

### Free SVG Sources
- [Freepik](https://www.freepik.com) - Search "Eid Mubarak elements"
- [Flaticon](https://www.flaticon.com) - Islamic icons
- [SVGRepo](https://www.svgrepo.com) - Moon, lantern, star vectors
- [Undraw](https://undraw.co) - Illustration style assets

### Arabic Fonts
- [Google Fonts Arabic](https://fonts.google.com/?subset=arabic)
- Amiri, Scheherazade, Lateef

### Lottie Animations
- [LottieFiles](https://lottiefiles.com) - Search "Eid", "Islamic", "Ramadan"

---

## Cost Considerations

### Remotion Lambda Pricing
- ~$0.01 per video render (varies by length/complexity)
- Free tier: Local rendering only

### Convex Pricing
- Free tier: 1M function calls/month
- Should be sufficient for MVP

### Hosting
- Vercel: Free tier works for MVP
- Alternative: Cloudflare Pages

---

## Quick Start Commands

```bash
# Create Next.js app with Remotion
npx create-video@latest eid-mubarak-app

# Or add Remotion to existing Next.js
npm install remotion @remotion/player @remotion/lambda

# Add Convex
npm install convex
npx convex dev

# Add canvas library
npm install react-konva konva

# Add animation utilities
npm install framer-motion
```

---

## Questions to Decide

1. **Web-first or Mobile-first?**
   - Recommendation: Web-first, then Expo for mobile

2. **Server rendering or client-only?**
   - MVP: Client-side GIF export
   - V2: Server-side MP4 rendering

3. **User accounts from day 1?**
   - Could start anonymous, add auth later

4. **Template marketplace?**
   - Nice to have, not MVP

---

## Next Steps

1. Confirm tech stack decisions
2. Set up project scaffolding
3. Curate initial asset library (10-20 elements)
4. Build first prototype of canvas editor
5. Integrate Remotion for preview

Ready to start building? Let me know which phase you'd like to tackle first!
