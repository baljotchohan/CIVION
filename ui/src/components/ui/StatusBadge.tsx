import React from 'react';
import { classNames } from '../../lib/utils';

export interface StatusBadgeProps {
    status: string;
    color?: string;
    className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status = 'unknown', color, className }) => {

    // Auto color map based on common status strings
    const getAutoColor = (s: string) => {
        const lower = s.toLowerCase();
        if (['running', 'active', 'connected', 'verified'].includes(lower)) return '#00ff88'; // green
        if (['error', 'failed', 'challenged', 'rejected'].includes(lower)) return '#ff006e'; // pink
        if (['pending', 'loading', 'verifying', 'scanning'].includes(lower)) return '#00d4ff'; // cyan
        return '#a0a0a0'; // grey for stopped, inactive, etc
    };

    const activeColor = color || getAutoColor(status);
    const isPulse = ['pending', 'loading', 'verifying', 'scanning'].includes(status.toLowerCase());

    return (
        <span
            className={classNames(
                "inline-flex items-center px-2 py-0.5 rounded text-xs font-mono tracking-wider uppercase border",
                className
            )}
            style={{
                color: activeColor,
                borderColor: `${activeColor}40`,
                backgroundColor: `${activeColor}10`
            }}
        >
            {isPulse && (
                <span className="relative flex h-2 w-2 mr-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: activeColor }}></span>
                    <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: activeColor }}></span>
                </span>
            )}
            {!isPulse && (
                <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: activeColor }}></span>
            )}
            {status}
        </span>
    );
};
