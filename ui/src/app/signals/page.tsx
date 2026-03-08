'use client';

import React from 'react';
import { SignalFeed, Signal } from '@/components/signals/SignalFeed';
import { Activity, Filter, BarChart2 } from 'lucide-react';

const mockSignals: Signal[] = [
    { id: '1', source: 'GitHub', title: 'New autonomous routing exploit pattern detected', confidence: 0.95, timestamp: new Date(Date.now() - 30000).toISOString(), strength: 0.88, signal_type: 'code_trend' },
    { id: '2', source: 'ArXiv', title: 'Scaling laws breakdown at 100T parameters', confidence: 0.70, timestamp: new Date(Date.now() - 60000).toISOString(), strength: 0.65, signal_type: 'research' },
    { id: '3', source: 'Twitter', title: 'Developer fatigue with RAG pipelines', confidence: 0.60, timestamp: new Date(Date.now() - 120000).toISOString(), strength: 0.50, signal_type: 'sentiment' },
    { id: '4', source: 'Market', title: 'NVDA options volume spike +400%', confidence: 0.85, timestamp: new Date(Date.now() - 240000).toISOString(), strength: 0.75, signal_type: 'finance' },
    { id: '5', source: 'DarkWeb', title: 'New ransomware strain targeting hospitals', confidence: 0.90, timestamp: new Date(Date.now() - 360000).toISOString(), strength: 0.95, signal_type: 'security' },
    { id: '6', source: 'GitHub', title: 'Rust-based AI framework stars +500%', confidence: 0.92, timestamp: new Date(Date.now() - 480000).toISOString(), strength: 0.82, signal_type: 'code_trend' },
];

export default function SignalsPage() {
    return (
        <div className="min-h-screen bg-[#0a0e27] text-white p-6 ml-[240px] flex flex-col h-screen overflow-hidden">

            {/* Header */}
            <div className="flex justify-between items-center mb-6 flex-shrink-0">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-[#00ff88]/10 border border-[#00ff88]/30 flex items-center justify-center shadow-[0_0_15px_rgba(0,255,136,0.2)]">
                        <Activity className="w-5 h-5 text-[#00ff88]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black font-sans tracking-tight text-white">Signal Feed</h1>
                        <p className="text-xs font-mono text-[#a0a0a0]">Real-time intelligence aggregation and alerting</p>
                    </div>
                </div>

                <button className="flex items-center px-4 py-2 rounded-lg bg-[#1a1f3a] border border-white/10 text-white font-bold font-sans text-sm hover:bg-white/5 transition-all">
                    <Filter className="w-4 h-4 mr-2" /> Advanced Filters
                </button>
            </div>

            <div className="flex flex-1 gap-6 overflow-hidden">

                {/* Main Feed Area */}
                <div className="flex-1 flex flex-col min-w-0">
                    <SignalFeed signals={mockSignals} />
                </div>

                {/* Right Sidebar - Analytics */}
                <div className="w-80 flex flex-col space-y-4 flex-shrink-0">
                    <div className="bg-[#1a1f3a]/80 backdrop-blur rounded-xl border border-white/5 p-4 flex-shrink-0">
                        <h3 className="text-xs font-mono uppercase tracking-wider text-[#a0a0a0] flex items-center mb-4">
                            <BarChart2 className="w-4 h-4 mr-2" /> Signal Volume (24h)
                        </h3>

                        <div className="flex items-end space-x-2 h-32 mb-2 p-2 relative">
                            {[40, 60, 30, 80, 50, 90, 70].map((h, i) => (
                                <div key={i} className="flex-1 bg-[#00ff88]/30 hover:bg-[#00ff88] transition-colors rounded-t cursor-pointer group relative" style={{ height: `${h}%` }}>
                                    <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-black text-[#00ff88] text-[10px] font-mono px-2 py-0.5 rounded pointer-events-none">
                                        {h * 15}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#1a1f3a]/80 backdrop-blur rounded-xl border border-white/5 p-4 flex-1 overflow-y-auto custom-scrollbar">
                        <h3 className="text-xs font-mono uppercase tracking-wider text-[#a0a0a0] mb-4">
                            Top Sources
                        </h3>

                        <div className="space-y-4">
                            {[
                                { source: 'GitHub', count: 432, color: '#00d4ff' },
                                { source: 'ArXiv', count: 321, color: '#00ff88' },
                                { source: 'Twitter', count: 215, color: '#ff006e' },
                                { source: 'DarkWeb', count: 89, color: '#9b59b6' },
                                { source: 'Market', count: 45, color: '#ffeb3b' },
                            ].map((s, i) => (
                                <div key={i}>
                                    <div className="flex justify-between items-end mb-1">
                                        <span className="text-xs font-sans font-bold text-white">{s.source}</span>
                                        <span className="text-[10px] font-mono text-[#a0a0a0]">{s.count} signals</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full" style={{ width: `${(s.count / 432) * 100}%`, backgroundColor: s.color }} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8">
                            <h3 className="text-xs font-mono uppercase tracking-wider text-[#a0a0a0] mb-4">
                                Entity Extraction
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {['OpenAI', 'RAG', 'Quantum', 'CVE-2024', 'Zero-Day', 'Nvidia', 'Crypto', 'Autonomous Agents'].map((tag, i) => (
                                    <span key={i} className="px-2 py-1 bg-black/30 border border-white/5 rounded text-[10px] font-mono text-[#a0a0a0] hover:text-white cursor-pointer hover:bg-white/10 transition-colors">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
