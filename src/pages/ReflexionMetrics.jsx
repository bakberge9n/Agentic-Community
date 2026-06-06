import { motion } from "framer-motion";
import {
  BarChart3,
  RefreshCw,
  TrendingUp,
  Target,
  RotateCcw,
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

// PRAR cycle data: Plan → Reflect → Analyze → Refine
const prarCycleData = [
  { cycle: 1, plan: 95, reflect: 72, analyze: 68, refine: 82 },
  { cycle: 2, plan: 88, reflect: 78, analyze: 75, refine: 85 },
  { cycle: 3, plan: 92, reflect: 85, analyze: 80, refine: 90 },
  { cycle: 4, plan: 85, reflect: 82, analyze: 84, refine: 88 },
  { cycle: 5, plan: 90, reflect: 88, analyze: 86, refine: 92 },
  { cycle: 6, plan: 93, reflect: 90, analyze: 89, refine: 94 },
  { cycle: 7, plan: 91, reflect: 86, analyze: 88, refine: 91 },
  { cycle: 8, plan: 94, reflect: 91, analyze: 90, refine: 95 },
];

const improvementData = [
  { cycle: 1, improvement: 0 },
  { cycle: 2, improvement: 12 },
  { cycle: 3, improvement: 18 },
  { cycle: 4, improvement: 15 },
  { cycle: 5, improvement: 22 },
  { cycle: 6, improvement: 28 },
  { cycle: 7, improvement: 25 },
  { cycle: 8, improvement: 32 },
];

const recentReflections = [
  {
    id: "ref-01",
    agent: "Researcher Alpha",
    cycle: 8,
    summary: "Improved source verification pipeline — false positive rate decreased by 23%",
    outcome: "positive",
    timestamp: "4m ago",
  },
  {
    id: "ref-02",
    agent: "Analyst Beta",
    cycle: 7,
    summary: "Adjusted correlation weighting — accuracy improved from 82% to 89%",
    outcome: "positive",
    timestamp: "18m ago",
  },
  {
    id: "ref-03",
    agent: "Writer Delta",
    cycle: 6,
    summary: "Style consistency below threshold — reverted to previous generation config",
    outcome: "neutral",
    timestamp: "45m ago",
  },
  {
    id: "ref-04",
    agent: "Extractor Zeta",
    cycle: 5,
    summary: "Schema mapping drift detected — fallback to extraction v2.1",
    outcome: "negative",
    timestamp: "1h ago",
  },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-zinc-200 rounded-lg px-3 py-2 shadow-sm text-xs">
        <p className="font-medium text-zinc-700 mb-1">Cycle {label}</p>
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color }}>
            {entry.name}: {entry.value}%
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ReflexionMetrics() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-semibold text-zinc-900">
          Reflexion Metrics
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          PRAR cycle analytics — self-reflection and iterative improvement tracking
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Cycles", value: "8", icon: RotateCcw, color: "text-zinc-600" },
          { label: "Avg Improvement", value: "18.7%", icon: TrendingUp, color: "text-emerald-600" },
          { label: "Current Score", value: "95%", icon: Target, color: "text-sage-600" },
          { label: "Positive Outcomes", value: "6/8", icon: BarChart3, color: "text-zinc-600" },
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

      {/* PRAR Cycle Chart */}
      <div className="card mb-6">
        <div className="card-header">
          <h2 className="card-title">PRAR Cycle Progression</h2>
          <p className="card-description">
            Plan → Reflect → Analyze → Refine scores across active cycles
          </p>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={prarCycleData}
              margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
              <XAxis
                dataKey="cycle"
                tick={{ fontSize: 12, fill: "#71717a" }}
                tickLine={false}
                axisLine={{ stroke: "#e4e4e7" }}
                label={{ value: "Cycle", position: "insideBottom", offset: -5, style: { fontSize: 11, fill: "#a1a1aa" } }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#71717a" }}
                tickLine={false}
                axisLine={false}
                domain={[50, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="plan"
                stroke="#a1a1aa"
                strokeWidth={2}
                dot={{ r: 3, fill: "#a1a1aa" }}
                name="Plan"
              />
              <Line
                type="monotone"
                dataKey="reflect"
                stroke="#94a3b8"
                strokeWidth={2}
                dot={{ r: 3, fill: "#94a3b8" }}
                name="Reflect"
              />
              <Line
                type="monotone"
                dataKey="analyze"
                stroke="#747d64"
                strokeWidth={2}
                dot={{ r: 3, fill: "#747d64" }}
                name="Analyze"
              />
              <Line
                type="monotone"
                dataKey="refine"
                stroke="#18181b"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#18181b" }}
                name="Refine"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Improvement chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Improvement Rate</h2>
            <p className="card-description">Cumulative quality improvement per cycle</p>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={improvementData}
                margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis dataKey="cycle" tick={{ fontSize: 12, fill: "#71717a" }} tickLine={false} axisLine={{ stroke: "#e4e4e7" }} />
                <YAxis tick={{ fontSize: 12, fill: "#71717a" }} tickLine={false} axisLine={false} domain={[0, 40]} />
                <Tooltip content={<CustomTooltip />} />
                <defs>
                  <linearGradient id="improvementGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#747d64" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#747d64" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="improvement"
                  stroke="#747d64"
                  strokeWidth={2}
                  fill="url(#improvementGrad)"
                  name="Improvement %"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Outcome Distribution</h2>
            <p className="card-description">Reflexion outcome quality breakdown</p>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: "Positive", value: 6, fill: "#22c55e" },
                  { name: "Neutral", value: 1, fill: "#a1a1aa" },
                  { name: "Negative", value: 1, fill: "#ef4444" },
                ]}
                margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#71717a" }} tickLine={false} axisLine={{ stroke: "#e4e4e7" }} />
                <YAxis tick={{ fontSize: 12, fill: "#71717a" }} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent reflexion events */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">
            Recent Reflexion Events
          </h2>
          <Button variant="ghost" size="sm">
            <RefreshCw size={14} className="mr-1" />
            Refresh
          </Button>
        </div>
        <div className="space-y-2">
          {recentReflections.map((ref) => (
            <div
              key={ref.id}
              className="card flex items-start gap-3 hover:border-zinc-300 transition-colors cursor-pointer"
            >
              <div
                className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  ref.outcome === "positive"
                    ? "bg-emerald-500"
                    : ref.outcome === "neutral"
                    ? "bg-zinc-300"
                    : "bg-red-500"
                }`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-zinc-800">
                    {ref.agent}
                  </p>
                  <Badge variant="outline" className="text-[10px]">
                    Cycle {ref.cycle}
                  </Badge>
                  <Badge
                    variant={
                      ref.outcome === "positive"
                        ? "active"
                        : ref.outcome === "neutral"
                        ? "default"
                        : "error"
                    }
                    className="text-[10px] capitalize"
                  >
                    {ref.outcome}
                  </Badge>
                </div>
                <p className="text-xs text-zinc-600 mt-0.5">{ref.summary}</p>
                <p className="text-[10px] text-zinc-400 mt-1 font-mono">
                  {ref.id} · {ref.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}