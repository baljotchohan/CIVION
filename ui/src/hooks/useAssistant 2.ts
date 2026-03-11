import { useState, useRef, useEffect } from 'react';
import { AssistantMessage, AssistantAction } from '../types';
import { useSystemState } from './useSystemState';

export const useAssistant = () => {
    const [messages, setMessages] = useState<AssistantMessage[]>([]);
    const [isThinking, setIsThinking] = useState(false);
    const { systemState } = useSystemState();
    const chatEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isThinking]);

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
            timestamp: new Date().toISOString(),
            isStreaming: true
        }]);

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
                msg.id === ariaMsgId
                    ? { ...msg, content: "Sorry, I encountered an error connecting to my core.", isStreaming: false }
                    : msg
            ));
        } finally {
            setIsThinking(false);
        }
    };

    const executeAction = async (action: AssistantAction) => {
        // Here we would call the execute endpoint and handle the result
        console.log("Executing action:", action);
    };

    return {
        messages,
        isThinking,
        sendMessage,
        executeAction,
        chatEndRef
    };
};
