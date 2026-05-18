"use client";

import { CheckCircle, Calendar, CalendarPlus } from "lucide-react";
import { buildGoogleCalendarUrl, downloadIcsFile } from "@/lib/calendar";
import type { Booking } from "@/types/booking";

interface ConfirmationCardProps {
  booking: Booking | null;
  onReset: () => void;
}

export function ConfirmationCard({ booking, onReset }: ConfirmationCardProps) {
  return (
    <main className="max-w-xl w-full flex flex-col items-center text-center gap-5 px-4">

      {/* Animated checkmark */}
      <div className="relative">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center shadow-sm"
          style={{ backgroundColor: "#94f990" }}
        >
          <CheckCircle size={36} fill="#005614" stroke="none" />
        </div>
        <div
          className="absolute inset-0 rounded-full animate-ping opacity-20"
          style={{ backgroundColor: "#94f990" }}
        />
      </div>

      {/* Heading */}
      <div className="flex flex-col gap-1">
        <h1
          className="text-3xl font-light italic tracking-tight m-0"
          style={{ fontFamily: "var(--font-serif)", color: "#0c5252" }}
        >
          You&apos;re all booked!
        </h1>
        <p className="text-sm m-0" style={{ color: "#3f4848" }}>
          Aria confirmed your appointment at Kanmani Clinic
        </p>
      </div>

      {/* Booking detail card */}
      <div
        className="w-full rounded-xl p-5"
        style={{
          backgroundColor: "#ffffff",
          boxShadow: "0px 20px 40px rgba(27,28,26,0.05)",
          border: "1px solid rgba(191,200,200,0.3)",
        }}
      >
        <div className="flex flex-col gap-0">
          {booking ? (
            <>
              <DetailRow label="Name" value={booking.customer_name} />
              <Divider />
              <DetailRow label="Service" value={booking.service} />
              <Divider />
              <DetailRow label="Date" value={booking.date} />
              <Divider />
              <DetailRow label="Time" value={booking.time} />
            </>
          ) : (
            <>
              <SkeletonRow />
              <Divider />
              <SkeletonRow />
              <Divider />
              <SkeletonRow />
              <Divider />
              <SkeletonRow />
            </>
          )}
        </div>
      </div>

      {/* Calendar buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        {booking ? (
          <a
            href={buildGoogleCalendarUrl(booking)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-full font-semibold text-sm tracking-wide text-white no-underline transition-opacity hover:opacity-90 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #0c5252, #2d6a6a)",
              boxShadow: "0 4px 14px rgba(12,82,82,0.3)",
            }}
          >
            <Calendar size={16} />
            Add to Google Calendar
          </a>
        ) : (
          <div
            className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-full font-semibold text-sm tracking-wide text-white opacity-40"
            style={{ background: "linear-gradient(135deg, #0c5252, #2d6a6a)" }}
          >
            <Calendar size={16} />
            Add to Google Calendar
          </div>
        )}

        {booking ? (
          <button
            type="button"
            onClick={() => downloadIcsFile(booking)}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-full font-semibold text-sm tracking-wide transition-colors active:scale-95 cursor-pointer bg-transparent"
            style={{ border: "2px solid #0c5252", color: "#0c5252" }}
          >
            <CalendarPlus size={16} />
            Add to Apple Calendar
          </button>
        ) : (
          <div
            className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-full font-semibold text-sm tracking-wide opacity-40"
            style={{ border: "2px solid #0c5252", color: "#0c5252" }}
          >
            <CalendarPlus size={16} />
            Add to Apple Calendar
          </div>
        )}
      </div>

      {/* Book another */}
      <button
        type="button"
        onClick={onReset}
        className="w-full flex items-center justify-center py-3 px-6 rounded-full font-medium text-sm tracking-wide transition-colors hover:opacity-80 active:scale-95 cursor-pointer"
        style={{
          backgroundColor: "rgba(12,82,82,0.06)",
          color: "#0c5252",
          border: "none",
        }}
      >
        Book another appointment
      </button>
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

function SkeletonRow() {
  return (
    <div className="flex justify-between items-center py-4">
      <div className="h-3 w-16 rounded-full animate-pulse" style={{ backgroundColor: "rgba(191,200,200,0.4)" }} />
      <div className="h-3 w-28 rounded-full animate-pulse" style={{ backgroundColor: "rgba(191,200,200,0.4)" }} />
    </div>
  );
}
