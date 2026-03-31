import os
import json
from openai import OpenAI
from dotenv import load_dotenv
from supabase import create_client, Client
from fastapi import HTTPException
from models.booking import Booking, BookingCreate

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
