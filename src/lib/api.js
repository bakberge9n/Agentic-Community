const API_BASE = 'http://localhost:8000';
const WS_BASE = 'ws://localhost:8000/ws';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function request(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new ApiError(data?.detail || `API error: ${res.status}`, res.status, data);
  }
  return res.json();
}

// Named exports for SWR usage
export const fetchFleet = () => request("/api/fleet");
export const fetchOrchestration = () => request("/api/orchestration");
export const fetchMemory = () => request("/api/memory");
export const fetchReflexion = () => request("/api/reflexion");
export const fetchHITL = () => request("/api/hitl");
export const approveHITL = (id) => request(`/api/hitl/${id}/approve`, { method: "POST" });
export const rejectHITL = (id) => request(`/api/hitl/${id}/reject`, { method: "POST" });
export const fetchHealth = () => request("/api/health");

// Object-style API for convenience
export const api = {
  getFleet: fetchFleet,
  getOrchestration: fetchOrchestration,
  getMemory: fetchMemory,
  getReflexion: fetchReflexion,
  getHITL: fetchHITL,
  approveHITL,
  rejectHITL,
};

// WebSocket connection
export function connectWebSocket(onMessage) {
  const ws = new WebSocket(WS_BASE);
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (err) {
      console.error('WS parse error:', err);
    }
  };
  ws.onerror = (err) => console.error('WS error:', err);
  ws.onclose = () => console.log('WS disconnected');
  return ws;
}