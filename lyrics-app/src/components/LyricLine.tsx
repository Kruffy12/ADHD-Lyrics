"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { TimedLine, VisualTheme } from "@/lib/types";
import { findActiveWord } from "@/lib/lyrics/we-dont-bite";
import { WordGraphicBurst } from "./WordGraphicBurst";

interface LyricLineProps {
  line: TimedLine;
  timeMs: number;
  theme: VisualTheme;
  energy: number;
  intensify: number;
}

function wordColor(
  theme: VisualTheme,
  emphasis: TimedLine["words"][number]["emphasis"],
  active: boolean,
) {
  if (!active) return theme.palette.textMuted;
  if (emphasis === "punch") return theme.palette.accentAlt;
  if (emphasis === "glitch") return theme.palette.accent;
  if (emphasis === "whisper") return theme.palette.text;
  return theme.palette.text;
}

export function LyricLine({
  line,
  timeMs,
  theme,
  energy,
  intensify,
}: LyricLineProps) {
  const activeWord = findActiveWord(line, timeMs);
  const graphicWord =
    activeWord?.word.graphic && timeMs < activeWord.word.endMs
      ? activeWord.word
      : null;

  const lineVariants = {
    snap: { y: 28, opacity: 0, filter: "blur(6px)" },
    drift: { y: 18, opacity: 0, filter: "blur(4px)" },
    rise: { y: 36, opacity: 0 },
    chrome: { y: 12, opacity: 0, skewX: -8 },
    orbit: { y: 20, opacity: 0, rotate: -3 },
  };

  const enter = lineVariants[theme.motion.lineEnter] ?? lineVariants.snap;

  return (
    <div className="relative flex min-h-[42vh] flex-col items-center justify-center px-6 text-center">
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
        initial={enter}
        animate={{
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          skewX: 0,
          rotate: 0,
          scale: 1 + energy * 0.02 * (1 + intensify),
        }}
        exit={{ opacity: 0, y: -16, filter: "blur(4px)" }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-[18ch] text-balance leading-[1.15] tracking-tight"
        style={{
          fontFamily: theme.typography.display,
          fontSize: line.shout
            ? "clamp(1.65rem, 7vw, 2.75rem)"
            : "clamp(1.35rem, 5.8vw, 2.2rem)",
          fontWeight: line.shout ? 800 : 650,
          color: theme.palette.text,
          textShadow:
            theme.id === "neon-club"
              ? `0 0 24px ${theme.palette.glow}`
              : undefined,
        }}
      >
        {line.words.map((word, i) => {
          const isActive = activeWord?.index === i;
          const isPast = timeMs >= word.endMs;
          const scale =
            isActive && word.emphasis === "punch"
              ? 1.08 + energy * 0.08
              : isActive
                ? 1.03
                : 1;
          return (
            <motion.span
              key={`${line.id}-${i}`}
              className="inline-block origin-center px-[0.12em]"
              animate={{
                scale,
                y: isActive ? -2 : 0,
                opacity: isPast || isActive ? 1 : 0.42,
              }}
              transition={{ type: "spring", stiffness: 500, damping: 28 }}
              style={{
                color: wordColor(theme, word.emphasis, isActive || isPast),
              }}
            >
              {word.text}
              {i < line.words.length - 1 ? " " : ""}
            </motion.span>
          );
        })}
      </motion.p>

      <motion.p
        className="mt-4 text-xs uppercase tracking-[0.25em]"
        style={{ color: theme.palette.textMuted }}
        animate={{ opacity: 0.5 + energy * 0.3 }}
      >
        {line.mood}
      </motion.p>
    </div>
  );
}
