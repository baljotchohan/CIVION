'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Sparkles } from 'lucide-react';
import { useSystemState } from '../../hooks/useSystemState';
import { useAssistantContext } from '../../contexts/AssistantContext';

export const AssistantButton: React.FC = () => {
    const { systemState } = useSystemState();
    const { isOpen, toggleOpen, messages } = useAssistantContext();
    const { health, agentsRunning } = systemState;

    const [showTooltip, setShowTooltip] = useState(false);
    const [particles, setParticles] = useState<{ id: number, x: number; y: number }[]>([]);

    // Trigger scatter animation when entering alive state
    useEffect(() => {
        if (health === 'alive') {
            const newParticles = Array.from({ length: 5 }, (_, i) => ({
                id: Date.now() + i,
                x: (Math.random() - 0.5) * 60,
                y: (Math.random() - 0.5) * 60
            }));
            setParticles(newParticles);
            const timer = setTimeout(() => setParticles([]), 800);
            return () => clearTimeout(timer);
        }
    }, [health]);

    const hasUnread = agentsRunning > 0 && messages.length === 0 && health === 'alive';

    const propsConfig = {
        dead: {
            bg: 'rgba(60, 60, 80, 0.6)',
            border: '1px solid rgba(255,255,255,0.1)',
            icon: <MessageSquare size={24} color="#606070" />,
            shadow: 'none',
            tooltip: 'Configure API keys to activate ARIA',
            opacity: 0.6,
            ring: null
        },
        idle: {
            bg: 'rgba(0, 212, 255, 0.1)',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            icon: <MessageSquare size={24} color="#00d4ff" />,
            shadow: '0 0 15px rgba(0, 212, 255, 0.2)',
            tooltip: 'ARIA is ready',
            opacity: 0.8,
            ring: (
                <motion.div
                    className="absolute inset-0 rounded-full border border-[#00d4ff]"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                />
            )
        },
        alive: {
            bg: '#0a0e27',
            border: '1px solid #00ff88',
            icon: <Sparkles size={24} color="#00ff88" />,
            shadow: '0 0 20px rgba(0,255,136,0.4)',
            tooltip: 'Ask ARIA anything...',
            opacity: 1.0,
            ring: (
                <>
                    <motion.div
                        className="absolute inset-0 rounded-full border border-[#00ff88]"
                        animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0, 0] }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'easeOut' }}
                    />
                    <motion.div
                        className="absolute -inset-[2px] rounded-full"
                        style={{
                            background: 'conic-gradient(from 0deg, transparent 0%, rgba(0,255,136,0.4) 50%, transparent 100%)'
                        }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    />
                </>
            )
        }
    };

    const isDegraded = health === 'degraded';
    const stateKey = isDegraded ? 'alive' : health;
    const config = React.useMemo(() => propsConfig[stateKey] || propsConfig.dead, [stateKey]);

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex items-center justify-end">

            {/* Tooltip */}
            <AnimatePresence>
                {showTooltip && !isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="absolute right-[80px] whitespace-nowrap px-4 py-2 rounded shadow-lg text-sm font-sans"
                        style={{
                            backgroundColor: 'rgba(10,14,39,0.95)',
                            border: config.border,
                            color: 'white'
                        }}
                    >
                        {config.tooltip}
                        <div
                            className="absolute right-[-6px] top-1/2 transform -translate-y-1/2 w-3 h-3 rotate-45"
                            style={{ backgroundColor: 'rgba(10,14,39,0.95)', borderTop: config.border, borderRight: config.border }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Button */}
            <motion.button
                onClick={toggleOpen}
                onHoverStart={() => setShowTooltip(true)}
                onHoverEnd={() => setShowTooltip(false)}
                className="relative w-14 h-14 rounded-full flex items-center justify-center focus:outline-none overflow-visible"
                style={{
                    backgroundColor: isOpen ? '#1a1f3a' : config.bg,
                    border: isOpen ? '1px solid #ff006e' : config.border,
                    boxShadow: isOpen ? '0 0 20px rgba(255,0,110,0.4)' : config.shadow,
                    opacity: isOpen ? 1 : config.opacity
                }}
                animate={{
                    scale: isOpen ? 0.95 : 1,
                    boxShadow: isOpen ? '0 0 20px rgba(255,0,110,0.4)' : config.shadow,
                }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            >
                {/* Background animation inner */}
                {!isOpen && config.ring}

                {/* The Icon */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={isOpen ? 'close' : 'open'}
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="relative z-10"
                    >
                        {isOpen ? <X size={24} color="#ff006e" /> : config.icon}
                    </motion.div>
                </AnimatePresence>

                {/* Notification Dot */}
                {hasUnread && !isOpen && (
                    <motion.div
                        className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border border-[#0a0e27] shadow-[0_0_8px_rgba(255,0,0,0.8)] z-20"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                )}

                {/* Wake up particles */}
                {particles.map(p => (
                    <motion.div
                        key={p.id}
                        className="absolute left-1/2 top-1/2 w-1.5 h-1.5 rounded-full bg-[#00ff88]"
                        initial={{ x: "-50%", y: "-50%", opacity: 1, scale: 0 }}
                        animate={{ x: `calc(-50% + ${p.x}px)`, y: `calc(-50% + ${p.y}px)`, opacity: 0, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                ))}

            </motion.button>
        </div>
    );
};
