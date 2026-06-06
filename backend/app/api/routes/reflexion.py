"""Reflexion metrics API routes."""

from fastapi import APIRouter

from app.models.schemas import ReflexionResponse
from app.services.reflexion_service import get_reflexion_data

router = APIRouter(prefix="/api", tags=["reflexion"])


@router.get("/reflexion", response_model=ReflexionResponse)
async def reflexion_metrics():
    """Return PRAR cycle analytics and reflexion events."""
    return get_reflexion_data()