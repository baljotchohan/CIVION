'use client';
import React from 'react';
import { motion } from 'framer-motion';

const mockAgents = [
    { name: 'github_trend', description: 'Monitors GitHub trending repos', state: 'idle', running: true, scan_count: 24, total_insights: 45, total_signals: 12, last_run: '2 min ago' },
    { name: 'research_monitor', description: 'Tracks arXiv papers', state: 'scanning', running: true, scan_count: 18, total_insights: 32, total_signals: 8, last_run: 'now' },
    { name: 'startup_radar', description: 'HackerNews startup tracker', state: 'idle', running: true, scan_count: 21, total_insights: 38, total_signals: 15, last_run: '5 min ago' },
    { name: 'market_signal', description: 'Crypto market signals', state: 'analyzing', running: true, scan_count: 30, total_insights: 56, total_signals: 22, last_run: '1 min ago' },
    { name: 'cyber_threat', description: 'Security threat monitor', state: 'idle', running: true, scan_count: 15, total_insights: 28, total_signals: 9, last_run: '8 min ago' },
    { name: 'memory', description: 'Knowledge consolidation', state: 'idle', running: true, scan_count: 12, total_insights: 18, total_signals: 3, last_run: '10 min ago' },
    { name: 'sentiment', description: 'Sentiment analysis', state: 'idle', running: true, scan_count: 20, total_insights: 20, total_signals: 5, last_run: '3 min ago' },
];

const stateColors: Record<string, string> = {
    idle: 'badge-green', scanning: 'badge-cyan', analyzing: 'badge-yellow', reporting: 'badge-purple', error: 'badge-red', stopped: 'badge-red',
};

export default function AgentsPage() {
    return (
        <div className="p-6 space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="page-title">🤖 Agent Management</h2>
                    <p className="page-subtitle">Monitor and control intelligence agents</p>
                </div>
                <div className="flex space-x-2">
                    <button className="btn-primary">▶ Run All</button>
                    <button className="btn-secondary">⏸ Pause All</button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {mockAgents.map((agent, i) => (
                    <motion.div key={agent.name} className="sci-fi-card p-5" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="font-semibold text-accent-primary font-mono">{agent.name}</h3>
                                <p className="text-xs text-text-tertiary mt-0.5">{agent.description}</p>
                            </div>
                            <span className={`badge ${stateColors[agent.state]}`}>{agent.state}</span>
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-center text-xs mb-4">
                            <div className="p-2 bg-bg-tertiary rounded">
                                <p className="font-mono text-info">{agent.scan_count}</p>
                                <p className="text-text-tertiary">Scans</p>
                            </div>
                            <div className="p-2 bg-bg-tertiary rounded">
                                <p className="font-mono text-success">{agent.total_insights}</p>
                                <p className="text-text-tertiary">Insights</p>
                            </div>
                            <div className="p-2 bg-bg-tertiary rounded">
                                <p className="font-mono text-warning">{agent.total_signals}</p>
                                <p className="text-text-tertiary">Signals</p>
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-[10px] text-text-tertiary">Last: {agent.last_run}</span>
                            <div className="flex space-x-2">
                                <button className="btn-secondary text-[10px] py-1 px-3">▶ Run</button>
                                <button className="btn-secondary text-[10px] py-1 px-3">⏹ Stop</button>
                                <button className="btn-secondary text-[10px] py-1 px-3">📋 Logs</button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
