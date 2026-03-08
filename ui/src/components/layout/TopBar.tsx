"use client";

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from '../../lib/theme';
import { useSystemState } from '../../contexts/SystemStateContext';

export function TopBar() {
    const pathname = usePathname();
    const { theme, setTheme, resolvedTheme } = useTheme();
    const { signalCount, health } = useSystemState();
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const getPageTitle = () => {
        const path = pathname;
        if (path.startsWith('/reasoning')) return 'Reasoning';
        if (path.startsWith('/signals')) return 'Signal Intelligence';
        if (path.startsWith('/predictions')) return 'Predictions';
        if (path.startsWith('/agents')) return 'Fleet Management';
        if (path.startsWith('/vault')) return 'Data Vault';
        if (path.startsWith('/personas')) return 'Personas';
        if (path.startsWith('/network')) return 'Network';
        if (path.startsWith('/settings')) return 'Settings';
        if (path.startsWith('/guide')) return 'Guide';
        if (path === '/') return 'Dashboard';
        return 'CIVION';
    };

    const toggleTheme = () => {
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    };

    const healthColor = {
        alive: 'bg-success',
        idle: 'bg-accent-blue',
        dead: 'bg-text-muted text-bg-card',
        degraded: 'bg-accent-amber',
        error: 'bg-danger'
    }[health] || 'bg-text-muted';

    return (
        <header className="h-[52px] bg-bg-base border-b border-border sticky top-0 z-30 flex items-center justify-between px-6">
            <div className="flex-1 flex items-center">
                <h1 className="text-lg font-semibold text-text-primary capitalize tracking-tight">
                    {getPageTitle()}
                </h1>
            </div>

            <div className="flex-1 max-w-md mx-6">
                <div
                    onClick={() => setIsSearchOpen(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-bg-subtle border border-border hover:border-text-muted rounded-lg cursor-text text-sm transition-colors group"
                >
                    <svg className="w-4 h-4 text-text-muted group-hover:text-text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span className="text-text-muted flex-1">Search signals, predictions, agents...</span>
                    <div className="hidden sm:flex items-center gap-1 font-mono text-[10px] text-text-muted bg-bg-base px-1.5 py-0.5 rounded border border-border">
                        <span>⌘</span><span>K</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex justify-end flex-shrink-0 items-center gap-4">
                {/* System Health */}
                <div className="flex items-center gap-2 py-1 px-2.5 rounded-full border border-border bg-bg-subtle" title={`System Status: ${health}`}>
                    <div className="relative flex h-2 w-2">
                        {['alive', 'running'].includes(health) &&
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${healthColor}`} />
                        }
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${healthColor}`} />
                    </div>
                    <span className="text-xs font-medium text-text-secondary capitalize">{health}</span>
                </div>

                {/* Notifications */}
                <button className="relative text-text-muted hover:text-text-primary transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {signalCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-white border border-bg-base">
                            {signalCount > 99 ? '99+' : signalCount}
                        </span>
                    )}
                </button>

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="text-text-muted hover:text-text-primary transition-colors"
                    title="Toggle theme"
                >
                    {resolvedTheme === 'dark' ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                    )}
                </button>

                {/* User Avatar */}
                <button className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-white font-semibold text-sm hover:brightness-110 transition-all">
                    U
                </button>

            </div>
        </header>
    );
}
