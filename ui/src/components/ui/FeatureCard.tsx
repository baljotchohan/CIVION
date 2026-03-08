import React, { useState } from 'react';
import { Card, CardContent } from './Card';
import { Button } from './Button';

export interface FeatureCardProps {
    icon: React.ReactNode;
    name: string;
    description: string;
    howItWorks: string;
    onTryIt?: () => void;
    ctaText?: string;
    className?: string;
}

export function FeatureCard({
    icon,
    name,
    description,
    howItWorks,
    onTryIt,
    ctaText = 'Try It Now',
    className = ''
}: FeatureCardProps) {
    const [expanded, setExpanded] = useState(false);

    return (
        <Card className={`overflow-hidden ${className}`}>
            <CardContent className="p-5 flex flex-col h-full">
                <div className="flex items-start gap-4 mb-3">
                    <div className="p-3 bg-accent-soft text-accent rounded-xl">
                        {icon}
                    </div>
                    <div>
                        <h3 className="font-semibold text-text-primary text-lg">{name}</h3>
                        <p className="text-text-secondary text-sm mt-1 leading-relaxed">
                            {description}
                        </p>
                    </div>
                </div>

                <div className="mt-2 mb-4">
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="text-xs font-medium text-text-muted hover:text-text-primary flex items-center gap-1 transition-colors"
                    >
                        How it works {expanded ? '↑' : '↓'}
                    </button>

                    {expanded && (
                        <div className="mt-3 p-3 bg-bg-subtle rounded-lg border border-border text-sm text-text-secondary leading-relaxed animate-in fade-in slide-in-from-top-2 duration-200">
                            {howItWorks}
                        </div>
                    )}
                </div>

                <div className="mt-auto pt-4 border-t border-border flex justify-end">
                    {onTryIt && (
                        <Button variant="outline" size="sm" onClick={onTryIt} className="w-full sm:w-auto">
                            {ctaText} →
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
