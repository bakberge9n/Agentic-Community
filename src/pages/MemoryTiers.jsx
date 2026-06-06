import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useSWR from "swr";
import { Thermometer, Zap, Snowflake, Search, Clock, Database, FileText, MessageSquare, BarChart3, Loader2, AlertTriangle } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { cn } from "../lib/utils";
import { fetchMemory } from "../lib/api";

const tierIcons = { hot: Zap, warm: Thermometer, cold: Snowflake };
const tierColors = { hot: "text-red-500", warm: "text-amber-500", cold: "text-blue-400" };
const tierBg = { hot: "bg-red-50 border-red-200", warm: "bg-amber-50 border-amber-200", cold: "bg-blue-50 border-blue-200" };

function memoryTypeIcon(type) {
  switch (type) {
    case "conversation": return MessageSquare;
    case "context": case "report": return FileText;
    case "vector": return Database;
    case "analysis": return BarChart3;
    default: return FileText;
  }
}

export default function MemoryTiers() {
  const [activeTier, setActiveTier] = useState("hot");
  const [searchQuery, setSearchQuery] = useState("");
  const { data, error, isLoading } = useSWR("memory", fetchMemory, { refreshInterval: 15000 });

  const tiers = data?.tiers ?? [];
  const currentTier = tiers.find((t) => t.id === activeTier);
  const activeTierIcon = tierIcons[activeTier] || Zap;

  const filteredItems = currentTier?.items?.filter((item) =>
    !searchQuery || item.preview?.toLowerCase().includes(searchQuery.toLowerCase())
  ) ?? [];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-semibold text-zinc-900">Memory Tiers</h1>
        <p className="text-sm text-zinc-500 mt-1">Hierarchical memory storage with automatic tier promotion and eviction</p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16"><Loader2 size={24} className="animate-spin text-zinc-400" /><span className="ml-3 text-sm text-zinc-500">Loading memory tiers...</span></div>
      )}

      {error && !isLoading && (
        <div className="card text-center py-12 border-red-200 bg-red-50">
          <AlertTriangle size={32} className="mx-auto text-red-400 mb-3" />
          <p className="text-sm font-medium text-red-700">Failed to load memory data</p>
          <p className="text-xs text-red-500 mt-1">{error.message}</p>
        </div>
      )}

      {!isLoading && !error && tiers.length > 0 && (
        <>
          <div className="flex gap-2 mb-6">
            {tiers.map((tier) => {
              const TierIcon = tierIcons[tier.id] || Zap;
              return (
                <button key={tier.id} onClick={() => setActiveTier(tier.id)}
                  className={cn("flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200",
                    activeTier === tier.id ? tierBg[tier.id] + " border-current" : "bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:text-zinc-700")}>
                  <TierIcon size={16} className={activeTier === tier.id ? tierColors[tier.id] : "text-zinc-400"} />
                  {tier.label}
                  <Badge variant="outline" className="text-[10px] ml-1">{tier.items?.length || 0}</Badge>
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={activeTier} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              <div className="card mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-xl border flex items-center justify-center", tierBg[activeTier])}>
                      <activeTierIcon size={18} className={tierColors[activeTier]} />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-zinc-900">{currentTier?.label} Memory</h2>
                      <p className="text-xs text-zinc-500">{currentTier?.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                      <Clock size={12} /><span>Retention: {currentTier?.retention}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative mb-4">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input type="text" placeholder="Search memory entries..." value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:border-zinc-400 transition-all" />
              </div>

              <div className="space-y-2">
                {filteredItems.length === 0 && (
                  <div className="card text-center py-8">
                    <p className="text-sm text-zinc-400">{searchQuery ? "No matching entries" : "No memory items"}</p>
                  </div>
                )}
                {filteredItems.map((item, i) => {
                  const TypeIcon = memoryTypeIcon(item.type);
                  return (
                    <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03, duration: 0.2 }}
                      className="card hover:border-zinc-300 transition-colors cursor-pointer flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center flex-shrink-0">
                        <TypeIcon size={14} className="text-zinc-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-800 truncate">{item.preview}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <Badge variant="outline" className="text-[10px] capitalize">{item.type}</Badge>
                          <span className="text-[11px] text-zinc-400">{item.age}</span>
                          <span className="text-[11px] text-zinc-400 font-mono">{(item.tokens / 1000).toFixed(1)}K tokens</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </>
      )}

      {!isLoading && !error && tiers.length === 0 && (
        <div className="card text-center py-12"><p className="text-sm text-zinc-500">No memory tiers available</p></div>
      )}
    </motion.div>
  );
}