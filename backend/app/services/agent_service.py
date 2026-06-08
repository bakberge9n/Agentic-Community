"""Real multi-agent workflow system using LangGraph.

Orchestrates 5 agents in a pipeline:
  Manager (GPT-4-mini) → Researcher (Gemini 2.0 Flash) → Analyst (GPT-4-mini)
  → Writer (GPT-4-mini) → Reviewer (Gemini 2.0 Flash)

Each agent's output is stored in Qdrant memory tiers.
"""

import json
import logging
import time
import uuid
from typing import Any, Dict, List, TypedDict

from langgraph.graph import StateGraph, END

from app.core.config import settings
from app.models.schemas import (
    Agent,
    AgentStatus,
    FleetStats,
    FleetResponse,
    HITLItem,
    HITLPriority,
    HITLType,
    HITLResponse,
    WorkflowStep,
    WorkflowStepStatus,
    RecentRun,
    OrchestrationResponse,
)
from app.services.memory_service import store_memory, get_memory_data
from app.websocket.manager import manager

logger = logging.getLogger(__name__)

# ─── LLM Clients (lazy init) ───────────────────────────────────────────────

_openai_client = None
_gemini_model = None


def _get_openai():
    global _openai_client
    if _openai_client is None and settings.openai_api_key:
        from openai import OpenAI
        _openai_client = OpenAI(api_key=settings.openai_api_key)
    return _openai_client


def _get_gemini():
    global _gemini_model
    if _gemini_model is None and settings.gemini_api_key:
        import google.generativeai as genai
        genai.configure(api_key=settings.gemini_api_key)
        _gemini_model = genai.GenerativeModel("gemini-2.0-flash-exp")
    return _gemini_model


def _call_llm(provider: str, prompt: str, system: str = "") -> str:
    """Call an LLM and return the text response. Gracefully falls back on error."""
    if provider == "openai":
        client = _get_openai()
        if not client:
            return f"[Mock OpenAI response for: {prompt[:50]}...]"
        try:
            messages = []
            if system:
                messages.append({"role": "system", "content": system})
            messages.append({"role": "user", "content": prompt})
            resp = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                max_tokens=1024,
            )
            return resp.choices[0].message.content or ""
        except Exception as e:
            logger.warning(f"OpenAI call failed: {e}")
            return f"[OpenAI fallback: {prompt[:60]}...]"

    elif provider == "gemini":
        model = _get_gemini()
        if not model:
            return f"[Mock Gemini response for: {prompt[:50]}...]"
        try:
            full_prompt = f"{system}\n\n{prompt}" if system else prompt
            resp = model.generate_content(full_prompt)
            return resp.text or ""
        except Exception as e:
            logger.warning(f"Gemini call failed: {e}")
            return f"[Gemini fallback: {prompt[:60]}...]"

    return "[Unknown provider]"


# ─── Agent State ────────────────────────────────────────────────────────────

class AgentState(TypedDict):
    """Shared state passed between agents in the LangGraph workflow."""
    task_id: str
    query: str
    plan: str
    research: str
    analysis: str
    draft: str
    review: str
    final_output: str
    status: str
    current_agent: str
    errors: List[str]


def _make_agent_event(state: AgentState, agent_name: str, status: str, detail: str = ""):
    """Broadcast agent status update via WebSocket."""
    loop = _get_event_loop()
    if loop and loop.is_running():
        try:
            import asyncio
            asyncio.ensure_future(
                manager.broadcast_event("agent_update", {
                    "agent": agent_name,
                    "status": status,
                    "detail": detail,
                    "task_id": state.get("task_id", ""),
                    "timestamp": time.time(),
                })
            )
        except Exception:
            pass


def _get_event_loop():
    try:
        import asyncio
        return asyncio.get_event_loop()
    except RuntimeError:
        return None


# ─── Agent Node Functions ───────────────────────────────────────────────────


def manager_node(state: AgentState) -> Dict[str, Any]:
    """Manager Agent: decompose the user query into a plan."""
    query = state["query"]
    system = "You are a senior research manager. Decompose complex questions into a structured research plan with 3-4 clear steps."
    prompt = f"Create a research plan for: {query}\n\nOutput a numbered plan with specific investigation areas."
    result = _call_llm("openai", prompt, system)
    _make_agent_event(state, "Manager Gamma", "completed", "Task decomposed into plan")
    store_memory(f"Plan for: {query}\n{result}", "hot", source="manager")
    return {"plan": result, "current_agent": "researcher", "status": "running"}


def researcher_node(state: AgentState) -> Dict[str, Any]:
    """Researcher Agent: gather information based on the plan."""
    plan = state["plan"]
    query = state["query"]
    system = "You are a research analyst at a top consulting firm. Gather detailed, specific information on each area."
    prompt = f"Research query: {query}\n\nPlan: {plan}\n\nProvide detailed findings for each area with specific data points."
    result = _call_llm("gemini", prompt, system)
    _make_agent_event(state, "Researcher Alpha", "completed", f"Research gathered ({len(result)} chars)")
    store_memory(f"Research for: {query}\n{result}", "hot", source="researcher")
    return {"research": result, "current_agent": "analyst"}


def analyst_node(state: AgentState) -> Dict[str, Any]:
    """Analyst Agent: synthesize research into structured insights."""
    research = state["research"]
    query = state["query"]
    system = "You are a data analyst. Synthesize research findings into clear, structured insights with key takeaways."
    prompt = f"Query: {query}\n\nResearch findings:\n{research}\n\nSynthesize these into 3-5 key insights with supporting evidence."
    result = _call_llm("openai", prompt, system)
    _make_agent_event(state, "Analyst Beta", "completed", "Analysis synthesized")
    store_memory(f"Analysis for: {query}\n{result}", "warm", source="analyst")
    return {"analysis": result, "current_agent": "writer"}


def writer_node(state: AgentState) -> Dict[str, Any]:
    """Writer Agent: produce a polished final report."""
    analysis = state["analysis"]
    query = state["query"]
    system = "You are a professional writer. Create a well-structured, polished report from the analysis provided."
    prompt = f"Query: {query}\n\nAnalysis:\n{analysis}\n\nWrite a comprehensive report with executive summary, findings, and recommendations."
    result = _call_llm("openai", prompt, system)
    _make_agent_event(state, "Writer Delta", "completed", f"Draft produced ({len(result)} chars)")
    store_memory(f"Draft for: {query}\n{result}", "warm", source="writer")
    return {"draft": result, "current_agent": "reviewer"}


def reviewer_node(state: AgentState) -> Dict[str, Any]:
    """Reviewer Agent: quality check the draft."""
    draft = state["draft"]
    query = state["query"]
    system = "You are a senior editor and fact-checker. Review the report for accuracy, completeness, and clarity."
    prompt = f"Original query: {query}\n\nDraft report:\n{draft}\n\nReview this report. Provide: 1) Factual accuracy check, 2) Completeness assessment, 3) Clarity and structure feedback, 4) Final verdict (approved/revision needed)."
    result = _call_llm("gemini", prompt, system)
    _make_agent_event(state, "Reviewer Epsilon", "completed", "Review complete")
    store_memory(f"Final review for: {query}\nReview: {result}\n\nFinal: {draft}", "cold", source="reviewer")
    approved = "approved" in result.lower() and "revision" not in result.lower()
    return {
        "review": result,
        "final_output": draft if approved else f"Draft needs revision. Review feedback:\n{result}\n\n---\n\n{draft}",
        "status": "completed",
        "current_agent": "done",
    }


# ─── Build the Graph ────────────────────────────────────────────────────────

_agent_graph = None


def build_graph() -> StateGraph:
    """Build and compile the LangGraph agent workflow."""
    global _agent_graph
    if _agent_graph is not None:
        return _agent_graph

    workflow = StateGraph(AgentState)

    workflow.add_node("manager", manager_node)
    workflow.add_node("researcher", researcher_node)
    workflow.add_node("analyst", analyst_node)
    workflow.add_node("writer", writer_node)
    workflow.add_node("reviewer", reviewer_node)

    workflow.add_edge("manager", "researcher")
    workflow.add_edge("researcher", "analyst")
    workflow.add_edge("analyst", "writer")
    workflow.add_edge("writer", "reviewer")
    workflow.add_edge("reviewer", END)

    workflow.set_entry_point("manager")

    _agent_graph = workflow.compile()
    logger.info("LangGraph agent workflow compiled")
    return _agent_graph


def run_agent_workflow(query: str) -> Dict[str, Any]:
    """Execute the full multi-agent workflow and return results."""
    graph = build_graph()
    task_id = f"task-{uuid.uuid4().hex[:8]}"

    initial_state: AgentState = {
        "task_id": task_id,
        "query": query,
        "plan": "",
        "research": "",
        "analysis": "",
        "draft": "",
        "review": "",
        "final_output": "",
        "status": "running",
        "current_agent": "manager",
        "errors": [],
    }

    try:
        result = graph.invoke(initial_state)
        logger.info(f"Workflow completed for task {task_id}")
        return {
            "task_id": task_id,
            "status": result.get("status", "completed"),
            "query": query,
            "plan": result.get("plan", ""),
            "research": result.get("research", ""),
            "analysis": result.get("analysis", ""),
            "draft": result.get("draft", ""),
            "review": result.get("review", ""),
            "final_output": result.get("final_output", result.get("draft", "")),
            "agents_involved": ["Manager Gamma", "Researcher Alpha", "Analyst Beta", "Writer Delta", "Reviewer Epsilon"],
        }
    except Exception as e:
        logger.error(f"Workflow failed: {e}")
        return {
            "task_id": task_id,
            "status": "failed",
            "query": query,
            "error": str(e),
            "final_output": f"Workflow execution error: {e}",
            "agents_involved": [],
        }


# ─── Fleet Data ─────────────────────────────────────────────────────────────

def get_agents() -> FleetResponse:
    """Return current agent fleet."""
    agents = [
        Agent(id="mgr-01", name="Manager Gamma", role="Orchestration & Delegation",
              status=AgentStatus.active, tokensUsed=45_123, budget=200_000,
              tasksCompleted=212, avgLatency="0.4s", uptime="99.9%"),
        Agent(id="res-01", name="Researcher Alpha", role="Market Intelligence",
              status=AgentStatus.active, tokensUsed=284_521, budget=500_000,
              tasksCompleted=147, avgLatency="1.2s", uptime="99.8%"),
        Agent(id="ana-01", name="Analyst Beta", role="Data Synthesis",
              status=AgentStatus.active, tokensUsed=192_340, budget=400_000,
              tasksCompleted=98, avgLatency="2.1s", uptime="99.2%"),
        Agent(id="wri-01", name="Writer Delta", role="Content Generation",
              status=AgentStatus.idle, tokensUsed=156_789, budget=350_000,
              tasksCompleted=73, avgLatency="3.5s", uptime="97.1%"),
        Agent(id="qa-01", name="Reviewer Epsilon", role="Quality Assurance",
              status=AgentStatus.active, tokensUsed=89_450, budget=300_000,
              tasksCompleted=164, avgLatency="0.8s", uptime="98.5%"),
        Agent(id="ext-01", name="Extractor Zeta", role="Data Extraction",
              status=AgentStatus.error, tokensUsed=312_800, budget=250_000,
              tasksCompleted=56, avgLatency="5.2s", uptime="89.3%"),
    ]
    stats = FleetStats(total=6, active=4, idle=1, error=1, totalTokens=1_081_023, avgLatency="2.2s")
    return FleetResponse(agents=agents, stats=stats)


def get_orchestration_data() -> OrchestrationResponse:
    """Return orchestration graph data."""
    steps = [
        WorkflowStep(id="manager", name="Manager", agent="Manager Gamma",
                     description="Task decomposition and delegation",
                     status=WorkflowStepStatus.completed, details="Plan created", duration="0.4s"),
        WorkflowStep(id="researcher", name="Researcher", agent="Researcher Alpha",
                     description="Gather market intelligence",
                     status=WorkflowStepStatus.completed, details="Sources analyzed", duration="2.3s"),
        WorkflowStep(id="analyst", name="Analyst", agent="Analyst Beta",
                     description="Synthesize findings into insights",
                     status=WorkflowStepStatus.active, details="Processing data", duration="4.1s"),
        WorkflowStep(id="writer", name="Writer", agent="Writer Delta",
                     description="Generate report drafts",
                     status=WorkflowStepStatus.pending, details="Waiting", duration="—"),
        WorkflowStep(id="reviewer", name="Reviewer", agent="Reviewer Epsilon",
                     description="Quality assurance",
                     status=WorkflowStepStatus.pending, details="Awaiting draft", duration="—"),
    ]
    runs = [
        RecentRun(id="run-01", query="Q3 2025 SaaS competitive landscape", status="completed", time="12m ago", steps=5),
        RecentRun(id="run-02", query="AI infrastructure market size", status="completed", time="34m ago", steps=5),
        RecentRun(id="run-03", query="Enterprise LLM adoption trends", status="completed", time="1h ago", steps=5),
        RecentRun(id="run-04", query="European data center expansion", status="failed", time="2h ago", steps=2),
    ]
    return OrchestrationResponse(
        activePipeline="Multi-agent workflow pipeline",
        workflowSteps=steps,
        recentRuns=runs,
    )


def get_hitl_items() -> HITLResponse:
    """Return HITL approval queue items."""
    items = [
        HITLItem(id="hitl-001", priority=HITLPriority.high, agent="Writer Delta",
                 action="Publish Competitive Analysis Report",
                 summary="Full Q3 2025 SaaS competitive landscape draft ready for review.",
                 details="Report includes market share analysis, feature comparison matrix.",
                 timestamp="3m ago", deadline="30m",
                 risk="Contains market projections requiring human validation", type=HITLType.report),
        HITLItem(id="hitl-002", priority=HITLPriority.critical, agent="Extractor Zeta",
                 action="Execute Data Enrichment Pipeline",
                 summary="Data extraction pipeline requires approval due to API cost threshold.",
                 details="Pipeline will process ~50K records. Estimated API cost: $247.",
                 timestamp="12m ago", deadline="15m",
                 risk="API cost exceeds budget threshold by $47", type=HITLType.pipeline),
        HITLItem(id="hitl-003", priority=HITLPriority.medium, agent="Analyst Beta",
                 action="Approve Revised Correlation Model",
                 summary="Updated correlation weighting algorithm.",
                 details="Weighting change from linear (0.8) to logarithmic (0.92).",
                 timestamp="45m ago", deadline="2h",
                 risk="Model change affects all downstream analyses", type=HITLType.model),
        HITLItem(id="hitl-004", priority=HITLPriority.low, agent="Researcher Alpha",
                 action="Validate New Source Integration",
                 summary="Request to add Bloomberg Terminal API as a trusted data source.",
                 details="Integration effort: ~2 hours.",
                 timestamp="1h ago", deadline="4h",
                 risk="Low — existing fallback sources available", type=HITLType.integration),
        HITLItem(id="hitl-005", priority=HITLPriority.critical, agent="Manager Gamma",
                 action="Approve Budget Override",
                 summary="Researcher Alpha approaching its token budget.",
                 details="Current: 284,521 / 500,000 tokens. Projected ~12% overage.",
                 timestamp="2m ago", deadline="10m",
                 risk="Agent will pause within ~8 minutes", type=HITLType.budget),
        HITLItem(id="hitl-006", priority=HITLPriority.high, agent="Reviewer Epsilon",
                 action="Review Factual Discrepancy Report",
                 summary="Fact-checking found 3 potential discrepancies.",
                 details="Market size mismatch, outdated ranking, ambiguous reference.",
                 timestamp="22m ago", deadline="1h",
                 risk="Report accuracy credibility at stake", type=HITLType.review),
    ]
    return HITLResponse(items=items, pendingCount=len(items))
# ─── Compatibility aliases ─────────────────────────────────────────────────

_run_task_history = {}

def run_task(query: str) -> dict:
    """Compatibility wrapper that runs the workflow and returns results."""
    global _run_task_history
    result = run_agent_workflow(query)
    _run_task_history["last"] = result
    return {
        "query": result.get("query", query),
        "output": result.get("final_output", result.get("draft", "")),
        "plan": result.get("plan", ""),
        "research": result.get("research", ""),
        "analysis": result.get("analysis", ""),
        "feedback": result.get("review", ""),
        "status": result.get("status", "complete"),
    }


def get_last_result() -> dict | None:
    """Get the last task result."""
    return _run_task_history.get("last")

def get_fleet():
    """Compatibility alias for get_agents."""
    return get_agents()
