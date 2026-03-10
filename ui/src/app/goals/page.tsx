'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystemState } from '../../hooks/useSystemState';
import { useAliveState } from '../../hooks/useAliveState';
import { EmptyState } from '../../components/ui/EmptyState';
import { DemoModeBanner } from '../../components/ui/DemoModeBanner';
import { NeonButton } from '../../components/ui/NeonButton';
import { Target, Plus } from 'lucide-react';
import { classNames } from '../../lib/utils';

export default function GoalsPage() {
    const { systemState } = useSystemState();
    const { dataMode } = useAliveState();
    const [showCreate, setShowCreate] = useState(false);
    const [newTitle, setNewTitle] = useState('');

    const mockGoals = [
        { id: 'goal_a1b2', title: 'Analyze AI Robotics Market', state: 'completed', priority: 9, progress: 1.0, tasks: 4, created_at: '2026-03-06T10:00:00Z' },
        { id: 'goal_c3d4', title: 'Track DeFi Protocol Trends', state: 'executing', priority: 7, progress: 0.6, tasks: 3, created_at: '2026-03-07T08:00:00Z' },
        { id: 'goal_e5f6', title: 'Monitor Cybersecurity Landscape', state: 'decomposed', priority: 8, progress: 0.0, tasks: 5, created_at: '2026-03-07T09:00:00Z' },
        { id: 'goal_g7h8', title: 'Predict Hardware Breakthroughs', state: 'created', priority: 6, progress: 0.0, tasks: 0, created_at: '2026-03-07T12:00:00Z' },
    ];

    const stateColors: Record<string, string> = {
        created: 'text-[#00d4ff] bg-[#00d4ff]/10 border-[#00d4ff]/30',
        decomposed: 'text-[#9b59b6] bg-[#9b59b6]/10 border-[#9b59b6]/30',
        executing: 'text-[#ffd600] bg-[#ffd600]/10 border-[#ffd600]/30',
        completed: 'text-[#00ff88] bg-[#00ff88]/10 border-[#00ff88]/30',
        failed: 'text-[#ff006e] bg-[#ff006e]/10 border-[#ff006e]/30',
    };

    return (
        <div className="min-h-screen bg-[#0a0e27] text-white p-6 space-y-6 flex flex-col pt-16 lg:pt-6">
            <DemoModeBanner />

            {dataMode === 'empty' ? (
                <EmptyState
                    icon={<Target className="w-8 h-8" />}
                    title="Goal Management Offline"
                    description="Intelligence objectives require active agents and API connections."
                />
            ) : (
                <>
                    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[rgba(26,31,58,0.8)] backdrop-blur-[20px] p-6 rounded-xl border border-[rgba(0,255,136,0.2)] shadow-[0_0_20px_rgba(0,255,136,0.1)] gap-4 shrink-0">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-xl bg-[rgba(255,0,110,0.1)] border border-[#ff006e]/50 flex items-center justify-center shadow-[0_0_15px_rgba(255,0,110,0.2)] shrink-0">
                                <Target className="w-6 h-6 text-[#ff006e]" />
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-sans tracking-widest font-bold text-white uppercase">Intelligence Goals</h1>
                                <p className="text-[#a0a0a0] font-sans text-xs sm:text-sm mt-1">Create and manage intelligence objectives</p>
                            </div>
                        </div>

                        <NeonButton variant="primary" onClick={() => setShowCreate(!showCreate)} className="px-4 py-2 w-full sm:w-auto">
                            <Plus className="w-4 h-4 mr-2" /> Create Goal
                        </NeonButton>
                    </header>

                    <AnimatePresence>
                        {showCreate && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-[rgba(26,31,58,0.8)] rounded-xl border border-[#00ff88]/50 p-6 shadow-[0_0_20px_rgba(0,255,136,0.1)]">
                                <h3 className="text-sm font-mono text-[#00ff88] uppercase tracking-wider mb-4">New Objective</h3>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <input
                                        className="flex-1 bg-[#0a0e27] border border-[rgba(0,255,136,0.3)] rounded-lg px-4 py-3 text-white font-sans focus:outline-none focus:border-[#00ff88] transition-colors"
                                        placeholder="Describe your intelligence goal..."
                                        value={newTitle}
                                        onChange={e => setNewTitle(e.target.value)}
                                    />
                                    <NeonButton variant="primary" onClick={() => { setShowCreate(false); setNewTitle(''); }} className="py-3 px-6">
                                        Deploy
                                    </NeonButton>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-4 flex-1">
                        <AnimatePresence>
                            {mockGoals.map((goal, i) => (
                                <motion.div
                                    key={goal.id}
                                    className="bg-[rgba(26,31,58,0.8)] backdrop-blur-[20px] rounded-xl p-5 border border-[rgba(0,255,136,0.2)] hover:border-[#00ff88]/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <h3 className="font-bold text-lg tracking-wide text-white">{goal.title}</h3>
                                            <span className={classNames("font-mono text-xs px-2 py-0.5 rounded border uppercase tracking-wider", stateColors[goal.state])}>
                                                {goal.state}
                                            </span>
                                        </div>
                                        <div className="flex space-x-6 text-xs text-[#a0a0a0] font-mono uppercase tracking-wider mb-4 md:mb-0">
                                            <span>ID: <span className="text-white">{goal.id}</span></span>
                                            <span>Priority: <span className="text-white">{goal.priority}/10</span></span>
                                            <span>Tasks: <span className="text-[#00d4ff]">{goal.tasks}</span></span>
                                        </div>
                                        {goal.progress > 0 && (
                                            <div className="mt-4 max-w-md">
                                                <div className="flex justify-between text-xs font-mono mb-1 text-[#a0a0a0]">
                                                    <span>Completion</span>
                                                    <span className="text-[#00ff88]">{(goal.progress * 100).toFixed(0)}%</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-[#1a1f3a] rounded-full overflow-hidden">
                                                    <div className="h-full bg-[#00ff88] shadow-[0_0_10px_#00ff88]" style={{ width: `${goal.progress * 100}%` }} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-3 md:flex-col lg:flex-row shrink-0 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                                        {goal.state === 'created' && <button className="px-4 py-2 bg-[rgba(26,31,58,0.5)] border border-[rgba(0,255,136,0.2)] text-[#a0a0a0] hover:text-white rounded-lg transition-colors text-xs font-bold uppercase tracking-wider">Decompose</button>}
                                        {goal.state === 'decomposed' && <NeonButton variant="primary" className="px-4 py-2 text-xs">Execute</NeonButton>}
                                        {goal.state === 'executing' && <button className="px-4 py-2 bg-[rgba(26,31,58,0.5)] border border-[rgba(0,255,136,0.2)] text-[#00d4ff] hover:bg-[#00d4ff]/10 rounded-lg transition-colors text-xs font-bold uppercase tracking-wider">View Progress</button>}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </>
            )}
        </div>
    );
}
