'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPersonas, createPersona, sharePersona } from '../../lib/api';
import { Persona } from '../../types';
import { NeonButton } from '../../components/ui/NeonButton';
import { SkeletonCard } from '../../components/ui/SkeletonCard';
import { classNames } from '../../lib/utils';
import { Users, Search, Plus, Star, Share2, Check, UserCheck } from 'lucide-react';

export default function PersonasPage() {
    const [personas, setPersonas] = useState<Persona[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [activePersonaId, setActivePersonaId] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '', description: '', analysis_style: 'analytical', topics: '', color: '#00ff88', emoji: '🤖'
    });

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const data = await getPersonas();
                setPersonas(data);
                if (data.length > 0) setActivePersonaId(data[0].id);
            } catch (err) {
                console.error("Failed to load personas");
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const newP = await createPersona({
                ...formData,
                topics: formData.topics.split(',').map(t => t.trim()).filter(Boolean),
            });
            setPersonas(prev => [newP, ...prev]);
            setIsCreateModalOpen(false);
        } catch (err) {
            console.error("Failed to create persona");
        }
    };

    const handleShare = async (id: string) => {
        try {
            await sharePersona(id);
            setPersonas(prev => prev.map(p => p.id === id ? { ...p, is_shared: true } : p));
        } catch (err) {
            console.error("Failed to share persona");
        }
    };

    const filtered = personas.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const featured = [...personas].sort((a, b) => b.usage_count - a.usage_count).slice(0, 3);

    return (
        <div className="min-h-screen bg-[#0a0e27] text-white p-6 space-y-8 flex flex-col">

            {/* HEADER & SEARCH */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[rgba(26,31,58,0.8)] backdrop-blur-[20px] p-6 rounded-xl border border-[rgba(0,255,136,0.2)] shadow-[0_0_20px_rgba(0,255,136,0.1)] gap-6">
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-[rgba(0,255,136,0.1)] border border-[#00ff88]/50 flex items-center justify-center shadow-[0_0_15px_rgba(0,255,136,0.2)]">
                        <Users className="w-6 h-6 text-[#00ff88]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-sans tracking-widest font-bold text-white uppercase">Identities & Personas</h1>
                        <p className="text-[#a0a0a0] font-sans text-sm mt-1">Configure cognitive styles and behavioral constraints</p>
                    </div>
                </div>

                <div className="flex items-center space-x-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a0a0a0]" />
                        <input
                            type="text"
                            placeholder="Search identities..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#1a1f3a] border border-[#00ff88]/20 rounded-lg py-2 pl-10 pr-4 text-sm text-white font-sans focus:outline-none focus:border-[#00ff88] transition-colors"
                        />
                    </div>
                    <NeonButton onClick={() => setIsCreateModalOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" /> Create New
                    </NeonButton>
                </div>
            </header>

            {/* FEATURED PERSONAS */}
            {!searchQuery && featured.length > 0 && (
                <div>
                    <h2 className="text-sm font-sans uppercase tracking-widest text-[#a0a0a0] mb-4 flex items-center">
                        <Star className="w-4 h-4 mr-2 text-[#00d4ff]" /> Featured Configurations
                    </h2>
                    <div className="flex overflow-x-auto gap-6 pb-4 custom-scrollbar">
                        {loading
                            ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} className="min-w-[350px]" lines={4} />)
                            : featured.map(p => (
                                <PersonaCard
                                    key={p.id}
                                    persona={p}
                                    isActive={p.id === activePersonaId}
                                    onSelect={() => setActivePersonaId(p.id)}
                                    onShare={() => handleShare(p.id)}
                                    className="min-w-[350px]"
                                />
                            ))
                        }
                    </div>
                </div>
            )}

            {/* ALL PERSONAS GRID */}
            <div className="flex-1">
                <h2 className="text-sm font-sans uppercase tracking-widest text-[#a0a0a0] mb-4 flex items-center">
                    <Users className="w-4 h-4 mr-2 text-[#9b59b6]" /> All Identities ({filtered.length})
                </h2>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} lines={4} />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center text-[#a0a0a0] py-12 border border-dashed border-[#a0a0a0]/30 rounded-xl bg-[rgba(26,31,58,0.5)]">
                        No personas match your search.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        <AnimatePresence>
                            {filtered.map(p => (
                                <motion.div
                                    key={p.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                >
                                    <PersonaCard
                                        persona={p}
                                        isActive={p.id === activePersonaId}
                                        onSelect={() => setActivePersonaId(p.id)}
                                        onShare={() => handleShare(p.id)}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* CREATE PRESONA MODAL */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            className="bg-[#1a1f3a] border border-[#00ff88] rounded-xl shadow-[0_0_30px_rgba(0,255,136,0.2)] p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
                        >
                            <h2 className="text-xl tracking-widest uppercase font-bold text-[#00ff88] mb-6 border-b border-[#00ff88]/20 pb-4">Create Network Persona</h2>

                            <form onSubmit={handleCreate} className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-xs font-mono text-[#a0a0a0] mb-2 uppercase tracking-wider">Identity Name</label>
                                        <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-[#0a0e27] border border-[rgba(0,255,136,0.2)] rounded-lg p-3 text-white focus:border-[#00ff88] focus:outline-none" placeholder="E.g., Crypto Analyst" />
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-xs font-mono text-[#a0a0a0] mb-2 uppercase tracking-wider">Analysis Style</label>
                                        <select value={formData.analysis_style} onChange={e => setFormData({ ...formData, analysis_style: e.target.value })} className="w-full bg-[#0a0e27] border border-[rgba(0,255,136,0.2)] rounded-lg p-3 text-white focus:border-[#00ff88] focus:outline-none">
                                            <option value="analytical">Analytical / Data-Driven</option>
                                            <option value="creative">Creative / Synthesizer</option>
                                            <option value="critical">Critical / Challenger</option>
                                            <option value="balanced">Balanced / Proposer</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-mono text-[#a0a0a0] mb-2 uppercase tracking-wider">System Prompt Constraints (Description)</label>
                                    <textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full bg-[#0a0e27] border border-[rgba(0,255,136,0.2)] rounded-lg p-3 text-white focus:border-[#00ff88] focus:outline-none" placeholder="Defines how this persona behaves and reasons..." />
                                </div>

                                <div>
                                    <label className="block text-xs font-mono text-[#a0a0a0] mb-2 uppercase tracking-wider">Domain Topics (Comma separated)</label>
                                    <input type="text" value={formData.topics} onChange={e => setFormData({ ...formData, topics: e.target.value })} className="w-full bg-[#0a0e27] border border-[rgba(0,255,136,0.2)] rounded-lg p-3 text-white focus:border-[#00ff88] focus:outline-none" placeholder="DeFi, Market Trends, Security..." />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-mono text-[#a0a0a0] mb-2 uppercase tracking-wider">Accent Color</label>
                                        <div className="flex gap-2">
                                            {['#00ff88', '#00d4ff', '#ff006e', '#9b59b6', '#f1c40f', '#e74c3c'].map(c => (
                                                <button key={c} type="button" onClick={() => setFormData({ ...formData, color: c })} className={classNames("w-8 h-8 rounded-full border-2 transition-transform", formData.color === c ? "scale-110 border-white" : "border-transparent")} style={{ backgroundColor: c }} />
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-mono text-[#a0a0a0] mb-2 uppercase tracking-wider">Avatar Emoji</label>
                                        <input type="text" value={formData.emoji} onChange={e => setFormData({ ...formData, emoji: e.target.value })} maxLength={2} className="w-16 text-center bg-[#0a0e27] border border-[rgba(0,255,136,0.2)] rounded-lg p-2 text-xl text-white focus:border-[#00ff88] focus:outline-none" />
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-4 pt-6 border-t border-[rgba(0,255,136,0.2)]">
                                    <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-6 py-2 text-[#a0a0a0] hover:text-white uppercase tracking-wider text-sm transition-colors">Cancel</button>
                                    <NeonButton type="submit">Deploy Persona</NeonButton>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}

// Subcomponent
function PersonaCard({ persona, isActive, onSelect, onShare, className }: { persona: Persona, isActive: boolean, onSelect: () => void, onShare: () => void, className?: string }) {
    return (
        <div
            className={classNames(
                "bg-[rgba(26,31,58,0.8)] backdrop-blur-[20px] rounded-xl p-5 border transition-all duration-300 flex flex-col relative overflow-hidden group",
                isActive ? "border-[#00ff88] shadow-[0_0_20px_rgba(0,255,136,0.2)]" : "border-[rgba(0,255,136,0.2)] hover:border-[#00ff88]/50 hover:bg-[#1a1f3a]",
                className
            )}
        >
            {isActive && <div className="absolute top-0 right-0 w-16 h-16 bg-[#00ff88] opacity-10 blur-2xl rounded-full" />}

            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl bg-[rgba(26,31,58,0.5)] border" style={{ borderColor: `${persona.color}40` }}>
                        {persona.emoji}
                    </div>
                    <div>
                        <h3 className="text-white font-bold tracking-wide">{persona.name}</h3>
                        <span className="text-[10px] uppercase tracking-widest font-mono" style={{ color: persona.color }}>
                            {persona.analysis_style}
                        </span>
                    </div>
                </div>
                {persona.is_shared && <div className="bg-[#a0a0a0]/10 p-1.5 rounded text-[#a0a0a0]" title="Shared to Global Network"><Share2 className="w-3 h-3" /></div>}
            </div>

            <p className="text-[#a0a0a0] text-sm font-sans line-clamp-2 mb-4 flex-1">
                {persona.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
                {persona.topics.slice(0, 3).map(t => (
                    <span key={t} className="px-2 py-0.5 rounded bg-[#0a0e27] border border-[rgba(0,255,136,0.1)] text-[#a0a0a0] text-xs font-mono">{t}</span>
                ))}
                {persona.topics.length > 3 && <span className="text-[#a0a0a0] text-xs font-mono">+{persona.topics.length - 3}</span>}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-[rgba(0,255,136,0.1)] mt-auto mt-4">
                <div className="text-xs font-mono text-[#a0a0a0]">Uses: {persona.usage_count}</div>
                <div className="flex space-x-2">
                    {!persona.is_shared && (
                        <button onClick={(e) => { e.stopPropagation(); onShare(); }} className="p-2 rounded text-[#a0a0a0] hover:text-[#00d4ff] hover:bg-[#00d4ff]/10 transition-colors">
                            <Share2 className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        onClick={onSelect}
                        className={classNames(
                            "px-3 py-1.5 rounded flex items-center text-xs font-bold uppercase tracking-wider transition-all",
                            isActive ? "bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/50" : "bg-[rgba(26,31,58,0.5)] border border-[rgba(0,255,136,0.2)] text-[#a0a0a0] hover:text-white"
                        )}
                    >
                        {isActive ? <><Check className="w-3 h-3 mr-1" /> Active</> : "Apply"}
                    </button>
                </div>
            </div>
        </div>
    );
}
