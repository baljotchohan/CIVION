import React from 'react';

export type BadgeColor = 'green' | 'blue' | 'purple' | 'amber' | 'red' | 'grey';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    color?: BadgeColor;
    size?: BadgeSize;
    dot?: boolean;
}

export function Badge({
    className = '',
    color = 'grey',
    size = 'sm',
    dot = false,
    children,
    ...props
}: BadgeProps) {
    const baseStyles = 'inline-flex items-center font-medium rounded-full';

    const colors = {
        green: 'bg-success/10 text-success border border-success/20',
        blue: 'bg-accent-blue/10 text-accent-blue border border-accent-blue/20',
        purple: 'bg-accent-purple/10 text-accent-purple border border-accent-purple/20',
        amber: 'bg-accent-amber/10 text-accent-amber border border-accent-amber/20',
        red: 'bg-danger/10 text-danger border border-danger/20',
        grey: 'bg-text-muted/10 text-text-secondary border border-text-muted/20',
    };

    const dotColors = {
        green: 'bg-success',
        blue: 'bg-accent-blue',
        purple: 'bg-accent-purple',
        amber: 'bg-accent-amber',
        red: 'bg-danger',
        grey: 'bg-text-muted',
    };

    const sizes = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-3 py-1',
    };

    return (
        <span
            className={`${baseStyles} ${colors[color]} ${sizes[size]} ${className}`}
            {...props}
        >
            {dot && (
                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotColors[color]}`} />
            )}
            {children}
        </span>
    );
}
