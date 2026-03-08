import React from 'react';
import { classNames } from '../../lib/utils';

export interface StatusBadgeProps {
    status: string;
    color?: string;
    className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status = 'unknown', color, className }) => {

    const getBadgeClass = (s: string) => {
        const lower = s.toLowerCase();
        if (['running', 'active', 'connected', 'verified'].includes(lower)) return 'badge-green';
        if (['error', 'failed', 'challenged', 'rejected'].includes(lower)) return 'badge-red';
        if (['pending', 'loading', 'verifying', 'scanning'].includes(lower)) return 'badge-blue';
        return 'badge-grey';
    };

    const isPulse = ['pending', 'loading', 'verifying', 'scanning'].includes(status.toLowerCase());
    const badgeClass = getBadgeClass(status);

    return (
        <span
            className={classNames(
                "inline-flex items-center px-2 py-0.5 rounded text-xs font-mono tracking-wider uppercase border",
                color ? "" : badgeClass,
                className
            )}
            style={color ? {
                color: color,
                borderColor: `${color}40`,
                backgroundColor: `${color}10`
            } : undefined}
        >
            {isPulse && (
                <span className="relative flex h-2 w-2 mr-1.5" style={color ? { color } : undefined}>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
                </span>
            )}
            {!isPulse && (
                <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current" style={color ? { backgroundColor: color } : undefined}></span>
            )}
            {status}
        </span>
    );
};
