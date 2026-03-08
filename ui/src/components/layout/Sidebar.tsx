'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Brain, Bot, Lightbulb, Activity,
    Users, Globe, ShoppingCart, Settings, ChevronLeft, ChevronRight,
    ShieldAlert
} from 'lucide-react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useSystemState } from '../../hooks/useSystemState';
import { classNames } from '../../lib/utils';

const NAV_ITEMS = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Reasoning', path: '/reasoning', icon: Brain },
    { name: 'Agents', path: '/agents', icon: Bot },
    { name: 'Predictions', path: '/predictions', icon: Lightbulb },
    { name: 'Signals', path: '/signals', icon: Activity },
    { name: 'Personas', path: '/personas', icon: Users },
    { name: 'Network', path: '/network', icon: Globe },
    { name: 'Marketplace', path: '/marketplace', icon: ShoppingCart },
    { name: 'Settings', path: '/settings', icon: Settings },
];

export const Sidebar = () => {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { isConnected } = useWebSocket();
    const { systemState } = useSystemState();
    const { health, agentsRunning, agentsTotal } = systemState;

    // Determine top health bar style
    const getHealthBarClass = () => {
        switch (health) {
            case 'dead': return 'bg-[#3c3c50] shadow-none';
            case 'idle': return 'bg-[#00d4ff] shadow-[0_0_10px_rgba(0,212,255,0.5)] animate-pulse';
            case 'alive': return 'bg-[#00ff88] shadow-[0_0_15px_rgba(0,255,136,0.6)]';
            case 'degraded': return 'bg-gradient-to-r from-[#ff006e] to-[#ffd600] animate-pulse';
            default: return 'bg-[#3c3c50] shadow-none';
        }
    };

    // Helper for rendering badges
    const renderBadge = (itemPath: string) => {
        if (isCollapsed) return null;

        if (itemPath === '/agents') {
            return (
                <span className="ml-auto text-[10px] font-mono bg-[#00d4ff]/10 text-[#00d4ff] px-1.5 py-0.5 rounded border border-[#00d4ff]/30">
                    {agentsRunning}/{agentsTotal}
                </span>
            );
        }
        if (itemPath === '/signals') {
            return (
                <span className="ml-auto text-[10px] font-mono bg-white/5 text-[#a0a0a0] px-1.5 py-0.5 rounded border border-white/10">
                    24
                </span>
            );
        }
        if (itemPath === '/predictions') {
            return (
                <span className="ml-auto text-[10px] font-mono bg-[#ffd600]/10 text-[#ffd600] px-1.5 py-0.5 rounded border border-[#ffd600]/30">
                    3
                </span>
            );
        }
        if (itemPath === '/reasoning' && health === 'alive') {
            return (
                <span className="ml-auto flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff88] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ff88]"></span>
                </span>
            );
        }
        return null;
    };

    return (
        <motion.aside
            initial={false}
            animate={{ width: isCollapsed ? 80 : 240 }}
            className="fixed left-0 top-0 bottom-0 z-50 flex flex-col bg-[#0a0e27]/95 backdrop-blur-[20px] border-r border-white/10 transition-all duration-300 shadow-[5px_0_30px_rgba(0,0,0,0.5)]"
        >
            {/* Top Health Indicator Bar */}
            <div className={classNames("absolute top-0 left-0 right-0 h-1 z-50 transition-all duration-500", getHealthBarClass())} />

            {/* Logo & Header */}
            <div className="h-20 flex items-center px-4 border-b border-white/5 relative mt-1">
                <div className="flex items-center space-x-3 overflow-hidden whitespace-nowrap">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00ff88] to-[#00d4ff] flex items-center justify-center p-[2px] shadow-[0_0_15px_rgba(0,255,136,0.2)] flex-shrink-0">
                        <div className="w-full h-full bg-[#0a0e27] rounded-[10px] flex items-center justify-center">
                            <ShieldAlert className="w-6 h-6 text-[#00ff88]" />
                        </div>
                    </div>

                    <AnimatePresence>
                        {!isCollapsed && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="flex flex-col"
                            >
                                <span className="font-black text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#00ff88] to-[#00d4ff]">
                                    CIVION
                                </span>
                                <span className="text-[10px] font-mono text-[#00ff88] border border-[#00ff88]/30 bg-[#00ff88]/10 px-1 py-0.5 rounded leading-none w-max mt-0.5">
                                    v2.0
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Collapse Toggle */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#1a1f3a] border border-[#00ff88]/30 flex items-center justify-center text-[#00ff88] hover:bg-[#00ff88]/20 hover:shadow-[0_0_10px_rgba(0,255,136,0.3)] transition-all z-10"
                >
                    {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto py-6 px-3 space-y-2 custom-scrollbar">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.path;
                    const Icon = item.icon;

                    return (
                        <Link key={item.path} href={item.path}>
                            <div className={classNames(
                                "relative flex items-center px-4 h-12 rounded-xl transition-all duration-300 group",
                                isActive ? 'bg-[#00ff88]/10' : 'hover:bg-white/5'
                            )}>
                                {/* Active Indicator Line */}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeNavIndicator"
                                        className="absolute left-0 top-2 bottom-2 w-1 bg-[#00ff88] rounded-r-md shadow-[0_0_10px_#00ff88]"
                                    />
                                )}

                                <div className={`flex items-center flex-1 ${isCollapsed ? 'justify-center w-full' : ''} transition-all`}>
                                    <Icon
                                        className={`w-5 h-5 transition-all duration-300 ${isActive ? 'text-[#00ff88] drop-shadow-[0_0_8px_rgba(0,255,136,0.8)] scale-110' : 'text-[#a0a0a0] group-hover:text-white'}`}
                                    />

                                    <AnimatePresence>
                                        {!isCollapsed && (
                                            <>
                                                <motion.span
                                                    initial={{ opacity: 0, width: 0 }}
                                                    animate={{ opacity: 1, width: 'auto' }}
                                                    exit={{ opacity: 0, width: 0 }}
                                                    className={`ml-3 font-sans font-medium whitespace-nowrap overflow-hidden ${isActive ? 'text-white' : 'text-[#a0a0a0] group-hover:text-gray-200'}`}
                                                >
                                                    {item.name}
                                                </motion.span>
                                                {renderBadge(item.path)}
                                            </>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Footer System Status */}
            <div className="p-4 border-t border-white/5 bg-[#1a1f3a]/50 backdrop-blur-md overflow-hidden flex flex-col space-y-3">
                <AnimatePresence>
                    {!isCollapsed && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-[10px] font-mono text-[#a0a0a0] uppercase tracking-widest px-1"
                        >
                            System
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className={classNames("flex flex-col space-y-3", isCollapsed ? "items-center" : "")}>
                    {/* Health Status */}
                    <div className="flex items-center space-x-3" title={`Health: ${health}`}>
                        <span className={classNames(
                            "w-2.5 h-2.5 rounded-full",
                            health === 'alive' ? 'bg-[#00ff88] shadow-[0_0_8px_rgba(0,255,136,0.6)]'
                                : health === 'idle' ? 'bg-[#00d4ff] shadow-[0_0_8px_rgba(0,212,255,0.6)]'
                                    : 'bg-[#ff006e]'
                        )} />
                        {!isCollapsed && <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">{health}</span>}
                    </div>

                    {/* WS Status */}
                    <div className="flex items-center space-x-3" title={isConnected ? "WebSocket Connected" : "WebSocket Disconnected"}>
                        <span className={classNames("w-2 h-2 rounded-full", isConnected ? 'bg-[#00ff88]' : 'bg-[#ff006e]')} />
                        {!isCollapsed && <span className="text-xs font-mono text-[#a0a0a0]">WS Connected</span>}
                    </div>

                    {/* Agents Status */}
                    <div className="flex items-center space-x-3" title={`${agentsRunning}/${agentsTotal} Agents Running`}>
                        <span className="w-2 h-2 rounded-full bg-[#00d4ff]" />
                        {!isCollapsed && <span className="text-xs font-mono text-[#a0a0a0]">{agentsRunning}/{agentsTotal} Agents</span>}
                    </div>

                    {/* ARIA Status */}
                    <div className="flex items-center space-x-3" title="ARIA Assistant Ready">
                        <span className="w-2 h-2 rounded-full bg-[#9b59b6] animate-pulse" />
                        {!isCollapsed && <span className="text-xs font-mono text-[#a0a0a0]">ARIA Ready</span>}
                    </div>
                </div>
            </div>
        </motion.aside>
    );
};
