import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  GitBranch,
  Database,
  Activity,
  Inbox,
  ChevronLeft,
  Menu,
  X,
} from "lucide-react";
import { cn } from "../lib/utils";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navigation = [
  { name: "Fleet Overview", path: "/", icon: LayoutDashboard },
  { name: "Orchestration Graph", path: "/orchestration", icon: GitBranch },
  { name: "Memory Tiers", path: "/memory", icon: Database },
  { name: "Reflexion Metrics", path: "/reflexion", icon: Activity },
  { name: "HITL Inbox", path: "/hitl", icon: Inbox },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-zinc-200 text-zinc-600 shadow-sm"
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-full bg-white border-r border-zinc-200 flex flex-col transition-all duration-300",
          collapsed ? "w-16" : "w-60",
          "lg:relative lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo area */}
        <div className={cn(
          "flex items-center h-16 px-4 border-b border-zinc-100",
          collapsed && "justify-center px-0"
        )}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold font-serif">A</span>
            </div>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="text-sm font-semibold text-zinc-900 leading-tight">Agentic</p>
                <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Community</p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                  collapsed && "justify-center px-0",
                  isActive
                    ? "bg-zinc-100 text-zinc-900"
                    : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50"
                )
              }
            >
              <item.icon size={18} className="flex-shrink-0" />
              {!collapsed && (
                <span className="truncate">{item.name}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Collapse toggle (desktop only) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center h-12 border-t border-zinc-100 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 transition-colors"
        >
          <ChevronLeft
            size={16}
            className={cn(
              "transition-transform duration-200",
              collapsed && "rotate-180"
            )}
          />
        </button>
      </aside>
    </>
  );
}