"use client";

import { Clock, CalendarDays, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/shared/StatCard";

interface IdleStateProps {
  onStart: () => void;
  isLoading: boolean;
}

export function IdleState({ onStart, isLoading }: IdleStateProps) {
  return (
    <div className="flex flex-col items-center text-center max-w-[600px] mx-auto gap-7">
      {/* Pill label */}
      <div className="flex items-center gap-2 p-2 bg-[var(--color-primary-light)] border border-[var(--color-primary-border)] rounded-full">
        <span
          aria-hidden="true"
          className="w-2 h-2 rounded-full bg-[var(--color-success)] animate-pulse"
        />
        <span className="text-xs font-semibold tracking-[0.1em] text-[var(--color-primary)] uppercase">
          AI Receptionist
        </span>
      </div>

      {/* Heading */}
      <h1 className="font-[family-name:var(--font-newsreader)] text-4xl md:text-[2.75rem] text-[var(--color-text-primary)] leading-[1.2] m-0">
        Book your appointment by having a conversation
      </h1>

      {/* Subtext */}
      <p className="text-[1.0625rem] leading-relaxed text-[var(--color-text-secondary)] m-0 max-w-[480px]">
        Talk to Aria. She checks availability and books your slot in under 60
        seconds.
      </p>

      {/* Start call button */}
      <Button
        onClick={onStart}
        disabled={isLoading}
        aria-label={isLoading ? "Connecting to Aria…" : "Start voice call with Aria"}
        className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-full px-8 py-3 text-base font-medium inline-flex items-center gap-2.5 h-auto disabled:opacity-80 disabled:cursor-not-allowed transition-colors duration-[var(--transition-fast)]"
      >
        {isLoading ? (
          <>
            <Loader2 size={18} className="animate-spin" aria-hidden="true" />
            Connecting…
          </>
        ) : (
          <>
            <span
              aria-hidden="true"
              className="w-2 h-2 rounded-full bg-white animate-pulse opacity-90"
            />
            Start voice call
          </>
        )}
      </Button>

      {/* Stat cards */}
      <div
        role="list"
        aria-label="Booking statistics"
        className="mt-2 flex w-full gap-4"
      >
        <div role="listitem" className="flex min-w-0 flex-1">
          <StatCard icon={<Clock size={20} />} label="Avg booking time" value="47s" />
        </div>
        <div role="listitem" className="flex min-w-0 flex-1">
          <StatCard icon={<CalendarDays size={20} />} label="Available today" value="3 slots" />
        </div>
        <div role="listitem" className="flex min-w-0 flex-1">
          <StatCard icon={<Clock size={20} />} label="Next opening" value="2:00 PM" />
        </div>
      </div>
    </div>
  );
}
