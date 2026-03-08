import React from 'react';
import { Card, CardContent } from './Card';
import { Button } from './Button';

export interface EmptyStateProps {
    title: string;
    description: string;
    actionText?: string;
    onAction?: () => void;
    className?: string;
    icon?: React.ReactNode;
}

export function EmptyState({
    title,
    description,
    actionText,
    onAction,
    className = '',
    icon
}: EmptyStateProps) {
    return (
        <Card className={`border-dashed border-border-strong bg-bg-subtle/30 ${className}`}>
            <CardContent className="p-10 flex flex-col items-center justify-center text-center">

                {/* NICK-style simple visual if no explicit icon provided */}
                <div className="mb-6 relative">
                    {icon ? icon : (
                        <div className="w-20 h-24 relative flex items-center justify-center">
                            <div className="w-16 h-16 rounded-2xl bg-bg-card border-2 border-border shadow-sm flex items-center justify-center relative z-10 animate-[bounce_3s_infinite]">
                                <div className="flex gap-2">
                                    <div className="w-2 h-2 rounded-full bg-text-primary"></div>
                                    <div className="w-2 h-2 rounded-full bg-text-primary"></div>
                                </div>
                            </div>
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0.5 h-3 bg-border"></div>
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-accent animate-pulse"></div>
                        </div>
                    )}
                </div>

                <h3 className="font-semibold text-text-primary text-xl mb-2">{title}</h3>
                <p className="text-text-secondary text-base mb-8 max-w-md leading-relaxed">
                    {description}
                </p>

                {actionText && onAction && (
                    <Button onClick={onAction} size="md">
                        {actionText}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
