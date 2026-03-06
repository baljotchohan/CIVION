"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    Settings,
    Key,
    Globe,
    Shield,
    Save,
    RefreshCcw,
    ExternalLink,
    Terminal,
    Server
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("general");

    return (
        <div className="space-y-10 max-w-4xl">
            <section>
                <h1 className="text-4xl font-bold tracking-tight mb-2 pr-4">System Settings</h1>
                <p className="text-slate-400 text-lg pr-4">Configure your AI Operating System components and API integrations.</p>
            </section>

            <div className="flex gap-8">
                {/* Tabs Sidebar */}
                <div className="w-48 space-y-1">
                    {[
                        { id: "general", label: "General", icon: Settings },
                        { id: "api", label: "API Keys", icon: Key },
                        { id: "network", label: "Network", icon: Globe },
                        { id: "security", label: "Security", icon: Shield },
                        { id: "advanced", label: "Advanced", icon: Server },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all",
                                activeTab === tab.id ? "bg-indigo-500/10 text-indigo-400" : "text-slate-500 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="flex-1 space-y-8">
                    {activeTab === "api" ? (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            <div className="glass p-8 rounded-3xl space-y-6">
                                <div>
                                    <h3 className="text-xl font-bold mb-2 pr-4">LLM Integration</h3>
                                    <p className="text-sm text-slate-400 mb-6 pr-4">Setup your provider keys for planning and synthesis.</p>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">OpenAI API Key</label>
                                            <div className="relative">
                                                <input type="password" value="sk-........................" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-indigo-500/40 outline-none transition-all" />
                                                <button className="absolute right-3 top-3 text-[10px] font-bold text-indigo-500 hover:underline">Reveal</button>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Anthropic Key</label>
                                            <input type="password" placeholder="Enter key..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-indigo-500/40 outline-none transition-all" />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-white/5 space-y-4">
                                    <h3 className="text-xl font-bold pr-4">Web Search Tools</h3>
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5">
                                        <div className="flex items-center gap-3">
                                            <Terminal className="w-5 h-5 text-emerald-400" />
                                            <div>
                                                <p className="font-bold text-sm">Tavily Search API</p>
                                                <p className="text-[10px] text-slate-500">Connected & Authorized</p>
                                            </div>
                                        </div>
                                        <button className="text-xs font-bold text-indigo-400 hover:underline">Configure</button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass p-20 flex flex-col items-center justify-center text-slate-600 rounded-3xl border-dashed">
                            <Settings className="w-12 h-12 mb-4 opacity-10" />
                            <p className="font-bold pr-4">Module configuration coming soon...</p>
                        </motion.div>
                    )}

                    <div className="flex justify-end gap-3 pt-4">
                        <button className="px-6 py-2.5 rounded-xl glass text-sm font-bold hover:bg-white/10 transition-colors">Discard Changes</button>
                        <button className="px-8 py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-600 transition-all flex items-center gap-2">
                            <Save className="w-4 h-4 ml-1" /> Save Configuration
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
