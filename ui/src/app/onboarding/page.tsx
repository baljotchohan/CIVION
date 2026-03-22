"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { NickCharacter } from '@/components/nick/NickCharacter';
import { storage } from '@/services/storage';

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        business: '',
        occupation: '',
        industry: '',
        goals: ['', '', ''],
        useCase: ''
    });
    const [apiKey, setApiKey] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleNext = () => {
        if (step === 1) {
            if (!formData.name || !formData.business) {
                setError('Please fill in your name and business.');
                return;
            }
            // Save profile
            storage.saveUserProfile({
                name: formData.name,
                business: formData.business,
                occupation: formData.occupation,
                industry: formData.industry,
                goals: formData.goals.filter(g => g.trim()),
                useCase: formData.useCase,
            });
            setError('');
            setStep(2);
        }
    };

    const handleApiKeySubmit = async () => {
        if (!apiKey.trim()) {
            setError('API key is required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const { ClaudeClient } = await import('@/services/claude-api');
            const claude = new ClaudeClient(apiKey);
            const isValid = await claude.testConnection();

            if (!isValid) {
                setError('Could not connect — please check your API key.');
                setLoading(false);
                return;
            }

            storage.saveApiKey(apiKey);
            setStep(3);
        } catch (err: unknown) {
            const error = err as { message?: string };
            setError(error.message || 'Connection failed');
        } finally {
            setLoading(false);
        }
    };

    const handleStart = () => {
        storage.setOnboarded(true);
        router.push('/dashboard');
    };

    return (
        <div className="fixed inset-0 z-50 bg-bg-base flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
            <div className="max-w-2xl w-full flex flex-col items-center">

                <div className="mb-10 text-center animate-in slide-in-from-top-8 fade-in duration-700">
                    <NickCharacter size="lg" state={step === 3 ? 'thinking' : 'idle'} />
                    <h1 className="mt-8 text-3xl font-bold tracking-tight text-text-primary">
                        {step === 1 && "Welcome to CIVION"}
                        {step === 2 && "Connect Your AI"}
                        {step === 3 && "All Systems Ready"}
                    </h1>
                    <p className="mt-2 text-text-secondary">
                        {step === 1 && "Tell us about yourself so your agents can work for you."}
                        {step === 2 && "Provide your Claude API key to power your agents."}
                        {step === 3 && "Your personal intelligence network is initialized."}
                    </p>

                    {/* Progress bar */}
                    <div className="flex gap-2 mt-6 max-w-[200px] mx-auto">
                        <div className={`flex-1 h-1 rounded-full ${step >= 1 ? 'bg-accent' : 'bg-border'}`} />
                        <div className={`flex-1 h-1 rounded-full ${step >= 2 ? 'bg-accent' : 'bg-border'}`} />
                        <div className={`flex-1 h-1 rounded-full ${step >= 3 ? 'bg-accent' : 'bg-border'}`} />
                    </div>
                </div>

                <Card className="w-full shadow-2xl animate-in fade-in duration-500 delay-300 fill-mode-both border-border-strong">
                    <CardContent className="p-8 sm:p-10">

                        {/* STEP 1: Profile */}
                        {step === 1 && (
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-text-primary mb-2">What&apos;s your name?</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Alex Chen"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-bg-subtle border border-border rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-primary mb-2">What&apos;s your business?</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. TechStart Inc."
                                        value={formData.business}
                                        onChange={e => setFormData({ ...formData, business: e.target.value })}
                                        className="w-full bg-bg-subtle border border-border rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-primary mb-2">Your role</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. CEO, Developer, Designer"
                                        value={formData.occupation}
                                        onChange={e => setFormData({ ...formData, occupation: e.target.value })}
                                        className="w-full bg-bg-subtle border border-border rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-primary mb-2">Industry</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. AI/ML, FinTech, E-commerce"
                                        value={formData.industry}
                                        onChange={e => setFormData({ ...formData, industry: e.target.value })}
                                        className="w-full bg-bg-subtle border border-border rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-primary mb-2">Your top 3 goals</label>
                                    {formData.goals.map((goal, i) => (
                                        <input
                                            key={i}
                                            type="text"
                                            value={goal}
                                            onChange={e => {
                                                const newGoals = [...formData.goals];
                                                newGoals[i] = e.target.value;
                                                setFormData({ ...formData, goals: newGoals });
                                            }}
                                            placeholder={`Goal ${i + 1}`}
                                            className="w-full bg-bg-subtle border border-border rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all mb-2"
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* STEP 2: API Key */}
                        {step === 2 && (
                            <div className="space-y-5">
                                <div className="bg-accent-soft border border-accent/20 rounded-lg p-4">
                                    <p className="text-sm text-text-primary">
                                        <strong>Get your API key:</strong>{' '}
                                        <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                                            console.anthropic.com
                                        </a>
                                    </p>
                                    <p className="text-xs text-text-secondary mt-1">
                                        Your key stays in your browser&apos;s localStorage. Never sent anywhere except Anthropic.
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-primary mb-2">Claude API Key</label>
                                    <input
                                        type="password"
                                        value={apiKey}
                                        onChange={e => setApiKey(e.target.value)}
                                        placeholder="sk-ant-..."
                                        className="w-full bg-bg-subtle border border-border rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all font-mono text-sm"
                                    />
                                </div>
                            </div>
                        )}

                        {/* STEP 3: Ready */}
                        {step === 3 && (
                            <div className="space-y-5 text-center py-4">
                                <div className="bg-success-soft border border-success/20 rounded-lg p-6">
                                    <p className="text-success font-semibold mb-4 text-lg">✓ All Systems Online</p>
                                    <ul className="text-sm text-text-secondary space-y-2 text-left max-w-sm mx-auto">
                                        <li className="flex items-center gap-2"><span className="text-success">✓</span> Personal Agent initialized</li>
                                        <li className="flex items-center gap-2"><span className="text-success">✓</span> 5 Agents ready (Goal, Research, Analysis, Execution, Monitoring)</li>
                                        <li className="flex items-center gap-2"><span className="text-success">✓</span> Debate system enabled</li>
                                        <li className="flex items-center gap-2"><span className="text-success">✓</span> Confidence scoring active</li>
                                        <li className="flex items-center gap-2"><span className="text-success">✓</span> Data persisted locally</li>
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <p className="text-danger text-sm mt-4">{error}</p>
                        )}

                        {/* Actions */}
                        <div className={`mt-8 flex ${step === 1 ? 'justify-end' : 'justify-between'} pt-6 border-t border-border`}>
                            {step === 2 && (
                                <Button variant="ghost" onClick={() => setStep(1)}>
                                    ← Back
                                </Button>
                            )}
                            {step === 1 && (
                                <Button variant="primary" onClick={handleNext} disabled={!formData.name}>
                                    Continue →
                                </Button>
                            )}
                            {step === 2 && (
                                <Button variant="primary" onClick={handleApiKeySubmit} loading={loading} disabled={loading || !apiKey}>
                                    {loading ? 'Testing connection...' : 'Verify & Continue →'}
                                </Button>
                            )}
                            {step === 3 && (
                                <Button variant="primary" onClick={handleStart} className="w-full">
                                    Launch CIVION →
                                </Button>
                            )}
                        </div>

                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
