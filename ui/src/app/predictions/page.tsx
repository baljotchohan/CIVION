'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useSystemState } from '../../hooks/useSystemState';
import { useAliveState } from '../../hooks/useAliveState';
import { getPredictions, analyzePrediction } from '../../lib/api';
import { PredictionCard } from '../../components/predictions/PredictionCard';
import { NeonButton } from '../../components/ui/NeonButton';
import { SkeletonCard } from '../../components/ui/SkeletonCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { DemoModeBanner } from '../../components/ui/DemoModeBanner';
import { classNames } from '../../lib/utils';
import { Target, TrendingUp, Sparkles, Filter, Search } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Prediction } from '../../types';

export default function PredictionsPage() {
    const { subscribe } = useWebSocket();
    const { systemState } = useSystemState();
    const { dataMode } = useAliveState();
    const [predictions, setPredictions] = useState<Prediction[]>([]);
    const [loading, setLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [goalText, setGoalText] = useState('');

    // Filters
    const [timeframe, setTimeframe] = useState('All');
    const [probability, setProbability] = useState(0);
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => {
        const fetchAll = async () => {
            if (dataMode === 'empty') return;
            try {
                const data = await getPredictions();
                setPredictions(data);
            } catch (err) {
                console.error("Failed to load predictions");
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [dataMode]);

    useEffect(() => {
        if (dataMode === 'empty') return;
        const handleNewPrediction = (data: any) => {
            setPredictions(prev => [data as Prediction, ...prev]);
        };
        const unsub = subscribe('prediction_made', handleNewPrediction);
        return () => unsub();
    }, [subscribe, dataMode]);

    const handleGenerate = async () => {
        if (!goalText) return;
        setIsGenerating(true);
        try {
            await analyzePrediction(goalText);
            setIsModalOpen(false);
            setGoalText('');
        } catch (e) {
            console.error(e);
        } finally {
            setIsGenerating(false);
        }
    };

    const filtered = predictions.filter(p => {
        if (p.probability * 100 < probability) return false;
        if (statusFilter === 'Active' && p.resolved) return false;
        if (statusFilter === 'Resolved' && !p.resolved) return false;
        if (statusFilter === 'Accurate' && (!p.resolved || p.outcome !== true)) return false;
        return true;
    });

    // Mock Accuracy Data for Chart
    const accuracyData = [
        { day: 'Mon', acc: 82 }, { day: 'Tue', acc: 85 }, { day: 'Wed', acc: 81 },
        { day: 'Thu', acc: 88 }, { day: 'Fri', acc: 89 }, { day: 'Sat', acc: 91 }, { day: 'Sun', acc: 94 }
    ];

    return (
        <div className="min-h-screen bg-[#0a0e27] text-white p-6 space-y-6 flex flex-col pt-16 lg:pt-6">
            <DemoModeBanner />

            {dataMode === 'empty' ? (
                <EmptyState
                    health={systemState.health}
                    icon={<Target className="w-8 h-8" />}
                    title="Predictive Engine Offline"
                    message="The forecasting system requires historical data and active API keys to generate insights."
                />
            ) : (
                <>
                    {/* HEADER */}
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[rgba(26,31,58,0.8)] backdrop-blur-[20px] p-6 rounded-xl border border-[rgba(0,255,136,0.2)] shadow-[0_0_20px_rgba(0,255,136,0.1)] gap-4 shrink-0">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-xl bg-[rgba(155,89,182,0.1)] border border-[#9b59b6]/50 flex items-center justify-center shadow-[0_0_15px_rgba(155,89,182,0.2)] shrink-0">
                                <Target className="w-6 h-6 text-[#9b59b6]" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-sans tracking-widest font-bold text-white uppercase">Predictions</h1>
                                <p className="text-[#a0a0a0] font-sans text-sm mt-1">High-probability multi-signal forecasting</p>
                            </div>
                        </div>

                        <NeonButton variant="primary" onClick={() => setIsModalOpen(true)} className="px-6 py-2 whitespace-nowrap">
                            <Sparkles className="w-4 h-4 mr-2" /> Generate New
                        </NeonButton>
                    </header>

                    {/* TOP ROW: CHART AND FILTER BAR */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 shrink-0">
                        {/* ACCURACY CHART */}
                        <div className="lg:col-span-1 bg-[rgba(26,31,58,0.8)] rounded-xl border border-[rgba(0,255,136,0.2)] backdrop-blur-[20px] p-6 shadow-lg h-64 flex flex-col hidden sm:flex">
                            <h3 className="text-sm font-sans uppercase tracking-widest text-white flex items-center mb-4 shrink-0">
                                <TrendingUp className="w-4 h-4 mr-2 text-[#9b59b6]" /> 7D Accuracy Engine
                            </h3>
                            <div className="flex-1 w-full relative min-h-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={accuracyData}>
                                        <defs>
                                            <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#00ff88" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="day" hide />
                                        <YAxis domain={['auto', 'auto']} hide />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1a1f3a', borderColor: '#00ff88', borderRadius: '8px' }}
                                            formatter={(v: any) => [`${v}%`, 'Accuracy']}
                                        />
                                        <Area type="monotone" dataKey="acc" stroke="#00ff88" strokeWidth={2} fillOpacity={1} fill="url(#colorAcc)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* FILTER BAR */}
                        <div className="lg:col-span-2 bg-[rgba(26,31,58,0.8)] rounded-xl border border-[rgba(0,255,136,0.2)] backdrop-blur-[20px] p-6 shadow-lg flex flex-col justify-center space-y-6">
                            <div className="flex items-center space-x-2 text-[#a0a0a0] uppercase font-sans tracking-widest text-sm mb-2">
                                <Filter className="w-4 h-4" /> <span>Filters</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                {/* Timeframe */}
                                <div>
                                    <label className="block text-xs font-mono text-[#a0a0a0] mb-2 uppercase tracking-wider">Timeframe</label>
                                    <select
                                        className="w-full bg-[#0a0e27] border border-[rgba(0,255,136,0.2)] rounded-lg p-2.5 text-white font-sans focus:outline-none focus:border-[#00ff88]"
                                        value={timeframe}
                                        onChange={(e) => setTimeframe(e.target.value)}
                                    >
                                        <option>24h</option>
                                        <option>7d</option>
                                        <option>30d</option>
                                        <option>All</option>
                                    </select>
                                </div>

                                {/* Probability */}
                                <div>
                                    <label className="block text-xs font-mono text-[#a0a0a0] mb-2 uppercase tracking-wider flex justify-between">
                                        Probability Base
                                        <span className="text-[#00ff88]">{probability}%+</span>
                                    </label>
                                    <input
                                        type="range"
                                        min="0" max="100"
                                        value={probability}
                                        onChange={(e) => setProbability(Number(e.target.value))}
                                        className="w-full h-2 bg-[#1a1f3a] rounded-lg appearance-none cursor-pointer accent-[#00ff88]"
                                    />
                                </div>

                                {/* Status Tabs */}
                                <div className="sm:col-span-2 md:col-span-1">
                                    <label className="block text-xs font-mono text-[#a0a0a0] mb-2 uppercase tracking-wider">Status</label>
                                    <div className="flex bg-[#0a0e27] rounded-lg p-1 border border-[rgba(0,255,136,0.2)] overflow-x-auto hide-scrollbar">
                                        {['All', 'Active', 'Resolved', 'Accurate'].map(stat => (
                                            <button
                                                key={stat}
                                                onClick={() => setStatusFilter(stat)}
                                                className={classNames(
                                                    "flex-1 text-xs font-sans py-1.5 px-2 rounded transition-colors uppercase tracking-wider whitespace-nowrap",
                                                    statusFilter === stat ? "bg-[rgba(0,255,136,0.1)] text-[#00ff88] shadow-sm" : "hover:text-white text-[#a0a0a0]"
                                                )}
                                            >
                                                {stat}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* PREDICTIONS GRID */}
                    <div className="flex-1">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} lines={6} height="280px" />)}
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="bg-[rgba(26,31,58,0.8)] rounded-xl border border border-dashed border-[#a0a0a0]/30 p-12 flex flex-col items-center justify-center text-[#a0a0a0]">
                                <Search className="w-12 h-12 mb-4 opacity-50" />
                                <h3 className="text-lg font-sans uppercase tracking-widest text-white mb-2 text-center">No Forecasts Found</h3>
                                <p className="font-sans text-sm text-center">Adjust your filters or generate a new prediction.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <AnimatePresence>
                                    {filtered.map(pred => (
                                        <motion.div
                                            key={pred.id}
                                            layout
                                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <PredictionCard prediction={pred} />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}

                        {filtered.length > 0 && (
                            <div className="mt-8 flex justify-center">
                                <NeonButton variant="info" className="px-8 py-3">Load More Predictions</NeonButton>
                            </div>
                        )}
                    </div>

                    {/* GENERATE MODAL */}
                    <AnimatePresence>
                        {isModalOpen && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-[#1a1f3a] border border-[#9b59b6] rounded-xl shadow-[0_0_30px_rgba(155,89,182,0.2)] p-6 w-full max-w-lg"
                                >
                                    <h2 className="text-xl tracking-widest uppercase font-bold text-[#9b59b6] mb-4">Generate Forecast</h2>
                                    <p className="text-[#a0a0a0] font-sans text-sm mb-6">Enter a topic, market, or technology sector. The AI swarm will compile signals and compute probability.</p>

                                    <textarea
                                        className="w-full bg-[#0a0e27] border border-[#9b59b6]/30 rounded-lg p-4 text-white font-sans min-h-[120px] focus:outline-none focus:border-[#9b59b6] focus:shadow-[0_0_15px_rgba(155,89,182,0.2)] transition-all mb-6"
                                        placeholder="E.g., What is the probability of AGI surpassing human economic output by 2030?"
                                        value={goalText}
                                        onChange={(e) => setGoalText(e.target.value)}
                                    />

                                    <div className="flex justify-end space-x-4">
                                        <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-[#a0a0a0] hover:text-white uppercase tracking-wider text-sm transition-colors">
                                            Cancel
                                        </button>
                                        <NeonButton
                                            variant="primary"
                                            onClick={handleGenerate}
                                            loading={isGenerating}
                                            style={{ borderColor: '#9b59b6', color: '#9b59b6' }}
                                        >
                                            Calculate
                                        </NeonButton>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </>
            )}
        </div>
    );
}
