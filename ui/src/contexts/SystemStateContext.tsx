'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { SystemState, SystemHealth } from '../types';

interface SystemStateContextProps {
    systemState: SystemState;
    setSystemState: React.Dispatch<React.SetStateAction<SystemState>>;
}

const defaultState: SystemState = {
    health: 'dead',
    apiKeys: {
        anthropic: false,
        openai: false,
        github: false,
        arxiv: false,
        coingecko: false,
    },
    backendOnline: false,
    wsConnected: false,
    agentsRunning: 0,
    agentsTotal: 0,
    lastChecked: new Date().toISOString()
};

const SystemStateContext = createContext<SystemStateContextProps>({
    systemState: defaultState,
    setSystemState: () => { },
});

export const SystemStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [systemState, setSystemState] = useState<SystemState>(defaultState);

    // Watch for major state transitions to log
    useEffect(() => {
        console.log(`[SystemState] Health transitioned to: ${systemState.health}`);
    }, [systemState.health]);

    return (
        <SystemStateContext.Provider value={{ systemState, setSystemState }}>
            {children}
        </SystemStateContext.Provider>
    );
};

export const useSystemStateContext = () => useContext(SystemStateContext);
