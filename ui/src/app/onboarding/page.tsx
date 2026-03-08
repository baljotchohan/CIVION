"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { NickCharacter } from '@/components/nick/NickCharacter';

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({ name: '', occupation: '', objective: '' });
    const [loading, setLoading] = useState(false);

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

    const handleSubmit = async () => {
        setLoading(true);
        // Real implementation would save this profile to the backend via Nick memory
        try {
            await fetch('/api/v1/nick/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    occupation: formData.occupation,
                    interests: [formData.objective]
                })
            });
            // Simulate delay for effect
            await new Promise(r => setTimeout(r, 1500));
            router.push('/');
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-bg-base flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
            <div className="max-w-2xl w-full flex flex-col items-center">

                <div className="mb-10 text-center animate-in slide-in-from-top-8 fade-in duration-700">
                    <NickCharacter size="lg" state={step === 3 ? 'thinking' : 'idle'} />
                    <h1 className="mt-8 text-3xl font-bold tracking-tight text-text-primary">
                        {step === 1 && "Welcome to CIVION"}
                        {step === 2 && "Configure the Network"}
                        {step === 3 && "Initializing Subsystems"}
                    </h1>
                    <p className="mt-2 text-text-secondary">
                        {step === 1 && "Your personal intelligence network."}
                        {step === 2 && "Tell me a bit about what you're looking for."}
                        {step === 3 && "Stand by, configuring your dedicated agent fleet."}
                    </p>
                </div>

                <Card className="w-full shadow-2xl animate-in fade-in duration-500 delay-300 fill-mode-both border-border-strong">
                    <CardContent className="p-8 sm:p-10">

                        {step === 1 && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-text-primary mb-2">What should I call you?</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Alex"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-bg-subtle border border-border rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-primary mb-2">What is your primary occupation/focus?</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Crypto Researcher, Developer, Swing Trader"
                                        value={formData.occupation}
                                        onChange={e => setFormData({ ...formData, occupation: e.target.value })}
                                        className="w-full bg-bg-subtle border border-border rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                                    />
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-text-primary mb-2">What is your main objective for CIVION?</label>
                                    <textarea
                                        rows={4}
                                        placeholder="e.g. Find early alpha on emerging AI protocols, monitor competitor feature launches..."
                                        value={formData.objective}
                                        onChange={e => setFormData({ ...formData, objective: e.target.value })}
                                        className="w-full bg-bg-subtle border border-border rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all resize-none"
                                    />
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-5 text-center py-6">
                                <div className="flex items-center justify-center gap-3 text-success">
                                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span className="font-medium">Connecting to API endpoints...</span>
                                </div>
                                <div className="flex items-center justify-center gap-3 text-success">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="font-medium">Verifying LLM provider keys...</span>
                                </div>
                                <div className="flex items-center justify-center gap-3 text-success">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="font-medium">Bootstrapping network agents...</span>
                                </div>
                                <div className="text-sm text-text-muted mt-8">
                                    NICK will remember your preferences and tailor the network's focus appropriately.
                                </div>
                            </div>
                        )}

                        <div className={`mt-10 flex ${step === 1 ? 'justify-end' : 'justify-between'} pt-6 border-t border-border`}>
                            {step > 1 && step < 3 && (
                                <Button variant="ghost" onClick={handleBack}>
                                    Back
                                </Button>
                            )}
                            {step < 3 ? (
                                <Button variant="primary" onClick={handleNext} disabled={step === 1 && !formData.name}>
                                    Continue →
                                </Button>
                            ) : (
                                <Button variant="primary" onClick={handleSubmit} loading={loading} className="w-full">
                                    {loading ? 'Entering Dashboard...' : 'Initialize CIVION'}
                                </Button>
                            )}
                        </div>

                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
