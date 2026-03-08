import React from 'react';
import { Card, CardContent } from './Card';

interface SkeletonCardProps {
    className?: string;
    lines?: number;
    hasHeader?: boolean;
}

export function SkeletonCard({ className = '', lines = 3, hasHeader = true }: SkeletonCardProps) {
    return (
        <Card className={`animate-pulse ${className}`}>
            <CardContent className="p-5">
                {hasHeader && (
                    <div className="flex items-center gap-4 mb-5">
                        <div className="w-12 h-12 rounded-xl bg-border/50"></div>
                        <div className="space-y-2 flex-1">
                            <div className="h-4 bg-border/50 rounded w-1/3"></div>
                            <div className="h-3 bg-border/50 rounded w-1/4"></div>
                        </div>
                    </div>
                )}

                <div className="space-y-3">
                    {Array.from({ length: lines }).map((_, i) => (
                        <div
                            key={i}
                            className="h-3 bg-border/40 rounded"
                            style={{ width: `${Math.random() * 40 + 60}%` }}
                        ></div>
                    ))}
                </div>

                <div className="mt-5 pt-4 border-t border-border flex justify-between">
                    <div className="h-4 bg-border/50 rounded w-1/5"></div>
                    <div className="h-8 bg-border/50 rounded w-20"></div>
                </div>
            </CardContent>
        </Card>
    );
}
