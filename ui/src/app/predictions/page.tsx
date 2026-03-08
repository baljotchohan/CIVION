'use client';

import React, { useState } from 'react';
import { PredictionCard, Prediction } from '@/components/predictions/PredictionCard';
import { Lightbulb, Plus, Filter, Target, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const mockPredictions: Prediction[] = [
    { id: '1', title: 'Autonomous Agent Framework Takeover', description: 'Agentic coding frameworks will replace standard copilot usage.', probability: 0.85, timeframe: '8 months', evidence: ['GitHub activity', 'Developer sentiment'], created_at: new Date(Date.now() - 86400000).toISOString(), resolved: false, outcome: null, accuracy: null, shared_count: 134 },
    { id: '2', title: 'DeFi Sector Consolidation', description: 'Top 3 protocols will capture 80% of TVL.', probability: 0.65, timeframe: '1 year', evidence: ['Market signals', 'Liquidity migration'], created_at: new Date(Date.now() - 172800000).toISOString(), resolved: false, outcome: null, accuracy: null, shared_count: 45 },
    { id: '3', title: 'Quantum Error Correction Milestone', description: 'Logical qubits achieve 99.9% fidelity.', probability: 0.42, timeframe: '6 months', evidence: ['ArXiv preprints', 'University press releases'], created_at: new Date(Date.now() - 259200000).toISOString(), resolved: true, outcome: true, accuracy: 0.76, shared_count: 89 },
    { id: '4', title: 'Major Infrastructure Cyber Event', description: 'Energy sector targeted by novel ransomware strain.', probability: 0.78, timeframe: '3 months', evidence: ['Dark web chatter', 'Exploit kits'], created_at: new Date(Date.now() - 345600000).toISOString(), resolved: false, outcome: null, accuracy: null, shared_count: 210 },
    { id: '5', title: 'AGI Consensus Estimate Revision', description: 'Leading AI labs revise AGI timeline forward by 2 years.', probability: 0.91, timeframe: '1 month', evidence: ['Executive statements', 'Model leak hints'], created_at: new Date(Date.now() - 432000000).toISOString(), resolved: true, outcome: false, accuracy: 0.32, shared_count: 501 },
];

export default function PredictionsPage() {
    const [filter, setFilter] = useState('all');

    const filteredPredictions = mockPredictions.filter(p => {
        if (filter === 'resolved') return p.resolved;
        if (filter === 'active') return !p.resolved;
        if (filter === 'high') return p.probability >= 0.8;
        return true;
    });

    return (
        <div className="min-h-screen bg-[#0a0e27] text-white p-6 ml-[240px] flex flex-col h-screen overflow-y-auto">

            {/* Header */}
            <div className="flex justify-between items-center mb-8 flex-shrink-0">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-[#ff006e]/10 border border-[#ff006e]/30 flex items-center justify-center shadow-[0_0_15px_rgba(255,0,110,0.2)]">
                        <Lightbulb className="w-5 h-5 text-[#ff006e]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black font-sans tracking-tight text-white">Predictions Engine</h1>
                        <p className="text-xs font-mono text-[#a0a0a0]">Probabilistic forecasting based on signal synthesis</p>
                    </div>
                </div>

                <button className="flex items-center px-4 py-2 rounded-lg bg-[#00d4ff]/20 border border-[#00d4ff]/50 text-[#00d4ff] font-bold font-sans text-sm hover:bg-[#00d4ff]/30 transition-all hover:shadow-[0_0_15px_rgba(0,212,255,0.3)]">
                    <Plus className="w-4 h-4 mr-2" /> Generate New Prediction
                </button>
            </div>

            {/* Accuracy Dashboard Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 flex-shrink-0">
                <div className="bg-[#1a1f3a]/80 backdrop-blur rounded-xl border border-white/5 p-5 flex items-center shadow-lg">
                    <div className="p-3 bg-[#00ff88]/10 rounded-lg mr-4 border border-[#00ff88]/20">
                        <Target className="w-8 h-8 text-[#00ff88]" />
                    </div>
                    <div>
                        <div className="text-xs font-mono text-[#a0a0a0] uppercase tracking-wider mb-1">Historical Accuracy</div>
                        <div className="text-3xl font-black font-mono text-white">74.2<span className="text-lg">%</span></div>
                    </div>
                </div>

                <div className="bg-[#1a1f3a]/80 backdrop-blur rounded-xl border border-white/5 p-5 flex items-center justify-between shadow-lg">
                    <div>
                        <div className="text-xs font-mono text-[#a0a0a0] uppercase tracking-wider mb-1">Resolved</div>
                        <div className="text-xl font-bold font-mono text-white">124</div>
                    </div>
                    <div className="w-px h-10 bg-white/10 mx-4" />
                    <div>
                        <div className="text-xs font-mono text-[#a0a0a0] uppercase tracking-wider mb-1">True / False</div>
                        <div className="text-lg font-bold font-mono">
                            <span className="text-[#00ff88]">92</span> <span className="text-[#a0a0a0]">/</span> <span className="text-[#ff006e]">32</span>
                        </div>
                    </div>
                </div>

                <div className="bg-[#1a1f3a]/80 backdrop-blur rounded-xl border border-white/5 p-5 flex items-center shadow-lg overflow-hidden relative">
                    <div className="absolute right-0 bottom-0 opacity-10">
                        <Activity className="w-32 h-32" />
                    </div>
                    <div>
                        <div className="text-xs font-mono text-[#a0a0a0] uppercase tracking-wider mb-1">Confidence Trend</div>
                        <div className="text-md font-sans text-white max-w-[200px]">
                            System confidence is trending <span className="text-[#00ff88] font-bold">upward</span> over the last 30 days (+4.5%).
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4 mb-6 flex-shrink-0">
                <div className="flex items-center text-xs font-mono text-[#a0a0a0] bg-[#1a1f3a] px-3 py-1.5 rounded-lg border border-white/5">
                    <Filter className="w-3 h-3 mr-2" /> Filters
                </div>
                {['all', 'active', 'resolved', 'high'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-colors border ${filter === f
                                ? 'bg-[#ff006e]/20 text-[#ff006e] border-[#ff006e]/50 shadow-[0_0_10px_rgba(255,0,110,0.2)]'
                                : 'bg-transparent text-[#a0a0a0] border-white/10 hover:border-white/30 hover:text-white'
                            }`}
                    >
                        {f === 'high' ? '>80% Prob' : f}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
                {filteredPredictions.map((pred, i) => (
                    <motion.div
                        key={pred.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <PredictionCard prediction={pred} />
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
