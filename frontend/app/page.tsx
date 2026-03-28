"use client";

import { Navbar } from "@/components/shared/Navbar";
import { IdleState } from "@/components/booking/IdleState";
import { useRetellCall } from "@/hooks/useRetellCall";

export default function Home() {
  const { callState, isLoading, startCall } = useRetellCall();

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
      </main>
    </div>
  );
}
