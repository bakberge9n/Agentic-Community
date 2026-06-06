"""Orchestration graph API routes."""

from fastapi import APIRouter

from app.models.schemas import OrchestrationResponse, WorkflowStep, WorkflowStepStatus, RecentRun
from app.services.agent_service import get_agents

router = APIRouter(prefix="/api", tags=["orchestration"])


@router.get("/orchestration", response_model=OrchestrationResponse)
async def orchestration_graph():
    """Return the active workflow pipeline and recent runs."""
    workflow_steps = [
        WorkflowStep(
            id="researcher",
            name="Researcher",
            agent="Researcher Alpha",
            description="Gather market intelligence and competitive data",
            status=WorkflowStepStatus.completed,
            details="Analyzed 14 sources across 3 markets",
            duration="2.3s",
        ),
        WorkflowStep(
            id="analyst",
            name="Analyst",
            agent="Analyst Beta",
            description="Synthesize findings into structured insights",
            status=WorkflowStepStatus.active,
            details="Processing 3 data streams in parallel",
            duration="4.1s",
        ),
        WorkflowStep(
            id="writer",
            name="Writer",
            agent="Writer Delta",
            description="Generate comprehensive report drafts",
            status=WorkflowStepStatus.pending,
            details="Waiting for analyst output",
            duration="—",
        ),
        WorkflowStep(
            id="reviewer",
            name="Reviewer",
            agent="Reviewer Epsilon",
            description="Quality assurance and fact-checking",
            status=WorkflowStepStatus.pending,
            details="Awaiting writer draft",
            duration="—",
        ),
    ]

    recent_runs = [
        RecentRun(id="run-01", query="Q3 2025 SaaS competitive landscape", status="completed", time="12m ago", steps=4),
        RecentRun(id="run-02", query="AI infrastructure market size analysis", status="completed", time="34m ago", steps=4),
        RecentRun(id="run-03", query="Enterprise LLM adoption trends", status="completed", time="1h ago", steps=4),
        RecentRun(id="run-04", query="European data center expansion outlook", status="failed", time="2h ago", steps=2),
    ]

    return OrchestrationResponse(
        activePipeline="Q3 2025 SaaS competitive landscape analysis",
        workflowSteps=workflow_steps,
        recentRuns=recent_runs,
    )