'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Share2, Users, Calendar, Hash, ArrowRight } from 'lucide-react';

export interface Persona {
    id: string;
    name: string;
    description: string;
    analysis_style: string;
    sample_analysis: string;
    topics: string[];
    usage_count: number;
    created_at: string;
    primary_color?: string; // e.g. '#00ff88'
    avatar_emoji?: string; // e.g. '🤖'
}

interface PersonaCardProps {
    persona: Persona;
    onApply?: (id: string) => void;
    onShare?: (id: string) => void;
}

export const PersonaCard: React.FC<PersonaCardProps> = ({ persona, onApply, onShare }) => {
    const color = persona.primary_color || '#00d4ff'; // Default to cyan
    const emoji = persona.avatar_emoji || '🤖';

    return (
        <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative rounded-xl border bg-[rgba(26,31,58,0.8)] backdrop-blur-[20px] p-6 shadow-lg group overflow-hidden flex flex-col h-full"
            style={{
                borderColor: `${color}30`,
            }}
        >
            {/* Background Glow */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(circle at top right, ${color} 0%, transparent 70%)` }}
            />

            {/* Header */}
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center space-x-4">
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inner border border-white/5"
                        style={{ backgroundColor: `${color}20`, boxShadow: `inset 0 0 10px ${color}10` }}
                    >
                        {emoji}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold font-sans text-white decoration-2 underline-offset-4 group-hover:underline" style={{ textDecorationColor: color }}>
                            {persona.name}
                        </h3>
                        <div className="text-xs font-mono text-[#a0a0a0] flex items-center mt-1">
                            <Zap className="w-3 h-3 mr-1" style={{ color }} />
                            {persona.analysis_style}
                        </div>
                    </div>
                </div>
            </div>

            {/* Description */}
            <p className="text-sm font-sans text-gray-300 mb-4 line-clamp-2 relative z-10 flex-grow">
                {persona.description}
            </p>

            {/* Sample Analysis Preview */}
            <div className="bg-[#1a1f3a]/60 rounded-lg p-3 border border-white/5 mb-4 relative z-10 group-hover:bg-[#1a1f3a]/80 transition-colors">
                <span className="text-[10px] font-mono text-[#a0a0a0] uppercase tracking-wider mb-1 block">Sample Output</span>
                <p className="text-xs font-mono text-gray-400 italic line-clamp-2 leading-relaxed">
                    "{persona.sample_analysis}"
                </p>
            </div>

            {/* Topics / Tags */}
            <div className="flex flex-wrap gap-2 mb-5 relative z-10">
                {persona.topics.slice(0, 3).map((topic, i) => (
                    <span
                        key={i}
                        className="flex items-center text-[10px] font-mono px-2 py-1 rounded bg-black/30 border border-white/5 text-[#a0a0a0]"
                    >
                        <Hash className="w-2.5 h-2.5 mr-0.5 opacity-50" />
                        {topic}
                    </span>
                ))}
                {persona.topics.length > 3 && (
                    <span className="text-[10px] font-mono px-2 py-1 rounded bg-black/30 border border-white/5 text-[#a0a0a0]">
                        +{persona.topics.length - 3}
                    </span>
                )}
            </div>

            {/* Footer Stats & Actions */}
            <div className="pt-4 border-t border-white/10 mt-auto flex items-center justify-between relative z-10">
                {/* Stats */}
                <div className="flex items-center space-x-4">
                    <div className="flex items-center text-xs font-mono text-[#a0a0a0]" title="Usage Count">
                        <Users className="w-3 h-3 mr-1" />
                        {persona.usage_count.toLocaleString()}
                    </div>
                    <div className="flex items-center text-xs font-mono text-[#a0a0a0]" title="Created Date">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(persona.created_at).toLocaleDateString([], { month: 'short', year: 'numeric' })}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                    {onShare && (
                        <button
                            onClick={() => onShare(persona.id)}
                            className="p-2 rounded-lg bg-black/20 hover:bg-black/40 border border-transparent hover:border-white/10 text-[#a0a0a0] hover:text-white transition-all"
                            title="Share to Network"
                        >
                            <Share2 className="w-4 h-4" />
                        </button>
                    )}

                    {onApply && (
                        <button
                            onClick={() => onApply(persona.id)}
                            className="flex items-center px-3 py-1.5 rounded-lg text-sm font-bold font-sans transition-all hover:scale-105 active:scale-95"
                            style={{
                                backgroundColor: `${color}20`,
                                color: color,
                                border: `1px solid ${color}50`,
                                boxShadow: `0 0 10px ${color}20`
                            }}
                        >
                            Apply
                            <ArrowRight className="w-3 h-3 ml-1.5" />
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};
