import { SystemHealth } from '../types';

export const getSystemHealthColor = (health: SystemHealth) => {
    switch (health) {
        case 'alive': return 'var(--success-soft)';
        case 'idle': return 'var(--info-soft)';
        case 'degraded': return 'var(--warning-soft)';
        case 'dead':
        default: return 'var(--bg-muted)';
    }
};

export const getSystemHealthDotColor = (health: SystemHealth) => {
    switch (health) {
        case 'alive': return 'var(--success)';
        case 'idle': return 'var(--info)';
        case 'degraded': return 'var(--warning)';
        case 'dead':
        default: return 'var(--text-muted)';
    }
};
