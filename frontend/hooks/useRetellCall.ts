"use client";

import { useState, useCallback } from "react";
import { retellClient, startCall as retellStartCall, endCall as retellEndCall } from "@/lib/retell";
import { env } from "@/lib/env";
import type { Booking } from "@/types/booking";

export type CallState = "idle" | "active" | "confirmed";

export interface UseRetellCallReturn {
  callState: CallState;
  isSpeaking: boolean;
  booking: Booking | null;
  isLoading: boolean;
  error: string | null;
  startCall: () => Promise<void>;
  endCall: () => void;
}

export function useRetellCall(): UseRetellCallReturn {
  const [callState, setCallState] = useState<CallState>("idle");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCall = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      retellClient.on("call_started", () => {
        setCallState("active");
        setIsLoading(false);
      });

      retellClient.on("agent_start_talking", () => {
        setIsSpeaking(true);
      });

      retellClient.on("agent_stop_talking", () => {
        setIsSpeaking(false);
      });

      retellClient.on("call_ended", () => {
        setCallState("confirmed");
        setIsSpeaking(false);
        setBooking({
          id: "test-001",
          customer_name: "Test Patient",
          phone_number: "",
          service: "Dental Consultation",
          date: "Thursday Mar 27",
          time: "2:00 PM",
          status: "confirmed",
          created_at: new Date().toISOString(),
        });
      });

      retellClient.on("error", (err: Error) => {
        setError(err.message ?? "An error occurred during the call.");
        setCallState("idle");
        setIsLoading(false);
      });

      await retellStartCall(env.retellAgentId);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to start call.";
      setError(message);
      setCallState("idle");
      setIsLoading(false);
    }
  }, []);

  const endCall = useCallback(() => {
    retellEndCall();
    setCallState("idle");
    setIsSpeaking(false);
    setBooking(null);
    setIsLoading(false);
    setError(null);
  }, []);

  return { callState, isSpeaking, booking, isLoading, error, startCall, endCall };
}
