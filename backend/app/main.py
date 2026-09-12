import time
import uuid
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1 import api_v1_router

app = FastAPI(
    title="AgentForge API",
    description="The AI Business Employee platform: AI onboarding, website RAG, multi-channel grounded agent runtime, safe actions, and Web3 identity anchor.",
    version="1.0.0"
)

# CORS Middleware to support Embed Widget and Next.js Console
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to allowed origins / widget domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request-ID & Latency Middleware
@app.middleware("http")
async def add_process_time_and_request_id(request: Request, call_next):
    req_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Request-ID"] = req_id
    response.headers["X-Process-Time"] = f"{process_time:.4f}s"
    return response

import os
from fastapi.staticfiles import StaticFiles

# Mount static files (embeddable widget)
static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

# Mount v1 API
app.include_router(api_v1_router)

@app.get("/")
def root():
    return {
        "app": "AgentForge API",
        "status": "operational",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT, reload=True)
