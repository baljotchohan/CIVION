"use client";

import { useEffect, useState } from "react";

export function useAgents() {
    const [agents, setAgents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("http://localhost:8000/api/agents")
            .then(res => res.json())
            .then(data => {
                setAgents(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    return { agents, loading };
}

export function useSignals() {
    const [signals, setSignals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("http://localhost:8000/api/signals")
            .then(res => res.json())
            .then(data => {
                setSignals(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    return { signals, loading };
}

export function useInsights(limit = 20) {
    const [insights, setInsights] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`http://localhost:8000/api/insights?limit=${limit}`)
            .then(res => res.json())
            .then(data => {
                setInsights(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [limit]);

    return { insights, loading };
}

export function useSystemStatus() {
    const [status, setStatus] = useState<any>(null);

    useEffect(() => {
        const fetchStatus = () => {
            fetch("http://localhost:8000/api/system/status")
                .then(res => res.json())
                .then(data => setStatus(data))
                .catch(() => { });
        };

        fetchStatus();
        const inv = setInterval(fetchStatus, 5000);
        return () => clearInterval(inv);
    }, []);

    return status;
}
export function useEvents() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("http://localhost:8000/api/events")
            .then(res => res.json())
            .then(data => {
                setEvents(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    return { events, loading };
}

export function useLogs() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = () => {
        setLoading(true);
        fetch("http://localhost:8000/api/logs")
            .then(res => res.json())
            .then(data => {
                setLogs(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        refresh();
    }, []);

    return { logs, loading, refresh };
}

export function useWebSocket() {
    // Simple WebSocket hook for real-time events
    useEffect(() => {
        const ws = new WebSocket("ws://localhost:8000/ws");
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("WS Event:", data);
            // We could use a global event emitter or context here
        };
        return () => ws.close();
    }, []);
}
