"use client";

import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import { AssistantMessage, AssistantAction } from '../types';
import { useSystemState } from '../contexts/SystemStateContext';

interface AssistantContextType {
    messages: AssistantMessage[];
    isLoading: boolean;
    sendMessage: (content: string) => Promise<void>;
    executeAction: (action: AssistantAction) => Promise<void>;
    chatEndRef?: React.RefObject<HTMLDivElement>;
}

const AssistantContext = createContext<AssistantContextType | undefined>(undefined);

export function AssistantProvider({ children }: { children: ReactNode }) {
    const [messages, setMessages] = useState<AssistantMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { health } = useSystemState();
    const chatEndRef = useRef<HTMLDivElement>(null);

    const sendMessage = async (content: string) => {
        if (!content.trim()) return;

        const userMsg: AssistantMessage = {
            id: Math.random().toString(36).substring(7),
            role: 'user',
            content,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        const nickMsgId = Math.random().toString(36).substring(7);
        setMessages(prev => [...prev, {
            id: nickMsgId,
            role: 'aria',
            content: '',
            timestamp: new Date().toISOString(),
            isStreaming: true
        }]);

        try {
            const response = await fetch('/api/v1/assistant/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: content,
                    context: { system_health: health }
                })
            });

            if (!response.body) throw new Error("No response body");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let accumulatedText = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            if (data.token) {
                                accumulatedText += data.token;
                                setMessages(prev => prev.map(msg =>
                                    msg.id === nickMsgId
                                        ? { ...msg, content: accumulatedText }
                                        : msg
                                ));
                            }

                            if (data.done) {
                                setMessages(prev => prev.map(msg =>
                                    msg.id === nickMsgId
                                        ? { ...msg, isStreaming: false, actions: data.actions || [] }
                                        : msg
                                ));
                            }
                        } catch (e) {
                            console.error("Error parsing stream chunk", e);
                        }
                    }
                }
            }
        } catch (error) {
            console.error(error);
            setMessages(prev => prev.map(msg =>
                msg.id === nickMsgId
                    ? { ...msg, content: "Sorry, I encountered an error connecting to my core.", isStreaming: false }
                    : msg
            ));
        } finally {
            setIsLoading(false);
        }
    };

    const executeAction = async (action: AssistantAction) => {
        console.log("Executing action:", action);
    };

    return (
        <AssistantContext.Provider value={{ messages, isLoading, sendMessage, executeAction, chatEndRef }}>
            {children}
        </AssistantContext.Provider>
    );
}

export function useAssistant() {
    const context = useContext(AssistantContext);
    if (context === undefined) {
        throw new Error('useAssistant must be used within an AssistantProvider');
    }
    return context;
}
