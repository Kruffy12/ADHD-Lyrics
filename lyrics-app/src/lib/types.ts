export type LyricMood =
  | "intro"
  | "verse"
  | "prechorus"
  | "chorus"
  | "bridge"
  | "outro";

export type WordGraphic =
  | "flashlight"
  | "bite"
  | "animatronic"
  | "nightmare"
  | "cupcake"
  | "freddy"
  | "door"
  | "party"
  | "alone"
  | "spark"
  | "run";

export interface TimedWord {
  text: string;
  startMs: number;
  endMs: number;
  graphic?: WordGraphic;
  emphasis?: "whisper" | "punch" | "flow" | "glitch";
}

export interface TimedLine {
  id: string;
  startMs: number;
  endMs: number;
  text: string;
  mood: LyricMood;
  words: TimedWord[];
  shout?: boolean;
}

export interface TrackMeta {
  id: string;
  title: string;
  artist: string;
  durationMs: number;
  sourceNote: string;
}

export interface ReactiveMetrics {
  bass: number;
  mid: number;
  treble: number;
  energy: number;
}

export type ThemeId =
  | "neon-club"
  | "soft-glow"
  | "ink-paper"
  | "liquid-chrome"
  | "cosmic-void";

export interface VisualTheme {
  id: ThemeId;
  name: string;
  tagline: string;
  palette: {
    bg: string;
    bgSecondary: string;
    accent: string;
    accentAlt: string;
    text: string;
    textMuted: string;
    glow: string;
  };
  typography: {
    display: string;
    body: string;
  };
  motion: {
    lineEnter: "rise" | "snap" | "drift" | "chrome" | "orbit";
    wordStyle: "karaoke" | "elastic" | "ribbon" | "stamp" | "constellation";
  };
}
