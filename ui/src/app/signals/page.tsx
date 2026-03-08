'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useSystemState } from '../../hooks/useSystemState';
import { useAliveState } from '../../hooks/useAliveState';
import { getSignals } from '../../lib/api';
import { Signal } from '../../types';
import { SignalFeed } from '../../components/signals/SignalFeed';
import { NeonButton } from '../../components/ui/NeonButton';
import { SkeletonCard } from '../../components/ui/SkeletonCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { DemoModeBanner } from '../../components/ui/DemoModeBanner';
import { classNames } from '../../lib/utils';
import { Zap, Filter, Activity, BarChart3, Radio } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function SignalsPage() {
    const { subscribe } = useWebSocket();
    const { systemState } = useSystemState();
    const { dataMode } = useAliveState();
    const [signals, setSignals] = useState<Signal[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [sourceFilter, setSourceFilter] = useState('All');
    const [minConfidence, setMinConfidence] = useState(0);

    useEffect(() => {
        const fetchAll = async () => {
            if (dataMode === 'empty') return;
            try {
                const data = await getSignals();
                setSignals(data);
            } catch (err) {
                console.error("Failed to load signals");
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [dataMode]);

    useEffect(() => {
        if (dataMode === 'empty') return;
        const handleNewSignal = (data: any) => {
            setSignals(prev => [data as Signal, ...prev]);
        };
        const unsub = subscribe('signal_detected', handleNewSignal);
        return () => unsub();
    }, [subscribe, dataMode]);

    const filtered = signals.filter(s => {
        if (sourceFilter !== 'All' && s.source !== sourceFilter) return false;
        if (s.confidence * 100 < minConfidence) return false;
        return true;
    });

    const sources = ['All', ...Array.from(new Set(signals.map(s => s.source)))];

    // Mock analytics specific to signals
    const volumeData = [
        { time: '08:00', val: 12 }, { time: '09:00', val: 24 }, { time: '10:00', val: 18 },
        { time: '11:00', val: 45 }, { time: '12:00', val: 80 }, { time: '13:00', val: 65 },
        { time: '14:00', val: 92 }
    ];

    return (
        <div className="min-h-screen bg-[#0a0e27] text-white p-6 flex flex-col space-y-6 pt-16 lg:pt-6">
            <DemoModeBanner />

            {dataMode === 'empty' ? (
                <EmptyState
                    health={systemState.health}
                    icon={<Radio className="w-8 h-8" />}
                    title="Signal Ingestion Offline"
                    message="Connect API providers on the Settings page to begin ingesting live market and network signals."
                />
            ) : (
                <>
                    {/* HEADER */}
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[rgba(26,31,58,0.8)] backdrop-blur-[20px] p-6 rounded-xl border border-[rgba(0,255,136,0.2)] shadow-[0_0_20px_rgba(0,255,136,0.1)] gap-6 shrink-0">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-xl bg-[rgba(0,212,255,0.1)] border border-[#00d4ff]/50 flex items-center justify-center shadow-[0_0_15px_rgba(0,212,255,0.2)] shrink-0">
                                <Zap className="w-6 h-6 text-[#00d4ff]" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-sans tracking-widest font-bold text-white uppercase">Raw Signals</h1>
                                <p className="text-[#a0a0a0] font-sans text-sm mt-1">Live autonomous data ingestion feed</p>
                            </div>
                        </div>

                        <div className="flex items-center bg-[#1a1f3a] border border-[#00d4ff]/30 px-4 py-2 rounded-lg gap-3 shadow-[0_0_15px_rgba(0,212,255,0.1)] w-full md:w-auto overflow-x-auto">
                            <Activity className="w-4 h-4 text-[#00d4ff] shrink-0" />
                            <span className="font-mono text-xs uppercase tracking-wider text-[#a0a0a0] whitespace-nowrap">Ingestion Rate</span>
                            <span className="font-mono text-white whitespace-nowrap"><span className="text-[#00d4ff] font-bold">12.4</span> sig/sec</span>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 flex-1 min-h-[500px]">

                        {/* LEFT: ANALYTICS & FILTERS */}
                        <div className="xl:col-span-1 flex flex-col gap-6">

                            {/* Analytics Chart */}
                            <div className="bg-[rgba(26,31,58,0.8)] rounded-xl border border-[rgba(0,255,136,0.2)] backdrop-blur-[20px] p-5 shadow-lg flex flex-col h-64 shrink-0">
                                <h3 className="text-sm font-sans uppercase tracking-widest text-[#a0a0a0] mb-4 flex items-center shrink-0">
                                    <BarChart3 className="w-4 h-4 mr-2 text-[#00d4ff]" /> Volume Trajectory
                                </h3>
                                <div className="flex-1 w-full relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={volumeData}>
                                            <XAxis dataKey="time" hide />
                                            <YAxis hide />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1a1f3a', borderColor: '#00d4ff', borderRadius: '8px' }}
                                                itemStyle={{ color: '#00d4ff' }}
                                                cursor={{ fill: 'rgba(0,212,255,0.1)' }}
                                            />
                                            <Bar dataKey="val" fill="#00d4ff" radius={[4, 4, 0, 0]} opacity={0.8} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Filters */}
                            <div className="bg-[rgba(26,31,58,0.8)] rounded-xl border border-[rgba(0,255,136,0.2)] backdrop-blur-[20px] p-5 shadow-lg flex flex-col flex-1 shrink-0">
                                <h3 className="text-sm font-sans uppercase tracking-widest text-[#a0a0a0] mb-6 flex items-center shrink-0">
                                    <Filter className="w-4 h-4 mr-2" /> Feed Filters
                                </h3>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-mono text-[#a0a0a0] mb-3 uppercase tracking-wider">Source Vector</label>
                                        <div className="flex flex-wrap gap-2">
                                            {sources.map(s => (
                                                <button
                                                    key={s}
                                                    onClick={() => setSourceFilter(s)}
                                                    className={classNames(
                                                        "px-3 py-1.5 rounded text-xs font-sans transition-all border",
                                                        sourceFilter === s
                                                            ? "bg-[#00d4ff]/20 text-[#00d4ff] border-[#00d4ff]"
                                                            : "bg-[rgba(26,31,58,0.5)] border-[rgba(0,255,136,0.2)] text-[#a0a0a0] hover:text-white"
                                                    )}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-mono text-[#a0a0a0] mb-3 uppercase tracking-wider flex justify-between">
                                            Min Confidence
                                            <span className="text-[#00d4ff]">{minConfidence}%</span>
                                        </label>
                                        <input
                                            type="range"
                                            min="0" max="100"
                                            value={minConfidence}
                                            onChange={(e) => setMinConfidence(Number(e.target.value))}
                                            className="w-full h-2 bg-[#1a1f3a] rounded-lg appearance-none cursor-pointer accent-[#00d4ff]"
                                        />
                                    </div>
                                </div>
                                <div className="mt-8 pt-4 border-t border-[rgba(0,255,136,0.1)] flex justify-between text-xs font-mono text-[#a0a0a0]">
                                    <span>Total matching:</span>
                                    <span className="text-white">{filtered.length}</span>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: LIVE FEED */}
                        <div className="xl:col-span-3 bg-[rgba(26,31,58,0.8)] rounded-xl border border-[rgba(0,255,136,0.2)] backdrop-blur-[20px] shadow-lg flex flex-col overflow-hidden max-h-[80vh] min-h-[500px]">
                            <div className="p-4 border-b border-[rgba(0,255,136,0.2)] bg-[#1a1f3a]/80 shrink-0 flex justify-between items-center">
                                <h3 className="text-sm font-sans uppercase tracking-widest text-[#a0a0a0]">Real-time Firehose</h3>
                                <div className="flex space-x-2">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-[#00ff88]"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ff88]"></span>
                                    </span>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                                {loading ? (
                                    <div className="space-y-4">
                                        {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} lines={2} height="80px" />)}
                                    </div>
                                ) : filtered.length === 0 ? (
                                    <div className="text-center text-[#a0a0a0] py-12 flex flex-col items-center">
                                        <Zap className="w-12 h-12 mb-4 opacity-50 text-[#00d4ff]" />
                                        <p className="font-sans text-sm tracking-wider uppercase">No signals in queue</p>
                                    </div>
                                ) : (
                                    <SignalFeed signals={filtered} />
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
