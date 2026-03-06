"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Map as MapIcon,
    Globe,
    Search,
    Filter,
    Zap,
    ShieldAlert,
    Navigation,
    Info,
    Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEvents } from "@/hooks/useCivion";

export default function RadarMapPage() {
    const { events, loading } = useEvents();
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [activeFilter, setActiveFilter] = useState("all");

    const filteredEvents = activeFilter === "all"
        ? events
        : events?.filter((e: any) => e.agent_name.toLowerCase().includes(activeFilter.toLowerCase()));

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col space-y-6">
            <section className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight mb-2">Radar Map</h1>
                    <p className="text-slate-400">Global signal distribution and real-time event tracking matrix.</p>
                </div>
                <div className="flex items-center gap-3">
                    {["all", "Trend", "Cyber", "Market"].map(filter => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={cn(
                                "px-4 py-2 rounded-xl text-xs font-bold transition-all border capitalize",
                                activeFilter === filter
                                    ? "bg-indigo-500 border-indigo-500 text-white"
                                    : "glass border-transparent text-slate-400 hover:text-white"
                            )}
                        >
                            {filter === "all" ? "Live Feed" : `${filter} Signals`}
                        </button>
                    ))}
                </div>
            </section>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
                {/* Map Visualization */}
                <div className="lg:col-span-2 glass rounded-[2.5rem] border-white/5 relative overflow-hidden bg-slate-950/50">
                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent" />
                        <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                    </div>

                    {/* Simple SVG World Map Placeholder */}
                    <div className="relative w-full h-full flex items-center justify-center p-12">
                        <svg viewBox="0 0 800 400" className="w-full h-full text-slate-800/40 fill-current preserve-3d">
                            {/* Simplified world paths or grid */}
                            <rect width="800" height="400" fill="none" />
                            {[...Array(20)].map((_, i) => (
                                <line key={`v-${i}`} x1={i * 40} y1="0" x2={i * 40} y2="400" stroke="currentColor" strokeWidth="0.5" />
                            ))}
                            {[...Array(10)].map((_, i) => (
                                <line key={`h-${i}`} x1="0" y1={i * 40} x2="800" y2={i * 40} stroke="currentColor" strokeWidth="0.5" />
                            ))}

                            {/* Event Pings */}
                            <AnimatePresence>
                                {filteredEvents?.map((event: any, i: number) => {
                                    // Project lat/long to X/Y (very simple projection)
                                    const x = (event.longitude + 180) * (800 / 360);
                                    const y = (90 - event.latitude) * (400 / 180);

                                    return (
                                        <motion.g
                                            key={event.id || i}
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0, opacity: 0 }}
                                            whileHover={{ scale: 1.5 }}
                                            onClick={() => setSelectedEvent(event)}
                                            className="cursor-pointer group"
                                        >
                                            <circle cx={x} cy={y} r="12" className="fill-indigo-500/20" />
                                            <circle cx={x} cy={y} r="4" className="fill-indigo-500 group-hover:fill-white transition-colors" />
                                            <motion.circle
                                                cx={x} cy={y} r="12"
                                                className="stroke-indigo-500 fill-none"
                                                initial={{ scale: 0.5, opacity: 0.8 }}
                                                animate={{ scale: 3, opacity: 0 }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                strokeWidth="1"
                                            />
                                        </motion.g>
                                    );
                                })}
                            </AnimatePresence>
                        </svg>

                        {/* Map Overlay Controls */}
                        <div className="absolute bottom-8 left-8 flex items-center gap-4">
                            <div className="glass px-4 py-2 rounded-xl border-white/5 flex items-center gap-3 text-xs font-bold text-slate-300">
                                <Globe className="w-4 h-4 text-indigo-400" />
                                <span>Standard Projection (EPSG:4326)</span>
                            </div>
                            <div className="glass px-4 py-2 rounded-xl border-white/5 flex items-center gap-3 text-xs font-bold text-slate-300">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span>System Synced</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Sidebar */}
                <div className="glass rounded-[2.5rem] border-white/5 flex flex-col overflow-hidden">
                    <div className="p-8 border-b border-white/5">
                        <h2 className="text-xl font-bold flex items-center gap-3">
                            <Navigation className="w-5 h-5 text-indigo-400" />
                            Intelligence Leads
                        </h2>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                        {loading ? (
                            <div className="p-10 text-center text-slate-500">Scanning satellite telemetry...</div>
                        ) : filteredEvents?.length === 0 ? (
                            <div className="p-10 text-center text-slate-500">No active signals in this sector.</div>
                        ) : (
                            filteredEvents?.map((event: any, i: number) => (
                                <motion.div
                                    key={event.id || i}
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => setSelectedEvent(event)}
                                    className={cn(
                                        "p-5 rounded-2xl border transition-all cursor-pointer group",
                                        selectedEvent?.id === event.id
                                            ? "bg-indigo-500/10 border-indigo-500/40"
                                            : "bg-white/5 border-transparent hover:border-white/10"
                                    )}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest leading-none bg-indigo-400/10 px-2 py-1 rounded">
                                            {event.agent_name}
                                        </span>
                                        <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                                            {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-slate-200 mb-1 group-hover:text-white transition-colors">{event.topic}</h3>
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <MapIcon className="w-3 h-3" />
                                        {event.location}
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>

                    <AnimatePresence>
                        {selectedEvent && (
                            <motion.div
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '100%' }}
                                className="p-8 bg-indigo-500/10 border-t border-indigo-500/30 backdrop-blur-xl"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h4 className="text-indigo-400 font-bold uppercase tracking-widest text-[10px] mb-1">Detailed Analysis</h4>
                                        <h3 className="text-xl font-bold">{selectedEvent.topic}</h3>
                                    </div>
                                    <button onClick={() => setSelectedEvent(null)} className="text-slate-500 hover:text-white transition-colors">
                                        <Plus className="w-6 h-6 rotate-45" />
                                    </button>
                                </div>
                                <p className="text-sm text-slate-300 leading-relaxed mb-4">
                                    {selectedEvent.description}
                                </p>
                                <div className="flex items-center gap-6">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Coordinates</span>
                                        <span className="text-xs font-mono text-slate-300">{selectedEvent.latitude.toFixed(4)}, {selectedEvent.longitude.toFixed(4)}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Confidence</span>
                                        <span className="text-xs font-bold text-emerald-400 text-sm">94.2%</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
