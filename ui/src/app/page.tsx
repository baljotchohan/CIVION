'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Bot, Lightbulb, Globe, Clock, ShieldAlert } from 'lucide-react';
import { useWebSocket } from '@/hooks/useWebSocket';

// Components
import { ConfidenceCascade } from '@/components/dashboard/ConfidenceCascade';
import { AgentStatusGrid, Agent } from '@/components/agents/AgentStatusGrid';
import { SignalFeed, Signal } from '@/components/signals/SignalFeed';
import { PredictionCard, Prediction } from '@/components/predictions/PredictionCard';

const mockAgents: Agent[] = [
    { id: '1', name: 'Research Monitor', type: 'analysis', status: 'running', last_active: new Date().toISOString(), signals_found: 124, current_task: 'Scanning ArXiv for AI alignment papers', uptime_seconds: 3600 },
    { id: '2', name: 'GitHub Trend', type: 'scanner', status: 'running', last_active: new Date().toISOString(), signals_found: 89, current_task: 'Analyzing new agent frameworks', uptime_seconds: 7200 },
    { id: '3', name: 'Market Signal', type: 'finance', status: 'paused', last_active: new Date(Date.now() - 3600000).toISOString(), signals_found: 42, current_task: 'Awaiting market open', uptime_seconds: 0 },
    { id: '4', name: 'Cyber Threat', type: 'security', status: 'error', last_active: new Date(Date.now() - 60000).toISOString(), signals_found: 5, current_task: 'API rate limit exceeded on Source D', uptime_seconds: 120 }
];

const mockConfidenceHistory = [
    { agent: 'Research Monitor', action: 'verified' as const, reason: 'Strong academic consensus found', confidence_before: 0.2, confidence_after: 0.45, timestamp: new Date(Date.now() - 60000).toISOString() },
    { agent: 'GitHub Trend', action: 'verified' as const, reason: 'High velocity of related repos', confidence_before: 0.45, confidence_after: 0.65, timestamp: new Date(Date.now() - 30000).toISOString() },
    { agent: 'Sentiment Engine', action: 'confirmed' as const, reason: 'Positive developer sentiment matches', confidence_before: 0.65, confidence_after: 0.82, timestamp: new Date().toISOString() }
];

const mockSignals: Signal[] = [
    { id: 's1', source: 'GitHub', title: 'Surge in autonomous agent frameworks', confidence: 0.92, timestamp: new Date().toISOString(), strength: 0.88, signal_type: 'code_trend', evidence: ['15 repos trending', '50K stars combined'] },
    { id: 's2', source: 'ArXiv', title: 'New MoE optimization technique', confidence: 0.85, timestamp: new Date(Date.now() - 120000).toISOString(), strength: 0.75, signal_type: 'research' }
];

const mockPrediction: Prediction = {
    id: 'p1', title: 'Autonomous AI Engineering Reality', description: 'True autonomous agentic coding frameworks will replace 40% of standard copilot usage.', probability: 0.82, timeframe: '8 months', evidence: ['GitHub activity', 'Developer sentiment'], created_at: new Date(Date.now() - 86400000).toISOString(), resolved: false, outcome: null, accuracy: null, shared_count: 134
};

export default function Dashboard() {
    const { isConnected } = useWebSocket();
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="min-h-screen bg-[#0a0e27] text-white p-6 ml-[240px] pt-8">

            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00ff88] to-[#00d4ff] flex items-center justify-center p-[2px] shadow-[0_0_20px_rgba(0,255,136,0.3)]">
                        <div className="w-full h-full bg-[#0a0e27] rounded-[10px] flex items-center justify-center">
                            <ShieldAlert className="w-7 h-7 text-[#00ff88]" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-3xl font-black font-sans tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            Command Center
                        </h1>
                        <div className="flex items-center space-x-3 text-sm font-mono mt-1 text-[#a0a0a0]">
                            <span className="flex items-center">
                                <span className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-[#00ff88] shadow-[0_0_10px_#00ff88]' : 'bg-[#ff006e]'}`} />
                                System {isConnected ? 'Online' : 'Offline'}
                            </span>
                            <span>•</span>
                            <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {time.toLocaleTimeString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Row 1: Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[
                    { label: 'Active Agents', value: '12 / 16', icon: Bot, color: '#00ff88' },
                    { label: 'Signals Today', value: '1,492', icon: Activity, color: '#00d4ff' },
                    { label: 'Predictions Made', value: '45', icon: Lightbulb, color: '#ff006e' },
                    { label: 'Network Peers', value: '89', icon: Globe, color: '#9b59b6' },
                ].map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-[#1a1f3a]/80 backdrop-blur-md rounded-xl p-6 border border-white/5 shadow-lg relative overflow-hidden group hover:border-white/20 transition-colors"
                        >
                            <div
                                className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 group-hover:opacity-20 transition-opacity blur-xl"
                                style={{ backgroundColor: stat.color }}
                            />
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                                    <Icon className="w-5 h-5" style={{ color: stat.color }} />
                                </div>
                            </div>
                            <div className="text-3xl font-black font-mono text-white mb-1 relative z-10">{stat.value}</div>
                            <div className="text-xs font-mono text-[#a0a0a0] uppercase tracking-wider relative z-10">{stat.label}</div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Row 2: Confidence Cascade + Agent Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-1">
                    <ConfidenceCascade confidenceHistory={mockConfidenceHistory} currentScore={0.82} />
                </div>
                <div className="lg:col-span-2 bg-[#1a1f3a]/50 p-6 rounded-xl border border-white/5">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold font-sans text-white">Agent Fleet Status</h2>
                    </div>
                    <AgentStatusGrid
                        agents={mockAgents}
                        onStart={() => { }} onStop={() => { }} onRestart={() => { }}
                    />
                </div>
            </div>

            {/* Row 3: Signal Feed + Prediction Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2 h-[500px]">
                    <SignalFeed signals={mockSignals} />
                </div>
                <div className="lg:col-span-1">
                    <h2 className="text-lg font-bold font-sans text-white mb-4">Latest Top Prediction</h2>
                    <PredictionCard prediction={mockPrediction} />
                </div>
            </div>

        </div>
    );
}
