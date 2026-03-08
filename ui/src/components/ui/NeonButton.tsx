import React from 'react';
import { motion } from 'framer-motion';
import { classNames } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'danger' | 'info';
    loading?: boolean;
}

export const CleanButton: React.FC<NeonButtonProps> = ({
    children,
    variant = 'primary',
    loading = false,
    disabled,
    className,
    ...props
}) => {

    const getVariantClass = () => {
        switch (variant) {
            case 'danger':
                return 'bg-danger-soft text-danger border border-danger/30 hover:border-danger';
            case 'info':
                return 'bg-accent-blue-soft text-accent-blue border border-accent-blue/30';
            case 'primary':
            default:
                return 'bg-accent text-white hover:bg-accent-hover';
        }
    };

    const isDisabled = disabled || loading;

    return (
        <motion.button
            whileHover={!isDisabled ? { scale: 1.02 } : {}}
            whileTap={!isDisabled ? { scale: 0.98 } : {}}
            disabled={isDisabled}
            className={classNames(
                "relative font-sans text-sm tracking-wider uppercase px-4 py-2 rounded-lg transition-all duration-300 flex items-center justify-center",
                isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
                getVariantClass(),
                className
            )}
            {...(props as any)}
        >
            <div className="relative z-10 flex items-center">
                {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {children}
            </div>
        </motion.button>
    );
};

// Kept for backward compatibility
export const NeonButton = CleanButton;
