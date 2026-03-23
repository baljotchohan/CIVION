import React from 'react';

type CardVariant = 'default' | 'elevated' | 'bordered' | 'ghost';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: CardVariant;
    hoverable?: boolean;
}

export function Card({
    className = '',
    variant = 'default',
    hoverable = false,
    children,
    ...props
}: CardProps) {
    const baseStyles = 'rounded-xl bg-bg-card transition-all duration-200';

    const variants = {
        default: 'border border-border shadow-sm',
        elevated: 'border border-border shadow-md',
        bordered: 'border-2 border-border',
        ghost: 'bg-transparent',
    };

    const hoverStyles = hoverable ? 'hover:shadow-md hover:border-border-strong cursor-pointer' : '';
    const currentVariantStyle = variants[variant] || variants.default;

    return (
        <div
            className={`${baseStyles} ${currentVariantStyle} ${hoverStyles} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({ children, className = '' }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={`px-5 py-4 border-b border-border font-semibold text-text-primary ${className}`}>
            {children}
        </div>
    );
}

export function CardContent({ children, className = '' }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={`px-5 py-4 ${className}`}>
            {children}
        </div>
    );
}

export function CardFooter({ children, className = '' }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={`px-5 py-3 border-t border-border bg-bg-subtle/50 rounded-b-xl ${className}`}>
            {children}
        </div>
    );
}
