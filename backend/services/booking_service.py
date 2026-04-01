import os
import json
from openai import OpenAI
from dotenv import load_dotenv
from supabase import create_client, Client
from fastapi import HTTPException
from models.booking import Booking, BookingCreate
from services.constants import SERVICES_DURATION
from services.calendar_service import update_appointment, delete_appointment

load_dotenv()

supabase: Client = create_client(
    os.environ["SUPABASE_URL"],
    os.environ["SUPABASE_SERVICE_KEY"],
)

_openai = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

_SYSTEM_PROMPT = (
    "You are a data extraction assistant. Extract booking details "
    "from a dental clinic appointment conversation transcript. "
    "Return ONLY a valid JSON object with these exact fields:\n"
    "{\n"
    '  "customer_name": string,\n'
    '  "phone_number": string (or "not provided" if missing),\n'
    '  "service": string (one of: Teeth Cleaning, Dental Consultation, '
    "Cavity Filling, Teeth Whitening, Emergency Appointment),\n"
    '  "date": string (e.g. "Monday", "Tuesday", or specific date),\n'
    '  "time": string (e.g. "2:00 PM", "10:30 AM"),\n'
    '  "call_id": string\n'
    "}\n"
    "If any field is unclear from the transcript, use a sensible default. "
    "Return only the JSON, no markdown, no explanation."
)

_FALLBACK = lambda call_id: BookingCreate(
    customer_name="Guest Patient",
    phone_number="not provided",
    service="Dental Consultation",
    date="To be confirmed",
    time="To be confirmed",
    call_id=call_id,
)


async def extract_booking_from_transcript(
    transcript: str, call_id: str
) -> BookingCreate:
    try:
        message = _openai.chat.completions.create(
            model="gpt-4o-mini",
            max_tokens=512,
            messages=[
                {"role": "system", "content": _SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": (
                        f"Extract booking details from this transcript:\n\n"
                        f"{transcript}\n\nCall ID: {call_id}"
                    ),
                },
            ],
        )
        raw = message.choices[0].message.content.strip()
        data = json.loads(raw)
        return BookingCreate(
            customer_name=data.get("customer_name", "Guest Patient"),
            phone_number=data.get("phone_number", "not provided"),
            service=data.get("service", "Dental Consultation"),
            date=data.get("date", "To be confirmed"),
            time=data.get("time", "To be confirmed"),
            call_id=call_id,
        )
    except Exception as e:
        print(f"Failed to extract booking from transcript: {e}")
        return _FALLBACK(call_id)


async def save_booking(booking: BookingCreate) -> Booking:
    try:
        response = supabase.table("bookings").insert(booking.model_dump()).execute()
        record = response.data[0]
        return Booking(**record)
    except Exception as e:
        print(f"Failed to save booking: {e}")
        raise HTTPException(status_code=500, detail="Failed to save booking")


async def get_bookings_by_phone(phone_number: str) -> list[Booking]:
    response = (
        supabase.table("bookings")
        .select("*")
        .eq("phone_number", phone_number)
        .eq("status", "confirmed")
        .order("created_at", desc=True)
        .execute()
    )
    return [Booking(**row) for row in response.data]


async def reschedule_booking(booking_id: str, new_date: str, new_time: str) -> Booking:
    response = supabase.table("bookings").select("*").eq("id", booking_id).limit(1).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Booking not found")

    record = response.data[0]
    google_event_id = record.get("google_event_id")

    if google_event_id:
        try:
            duration = SERVICES_DURATION.get(record["service"], 30)
            update_appointment(google_event_id, new_date, new_time, duration)
        except Exception as e:
            print(f"Calendar update failed (continuing with DB update): {e}")

    updated = (
        supabase.table("bookings")
        .update({"date": new_date, "time": new_time})
        .eq("id", booking_id)
        .execute()
    )
    return Booking(**updated.data[0])


async def cancel_booking(booking_id: str) -> Booking:
    response = supabase.table("bookings").select("*").eq("id", booking_id).limit(1).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Booking not found")

    google_event_id = response.data[0].get("google_event_id")
    if google_event_id:
        try:
            delete_appointment(google_event_id)
        except Exception as e:
            print(f"Calendar delete failed (continuing with DB update): {e}")

    updated = (
        supabase.table("bookings")
        .update({"status": "cancelled"})
        .eq("id", booking_id)
        .execute()
    )
    return Booking(**updated.data[0])
