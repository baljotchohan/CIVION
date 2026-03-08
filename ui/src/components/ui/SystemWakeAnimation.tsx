'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystemStateContext } from '../../contexts/SystemStateContext';

export const SystemWakeAnimation: React.FC = () => {
    const { showWakeAnimation } = useSystemStateContext();

    const particles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,  // % from left
        delay: Math.random() * 0.8,
        duration: 0.8 + Math.random() * 0.4,
    }));

    return (
        <AnimatePresence>
            {showWakeAnimation && (
                <motion.div
                    key="wake-overlay"
                    className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center overflow-hidden"
                    initial={{ backgroundColor: 'rgba(10,14,39,0)' }}
                    animate={{ backgroundColor: 'rgba(10,14,39,0.7)' }}
                    exit={{ backgroundColor: 'rgba(10,14,39,0)', opacity: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Phase 1 Text */}
                    <motion.div
                        className="absolute font-mono text-2xl text-[#00ff88]"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: [0, 1, 1, 0], y: [10, 0, 0, -10] }}
                        transition={{ duration: 1.0, times: [0, 0.5, 0.8, 1] }}
                    >
                        CIVION INITIALIZING...
                    </motion.div>

                    {/* Phase 3 Text */}
                    <motion.div
                        className="absolute font-mono text-3xl font-bold text-[#00ff88]"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: [0, 1, 1, 0], scale: [0.9, 1.1, 1.0, 1.0] }}
                        transition={{ duration: 1.5, delay: 1.0, times: [0, 0.2, 0.7, 1] }}
                    >
                        SYSTEM ONLINE ✓
                    </motion.div>

                    {/* Rain Particles */}
                    {particles.map((particle) => (
                        <motion.div
                            key={particle.id}
                            className="fixed rounded-full bg-[#00ff88]"
                            style={{ width: '4px', height: '4px', left: `${particle.x}%` }}
                            initial={{ y: -20, opacity: 0.6 }}
                            animate={{ y: '110vh' }}
                            transition={{
                                duration: particle.duration,
                                delay: 0.5 + particle.delay,
                                ease: 'linear',
                            }}
                        />
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
    );
};
