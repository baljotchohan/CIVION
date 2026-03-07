'use client';
import React from 'react';
import { motion } from 'framer-motion';

const mockReasoningLoops = [
    {
        id: 'rl_001', topic: 'AI Robotics Market Growth', state: 'consensus_reached',
        hypothesis: 'The AI robotics market will grow 40% YoY through 2027',
        consensus: 'Strong agreement that AI robotics growth is accelerating, with multiple data sources confirming.',
        final_confidence: 0.87,
        arguments: [
            { agent: 'Research Monitor', position: 'support', argument: 'arXiv papers on robotics AI up 156% this year', confidence: 0.89 },
            { agent: 'GitHub Trend', position: 'support', argument: '15 robotics repos trending with combined 50K+ stars', confidence: 0.82 },
            { agent: 'Market Signal', position: 'challenge', argument: 'Funding data shows slight cooling in Q1 robotics investments', confidence: 0.65 },
            { agent: 'Startup Radar', position: 'support', argument: 'YC W24 batch has 8 robotics companies, highest ever', confidence: 0.91 },
            { agent: 'Sentiment', position: 'support', argument: 'Overall sentiment: 85% bullish on AI robotics', confidence: 0.78 },
        ],
    },
    {
        id: 'rl_002', topic: 'DeFi Protocol Sustainability', state: 'debating',
        hypothesis: 'Current DeFi protocols are sustainable long-term',
        consensus: '',
        final_confidence: 0.62,
        arguments: [
            { agent: 'Market Signal', position: 'support', argument: 'TVL growing steadily, reaching $180B', confidence: 0.74 },
            { agent: 'Cyber Threat', position: 'challenge', argument: '12 major DeFi hacks in 2025, $2.3B stolen', confidence: 0.88 },
            { agent: 'Sentiment', position: 'challenge', argument: 'Mixed sentiment, 52% cautious', confidence: 0.61 },
        ],
    },
];

export default function ReasoningPage() {
    return (
        <div className="p-6 space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="page-title">🧠 Multi-Agent Reasoning</h2>
                    <p className="page-subtitle">Watch agents debate and reach consensus</p>
                </div>
                <button className="btn-primary">+ Start Debate</button>
            </header>

            <div className="space-y-6">
                {mockReasoningLoops.map((loop, i) => (
                    <motion.div key={loop.id} className="sci-fi-card p-6" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-semibold text-lg">{loop.topic}</h3>
                                <p className="text-xs text-text-secondary mt-1">&quot;{loop.hypothesis}&quot;</p>
                            </div>
                            <div className="text-right">
                                <span className={`badge ${loop.state === 'consensus_reached' ? 'badge-green' : 'badge-yellow'}`}>{loop.state.replace('_', ' ')}</span>
                                <p className={`font-mono text-xl font-bold mt-1 ${loop.final_confidence > 0.7 ? 'text-success' : 'text-warning'}`}>
                                    {(loop.final_confidence * 100).toFixed(0)}%
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3 mb-4">
                            {loop.arguments.map((arg, j) => (
                                <motion.div key={j} className="flex items-start space-x-3 p-3 bg-bg-tertiary rounded-lg" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 + j * 0.08 }}>
                                    <span className={`text-xs font-bold mt-0.5 ${arg.position === 'support' ? 'text-success' : 'text-error'}`}>
                                        {arg.position === 'support' ? '▲' : '▼'}
                                    </span>
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <span className="text-xs font-mono text-accent-secondary">{arg.agent}</span>
                                            <span className={`badge text-[10px] ${arg.position === 'support' ? 'badge-green' : 'badge-red'}`}>{arg.position}</span>
                                        </div>
                                        <p className="text-sm text-text-primary">&quot;{arg.argument}&quot;</p>
                                    </div>
                                    <span className="font-mono text-xs text-text-tertiary">{(arg.confidence * 100).toFixed(0)}%</span>
                                </motion.div>
                            ))}
                        </div>

                        {loop.consensus && (
                            <div className="p-3 bg-bg-secondary border border-accent-primary/20 rounded-lg">
                                <p className="text-xs font-mono text-accent-primary mb-1">CONSENSUS</p>
                                <p className="text-sm text-text-primary">{loop.consensus}</p>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
