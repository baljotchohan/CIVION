import React from 'react';
import { motion } from 'framer-motion';
import { classNames } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'danger' | 'info';
    loading?: boolean;
}

export const NeonButton: React.FC<NeonButtonProps> = ({
    children,
    variant = 'primary',
    loading = false,
    disabled,
    className,
    ...props
}) => {

    const colors = {
        primary: { hex: '#00ff88', rgb: '0, 255, 136' },
        danger: { hex: '#ff006e', rgb: '255, 0, 110' },
        info: { hex: '#00d4ff', rgb: '0, 212, 255' },
    };

    const color = colors[variant];
    const isDisabled = disabled || loading;

    return (
        <motion.button
            whileHover={!isDisabled ? { scale: 1.02 } : {}}
            whileTap={!isDisabled ? { scale: 0.98 } : {}}
            disabled={isDisabled}
            className={classNames(
                "relative font-sans text-sm tracking-wider uppercase px-4 py-2 rounded-lg transition-all duration-300 flex items-center justify-center",
                isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer group hover:shadow-lg",
                className
            )}
            style={{
                backgroundColor: `rgba(${color.rgb}, 0.1)`,
                border: `1px solid ${color.hex}`,
                color: color.hex,
                boxShadow: !isDisabled ? `0 0 10px rgba(${color.rgb}, 0.1)` : 'none',
            }}
            {...(props as any)}
        >
            {/* Hover Glow Effect */}
            {!isDisabled && (
                <div
                    className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md pointer-events-none"
                    style={{ backgroundColor: `rgba(${color.rgb}, 0.2)` }}
                />
            )}

            <div className="relative z-10 flex items-center">
                {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {children}
            </div>
        </motion.button>
    );
};
