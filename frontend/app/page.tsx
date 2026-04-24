"use client";

import { PhoneOff } from "lucide-react";
import { Navbar } from "@/components/shared/Navbar";
import { IdleState } from "@/components/booking/IdleState";
import { ActiveCall } from "@/components/booking/ActiveCall";
import { ConfirmationCard } from "@/components/booking/ConfirmationCard";
import { useRetellCall } from "@/hooks/useRetellCall";

export default function Home() {
  const { callState, isSpeaking, isLoading, booking, startCall, endCall, resetToIdle } =
    useRetellCall();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main
        id="hero"
        className="flex-1 flex items-center justify-center px-6"
        style={{ paddingTop: "var(--nav-height)" }}
      >
        {callState === "idle" && (
          <IdleState onStart={startCall} isLoading={isLoading} />
        )}

        {callState === "active" && (
          <ActiveCall isSpeaking={isSpeaking} onEnd={endCall} />
        )}

        {callState === "cancelled" && (
          <div className="flex flex-col items-center text-center gap-6 max-w-[420px]">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-danger-bg)] text-[var(--color-danger)]">
              <PhoneOff size={28} aria-hidden="true" />
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="font-[family-name:var(--font-serif)] text-2xl text-[var(--color-text-primary)] m-0">
                Call ended
              </h2>
              <p className="text-sm text-[var(--color-text-secondary)] m-0">
                No booking was made. Start a new call whenever you&apos;re ready.
              </p>
            </div>
            <button
              type="button"
              onClick={resetToIdle}
              aria-label="Start a new call"
              className="rounded-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-8 py-3 text-sm font-medium transition-colors duration-[var(--transition-fast)] cursor-pointer border-none"
            >
              Try again
            </button>
          </div>
        )}

        {callState === "confirmed" && (
          <ConfirmationCard booking={booking} onReset={resetToIdle} />
        )}
      </main>
    </div>
  );
}
