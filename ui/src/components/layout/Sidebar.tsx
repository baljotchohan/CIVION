'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
    { name: 'Dashboard', href: '/', icon: '📊' },
    { name: 'Reasoning', href: '/reasoning', icon: '🧠' },
    { name: 'Predictions', href: '/predictions', icon: '🔮' },
    { name: 'Personas', href: '/personas', icon: '🎭' },
    { name: 'Network', href: '/network', icon: '🌐' },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 border-r border-border-color bg-bg-secondary flex flex-col h-screen">
            <div className="p-4 border-b border-border-color">
                <h1 className="neon-text text-xl font-bold tracking-wider">CIVION</h1>
                <p className="text-text-secondary text-xs">AI COMMAND CENTER</p>
            </div>
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center space-x-3 px-4 py-2 rounded transition-all duration-200 ${isActive
                                    ? 'text-accent-primary bg-bg-tertiary border-l-2 border-accent-primary'
                                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
                                }`}
                        >
                            <span>{item.icon}</span>
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
            <div className="p-4 border-t border-border-color">
                <div className="flex items-center space-x-2">
                    <span className="status-pulse bg-success"></span>
                    <span className="text-xs text-text-secondary uppercase tracking-widest">System Online</span>
                </div>
            </div>
        </aside>
    );
}
