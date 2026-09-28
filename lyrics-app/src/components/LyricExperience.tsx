"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { VISUAL_THEMES } from "@/lib/themes";
import { themeChrome } from "@/lib/themeChrome";
import { findActiveLine } from "@/lib/lyrics/sync";
import { TRACK_CATALOG, loadTrackBundle } from "@/lib/tracks/loadTrack";
import type { TimedLine, TrackMeta } from "@/lib/types";
import { useAudioEngine } from "@/lib/audio/useAudioEngine";
import { ThemeBackdrop } from "./ThemeBackdrop";
import { LyricLine } from "./LyricLine";
import { ControlDock } from "./ControlDock";
import { SplashScreen } from "./SplashScreen";

const SWIPE_THRESHOLD = 72;
const HUD_IDLE_MS = 2500;

export function LyricExperience() {
  const [themeIndex, setThemeIndex] = useState(0);
  const [hudVisible, setHudVisible] = useState(true);
  const trackIndex = 0;
  const [lines, setLines] = useState<TimedLine[]>([]);
  const [meta, setMeta] = useState<TrackMeta | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [splashOn, setSplashOn] = useState(true);
  const holdTimer = useRef<number | null>(null);
  const hudTimer = useRef<number | null>(null);
  const didSwipe = useRef(false);
  const held = useRef(false);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);

  const theme = VISUAL_THEMES[themeIndex];
  const chrome = themeChrome(theme);
  const catalogEntry = TRACK_CATALOG[trackIndex];

  const { audioRef, state, loadFile, loadUrl, toggle, seekMs, setIntensify } =
    useAudioEngine(meta?.durationMs ?? 208640);

  const armHudIdle = useCallback(() => {
    if (hudTimer.current) window.clearTimeout(hudTimer.current);
    hudTimer.current = window.setTimeout(() => setHudVisible(false), HUD_IDLE_MS);
  }, []);

  const showHud = useCallback(() => {
    setHudVisible(true);
    armHudIdle();
  }, [armHudIdle]);

  useEffect(() => {
    armHudIdle();
    return () => {
      if (hudTimer.current) window.clearTimeout(hudTimer.current);
    };
  }, [armHudIdle]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadError(null);
        const bundle = await loadTrackBundle(catalogEntry);
        if (cancelled) return;
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
    if (!meta) return;
    const t = window.setTimeout(() => setSplashOn(false), 900);
    return () => window.clearTimeout(t);
  }, [meta]);

  useEffect(() => {
    if (!meta?.audioUrl) return;
    void loadUrl(meta.audioUrl);
  }, [meta?.audioUrl, loadUrl]);

  const synced = useMemo(
    () => findActiveLine(lines, state.currentTimeMs),
    [lines, state.currentTimeMs],
  );

  const onThemeSwipe = useCallback(
    (_: unknown, info: PanInfo) => {
      if (Math.abs(info.offset.x) < SWIPE_THRESHOLD) return;
      didSwipe.current = true;
      showHud();
      if (info.offset.x < 0) {
        setThemeIndex((i) => Math.min(i + 1, VISUAL_THEMES.length - 1));
      } else {
        setThemeIndex((i) => Math.max(i - 1, 0));
      }
    },
    [showHud],
  );

  const onPointerDown = (e: ReactPointerEvent) => {
    pointerStart.current = { x: e.clientX, y: e.clientY };
    held.current = false;
    holdTimer.current = window.setTimeout(() => {
      held.current = true;
      setIntensify(1);
    }, 280);
  };

  const onPointerUp = (e: ReactPointerEvent) => {
    if (holdTimer.current) window.clearTimeout(holdTimer.current);
    setIntensify(0);
    const start = pointerStart.current;
    pointerStart.current = null;
    if (didSwipe.current) {
      didSwipe.current = false;
      return;
    }
    if (held.current) {
      held.current = false;
      return;
    }
    if (!start) return;
    if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > 16) return;
    setHudVisible((visible) => {
      const next = !visible;
      if (next) armHudIdle();
      else if (hudTimer.current) window.clearTimeout(hudTimer.current);
      return next;
    });
  };

  if (loadError) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-[#050508] px-6 text-center text-white">
        <p>{loadError}</p>
      </div>
    );
  }

  return (
    <div
      className="relative flex h-[100dvh] flex-col overflow-hidden"
      style={{ color: theme.palette.text, background: theme.palette.bg }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => setIntensify(0)}
    >
      <audio ref={audioRef} preload="metadata" playsInline className="hidden" />
      <AnimatePresence>{splashOn && <SplashScreen />}</AnimatePresence>

      <ThemeBackdrop
        theme={theme}
        bass={state.metrics.bass}
        treble={state.metrics.treble}
        energy={state.metrics.energy}
        intensify={state.intensify}
      />

      <AnimatePresence>
        {hudVisible && meta && (
          <motion.header
            key="hud-header"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28 }}
            className="relative z-20 flex items-start justify-between px-5"
            style={{
              paddingTop: "max(0.7rem, env(safe-area-inset-top))",
            }}
          >
            <div>
              <h1 className="text-lg font-semibold leading-tight" style={{ color: chrome.headerTitle }}>
                {meta.title}
              </h1>
              <p className="text-sm" style={{ color: chrome.headerSubtext }}>
                {meta.artist}
              </p>
            </div>
            <div className="flex gap-1.5 pt-2" aria-hidden>
              {VISUAL_THEMES.map((t, i) => (
                <span
                  key={t.id}
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    background: i === themeIndex ? chrome.dotActive : chrome.dotIdle,
                  }}
                />
              ))}
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      <motion.main
        className="relative z-10 flex min-h-0 flex-1 items-center justify-center overflow-visible"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.05}
        onDrag={(_, info) => {
          if (Math.abs(info.offset.x) > 28) didSwipe.current = true;
        }}
        onDragEnd={onThemeSwipe}
      >
        {synced && (
          <LyricLine
            line={synced.line}
            timeMs={state.currentTimeMs}
            theme={theme}
            energy={state.metrics.energy}
            intensify={state.intensify}
            focusMode={!hudVisible}
          />
        )}
      </motion.main>

      <AnimatePresence>
        {hudVisible && meta && (
          <ControlDock
            key="hud-dock"
            theme={theme}
            themeIndex={themeIndex}
            themeCount={VISUAL_THEMES.length}
            isPlaying={state.isPlaying}
            hasSource={state.hasSource}
            currentMs={state.currentTimeMs}
            durationMs={state.durationMs || meta.durationMs}
            onToggle={() => {
              showHud();
              toggle();
            }}
            onSeek={(ms) => {
              showHud();
              seekMs(ms);
            }}
            onLoadFile={(file) => {
              showHud();
              void loadFile(file);
            }}
            playbackError={state.playbackError}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
