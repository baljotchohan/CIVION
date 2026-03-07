/**
 * CIVION API Client
 * Fetch-based API client for all backend endpoints.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_V1 = `${API_BASE}/api/v1`;

async function request<T>(url: string, options?: RequestInit): Promise<T> {
    const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json', ...options?.headers },
        ...options,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
}

// ── Goals ──────────────────────────────────────────
export const goalsApi = {
    list: () => request<any[]>(`${API_V1}/goals`),
    get: (id: string) => request<any>(`${API_V1}/goals/${id}`),
    create: (data: { title: string; description?: string; priority?: number }) =>
        request<any>(`${API_V1}/goals`, { method: 'POST', body: JSON.stringify(data) }),
    decompose: (id: string) => request<any>(`${API_V1}/goals/${id}/decompose`, { method: 'POST' }),
    execute: (id: string) => request<any>(`${API_V1}/goals/${id}/execute`, { method: 'POST' }),
    progress: (id: string) => request<any>(`${API_V1}/goals/${id}/progress`),
    delete: (id: string) => request<any>(`${API_V1}/goals/${id}`, { method: 'DELETE' }),
};

// ── Agents ─────────────────────────────────────────
export const agentsApi = {
    list: () => request<any[]>(`${API_V1}/agents`),
    get: (name: string) => request<any>(`${API_V1}/agents/${name}`),
    start: (name: string) => request<any>(`${API_V1}/agents/${name}/start`, { method: 'POST' }),
    stop: (name: string) => request<any>(`${API_V1}/agents/${name}/stop`, { method: 'POST' }),
    restart: (name: string) => request<any>(`${API_V1}/agents/${name}/restart`, { method: 'POST' }),
    run: (name: string) => request<any>(`${API_V1}/agents/${name}/run`, { method: 'POST' }),
    logs: (name: string) => request<any[]>(`${API_V1}/agents/${name}/logs`),
    runAll: () => request<any[]>(`${API_V1}/agents/run-all`, { method: 'POST' }),
};

// ── Signals ────────────────────────────────────────
export const signalsApi = {
    list: (source?: string) => request<any[]>(`${API_V1}/signals${source ? `?source=${source}` : ''}`),
    get: (id: string) => request<any>(`${API_V1}/signals/${id}`),
    summary: () => request<any>(`${API_V1}/signals/summary`),
    patterns: () => request<any[]>(`${API_V1}/signals/patterns`),
};

// ── Insights ───────────────────────────────────────
export const insightsApi = {
    list: (limit?: number) => request<any[]>(`${API_V1}/insights${limit ? `?limit=${limit}` : ''}`),
    get: (id: string) => request<any>(`${API_V1}/insights/${id}`),
    search: (query: string) => request<any[]>(`${API_V1}/insights/search/${query}`),
};

// ── Predictions ────────────────────────────────────
export const predictionsApi = {
    list: () => request<any[]>(`${API_V1}/predictions`),
    get: (id: string) => request<any>(`${API_V1}/predictions/${id}`),
    accuracy: () => request<any>(`${API_V1}/predictions/accuracy`),
    analyze: (insights: any[]) =>
        request<any[]>(`${API_V1}/predictions/analyze`, { method: 'POST', body: JSON.stringify(insights) }),
};

// ── Personas ───────────────────────────────────────
export const personasApi = {
    list: () => request<any[]>(`${API_V1}/personas`),
    get: (id: string) => request<any>(`${API_V1}/personas/${id}`),
    create: (data: { name: string; description?: string; prompt?: string; style?: string }) =>
        request<any>(`${API_V1}/personas`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
        request<any>(`${API_V1}/personas/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<any>(`${API_V1}/personas/${id}`, { method: 'DELETE' }),
};

// ── Reasoning ──────────────────────────────────────
export const reasoningApi = {
    list: () => request<any[]>(`${API_V1}/reasoning`),
    get: (id: string) => request<any>(`${API_V1}/reasoning/${id}`),
    debate: (id: string) => request<any>(`${API_V1}/reasoning/${id}/debate`),
    start: (topic: string) => request<any>(`${API_V1}/reasoning/start?topic=${topic}`, { method: 'POST' }),
};

// ── Network ────────────────────────────────────────
export const networkApi = {
    status: () => request<any>(`${API_V1}/network/status`),
    peers: () => request<any[]>(`${API_V1}/network/peers`),
    join: (network: string) =>
        request<any>(`${API_V1}/network/join`, { method: 'POST', body: JSON.stringify({ network }) }),
    consensus: () => request<any>(`${API_V1}/network/consensus`),
};

// ── System ─────────────────────────────────────────
export const systemApi = {
    status: () => request<any>(`${API_V1}/system/status`),
    health: () => request<any>(`${API_V1}/system/health`),
    config: () => request<any>(`${API_V1}/system/config`),
    stats: () => request<any>(`${API_V1}/system/stats`),
};

// ── Marketplace ────────────────────────────────────
export const marketplaceApi = {
    agents: (query?: string) => request<any[]>(`${API_V1}/marketplace/agents${query ? `?query=${query}` : ''}`),
    personas: (query?: string) => request<any[]>(`${API_V1}/marketplace/personas${query ? `?query=${query}` : ''}`),
    install: (name: string) => request<any>(`${API_V1}/marketplace/install/${name}`, { method: 'POST' }),
};

// ── Events ─────────────────────────────────────────
export const eventsApi = {
    list: (limit?: number) => request<any[]>(`${API_V1}/events${limit ? `?limit=${limit}` : ''}`),
};

// ── Memory ─────────────────────────────────────────
export const memoryApi = {
    graph: () => request<any>(`${API_V1}/memory`),
    stats: () => request<any>(`${API_V1}/memory/stats`),
    search: (query: string) => request<any[]>(`${API_V1}/memory/search/${query}`),
};
