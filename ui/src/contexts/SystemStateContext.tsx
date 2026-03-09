"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

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
    needsOnboarding: boolean;
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
    const [needsOnboarding, setNeedsOnboarding] = useState(false);

    const { subscribe } = useWebSocket();

    const signalCount = signals.length;
    // Compute average confidence from latest history
    const confidenceAvg = confidenceHistory.length > 0
        ? confidenceHistory[confidenceHistory.length - 1].confidence
        : 0;

    const refreshState = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const [healthRes, agentsRes, signalsRes, confRes, debatesRes] = await Promise.all([
                fetch('/api/v1/system/health').catch(() => null),
                fetch('/api/v1/agents').catch(() => null),
                fetch('/api/v1/signals?limit=20').catch(() => null),
                fetch('/api/v1/reasoning/confidence-history').catch(() => null),
                fetch('/api/v1/reasoning/active').catch(() => null)
            ]);

            if (healthRes && healthRes.ok) {
                const data = await healthRes.json();
                setHealth(data.health || data.status); // Use data.health if available, fallback to data.status

                if (data.status === 'dead' && typeof window !== 'undefined' && !window.localStorage.getItem('civion_onboarded')) {
                    const profileRes = await fetch('/api/v1/nick/profile').catch(() => null);
                    if (profileRes && profileRes.ok) {
                        const profileData = await profileRes.json();
                        if (!profileData.name) {
                            setNeedsOnboarding(true);
                        } else {
                            window.localStorage.setItem('civion_onboarded', '1');
                        }
                    } else if (!profileRes || profileRes.status === 404) {
                        setNeedsOnboarding(true);
                    }
                }
            } else {
                setHealth('dead');
                throw new Error('Failed to fetch system health');
            }

            if (agentsRes && agentsRes.ok) {
                const data = await agentsRes.json();
                setActiveAgents(Array.isArray(data) ? data : (data.agents || []));
            }

            if (signalsRes && signalsRes.ok) {
                const data = await signalsRes.json();
                setSignals(data.signals || []);
            }

            if (confRes && confRes.ok) {
                const data = await confRes.json();
                setConfidenceHistory(data.history || []);
            }

            if (debatesRes && debatesRes.ok) {
                const data = await debatesRes.json();
                setActiveDebates(data.debates || []);
            }

        } catch (err: any) {
            setError(err.message || 'Connection error');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // WebSocket Integration
    useEffect(() => {
        const unsubAgent = subscribe('agent_update', (data: Agent) => {
            setActiveAgents(prev => prev.map(a => a.id === data.id ? { ...a, ...data } : a));
        });

        const unsubSignal = subscribe('signal_detected', (data: Signal) => {
            setSignals(prev => [data, ...prev.slice(0, 19)]); // Keep max 20 signals
        });

        const unsubHealth = subscribe('health_update', (data: { health: SystemHealth }) => {
            setHealth(data.health);
        });

        return () => {
            unsubAgent();
            unsubSignal();
            unsubHealth();
        };
    }, [subscribe]);

    // Poll for updates every 30 seconds as fallback (reduced from 5s)
    useEffect(() => {
        refreshState();
        const interval = setInterval(refreshState, 30000);
        return () => clearInterval(interval);
    }, [refreshState]);

    const startAgent = async (id: string) => {
        try {
            await fetch(`/api/v1/agents/${id}/start`, { method: 'POST' });
            await refreshState();
        } catch (e) {
            console.error(e);
        }
    };

    const stopAgent = async (id: string) => {
        try {
            await fetch(`/api/v1/agents/${id}/stop`, { method: 'POST' });
            await refreshState();
        } catch (e) {
            console.error(e);
        }
    };

    const restartAgent = async (id: string) => {
        try {
            await fetch(`/api/v1/agents/${id}/restart`, { method: 'POST' });
            await refreshState();
        } catch (e) {
            console.error(e);
        }
    };

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
            isLoading,
            needsOnboarding
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
