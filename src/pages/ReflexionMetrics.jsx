import { motion } from "framer-motion";
import useSWR from "swr";
import { BarChart3, TrendingUp, Target, RotateCcw, RefreshCw, Loader2, AlertTriangle } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { fetchReflexion } from "../lib/api";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-zinc-200 rounded-lg px-3 py-2 shadow-sm text-xs">
        <p className="font-medium text-zinc-700 mb-1">Cycle {label}</p>
        {payload.map((entry, i) => <p key={i} style={{ color: entry.color }}>{entry.name}: {entry.value}%</p>)}
      </div>
    );
  }
  return null;
};

export default function ReflexionMetrics() {
  const { data, error, isLoading, mutate } = useSWR("reflexion", fetchReflexion, { refreshInterval: 10000 });
  const stats = data?.stats;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-semibold text-zinc-900">Reflexion Metrics</h1>
        <p className="text-sm text-zinc-500 mt-1">PRAR cycle analytics — self-reflection and iterative improvement tracking</p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16"><Loader2 size={24} className="animate-spin text-zinc-400" /><span className="ml-3 text-sm text-zinc-500">Loading metrics...</span></div>
      )}

      {error && !isLoading && (
        <div className="card text-center py-12 border-red-200 bg-red-50">
          <AlertTriangle size={32} className="mx-auto text-red-400 mb-3" />
          <p className="text-sm font-medium text-red-700">Failed to load reflexion data</p>
          <p className="text-xs text-red-500 mt-1">{error.message}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => mutate()}><RefreshCw size={14} className="mr-1" /> Retry</Button>
        </div>
      )}

      {!isLoading && !error && data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Cycles", value: stats?.totalCycles, icon: RotateCcw, color: "text-zinc-600" },
              { label: "Avg Improvement", value: stats?.avgImprovement, icon: TrendingUp, color: "text-emerald-600" },
              { label: "Current Score", value: stats?.currentScore, icon: Target, color: "text-sage-600" },
              { label: "Positive Outcomes", value: stats?.positiveOutcomes, icon: BarChart3, color: "text-zinc-600" },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05, duration: 0.3 }} className="card">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                    <stat.icon size={18} className={stat.color} />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider">{stat.label}</p>
                    <p className="text-xl font-semibold text-zinc-900 mt-0.5">{stat.value || "—"}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {data.prarCycleData && data.prarCycleData.length > 0 && (
            <div className="card mb-6">
              <div className="card-header">
                <h2 className="card-title">PRAR Cycle Progression</h2>
                <p className="card-description">Plan → Reflect → Analyze → Refine scores across active cycles</p>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.prarCycleData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                    <XAxis dataKey="cycle" tick={{ fontSize: 12, fill: "#71717a" }} tickLine={false} axisLine={{ stroke: "#e4e4e7" }} />
                    <YAxis tick={{ fontSize: 12, fill: "#71717a" }} tickLine={false} axisLine={false} domain={[50, 100]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="plan" stroke="#a1a1aa" strokeWidth={2} dot={{ r: 3, fill: "#a1a1aa" }} name="Plan" />
                    <Line type="monotone" dataKey="reflect" stroke="#94a3b8" strokeWidth={2} dot={{ r: 3, fill: "#94a3b8" }} name="Reflect" />
                    <Line type="monotone" dataKey="analyze" stroke="#747d64" strokeWidth={2} dot={{ r: 3, fill: "#747d64" }} name="Analyze" />
                    <Line type="monotone" dataKey="refine" stroke="#18181b" strokeWidth={2.5} dot={{ r: 4, fill: "#18181b" }} name="Refine" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {data.improvementData && (
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Improvement Rate</h2>
                  <p className="card-description">Cumulative quality improvement per cycle</p>
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.improvementData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                      <XAxis dataKey="cycle" tick={{ fontSize: 12, fill: "#71717a" }} tickLine={false} axisLine={{ stroke: "#e4e4e7" }} />
                      <YAxis tick={{ fontSize: 12, fill: "#71717a" }} tickLine={false} axisLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <defs><linearGradient id="improvementGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#747d64" stopOpacity={0.3} /><stop offset="95%" stopColor="#747d64" stopOpacity={0} /></linearGradient></defs>
                      <Area type="monotone" dataKey="improvement" stroke="#747d64" strokeWidth={2} fill="url(#improvementGrad)" name="Improvement %" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Outcome Distribution</h2>
                <p className="card-description">Reflexion outcome quality breakdown</p>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: "Positive", value: parseInt(stats?.positiveOutcomes?.split("/")[0] || 0), fill: "#22c55e" },
                    { name: "Neutral", value: 1, fill: "#a1a1aa" },
                    { name: "Negative", value: 1, fill: "#ef4444" },
                  ]} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
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

          {data.events && data.events.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Recent Reflexion Events</h2>
                <Button variant="ghost" size="sm" onClick={() => mutate()}><RefreshCw size={14} className="mr-1" /> Refresh</Button>
              </div>
              <div className="space-y-2">
                {data.events.map((ev) => (
                  <div key={ev.id} className="card flex items-start gap-3 hover:border-zinc-300 transition-colors cursor-pointer">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${ev.outcome === "positive" ? "bg-emerald-500" : ev.outcome === "neutral" ? "bg-zinc-300" : "bg-red-500"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-zinc-800">{ev.agent}</p>
                        <Badge variant="outline" className="text-[10px]">Cycle {ev.cycle}</Badge>
                        <Badge variant={ev.outcome === "positive" ? "active" : ev.outcome === "neutral" ? "default" : "error"} className="text-[10px] capitalize">{ev.outcome}</Badge>
                      </div>
                      <p className="text-xs text-zinc-600 mt-0.5">{ev.summary}</p>
                      <p className="text-[10px] text-zinc-400 mt-1 font-mono">{ev.id} · {ev.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}