import { motion } from "framer-motion";
import {
  Search,
  BarChart3,
  FileText,
  CheckCircle,
  ArrowRight,
  Play,
  Pause,
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";

const workflowSteps = [
  {
    id: "researcher",
    name: "Researcher",
    agent: "Researcher Alpha",
    icon: Search,
    description: "Gather market intelligence and competitive data",
    status: "completed",
    details: "Analyzed 14 sources across 3 markets",
    duration: "2.3s",
  },
  {
    id: "analyst",
    name: "Analyst",
    agent: "Analyst Beta",
    icon: BarChart3,
    description: "Synthesize findings into structured insights",
    status: "active",
    details: "Processing 3 data streams in parallel",
    duration: "4.1s",
  },
  {
    id: "writer",
    name: "Writer",
    agent: "Writer Delta",
    icon: FileText,
    description: "Generate comprehensive report drafts",
    status: "pending",
    details: "Waiting for analyst output",
    duration: "—",
  },
  {
    id: "reviewer",
    name: "Reviewer",
    agent: "Reviewer Epsilon",
    icon: CheckCircle,
    description: "Quality assurance and fact-checking",
    status: "pending",
    details: "Awaiting writer draft",
    duration: "—",
  },
];

const recentRuns = [
  { id: "run-01", query: "Q3 2025 SaaS competitive landscape", status: "completed", time: "12m ago", steps: 4 },
  { id: "run-02", query: "AI infrastructure market size analysis", status: "completed", time: "34m ago", steps: 4 },
  { id: "run-03", query: "Enterprise LLM adoption trends", status: "completed", time: "1h ago", steps: 4 },
  { id: "run-04", query: "European data center expansion outlook", status: "failed", time: "2h ago", steps: 2 },
];

function NodeCard({ step, index }) {
  const statusColors = {
    completed: "border-emerald-200 bg-emerald-50",
    active: "border-sage-400 bg-sage-50",
    pending: "border-zinc-200 bg-white",
    failed: "border-red-200 bg-red-50",
  };

  const iconColors = {
    completed: "text-emerald-600",
    active: "text-sage-600",
    pending: "text-zinc-300",
    failed: "text-red-500",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className={`relative flex items-start gap-4 p-4 rounded-xl border ${statusColors[step.status]}`}
    >
      {/* Step number */}
      <div className="flex flex-col items-center">
        <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center ${
          step.status === "active"
            ? "border-sage-400 bg-sage-50"
            : step.status === "completed"
            ? "border-emerald-300 bg-emerald-50"
            : "border-zinc-200"
        }`}>
          <step.icon size={18} className={iconColors[step.status]} />
        </div>
        {index < workflowSteps.length - 1 && (
          <div className="w-px h-8 bg-zinc-200 my-1" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-zinc-900">{step.name}</h3>
          <Badge
            variant={
              step.status === "completed"
                ? "active"
                : step.status === "active"
                ? "default"
                : "outline"
            }
          >
            {step.status}
          </Badge>
        </div>
        <p className="text-xs text-zinc-500 mt-0.5">{step.description}</p>
        <div className="flex items-center gap-4 mt-2">
          <span className="text-[11px] text-zinc-400 font-mono">
            Agent: {step.agent}
          </span>
          <span className="text-[11px] text-zinc-400">
            {step.details}
          </span>
          {step.duration !== "—" && (
            <span className="text-[11px] text-zinc-400 font-mono">
              {step.duration}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function OrchestrationGraph() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-semibold text-zinc-900">
          Orchestration Graph
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Active workflow: Market Intelligence Report — Researcher → Analyst → Writer → Reviewer
        </p>
      </div>

      {/* Active workflow visualization */}
      <div className="card mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="card-title">Active Pipeline</h2>
            <p className="card-description">
              Q3 2025 SaaS competitive landscape analysis
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Pause size={14} className="mr-1" />
              Pause
            </Button>
            <Button size="sm">
              <Play size={14} className="mr-1" />
              Resume
            </Button>
          </div>
        </div>

        <div className="space-y-0">
          {workflowSteps.map((step, i) => (
            <NodeCard key={step.id} step={step} index={i} />
          ))}
        </div>

        {/* Flow arrows */}
        <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-zinc-100">
          <span className="text-xs text-zinc-400 font-medium">Researcher</span>
          <ArrowRight size={14} className="text-zinc-300" />
          <span className="text-xs text-zinc-400 font-medium">Analyst</span>
          <ArrowRight size={14} className="text-zinc-300" />
          <span className="text-xs text-zinc-400 font-medium">Writer</span>
          <ArrowRight size={14} className="text-zinc-300" />
          <span className="text-xs text-zinc-400 font-medium">Reviewer</span>
          <ArrowRight size={14} className="text-zinc-300" />
          <Badge variant="outline" className="text-[10px]">Output</Badge>
        </div>
      </div>

      {/* Recent runs */}
      <div>
        <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-3">
          Recent Runs
        </h2>
        <div className="space-y-2">
          {recentRuns.map((run) => (
            <div
              key={run.id}
              className="card flex items-center justify-between hover:border-zinc-300 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-2 h-2 rounded-full ${
                    run.status === "completed" ? "bg-emerald-500" : "bg-red-500"
                  }`}
                />
                <div>
                  <p className="text-sm font-medium text-zinc-800">
                    {run.query}
                  </p>
                  <p className="text-xs text-zinc-400 font-mono mt-0.5">
                    {run.id} · {run.steps} steps · {run.time}
                  </p>
                </div>
              </div>
              <Badge
                variant={run.status === "completed" ? "active" : "error"}
              >
                {run.status}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}