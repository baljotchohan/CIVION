"use client";

import React, { useState } from 'react';
import { useSystemState } from '@/contexts/SystemStateContext';
import { SignalFeed } from '@/components/signals/SignalFeed';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';

export default function SignalsPage() {
    const { signals, isLoading } = useSystemState();
    const { addToast } = useToast();
    const [filter, setFilter] = useState<'all' | 'high_confidence' | 'recent'>('all');

    const handleSaveToVault = (id: string) => {
        addToast('success', 'Signal Saved', 'Added to Data Vault for later review.');
    };

    const filteredSignals = signals.filter(s => {
        if (filter === 'all') return true;
        if (filter === 'high_confidence') return s.confidence >= 0.7;
        if (filter === 'recent') {
            const ms = Date.now() - new Date(s.timestamp).getTime();
            return ms < 3600000; // 1 hour
        }
        return true;
    });

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500 max-w-4xl mx-auto">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary tracking-tight">Signal Intelligence</h1>
                    <p className="text-sm text-text-secondary mt-1">Raw data points and events captured by network agents.</p>
                </div>

                <div className="flex p-1 bg-bg-subtle border border-border rounded-lg">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${filter === 'all' ? 'bg-bg-card shadow-sm text-text-primary' : 'text-text-muted hover:text-text-primary'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('high_confidence')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${filter === 'high_confidence' ? 'bg-bg-card shadow-sm text-text-primary' : 'text-text-muted hover:text-text-primary'}`}
                    >
                        High Conf (%)
                    </button>
                    <button
                        onClick={() => setFilter('recent')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${filter === 'recent' ? 'bg-bg-card shadow-sm text-text-primary' : 'text-text-muted hover:text-text-primary'}`}
                    >
                        Recent (1h)
                    </button>
                </div>
            </div>

            {signals.length === 0 && !isLoading ? (
                <EmptyState
                    title="No Signals Detected"
                    description="Your agents are currently idle or not finding any relevant data based on their instructions."
                    className="mt-12"
                />
            ) : (
                <SignalFeed
                    signals={filteredSignals}
                    onSave={handleSaveToVault}
                />
            )}

        </div>
    );
}
