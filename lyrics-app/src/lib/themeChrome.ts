import type { VisualTheme } from "./types";

export function isLightTheme(theme: VisualTheme): boolean {
  return theme.id === "ink-paper";
}

/** Dock / header colors that stay readable on each theme background */
export function themeChrome(theme: VisualTheme) {
  const light = isLightTheme(theme);
  return {
    light,
    headerSubtext: theme.palette.textMuted,
    headerTitle: theme.palette.text,
    dotActive: theme.palette.accent,
    dotIdle: light ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.25)",
    dockBg: light ? "rgba(255,255,255,0.92)" : "rgba(0,0,0,0.4)",
    dockBorder: light ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)",
    dockText: theme.palette.text,
    dockTextMuted: theme.palette.textMuted,
    dockControlBg: light ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.08)",
    dockPlayFg: light ? "#fff" : "#000",
    dockPlayBg: light ? theme.palette.accent : "#fff",
    rangeTrack: light ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.15)",
  };
}

export function inactiveWordOpacity(theme: VisualTheme): number {
  return isLightTheme(theme) ? 0.58 : 0.45;
}

export function textShadowForTheme(theme: VisualTheme): string | undefined {
  switch (theme.id) {
    case "neon-club":
      return `0 0 32px ${theme.palette.glow}, 0 2px 12px rgba(0,0,0,0.4)`;
    case "ink-paper":
      return "0 1px 0 rgba(255,255,255,0.6)";
    case "soft-glow":
      return `0 0 24px ${theme.palette.glow}`;
    case "liquid-chrome":
      return `0 0 20px ${theme.palette.glow}`;
    case "cosmic-void":
      return `0 0 28px ${theme.palette.glow}`;
    default:
      return undefined;
  }
}
