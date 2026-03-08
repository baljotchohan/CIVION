import React from 'react';
import { InfoTooltip } from './InfoTooltip';

export type AgentState = 'running' | 'idle' | 'paused' | 'error' | 'dead';

export interface AgentStatusDotProps {
    status: AgentState;
    showLabel?: boolean;
    className?: string;
}

export function AgentStatusDot({ status, showLabel = false, className = '' }: AgentStatusDotProps) {
    const configs = {
        running: {
            color: 'bg-success',
            ring: 'bg-success',
            label: 'Running',
            desc: 'Actively processing tasks or gathering signals.',
            pulse: 'animate-ping'
        },
        idle: {
            color: 'bg-accent-blue',
            ring: 'bg-accent-blue/30',
            label: 'Idle',
            desc: 'Waiting for new tasks or scheduled cycles.',
            pulse: ''
        },
        paused: {
            color: 'bg-accent-amber',
            ring: 'bg-accent-amber/30',
            label: 'Paused',
            desc: 'Temporarily halted by user.',
            pulse: ''
        },
        error: {
            color: 'bg-danger',
            ring: 'bg-danger/30',
            label: 'Error',
            desc: 'Encountered an error. Check logs.',
            pulse: ''
        },
        dead: {
            color: 'bg-text-muted',
            ring: 'bg-text-muted/30',
            label: 'Offline',
            desc: 'System constraint prevents agent from running (e.g., missing API key).',
            pulse: ''
        }
    };

    const config = configs[status] || configs.idle;

    return (
        <InfoTooltip title={config.label} description={config.desc} position="top">
            <div className={`inline-flex items-center gap-2 ${className}`}>
                <div className="relative flex h-3 w-3 items-center justify-center">
                    {config.pulse && (
                        <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${config.pulse} ${config.color}`} />
                    )}
                    <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${config.color}`} />
                </div>
                {showLabel && (
                    <span className="text-sm font-medium text-text-secondary capitalize">
                        {config.label}
                    </span>
                )}
            </div>
        </InfoTooltip>
    );
}
