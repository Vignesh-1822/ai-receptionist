import os
import certifi

# Fix macOS SSL cert issue — must be set before any HTTPS connections are made
os.environ.setdefault("SSL_CERT_FILE", certifi.where())
os.environ.setdefault("REQUESTS_CA_BUNDLE", certifi.where())

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
