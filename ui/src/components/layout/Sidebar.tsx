"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSystemState } from '../../contexts/SystemStateContext';
import { AgentStatusDot } from '../ui/AgentStatusDot';

export function Sidebar() {
    const pathname = usePathname();
    const { signalCount, activeAgents, activeDebates } = useSystemState();
    const [collapsed, setCollapsed] = useState(false);

    const navGroups = [
        {
            title: "INTELLIGENCE",
            items: [
                { name: "Dashboard", path: "/", icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" },
                { name: "Reasoning", path: "/reasoning", icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4", badge: activeDebates.length > 0 ? <span className="w-2 h-2 rounded-full bg-success"></span> : null },
                { name: "Signals", path: "/signals", icon: "M13 10V3L4 14h7v7l9-11h-7z", badge: signalCount > 0 ? <span className="px-1.5 py-0.5 rounded-md bg-accent/10 text-accent text-[10px] font-bold">{signalCount}</span> : null },
                { name: "Predictions", path: "/predictions", icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" }
            ]
        },
        {
            title: "AGENTS",
            items: [
                { name: "My Agents", path: "/agents", icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", badge: activeAgents.length > 0 ? <span className="px-1.5 py-0.5 rounded-md bg-bg-muted text-text-secondary text-[10px] font-bold">{activeAgents.length}</span> : null },
                { name: "Data Vault", path: "/vault", icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" }
            ]
        },
        {
            title: "PERSONAL",
            items: [
                { name: "Personas", path: "/personas", icon: "M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" },
                { name: "Network", path: "/network", icon: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" }
            ]
        },
        {
            title: "SYSTEM",
            items: [
                { name: "Settings", path: "/settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
                { name: "Guide", path: "/guide", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" }
            ]
        }
    ];

    return (
        <aside
            className={`relative h-screen bg-bg-subtle border-r border-border transition-all duration-300 flex flex-col z-40 ${collapsed ? 'w-16' : 'w-[220px]'}`}
        >
            {/* Header Logo */}
            <div className="h-[52px] flex items-center border-b border-border pl-4">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="relative w-6 h-6 shrink-0 text-accent group-hover:scale-105 transition-transform">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="7" r="4" fill="currentColor" fillOpacity="0.8" />
                            <circle cx="7" cy="15" r="4" fill="currentColor" fillOpacity="0.9" />
                            <circle cx="17" cy="15" r="4" fill="currentColor" fillOpacity="0.7" />
                        </svg>
                    </div>
                    {!collapsed && (
                        <span className="font-bold text-lg tracking-tight text-text-primary whitespace-nowrap">
                            civion
                        </span>
                    )}
                </Link>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-4 noscrollbar">
                {navGroups.map((group, idx) => (
                    <div key={idx} className="mb-6">
                        {!collapsed && (
                            <div className="px-4 mb-2 text-[11px] font-bold text-text-muted tracking-wider">
                                {group.title}
                            </div>
                        )}
                        <ul className="space-y-0.5">
                            {group.items.map((item) => {
                                const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
                                return (
                                    <li key={item.path} className="px-2">
                                        <Link
                                            href={item.path}
                                            className={`
                        flex items-center gap-3 px-2 py-2 rounded-lg transition-colors group relative
                        ${isActive
                                                    ? 'bg-accent-soft text-accent font-medium'
                                                    : 'text-text-secondary hover:bg-bg-muted hover:text-text-primary'}
                      `}
                                            title={collapsed ? item.name : undefined}
                                        >
                                            {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-accent rounded-r-full" />}
                                            <svg className={`w-5 h-5 shrink-0 ${isActive ? 'text-accent' : 'text-text-muted group-hover:text-text-primary'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                            </svg>
                                            {!collapsed && (
                                                <div className="flex-1 flex items-center justify-between min-w-0">
                                                    <span className="truncate">{item.name}</span>
                                                    {item.badge}
                                                </div>
                                            )}
                                            {collapsed && item.badge && (
                                                <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent" />
                                            )}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </div>

            {/* Footer toggle & collapse */}
            <div className="p-2 border-t border-border flex flex-col gap-2">
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-2 w-full flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-muted rounded-lg transition-colors"
                    title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    <svg className={`w-5 h-5 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    </svg>
                </button>
            </div>
        </aside>
    );
}
