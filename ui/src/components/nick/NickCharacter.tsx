import React from 'react';
import { motion } from 'framer-motion';

export type NickState = 'idle' | 'talking' | 'thinking' | 'happy' | 'sleeping';
export type NickSize = 'sm' | 'md' | 'lg';

export interface NickCharacterProps {
    state?: NickState;
    size?: NickSize;
    className?: string;
}

export function NickCharacter({ state = 'idle', size = 'md', className = '' }: NickCharacterProps) {
    // Size mapping
    const scaleMap = {
        sm: 0.6,
        md: 1.0,
        lg: 1.5
    };
    const scale = scaleMap[size];

    // Animation variants
    const variants = {
        idle: {
            y: [0, -8, 0],
            transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
        },
        talking: {
            y: [0, -4, 0],
            rotate: [-5, 5, -5],
            transition: { duration: 0.8, repeat: Infinity, repeatType: 'reverse' as const }
        },
        thinking: {
            rotate: 5,
            y: -5,
            transition: { duration: 0.5, ease: 'easeOut' }
        },
        happy: {
            scale: [1, 1.1, 1],
            y: [0, -15, 0],
            transition: { duration: 0.6, type: 'spring', bounce: 0.6 }
        },
        sleeping: {
            y: 5,
            transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
        }
    };

    const eyesMap = {
        idle: { cx1: 35, cx2: 65, cy: 45, r: 6, opacity: 1 },
        talking: { cx1: 35, cx2: 65, cy: 45, r: 6, opacity: 1 },
        thinking: { cx1: 45, cx2: 75, cy: 35, r: 6, opacity: 1 },
        happy: { cx1: 35, cx2: 65, cy: 40, r: 6, opacity: 1 },
        sleeping: { cx1: 35, cx2: 65, cy: 50, r: 0, opacity: 0 } // handled by rect below
    };

    const eyes = eyesMap[state];

    return (
        <motion.div
            className={`relative inline-flex items-center justify-center select-none ${className}`}
            style={{ width: 100 * scale, height: 140 * scale }}
            variants={variants}
            animate={state}
            initial="idle"
        >
            <svg
                width="100%"
                height="100%"
                viewBox="0 0 100 140"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-sm"
            >
                {/* Antenna line */}
                <path d="M50 40 L50 20" stroke="var(--border-strong)" strokeWidth="2" strokeLinecap="round" />

                {/* Antenna bulb */}
                <motion.circle
                    cx="50"
                    cy="20"
                    r="4"
                    fill="var(--accent)"
                    animate={{
                        opacity: state === 'talking' ? [0.6, 1, 0.6] : 1,
                        scale: state === 'happy' ? [1, 1.3, 1] : 1
                    }}
                    transition={{ duration: 0.5, repeat: state === 'talking' ? Infinity : 0 }}
                />

                {/* Head */}
                <ellipse
                    cx="50" cy="50" rx="36" ry="32"
                    fill="var(--bg-card)"
                    stroke="var(--border-strong)"
                    strokeWidth="1.5"
                />

                {/* Eyes */}
                <g fill="var(--text-primary)">
                    {state === 'sleeping' ? (
                        <>
                            <path d="M30 48 Q35 52 40 48" stroke="var(--text-primary)" strokeWidth="2" fill="none" strokeLinecap="round" />
                            <path d="M60 48 Q65 52 70 48" stroke="var(--text-primary)" strokeWidth="2" fill="none" strokeLinecap="round" />
                        </>
                    ) : state === 'happy' ? (
                        <>
                            <path d="M30 42 Q35 38 40 42" stroke="var(--text-primary)" strokeWidth="2" fill="none" strokeLinecap="round" />
                            <path d="M60 42 Q65 38 70 42" stroke="var(--text-primary)" strokeWidth="2" fill="none" strokeLinecap="round" />
                        </>
                    ) : (
                        <>
                            <motion.circle cx={eyes.cx1} cy={eyes.cy} r={eyes.r} />
                            <motion.circle cx={eyes.cx2} cy={eyes.cy} r={eyes.r} />
                        </>
                    )}
                </g>

                {/* Body */}
                <rect
                    x="25" y="80" width="50" height="46" rx="16"
                    fill="var(--bg-card)"
                    stroke="var(--border-strong)"
                    strokeWidth="1.5"
                />

                {/* Civion simple logo on chest */}
                <g transform="translate(42, 95) scale(0.6)">
                    <circle cx="10" cy="18" r="6" fill="var(--accent)" fillOpacity="0.8" />
                    <circle cx="18" cy="8" r="6" fill="var(--accent)" fillOpacity="0.8" />
                    <circle cx="26" cy="18" r="6" fill="var(--accent)" fillOpacity="0.8" />
                </g>

                {/* Arms */}
                <motion.rect
                    x="14" y="86" width="10" height="24" rx="4"
                    fill="var(--bg-card)"
                    stroke="var(--border-strong)"
                    strokeWidth="1.5"
                    animate={{
                        rotate: state === 'talking' ? [0, 15, 0] : 0,
                        y: state === 'happy' ? -10 : 0
                    }}
                    transition={{ duration: 0.5, repeat: state === 'talking' ? Infinity : 0 }}
                    style={{ originX: 0.5, originY: 0 }}
                />
                <motion.rect
                    x="76" y="86" width="10" height="24" rx="4"
                    fill="var(--bg-card)"
                    stroke="var(--border-strong)"
                    strokeWidth="1.5"
                    animate={{
                        rotate: state === 'talking' ? [0, -15, 0] : 0,
                        y: state === 'happy' ? -10 : 0
                    }}
                    transition={{ duration: 0.5, repeat: state === 'talking' ? Infinity : 0 }}
                    style={{ originX: 0.5, originY: 0 }}
                />
            </svg>
        </motion.div>
    );
}
