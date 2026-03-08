import { SystemHealth } from '../types';

export const getSystemHealthColor = (health: SystemHealth) => {
    switch (health) {
        case 'alive': return 'rgba(0, 255, 136, 0.3)';
        case 'idle': return 'rgba(0, 212, 255, 0.15)';
        case 'degraded': return 'rgba(255, 0, 110, 0.3)';
        case 'dead':
        default: return 'rgba(60, 60, 80, 0.4)';
    }
};

export const getSystemHealthDotColor = (health: SystemHealth) => {
    switch (health) {
        case 'alive': return '#00ff88';
        case 'idle': return '#00d4ff';
        case 'degraded': return '#ff006e';
        case 'dead':
        default: return '#3c3c50';
    }
};
