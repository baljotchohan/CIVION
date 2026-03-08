'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebSocket } from '../../hooks/useWebSocket';
import { getReasoningLoops, startReasoningSession } from '../../lib/api';
import { DebateMessage } from '../../types';
import { DebateViewer } from '../../components/reasoning/DebateViewer';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { SkeletonCard } from '../../components/ui/SkeletonCard';
import { NeonButton } from '../../components/ui/NeonButton';
import { classNames } from '../../lib/utils';
import {
    Brain, Plus, History, Activity
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

export default function ReasoningPage() {
    const { subscribe } = useWebSocket();
    const [debates, setDebates] = useState<any[]>([]);
    const [activeDebateId, setActiveDebateId] = useState<string | null>(null);
    const [liveMessages, setLiveMessages] = useState<DebateMessage[]>([]);
    const [confidenceData, setConfidenceData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const history = await getReasoningLoops();
                setDebates(history);
                if (history.length > 0 && !activeDebateId) {
                    setActiveDebateId((history[0] as any).id);
                }
            } catch (error) {
                console.error("Failed to load reasoning history");
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    useEffect(() => {
        if (!activeDebateId) return;

        // Reset live view when switching debates (in real app, fetch existing messages for this ID)
        setLiveMessages([]);
        setConfidenceData([]);

        const handleReasoningUpdate = (data: any) => {
            if (data.loop_id === activeDebateId) {
                setLiveMessages(prev => [...prev, data.message as DebateMessage]);
            }
        };

        const handleConfidenceChange = (data: any) => {
            if (data.loop_id === activeDebateId) {
                setConfidenceData(prev => [...prev, {
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    confidence: data.new_confidence * 100
                }].slice(-20)); // Keep last 20
            }
        };

        const unsubReasoning = subscribe('reasoning_updated', handleReasoningUpdate);
        const unsubConfidence = subscribe('confidence_changed', handleConfidenceChange);

        return () => {
            unsubReasoning();
            unsubConfidence();
        };
    }, [activeDebateId, subscribe]);

    const activeDebate = debates.find(d => d.id === activeDebateId);
    const isLive = activeDebate?.status === 'running';

    return (
        <div className="h-screen flex flex-col bg-[#0a0e27] text-white overflow-hidden p-6 space-y-6">

            {/* HEADER */}
            <header className="flex justify-between items-center bg-[rgba(26,31,58,0.8)] backdrop-blur-[20px] p-6 rounded-xl border border-[rgba(0,255,136,0.2)] shadow-[0_0_20px_rgba(0,255,136,0.1)] shrink-0">
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-[rgba(0,255,136,0.1)] border border-[#00ff88]/50 flex items-center justify-center shadow-[0_0_15px_rgba(0,255,136,0.2)]">
                        <Brain className="w-6 h-6 text-[#00ff88]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-sans tracking-widest font-bold text-white uppercase">Reasoning Engine</h1>
                        <p className="text-[#a0a0a0] font-sans text-sm mt-1">Multi-agent cognitive architecture & debate</p>
                    </div>
                </div>

                <NeonButton onClick={() => setIsModalOpen(true)} className="px-6 py-3">
                    <Plus className="w-4 h-4 mr-2" />
                    Start New Reasoning
                </NeonButton>
            </header>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex gap-6 overflow-hidden">

                {/* LEFT SIDEBAR: HISTORY */}
                <div className="w-80 flex flex-col bg-[rgba(26,31,58,0.8)] rounded-xl border border-[rgba(0,255,136,0.2)] backdrop-blur-[20px] overflow-hidden">
                    <div className="p-4 border-b border-[rgba(0,255,136,0.2)] bg-[#1a1f3a]/80 flex items-center space-x-2 shrink-0">
                        <History className="w-4 h-4 text-[#00d4ff]" />
                        <h2 className="text-sm font-sans uppercase tracking-widest text-white">Session History</h2>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} lines={2} className="p-4" />)
                        ) : debates.length === 0 ? (
                            <div className="text-center text-[#a0a0a0] mt-10 p-4 border border-dashed border-[#a0a0a0]/30 rounded-lg">
                                No past sessions found.
                            </div>
                        ) : (
                            debates.map(debate => (
                                <motion.div
                                    key={debate.id}
                                    whileHover={{ scale: 1.02, x: 5 }}
                                    onClick={() => setActiveDebateId(debate.id)}
                                    className={classNames(
                                        "p-4 rounded-lg border cursor-pointer transition-colors relative overflow-hidden",
                                        activeDebateId === debate.id
                                            ? "bg-[rgba(0,255,136,0.1)] border-[#00ff88]/50"
                                            : "bg-[rgba(26,31,58,0.5)] border-[rgba(0,255,136,0.1)] hover:bg-[#1a1f3a]"
                                    )}
                                >
                                    {activeDebateId === debate.id && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00ff88] shadow-[0_0_10px_#00ff88]" />
                                    )}
                                    <h3 className="text-white font-sans text-sm font-bold truncate pr-14" title={debate.topic}>{debate.topic}</h3>
                                    <div className="flex items-center justify-between mt-3">
                                        <StatusBadge status={debate.status} />
                                        {debate.final_confidence && (
                                            <span className="text-xs font-mono text-[#00ff88]">
                                                {(debate.final_confidence * 100).toFixed(0)}% Conf
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-[10px] text-[#a0a0a0] font-mono mt-2" suppressHydrationWarning>
                                        {new Date(debate.created_at).toLocaleDateString()}
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                {/* CENTER & RIGHT AREAS */}
                <div className="flex-1 flex flex-col gap-6 overflow-hidden">

                    {/* CENTER: DEBATE VIEWER */}
                    <div className="flex-1 overflow-hidden">
                        <DebateViewer debate={liveMessages} isActive={isLive} />
                    </div>

                    {/* BOTTOM: CONFIDENCE TIMELINE CHART */}
                    <div className="h-48 bg-[rgba(26,31,58,0.8)] rounded-xl border border-[rgba(0,255,136,0.2)] backdrop-blur-[20px] p-4 flex flex-col shrink-0 relative overflow-hidden">
                        <div className="flex justify-between items-center mb-2 px-2">
                            <h3 className="text-sm font-sans uppercase tracking-widest text-[#a0a0a0] flex items-center">
                                <Activity className="w-4 h-4 mr-2" />
                                Confidence Trajectory
                            </h3>
                            {confidenceData.length > 0 && (
                                <div className="text-lg font-mono text-[#00ff88] font-bold">
                                    {confidenceData[confidenceData.length - 1].confidence.toFixed(1)}%
                                </div>
                            )}
                        </div>

                        <div className="flex-1 w-full relative z-10">
                            {confidenceData.length < 2 ? (
                                <div className="absolute inset-0 flex items-center justify-center text-[#a0a0a0] font-mono text-xs border border-dashed border-[#a0a0a0]/20 rounded m-4">
                                    Insufficient data points for chart
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={confidenceData}>
                                        <defs>
                                            <linearGradient id="glow" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#00ff88" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="time" hide />
                                        <YAxis domain={[0, 100]} hide />
                                        <RechartsTooltip
                                            contentStyle={{ backgroundColor: 'rgba(26,31,58,0.9)', borderColor: '#00ff88', borderRadius: '8px', color: '#fff', fontFamily: 'monospace' }}
                                            itemStyle={{ color: '#00ff88' }}
                                            formatter={(value: any) => [`${Number(value).toFixed(1)}%`, 'Confidence']}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="confidence"
                                            stroke="#00ff88"
                                            strokeWidth={3}
                                            dot={{ r: 4, fill: '#0a0e27', stroke: '#00ff88', strokeWidth: 2 }}
                                            activeDot={{ r: 6, fill: '#00ff88', stroke: '#fff' }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        {/* Glow background effect */}
                        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[rgba(0,255,136,0.1)] to-transparent pointer-events-none" />
                    </div>

                </div>
            </div>

            {/* START NEW REASONING MODAL */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-[#1a1f3a] border border-[#00ff88] rounded-xl shadow-[0_0_30px_rgba(0,255,136,0.2)] p-6 w-full max-w-lg"
                        >
                            <h2 className="text-xl tracking-widest uppercase font-bold text-[#00ff88] mb-4">Initialize Reasoning Goal</h2>
                            <p className="text-[#a0a0a0] font-sans text-sm mb-6">Enter a topic or hypothesis for the agent fleet to debate and synthesize.</p>

                            <textarea
                                className="w-full bg-[#0a0e27] border border-[#00ff88]/30 rounded-lg p-4 text-white font-sans min-h-[120px] focus:outline-none focus:border-[#00ff88] focus:shadow-[0_0_15px_rgba(0,255,136,0.2)] transition-all mb-6 placeholder-[#a0a0a0]/50"
                                placeholder="E.g., Evaluate the impact of quantum computing on modern cryptography within the next 5 years..."
                                autoFocus
                            />

                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2 text-[#a0a0a0] hover:text-white font-sans uppercase tracking-wider text-sm transition-colors"
                                >
                                    Cancel
                                </button>
                                <NeonButton onClick={() => setIsModalOpen(false)}>
                                    Execute
                                </NeonButton>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}
