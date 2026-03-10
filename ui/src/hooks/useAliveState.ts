import { useSystemState } from './useSystemState';

export const useAliveState = () => {
    const { systemState } = useSystemState();
    const health = systemState.health;

    return {
        // Card glow intensity
        cardGlow: {
            dead: '0 0 0px transparent',
            idle: '0 0 10px rgba(0,212,255,0.1)',
            alive: '0 0 20px rgba(0,255,136,0.2)',
            degraded: '0 0 20px rgba(255,0,110,0.15)',
        }[health] || '0 0 0px transparent',

        // Whether pulse animations run
        shouldPulse: health === 'alive',

        // Data feed behavior
        dataMode: health === 'alive' ? 'live' : 'empty',

        // Agent card appearance
        agentVariant: health,

        // Border opacity
        borderOpacity: {
            dead: 0.05,
            idle: 0.1,
            alive: 0.2,
            degraded: 0.15
        }[health] || 0.05
    };
};
