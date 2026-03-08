'use client';

import React, { useState, useEffect } from 'react';
import { AgentStatusGrid, Agent } from '@/components/agents/AgentStatusGrid';
import { Bot, Play, Square, RefreshCcw, Cpu, MemoryStick, Activity, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';

const mockAgents: Agent[] = [
    { id: '1', name: 'Research Monitor', type: 'analysis', status: 'running', last_active: new Date().toISOString(), signals_found: 124, current_task: 'Scanning ArXiv for AI alignment papers', uptime_seconds: 3600 },
    { id: '2', name: 'GitHub Trend', type: 'scanner', status: 'running', last_active: new Date().toISOString(), signals_found: 89, current_task: 'Analyzing new agent frameworks', uptime_seconds: 7200 },
    { id: '3', name: 'Market Signal', type: 'finance', status: 'paused', last_active: new Date(Date.now() - 3600000).toISOString(), signals_found: 42, current_task: 'Awaiting market open', uptime_seconds: 0 },
    { id: '4', name: 'Cyber Threat', type: 'security', status: 'error', last_active: new Date(Date.now() - 60000).toISOString(), signals_found: 5, current_task: 'API rate limit exceeded on Source D', uptime_seconds: 120 },
    { id: '5', name: 'Sentiment Engine', type: 'analysis', status: 'running', last_active: new Date().toISOString(), signals_found: 432, current_task: 'Processing Twitter firehose for crypto sentiment', uptime_seconds: 14400 },
    { id: '6', name: 'Startup Radar', type: 'discovery', status: 'stopped', last_active: new Date(Date.now() - 86400000).toISOString(), signals_found: 12, current_task: null, uptime_seconds: 0 }
];

const mockLogs = [
    "[10:42:01] [sys] AgentController initialized",
    "[10:42:05] [Research Monitor] Started scan cycle #42",
    "[10:42:06] [Research Monitor] Found 3 new papers matching 'autonomous agents'",
    "[10:42:10] [GitHub Trend] Detected fork velocity spike in repo A",
    "[10:43:00] [Sentiment Engine] Processed 10k tweets. Polarity: +0.4",
    "[10:45:12] [Cyber Threat] ERROR: Rate limit hit retrying in 60s...",
];

export default function AgentsPage() {
    const [agents, setAgents] = useState(mockAgents);
    const [cpuUsage, setCpuUsage] = useState(45);
    const [memUsage, setMemUsage] = useState(62);

    useEffect(() => {
        const interval = setInterval(() => {
            setCpuUsage(prev => Math.max(10, Math.min(95, prev + (Math.random() * 10 - 5))));
            setMemUsage(prev => Math.max(20, Math.min(90, prev + (Math.random() * 4 - 2))));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const handleStart = (id: string) => {
        setAgents(prev => prev.map(a => a.id === id ? { ...a, status: 'running', uptime_seconds: 1 } : a));
    };

    const handleStop = (id: string) => {
        setAgents(prev => prev.map(a => a.id === id ? { ...a, status: 'stopped', uptime_seconds: 0 } : a));
    };

    const handleRestart = (id: string) => {
        setAgents(prev => prev.map(a => a.id === id ? { ...a, status: 'running', uptime_seconds: 1 } : a));
    };

    const startAll = () => setAgents(prev => prev.map(a => ({ ...a, status: 'running', uptime_seconds: 1 })));
    const stopAll = () => setAgents(prev => prev.map(a => ({ ...a, status: 'stopped', uptime_seconds: 0 })));

    return (
        <div className="min-h-screen bg-[#0a0e27] text-white p-6 ml-[240px] flex flex-col space-y-6 pb-24 h-screen">

            {/* Header */}
            <div className="flex justify-between items-center flex-shrink-0">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-[#00ff88]/10 border border-[#00ff88]/30 flex items-center justify-center shadow-[0_0_15px_rgba(0,255,136,0.2)]">
                        <Bot className="w-5 h-5 text-[#00ff88]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black font-sans tracking-tight text-white">Agent Fleet</h1>
                        <p className="text-xs font-mono text-[#a0a0a0]">Control and monitor autonomous agents</p>
                    </div>
                </div>

                <div className="flex space-x-4">
                    <button onClick={startAll} className="flex items-center px-4 py-2 rounded-lg bg-[#00ff88]/20 border border-[#00ff88]/50 text-[#00ff88] font-bold font-mono text-sm hover:bg-[#00ff88]/30 transition-colors shadow-[0_0_15px_rgba(0,255,136,0.2)]">
                        <Play className="w-4 h-4 mr-2" /> Start All
                    </button>
                    <button onClick={stopAll} className="flex items-center px-4 py-2 rounded-lg bg-[#ff006e]/20 border border-[#ff006e]/50 text-[#ff006e] font-bold font-mono text-sm hover:bg-[#ff006e]/30 transition-colors shadow-[0_0_15px_rgba(255,0,110,0.2)]">
                        <Square className="w-4 h-4 mr-2" /> Stop All
                    </button>
                </div>
            </div>

            {/* System Resources */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-shrink-0">
                <div className="bg-[#1a1f3a]/80 backdrop-blur rounded-xl border border-white/5 p-5 shadow-lg flex items-center space-x-6">
                    <div className="p-3 bg-black/30 rounded-lg">
                        <Cpu className="w-6 h-6 text-[#00d4ff]" />
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between text-xs font-mono mb-2">
                            <span className="text-[#a0a0a0] uppercase">CPU Load</span>
                            <span className="text-[#00d4ff] font-bold">{cpuUsage.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-[#00d4ff] to-[#00ff88]"
                                animate={{ width: `${cpuUsage}%` }}
                                transition={{ duration: 1 }}
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-[#1a1f3a]/80 backdrop-blur rounded-xl border border-white/5 p-5 shadow-lg flex items-center space-x-6">
                    <div className="p-3 bg-black/30 rounded-lg">
                        <MemoryStick className="w-6 h-6 text-[#9b59b6]" />
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between text-xs font-mono mb-2">
                            <span className="text-[#a0a0a0] uppercase">Memory Pkg</span>
                            <span className="text-[#9b59b6] font-bold">{memUsage.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-[#9b59b6] to-[#ff006e]"
                                animate={{ width: `${memUsage}%` }}
                                transition={{ duration: 1 }}
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-[#1a1f3a]/80 backdrop-blur rounded-xl border border-white/5 p-5 shadow-lg flex items-center space-x-6">
                    <div className="p-3 bg-black/30 rounded-lg">
                        <Activity className="w-6 h-6 text-[#00ff88]" />
                    </div>
                    <div className="flex-1">
                        <div className="text-xs font-mono text-[#a0a0a0] uppercase mb-1">Fleet Performance</div>
                        <div className="text-2xl font-black font-sans text-white">
                            {agents.reduce((acc, a) => acc + a.signals_found, 0).toLocaleString()}
                            <span className="text-sm font-normal text-gray-500 ml-2 font-mono">signals/24h</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Grid */}
            <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar pb-52 pr-2">
                <AgentStatusGrid
                    agents={agents}
                    onStart={handleStart}
                    onStop={handleStop}
                    onRestart={handleRestart}
                />
            </div>

            {/* Terminal Logs (Fixed Bottom) */}
            <div className="fixed bottom-0 left-[240px] right-0 h-48 bg-[#050814] border-t border-[#00d4ff]/30 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] flex flex-col">
                <div className="p-2 border-b border-white/10 flex items-center bg-[#0a0e27]/80">
                    <Terminal className="w-4 h-4 text-[#00d4ff] mr-2" />
                    <span className="text-xs font-mono text-[#00d4ff] uppercase tracking-wider">System Activity Stream</span>
                </div>
                <div className="flex-1 p-4 overflow-y-auto font-mono text-xs custom-scrollbar space-y-1">
                    {mockLogs.map((log, i) => (
                        <div key={i} className="text-green-400 opacity-80 hover:opacity-100 flex items-baseline">
                            <span className="text-blue-400 mr-2 opacity-50">$</span>
                            <span dangerouslySetInnerHTML={{ __html: log.replace(/\[([^\]]+)\]/g, '<span class="text-pink-400">[$1]</span>') }} />
                        </div>
                    ))}
                    <div className="animate-pulse text-[#00d4ff] mt-2">_</div>
                </div>
            </div>

        </div>
    );
}
