from pydantic import BaseModel
from typing import Optional


class Booking(BaseModel):
    id: Optional[str] = None
    customer_name: str
    phone_number: str
    service: str
    date: str
    time: str
    status: str = "confirmed"
    created_at: Optional[str] = None
    call_id: Optional[str] = None
    google_event_id: Optional[str] = None


class BookingCreate(BaseModel):
    customer_name: str
    phone_number: str
    service: str
    date: str
    time: str
    call_id: Optional[str] = None
    google_event_id: Optional[str] = None
