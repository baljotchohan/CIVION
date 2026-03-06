"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Target,
    Plus,
    Send,
    CheckCircle2,
    Clock,
    AlertCircle,
    Loader2,
    ChevronRight,
    Info
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function GoalsPage() {
    const [goals, setGoals] = useState<any[]>([]);
    const [newTitle, setNewTitle] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchGoals();
        const interval = setInterval(fetchGoals, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchGoals = async () => {
        try {
            const res = await fetch("http://localhost:8000/api/goals");
            const data = await res.json();
            setGoals(data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle) return;
        setIsSubmitting(true);
        try {
            await fetch("http://localhost:8000/api/goals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: newTitle, description: newDesc })
            });
            setNewTitle("");
            setNewDesc("");
            fetchGoals();
        } catch (e) {
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
            {/* Creation Form */}
            <div className="xl:col-span-1 space-y-6">
                <div className="glass p-8 rounded-3xl border-indigo-500/20 glow-analyst">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                            <Plus className="w-5 h-5" />
                        </div>
                        <h2 className="text-2xl font-bold pr-4">New Intelligence Goal</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Objective Title</label>
                            <input
                                value={newTitle}
                                onChange={e => setNewTitle(e.target.value)}
                                placeholder="e.g. Analyze Robotics Trends"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500/50 transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Context & Constraints</label>
                            <textarea
                                value={newDesc}
                                onChange={e => setNewDesc(e.target.value)}
                                placeholder="Provide details for the goal planner..."
                                rows={4}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500/50 transition-all resize-none"
                            />
                        </div>
                        <button
                            disabled={isSubmitting}
                            className="w-full py-4 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 transition-all text-white font-bold flex items-center justify-center gap-2 group"
                        >
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                            Deploy Objective
                        </button>
                    </form>
                </div>

                <div className="glass p-6 rounded-3xl opacity-50">
                    <div className="flex items-center gap-2 mb-2">
                        <Info className="w-4 h-4 text-indigo-400" />
                        <h4 className="text-xs font-bold uppercase tracking-widest">How it works</h4>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        Your goal will be decomposed by the LLM Planner into concrete subtasks and assigned to the most capable agents in your fleet.
                    </p>
                </div>
            </div>

            {/* Goal List */}
            <div className="xl:col-span-2 space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                    <Target className="w-6 h-6 text-indigo-400" />
                    Active Missions
                </h2>

                <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {goals.map((goal) => (
                            <motion.div
                                key={goal.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="glass rounded-3xl overflow-hidden border-white/5 hover:border-white/10 transition-all"
                            >
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-xl font-bold">{goal.title}</h3>
                                                <div className={cn(
                                                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter",
                                                    goal.status === "completed" ? "bg-green-500/10 text-green-500" :
                                                        goal.status === "failed" ? "bg-rose-500/10 text-rose-500" :
                                                            "bg-indigo-500/10 text-indigo-400 animate-pulse"
                                                )}>
                                                    {goal.status}
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-400">{goal.description}</p>
                                        </div>
                                        <span className="text-[10px] text-slate-500 font-bold">{new Date(goal.created_at).toLocaleTimeString()}</span>
                                    </div>

                                    {/* Subtasks */}
                                    <div className="space-y-2 mt-6">
                                        {goal.subtasks?.map((task: any, idx: number) => (
                                            <div key={idx} className="flex items-center gap-3 py-2 px-3 rounded-xl bg-white/5 border border-white/5">
                                                {task.status === "completed" ? <CheckCircle2 className="w-4 h-4 text-green-500" /> :
                                                    task.status === "failed" ? <AlertCircle className="w-4 h-4 text-rose-500" /> :
                                                        <Clock className="w-4 h-4 text-slate-500" />}
                                                <span className="text-xs flex-1 text-slate-300 pr-4">{task.description}</span>
                                                <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded uppercase">{task.assigned_agent}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {goal.final_report && (
                                        <div className="mt-6 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                                            <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2">Final Intelligence Synthesis</h4>
                                            <p className="text-sm text-slate-300 leading-relaxed italic pr-4">
                                                "{goal.final_report}"
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {goals.length === 0 && (
                        <div className="p-20 flex flex-col items-center justify-center text-slate-600 glass rounded-3xl border-dashed">
                            <Target className="w-12 h-12 mb-4 opacity-20" />
                            <p className="font-medium pr-4">No active missions deployed.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
