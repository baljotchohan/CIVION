import { useEffect, useState } from 'react';
import { useSystemStateContext } from '../contexts/SystemStateContext';
import { useWebSocket } from './useWebSocket';
import { getSystemHealth } from '../lib/api';

export const useSystemState = () => {
    const { systemState, setSystemState } = useSystemStateContext();
    const [isLoading, setIsLoading] = useState(true);
    const { subscribe } = useWebSocket();

    const fetchHealth = async () => {
        try {
            const healthData = await getSystemHealth();
            setSystemState({
                health: healthData.health,
                apiKeys: healthData.api_keys,
                backendOnline: healthData.backend_online,
                wsConnected: true, // If we can fetch, we might have ws, but ws connection state is separate
                agentsRunning: healthData.agents_running,
                agentsTotal: healthData.agents_total,
                lastChecked: new Date().toISOString()
            });
        } catch (error) {
            setSystemState(prev => ({ ...prev, backendOnline: false, health: 'dead' }));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHealth();
        const pollInterval = setInterval(fetchHealth, 10000);

        const unsubConfig = subscribe('config_updated', () => {
            fetchHealth();
        });

        // Also listen for agent state changes to update health
        const unsubStarted = subscribe('agent_started', () => fetchHealth());
        const unsubStopped = subscribe('agent_stopped', () => fetchHealth());
        const unsubError = subscribe('agent_error', () => fetchHealth());

        return () => {
            clearInterval(pollInterval);
            unsubConfig();
            unsubStarted();
            unsubStopped();
            unsubError();
        };
    }, [subscribe]);

    return { systemState, isLoading, setSystemState };
};
