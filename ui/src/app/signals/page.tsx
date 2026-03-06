"use client";

import React from "react";
import { motion } from "framer-motion";
import { Zap, Share2, Activity, Info, Search } from "lucide-react";
import { useSignals } from "@/hooks/useCivion";
import { cn } from "@/lib/utils";

export default function SignalsPage() {
    const { signals, loading } = useSignals();

    return (
        <div className="space-y-10 max-w-5xl">
            <section>
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight mb-2 pr-4">Intelligence Signals</h1>
                        <p className="text-slate-400 text-lg pr-4">Cross-agent pattern detection and emerging trend alerts.</p>
                    </div>
                </div>
            </section>

            <section className="space-y-6">
                {loading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-40 glass animate-pulse rounded-3xl" />)
                ) : (
                    signals.map((signal, i) => (
                        <motion.div
                            key={signal.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="glass p-8 rounded-3xl relative overflow-hidden group hover:border-rose-500/30 transition-all"
                        >
                            {/* Pulsing indicator */}
                            <div className="absolute top-8 right-8 flex items-center gap-3">
                                <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Live Signal</span>
                                <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                            </div>

                            <div className="flex gap-6">
                                <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20 shrink-0 text-rose-500">
                                    <Zap className="w-8 h-8 fill-current" />
                                </div>

                                <div className="flex-1 space-y-4">
                                    <div>
                                        <h3 className="text-2xl font-bold mb-2">{signal.title}</h3>
                                        <p className="text-slate-400 leading-relaxed text-lg pr-8">{signal.description}</p>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Confidence</span>
                                            <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-rose-500"
                                                    style={{ width: `${signal.confidence * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-bold text-rose-500">{(signal.confidence * 100).toFixed(0)}%</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest pr-2">Agents Involved:</span>
                                            <div className="flex -space-x-2">
                                                {Array.isArray(signal.agents_involved) && signal.agents_involved.map((a: string) => (
                                                    <div key={a} title={a} className="w-7 h-7 rounded-full bg-white/10 border border-background flex items-center justify-center text-[10px] font-bold uppercase">
                                                        {a.charAt(0)}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-rose-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.div>
                    ))
                )}

                {!loading && signals.length === 0 && (
                    <div className="py-40 flex flex-col items-center justify-center text-slate-600 glass rounded-3xl border-dashed">
                        <Activity className="w-16 h-16 mb-4 opacity-10" />
                        <p className="text-xl font-medium">Monitoring for collaboration signals...</p>
                    </div>
                )}
            </section>
        </div>
    );
}
