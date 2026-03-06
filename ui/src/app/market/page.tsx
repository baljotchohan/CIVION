"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ShoppingBag,
    Search,
    Download,
    Star,
    ShieldCheck,
    Cpu,
    Sparkles,
    TrendingUp,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function MarketPage() {
    const [agents, setAgents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [installingId, setInstallingId] = useState<string | null>(null);

    useEffect(() => {
        fetchMarketAgents();
    }, []);

    const fetchMarketAgents = async () => {
        try {
            const res = await fetch("http://localhost:8000/api/market/agents");
            const data = await res.json();
            setAgents(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleInstall = async (id: string, name: string) => {
        setInstallingId(id);
        try {
            const res = await fetch(`http://localhost:8000/api/market/install/${id}`, {
                method: "POST"
            });
            if (res.ok) {
                toast.success(`Installed ${name} successfully!`);
            } else {
                toast.error(`Failed to install ${name}.`);
            }
        } catch (e) {
            toast.error("Network error during installation.");
        } finally {
            setInstallingId(null);
        }
    };

    return (
        <div className="space-y-10">
            <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight mb-2 pr-4">Agent Marketplace</h1>
                    <p className="text-slate-400 text-lg pr-4">Expand your intelligence network with community and core units.</p>
                </div>
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                    <input
                        placeholder="Search agents..."
                        className="w-full md:w-80 bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm focus:border-indigo-500/40 outline-none transition-all placeholder:text-slate-600"
                    />
                </div>
            </section>

            {/* Featured Categories */}
            <section className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {["All Agents", "Trading", "Security", "Research", "Coding", "Social"].map((cat, i) => (
                    <button
                        key={cat}
                        className={cn(
                            "whitespace-nowrap px-6 py-2 rounded-full text-xs font-bold transition-all border",
                            i === 0 ? "bg-indigo-500 text-white border-indigo-500" : "glass border-transparent hover:border-white/10 text-slate-400 hover:text-white"
                        )}
                    >
                        {cat}
                    </button>
                ))}
            </section>

            {/* Market Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    [1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-64 glass animate-pulse rounded-3xl" />)
                ) : (
                    agents.map((agent, i) => (
                        <motion.div
                            key={agent.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="glass p-8 rounded-3xl border-white/5 hover:border-indigo-500/20 transition-all group flex flex-col"
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-indigo-500/5 flex items-center justify-center border border-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform duration-500">
                                    {agent.personality === "Analyst" ? <Sparkles className="w-8 h-8" /> :
                                        agent.personality === "Watcher" ? <ShieldCheck className="w-8 h-8" /> :
                                            <TrendingUp className="w-8 h-8" />}
                                </div>
                                <div className="flex items-center gap-1.5 bg-black/20 px-2 py-1 rounded-lg border border-white/5">
                                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                    <span className="text-[10px] font-bold text-slate-300">{agent.rating}</span>
                                </div>
                            </div>

                            <div className="flex-1 space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold font-mono">{agent.name}</h3>
                                </div>
                                <p className="text-sm text-slate-500 leading-relaxed pr-6 truncate">
                                    {agent.description}
                                </p>

                                <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-600">
                                    <span className="flex items-center gap-1 text-indigo-400/70"><ShoppingBag className="w-3 h-3" /> {agent.downloads}</span>
                                    <span>•</span>
                                    <span>By {agent.author}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => handleInstall(agent.id, agent.name)}
                                disabled={installingId === agent.id}
                                className="mt-8 w-full py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-indigo-500 hover:text-white hover:border-indigo-500 transition-all font-bold text-sm flex items-center justify-center gap-2"
                            >
                                {installingId === agent.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Download className="w-4 h-4" />
                                )}
                                Install Logic
                            </button>
                        </motion.div>
                    ))
                )}
            </section>

            {/* Promotional Banner */}
            <section className="glass rounded-[40px] p-12 overflow-hidden relative border-indigo-500/10">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <ShoppingBag className="w-64 h-64 rotate-12" />
                </div>
                <div className="relative z-10 space-y-6 max-w-xl">
                    <h2 className="text-4xl font-bold leading-tight">Build once. <br /><span className="text-indigo-500">Sync Everywhere.</span></h2>
                    <p className="text-slate-400 text-lg">
                        Convert your custom agents into marketplace assets and share intelligence protocols with local CIVION clusters.
                    </p>
                    <button className="px-8 py-3 rounded-2xl bg-indigo-500 text-white font-bold hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-500/20">
                        Publish Your Agent
                    </button>
                </div>
            </section>
        </div>
    );
}
