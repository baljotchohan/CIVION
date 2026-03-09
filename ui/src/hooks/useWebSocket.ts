import { useEffect, useState, useRef } from 'react';

export const useWebSocket = () => {
    const [connected, setConnected] = useState(false);
    const [events, setEvents] = useState<any[]>([]);
    const [latestEvent, setLatestEvent] = useState<any>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const listenersRef = useRef<Map<string, Set<(data: any) => void>>>(new Map());

    useEffect(() => {
        const connect = () => {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const host = process.env.NEXT_PUBLIC_API_HOST || (window.location.hostname === 'localhost' ? 'localhost:8000' : window.location.host);
            const url = `${protocol}//${host}/ws`;

            console.log(`[WS] Connecting to ${url}...`);
            const ws = new WebSocket(url);

            ws.onopen = () => {
                console.log('[WS] Connected');
                setConnected(true);

                // Re-subscribe to all active event types on reconnect
                const activeEvents = Array.from(listenersRef.current.keys());
                if (activeEvents.length > 0) {
                    ws.send(JSON.stringify({ type: 'subscribe', events: activeEvents }));
                }
            };

            ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    setLatestEvent(message);
                    setEvents(prev => [...prev.slice(-99), message]);

                    // Call listeners for this event type
                    const handlers = listenersRef.current.get(message.type);
                    if (handlers) {
                        handlers.forEach(handler => handler(message.data || message));
                    }
                } catch (e) {
                    console.error('[WS] Parse error', e);
                }
            };

            ws.onclose = () => {
                console.log('[WS] Disconnected');
                setConnected(false);
                setTimeout(() => {
                    if (typeof window !== 'undefined') {
                        connect();
                    }
                }, 3000);
            };

            wsRef.current = ws;
        };

        connect();

        return () => {
            if (wsRef.current) {
                wsRef.current.onclose = null;
                wsRef.current.close();
            }
        };
    }, []);

    const sendMessage = (type: string, data: any) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type, data, timestamp: new Date().toISOString() }));
        }
    };

    const subscribe = (eventType: string, callback: (data: any) => void) => {
        if (!listenersRef.current.has(eventType)) {
            listenersRef.current.set(eventType, new Set());
            // Send subscribe message to server
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({ type: 'subscribe', events: [eventType] }));
            }
        }

        listenersRef.current.get(eventType)!.add(callback);

        return () => {
            const handlers = listenersRef.current.get(eventType);
            if (handlers) {
                handlers.delete(callback);
                if (handlers.size === 0) {
                    listenersRef.current.delete(eventType);
                    // Send unsubscribe message to server
                    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                        wsRef.current.send(JSON.stringify({ type: 'unsubscribe', events: [eventType] }));
                    }
                }
            }
        };
    };

    return {
        connected,
        events,
        latestEvent,
        sendMessage,
        subscribe,
        isConnected: connected
    };
};

export const useWebSocketEvent = <T = any>(eventType: string): T | null => {
    const { subscribe } = useWebSocket();
    const [data, setData] = useState<T | null>(null);

    useEffect(() => {
        return subscribe(eventType, (eventData) => {
            setData(eventData);
        });
    }, [subscribe, eventType]);

    return data;
};
