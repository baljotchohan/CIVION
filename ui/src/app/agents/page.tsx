'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { getAgents, startAgent, stopAgent } from '../../lib/api';
import { Agent } from '../../types';
import { classNames, formatUptime } from '../../lib/utils';
import { TerminalSquare, Play, Square, Activity, Cpu, Database } from 'lucide-react';
import { AgentStatusGrid } from '../../components/agents/AgentStatusGrid';
import { NeonButton } from '../../components/ui/NeonButton';

export default function AgentsPage() {
    const { subscribe } = useWebSocket();
    const [agents, setAgents] = useState<Agent[]>([]);
    const [logs, setLogs] = useState<string[]>([]);
    const logsEndRef = useRef<HTMLDivElement>(null);
    const [cpu, setCpu] = useState(35);
    const [mem, setMem] = useState(45);
    const [uptime, setUptime] = useState(3600);
    const [isActionLoading, setIsActionLoading] = useState(false);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const data = await getAgents();
                setAgents(data);

                // Add an initial log
                setLogs(prev => [...prev, `[${new Date().toLocaleTimeString('en-US', { hour12: false })}] [SYSTEM] Connected to agent control plane. Found ${data.length} agents.`]);
            } catch (err) {
                console.error("Failed to load agents");
            }
        };
        fetchAll();
    }, []);

    // Live Uptime
    useEffect(() => {
        const timer = setInterval(() => setUptime(prev => prev + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    // Fake System Resources Fluctuation
    useEffect(() => {
        const timer = setInterval(() => {
            setCpu(prev => Math.max(20, Math.min(80, prev + (Math.random() * 10 - 5))));
            setMem(prev => Math.max(30, Math.min(70, prev + (Math.random() * 6 - 3))));
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    // Auto-scroll logs
    useEffect(() => {
        if (logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs]);

    // WebSocket Event Listeners
    useEffect(() => {
        const logEvent = (eventData: any, type: string) => {
            const time = new Date().toLocaleTimeString('en-US', { hour12: false });
            let msg = '';
            let colorClass = 'text-white';

            if (type === 'started') {
                msg = `Initialized and active`;
                colorClass = 'text-[#00d4ff]';
            } else if (type === 'stopped') {
                msg = `Safely halted`;
                colorClass = 'text-[#a0a0a0]';
            } else if (type === 'error') {
                msg = `CRITICAL FAILURE: ${eventData.error_message || 'Unknown exception'}`;
                colorClass = 'text-[#ff006e]';
            } else if (type === 'task') {
                msg = `Task update: ${eventData.task}`;
                colorClass = 'text-[#00ff88]';
            }

            const logLine = `<span class="text-[#a0a0a0]">[${time}]</span> <span class="font-bold text-white">[${eventData.agent || eventData.name}]</span> <span class="${colorClass}">${msg}</span>`;

            setLogs(prev => [...prev.slice(-99), logLine]);

            // Also update the agent array state if needed, though AgentStatusGrid handles it via WS itself
        };

        const handleStart = (d: any) => logEvent(d, 'started');
        const handleStop = (d: any) => logEvent(d, 'stopped');
        const handleErr = (d: any) => logEvent(d, 'error');
        const handleTask = (d: any) => logEvent(d, 'task');

        const unsubStart = subscribe('agent_started', handleStart);
        const unsubStop = subscribe('agent_stopped', handleStop);
        const unsubError = subscribe('agent_error', handleErr);
        const unsubTask = subscribe('agent_task_updated', handleTask);

        return () => {
            unsubStart();
            unsubStop();
            unsubError();
            unsubTask();
        };
    }, [subscribe]);

    // Handlers
    const handleStartAll = async () => {
        setIsActionLoading(true);
        try {
            // Ideally a dedicated endpoint for run-all, else loop
            fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/agents/run-all`, { method: 'POST' });
            setLogs(prev => [...prev, `[${new Date().toLocaleTimeString('en-US', { hour12: false })}] [SYSTEM] Executing cluster wide START sequence...`]);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleStopAll = async () => {
        setIsActionLoading(true);
        try {
            for (const a of agents) {
                if (a.status !== 'stopped') await stopAgent(a.id);
            }
            setLogs(prev => [...prev, `[${new Date().toLocaleTimeString('en-US', { hour12: false })}] [SYSTEM] Executing cluster wide STOP sequence...`]);
        } finally {
            setIsActionLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0e27] text-white p-6 pb-64 flex flex-col space-y-6 relative">

            {/* HEADER */}
            <header className="flex justify-between items-center bg-[rgba(26,31,58,0.8)] backdrop-blur-[20px] p-6 rounded-xl border border-[rgba(0,255,136,0.2)] shadow-[0_0_20px_rgba(0,255,136,0.1)] shrink-0">
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-[rgba(0,212,255,0.1)] border border-[#00d4ff]/50 flex items-center justify-center shadow-[0_0_15px_rgba(0,212,255,0.2)]">
                        <TerminalSquare className="w-6 h-6 text-[#00d4ff]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-sans tracking-widest font-bold text-white uppercase">Agent Control</h1>
                        <p className="text-[#a0a0a0] font-sans text-sm mt-1">Autonomous fleet management and surveillance</p>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <NeonButton variant="primary" onClick={handleStartAll} disabled={isActionLoading}>
                        <Play className="w-4 h-4 mr-2" /> Start All
                    </NeonButton>
                    <NeonButton variant="danger" onClick={handleStopAll} disabled={isActionLoading}>
                        <Square className="w-4 h-4 mr-2" /> Stop All
                    </NeonButton>
                </div>
            </header>

            {/* MIDDLE ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-grow">

                {/* SYSTEM RESOURCES PANEL (Left Col) */}
                <div className="lg:col-span-1 flex flex-col space-y-6">
                    <div className="bg-[rgba(26,31,58,0.8)] rounded-xl border border-[rgba(0,255,136,0.2)] backdrop-blur-[20px] p-6 shadow-[0_0_20px_rgba(0,255,136,0.1)]">
                        <h3 className="text-sm font-sans uppercase tracking-widest text-white flex items-center mb-6">
                            <Activity className="w-4 h-4 mr-2 text-[#00d4ff]" /> Cluster Health
                        </h3>

                        {/* CPU */}
                        <div className="mb-6">
                            <div className="flex justify-between text-xs font-mono mb-2">
                                <span className="text-[#a0a0a0] flex items-center"><Cpu className="w-3 h-3 mr-1" /> CPU LOAD</span>
                                <span className="text-[#00ff88]">{cpu.toFixed(1)}%</span>
                            </div>
                            <div className="w-full h-2 bg-[#1a1f3a] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[#00ff88] transition-all duration-1000 ease-out shadow-[0_0_10px_#00ff88]"
                                    style={{ width: `${cpu}%` }}
                                />
                            </div>
                        </div>

                        {/* MEMORY */}
                        <div className="mb-6">
                            <div className="flex justify-between text-xs font-mono mb-2">
                                <span className="text-[#a0a0a0] flex items-center"><Database className="w-3 h-3 mr-1" /> MEMORY IO</span>
                                <span className="text-[#00d4ff]">{mem.toFixed(1)}%</span>
                            </div>
                            <div className="w-full h-2 bg-[#1a1f3a] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[#00d4ff] transition-all duration-1000 ease-out shadow-[0_0_10px_#00d4ff]"
                                    style={{ width: `${mem}%` }}
                                />
                            </div>
                        </div>

                        {/* UPTIME */}
                        <div className="pt-4 border-t border-[rgba(0,255,136,0.2)]">
                            <div className="text-xs font-sans uppercase tracking-widest text-[#a0a0a0] mb-2">System Uptime</div>
                            <div className="text-2xl font-mono text-white tracking-widest" suppressHydrationWarning>
                                {formatUptime(uptime)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* AGENT GRID (Right Cols) */}
                <div className="lg:col-span-3 bg-[rgba(26,31,58,0.8)] rounded-xl border border-[rgba(0,255,136,0.2)] backdrop-blur-[20px] p-6 shadow-lg">
                    <AgentStatusGrid
                        agents={agents}
                        onStart={startAgent}
                        onStop={stopAgent}
                        onRestart={async (id) => { await stopAgent(id); await new Promise(r => setTimeout(r, 1000)); await startAgent(id); }}
                    />
                </div>
            </div>

            {/* FIXED BOTTOM TERMINAL LOGS */}
            <div className="fixed bottom-0 left-[260px] right-0 h-56 bg-[#0a0e27] border-t border-[#00ff88]/30 shadow-[0_-10px_30px_rgba(0,255,136,0.1)] flex flex-col z-40 ml-1">
                <div className="flex items-center justify-between px-4 py-2 border-b border-[#00ff88]/20 bg-[#1a1f3a]/80 shrink-0">
                    <span className="text-xs font-sans uppercase tracking-widest text-[#00ff88] flex items-center">
                        <TerminalSquare className="w-3 h-3 mr-2" /> Global stdout stream
                    </span>
                    <div className="flex space-x-2">
                        <div className="w-2 h-2 rounded-full bg-[#ff006e]/50"></div>
                        <div className="w-2 h-2 rounded-full bg-[#00d4ff]/50"></div>
                        <div className="w-2 h-2 rounded-full bg-[#00ff88]/50"></div>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 font-mono text-sm tracking-tight space-y-1">
                    {logs.map((log, i) => (
                        <div key={i} dangerouslySetInnerHTML={{ __html: log }} />
                    ))}
                    <div ref={logsEndRef} />
                </div>
            </div>

        </div>
    );
}
