"use client";

import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { AgentStatusDot } from '../ui/AgentStatusDot';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export interface Agent {
    id: string;
    name: string;
    type: string;
    status: 'running' | 'idle' | 'paused' | 'error' | 'dead';
    last_active: string;
    signals_found: number;
    current_task: string;
    uptime_seconds: number;
}

export interface AgentStatusGridProps {
    agents: Agent[];
    onStartAgent: (id: string) => void;
    onStopAgent: (id: string) => void;
    onRestartAgent: (id: string) => void;
    className?: string;
}

export function AgentStatusGrid({
    agents,
    onStartAgent,
    onStopAgent,
    onRestartAgent,
    className = ''
}: AgentStatusGridProps) {

    if (agents.length === 0) {
        return (
            <div className={`p-8 text-center text-text-muted bg-bg-subtle rounded-xl border border-dashed border-border ${className}`}>
                No agents registered in the system.
            </div>
        );
    }

    const formatUptime = (seconds: number) => {
        if (seconds === 0) return '0s';
        if (seconds < 60) return `${Math.floor(seconds)}s`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
        return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
    };

    return (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
            {agents.map((agent) => (
                <Card key={agent.id} hoverable className="overflow-hidden group">
                    <CardContent className="p-5 flex flex-col h-full">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="font-semibold text-text-primary flex items-center gap-2">
                                    {agent.name}
                                    <AgentStatusDot status={agent.status} />
                                </h3>
                                <span className="text-xs text-text-muted capitalize">{agent.type} Agent</span>
                            </div>
                            <Badge color={agent.signals_found > 0 ? "purple" : "grey"} size="sm">
                                {agent.signals_found} signals
                            </Badge>
                        </div>

                        <div className="mb-4 flex-1">
                            <span className="text-xs font-semibold text-text-muted mb-1 block uppercase tracking-wider">Current Task</span>
                            <p className="text-sm text-text-secondary leading-snug break-words">
                                {agent.status === 'running' ? agent.current_task : 'Idle'}
                            </p>
                        </div>

                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                            <div className="text-xs font-mono text-text-muted">
                                {agent.status === 'running' ? `Uptime: ${formatUptime(agent.uptime_seconds)}` : 'Offline'}
                            </div>

                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                {agent.status === 'running' ? (
                                    <>
                                        <Button
                                            variant="outline" size="sm"
                                            onClick={() => onRestartAgent(agent.id)}
                                            className="h-7 px-2"
                                            title="Restart"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                        </Button>
                                        <Button
                                            variant="danger" size="sm"
                                            onClick={() => onStopAgent(agent.id)}
                                            className="h-7 px-3"
                                        >
                                            Stop
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        variant="primary" size="sm"
                                        onClick={() => onStartAgent(agent.id)}
                                        className="h-7 px-3"
                                    >
                                        Start
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
