import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { ConfidenceBar } from '../ui/ConfidenceBar';
import { Badge } from '../ui/Badge';
import { InfoTooltip } from '../ui/InfoTooltip';

export interface Prediction {
    id: string;
    title: string;
    probability: number;
    timeframe: string;
    evidence: string[];
    consensus_level: 'high' | 'medium' | 'low';
    status: 'active' | 'resolved_correct' | 'resolved_incorrect';
}

export interface PredictionCardProps {
    prediction: Prediction;
    className?: string;
    compact?: boolean;
}

export function PredictionCard({ prediction, className = '', compact = false }: PredictionCardProps) {

    const statusColor = {
        active: 'blue',
        resolved_correct: 'green',
        resolved_incorrect: 'red'
    } as const;

    const statusLabel = {
        active: 'Active Prediction',
        resolved_correct: 'Resolved: Correct',
        resolved_incorrect: 'Resolved: Incorrect'
    };

    const consensusColor = {
        high: 'green',
        medium: 'amber',
        low: 'grey'
    } as const;

    return (
        <Card className={`overflow-hidden ${className}`}>
            <CardContent className={`flex flex-col h-full ${compact ? 'p-4' : 'p-5'}`}>
                <div className="flex justify-between items-start mb-3">
                    <Badge color={statusColor[prediction.status]} size="sm" dot={prediction.status === 'active'}>
                        {statusLabel[prediction.status]}
                    </Badge>

                    <InfoTooltip title="Consensus" description={`Network agreement is ${prediction.consensus_level}`}>
                        <Badge color={consensusColor[prediction.consensus_level]} size="sm">
                            {prediction.consensus_level} consensus
                        </Badge>
                    </InfoTooltip>
                </div>

                <h3 className={`font-semibold text-text-primary ${compact ? 'text-base line-clamp-2' : 'text-lg'} mb-1`}>
                    {prediction.title}
                </h3>

                <div className="flex items-center gap-2 mt-1 mb-4">
                    <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium text-text-secondary">{prediction.timeframe}</span>
                </div>

                <div className="mb-4">
                    <ConfidenceBar
                        score={prediction.probability}
                        label="Probability"
                        className="mb-1"
                    />
                </div>

                {!compact && (
                    <div className="mt-auto pt-4 border-t border-border">
                        <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-2">Key Evidence</span>
                        <ul className="space-y-1.5">
                            {prediction.evidence.slice(0, 3).map((item, i) => (
                                <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                                    <span className="text-border mt-1 shrink-0">•</span>
                                    <span className="line-clamp-2">{item}</span>
                                </li>
                            ))}
                            {prediction.evidence.length > 3 && (
                                <li className="text-xs text-text-muted italic pl-3">
                                    + {prediction.evidence.length - 3} more pieces of evidence
                                </li>
                            )}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
