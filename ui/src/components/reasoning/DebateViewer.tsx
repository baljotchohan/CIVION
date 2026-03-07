'use client';

import { motion } from 'framer-motion';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useState, useEffect } from 'react';

export const DebateViewer = ({ loopId }: { loopId: string }) => {
    const { latestEvent } = useWebSocket();
    const [debate, setDebate] = useState<any>(null);
    const [confidence, setConfidence] = useState(0.55);

    useEffect(() => {
        if (latestEvent?.type === 'reasoning_updated' && latestEvent.data.loop_id === loopId) {
            setDebate(latestEvent.data.data); // data field contains the reasoning loop dict
        }

        if (latestEvent?.type === 'confidence_changed' && latestEvent.data.loop_id === loopId) {
            setConfidence(latestEvent.data.confidence);
        }
    }, [latestEvent, loopId]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="border border-cyan-500/30 rounded-lg p-6 bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-sm">
                <h2 className="text-2xl font-bold text-cyan-400 mb-2">Multi-Agent Reasoning</h2>
                <p className="text-gray-400">{debate?.hypothesis || 'Analyzing...'}</p>
            </div>

            {/* Confidence Bar */}
            <motion.div className="border border-green-500/30 rounded-lg p-6 bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-sm">
                <div className="flex justify-between mb-4">
                    <span className="text-gray-300">Confidence Level</span>
                    <motion.span
                        className="text-2xl font-bold text-green-400"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 0.5 }}
                    >
                        {(confidence * 100).toFixed(0)}%
                    </motion.span>
                </div>

                {/* Animated Bar */}
                <div className="h-3 bg-slate-700 rounded-full overflow-hidden border border-green-500/20">
                    <motion.div
                        className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                        initial={{ width: '55%' }}
                        animate={{ width: `${confidence * 100}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                </div>

                {/* Glow effect */}
                <motion.div
                    className="mt-4 h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent blur-lg"
                    animate={{ opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            </motion.div>

            {/* Arguments Timeline */}
            <div className="space-y-3">
                {debate?.arguments?.map((arg: any, i: number) => (
                    <motion.div
                        key={i}
                        className="border border-cyan-500/20 rounded-lg p-4 bg-gradient-to-r from-slate-900/70 to-slate-800/70 backdrop-blur-sm"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.2 }}
                        whileHover={{
                            borderColor: 'rgba(0, 255, 136, 0.5)',
                            boxShadow: '0 0 20px rgba(0, 255, 136, 0.2)'
                        }}
                    >
                        <div className="flex items-start space-x-4">
                            {/* Agent Avatar */}
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-500/30 flex items-center justify-center flex-shrink-0 border border-cyan-500/50">
                                <span className="text-cyan-300 font-bold text-sm">🤖</span>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-cyan-300">{arg.agent}</h4>
                                <p className="text-gray-300 mt-1">{arg.argument || arg.content}</p>

                                {/* Confidence */}
                                <div className="mt-3 flex items-center space-x-2">
                                    <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden max-w-xs">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-cyan-500 to-green-500"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${arg.confidence * 100}%` }}
                                            transition={{ duration: 0.6, delay: i * 0.2 }}
                                        />
                                    </div>
                                    <span className="text-sm text-gray-400 w-12 text-right">
                                        {(arg.confidence * 100).toFixed(0)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Final Consensus */}
            {debate?.consensus && (
                <motion.div
                    className="border-2 border-green-500/50 rounded-lg p-6 bg-gradient-to-br from-green-900/20 to-slate-900/50 backdrop-blur-sm"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                >
                    <h3 className="text-xl font-bold text-green-400 mb-2">✓ Consensus Reached</h3>
                    <p className="text-gray-300">{debate.consensus}</p>
                    <p className="text-green-400 mt-2 text-sm">
                        Confidence: {(confidence * 100).toFixed(0)}%
                    </p>
                </motion.div>
            )}
        </div>
    );
};
