"use client";

import { motion } from "framer-motion";
import { Mic, PhoneOff } from "lucide-react";

interface ActiveCallProps {
  isSpeaking: boolean;
  isUserSpeaking: boolean;
  onEnd: () => void;
}

const RINGS: { size: number; baseOpacity: number; delay: number }[] = [
  { size: 110, baseOpacity: 0.35, delay: 0 },
  { size: 145, baseOpacity: 0.22, delay: 0.3 },
  { size: 180, baseOpacity: 0.12, delay: 0.6 },
];

const WAVE_BARS: { duration: number; delay: number }[] = [
  { duration: 0.8, delay: 0 },
  { duration: 0.6, delay: 0.1 },
  { duration: 0.9, delay: 0.2 },
  { duration: 0.7, delay: 0.15 },
  { duration: 0.8, delay: 0.05 },
  { duration: 0.6, delay: 0.25 },
  { duration: 0.9, delay: 0.1 },
];

export function ActiveCall({ isSpeaking, isUserSpeaking, onEnd }: ActiveCallProps) {
  function handleEndCall() {
    if (window.confirm("Are you sure you want to end the call?")) {
      onEnd();
    }
  }

  const label = isSpeaking ? "Aria is speaking…" : "Aria is listening…";
  const sublabel = isSpeaking ? "Aria is responding to you" : "Speak naturally — Aria will guide you";

  return (
    <div className="flex flex-col items-center text-center gap-6 max-w-[520px] mx-auto">

      {/* Call in progress pill */}
      <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-primary)] px-4 py-1.5">
        <span
          aria-hidden="true"
          className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse"
        />
        <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-primary)]">
          Call in progress
        </span>
      </div>

      {/* Heading */}
      <h2 className="font-[family-name:var(--font-serif)] text-4xl md:text-[2.5rem] text-[var(--color-text-primary)] leading-[1.2] m-0 transition-all duration-300">
        {label}
      </h2>

      {/* Subtext */}
      <p className="text-sm text-[var(--color-text-muted)] m-0 transition-all duration-300">
        {sublabel}
      </p>

      {/* Mic circle with rings */}
      <div
        className="relative flex items-center justify-center w-[200px] h-[200px]"
        aria-label={label}
        role="status"
      >
        {RINGS.map(({ size, baseOpacity, delay }) => (
          <motion.div
            key={size}
            aria-hidden="true"
            className="absolute rounded-full border-[1.5px] border-[var(--color-primary)]"
            style={{ width: size, height: size, top: "50%", left: "50%" }}
            initial={{ x: "-50%", y: "-50%", scale: 1, opacity: baseOpacity * 0.5 }}
            animate={{
              x: "-50%",
              y: "-50%",
              scale: isSpeaking ? [1, 1.06, 1] : 1,
              opacity: isSpeaking
                ? [baseOpacity, baseOpacity * 0.7, baseOpacity]
                : baseOpacity * 0.5,
            }}
            transition={{
              duration: 2,
              repeat: isSpeaking ? Infinity : 0,
              ease: "easeInOut",
              delay,
            }}
          />
        ))}

        {/* Center mic circle — pulses green when user is speaking */}
        <motion.div
          className="relative z-10 flex items-center justify-center w-[76px] h-[76px] rounded-full shadow-[var(--shadow-card)]"
          animate={{
            backgroundColor: isUserSpeaking
              ? ["#94f990", "#6be868", "#94f990"]
              : "var(--color-bg-card)",
            scale: isUserSpeaking ? [1, 1.08, 1] : 1,
          }}
          transition={{
            duration: 0.6,
            repeat: isUserSpeaking ? Infinity : 0,
            ease: "easeInOut",
          }}
          style={{ color: isUserSpeaking ? "#005614" : "var(--color-primary)" }}
        >
          <Mic size={24} aria-hidden="true" />
        </motion.div>
      </div>

      {/* Waveform — animates for Aria speaking OR user speaking */}
      <div className="flex items-end gap-[3px] h-[32px]" aria-hidden="true">
        {WAVE_BARS.map(({ duration, delay }, i) => (
          <motion.div
            key={i}
            className="w-1 rounded-[3px]"
            style={{ backgroundColor: isUserSpeaking ? "#005614" : "var(--color-primary)" }}
            animate={{ height: (isSpeaking || isUserSpeaking) ? [6, 28, 6] : 6 }}
            transition={{
              duration: isUserSpeaking ? duration * 0.6 : duration,
              repeat: (isSpeaking || isUserSpeaking) ? Infinity : 0,
              ease: "easeInOut",
              delay,
            }}
          />
        ))}
      </div>

      {/* End call button */}
      <button
        type="button"
        onClick={handleEndCall}
        aria-label="End the call"
        className="inline-flex items-center gap-2 rounded-full border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-6 py-2.5 text-sm font-medium text-[var(--color-danger)] transition-colors duration-[var(--transition-fast)] hover:brightness-95 cursor-pointer"
      >
        <PhoneOff size={14} aria-hidden="true" />
        End call
      </button>
    </div>
  );
}
