"""HITL (Human-in-the-Loop) inbox API routes."""

from fastapi import APIRouter, HTTPException

from app.models.schemas import HITLResponse, HITLItem
from app.services.agent_service import get_hitl_items

router = APIRouter(prefix="/api", tags=["hitl"])


@router.get("/hitl", response_model=HITLResponse)
async def hitl_inbox():
    """Return pending HITL approval queue items."""
    return get_hitl_items()


@router.post("/hitl/{item_id}/approve")
async def approve_hitl_item(item_id: str):
    """Approve a HITL item (mock — just validates item exists)."""
    items = get_hitl_items().items
    if not any(item.id == item_id for item in items):
        raise HTTPException(status_code=404, detail=f"HITL item {item_id} not found")
    return {"status": "approved", "id": item_id}


@router.post("/hitl/{item_id}/reject")
async def reject_hitl_item(item_id: str):
    """Reject a HITL item (mock — just validates item exists)."""
    items = get_hitl_items().items
    if not any(item.id == item_id for item in items):
        raise HTTPException(status_code=404, detail=f"HITL item {item_id} not found")
    return {"status": "rejected", "id": item_id}