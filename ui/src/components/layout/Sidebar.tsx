'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Brain, Bot, Lightbulb, Activity,
    Users, Globe, ShoppingCart, Settings, ChevronLeft, ChevronRight,
    ShieldAlert
} from 'lucide-react';
import { useWebSocket } from '@/hooks/useWebSocket';

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
    const { isConnected, connectionState } = useWebSocket();
    const [uptime, setUptime] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => setUptime(u => u + 1), 1000);
        return () => clearInterval(interval);
    }, []);

    const formatUptime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h}h ${m}m`;
    };

    return (
        <motion.aside
            initial={false}
            animate={{ width: isCollapsed ? 80 : 240 }}
            className="fixed left-0 top-0 bottom-0 z-50 flex flex-col bg-[#0a0e27]/95 backdrop-blur-[20px] border-r border-[#00ff88]/20 transition-all duration-300 shadow-[5px_0_30px_rgba(0,0,0,0.5)]"
        >
            {/* Logo & Header */}
            <div className="h-20 flex items-center px-4 border-b border-white/5 relative">
                <div className="flex items-center space-x-3 overflow-hidden whitespace-nowrap">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00ff88] to-[#00d4ff] flex items-center justify-center p-[2px] shadow-[0_0_15px_rgba(0,255,136,0.5)] flex-shrink-0">
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
                            <div
                                className={`relative flex items-center h-12 rounded-xl transition-all duration-300 group ${isActive
                                    ? 'bg-[#00ff88]/10'
                                    : 'hover:bg-white/5'
                                    }`}
                            >
                                {/* Active Indicator Line */}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeNavIndicator"
                                        className="absolute left-0 top-0 bottom-0 w-1 bg-[#00ff88] rounded-l-xl shadow-[0_0_15px_#00ff88]"
                                    />
                                )}

                                <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'pl-4'} transition-all`}>
                                    <Icon
                                        className={`w-5 h-5 transition-all duration-300 ${isActive ? 'text-[#00ff88] drop-shadow-[0_0_8px_rgba(0,255,136,0.8)] scale-110' : 'text-[#a0a0a0] group-hover:text-white'
                                            }`}
                                    />

                                    <AnimatePresence>
                                        {!isCollapsed && (
                                            <motion.span
                                                initial={{ opacity: 0, width: 0 }}
                                                animate={{ opacity: 1, width: 'auto' }}
                                                exit={{ opacity: 0, width: 0 }}
                                                className={`ml-3 font-sans font-medium whitespace-nowrap overflow-hidden ${isActive ? 'text-white' : 'text-[#a0a0a0] group-hover:text-gray-200'
                                                    }`}
                                            >
                                                {item.name}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Footer System Status */}
            <div className="p-4 border-t border-white/5 bg-[#1a1f3a]/50 backdrop-blur-md overflow-hidden">
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>

                    <div className="flex items-center space-x-3">
                        <div className="relative flex items-center justify-center">
                            {/* WS Status Dot */}
                            <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-[#00ff88]' : 'bg-[#ff006e]'}`} />
                            {isConnected && (
                                <span className="absolute w-2.5 h-2.5 rounded-full bg-[#00ff88] animate-ping opacity-75" />
                            )}
                        </div>

                        <AnimatePresence>
                            {!isCollapsed && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex flex-col"
                                >
                                    <span className="text-[10px] font-mono text-[#a0a0a0] uppercase tracking-wider">
                                        {connectionState}
                                    </span>
                                    <span className="text-xs font-mono font-bold text-white">
                                        Uptime: {formatUptime(uptime)}
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </motion.aside>
    );
};
