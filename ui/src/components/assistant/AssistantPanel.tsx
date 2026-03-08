'use client';
import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystemState } from '../../hooks/useSystemState';
import { useAssistantContext } from '../../contexts/AssistantContext';
import { X, Minus, Loader2, Play } from 'lucide-react';
import { NeonButton } from '../ui/NeonButton';

export const AssistantPanel: React.FC = () => {
    const { systemState } = useSystemState();
    const { isOpen, toggleOpen, messages, sendMessage, isStreaming, isThinking, executeAction } = useAssistantContext();
    const { health, agentsRunning, signalsToday, confidenceAvg } = systemState;

    const [minimized, setMinimized] = useState(false);
    const [inputValue, setInputValue] = useState('');

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isStreaming, isThinking]);

    // Open takes precedence
    if (!isOpen) {
        if (minimized) setMinimized(false);
        return null;
    }

    const handleSend = () => {
        if (inputValue.trim()) {
            sendMessage(inputValue.trim());
            setInputValue('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const statusColor = health === 'dead' ? '#3c3c50' : health === 'idle' ? '#00d4ff' : '#00ff88';
    const statusText = health === 'dead' ? 'Offline' : health === 'idle' ? 'Standby' : 'Online';

    const suggestionChips = health === 'dead' ? [
        "How do I set up CIVION?",
        "What API keys do I need?",
        "What can CIVION do?"
    ] : health === 'idle' ? [
        "How do I start agents?",
        "What should I do first?",
        "Explain confidence scores"
    ] : [
        "What are agents finding?",
        "Show latest signals",
        "Create a goal about AI trends"
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1, height: minimized ? 64 : 580 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-[96px] right-6 w-[420px] origin-bottom-right z-[9998] flex flex-col pointer-events-auto"
            style={{
                background: 'rgba(10, 14, 39, 0.97)',
                backdropFilter: 'blur(40px)',
                border: '1px solid rgba(0,255,136,0.3)',
                borderRadius: '20px 20px 4px 20px',
                boxShadow: '0 -10px 60px rgba(0,255,136,0.15)',
                clipPath: 'inset(-50px -50px -50px -50px)' // allow shadow out limit
            }}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#00ff88]/20 bg-white/[0.02]">
                <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rotate-45 bg-[#00ff88] shadow-[0_0_10px_#00ff88]"></div>
                    <div className="font-mono text-sm tracking-wide">
                        <span className="font-bold text-white">ARIA</span>
                        <span className="text-gray-500 mx-2">|</span>
                        <span className="flex items-center text-xs text-gray-400">
                            <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: statusColor }} />
                            {statusText}
                        </span>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <button onClick={() => setMinimized(!minimized)} className="text-gray-500 hover:text-white transition-colors">
                        <Minus size={16} />
                    </button>
                    <button onClick={toggleOpen} className="text-gray-500 hover:text-[#ff006e] transition-colors">
                        <X size={16} />
                    </button>
                </div>
            </div>

            {!minimized && (
                <>
                    {/* Pills Context row */}
                    <div className="flex items-center space-x-2 px-4 py-2 border-b border-white/5 bg-white/[0.01] overflow-x-auto scrollbar-hide">
                        <div className="text-[11px] font-mono whitespace-nowrap px-2 py-0.5 rounded-sm bg-white/5 border border-white/10 text-gray-300">
                            🤖 {agentsRunning} agents
                        </div>
                        <div className="text-[11px] font-mono whitespace-nowrap px-2 py-0.5 rounded-sm bg-white/5 border border-white/10 text-gray-300">
                            ⚡ {signalsToday} signals
                        </div>
                        <div className="text-[11px] font-mono whitespace-nowrap px-2 py-0.5 rounded-sm bg-white/5 border border-white/10 text-gray-300">
                            🔮 {Math.round(confidenceAvg || 0)}% confidence
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar">
                        {messages.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 mt-4">
                                <div className="w-12 h-12 rotate-45 bg-[#00ff88] shadow-[0_0_25px_#00ff88] mb-8" />
                                <h3 className="text-xl font-bold font-sans text-white mb-2">Hi! I&apos;m ARIA</h3>
                                <p className="text-sm text-gray-400 font-sans leading-relaxed mb-8">
                                    Ask me anything about CIVION, your agents, or what the system is currently finding.
                                </p>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {suggestionChips.map(c => (
                                        <button
                                            key={c}
                                            onClick={() => sendMessage(c)}
                                            className="px-3 py-1.5 rounded-full bg-[rgba(26,31,58,0.8)] border border-white/10 text-[12px] text-gray-300 hover:border-[#00ff88]/40 hover:text-[#00ff88] transition-all"
                                        >
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <>
                                {messages.map((m, i) => (
                                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] relative flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                                            {m.role === 'aria' && (
                                                <div className="w-6 h-6 rounded-full bg-[#1a1f3a] border border-[#00d4ff]/30 flex items-center justify-center absolute -left-8 top-0">
                                                    <div className="w-1.5 h-1.5 rotate-45 bg-[#00ff88]" />
                                                </div>
                                            )}
                                            <div className={`
                        p-[10px_14px] text-[14px] font-sans break-words whitespace-pre-wrap leading-relaxed
                        ${m.role === 'user'
                                                    ? 'bg-[#00ff88]/10 border border-[#00ff88]/20 rounded-[18px_18px_4px_18px] text-white'
                                                    : 'bg-[#1a1f3a]/90 border border-[#00d4ff]/20 rounded-[18px_18px_18px_4px] text-gray-200 shadow-md'}
                      `}>
                                                {m.content}
                                                {m.role === 'aria' && i === messages.length - 1 && isStreaming && (
                                                    <span className="inline-block w-[3px] h-[15px] bg-[#00ff88] ml-1 animate-pulse" />
                                                )}
                                            </div>
                                            <span className="text-[10px] text-gray-500 mt-1 px-1">
                                                {new Date(m.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>

                                            {/* Actions */}
                                            {m.role === 'aria' && m.actions && m.actions.length > 0 && (
                                                <div className="mt-2 w-full space-y-2 flex flex-col items-start bg-[rgba(10,14,39,0.8)] border border-[#00d4ff]/30 p-3 rounded-xl ml-0">
                                                    <div className="text-xs text-[#00d4ff] font-mono flex items-center mb-1">
                                                        ⚡ Action Available
                                                    </div>
                                                    {m.actions.map((act, ai) => (
                                                        <div key={ai} className="flex flex-col w-full text-sm font-sans">
                                                            <span>{act.type === 'start_agent' ? `Start ${act.agent_id} Agent` : act.type}</span>
                                                            <div className="flex space-x-2 mt-2">
                                                                <button onClick={() => executeAction([act])} className="px-3 py-1 bg-[#00d4ff]/20 border border-[#00d4ff]/50 rounded text-xs text-[#00d4ff] hover:bg-[#00d4ff]/30 transition-colors flex items-center">
                                                                    Execute <Play size={10} className="ml-1" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {isThinking && !isStreaming && (
                                    <div className="flex justify-start relative pl-8">
                                        <div className="w-6 h-6 rounded-full bg-[#1a1f3a] border border-[#00d4ff]/30 flex items-center justify-center absolute left-0 top-0">
                                            <div className="w-1.5 h-1.5 rotate-45 bg-[#00ff88]" />
                                        </div>
                                        <div className="bg-[#1a1f3a]/90 border border-[#00d4ff]/20 rounded-[18px_18px_18px_4px] p-4 flex space-x-1.5 items-center h-10 shadow-md">
                                            <motion.div className="w-2 h-2 rounded-full bg-[#00d4ff]" animate={{ scale: [0.5, 1.5, 0.5] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                                            <motion.div className="w-2 h-2 rounded-full bg-[#00d4ff]" animate={{ scale: [0.5, 1.5, 0.5] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
                                            <motion.div className="w-2 h-2 rounded-full bg-[#00d4ff]" animate={{ scale: [0.5, 1.5, 0.5] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
                                        </div>
                                    </div>
                                )}

                                {messages.length > 0 && !isThinking && !isStreaming && (
                                    <div className="flex flex-wrap gap-2 justify-center mt-4">
                                        {suggestionChips.map(c => (
                                            <button
                                                key={c}
                                                onClick={() => sendMessage(c)}
                                                className="px-3 py-1.5 rounded-full bg-[rgba(26,31,58,0.8)] border border-white/10 text-[11px] text-gray-400 hover:border-[#00ff88]/40 hover:text-[#00ff88] transition-all"
                                            >
                                                {c}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 border-t border-white/10 bg-[#0a0e27]/80 rounded-b-2xl">
                        <div className="relative">
                            <textarea
                                value={inputValue}
                                onChange={e => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask ARIA anything..."
                                rows={Math.min(3, Math.max(1, inputValue.split('\n').length))}
                                className="w-full bg-[rgba(26,31,58,0.5)] border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm text-white resize-none focus:outline-none focus:border-[#00ff88]/40 focus:shadow-[0_0_10px_rgba(0,255,136,0.1)] custom-scrollbar"
                                style={{ minHeight: '44px', maxHeight: '100px' }}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!inputValue.trim()}
                                className={`absolute right-2 bottom-2 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${inputValue.trim()
                                        ? 'bg-[#00ff88]/20 text-[#00ff88] hover:bg-[#00ff88]/30 shadow-[0_0_10px_rgba(0,255,136,0.2)]'
                                        : 'text-gray-500 opacity-50'
                                    }`}
                            >
                                {isThinking ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                            </button>
                        </div>

                        <div className="flex items-center space-x-3 mt-3 px-2">
                            <button onClick={() => sendMessage('Give me a system status update')} className="text-[11px] text-gray-400 hover:text-[#00ff88] uppercase tracking-wider font-mono flex items-center">
                                <span className="text-xs mr-1 text-yellow-500">⚡</span> Status
                            </button>
                            <button onClick={() => sendMessage('What goals are we focusing on?')} className="text-[11px] text-gray-400 hover:text-[#00ff88] uppercase tracking-wider font-mono">
                                Goals
                            </button>
                            <button onClick={() => sendMessage('What are the agents finding?')} className="text-[11px] text-gray-400 hover:text-[#00ff88] uppercase tracking-wider font-mono">
                                Agents
                            </button>
                        </div>
                    </div>
                </>
            )}
        </motion.div>
    );
};
