"use client";

import React from 'react';
import { useSystemState } from '@/contexts/SystemStateContext';
import { AgentStatusGrid } from '@/components/agents/AgentStatusGrid';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function AgentsPage() {
    const { activeAgents, startAgent, stopAgent, restartAgent } = useSystemState();

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500 max-w-6xl mx-auto">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary tracking-tight">Agent Fleet Management</h1>
                    <p className="text-sm text-text-secondary mt-1">Monitor, configure, and control your specialized AI agents.</p>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline">
                        View Logs
                    </Button>
                    <Button variant="primary">
                        Deploy New Agent
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardContent className="p-4 flex items-center justify-between">
                        <span className="text-sm font-medium text-text-secondary">Fleet Status</span>
                        <span className="font-bold text-success">Healthy</span>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center justify-between">
                        <span className="text-sm font-medium text-text-secondary">Total Processed</span>
                        <span className="font-bold text-text-primary">12,450 Tasks</span>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center justify-between">
                        <span className="text-sm font-medium text-text-secondary">Resource Usage</span>
                        <span className="font-bold text-accent-amber">Moderate</span>
                    </CardContent>
                </Card>
            </div>

            <div>
                <h2 className="text-xl font-semibold text-text-primary tracking-tight mb-4">Deployed Agents</h2>
                <AgentStatusGrid
                    agents={activeAgents}
                    onStartAgent={startAgent}
                    onStopAgent={stopAgent}
                    onRestartAgent={restartAgent}
                />
            </div>

        </div>
    );
}
