"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    Wrench,
    Cpu,
    Terminal,
    Zap,
    Save,
    Plus,
    Trash2,
    CheckCircle2,
    Loader2,
    Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSignals } from "@/hooks/useCivion";
import { toast } from "sonner";

export default function BuilderPage() {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [personality, setPersonality] = useState("Explorer");
    const [interval, setIntervalVal] = useState(3600);
    const [prompt, setPrompt] = useState("");
    const [tools, setTools] = useState<string[]>(["web_search"]);
    const [isBuilding, setIsBuilding] = useState(false);

    const availableTools = [
        { id: "web_search", name: "Web Search", icon: Sparkles },
        { id: "filesystem", name: "Filesystem", icon: Terminal },
        { id: "github", name: "GitHub", icon: Zap },
        { id: "arxiv", name: "Arxiv", icon: Save },
    ];

    const handleBuild = async () => {
        if (!name || !description || !prompt) {
            toast.error("Please fill in all required fields.");
            return;
        }

        setIsBuilding(true);
        try {
            const res = await fetch("http://localhost:8000/api/builder/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    description,
                    personality,
                    interval,
                    prompt,
                    tools,
                    tags: ["custom", personality.toLowerCase()]
                })
            });

            if (res.ok) {
                toast.success(`Agent ${name} deployed successfully!`);
                setName("");
                setDescription("");
                setPrompt("");
            } else {
                toast.error("Failed to build agent.");
            }
        } catch (e) {
            toast.error("Network error during build.");
        } finally {
            setIsBuilding(false);
        }
    };

    const toggleTool = (id: string) => {
        setTools(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
    };

    return (
        <div className="space-y-10 max-w-5xl">
            <section>
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight mb-2 pr-4">Agent Builder</h1>
                        <p className="text-slate-400 text-lg pr-4">Construct custom intelligence units with specialized personalities and toolsets.</p>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Configuration Panel */}
                <div className="space-y-6">
                    <div className="glass p-8 rounded-3xl border-indigo-500/20 glow-analyst">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Wrench className="w-5 h-5 text-indigo-400" />
                            Agent Configuration
                        </h2>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Unit Designation</label>
                                    <input
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        placeholder="e.g. TrendAnalyst"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-indigo-500/40 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Personality Matrix</label>
                                    <select
                                        value={personality}
                                        onChange={e => setPersonality(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-indigo-500/40 outline-none transition-all appearance-none"
                                    >
                                        <option value="Explorer" className="bg-slate-900">Explorer</option>
                                        <option value="Analyst" className="bg-slate-900">Analyst</option>
                                        <option value="Watcher" className="bg-slate-900">Watcher</option>
                                        <option value="Predictor" className="bg-slate-900">Predictor</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Primary Mission Objective</label>
                                <input
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="e.g. Scans for emerging robotics startups"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-indigo-500/40 outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Execution Prompt (Reasoning Block)</label>
                                <textarea
                                    value={prompt}
                                    onChange={e => setPrompt(e.target.value)}
                                    placeholder="Tell the agent exactly what to do and what to look for..."
                                    rows={4}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-indigo-500/40 outline-none transition-all resize-none"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1 block">Active Toolsets</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {availableTools.map(tool => (
                                        <button
                                            key={tool.id}
                                            onClick={() => toggleTool(tool.id)}
                                            className={cn(
                                                "flex items-center gap-3 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all",
                                                tools.includes(tool.id)
                                                    ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
                                                    : "bg-white/5 border-transparent text-slate-500 hover:text-slate-300"
                                            )}
                                        >
                                            <tool.icon className="w-4 h-4" />
                                            {tool.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Blueprint & Deployment */}
                <div className="space-y-6 flex flex-col">
                    <div className="glass p-8 rounded-3xl border-white/5 flex-1 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4">
                            <Cpu className="w-12 h-12 text-slate-800/50 group-hover:text-indigo-500/20 transition-colors" />
                        </div>

                        <h2 className="text-xl font-bold mb-6">Execution Blueprint</h2>

                        <div className="bg-black/40 rounded-2xl p-6 font-mono text-[11px] text-slate-400 space-y-2 border border-white/5 overflow-hidden">
                            <p className="text-indigo-400">class {name ? name.replace(/\s/g, '') + 'Agent' : 'AgentTemplate'}(BaseAgent):</p>
                            <p className="pl-4">name: str = "{name || 'designated-name'}"</p>
                            <p className="pl-4">description: str = "{description || 'primary-goal'}"</p>
                            <p className="pl-4">personality: str = "{personality}"</p>
                            <p className="pl-4">tools: list = [{tools.map(t => `'${t}'`).join(', ')}]</p>
                            <p className="pl-4 pt-2 text-slate-600"># System Reasoning ...</p>
                            <p className="pl-4">async def execute(self):</p>
                            <p className="pl-8 text-slate-500">context = await self.observe()</p>
                            <p className="pl-8 text-emerald-500/70"># {prompt ? prompt.slice(0, 50) + '...' : 'await llm.generate(...)'}</p>
                        </div>

                        <div className="mt-8 space-y-4">
                            <div className="flex items-center gap-3 text-xs text-slate-500">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                Code validation metrics passed
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-500">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                Tool registry permissions verified
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleBuild}
                        disabled={isBuilding || !name}
                        className="w-full py-5 rounded-3xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-bold text-lg flex items-center justify-center gap-3 shadow-xl shadow-indigo-500/20 transition-all glow-analyst"
                    >
                        {isBuilding ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <Zap className="w-6 h-6 fill-current" />
                        )}
                        Compile & Deploy Unit
                    </button>
                </div>
            </div>
        </div>
    );
}
