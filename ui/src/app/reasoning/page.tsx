"use client";

import React from 'react';
import { useSystemState } from '@/contexts/SystemStateContext';
import { DebateViewer } from '@/components/reasoning/DebateViewer';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function ReasoningPage() {
    const { activeDebates, isLoading } = useSystemState();

    if (isLoading && activeDebates.length === 0) {
        return (
            <div className="space-y-6">
                <SkeletonCard lines={8} />
                <SkeletonCard lines={6} />
            </div>
        );
    }

    if (activeDebates.length === 0) {
        return (
            <EmptyState
                title="No Active Reasoning"
                description="The network is currently listening for new signals. Once a significant event is detected, agents will spin up debate rooms to analyze it."
                actionText="Trigger Test Debate"
                onAction={() => console.log('Mock trigger debate')}
                className="mt-12"
            />
        );
    }

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary tracking-tight">Active Reasonings</h1>
                    <p className="text-sm text-text-secondary mt-1">Watch the agent network debate and synthesize information in real-time.</p>
                </div>
                <Badge color="green" dot size="md">{activeDebates.length} Active</Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Main Debate View */}
                <div className="col-span-1 lg:col-span-2 space-y-6">
                    {activeDebates.map(debate => (
                        <div key={debate.id} className="h-[600px] flex flex-col">
                            <div className="mb-3 px-1">
                                <h3 className="font-bold text-lg text-text-primary flex items-center gap-2">
                                    <span className="text-text-muted">#</span>
                                    {debate.topic}
                                </h3>
                            </div>
                            <DebateViewer
                                messages={debate.messages}
                                status={debate.status}
                                conclusion={debate.conclusion}
                                finalConfidence={debate.final_confidence}
                                className="flex-1"
                            />
                        </div>
                    ))}
                </div>

                {/* Sidebar Info */}
                <div className="col-span-1 space-y-6">
                    <Card>
                        <CardContent className="p-5">
                            <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-accent-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                </svg>
                                Debate Protocol
                            </h3>
                            <div className="space-y-4 text-sm text-text-secondary">
                                <p>
                                    <strong className="text-text-primary">Proposer:</strong> Analyzes raw signals and formulates an initial hypothesis.
                                </p>
                                <p>
                                    <strong className="text-text-primary">Challenger:</strong> Attempts to falsify the hypothesis using conflicting data.
                                </p>
                                <p>
                                    <strong className="text-text-primary">Verifier:</strong> Cross-references claims against known truth bases.
                                </p>
                                <p>
                                    <strong className="text-text-primary">Synthesizer:</strong> Combines valid points into a final probabilistic conclusion.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-5 flex flex-col items-center justify-center text-center">
                            <div className="w-12 h-12 bg-bg-subtle rounded-full flex items-center justify-center mb-3">
                                <svg className="w-6 h-6 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                </svg>
                            </div>
                            <h4 className="font-medium text-text-primary mb-1">Adjust Sensitivity</h4>
                            <p className="text-xs text-text-secondary mb-4">Change the threshold for triggering debates.</p>
                            <Button variant="outline" size="sm" className="w-full">Open Settings</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

        </div>
    );
}
