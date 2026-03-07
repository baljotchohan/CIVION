'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';

const mockPersonas = [
    { id: 'p_01', name: 'Warren Buffett', description: 'Value investing analysis style. Focuses on long-term fundamentals.', style: 'conservative', shared: true, color: 'from-emerald-500/20 to-teal-500/20' },
    { id: 'p_02', name: 'Elon Musk', description: 'Disruptive technology focus. High-risk, high-reward analysis.', style: 'aggressive', shared: true, color: 'from-blue-500/20 to-cyan-500/20' },
    { id: 'p_03', name: 'Satoshi Nakamoto', description: 'Cryptography and decentralization perspective.', style: 'analytical', shared: true, color: 'from-orange-500/20 to-amber-500/20' },
    { id: 'p_04', name: 'Ada Lovelace', description: 'Technical precision with creative insight.', style: 'balanced', shared: false, color: 'from-purple-500/20 to-pink-500/20' },
    { id: 'p_05', name: 'Sun Tzu', description: 'Strategic warfare principles applied to market intelligence.', style: 'strategic', shared: false, color: 'from-red-500/20 to-rose-500/20' },
];

export default function PersonasPage() {
    const [showCreate, setShowCreate] = useState(false);

    return (
        <div className="p-6 space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="page-title">🎭 Analysis Personas</h2>
                    <p className="page-subtitle">Custom AI personalities for unique analysis perspectives</p>
                </div>
                <button className="btn-primary" onClick={() => setShowCreate(!showCreate)}>+ Create Persona</button>
            </header>

            {showCreate && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="sci-fi-card p-6">
                    <h3 className="text-sm font-mono text-accent-primary mb-4">CREATE NEW PERSONA</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-xs text-text-tertiary">Name</label><input className="input-field mt-1" placeholder="Persona name..." /></div>
                        <div><label className="text-xs text-text-tertiary">Style</label><select className="input-field mt-1"><option>analytical</option><option>aggressive</option><option>conservative</option><option>balanced</option><option>strategic</option></select></div>
                        <div className="col-span-2"><label className="text-xs text-text-tertiary">System Prompt</label><textarea className="input-field mt-1 h-20" placeholder="Define the persona's analysis approach..." /></div>
                        <div className="col-span-2"><label className="text-xs text-text-tertiary">Description</label><input className="input-field mt-1" placeholder="Brief description..." /></div>
                    </div>
                    <div className="flex space-x-3 mt-4"><button className="btn-primary">Create</button><button className="btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button></div>
                </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockPersonas.map((persona, i) => (
                    <motion.div key={persona.id} className={`sci-fi-card p-5 bg-gradient-to-br ${persona.color}`} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                        <div className="flex justify-between items-start mb-3">
                            <div className="w-10 h-10 rounded-full bg-bg-tertiary flex items-center justify-center text-xl">🎭</div>
                            {persona.shared && <span className="badge badge-green text-[10px]">shared</span>}
                        </div>
                        <h3 className="font-bold text-lg">{persona.name}</h3>
                        <p className="text-xs text-text-secondary mt-1">{persona.description}</p>
                        <div className="flex justify-between items-center mt-4">
                            <span className="badge badge-purple">{persona.style}</span>
                            <div className="flex space-x-2">
                                <button className="btn-secondary text-[10px] py-1 px-3">Analyze</button>
                                <button className="btn-secondary text-[10px] py-1 px-3">Edit</button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
