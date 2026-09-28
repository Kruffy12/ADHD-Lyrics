import type { VisualTheme } from "./types";

export const VISUAL_THEMES: VisualTheme[] = [
  {
    id: "neon-club",
    name: "Neon Club",
    tagline: "Strobe-safe pulses & laser edges",
    palette: {
      bg: "#050508",
      bgSecondary: "#120818",
      accent: "#ff2d95",
      accentAlt: "#00f5ff",
      text: "#f8f4ff",
      textMuted: "#9b8fb8",
      glow: "rgba(255, 45, 149, 0.55)",
    },
    typography: {
      display: "var(--font-display-neon)",
      body: "var(--font-geist-sans)",
    },
    motion: { lineEnter: "snap", wordStyle: "karaoke" },
  },
  {
    id: "soft-glow",
    name: "Soft Glow",
    tagline: "Breathing halos & gentle bloom",
    palette: {
      bg: "#0c0f14",
      bgSecondary: "#151a24",
      accent: "#ffb86c",
      accentAlt: "#bd93f9",
      text: "#fff7ef",
      textMuted: "#c4b5a8",
      glow: "rgba(255, 184, 108, 0.45)",
    },
    typography: {
      display: "var(--font-display-soft)",
      body: "var(--font-geist-sans)",
    },
    motion: { lineEnter: "drift", wordStyle: "ribbon" },
  },
  {
    id: "ink-paper",
    name: "Ink & Paper",
    tagline: "Stamped verses & paper grain",
    palette: {
      bg: "#f4efe6",
      bgSecondary: "#e8dfd0",
      accent: "#1a1a1a",
      accentAlt: "#c41e3a",
      text: "#121212",
      textMuted: "#5c5348",
      glow: "rgba(196, 30, 58, 0.25)",
    },
    typography: {
      display: "var(--font-display-ink)",
      body: "var(--font-geist-sans)",
    },
    motion: { lineEnter: "rise", wordStyle: "stamp" },
  },
  {
    id: "liquid-chrome",
    name: "Liquid Chrome",
    tagline: "Specular slides & mercury type",
    palette: {
      bg: "#0a0c10",
      bgSecondary: "#141820",
      accent: "#dfe6f2",
      accentAlt: "#7aa2ff",
      text: "#eef2ff",
      textMuted: "#8b95a8",
      glow: "rgba(122, 162, 255, 0.5)",
    },
    typography: {
      display: "var(--font-display-chrome)",
      body: "var(--font-geist-mono)",
    },
    motion: { lineEnter: "chrome", wordStyle: "elastic" },
  },
  {
    id: "cosmic-void",
    name: "Cosmic Void",
    tagline: "Orbit words & starfield bass",
    palette: {
      bg: "#030308",
      bgSecondary: "#0a0820",
      accent: "#a78bfa",
      accentAlt: "#22d3ee",
      text: "#ede9fe",
      textMuted: "#94a3b8",
      glow: "rgba(167, 139, 250, 0.55)",
    },
    typography: {
      display: "var(--font-display-cosmic)",
      body: "var(--font-geist-sans)",
    },
    motion: { lineEnter: "orbit", wordStyle: "constellation" },
  },
];

export function getTheme(id: string): VisualTheme {
  return VISUAL_THEMES.find((t) => t.id === id) ?? VISUAL_THEMES[0];
}
