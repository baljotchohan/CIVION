import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DebateMessage } from '../../types';
import { classNames } from '../../lib/utils';
import { CheckCircle2, MoreHorizontal } from 'lucide-react';

export interface DebateViewerProps {
    debate: DebateMessage[];
    isActive: boolean;
}

export const DebateViewer: React.FC<DebateViewerProps> = ({ debate, isActive }) => {
    const endRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom mathematically
    useEffect(() => {
        if (endRef.current) {
            endRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [debate]);

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'proposer': return '#00d4ff'; // Cyan
            case 'challenger': return '#ff006e'; // Pink
            case 'verifier': return '#00ff88'; // Green
            case 'synthesizer': return '#9b59b6'; // Purple
            default: return '#a0a0a0';
        }
    };

    const isFinished = debate.length > 0 && debate[debate.length - 1].is_final;
    const isTyping = isActive && !isFinished;
    const finalMessage = isFinished ? debate[debate.length - 1] : null;

    if (debate.length === 0) {
        return (
            <div className="flex-1 rounded-xl border border-[rgba(0,255,136,0.2)] bg-[rgba(26,31,58,0.8)] backdrop-blur-[20px] p-8 flex flex-col items-center justify-center text-center shadow-[0_0_20px_rgba(0,255,136,0.1)]">
                <div className="w-16 h-16 rounded-full bg-[#1a1f3a] border border-[#00ff88]/20 flex items-center justify-center mb-4 text-[#a0a0a0] animate-pulse">
                    🤖
                </div>
                <h3 className="text-xl font-sans text-white mb-2 tracking-wider">NO ACTIVE DEBATE</h3>
                <p className="text-[#a0a0a0] font-sans">Start a goal to begin multi-agent reasoning.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full rounded-xl border border-[rgba(0,255,136,0.2)] bg-[rgba(26,31,58,0.8)] backdrop-blur-[20px] shadow-[0_0_20px_rgba(0,255,136,0.1)] overflow-hidden relative">

            {/* Header Area */}
            <div className="p-4 border-b border-[rgba(0,255,136,0.2)] bg-[#1a1f3a]/80 backdrop-blur-md flex justify-between items-center shrink-0 z-10">
                <div className="flex items-center space-x-2">
                    <span className="relative flex h-3 w-3">
                        <span className={classNames("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", isActive ? "bg-[#00ff88]" : "bg-[#a0a0a0]")}></span>
                        <span className={classNames("relative inline-flex rounded-full h-3 w-3", isActive ? "bg-[#00ff88]" : "bg-[#a0a0a0]")}></span>
                    </span>
                    <h2 className="text-sm font-sans uppercase tracking-widest text-[#00ff88]">Live Debate Stream</h2>
                </div>
                <div className="text-xs font-mono text-[#a0a0a0]">
                    {debate.length} messages
                </div>
            </div>

            {/* Scrollable Message List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                <AnimatePresence initial={false}>
                    {debate.map((msg, idx) => {
                        const color = getRoleColor(msg.role);
                        const isSynthesizer = msg.role === 'synthesizer';
                        const isProposer = msg.role === 'proposer';

                        return (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                className={classNames(
                                    "flex w-full",
                                    isSynthesizer ? "justify-center" : (isProposer ? "justify-start" : "justify-end")
                                )}
                            >
                                <div className={classNames(
                                    "flex max-w-[85%] gap-4",
                                    isSynthesizer ? "flex-col items-center" : (isProposer ? "flex-row" : "flex-row-reverse")
                                )}>

                                    {/* Avatar */}
                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold font-mono text-sm shadow-lg overflow-hidden relative"
                                        style={{ backgroundColor: `${color}15`, border: `1px solid ${color}` }}
                                    >
                                        <span style={{ color }}>{msg.agent_name.substring(0, 2).toUpperCase()}</span>
                                        <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(circle at center, ${color} 0%, transparent 70%)` }} />
                                    </div>

                                    {/* Bubble */}
                                    <div className={classNames(
                                        "flex flex-col",
                                        isSynthesizer ? "items-center text-center mt-2" : (isProposer ? "items-start" : "items-end")
                                    )}>
                                        <div className={classNames(
                                            "flex items-baseline space-x-2 mb-1 px-1",
                                            !isProposer && !isSynthesizer && "flex-row-reverse space-x-reverse"
                                        )}>
                                            <span className="text-xs font-bold font-sans uppercase tracking-wider" style={{ color }}>
                                                {msg.role}
                                            </span>
                                            <span className="text-[10px] text-[#a0a0a0] font-mono opacity-60 ml-2" suppressHydrationWarning>
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                            </span>
                                        </div>

                                        <div
                                            className="p-4 rounded-xl text-sm font-sans text-gray-200 leading-relaxed shadow-lg backdrop-blur-sm relative"
                                            style={{
                                                backgroundColor: 'rgba(26, 31, 58, 0.4)',
                                                border: `1px solid ${color}40`,
                                                borderTopLeftRadius: isProposer && !isSynthesizer ? '0' : '0.75rem',
                                                borderTopRightRadius: !isProposer && !isSynthesizer ? '0' : '0.75rem'
                                            }}
                                        >
                                            {msg.content}

                                            {/* Confidence Chip */}
                                            <div
                                                className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold border shadow-sm backdrop-blur-md"
                                                style={{ backgroundColor: `${color}20`, borderColor: color, color: color }}
                                            >
                                                {(msg.confidence * 100).toFixed(1)}%
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {/* Typing Indicator */}
                {isTyping && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start w-full mt-4"
                    >
                        <div className="flex space-x-2 p-3 rounded-xl bg-[rgba(26,31,58,0.5)] border border-[#00ff88]/20 items-center justify-center shadow-lg">
                            <motion.div
                                animate={{ y: [0, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                                className="w-2 h-2 rounded-full bg-[#00ff88]"
                            />
                            <motion.div
                                animate={{ y: [0, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                                className="w-2 h-2 rounded-full bg-[#00ff88]"
                            />
                            <motion.div
                                animate={{ y: [0, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                                className="w-2 h-2 rounded-full bg-[#00ff88]"
                            />
                        </div>
                    </motion.div>
                )}

                <div ref={endRef} />
            </div>

            {/* Consensus Badge Overlay */}
            <AnimatePresence>
                {isFinished && finalMessage && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full bg-[rgba(26,31,58,0.95)] border border-[#00ff88] flex items-center space-x-3 shadow-[0_0_30px_rgba(0,255,136,0.3)] backdrop-blur-xl z-20"
                    >
                        <CheckCircle2 className="w-6 h-6 text-[#00ff88]" />
                        <div className="flex flex-col">
                            <span className="text-xs text-[#00ff88] font-bold tracking-widest uppercase font-sans">Consensus Reached</span>
                            <span className="text-sm font-mono text-white">Confidence: {(finalMessage.confidence * 100).toFixed(1)}%</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
