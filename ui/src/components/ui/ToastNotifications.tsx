'use client';

import React from 'react';
import { useToastContext } from '../../contexts/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastNotifications: React.FC = () => {
    const { toasts, dismissToast } = useToastContext();

    return (
        <div className="fixed top-6 right-6 z-[9999] flex flex-col space-y-3 pointer-events-none">
            <AnimatePresence>
                {toasts.map((toast) => {
                    const icons = {
                        success: <CheckCircle className="w-5 h-5 text-success" />,
                        error: <XCircle className="w-5 h-5 text-danger" />,
                        info: <Info className="w-5 h-5 text-info" />,
                        warning: <AlertTriangle className="w-5 h-5 text-warning" />
                    };

                    const borders = {
                        success: 'border-success/30',
                        error: 'border-danger/30',
                        info: 'border-info/30',
                        warning: 'border-warning/30'
                    };

                    return (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 50, scale: 0.9 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                            className={`pointer-events-auto flex items-start p-4 w-80 bg-bg-card border ${borders[toast.type]} rounded-xl shadow-lg`}
                        >
                            <div className="shrink-0 mr-3 mt-0.5">
                                {icons[toast.type]}
                            </div>
                            <div className="flex-1 font-sans text-sm text-text-primary leading-snug">
                                {toast.message}
                            </div>
                            <button
                                onClick={() => dismissToast(toast.id)}
                                className="shrink-0 ml-3 text-text-muted hover:text-text-primary transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
};
