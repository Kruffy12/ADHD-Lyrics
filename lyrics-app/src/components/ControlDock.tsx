"use client";

import { motion } from "framer-motion";
import {
  Pause,
  Play,
  SkipForward,
  Upload,
  Disc3,
  Hand,
  Focus,
} from "lucide-react";

interface ControlDockProps {
  immersive?: boolean;
  isPlaying: boolean;
  hasSource: boolean;
  bundledAudio: boolean;
  currentMs: number;
  durationMs: number;
  themeName: string;
  themeIndex: number;
  themeCount: number;
  holdActive: boolean;
  hyperfixationOn: boolean;
  onToggleHyperfixation: () => void;
  tracks: Array<{ id: string; label: string }>;
  trackIndex: number;
  onSelectTrack: (index: number) => void;
  onToggle: () => void;
  onSeek: (ms: number) => void;
  onAdvanceLine: () => void;
  onLoadFile: (file: File) => void;
  sourceNote: string;
  playbackError?: string | null;
}

function formatTime(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export function ControlDock({
  immersive = false,
  isPlaying,
  hasSource,
  bundledAudio,
  currentMs,
  durationMs,
  themeName,
  themeIndex,
  themeCount,
  holdActive,
  hyperfixationOn,
  onToggleHyperfixation,
  tracks,
  trackIndex,
  onSelectTrack,
  onToggle,
  onSeek,
  onAdvanceLine,
  onLoadFile,
  sourceNote,
  playbackError,
}: ControlDockProps) {
  const progress = durationMs > 0 ? currentMs / durationMs : 0;

  if (immersive) {
    return (
      <div className="relative z-30 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
        <input
          aria-label="Scrub timeline"
          type="range"
          min={0}
          max={1000}
          value={Math.round(progress * 1000)}
          onChange={(e) =>
            onSeek((Number(e.target.value) / 1000) * durationMs)
          }
          className="h-0.5 w-full appearance-none rounded-full bg-white/20 accent-white"
        />
        <div className="mt-3 flex justify-center">
          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={onToggle}
            disabled={!hasSource}
            className="rounded-full bg-white/90 px-6 py-3 text-black disabled:opacity-40"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-30 border-t border-white/10 bg-black/35 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-[11px] uppercase tracking-[0.16em] text-white/60">
        <span>{themeName}</span>
        <select
          value={trackIndex}
          onChange={(e) => onSelectTrack(Number(e.target.value))}
          className="max-w-[55%] truncate rounded-md border border-white/15 bg-black/40 px-2 py-1 text-[11px] normal-case text-white"
          aria-label="Select track"
        >
          {tracks.map((t, i) => (
            <option key={t.id} value={i}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-2 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onToggleHyperfixation}
          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] ${
            hyperfixationOn
              ? "bg-violet-500/30 text-violet-100"
              : "border border-white/15 text-white/60"
          }`}
        >
          <Focus className="h-3 w-3" />
          Hyperfixation
        </button>
        <span className="text-[10px] text-white/45">
          Style {themeIndex + 1}/{themeCount}
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
          {bundledAudio ? "Replace audio" : "Load audio"}
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
            holdActive
              ? "bg-white text-black"
              : "border border-white/15 text-white/70"
          }`}
        >
          <Hand className="h-3.5 w-3.5" />
          Hold
        </div>
      </div>
      <p className="mt-2 text-center text-[10px] leading-relaxed text-white/45">
        {playbackError ? (
          <span className="text-amber-200/90">{playbackError}</span>
        ) : (
          sourceNote
        )}
      </p>
    </div>
  );
}
