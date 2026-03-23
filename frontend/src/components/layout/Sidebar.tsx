"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    const navGroups = [
        {
            title: "MAIN",
            items: [
                { name: "Dashboard", path: "/dashboard", icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" },
                { name: "Goals", path: "/goals", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
            ]
        },
        {
            title: "WORKSPACE",
            items: [
                { name: "Agents", path: "/dashboard/agents", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
                { name: "Conversations", path: "/dashboard/conversations", icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" },
                { name: "Debates", path: "/dashboard/debates", icon: "M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" },
                { name: "Tasks", path: "/dashboard/tasks", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
            ]
        },
        {
            title: "SYSTEM",
            items: [
                { name: "Settings", path: "/settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
            ]
        }
    ];

    return (
        <aside
            className={`relative h-screen bg-bg-subtle border-r border-border transition-all duration-300 flex flex-col z-40 ${collapsed ? 'w-16' : 'w-[220px]'}`}
        >
            {/* Header Logo */}
            <div className="h-[52px] flex items-center border-b border-border pl-6">
                <Link href="/dashboard" className="flex items-center gap-2 group">
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
                                                <span className="truncate">{item.name}</span>
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
