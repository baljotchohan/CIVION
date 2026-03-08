'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Clock, CheckCircle2, XCircle, ChevronDown, ChevronUp, FileText } from 'lucide-react';

export interface Prediction {
    id: string;
    title: string;
    description: string;
    probability: number;
    timeframe: string;
    evidence: string[];
    created_at: string;
    resolved: boolean;
    outcome: boolean | null;
    accuracy: number | null;
    shared_count: number;
}

interface PredictionCardProps {
    prediction: Prediction;
    onShare?: (id: string) => void;
}

const getProbabilityColor = (prob: number) => {
    if (prob >= 0.8) return '#00ff88'; // High confidence - Green
    if (prob >= 0.5) return '#00d4ff'; // Medium - Cyan
    return '#ff006e'; // Low - Pink
};

export const PredictionCard: React.FC<PredictionCardProps> = ({ prediction, onShare }) => {
    const [expanded, setExpanded] = useState(false);
    const probColor = getProbabilityColor(prediction.probability);

    return (
        <motion.div
            layout
            className="rounded-xl border bg-[rgba(26,31,58,0.8)] backdrop-blur-[20px] shadow-lg overflow-hidden flex flex-col"
            style={{
                borderColor: `${probColor}30`,
                boxShadow: `0 0 20px ${probColor}10`
            }}
        >
            {/* Top Banner (Status) */}
            <div className="h-1 w-full" style={{ backgroundColor: probColor }} />

            <div className="p-5 flex-1 flex flex-col">
                {/* Header section */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 pr-4">
                        <h3 className="font-sans font-bold text-lg text-white leading-tight mb-2">
                            {prediction.title}
                        </h3>
                        <div className="flex items-center text-xs font-mono text-[#a0a0a0] uppercase tracking-wider space-x-3">
                            <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {prediction.timeframe}
                            </span>
                            <span>•</span>
                            <span>
                                {new Date(prediction.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    </div>

                    {/* Probability Circle */}
                    <div className="flex flex-col items-center justify-center flex-shrink-0">
                        <div
                            className="w-14 h-14 rounded-full flex items-center justify-center border-4 font-bold font-mono text-lg shadow-lg relative"
                            style={{
                                borderColor: `${probColor}50`,
                                color: probColor,
                                backgroundColor: `${probColor}10`
                            }}
                        >
                            {(prediction.probability * 100).toFixed(0)}<span className="text-xs">%</span>

                            {/* Pulse effect for unresolved high prob */}
                            {!prediction.resolved && prediction.probability >= 0.8 && (
                                <span
                                    className="absolute inset-0 rounded-full animate-ping opacity-30"
                                    style={{ backgroundColor: probColor }}
                                />
                            )}
                        </div>
                        <span className="text-[10px] text-[#a0a0a0] font-mono uppercase mt-1">Probability</span>
                    </div>
                </div>

                {/* Short Description */}
                <p className="text-sm font-sans text-gray-300 leading-relaxed mb-4 line-clamp-2">
                    {prediction.description}
                </p>

                {/* Timeline Bar UI */}
                <div className="mt-auto mb-4">
                    <div className="flex justify-between text-[10px] font-mono uppercase text-[#a0a0a0] mb-1">
                        <span>Now</span>
                        <span style={{ color: probColor }}>{prediction.timeframe} target</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#1a1f3a] rounded-full overflow-hidden relative">
                        <motion.div
                            className="absolute top-0 left-0 h-full rounded-full"
                            style={{ backgroundColor: probColor }}
                            initial={{ width: 0 }}
                            animate={{ width: "60%" }} // Visual representation, would calculate from actual time elapsed
                            transition={{ duration: 1.5, delay: 0.2 }}
                        />
                    </div>
                </div>

                {/* Actions Row */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-2">
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="flex items-center text-xs font-mono text-[#a0a0a0] hover:text-white transition-colors"
                    >
                        {expanded ? (
                            <><ChevronUp className="w-4 h-4 mr-1" /> Hide Details</>
                        ) : (
                            <><ChevronDown className="w-4 h-4 mr-1" /> View Evidence</>
                        )}
                    </button>

                    <div className="flex items-center space-x-3">
                        {prediction.resolved && (
                            <div className={`flex items-center text-xs font-bold px-2 py-1 rounded bg-opacity-20 ${prediction.outcome ? 'text-[#00ff88] bg-[#00ff88]' : 'text-[#ff006e] bg-[#ff006e]'}`}>
                                {prediction.outcome ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                                {prediction.outcome ? 'Verified True' : 'Verified False'}
                            </div>
                        )}

                        <button
                            onClick={() => onShare && onShare(prediction.id)}
                            className="p-1.5 rounded-md hover:bg-[#00d4ff]/10 text-[#00d4ff] transition-colors border border-transparent hover:border-[#00d4ff]/30 flex items-center text-xs font-mono"
                        >
                            <Share2 className="w-3 h-3 mr-1" />
                            {prediction.shared_count}
                        </button>
                    </div>
                </div>

                {/* Expanded View */}
                <AnimatePresence>
                    {expanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="pt-4 pb-2 border-t border-white/5 mt-4 space-y-4">

                                {/* Full Description */}
                                <div>
                                    <h4 className="text-[10px] font-mono text-[#a0a0a0] uppercase tracking-wider mb-2">Detailed Analysis</h4>
                                    <p className="text-sm text-gray-300 font-sans leading-relaxed">
                                        {prediction.description}
                                    </p>
                                </div>

                                {/* Evidence List */}
                                <div>
                                    <h4 className="text-[10px] font-mono text-[#a0a0a0] uppercase tracking-wider mb-2">Sourced Evidence ({prediction.evidence.length})</h4>
                                    <ul className="space-y-2">
                                        {prediction.evidence.map((ev, i) => (
                                            <li key={i} className="flex items-start bg-[#1a1f3a]/50 p-2 rounded border border-white/5">
                                                <FileText className="w-3 h-3 text-[#00d4ff] mt-0.5 mr-2 flex-shrink-0" />
                                                <span className="text-xs font-mono text-gray-300">
                                                    {ev}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Accuracy Metrics if resolved */}
                                {prediction.resolved && prediction.accuracy !== null && (
                                    <div className="bg-[#1a1f3a] p-3 rounded-lg border border-[#00ff88]/20 flex justify-between items-center">
                                        <span className="text-xs font-mono text-[#a0a0a0] uppercase tracking-wider">Historical Accuracy</span>
                                        <span className="text-sm font-bold text-[#00ff88]">
                                            {(prediction.accuracy * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </motion.div>
    );
};
