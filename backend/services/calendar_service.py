import os
import json
from datetime import datetime, timedelta, date, time
from zoneinfo import ZoneInfo

from google.oauth2 import service_account
from googleapiclient.discovery import build
from dotenv import load_dotenv

load_dotenv()

_CALENDAR_ID = os.environ["GOOGLE_CALENDAR_ID"]
_SCOPES = ["https://www.googleapis.com/auth/calendar"]
_TIMEZONE = ZoneInfo("America/Chicago")  # CST/CDT

# Clinic hours: (open_hour, open_minute, close_hour, close_minute)
# None means closed
_CLINIC_HOURS: dict[int, tuple[int, int, int, int] | None] = {
    0: (8, 0, 17, 0),   # Monday
    1: (8, 0, 17, 0),   # Tuesday
    2: (8, 0, 17, 0),   # Wednesday
    3: (8, 0, 17, 0),   # Thursday
    4: (8, 0, 17, 0),   # Friday
    5: (9, 0, 14, 0),   # Saturday
    6: None,            # Sunday — closed
}

_WEEKDAY_NAMES = {
    "monday": 0, "tuesday": 1, "wednesday": 2,
    "thursday": 3, "friday": 4, "saturday": 5, "sunday": 6,
}


def _get_calendar_service():
    # Prefer JSON string env var (Railway/prod), fall back to file path (local)
    sa_json = os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON")
    if sa_json:
        info = json.loads(sa_json)
        credentials = service_account.Credentials.from_service_account_info(
            info, scopes=_SCOPES
        )
    else:
        sa_file = os.environ["GOOGLE_SERVICE_ACCOUNT_FILE"]
        credentials = service_account.Credentials.from_service_account_file(
            sa_file, scopes=_SCOPES
        )
    return build("calendar", "v3", credentials=credentials)


def _parse_date(date_str: str) -> date:
    """Parse a weekday name or ISO date string into a date object."""
    lower = date_str.strip().lower()
    if lower in _WEEKDAY_NAMES:
        target_weekday = _WEEKDAY_NAMES[lower]
        today = date.today()
        days_ahead = (target_weekday - today.weekday()) % 7
        # If today is the same weekday, use next week's occurrence
        if days_ahead == 0:
            days_ahead = 7
        return today + timedelta(days=days_ahead)
    # Try ISO format
    return datetime.strptime(date_str.strip(), "%Y-%m-%d").date()


def get_available_slots(date_str: str, duration_minutes: int = 30) -> list[str]:
    """Return available time slot strings for the given date."""
    try:
        appt_date = _parse_date(date_str)
    except (ValueError, KeyError):
        return []

    hours = _CLINIC_HOURS.get(appt_date.weekday())
    if hours is None:
        return []  # Closed

    open_h, open_m, close_h, close_m = hours
    day_start = datetime.combine(appt_date, time(open_h, open_m), tzinfo=_TIMEZONE)
    day_end = datetime.combine(appt_date, time(close_h, close_m), tzinfo=_TIMEZONE)

    # Fetch existing events for the day
    service = _get_calendar_service()
    events_result = service.events().list(
        calendarId=_CALENDAR_ID,
        timeMin=day_start.isoformat(),
        timeMax=day_end.isoformat(),
        singleEvents=True,
        orderBy="startTime",
    ).execute()
    events = events_result.get("items", [])

    # Build list of busy (start, end) datetime pairs
    busy: list[tuple[datetime, datetime]] = []
    for evt in events:
        start_raw = evt["start"].get("dateTime")
        end_raw = evt["end"].get("dateTime")
        if start_raw and end_raw:
            busy.append((
                datetime.fromisoformat(start_raw).astimezone(_TIMEZONE),
                datetime.fromisoformat(end_raw).astimezone(_TIMEZONE),
            ))

    # Generate all 30-min slots and filter out overlapping ones
    available: list[str] = []
    slot_start = day_start
    while slot_start + timedelta(minutes=duration_minutes) <= day_end:
        slot_end = slot_start + timedelta(minutes=duration_minutes)
        overlaps = any(
            slot_start < busy_end and slot_end > busy_start
            for busy_start, busy_end in busy
        )
        if not overlaps:
            available.append(slot_start.strftime("%-I:%M %p"))
        slot_start += timedelta(minutes=30)

    return available


def create_appointment(
    customer_name: str,
    service: str,
    date_str: str,
    time_str: str,
    duration_minutes: int,
    phone_number: str,
) -> str:
    """Create a Google Calendar event and return the event ID."""
    appt_date = _parse_date(date_str)

    # Parse time string like "2:00 PM" or "10:30 AM"
    start_time = datetime.strptime(time_str.strip(), "%I:%M %p").time()
    start_dt = datetime.combine(appt_date, start_time, tzinfo=_TIMEZONE)
    end_dt = start_dt + timedelta(minutes=duration_minutes)

    event_body = {
        "summary": f"{service} — {customer_name}",
        "description": (
            f"Patient: {customer_name}\n"
            f"Phone: {phone_number}\n"
            f"Service: {service}"
        ),
        "start": {"dateTime": start_dt.isoformat(), "timeZone": str(_TIMEZONE)},
        "end": {"dateTime": end_dt.isoformat(), "timeZone": str(_TIMEZONE)},
    }

    service_client = _get_calendar_service()
    created = service_client.events().insert(
        calendarId=_CALENDAR_ID,
        body=event_body,
    ).execute()

    return created["id"]
