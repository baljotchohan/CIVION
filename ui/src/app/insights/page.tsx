'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystemState } from '../../hooks/useSystemState';
import { useAliveState } from '../../hooks/useAliveState';
import { EmptyState } from '../../components/ui/EmptyState';
import { DemoModeBanner } from '../../components/ui/DemoModeBanner';
import { Lightbulb, Search } from 'lucide-react';
import { classNames } from '../../lib/utils';

export default function InsightsPage() {
    const { systemState } = useSystemState();
    const { dataMode } = useAliveState();

    const mockInsights = [
        { id: 'gi_1', title: 'Trending: openai/swarm', content: 'Repository openai/swarm (Python) is trending with 8500 stars. Multi-agent orchestration framework.', source: 'github', confidence: 0.85, agent: 'github_trend', tags: ['github', 'trending', 'python'], created_at: '2 min ago' },
        { id: 'ri_2', title: 'Research: Scaling Laws for Neural LMs', content: 'Novel scaling laws that predict emergent capabilities in models exceeding one trillion parameters.', source: 'arxiv', confidence: 0.78, agent: 'research_monitor', tags: ['research', 'arxiv', 'ai'], created_at: '5 min ago' },
        { id: 'mi_3', title: 'Market Surge: Solana (SOL)', content: 'Solana surge 12.5% in 24h. Price: $185. Market Cap: $85B.', source: 'coingecko', confidence: 0.92, agent: 'market_signal', tags: ['market', 'crypto', 'sol'], created_at: '1 min ago' },
    ];

    return (
        <div className="min-h-screen bg-[#0a0e27] text-white p-6 space-y-6 flex flex-col pt-16 lg:pt-6">
            <DemoModeBanner />

            {dataMode === 'empty' ? (
                <EmptyState
                    icon={<Lightbulb className="w-8 h-8" />}
                    title="Intelligence Engine Offline"
                    description="Insights require active data streams and agents to generate meaningful discoveries."
                />
            ) : (
                <>
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[rgba(26,31,58,0.8)] backdrop-blur-[20px] p-6 rounded-xl border border-[rgba(0,255,136,0.2)] shadow-[0_0_20px_rgba(0,255,136,0.1)] gap-6 shrink-0">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-xl bg-[rgba(241,196,15,0.1)] border border-[#f1c40f]/50 flex items-center justify-center shadow-[0_0_15px_rgba(241,196,15,0.2)] shrink-0">
                                <Lightbulb className="w-6 h-6 text-[#f1c40f]" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-sans tracking-widest font-bold text-white uppercase">Intelligence Insights</h1>
                                <p className="text-[#a0a0a0] font-sans text-sm mt-1">Discoveries from all intelligence agents</p>
                            </div>
                        </div>

                        <div className="relative flex-1 sm:max-w-md w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a0a0a0]" />
                            <input
                                className="w-full bg-[#1a1f3a] border border-[rgba(0,255,136,0.2)] rounded-lg py-2.5 pl-10 pr-4 text-sm text-white font-sans focus:outline-none focus:border-[#00ff88] transition-colors"
                                placeholder="Search insights..."
                            />
                        </div>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1">
                        <AnimatePresence>
                            {mockInsights.map((ins, i) => (
                                <motion.div
                                    key={ins.id}
                                    className="bg-[rgba(26,31,58,0.8)] backdrop-blur-[20px] rounded-xl p-5 border border-[rgba(0,255,136,0.2)] hover:border-[#00ff88]/50 transition-all flex flex-col"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="font-bold text-sm tracking-wide text-white">{ins.title}</h3>
                                        <span className={classNames(
                                            "font-mono text-xs px-2 py-0.5 rounded ml-2 shrink-0 border",
                                            ins.confidence > 0.8 ? "text-[#00ff88] bg-[#00ff88]/10 border-[#00ff88]/30" :
                                                ins.confidence > 0.5 ? "text-[#ffd600] bg-[#ffd600]/10 border-[#ffd600]/30" :
                                                    "text-[#ff006e] bg-[#ff006e]/10 border-[#ff006e]/30"
                                        )}>
                                            {(ins.confidence * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                    <p className="text-sm font-sans text-[#a0a0a0] mb-4 flex-1">
                                        {ins.content}
                                    </p>
                                    <div className="flex justify-between items-center pt-4 border-t border-[rgba(0,255,136,0.1)] mt-auto">
                                        <div className="flex gap-2 flex-wrap max-width-[60%]">
                                            {ins.tags.map(tag => (
                                                <span key={tag} className="px-2 py-0.5 rounded bg-[#0a0e27] border border-[rgba(0,255,136,0.1)] text-[#a0a0a0] text-[10px] font-mono uppercase tracking-wider">{tag}</span>
                                            ))}
                                        </div>
                                        <div className="flex flex-col text-right">
                                            <span className="text-[10px] uppercase font-mono tracking-widest text-[#00d4ff]">{ins.agent}</span>
                                            <span className="text-[10px] text-[#a0a0a0] font-sans">{ins.created_at}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </>
            )}
        </div>
    );
}
