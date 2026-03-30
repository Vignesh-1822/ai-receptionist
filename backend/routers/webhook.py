# Handles incoming Retell call events:
#   call_started   — acknowledged, no action
#   call_ended     — extract booking from transcript via Claude, save to Supabase
#   function_call  — Aria calling check_availability or confirm_booking mid-call

from fastapi import APIRouter
from pydantic import BaseModel
from models.booking import BookingCreate
from services.booking_service import extract_booking_from_transcript, save_booking
from services.calendar_service import get_available_slots, create_appointment

router = APIRouter()

SERVICES_DURATION: dict[str, int] = {
    "Teeth Cleaning": 60,
    "Dental Consultation": 30,
    "Cavity Filling": 45,
    "Teeth Whitening": 90,
    "Emergency Appointment": 30,
}


class RetellEvent(BaseModel):
    event: str
    call: dict


@router.post("/retell")
async def retell_webhook(event: RetellEvent):
    print(f"Retell event received: {event.event}")

    if event.event == "call_started":
        return {"status": "ok"}

    if event.event == "call_ended":
        call_id = event.call.get("call_id", "")
        transcript = event.call.get("transcript", "")
        print("Call ended — extracting booking from transcript...")
        booking_create = await extract_booking_from_transcript(transcript, call_id)
        saved = await save_booking(booking_create)
        print(f"Booking saved: {saved.id}")
        return {"status": "ok", "booking": saved.model_dump()}

    if event.event == "function_call":
        function_name = event.call.get("function_name")
        parameters: dict = event.call.get("parameters", {})
        print(f"Function call: {function_name} params={parameters}")

        if function_name == "check_availability":
            date = parameters.get("date", "")
            slots = get_available_slots(date, 30)
            if slots:
                result = f"Available slots on {date}: {', '.join(slots)}"
            else:
                result = f"No availability on {date}. Try another day."
            return {"result": result}

        if function_name == "confirm_booking":
            service = parameters.get("service", "Dental Consultation")
            duration = SERVICES_DURATION.get(service, 30)

            event_id = create_appointment(
                customer_name=parameters.get("customer_name", "Guest"),
                service=service,
                date_str=parameters.get("date", ""),
                time_str=parameters.get("time", ""),
                duration_minutes=duration,
                phone_number=parameters.get("phone_number", "not provided"),
            )
            print(f"Calendar event created: {event_id}")

            booking_create = BookingCreate(
                customer_name=parameters.get("customer_name", "Guest"),
                phone_number=parameters.get("phone_number", "not provided"),
                service=service,
                date=parameters.get("date", ""),
                time=parameters.get("time", ""),
                call_id=event.call.get("call_id", ""),
            )
            saved = await save_booking(booking_create)
            print(f"Booking confirmed: {saved.id}")

            return {
                "result": f"Booking confirmed! ID: {saved.id}",
                "booking_id": saved.id,
            }

        print(f"Unknown function: {function_name}")
        return {"result": "Function not recognised."}

    print(f"Unhandled event: {event.event}")
    return {"status": "ok"}
