"use client";

import React from 'react';
import { InfoTooltip } from '../ui/InfoTooltip';
import { NickCharacter } from './NickCharacter';

export interface NickButtonProps {
    systemState: 'dead' | 'idle' | 'alive' | 'degraded' | 'error';
    hasNotification?: boolean;
    onClick: () => void;
    isOpen: boolean;
}

export function NickButton({ systemState, hasNotification = false, onClick, isOpen }: NickButtonProps) {

    if (systemState === 'dead') {
        return (
            <InfoTooltip title="NICK Offline" description="Set up CIVION to activate NICK" position="left">
                <button
                    className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-bg-muted border border-border flex items-center justify-center opacity-70 cursor-not-allowed z-40 transition-all"
                />
            </InfoTooltip>
        );
    }

    const isAlive = systemState === 'alive';
    const ringClass = isAlive ? 'border-accent' : 'border-accent-blue/50';
    const pulseClass = (hasNotification && !isOpen) ? 'animate-pulse ring-4 ring-accent/20' : '';

    // Use a smaller simpler SVG representation for the button itself
    return (
        <InfoTooltip title="NICK" description={isAlive ? "Intelligence assistant online" : "NICK is ready"} position="left">
            <button
                onClick={onClick}
                className={`fixed bottom-6 right-6 w-14 h-14 rounded-full bg-bg-card border-2 ${ringClass} ${pulseClass} shadow-[0_4px_16px_rgba(0,0,0,0.1)] flex items-center justify-center z-40 hover:scale-105 active:scale-95 transition-all overflow-hidden`}
            >
                <div className={`transition-transform duration-300 ${isOpen ? 'translate-y-12' : 'translate-y-2'}`}>
                    <NickCharacter size="sm" state={isAlive ? 'idle' : 'idle'} />
                </div>

                <div className={`absolute inset-0 flex items-center justify-center transition-transform duration-300 ${isOpen ? 'translate-y-0 opacity-100' : '-translate-y-12 opacity-0'}`}>
                    <svg className="w-6 h-6 text-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>

                {hasNotification && !isOpen && (
                    <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-accent border-2 border-bg-card rounded-full" />
                )}
            </button>
        </InfoTooltip>
    );
}
