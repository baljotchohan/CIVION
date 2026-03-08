'use client';

import React, { createContext, useContext, useState } from 'react';
import { AssistantMessage, AssistantAction } from '../types';
import { useSystemState } from '../hooks/useSystemState';

interface AssistantContextProps {
    isOpen: boolean;
    toggleOpen: () => void;
    openAssistant: () => void;
    closeAssistant: () => void;
    messages: AssistantMessage[];
    sendMessage: (content: string) => Promise<void>;
    executeAction: (actions: AssistantAction[]) => Promise<void>;
    isThinking: boolean;
    isStreaming: boolean;
}

const AssistantContext = createContext<AssistantContextProps | null>(null);

export const AssistantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<AssistantMessage[]>([]);
    const [isThinking, setIsThinking] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const { systemState } = useSystemState();

    const toggleOpen = () => setIsOpen(!isOpen);
    const openAssistant = () => setIsOpen(true);
    const closeAssistant = () => setIsOpen(false);

    const sendMessage = async (content: string) => {
        if (!content.trim()) return;

        const userMsg: AssistantMessage = {
            id: Math.random().toString(36).substring(7),
            role: 'user',
            content,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMsg]);
        setIsThinking(true);

        const ariaMsgId = Math.random().toString(36).substring(7);
        setMessages(prev => [...prev, {
            id: ariaMsgId,
            role: 'aria',
            content: '',
            timestamp: new Date().toISOString()
        }]);
        setIsStreaming(true);

        try {
            const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const response = await fetch(`${API_BASE}/api/v1/assistant/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: content,
                    context: { system_health: systemState.health }
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
                                    msg.id === ariaMsgId
                                        ? { ...msg, content: accumulatedText }
                                        : msg
                                ));
                            }

                            if (data.done) {
                                setMessages(prev => prev.map(msg =>
                                    msg.id === ariaMsgId
                                        ? { ...msg, actions: data.actions || [] }
                                        : msg
                                ));
                                setIsStreaming(false);
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
                msg.id === ariaMsgId
                    ? { ...msg, content: "Sorry, I encountered an error connecting to my core." }
                    : msg
            ));
            setIsStreaming(false);
        } finally {
            setIsThinking(false);
        }
    };

    const executeAction = async (actions: AssistantAction[]) => {
        console.log("Executing actions:", actions);
    };

    return (
        <AssistantContext.Provider value={{
            isOpen, toggleOpen, openAssistant, closeAssistant,
            messages, sendMessage, executeAction, isThinking, isStreaming
        }}>
            {children}
        </AssistantContext.Provider>
    );
};

export const useAssistantContext = () => {
    const ctx = useContext(AssistantContext);
    if (!ctx) throw new Error("useAssistantContext must be used within AssistantProvider");
    return ctx;
};
