'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Activity } from 'lucide-react';

export type ConfidenceAction = "verified" | "challenged" | "confirmed" | "verifying" | "rejected";

export interface ConfidenceStep {
    agent: string;
    action: ConfidenceAction;
    confidence_before: number;
    confidence_after: number;
    timestamp: string;
    reason: string;
}

interface ConfidenceCascadeProps {
    confidenceHistory: ConfidenceStep[];
    currentScore: number;
}

const getColorForScore = (score: number) => {
    if (score < 40) return 'rgb(255, 0, 110)'; // Accent Pink
    if (score < 70) return 'rgb(255, 214, 0)'; // Yellow
    return 'rgb(0, 255, 136)'; // Accent Green
};

const getIconForAction = (action: ConfidenceAction) => {
    switch (action) {
        case 'verified':
        case 'confirmed':
            return <CheckCircle2 className="w-5 h-5 text-[#00ff88]" />;
        case 'challenged':
        case 'rejected':
            return <XCircle className="w-5 h-5 text-[#ff006e]" />;
        case 'verifying':
        default:
            return <Activity className="w-5 h-5 text-[#00d4ff] animate-pulse" />;
    }
};

export const ConfidenceCascade: React.FC<ConfidenceCascadeProps> = ({ confidenceHistory, currentScore }) => {
    const [prevScore, setPrevScore] = useState(currentScore);
    const [displayScore, setDisplayScore] = useState(currentScore);

    useEffect(() => {
        if (currentScore !== prevScore) {
            setPrevScore(displayScore);
            setDisplayScore(currentScore);
        }
    }, [currentScore, prevScore, displayScore]);

    const delta = displayScore - prevScore;
    const isPositive = delta >= 0;

    const barColor = getColorForScore(displayScore * 100);

    return (
        <div className="w-full flex flex-col space-y-6">
            {/* Main Glassmorphism Card */}
            <div className="relative rounded-xl border border-[#00ff88]/20 bg-[rgba(26,31,58,0.8)] backdrop-blur-[20px] p-6 shadow-[0_0_20px_rgba(0,255,136,0.1)] overflow-hidden">

                {/* Header Info */}
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <h3 className="text-sm uppercase tracking-wider text-[#a0a0a0] mb-1 font-sans">System Confidence</h3>
                        <div className="flex items-center space-x-3">
                            <motion.span
                                key={displayScore}
                                initial={{ scale: 1.5, opacity: 0, color: barColor }}
                                animate={{ scale: 1, opacity: 1, color: barColor }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="text-4xl font-bold font-mono"
                            >
                                {(displayScore * 100).toFixed(1)}%
                            </motion.span>

                            <AnimatePresence mode="popLayout">
                                {delta !== 0 && (
                                    <motion.span
                                        key={delta}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className={`text-sm font-mono px-2 py-1 rounded-md bg-opacity-20 ${isPositive ? 'text-[#00ff88] bg-[#00ff88]' : 'text-[#ff006e] bg-[#ff006e]'
                                            }`}
                                    >
                                        {isPositive ? '+' : ''}{(delta * 100).toFixed(1)}%
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="text-right text-[#a0a0a0] text-sm font-mono">
                        <div>Prev: {(prevScore * 100).toFixed(1)}%</div>
                    </div>
                </div>

                {/* Animated Progress Bar */}
                <div className="h-4 w-full bg-[#1a1f3a] rounded-full overflow-hidden border border-[#00ff88]/10 relative">
                    <motion.div
                        className="absolute top-0 left-0 h-full rounded-full"
                        initial={{ width: `${prevScore * 100}%`, backgroundColor: getColorForScore(prevScore * 100) }}
                        animate={{ width: `${displayScore * 100}%`, backgroundColor: barColor }}
                        transition={{ type: "spring", stiffness: 50, damping: 15 }}
                        style={{
                            boxShadow: `0 0 15px ${barColor}`
                        }}
                    />
                </div>
            </div>

            {/* History Timeline */}
            <div className="flex flex-col space-y-3">
                <AnimatePresence>
                    {confidenceHistory.map((step, idx) => (
                        <motion.div
                            key={idx + step.timestamp}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1, type: "spring" }}
                            className="rounded-xl border border-[#00ff88]/20 bg-[rgba(26,31,58,0.5)] backdrop-blur-[10px] p-4 flex items-center justify-between group hover:shadow-[0_0_15px_rgba(0,255,136,0.15)] transition-shadow overflow-hidden"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="p-2 rounded-full bg-[#1a1f3a] border border-[#00ff88]/10">
                                    {getIconForAction(step.action)}
                                </div>
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <span className="font-bold text-[#ffffff] font-sans">{step.agent}</span>
                                        <span className="text-xs text-[#a0a0a0] font-mono px-2 py-0.5 rounded-full border border-white/5 bg-white/5 uppercase tracking-wider">
                                            {step.action}
                                        </span>
                                    </div>
                                    <p className="text-sm text-[#a0a0a0] mt-1 font-sans line-clamp-1">{step.reason}</p>
                                </div>
                            </div>

                            <div className="flex flex-col items-end">
                                <div className="font-mono text-sm mb-1">
                                    <span className="text-white">{(step.confidence_after * 100).toFixed(0)}%</span>
                                </div>
                                <div className="text-xs text-[#a0a0a0] font-mono opacity-60" suppressHydrationWarning>
                                    {new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};
