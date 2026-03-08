"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
    id: string;
    type: ToastType;
    title: string;
    description?: string;
}

interface ToastContextType {
    addToast: (type: ToastType, title: string, description?: string) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const addToast = useCallback((type: ToastType, title: string, description?: string) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, type, title, description }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
}

export function ToastContainer({
    toasts,
    removeToast
}: {
    toasts: ToastMessage[],
    removeToast: (id: string) => void
}) {
    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
            ))}
        </div>
    );
}

function ToastItem({ toast, onDismiss }: { toast: ToastMessage, onDismiss: () => void }) {
    const icons = {
        success: <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
        error: <svg className="w-5 h-5 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
        warning: <svg className="w-5 h-5 text-accent-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
        info: <svg className="w-5 h-5 text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    };

    const bgStyles = {
        success: 'bg-success/5 border-success/20',
        error: 'bg-danger/5 border-danger/20',
        warning: 'bg-accent-amber/5 border-accent-amber/20',
        info: 'bg-accent-blue/5 border-accent-blue/20'
    };

    return (
        <div className={`pointer-events-auto flex items-start p-4 bg-bg-card border rounded-xl shadow-lg animate-in slide-in-from-right-8 fade-in duration-300 ${bgStyles[toast.type]}`}>
            <div className="flex-shrink-0 mr-3 mt-0.5">
                {icons[toast.type]}
            </div>
            <div className="flex-1 mr-2">
                <h4 className="text-sm font-semibold text-text-primary">{toast.title}</h4>
                {toast.description && (
                    <p className="text-sm text-text-secondary mt-1">{toast.description}</p>
                )}
            </div>
            <button
                onClick={onDismiss}
                className="text-text-muted hover:text-text-primary flex-shrink-0 transition-colors"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
    );
}
