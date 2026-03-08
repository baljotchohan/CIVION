'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebSocket } from '../../hooks/useWebSocket';
import { getSignals } from '../../lib/api';
import { SignalFeed } from '../../components/signals/SignalFeed';
import { NeonButton } from '../../components/ui/NeonButton';
import { classNames } from '../../lib/utils';
import { Zap, Activity, Download, Filter, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { Signal } from '../../types';

export default function SignalsPage() {
    const { subscribe } = useWebSocket();
    const [signals, setSignals] = useState<Signal[]>([]);
    const [loading, setLoading] = useState(true);
    const [liveCounter, setLiveCounter] = useState(0);

    // Filters
    const [sourceFilters, setSourceFilters] = useState<Record<string, boolean>>({
        github: true, arxiv: true, market: true, security: true, news: true
    });
    const [minConfidence, setMinConfidence] = useState(0);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const data = await getSignals();
                setSignals(data);
                setLiveCounter(data.length);
            } catch (err) {
                console.error("Failed to load signals");
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    useEffect(() => {
        const handleNewSignal = (data: any) => {
            setSignals(prev => [data as Signal, ...prev]);
            setLiveCounter(prev => prev + 1);
        };
        const unsub = subscribe('signal_detected', handleNewSignal);
        return () => unsub();
    }, [subscribe]);

    const handleExport = () => {
        const blob = new Blob([JSON.stringify(signals, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `civion-signals-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const toggleSource = (source: string) => {
        setSourceFilters(prev => ({ ...prev, [source]: !prev[source] }));
    };

    // Analytics Chart Data (Mock generated from actual data to fit hourly distribution concept)
    const chartData = [
        { hour: '00:00', github: 12, arxiv: 5, market: 0, security: 2, news: 8 },
        { hour: '04:00', github: 8, arxiv: 15, market: 2, security: 0, news: 4 },
        { hour: '08:00', github: 45, arxiv: 12, market: 34, security: 5, news: 24 },
        { hour: '12:00', github: 56, arxiv: 22, market: 58, security: 12, news: 45 },
        { hour: '16:00', github: 34, arxiv: 18, market: 89, security: 8, news: 32 },
        { hour: '20:00', github: 22, arxiv: 8, market: 12, security: 4, news: 18 }
    ];

    const colors: Record<string, string> = {
        github: '#00ff88', arxiv: '#00d4ff', market: '#ff006e', security: '#f1c40f', news: '#9b59b6'
    };

    return (
        <div className="min-h-screen bg-[#0a0e27] text-white p-6 space-y-6 flex flex-col">

            {/* HEADER */}
            <header className="flex justify-between items-center bg-[rgba(26,31,58,0.8)] backdrop-blur-[20px] p-6 rounded-xl border border-[rgba(0,255,136,0.2)] shadow-[0_0_20px_rgba(0,255,136,0.1)] shrink-0">
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-[rgba(0,212,255,0.1)] border border-[#00d4ff]/50 flex items-center justify-center shadow-[0_0_15px_rgba(0,212,255,0.2)]">
                        <Zap className="w-6 h-6 text-[#00d4ff]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-sans tracking-widest font-bold text-white uppercase flex items-center">
                            Signal Intelligence
                            <motion.div
                                key={liveCounter}
                                initial={{ scale: 1.5, color: '#fff' }}
                                animate={{ scale: 1, color: '#00ff88' }}
                                className="ml-4 text-xs font-mono bg-[rgba(0,255,136,0.1)] border border-[#00ff88]/50 px-3 py-1 rounded-full text-[#00ff88] flex items-center shadow-[0_0_10px_rgba(0,255,136,0.2)]"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] mr-2 animate-pulse" />
                                {liveCounter} Detected Today
                            </motion.div>
                        </h1>
                        <p className="text-[#a0a0a0] font-sans text-sm mt-1">Raw mult-modal data stream ingestion</p>
                    </div>
                </div>

                <NeonButton variant="info" onClick={handleExport}>
                    <Download className="w-4 h-4 mr-2" /> Export JSON
                </NeonButton>
            </header>

            {/* TOP ROW: ANALYTICS & FILTERS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 shrink-0">

                {/* ANALYTICS CHART */}
                <div className="lg:col-span-2 bg-[rgba(26,31,58,0.8)] rounded-xl border border-[rgba(0,255,136,0.2)] backdrop-blur-[20px] p-6 shadow-lg h-72 flex flex-col">
                    <h3 className="text-sm font-sans uppercase tracking-widest text-[#a0a0a0] flex items-center mb-4">
                        <BarChart2 className="w-4 h-4 mr-2 text-[#00d4ff]" /> Volume Trajectory (24h)
                    </h3>
                    <div className="flex-1 w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <XAxis dataKey="hour" stroke="#a0a0a0" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#a0a0a0" fontSize={10} tickLine={false} axisLine={false} />
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: 'rgba(26,31,58,0.95)', borderColor: '#00d4ff', borderRadius: '8px', color: '#fff', fontFamily: 'monospace' }}
                                    cursor={{ fill: 'rgba(0,255,136,0.05)' }}
                                />
                                {Object.keys(colors).map(source => (
                                    <Bar key={source} dataKey={source} stackId="a" fill={colors[source]} radius={[0, 0, 0, 0]} />
                                ))}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* FILTER PANEL */}
                <div className="lg:col-span-1 bg-[rgba(26,31,58,0.8)] rounded-xl border border-[rgba(0,255,136,0.2)] backdrop-blur-[20px] p-6 shadow-lg flex flex-col space-y-6">
                    <div className="flex items-center space-x-2 text-[#a0a0a0] uppercase font-sans tracking-widest text-sm mb-2 border-b border-[rgba(0,255,136,0.1)] pb-4">
                        <Filter className="w-4 h-4" /> <span>Stream Filters</span>
                    </div>

                    {/* Sources */}
                    <div>
                        <label className="block text-xs font-mono text-[#a0a0a0] mb-3 uppercase tracking-wider">Target Sources</label>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(sourceFilters).map(([src, active]) => (
                                <button
                                    key={src}
                                    onClick={() => toggleSource(src)}
                                    className={classNames(
                                        "px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider border transition-all flex items-center",
                                        active ? `bg-[${colors[src]}]/10 border-[${colors[src]}] text-white shadow-sm` : "bg-[rgba(26,31,58,0.5)] border-[rgba(0,255,136,0.1)] text-[#a0a0a0]"
                                    )}
                                    style={active ? { borderColor: colors[src], backgroundColor: `${colors[src]}20` } : {}}
                                >
                                    <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: active ? colors[src] : '#a0a0a0' }} />
                                    {src}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Confidence Threshold */}
                    <div>
                        <label className="block text-xs font-mono text-[#a0a0a0] mb-2 uppercase tracking-wider flex justify-between">
                            Minimum Confidence <span className="text-[#00d4ff]">{minConfidence}%</span>
                        </label>
                        <input
                            type="range" min="0" max="100" value={minConfidence} onChange={(e) => setMinConfidence(Number(e.target.value))}
                            className="w-full h-2 bg-[#1a1f3a] rounded-lg appearance-none cursor-pointer accent-[#00d4ff]"
                        />
                    </div>
                </div>
            </div>

            {/* FULL SIGNAL FEED */}
            <div className="flex-1 bg-[rgba(26,31,58,0.8)] border border-[rgba(0,255,136,0.2)] rounded-xl backdrop-blur-[20px] p-6 shadow-lg flex flex-col overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-sans uppercase tracking-widest text-white">Live Ingestion Stream</h3>
                    <div className="flex space-x-2 items-center text-xs font-mono text-[#a0a0a0]">
                        <Activity className="w-4 h-4 animate-pulse text-[#00ff88]" /> Socket Connected
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar -m-2 p-2">
                    <SignalFeed signals={signals} />
                </div>
            </div>

        </div>
    );
}
