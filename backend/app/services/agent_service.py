"""Mock data generator for the agent fleet and HITL inbox."""

from app.models.schemas import (
    Agent,
    AgentStatus,
    FleetStats,
    FleetResponse,
    HITLItem,
    HITLPriority,
    HITLType,
    HITLResponse,
)


def get_agents() -> FleetResponse:
    """Return realistic mock agent fleet data."""
    agents = [
        Agent(
            id="res-01",
            name="Researcher Alpha",
            role="Market Intelligence",
            status=AgentStatus.active,
            tokensUsed=284_521,
            budget=500_000,
            tasksCompleted=147,
            avgLatency="1.2s",
            uptime="99.8%",
        ),
        Agent(
            id="ana-01",
            name="Analyst Beta",
            role="Data Synthesis",
            status=AgentStatus.active,
            tokensUsed=192_340,
            budget=400_000,
            tasksCompleted=98,
            avgLatency="2.1s",
            uptime="99.2%",
        ),
        Agent(
            id="mgr-01",
            name="Manager Gamma",
            role="Orchestration & Delegation",
            status=AgentStatus.active,
            tokensUsed=45_123,
            budget=200_000,
            tasksCompleted=212,
            avgLatency="0.4s",
            uptime="99.9%",
        ),
        Agent(
            id="wri-01",
            name="Writer Delta",
            role="Content Generation",
            status=AgentStatus.idle,
            tokensUsed=156_789,
            budget=350_000,
            tasksCompleted=73,
            avgLatency="3.5s",
            uptime="97.1%",
        ),
        Agent(
            id="qa-01",
            name="Reviewer Epsilon",
            role="Quality Assurance",
            status=AgentStatus.active,
            tokensUsed=89_450,
            budget=300_000,
            tasksCompleted=164,
            avgLatency="0.8s",
            uptime="98.5%",
        ),
        Agent(
            id="ext-01",
            name="Extractor Zeta",
            role="Data Extraction",
            status=AgentStatus.error,
            tokensUsed=312_800,
            budget=250_000,
            tasksCompleted=56,
            avgLatency="5.2s",
            uptime="89.3%",
        ),
    ]

    stats = FleetStats(
        total=6,
        active=4,
        idle=1,
        error=1,
        totalTokens=1_081_023,
        avgLatency="2.2s",
    )

    return FleetResponse(agents=agents, stats=stats)


def get_hitl_items() -> HITLResponse:
    """Return realistic HITL approval queue items."""
    items = [
        HITLItem(
            id="hitl-001",
            priority=HITLPriority.high,
            agent="Writer Delta",
            action="Publish Competitive Analysis Report",
            summary="Full Q3 2025 SaaS competitive landscape draft ready for review. Covers 14 vendors across 3 tiers.",
            details="Report includes market share analysis, feature comparison matrix, pricing tier breakdown, and strategic recommendations. 4,200+ words across 12 sections.",
            timestamp="3m ago",
            deadline="30m",
            risk="Contains forward-looking market projections that require human validation",
            type=HITLType.report,
        ),
        HITLItem(
            id="hitl-002",
            priority=HITLPriority.critical,
            agent="Extractor Zeta",
            action="Execute Data Enrichment Pipeline",
            summary="Data extraction pipeline for EU data center expansion analysis requires approval due to API cost threshold.",
            details="Pipeline will process ~50K records across 3 data sources. Estimated API cost: $247. Manual approval required for costs exceeding $200 threshold.",
            timestamp="12m ago",
            deadline="15m",
            risk="API cost exceeds automated budget threshold by $47",
            type=HITLType.pipeline,
        ),
        HITLItem(
            id="hitl-003",
            priority=HITLPriority.medium,
            agent="Analyst Beta",
            action="Approve Revised Correlation Model",
            summary="Analyst Beta proposes updated correlation weighting algorithm based on recent reflexion cycle.",
            details="Weighting change from linear (0.8) to logarithmic (0.92). Tested on 3 validation sets with 89% accuracy vs current 82%.",
            timestamp="45m ago",
            deadline="2h",
            risk="Model change affects all downstream analyses",
            type=HITLType.model,
        ),
        HITLItem(
            id="hitl-004",
            priority=HITLPriority.low,
            agent="Researcher Alpha",
            action="Validate New Source Integration",
            summary="Request to add Bloomberg Terminal API as a trusted data source.",
            details="New data source requires validation of schema compatibility, update frequency, and rate limit handling. Integration effort: ~2 hours.",
            timestamp="1h ago",
            deadline="4h",
            risk="Low — existing fallback sources available",
            type=HITLType.integration,
        ),
        HITLItem(
            id="hitl-005",
            priority=HITLPriority.critical,
            agent="Manager Gamma",
            action="Approve Budget Override",
            summary="Researcher Alpha is approaching its token budget for the current analysis window.",
            details="Current: 284,521 / 500,000 tokens. Projected to exceed by ~12% if current task completes. Manual override or budget adjustment needed.",
            timestamp="2m ago",
            deadline="10m",
            risk="Agent will pause within ~8 minutes if not approved",
            type=HITLType.budget,
        ),
        HITLItem(
            id="hitl-006",
            priority=HITLPriority.high,
            agent="Reviewer Epsilon",
            action="Review Factual Discrepancy Report",
            summary="Fact-checking found 3 potential discrepancies in the Writer Delta report draft.",
            details="Discrepancies: 1) Market size figure mismatch (reported $4.2B vs source $4.8B), 2) Outdated vendor ranking, 3) Ambiguous regulatory reference.",
            timestamp="22m ago",
            deadline="1h",
            risk="Report accuracy credibility at stake",
            type=HITLType.review,
        ),
    ]

    return HITLResponse(items=items, pendingCount=len(items))