'use client';

import React, { useState } from 'react';
import { DebateViewer, DebateMessage } from '@/components/reasoning/DebateViewer';
import { ConfidenceCascade } from '@/components/dashboard/ConfidenceCascade';
import { PlayCircle, Plus, Brain, History } from 'lucide-react';
import { motion } from 'framer-motion';

const mockDebate: DebateMessage[] = [
    { id: '1', agent_name: 'Research Monitor', role: 'proposer', content: 'I propose an emerging trend: AI coding agents are rapidly shifting to autonomous systems.', confidence: 0.85, timestamp: new Date(Date.now() - 60000).toISOString(), is_final: false },
    { id: '2', agent_name: 'Market Signal', role: 'challenger', content: 'Investment data does not fully support this yet; enterprise adoption favors copilot models.', confidence: 0.65, timestamp: new Date(Date.now() - 45000).toISOString(), is_final: false },
    { id: '3', agent_name: 'GitHub Trend', role: 'verifier', content: 'Actually, repo activity shows autonomous agent frameworks have 3x fork velocity this month.', confidence: 0.90, timestamp: new Date(Date.now() - 30000).toISOString(), is_final: false },
    { id: '4', agent_name: 'Sentiment Engine', role: 'synthesizer', content: 'Conclusion: The trend is real on the developer side but constrained in enterprise. High conviction for early adopter growth.', confidence: 0.88, timestamp: new Date(Date.now() - 10000).toISOString(), is_final: true },
];

export default function ReasoningPage() {
    const [isActive, setIsActive] = useState(false);

    return (
        <div className="min-h-screen bg-[#0a0e27] text-white p-6 ml-[240px] flex flex-col h-screen">

            {/* Header */}
            <div className="flex justify-between items-center mb-6 flex-shrink-0">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-[#00d4ff]/10 border border-[#00d4ff]/30 flex items-center justify-center">
                        <Brain className="w-5 h-5 text-[#00d4ff]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black font-sans tracking-tight text-white">Reasoning Engine</h1>
                        <p className="text-xs font-mono text-[#a0a0a0]">Multi-agent debate & consensus tracking</p>
                    </div>
                </div>

                <div className="flex space-x-4">
                    <div className="bg-[#1a1f3a]/80 backdrop-blur border border-white/10 rounded-lg px-4 flex items-center">
                        <span className="text-xs font-mono text-[#a0a0a0] mr-3 uppercase tracking-widest">Active Goal</span>
                        <select className="bg-transparent text-sm font-sans text-white outline-none border-none py-2 cursor-pointer">
                            <option>Analyze AI Market Trends Q3</option>
                            <option>Evaluate Cyber Threat Level</option>
                            <option>Monitor Quantum Computing</option>
                        </select>
                    </div>

                    <button
                        onClick={() => setIsActive(!isActive)}
                        className="flex items-center px-4 py-2 rounded-lg font-bold font-sans transition-all text-sm border hover:shadow-lg"
                        style={{
                            backgroundColor: isActive ? '#ff006e20' : '#00ff8820',
                            borderColor: isActive ? '#ff006e50' : '#00ff8850',
                            color: isActive ? '#ff006e' : '#00ff88',
                            boxShadow: isActive ? '0 0 15px rgba(255,0,110,0.2)' : '0 0 15px rgba(0,255,136,0.2)'
                        }}
                    >
                        {isActive ? <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-[#ff006e] animate-pulse mr-2" /> Suspend Debate</span> : <span className="flex items-center"><PlayCircle className="w-4 h-4 mr-2" /> Start Reasoning Loop</span>}
                    </button>
                </div>
            </div>

            <div className="flex flex-1 gap-6 overflow-hidden">
                {/* Left Sidebar - Debate History */}
                <div className="w-64 flex flex-col space-y-4 flex-shrink-0">
                    <div className="bg-[#1a1f3a]/80 backdrop-blur rounded-xl border border-white/5 p-4 flex flex-col h-full">
                        <h3 className="text-xs font-mono uppercase tracking-wider text-[#a0a0a0] mb-4 flex items-center">
                            <History className="w-3 h-3 mr-2" /> Session History
                        </h3>

                        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {[
                                { title: "AI Market Trends Q3", status: "completed", conf: 88 },
                                { title: "DeFi Regulation Risk", status: "completed", conf: 65 },
                                { title: "Robotics Investment", status: "active", conf: 45 },
                                { title: "AGI Timeline Est.", status: "completed", conf: 32 },
                            ].map((h, i) => (
                                <div key={i} className={`p-3 rounded-lg border cursor-pointer hover:bg-white/5 transition-colors ${h.status === 'active' ? 'border-[#00d4ff]/30 bg-[#00d4ff]/10' : 'border-white/5 bg-black/20'}`}>
                                    <div className="text-xs font-sans font-bold text-white mb-1">{h.title}</div>
                                    <div className="flex justify-between items-center text-[10px] font-mono">
                                        <span className={h.status === 'active' ? 'text-[#00d4ff]' : 'text-[#a0a0a0]'}>
                                            {h.status.toUpperCase()}
                                        </span>
                                        <span className="text-[#00ff88]">{h.conf}% conf</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="mt-4 w-full flex items-center justify-center space-x-2 py-2 rounded-lg border border-dashed border-white/20 text-[#a0a0a0] hover:text-white hover:border-white/40 transition-colors text-xs font-mono">
                            <Plus className="w-3 h-3" /> <span>New Goal</span>
                        </button>
                    </div>
                </div>

                {/* Center - Active Debate */}
                <div className="flex-1 flex flex-col min-w-0">
                    <DebateViewer debate={mockDebate} isActive={isActive} />
                </div>

                {/* Right Sidebar - Confidence Timeline */}
                <div className="w-96 flex flex-col space-y-4 flex-shrink-0">
                    <div className="bg-[#1a1f3a]/80 backdrop-blur rounded-xl border border-[#00ff88]/20 shadow-[0_0_15px_rgba(0,255,136,0.05)] p-4 flex flex-col h-full overflow-y-auto custom-scrollbar">
                        <h3 className="text-xs font-mono uppercase tracking-wider text-[#00ff88] mb-6 border-b border-[#00ff88]/20 pb-2">
                            Consensus Trajectory
                        </h3>

                        <ConfidenceCascade
                            confidenceHistory={[
                                { agent: 'Research Monitor', action: 'verified', reason: 'Strong academic consensus', confidence_before: 0.2, confidence_after: 0.45, timestamp: new Date(Date.now() - 60000).toISOString() },
                                { agent: 'Market Signal', action: 'challenged', reason: 'Investment data lags', confidence_before: 0.45, confidence_after: 0.35, timestamp: new Date(Date.now() - 45000).toISOString() },
                                { agent: 'GitHub Trend', action: 'verified', reason: 'High velocity of related repos', confidence_before: 0.35, confidence_after: 0.65, timestamp: new Date(Date.now() - 30000).toISOString() },
                                { agent: 'Sentiment Engine', action: 'confirmed', reason: 'Developer sentiment correlates', confidence_before: 0.65, confidence_after: 0.88, timestamp: new Date(Date.now() - 10000).toISOString() }
                            ]}
                            currentScore={0.88}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
