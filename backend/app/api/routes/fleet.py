"""Fleet overview API routes."""

from fastapi import APIRouter

from app.models.schemas import FleetResponse
from app.services.agent_service import get_agents

router = APIRouter(prefix="/api", tags=["fleet"])


@router.get("/fleet", response_model=FleetResponse)
async def fleet_overview():
    """Return current agent fleet status and stats."""
    return get_agents()