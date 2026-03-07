'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';

const mockGoals = [
    { id: 'goal_a1b2', title: 'Analyze AI Robotics Market', state: 'completed', priority: 9, progress: 1.0, tasks: 4, created_at: '2026-03-06T10:00:00Z' },
    { id: 'goal_c3d4', title: 'Track DeFi Protocol Trends', state: 'executing', priority: 7, progress: 0.6, tasks: 3, created_at: '2026-03-07T08:00:00Z' },
    { id: 'goal_e5f6', title: 'Monitor Cybersecurity Landscape', state: 'decomposed', priority: 8, progress: 0.0, tasks: 5, created_at: '2026-03-07T09:00:00Z' },
    { id: 'goal_g7h8', title: 'Predict Hardware Breakthroughs', state: 'created', priority: 6, progress: 0.0, tasks: 0, created_at: '2026-03-07T12:00:00Z' },
];

const stateColors: Record<string, string> = {
    created: 'badge-cyan', decomposed: 'badge-purple', executing: 'badge-yellow', completed: 'badge-green', failed: 'badge-red',
};

export default function GoalsPage() {
    const [showCreate, setShowCreate] = useState(false);
    const [newTitle, setNewTitle] = useState('');

    return (
        <div className="p-6 space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="page-title">🎯 Intelligence Goals</h2>
                    <p className="page-subtitle">Create and manage intelligence objectives</p>
                </div>
                <button className="btn-primary" onClick={() => setShowCreate(!showCreate)}>+ Create Goal</button>
            </header>

            {showCreate && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="sci-fi-card p-5">
                    <h3 className="text-sm font-mono text-accent-primary mb-3">NEW GOAL</h3>
                    <div className="flex space-x-3">
                        <input className="input-field flex-1" placeholder="Describe your intelligence goal..." value={newTitle} onChange={e => setNewTitle(e.target.value)} />
                        <button className="btn-primary" onClick={() => { setShowCreate(false); setNewTitle(''); }}>Create</button>
                    </div>
                </motion.div>
            )}

            <div className="space-y-3">
                {mockGoals.map((goal, i) => (
                    <motion.div key={goal.id} className="sci-fi-card p-5" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                    <h3 className="font-semibold">{goal.title}</h3>
                                    <span className={`badge ${stateColors[goal.state]}`}>{goal.state}</span>
                                </div>
                                <div className="flex space-x-4 text-xs text-text-tertiary">
                                    <span>ID: {goal.id}</span>
                                    <span>Priority: {goal.priority}/10</span>
                                    <span>Tasks: {goal.tasks}</span>
                                </div>
                                {goal.progress > 0 && (
                                    <div className="mt-3">
                                        <div className="confidence-bar">
                                            <div className="confidence-fill" style={{ width: `${goal.progress * 100}%` }} />
                                        </div>
                                        <p className="text-xs text-text-tertiary mt-1">{(goal.progress * 100).toFixed(0)}% complete</p>
                                    </div>
                                )}
                            </div>
                            <div className="flex space-x-2 ml-4">
                                {goal.state === 'created' && <button className="btn-secondary text-xs">Decompose</button>}
                                {goal.state === 'decomposed' && <button className="btn-primary text-xs">Execute</button>}
                                {goal.state === 'executing' && <button className="btn-secondary text-xs">Progress</button>}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
