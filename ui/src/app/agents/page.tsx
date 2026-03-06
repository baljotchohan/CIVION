"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    Users,
    Play,
    Square,
    Activity,
    Info,
    ExternalLink,
    Cpu
} from "lucide-react";
import { useAgents } from "@/hooks/useCivion";
import { cn } from "@/lib/utils";

export default function AgentsPage() {
    const { agents, loading } = useAgents();
    const [running, setRunning] = useState<Record<string, boolean>>({});

    const toggleAgent = async (name: string, isRunning: boolean) => {
        const action = isRunning ? "stop" : "run";
        try {
            const res = await fetch(`http://localhost:8000/api/agents/${name}/${action}`, { method: "POST" });
            if (res.ok) {
                setRunning(prev => ({ ...prev, [name]: !isRunning }));
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="space-y-10">
            <section>
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight mb-2">Agent Fleet</h1>
                        <p className="text-slate-400 text-lg">Manage and monitor your autonomous intelligence units.</p>
                    </div>
                    <button className="px-6 py-3 rounded-xl bg-indigo-500 text-white font-bold hover:bg-indigo-600 transition-all glow-analyst">
                        Build New Agent
                    </button>
                </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {loading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-64 glass animate-pulse rounded-2xl" />)
                ) : (
                    agents.map((agent, i) => {
                        const isAgentRunning = running[agent.name] ?? true; // Default to true if not toggled yet
                        return (
                            <motion.div
                                key={agent.name}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className="glass rounded-2xl overflow-hidden group hover:border-indigo-500/30 transition-all"
                            >
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 text-2xl group-hover:scale-110 transition-transform">
                                                {agent.personality_emoji || "🤖"}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold">{agent.name}</h3>
                                                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                                                    {agent.personality}
                                                </p>
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter border",
                                            isAgentRunning ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-slate-500/10 text-slate-500 border-slate-500/20"
                                        )}>
                                            {isAgentRunning ? "Active" : "Idle"}
                                        </div>
                                    </div>

                                    <p className="text-sm text-slate-400 leading-relaxed mb-6 line-clamp-2">
                                        {agent.description}
                                    </p>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Interval</p>
                                            <p className="text-sm font-semibold">{agent.interval / 60}m</p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Tools</p>
                                            <p className="text-sm font-semibold">{agent.tools_allowed?.length || 0}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => toggleAgent(agent.name, isAgentRunning)}
                                            className={cn(
                                                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all",
                                                isAgentRunning
                                                    ? "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/20"
                                                    : "bg-green-500/10 text-green-500 hover:bg-green-500/20 border border-green-500/20"
                                            )}
                                        >
                                            {isAgentRunning ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                                            {isAgentRunning ? "Stop Unit" : "Start Unit"}
                                        </button>
                                        <button className="w-12 flex items-center justify-center rounded-xl glass hover:bg-white/10 transition-colors">
                                            <ExternalLink className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </section>
        </div>
    );
}
