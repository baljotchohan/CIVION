'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function Dashboard() {
    const [confidence] = useState(0.85);

    return (
        <div className="p-6 h-full flex flex-col space-y-6">
            <header className="flex justify-between items-center border-b border-border-color pb-4">
                <div>
                    <h2 className="text-2xl font-bold neon-text">■ CIVION COMMAND CENTER</h2>
                    <p className="text-text-secondary text-sm">GLOBAL INTELLIGENCE NETWORK OVERVIEW</p>
                </div>
                <div className="flex space-x-4 text-xl">
                    <span className="cursor-pointer hover:text-accent-primary">⚙</span>
                    <span className="cursor-pointer hover:text-accent-primary">🔔</span>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Real-time Status */}
                <div className="sci-fi-card p-6">
                    <h3 className="font-mono text-accent-primary mb-4">[REAL-TIME STATUS]</h3>
                    <ul className="space-y-2 text-sm">
                        <li className="flex justify-between"><span>Active Agents:</span> <span className="text-success">6/6</span></li>
                        <li className="flex justify-between"><span>Active Signals:</span> <span className="text-info">47</span></li>
                        <li className="flex justify-between"><span>Predictions:</span> <span className="text-warning">23</span></li>
                        <li className="flex justify-between"><span>System Uptime:</span> <span className="text-text-primary">99.9%</span></li>
                    </ul>
                </div>

                {/* Active Signals */}
                <div className="sci-fi-card p-6 animated-border">
                    <h3 className="font-mono text-accent-secondary mb-4">[ACTIVE SIGNALS]</h3>
                    <ul className="space-y-3 text-sm">
                        <li className="flex items-center space-x-2"><span className="status-pulse bg-success"></span><span>Robotics Ecosystem</span></li>
                        <li className="flex items-center space-x-2"><span className="status-pulse bg-success"></span><span>AI Hardware Breakthrough</span></li>
                        <li className="flex items-center space-x-2"><span className="status-pulse bg-warning"></span><span>Crypto Meta-Trend</span></li>
                        <li className="flex items-center space-x-2"><span className="status-pulse bg-error"></span><span>Security Threat Level</span></li>
                    </ul>
                </div>

                {/* Confidence Cascade Sample */}
                <div className="sci-fi-card p-6 md:col-span-1">
                    <h3 className="font-mono text-accent-tertiary mb-2">[CONFIDENCE CASCADE]</h3>
                    <p className="text-xs text-text-secondary mb-4 text-right">Target 0.95</p>
                    <div className="h-4 bg-bg-secondary rounded-full overflow-hidden mb-2 border border-border-color">
                        <motion.div
                            className="h-full bg-gradient-to-r from-error via-warning to-success"
                            initial={{ width: "30%" }}
                            animate={{ width: `${confidence * 100}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                    </div>
                    <div className="flex justify-between text-xs font-mono">
                        <span className="text-text-secondary">0.55 INITIAL</span>
                        <span className="text-success font-bold neon-text">85% CURRENT</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                {/* Reasoning Loop */}
                <div className="sci-fi-card p-6 flex flex-col">
                    <h3 className="font-mono text-accent-primary mb-4 border-b border-border-color pb-2">MULTI-AGENT REASONING IN PROGRESS</h3>
                    <div className="flex-1 space-y-4 text-sm font-mono mt-4">
                        <div className="cascade-item text-text-secondary">Agent A: <span className="text-text-primary">"AI Robotics growing 40%"</span> <span className="text-success">✓</span></div>
                        <div className="cascade-item text-text-secondary">Agent B: <span className="text-text-primary">"Verifying sustainability..."</span> <span className="text-warning animate-pulse">▌▌▌</span></div>
                        <div className="cascade-item text-text-secondary">Agent C: <span className="text-text-primary">"Market data confirms"</span> <span className="text-success">✓</span></div>
                        <div className="cascade-item text-text-secondary mt-6">Agent D: <span className="text-accent-secondary">"Synthesizing consensus..."</span></div>
                    </div>
                </div>

                {/* Predictions */}
                <div className="sci-fi-card p-6 flex flex-col">
                    <h3 className="font-mono text-accent-secondary mb-4 border-b border-border-color pb-2">PREDICTIVE INTELLIGENCE</h3>
                    <div className="flex-1 space-y-4 text-sm mt-4">
                        <div className="p-3 bg-bg-secondary border border-border-color rounded cascade-item flex justify-between">
                            <span>🔮 Robot IPO wave in 3 months</span>
                            <span className="text-success">85%</span>
                        </div>
                        <div className="p-3 bg-bg-secondary border border-border-color rounded cascade-item flex justify-between">
                            <span>🔮 Hardware breakthrough in 6 weeks</span>
                            <span className="text-warning">72%</span>
                        </div>
                        <div className="p-3 bg-bg-secondary border border-border-color rounded cascade-item flex justify-between">
                            <span>🔮 Market boom in 18 months</span>
                            <span className="text-success">88%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
