import { DataMode, SystemHealth } from '../types';

export const getDataMode = (systemHealth: SystemHealth): DataMode => {
    if (systemHealth === 'alive') return 'live';
    return 'empty';
};

export const isDemoMode = (): boolean => {
    // Read from an environment variable or similar setting. If missing, default to false.
    if (typeof window !== 'undefined') {
        const demoMode = localStorage.getItem('civion_demo_mode');
        return demoMode === 'true';
    }
    return false;
};
