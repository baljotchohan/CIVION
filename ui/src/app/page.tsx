"use client";

import React, { useEffect, useState } from 'react';
import { useSystemState } from '../contexts/SystemStateContext';
import { Card, CardContent } from '../components/ui/Card';
import { ConfidenceCascade } from '../components/dashboard/ConfidenceCascade';
import { AgentStatusGrid } from '../components/agents/AgentStatusGrid';
import { SignalFeed, Signal } from '../components/signals/SignalFeed';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import { ErrorCard } from '../components/ui/ErrorCard';

export default function DashboardPage() {
    const {
        health,
        activeAgents,
        signalCount,
        confidenceAvg,
        confidenceHistory,
        signals,
        startAgent,
        stopAgent,
        restartAgent,
        refreshState,
        error,
        isLoading
    } = useSystemState();

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Initial fetch handled by context, could force here if needed
    }, []);

    if (!mounted) return null;

    if (error && !isLoading && activeAgents.length === 0) {
        return (
            <div className="max-w-xl mx-auto mt-20">
                <ErrorCard
                    title="System Connection Error"
                    message={`Failed to connect to the CIVION backend: ${error}`}
                    onRetry={refreshState}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="System Core"
                    value={health === 'alive' ? 'Online' : 'Dead'}
                    icon={<svg className={`w-5 h-5 ${health === 'alive' ? 'text-success' : 'text-danger'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                    trend="All systems nominal"
                />
                <MetricCard
                    title="Active Agents"
                    value={activeAgents.length.toString()}
                    icon={<svg className="w-5 h-5 text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
                    trend={`${activeAgents.filter(a => a.status === 'running').length} running`}
                />
                <MetricCard
                    title="Signals Prosessed"
                    value={signalCount.toLocaleString()}
                    icon={<svg className="w-5 h-5 text-accent-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                    trend="+12% today"
                />
                <MetricCard
                    title="Network Confidence"
                    value={`${Math.round(confidenceAvg * 100)}%`}
                    icon={<svg className="w-5 h-5 text-accent-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
                    trend="High consensus"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Main Feed */}
                <div className="col-span-1 lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-text-primary tracking-tight">Active Fleet</h2>
                    </div>

                    {isLoading && activeAgents.length === 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <SkeletonCard lines={2} />
                            <SkeletonCard lines={2} />
                        </div>
                    ) : (
                        <AgentStatusGrid
                            agents={activeAgents}
                            onStartAgent={startAgent}
                            onStopAgent={stopAgent}
                            onRestartAgent={restartAgent}
                        />
                    )}

                    <div className="flex items-center justify-between mt-8 mb-4">
                        <h2 className="text-xl font-semibold text-text-primary tracking-tight">Recent Signals</h2>
                    </div>

                    <SignalFeed
                        signals={signals.slice(0, 5)}
                    />
                </div>

                {/* Sidebar widgets */}
                <div className="col-span-1 space-y-6">
                    <ConfidenceCascade
                        data={confidenceHistory}
                        currentConfidence={confidenceAvg}
                    />

                    <Card>
                        <CardContent className="p-5">
                            <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                System Events
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { time: '10m ago', msg: 'Started Web Researcher', type: 'info' },
                                    { time: '1h ago', msg: 'Analyzed 150 new inputs', type: 'success' },
                                    { time: '2h ago', msg: 'Data vault synchronization', type: 'info' }
                                ].map((event, i) => (
                                    <div key={i} className="flex gap-3">
                                        <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${event.type === 'info' ? 'bg-accent-blue' : 'bg-success'}`} />
                                        <div>
                                            <p className="text-sm text-text-primary">{event.msg}</p>
                                            <span className="text-xs text-text-muted">{event.time}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}

function MetricCard({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend?: string }) {
    return (
        <Card hoverable className="h-full">
            <CardContent className="p-5 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-sm font-medium text-text-secondary">{title}</h3>
                    <div className="p-2.5 bg-bg-subtle rounded-xl border border-border">
                        {icon}
                    </div>
                </div>
                <div>
                    <div className="text-3xl font-bold text-text-primary">{value}</div>
                    {trend && <div className="text-sm text-text-muted mt-2">{trend}</div>}
                </div>
            </CardContent>
        </Card>
    );
}
