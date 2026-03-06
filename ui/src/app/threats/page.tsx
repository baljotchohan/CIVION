"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    ShieldAlert,
    ShieldCheck,
    Activity,
    Lock,
    AlertTriangle,
    Skull,
    Crosshair,
    Server,
    Terminal,
    Radiation
} from "lucide-react";
import { cn } from "@/lib/utils";

const mockThreats = [
    { id: 1, type: "Data Exfiltration", severity: "CRITICAL", source: "192.168.1.12", status: "Mitigated", time: "2m ago" },
    { id: 2, type: "Brute Force Attack", severity: "HIGH", source: "45.12.89.34", status: "Blocked", time: "15m ago" },
    { id: 3, type: "API Token Leak", severity: "CRITICAL", source: "System Monitor", status: "Active", time: "Just now" },
    { id: 4, type: "Anomalous Traffic", severity: "LOW", source: "Edge Node 4", status: "Monitoring", time: "1h ago" },
];

export default function ThreatsPage() {
    const [isScanning, setIsScanning] = useState(false);

    return (
        <div className="space-y-10">
            <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight mb-2">Cyber Threat Defense</h1>
                    <p className="text-slate-400">Autonomous network integrity monitoring and threat mitigation center.</p>
                </div>
                <button
                    onClick={() => setIsScanning(!isScanning)}
                    className={cn(
                        "px-8 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-3",
                        isScanning
                            ? "bg-red-500/20 border border-red-500/40 text-red-500 animate-pulse"
                            : "bg-indigo-500 hover:bg-indigo-600 text-white shadow-xl shadow-indigo-500/20"
                    )}
                >
                    {isScanning ? <Radiation className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                    {isScanning ? "DANGER: LIVE SCAN ACTIVE" : "Initiate System Scan"}
                </button>
            </section>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Threat Stats */}
                <div className="glass p-10 rounded-[2.5rem] border-white/5 space-y-8 lg:col-span-1">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                            <ShieldCheck className="w-8 h-8 text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">System Status</h2>
                            <p className="text-emerald-500 text-xs font-bold uppercase tracking-widest">Fortified</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { label: "Active Nodes", val: "12/12", icon: Server, color: "text-indigo-400" },
                            { label: "Threats Blocked", val: "1,492", icon: Lock, color: "text-emerald-400" },
                            { label: "Firewall Load", val: "12%", icon: Activity, color: "text-amber-400" },
                            { label: "Kernel Integrity", val: "100%", icon: Terminal, color: "text-blue-400" },
                        ].map((stat, i) => (
                            <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2">
                                <div className="flex items-center justify-between">
                                    <stat.icon className={cn("w-4 h-4", stat.color)} />
                                    <span className="text-xs text-slate-500">Global</span>
                                </div>
                                <p className="text-xl font-bold font-mono">{stat.val}</p>
                                <p className="text-[10px] font-bold text-slate-600 uppercase pt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    <div className="p-6 rounded-3xl bg-red-500/5 border border-red-500/10 space-y-4">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                            <span className="font-bold text-red-500 text-sm">Security Advisory</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            CIVION Sentinel detected increased port scanning activity from 3 distinct regional clusters. Mitigation protocols are on standby.
                        </p>
                        <button className="w-full py-3 rounded-xl bg-red-500 text-white font-bold text-xs hover:bg-red-600 transition-colors">
                            Escalate Defense
                        </button>
                    </div>
                </div>

                {/* Live Attack Feed */}
                <div className="lg:col-span-2 glass rounded-[2.5rem] border-white/5 flex flex-col overflow-hidden">
                    <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/2">
                        <h2 className="text-xl font-bold flex items-center gap-3">
                            <Skull className="w-5 h-5 text-red-500" />
                            Intelligence Attack Graph
                        </h2>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                            <div className="w-2 h-2 rounded-full bg-red-500" />
                            Live Vectors
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                        <table className="w-full text-left border-separate border-spacing-y-4">
                            <thead>
                                <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                                    <th className="px-4 pb-2">Vector Type</th>
                                    <th className="px-4 pb-2">Severity</th>
                                    <th className="px-4 pb-2">Source Origin</th>
                                    <th className="px-4 pb-2">Action Taken</th>
                                    <th className="px-4 pb-2">Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mockThreats.map((threat, i) => (
                                    <motion.tr
                                        key={threat.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="group"
                                    >
                                        <td className="px-4 py-4 bg-white/5 rounded-l-2xl border-y border-l border-white/5 first-letter:uppercase text-sm font-bold text-slate-200">
                                            <div className="flex items-center gap-3">
                                                <Crosshair className="w-4 h-4 text-indigo-500" />
                                                {threat.type}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 bg-white/5 border-y border-white/5">
                                            <span className={cn(
                                                "px-2 py-1 rounded text-[10px] font-black tracking-tighter",
                                                threat.severity === "CRITICAL" ? "bg-red-500 text-white" : "bg-amber-500 text-black"
                                            )}>
                                                {threat.severity}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 bg-white/5 border-y border-white/5 text-xs font-mono text-slate-500">
                                            {threat.source}
                                        </td>
                                        <td className="px-4 py-4 bg-white/5 border-y border-white/5">
                                            <div className="flex items-center gap-2">
                                                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                                                <span className="text-xs font-bold text-emerald-500">{threat.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 bg-white/5 rounded-r-2xl border-y border-r border-white/5 text-xs text-slate-600 font-bold">
                                            {threat.time}
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-10 border-t border-white/5 bg-black/20 flex items-center justify-between">
                        <div className="flex items-center gap-8">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Global IP Reputation</span>
                                <span className="text-xl font-bold">99.2% Good</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Sanctions Applied</span>
                                <span className="text-xl font-bold">4.2k</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="px-6 py-2 rounded-xl glass border border-white/5 text-xs font-bold text-slate-400 hover:text-white transition-all">Download Report</button>
                            <button className="px-6 py-2 rounded-xl bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/20">Analyze Graph</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
