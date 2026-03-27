import os
from dotenv import load_dotenv
from supabase import create_client, Client
from fastapi import HTTPException
from models.booking import Booking, BookingCreate

load_dotenv()

supabase: Client = create_client(
    os.environ["SUPABASE_URL"],
    os.environ["SUPABASE_SERVICE_KEY"],
)


async def save_booking(booking: BookingCreate) -> Booking:
    try:
        response = supabase.table("bookings").insert(booking.model_dump()).execute()
        record = response.data[0]
        return Booking(**record)
    except Exception as e:
        print(f"Failed to save booking: {e}")
        raise HTTPException(status_code=500, detail="Failed to save booking")
