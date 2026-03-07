'use client';

import { motion } from 'framer-motion';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useState, useEffect } from 'react';

export const ConfidenceCascade = ({ insightId }: { insightId: string }) => {
    const { latestEvent } = useWebSocket();
    const [cascadeEvents, setCascadeEvents] = useState<any[]>([]);
    const [currentConfidence, setCurrentConfidence] = useState(0.55);

    useEffect(() => {
        // Note: The backend uses 'loop_id' for reasoning, but 'insight_id' might be used for other confidence changes
        if (latestEvent?.type === 'confidence_changed' && (latestEvent.data.insight_id === insightId || latestEvent.data.loop_id === insightId)) {
            const newEvent = {
                agent: latestEvent.data.agent,
                confidence: latestEvent.data.confidence,
                timestamp: new Date(latestEvent.timestamp),
            };

            setCascadeEvents(prev => [...prev, newEvent]);
            setCurrentConfidence(latestEvent.data.confidence);
        }
    }, [latestEvent, insightId]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.5 },
        },
    };

    return (
        <div className="space-y-6">
            {/* Main Confidence Display */}
            <motion.div
                className="border border-cyan-500/30 rounded-lg p-8 bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-sm"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-cyan-400">Confidence Building</h3>
                    <motion.div
                        className="text-4xl font-black text-green-400"
                        key={currentConfidence}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.3 }}
                    >
                        {(currentConfidence * 100).toFixed(0)}%
                    </motion.div>
                </div>

                {/* Animated Bar */}
                <div className="space-y-4">
                    <div className="h-4 bg-slate-700 rounded-full overflow-hidden border border-green-500/20">
                        <motion.div
                            className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                            initial={{ width: '55%' }}
                            animate={{ width: `${currentConfidence * 100}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                        />
                    </div>

                    {/* Glow Effect */}
                    <motion.div
                        className="h-2 bg-gradient-to-r from-transparent via-green-500 to-transparent blur-lg"
                        animate={{ opacity: [0.3, 0.8, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                </div>
            </motion.div>

            {/* Cascade Timeline */}
            <motion.div
                className="space-y-2"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {cascadeEvents.map((event, i) => (
                    <motion.div
                        key={i}
                        className="flex items-center space-x-4 p-3 rounded-lg border border-cyan-500/20 bg-gradient-to-r from-slate-900/50 to-slate-800/30 hover:border-cyan-500/50 transition-colors"
                        variants={itemVariants}
                        whileHover={{
                            x: 5,
                            boxShadow: '0 0 20px rgba(0, 255, 136, 0.1)'
                        }}
                    >
                        {/* Agent Avatar */}
                        <motion.div
                            className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 border border-cyan-500/50"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.5 }}
                        >
                            <span className="text-xs font-bold text-cyan-400">✓</span>
                        </motion.div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="font-semibold text-cyan-300">{event.agent}</div>
                            <div className="text-xs text-gray-500">
                                {event.timestamp.toLocaleTimeString()}
                            </div>
                        </div>

                        {/* Confidence Badge */}
                        <motion.div
                            className="text-right flex-shrink-0"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="text-sm font-bold text-green-400">
                                {(event.confidence * 100).toFixed(0)}%
                            </div>
                        </motion.div>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
};
