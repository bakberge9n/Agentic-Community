import { motion } from "framer-motion";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Zap,
  Users,
  Clock,
  AlertTriangle,
  Activity,
  Cpu,
  RefreshCw,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";

// Mock data for the agent fleet
const agents = [
  {
    id: "res-01",
    name: "Researcher Alpha",
    role: "Market Intelligence",
    status: "active",
    tokensUsed: 284_521,
    budget: 500_000,
    tasksCompleted: 147,
    avgLatency: "1.2s",
    uptime: "99.8%",
  },
  {
    id: "ana-01",
    name: "Analyst Beta",
    role: "Data Synthesis",
    status: "active",
    tokensUsed: 192_340,
    budget: 400_000,
    tasksCompleted: 98,
    avgLatency: "2.1s",
    uptime: "99.2%",
  },
  {
    id: "mgr-01",
    name: "Manager Gamma",
    role: "Orchestration & Delegation",
    status: "active",
    tokensUsed: 45_123,
    budget: 200_000,
    tasksCompleted: 212,
    avgLatency: "0.4s",
    uptime: "99.9%",
  },
  {
    id: "wri-01",
    name: "Writer Delta",
    role: "Content Generation",
    status: "idle",
    tokensUsed: 156_789,
    budget: 350_000,
    tasksCompleted: 73,
    avgLatency: "3.5s",
    uptime: "97.1%",
  },
  {
    id: "qa-01",
    name: "Reviewer Epsilon",
    role: "Quality Assurance",
    status: "active",
    tokensUsed: 89_450,
    budget: 300_000,
    tasksCompleted: 164,
    avgLatency: "0.8s",
    uptime: "98.5%",
  },
  {
    id: "ext-01",
    name: "Extractor Zeta",
    role: "Data Extraction",
    status: "error",
    tokensUsed: 312_800,
    budget: 250_000,
    tasksCompleted: 56,
    avgLatency: "5.2s",
    uptime: "89.3%",
  },
];

const fleetStats = {
  total: 6,
  active: 4,
  idle: 1,
  error: 1,
  totalTokens: 1_081_023,
  avgLatency: "2.2s",
};

function StatusDot({ status }) {
  const colors = {
    active: "bg-emerald-500",
    idle: "bg-zinc-300",
    error: "bg-red-500",
  };
  return (
    <span className={`w-2 h-2 rounded-full ${colors[status]} flex-shrink-0`} />
  );
}

function TokenBudget({ used, budget }) {
  const pct = Math.round((used / budget) * 100);
  const color =
    pct > 90 ? "bg-red-400" : pct > 70 ? "bg-amber-400" : "bg-emerald-400";
  return (
    <div className="w-full mt-2">
      <div className="flex justify-between text-xs text-zinc-400 mb-1">
        <span>{pct}% used</span>
        <span>{(budget / 1000).toFixed(0)}K</span>
      </div>
      <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}

export default function FleetOverview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-semibold text-zinc-900">
          Fleet Overview
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Real-time status and token usage across all active agents
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Active Agents", value: `${fleetStats.active}/${fleetStats.total}`, icon: Users, color: "text-emerald-600" },
          { label: "Total Tokens", value: `${(fleetStats.totalTokens / 1000).toFixed(0)}K`, icon: Zap, color: "text-zinc-600" },
          { label: "Avg Latency", value: fleetStats.avgLatency, icon: Clock, color: "text-zinc-600" },
          { label: "Errors", value: fleetStats.error, icon: AlertTriangle, color: "text-red-500" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05, duration: 0.3 }}
            className="card"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                <stat.icon size={18} className={stat.color} />
              </div>
              <div>
                <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className="text-xl font-semibold text-zinc-900 mt-0.5">
                  {stat.value}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Agent cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">
            Agent Roster
          </h2>
          <Button variant="ghost" size="sm">
            <RefreshCw size={14} className="mr-1" />
            Refresh
          </Button>
        </div>

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
                    <h3 className="text-sm font-semibold text-zinc-900">
                      {agent.name}
                    </h3>
                    <Badge
                      variant={
                        agent.status === "active"
                          ? "active"
                          : agent.status === "error"
                          ? "error"
                          : "idle"
                      }
                    >
                      {agent.status}
                    </Badge>
                    <span className="text-xs text-zinc-400 font-mono">
                      {agent.id}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">{agent.role}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-zinc-300">
                <MoreHorizontal size={16} />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-6 mt-3">
              <div>
                <p className="text-[10px] text-zinc-400 uppercase tracking-wider mb-0.5">
                  Tasks
                </p>
                <p className="text-sm font-medium text-zinc-700">
                  {agent.tasksCompleted}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-400 uppercase tracking-wider mb-0.5">
                  Latency
                </p>
                <p className="text-sm font-medium text-zinc-700">
                  {agent.avgLatency}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-400 uppercase tracking-wider mb-0.5">
                  Uptime
                </p>
                <p className="text-sm font-medium text-zinc-700">
                  {agent.uptime}
                </p>
              </div>
            </div>

            <TokenBudget used={agent.tokensUsed} budget={agent.budget} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}