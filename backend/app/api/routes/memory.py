"""Memory tiers API routes."""

from fastapi import APIRouter

from app.models.schemas import MemoryResponse
from app.services.memory_service import get_memory_data

router = APIRouter(prefix="/api", tags=["memory"])


@router.get("/memory", response_model=MemoryResponse)
async def memory_tiers():
    """Return hierarchical memory tier data (hot/warm/cold)."""
    return get_memory_data()