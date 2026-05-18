# Aria — AI Voice Receptionist

An AI-powered voice receptionist for Kanmani Clinic that lets patients book, reschedule, and cancel dental appointments through a natural phone conversation. Aria handles the entire booking flow end-to-end — checking calendar availability, confirming appointments, syncing to Google Calendar, and creating CRM records in HubSpot.

---

## Demo

> Password-protected — contact for access credentials.

**Live:** https://kanmani-clinic.vercel.app  
**Backend API:** https://aria-receptionist-backend.onrender.com

---

## Features

- **Voice booking** — patients speak naturally; Aria understands intent and guides the flow
- **Full appointment management** — book, reschedule, and cancel via voice
- **Real-time availability** — pulls open slots from Google Calendar before offering times
- **Google Calendar sync** — confirmed appointments are created as calendar events automatically
- **HubSpot CRM sync** — new contacts and deals are created on every booking
- **Confirmation page** — animated booking summary with one-click "Add to Google/Apple Calendar"
- **Mic activity detection** — live visual feedback using the Web Audio API when the user speaks
- **Password protection** — rate-limited access gate (5 attempts, 15-min lockout) to prevent API abuse

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion |
| Backend | FastAPI (Python 3.11), Pydantic, Uvicorn |
| Voice AI | Retell AI (agent + LLM config) |
| Database | Supabase (PostgreSQL) |
| Calendar | Google Calendar API (service account) |
| CRM | HubSpot API |
| Frontend hosting | Vercel |
| Backend hosting | Render |

---

## Architecture

```
Browser (Next.js)
    │
    ├── Retell Web SDK ──► Retell AI Cloud ──► Aria LLM
    │                              │
    │                    tool calls (HTTP)
    │                              │
    └── REST API ──────► FastAPI Backend (Render)
                              │
                    ┌─────────┼──────────┐
                    ▼         ▼          ▼
                Supabase  Google     HubSpot
               (bookings) Calendar    (CRM)
```

When a call starts, the Retell SDK connects directly to Aria. During the call, Aria makes HTTP tool calls to the FastAPI backend to check availability and confirm bookings. On call end, the backend webhook fires to sync HubSpot.

---

## Project Structure

```
├── backend/
│   ├── main.py                  # FastAPI app entry point
│   ├── routers/
│   │   ├── availability.py      # /api/* tool endpoints (called by Retell)
│   │   └── webhook.py           # /webhook/retell (call lifecycle events)
│   ├── services/
│   │   ├── booking_service.py   # Supabase read/write
│   │   ├── calendar_service.py  # Google Calendar availability + event creation
│   │   ├── hubspot_service.py   # HubSpot contact + deal sync
│   │   └── constants.py         # Service durations
│   ├── models/
│   │   └── booking.py           # Pydantic models
│   └── requirements.txt
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx             # Main page (idle / active call / confirmation)
│   │   ├── enter/page.tsx       # Password gate
│   │   └── api/auth/route.ts    # Auth API route (sets cookie)
│   ├── components/
│   │   ├── booking/
│   │   │   ├── IdleState.tsx    # Pre-call UI
│   │   │   ├── ActiveCall.tsx   # In-call UI with animations
│   │   │   └── ConfirmationCard.tsx
│   │   └── shared/
│   │       └── Navbar.tsx
│   ├── hooks/
│   │   └── useRetellCall.ts     # Call state + mic level detection
│   ├── lib/
│   │   ├── retell.ts            # Retell SDK wrapper
│   │   └── calendar.ts          # Google/Apple Calendar URL builders
│   └── proxy.ts                 # Auth proxy (Next.js 16)
│
└── runtime.txt                  # Pins Python 3.11 for Render
```

---

## Local Development

### Prerequisites

- Node.js 18+
- Python 3.11
- A [Retell AI](https://retellai.com) account with an agent configured
- A [Supabase](https://supabase.com) project with a `bookings` table
- A Google Cloud service account with Calendar API access
- A HubSpot account with a private app token

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in your keys
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local   # fill in your keys
npm run dev
```

---

## Environment Variables

**Backend** (`backend/.env`):

| Variable | Description |
|---|---|
| `RETELL_API_KEY` | Retell AI API key |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Supabase service role key |
| `GOOGLE_CALENDAR_ID` | Target calendar ID |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Service account JSON as a single-line string |
| `OPENAI_API_KEY` | OpenAI key (used for transcript extraction) |
| `HUBSPOT_ACCESS_TOKEN` | HubSpot private app token |

**Frontend** (`frontend/.env.local`):

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_RETELL_AGENT_ID` | Retell agent ID |
| `NEXT_PUBLIC_RETELL_API_KEY` | Retell API key |
| `NEXT_PUBLIC_API_URL` | Backend base URL |
| `SITE_PASSWORD` | Password for the access gate |

---

## Supabase Schema

```sql
create table bookings (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone_number text not null,
  service text not null,
  date text not null,
  time text not null,
  status text not null default 'confirmed',
  call_id text,
  google_event_id text,
  created_at timestamptz default now()
);
```

---

## Retell Agent Configuration

The Aria agent uses the **Retell LLM** response engine with these tool endpoints:

| Tool | Endpoint |
|---|---|
| `check_availability` | `POST /api/check-availability` |
| `confirm_booking` | `POST /api/confirm-booking` |
| `get_appointments` | `POST /api/get-appointments` |
| `reschedule_appointment` | `POST /api/reschedule-appointment` |
| `cancel_appointment` | `POST /api/cancel-appointment` |
| `end_call` | Built-in Retell tool |

Webhook URL: `POST /webhook/retell` (receives `call_started` and `call_ended` events)

---

## Deployment

### Backend (Render)

- **Runtime:** Python 3.11 (pinned via `runtime.txt`)
- **Build command:** `pip install -r backend/requirements.txt`
- **Start command:** `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
- Set all backend environment variables in the Render dashboard

### Frontend (Vercel)

- Connect the GitHub repo, set **Root Directory** to `frontend`
- Set all frontend environment variables in the Vercel dashboard
- Deploys automatically on every push to `main`

---

## Services Supported

| Service | Duration |
|---|---|
| Dental Consultation | 30 min |
| Teeth Cleaning | 60 min |
| Cavity Filling | 45 min |
| Teeth Whitening | 90 min |
| Emergency Appointment | 30 min |

Clinic hours: Mon–Fri 8am–5pm · Sat 9am–2pm · Sun closed (CST)
