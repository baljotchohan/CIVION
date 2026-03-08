import { SignalSource } from '../types';

export function formatConfidence(score: number): string {
    return `${(score * 100).toFixed(1)}%`;
}

export function formatUptime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h}h ${m}m ${s}s`;
}

export function formatTimestamp(ts: string): string {
    try {
        return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
        return ts;
    }
}

export function formatRelativeTime(ts: string): string {
    try {
        const time = new Date(ts).getTime();
        const now = Date.now();
        const diffInSeconds = Math.floor((now - time) / 1000);

        if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} hours ago`;
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays} days ago`;
    } catch {
        return ts;
    }
}

export function getSourceIcon(source: SignalSource): string {
    switch (source.toLowerCase()) {
        case 'github': return '🐙';
        case 'arxiv': return '📄';
        case 'market': return '📈';
        case 'security': return '🛡️';
        case 'news': return '📰';
        case 'network': return '🌐';
        default: return '📡';
    }
}

export function getSourceColor(source: SignalSource): string {
    switch (source.toLowerCase()) {
        case 'github': return '#00ff88';
        case 'arxiv': return '#00d4ff';
        case 'market': return '#ff006e';
        case 'security': return '#ff9900';
        case 'news': return '#9b59b6';
        case 'network': return '#ffffff';
        default: return '#a0a0a0';
    }
}

export function truncateText(text: string, maxLength: number): string {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

export function classNames(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(' ');
}
