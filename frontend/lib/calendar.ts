import { Booking } from "@/types/booking";

const SERVICE_DURATION: Record<string, number> = {
  "Teeth Cleaning": 60,
  "Dental Consultation": 30,
  "Cavity Filling": 45,
  "Teeth Whitening": 90,
  "Emergency Appointment": 30,
};

// Converts "Monday" / "2024-12-25" + "10:00 AM" into a Date object.
// Falls back to today's date if the day string can't be parsed as a date.
function toDate(date: string, time: string): Date {
  const parsed = new Date(`${date} ${time}`);
  if (!isNaN(parsed.getTime())) return parsed;

  // Fallback: find the next occurrence of the weekday name
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const target = days.indexOf(date.toLowerCase());
  if (target !== -1) {
    const now = new Date();
    const diff = (target - now.getDay() + 7) % 7 || 7;
    const next = new Date(now);
    next.setDate(now.getDate() + diff);
    const [timePart, meridiem] = time.split(" ");
    const [hours, minutes] = timePart.split(":").map(Number);
    next.setHours(
      meridiem?.toUpperCase() === "PM" && hours !== 12 ? hours + 12 : hours === 12 && meridiem?.toUpperCase() === "AM" ? 0 : hours,
      minutes,
      0,
      0
    );
    return next;
  }

  return new Date();
}

function formatIcsDate(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function formatGoogleDate(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export function buildGoogleCalendarUrl(booking: Booking): string {
  const start = toDate(booking.date, booking.time);
  const durationMins = SERVICE_DURATION[booking.service] ?? 30;
  const end = new Date(start.getTime() + durationMins * 60 * 1000);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Kanmani Clinic - ${booking.service}`,
    dates: `${formatGoogleDate(start)}/${formatGoogleDate(end)}`,
    details: "Your appointment at Kanmani Clinic",
    location: "Kanmani Clinic",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function downloadIcsFile(booking: Booking): void {
  const start = toDate(booking.date, booking.time);
  const durationMins = SERVICE_DURATION[booking.service] ?? 30;
  const end = new Date(start.getTime() + durationMins * 60 * 1000);

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Kanmani Clinic//Aria//EN",
    "BEGIN:VEVENT",
    `SUMMARY:Kanmani Clinic - ${booking.service}`,
    `DTSTART:${formatIcsDate(start)}`,
    `DTEND:${formatIcsDate(end)}`,
    "DESCRIPTION:Your appointment at Kanmani Clinic",
    "LOCATION:Kanmani Clinic",
    `UID:${booking.id}@kanmaniclinic`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "kanmani-appointment.ics";
  a.click();
  URL.revokeObjectURL(url);
}
