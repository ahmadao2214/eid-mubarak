# Iftar Party Gallery - Big Screen Slideshow

Auto-slideshow that displays Eid greeting videos on a TV/projector as guests create them in real-time.

## How It Works

1. A laptop connected to a TV opens the gallery in Chrome fullscreen
2. The TV displays a QR code sidebar so guests can scan and join via Expo Go
3. Guests create & render videos on their phones
4. Videos auto-appear on the TV slideshow the moment they finish rendering — no extra steps

## Prerequisites

- Both the TV laptop and guest phones need **internet** (Convex cloud + S3)
- Both need to be on the **same WiFi** (for Expo Go dev server)
- Guests need the **Expo Go** app installed ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

## Setup

### 1. Start the mobile dev server

```bash
cd apps/mobile
bunx expo start
```

Note the Expo URL printed in the terminal, e.g. `exp://192.168.86.35:8081`

### 2. Deploy Convex functions (if not already done)

From the repo root:

```bash
cd apps/mobile
npx convex dev --once
```

This ensures the `gallery:listCompleted` query is deployed to Convex cloud.

### 3. Start the preview dev server (on the TV laptop)

```bash
cd apps/preview
bun run dev
```

### 4. Open the gallery in Chrome

Open this URL in Chrome, replacing the Expo URL with yours:

```
http://localhost:5173/?mode=gallery&expo=exp://192.168.86.35:8081
```

**IMPORTANT**: The `&expo=` parameter is required for the QR code to appear in the sidebar. Without it, guests won't see a QR code to scan. Get the Expo URL from the terminal output of `bunx expo start` (step 1).

Then press **F11** to go fullscreen.

### 5. Done!

The TV now shows:
- **Main area**: Video slideshow (or "Waiting for vibes..." until the first video is ready)
- **Sidebar**: QR code for guests to scan with Expo Go

## Gallery Features

- **Real-time**: Videos appear within seconds of rendering, powered by Convex subscriptions
- **Auto-play**: Videos play automatically, muted by default (Chrome autoplay policy)
- **Transitions**: Eid-themed transition card between videos
- **Loop**: After the last video, loops back to the first
- **Unmute button**: Click to enable audio
- **Fullscreen button**: In case you need to re-enter fullscreen
- **Video counter**: Shows "3 / 12" in the bottom corner
- **Preloading**: Next video preloads in the background for seamless transitions

## Troubleshooting

### "Could not find public function for gallery:listCompleted"

Run `npx convex dev --once` from `apps/mobile` to deploy the gallery function.

### QR code not showing

Make sure you include the `?expo=` param in the URL:
```
http://localhost:5173/?mode=gallery&expo=exp://192.168.86.35:8081
```

### Guests can't connect via Expo Go

- Ensure all devices are on the same WiFi network
- Check that the Expo dev server is running (`bunx expo start`)
- Try using the LAN IP (not localhost) in the expo URL

### Videos not appearing

- Check that renders are completing successfully in the mobile app
- Verify internet connectivity (Convex cloud must be reachable)
- Open browser DevTools console for errors

### Normal preview mode broken?

The gallery only activates with `?mode=gallery`. Without that param, the normal WebView preview works as before:
```
http://localhost:5173/
```
