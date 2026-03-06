"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Zap,
  Search,
  Activity,
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
  Cpu,
  Globe
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useInsights, useSignals, useSystemStatus } from "@/hooks/useCivion";

export default function Dashboard() {
  const { insights, loading: loadingInsights } = useInsights(5);
  const { signals, loading: loadingSignals } = useSignals();
  const status = useSystemStatus();

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Systems Overview</h1>
            <p className="text-slate-400 text-lg">Integrated intelligence stream from {status?.agents_running || "..."} autonomous units.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 transition-colors text-white font-semibold text-sm flex items-center gap-2 glow-analyst">
              <Zap className="w-4 h-4 fill-current" />
              New Goal
            </button>
            <button className="px-5 py-2.5 rounded-xl glass hover:bg-white/10 transition-colors text-white font-semibold text-sm">
              Deploy Agent
            </button>
          </div>
        </motion.div>
      </section>

      {/* Quick Stats */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Active Agents", value: status?.agents_running?.toString() || "0", delta: "", icon: Cpu, color: "text-explorer" },
          { label: "Signals Detected", value: signals.length.toString(), delta: "", icon: Zap, color: "text-signal" },
          { label: "Knowledge Nodes", value: status?.total_insights?.toString() || "0", delta: "", icon: TrendingUp, color: "text-analyst" },
          { label: "System Health", value: "99.8%", icon: ShieldCheck, color: "text-watcher" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass p-6 rounded-2xl relative group overflow-hidden"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={cn("p-2 rounded-lg bg-white/5", stat.color)}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-3xl font-bold mb-1">{stat.value}</h3>
            <p className="text-sm text-slate-400 font-medium whitespace-nowrap">{stat.label}</p>
          </motion.div>
        ))}
      </section>

      {/* World Map & Regional Activity Mockup */}
      <section className="glass p-8 rounded-3xl relative overflow-hidden h-80 flex flex-col items-center justify-center">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        <Globe className="w-32 h-32 text-indigo-500/20 absolute" />
        <div className="relative z-10 text-center">
          <h3 className="text-xl font-bold mb-2 pr-4">Global Intelligence Radar</h3>
          <p className="text-sm text-slate-500 pr-4">Monitoring regional events and cross-border signals...</p>
        </div>
        {/* Animated Pings */}
        <div className="absolute top-1/2 left-1/3 w-3 h-3 bg-indigo-500 rounded-full animate-ping" />
        <div className="absolute top-1/3 left-1/2 w-2 h-2 bg-rose-500 rounded-full animate-ping [animation-delay:1s]" />
        <div className="absolute bottom-1/4 right-1/3 w-2 h-2 bg-emerald-500 rounded-full animate-ping [animation-delay:2s]" />
      </section>

      {/* Featured Intelligence */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400" />
              Intelligence Stream
            </h2>
          </div>

          <div className="space-y-4">
            {loadingInsights ? (
              [1, 2, 3].map(i => <div key={i} className="h-24 glass animate-pulse rounded-2xl" />)
            ) : (
              insights.map((item: any, i: number) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className="glass p-5 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shrink-0">
                      <Search className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold truncate pr-4 text-lg">{item.title}</h4>
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest whitespace-nowrap">{new Date(item.created_at).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-sm text-slate-400 leading-relaxed line-clamp-2 pr-4">
                        {item.content}
                      </p>
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors" />
                  </div>
                </motion.div>
              ))
            )}
            {insights.length === 0 && !loadingInsights && (
              <div className="p-10 text-center glass rounded-2xl text-slate-500 text-sm italic">
                Waiting for agent insights...
              </div>
            )}
          </div>
        </div>

        {/* Signals Sidebar */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2 text-rose-400">
            <Zap className="w-5 h-5" />
            Active Signals
          </h2>
          <div className="glass-heavy p-6 rounded-2xl space-y-6 border-rose-500/20 glow-signal">
            {signals.slice(0, 3).map((sig, i) => (
              <div key={sig.id} className="space-y-2 last:border-0 border-b border-white/5 pb-4 last:pb-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">{(sig.confidence * 100).toFixed(0)}% Confidence</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                </div>
                <h4 className="font-bold text-lg">{sig.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed pr-6">{sig.description}</p>
              </div>
            ))}
            {signals.length === 0 && (
              <p className="text-xs text-slate-500 italic text-center py-4">Scanning for patterns...</p>
            )}
            <button className="w-full py-3 rounded-xl bg-rose-500/10 text-rose-400 text-xs font-bold hover:bg-rose-500/20 transition-all border border-rose-500/30">
              Refresh Monitor
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
