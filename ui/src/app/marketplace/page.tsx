'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';

const mockAgents = [
    { name: 'crypto_whale_tracker', description: 'Track large crypto wallet movements and whale activity', author: 'community', downloads: 1250, rating: 4.7, category: 'finance' },
    { name: 'patent_scanner', description: 'Monitor new patent filings in technology sectors', author: 'community', downloads: 890, rating: 4.5, category: 'research' },
    { name: 'regulatory_monitor', description: 'Track regulatory changes across jurisdictions globally', author: 'civion-official', downloads: 2100, rating: 4.9, category: 'compliance' },
    { name: 'social_pulse', description: 'Real-time social media trend detection and analysis', author: 'community', downloads: 1560, rating: 4.6, category: 'social' },
    { name: 'supply_chain_intel', description: 'Monitor global supply chain disruptions and bottlenecks', author: 'community', downloads: 720, rating: 4.4, category: 'logistics' },
    { name: 'talent_radar', description: 'Track tech talent movement and hiring patterns', author: 'community', downloads: 980, rating: 4.3, category: 'hr' },
];

const mockPersonas = [
    { name: 'Warren Buffett', description: 'Value investing analysis style', author: 'community', downloads: 3200, rating: 4.8, category: 'finance' },
    { name: 'Elon Musk', description: 'Disruptive technology focus', author: 'community', downloads: 2800, rating: 4.3, category: 'tech' },
    { name: 'Satoshi Nakamoto', description: 'Cryptography and decentralization perspective', author: 'community', downloads: 1900, rating: 4.7, category: 'crypto' },
    { name: 'Marie Curie', description: 'Scientific rigor and methodical analysis', author: 'community', downloads: 1100, rating: 4.6, category: 'science' },
];

export default function MarketplacePage() {
    const [tab, setTab] = useState<'agents' | 'personas'>('agents');
    const items = tab === 'agents' ? mockAgents : mockPersonas;

    return (
        <div className="p-6 space-y-6">
            <header>
                <h2 className="page-title">🏪 Marketplace</h2>
                <p className="page-subtitle">Browse and install community agents and personas</p>
            </header>

            <div className="flex space-x-3">
                <input className="input-field max-w-md" placeholder="Search marketplace..." />
                <button className={tab === 'agents' ? 'btn-primary' : 'btn-secondary'} onClick={() => setTab('agents')}>Agents</button>
                <button className={tab === 'personas' ? 'btn-primary' : 'btn-secondary'} onClick={() => setTab('personas')}>Personas</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item, i) => (
                    <motion.div key={item.name} className="sci-fi-card p-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="font-semibold text-accent-primary">{item.name}</h3>
                                <p className="text-[10px] text-text-tertiary mt-0.5">by {item.author}</p>
                            </div>
                            <span className="badge badge-cyan">{item.category}</span>
                        </div>

                        <p className="text-xs text-text-secondary mb-4">{item.description}</p>

                        <div className="flex justify-between items-center">
                            <div className="flex space-x-3 text-xs text-text-tertiary">
                                <span>⬇ {item.downloads.toLocaleString()}</span>
                                <span>⭐ {item.rating}</span>
                            </div>
                            <button className="btn-primary text-xs py-1 px-3">Install</button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
