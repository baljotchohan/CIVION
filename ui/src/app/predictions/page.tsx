'use client';
import React from 'react';
import { motion } from 'framer-motion';

const mockPredictions = [
    { id: 'pred_01', title: 'Robot IPO Wave in Q2 2026', confidence: 0.85, timeframe: '3 months', state: 'pending', sources: ['github_trend', 'research_monitor', 'market_signal'], created: '1 day ago' },
    { id: 'pred_02', title: 'AI Hardware Breakthrough', confidence: 0.72, timeframe: '6 weeks', state: 'pending', sources: ['research_monitor', 'startup_radar'], created: '2 days ago' },
    { id: 'pred_03', title: 'DeFi Market Consolidation', confidence: 0.88, timeframe: '6 months', state: 'pending', sources: ['market_signal', 'sentiment'], created: '3 days ago' },
    { id: 'pred_04', title: 'Critical Infrastructure Attack', confidence: 0.65, timeframe: '3 months', state: 'pending', sources: ['cyber_threat'], created: '1 week ago' },
    { id: 'pred_05', title: 'Open-Source AI Model Surpasses GPT-5', confidence: 0.58, timeframe: '12 months', state: 'pending', sources: ['research_monitor', 'github_trend'], created: '1 week ago' },
    { id: 'pred_06', title: 'Major Tech Acquisition in Robotics', confidence: 0.91, timeframe: '4 months', state: 'verified_true', sources: ['startup_radar', 'market_signal', 'sentiment'], created: '2 weeks ago' },
];

const accuracy = { total: 42, verified: 28, correct: 22, accuracy: '78.6%' };

export default function PredictionsPage() {
    return (
        <div className="p-6 space-y-6">
            <header>
                <h2 className="page-title">🔮 Predictive Intelligence</h2>
                <p className="page-subtitle">AI-generated predictions with confidence tracking</p>
            </header>

            {/* Accuracy Stats */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Total', value: accuracy.total, color: 'text-info' },
                    { label: 'Verified', value: accuracy.verified, color: 'text-warning' },
                    { label: 'Correct', value: accuracy.correct, color: 'text-success' },
                    { label: 'Accuracy', value: accuracy.accuracy, color: 'text-accent-primary' },
                ].map(stat => (
                    <div key={stat.label} className="sci-fi-card p-4 text-center">
                        <p className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</p>
                        <p className="text-xs text-text-tertiary">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Predictions */}
            <div className="space-y-3">
                {mockPredictions.map((pred, i) => (
                    <motion.div key={pred.id} className="sci-fi-card p-5" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                    <h3 className="font-semibold">{pred.title}</h3>
                                    <span className={`badge ${pred.state === 'verified_true' ? 'badge-green' : pred.state === 'verified_false' ? 'badge-red' : 'badge-yellow'}`}>
                                        {pred.state.replace('_', ' ')}
                                    </span>
                                </div>
                                <div className="flex space-x-4 text-xs text-text-tertiary mt-1">
                                    <span>⏱ {pred.timeframe}</span>
                                    <span>📅 {pred.created}</span>
                                    <span>Sources: {pred.sources.join(', ')}</span>
                                </div>
                            </div>
                            <div className="text-right ml-4">
                                <p className={`font-mono text-2xl font-bold ${pred.confidence > 0.8 ? 'text-success' : pred.confidence > 0.6 ? 'text-warning' : 'text-error'}`}>
                                    {(pred.confidence * 100).toFixed(0)}%
                                </p>
                            </div>
                        </div>
                        <div className="confidence-bar mt-3">
                            <div className="confidence-fill" style={{ width: `${pred.confidence * 100}%` }} />
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
