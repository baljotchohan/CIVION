export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error';
export type AgentRole = 'proposer' | 'challenger' | 'verifier' | 'synthesizer';
export type AgentStatus = 'running' | 'stopped' | 'error' | 'paused';
export type ConfidenceAction = 'verified' | 'challenged' | 'confirmed' | 'verifying' | 'rejected';
export type SignalSource = 'github' | 'arxiv' | 'market' | 'security' | 'news' | 'network';

export type WebSocketEventType =
    | 'reasoning_updated'
    | 'confidence_changed'
    | 'prediction_made'
    | 'agent_started'
    | 'agent_stopped'
    | 'agent_error'
    | 'agent_task_updated'
    | 'signal_detected'
    | 'insight_generated'
    | 'network_signal_received'
    | 'peer_joined'
    | 'peer_left'
    | 'ping'
    | 'pong';

export interface ConfidenceStep {
    agent: string;
    action: ConfidenceAction;
    confidence_before: number;
    confidence_after: number;
    timestamp: string;
    reason: string;
}

export interface DebateMessage {
    id: string;
    agent_name: string;
    role: AgentRole;
    content: string;
    confidence: number;
    timestamp: string;
    is_final: boolean;
}

export interface Agent {
    id: string;
    name: string;
    type: string;
    status: AgentStatus;
    last_active: string;
    signals_found: number;
    current_task: string | null;
    uptime_seconds: number;
    error_message?: string;
}

export interface Prediction {
    id: string;
    title: string;
    description: string;
    probability: number;
    timeframe: string;
    evidence: string[];
    created_at: string;
    resolved: boolean;
    outcome: boolean | null;
    accuracy: number | null;
    shared_count: number;
    tags: string[];
}

export interface Persona {
    id: string;
    name: string;
    description: string;
    analysis_style: string;
    topics: string[];
    sample_analysis: string;
    usage_count: number;
    created_at: string;
    color: string;
    emoji: string;
    is_shared: boolean;
}

export interface Signal {
    id: string;
    source: SignalSource;
    title: string;
    description: string;
    confidence: number;
    strength: number;
    signal_type: string;
    timestamp: string;
    evidence: string[];
    tags: string[];
    url?: string;
}

export interface Peer {
    id: string;
    name: string;
    location: string;
    lat: number;
    lng: number;
    findings_count: number;
    reputation: number;
    last_seen: string;
    shared_signals: number;
}

export interface SharedSignal {
    id: string;
    from_peer: string;
    to_peer: string;
    signal_id: string;
    timestamp: string;
}

export interface SystemStats {
    active_agents: number;
    signals_today: number;
    predictions_made: number;
    network_peers: number;
    uptime_seconds: number;
    confidence_avg: number;
    version: string;
}
