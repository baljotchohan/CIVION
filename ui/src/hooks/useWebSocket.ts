import { useEffect, useState, useCallback, useRef } from 'react';

export type WebSocketEvent = {
    type: string;
    data: any;
    timestamp: string;
    event_id: string;
};

export const useWebSocket = () => {
    const [connected, setConnected] = useState(false);
    const [events, setEvents] = useState<WebSocketEvent[]>([]);
    const [latestEvent, setLatestEvent] = useState<WebSocketEvent | null>(null);
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        // Connect to WebSocket
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.hostname === 'localhost' ? 'localhost:8000' : window.location.host;
        const ws = new WebSocket(`${protocol}//${host}/ws`);

        ws.onopen = () => {
            console.log('WebSocket connected');
            setConnected(true);
        };

        ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data) as WebSocketEvent;
                setLatestEvent(message);
                setEvents(prev => [...prev.slice(-99), message]); // Keep last 100
            } catch (e) {
                console.error('Failed to parse WebSocket message:', e);
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            setConnected(false);
        };

        ws.onclose = () => {
            console.log('WebSocket disconnected');
            setConnected(false);
            // Attempt to reconnect after 3 seconds
            setTimeout(() => {
                // Simple logic to trigger a reconnect by re-running the effect
                // In a real app, you might use a more robust reconnection logic
            }, 3000);
        };

        wsRef.current = ws;

        // Send ping every 30 seconds to keep alive
        const pingInterval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send('ping');
            }
        }, 30000);

        return () => {
            clearInterval(pingInterval);
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, []);

    // Filter events by type
    const getEventsByType = useCallback((type: string) => {
        return events.filter(e => e.type === type);
    }, [events]);

    return {
        connected,
        events,
        latestEvent,
        getEventsByType,
    };
};

// Hook for specific event types
export const useWebSocketEvent = (eventType: string) => {
    const { latestEvent } = useWebSocket();

    return latestEvent?.type === eventType ? latestEvent.data : null;
};
