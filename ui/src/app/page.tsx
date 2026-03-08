'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useWebSocket } from '../hooks/useWebSocket';
import { getStats } from '../lib/api';
import { SystemStats } from '../types';
import { classNames } from '../lib/utils';
import { Bot, Zap, Target, Globe, Activity, Terminal } from 'lucide-react';
import { AgentStatusGrid } from '../components/agents/AgentStatusGrid';
import { ConfidenceCascade } from '../components/dashboard/ConfidenceCascade';
import { SignalFeed } from '../components/signals/SignalFeed';
import { PredictionCard } from '../components/predictions/PredictionCard';
import { SkeletonCard } from '../components/ui/SkeletonCard';

export default function DashboardPage() {
    const { connectionState } = useWebSocket();
    const [stats, setStats] = useState<SystemStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState<string>('');

    // Live clock
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchStats = async () => {
        try {
            const data = await getStats();
            setStats(data);
            setError(null);
        } catch (err) {
            setError("System offline — showing cached data");
            // Set mock data as fallback if API unavailable
            setStats({
                active_agents: 4,
                signals_today: 142,
                predictions_made: 28,
                network_peers: 12,
                uptime_seconds: 3600,
                confidence_avg: 0.82,
                version: "2.0.0"
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        // Setup polling every 30s as a backup
        const poll = setInterval(fetchStats, 30000);
        return () => clearInterval(poll);
    }, []);

    // WebSocket dot color
    const wsColor = connectionState === 'connected' ? '#00ff88' : connectionState === 'connecting' ? '#00d4ff' : '#ff006e';

    return (
        <div className="min-h-screen bg-[#0a0e27] text-white p-6 space-y-6 flex flex-col">

            {/* ERROR BOUNDARY FALLBACK BAR */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-[#ff006e]/20 border border-[#ff006e] rounded-lg text-[#ff006e] flex items-center justify-center font-mono text-sm tracking-wider uppercase"
                >
                    <Activity className="w-4 h-4 mr-2" />
                    {error}
                </motion.div>
            )}

            {/* HEADER */}
            <header className="flex justify-between items-center bg-[rgba(26,31,58,0.8)] backdrop-blur-[20px] p-6 rounded-xl border border-[rgba(0,255,136,0.2)] shadow-[0_0_20px_rgba(0,255,136,0.1)]">
                <div className="flex items-center space-x-4">
                    <Terminal className="w-8 h-8 text-[#00ff88]" />
                    <div>
                        <h1 className="text-2xl font-sans tracking-widest font-bold text-[#00ff88] uppercase" style={{ textShadow: '0 0 10px rgba(0,255,136,0.5)' }}>CIVION Command Center</h1>
                        <div className="text-[#a0a0a0] font-mono text-sm mt-1">v{stats?.version || '2.0.0'}</div>
                    </div>
                </div>

                <div className="flex items-center space-x-8">
                    {/* Live Clock */}
                    <div className="text-2xl font-mono text-white tracking-widest bg-[#1a1f3a] px-4 py-2 rounded-lg border border-white/10" suppressHydrationWarning>
                        {currentTime || '00:00:00'}
                    </div>

                    {/* WS Status Dot */}
                    <div className="flex items-center space-x-3 bg-[#1a1f3a] px-4 py-2.5 rounded-lg border border-white/10">
                        <span className="relative flex h-3 w-3">
                            {connectionState === 'connected' && (
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: wsColor }}></span>
                            )}
                            <span className="relative inline-flex rounded-full h-3 w-3" style={{ backgroundColor: wsColor }}></span>
                        </span>
                        <span className="font-mono text-xs uppercase tracking-wider text-[#a0a0a0]">{connectionState}</span>
                    </div>
                </div>
            </header>

            {/* 4 STAT CARDS ROW */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Active Agents"
                    value={stats?.active_agents}
                    icon={<Bot size={24} />}
                    color="#00ff88"
                    loading={loading}
                />
                <StatCard
                    title="Signals Today"
                    value={stats?.signals_today}
                    icon={<Zap size={24} />}
                    color="#00d4ff"
                    loading={loading}
                />
                <StatCard
                    title="Predictions"
                    value={stats?.predictions_made}
                    icon={<Target size={24} />}
                    color="#9b59b6"
                    loading={loading}
                />
                <StatCard
                    title="Network Peers"
                    value={stats?.network_peers}
                    icon={<Globe size={24} />}
                    color="#ff006e"
                    loading={loading}
                />
            </div>

            {/* MIDDLE ROW (60/40) */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 flex flex-col min-h-[500px]">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-sans uppercase tracking-widest text-white">System Confidence</h3>
                        <div className="text-sm font-mono text-[#00ff88]">{(stats ? stats.confidence_avg * 100 : 0).toFixed(1)}% AVG</div>
                    </div>
                    {loading ? <SkeletonCard lines={8} height="100%" /> : <ConfidenceCascade confidenceHistory={[]} currentScore={stats ? stats.confidence_avg : 0} />}
                </div>

                <div className="lg:col-span-2 flex flex-col min-h-[500px]">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-sans uppercase tracking-widest text-white">Fleet Status</h3>
                        <a href="/agents" className="text-xs font-mono text-[#00d4ff] hover:text-white transition-colors uppercase tracking-wider">Manage Fleet ↗</a>
                    </div>
                    {/* Assuming AgentStatusGrid handles its own internal loading/fetch or receives mocked props if null for now */}
                    <div className="flex-1 bg-[rgba(26,31,58,0.8)] rounded-xl border border-[rgba(0,255,136,0.2)] p-4 overflow-hidden shadow-[0_0_20px_rgba(0,255,136,0.1)] backdrop-blur-[20px]">
                        <AgentStatusGrid agents={[]} onStart={() => { }} onStop={() => { }} onRestart={() => { }} />
                    </div>
                </div>
            </div>

            {/* BOTTOM ROW (55/45) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">
                <div className="lg:col-span-6 xl:col-span-7 flex flex-col">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-sans uppercase tracking-widest text-white">Live Signals Feeds</h3>
                        <a href="/signals" className="text-xs font-mono text-[#00d4ff] hover:text-white transition-colors uppercase tracking-wider">View All ↗</a>
                    </div>
                    <div className="flex-1 bg-[rgba(26,31,58,0.8)] rounded-xl border border-[rgba(0,255,136,0.2)] p-6 shadow-[0_0_20px_rgba(0,255,136,0.1)] backdrop-blur-[20px]">
                        <SignalFeed signals={[]} />
                    </div>
                </div>

                <div className="lg:col-span-6 xl:col-span-5 flex flex-col">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-sans uppercase tracking-widest text-white">Latest Prediction</h3>
                        <a href="/predictions" className="text-xs font-mono text-[#00d4ff] hover:text-white transition-colors uppercase tracking-wider">All Forecasts ↗</a>
                    </div>
                    <div className="flex-1 bg-[rgba(26,31,58,0.8)] rounded-xl border border-[rgba(0,255,136,0.2)] p-6 shadow-[0_0_20px_rgba(0,255,136,0.1)] backdrop-blur-[20px]">
                        {/* Dummy PredictionCard instance */}
                        <PredictionCard
                            prediction={{
                                id: "p-dash",
                                title: "AI Agents Will Surpass Human App Usage",
                                description: "The volume of API requests handled by autonomous agents will exceed human-driven front-end clicks.",
                                probability: 0.88,
                                timeframe: "Q4 2026",
                                evidence: ["Rising API token usage in cloud providers", "Decrease in DAU for traditional web apps"],
                                created_at: new Date().toISOString(),
                                resolved: false,
                                outcome: null,
                                accuracy: null,
                                shared_count: 42
                            }}
                        />
                    </div>
                </div>
            </div>

        </div>
    );
}

// Simple internal sub-component for the stat blocks
function StatCard({ title, value, icon, color, loading }: { title: string; value?: number; icon: React.ReactNode; color: string; loading: boolean }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center p-6 bg-[rgba(26,31,58,0.8)] rounded-xl border backdrop-blur-[20px] shadow-lg group hover:shadow-[0_0_20px_rgba(0,255,136,0.2)] transition-all duration-300"
            style={{ borderColor: `${color}40` }}
        >
            <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mr-5 shrink-0 transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${color}15`, color: color, border: `1px solid ${color}80` }}
            >
                {icon}
            </div>
            <div className="flex flex-col flex-1">
                <span className="text-xs font-sans uppercase tracking-widest text-[#a0a0a0] mb-1">{title}</span>
                {loading ? (
                    <div className="h-8 w-24 bg-[#1a1f3a] animate-pulse rounded"></div>
                ) : (
                    <motion.span
                        key={value}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-3xl font-mono font-bold text-white tracking-wider"
                    >
                        {value?.toLocaleString() || '0'}
                    </motion.span>
                )}
            </div>
            <div className="self-start text-[#a0a0a0] opacity-50">
                ↗
            </div>
        </motion.div>
    );
}
