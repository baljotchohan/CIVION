'use client';

import React, { createContext, useContext, useState } from 'react';

export interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
}

interface ToastContextProps {
    toasts: Toast[];
    toast: (message: string, type?: Toast['type']) => void;
    dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextProps | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const toast = (message: string, type: Toast['type'] = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => dismissToast(id), 5000); // auto dismiss after 5s
    };

    const dismissToast = (id: string) => {
        setToasts((prev) => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ toasts, toast, dismissToast }}>
            {children}
        </ToastContext.Provider>
    );
};

export const useToastContext = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToastContext must be used within ToastProvider");
    return ctx;
};
