import React from 'react';
import { InfoTooltip } from './InfoTooltip';

export interface ConfidenceBarProps {
    score: number; // 0 to 1
    label?: string;
    showPercent?: boolean;
    className?: string;
}

export function ConfidenceBar({
    score,
    label = 'Confidence',
    showPercent = true,
    className = ''
}: ConfidenceBarProps) {
    // Clamp between 0 and 1
    const clampedScore = Math.max(0, Math.min(1, score));
    const percent = Math.round(clampedScore * 100);

    let colorClass = 'bg-danger';
    if (percent >= 70) colorClass = 'bg-success';
    else if (percent >= 40) colorClass = 'bg-accent-amber';

    return (
        <InfoTooltip
            title={`${label}: ${percent}%`}
            description="Shows how certain agents are about this finding. Grows as more agents verify the same signal from independent sources."
            position="top"
            className="w-full"
        >
            <div className={`flex flex-col gap-1.5 ${className}`}>
                {showPercent && (
                    <div className="flex justify-between items-end">
                        <span className="text-xs font-medium text-text-secondary">{label}</span>
                        <span className="text-xs font-mono font-bold text-text-primary">{percent}%</span>
                    </div>
                )}
                <div className="h-2 w-full bg-border rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full ${colorClass} transition-all duration-500 ease-out`}
                        style={{ width: `${percent}%` }}
                    />
                </div>
            </div>
        </InfoTooltip>
    );
}
