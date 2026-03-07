'use client';
import React from 'react';
import { motion } from 'framer-motion';

const mockInsights = [
    { id: 'gi_1', title: 'Trending: openai/swarm', content: 'Repository openai/swarm (Python) is trending with 8500 stars. Multi-agent orchestration framework.', source: 'github', confidence: 0.85, agent: 'github_trend', tags: ['github', 'trending', 'python'], created_at: '2 min ago' },
    { id: 'ri_2', title: 'Research: Scaling Laws for Neural LMs', content: 'Novel scaling laws that predict emergent capabilities in models exceeding one trillion parameters.', source: 'arxiv', confidence: 0.78, agent: 'research_monitor', tags: ['research', 'arxiv', 'ai'], created_at: '5 min ago' },
    { id: 'mi_3', title: 'Market Surge: Solana (SOL)', content: 'Solana surge 12.5% in 24h. Price: $185. Market Cap: $85B.', source: 'coingecko', confidence: 0.92, agent: 'market_signal', tags: ['market', 'crypto', 'sol'], created_at: '1 min ago' },
    { id: 'si_4', title: 'HN Trending: AI agent coding tool', content: 'Show HN: We built an AI agent that writes production code (Score: 450).', source: 'hackernews', confidence: 0.72, agent: 'startup_radar', tags: ['hackernews', 'startup'], created_at: '8 min ago' },
    { id: 'ci_5', title: 'Security: CVE-2026-1234', content: 'Critical RCE in popular web framework. Severity: CRITICAL.', source: 'nvd', confidence: 0.98, agent: 'cyber_threat', tags: ['security', 'cve', 'critical'], created_at: '3 min ago' },
    { id: 'se_6', title: 'Sentiment: Bullish (78% positive)', content: 'Analysis of 19 recent insights: 15 positive, 3 negative, 1 neutral. Overall: bullish.', source: 'sentiment_analysis', confidence: 0.7, agent: 'sentiment', tags: ['sentiment', 'bullish'], created_at: '6 min ago' },
];

export default function InsightsPage() {
    return (
        <div className="p-6 space-y-6">
            <header>
                <h2 className="page-title">💡 Intelligence Insights</h2>
                <p className="page-subtitle">Discoveries from all intelligence agents</p>
            </header>

            <div className="flex space-x-3">
                <input className="input-field max-w-md" placeholder="Search insights..." />
                <button className="btn-primary">Search</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockInsights.map((ins, i) => (
                    <motion.div key={ins.id} className="sci-fi-card p-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-sm">{ins.title}</h3>
                            <span className={`font-mono text-sm ${ins.confidence > 0.8 ? 'text-success' : ins.confidence > 0.5 ? 'text-warning' : 'text-error'}`}>
                                {(ins.confidence * 100).toFixed(0)}%
                            </span>
                        </div>
                        <p className="text-xs text-text-secondary mb-3">{ins.content}</p>
                        <div className="flex justify-between items-center">
                            <div className="flex space-x-1">
                                {ins.tags.map(tag => (
                                    <span key={tag} className="badge badge-cyan text-[10px]">{tag}</span>
                                ))}
                            </div>
                            <span className="text-[10px] text-text-tertiary">{ins.agent} · {ins.created_at}</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
