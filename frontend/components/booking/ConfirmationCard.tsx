"use client";

import { CheckCircle, Calendar, CalendarPlus, Leaf } from "lucide-react";
import { buildGoogleCalendarUrl, downloadIcsFile } from "@/lib/calendar";
import type { Booking } from "@/types/booking";

interface ConfirmationCardProps {
  booking: Booking | null;
  onReset: () => void;
}

export function ConfirmationCard({ booking, onReset }: ConfirmationCardProps) {
  return (
    <main className="max-w-xl w-full flex flex-col items-center text-center gap-8 px-4 py-10">

      {/* Animated checkmark */}
      <div className="relative">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center shadow-sm"
          style={{ backgroundColor: "#94f990" }}
        >
          <CheckCircle size={52} fill="#005614" stroke="none" />
        </div>
        <div
          className="absolute inset-0 rounded-full animate-ping opacity-20"
          style={{ backgroundColor: "#94f990" }}
        />
      </div>

      {/* Heading */}
      <div className="flex flex-col gap-2">
        <h1
          className="text-5xl font-light italic tracking-tight m-0"
          style={{
            fontFamily: "var(--font-serif)",
            color: "#0c5252",
          }}
        >
          You&apos;re all booked!
        </h1>
        <p className="text-lg m-0" style={{ color: "#3f4848" }}>
          Aria confirmed your appointment at Kanmani Clinic
        </p>
      </div>

      {/* Booking detail card */}
      <div
        className="w-full rounded-xl p-8"
        style={{
          backgroundColor: "#ffffff",
          boxShadow: "0px 20px 40px rgba(27,28,26,0.05)",
          border: "1px solid rgba(191,200,200,0.3)",
        }}
      >
        <div className="flex flex-col gap-0">
          <DetailRow label="Name" value={booking?.customer_name ?? "—"} />
          <Divider />
          <DetailRow label="Service" value={booking?.service ?? "—"} />
          <Divider />
          <DetailRow label="Date" value={booking?.date ?? "—"} />
          <Divider />
          <DetailRow label="Time" value={booking?.time ?? "—"} />
        </div>
      </div>

      {/* Calendar buttons */}
      <div className="flex flex-col sm:flex-row gap-4 w-full">
        {booking ? (
          <a
            href={buildGoogleCalendarUrl(booking)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-full font-semibold text-sm tracking-wide text-white no-underline transition-opacity hover:opacity-90 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #0c5252, #2d6a6a)",
              boxShadow: "0 4px 14px rgba(12,82,82,0.3)",
            }}
          >
            <Calendar size={18} />
            Add to Google Calendar
          </a>
        ) : (
          <div
            className="flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-full font-semibold text-sm tracking-wide text-white opacity-40"
            style={{ background: "linear-gradient(135deg, #0c5252, #2d6a6a)" }}
          >
            <Calendar size={18} />
            Add to Google Calendar
          </div>
        )}

        {booking ? (
          <button
            type="button"
            onClick={() => downloadIcsFile(booking)}
            className="flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-full font-semibold text-sm tracking-wide transition-colors active:scale-95 cursor-pointer bg-transparent"
            style={{
              border: "2px solid #0c5252",
              color: "#0c5252",
            }}
          >
            <CalendarPlus size={18} />
            Add to Apple Calendar
          </button>
        ) : (
          <div
            className="flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-full font-semibold text-sm tracking-wide opacity-40"
            style={{ border: "2px solid #0c5252", color: "#0c5252" }}
          >
            <CalendarPlus size={18} />
            Add to Apple Calendar
          </div>
        )}
      </div>

      {/* Bottom note */}
      <p className="text-sm italic m-0" style={{ color: "#4d6262", opacity: 0.8 }}>
        A confirmation has been saved. See you soon!
      </p>

      <button
        type="button"
        onClick={onReset}
        className="text-xs underline-offset-2 hover:underline cursor-pointer bg-transparent border-none p-0"
        style={{ color: "#707978" }}
      >
        Book another appointment
      </button>

      {/* Decorative elements */}
      <span
        className="fixed top-12 left-12 select-none pointer-events-none opacity-10 font-light"
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "6rem",
          color: "#0c5252",
          lineHeight: 1,
        }}
        aria-hidden="true"
      >
        K
      </span>
      <span
        className="fixed bottom-12 right-12 pointer-events-none opacity-10"
        aria-hidden="true"
        style={{ color: "#0c5252" }}
      >
        <Leaf size={64} strokeWidth={1} />
      </span>
    </main>
  );
}

function Divider() {
  return <div className="w-full h-px" style={{ backgroundColor: "#efeeeb" }} />;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-4">
      <span
        className="text-xs uppercase tracking-widest font-medium"
        style={{ color: "rgba(63,72,72,0.7)", letterSpacing: "0.1em" }}
      >
        {label}
      </span>
      <span className="font-semibold text-right" style={{ color: "#1b1c1a" }}>
        {value}
      </span>
    </div>
  );
}
