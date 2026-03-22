"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { storage, SavedGoal } from "@/services/storage";
import { useAgentStore } from "@/store/agentStore";

export default function GoalsPage() {
    const { gemini } = useAgentStore();
    const [goals, setGoals] = useState<SavedGoal[]>([]);
    const [newGoal, setNewGoal] = useState("");
    const [analyzing, setAnalyzing] = useState<string | null>(null);
    const [expandedGoal, setExpandedGoal] = useState<string | null>(null);

    useEffect(() => {
        setGoals(storage.getGoals());
    }, []);

    const handleAddGoal = async () => {
        if (!newGoal.trim()) return;

        const goal: SavedGoal = {
            id: crypto.randomUUID(),
            text: newGoal,
            analysis: null,
            createdAt: new Date().toISOString(),
        };

        storage.saveGoal(goal);
        setGoals((prev) => [goal, ...prev]);
        setNewGoal("");
    };

    const handleAnalyze = async (goal: SavedGoal) => {
        if (!gemini || analyzing) return;

        setAnalyzing(goal.id);
        try {
            const { GoalAgent } = await import("@/agents/goal-agent");
            const agent = new GoalAgent(gemini);
            const analysis = await agent.analyzeGoal(goal.text);

            const updated = { ...goal, analysis };
            setGoals((prev) =>
                prev.map((g) => (g.id === goal.id ? updated : g))
            );

            // Update in storage
            storage.deleteGoal(goal.id);
            storage.saveGoal(updated);
            setExpandedGoal(goal.id);
        } catch (error) {
            console.error("Analysis failed:", error);
        } finally {
            setAnalyzing(null);
        }
    };

    const handleDelete = (id: string) => {
        storage.deleteGoal(id);
        setGoals((prev) => prev.filter((g) => g.id !== id));
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-text-primary tracking-tight">Goals</h1>
                <p className="text-text-secondary mt-1">
                    Track your objectives and get AI-powered analysis from the Goal Agent.
                </p>
            </div>

            {/* Add Goal */}
            <Card>
                <CardContent className="p-5">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={newGoal}
                            onChange={(e) => setNewGoal(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAddGoal()}
                            placeholder="Add a new goal..."
                            className="flex-1 bg-bg-subtle border border-border rounded-lg px-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                        />
                        <Button
                            variant="primary"
                            onClick={handleAddGoal}
                            disabled={!newGoal.trim()}
                        >
                            Add Goal
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Goals List */}
            {goals.length === 0 ? (
                <Card>
                    <CardContent className="p-10 text-center">
                        <div className="text-4xl mb-3">🎯</div>
                        <h3 className="text-sm font-medium text-text-primary mb-1">No goals yet</h3>
                        <p className="text-xs text-text-secondary">
                            Add your first goal above and let the AI analyze a path to achievement.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {goals.map((goal) => (
                        <Card key={goal.id} hoverable>
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-medium text-text-primary">{goal.text}</h3>
                                        <p className="text-xs text-text-muted mt-1">
                                            Added {new Date(goal.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {!goal.analysis && (
                                            <Button
                                                variant="secondary"
                                                onClick={() => handleAnalyze(goal)}
                                                disabled={!gemini || analyzing === goal.id}
                                            >
                                                {analyzing === goal.id ? (
                                                    <span className="flex items-center gap-2">
                                                        <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                        </svg>
                                                        Analyzing...
                                                    </span>
                                                ) : "Analyze"}
                                            </Button>
                                        )}
                                        {goal.analysis && (
                                            <button
                                                onClick={() => setExpandedGoal(expandedGoal === goal.id ? null : goal.id)}
                                                className="text-xs text-accent hover:underline"
                                            >
                                                {expandedGoal === goal.id ? "Hide" : "View"} analysis
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(goal.id)}
                                            className="text-text-muted hover:text-danger transition-colors"
                                            title="Delete"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                {expandedGoal === goal.id && goal.analysis && (
                                    <div className="mt-4 pt-4 border-t border-border text-sm text-text-primary bg-bg-subtle rounded-lg p-4 leading-relaxed whitespace-pre-wrap">
                                        {goal.analysis}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
