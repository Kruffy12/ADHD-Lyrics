"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactiveMetrics } from "../types";

const FFT_SIZE = 512;
const SMOOTHING = 0.82;

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

function bandEnergy(data: Uint8Array, start: number, end: number) {
  let sum = 0;
  const from = Math.floor(start);
  const to = Math.min(Math.floor(end), data.length - 1);
  for (let i = from; i <= to; i++) sum += data[i];
  return sum / ((to - from + 1) * 255);
}

export interface AudioEngineState {
  isPlaying: boolean;
  currentTimeMs: number;
  durationMs: number;
  hasSource: boolean;
  metrics: ReactiveMetrics;
  intensify: number;
}

export function useAudioEngine(initialDurationMs: number) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const metricsRef = useRef<ReactiveMetrics>({
    bass: 0,
    mid: 0,
    treble: 0,
    energy: 0,
  });
  const intensifyRef = useRef(0);

  const [state, setState] = useState<AudioEngineState>({
    isPlaying: false,
    currentTimeMs: 0,
    durationMs: initialDurationMs,
    hasSource: false,
    metrics: metricsRef.current,
    intensify: 0,
  });

  const ensureGraph = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || sourceRef.current) return;
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new Ctx();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = FFT_SIZE;
    analyser.smoothingTimeConstant = SMOOTHING;
    const source = ctx.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(ctx.destination);
    ctxRef.current = ctx;
    analyserRef.current = analyser;
    sourceRef.current = source;
  }, []);

  const tick = useCallback(() => {
    const audio = audioRef.current;
    const analyser = analyserRef.current;
    const data = new Uint8Array(analyser?.frequencyBinCount ?? 0);

    if (analyser) {
      analyser.getByteFrequencyData(data);
      const bass = bandEnergy(data, 2, 10);
      const mid = bandEnergy(data, 12, 80);
      const treble = bandEnergy(data, 90, 200);
      const energy = clamp01(bass * 0.45 + mid * 0.35 + treble * 0.2);
      const boost = 1 + intensifyRef.current * 0.65;
      metricsRef.current = {
        bass: clamp01(bass * boost),
        mid: clamp01(mid * boost),
        treble: clamp01(treble * boost),
        energy: clamp01(energy * boost),
      };
    }

    if (audio) {
      setState((prev) => ({
        ...prev,
        currentTimeMs: audio.currentTime * 1000,
        durationMs: (audio.duration || initialDurationMs / 1000) * 1000,
        isPlaying: !audio.paused && !audio.ended,
        metrics: { ...metricsRef.current },
        intensify: intensifyRef.current,
      }));
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [initialDurationMs]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [tick]);

  const loadFile = useCallback(
    async (file: File) => {
      const audio = audioRef.current;
      if (!audio) return;
      const url = URL.createObjectURL(file);
      audio.src = url;
      audio.load();
      ensureGraph();
      setState((prev) => ({ ...prev, hasSource: true }));
      try {
        await ctxRef.current?.resume();
      } catch {
        /* user gesture may be required */
      }
    },
    [ensureGraph],
  );

  const loadUrl = useCallback(
    async (url: string) => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.src = url;
      audio.load();
      ensureGraph();
      setState((prev) => ({ ...prev, hasSource: true }));
      try {
        await ctxRef.current?.resume();
      } catch {
        /* ignored */
      }
    },
    [ensureGraph],
  );

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    ensureGraph();
    try {
      await ctxRef.current?.resume();
      await audio.play();
    } catch {
      /* ignored */
    }
  }, [ensureGraph]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) void play();
    else pause();
  }, [pause, play]);

  const seekMs = useCallback((ms: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration)) return;
    audio.currentTime = Math.min(Math.max(ms / 1000, 0), audio.duration);
  }, []);

  const setIntensify = useCallback((value: number) => {
    intensifyRef.current = clamp01(value);
  }, []);

  return {
    audioRef,
    state,
    loadFile,
    loadUrl,
    play,
    pause,
    toggle,
    seekMs,
    setIntensify,
  };
}
