"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Activity,
    Terminal,
    Trash2,
    Download,
    RefreshCcw,
    Search,
    Filter,
    CheckCircle,
    AlertCircle,
    Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLogs } from "@/hooks/useCivion";

export default function LogsPage() {
    const { logs, loading, refresh } = useLogs();
    const [filter, setFilter] = useState("ALL");
    const [search, setSearch] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    const filteredLogs = logs?.filter((log: any) => {
        const matchesLevel = filter === "ALL" || log.level === filter;
        const matchesSearch = log.message.toLowerCase().includes(search.toLowerCase()) ||
            log.logger.toLowerCase().includes(search.toLowerCase());
        return matchesLevel && matchesSearch;
    });

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [filteredLogs]);

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col space-y-6">
            <section className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight mb-2">System Logs</h1>
                    <p className="text-slate-400">Low-level diagnostic stream and kernel execution history.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={refresh}
                        className="p-3 rounded-2xl glass border border-white/5 text-slate-400 hover:text-white transition-all"
                    >
                        <RefreshCcw className={cn("w-5 h-5", loading && "animate-spin")} />
                    </button>
                    <button className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-300 font-bold text-sm hover:bg-white/10 transition-all flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Export Trace
                    </button>
                </div>
            </section>

            <div className="flex-1 glass rounded-[2.5rem] border-white/5 flex flex-col overflow-hidden">
                {/* Toolbar */}
                <div className="p-6 border-b border-white/5 bg-white/2 flex flex-col md:flex-row gap-4 justify-between">
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                        {["ALL", "INFO", "WARNING", "ERROR", "DEBUG"].map(level => (
                            <button
                                key={level}
                                onClick={() => setFilter(level)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all",
                                    filter === level
                                        ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                                        : "text-slate-500 hover:text-slate-300 bg-white/5"
                                )}
                            >
                                {level}
                            </button>
                        ))}
                    </div>

                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 transition-colors group-focus-within:text-indigo-400" />
                        <input
                            placeholder="Search kernel traces..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full md:w-80 bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-2.5 text-xs focus:border-indigo-500/40 outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Log Area */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto bg-black/40 p-10 font-mono text-[11px] leading-relaxed custom-scrollbar"
                >
                    {loading ? (
                        <div className="h-full flex items-center justify-center text-slate-600 gap-3">
                            <RefreshCcw className="w-5 h-5 animate-spin" />
                            <span>Syncing audit logs...</span>
                        </div>
                    ) : filteredLogs?.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-600">
                            No logs matching filters.
                        </div>
                    ) : (
                        <div className="space-y-1.5">
                            {filteredLogs.map((log: any, i: number) => {
                                const logDate = new Date(log.timestamp);
                                const timeStr = isNaN(logDate.getTime()) ? "..." : logDate.toLocaleTimeString();
                                return (
                                    <div key={i} className="group flex gap-6 hover:bg-white/2 px-2 py-0.5 rounded transition-colors">
                                        <span className="text-slate-600 w-32 shrink-0">{timeStr}</span>
                                        <span className={cn(
                                            "w-16 shrink-0 font-bold text-center rounded text-[9px] h-fit px-1 self-center",
                                            log.level === "ERROR" ? "text-red-500 border border-red-500/20" :
                                                log.level === "WARNING" ? "text-amber-500 border border-amber-500/20" :
                                                    log.level === "DEBUG" ? "text-slate-500 border border-slate-500/20" :
                                                        "text-emerald-500 border border-emerald-500/20"
                                        )}>
                                            {log.level}
                                        </span>
                                        <span className="text-indigo-400/70 w-32 shrink-0 truncate">[{log.logger}]</span>
                                        <span className="text-slate-400 group-hover:text-slate-200 transition-colors whitespace-pre-wrap">
                                            {log.message}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer info */}
                <div className="px-10 py-4 border-t border-white/5 flex items-center justify-between text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                    <div className="flex items-center gap-6">
                        <span className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Kernel: v2.0.4-LTS
                        </span>
                        <span className="flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            Server Time: {new Date().toLocaleTimeString()}
                        </span>
                    </div>
                    <div>
                        Showing {filteredLogs?.length} of {logs?.length} total traces
                    </div>
                </div>
            </div>
        </div>
    );
}
