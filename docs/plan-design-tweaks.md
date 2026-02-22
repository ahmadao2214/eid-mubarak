# Plan: Design Tweaks & Polish

> Placeholder plan for visual refinements, UX improvements, and design cleanup after backend integration and Remotion preview are working.
>
> **Maps to**: [init-plan.md](./init-plan.md) Phase 5 (Content & Polish)
>
> **Depends on**: Backend Integration plan (real assets visible) + Remotion Preview plan (exact preview working)
>
> **Related docs**: [init-plan.md](./init-plan.md) | [plan-backend-integration.md](./plan-backend-integration.md) | [plan-remotion-preview.md](./plan-remotion-preview.md)

---

## Skills Used

- **`react-native-testing`** — RNTL v13/v14 patterns for component tests
- **`expo-app-design`** — Expo Router, cross-platform design
- **`reanimated-skia-performance`** — Ensuring animations remain performant
- **`frontend-design`** — High-quality UI design that avoids generic AI aesthetics

## Test Runner

```bash
cd apps/mobile && bun test                    # mobile tests
cd apps/mobile && bun test --no-cache         # clear cache + run
cd apps/mobile && bun test <file>             # run specific test file
```

## TDD Approach — Tests First

Each tweak writes tests **before** implementation where applicable.

---

## Status: Placeholder

This plan will be fleshed out after the Backend Integration and Remotion Preview plans are implemented. At that point, the app will have:

- Real celebrity head images and background assets loaded from S3
- Exact Remotion Player preview rendering in the editor
- Full render pipeline for video export

With all of that working, we can assess the visual state of the app and identify specific design tweaks needed.

---

## Candidate Areas (to be refined)

The following areas are likely candidates for polish. Each will be evaluated once real assets and the Remotion preview are in place:

### Typography & Spacing
- [ ] Font sizes and weights across all screens
- [ ] Consistent padding/margins between sections
- [ ] Text truncation and overflow handling for long names

### Animations & Transitions
- [ ] Screen transition animations (Expo Router)
- [ ] Tab switching animations in the editor
- [ ] Loading skeleton animations
- [ ] Micro-interactions (button presses, selection feedback)

### Visual Polish
- [ ] Card shadows and elevation consistency
- [ ] Border radius consistency across components
- [ ] Image loading states (blur hash, progressive loading)
- [ ] Empty state illustrations

### Responsiveness
- [ ] Tablet / large screen layout adjustments
- [ ] Landscape orientation handling
- [ ] Dynamic type / accessibility font scaling
- [ ] Safe area handling on different device models

### Dark/Light Mode
- [ ] Currently emerald-only — evaluate if light mode is needed
- [ ] System theme detection if adding light mode

### Branding
- [ ] App icon design
- [ ] Splash screen design
- [ ] "Send Eid Vibes" logo treatment
- [ ] Share card watermark/branding

### Performance
- [ ] Preview rendering frame rate on low-end devices
- [ ] Image caching and memory management
- [ ] List virtualization for large project collections

---

## Implementation Template

When this plan is fleshed out, each tweak will follow this structure:

### Tweak N: [Description]

#### Test Phase Na
- **Write** `apps/mobile/src/__tests__/[component].test.tsx`
  - Specific visual/behavioral assertions

#### Implementation Na
- **Edit** relevant files
- **Run** `bun test` — verify green

---

## Verification

Once fleshed out, verification will include:
1. All tests pass (`bun test` full suite green)
2. Visual review on iOS simulator + Android emulator
3. Performance profiling on real device
4. Accessibility audit (VoiceOver / TalkBack)
