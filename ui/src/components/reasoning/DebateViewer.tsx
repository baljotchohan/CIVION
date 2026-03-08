'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type AgentRole = "proposer" | "challenger" | "verifier" | "synthesizer";

export interface DebateMessage {
    id: string;
    agent_name: string;
    role: AgentRole;
    content: string;
    confidence: number;
    timestamp: string;
    is_final: boolean;
}

interface DebateViewerProps {
    debate: DebateMessage[];
    isActive: boolean;
}

const getRoleColor = (role: AgentRole) => {
    switch (role) {
        case 'proposer': return '#00d4ff'; // Cyan
        case 'challenger': return '#ff006e'; // Pink
        case 'verifier': return '#00ff88'; // Green
        case 'synthesizer': return '#9b59b6'; // Purple
        default: return '#ffffff';
    }
};

const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

export const DebateViewer: React.FC<DebateViewerProps> = ({ debate, isActive }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to latest message
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [debate, isActive]);

    const hasConclusion = debate.length > 0 && debate[debate.length - 1].is_final;

    return (
        <div className="flex flex-col h-full bg-[rgba(26,31,58,0.8)] backdrop-blur-[20px] rounded-xl border border-[#00ff88]/20 shadow-[0_0_20px_rgba(0,255,136,0.1)] overflow-hidden">

            {/* Header */}
            <div className="p-4 border-b border-[#00ff88]/20 flex justify-between items-center bg-[#1a1f3a]">
                <h2 className="text-lg font-sans font-bold text-white flex items-center">
                    <span className="mr-2">Live Debate Stream</span>
                    {isActive && (
                        <span className="flex h-3 w-3 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff88] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00ff88]"></span>
                        </span>
                    )}
                </h2>

                {hasConclusion && (
                    <div className="px-3 py-1 rounded-full bg-[#9b59b6]/20 border border-[#9b59b6]/50 text-[#9b59b6] text-xs font-bold font-mono tracking-widest uppercase shadow-[0_0_10px_rgba(155,89,182,0.3)]">
                        Consensus Reached
                    </div>
                )}
            </div>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar scroll-smooth"
            >
                <AnimatePresence initial={false}>
                    {debate.map((msg, i) => {
                        const color = getRoleColor(msg.role);
                        const isSynthesizer = msg.role === 'synthesizer';

                        return (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 260,
                                    damping: 20,
                                    delay: 0.1 // staggered feel
                                }}
                                className={`flex w-full ${isSynthesizer ? 'justify-center' : (msg.role === 'proposer' ? 'justify-start' : 'justify-end')}`}
                            >
                                <div className={`flex max-w-[80%] ${isSynthesizer ? 'flex-col items-center text-center' : (msg.role === 'proposer' ? 'flex-row' : 'flex-row-reverse')} gap-4`}>

                                    {/* Avatar */}
                                    <div
                                        className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold font-mono text-sm border-2 shadow-lg"
                                        style={{
                                            borderColor: color,
                                            backgroundColor: `${color}20`,
                                            color: color,
                                            boxShadow: `0 0 15px ${color}40`
                                        }}
                                    >
                                        {getInitials(msg.agent_name)}
                                    </div>

                                    {/* Message Bubble */}
                                    <div className={`flex flex-col ${isSynthesizer ? 'items-center mt-3' : (msg.role === 'proposer' ? 'items-start' : 'items-end')}`}>
                                        <div className="flex items-baseline space-x-2 mb-1 px-1">
                                            <span className="text-xs font-bold font-sans" style={{ color }}>
                                                {msg.agent_name}
                                            </span>
                                            <span className="text-[10px] text-[#a0a0a0] font-mono uppercase tracking-wider">
                                                {msg.role}
                                            </span>
                                            <span className="text-[10px] text-[#a0a0a0] font-mono opacity-60">
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                            </span>
                                        </div>

                                        <div
                                            className="p-4 rounded-xl text-sm font-sans leading-relaxed text-[#ffffff] backdrop-blur-md border relative group"
                                            style={{
                                                backgroundColor: `${color}10`,
                                                borderColor: `${color}30`,
                                                borderTopLeftRadius: msg.role === 'proposer' && !isSynthesizer ? 0 : '0.75rem',
                                                borderTopRightRadius: msg.role !== 'proposer' && !isSynthesizer ? 0 : '0.75rem',
                                            }}
                                        >
                                            {msg.content}

                                            {/* Confidence indicator hover */}
                                            <div className="absolute top-0 right-0 -mt-2 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="px-2 py-0.5 rounded text-[10px] font-mono font-bold font-black bg-[#0a0e27] border" style={{ borderColor: color, color }}>
                                                    conf: {(msg.confidence * 100).toFixed(0)}%
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {/* Typing Indicator */}
                {isActive && !hasConclusion && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center space-x-2 text-[#a0a0a0] text-sm font-mono mt-4 ml-2"
                    >
                        <div className="flex space-x-1">
                            <motion.div className="w-2 h-2 rounded-full bg-[#00d4ff]" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                            <motion.div className="w-2 h-2 rounded-full bg-[#ff006e]" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                            <motion.div className="w-2 h-2 rounded-full bg-[#00ff88]" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
                        </div>
                        <span>Agents thinking...</span>
                    </motion.div>
                )}
            </div>
        </div>
    );
};
