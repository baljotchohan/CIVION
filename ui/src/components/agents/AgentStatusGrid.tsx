'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayCircle, StopCircle, RefreshCw, Activity, AlertTriangle, Clock } from 'lucide-react';
import { useSystemState } from '../../hooks/useSystemState';
import { useAliveState } from '../../hooks/useAliveState';
import { classNames } from '../../lib/utils';
import { Agent } from '../../types';

interface AgentStatusGridProps {
    agents: Agent[];
    onStart: (id: string) => void;
    onStop: (id: string) => void;
    onRestart: (id: string) => void;
}

const formatUptime = (seconds: number) => {
    if (seconds === 0) return '0s';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + 'h ' : ''}${m > 0 ? m + 'm ' : ''}${s}s`;
};

export const AgentStatusGrid: React.FC<AgentStatusGridProps> = ({ agents, onStart, onStop, onRestart }) => {
    const { systemState } = useSystemState();
    const { agentVariant } = useAliveState();
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const isDead = agentVariant === 'dead';
    const isIdle = agentVariant === 'idle';

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 p-4 w-full">
            <AnimatePresence>
                {agents.map((agent, index) => {
                    const isExpanded = expandedId === agent.id;
                    const isError = agent.status === 'error';
                    const isRunning = agent.status === 'running';
                    const isPaused = agent.status === 'paused';

                    // Determine visual state based on system health + agent status
                    // If system is completely dead, force all agents to dead visual state
                    const visualState = isDead ? 'dead' : isIdle && !isRunning ? 'idle' : agent.status;

                    // DEAD State Overrides
                    const cardBg = visualState === 'dead' ? 'rgba(60, 60, 80, 0.4)'
                        : visualState === 'idle' ? 'rgba(26, 31, 58, 0.6)'
                            : 'rgba(26, 31, 58, 0.9)';

                    const borderColor = visualState === 'dead' ? 'rgba(255,255,255,0.05)'
                        : visualState === 'idle' ? 'rgba(0, 212, 255, 0.2)'
                            : isError ? 'rgba(255, 0, 110, 0.4)'
                                : 'rgba(0, 255, 136, 0.2)';

                    const dotColor = visualState === 'dead' ? '#3c3c50'
                        : visualState === 'idle' ? '#00d4ff'
                            : isError ? '#ff006e'
                                : isPaused ? '#ffd600'
                                    : '#00ff88';

                    const nameColor = visualState === 'dead' ? '#606070'
                        : visualState === 'idle' ? '#a0a0a0'
                            : '#ffffff';

                    const iconStyle = visualState === 'dead' ? { filter: 'grayscale(100%)', opacity: 0.3 }
                        : visualState === 'idle' ? { filter: 'brightness(50%)' }
                            : { color: dotColor };

                    const motionProps = visualState === 'dead'
                        ? { initial: { opacity: 0 }, animate: { opacity: 0.4, scale: 0.98 }, transition: { duration: 0.5 } }
                        : visualState === 'idle'
                            ? { initial: { opacity: 0 }, animate: { opacity: 0.7, scale: [1, 1.005, 1] }, transition: { duration: 4, repeat: Infinity } }
                            : isError
                                ? { initial: { x: -10 }, animate: { x: 0, opacity: 1 }, transition: { type: 'spring', stiffness: 500, damping: 10 } }
                                : { initial: { opacity: 0 }, animate: { opacity: 1 }, whileHover: { y: -2 }, transition: { duration: 0.2 } };

                    return (
                        <motion.div
                            key={agent.id}
                            {...motionProps}
                            onHoverStart={() => !isDead && setExpandedId(agent.id)}
                            onHoverEnd={() => setExpandedId(null)}
                            className="relative rounded-xl border backdrop-blur-[20px] p-6 flex flex-col h-full overflow-hidden"
                            style={{
                                backgroundColor: cardBg,
                                borderColor: borderColor,
                                boxShadow: !isDead && isExpanded ? `0 0 30px ${dotColor}30` : 'none'
                            }}
                        >
                            {/* Overlay Text for Dead/Idle */}
                            {(visualState === 'dead' || visualState === 'idle') && (
                                <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                                    <div className="bg-[#0a0e27]/80 px-4 py-2 rounded-lg border border-white/5 backdrop-blur-sm text-xs font-mono uppercase tracking-widest text-[#a0a0a0]">
                                        {visualState === 'dead' ? "No API key configured" : "Ready to start"}
                                    </div>
                                </div>
                            )}

                            {/* Glow background effect */}
                            {!isDead && (
                                <div
                                    className="absolute inset-0 rounded-xl opacity-0 hover:opacity-10 transition-opacity duration-300 pointer-events-none"
                                    style={{ background: `radial-gradient(circle at center, ${dotColor} 0%, transparent 70%)` }}
                                />
                            )}

                            <div className={classNames("relative z-10 flex flex-col flex-grow", isDead || visualState === 'idle' ? "blur-[2px] opacity-50" : "")}>

                                {/* Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 rounded-lg bg-[#1a1f3a] border border-white/5 shadow-inner" style={iconStyle}>
                                            <Activity className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-sans font-bold text-lg tracking-wide" style={{ color: nameColor }}>{agent.name}</h3>
                                            <div className="flex items-center space-x-2 mt-1">

                                                {/* Status Dot */}
                                                <span className="flex h-3 w-3 relative items-center justify-center">
                                                    {visualState === 'idle' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-50" style={{ backgroundColor: dotColor, animationDuration: '3s' }}></span>}
                                                    {isRunning && <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: dotColor, animationDuration: '1s' }}></span>}
                                                    {isError && <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-90" style={{ backgroundColor: dotColor, animationDuration: '0.5s' }}></span>}
                                                    <span className="relative inline-flex rounded-full h-3 w-3" style={{ backgroundColor: dotColor }}></span>
                                                    {/* Orbiting particles for RUNNING state */}
                                                    {isRunning && (
                                                        <>
                                                            <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="absolute w-6 h-6 rounded-full border border border-dashed border-[#00ff88]/30" />
                                                        </>
                                                    )}
                                                </span>

                                                <span className="text-xs font-mono uppercase tracking-wider text-[#a0a0a0]">
                                                    {visualState}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Main Stats */}
                                <div className="grid grid-cols-2 gap-4 mb-5">
                                    <div className="bg-[#1a1f3a]/50 rounded-lg p-4 border border-white/5">
                                        <div className="text-[10px] text-[#a0a0a0] font-mono uppercase tracking-wider mb-2">Signals</div>
                                        <div className="text-xl font-bold font-mono text-[#00d4ff]">{visualState === 'dead' ? '-' : agent.signals_found}</div>
                                    </div>
                                    <div className="bg-[#1a1f3a]/50 rounded-lg p-4 border border-white/5">
                                        <div className="text-[10px] text-[#a0a0a0] font-mono uppercase tracking-wider mb-2">Uptime</div>
                                        <div className="text-md font-bold font-mono text-white flex items-center">
                                            <Clock className="w-3 h-3 mr-1 text-[#a0a0a0]" />
                                            {visualState === 'dead' ? '-h -m' : formatUptime(agent.uptime_seconds)}
                                        </div>
                                    </div>
                                </div>

                                {/* Current Task */}
                                <div className="mb-5 flex-grow overflow-hidden">
                                    <div className="text-[10px] text-[#a0a0a0] font-mono uppercase tracking-wider mb-2">Current Task</div>
                                    {isError ? (
                                        <div className="text-sm font-sans text-[#ff006e] line-clamp-2">
                                            <AlertTriangle className="inline w-4 h-4 mr-1" />
                                            {agent.error_message || "Critical failure in agent loop"}
                                        </div>
                                    ) : (
                                        <div className="text-sm font-sans text-gray-300 relative">
                                            {/* Marquee effect if running and long text, else clamp */}
                                            <div className={classNames(isRunning && agent.current_task && agent.current_task.length > 50 ? "animate-marquee whitespace-nowrap" : "line-clamp-2")}>
                                                {visualState === 'dead' ? "Offline" : agent.current_task || "Idle / Awaiting instructions"}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Action Controls */}
                                <div className="flex justify-between items-center pt-4 border-t border-white/10 mt-auto">
                                    <div className="text-xs font-mono text-[#a0a0a0]" suppressHydrationWarning>
                                        Active: {visualState === 'dead' || !agent.last_active ? 'Never' : new Date(agent.last_active).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            disabled={isDead || isRunning}
                                            onClick={() => onStart(agent.id)}
                                            className={classNames(
                                                "p-2 rounded-lg transition-all",
                                                isDead ? "opacity-30 cursor-not-allowed bg-white/5 text-white/20"
                                                    : isRunning ? "opacity-30 cursor-not-allowed bg-[#00ff88]/5 text-[#00ff88]/50"
                                                        : "bg-[#00d4ff]/10 hover:bg-[#00d4ff]/20 border border-[#00d4ff]/50 text-[#00d4ff] hover:shadow-[0_0_10px_rgba(0,212,255,0.3)]"
                                            )}
                                        >
                                            <PlayCircle className="w-4 h-4" />
                                        </button>

                                        <button
                                            disabled={isDead || !isRunning}
                                            onClick={() => onStop(agent.id)}
                                            className={classNames(
                                                "p-2 rounded-lg transition-all",
                                                isDead || !isRunning ? "opacity-30 cursor-not-allowed bg-white/5 text-white/20"
                                                    : "bg-[#a0a0a0]/10 hover:bg-[#a0a0a0]/30 border border-[#a0a0a0]/50 text-white"
                                            )}
                                        >
                                            <StopCircle className="w-4 h-4" />
                                        </button>

                                        <button
                                            disabled={isDead}
                                            onClick={() => onRestart(agent.id)}
                                            className={classNames(
                                                "p-2 rounded-lg transition-all",
                                                isDead ? "opacity-30 cursor-not-allowed bg-white/5 text-white/20"
                                                    : isError ? "bg-[#ff006e]/10 hover:bg-[#ff006e]/20 border border-[#ff006e]/50 text-[#ff006e] hover:shadow-[0_0_10px_rgba(255,0,110,0.3)]"
                                                        : "bg-white/5 hover:bg-white/10 border border-white/20 text-white"
                                            )}
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
