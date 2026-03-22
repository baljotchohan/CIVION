"use client";

import React, { useState, useRef, useEffect } from 'react';
import { NickCharacter } from './NickCharacter';
import { useAgentStore } from '@/store/agentStore';
import { useUserStore } from '@/store/userStore';

export function NickPanel() {
    const { conversation: messages, sendMessage, isThinking: isLoading, gemini } = useAgentStore();
    const { hasApiKey } = useUserStore();
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isLoading]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading || !gemini) return;
        sendMessage(inputValue);
        setInputValue('');
    };

    const handleShortcut = (text: string) => {
        if (!gemini) return;
        sendMessage(text);
    };

    return (
        <div className="w-[320px] h-full flex flex-col border-l border-border bg-bg-card">

            {/* HEADER */}
            <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-bg-subtle flex items-center justify-center border border-border overflow-hidden">
                        <NickCharacter size="sm" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-text-primary text-sm uppercase tracking-wider">Personal Agent</h3>
                        <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${hasApiKey ? 'bg-success' : 'bg-text-muted'}`} />
                            <span className="text-[10px] uppercase font-medium text-text-secondary">
                                {hasApiKey ? 'Ready' : 'No API Key'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-bg-base scroll-smooth">
                {messages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                        <div className="opacity-20 grayscale mb-4">
                            <NickCharacter size="md" />
                        </div>
                        <h4 className="text-sm font-medium text-text-primary mb-1">Personal Agent</h4>
                        <p className="text-xs text-text-secondary mb-6">
                            {hasApiKey
                                ? "Ask me anything about your goals and business."
                                : "Set up your API key in onboarding to start chatting."
                            }
                        </p>

                        {hasApiKey && (
                            <div className="flex flex-col gap-1.5 w-full">
                                <button onClick={() => handleShortcut("What should I focus on today?")} className="text-[11px] text-left px-3 py-2 bg-bg-subtle border border-border rounded-md hover:border-text-muted transition-colors">
                                    What should I focus on today?
                                </button>
                                <button onClick={() => handleShortcut("Help me break down my goals")} className="text-[11px] text-left px-3 py-2 bg-bg-subtle border border-border rounded-md hover:border-text-muted transition-colors">
                                    Help me break down my goals
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    messages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[90%] rounded-xl px-3 py-2 text-xs leading-relaxed ${m.role === 'user'
                                    ? 'bg-accent text-white'
                                    : 'bg-bg-subtle border border-border text-text-primary'
                                }`}>
                                {m.content}
                            </div>
                        </div>
                    ))
                )}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-bg-subtle border border-border rounded-xl px-3 py-2 flex gap-1">
                            <span className="w-1 h-1 bg-text-muted rounded-full animate-pulse" />
                            <span className="w-1 h-1 bg-text-muted rounded-full animate-pulse delay-150" />
                            <span className="w-1 h-1 bg-text-muted rounded-full animate-pulse delay-300" />
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
                        placeholder={hasApiKey ? "Ask your agent..." : "Set up API key first"}
                        className="w-full bg-bg-subtle border border-border rounded-md pl-3 pr-10 py-2 text-xs focus:outline-none focus:border-accent transition-all"
                        disabled={isLoading || !hasApiKey}
                    />
                    <button
                        type="submit"
                        disabled={!inputValue.trim() || isLoading || !hasApiKey}
                        className="absolute right-1 w-7 h-7 flex items-center justify-center rounded-md bg-accent text-white disabled:opacity-50 disabled:bg-text-muted transition-colors"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </form>
            </div>

        </div>
    );
}
