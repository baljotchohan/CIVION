/**
 * CIVION TypeScript Types
 */

export interface Goal {
    id: string;
    title: string;
    description: string;
    state: 'created' | 'decomposed' | 'executing' | 'completed' | 'failed';
    priority: number;
    tasks: Task[];
    progress: number;
    created_at: string;
    updated_at: string;
}

export interface Task {
    id: string;
    title: string;
    agent: string;
    priority: number;
    description: string;
    status: 'pending' | 'running' | 'completed' | 'skipped';
    created_at: string;
}

export interface Agent {
    name: string;
    description: string;
    state: 'idle' | 'scanning' | 'analyzing' | 'reporting' | 'error' | 'stopped';
    running: boolean;
    scan_count: number;
    last_run: string | null;
    error_count: number;
    total_insights: number;
    total_signals: number;
}

export interface Signal {
    id: string;
    title: string;
    description: string;
    source: string;
    signal_type: string;
    strength: number;
    detected_at: string;
}

export interface Insight {
    id: string;
    title: string;
    content: string;
    source: string;
    agent_name: string;
    confidence: number;
    tags: string[];
    created_at: string;
}

export interface Prediction {
    id: string;
    prediction: string;
    confidence: number;
    timeframe: string;
    source_signals: string[];
    created_at: string;
}

export interface Persona {
    id: string;
    name: string;
    description: string;
    system_prompt: string;
    reasoning_style: string;
    is_shared: boolean;
    created_at: string;
}

export interface ReasoningLoop {
    id: string;
    topic: string;
    hypothesis: string;
    arguments: ReasoningArgument[];
    consensus: string;
    final_confidence: number;
    state: string;
    created_at: string;
}

export interface ReasoningArgument {
    agent: string;
    position: 'support' | 'challenge';
    argument: string;
    confidence: number;
}

export interface NetworkPeer {
    id: string;
    url: string;
    status: string;
    last_seen: string;
}

export interface SystemStatus {
    status: string;
    version: string;
    agents: { total: number; active: number };
    data: { goals: number; insights: number; signals: number; predictions: number };
}

export interface MarketplaceItem {
    name: string;
    description: string;
    author: string;
    downloads: number;
    rating: number;
}

export interface CivionEvent {
    type: string;
    data: Record<string, any>;
    timestamp: string;
}
