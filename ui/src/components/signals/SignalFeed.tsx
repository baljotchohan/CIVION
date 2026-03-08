'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, ChevronDown, ChevronUp, Github, FileText, Globe, Activity, TrendingUp, AlertTriangle } from 'lucide-react';
import { useWebSocket } from '@/hooks/useWebSocket';

export interface Signal {
    id: string;
    source: string;
    title: string;
    confidence: number;
    timestamp: string;
    strength: number;
    signal_type: string;
    evidence?: string[];
}

interface SignalFeedProps {
    signals: Signal[];
    onFilter?: (filters: any) => void;
}

const getSourceIcon = (source: string) => {
    const s = source.toLowerCase();
    if (s.includes('github') || s.includes('repo')) return <Github className="w-4 h-4" />;
    if (s.includes('arxiv') || s.includes('research')) return <FileText className="w-4 h-4" />;
    if (s.includes('market') || s.includes('trend')) return <TrendingUp className="w-4 h-4" />;
    if (s.includes('threat') || s.includes('cyber')) return <AlertTriangle className="w-4 h-4" />;
    return <Globe className="w-4 h-4" />;
};

const getStrengthColor = (strength: number) => {
    if (strength >= 0.8) return '#00ff88'; // high
    if (strength >= 0.5) return '#00d4ff'; // med
    return '#ff006e'; // low
};

export const SignalFeed: React.FC<SignalFeedProps> = ({ signals, onFilter }) => {
    const { subscribe } = useWebSocket();
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // Local filters state just for UI
    const [activeType, setActiveType] = useState<string | null>(null);

    // Merge prop signals with live incoming WebSocket signals (if any)
    const [liveSignals, setLiveSignals] = useState<Signal[]>([]);

    React.useEffect(() => {
        const handleNewSignal = (data: any) => {
            setLiveSignals(prev => [data as Signal, ...prev].slice(0, 50)); // Keep last 50
        };
        const unsub = subscribe('signal_detected', handleNewSignal);
        return () => unsub();
    }, [subscribe]);

    // Combine and sort
    const allSignals = useMemo(() => {
        // Basic deduplication
        const map = new Map<string, Signal>();
        [...signals, ...liveSignals].forEach(s => map.set(s.id, s));
        const merged = Array.from(map.values())
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        // Apply local filter
        if (activeType) {
            return merged.filter(s => s.signal_type === activeType);
        }
        return merged;
    }, [signals, liveSignals, activeType]);

    const uniqueTypes = useMemo(() => {
        return Array.from(new Set(allSignals.map(s => s.signal_type))).filter(Boolean);
    }, [allSignals]);

    return (
        <div className="flex flex-col h-full bg-[rgba(26,31,58,0.8)] backdrop-blur-[20px] rounded-xl border border-[#00d4ff]/20 shadow-[0_0_20px_rgba(0,212,255,0.1)] overflow-hidden">

            {/* Header and Filters */}
            <div className="p-5 border-b border-white/10 bg-[#1a1f3a] z-10 shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold font-sans text-white flex items-center">
                        <Activity className="w-5 h-5 mr-2 text-[#00ff88]" />
                        Live Intelligence Feed
                    </h2>
                    <div className="text-xs font-mono text-[#a0a0a0] flex items-center bg-black/30 px-3 py-1.5 rounded-full border border-white/5">
                        <span className="w-2 h-2 rounded-full bg-[#00ff88] mr-2 animate-pulse" />
                        {allSignals.length} signals
                    </div>
                </div>

                {/* Filters Panel */}
                <div className="flex flex-wrap items-center gap-2">
                    <div className="text-[10px] font-mono uppercase text-[#a0a0a0] mr-2 flex items-center">
                        <Filter className="w-3 h-3 mr-1" />
                        Filter by Type:
                    </div>

                    <button
                        onClick={() => setActiveType(null)}
                        className={`px-3 py-1 rounded-full text-xs font-mono transition-colors border ${!activeType ? 'bg-[#00d4ff]/20 text-[#00d4ff] border-[#00d4ff]/50' : 'bg-transparent text-[#a0a0a0] border-white/10 hover:border-white/30 hover:text-white'}`}
                    >
                        All
                    </button>

                    {uniqueTypes.map(type => (
                        <button
                            key={type}
                            onClick={() => setActiveType(type)}
                            className={`px-3 py-1 rounded-full text-xs font-mono uppercase transition-colors border ${activeType === type ? 'bg-[#00d4ff]/20 text-[#00d4ff] border-[#00d4ff]/50' : 'bg-transparent text-[#a0a0a0] border-white/10 hover:border-white/30 hover:text-white'}`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Feed List */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <AnimatePresence>
                    {allSignals.map((signal, idx) => {
                        const isExpanded = expandedId === signal.id;
                        const color = getStrengthColor(signal.strength);

                        return (
                            <motion.div
                                key={signal.id}
                                layout
                                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3 }}
                                className="mb-4 bg-[#1a1f3a]/80 backdrop-blur-md rounded-xl border group hover:shadow-lg transition-all cursor-pointer overflow-hidden"
                                style={{
                                    borderColor: isExpanded ? `${color}50` : 'rgba(255,255,255,0.05)',
                                    boxShadow: isExpanded ? `0 0 20px ${color}20` : 'none'
                                }}
                                onClick={() => setExpandedId(isExpanded ? null : signal.id)}
                            >
                                {/* collapsed row */}
                                <div className="p-4 flex items-center justify-between">
                                    {/* Left area: Icon & Title */}
                                    <div className="flex items-center space-x-4 flex-1 min-w-0 pr-4">
                                        <div
                                            className="w-10 h-10 rounded-full flex items-center justify-center border bg-black/20 flex-shrink-0"
                                            style={{ borderColor: `${color}30`, color: color }}
                                        >
                                            {getSourceIcon(signal.source)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <span className="text-[10px] font-mono text-[#a0a0a0] uppercase tracking-wider bg-black/30 px-2 py-0.5 rounded border border-white/5">
                                                    {signal.source}
                                                </span>
                                                <span className="text-[10px] text-gray-500 font-mono">
                                                    {new Date(signal.timestamp).toLocaleTimeString()}
                                                </span>

                                                {/* "New" bounce indicator if it arrived within the last minute */}
                                                {(new Date().getTime() - new Date(signal.timestamp).getTime()) < 60000 && (
                                                    <span className="text-[10px] text-[#00ff88] animate-bounce font-bold">New</span>
                                                )}
                                            </div>
                                            <h4 className="text-sm font-sans font-medium text-white line-clamp-1 group-hover:text-cyan-300 transition-colors">
                                                {signal.title}
                                            </h4>
                                        </div>
                                    </div>

                                    {/* Right area: Badge */}
                                    <div className="flex items-center space-x-4 flex-shrink-0">
                                        {/* Badge */}
                                        <div
                                            className="px-3 py-1.5 rounded-lg border flex flex-col items-end shadow-inner"
                                            style={{ backgroundColor: `${color}10`, borderColor: `${color}30` }}
                                        >
                                            <span className="text-[10px] font-mono text-white/50 uppercase leading-none mb-1">Strength</span>
                                            <span className="text-sm font-bold font-mono leading-none" style={{ color }}>
                                                {(signal.strength * 100).toFixed(0)}%
                                            </span>
                                        </div>

                                        {/* Chevron */}
                                        <div className="text-[#a0a0a0] group-hover:text-white transition-colors">
                                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Details Panel */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                        >
                                            <div className="px-4 pb-4 pt-2 border-t border-white/5 mx-4 flex flex-col space-y-4">

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <span className="text-[10px] font-mono uppercase text-[#a0a0a0] mb-1 block">Signal Confidence</span>
                                                        <div className="flex items-center">
                                                            <div className="h-1.5 flex-1 bg-black/50 rounded-full mr-3 overflow-hidden">
                                                                <div className="h-full rounded-full" style={{ width: `${signal.confidence * 100}%`, backgroundColor: color }} />
                                                            </div>
                                                            <span className="text-xs font-mono text-white font-bold">{(signal.confidence * 100).toFixed(0)}%</span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] font-mono uppercase text-[#a0a0a0] mb-1 block">Signal Type</span>
                                                        <span className="text-xs font-mono text-white bg-white/5 px-2 py-1 rounded uppercase tracking-wider">{signal.signal_type}</span>
                                                    </div>
                                                </div>

                                                {signal.evidence && signal.evidence.length > 0 && (
                                                    <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                                                        <span className="text-[10px] font-mono uppercase text-[#a0a0a0] mb-2 block">Extracted Evidence</span>
                                                        <ul className="space-y-2">
                                                            {signal.evidence.map((ev, i) => (
                                                                <li key={i} className="text-xs font-sans text-gray-300 leading-relaxed flex items-start">
                                                                    <span className="text-[#00d4ff] mr-2">•</span> {ev}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {!signal.evidence && (
                                                    <div className="text-xs font-mono italic text-gray-500 py-2">
                                                        Awaiting synthesizer detail extraction...
                                                    </div>
                                                )}

                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}

                    {allSignals.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-500 font-mono text-sm space-y-2">
                            <Activity className="w-8 h-8 opacity-50" />
                            <span>No signals detected matching filters.</span>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
