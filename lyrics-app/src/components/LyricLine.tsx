"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { TimedLine, VisualTheme } from "@/lib/types";
import { findActiveWord } from "@/lib/lyrics/sync";
import { WordGraphicBurst } from "./WordGraphicBurst";

interface LyricLineProps {
  line: TimedLine;
  timeMs: number;
  theme: VisualTheme;
  energy: number;
  intensify: number;
  focusMode: boolean;
}

function glowFor(theme: VisualTheme, active: boolean): string {
  if (!active) return "none";
  if (theme.id === "neon-club") {
    return [
      "0 0 6px #ffffff",
      "0 0 14px #00f5ff",
      "0 0 28px #00f5ff",
      "0 0 42px #ff2d95",
      "0 0 64px rgba(255, 45, 149, 0.55)",
    ].join(", ");
  }
  if (theme.id === "ink-paper") {
    return "0 1px 0 rgba(255,255,255,0.85)";
  }
  return `0 0 18px ${theme.palette.glow}, 0 0 36px ${theme.palette.glow}`;
}

function activeColor(theme: VisualTheme, emphasis?: string) {
  if (theme.id === "neon-club") return "#ffffff";
  if (emphasis === "punch") return theme.palette.accentAlt;
  if (emphasis === "glitch") return theme.palette.accent;
  return theme.palette.text;
}

export function LyricLine({
  line,
  timeMs,
  theme,
  energy,
  intensify,
  focusMode,
}: LyricLineProps) {
  const activeWord = findActiveWord(line, timeMs);
  const graphicWord =
    activeWord?.word.graphic && timeMs < activeWord.word.endMs
      ? activeWord.word
      : null;

  const fontSize = focusMode
    ? "clamp(2.4rem, 12.5vw, 4.6rem)"
    : "clamp(1.7rem, 8vw, 3rem)";

  return (
    <div className="relative flex h-full w-full items-center justify-center px-6 py-8">
      <AnimatePresence mode="wait">
        {graphicWord?.graphic && (
          <WordGraphicBurst
            key={`${line.id}-${graphicWord.text}-gfx`}
            graphic={graphicWord.graphic}
            accent={theme.palette.accent}
            accentAlt={theme.palette.accentAlt}
            energy={energy}
          />
        )}
      </AnimatePresence>

      <motion.p
        key={line.id}
        initial={{ opacity: 0, scale: 0.86, y: 28 }}
        animate={{
          opacity: 1,
          scale: 1 + energy * 0.02 * (1 + intensify),
          y: 0,
        }}
        exit={{ opacity: 0, scale: 1.06, y: -22 }}
        transition={{ type: "spring", stiffness: 260, damping: 26, mass: 0.9 }}
        className="m-0 max-w-[14ch] text-balance text-center leading-[1.08] tracking-tight"
        style={{
          fontFamily: theme.typography.display,
          fontSize,
          fontWeight: line.shout ? 800 : 650,
          color: theme.palette.text,
          background: "transparent",
          overflow: "visible",
        }}
      >
        {line.words.map((word, i) => {
          const isActive = activeWord?.index === i;
          const isPast = timeMs >= word.endMs;
          const scale = isActive ? 1.05 + (word.emphasis === "punch" ? 0.04 : 0) : 1;
          const opacity = isActive ? 1 : isPast ? 0.72 : 0.45;

          return (
            <motion.span
              key={`${line.id}-${i}`}
              className="inline-block origin-center align-baseline"
              animate={{ scale, opacity, y: isActive ? -2 : 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 28 }}
              style={{
                color: isActive
                  ? activeColor(theme, word.emphasis)
                  : theme.palette.text,
                textShadow: glowFor(theme, isActive),
                background: "none",
                backgroundColor: "transparent",
                boxShadow: "none",
                border: "none",
                padding: 0,
                margin: 0,
                WebkitTextFillColor: "currentColor",
              }}
            >
              {word.text}
              {i < line.words.length - 1 ? "\u00A0" : ""}
            </motion.span>
          );
        })}
      </motion.p>
    </div>
  );
}
