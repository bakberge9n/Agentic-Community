"""Task submission and execution API routes."""
import asyncio
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.agent_service import run_task, get_last_result
from app.services.memory_service import memory_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["tasks"])


class TaskRequest(BaseModel):
    query: str


class TaskResponse(BaseModel):
    query: str
    output: str
    plan: str = ""
    research: str = ""
    analysis: str = ""
    feedback: str = ""
    status: str = "complete"


@router.post("/tasks", response_model=TaskResponse)
async def submit_task(req: TaskRequest):
    """Submit a task to the multi-agent system. Runs synchronously."""
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    
    logger.info(f"Task received: {req.query[:100]}...")
    result = run_task(req.query)
    
    return TaskResponse(
        query=result["query"],
        output=result["output"],
        plan=result["plan"],
        research=result["research"],
        analysis=result["analysis"],
        feedback=result["feedback"],
        status=result["status"],
    )


@router.get("/tasks/last")
async def get_last_task():
    """Get the result of the last executed task."""
    result = get_last_result()
    if not result:
        raise HTTPException(status_code=404, detail="No tasks executed yet")
    return result


@router.post("/tasks/search-memory")
async def search_memory(query: str, tier: str = "warm_memory"):
    """Search agent memory."""
    results = memory_service.search(query, tier)
    return {"results": results}