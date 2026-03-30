from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from models.booking import Booking, BookingCreate
from services.calendar_service import get_available_slots, create_appointment
from services.booking_service import save_booking

router = APIRouter()

SERVICES_DURATION: dict[str, int] = {
    "Teeth Cleaning": 60,
    "Dental Consultation": 30,
    "Cavity Filling": 45,
    "Teeth Whitening": 90,
    "Emergency Appointment": 30,
}


class AvailabilityRequest(BaseModel):
    date: str
    service: str | None = None


class AvailabilityResponse(BaseModel):
    available_slots: list[str]
    date: str
    service: str


@router.post("/check-availability", response_model=AvailabilityResponse)
async def check_availability(body: AvailabilityRequest) -> AvailabilityResponse:
    service_name = body.service or "Dental Consultation"
    duration = SERVICES_DURATION.get(service_name, 30)

    try:
        slots = get_available_slots(body.date, duration)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Calendar error: {e}")

    return AvailabilityResponse(
        available_slots=slots,
        date=body.date,
        service=service_name,
    )


@router.post("/confirm-booking", response_model=Booking)
async def confirm_booking(body: BookingCreate) -> Booking:
    duration = SERVICES_DURATION.get(body.service, 30)

    try:
        create_appointment(
            customer_name=body.customer_name,
            service=body.service,
            date_str=body.date,
            time_str=body.time,
            duration_minutes=duration,
            phone_number=body.phone_number,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Calendar error: {e}")

    return await save_booking(body)
