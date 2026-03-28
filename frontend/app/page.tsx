"use client";

import { Navbar } from "@/components/shared/Navbar";
import { IdleState } from "@/components/booking/IdleState";
import { ActiveCall } from "@/components/booking/ActiveCall";
import { useRetellCall } from "@/hooks/useRetellCall";

export default function Home() {
  const { callState, isSpeaking, isLoading, startCall, endCall } =
    useRetellCall();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main
        id="hero"
        className="flex-1 flex items-center justify-center"
      >
        {callState === "idle" && (
          <IdleState onStart={startCall} isLoading={isLoading} />
        )}

        {callState === "active" && (
          <ActiveCall isSpeaking={isSpeaking} onEnd={endCall} />
        )}

        {callState === "confirmed" && (
          <div className="text-center text-[var(--color-text-secondary)] text-lg animate-pulse">
            Redirecting…
          </div>
        )}
      </main>
    </div>
  );
}
