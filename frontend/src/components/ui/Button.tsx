import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
}

export function Button({
    className = '',
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled,
    children,
    ...props
}: ButtonProps) {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-accent text-white hover:brightness-95 active:scale-98 disabled:hover:brightness-100',
        secondary: 'bg-transparent border border-border text-text-primary hover:bg-bg-subtle',
        ghost: 'bg-transparent text-text-primary hover:bg-bg-muted border border-transparent',
        danger: 'bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20',
        outline: 'bg-transparent border border-border text-text-primary hover:border-text-primary',
    };

    const sizes = {
        sm: 'text-xs px-3 py-1.5 rounded-md',
        md: 'text-sm px-4 py-2 rounded-lg',
        lg: 'text-base px-6 py-3 rounded-xl',
    };

    const currentVariantStyle = variants[variant] || variants.primary;
    const currentSizeStyle = sizes[size] || sizes.md;

    return (
        <button
            className={`${baseStyles} ${currentVariantStyle} ${currentSizeStyle} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-inherit opacity-70" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )}
            {children}
        </button>
    );
}
