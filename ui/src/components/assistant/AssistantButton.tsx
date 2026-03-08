'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X } from 'lucide-react';
import { useAssistantContext } from '../../contexts/AssistantContext';

export const AssistantButton: React.FC = () => {
    const { isOpen, toggleOpen } = useAssistantContext();

    return (
        <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleOpen}
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-[#9b59b6] to-[#7f4296] text-white shadow-[0_0_20px_rgba(155,89,182,0.4)] flex items-center justify-center z-[100] border border-white/20"
        >
            <AnimatePresence mode="popLayout">
                {isOpen ? (
                    <motion.div
                        key="close"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <X className="w-6 h-6" />
                    </motion.div>
                ) : (
                    <motion.div
                        key="open"
                        initial={{ rotate: 90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Custom ARIA icon or Brain/Message */}
                        <MessageSquare className="w-6 h-6" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Pulsing ring behind button */}
            {!isOpen && (
                <span className="absolute inset-0 rounded-full border border-[#9b59b6] w-full h-full animate-ping opacity-50" style={{ animationDuration: '3s' }} />
            )}
        </motion.button>
    );
};
