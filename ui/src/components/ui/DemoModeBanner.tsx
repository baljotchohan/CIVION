'use client';

import React from 'react';
import { useAliveState } from '../../hooks/useAliveState';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

export const DemoModeBanner: React.FC = () => {
    const { dataMode } = useAliveState();
    if (dataMode !== 'demo') return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full bg-[#ffd600]/20 border-b border-[#ffd600]/40 text-[#ffd600] px-4 py-2 flex items-center justify-center shadow-[0_0_15px_rgba(255,214,0,0.1)] sticky top-0 z-50 backdrop-blur-md"
            >
                <AlertTriangle className="w-4 h-4 mr-2" />
                <span className="text-sm font-mono uppercase tracking-widest font-bold mr-4">DEMO MODE</span>
                <span className="text-xs font-sans opacity-90">Showing simulated data</span>
                <div className="flex-1" />
                <a href="/settings" className="text-xs font-mono uppercase border border-[#ffd600]/40 px-3 py-1 rounded hover:bg-[#ffd600]/10 transition-colors">
                    Disable
                </a>
            </motion.div>
        </AnimatePresence>
    );
};
