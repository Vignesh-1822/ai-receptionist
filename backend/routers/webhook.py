# This router handles incoming Retell call events (call_started, call_ended, etc.)
# The call_ended event is where we extract booking details from the transcript
# and save the booking to Supabase.

from fastapi import APIRouter
from pydantic import BaseModel
from models.booking import BookingCreate
from services.booking_service import save_booking

router = APIRouter()


class RetellEvent(BaseModel):
    event: str
    call: dict


def extract_booking_details(transcript: str, call_id: str) -> BookingCreate:
    # Stub — real extraction logic (via Claude) added in a later step
    return BookingCreate(
        customer_name="Test Patient",
        phone_number="000-000-0000",
        service="Dental Consultation",
        date="Monday",
        time="10:00 AM",
        call_id=call_id,
    )


@router.post("/retell")
async def retell_webhook(event: RetellEvent):
    print(f"Retell event received: {event.event}")

    if event.event == "call_started":
        print("Call started")
        return {"status": "ok"}

    if event.event == "call_ended":
        call_id = event.call.get("call_id", "")
        transcript = event.call.get("transcript", "")
        print("Call ended, extracting booking details...")

        booking_create = extract_booking_details(transcript, call_id)
        print(f"Extracted booking: {booking_create}")

        saved = await save_booking(booking_create)
        print(f"Booking saved: {saved}")
        return {"status": "ok", "booking": saved.model_dump()}

    print(f"Unhandled event: {event.event}")
    return {"status": "ok"}
