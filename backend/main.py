from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routers import webhook, availability

load_dotenv()

app = FastAPI(title="Kanmani Clinic API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"status": "ok", "message": "Kanmani Clinic API running"}


app.include_router(webhook.router, prefix="/webhook")
app.include_router(availability.router, prefix="/api")
