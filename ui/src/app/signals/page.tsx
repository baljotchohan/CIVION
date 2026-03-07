'use client';
import React from 'react';
import { motion } from 'framer-motion';

const mockSignals = [
    { id: 'gs_1a2b', title: 'High-Growth: openai/swarm', description: 'Rapid growth pattern with 8500 stars', source: 'github', signal_type: 'growth', strength: 0.85, detected_at: '2 min ago' },
    { id: 'rs_3c4d', title: 'Potential Breakthrough: Scaling Laws for Neural LMs', description: 'Novel scaling laws for 1T+ parameter models', source: 'arxiv', signal_type: 'breakthrough', strength: 0.78, detected_at: '5 min ago' },
    { id: 'ms_5e6f', title: 'Extreme Movement: SOL +12.5%', description: 'Solana showing extreme movement', source: 'coingecko', signal_type: 'market_extreme', strength: 0.92, detected_at: '1 min ago' },
    { id: 'ss_7g8h', title: 'Startup Signal: AI agent coding tool', description: 'Detected on HN with score 450', source: 'hackernews', signal_type: 'startup', strength: 0.72, detected_at: '8 min ago' },
    { id: 'cs_9i0j', title: 'High Severity: CVE-2026-1234 (CVSS 9.8)', description: 'Critical RCE in popular web framework', source: 'nvd', signal_type: 'security_threat', strength: 0.98, detected_at: '3 min ago' },
    { id: 'ses_k1l2', title: 'Strong Bullish Sentiment Detected', description: 'Sentiment ratio: 78% (15/19 positive)', source: 'sentiment', signal_type: 'sentiment_shift', strength: 0.56, detected_at: '6 min ago' },
];

const sourceColors: Record<string, string> = {
    github: 'badge-green', arxiv: 'badge-cyan', coingecko: 'badge-yellow', hackernews: 'badge-purple', nvd: 'badge-red', sentiment: 'badge-cyan',
};

export default function SignalsPage() {
    return (
        <div className="p-6 space-y-6">
            <header>
                <h2 className="page-title">📡 Intelligence Signals</h2>
                <p className="page-subtitle">Cross-source pattern detection and signal monitoring</p>
            </header>

            <div className="flex space-x-2 flex-wrap gap-y-2">
                {['All', 'github', 'arxiv', 'coingecko', 'hackernews', 'nvd', 'sentiment'].map(f => (
                    <button key={f} className={f === 'All' ? 'btn-primary text-xs' : 'btn-secondary text-xs'}>{f}</button>
                ))}
            </div>

            <div className="space-y-3">
                {mockSignals.map((signal, i) => (
                    <motion.div key={signal.id} className="sci-fi-card p-5" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                    <h3 className="font-semibold text-sm">{signal.title}</h3>
                                    <span className={`badge ${sourceColors[signal.source]}`}>{signal.source}</span>
                                </div>
                                <p className="text-xs text-text-secondary">{signal.description}</p>
                            </div>
                            <div className="text-right ml-4">
                                <p className={`font-mono text-lg font-bold ${signal.strength > 0.8 ? 'text-success' : signal.strength > 0.5 ? 'text-warning' : 'text-error'}`}>
                                    {(signal.strength * 100).toFixed(0)}%
                                </p>
                                <p className="text-[10px] text-text-tertiary">{signal.detected_at}</p>
                            </div>
                        </div>
                        <div className="confidence-bar mt-3">
                            <div className="confidence-fill" style={{ width: `${signal.strength * 100}%` }} />
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
