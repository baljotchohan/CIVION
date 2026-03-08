'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { SystemState, SystemHealth } from '../types';

interface SystemStateContextProps {
    systemState: SystemState;
    setSystemState: React.Dispatch<React.SetStateAction<SystemState>>;
    showWakeAnimation: boolean;
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
    showWakeAnimation: false,
});

export const SystemStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [systemState, setSystemState] = useState<SystemState>(defaultState);
    const [showWakeAnimation, setShowWakeAnimation] = useState(false);
    const prevHealth = React.useRef<SystemHealth>('dead');

    useEffect(() => {
        if (
            (prevHealth.current === 'dead' || prevHealth.current === 'idle')
            && systemState.health === 'alive'
        ) {
            setShowWakeAnimation(true);
            setTimeout(() => setShowWakeAnimation(false), 2600);
        }
        prevHealth.current = systemState.health;
    }, [systemState.health]);

    // Watch for major state transitions to log
    useEffect(() => {
        console.log(`[SystemState] Health transitioned to: ${systemState.health}`);
    }, [systemState.health]);

    return (
        <SystemStateContext.Provider value={{ systemState, setSystemState, showWakeAnimation }}>
            {children}
        </SystemStateContext.Provider>
    );
};

export const useSystemStateContext = () => useContext(SystemStateContext);
