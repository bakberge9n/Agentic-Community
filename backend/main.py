"""Main FastAPI application entry point."""

import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.api.routes.fleet import router as fleet_router
from app.api.routes.orchestration import router as orchestration_router
from app.api.routes.memory import router as memory_router
from app.api.routes.reflexion import router as reflexion_router
from app.api.routes.hitl import router as hitl_router
from app.websocket.manager import manager, periodic_agent_updates

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Start background tasks on startup, clean up on shutdown."""
    # Start background periodic agent update task
    task = asyncio.create_task(periodic_agent_updates())
    logger.info("FastAPI backend started — periodic WebSocket updates active")
    yield
    task.cancel()
    logger.info("FastAPI backend shutting down")


app = FastAPI(
    title="Agentic Community Dashboard API",
    description="Backend API for the multi-agent AI system control plane dashboard",
    version="0.1.0",
    lifespan=lifespan,
)

# ─── CORS Middleware ─────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.allowed_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── REST Routes ────────────────────────────────────────────────────────────
app.include_router(fleet_router)
app.include_router(orchestration_router)
app.include_router(memory_router)
app.include_router(reflexion_router)
app.include_router(hitl_router)


# ─── Health Check ───────────────────────────────────────────────────────────

@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return JSONResponse(
        content={
            "status": "ok",
            "version": "0.1.0",
            "service": "agentic-community-backend",
        }
    )


# ─── WebSocket Endpoint ─────────────────────────────────────────────────────

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket connection for real-time agent updates and events."""
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive; receive any client messages
            await websocket.receive_text()
    except WebSocketDisconnect:
        await manager.disconnect(websocket)
    except Exception:
        await manager.disconnect(websocket)


# ─── Entry Point ────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
    )