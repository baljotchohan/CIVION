import React from 'react';

export type NickState = 'idle' | 'talking' | 'thinking' | 'happy' | 'sleeping';
export type NickSize = 'sm' | 'md' | 'lg';

export interface NickCharacterProps {
    state?: NickState;
    size?: NickSize;
    className?: string;
}

export function NickCharacter({ size = 'md', className = '' }: NickCharacterProps) {
    // Size mapping
    const scaleMap = {
        sm: 0.6,
        md: 1.0,
        lg: 1.5
    };
    const scale = scaleMap[size];

    return (
        <div 
            className={`relative inline-flex items-center justify-center select-none ${className}`}
            style={{ width: 100 * scale, height: 140 * scale }}
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
                <circle
                    cx="50"
                    cy="20"
                    r="4"
                    fill="var(--accent)"
                />

                {/* Head */}
                <ellipse
                    cx="50" cy="50" rx="36" ry="32"
                    fill="var(--bg-card)"
                    stroke="var(--border-strong)"
                    strokeWidth="1.5"
                />

                {/* Eyes - always idle/simple */}
                <g fill="var(--text-primary)">
                    <circle cx="35" cy="45" r="6" />
                    <circle cx="65" cy="45" r="6" />
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

                {/* Arms - static */}
                <rect
                    x="14" y="86" width="10" height="24" rx="4"
                    fill="var(--bg-card)"
                    stroke="var(--border-strong)"
                    strokeWidth="1.5"
                />
                <rect
                    x="76" y="86" width="10" height="24" rx="4"
                    fill="var(--bg-card)"
                    stroke="var(--border-strong)"
                    strokeWidth="1.5"
                />
            </svg>
        </div>
    );
}
