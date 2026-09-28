"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { motion, PanInfo } from "framer-motion";
import { VISUAL_THEMES } from "@/lib/themes";
import {
  WE_DONT_BITE_LINES,
  WE_DONT_BITE_META,
  findActiveLine,
} from "@/lib/lyrics/we-dont-bite";
import { useAudioEngine } from "@/lib/audio/useAudioEngine";
import { ThemeBackdrop } from "./ThemeBackdrop";
import { LyricLine } from "./LyricLine";
import { ControlDock } from "./ControlDock";

const SWIPE_THRESHOLD = 80;

export function LyricExperience() {
  const [themeIndex, setThemeIndex] = useState(0);
  const [manualLineIndex, setManualLineIndex] = useState<number | null>(null);
  const [holdActive, setHoldActive] = useState(false);
  const holdTimer = useRef<number | null>(null);

  const theme = VISUAL_THEMES[themeIndex];
  const {
    audioRef,
    state,
    loadFile,
    toggle,
    seekMs,
    setIntensify,
  } = useAudioEngine(WE_DONT_BITE_META.durationMs);

  const synced = useMemo(() => {
    const active = findActiveLine(WE_DONT_BITE_LINES, state.currentTimeMs);
    if (manualLineIndex != null && !state.isPlaying) {
      const line = WE_DONT_BITE_LINES[manualLineIndex];
      return line ? { line, index: manualLineIndex } : active;
    }
    return active;
  }, [manualLineIndex, state.currentTimeMs, state.isPlaying]);

  const advanceLine = useCallback(() => {
    const base = synced?.index ?? 0;
    const next = Math.min(base + 1, WE_DONT_BITE_LINES.length - 1);
    setManualLineIndex(next);
    seekMs(WE_DONT_BITE_LINES[next].startMs);
  }, [seekMs, synced?.index]);

  const onThemeSwipe = useCallback(
    (_: unknown, info: PanInfo) => {
      if (info.offset.x < -SWIPE_THRESHOLD) {
        setThemeIndex((i) => Math.min(i + 1, VISUAL_THEMES.length - 1));
      } else if (info.offset.x > SWIPE_THRESHOLD) {
        setThemeIndex((i) => Math.max(i - 1, 0));
      }
    },
    [],
  );

  const onHoldStart = useCallback(() => {
    setHoldActive(true);
    setIntensify(1);
  }, [setIntensify]);

  const onHoldEnd = useCallback(() => {
    setHoldActive(false);
    setIntensify(0);
  }, [setIntensify]);

  const onPlayToggle = useCallback(() => {
    setManualLineIndex(null);
    toggle();
  }, [toggle]);

  return (
    <div
      className="relative flex h-[100dvh] flex-col overflow-hidden text-white"
      style={{ color: theme.palette.text }}
    >
      <audio ref={audioRef} preload="metadata" playsInline />

      <ThemeBackdrop
        theme={theme}
        bass={state.metrics.bass}
        treble={state.metrics.treble}
        energy={state.metrics.energy}
        intensify={state.intensify}
      />

      <header className="relative z-20 flex items-start justify-between px-5 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-white/50">
            Hyperfixation Mode
          </p>
          <h1 className="text-lg font-semibold">{WE_DONT_BITE_META.title}</h1>
          <p className="text-sm text-white/60">{WE_DONT_BITE_META.artist}</p>
        </div>
        <div className="flex gap-1 pt-1">
          {VISUAL_THEMES.map((t, i) => (
            <span
              key={t.id}
              className={`h-1.5 w-1.5 rounded-full transition ${
                i === themeIndex ? "bg-white" : "bg-white/25"
              }`}
            />
          ))}
        </div>
      </header>

      <motion.main
        className="relative z-10 flex flex-1 touch-pan-y flex-col"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.08}
        onDragEnd={onThemeSwipe}
        onPointerDown={() => {
          holdTimer.current = window.setTimeout(onHoldStart, 220);
        }}
        onPointerUp={() => {
          if (holdTimer.current) window.clearTimeout(holdTimer.current);
          onHoldEnd();
        }}
        onPointerLeave={() => {
          if (holdTimer.current) window.clearTimeout(holdTimer.current);
          onHoldEnd();
        }}
        onClick={(e) => {
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          const x = e.clientX - rect.left;
          if (x > rect.width * 0.62) advanceLine();
        }}
      >
        {synced && (
          <LyricLine
            line={synced.line}
            timeMs={state.currentTimeMs}
            theme={theme}
            energy={state.metrics.energy}
            intensify={state.intensify}
          />
        )}
        <p className="pointer-events-none px-6 text-center text-[11px] text-white/40">
          Swipe ↔ styles · Scrub vinyl · Tap right edge to flip line · Long-press
          to intensify
        </p>
      </motion.main>

      <ControlDock
        isPlaying={state.isPlaying}
        hasSource={state.hasSource}
        currentMs={state.currentTimeMs}
        durationMs={state.durationMs || WE_DONT_BITE_META.durationMs}
        themeName={theme.name}
        themeIndex={themeIndex}
        themeCount={VISUAL_THEMES.length}
        holdActive={holdActive}
        onToggle={onPlayToggle}
        onSeek={(ms) => {
          setManualLineIndex(null);
          seekMs(ms);
        }}
        onAdvanceLine={advanceLine}
        onLoadFile={loadFile}
      />
    </div>
  );
}
