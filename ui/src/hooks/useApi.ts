'use client';

import { useState, useEffect, useCallback } from 'react';

const API_BASE = '/api/v1';

export function useApi<T>(endpoint: string, options: { refreshInterval?: number } = {}) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE}${endpoint}`);
            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }
            const result = await response.json();
            setData(result);
            setError(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [endpoint]);

    useEffect(() => {
        fetchData();

        if (options.refreshInterval) {
            const interval = setInterval(fetchData, options.refreshInterval);
            return () => clearInterval(interval);
        }
    }, [fetchData, options.refreshInterval]);

    return { data, loading, error, refetch: fetchData };
}
