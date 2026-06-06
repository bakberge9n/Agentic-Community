"""Pydantic schemas matching the frontend data contracts."""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


# ─── Enums ──────────────────────────────────────────────────────────────────

class AgentStatus(str, Enum):
    active = "active"
    idle = "idle"
    error = "error"
    paused = "paused"


class WorkflowStepStatus(str, Enum):
    pending = "pending"
    active = "active"
    completed = "completed"
    failed = "failed"


class HITLPriority(str, Enum):
    critical = "critical"
    high = "high"
    medium = "medium"
    low = "low"


class HITLType(str, Enum):
    report = "report"
    pipeline = "pipeline"
    model = "model"
    integration = "integration"
    budget = "budget"
    review = "review"


class MemoryTier(str, Enum):
    hot = "hot"
    warm = "warm"
    cold = "cold"


class MemoryItemType(str, Enum):
    conversation = "conversation"
    context = "context"
    vector = "vector"
    report = "report"
    analysis = "analysis"


class ReflexionOutcome(str, Enum):
    positive = "positive"
    neutral = "neutral"
    negative = "negative"


# ─── Agent / Fleet ──────────────────────────────────────────────────────────

class Agent(BaseModel):
    id: str
    name: str
    role: str
    status: AgentStatus
    tokens_used: int = Field(alias="tokensUsed", default=0)
    budget: int = 500_000
    tasks_completed: int = Field(alias="tasksCompleted", default=0)
    avg_latency: str = Field(alias="avgLatency", default="0s")
    uptime: str = "0%"


class FleetStats(BaseModel):
    total: int
    active: int
    idle: int
    error: int
    total_tokens: int = Field(alias="totalTokens")
    avg_latency: str = Field(alias="avgLatency")


class FleetResponse(BaseModel):
    agents: List[Agent]
    stats: FleetStats


# ─── Orchestration Graph ────────────────────────────────────────────────────

class WorkflowStep(BaseModel):
    id: str
    name: str
    agent: str
    description: str
    status: WorkflowStepStatus
    details: str
    duration: str


class RecentRun(BaseModel):
    id: str
    query: str
    status: str
    time: str
    steps: int


class OrchestrationResponse(BaseModel):
    active_pipeline: str = Field(alias="activePipeline")
    workflow_steps: List[WorkflowStep] = Field(alias="workflowSteps")
    recent_runs: List[RecentRun] = Field(alias="recentRuns")


# ─── HITL (Human-in-the-Loop) ───────────────────────────────────────────────

class HITLItem(BaseModel):
    id: str
    priority: HITLPriority
    agent: str
    action: str
    summary: str
    details: str
    timestamp: str
    deadline: str
    risk: str
    type: HITLType


class HITLResponse(BaseModel):
    items: List[HITLItem]
    pending_count: int = Field(alias="pendingCount")


# ─── Memory Tiers ───────────────────────────────────────────────────────────

class MemoryEntry(BaseModel):
    type: MemoryItemType
    preview: str
    age: str
    tokens: int


class MemoryTierInfo(BaseModel):
    id: MemoryTier
    label: str
    description: str
    retention: str
    items: List[MemoryEntry]


class MemoryResponse(BaseModel):
    tiers: List[MemoryTierInfo]


# ─── Reflexion Metrics ──────────────────────────────────────────────────────

class PRARCylePoint(BaseModel):
    cycle: int
    plan: float
    reflect: float
    analyze: float
    refine: float


class ImprovementPoint(BaseModel):
    cycle: int
    improvement: float


class OutcomeDistribution(BaseModel):
    name: str
    value: int
    fill: str


class ReflexionEvent(BaseModel):
    id: str
    agent: str
    cycle: int
    summary: str
    outcome: ReflexionOutcome
    timestamp: str


class ReflexionStats(BaseModel):
    total_cycles: int = Field(alias="totalCycles")
    avg_improvement: str = Field(alias="avgImprovement")
    current_score: str = Field(alias="currentScore")
    positive_outcomes: str = Field(alias="positiveOutcomes")


class ReflexionResponse(BaseModel):
    stats: ReflexionStats
    prar_cycle_data: List[PRARCylePoint] = Field(alias="prarCycleData")
    improvement_data: List[ImprovementPoint] = Field(alias="improvementData")
    outcome_distribution: List[OutcomeDistribution] = Field(alias="outcomeDistribution")
    recent_events: List[ReflexionEvent] = Field(alias="recentEvents")


# ─── WebSocket Messages ─────────────────────────────────────────────────────

class WSMessage(BaseModel):
    type: str  # "agent_update", "hitl_new", "reflexion_event", "orchestration_update"
    payload: dict