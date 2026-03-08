"use client";

import React, { useState } from 'react';
import { PersonaCard, Persona } from '@/components/personas/PersonaCard';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

// Hardcoded for demo, normally fetched
const initialPersonas: Persona[] = [
    {
        id: 'p_1',
        name: 'Default NICK',
        emoji: '🤖',
        description: 'The standard highly analytical, objective, and somewhat formal personal assistant system.',
        usage_count: 1420,
        is_active: true
    },
    {
        id: 'p_2',
        name: 'Skeptical Analyst',
        emoji: '🧐',
        description: 'A persona that requires high degrees of proof, plays devil\'s advocate, and defaults to questioning assumptions.',
        usage_count: 45,
        is_active: false
    },
    {
        id: 'p_3',
        name: 'Rapid Researcher',
        emoji: '⚡️',
        description: 'Optimized for speed. Provides bulleted summaries, ignores pleasantries, prioritizes recency over deep historical context.',
        usage_count: 215,
        is_active: false
    },
    {
        id: 'p_4',
        name: 'Creative Synthesizer',
        emoji: '🎨',
        description: 'Looks for unusual connections between distant signals. Brainstorms out-of-the-box predictions.',
        usage_count: 12,
        is_active: false
    }
];

export default function PersonasPage() {
    const [personas, setPersonas] = useState<Persona[]>(initialPersonas);
    const { addToast } = useToast();

    const handleApply = (id: string) => {
        setPersonas(personas.map(p => ({
            ...p,
            is_active: p.id === id
        })));
        addToast('success', 'Persona Applied', 'The network will now adapt to this interaction style.');
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500 max-w-5xl mx-auto">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary tracking-tight">System Personas</h1>
                    <p className="text-sm text-text-secondary mt-1">Change NICK's behavior, communication style, and analytical focus.</p>
                </div>

                <div>
                    <Button variant="primary">
                        Create Custom Persona
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {personas.map(persona => (
                    <PersonaCard
                        key={persona.id}
                        persona={persona}
                        onApply={handleApply}
                    />
                ))}
            </div>

        </div>
    );
}
