'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystemState } from '../../hooks/useSystemState';
import { useAliveState } from '../../hooks/useAliveState';
import { EmptyState } from '../../components/ui/EmptyState';
import { DemoModeBanner } from '../../components/ui/DemoModeBanner';
import { Terminal, Download } from 'lucide-react';
import { classNames } from '../../lib/utils';

export default function LogsPage() {
    const { systemState } = useSystemState();
    const { dataMode } = useAliveState();

    const mockLogs = [
        { id: 1, time: '14:32:05', level: 'INFO', source: 'agent_engine', message: 'All 7 agents started successfully' },
        { id: 2, time: '14:32:08', level: 'INFO', source: 'github_trend', message: 'Scan cycle #24 started' },
        { id: 3, time: '14:32:10', level: 'INFO', source: 'github_trend', message: 'Found 5 trending repos (Python, TypeScript)' },
        { id: 4, time: '14:32:15', level: 'WARN', source: 'research_monitor', message: 'arXiv rate limit approached, throttling requests' },
        { id: 5, time: '14:32:20', level: 'INFO', source: 'market_signal', message: 'CoinGecko API: 20 coins fetched' },
        { id: 6, time: '14:32:28', level: 'ERROR', source: 'cyber_threat', message: 'NVD API timeout, using cached data' },
        { id: 7, time: '14:32:35', level: 'INFO', source: 'scheduler', message: 'Next scan cycle in 300 seconds' },
    ];

    const levelColors: Record<string, string> = {
        INFO: 'text-[#00d4ff]', WARN: 'text-[#ffd600]', ERROR: 'text-[#ff006e]', DEBUG: 'text-[#a0a0a0]',
    };

    return (
        <div className="min-h-screen bg-[#0a0e27] text-white p-6 space-y-6 flex flex-col pt-16 lg:pt-6">
            <DemoModeBanner />

            {dataMode === 'empty' ? (
                <EmptyState
                    health={systemState.health}
                    icon={<Terminal className="w-8 h-8" />}
                    title="System Logs Offline"
                    message="The logging service requires an active connection to the core engine."
                />
            ) : (
                <>
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[rgba(26,31,58,0.8)] backdrop-blur-[20px] p-6 rounded-xl border border-[rgba(0,255,136,0.2)] shadow-[0_0_20px_rgba(0,255,136,0.1)] gap-6 shrink-0">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-xl bg-[rgba(160,160,160,0.1)] border border-[#a0a0a0]/50 flex items-center justify-center shadow-[0_0_15px_rgba(160,160,160,0.2)] shrink-0">
                                <Terminal className="w-6 h-6 text-[#a0a0a0]" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-sans tracking-widest font-bold text-white uppercase">System Logs</h1>
                                <p className="text-[#a0a0a0] font-sans text-sm mt-1">Real-time system activity and agent telemetry</p>
                            </div>
                        </div>

                        <div className="flex space-x-4 w-full md:w-auto">
                            <select className="flex-1 bg-[#1a1f3a] border border-[rgba(0,255,136,0.2)] rounded-lg px-4 py-2 text-sm text-white font-sans focus:outline-none focus:border-[#00ff88]">
                                <option>All Levels</option><option>INFO</option><option>WARN</option><option>ERROR</option>
                            </select>
                            <select className="flex-1 bg-[#1a1f3a] border border-[rgba(0,255,136,0.2)] rounded-lg px-4 py-2 text-sm text-white font-sans focus:outline-none focus:border-[#00ff88]">
                                <option>All Sources</option><option>agent_engine</option><option>github_trend</option><option>research_monitor</option>
                            </select>
                            <button className="flex items-center px-4 py-2 bg-[rgba(26,31,58,0.5)] border border-[rgba(0,255,136,0.2)] text-[#a0a0a0] rounded-lg hover:text-white hover:border-[#00ff88]/50 transition-all uppercase tracking-wider text-xs font-bold">
                                <Download className="w-4 h-4 mr-2" /> Export
                            </button>
                        </div>
                    </header>

                    <div className="bg-[rgba(26,31,58,0.8)] backdrop-blur-[20px] rounded-xl border border-[rgba(0,255,136,0.2)] shadow-lg overflow-hidden flex-1 flex flex-col">
                        <div className="p-4 border-b border-[rgba(0,255,136,0.2)] bg-[#1a1f3a]/80 flex space-x-6 text-[10px] uppercase font-mono text-[#a0a0a0] tracking-wider shrink-0">
                            <span className="w-20">Time</span>
                            <span className="w-16">Level</span>
                            <span className="w-32">Source</span>
                            <span className="flex-1">Message</span>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <AnimatePresence>
                                {mockLogs.map((log, i) => (
                                    <motion.div
                                        key={log.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.03 }}
                                        className="p-4 flex space-x-6 text-sm font-mono border-b border-[rgba(0,255,136,0.1)] hover:bg-[#1a1f3a]/50 transition-colors"
                                    >
                                        <span className="w-20 text-[#a0a0a0] opacity-70">{log.time}</span>
                                        <span className={classNames("w-16 font-bold", levelColors[log.level])}>{log.level}</span>
                                        <span className="w-32 text-[#9b59b6]">{log.source}</span>
                                        <span className="flex-1 text-white">{log.message}</span>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
