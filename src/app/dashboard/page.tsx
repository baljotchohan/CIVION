"use client";

import { useState } from "react";
import { useAgentStore } from "@/store/agentStore";
import { useUserStore } from "@/store/userStore";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DebateResult } from "@/agents/types";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";

export default function DashboardPage() {
    const { profile } = useUserStore();
    const { debates, startDebate, isDebating, currentDebate, liveDebateAnalyses, liveDebateSynthesizing } = useAgentStore();
    const [debateTopic, setDebateTopic] = useState("");
    const [showDebateInput, setShowDebateInput] = useState(false);
    const [expandedDebate, setExpandedDebate] = useState<string | null>(null);

    const handleStartDebate = async () => {
        if (!debateTopic.trim()) return;
        setShowDebateInput(false);
        await startDebate(debateTopic);
        setDebateTopic("");
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
            {/* Welcome Header */}
            <div>
                <h1 className="text-2xl font-bold text-text-primary tracking-tight">
                    Welcome back{profile?.name ? `, ${profile.name}` : ""}
                </h1>
                <p className="text-text-secondary mt-1">
                    {profile?.business ? `${profile.business} — ` : ""}Your personal AI intelligence network
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card hoverable>
                    <CardContent className="p-5">
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="text-sm font-medium text-text-secondary">Agents Ready</h3>
                            <div className="p-2 bg-bg-subtle rounded-xl border border-border">
                                <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-text-primary">6</div>
                        <div className="text-sm text-text-muted mt-1">Goal, Research, Analysis, Execution, Monitoring + Personal</div>
                    </CardContent>
                </Card>

                <Card hoverable>
                    <CardContent className="p-5">
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="text-sm font-medium text-text-secondary">Debates Run</h3>
                            <div className="p-2 bg-bg-subtle rounded-xl border border-border">
                                <svg className="w-5 h-5 text-accent-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-text-primary">{debates.length}</div>
                        <div className="text-sm text-text-muted mt-1">{debates.length === 0 ? "Start your first debate" : "Total debates completed"}</div>
                    </CardContent>
                </Card>

                <Card hoverable>
                    <CardContent className="p-5">
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="text-sm font-medium text-text-secondary">Your Goals</h3>
                            <div className="p-2 bg-bg-subtle rounded-xl border border-border">
                                <svg className="w-5 h-5 text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-text-primary">{profile?.goals?.length || 0}</div>
                        <div className="text-sm text-text-muted mt-1">{profile?.goals?.join(", ").slice(0, 60) || "No goals set"}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Debate Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Start Debate */}
                <Card>
                    <CardContent className="p-6">
                        <h2 className="text-lg font-semibold text-text-primary mb-2">🦞 Agent Debate</h2>
                        <p className="text-sm text-text-secondary mb-4">
                            Get 5 specialized agents to analyze any topic from different angles, then synthesize a consensus.
                        </p>

                        {isDebating ? (
                            <div className="space-y-6 py-2">
                                <div className="flex items-center gap-3 text-accent">
                                    <svg className="animate-spin w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    <span className="text-sm font-medium">Debate in progress on: "{debateTopic || "Topic"}"</span>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {["Goal Agent", "Research Agent", "Analysis Agent", "Execution Agent", "Monitoring Agent"].map((agentName) => {
                                        const result = liveDebateAnalyses.find(a => a.agent === agentName);
                                        return (
                                            <div key={agentName} className="bg-bg-subtle border border-border rounded-lg p-4 flex flex-col h-full">
                                                <div className="flex items-center justify-between mb-3 border-b border-border pb-2">
                                                    <h4 className="text-sm font-semibold text-text-primary">{agentName}</h4>
                                                    {result ? (
                                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-success-soft text-success uppercase">
                                                            Done
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1.5">
                                                            <span className="w-1.5 h-1.5 bg-accent rounded-full animate-ping"></span>
                                                            <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Thinking</span>
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex-1 overflow-y-auto max-h-48 text-sm pristine-scroll">
                                                    {result ? (
                                                        <MarkdownRenderer content={result.analysis} />
                                                    ) : (
                                                        <div className="h-full flex items-center justify-center text-text-muted italic text-xs">
                                                            Analyzing factors...
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {liveDebateSynthesizing && (
                                    <div className="p-4 bg-accent-soft/30 border border-accent/20 rounded-lg flex items-center gap-3 animate-pulse">
                                        <span className="text-2xl">🦞</span>
                                        <div>
                                            <h4 className="text-sm font-semibold text-accent">Synthesis Engine</h4>
                                            <p className="text-xs text-text-secondary mt-0.5">Merging 5 perspectives into a final consensus...</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : showDebateInput ? (
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    value={debateTopic}
                                    onChange={(e) => setDebateTopic(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleStartDebate()}
                                    placeholder="e.g. Should we expand into the European market?"
                                    className="w-full bg-bg-subtle border border-border rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm"
                                    autoFocus
                                />
                                <div className="flex gap-2">
                                    <Button variant="primary" onClick={handleStartDebate} disabled={!debateTopic.trim()}>
                                        Start Debate
                                    </Button>
                                    <Button variant="ghost" onClick={() => setShowDebateInput(false)}>
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <Button
                                variant="primary"
                                onClick={() => setShowDebateInput(true)}
                                className="w-full"
                            >
                                Start New Debate →
                            </Button>
                        )}
                    </CardContent>
                </Card>

                {/* Latest Debate Result */}
                {currentDebate && (
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-semibold text-text-primary">Latest Result</h3>
                                <span className="text-xs font-medium px-2 py-1 rounded-full bg-accent-soft text-accent">
                                    {(currentDebate.avgConfidence * 100).toFixed(0)}% confidence
                                </span>
                            </div>
                            <p className="text-sm font-medium text-text-secondary mb-3">
                                Topic: {currentDebate.topic}
                            </p>
                            <div className="text-sm text-text-primary bg-bg-subtle border border-border rounded-lg p-5 max-h-96 overflow-y-auto">
                                <MarkdownRenderer content={currentDebate.synthesis} />
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Past Debates */}
            {debates.length > 0 && (
                <div>
                    <h2 className="text-lg font-semibold text-text-primary mb-4">Past Debates</h2>
                    <div className="space-y-3">
                        {debates.map((debate: DebateResult) => (
                            <Card key={debate.id} hoverable>
                                <CardContent className="p-4">
                                    <button
                                        className="w-full text-left"
                                        onClick={() => setExpandedDebate(expandedDebate === debate.id ? null : debate.id)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-sm font-medium text-text-primary">{debate.topic}</h3>
                                                <p className="text-xs text-text-muted mt-1">
                                                    {new Date(debate.createdAt).toLocaleDateString()} · {(debate.avgConfidence * 100).toFixed(0)}% confidence
                                                </p>
                                            </div>
                                            <svg className={`w-4 h-4 text-text-muted transition-transform ${expandedDebate === debate.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </button>
                                    {expandedDebate === debate.id && (
                                        <div className="mt-3 pt-4 border-t border-border text-sm text-text-primary bg-bg-base rounded-lg p-4 max-h-96 overflow-y-auto">
                                            <MarkdownRenderer content={debate.synthesis} />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
