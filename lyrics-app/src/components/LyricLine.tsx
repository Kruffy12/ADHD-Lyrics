"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { TimedLine, VisualTheme } from "@/lib/types";
import { findActiveWord } from "@/lib/lyrics/sync";
import {
  inactiveWordOpacity,
  textShadowForTheme,
} from "@/lib/themeChrome";
import { WordGraphicBurst } from "./WordGraphicBurst";

interface LyricLineProps {
  line: TimedLine;
  timeMs: number;
  theme: VisualTheme;
  energy: number;
  intensify: number;
  focusMode: boolean;
}

function wordColor(
  theme: VisualTheme,
  emphasis: TimedLine["words"][number]["emphasis"],
  active: boolean,
  past: boolean,
) {
  if (!active && !past) return theme.palette.textMuted;
  if (emphasis === "punch") return theme.palette.accentAlt;
  if (emphasis === "glitch") return theme.palette.accent;
  return theme.palette.text;
}

function lineEnterVariant(
  theme: VisualTheme,
): Record<string, number | string> {
  const presets: Record<
    VisualTheme["motion"]["lineEnter"],
    Record<string, number | string>
  > = {
    snap: { scale: 0.82, opacity: 0, filter: "blur(10px)", y: 20 },
    drift: { scale: 0.94, opacity: 0, filter: "blur(6px)", y: 28 },
    rise: { scale: 1.18, opacity: 0, y: 40 },
    chrome: { scale: 0.88, opacity: 0, skewX: -12, filter: "blur(4px)" },
    orbit: { scale: 0.9, opacity: 0, rotate: -6, y: 24 },
  };
  return presets[theme.motion.lineEnter] ?? presets.snap;
}

function wordMotion(
  theme: VisualTheme,
  emphasis: TimedLine["words"][number]["emphasis"],
  isActive: boolean,
  energy: number,
  intensify: number,
  index: number,
) {
  const punch = emphasis === "punch";
  const base = {
    opacity: 1,
    y: 0,
    x: 0,
    scale: 1,
    rotate: 0,
    filter: "blur(0px)",
  };

  switch (theme.motion.wordStyle) {
    case "karaoke":
      return {
        ...base,
        scale: isActive ? (punch ? 1.14 + energy * 0.1 : 1.06) : 1,
        y: isActive ? -4 : 0,
        filter: isActive ? `drop-shadow(0 0 12px ${theme.palette.glow})` : "none",
      };
    case "ribbon":
      return {
        ...base,
        x: isActive ? 0 : -6,
        scale: isActive ? 1.05 : 0.98,
        opacity: isActive ? 1 : 0.85,
      };
    case "stamp":
      return {
        ...base,
        scale: isActive ? 1.12 : 1,
        rotate: isActive ? (index % 2 === 0 ? -3 : 3) : 0,
        y: isActive ? -3 : 0,
      };
    case "elastic":
      return {
        ...base,
        scale: isActive ? 1.2 + energy * 0.08 : 0.96,
        y: isActive ? -6 : 0,
      };
    case "constellation":
      return {
        ...base,
        scale: isActive ? 1.1 + intensify * 0.05 : 0.92,
        y: isActive ? -8 - energy * 6 : Math.sin(index) * 2,
        opacity: isActive ? 1 : 0.7,
      };
    default:
      return base;
  }
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

  const enter = lineEnterVariant(theme);
  const inactiveOpacity = inactiveWordOpacity(theme);
  const shadow = textShadowForTheme(theme);

  const fontSize = focusMode
    ? line.shout
      ? "clamp(2.1rem, 11vw, 4rem)"
      : "clamp(1.85rem, 9.5vw, 3.35rem)"
    : line.shout
      ? "clamp(1.85rem, 8.5vw, 3.1rem)"
      : "clamp(1.55rem, 7.2vw, 2.65rem)";

  return (
    <div
      className={`relative flex flex-col items-center justify-center px-5 text-center ${
        focusMode ? "min-h-[58vh]" : "min-h-[48vh]"
      }`}
    >
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
          scale: 1 + energy * 0.025 * (1 + intensify),
          opacity: 1,
          filter: "blur(0px)",
          skewX: 0,
          rotate: 0,
          y: 0,
        }}
        exit={{
          opacity: 0,
          scale: 0.92,
          y: -24,
          filter: "blur(8px)",
          transition: { duration: 0.28 },
        }}
        transition={{
          type: "spring",
          stiffness: 320,
          damping: 28,
          mass: 0.85,
        }}
        className={`text-balance leading-[1.12] tracking-tight ${
          focusMode ? "max-w-[16ch]" : "max-w-[20ch]"
        }`}
        style={{
          fontFamily: theme.typography.display,
          fontSize,
          fontWeight: line.shout ? 800 : 650,
          color: theme.palette.text,
          textShadow: shadow,
        }}
      >
        {line.words.map((word, i) => {
          const isActive = activeWord?.index === i;
          const isPast = timeMs >= word.endMs;
          const wordAnim = wordMotion(
            theme,
            word.emphasis,
            isActive,
            energy,
            intensify,
            i,
          );

          return (
            <motion.span
              key={`${line.id}-${i}`}
              className="inline-block origin-center px-[0.1em]"
              initial={{
                opacity: 0,
                scale: 0.6,
                y: 12,
                filter: "blur(4px)",
              }}
              animate={{
                ...wordAnim,
                opacity:
                  isPast || isActive ? wordAnim.opacity : inactiveOpacity,
              }}
              transition={{
                type: "spring",
                stiffness: isActive ? 520 : 380,
                damping: 26,
                delay: i * 0.035,
              }}
              style={{
                color: wordColor(theme, word.emphasis, isActive, isPast),
              }}
            >
              {word.text}
              {i < line.words.length - 1 ? " " : ""}
            </motion.span>
          );
        })}
      </motion.p>

      {!focusMode && (
        <motion.p
          className="mt-5 text-[10px] uppercase tracking-[0.28em]"
          style={{ color: theme.palette.textMuted }}
          animate={{ opacity: 0.55 + energy * 0.25 }}
        >
          {line.mood}
        </motion.p>
      )}
    </div>
  );
}
