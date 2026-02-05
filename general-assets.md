# General Assets - Sound & Visual Asset Sources

> Sourcing guide for all assets needed by EidMemeMaker. Covers sounds, visual elements, fonts, and reference material.
>
> See also: [init-plan.md](./init-plan.md) | [full-vision.md](./full-vision.md) | [meme-culture-research.md](./meme-culture-research.md)

---

## Sounds

### Nasheeds (Islamic Vocals)

| Source | Type | License | Notes |
|--------|------|---------|-------|
| **NoCopyrightNasheeds** | Free | Credit required | Best free option, stream-safe |
| **Internet Archive** | Free | Varies | Large collection, check each |
| **Pixabay Music** | Free | No attribution | Limited selection |
| **Envato Elements** | Paid | Royalty-free | High quality, $16.50/mo |

**Recommended**: Start with NoCopyrightNasheeds, supplement with Envato.

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
2. Use ElevenLabs to clone and generate variations (future)
3. Commission from Fiverr voice actors

**Classic Phrases to Record**:
- "Eid Mubarak beta!"
- "Khana khao, bahut kamzor lag rahe ho"
- "MashAllah, kitna bada ho gaya!"
- "Beta, shaadi kab kar rahe ho?"
- "Ammi ki kasam"
- "Arey waah!"

### Sound Effects (SFX)

| Sound | Use For | Source |
|-------|---------|--------|
| Sparkle/shimmer | Decorative element entry | Pixabay, Freesound |
| Pop/boing | Head pop-in animation | Pixabay, Freesound |
| Whoosh | Transitions | Pixabay, Freesound |
| Bling/shine | Gold/bling effects | Pixabay, Freesound |
| Dramatic sting | Bollywood drama moments | AudioJungle |

---

## Visual Assets

### Lottie Animations

| Source | Type | Best For |
|--------|------|----------|
| **LottieFiles** | Lottie JSON | Animated stickers, effects, flower blooms |
| **IconScout** | Lottie JSON | Additional animated elements |

**Specific Lottie Animations Needed**:

| Animation | What It Does | Where to Find |
|-----------|-------------|---------------|
| Rose heart pumping | Heart shape made of roses, pulses | LottieFiles search "heart roses" |
| Rose bloom | Flower opens to reveal center (head goes here) | LottieFiles or commission |
| Sunflower bloom | Same concept, sunflower | LottieFiles or commission |
| Sparkle overlay | Full-screen sparkle/glitter effect | LottieFiles search "sparkle" |
| Floating petals | Rose petals falling | LottieFiles search "petals falling" |
| Gold particles | Floating gold dust/particles | LottieFiles search "gold particles" |
| Crescent moon | Animated crescent with stars | LottieFiles search "crescent moon" |

### Static Images

| Source | Type | Best For |
|--------|------|----------|
| **Freepik** | SVG/PNG | Eid elements, Islamic patterns |
| **Flaticon** | Icons | UI elements |
| **Unsplash** | Photos | Backgrounds (if not using video) |
| **Pixabay** | Everything | General assets |

### Background Videos

| Source | Type | Best For |
|--------|------|----------|
| **Pexels Videos** | Stock video | Background loops (mountain roads, desert highways) |
| **Pixabay Video** | Stock video | Alternative background loops |
| **Coverr** | Free video | Scenic landscape loops |

**Specific Backgrounds Needed**:

| Background | Description | Search Terms |
|-----------|-------------|--------------|
| Mountain road | Psychedelic scenic highway, colorful | "scenic road driving colorful" |
| Desert highway | Golden hour desert road | "desert highway golden hour" |
| Solid dark | Dark gradient (can be generated in CSS) | N/A - create programmatically |

### Fonts

| Font | Style | Source | License |
|------|-------|--------|---------|
| Groovy/Psychedelic | 60s-70s retro funky | Google Fonts "Bungee Shade" or similar | Open source |
| Amiri | Classic Arabic-friendly serif | Google Fonts "Amiri" | Open source |
| Bollywood-style | Decorative Indian cinema feel | DaFont or custom | Check license |
| Inter | Clean sans-serif | Google Fonts "Inter" | Open source |

### Celebrity Head Images

These need to be sourced carefully:

| Celebrity | Source Approach | Notes |
|-----------|----------------|-------|
| **Drake** | Existing meme images (Drake-in-hijab meme is widely shared) | Fair use / parody consideration |
| **Shah Rukh Khan** | High-quality photo, manually crop + remove bg | Use clearly recognizable pose |
| **Aunty Stock** | Stock photo sites | Need commercial license for stock photos |

---

## Reference Videos

### Where to Find Inspiration

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

### CapCut Templates to Reference

CapCut has popular Eid templates that follow a similar pattern to what we're building. Study these for:
- How they handle timing/choreography
- What element slots users can swap
- Transition styles between scenes
- How sound syncs with visual elements

Search CapCut template library for: "Eid Mubarak", "Islamic greeting", "Ramadan"

---

## Asset Checklist (MVP)

### Priority 1 (Must have for first working copy)
- [ ] 1 background video (mountain road)
- [ ] 1 Lottie: rose heart pumping
- [ ] 1 Lottie: rose bloom (head reveal)
- [ ] 1 Lottie: sparkle overlay
- [ ] 1 sound: default nasheed (15-20 seconds)
- [ ] 3 celebrity heads: Drake, SRK, Aunty Stock (transparent PNG)
- [ ] 4 fonts: psychedelic, classic, bollywood, clean

### Priority 2 (Before iftar test)
- [ ] 2 more background videos (desert highway, solid gradient)
- [ ] 2 more Lottie: sunflower bloom, floating petals
- [ ] 1 more Lottie: gold particles + crescent moon
- [ ] 4 more sounds (nasheed 2, bollywood clip, voiceover, dramatic sting)

### Priority 3 (Post-MVP polish)
- [ ] Additional Lottie effects (confetti, hearts, etc.)
- [ ] More sound variety
- [ ] Additional celebrity heads
- [ ] VHS/retro filter assets
