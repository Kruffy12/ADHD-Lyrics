"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, PanInfo } from "framer-motion";
import { VISUAL_THEMES } from "@/lib/themes";
import { findActiveLine } from "@/lib/lyrics/sync";
import {
  TRACK_CATALOG,
  loadTrackBundle,
  type LoadedTrack,
} from "@/lib/tracks/loadTrack";
import type { TimedLine, TrackMeta } from "@/lib/types";
import { useAudioEngine } from "@/lib/audio/useAudioEngine";
import { ThemeBackdrop } from "./ThemeBackdrop";
import { LyricLine } from "./LyricLine";
import { ControlDock } from "./ControlDock";

const SWIPE_THRESHOLD = 80;

export function LyricExperience() {
  const [themeIndex, setThemeIndex] = useState(0);
  const [manualLineIndex, setManualLineIndex] = useState<number | null>(null);
  const [holdActive, setHoldActive] = useState(false);
  const [hyperfixationOn, setHyperfixationOn] = useState(true);
  const [uiPeek, setUiPeek] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [loaded, setLoaded] = useState<LoadedTrack | null>(null);
  const [lines, setLines] = useState<TimedLine[]>([]);
  const [meta, setMeta] = useState<TrackMeta | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const holdTimer = useRef<number | null>(null);
  const peekTimer = useRef<number | null>(null);

  const theme = VISUAL_THEMES[themeIndex];
  const catalogEntry = TRACK_CATALOG[trackIndex];

  const {
    audioRef,
    state,
    loadFile,
    loadUrl,
    toggle,
    seekMs,
    setIntensify,
  } = useAudioEngine(meta?.durationMs ?? 208640);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadError(null);
        const bundle = await loadTrackBundle(catalogEntry);
        if (cancelled) return;
        setLoaded(bundle);
        setLines(bundle.lines);
        setMeta(bundle.meta);
        if (bundle.bundledAudioAvailable) {
          await loadUrl(bundle.audioUrl);
        }
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : "Failed to load track");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [catalogEntry, loadUrl]);

  const synced = useMemo(() => {
    const active = findActiveLine(lines, state.currentTimeMs);
    if (manualLineIndex != null && !state.isPlaying) {
      const line = lines[manualLineIndex];
      return line ? { line, index: manualLineIndex } : active;
    }
    return active;
  }, [lines, manualLineIndex, state.currentTimeMs, state.isPlaying]);

  const immersive =
    hyperfixationOn &&
    state.isPlaying &&
    synced?.line.mood === "chorus" &&
    !uiPeek;

  const advanceLine = useCallback(() => {
    const base = synced?.index ?? 0;
    const next = Math.min(base + 1, lines.length - 1);
    setManualLineIndex(next);
    seekMs(lines[next].startMs);
  }, [lines, seekMs, synced?.index]);

  const onThemeSwipe = useCallback((_: unknown, info: PanInfo) => {
    if (info.offset.x < -SWIPE_THRESHOLD) {
      setThemeIndex((i) => Math.min(i + 1, VISUAL_THEMES.length - 1));
    } else if (info.offset.x > SWIPE_THRESHOLD) {
      setThemeIndex((i) => Math.max(i - 1, 0));
    }
  }, []);

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

  const revealUiBriefly = useCallback(() => {
    setUiPeek(true);
    if (peekTimer.current) window.clearTimeout(peekTimer.current);
    peekTimer.current = window.setTimeout(() => setUiPeek(false), 3200);
  }, []);

  const onSelectTrack = useCallback((index: number) => {
    setTrackIndex(index);
    setManualLineIndex(null);
  }, []);

  if (loadError) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-black px-6 text-center text-white">
        <p>{loadError}</p>
      </div>
    );
  }

  if (!meta || !lines.length) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-black text-white/70">
        Loading track…
      </div>
    );
  }

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

      <AnimatePresence>
        {!immersive && (
          <motion.header
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="relative z-20 flex items-start justify-between px-5 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))]"
          >
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-white/50">
                {hyperfixationOn ? "Hyperfixation · chorus drops hide chrome" : "Full chrome"}
              </p>
              <h1 className="text-lg font-semibold">{meta.title}</h1>
              <p className="text-sm text-white/60">{meta.artist}</p>
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
          </motion.header>
        )}
      </AnimatePresence>

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
          if (immersive) {
            revealUiBriefly();
            return;
          }
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
        {!immersive && (
          <p className="pointer-events-none px-6 text-center text-[11px] text-white/40">
            Swipe ↔ styles · Scrub · Tap right to flip line · Long-press intensify
          </p>
        )}
        {immersive && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.35 }}
            className="pointer-events-none px-6 text-center text-[10px] uppercase tracking-[0.3em] text-white/50"
          >
            Tap for controls
          </motion.p>
        )}
      </motion.main>

      <ControlDock
        immersive={immersive}
        isPlaying={state.isPlaying}
        hasSource={state.hasSource}
        bundledAudio={loaded?.bundledAudioAvailable ?? false}
        currentMs={state.currentTimeMs}
        durationMs={state.durationMs || meta.durationMs}
        themeName={theme.name}
        themeIndex={themeIndex}
        themeCount={VISUAL_THEMES.length}
        holdActive={holdActive}
        hyperfixationOn={hyperfixationOn}
        onToggleHyperfixation={() => setHyperfixationOn((v) => !v)}
        tracks={TRACK_CATALOG.map((t) => ({
          id: t.id,
          label:
            t.id === meta.id
              ? `${meta.title} — ${meta.artist}`
              : t.id.replace(/-/g, " "),
        }))}
        trackIndex={trackIndex}
        onSelectTrack={onSelectTrack}
        onToggle={onPlayToggle}
        onSeek={(ms) => {
          setManualLineIndex(null);
          seekMs(ms);
        }}
        onAdvanceLine={advanceLine}
        onLoadFile={loadFile}
        sourceNote={meta.sourceNote}
      />
    </div>
  );
}
