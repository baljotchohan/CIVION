'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ConfidenceCascade } from '@/components/dashboard/ConfidenceCascade';
import { DebateViewer } from '@/components/reasoning/DebateViewer';

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

                {/* Confidence Cascade */}
                <div className="md:col-span-1">
                    <ConfidenceCascade insightId="rl_001" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                {/* Reasoning Loop */}
                <div className="sci-fi-card p-6 flex flex-col overflow-hidden">
                    <h3 className="font-mono text-accent-primary mb-4 border-b border-border-color pb-2">MULTI-AGENT REASONING</h3>
                    <div className="flex-1 overflow-y-auto">
                        <DebateViewer loopId="rl_001" />
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
