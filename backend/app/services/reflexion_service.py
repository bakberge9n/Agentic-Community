"""Mock data generator for reflexion (PRAR cycle) metrics."""

from app.models.schemas import (
    ReflexionResponse,
    ReflexionStats,
    ReflexionEvent,
    ReflexionOutcome,
    PRARCylePoint,
    ImprovementPoint,
    OutcomeDistribution,
)


def get_reflexion_data() -> ReflexionResponse:
    """Return realistic PRAR cycle reflexion analytics."""
    stats = ReflexionStats(
        totalCycles=8,
        avgImprovement="18.7%",
        currentScore="95%",
        positiveOutcomes="6/8",
    )

    prar_data = [
        PRARCylePoint(cycle=1, plan=95, reflect=72, analyze=68, refine=82),
        PRARCylePoint(cycle=2, plan=88, reflect=78, analyze=75, refine=85),
        PRARCylePoint(cycle=3, plan=92, reflect=85, analyze=80, refine=90),
        PRARCylePoint(cycle=4, plan=85, reflect=82, analyze=84, refine=88),
        PRARCylePoint(cycle=5, plan=90, reflect=88, analyze=86, refine=92),
        PRARCylePoint(cycle=6, plan=93, reflect=90, analyze=89, refine=94),
        PRARCylePoint(cycle=7, plan=91, reflect=86, analyze=88, refine=91),
        PRARCylePoint(cycle=8, plan=94, reflect=91, analyze=90, refine=95),
    ]

    improvement_data = [
        ImprovementPoint(cycle=1, improvement=0),
        ImprovementPoint(cycle=2, improvement=12),
        ImprovementPoint(cycle=3, improvement=18),
        ImprovementPoint(cycle=4, improvement=15),
        ImprovementPoint(cycle=5, improvement=22),
        ImprovementPoint(cycle=6, improvement=28),
        ImprovementPoint(cycle=7, improvement=25),
        ImprovementPoint(cycle=8, improvement=32),
    ]

    outcome_distribution = [
        OutcomeDistribution(name="Positive", value=6, fill="#22c55e"),
        OutcomeDistribution(name="Neutral", value=1, fill="#a1a1aa"),
        OutcomeDistribution(name="Negative", value=1, fill="#ef4444"),
    ]

    events = [
        ReflexionEvent(
            id="ref-01",
            agent="Researcher Alpha",
            cycle=8,
            summary="Improved source verification pipeline — false positive rate decreased by 23%",
            outcome=ReflexionOutcome.positive,
            timestamp="4m ago",
        ),
        ReflexionEvent(
            id="ref-02",
            agent="Analyst Beta",
            cycle=7,
            summary="Adjusted correlation weighting — accuracy improved from 82% to 89%",
            outcome=ReflexionOutcome.positive,
            timestamp="18m ago",
        ),
        ReflexionEvent(
            id="ref-03",
            agent="Writer Delta",
            cycle=6,
            summary="Style consistency below threshold — reverted to previous generation config",
            outcome=ReflexionOutcome.neutral,
            timestamp="45m ago",
        ),
        ReflexionEvent(
            id="ref-04",
            agent="Extractor Zeta",
            cycle=5,
            summary="Schema mapping drift detected — fallback to extraction v2.1",
            outcome=ReflexionOutcome.negative,
            timestamp="1h ago",
        ),
    ]

    return ReflexionResponse(
        stats=stats,
        prarCycleData=prar_data,
        improvementData=improvement_data,
        outcomeDistribution=outcome_distribution,
        recentEvents=events,
    )