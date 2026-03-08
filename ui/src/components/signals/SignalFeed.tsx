"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ConfidenceBar } from '../ui/ConfidenceBar';

export interface Signal {
    id: string;
    title: string;
    description: string;
    source: string;
    confidence: number;
    agent: string;
    timestamp: string;
    tags?: string[];
}

export interface SignalFeedProps {
    signals: Signal[];
    onSave?: (signalId: string) => void;
    className?: string;
    compact?: boolean;
}

export function SignalFeed({ signals, onSave, className = '', compact = false }: SignalFeedProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    if (signals.length === 0) {
        return (
            <div className={`p-8 text-center text-text-muted bg-bg-subtle rounded-xl border border-dashed border-border ${className}`}>
                No signals detected recently.
            </div>
        );
    }

    const formatTimeAgo = (timestamp: string) => {
        // Basic formatting for demo, in real life use date-fns
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) return 'Recently';

        const diff = (Date.now() - date.getTime()) / 1000;
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };

    const getSourceColor = (source: string) => {
        const s = source.toLowerCase();
        if (s.includes('github')) return 'grey';
        if (s.includes('arxiv')) return 'amber';
        if (s.includes('news')) return 'blue';
        if (s.includes('x') || s.includes('twitter')) return 'blue';
        if (s.includes('coingecko') || s.includes('market')) return 'green';
        return 'purple';
    };

    return (
        <div className={`space-y-3 ${className}`}>
            {signals.map((signal) => {
                const isExpanded = expandedId === signal.id;

                return (
                    <Card
                        key={signal.id}
                        hoverable
                        className={`transition-all duration-300 ${isExpanded ? 'ring-1 ring-accent/30' : ''}`}
                        onClick={() => !compact && setExpandedId(isExpanded ? null : signal.id)}
                    >
                        <CardContent className={`${compact ? 'p-3' : 'p-4'}`}>
                            <div className="flex gap-4">
                                {/* Source Icon Column */}
                                <div className="flex flex-col items-center">
                                    <div className={`w-10 h-10 rounded-xl bg-bg-subtle border border-border flex items-center justify-center shrink-0`}>
                                        <span className="text-lg font-bold text-text-muted" title={signal.source}>
                                            {signal.source.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    {compact && (
                                        <span className="mt-1 text-[10px] text-text-muted font-medium uppercase tracking-wider max-w-[40px] truncate">
                                            {signal.source}
                                        </span>
                                    )}
                                </div>

                                {/* Content Column */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4 mb-1">
                                        <h4 className={`font-semibold text-text-primary ${compact ? 'text-sm' : 'text-base'} truncate leading-tight`}>
                                            {signal.title}
                                        </h4>
                                        {!compact && (
                                            <span className="text-xs text-text-muted whitespace-nowrap shrink-0">
                                                {formatTimeAgo(signal.timestamp)}
                                            </span>
                                        )}
                                    </div>

                                    {/* Description */}
                                    <p className={`text-text-secondary ${compact ? 'text-xs line-clamp-1' : (isExpanded ? 'text-sm mt-2 mb-3' : 'text-sm line-clamp-2 mt-1')}`}>
                                        {signal.description}
                                    </p>

                                    {/* Expanded Details */}
                                    {!compact && isExpanded && (
                                        <div className="mt-4 pt-3 border-t border-border animate-in slide-in-from-top-2 fade-in duration-200">
                                            <div className="grid grid-cols-2 gap-4 mb-3">
                                                <div>
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1 block">Found By</span>
                                                    <Badge color="blue" size="sm" className="font-mono">{signal.agent}</Badge>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1 block">Source</span>
                                                    <Badge color={getSourceColor(signal.source)} size="sm">{signal.source}</Badge>
                                                </div>
                                            </div>

                                            {signal.tags && signal.tags.length > 0 && (
                                                <div className="mt-3 flex gap-1.5 flex-wrap">
                                                    {signal.tags.map(t => (
                                                        <span key={t} className="text-[10px] text-text-secondary bg-bg-subtle px-2 py-0.5 rounded border border-border">
                                                            #{t}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Footer / Meta */}
                                    <div className={`flex items-center justify-between ${!compact && isExpanded ? 'mt-4' : 'mt-2'}`}>
                                        <div className="w-1/3 min-w-[100px]">
                                            <ConfidenceBar score={signal.confidence} showPercent={!compact} />
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {onSave && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onSave(signal.id); }}
                                                    className="p-1.5 text-text-muted hover:text-text-primary hover:bg-bg-subtle rounded transition-colors"
                                                    title="Save to vault"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                                    </svg>
                                                </button>
                                            )}
                                            {compact && (
                                                <span className="text-[10px] text-text-muted">
                                                    {formatTimeAgo(signal.timestamp)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
