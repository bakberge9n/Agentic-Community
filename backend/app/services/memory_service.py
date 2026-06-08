"""Real Qdrant vector storage for hierarchical memory tiers (hot/warm/cold).

Uses in-memory Qdrant (no server needed) for development. Collections use
384-dimensional vectors with a deterministic hash-based embedding.
"""

import hashlib
import logging
import uuid
from datetime import datetime, timedelta
from typing import List, Optional

import numpy as np
from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    PointStruct,
    VectorParams,
)

from app.core.config import settings
from app.models.schemas import (
    MemoryEntry,
    MemoryItemType,
    MemoryTier,
    MemoryTierInfo,
    MemoryResponse,
)

logger = logging.getLogger(__name__)

EMBEDDING_DIM = 384

# ─── Dummy Embedding Function ──────────────────────────────────────────────


def _dummy_embed(text: str) -> List[float]:
    """Generate a deterministic 384-dim vector from text."""
    h = hashlib.sha256(text.encode()).hexdigest()
    rng = np.random.RandomState(int(h[:8], 16))
    vec = rng.randn(EMBEDDING_DIM).astype(np.float32)
    vec = vec / np.linalg.norm(vec)
    return vec.tolist()


# ─── Collection Names ──────────────────────────────────────────────────────

TIER_COLLECTIONS = {
    MemoryTier.hot: "hot_memory",
    MemoryTier.warm: "warm_memory",
    MemoryTier.cold: "cold_memory",
}

TIER_CONFIG = {
    MemoryTier.hot: {
        "label": "Hot",
        "description": "Active session context — instant recall",
        "retention": "24 hours",
    },
    MemoryTier.warm: {
        "label": "Warm",
        "description": "Recent sessions and intermediate results",
        "retention": "7 days",
    },
    MemoryTier.cold: {
        "label": "Cold",
        "description": "Archived results and long-term memory",
        "retention": "90 days",
    },
}

# ─── Qdrant Client Singleton ───────────────────────────────────────────────

_client: Optional[QdrantClient] = None


def get_client() -> QdrantClient:
    """Get or create the Qdrant client (in-memory)."""
    global _client
    if _client is None:
        _client = QdrantClient(":memory:")
        logger.info("Qdrant in-memory client created")
        _init_collections()
    return _client


def _init_collections():
    """Create vector collections for each memory tier."""
    client = _client
    for collection_name in TIER_COLLECTIONS.values():
        try:
            client.recreate_collection(
                collection_name=collection_name,
                vectors_config=VectorParams(size=EMBEDDING_DIM, distance=Distance.COSINE),
            )
            logger.info(f"Created Qdrant collection: {collection_name}")
        except Exception as e:
            logger.warning(f"Collection {collection_name} error: {e}")


# ─── Core Operations ───────────────────────────────────────────────────────


def store_memory(text: str, tier: str, source: str = "agent") -> str:
    """Store a memory entry in the given tier. Returns the point ID."""
    client = get_client()
    tier_enum = MemoryTier(tier)
    collection = TIER_COLLECTIONS[tier_enum]
    point_id = str(uuid.uuid4())
    vector = _dummy_embed(text)

    point = PointStruct(
        id=point_id,
        vector=vector,
        payload={
            "text": text,
            "source": source,
            "tier": tier,
            "timestamp": datetime.utcnow().isoformat(),
            "tokens": len(text.split()) * 4,
        },
    )
    client.upsert(collection_name=collection, points=[point])
    logger.info(f"Stored memory in {tier} tier, id={point_id[:8]}...")
    return point_id


def search_memory(query: str, tier: str, top_k: int = 5) -> List[dict]:
    """Search memory in a specific tier by semantic similarity."""
    client = get_client()
    tier_enum = MemoryTier(tier)
    collection = TIER_COLLECTIONS[tier_enum]
    query_vector = _dummy_embed(query)

    results = client.search(
        collection_name=collection,
        query_vector=query_vector,
        limit=top_k,
        with_payload=True,
    )
    return [
        {
            "id": hit.id,
            "score": hit.score,
            "text": hit.payload.get("text", ""),
            "source": hit.payload.get("source", ""),
            "timestamp": hit.payload.get("timestamp", ""),
            "tokens": hit.payload.get("tokens", 0),
        }
        for hit in results
    ]


def get_memory_stats() -> dict:
    """Return stats about each memory tier."""
    client = get_client()
    stats = {}
    for tier, collection in TIER_COLLECTIONS.items():
        try:
            info = client.get_collection(collection_name=collection)
            stats[tier.value] = {
                "collection": collection,
                "vectors_count": info.vectors_count or 0,
                "points_count": info.points_count or 0,
            }
        except Exception as e:
            stats[tier.value] = {"collection": collection, "error": str(e)}
    return stats


def get_memory_data() -> MemoryResponse:
    """Build MemoryResponse from actual Qdrant data."""
    client = get_client()
    tiers: List[MemoryTierInfo] = []

    for tier_enum in (MemoryTier.hot, MemoryTier.warm, MemoryTier.cold):
        config = TIER_CONFIG[tier_enum]
        collection = TIER_COLLECTIONS[tier_enum]

        try:
            scroll_result = client.scroll(
                collection_name=collection,
                limit=settings.max_memory_items_per_tier,
                with_payload=True,
            )
            points, _ = scroll_result
            items = []
            for pt in points:
                payload = pt.payload or {}
                text = payload.get("text", "")
                source = payload.get("source", "agent")

                if "report" in text.lower() or source == "writer":
                    item_type = MemoryItemType.report
                elif "analys" in text.lower():
                    item_type = MemoryItemType.analysis
                elif "vector" in text.lower() or "embed" in text.lower():
                    item_type = MemoryItemType.vector
                elif "config" in text.lower() or "pipeline" in text.lower():
                    item_type = MemoryItemType.context
                else:
                    item_type = MemoryItemType.conversation

                timestamp_str = payload.get("timestamp", "")
                age = "recent"
                if timestamp_str:
                    try:
                        ts = datetime.fromisoformat(timestamp_str)
                        delta = datetime.utcnow() - ts
                        if delta < timedelta(hours=1):
                            age = f"{int(delta.total_seconds() / 60)}m ago"
                        elif delta < timedelta(days=1):
                            age = f"{int(delta.total_seconds() / 3600)}h ago"
                        else:
                            age = f"{delta.days}d ago"
                    except ValueError:
                        age = "recent"

                items.append(
                    MemoryEntry(
                        type=item_type,
                        preview=text[:80] + ("..." if len(text) > 80 else ""),
                        age=age,
                        tokens=payload.get("tokens", len(text.split())),
                    )
                )
        except Exception:
            items = []

        tiers.append(
            MemoryTierInfo(
                id=tier_enum,
                label=config["label"],
                description=config["description"],
                retention=config["retention"],
                items=items,
            )
        )

    return MemoryResponse(tiers=tiers)
# ─── Compatibility class for tasks.py ──────────────────────────────────────

class MemoryServiceCompat:
    """Backward-compatible wrapper for the tasks route."""
    
    def search(self, query: str, tier: str = "warm_memory"):
        """Search across all memory tiers."""
        return search_memory(query, tier.replace("_memory", ""), top_k=5)
    
    def store(self, text: str, tier: str = "hot_memory", source: str = "agent"):
        """Store in memory."""
        return store_memory(text, tier.replace("_memory", ""), source=source)

memory_service = MemoryServiceCompat()
