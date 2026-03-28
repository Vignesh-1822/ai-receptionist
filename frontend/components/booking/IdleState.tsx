"use client";

import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/shared/StatCard";

interface IdleStateProps {
  onStart: () => void;
  isLoading: boolean;
}

function ClockIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
      className="animate-spin"
    >
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  );
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
            <Spinner />
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
          <StatCard icon={<ClockIcon />} label="Avg booking time" value="47s" />
        </div>
        <div role="listitem" className="flex min-w-0 flex-1">
          <StatCard icon={<CalendarIcon />} label="Available today" value="3 slots" />
        </div>
        <div role="listitem" className="flex min-w-0 flex-1">
          <StatCard icon={<ClockIcon />} label="Next opening" value="2:00 PM" />
        </div>
      </div>
    </div>
  );
}
