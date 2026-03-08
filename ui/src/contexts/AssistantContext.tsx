'use client';

import React, { createContext, useContext, useState } from 'react';

interface AssistantContextProps {
    isOpen: boolean;
    toggleOpen: () => void;
    openAssistant: () => void;
    closeAssistant: () => void;
}

const AssistantContext = createContext<AssistantContextProps | null>(null);

export const AssistantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleOpen = () => setIsOpen(!isOpen);
    const openAssistant = () => setIsOpen(true);
    const closeAssistant = () => setIsOpen(false);

    return (
        <AssistantContext.Provider value={{ isOpen, toggleOpen, openAssistant, closeAssistant }}>
            {children}
        </AssistantContext.Provider>
    );
};

export const useAssistantContext = () => {
    const ctx = useContext(AssistantContext);
    if (!ctx) throw new Error("useAssistantContext must be used within AssistantProvider");
    return ctx;
};
