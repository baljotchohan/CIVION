import React from 'react';
import { Card, CardContent } from './Card';
import { Button } from './Button';

export interface ErrorCardProps {
    title?: string;
    message: string;
    onRetry?: () => void;
    className?: string;
}

export function ErrorCard({ title = 'Error', message, onRetry, className = '' }: ErrorCardProps) {
    return (
        <Card variant="bordered" className={`border-danger/30 bg-danger/5 ${className}`}>
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-danger/10 text-danger flex items-center justify-center mb-4">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h3 className="font-semibold text-text-primary text-lg mb-2">{title}</h3>
                <p className="text-text-secondary text-sm mb-6 max-w-sm">
                    {message}
                </p>
                {onRetry && (
                    <Button variant="outline" size="sm" onClick={onRetry} className="border-danger/30 text-danger hover:bg-danger/10">
                        Try again
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
