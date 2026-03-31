from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from models.booking import Booking, BookingCreate
from services.calendar_service import get_available_slots, create_appointment
from services.booking_service import save_booking, supabase

router = APIRouter()

SERVICES_DURATION: dict[str, int] = {
    "Teeth Cleaning": 60,
    "Dental Consultation": 30,
    "Cavity Filling": 45,
    "Teeth Whitening": 90,
    "Emergency Appointment": 30,
}


class AvailabilityResponse(BaseModel):
    available_slots: list[str]
    date: str
    service: str


@router.post("/check-availability")
async def check_availability(request: Request):
    body = await request.json()
    print(f"[check_availability] body: {body}")

    # Retell may wrap args under 'args' key or send them flat
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

    # Retell may wrap args under 'args' key or send them flat
    args = body.get("args", body)
    # call_id may be at root, nested under 'call', or inside args
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
        create_appointment(
            customer_name=booking_data.customer_name,
            service=booking_data.service,
            date_str=booking_data.date,
            time_str=booking_data.time,
            duration_minutes=duration,
            phone_number=booking_data.phone_number,
        )
    except Exception as e:
        print(f"[confirm_booking] calendar error: {e}")
        raise HTTPException(status_code=500, detail=f"Calendar error: {e}")

    return await save_booking(booking_data)


@router.get("/bookings/{call_id}", response_model=Booking)
async def get_booking_by_call_id(call_id: str) -> Booking:
    response = supabase.table("bookings").select("*").eq("call_id", call_id).limit(1).execute()
    if response.data:
        return Booking(**response.data[0])
    # Fallback: return the most recent booking (covers null call_id saves)
    fallback = supabase.table("bookings").select("*").order("created_at", desc=True).limit(1).execute()
    if not fallback.data:
        raise HTTPException(status_code=404, detail="Booking not found")
    return Booking(**fallback.data[0])
