"""WebSocket connection manager for real-time agent updates."""

import json
import asyncio
import logging
from typing import Set, Any
from fastapi import WebSocket

from app.models.schemas import WSMessage

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manages WebSocket connections and broadcasts to clients."""

    def __init__(self):
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)
        logger.info(f"WebSocket connected. Total connections: {len(self.active_connections)}")

    async def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)
        logger.info(f"WebSocket disconnected. Total connections: {len(self.active_connections)}")

    async def broadcast(self, message: WSMessage):
        """Send a typed message to all connected clients."""
        payload = message.model_dump(by_alias=True)
        data = json.dumps(payload)
        dead: list[WebSocket] = []
        for connection in self.active_connections:
            try:
                await connection.send_text(data)
            except Exception:
                dead.append(connection)
        for conn in dead:
            self.active_connections.discard(conn)

    async def broadcast_event(self, event_type: str, payload: dict[str, Any]):
        """Convenience wrapper for broadcasting events."""
        msg = WSMessage(type=event_type, payload=payload)
        await self.broadcast(msg)


# Singleton instance
manager = ConnectionManager()


async def periodic_agent_updates():
    """Simulate periodic agent status updates pushed via WebSocket."""
    from app.services.agent_service import get_agents

    while True:
        await asyncio.sleep(5)
        try:
            fleet = get_agents()
            await manager.broadcast_event("agent_update", fleet.model_dump(by_alias=True))
        except Exception as e:
            logger.warning(f"Periodic agent update failed: {e}")