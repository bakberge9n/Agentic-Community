import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Thermometer,
  Zap,
  Snowflake,
  Search,
  Clock,
  Database,
  FileText,
  MessageSquare,
  BarChart3,
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";

const tiers = [
  {
    id: "hot",
    label: "Hot",
    icon: Zap,
    color: "text-red-500",
    bgColor: "bg-red-50 border-red-200",
    description: "Active session context — instant recall",
    retention: "24 hours",
    items: [
      { type: "conversation", preview: "Current market analysis session: SaaS competitive landscape Q3 2025", age: "2m ago", tokens: 3450 },
      { type: "context", preview: "Active workflow state — Researcher → Analyst pipeline", age: "5m ago", tokens: 1200 },
      { type: "vector", preview: "Recent query embedding cache (14 sources)", age: "12m ago", tokens: 8900 },
    ],
  },
  {
    id: "warm",
    label: "Warm",
    icon: Thermometer,
    color: "text-amber-500",
    bgColor: "bg-amber-50 border-amber-200",
    description: "Recent sessions and intermediate results",
    retention: "7 days",
    items: [
      { type: "report", preview: "Q2 2025 Earnings call analysis — Tech sector", age: "3h ago", tokens: 15200 },
      { type: "analysis", preview: "Competitor pricing matrix — Q2 update", age: "1d ago", tokens: 8400 },
      { type: "conversation", preview: "AI infrastructure vendor evaluation", age: "2d ago", tokens: 12100 },
      { type: "context", preview: "Data extraction pipeline config — EU markets", age: "3d ago", tokens: 3200 },
    ],
  },
  {
    id: "cold",
    label: "Cold",
    icon: Snowflake,
    color: "text-blue-400",
    bgColor: "bg-blue-50 border-blue-200",
    description: "Archived results and long-term memory",
    retention: "90 days",
    items: [
      { type: "report", preview: "Q1 2025 Market Intelligence Report — Full", age: "45d ago", tokens: 45200 },
      { type: "analysis", preview: "Annual competitor benchmarking 2024", age: "120d ago", tokens: 82000 },
      { type: "conversation", preview: "Initial system prompt engineering sessions", age: "60d ago", tokens: 23400 },
      { type: "vector", preview: "Embedding index — Historical market data v2", age: "30d ago", tokens: 128000 },
      { type: "report", preview: "Data center expansion feasibility study", age: "75d ago", tokens: 34100 },
    ],
  },
];

function memoryTypeIcon(type) {
  switch (type) {
    case "conversation": return MessageSquare;
    case "context": return FileText;
    case "vector": return Database;
    case "report": return FileText;
    case "analysis": return BarChart3;
    default: return FileText;
  }
}

export default function MemoryTiers() {
  const [activeTier, setActiveTier] = useState("hot");
  const [searchQuery, setSearchQuery] = useState("");

  const currentTier = tiers.find((t) => t.id === activeTier);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-semibold text-zinc-900">
          Memory Tiers
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Hierarchical memory storage with automatic tier promotion and eviction
        </p>
      </div>

      {/* Tier tabs */}
      <div className="flex gap-2 mb-6">
        {tiers.map((tier) => (
          <button
            key={tier.id}
            onClick={() => setActiveTier(tier.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200",
              activeTier === tier.id
                ? tier.bgColor + " border-current"
                : "bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:text-zinc-700"
            )}
          >
            <tier.icon size={16} className={activeTier === tier.id ? tier.color : "text-zinc-400"} />
            {tier.label}
            <Badge variant="outline" className="text-[10px] ml-1">
              {tier.items.length}
            </Badge>
          </button>
        ))}
      </div>

      {/* Active tier details */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTier}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {/* Tier header */}
          <div className="card mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-xl border flex items-center justify-center", currentTier.bgColor)}>
                  <currentTier.icon size={18} className={currentTier.color} />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-zinc-900">{currentTier.label} Memory</h2>
                  <p className="text-xs text-zinc-500">{currentTier.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <Clock size={12} />
                  <span>Retention: {currentTier.retention}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search memory entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:border-zinc-400 transition-all"
            />
          </div>

          {/* Memory items */}
          <div className="space-y-2">
            {currentTier.items.map((item, i) => {
              const TypeIcon = memoryTypeIcon(item.type);
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.2 }}
                  className="card hover:border-zinc-300 transition-colors cursor-pointer flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center flex-shrink-0">
                    <TypeIcon size={14} className="text-zinc-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-800 truncate">
                      {item.preview}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {item.type}
                      </Badge>
                      <span className="text-[11px] text-zinc-400">{item.age}</span>
                      <span className="text-[11px] text-zinc-400 font-mono">
                        {(item.tokens / 1000).toFixed(1)}K tokens
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}