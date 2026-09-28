"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Pause, Play, Upload, Disc3, Hand, Focus } from "lucide-react";
import type { VisualTheme } from "@/lib/types";
import { themeChrome } from "@/lib/themeChrome";

interface ControlDockProps {
  theme: VisualTheme;
  isPlaying: boolean;
  hasSource: boolean;
  bundledAudio: boolean;
  currentMs: number;
  durationMs: number;
  themeIndex: number;
  themeCount: number;
  holdActive: boolean;
  autoHideChorus: boolean;
  onToggleAutoHideChorus: () => void;
  tracks: Array<{ id: string; label: string }>;
  trackIndex: number;
  onSelectTrack: (index: number) => void;
  onToggle: () => void;
  onSeek: (ms: number) => void;
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
  theme,
  isPlaying,
  hasSource,
  bundledAudio,
  currentMs,
  durationMs,
  themeIndex,
  themeCount,
  holdActive,
  autoHideChorus,
  onToggleAutoHideChorus,
  tracks,
  trackIndex,
  onSelectTrack,
  onToggle,
  onSeek,
  onLoadFile,
  sourceNote,
  playbackError,
}: ControlDockProps) {
  const chrome = themeChrome(theme);
  const progress = durationMs > 0 ? currentMs / durationMs : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="relative z-30 border-t px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl"
      style={{
        background: chrome.dockBg,
        borderColor: chrome.dockBorder,
        color: chrome.dockText,
      }}
    >
      <div
        className="mb-2 flex flex-wrap items-center justify-between gap-2 text-[11px] uppercase tracking-[0.16em]"
        style={{ color: chrome.dockTextMuted }}
      >
        <span>{theme.name}</span>
        <select
          value={trackIndex}
          onChange={(e) => onSelectTrack(Number(e.target.value))}
          className="max-w-[55%] truncate rounded-md border px-2 py-1 text-[11px] normal-case"
          style={{
            borderColor: chrome.dockBorder,
            background: chrome.dockControlBg,
            color: chrome.dockText,
          }}
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
          onClick={onToggleAutoHideChorus}
          className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px]"
          style={{
            background: autoHideChorus
              ? `${theme.palette.accentAlt}33`
              : chrome.dockControlBg,
            color: autoHideChorus ? theme.palette.text : chrome.dockTextMuted,
            border: `1px solid ${chrome.dockBorder}`,
          }}
        >
          <Focus className="h-3 w-3" />
          Auto-hide chorus
        </button>
        <span className="text-[10px]" style={{ color: chrome.dockTextMuted }}>
          Style {themeIndex + 1}/{themeCount} · swipe ↔
        </span>
      </div>

      <div className="mb-3 flex items-center gap-3">
        <Disc3
          className={`h-5 w-5 shrink-0 ${isPlaying ? "animate-spin" : ""}`}
          style={{ color: chrome.dockTextMuted, animationDuration: "4s" }}
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
          className="h-1 flex-1 appearance-none rounded-full"
          style={{
            background: chrome.rangeTrack,
            accentColor: theme.palette.accentAlt,
          }}
        />
        <span
          className="w-16 text-right text-xs tabular-nums"
          style={{ color: chrome.dockTextMuted }}
        >
          {formatTime(currentMs)}
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <label
          className="inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-xs"
          style={{
            borderColor: chrome.dockBorder,
            color: chrome.dockText,
          }}
        >
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

        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={onToggle}
          disabled={!hasSource}
          className="rounded-full px-6 py-3 disabled:opacity-40"
          style={{
            background: chrome.dockPlayBg,
            color: chrome.dockPlayFg,
          }}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}
        </motion.button>

        <div
          className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-[11px] uppercase tracking-wider"
          style={{
            background: holdActive ? chrome.dockPlayBg : chrome.dockControlBg,
            color: holdActive ? chrome.dockPlayFg : chrome.dockTextMuted,
            border: holdActive ? "none" : `1px solid ${chrome.dockBorder}`,
          }}
        >
          <Hand className="h-3.5 w-3.5" />
          Hold
        </div>
      </div>
      <p
        className="mt-2 text-center text-[10px] leading-relaxed"
        style={{ color: chrome.dockTextMuted }}
      >
        {playbackError ? (
          <span style={{ color: theme.palette.accentAlt }}>{playbackError}</span>
        ) : (
          sourceNote
        )}
      </p>
    </motion.div>
  );
}
