"use client";

import React, { useState, useRef, useEffect } from 'react';
import { NickCharacter, NickState } from './NickCharacter';
import { Card } from '../ui/Card';
import { useSystemState } from '../../contexts/SystemStateContext';
import { Badge } from '../ui/Badge';
import { useAssistant } from '../../hooks/useAssistant';

export interface NickPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export function NickPanel({ isOpen, onClose }: NickPanelProps) {
    const { health, activeAgents, signalCount, confidenceAvg } = useSystemState();
    const { messages, sendMessage, isLoading } = useAssistant();
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const nickState: NickState = isLoading ? 'thinking' : (health === 'alive' ? 'idle' : 'idle');

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isLoading]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;
        sendMessage(inputValue);
        setInputValue('');
    };

    const handleShortcut = (text: string) => {
        sendMessage(text);
    };

    return (
        <Card className="fixed bottom-[84px] right-6 w-[380px] h-[600px] max-h-[calc(100vh-120px)] flex flex-col z-50 shadow-2xl overflow-hidden border-border-strong animate-in slide-in-from-bottom-5 fade-in duration-200">

            {/* HEADER */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-bg-card">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-bg-subtle flex items-center justify-center border border-border overflow-hidden">
                        <div className="mt-2 text-xl">
                            <NickCharacter size="sm" state={nickState} />
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-text-primary text-base">NICK</h3>
                        <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${health === 'alive' ? 'bg-success' : 'bg-accent-blue'}`} />
                            <span className="text-xs text-text-secondary">
                                {health === 'alive' ? 'Online' : 'Ready'}
                            </span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-subtle rounded-lg transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>

            {/* CONTEXT BAR */}
            <div className="flex px-4 py-2 gap-2 overflow-x-auto bg-bg-subtle border-b border-border noscrollbar">
                <Badge size="sm" color="blue">{activeAgents.length} Agents</Badge>
                <Badge size="sm" color="purple">{signalCount} Signals</Badge>
                <Badge size="sm" color="green">{Math.round((confidenceAvg || 0) * 100)}% Conf</Badge>
            </div>

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-bg-base">
                {messages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                        <NickCharacter size="md" state="happy" className="mb-4" />
                        <h4 className="font-semibold text-text-primary mb-2">Hi there! What's on your mind?</h4>
                        <p className="text-sm text-text-secondary mb-6">Ask me anything about your intelligence system or the world.</p>

                        <div className="flex flex-col gap-2 w-full">
                            <button onClick={() => handleShortcut("What's the system status?")} className="text-sm text-left px-4 py-2 bg-bg-subtle border border-border rounded-lg hover:border-text-muted transition-colors">
                                What's the system status?
                            </button>
                            <button onClick={() => handleShortcut("Summarize recent signals")} className="text-sm text-left px-4 py-2 bg-bg-subtle border border-border rounded-lg hover:border-text-muted transition-colors">
                                Summarize recent signals
                            </button>
                            <button onClick={() => handleShortcut("Are there any active predictions?")} className="text-sm text-left px-4 py-2 bg-bg-subtle border border-border rounded-lg hover:border-text-muted transition-colors">
                                Are there any active predictions?
                            </button>
                        </div>
                    </div>
                ) : (
                    messages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${m.role === 'user'
                                    ? 'bg-accent text-white rounded-br-sm'
                                    : 'bg-bg-subtle border border-border text-text-primary rounded-bl-sm'
                                }`}>
                                {m.content}
                            </div>
                        </div>
                    ))
                )}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-bg-subtle border border-border rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
                            <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* INPUT */}
            <div className="p-4 bg-bg-card border-t border-border">
                <form onSubmit={handleSubmit} className="relative flex items-center">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask NICK anything..."
                        className="w-full bg-bg-subtle border border-border rounded-full pl-4 pr-12 py-2.5 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={!inputValue.trim() || isLoading}
                        className="absolute right-1 w-8 h-8 flex items-center justify-center rounded-full bg-accent text-white disabled:opacity-50 disabled:bg-text-muted transition-colors"
                    >
                        <svg className="w-4 h-4 translate-x-px translate-y-px" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </form>
            </div>

        </Card>
    );
}
