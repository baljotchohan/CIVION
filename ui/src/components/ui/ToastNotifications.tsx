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
                        success: <CheckCircle className="w-5 h-5 text-[#00ff88]" />,
                        error: <XCircle className="w-5 h-5 text-[#ff006e]" />,
                        info: <Info className="w-5 h-5 text-[#00d4ff]" />,
                        warning: <AlertTriangle className="w-5 h-5 text-[#ffd600]" />
                    };

                    const borders = {
                        success: 'border-[#00ff88]/50',
                        error: 'border-[#ff006e]/50',
                        info: 'border-[#00d4ff]/50',
                        warning: 'border-[#ffd600]/50'
                    };

                    const shadows = {
                        success: 'shadow-[0_0_15px_rgba(0,255,136,0.2)]',
                        error: 'shadow-[0_0_15px_rgba(255,0,110,0.2)]',
                        info: 'shadow-[0_0_15px_rgba(0,212,255,0.2)]',
                        warning: 'shadow-[0_0_15px_rgba(255,214,0,0.2)]'
                    };

                    return (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 50, scale: 0.9 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                            className={`pointer-events-auto flex items-start p-4 w-80 bg-[rgba(10,14,39,0.95)] backdrop-blur-xl border ${borders[toast.type]} rounded-xl ${shadows[toast.type]}`}
                        >
                            <div className="shrink-0 mr-3 mt-0.5">
                                {icons[toast.type]}
                            </div>
                            <div className="flex-1 font-sans text-sm text-white leading-snug">
                                {toast.message}
                            </div>
                            <button
                                onClick={() => dismissToast(toast.id)}
                                className="shrink-0 ml-3 text-[#a0a0a0] hover:text-white transition-colors"
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
