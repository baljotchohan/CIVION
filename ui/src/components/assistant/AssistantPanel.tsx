'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Zap, Activity, BrainCircuit } from 'lucide-react';
import { useAssistantContext } from '../../contexts/AssistantContext';
import { useAssistant } from '../../hooks/useAssistant';
import { classNames } from '../../lib/utils';
import { AgentStatusGrid } from '../agents/AgentStatusGrid'; // Check to ensure no circular dependency, but we just use basic widgets inside ARIA

export const AssistantPanel: React.FC = () => {
    const { isOpen } = useAssistantContext();
    const { messages, isThinking, sendMessage, chatEndRef } = useAssistant();
    const [inputValue, setInputValue] = useState('');

    const handleSend = () => {
        if (inputValue.trim()) {
            sendMessage(inputValue);
            setInputValue('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ y: '100%', opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: '100%', opacity: 0, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="fixed bottom-24 right-6 w-[400px] h-[600px] max-h-[80vh] bg-[#0a0e27]/95 backdrop-blur-2xl border border-[#9b59b6] rounded-2xl shadow-[0_10px_40px_rgba(155,89,182,0.3)] flex flex-col overflow-hidden z-[90]"
                >
                    {/* Header */}
                    <div className="p-4 border-b border-white/10 bg-gradient-to-r from-[#9b59b6]/20 to-transparent flex items-center shrink-0">
                        <div className="w-8 h-8 rounded-lg bg-[#9b59b6] flex items-center justify-center mr-3">
                            <BrainCircuit className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold font-sans tracking-wide">ARIA</h3>
                            <div className="text-[10px] text-[#9b59b6] font-mono uppercase tracking-widest flex items-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#9b59b6] animate-pulse mr-1" />
                                Online
                            </div>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                        {messages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-center text-[#a0a0a0] opacity-50 space-y-4">
                                <Activity className="w-12 h-12" />
                                <p className="font-mono text-sm">How can I assist your command center today?</p>
                            </div>
                        )}

                        {messages.map((msg) => {
                            const isAria = msg.role === 'aria';
                            return (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={classNames("flex", isAria ? "justify-start" : "justify-end")}
                                >
                                    <div className={classNames(
                                        "max-w-[85%] p-3 rounded-xl text-sm font-sans relative",
                                        isAria ? "bg-[#1a1f3a] border border-[#9b59b6]/30 text-white rounded-tl-sm" : "bg-[#9b59b6] text-white rounded-tr-sm"
                                    )}>
                                        {msg.content || (msg.isStreaming ? (
                                            <span className="flex space-x-1">
                                                <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" />
                                                <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                                <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                            </span>
                                        ) : null)}

                                        {/* Action chips if any */}
                                        {msg.actions && msg.actions.length > 0 && (
                                            <div className="mt-3 space-y-2">
                                                {msg.actions.map((action, idx) => (
                                                    <button key={idx} className="flex items-center text-[10px] bg-white/10 hover:bg-white/20 px-2 py-1 rounded font-mono uppercase tracking-wider transition-colors border border-white/10">
                                                        <Zap className="w-3 h-3 mr-1 text-[#ffd600]" />
                                                        Execute {action.type}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                        {isThinking && (
                            <div className="flex justify-start">
                                <div className="p-3 bg-[#1a1f3a] border border-[#9b59b6]/30 rounded-xl rounded-tl-sm flex space-x-1">
                                    <span className="w-1.5 h-1.5 bg-[#9b59b6] rounded-full animate-pulse" />
                                    <span className="w-1.5 h-1.5 bg-[#9b59b6] rounded-full animate-pulse delay-75" />
                                    <span className="w-1.5 h-1.5 bg-[#9b59b6] rounded-full animate-pulse delay-150" />
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-white/10 bg-[#1a1f3a]/80 shrink-0">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type a command or question..."
                                className="w-full bg-[#0a0e27] border border-white/10 rounded-lg pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-[#9b59b6]/50 focus:ring-1 focus:ring-[#9b59b6]/50 font-sans"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!inputValue.trim() || isThinking}
                                className="absolute right-2 p-1.5 rounded-md text-[#a0a0a0] hover:text-[#9b59b6] hover:bg-[#9b59b6]/10 disabled:opacity-50 disabled:hover:bg-transparent transition-all"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
