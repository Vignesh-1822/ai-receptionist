"use client";

import { useState, useCallback, useRef } from "react";
import { retellClient, startCall as retellStartCall, endCall as retellEndCall } from "@/lib/retell";
import { env } from "@/lib/env";
import type { Booking } from "@/types/booking";

export type CallState = "idle" | "active" | "confirmed" | "cancelled";

export interface UseRetellCallReturn {
  callState: CallState;
  isSpeaking: boolean;
  booking: Booking | null;
  isLoading: boolean;
  error: string | null;
  startCall: () => Promise<void>;
  endCall: () => void;
  resetToIdle: () => void;
}

export function useRetellCall(): UseRetellCallReturn {
  const [callState, setCallState] = useState<CallState>("idle");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const callIdRef = useRef<string | null>(null);

  const fetchBooking = useCallback(async (callId: string) => {
    // Wait 2s for the webhook to finish saving the booking
    await new Promise((r) => setTimeout(r, 2000));
    try {
      const res = await fetch(`${env.apiUrl}/api/bookings/${callId}`);
      if (res.ok) {
        setBooking(await res.json());
      }
    } catch {
      // booking fetch failed — confirmed screen still shows without details
    }
  }, []);

  const startCall = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      retellClient.on("call_started", () => {
        setCallState("active");
        setIsLoading(false);
      });

      retellClient.on("agent_start_talking", () => setIsSpeaking(true));
      retellClient.on("agent_stop_talking", () => setIsSpeaking(false));

      retellClient.on("call_ended", () => {
        setCallState("confirmed");
        setIsSpeaking(false);
        if (callIdRef.current) {
          fetchBooking(callIdRef.current);
        }
      });

      retellClient.on("error", (err: Error) => {
        setError(err.message ?? "An error occurred during the call.");
        setCallState("idle");
        setIsLoading(false);
      });

      const callId = await retellStartCall(env.retellAgentId);
      callIdRef.current = callId;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to start call.";
      setError(message);
      setCallState("idle");
      setIsLoading(false);
    }
  }, [fetchBooking]);

  const endCall = useCallback(() => {
    retellEndCall();
    setCallState("cancelled");
    setIsSpeaking(false);
    setBooking(null);
    setIsLoading(false);
    setError(null);
  }, []);

  const resetToIdle = useCallback(() => {
    setCallState("idle");
    setError(null);
  }, []);

  return { callState, isSpeaking, booking, isLoading, error, startCall, endCall, resetToIdle };
}
