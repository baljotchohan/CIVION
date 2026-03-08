"use client";

import React, { useState, useRef, useEffect } from 'react';

export interface InfoTooltipProps {
    title: string;
    description: string;
    learnMore?: string;
    children: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
    className?: string;
}

export function InfoTooltip({
    title,
    description,
    learnMore,
    children,
    position = 'top',
    className = ''
}: InfoTooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout>();

    const show = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsVisible(true);
    };

    const hide = () => {
        timeoutRef.current = setTimeout(() => {
            setIsVisible(false);
        }, 150);
    };

    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };

    return (
        <div
            className={`relative inline-flex items-center ${className}`}
            onMouseEnter={show}
            onMouseLeave={hide}
            onClick={() => setIsVisible(!isVisible)}
        >
            {children}

            {isVisible && (
                <div
                    className={`absolute z-50 w-64 p-3 bg-bg-card border border-border rounded-lg shadow-lg ${positionClasses[position]}`}
                    onMouseEnter={show}
                    onMouseLeave={hide}
                >
                    <div className="text-sm font-semibold text-text-primary mb-1">{title}</div>
                    <div className="text-sm text-text-secondary leading-relaxed">{description}</div>

                    {learnMore && (
                        <a
                            href={learnMore}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-2 text-xs font-medium text-accent hover:text-accent-blue transition-colors"
                        >
                            Learn more →
                        </a>
                    )}
                </div>
            )}
        </div>
    );
}
