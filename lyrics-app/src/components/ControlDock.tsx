"use client";

import { motion } from "framer-motion";
import {
  Pause,
  Play,
  SkipForward,
  Upload,
  Disc3,
  Hand,
} from "lucide-react";

interface ControlDockProps {
  isPlaying: boolean;
  hasSource: boolean;
  currentMs: number;
  durationMs: number;
  themeName: string;
  themeIndex: number;
  themeCount: number;
  holdActive: boolean;
  onToggle: () => void;
  onSeek: (ms: number) => void;
  onAdvanceLine: () => void;
  onLoadFile: (file: File) => void;
}

function formatTime(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export function ControlDock({
  isPlaying,
  hasSource,
  currentMs,
  durationMs,
  themeName,
  themeIndex,
  themeCount,
  holdActive,
  onToggle,
  onSeek,
  onAdvanceLine,
  onLoadFile,
}: ControlDockProps) {
  const progress = durationMs > 0 ? currentMs / durationMs : 0;

  return (
    <div className="relative z-30 border-t border-white/10 bg-black/35 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl">
      <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-white/60">
        <span>{themeName}</span>
        <span>
          Style {themeIndex + 1}/{themeCount} · swipe
        </span>
      </div>

      <div className="mb-3 flex items-center gap-3">
        <Disc3
          className={`h-5 w-5 shrink-0 ${isPlaying ? "animate-spin" : ""}`}
          style={{ animationDuration: "4s" }}
        />
        <input
          aria-label="Scrub timeline"
          type="range"
          min={0}
          max={1000}
          value={Math.round(progress * 1000)}
          onChange={(e) =>
            onSeek((Number(e.target.value) / 1000) * durationMs)
          }
          className="h-1 flex-1 appearance-none rounded-full bg-white/15 accent-white"
        />
        <span className="w-16 text-right text-xs tabular-nums text-white/70">
          {formatTime(currentMs)}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/15 px-3 py-2 text-xs text-white/80">
          <Upload className="h-4 w-4" />
          Load audio
          <input
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onLoadFile(f);
            }}
          />
        </label>

        <div className="flex items-center gap-2">
          <motion.button
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={onAdvanceLine}
            className="rounded-full border border-white/15 p-3 text-white/90"
            aria-label="Tap to advance line"
          >
            <SkipForward className="h-5 w-5" />
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={onToggle}
            disabled={!hasSource}
            className="rounded-full bg-white px-5 py-3 text-black disabled:opacity-40"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </motion.button>
        </div>

        <div
          className={`inline-flex items-center gap-1 rounded-full px-3 py-2 text-[11px] uppercase tracking-wider ${
            holdActive ? "bg-white text-black" : "border border-white/15 text-white/70"
          }`}
        >
          <Hand className="h-3.5 w-3.5" />
          Hold
        </div>
      </div>
      {!hasSource && (
        <p className="mt-2 text-center text-[11px] text-white/50">
          Add your copy of the track to sync — lyrics timing is pre-mapped.
        </p>
      )}
    </div>
  );
}
