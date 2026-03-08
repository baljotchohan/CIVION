import {
    SystemStats,
    Agent,
    Prediction,
    Persona,
    Signal,
    Peer
} from '../types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_V1 = `${API_BASE}/api/v1`;

export class ApiError extends Error {
    public status?: number;
    constructor(message: string, status?: number) {
        super(message);
        this.status = status;
        this.name = 'ApiError';
    }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${API_V1}${endpoint}`, {
        headers: { 'Content-Type': 'application/json', ...options?.headers },
        ...options,
    });
    if (!res.ok) {
        let message = `HTTP ${res.status}`;
        try {
            const err = await res.json();
            if (err.error) message = err.error;
            else if (err.detail) message = err.detail;
        } catch (e) {
            message = res.statusText || message;
        }
        throw new ApiError(message, res.status);
    }
    return res.json();
}

// ── System ─────────────────────────────────────────
export const getStats = () => fetchApi<SystemStats>('/system/stats');

// ── Agents ─────────────────────────────────────────
export const getAgents = () => fetchApi<Agent[]>('/agents');
export const startAgent = (id: string) => fetchApi<void>(`/agents/${id}/start`, { method: 'POST' });
export const stopAgent = (id: string) => fetchApi<void>(`/agents/${id}/stop`, { method: 'POST' });
export const restartAgent = (id: string) => fetchApi<void>(`/agents/${id}/restart`, { method: 'POST' });
export const getAgentLogs = (id: string) => fetchApi<string[]>(`/agents/${id}/logs`);

// ── Predictions ────────────────────────────────────
export const getPredictions = (filters?: string) => fetchApi<Prediction[]>(`/predictions${filters || ''}`);
export const analyzePrediction = (goal: string) => fetchApi<Prediction[]>('/predictions/analyze', { method: 'POST', body: JSON.stringify({ goal }) });

// ── Personas ───────────────────────────────────────
export const getPersonas = () => fetchApi<Persona[]>('/personas');
export const createPersona = (data: Partial<Persona>) => fetchApi<Persona>('/personas', { method: 'POST', body: JSON.stringify(data) });
export const sharePersona = (id: string) => fetchApi<void>(`/personas/${id}/share`, { method: 'POST' });

// ── Signals ────────────────────────────────────────
export const getSignals = (filters?: string) => fetchApi<Signal[]>(`/signals${filters || ''}`);

// ── Network ────────────────────────────────────────
export const getNetwork = () => fetchApi<{ peers: Peer[], status: object }>('/network');
export const joinNetwork = () => fetchApi<void>('/network/join', { method: 'POST' });

// ── Reasoning ──────────────────────────────────────
export const getReasoningLoops = () => fetchApi<object[]>('/reasoning');
export const startReasoningSession = (goal: string) => fetchApi<object>('/reasoning', { method: 'POST', body: JSON.stringify({ goal }) });
