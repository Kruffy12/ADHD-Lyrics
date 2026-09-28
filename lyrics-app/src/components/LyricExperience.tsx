"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { AnimatePresence, motion, PanInfo } from "framer-motion";
import { VISUAL_THEMES } from "@/lib/themes";
import { themeChrome } from "@/lib/themeChrome";
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
  const [controlsVisible, setControlsVisible] = useState(true);
  const [holdActive, setHoldActive] = useState(false);
  const [autoHideChorus, setAutoHideChorus] = useState(true);
  const [trackIndex, setTrackIndex] = useState(0);
  const [loaded, setLoaded] = useState<LoadedTrack | null>(null);
  const [lines, setLines] = useState<TimedLine[]>([]);
  const [meta, setMeta] = useState<TrackMeta | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const holdTimer = useRef<number | null>(null);
  const didSwipe = useRef(false);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);

  const theme = VISUAL_THEMES[themeIndex];
  const chrome = themeChrome(theme);
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
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : "Failed to load track");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [catalogEntry]);

  useEffect(() => {
    if (!loaded?.audioUrl) return;
    void loadUrl(loaded.audioUrl);
  }, [loaded?.audioUrl, loadUrl]);

  const synced = useMemo(
    () => findActiveLine(lines, state.currentTimeMs),
    [lines, state.currentTimeMs],
  );

  const chorusAutoHide =
    autoHideChorus &&
    state.isPlaying &&
    synced?.line.mood === "chorus";

  const focusMode = !controlsVisible || chorusAutoHide;

  const onThemeSwipe = useCallback((_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) >= SWIPE_THRESHOLD) {
      didSwipe.current = true;
      if (info.offset.x < -SWIPE_THRESHOLD) {
        setThemeIndex((i) => Math.min(i + 1, VISUAL_THEMES.length - 1));
      } else {
        setThemeIndex((i) => Math.max(i - 1, 0));
      }
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
    toggle();
  }, [toggle]);

  const onSelectTrack = useCallback((index: number) => {
    setTrackIndex(index);
  }, []);

  const handleStagePointerDown = (e: ReactPointerEvent) => {
    pointerStart.current = { x: e.clientX, y: e.clientY };
    holdTimer.current = window.setTimeout(onHoldStart, 280);
  };

  const handleStagePointerUp = (e: ReactPointerEvent) => {
    if (holdTimer.current) window.clearTimeout(holdTimer.current);
    onHoldEnd();

    if (didSwipe.current) {
      didSwipe.current = false;
      return;
    }

    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start) return;
    if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > 14) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;
    const inCenter = nx > 0.18 && nx < 0.82 && ny > 0.12 && ny < 0.88;

    if (inCenter) {
      setControlsVisible((v) => !v);
    }
  };

  if (loadError) {
    return (
      <>
        <audio ref={audioRef} preload="metadata" playsInline className="sr-only" />
        <div className="flex h-[100dvh] items-center justify-center bg-black px-6 text-center text-white">
          <p>{loadError}</p>
        </div>
      </>
    );
  }

  if (!meta || !lines.length) {
    return (
      <>
        <audio ref={audioRef} preload="metadata" playsInline className="sr-only" />
        <div className="flex h-[100dvh] items-center justify-center bg-black text-white/70">
          Loading track…
        </div>
      </>
    );
  }

  return (
    <div
      className="relative flex h-[100dvh] flex-col overflow-hidden"
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
        {controlsVisible && !chorusAutoHide && (
          <motion.header
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="relative z-20 flex items-start justify-between px-5 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))]"
          >
            <div>
              <p
                className="text-[10px] uppercase tracking-[0.28em]"
                style={{ color: chrome.headerSubtext }}
              >
                Tap center · lyrics focus
              </p>
              <h1
                className="text-lg font-semibold"
                style={{ color: chrome.headerTitle }}
              >
                {meta.title}
              </h1>
              <p className="text-sm" style={{ color: chrome.headerSubtext }}>
                {meta.artist}
              </p>
            </div>
            <div className="flex gap-1.5 pt-1">
              {VISUAL_THEMES.map((t, i) => (
                <span
                  key={t.id}
                  className="h-1.5 w-1.5 rounded-full transition"
                  style={{
                    background:
                      i === themeIndex ? chrome.dotActive : chrome.dotIdle,
                  }}
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
        dragElastic={0.06}
        onDragEnd={onThemeSwipe}
        onPointerDown={handleStagePointerDown}
        onPointerUp={handleStagePointerUp}
        onPointerCancel={onHoldEnd}
        onPointerLeave={onHoldEnd}
      >
        {synced && (
          <LyricLine
            line={synced.line}
            timeMs={state.currentTimeMs}
            theme={theme}
            energy={state.metrics.energy}
            intensify={state.intensify}
            focusMode={focusMode}
          />
        )}

        <AnimatePresence>
          {focusMode && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none px-6 text-center text-[10px] uppercase tracking-[0.32em]"
              style={{ color: theme.palette.textMuted }}
            >
              Tap center for controls
            </motion.p>
          )}
        </AnimatePresence>

        {!focusMode && (
          <p
            className="pointer-events-none px-6 pb-2 text-center text-[10px]"
            style={{ color: theme.palette.textMuted }}
          >
            Swipe ↔ change style · Long-press intensify
          </p>
        )}
      </motion.main>

      <AnimatePresence>
        {!focusMode && (
          <ControlDock
            theme={theme}
            isPlaying={state.isPlaying}
            hasSource={state.hasSource}
            bundledAudio={loaded?.bundledAudioAvailable ?? false}
            currentMs={state.currentTimeMs}
            durationMs={state.durationMs || meta.durationMs}
            themeIndex={themeIndex}
            themeCount={VISUAL_THEMES.length}
            holdActive={holdActive}
            autoHideChorus={autoHideChorus}
            onToggleAutoHideChorus={() => setAutoHideChorus((v) => !v)}
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
            onSeek={seekMs}
            onLoadFile={loadFile}
            sourceNote={meta.sourceNote}
            playbackError={state.playbackError}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
