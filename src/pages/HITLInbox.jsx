import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useSWR from "swr";
import { Inbox, CheckCircle, XCircle, Clock, AlertTriangle, FileText, MessageSquare, ChevronDown, ExternalLink, Search, Filter, Loader2, User } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";
import { fetchHITL, approveHITL, rejectHITL } from "../lib/api";

const priorityConfig = {
  critical: { label: "Critical", color: "text-red-600", bg: "bg-red-50 border-red-200" },
  high: { label: "High", color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
  medium: { label: "Medium", color: "text-sage-600", bg: "bg-sage-50 border-sage-200" },
  low: { label: "Low", color: "text-zinc-500", bg: "bg-zinc-50 border-zinc-200" },
};

const typeIcons = { report: FileText, pipeline: MessageSquare, model: ChevronDown, integration: ExternalLink, budget: AlertTriangle, review: FileText };

function PriorityBadge({ priority }) {
  const config = priorityConfig[priority] || priorityConfig.low;
  return <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border", config.bg, config.color)}>{config.label}</span>;
}

export default function HITLInbox() {
  const { data, error, isLoading, mutate } = useSWR("hitl", fetchHITL, { refreshInterval: 5000 });
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState(null);
  const [localItems, setLocalItems] = useState(null);

  const items = localItems ?? data?.items ?? [];
  const sorted = [...items].sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    return (order[a.priority] || 99) - (order[b.priority] || 99);
  });
  const filtered = filter === "all" ? sorted : sorted.filter((i) => i.priority === filter);
  const selected = items.find((i) => i.id === selectedId);

  async function handleApprove(id) {
    setActionLoading(id);
    try {
      await approveHITL(id);
      setLocalItems((prev) => (prev ?? data.items).filter((i) => i.id !== id));
      if (selectedId === id) setSelectedId(null);
    } catch (e) {
      console.error("Approve failed:", e);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(id) {
    setActionLoading(id);
    try {
      await rejectHITL(id);
      setLocalItems((prev) => (prev ?? data.items).filter((i) => i.id !== id));
      if (selectedId === id) setSelectedId(null);
    } catch (e) {
      console.error("Reject failed:", e);
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-semibold text-zinc-900">HITL Inbox</h1>
            <p className="text-sm text-zinc-500 mt-1">Human-in-the-Loop approval queue — {items.length} pending {items.length === 1 ? "action" : "actions"}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input type="text" placeholder="Search..." className="w-36 h-8 pl-8 pr-3 rounded-lg border border-zinc-200 bg-white text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-300" />
            </div>
            <Button variant="outline" size="sm"><Filter size={14} className="mr-1" /> Filter</Button>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16"><Loader2 size={24} className="animate-spin text-zinc-400" /><span className="ml-3 text-sm text-zinc-500">Loading inbox...</span></div>
      )}

      {error && !isLoading && (
        <div className="card text-center py-12 border-red-200 bg-red-50">
          <AlertTriangle size={32} className="mx-auto text-red-400 mb-3" />
          <p className="text-sm font-medium text-red-700">Failed to load inbox</p>
          <p className="text-xs text-red-500 mt-1">{error.message}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => mutate()}><Filter size={14} className="mr-1" /> Retry</Button>
        </div>
      )}

      {!isLoading && !error && (
        <div className="flex gap-6">
          <div className={cn("space-y-2 flex-1", selectedId && "hidden lg:block lg:max-w-md")}>
            <div className="flex gap-1 mb-4">
              {["all", "critical", "high", "medium", "low"].map((p) => (
                <button key={p} onClick={() => setFilter(p)}
                  className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                    filter === p ? "bg-zinc-900 text-white" : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100")}>
                  {p === "all" ? "All" : priorityConfig[p]?.label || p}
                </button>
              ))}
            </div>

            <AnimatePresence>
              {filtered.map((item) => {
                const TypeIcon = typeIcons[item.type] || FileText;
                const loading = actionLoading === item.id;
                return (
                  <motion.div key={item.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }} transition={{ duration: 0.2 }}
                    onClick={() => setSelectedId(selectedId === item.id ? null : item.id)}
                    className={cn("card cursor-pointer transition-all", selectedId === item.id ? "border-zinc-400 ring-1 ring-zinc-300" : "hover:border-zinc-300")}>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center flex-shrink-0">
                        <TypeIcon size={14} className="text-zinc-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <PriorityBadge priority={item.priority} />
                          <span className="text-[10px] text-zinc-400 font-mono">{item.id}</span>
                        </div>
                        <p className="text-sm font-medium text-zinc-900 leading-snug">{item.action}</p>
                        <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{item.summary}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-1 text-[10px] text-zinc-400"><User size={10} /><span>{item.agent}</span></div>
                          <div className="flex items-center gap-1 text-[10px] text-zinc-400"><Clock size={10} /><span>{item.timestamp}</span></div>
                          <div className="flex items-center gap-1 text-[10px] text-amber-600 font-medium"><AlertTriangle size={10} /><span>{item.deadline}</span></div>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={(e) => { e.stopPropagation(); handleApprove(item.id); }} disabled={loading}
                          className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 hover:bg-emerald-100 transition-colors flex items-center justify-center disabled:opacity-50" title="Approve">
                          {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={16} />}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleReject(item.id); }} disabled={loading}
                          className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 text-red-500 hover:bg-red-100 transition-colors flex items-center justify-center disabled:opacity-50" title="Reject">
                          {loading ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={16} />}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filtered.length === 0 && (
              <div className="card text-center py-12"><Inbox size={32} className="mx-auto text-zinc-300 mb-3" /><p className="text-sm text-zinc-500">No pending items</p><p className="text-xs text-zinc-400 mt-1">All caught up!</p></div>
            )}
          </div>

          <AnimatePresence>
            {selected && (
              <motion.div key={selected.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="hidden lg:block w-96 flex-shrink-0">
                <div className="card sticky top-8">
                  <div className="flex items-center gap-2 mb-4"><PriorityBadge priority={selected.priority} /><span className="text-[10px] text-zinc-400 font-mono">{selected.id}</span></div>
                  <h3 className="text-base font-semibold text-zinc-900 mb-2">{selected.action}</h3>
                  <p className="text-sm text-zinc-500 mb-4">{selected.summary}</p>
                  <div className="space-y-3 mb-6">
                    <div className="text-xs text-zinc-600 bg-zinc-50 rounded-lg p-3 border border-zinc-100">{selected.details}</div>
                    <div className="flex items-start gap-2 text-xs"><AlertTriangle size={12} className="text-amber-500 mt-0.5 flex-shrink-0" /><span className="text-amber-700">{selected.risk}</span></div>
                  </div>
                  <div className="space-y-2 text-xs text-zinc-500 mb-6">
                    <div className="flex justify-between"><span>Agent</span><span className="text-zinc-700 font-medium">{selected.agent}</span></div>
                    <div className="flex justify-between"><span>Type</span><span className="text-zinc-700 font-medium capitalize">{selected.type}</span></div>
                    <div className="flex justify-between"><span>Received</span><span className="text-zinc-700 font-medium">{selected.timestamp}</span></div>
                    <div className="flex justify-between"><span>Deadline</span><span className="text-amber-600 font-medium">{selected.deadline}</span></div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="default" className="flex-1" onClick={() => handleApprove(selected.id)} disabled={actionLoading === selected.id}>
                      <CheckCircle size={16} className="mr-1.5" /> Approve
                    </Button>
                    <Button variant="outline" className="flex-1 text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleReject(selected.id)} disabled={actionLoading === selected.id}>
                      <XCircle size={16} className="mr-1.5" /> Reject
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}