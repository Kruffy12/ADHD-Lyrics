"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Bot,
  Cake,
  DoorClosed,
  Flashlight,
  Moon,
  PartyPopper,
  Skull,
  Sparkles,
  UserX,
  Zap,
} from "lucide-react";
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

export function WordGraphicBurst({
  graphic,
  accent,
  energy,
}: {
  graphic: WordGraphic;
  accent: string;
  accentAlt: string;
  energy: number;
}) {
  const Icon = ICONS[graphic];
  return (
    <motion.div
      className="pointer-events-none absolute left-1/2 top-[12%] z-20 -translate-x-1/2"
      initial={{ opacity: 0, scale: 0.7, y: 10 }}
      animate={{ opacity: 0.9, scale: 1 + energy * 0.08, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -8 }}
      transition={{ type: "spring", stiffness: 380, damping: 24 }}
      style={{ color: accent, background: "transparent" }}
    >
      <Icon className="h-10 w-10" strokeWidth={1.5} />
    </motion.div>
  );
}
