import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';

export interface Persona {
    id: string;
    name: string;
    emoji: string;
    description: string;
    usage_count: number;
    is_active: boolean;
}

export interface PersonaCardProps {
    persona: Persona;
    onApply: (id: string) => void;
    onEdit?: (id: string) => void;
    className?: string;
}

export function PersonaCard({ persona, onApply, onEdit, className = '' }: PersonaCardProps) {
    return (
        <Card
            className={`relative overflow-hidden transition-all ${persona.is_active ? 'border-accent ring-1 ring-accent/50' : ''
                } ${className}`}
        >
            {persona.is_active && (
                <div className="absolute top-0 right-0 w-12 h-12 bg-accent/10 border-b border-l border-accent/20 rounded-bl-2xl flex items-start justify-end p-1.5">
                    <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            )}

            <CardContent className="p-5 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-bg-subtle border border-border flex items-center justify-center text-2xl shadow-sm">
                        {persona.emoji}
                    </div>
                    <div>
                        <h3 className="font-semibold text-text-primary">{persona.name}</h3>
                        <span className="text-xs text-text-muted">Used {persona.usage_count} times</span>
                    </div>
                </div>

                <p className="text-sm text-text-secondary leading-relaxed mb-5 flex-1 line-clamp-3">
                    {persona.description}
                </p>

                <div className="flex items-center gap-2 mt-auto pt-4 border-t border-border">
                    <Button
                        variant={persona.is_active ? "secondary" : "primary"}
                        size="sm"
                        className="flex-1"
                        onClick={() => onApply(persona.id)}
                        disabled={persona.is_active}
                    >
                        {persona.is_active ? 'Active' : 'Apply'}
                    </Button>

                    {onEdit && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(persona.id)}
                            className="px-3"
                        >
                            Edit
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
