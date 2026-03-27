import { env } from "@/lib/env";
import type { Booking } from "@/types/booking";

export interface BookingCreate {
  customer_name: string;
  phone_number: string;
  service: string;
  date: string;
  time: string;
  call_id?: string;
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${env.apiUrl}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(
      `API request failed: ${response.status} ${response.statusText} — ${message}`
    );
  }

  return response.json() as Promise<T>;
}

export async function getBookings(): Promise<Booking[]> {
  return fetchApi<Booking[]>("/bookings");
}

export async function createBooking(data: BookingCreate): Promise<Booking> {
  return fetchApi<Booking>("/bookings", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
