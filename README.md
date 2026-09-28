# ADHD-Lyrics — Sensory Lyric Web App

Mobile-first iOS PWA for **We Don't Bite** (JT Music) with swipeable visual styles, full Web Audio reactivity, and ADHD-friendly focus (high signal, low clutter).

## Tech stack

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | **Next.js 16 (App Router)** + React 19 | Fast MVP, static deploy, PWA-friendly |
| Styling | **Tailwind CSS v4** | Theme tokens per swipeable aesthetic |
| Motion | **Framer Motion** | Line/word choreography, swipe between styles |
| Audio | **Web Audio API** (`AnalyserNode`) | Bass/mid/treble reactive visuals without extra deps |
| Icons | **Lucide React** | Contextual word bursts (flashlight, bite, etc.) |
| Fonts | Google: Bebas, Fraunces, Libre Baskerville, Space Grotesk, Syne | One display voice per theme |

## Architecture flow

```mermaid
flowchart TB
  subgraph input [Input]
    A[User loads audio file]
    B[Play / scrub / tap / long-press]
    C[Horizontal swipe]
  end

  subgraph engine [Audio engine]
    D[HTMLAudioElement]
    E[MediaElementSource → Analyser → Destination]
    F[RAF loop: time + frequency bands]
  end

  subgraph sync [Lyric sync]
    G[LRC map ~208s community timing]
    H[Active line + word index]
    I[Keyword → graphic burst]
  end

  subgraph ui [Presentation]
    J[ThemeBackdrop — reactive glow]
    K[LyricLine — context typography]
    L[ControlDock — vinyl scrub + transport]
  end

  A --> D
  D --> E --> F
  F --> J
  F --> H
  G --> H --> K
  H --> I
  B --> D
  B --> F
  C --> J
  C --> K
```

## iOS PWA / full-screen behavior

Configured in `src/app/layout.tsx` + `public/manifest.webmanifest`:

- `viewport-fit=cover` + `safe-area-inset-*` padding for notch/home indicator
- `apple-mobile-web-app-capable` + `black-translucent` status bar
- `display: standalone` manifest for Add to Home Screen
- `touch-action: manipulation`, no user scaling (immersive, stable layout)
- `playsInline` audio for Safari

**Note:** iOS PWAs cannot trigger Taptic Engine haptics — “haptic-like” feedback is visual (scale, glow, punch type) on long-press **Hold**.

## Run locally

```bash
cd lyrics-app
npm install
npm run dev
```

Open on iPhone: deploy over HTTPS (or LAN HTTPS), **Share → Add to Home Screen**, load your audio copy of the track via **Load audio**.

## MVP controls

- **Swipe ↔** — cycle Neon Club, Soft Glow, Ink & Paper, Liquid Chrome, Cosmic Void
- **Scrub** — vinyl-style timeline
- **Tap right** / skip button — advance lyric line
- **Long-press** — intensify reactive glow + motion
- **Play** — requires loaded audio (lyrics timing pre-mapped; audio not bundled)

## Project layout

- `src/lib/lyrics/we-dont-bite.ts` — timed lines + word splits + keyword graphics
- `src/lib/audio/useAudioEngine.ts` — playback + analyser metrics
- `src/lib/themes.ts` — five swipeable aesthetics
- `src/components/LyricExperience.tsx` — orchestration
