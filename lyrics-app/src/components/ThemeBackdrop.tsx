"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import type { VisualTheme } from "@/lib/types";

interface ThemeBackdropProps {
  theme: VisualTheme;
  bass: number;
  treble: number;
  energy: number;
  intensify: number;
}

export function ThemeBackdrop({
  theme,
  bass,
  treble,
  energy,
  intensify,
}: ThemeBackdropProps) {
  const pulse = useMotionValue(0);

  useEffect(() => {
    animate(pulse, bass * (1 + intensify * 0.5), {
      duration: 0.12,
      ease: "easeOut",
    });
  }, [bass, intensify, pulse]);

  const scale = useTransform(pulse, (v) => 1 + v * 0.06);
  const glowOpacity = 0.25 + energy * 0.45 + intensify * 0.2;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute inset-[-20%] opacity-80"
        style={{
          scale,
          background: `radial-gradient(circle at 50% 40%, ${theme.palette.glow} 0%, transparent 55%)`,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(165deg, ${theme.palette.bg} 0%, ${theme.palette.bgSecondary} 48%, ${theme.palette.bg} 100%)`,
        }}
      />
      {theme.id === "ink-paper" && (
        <div
          className="absolute inset-0 opacity-[0.08] mix-blend-multiply"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
          }}
        />
      )}
      {theme.id === "liquid-chrome" && (
        <>
          <motion.div
            className="absolute -inset-x-1/4 top-[20%] h-[45%] opacity-40 blur-3xl"
            animate={{ x: ["-12%", "12%", "-12%"] }}
            transition={{ duration: 6 + (1 - energy) * 4, repeat: Infinity, ease: "easeInOut" }}
            style={{
              background: `linear-gradient(105deg, transparent 10%, ${theme.palette.accent} 45%, ${theme.palette.accentAlt} 55%, transparent 90%)`,
            }}
          />
          <motion.div
            className="absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage: `repeating-linear-gradient(-12deg, transparent, transparent 24px, ${theme.palette.accent}22 25px)`,
            }}
            animate={{ x: [0, 40 + bass * 30, 0] }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          />
        </>
      )}
      {theme.id === "cosmic-void" && (
        <motion.div
          className="absolute left-1/2 top-[38%] h-48 w-48 -translate-x-1/2 rounded-full border"
          style={{ borderColor: `${theme.palette.accent}33` }}
          animate={{
            rotate: 360,
            scale: 1 + bass * 0.25,
            boxShadow: `0 0 ${40 + treble * 60}px ${theme.palette.glow}`,
          }}
          transition={{
            rotate: { duration: 18, repeat: Infinity, ease: "linear" },
            scale: { duration: 0.2 },
          }}
        />
      )}
      {theme.id === "cosmic-void" && treble > 0.28 && (
        <motion.div
          className="absolute inset-0"
          initial={false}
          animate={{ opacity: treble * 0.35 }}
        >
          {[...Array(6)].map((_, i) => (
            <motion.span
              key={i}
              className="absolute h-1 w-1 rounded-full"
              style={{
                left: `${15 + i * 14}%`,
                top: `${20 + (i % 3) * 22}%`,
                background: theme.palette.accentAlt,
                boxShadow: `0 0 12px ${theme.palette.accentAlt}`,
              }}
              animate={{
                y: [0, -8 - treble * 20, 0],
                opacity: [0.2, 0.9, 0.2],
              }}
              transition={{
                duration: 1.2 + i * 0.15,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>
      )}
      <motion.div
        className="absolute inset-0"
        style={{ opacity: glowOpacity }}
        animate={{
          boxShadow: `inset 0 0 ${80 + bass * 120}px ${theme.palette.glow}`,
        }}
        transition={{ duration: 0.15 }}
      />
    </div>
  );
}
