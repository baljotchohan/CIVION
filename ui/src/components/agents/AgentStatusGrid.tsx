'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayCircle, StopCircle, RefreshCw, Activity, AlertTriangle, Clock } from 'lucide-react';
import { useWebSocket } from '@/hooks/useWebSocket';

export interface Agent {
    id: string;
    name: string;
    type: string;
    status: "running" | "stopped" | "error" | "paused";
    last_active: string;
    signals_found: number;
    current_task: string | null;
    uptime_seconds: number;
}

interface AgentStatusGridProps {
    agents: Agent[];
    onStart: (id: string) => void;
    onStop: (id: string) => void;
    onRestart: (id: string) => void;
}

const getStatusColor = (status: Agent["status"]) => {
    switch (status) {
        case 'running': return '#00ff88'; // Primary green
        case 'stopped': return '#a0a0a0'; // Grey
        case 'error': return '#ff006e'; // Pink
        case 'paused': return '#00d4ff'; // Cyan
        default: return '#ffffff';
    }
};

const getStatusIndicator = (status: Agent["status"]) => {
    const color = getStatusColor(status);

    if (status === 'running') {
        return (
            <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: color }}></span>
                <span className="relative inline-flex rounded-full h-3 w-3" style={{ backgroundColor: color }}></span>
            </span>
        );
    } else if (status === 'error') {
        return (
            <span className="flex h-3 w-3 relative">
                <span className="animate-pulse absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: color }}></span>
                <span className="relative inline-flex rounded-full h-3 w-3" style={{ backgroundColor: color }}></span>
            </span>
        );
    }

    return <span className="relative inline-flex rounded-full h-3 w-3" style={{ backgroundColor: color }}></span>;
};

// Internal formatting helper
const formatUptime = (seconds: number) => {
    if (seconds === 0) return '0s';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + 'h ' : ''}${m > 0 ? m + 'm ' : ''}${s}s`;
};

export const AgentStatusGrid: React.FC<AgentStatusGridProps> = ({ agents, onStart, onStop, onRestart }) => {
    const { subscribe } = useWebSocket();
    const [expandedId, setExpandedId] = useState<string | null>(null);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 p-4">
            <AnimatePresence>
                {agents.map((agent, index) => {
                    const isExpanded = expandedId === agent.id;
                    const statusColor = getStatusColor(agent.status);

                    return (
                        <motion.div
                            key={agent.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            onHoverStart={() => setExpandedId(agent.id)}
                            onHoverEnd={() => setExpandedId(null)}
                            className="relative rounded-xl border bg-[rgba(26,31,58,0.8)] backdrop-blur-[20px] p-6 shadow-lg group transition-all duration-300 flex flex-col h-full"
                            style={{
                                borderColor: `${statusColor}40`,
                                boxShadow: isExpanded ? `0 0 30px ${statusColor}30` : `0 0 10px ${statusColor}10`
                            }}
                        >
                            {/* Glow background effect */}
                            <div
                                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"
                                style={{ background: `radial-gradient(circle at center, ${statusColor} 0%, transparent 70%)` }}
                            />

                            <div className="relative z-10 flex flex-col flex-grow">
                                {/* Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 rounded-lg bg-[#1a1f3a] border border-white/5 shadow-inner">
                                            <Activity className="w-6 h-6" style={{ color: statusColor }} />
                                        </div>
                                        <div>
                                            <h3 className="font-sans font-bold text-white text-lg tracking-wide">{agent.name}</h3>
                                            <div className="flex items-center space-x-2 mt-1">
                                                {getStatusIndicator(agent.status)}
                                                <span className="text-xs font-mono uppercase tracking-wider text-[#a0a0a0]">
                                                    {agent.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Main Stats */}
                                <div className="grid grid-cols-2 gap-4 mb-5">
                                    <div className="bg-[#1a1f3a]/50 rounded-lg p-4 border border-white/5">
                                        <div className="text-[10px] text-[#a0a0a0] font-mono uppercase tracking-wider mb-2">Signals</div>
                                        <div className="text-xl font-bold font-mono text-[#00d4ff]">{agent.signals_found}</div>
                                    </div>
                                    <div className="bg-[#1a1f3a]/50 rounded-lg p-4 border border-white/5">
                                        <div className="text-[10px] text-[#a0a0a0] font-mono uppercase tracking-wider mb-2">Uptime</div>
                                        <div className="text-md font-bold font-mono text-white flex items-center">
                                            <Clock className="w-3 h-3 mr-1 text-[#a0a0a0]" />
                                            {formatUptime(agent.uptime_seconds)}
                                        </div>
                                    </div>
                                </div>

                                {/* Current Task */}
                                <div className="mb-5 flex-grow">
                                    <div className="text-[10px] text-[#a0a0a0] font-mono uppercase tracking-wider mb-2">Current Task</div>
                                    <div className="text-sm font-sans text-gray-300 line-clamp-2">
                                        {agent.current_task || "Idle / Awaiting instructions"}
                                    </div>
                                </div>

                                {/* Expanded Activities (Hover State) */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden mb-5"
                                        >
                                            <div className="pt-2 border-t border-white/10">
                                                <div className="text-[10px] text-[#a0a0a0] font-mono uppercase tracking-wider mb-2">Recent Activity</div>
                                                <ul className="space-y-2">
                                                    <li className="text-xs font-mono text-gray-400 flex items-start">
                                                        <span className="text-[#00ff88] mr-2">→</span> Extracted new signal from stream
                                                    </li>
                                                    <li className="text-xs font-mono text-gray-400 flex items-start">
                                                        <span className="text-[#00ff88] mr-2">→</span> Updated confidence score
                                                    </li>
                                                    <li className="text-xs font-mono text-gray-400 flex items-start">
                                                        <span className="text-[#00ff88] mr-2">→</span> Connected to peer network
                                                    </li>
                                                </ul>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Action Controls */}
                                <div className="flex justify-between items-center pt-4 border-t border-white/10 mt-auto">
                                    <div className="text-xs font-mono text-[#a0a0a0]" suppressHydrationWarning>
                                        Active: {agent.last_active ? new Date(agent.last_active).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'}
                                    </div>
                                    <div className="flex space-x-2">
                                        {agent.status !== 'running' && (
                                            <button
                                                onClick={() => onStart(agent.id)}
                                                className="p-2 rounded-lg bg-[#00ff88]/10 hover:bg-[#00ff88]/20 border border-[#00ff88]/50 text-[#00ff88] transition-all hover:shadow-[0_0_10px_rgba(0,255,136,0.3)]"
                                                title="Start Agent"
                                            >
                                                <PlayCircle className="w-4 h-4" />
                                            </button>
                                        )}

                                        {agent.status === 'running' && (
                                            <button
                                                onClick={() => onStop(agent.id)}
                                                className="p-2 rounded-lg bg-[#a0a0a0]/10 hover:bg-[#a0a0a0]/30 border border-[#a0a0a0]/50 text-white transition-all"
                                                title="Stop Agent"
                                            >
                                                <StopCircle className="w-4 h-4" />
                                            </button>
                                        )}

                                        <button
                                            onClick={() => onRestart(agent.id)}
                                            className="p-2 rounded-lg bg-[#00d4ff]/10 hover:bg-[#00d4ff]/20 border border-[#00d4ff]/50 text-[#00d4ff] transition-all hover:shadow-[0_0_10px_rgba(0,212,255,0.3)]"
                                            title="Restart Agent"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
};
