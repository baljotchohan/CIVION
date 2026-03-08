'use client';

import React, { useState } from 'react';
import { PersonaCard, Persona } from '@/components/personas/PersonaCard';
import { Users, Plus, Search, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const mockPersonas: Persona[] = [
    { id: '1', name: 'CyberSec Analyst Level 4', description: 'Specialized in detecting novel attack vectors, zero-days, and supply chain vulnerabilities.', analysis_style: 'Rigorous & Paranoid', sample_analysis: 'Initial vector likely via compromised NPM package in devDependencies...', topics: ['security', 'malware', 'infrastructure'], usage_count: 1420, created_at: new Date(Date.now() - 5000000000).toISOString(), primary_color: '#ff006e', avatar_emoji: '🕵️' },
    { id: '2', name: 'DeFi Market Maker', description: 'Analyzes liquidity pools, tokenomics, and smart contract audit reports for yield alpha.', analysis_style: 'Quantitative & Analytical', sample_analysis: 'TVL ratio drops below 0.5; expected impermanent loss risk elevated...', topics: ['crypto', 'finance', 'smart-contracts'], usage_count: 8590, created_at: new Date(Date.now() - 8000000000).toISOString(), primary_color: '#00d4ff', avatar_emoji: '📈' },
    { id: '3', name: 'AI Research Synthesizer', description: 'Reads papers from ArXiv and distills methodology, novelty, and exact reproduction steps.', analysis_style: 'Academic & Objective', sample_analysis: 'The baseline exceeds State of the Art by 14% on MMLU but lacks ablation...', topics: ['AI', 'research', 'models'], usage_count: 4200, created_at: new Date(Date.now() - 2000000000).toISOString(), primary_color: '#00ff88', avatar_emoji: '🧠' },
    { id: '4', name: 'Startup Ecosystem Scanner', description: 'Monitors YC, GitHub repos, and stealth mode founders to catch early-stage movements.', analysis_style: 'Forward-looking & Speculative', sample_analysis: '3 major repos forked by ex-OpenAI researchers; stealth startup likely formed.', topics: ['startups', 'vc', 'trends'], usage_count: 3105, created_at: new Date(Date.now() - 4000000000).toISOString(), primary_color: '#9b59b6', avatar_emoji: '🚀' },
];

export default function PersonasPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const filteredPersonas = mockPersonas.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.topics.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-[#0a0e27] text-white p-6 ml-[240px] flex flex-col h-screen overflow-y-auto w-full relative">

            {/* Header */}
            <div className="flex justify-between items-center mb-8 flex-shrink-0">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-[#9b59b6]/10 border border-[#9b59b6]/30 flex items-center justify-center shadow-[0_0_15px_rgba(155,89,182,0.2)]">
                        <Users className="w-5 h-5 text-[#9b59b6]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black font-sans tracking-tight text-white">Agent Personas</h1>
                        <p className="text-xs font-mono text-[#a0a0a0]">Custom analysis profiles and behavioral models</p>
                    </div>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center px-4 py-2 rounded-lg bg-[#9b59b6]/20 border border-[#9b59b6]/50 text-[#9b59b6] font-bold font-sans text-sm hover:bg-[#9b59b6]/30 transition-all hover:shadow-[0_0_15px_rgba(155,89,182,0.3)]"
                >
                    <Plus className="w-4 h-4 mr-2" /> Create New Persona
                </button>
            </div>

            {/* Featured Section */}
            <div className="mb-10 flex-shrink-0">
                <h2 className="text-sm font-mono uppercase tracking-wider text-[#a0a0a0] mb-4 flex items-center">
                    <Star className="w-4 h-4 mr-2 text-[#ffeb3b]" /> Featured Profiles
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {mockPersonas.slice(0, 2).map((persona) => (
                        <div key={persona.id} className="h-64">
                            <PersonaCard persona={persona} onApply={() => { }} onShare={() => { }} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Search & Filter */}
            <div className="flex items-center space-x-4 mb-6 flex-shrink-0">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a0a0a0]" />
                    <input
                        type="text"
                        placeholder="Search personas by name or topic..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#1a1f3a]/80 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm font-sans text-white focus:outline-none focus:border-[#9b59b6]/50 focus:ring-1 focus:ring-[#9b59b6]/50 transition-all placeholder-gray-500"
                    />
                </div>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
                {filteredPersonas.map((persona, i) => (
                    <motion.div
                        key={persona.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="h-80"
                    >
                        <PersonaCard persona={persona} onApply={() => { }} onShare={() => { }} />
                    </motion.div>
                ))}
            </div>

            {/* Creation Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setIsModalOpen(false)}
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl bg-[#0a0e27] border border-[#9b59b6]/50 rounded-2xl shadow-[0_0_50px_rgba(155,89,182,0.2)] p-6 overflow-hidden"
                        >
                            {/* Glow header */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#9b59b6] to-transparent" />

                            <h2 className="text-2xl font-bold font-sans text-white mb-6">Create Persona Profile</h2>

                            <div className="space-y-4 font-sans text-sm">
                                <div>
                                    <label className="block text-[#a0a0a0] font-mono text-xs uppercase mb-1">Name</label>
                                    <input type="text" className="w-full bg-[#1a1f3a] border border-white/10 rounded p-2 text-white" placeholder="e.g. Legal Analyst" />
                                </div>

                                <div>
                                    <label className="block text-[#a0a0a0] font-mono text-xs uppercase mb-1">Description</label>
                                    <textarea className="w-full bg-[#1a1f3a] border border-white/10 rounded p-2 text-white h-20" placeholder="Describe the persona's expertise..." />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[#a0a0a0] font-mono text-xs uppercase mb-1">Color Theme</label>
                                        <input type="color" className="w-full h-10 bg-[#1a1f3a] border border-white/10 rounded p-1 cursor-pointer" defaultValue="#9b59b6" />
                                    </div>
                                    <div>
                                        <label className="block text-[#a0a0a0] font-mono text-xs uppercase mb-1">Emoji</label>
                                        <input type="text" className="w-full bg-[#1a1f3a] border border-white/10 rounded p-2 text-white text-lg text-center" defaultValue="🤖" />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end space-x-3">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded-lg font-mono text-xs text-[#a0a0a0] hover:text-white hover:bg-white/10 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded-lg font-bold font-sans tracking-wide bg-[#9b59b6] text-white hover:bg-[#b06bc9] transition-colors shadow-[0_0_15px_rgba(155,89,182,0.5)]"
                                >
                                    Save Profile
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}
