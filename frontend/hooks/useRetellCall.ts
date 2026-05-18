"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { retellClient, startCall as retellStartCall, endCall as retellEndCall } from "@/lib/retell";
import { env } from "@/lib/env";
import type { Booking } from "@/types/booking";

export type CallState = "idle" | "active" | "confirmed" | "cancelled";

export interface UseRetellCallReturn {
  callState: CallState;
  isSpeaking: boolean;
  isUserSpeaking: boolean;
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
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const callIdRef = useRef<string | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  // Mic level analyser — runs while call is active
  useEffect(() => {
    if (callState !== "active") {
      setIsUserSpeaking(false);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (micStreamRef.current) micStreamRef.current.getTracks().forEach((t) => t.stop());
      return;
    }

    let cancelled = false;

    navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then((stream) => {
      if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
      micStreamRef.current = stream;

      const ctx = new AudioContext();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.4;
      source.connect(analyser);

      const data = new Uint8Array(analyser.frequencyBinCount);

      function tick() {
        if (cancelled) return;
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setIsUserSpeaking(avg > 8);
        animFrameRef.current = requestAnimationFrame(tick);
      }
      tick();
    }).catch(() => {});

    return () => {
      cancelled = true;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (micStreamRef.current) micStreamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, [callState]);

  const fetchBooking = useCallback(async (callId: string) => {
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
    setBooking(null); // clear any previous booking before starting

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true }).then((s) =>
        s.getTracks().forEach((t) => t.stop())
      );

      retellClient.removeAllListeners();

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
      const isMicDenied =
        err instanceof DOMException &&
        (err.name === "NotAllowedError" || err.name === "PermissionDeniedError");
      setError(
        isMicDenied
          ? "Microphone access is required. Please allow it and try again."
          : err instanceof Error
          ? err.message
          : "Failed to start call."
      );
      setCallState("idle");
      setIsLoading(false);
    }
  }, [fetchBooking]);

  const endCall = useCallback(() => {
    retellEndCall();
    setCallState("cancelled");
    setIsSpeaking(false);
    setIsUserSpeaking(false);
    setBooking(null);
    setIsLoading(false);
    setError(null);
  }, []);

  const resetToIdle = useCallback(() => {
    setCallState("idle");
    setError(null);
  }, []);

  return { callState, isSpeaking, isUserSpeaking, booking, isLoading, error, startCall, endCall, resetToIdle };
}
