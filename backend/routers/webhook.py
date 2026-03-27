# This router handles incoming Retell call events (call_started, call_ended, etc.)
# Real booking logic will be added in a later step via booking_service.

from fastapi import APIRouter
from typing import Any

router = APIRouter()


@router.post("/retell")
async def retell_webhook(payload: Any = None):
    print("Retell webhook received:", payload)
    return {"status": "received"}
