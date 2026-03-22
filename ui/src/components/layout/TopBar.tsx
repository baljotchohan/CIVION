"use client";

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from '../../lib/theme';
import { useUserStore } from '@/store/userStore';

export function TopBar() {
    const pathname = usePathname();
    const { theme, setTheme, resolvedTheme } = useTheme();
    const { profile, hasApiKey } = useUserStore();
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const getPageTitle = () => {
        const path = pathname;
        if (path.startsWith('/dashboard')) return 'Dashboard';
        if (path.startsWith('/goals')) return 'Goals';
        if (path.startsWith('/settings')) return 'Settings';
        if (path.startsWith('/onboarding')) return 'Setup';
        if (path === '/') return 'CIVION';
        return 'CIVION';
    };

    const toggleTheme = () => {
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    };

    const health = hasApiKey ? 'alive' : 'dead';
    const healthColor = {
        alive: 'bg-success',
        dead: 'bg-text-muted',
    }[health];

    const initials = profile?.name
        ? profile.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
        : 'U';

    return (
        <header className="h-[52px] bg-bg-base border-b border-border sticky top-0 z-30 flex items-center justify-between px-6">
            <div className="flex-1 flex items-center">
                <h1 className="text-lg font-semibold text-text-primary capitalize tracking-tight">
                    {getPageTitle()}
                </h1>
            </div>

            <div className="flex-1 flex justify-end flex-shrink-0 items-center gap-4">
                {/* System Health */}
                <div className="flex items-center gap-2 py-1 px-2.5 rounded-full border border-border bg-bg-subtle" title={`System: ${health}`}>
                    <div className="relative flex h-2 w-2">
                        {health === 'alive' &&
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${healthColor}`} />
                        }
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${healthColor}`} />
                    </div>
                    <span className="text-xs font-medium text-text-secondary capitalize">{health === 'alive' ? 'Online' : 'Offline'}</span>
                </div>

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
                    {initials}
                </button>
            </div>
        </header>
    );
}
