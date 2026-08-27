<div align="center">

<img src="./aria-logo.svg" width="120" height="120" alt="Aria logo"/>

# Aria

**AI voice receptionist — patients call, Aria books. End-to-end appointment management over a natural phone conversation.**

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python%203.11-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Retell AI](https://img.shields.io/badge/Retell%20AI-Voice-7C3AED?style=flat-square)](https://retellai.com)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Vercel-Frontend-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com)
[![Render](https://img.shields.io/badge/Render-Backend-46E3B7?style=flat-square)](https://render.com)

**[🔴 Live Demo](https://ai-receptionist-ten-plum.vercel.app/)** *(password-protected — contact for access)*

</div>

---

Aria is an AI-powered voice receptionist for **Kanmani Clinic** that lets patients book, reschedule, and cancel dental appointments through a natural phone conversation. Aria handles the entire booking flow end-to-end — checking real-time calendar availability, confirming appointments, syncing to Google Calendar, and creating CRM records in HubSpot.

---

## Features

- 🎙️ **Voice booking** — patients speak naturally; Aria understands intent and guides the flow
- 📅 **Full appointment management** — book, reschedule, and cancel via voice
- ⚡ **Real-time availability** — pulls open slots from Google Calendar before offering times
- 🗓️ **Google Calendar sync** — confirmed appointments created as calendar events automatically
- 🤝 **HubSpot CRM sync** — new contacts and deals created on every booking
- ✅ **Confirmation page** — animated booking summary with one-click "Add to Calendar"
- 🎤 **Mic activity detection** — live visual feedback using the Web Audio API
- 🔒 **Password protection** — rate-limited access gate (5 attempts, 15-min lockout)

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

## Retell Agent Tools

| Tool | Endpoint |
|---|---|
| `check_availability` | `POST /api/check-availability` |
| `confirm_booking` | `POST /api/confirm-booking` |
| `get_appointments` | `POST /api/get-appointments` |
| `reschedule_appointment` | `POST /api/reschedule-appointment` |
| `cancel_appointment` | `POST /api/cancel-appointment` |
| `end_call` | Built-in Retell tool |

Webhook: `POST /webhook/retell` receives `call_started` and `call_ended` events.

---

## Local Development

### Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
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
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Service account JSON (single-line string) |
| `OPENAI_API_KEY` | OpenAI key (transcript extraction) |
| `HUBSPOT_ACCESS_TOKEN` | HubSpot private app token |

**Frontend** (`frontend/.env.local`):

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_RETELL_AGENT_ID` | Retell agent ID |
| `NEXT_PUBLIC_RETELL_API_KEY` | Retell API key |
| `NEXT_PUBLIC_API_URL` | Backend base URL |
| `SITE_PASSWORD` | Password for the access gate |

---

## Services & Hours

| Service | Duration |
|---|---|
| Dental Consultation | 30 min |
| Teeth Cleaning | 60 min |
| Cavity Filling | 45 min |
| Teeth Whitening | 90 min |
| Emergency Appointment | 30 min |

**Hours:** Mon–Fri 8am–5pm · Sat 9am–2pm · Sun closed (CST)
