from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from models.booking import Booking, BookingCreate
from services.calendar_service import get_available_slots, create_appointment
from services.booking_service import (
    save_booking,
    supabase,
    get_bookings_by_phone,
    reschedule_booking,
    cancel_booking,
)
from services.constants import SERVICES_DURATION

router = APIRouter()


class AvailabilityResponse(BaseModel):
    available_slots: list[str]
    date: str
    service: str


class RescheduleRequest(BaseModel):
    booking_id: str
    date: str
    time: str


class CancelRequest(BaseModel):
    booking_id: str


@router.post("/check-availability")
async def check_availability(request: Request):
    body = await request.json()
    print(f"[check_availability] body: {body}")

    args = body.get("args", body)
    date = args.get("date", "")
    service_name = args.get("service") or "Dental Consultation"
    duration = SERVICES_DURATION.get(service_name, 30)

    try:
        slots = get_available_slots(date, duration)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Calendar error: {e}")

    return AvailabilityResponse(available_slots=slots, date=date, service=service_name)


@router.post("/confirm-booking")
async def confirm_booking(request: Request):
    body = await request.json()
    print(f"[confirm_booking] body: {body}")

    args = body.get("args", body)
    call_id = (
        body.get("call_id")
        or body.get("call", {}).get("call_id")
        or args.get("call_id")
    )
    booking_data = BookingCreate(
        customer_name=args.get("customer_name", "Guest"),
        phone_number=args.get("phone_number", "not provided"),
        service=args.get("service", "Dental Consultation"),
        date=args.get("date", ""),
        time=args.get("time", ""),
        call_id=call_id,
    )
    duration = SERVICES_DURATION.get(booking_data.service, 30)

    try:
        event_id = create_appointment(
            customer_name=booking_data.customer_name,
            service=booking_data.service,
            date_str=booking_data.date,
            time_str=booking_data.time,
            duration_minutes=duration,
            phone_number=booking_data.phone_number,
        )
        booking_data.google_event_id = event_id
    except Exception as e:
        print(f"[confirm_booking] calendar error: {e}")
        raise HTTPException(status_code=500, detail=f"Calendar error: {e}")

    return await save_booking(booking_data)


@router.post("/get-appointments")
async def get_appointments(request: Request):
    body = await request.json()
    print(f"[get_appointments] body: {body}")

    args = body.get("args", body)
    phone_number = args.get("phone_number", "")
    bookings = await get_bookings_by_phone(phone_number)
    if not bookings:
        return {"message": "No upcoming appointments found for that phone number.", "appointments": []}
    return {
        "appointments": [
            {
                "booking_id": b.id,
                "service": b.service,
                "date": b.date,
                "time": b.time,
            }
            for b in bookings
        ]
    }


@router.post("/reschedule-appointment")
async def reschedule_appointment(request: Request):
    body = await request.json()
    print(f"[reschedule_appointment] body: {body}")

    args = body.get("args", body)
    booking_id = args.get("booking_id", "")
    new_date = args.get("date", "")
    new_time = args.get("time", "")

    booking = await reschedule_booking(booking_id, new_date, new_time)
    return {"result": f"Appointment rescheduled to {new_date} at {new_time}.", "booking_id": booking.id}


@router.post("/cancel-appointment")
async def cancel_appointment(request: Request):
    body = await request.json()
    print(f"[cancel_appointment] body: {body}")

    args = body.get("args", body)
    booking_id = args.get("booking_id", "")

    booking = await cancel_booking(booking_id)
    return {"result": f"Appointment for {booking.service} has been cancelled.", "booking_id": booking.id}


@router.get("/bookings/{call_id}", response_model=Booking)
async def get_booking_by_call_id(call_id: str) -> Booking:
    response = supabase.table("bookings").select("*").eq("call_id", call_id).limit(1).execute()
    if response.data:
        return Booking(**response.data[0])
    fallback = supabase.table("bookings").select("*").order("created_at", desc=True).limit(1).execute()
    if not fallback.data:
        raise HTTPException(status_code=404, detail="Booking not found")
    return Booking(**fallback.data[0])
