"use client";

import { motion } from "framer-motion";
import { Pause, Play, Upload } from "lucide-react";
import type { VisualTheme } from "@/lib/types";
import { themeChrome } from "@/lib/themeChrome";

interface ControlDockProps {
  theme: VisualTheme;
  themeIndex: number;
  themeCount: number;
  isPlaying: boolean;
  hasSource: boolean;
  currentMs: number;
  durationMs: number;
  onToggle: () => void;
  onSeek: (ms: number) => void;
  onLoadFile: (file: File) => void;
  playbackError?: string | null;
}

function formatTime(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export function ControlDock({
  theme,
  themeIndex,
  themeCount,
  isPlaying,
  hasSource,
  currentMs,
  durationMs,
  onToggle,
  onSeek,
  onLoadFile,
  playbackError,
}: ControlDockProps) {
  const chrome = themeChrome(theme);
  const progress = durationMs > 0 ? currentMs / durationMs : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-30 border-t px-5 pt-3 backdrop-blur-xl"
      style={{
        background: chrome.dockBg,
        borderColor: chrome.dockBorder,
        color: chrome.dockText,
        paddingBottom: "max(0.85rem, env(safe-area-inset-bottom))",
      }}
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
    >
      <div className="mb-3 flex items-center gap-3">
        <span
          className="w-12 text-[11px] tabular-nums"
          style={{ color: chrome.dockTextMuted }}
        >
          {formatTime(currentMs)}
        </span>
        <input
          aria-label="Scrub timeline"
          type="range"
          min={0}
          max={1000}
          value={Math.round(progress * 1000)}
          onChange={(e) =>
            onSeek((Number(e.target.value) / 1000) * durationMs)
          }
          className="h-1 flex-1 appearance-none rounded-full"
          style={{
            background: chrome.rangeTrack,
            accentColor: theme.palette.accentAlt,
          }}
        />
        <span
          className="w-12 text-right text-[11px] tabular-nums"
          style={{ color: chrome.dockTextMuted }}
        >
          {formatTime(durationMs)}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <label
          className="inline-flex cursor-pointer items-center gap-2 text-xs"
          style={{ color: chrome.dockTextMuted }}
        >
          <Upload className="h-4 w-4" />
          Audio
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

        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={onToggle}
          disabled={!hasSource}
          className="rounded-full px-7 py-3 disabled:opacity-40"
          style={{
            background: chrome.dockPlayBg,
            color: chrome.dockPlayFg,
          }}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </motion.button>

        <span className="text-[11px]" style={{ color: chrome.dockTextMuted }}>
          {theme.name} {themeIndex + 1}/{themeCount}
        </span>
      </div>

      {playbackError && (
        <p
          className="mt-2 text-center text-[11px]"
          style={{ color: theme.palette.accentAlt }}
        >
          {playbackError}
        </p>
      )}
    </motion.div>
  );
}
