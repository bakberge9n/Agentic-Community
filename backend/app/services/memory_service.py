"""Mock data generator for memory tiers."""

from app.models.schemas import (
    MemoryEntry,
    MemoryItemType,
    MemoryTier,
    MemoryTierInfo,
    MemoryResponse,
)


def get_memory_data() -> MemoryResponse:
    """Return realistic hierarchical memory tier data."""
    tiers = [
        MemoryTierInfo(
            id=MemoryTier.hot,
            label="Hot",
            description="Active session context — instant recall",
            retention="24 hours",
            items=[
                MemoryEntry(
                    type=MemoryItemType.conversation,
                    preview="Current market analysis session: SaaS competitive landscape Q3 2025",
                    age="2m ago",
                    tokens=3_450,
                ),
                MemoryEntry(
                    type=MemoryItemType.context,
                    preview="Active workflow state — Researcher → Analyst pipeline",
                    age="5m ago",
                    tokens=1_200,
                ),
                MemoryEntry(
                    type=MemoryItemType.vector,
                    preview="Recent query embedding cache (14 sources)",
                    age="12m ago",
                    tokens=8_900,
                ),
            ],
        ),
        MemoryTierInfo(
            id=MemoryTier.warm,
            label="Warm",
            description="Recent sessions and intermediate results",
            retention="7 days",
            items=[
                MemoryEntry(
                    type=MemoryItemType.report,
                    preview="Q2 2025 Earnings call analysis — Tech sector",
                    age="3h ago",
                    tokens=15_200,
                ),
                MemoryEntry(
                    type=MemoryItemType.analysis,
                    preview="Competitor pricing matrix — Q2 update",
                    age="1d ago",
                    tokens=8_400,
                ),
                MemoryEntry(
                    type=MemoryItemType.conversation,
                    preview="AI infrastructure vendor evaluation",
                    age="2d ago",
                    tokens=12_100,
                ),
                MemoryEntry(
                    type=MemoryItemType.context,
                    preview="Data extraction pipeline config — EU markets",
                    age="3d ago",
                    tokens=3_200,
                ),
            ],
        ),
        MemoryTierInfo(
            id=MemoryTier.cold,
            label="Cold",
            description="Archived results and long-term memory",
            retention="90 days",
            items=[
                MemoryEntry(
                    type=MemoryItemType.report,
                    preview="Q1 2025 Market Intelligence Report — Full",
                    age="45d ago",
                    tokens=45_200,
                ),
                MemoryEntry(
                    type=MemoryItemType.analysis,
                    preview="Annual competitor benchmarking 2024",
                    age="120d ago",
                    tokens=82_000,
                ),
                MemoryEntry(
                    type=MemoryItemType.conversation,
                    preview="Initial system prompt engineering sessions",
                    age="60d ago",
                    tokens=23_400,
                ),
                MemoryEntry(
                    type=MemoryItemType.vector,
                    preview="Embedding index — Historical market data v2",
                    age="30d ago",
                    tokens=128_000,
                ),
                MemoryEntry(
                    type=MemoryItemType.report,
                    preview="Data center expansion feasibility study",
                    age="75d ago",
                    tokens=34_100,
                ),
            ],
        ),
    ]

    return MemoryResponse(tiers=tiers)