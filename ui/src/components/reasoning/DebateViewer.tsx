"use client";

import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { InfoTooltip } from '../ui/InfoTooltip';

export interface DebateMessage {
    agent_id: string;
    role: 'proposer' | 'challenger' | 'verifier' | 'synthesizer' | 'system';
    content: string;
    confidence_delta?: number;
    timestamp: string;
}

export interface DebateViewerProps {
    debateId?: string;
    messages: DebateMessage[];
    status: 'active' | 'completed' | 'error';
    conclusion?: string;
    finalConfidence?: number;
    className?: string;
}

export function DebateViewer({ messages, status, conclusion, finalConfidence, className = '' }: DebateViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Auto scroll to bottom
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [messages, status]);

    const roleConfig = {
        proposer: { color: 'blue', label: 'Proposer', text: 'text-accent-blue', bg: 'bg-accent-blue/5 border-accent-blue/10' },
        challenger: { color: 'amber', label: 'Challenger', text: 'text-accent-amber', bg: 'bg-accent-amber/5 border-accent-amber/10' },
        verifier: { color: 'green', label: 'Verifier', text: 'text-success', bg: 'bg-success/5 border-success/10' },
        synthesizer: { color: 'purple', label: 'Synthesizer', text: 'text-accent-purple', bg: 'bg-accent-purple/5 border-accent-purple/10' },
        system: { color: 'grey', label: 'System', text: 'text-text-muted', bg: 'bg-bg-subtle border-border' }
    } as const;

    return (
        <Card className={`flex flex-col h-full ${className}`}>
            <CardHeader className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                    <span className="font-semibold text-text-primary">Reasoning Activity</span>
                    {status === 'active' && (
                        <Badge color="green" dot>Active</Badge>
                    )}
                    {status === 'completed' && (
                        <Badge color="blue">Concluded</Badge>
                    )}
                </div>
            </CardHeader>

            <div
                ref={containerRef}
                className="flex-1 overflow-y-auto p-5 pb-8 space-y-6"
            >
                {messages.map((msg, idx) => {
                    const conf = roleConfig[msg.role] || roleConfig.system;

                    if (msg.role === 'system') {
                        return (
                            <div key={idx} className="flex justify-center my-4">
                                <span className="text-xs font-medium text-text-muted bg-bg-subtle px-3 py-1 rounded-full border border-border">
                                    {msg.content}
                                </span>
                            </div>
                        );
                    }

                    return (
                        <div key={idx} className="flex flex-col gap-1.5 animate-in slide-in-from-bottom-2 fade-in duration-300">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Badge color={conf.color as any} size="sm" className="font-mono uppercase text-[10px] tracking-wider font-semibold">
                                        {msg.role}
                                    </Badge>
                                    <span className="text-xs font-medium text-text-secondary">{msg.agent_id}</span>
                                </div>

                                {msg.confidence_delta !== undefined && msg.confidence_delta !== 0 && (
                                    <InfoTooltip title="Confidence Shift" description="How much this argument changed the collective confidence score">
                                        <span className={`text-xs font-mono font-medium ${msg.confidence_delta > 0 ? 'text-success' : 'text-danger'}`}>
                                            {msg.confidence_delta > 0 ? '+' : ''}{msg.confidence_delta.toFixed(1)}%
                                        </span>
                                    </InfoTooltip>
                                )}
                            </div>

                            <div className={`p-4 rounded-b-xl rounded-tr-xl border text-sm text-text-primary ${conf.bg} leading-relaxed`}>
                                {msg.content}
                            </div>
                        </div>
                    );
                })}

                {status === 'active' && (
                    <div className="flex items-center gap-3 text-text-muted animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-text-muted" />
                        <span className="text-sm">Agents analyzing...</span>
                    </div>
                )}

                {status === 'completed' && conclusion && (
                    <div className="mt-8 mb-4">
                        <div className="p-5 border border-success/30 bg-success/5 rounded-xl animate-in slide-in-from-bottom-4 fade-in duration-500">
                            <div className="flex items-center justify-between mb-3 border-b border-success/10 pb-3">
                                <h4 className="font-semibold text-success flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Consensus Reached
                                </h4>
                                {finalConfidence && (
                                    <span className="font-mono font-bold text-success text-sm bg-success/10 px-2 py-1 rounded">
                                        {Math.round(finalConfidence * 100)}% Confidence
                                    </span>
                                )}
                            </div>
                            <p className="text-text-primary text-sm leading-relaxed">
                                {conclusion}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
}
