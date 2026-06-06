import { motion } from "framer-motion";
import useSWR from "swr";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Zap,
  Users,
  Clock,
  AlertTriangle,
  RefreshCw,
  MoreHorizontal,
  Loader2,
} from "lucide-react";
import { fetchFleet } from "../lib/api";

function StatusDot({ status }) {
  const colors = {
    active: "bg-emerald-500",
    idle: "bg-zinc-300",
    error: "bg-red-500",
  };
  return (
    <span className={`w-2 h-2 rounded-full ${colors[status] || "bg-zinc-300"} flex-shrink-0`} />
  );
}

function TokenBudget({ used, budget }) {
  const pct = Math.round((used / budget) * 100);
  const color = pct > 90 ? "bg-red-400" : pct > 70 ? "bg-amber-400" : "bg-emerald-400";
  return (
    <div className="w-full mt-2">
      <div className="flex justify-between text-xs text-zinc-400 mb-1">
        <span>{pct}% used</span>
        <span>{(budget / 1000).toFixed(0)}K</span>
      </div>
      <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
    </div>
  );
}

export default function FleetOverview() {
  const { data, error, isLoading, mutate } = useSWR("fleet", fetchFleet, {
    refreshInterval: 10000,
  });

  const agents = data?.agents ?? [];
  const fleetStats = {
    total: agents.length,
    active: agents.filter((a) => a.status === "active").length,
    idle: agents.filter((a) => a.status === "idle").length,
    error: agents.filter((a) => a.status === "error").length,
    totalTokens: agents.reduce((sum, a) => sum + (a.tokensUsed || 0), 0),
    avgLatency: agents.length
      ? agents
          .reduce((sum, a) => sum + parseFloat(a.avgLatency || "0"), 0) /
          agents.length +
        "s"
      : "—",
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-semibold text-zinc-900">Fleet Overview</h1>
        <p className="text-sm text-zinc-500 mt-1">Real-time status and token usage across all active agents</p>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-zinc-400" />
          <span className="ml-3 text-sm text-zinc-500">Loading fleet data...</span>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="card text-center py-12 border-red-200 bg-red-50">
          <AlertTriangle size={32} className="mx-auto text-red-400 mb-3" />
          <p className="text-sm font-medium text-red-700">Failed to load fleet data</p>
          <p className="text-xs text-red-500 mt-1">{error.message}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => mutate()}>
            <RefreshCw size={14} className="mr-1" /> Retry
          </Button>
        </div>
      )}

      {/* Stats row */}
      {!isLoading && !error && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Active Agents", value: `${fleetStats.active}/${fleetStats.total}`, icon: Users, color: "text-emerald-600" },
              { label: "Total Tokens", value: `${(fleetStats.totalTokens / 1000).toFixed(0)}K`, icon: Zap, color: "text-zinc-600" },
              { label: "Avg Latency", value: fleetStats.avgLatency, icon: Clock, color: "text-zinc-600" },
              { label: "Errors", value: fleetStats.error, icon: AlertTriangle, color: "text-red-500" },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05, duration: 0.3 }} className="card">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                    <stat.icon size={18} className={stat.color} />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider">{stat.label}</p>
                    <p className="text-xl font-semibold text-zinc-900 mt-0.5">{stat.value}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Agent cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Agent Roster</h2>
              <Button variant="ghost" size="sm" onClick={() => mutate()}>
                <RefreshCw size={14} className="mr-1" /> Refresh
              </Button>
            </div>

            {agents.length === 0 && (
              <div className="card text-center py-12">
                <p className="text-sm text-zinc-500">No agents found</p>
              </div>
            )}

            {agents.map((agent, i) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.04, duration: 0.3 }}
                className="card hover:border-zinc-300 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <StatusDot status={agent.status} />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-zinc-900">{agent.name}</h3>
                        <Badge variant={agent.status === "active" ? "active" : agent.status === "error" ? "error" : "idle"}>{agent.status}</Badge>
                        <span className="text-xs text-zinc-400 font-mono">{agent.id}</span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5">{agent.role}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-zinc-300"><MoreHorizontal size={16} /></Button>
                </div>
                <div className="grid grid-cols-3 gap-6 mt-3">
                  <div><p className="text-[10px] text-zinc-400 uppercase tracking-wider mb-0.5">Tasks</p><p className="text-sm font-medium text-zinc-700">{agent.tasksCompleted}</p></div>
                  <div><p className="text-[10px] text-zinc-400 uppercase tracking-wider mb-0.5">Latency</p><p className="text-sm font-medium text-zinc-700">{agent.avgLatency}</p></div>
                  <div><p className="text-[10px] text-zinc-400 uppercase tracking-wider mb-0.5">Uptime</p><p className="text-sm font-medium text-zinc-700">{agent.uptime}</p></div>
                </div>
                <TokenBudget used={agent.tokensUsed} budget={agent.budget} />
              </motion.div>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}