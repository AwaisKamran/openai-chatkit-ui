import os
import asyncio
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from dotenv import load_dotenv
import httpx

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
CHATKIT_WORKFLOW_ID = os.getenv("CHATKIT_WORKFLOW_ID")
if not OPENAI_API_KEY or not CHATKIT_WORKFLOW_ID:
    raise RuntimeError("Missing config in environment")

app = FastAPI()

# Allowed origins 
origins = [
    "http://localhost:3000",
]

# Allow your frontend origin 
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SessionRequest(BaseModel):
    user_id: str | None = None

class SessionResponse(BaseModel):
    client_secret: str
    expires_after: int

@app.get("/ping")
async def ping():
    return {"ping": "pong"}

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    # Log exception here if needed
    content = {"detail": str(exc)}
    headers = {
        "Access-Control-Allow-Origin": origins[0],
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "*",
    }
    return JSONResponse(status_code=500, content=jsonable_encoder(content), headers=headers)

@app.post("/api/chatkit/session", response_model=SessionResponse)
async def create_chatkit_session(req: SessionRequest):
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://api.openai.com/v1/chatkit/sessions",
            headers={
                "Authorization": f"Bearer {OPENAI_API_KEY}",
                "Content-Type": "application/json",
                "OpenAI-Beta": "chatkit_beta=v1",
            },
            json={
                "workflow": { "id": CHATKIT_WORKFLOW_ID },
                "user": req.user_id or "anonymous",
            }
        )
        data = resp.json()

        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail=data)

        return {
            "client_secret": data["client_secret"],
            "expires_after": data.get("expires_after", 3600),  # Default to 1 hour if not provided
        }
