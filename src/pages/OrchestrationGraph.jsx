import { motion } from "framer-motion";
import useSWR from "swr";
import { Search, BarChart3, FileText, CheckCircle, ArrowRight, Play, Pause, Loader2, AlertTriangle } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { fetchOrchestration } from "../lib/api";

const iconMap = { researcher: Search, analyst: BarChart3, writer: FileText, reviewer: CheckCircle };

function NodeCard({ step, index }) {
  const statusColors = { completed: "border-emerald-200 bg-emerald-50", active: "border-sage-400 bg-sage-50", pending: "border-zinc-200 bg-white", failed: "border-red-200 bg-red-50" };
  const iconColors = { completed: "text-emerald-600", active: "text-sage-600", pending: "text-zinc-300", failed: "text-red-500" };
  const StepIcon = iconMap[step.id] || Search;

  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1, duration: 0.3 }}
      className={`relative flex items-start gap-4 p-4 rounded-xl border ${statusColors[step.status] || "border-zinc-200"}`}>
      <div className="flex flex-col items-center">
        <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center ${step.status === "active" ? "border-sage-400 bg-sage-50" : step.status === "completed" ? "border-emerald-300 bg-emerald-50" : "border-zinc-200"}`}>
          <StepIcon size={18} className={iconColors[step.status] || "text-zinc-300"} />
        </div>
        {index < 3 && <div className="w-px h-8 bg-zinc-200 my-1" />}
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-zinc-900">{step.name}</h3>
          <Badge variant={step.status === "completed" ? "active" : step.status === "active" ? "default" : "outline"}>{step.status}</Badge>
        </div>
        <p className="text-xs text-zinc-500 mt-0.5">{step.description}</p>
        <div className="flex items-center gap-4 mt-2">
          <span className="text-[11px] text-zinc-400 font-mono">Agent: {step.agent}</span>
          <span className="text-[11px] text-zinc-400">{step.details}</span>
          {step.duration !== "—" && <span className="text-[11px] text-zinc-400 font-mono">{step.duration}</span>}
        </div>
      </div>
    </motion.div>
  );
}

export default function OrchestrationGraph() {
  const { data, error, isLoading, mutate } = useSWR("orchestration", fetchOrchestration, { refreshInterval: 5000 });

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-semibold text-zinc-900">Orchestration Graph</h1>
        <p className="text-sm text-zinc-500 mt-1">Active workflow: Market Intelligence Report — Researcher → Analyst → Writer → Reviewer</p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16"><Loader2 size={24} className="animate-spin text-zinc-400" /><span className="ml-3 text-sm text-zinc-500">Loading pipeline...</span></div>
      )}

      {error && !isLoading && (
        <div className="card text-center py-12 border-red-200 bg-red-50">
          <AlertTriangle size={32} className="mx-auto text-red-400 mb-3" />
          <p className="text-sm font-medium text-red-700">Failed to load pipeline</p>
          <p className="text-xs text-red-500 mt-1">{error.message}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => mutate()}><AlertTriangle size={14} className="mr-1" /> Retry</Button>
        </div>
      )}

      {!isLoading && !error && data && (
        <>
          <div className="card mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="card-title">Active Pipeline</h2>
                <p className="card-description">{data.activePipeline}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm"><Pause size={14} className="mr-1" /> Pause</Button>
                <Button size="sm"><Play size={14} className="mr-1" /> Resume</Button>
              </div>
            </div>
            <div className="space-y-0">
              {data.workflowSteps?.map((step, i) => <NodeCard key={step.id} step={step} index={i} />)}
            </div>
            <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-zinc-100">
              {data.workflowSteps?.map((s, i) => (
                <span key={s.id} className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400 font-medium">{s.name}</span>
                  {i < data.workflowSteps.length - 1 && <ArrowRight size={14} className="text-zinc-300" />}
                </span>
              ))}
              <ArrowRight size={14} className="text-zinc-300" />
              <Badge variant="outline" className="text-[10px]">Output</Badge>
            </div>
          </div>

          {/* Recent runs */}
          {data.recentRuns && data.recentRuns.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-3">Recent Runs</h2>
              <div className="space-y-2">
                {data.recentRuns.map((run) => (
                  <div key={run.id} className="card flex items-center justify-between hover:border-zinc-300 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${run.status === "completed" ? "bg-emerald-500" : "bg-red-500"}`} />
                      <div>
                        <p className="text-sm font-medium text-zinc-800">{run.query}</p>
                        <p className="text-xs text-zinc-400 font-mono mt-0.5">{run.id} · {run.steps} steps · {run.time}</p>
                      </div>
                    </div>
                    <Badge variant={run.status === "completed" ? "active" : "error"}>{run.status}</Badge>
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