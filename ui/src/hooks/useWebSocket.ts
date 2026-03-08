import { useEffect, useState, useCallback } from 'react';

export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error';

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

export interface WebSocketMessage<T = any> {
    type: WebSocketEventType;
    data: T;
    timestamp?: string;
    event_id?: string;
}

type MessageHandler = (data: any) => void;

// Global singleton state to share connection across components
let wsInstance: WebSocket | null = null;
let currentState: ConnectionState = 'disconnected';
const stateListeners = new Set<(state: ConnectionState) => void>();
const messageListeners = new Map<string, Set<MessageHandler>>();
let messageQueue: string[] = [];
let retryCount = 0;
let reconnectTimer: NodeJS.Timeout | null = null;
let pingTimer: NodeJS.Timeout | null = null;
let connectionRefs = 0;

const notifyStateChange = (state: ConnectionState) => {
    currentState = state;
    stateListeners.forEach((listener) => listener(state));
};

const emitMessage = (type: string, data: any) => {
    const listeners = messageListeners.get(type);
    if (listeners) {
        listeners.forEach((listener) => listener(data));
    }
};

const getWebSocketUrl = () => {
    if (typeof window === 'undefined') return '';
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname === 'localhost' ? 'localhost:8000' : window.location.host;
    return `${protocol}//${host}/ws`;
};

const connectWebSocket = () => {
    if (typeof window === 'undefined') return;
    if (wsInstance?.readyState === WebSocket.OPEN || wsInstance?.readyState === WebSocket.CONNECTING) return;

    notifyStateChange('connecting');

    try {
        const wsUrl = getWebSocketUrl();
        wsInstance = new WebSocket(wsUrl);

        wsInstance.onopen = () => {
            notifyStateChange('connected');
            retryCount = 0; // Reset backoff

            // Start heartbeat ping every 30s
            if (pingTimer) clearInterval(pingTimer);
            pingTimer = setInterval(() => {
                if (wsInstance?.readyState === WebSocket.OPEN) {
                    wsInstance.send(JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() }));
                }
            }, 30000);

            // Replay queued messages
            while (messageQueue.length > 0) {
                const msg = messageQueue.shift();
                if (msg && wsInstance.readyState === WebSocket.OPEN) {
                    wsInstance.send(msg);
                }
            }
        };

        wsInstance.onmessage = (event) => {
            try {
                const messageVal = typeof event.data === 'string' ? JSON.parse(event.data) : null;
                if (!messageVal || !messageVal.type) return;

                if (messageVal.type === 'pong') return; // Ignore pong responses
                emitMessage(messageVal.type, messageVal.data);
            } catch (err) {
                // Silent catch for parsing errors
            }
        };

        wsInstance.onclose = () => {
            notifyStateChange('disconnected');
            if (pingTimer) {
                clearInterval(pingTimer);
                pingTimer = null;
            }
            wsInstance = null;
            scheduleReconnect();
        };

        wsInstance.onerror = () => {
            notifyStateChange('error');
            // onclose will follow, handling reconnect
        };
    } catch (error) {
        notifyStateChange('error');
        scheduleReconnect();
    }
};

const scheduleReconnect = () => {
    if (reconnectTimer) clearTimeout(reconnectTimer);
    if (connectionRefs <= 0) return; // Don't reconnect if no components are using it

    // Exponential backoff: 1s, 2s, 4s, 8s, max 30s
    const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);
    retryCount++;

    reconnectTimer = setTimeout(() => {
        connectWebSocket();
    }, delay);
};

const disconnectWebSocket = () => {
    if (reconnectTimer) clearTimeout(reconnectTimer);
    if (pingTimer) clearInterval(pingTimer);
    if (wsInstance) {
        // Remove onclose to prevent auto-reconnect
        wsInstance.onclose = null;
        wsInstance.close();
        wsInstance = null;
    }
    notifyStateChange('disconnected');
};

export const useWebSocket = () => {
    const [connectionState, setConnectionState] = useState<ConnectionState>(currentState);

    useEffect(() => {
        // Global connection ref counting
        connectionRefs++;
        if (connectionRefs === 1 && currentState === 'disconnected') {
            connectWebSocket();
        }

        const onStateChange = (state: ConnectionState) => setConnectionState(state);
        stateListeners.add(onStateChange);

        return () => {
            stateListeners.delete(onStateChange);
            connectionRefs--;
            if (connectionRefs === 0) {
                disconnectWebSocket();
            }
        };
    }, []);

    const sendMessage = useCallback((type: WebSocketEventType, data: any) => {
        const rawMsg = JSON.stringify({
            type,
            data,
            timestamp: new Date().toISOString()
        });

        if (wsInstance?.readyState === WebSocket.OPEN) {
            wsInstance.send(rawMsg);
        } else {
            messageQueue.push(rawMsg);
        }
    }, []);

    const subscribe = useCallback((type: WebSocketEventType, handler: MessageHandler) => {
        if (!messageListeners.has(type)) {
            messageListeners.set(type, new Set());
        }
        const handlers = messageListeners.get(type)!;
        handlers.add(handler);

        return () => {
            handlers.delete(handler);
            if (handlers.size === 0) {
                messageListeners.delete(type);
            }
        };
    }, []);

    return {
        connectionState,
        sendMessage,
        subscribe,
        isConnected: connectionState === 'connected'
    };
};

export const useWebSocketEvent = <T = any>(eventType: WebSocketEventType): T | null => {
    const [data, setData] = useState<T | null>(null);
    const { subscribe } = useWebSocket();

    useEffect(() => {
        const unsubscribe = subscribe(eventType, (newData: T) => {
            setData(newData);
        });
        return () => unsubscribe();
    }, [eventType, subscribe]);

    return data;
};
