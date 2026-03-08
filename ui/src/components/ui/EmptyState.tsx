'use client';

import React from 'react';
import { SystemHealth } from '../../types';
import { classNames } from '../../lib/utils';
import { motion } from 'framer-motion';
import { scaleIn } from '../../lib/animations';

interface EmptyStateProps {
    icon: React.ReactNode;
    title: string;
    message: string;
    action?: { label: string, href: string };
    health: SystemHealth;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, message, action, health }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            variants={scaleIn}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center p-12 text-center h-full min-h-[300px] border border-white/5 bg-[rgba(10,14,39,0.3)] rounded-xl relative overflow-hidden"
        >
            {/* Subtle dot pattern background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />

            <div className="w-16 h-16 rounded-2xl bg-[#1a1f3a] border border-white/10 flex items-center justify-center text-[#a0a0a0] mb-6 shadow-inner relative z-10">
                {icon}
            </div>
            <h3 className="text-xl font-sans tracking-wide text-white mb-2 relative z-10">{title}</h3>
            <p className="text-[#a0a0a0] max-w-sm mb-6 relative z-10">{message}</p>

            {health === 'dead' ? (
                <div className="relative z-10">
                    <p className="text-sm text-[#ff006e] mb-4">Configure API keys in Settings to get started</p>
                    <a href="/settings" className="px-6 py-2 rounded-lg border border-[#00ff88]/30 text-[#00ff88] bg-[#00ff88]/10 hover:bg-[#00ff88]/20 transition-colors uppercase tracking-wider text-xs font-mono">
                        Go to Settings
                    </a>
                </div>
            ) : action && (
                <a href={action.href} className="relative z-10 px-6 py-2 rounded-lg border border-[#00d4ff]/30 text-[#00d4ff] bg-[#00d4ff]/10 hover:bg-[#00d4ff]/20 transition-colors uppercase tracking-wider text-xs font-mono">
                    {action.label}
                </a>
            )}
        </motion.div>
    );
};
