"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

// The new system state types based on my pages
export type SystemHealth = 'alive' | 'idle' | 'dead' | 'degraded' | 'error';

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

export interface DebateMessage {
    agent_id: string;
    role: 'proposer' | 'challenger' | 'verifier' | 'synthesizer' | 'system';
    content: string;
    confidence_delta?: number;
    timestamp: string;
}

export interface ActiveDebate {
    id: string;
    topic: string;
    status: 'active' | 'completed' | 'error';
    messages: DebateMessage[];
    conclusion?: string;
    final_confidence?: number;
}

export interface ConfidenceDataPoint {
    time: string;
    confidence: number;
}

export interface SystemStateContextType {
    health: SystemHealth;
    activeAgents: Agent[];
    signalCount: number;
    confidenceAvg: number;
    confidenceHistory: ConfidenceDataPoint[];
    signals: Signal[];
    activeDebates: ActiveDebate[];

    startAgent: (id: string) => void;
    stopAgent: (id: string) => void;
    restartAgent: (id: string) => void;

    refreshState: () => void;

    error: string | null;
    isLoading: boolean;
}

const SystemStateContext = createContext<SystemStateContextType | undefined>(undefined);

export function SystemStateProvider({ children }: { children: ReactNode }) {
    const [health, setHealth] = useState<SystemHealth>('dead');
    const [activeAgents, setActiveAgents] = useState<Agent[]>([]);
    const [signals, setSignals] = useState<Signal[]>([]);
    const [activeDebates, setActiveDebates] = useState<ActiveDebate[]>([]);
    const [confidenceHistory, setConfidenceHistory] = useState<ConfidenceDataPoint[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const signalCount = signals.length;
    // Compute average confidence from latest history
    const confidenceAvg = confidenceHistory.length > 0
        ? confidenceHistory[confidenceHistory.length - 1].confidence
        : 0;

    const refreshState = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const [healthRes, agentsRes] = await Promise.all([
                fetch('/api/v1/system/health').catch(() => null),
                fetch('/api/v1/agents').catch(() => null)
            ]);

            if (healthRes && healthRes.ok) {
                const data = await healthRes.json();
                setHealth(data.status);
            } else {
                setHealth('dead');
                throw new Error('Failed to fetch system health');
            }

            if (agentsRes && agentsRes.ok) {
                const data = await agentsRes.json();
                setActiveAgents(data.agents || []);
            }

        } catch (err: any) {
            setError(err.message || 'Connection error');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Poll for updates every 5 seconds
    useEffect(() => {
        refreshState();
        const interval = setInterval(refreshState, 5000);
        return () => clearInterval(interval);
    }, [refreshState]);

    // Mock functions for missing endpoints currently
    const startAgent = (id: string) => console.log('Start', id);
    const stopAgent = (id: string) => console.log('Stop', id);
    const restartAgent = (id: string) => console.log('Restart', id);

    return (
        <SystemStateContext.Provider value={{
            health,
            activeAgents,
            signalCount,
            confidenceAvg,
            confidenceHistory,
            signals,
            activeDebates,
            startAgent,
            stopAgent,
            restartAgent,
            refreshState,
            error,
            isLoading
        }}>
            {children}
        </SystemStateContext.Provider>
    );
}

export function useSystemState() {
    const context = useContext(SystemStateContext);
    if (context === undefined) {
        throw new Error('useSystemState must be used within a SystemStateProvider');
    }
    return context;
}
