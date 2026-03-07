'use client';
import React from 'react';

const mockLogs = [
    { time: '14:32:05', level: 'INFO', source: 'agent_engine', message: 'All 7 agents started successfully' },
    { time: '14:32:08', level: 'INFO', source: 'github_trend', message: 'Scan cycle #24 started' },
    { time: '14:32:10', level: 'INFO', source: 'github_trend', message: 'Found 5 trending repos (Python, TypeScript)' },
    { time: '14:32:10', level: 'INFO', source: 'github_trend', message: 'Cycle complete: 3 insights, 2 signals (1.2s)' },
    { time: '14:32:12', level: 'INFO', source: 'research_monitor', message: 'Scan cycle #18 started' },
    { time: '14:32:15', level: 'WARN', source: 'research_monitor', message: 'arXiv rate limit approached, throttling requests' },
    { time: '14:32:18', level: 'INFO', source: 'research_monitor', message: 'Found 4 papers with breakthrough signals' },
    { time: '14:32:20', level: 'INFO', source: 'market_signal', message: 'CoinGecko API: 20 coins fetched' },
    { time: '14:32:22', level: 'WARN', source: 'market_signal', message: 'Extreme movement detected: SOL +12.5%' },
    { time: '14:32:25', level: 'INFO', source: 'signal_engine', message: 'Detected 3 cross-source patterns' },
    { time: '14:32:28', level: 'ERROR', source: 'cyber_threat', message: 'NVD API timeout, using cached data' },
    { time: '14:32:30', level: 'INFO', source: 'memory', message: 'Knowledge convergence found: 5 insights on "ai" topic' },
    { time: '14:32:33', level: 'INFO', source: 'sentiment', message: 'Sentiment analysis: bullish (78% positive)' },
    { time: '14:32:35', level: 'INFO', source: 'scheduler', message: 'Next scan cycle in 300 seconds' },
];

const levelColors: Record<string, string> = {
    INFO: 'text-info', WARN: 'text-warning', ERROR: 'text-error', DEBUG: 'text-text-tertiary',
};

export default function LogsPage() {
    return (
        <div className="p-6 space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="page-title">📋 System Logs</h2>
                    <p className="page-subtitle">Real-time system activity and agent logs</p>
                </div>
                <div className="flex space-x-2">
                    <select className="input-field text-xs w-auto"><option>All Levels</option><option>INFO</option><option>WARN</option><option>ERROR</option></select>
                    <select className="input-field text-xs w-auto"><option>All Sources</option><option>agent_engine</option><option>github_trend</option><option>research_monitor</option></select>
                    <button className="btn-secondary text-xs">Export</button>
                </div>
            </header>

            <div className="sci-fi-card overflow-hidden">
                <div className="p-3 border-b border-border-color bg-bg-tertiary flex space-x-8 text-[10px] uppercase font-mono text-text-tertiary tracking-wider">
                    <span className="w-16">Time</span>
                    <span className="w-12">Level</span>
                    <span className="w-32">Source</span>
                    <span>Message</span>
                </div>
                <div className="max-h-[600px] overflow-y-auto">
                    {mockLogs.map((log, i) => (
                        <div key={i} className="p-3 flex space-x-8 text-xs font-mono border-b border-border-color/30 hover:bg-bg-tertiary/50 transition-colors">
                            <span className="w-16 text-text-tertiary">{log.time}</span>
                            <span className={`w-12 font-bold ${levelColors[log.level]}`}>{log.level}</span>
                            <span className="w-32 text-accent-secondary">{log.source}</span>
                            <span className="text-text-primary">{log.message}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
