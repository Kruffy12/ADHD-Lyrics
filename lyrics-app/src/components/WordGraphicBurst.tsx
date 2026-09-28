"use client";

import { motion } from "framer-motion";
import {
  Flashlight,
  Sparkles,
  Moon,
  DoorClosed,
  Cake,
  Bot,
  Skull,
  PartyPopper,
  UserX,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { WordGraphic } from "@/lib/types";

const ICONS: Record<WordGraphic, LucideIcon> = {
  flashlight: Flashlight,
  bite: Skull,
  animatronic: Bot,
  nightmare: Moon,
  cupcake: Cake,
  freddy: Bot,
  door: DoorClosed,
  party: PartyPopper,
  alone: UserX,
  spark: Sparkles,
  run: Zap,
};

interface WordGraphicBurstProps {
  graphic: WordGraphic;
  accent: string;
  accentAlt: string;
  energy: number;
}

export function WordGraphicBurst({
  graphic,
  accent,
  accentAlt,
  energy,
}: WordGraphicBurstProps) {
  const Icon = ICONS[graphic];
  return (
    <motion.div
      className="pointer-events-none absolute left-1/2 top-[18%] z-20 -translate-x-1/2"
      initial={{ opacity: 0, scale: 0.6, y: 16 }}
      animate={{ opacity: 1, scale: 1 + energy * 0.15, y: 0 }}
      exit={{ opacity: 0, scale: 0.85, y: -12 }}
      transition={{ type: "spring", stiffness: 420, damping: 24 }}
    >
      <div
        className="flex h-16 w-16 items-center justify-center rounded-2xl backdrop-blur-md"
        style={{
          background: `linear-gradient(135deg, ${accent}33, ${accentAlt}44)`,
          boxShadow: `0 0 ${24 + energy * 40}px ${accent}55`,
          border: `1px solid ${accent}66`,
        }}
      >
        <Icon className="h-8 w-8" strokeWidth={1.75} />
      </div>
    </motion.div>
  );
}
