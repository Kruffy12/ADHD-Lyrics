"use client";

import { motion } from "framer-motion";

export function SplashScreen() {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#050508]"
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <motion.img
        src={`${(process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "")}/icons/icon-512.png`}
        alt=""
        width={168}
        height={168}
        className="h-40 w-40 rounded-[2rem] shadow-[0_0_80px_rgba(255,45,149,0.35)]"
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 22 }}
      />
    </motion.div>
  );
}
