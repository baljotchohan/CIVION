'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystemState } from '../../hooks/useSystemState';
import { useAliveState } from '../../hooks/useAliveState';
import { EmptyState } from '../../components/ui/EmptyState';
import { DemoModeBanner } from '../../components/ui/DemoModeBanner';
import { ShoppingCart, Search, Download, Star } from 'lucide-react';
import { classNames } from '../../lib/utils';
import { NeonButton } from '../../components/ui/NeonButton';

export default function MarketplacePage() {
    const { systemState } = useSystemState();
    const { dataMode } = useAliveState();
    const [tab, setTab] = useState<'agents' | 'personas'>('agents');

    const mockAgents = [
        { name: 'crypto_whale_tracker', description: 'Track large crypto wallet movements and whale activity', author: 'community', downloads: 1250, rating: 4.7, category: 'finance' },
        { name: 'patent_scanner', description: 'Monitor new patent filings in technology sectors', author: 'community', downloads: 890, rating: 4.5, category: 'research' },
        { name: 'regulatory_monitor', description: 'Track regulatory changes across jurisdictions globally', author: 'civion-official', downloads: 2100, rating: 4.9, category: 'compliance' },
    ];

    const mockPersonas = [
        { name: 'Warren Buffett', description: 'Value investing analysis style', author: 'community', downloads: 3200, rating: 4.8, category: 'finance' },
        { name: 'Elon Musk', description: 'Disruptive technology focus', author: 'community', downloads: 2800, rating: 4.3, category: 'tech' },
        { name: 'Satoshi Nakamoto', description: 'Cryptography and decentralization perspective', author: 'community', downloads: 1900, rating: 4.7, category: 'crypto' },
    ];

    const items = tab === 'agents' ? mockAgents : mockPersonas;

    return (
        <div className="min-h-screen bg-[#0a0e27] text-white p-6 space-y-6 flex flex-col pt-16 lg:pt-6">
            <DemoModeBanner />

            {dataMode === 'empty' ? (
                <EmptyState
                    health={systemState.health}
                    icon={<ShoppingCart className="w-8 h-8" />}
                    title="Marketplace Offline"
                    message="Connect your node to the Global Swarm to browse and share network capabilities."
                />
            ) : (
                <>
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[rgba(26,31,58,0.8)] backdrop-blur-[20px] p-6 rounded-xl border border-[rgba(0,255,136,0.2)] shadow-[0_0_20px_rgba(0,255,136,0.1)] gap-6 shrink-0">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-xl bg-[rgba(155,89,182,0.1)] border border-[#9b59b6]/50 flex items-center justify-center shadow-[0_0_15px_rgba(155,89,182,0.2)] shrink-0">
                                <ShoppingCart className="w-6 h-6 text-[#9b59b6]" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-sans tracking-widest font-bold text-white uppercase">Marketplace</h1>
                                <p className="text-[#a0a0a0] font-sans text-sm mt-1">Browse and install community capabilities</p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                            <div className="relative flex-1 sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a0a0a0]" />
                                <input
                                    className="w-full bg-[#1a1f3a] border border-[rgba(0,255,136,0.2)] rounded-lg py-2.5 pl-10 pr-4 text-sm text-white font-sans focus:outline-none focus:border-[#00ff88] transition-colors"
                                    placeholder="Search marketplace..."
                                />
                            </div>
                            <div className="flex bg-[#1a1f3a] rounded-lg p-1 border border-[rgba(0,255,136,0.2)]">
                                <button
                                    onClick={() => setTab('agents')}
                                    className={classNames("px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors", tab === 'agents' ? "bg-[rgba(0,255,136,0.1)] text-[#00ff88]" : "text-[#a0a0a0] hover:text-white")}
                                >
                                    Agents
                                </button>
                                <button
                                    onClick={() => setTab('personas')}
                                    className={classNames("px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors", tab === 'personas' ? "bg-[rgba(0,255,136,0.1)] text-[#00ff88]" : "text-[#a0a0a0] hover:text-white")}
                                >
                                    Personas
                                </button>
                            </div>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 flex-1">
                        <AnimatePresence mode="wait">
                            {items.map((item, i) => (
                                <motion.div
                                    key={item.name}
                                    className="bg-[rgba(26,31,58,0.8)] backdrop-blur-[20px] rounded-xl p-5 border border-[rgba(0,255,136,0.2)] hover:border-[#9b59b6]/50 hover:bg-[#1a1f3a] transition-all flex flex-col group min-h-[200px]"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: i * 0.05, duration: 0.2 }}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-white tracking-wide">{item.name}</h3>
                                            <p className="text-[10px] text-[#a0a0a0] font-mono uppercase tracking-wider mt-1">by <span className={item.author === 'civion-official' ? 'text-[#00ff88]' : 'text-[#00d4ff]'}>{item.author}</span></p>
                                        </div>
                                        <span className="px-2 py-0.5 rounded bg-[#0a0e27] border border-[rgba(0,255,136,0.1)] text-[#a0a0a0] text-[10px] font-mono uppercase tracking-wider shrink-0">{item.category}</span>
                                    </div>

                                    <p className="text-sm text-[#a0a0a0] font-sans mb-6 flex-1 line-clamp-3 leading-relaxed">
                                        {item.description}
                                    </p>

                                    <div className="flex justify-between items-center pt-4 border-t border-[rgba(0,255,136,0.1)] mt-auto">
                                        <div className="flex space-x-4 text-xs font-mono text-[#a0a0a0]">
                                            <span className="flex items-center"><Download className="w-3 h-3 mr-1" /> {item.downloads.toLocaleString()}</span>
                                            <span className="flex items-center text-[#ffd600]"><Star className="w-3 h-3 mr-1 fill-current" /> {item.rating}</span>
                                        </div>
                                        <button className="px-4 py-1.5 bg-[#9b59b6]/10 border border-[#9b59b6]/30 text-[#9b59b6] hover:bg-[#9b59b6]/20 rounded transition-colors text-xs font-bold uppercase tracking-wider">
                                            Install
                                        </button>
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
