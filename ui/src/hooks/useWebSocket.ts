'use client';
import { useEffect, useRef, useState, useCallback } from 'react';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';

export function useWebSocket() {
    const [connected, setConnected] = useState(false);
    const [lastEvent, setLastEvent] = useState<any>(null);
    const [events, setEvents] = useState<any[]>([]);
    const wsRef = useRef<WebSocket | null>(null);

    const connect = useCallback(() => {
        try {
            const ws = new WebSocket(WS_URL);
            wsRef.current = ws;

            ws.onopen = () => setConnected(true);
            ws.onclose = () => {
                setConnected(false);
                setTimeout(connect, 3000); // Auto reconnect
            };
            ws.onmessage = (e) => {
                try {
                    const event = JSON.parse(e.data);
                    setLastEvent(event);
                    setEvents(prev => [event, ...prev].slice(0, 100));
                } catch { }
            };
            ws.onerror = () => ws.close();
        } catch { }
    }, []);

    useEffect(() => {
        connect();
        return () => wsRef.current?.close();
    }, [connect]);

    return { connected, lastEvent, events };
}
